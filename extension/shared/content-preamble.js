;(async function ziggyExtensionBootstrap() {
  'use strict';

  const __ziggyApi = typeof browser !== 'undefined' ? browser : chrome;
  let __ziggyStoredValues = {};
  try {
    __ziggyStoredValues = await __ziggyApi.storage.local.get(null) || {};
  } catch (error) {
    console.error('[Ziggy Suite] Unable to preload extension storage', error);
  }

  const GM_info = Object.freeze({
    script: Object.freeze({
      name: __SCRIPT_NAME__,
      version: __SCRIPT_VERSION__,
    }),
    scriptHandler: 'Ziggy Extension Adapter',
  });

  function GM_getValue(key, defaultValue) {
    return Object.prototype.hasOwnProperty.call(__ziggyStoredValues, key)
      ? __ziggyStoredValues[key]
      : defaultValue;
  }

  function GM_setValue(key, value) {
    __ziggyStoredValues[key] = value;
    Promise.resolve(__ziggyApi.storage.local.set({ [key]: value })).catch(error => {
      console.error(`[Ziggy Suite] Unable to persist ${String(key)}`, error);
    });
  }

  function GM_xmlhttpRequest(details = {}) {
    const requestId = crypto.randomUUID?.() || `ziggy-xhr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let aborted = false;
    const payload = {
      type: 'ziggy-gm-xhr',
      requestId,
      request: {
        method: String(details.method || 'GET').toUpperCase(),
        url: String(details.url || ''),
        headers: details.headers && typeof details.headers === 'object' ? details.headers : {},
        data: details.data == null ? null : String(details.data),
        timeout: Math.max(0, Number(details.timeout) || 0),
        anonymous: details.anonymous === true || details.mozAnon === true,
        credentials: typeof details.credentials === 'string' ? details.credentials : '',
        referrer: typeof details.referrer === 'string' ? details.referrer : '',
      },
    };

    Promise.resolve(__ziggyApi.runtime.sendMessage(payload)).then(result => {
      if (aborted) return;
      if (!result || result.kind === 'error') {
        details.onerror?.({ error: result?.error || 'Extension request failed' });
        return;
      }
      if (result.kind === 'timeout') {
        details.ontimeout?.();
        return;
      }
      if (result.kind === 'abort') {
        details.onabort?.();
        return;
      }
      details.onload?.({
        readyState: 4,
        status: Number(result.status) || 0,
        statusText: String(result.statusText || ''),
        responseText: String(result.responseText || ''),
        response: String(result.responseText || ''),
        responseHeaders: String(result.responseHeaders || ''),
        finalUrl: String(result.finalUrl || details.url || ''),
      });
    }).catch(error => {
      if (!aborted) details.onerror?.({ error: String(error?.message || error) });
    });

    return {
      abort() {
        if (aborted) return;
        aborted = true;
        Promise.resolve(__ziggyApi.runtime.sendMessage({ type: 'ziggy-gm-xhr-abort', requestId })).catch(() => {});
        details.onabort?.();
      },
    };
  }

  function GM_openInTab(url, options = {}) {
    let tabId = null;
    let closeRequested = false;
    const handle = {
      close() {
        closeRequested = true;
        if (tabId != null) {
          Promise.resolve(__ziggyApi.runtime.sendMessage({ type: 'ziggy-close-tab', tabId })).catch(() => {});
        }
      },
      onclose: null,
      closed: false,
    };
    Promise.resolve(__ziggyApi.runtime.sendMessage({
      type: 'ziggy-open-tab',
      url: String(url || 'about:blank'),
      active: options.active !== false,
      insert: options.insert === true,
      setParent: options.setParent === true,
    })).then(result => {
      tabId = Number.isInteger(result?.tabId) ? result.tabId : null;
      if (closeRequested && tabId != null) handle.close();
    }).catch(() => {});
    return handle;
  }

  function GM_download(details, legacyName) {
    const options = typeof details === 'object' && details !== null
      ? details
      : { url: details, name: legacyName };
    let objectUrl = '';
    try {
      const source = options.url;
      objectUrl = source instanceof Blob ? URL.createObjectURL(source) : String(source || '');
      if (!objectUrl) throw new Error('Download URL is empty');
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = String(options.name || 'download');
      anchor.style.display = 'none';
      (document.body || document.documentElement).appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        anchor.remove();
        if (source instanceof Blob) URL.revokeObjectURL(objectUrl);
      }, 60000);
      setTimeout(() => options.onload?.(), 0);
    } catch (error) {
      setTimeout(() => options.onerror?.({ error: String(error?.message || error) }), 0);
    }
    return { abort() {} };
  }

  /* BEGIN VERBATIM USERSCRIPT BODY */
