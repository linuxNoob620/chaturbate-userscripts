// Concatenated inside the player's IIFE; no page globals are published.
// CONTRACT: shaka is this player's private library namespace, never window.shaka.
// Its HTTP scheme registry must not be shared with another player/plugin. Shaka
// has no public registry getter; this class only tracks its own namespace owner.
class RRPSegmentTransport {
  static owners = new WeakMap();

  constructor({ shaka, Hls, sourceUrl }) {
    if (typeof shaka?.net?.HttpFetchPlugin?.parse !== 'function' ||
        typeof shaka?.net?.NetworkingEngine?.registerScheme !== 'function' ||
        typeof Hls?.DefaultConfig?.loader !== 'function') {
      throw new Error('The private player transport dependencies are unavailable.');
    }
    const source = new URL(sourceUrl);
    if (!/^https?:$/.test(source.protocol) || source.username || source.password) {
      throw new Error('The player source must be an HTTP media source.');
    }
    this.shaka = shaka;
    this.engine = shaka.net.NetworkingEngine;
    this.fetchPlugin = shaka.net.HttpFetchPlugin;
    this.fetchParse = this.fetchPlugin.parse;
    // Capture the site's existing loader and setup callbacks, not its auth logic.
    // A fresh config object and loader are created for every segment request.
    this.loaderConfig = { ...Hls.DefaultConfig };
    this.Loader = this.loaderConfig.loader;
    this.sourceHost = source.host;
    this.sourceDirectory = source.pathname.slice(0, source.pathname.lastIndexOf('/') + 1);
    this.active = new Set();
    this.installed = false;
    this.disposed = false;
    this.plugin = (uri, request, type, progressUpdated, headersReceived, config) =>
      this.request(uri, request, type, progressUpdated, headersReceived, config);
  }

  install() {
    if (this.disposed) throw new Error('The player transport has been disposed.');
    if (this.installed) return this;
    if (RRPSegmentTransport.owners.has(this.engine)) {
      throw new Error('The private player transport namespace already has an owner.');
    }
    RRPSegmentTransport.owners.set(this.engine, this);
    this.installed = true;
    try {
      for (const scheme of ['http', 'https']) {
        this.engine.registerScheme(scheme, this.plugin, this.engine.PluginPriority.APPLICATION, true);
      }
    } catch (error) {
      this.restore();
      throw error;
    }
    return this;
  }

  range(headers) {
    const ranges = Object.entries(headers).filter(([name]) => name.toLowerCase() === 'range');
    if (!ranges.length) return {};
    if (ranges.length !== 1) return null;
    const [name, value] = ranges[0];
    const match = /^bytes=(\d+)-(\d*)$/i.exec(String(value).trim());
    if (!match) return null;
    const rangeStart = Number(match[1]);
    const rangeEnd = match[2] ? Number(match[2]) + 1 : undefined;
    if (!Number.isSafeInteger(rangeStart) || (rangeEnd !== undefined &&
        (!Number.isSafeInteger(rangeEnd) || rangeEnd <= rangeStart))) return null;
    // hls.js emits its own closed Range header; keep open-ended ranges because
    // its XHR loader only generates a Range header when rangeEnd is present.
    if (rangeEnd !== undefined) delete headers[name];
    return { rangeStart, rangeEnd };
  }

  matches(uri, request, type) {
    if (type !== this.engine.RequestType.SEGMENT ||
        (request.method && request.method.toUpperCase() !== 'GET') || request.body != null) return false;
    try {
      const url = new URL(uri);
      return /^https?:$/.test(url.protocol) && !url.username && !url.password &&
        url.host === this.sourceHost && url.pathname.startsWith(this.sourceDirectory) &&
        /\.ts$/i.test(url.pathname);
    } catch { return false; }
  }

  error(code, type, status = 0) {
    const ErrorType = this.shaka.util.Error;
    // Never attach source URLs, native error text or authentication state to
    // error objects: callers may display or log them outside this adapter.
    const details = code === 'BAD_HTTP_STATUS' ? ['', status, '', {}, type, ''] :
      code === 'HTTP_ERROR' ? ['', null, type] : ['', type];
    return new ErrorType(ErrorType.Severity.RECOVERABLE, ErrorType.Category.NETWORK,
      ErrorType.Code[code], ...details);
  }

