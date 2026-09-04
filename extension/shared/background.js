'use strict';

const ziggyApi = typeof browser !== 'undefined' ? browser : chrome;
const ziggyRequests = new Map();
const ziggyContextInvocations = new Map();
const ZIGGY_CONTEXT_TTL_MS = 8000;
const ZIGGY_CONTEXT_MENU_IDS = Object.freeze({
  root: 'ziggy-suite-root',
  rooms: 'ziggy-suite-rooms',
  workshop: 'ziggy-suite-workshop',
});
const ZIGGY_CHATURBATE_PATTERNS = Object.freeze([
  'https://chaturbate.com/*',
  'https://*.chaturbate.com/*',
]);
const ZIGGY_CONTEXT_RESERVED_PATHS = new Set([
  'about', 'accounts', 'affiliate', 'affiliates', 'app', 'apps', 'auth', 'b',
  'billing', 'blog', 'broadcast', 'broadcasters', 'contest', 'contests',
  'contact', 'couple-cams', 'directory', 'discover', 'dmca', 'events',
  'external_link', 'feedback', 'female-cams', 'find-friends', 'followed-cams',
  'following', 'gold-shows', 'home', 'in-private-show', 'inbox', 'jobs',
  'language', 'login', 'logout', 'male-cams', 'mobile', 'multicam',
  'my_collection', 'new', 'p', 'photo_videos', 'photos-videos', 'pm',
  'privacy', 'private-shows', 'rooms', 'roomlist', 'rules', 's', 'search',
  'security', 'settings', 'shortcuts', 'signup', 'sitemap', 'social',
  'spy-on-cams', 'static', 'support', 'tag', 'tags', 'terms', 'tipping',
  'token-purchase', 'tokens', 'top', 'trans-cams', 'verify', 'wiki',
  'en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh',
]);

function ziggyStrictContextUsername(raw) {
  const username = String(raw || '').trim().replace(/^@+/, '').toLowerCase();
  if (username.length < 2 || username.length > 32) return '';
  if (!/^[a-z0-9_-]+$/i.test(username) || /^\d+$/.test(username)) return '';
  return ZIGGY_CONTEXT_RESERVED_PATHS.has(username) ? '' : username;
}

function ziggyContextUsernameFromUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const url = new URL(String(rawUrl));
    if (!/^https?:$/.test(url.protocol)) return '';
    const hostname = url.hostname.toLowerCase();
    if (hostname !== 'chaturbate.com' && !hostname.endsWith('.chaturbate.com')) return '';
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.length === 1 ? ziggyStrictContextUsername(decodeURIComponent(segments[0])) : '';
  } catch (_) {
    return '';
  }
}

function ziggyCreateContextMenus() {
  if (!ziggyApi.contextMenus?.create) return;
  let created = false;
  const createMenus = () => {
    if (created) return;
    created = true;
    try {
      ziggyApi.contextMenus.create({
        id: ZIGGY_CONTEXT_MENU_IDS.root,
        title: 'Ziggy Chaturbate Suite',
        contexts: ['all'],
        documentUrlPatterns: [...ZIGGY_CHATURBATE_PATTERNS],
      });
      ziggyApi.contextMenus.create({
        id: ZIGGY_CONTEXT_MENU_IDS.rooms,
        parentId: ZIGGY_CONTEXT_MENU_IDS.root,
        title: 'Rooms',
        contexts: ['all'],
        documentUrlPatterns: [...ZIGGY_CHATURBATE_PATTERNS],
      });
      ziggyApi.contextMenus.create({
        id: ZIGGY_CONTEXT_MENU_IDS.workshop,
        parentId: ZIGGY_CONTEXT_MENU_IDS.root,
        title: 'Open Workshop',
        contexts: ['all'],
        documentUrlPatterns: [...ZIGGY_CHATURBATE_PATTERNS],
      });
    } catch (error) {
      console.error('[Ziggy Suite] Unable to create context menus', error);
    }
  };
  try {
    if (typeof browser === 'undefined') {
      ziggyApi.contextMenus.removeAll(createMenus);
    } else {
      Promise.resolve(ziggyApi.contextMenus.removeAll()).then(createMenus, createMenus);
    }
  } catch (_) {
    createMenus();
  }
}

ziggyApi.runtime.onInstalled?.addListener(ziggyCreateContextMenus);
ziggyApi.runtime.onStartup?.addListener(ziggyCreateContextMenus);

function ziggyRememberContext(message, sender) {
  const tabId = sender?.tab?.id;
  if (!Number.isInteger(tabId)) return;
  const candidateUsername = ziggyStrictContextUsername(message?.candidate?.username);
  const candidateSource = candidateUsername && message?.candidate?.source === 'model-card'
    ? 'model-card'
    : (candidateUsername && message?.candidate?.source === 'direct-link' ? 'direct-link' : 'none');
  ziggyContextInvocations.set(tabId, {
    username: candidateUsername,
    source: candidateSource,
    tabId,
    frameId: Number.isInteger(sender.frameId) ? sender.frameId : 0,
    pageUrl: String(sender?.tab?.url || ''),
    frameUrl: String(message?.frameUrl || sender?.url || ''),
    timestamp: Date.now(),
    invocationId: String(message?.invocationId || ''),
  });
}

