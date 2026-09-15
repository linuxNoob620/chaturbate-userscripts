import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../standalone/recu-responsive/transport.js', import.meta.url), 'utf8');
const MEDIA = 'https://media.example.invalid/video/item/master.m3u8';
const SEGMENT = 'https://media.example.invalid/video/item/0.ts';
let checks = 0;
async function check(label, run) { await run(); checks++; console.log(`PASS ${label}`); }

function harness(options = {}) {
  const loaders = [], registrations = [], delegated = [], schemes = new Map();
  class NativeLoader {
    constructor(config) {
      if (options.throwConstructor) throw new Error('Native constructor failed');
      this.config = config; this.aborts = 0; this.destroys = 0; loaders.push(this);
    }
    load(context, config, callbacks) {
      Object.assign(this, { context, loadConfig: config, callbacks });
      if (options.throwLoad) throw new Error('Native load failed');
      if (options.syncSuccess) this.succeed();
    }
    succeed(data = new Uint8Array([1, 2, 3]).buffer, extras = {}) {
      this.callbacks.onSuccess({ data, url: `${SEGMENT}?native-check=fixture`, ...extras },
        { loading: { start: 11, end: 111 } }, this.context,
        { getAllResponseHeaders: () => 'Content-Type: video/mp2t\r\nX-TEST: first\r\nX-test: second\r\nBad line\r\nDate: a:b\r\n' });
    }
    abort() {
      this.aborts++;
      this.callbacks?.onAbort?.();
      if (options.throwAbort) throw new Error('Native abort failed');
    }
    destroy() {
      this.destroys++;
      if (options.destroyCallback) this.callbacks?.onTimeout();
      if (options.throwDestroy) throw new Error('Native destroy failed');
    }
  }
  class ShakaError extends Error {
    static Severity = { RECOVERABLE: 1 };
    static Category = { NETWORK: 1 };
    static Code = { OPERATION_ABORTED: 7001, HTTP_ERROR: 1002, BAD_HTTP_STATUS: 1001, TIMEOUT: 1003 };
    constructor(severity, category, code, ...data) {
      super(`Shaka ${code}`); Object.assign(this, { severity, category, code, data });
    }
  }
  class AbortableOperation {
    constructor(promise, abort) { this.promise = promise; this.abort = abort; }
  }
  const NetworkingEngine = {
    PluginPriority: { PREFERRED: 2, APPLICATION: 3 }, RequestType: { MANIFEST: 0, SEGMENT: 1, LICENSE: 2 },
    registerScheme(scheme, plugin, priority, progress) {
      registrations.push({ action: 'register', scheme, plugin, priority, progress });
      if (!schemes.has(scheme) || schemes.get(scheme).priority <= priority) schemes.set(scheme, { plugin, priority, progress });
    },
    unregisterScheme(scheme) { registrations.push({ action: 'unregister', scheme }); schemes.delete(scheme); },
  };
  const HttpFetchPlugin = { parse(...args) {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    promise.catch(() => {});
    const call = { args, receiver: this, resolve, reject, aborts: 0 };
    call.operation = new AbortableOperation(promise, () => {
      call.aborts++; reject(new Error('Delegated abort')); return Promise.resolve();
    });
    delegated.push(call); return call.operation;
  } };
  const shaka = { net: { NetworkingEngine, HttpFetchPlugin }, util: { Error: ShakaError, AbortableOperation } };
  const setup = () => {};
  const Hls = { DefaultConfig: { loader: NativeLoader, xhrSetup: setup, marker: 7 } };
  const sandbox = vm.createContext({ URL, ArrayBuffer, Promise });
  vm.runInContext(`${source}\nglobalThis.Subject = RRPSegmentTransport;`, sandbox);
  const create = (extra = {}) => new sandbox.Subject({ shaka, Hls, sourceUrl: MEDIA, ...extra });
  const subject = create().install();
  const request = (extra = {}) => ({ method: 'GET', body: null, headers: {}, ...extra });
  const send = (uri = SEGMENT, req = request(), type = 1, progress = () => {}, headers = () => {}, config = { minBytesForProgressEvents: 16384 }) =>
    subject.plugin(uri, req, type, progress, headers, config);
  return { loaders, delegated, schemes, registrations, shaka, Hls, setup, subject, create, request, send, ShakaError };
}

function isError(h, name) {
  return error => error instanceof h.ShakaError && error.code === h.ShakaError.Code[name] &&
    error.category === 1 && error.severity === 1 && !JSON.stringify(error.data).includes('http');
}