  request(uri, request, type, progressUpdated, headersReceived, config) {
    const Operation = this.shaka.util.AbortableOperation;
    if (this.disposed) {
      const promise = Promise.reject(this.error('OPERATION_ABORTED', type));
      promise.catch(() => {});
      return new Operation(promise, () => Promise.resolve());
    }
    const headers = { ...request.headers };
    const range = this.range(headers);
    if (!this.matches(uri, request, type) || range === null) {
      const operation = this.fetchParse.call(this.fetchPlugin,
        uri, request, type, progressUpdated, headersReceived, config);
      const ticket = { abort: () => operation.abort() };
      this.active.add(ticket);
      operation.promise.then(() => this.active.delete(ticket), () => this.active.delete(ticket));
      return operation;
    }

    const ticket = { done: false, loader: null, abort: null };
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    // Disposal can precede the engine attaching its rejection handler.
    promise.catch(() => {});
    const finish = (value, failed, abort = false) => {
      if (ticket.done) return;
      ticket.done = true;
      this.active.delete(ticket);
      const loader = ticket.loader;
      ticket.loader = null;
      if (failed) reject(value); else resolve(value);
      if (abort) { try { loader?.abort(); } catch { /* Still destroy below. */ } }
      try { loader?.destroy(); } catch { /* The request is already terminal. */ }
    };
    ticket.abort = () => {
      finish(this.error('OPERATION_ABORTED', type), true, true);
      return Promise.resolve();
    };
    const operation = new Operation(promise, ticket.abort);
    this.active.add(ticket);
    const callbacks = {
      onSuccess: (response, stats, context, networkDetails) => {
        if (ticket.done) return;
        try {
          let data = response.data;
          if (ArrayBuffer.isView(data)) {
            data = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          }
          // Works for real ArrayBuffers from another browser realm as well.
          Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get.call(data);
          const responseHeaders = Object.create(null);
          const raw = networkDetails?.getAllResponseHeaders?.() || '';
          for (const line of raw.split(/\r?\n/)) {
            const colon = line.indexOf(':');
            if (colon <= 0) continue;
            const name = line.slice(0, colon).trim().toLowerCase();
            const value = line.slice(colon + 1).trim();
            if (name) responseHeaders[name] = name in responseHeaders ? `${responseHeaders[name]}, ${value}` : value;
          }
          const duration = stats?.loading?.end - stats?.loading?.start;
          const timeMs = Number.isFinite(duration) && duration >= 0 ? duration : 0;
          // XHR's public loader callbacks expose headers at completion, not at
          // HEADERS_RECEIVED. Report once before delivering the complete body.
          headersReceived?.(responseHeaders);
          if (ticket.done) return;
          progressUpdated?.(timeMs, data.byteLength, 0);
          if (ticket.done) return;
          finish({ uri: response.url || uri, originalUri: uri, data,
            headers: responseHeaders, timeMs, fromCache: false }, false);
        } catch { finish(this.error('HTTP_ERROR', type), true, true); }
      },
      onError: (error, context, networkDetails) => {
        if (ticket.done) return;
        const status = Number(error?.code || networkDetails?.status || 0);
        finish(this.error(status > 0 ? 'BAD_HTTP_STATUS' : 'HTTP_ERROR', type, status), true, true);
      },
      onTimeout: () => finish(this.error('TIMEOUT', type), true, true),
      onAbort: () => finish(this.error('OPERATION_ABORTED', type), true),
      // No onProgress or streamDataCallback: each complete TS body is delivered
      // exactly once, without accidentally appending both chunks and the body.
    };
    try {
      ticket.loader = new this.Loader({ ...this.loaderConfig });
      ticket.loader.load({ url: uri, responseType: 'arraybuffer', headers, ...range }, {
        timeout: 20000, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0,
        loadPolicy: { maxTimeToFirstByteMs: 10000, maxLoadTimeMs: 20000,
          timeoutRetry: null, errorRetry: null },
      }, callbacks);
    } catch { finish(this.error('HTTP_ERROR', type), true, true); }
    return operation;
  }

  restore() {
    if (RRPSegmentTransport.owners.get(this.engine) !== this) return;
    RRPSegmentTransport.owners.delete(this.engine);
    this.installed = false;
    for (const scheme of ['http', 'https']) {
      // Remove APPLICATION priority first, otherwise Shaka rejects the lower
      // PREFERRED default. Only the explicitly private namespace is affected.
      this.engine.unregisterScheme(scheme);
      this.engine.registerScheme(scheme, this.fetchParse, this.engine.PluginPriority.PREFERRED, true);
    }
  }

  dispose() {
    if (this.disposed) return Promise.resolve();
    this.disposed = true;
    const pending = [];
    for (const ticket of [...this.active]) {
      try { pending.push(Promise.resolve(ticket.abort()).catch(() => {})); } catch { /* Continue cleanup. */ }
    }
    this.active.clear();
    this.restore();
    this.loaderConfig = null;
    this.Loader = null;
    this.sourceHost = '';
    this.sourceDirectory = '';
    return Promise.all(pending).then(() => {});
  }
}
