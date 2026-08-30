;(async function ziggyExtensionBootstrap() {
  'use strict';

  const __ziggyApi = typeof browser !== 'undefined' ? browser : chrome;
  const __ziggyContextReservedPaths = new Set([
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

  function __ziggyStrictUsername(raw) {
    const username = String(raw || '').trim().replace(/^@+/, '').toLowerCase();
    if (username.length < 2 || username.length > 32) return '';
    if (!/^[a-z0-9_-]+$/i.test(username) || /^\d+$/.test(username)) return '';
    return __ziggyContextReservedPaths.has(username) ? '' : username;
  }

  function __ziggyUsernameFromUrl(rawUrl) {
    if (!rawUrl) return '';
    try {
      const url = new URL(String(rawUrl), location.origin);
      if (!/^https?:$/.test(url.protocol)) return '';
      const hostname = url.hostname.toLowerCase();
      if (hostname !== 'chaturbate.com' && !hostname.endsWith('.chaturbate.com')) return '';
      const segments = url.pathname.split('/').filter(Boolean);
      return segments.length === 1 ? __ziggyStrictUsername(decodeURIComponent(segments[0])) : '';
    } catch (_) {
      return '';
    }
  }

  function __ziggyUsernameFromCard(card) {
    if (!card) return '';
    const directCandidates = [
      card.dataset?.roomId,
      card.dataset?.room,
      card.dataset?.username,
      card.dataset?.model,
      card.getAttribute?.('data-room-id'),
      card.getAttribute?.('data-room'),
      card.getAttribute?.('data-username'),
      card.getAttribute?.('data-model'),
    ];
    for (const candidate of directCandidates) {
      const username = __ziggyStrictUsername(candidate);
      if (username) return username;
    }
    const nested = card.querySelector?.('[data-room-id],[data-room],[data-username],[data-model]');
    for (const candidate of [
      nested?.dataset?.roomId,
      nested?.dataset?.room,
      nested?.dataset?.username,
      nested?.dataset?.model,
      card.querySelector?.('[data-testid="room-card-username"]')?.textContent,
    ]) {
      const username = __ziggyStrictUsername(candidate);
      if (username) return username;
    }
    const anchors = card.querySelectorAll?.(
      'a[data-testid="room-card-image-anchor"][href],a[data-testid="room-card-username"][href],a[href]',
    ) || [];
    for (const anchor of anchors) {
      const username = __ziggyUsernameFromUrl(anchor.href || anchor.getAttribute?.('href'));
      if (username) return username;
    }
    return '';
  }

  function __ziggyContextCandidate(eventTarget) {
    const target = typeof Element !== 'undefined' && eventTarget instanceof Element
      ? eventTarget
      : eventTarget?.parentElement;
    if (!target?.closest) return null;
    const card = target.closest(
      '.cam-card[data-room-id],[data-testid="room-card"],[data-room-id][class*="card" i],[data-username][class*="card" i]',
    );
    const cardUsername = __ziggyUsernameFromCard(card);
    if (cardUsername) return { username: cardUsername, source: 'model-card' };
    const anchor = target.closest('a[href]');
    const linkUsername = __ziggyUsernameFromUrl(anchor?.href || anchor?.getAttribute?.('href'));
    return linkUsername ? { username: linkUsername, source: 'direct-link' } : null;
  }

  if (document?.addEventListener && __ziggyApi?.runtime?.sendMessage) {
    document.addEventListener('contextmenu', event => {
      const candidate = __ziggyContextCandidate(event.target);
      const invocationId = crypto.randomUUID?.() || `ziggy-context-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      Promise.resolve(__ziggyApi.runtime.sendMessage({
        type: 'ziggy-context-capture',
        candidate,
        frameUrl: location.href,
        timestamp: Date.now(),
        invocationId,
      })).catch(() => {});
    }, true);
  }

  if (__ziggyApi?.runtime?.onMessage?.addListener) {
    __ziggyApi.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'ziggy-context-open-rooms') {
        document.dispatchEvent(new CustomEvent('ziggy-suite:open-rooms', {
          detail: {
            modelId: __ziggyStrictUsername(message.context?.username),
            source: String(message.context?.source || 'none'),
            summonedBy: 'browser-context-menu',
            invocationId: String(message.context?.invocationId || ''),
          },
        }));
        sendResponse?.({ ok: true });
        return false;
      }
      if (message?.type === 'ziggy-context-open-workshop') {
        document.dispatchEvent(new CustomEvent('ziggy-suite:open-workshop'));
        sendResponse?.({ ok: true });
        return false;
      }
      return undefined;
    });
  }

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