await check('only matching TS segment GETs use the native loader; delegation preserves six arguments and receiver', async () => {
  const h = harness();
  const cases = [
    [MEDIA, h.request(), 0], [SEGMENT, h.request(), 0],
    ['https://other.example.invalid/video/item/0.ts', h.request(), 1],
    ['https://media.example.invalid/video/item-other/0.ts', h.request(), 1],
    ['https://media.example.invalid/video/item/../other/0.ts', h.request(), 1],
    [SEGMENT.replace('.ts', '.m4s'), h.request(), 1],
    [SEGMENT, h.request({ method: 'HEAD' }), 1], [SEGMENT, h.request({ method: 'POST' }), 1],
    [SEGMENT, h.request({ body: new Uint8Array([3]) }), 1],
    [SEGMENT.replace('https://', 'https://user:password@'), h.request(), 1],
    ['not a URL', h.request(), 1],
  ];
  for (const [uri, request, type] of cases) {
    const progress = () => {}, headers = () => {}, config = { minBytesForProgressEvents: 17 };
    const operation = h.send(uri, request, type, progress, headers, config);
    const call = h.delegated.at(-1);
    assert.equal(operation, call.operation); assert.equal(call.receiver, h.shaka.net.HttpFetchPlugin);
    assert.deepEqual(call.args, [uri, request, type, progress, headers, config]);
    assert.equal(call.args.length, 6); call.resolve({ data: new ArrayBuffer(0) }); await operation.promise;
  }
  assert.equal(h.loaders.length, 0); assert.equal(h.subject.active.size, 0);
  for (const uri of [SEGMENT, SEGMENT.replace('0.ts', 'sub/1.TS?opaque=fixture'), SEGMENT.replace('https:', 'http:')]) {
    const operation = h.send(uri); assert.equal(h.loaders.at(-1).context.url, uri);
    h.loaders.at(-1).succeed(); await operation.promise;
  }
  await h.subject.dispose();
});

await check('captures native loader/default callbacks and supplies fresh loader/config with bounded no-retry policy', async () => {
  const h = harness();
  h.Hls.DefaultConfig = { loader() { throw new Error('Must use captured loader'); }, marker: 999 };
  const first = h.send(), second = h.send();
  assert.equal(h.loaders.length, 2); assert.notEqual(h.loaders[0], h.loaders[1]);
  assert.notEqual(h.loaders[0].config, h.loaders[1].config);
  for (const loader of h.loaders) {
    assert.equal(loader.config.xhrSetup, h.setup); assert.equal(loader.config.marker, 7);
    assert.equal(loader.context.responseType, 'arraybuffer');
    assert.deepEqual(JSON.parse(JSON.stringify(loader.loadConfig)), {
      timeout: 20000, maxRetry: 0, retryDelay: 0, maxRetryDelay: 0,
      loadPolicy: { maxTimeToFirstByteMs: 10000, maxLoadTimeMs: 20000, timeoutRetry: null, errorRetry: null },
    });
    assert.equal(loader.callbacks.onProgress, undefined); loader.succeed();
  }
  await Promise.all([first.promise, second.promise]); await h.subject.dispose();
});

await check('captures the original Fetch implementation even if its exported property changes later', async () => {
  const h = harness(), original = h.shaka.net.HttpFetchPlugin.parse;
  h.shaka.net.HttpFetchPlugin.parse = () => { throw new Error('Must delegate the captured implementation'); };
  const operation = h.send(MEDIA, h.request(), 0);
  h.delegated[0].resolve({}); await operation.promise;
  await h.subject.dispose();
  assert.equal(h.schemes.get('https').plugin, original);
});

await check('closed and open byte ranges preserve exact semantics without duplicate Range headers', async () => {
  const h = harness();
  for (const [header, value, start, end, keep] of [
    ['Range', 'bytes=0-0', 0, 1, false], ['rAnGe', 'bytes=4-15', 4, 16, false],
    ['range', 'bytes=16-', 16, undefined, true],
  ]) {
    const headers = { [header]: value, 'X-Request': 'fixture' }, request = h.request({ headers });
    const operation = h.send(SEGMENT, request), loader = h.loaders.at(-1);
    assert.equal(loader.context.rangeStart, start); assert.equal(loader.context.rangeEnd, end);
    assert.equal(loader.context.headers[header], keep ? value : undefined);
    assert.equal(loader.context.headers['X-Request'], 'fixture'); assert.equal(headers[header], value);
    assert.notEqual(loader.context.headers, headers); loader.succeed(); await operation.promise;
  }
  for (const value of ['bytes=-10', 'bytes=0-3,8-11', 'bytes=7-6', 'bytes=0-9007199254740991', 'items=0-1', 'bytes=no']) {
    const request = h.request({ headers: { Range: value } }); const operation = h.send(SEGMENT, request);
    assert.equal(h.delegated.at(-1).args[1], request); h.delegated.at(-1).resolve({}); await operation.promise;
  }
  const operation = h.send(SEGMENT, h.request({ headers: { Range: 'bytes=0-1', range: 'bytes=2-3' } }));
  h.delegated.at(-1).resolve({}); await operation.promise; await h.subject.dispose();
});

