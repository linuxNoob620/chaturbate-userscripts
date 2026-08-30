'use strict';

const ziggyApi = typeof browser !== 'undefined' ? browser : chrome;
const ziggyRequests = new Map();

async function ziggyFetch(requestId, request) {
  const controller = new AbortController();
  ziggyRequests.set(requestId, controller);
  const timeoutMs = Math.max(0, Number(request?.timeout) || 0);
  let timedOut = false;
  const timer = timeoutMs ? setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs) : 0;

  try {
    const credentials = request?.anonymous
      ? 'omit'
      : (['omit', 'same-origin', 'include'].includes(request?.credentials) ? request.credentials : 'include');
    const init = {
      method: String(request?.method || 'GET').toUpperCase(),
      headers: request?.headers && typeof request.headers === 'object' ? request.headers : {},
      credentials,
      signal: controller.signal,
    };
    if (request?.data != null && !['GET', 'HEAD'].includes(init.method)) init.body = String(request.data);
    if (/^https?:\/\//i.test(String(request?.referrer || ''))) {
      init.referrer = String(request.referrer);
      init.referrerPolicy = 'unsafe-url';
    }
    const response = await fetch(String(request?.url || ''), init);
    const responseText = await response.text();
    return {
      kind: 'load',
      status: response.status,
      statusText: response.statusText,
      responseText,
      responseHeaders: [...response.headers.entries()].map(([name, value]) => `${name}: ${value}`).join('\r\n'),
      finalUrl: response.url || String(request?.url || ''),
    };
  } catch (error) {
    if (controller.signal.aborted) return { kind: timedOut ? 'timeout' : 'abort' };
    return { kind: 'error', error: String(error?.message || error) };
  } finally {
    if (timer) clearTimeout(timer);
    ziggyRequests.delete(requestId);
  }
}

async function ziggyOpenTab(message, sender) {
  const createProperties = {
    url: String(message.url || 'about:blank'),
    active: message.active !== false,
  };
  if (message.insert && Number.isInteger(sender?.tab?.index)) createProperties.index = sender.tab.index + 1;
  if (message.setParent && Number.isInteger(sender?.tab?.id)) createProperties.openerTabId = sender.tab.id;
  try {
    const tab = await ziggyApi.tabs.create(createProperties);
    return { tabId: Number.isInteger(tab?.id) ? tab.id : null };
  } catch (error) {
    delete createProperties.openerTabId;
    const tab = await ziggyApi.tabs.create(createProperties);
    return { tabId: Number.isInteger(tab?.id) ? tab.id : null, warning: String(error?.message || error) };
  }
}

ziggyApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;
  if (message.type === 'ziggy-gm-xhr') {
    ziggyFetch(String(message.requestId || ''), message.request).then(sendResponse);
    return true;
  }
  if (message.type === 'ziggy-gm-xhr-abort') {
    ziggyRequests.get(String(message.requestId || ''))?.abort();
    sendResponse({ ok: true });
    return false;
  }
  if (message.type === 'ziggy-open-tab') {
    ziggyOpenTab(message, sender).then(sendResponse, error => sendResponse({ error: String(error?.message || error) }));
    return true;
  }
  if (message.type === 'ziggy-close-tab') {
    const tabId = Number(message.tabId);
    if (Number.isInteger(tabId)) Promise.resolve(ziggyApi.tabs.remove(tabId)).catch(() => {});
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