function ziggyFreshContext(tab) {
  const tabId = tab?.id;
  const context = Number.isInteger(tabId) ? ziggyContextInvocations.get(tabId) : null;
  if (!context) return null;
  const currentUrl = String(tab?.url || '');
  if (Date.now() - context.timestamp > ZIGGY_CONTEXT_TTL_MS || (currentUrl && context.pageUrl !== currentUrl)) {
    ziggyContextInvocations.delete(tabId);
    return null;
  }
  return context;
}

function ziggyResolveClickedContext(info, tab) {
  const captured = ziggyFreshContext(tab);
  let username = '';
  let source = 'none';
  if (captured?.source === 'model-card' && captured.username) {
    username = captured.username;
    source = 'model-card';
  } else {
    const linkedUsername = ziggyContextUsernameFromUrl(info?.linkUrl);
    if (linkedUsername) {
      username = linkedUsername;
      source = 'direct-link';
    } else if (captured?.source === 'direct-link' && captured.username) {
      username = captured.username;
      source = 'direct-link';
    } else {
      const roomUsername = ziggyContextUsernameFromUrl(tab?.url || captured?.pageUrl);
      if (roomUsername) {
        username = roomUsername;
        source = 'current-room';
      }
    }
  }
  return {
    username,
    source,
    tabId: Number.isInteger(tab?.id) ? tab.id : null,
    frameId: captured?.frameId ?? 0,
    pageUrl: String(tab?.url || captured?.pageUrl || ''),
    timestamp: Date.now(),
    invocationId: String(captured?.invocationId || ''),
  };
}

async function ziggySendToTopFrame(tabId, message) {
  if (!Number.isInteger(tabId)) throw new Error('No Chaturbate tab is available');
  return ziggyApi.tabs.sendMessage(tabId, message, { frameId: 0 });
}

async function ziggyHandleContextMenuClick(info, tab) {
  const tabId = tab?.id;
  try {
    if (info?.menuItemId === ZIGGY_CONTEXT_MENU_IDS.rooms) {
      const context = ziggyResolveClickedContext(info, tab);
      await ziggySendToTopFrame(tabId, { type: 'ziggy-context-open-rooms', context });
      return;
    }
    if (info?.menuItemId === ZIGGY_CONTEXT_MENU_IDS.workshop) {
      try {
        await ziggySendToTopFrame(tabId, { type: 'ziggy-context-open-workshop' });
      } catch (_) {
        const createProperties = { url: 'https://chaturbate.com/?multicam_mode=1', active: true };
        if (Number.isInteger(tabId)) createProperties.openerTabId = tabId;
        await ziggyApi.tabs.create(createProperties);
      }
    }
  } catch (error) {
    console.error('[Ziggy Suite] Context-menu action failed', error);
  } finally {
    if (Number.isInteger(tabId)) ziggyContextInvocations.delete(tabId);
  }
}

ziggyApi.contextMenus?.onClicked?.addListener((info, tab) => {
  void ziggyHandleContextMenuClick(info, tab);
});
ziggyApi.tabs?.onRemoved?.addListener(tabId => ziggyContextInvocations.delete(tabId));
ziggyApi.tabs?.onUpdated?.addListener((tabId, changeInfo) => {
  if (changeInfo?.url) ziggyContextInvocations.delete(tabId);
});

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
  if (Number.isInteger(sender?.tab?.windowId)) createProperties.windowId = sender.tab.windowId;
  if (message.insert && Number.isInteger(sender?.tab?.index)) createProperties.index = sender.tab.index + 1;
  if (message.setParent && Number.isInteger(sender?.tab?.id)) createProperties.openerTabId = sender.tab.id;
  const warnings = [];
  let tab;
  try {
    tab = await ziggyApi.tabs.create(createProperties);
  } catch (error) {
    warnings.push(String(error?.message || error));
    delete createProperties.openerTabId;
    tab = await ziggyApi.tabs.create(createProperties);
  }
  const tabId = Number.isInteger(tab?.id) ? tab.id : null;
  const sourceGroupId = Number(sender?.tab?.groupId);
  if (message.setParent && tabId != null && Number.isInteger(sourceGroupId) && sourceGroupId >= 0 && typeof ziggyApi.tabs.group === 'function') {
    try {
      await ziggyApi.tabs.group({ groupId: sourceGroupId, tabIds: [tabId] });
    } catch (error) {
      warnings.push(`Unable to inherit source tab group: ${String(error?.message || error)}`);
    }
  }
  return { tabId, ...(warnings.length ? { warning: warnings.join(' · ') } : {}) };
}

ziggyApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;
  if (message.type === 'ziggy-context-capture') {
    ziggyRememberContext(message, sender);
    sendResponse({ ok: true });
    return false;
  }
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