await check('returns actual lowercase headers, final URI, ArrayBuffer and measured timing, with single delivery', async () => {
  const h = harness(), events = [], body = new Uint8Array([4, 5, 6]).buffer;
  const operation = h.send(SEGMENT, h.request({ streamDataCallback() { throw new Error('No chunk delivery'); } }), 1,
    (...args) => events.push(['progress', ...args]), headers => events.push(['headers', { ...headers }]));
  const loader = h.loaders[0]; loader.succeed(body);
  const response = await operation.promise;
  assert.equal(response.data, body); assert.equal(response.uri, `${SEGMENT}?native-check=fixture`);
  assert.equal(response.originalUri, SEGMENT); assert.equal(response.timeMs, 100); assert.equal(response.fromCache, false);
  assert.deepEqual({ ...response.headers }, { 'content-type': 'video/mp2t', 'x-test': 'first, second', date: 'a:b' });
  assert.deepEqual(events, [['headers', { ...response.headers }], ['progress', 100, 3, 0]]);
  loader.succeed(); loader.callbacks.onError({ code: 500 }); loader.callbacks.onTimeout();
  assert.equal(events.length, 2); assert.equal(loader.destroys, 1); assert.equal(h.subject.active.size, 0);
  await operation.abort(); assert.equal(loader.aborts, 0); await h.subject.dispose();
});

await check('typed-array views return only their byte window; cross-realm ArrayBuffers work', async () => {
  const h = harness();
  for (const body of [new Uint8Array([9, 4, 5, 6, 9]).subarray(1, 4), vm.runInNewContext('new Uint8Array([4,5,6]).buffer')]) {
    const operation = h.send(); h.loaders.at(-1).succeed(body, { url: '' });
    const response = await operation.promise;
    assert.deepEqual([...new Uint8Array(response.data)], [4, 5, 6]); assert.equal(response.uri, SEGMENT);
  }
  await h.subject.dispose();
});

await check('success accepts missing headers/timing without fabricating network metadata', async () => {
  const h = harness(), operation = h.send(), loader = h.loaders[0];
  loader.callbacks.onSuccess({ data: new ArrayBuffer(0) }, {}, loader.context, null);
  const response = await operation.promise;
  assert.equal(response.timeMs, 0); assert.deepEqual({ ...response.headers }, {}); assert.equal(response.uri, SEGMENT);
  await h.subject.dispose();
});

await check('HTTP status, transport error, timeout and native abort reject with Shaka network errors', async () => {
  for (const [mode, code] of [['status', 'BAD_HTTP_STATUS'], ['error', 'HTTP_ERROR'], ['timeout', 'TIMEOUT'], ['abort', 'OPERATION_ABORTED']]) {
    const h = harness(), operation = h.send(), loader = h.loaders[0];
    const rejection = assert.rejects(operation.promise, isError(h, code));
    if (mode === 'status') loader.callbacks.onError({ code: 422, text: SEGMENT }, loader.context, { status: 422 });
    if (mode === 'error') loader.callbacks.onError({ code: 0, text: SEGMENT });
    if (mode === 'timeout') loader.callbacks.onTimeout();
    if (mode === 'abort') loader.callbacks.onAbort();
    await rejection; assert.equal(loader.destroys, 1); assert.equal(h.subject.active.size, 0);
    await h.subject.dispose();
  }
});

await check('constructor/load/data/callback failures reject and release rather than hang or leak', async () => {
  for (const mode of ['constructor', 'load', 'data', 'headers', 'progress']) {
    const h = harness({ throwConstructor: mode === 'constructor', throwLoad: mode === 'load' });
    const throws = () => { throw new Error('Callback failed'); };
    const operation = h.send(SEGMENT, h.request(), 1, mode === 'progress' ? throws : undefined, mode === 'headers' ? throws : undefined);
    const rejection = assert.rejects(operation.promise, isError(h, 'HTTP_ERROR'));
    if (!['constructor', 'load'].includes(mode)) h.loaders[0].succeed(mode === 'data' ? 'not binary' : new ArrayBuffer(1));
    await rejection; assert.equal(h.subject.active.size, 0);
    if (h.loaders.length) assert.equal(h.loaders[0].destroys, 1);
    await h.subject.dispose();
  }
});

await check('abort rejects immediately, destroys once, and ignores every late callback', async () => {
  const h = harness({ throwAbort: true, throwDestroy: true, destroyCallback: true });
  let notifications = 0;
  const operation = h.send(SEGMENT, h.request(), 1, () => notifications++, () => notifications++);
  const loader = h.loaders[0], rejection = assert.rejects(operation.promise, isError(h, 'OPERATION_ABORTED'));
  await operation.abort(); await operation.abort(); await rejection;
  loader.succeed(); loader.callbacks.onError({ code: 500 }); loader.callbacks.onTimeout(); loader.callbacks.onAbort();
  assert.equal(loader.aborts, 1); assert.equal(loader.destroys, 1); assert.equal(notifications, 0);
  assert.equal(h.subject.active.size, 0); await h.subject.dispose();
});

await check('synchronous success and reentrant callback disposal are safe', async () => {
  const sync = harness({ syncSuccess: true }); const completed = sync.send();
  await completed.promise; assert.equal(sync.loaders[0].destroys, 1); assert.equal(sync.subject.active.size, 0);
  await sync.subject.dispose();
  for (const notification of ['headers', 'progress']) {
    const h = harness(); let progresses = 0;
    const operation = h.send(SEGMENT, h.request(), 1,
      () => { progresses++; if (notification === 'progress') h.subject.dispose(); },
      () => { if (notification === 'headers') h.subject.dispose(); });
    const rejection = assert.rejects(operation.promise, isError(h, 'OPERATION_ABORTED'));
    h.loaders[0].succeed(); await rejection;
    assert.equal(progresses, notification === 'progress' ? 1 : 0); assert.equal(h.loaders[0].destroys, 1);
  }
});

await check('dispose aborts native and delegated requests and stale plugin calls reject without new I/O', async () => {
  const h = harness(), first = h.send(), second = h.send(MEDIA, h.request(), 0);
  const rejections = [assert.rejects(first.promise, isError(h, 'OPERATION_ABORTED')), assert.rejects(second.promise, /Delegated abort/)];
  await h.subject.dispose(); await h.subject.dispose(); await Promise.all(rejections);
  assert.equal(h.loaders[0].aborts, 1); assert.equal(h.loaders[0].destroys, 1); assert.equal(h.delegated[0].aborts, 1);
  assert.equal(h.subject.active.size, 0);
  await assert.rejects(h.send().promise, isError(h, 'OPERATION_ABORTED'));
  await assert.rejects(h.send(MEDIA, h.request(), 0).promise, isError(h, 'OPERATION_ABORTED'));
  assert.equal(h.loaders.length, 1); assert.equal(h.delegated.length, 1);
});

await check('installation is idempotent; duplicate namespace owner is rejected; only its own namespace is restored', async () => {
  const h = harness(), other = harness();
  assert.equal(h.subject.install(), h.subject); assert.equal(h.registrations.length, 2);
  const duplicate = h.create(); assert.throws(() => duplicate.install(), /already has an owner/);
  await duplicate.dispose(); assert.equal(h.registrations.length, 2);
  await h.subject.dispose();
  for (const scheme of ['http', 'https']) {
    const restored = h.schemes.get(scheme);
    assert.equal(restored.plugin, h.shaka.net.HttpFetchPlugin.parse); assert.equal(restored.priority, 2); assert.equal(restored.progress, true);
    assert.equal(other.schemes.get(scheme).plugin, other.subject.plugin);
  }
  assert.equal(h.registrations.length, 6); assert.throws(() => h.subject.install(), /disposed/);
  const replacement = h.create().install(); await h.subject.dispose();
  assert.equal(h.schemes.get('https').plugin, replacement.plugin);
  await replacement.dispose(); await other.subject.dispose();
});

await check('invalid dependencies and unsafe source protocols fail before registration', async () => {
  const h = harness();
  for (const extra of [{ shaka: {} }, { Hls: {} }, { sourceUrl: 'file:///source.m3u8' },
    { sourceUrl: 'https://user:password@media.example.invalid/source.m3u8' }]) assert.throws(() => h.create(extra));
  assert.equal(h.registrations.length, 2); await h.subject.dispose();
});

assert.doesNotMatch(source, /console\.|GM_xmlhttpRequest|fetch\s*\(|XMLHttpRequest\s*\(/);
console.log(`Transport module: ${checks} checks passed.`);
