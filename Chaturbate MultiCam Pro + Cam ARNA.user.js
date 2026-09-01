// ==UserScript==
// @name              Ziggy Chaturbate Suite
// @namespace         https://github.com/ryujo/roomgrid-multicam-pro
// @version           16.5.30
// @homepageURL       https://github.com/linuxNoob620/chaturbate-userscripts
// @supportURL        https://github.com/linuxNoob620/chaturbate-userscripts/issues
// @updateURL         https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/refs/heads/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.meta.js
// @downloadURL       https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/refs/heads/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.user.js
// @description       Native desktop and mobile Rooms suite with MultiCam, Cam ARNA, Reloaded tools, mobile Clean View, recording, split view, and encrypted settings sync.
// @author            Ziggy
// @license           MIT
// @match             https://chaturbate.com/*
// @match             https://*.chaturbate.com/*
// @require           https://cdn.jsdelivr.net/npm/hls.js@1.6.16/dist/hls.min.js
// @require           https://unpkg.com/mediabunny@1.55.5/dist/bundles/mediabunny.min.cjs
// @grant             GM_xmlhttpRequest
// @grant             GM_getValue
// @grant             GM_setValue
// @grant             GM_download
// @grant             GM_openInTab
// @grant             window.focus
// @connect           archivebate.com
// @connect           recu.me
// @connect           showcamrips.com
// @connect           camshowrecordings.com
// @connect           camwh.com
// @connect           topcamvideos.com
// @connect           lovecamporn.com
// @connect           camwhores.tv
// @connect           bestcam.tv
// @connect           xhomealone.com
// @connect           stream-leak.com
// @connect           mfcamhub.com
// @connect           camshowrecord.net
// @connect           camwhoresbay.com
// @connect           camsave1.com
// @connect           onscreens.me
// @connect           livecamrips.to
// @connect           cumcams.cc
// @connect           allmy.cam
// @connect           livecamsrip.com
// @connect           camsrip.com
// @connect           translate.googleapis.com
// @connect           www.camsoda.com
// @connect           stripchat.com
// @connect           bongacams.com
// @connect           webchat.cam4.com
// @connect           cam4.com
// @connect           manifest-server.naiadsystems.com
// @connect           api-edge.myfreecams.com
// @connect           edgevideo.myfreecams.com
// @connect           api.github.com
// @run-at            document-end
// ==/UserScript==

/*
 * MIT License
 *
 * Copyright (c) 2026 RYUJO
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
  'use strict';

  // The Online Following synchronizer uses a same-origin rendering frame when
  // Chaturbate returns only its JavaScript shell to fetch(). Do not mount a
  // second Suite instance inside that private helper frame.
  if (window.top !== window.self && window.name === 'ziggy-following-sync-frame') return;

  // Prevent duplicate installations from mounting a second UI or media service.
  // The DOM marker is visible across separate Tampermonkey sandboxes; a window
  // property alone is not.
  const INSTANCE_MARKER_ID = 'ziggy-chaturbate-suite-runtime';
  if (document.getElementById(INSTANCE_MARKER_ID)) {
    try { console.warn('[RoomGrid] duplicate userscript installation blocked'); } catch (_) {}
    return;
  }
  const instanceMarker = document.createElement('meta');
  instanceMarker.id = INSTANCE_MARKER_ID;
  instanceMarker.setAttribute('data-suite-version', '16.5.30');
  (document.head || document.documentElement).appendChild(instanceMarker);
  const INSTANCE_KEY = '__roomGridMultiCamWorkstationRunning';
  if (window[INSTANCE_KEY]) {
    try { console.warn('[RoomGrid] duplicate userscript instance blocked'); } catch (_) {}
    return;
  }
  window[INSTANCE_KEY] = true;

  /* Integrated room-tab titles. Workshop always has one canonical URL/title. */
  const WORKSHOP_TAB_TITLE = 'Ziggy Room Suite';
  const RECORDER_TAB_TITLE = 'Ziggy Recorder Hub';
  const ROOM_TAB_RESERVED_PATHS = new Set([
    'accounts', 'affiliate', 'affiliates', 'apps', 'auth', 'blog', 'contest',
    'contests', 'couple-cams', 'discover', 'female-cams', 'followed-cams',
    'following', 'jobs', 'male-cams', 'my_collection', 'photo_videos',
    'privacy', 'rooms', 'search', 'security', 'support', 'tags', 'terms',
    'trans-cams', 'verify',
  ]);
  const isWorkshopRoute = () => new URLSearchParams(location.search).get('multicam_mode') === '1';
  const isRecorderHubRoute = () => new URLSearchParams(location.search).get('multicam_recorder') === '1';

  function canonicalWorkshopUrl() {
    const url = new URL('/', location.origin);
    url.searchParams.set('multicam_mode', '1');
    return url.toString();
  }

  function canonicalRecorderHubUrl() {
    const url = new URL('/', location.origin);
    url.searchParams.set('multicam_recorder', '1');
    return url.toString();
  }

  function canonicalizeWorkshopRoute() {
    if (!isWorkshopRoute()) return;
    const canonical = canonicalWorkshopUrl();
    if (location.href !== canonical) history.replaceState(history.state, '', canonical);
  }

  function roomNameForTabTitle() {
    const match = String(location.pathname || '').match(/^\/([A-Za-z0-9_-]+)\/?$/);
    if (!match) return '';
    let roomName = '';
    try { roomName = decodeURIComponent(match[1]); } catch (_) { roomName = match[1]; }
    return ROOM_TAB_RESERVED_PATHS.has(roomName.toLowerCase()) ? '' : roomName;
  }

  function enforceSuiteTabTitle() {
    const roomName = roomNameForTabTitle();
    const wantedTitle = isRecorderHubRoute() ? RECORDER_TAB_TITLE : (isWorkshopRoute() ? WORKSHOP_TAB_TITLE : (roomName ? `${roomName}'s Room` : ''));
    if (wantedTitle && document.title !== wantedTitle) document.title = wantedTitle;
  }

  canonicalizeWorkshopRoute();
  window.__ziggySuiteTabRenamerIntegrated = true;
  const suiteTitleObserver = new MutationObserver(enforceSuiteTabTitle);
  suiteTitleObserver.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  for (const eventName of ['readystatechange', 'DOMContentLoaded', 'pageshow', 'popstate', 'hashchange']) {
    const target = ['pageshow', 'popstate', 'hashchange'].includes(eventName) ? window : document;
    target.addEventListener(eventName, () => { canonicalizeWorkshopRoute(); enforceSuiteTabTitle(); });
  }
  setInterval(enforceSuiteTabTitle, 750);
  enforceSuiteTabTitle();

  // Desktop room pages default to Chaturbate's own theater layout. This only
  // attempts the transition once per page load, so leaving theater manually is
  // respected until the next navigation or refresh.
  function enterDefaultDesktopTheaterOnce() {
    if (!roomNameForTabTitle() || isWorkshopRoute() || isRecorderHubRoute()) return;
    let attempts = 0;
    const tryEnter = () => {
      attempts += 1;
      const button = document.getElementById('theater-mode-icon')
        || document.querySelector('[aria-label="Theater Mode"]');
      const resizeHandle = [...document.querySelectorAll('.resizeHandle')]
        .find(node => node.getClientRects().length && getComputedStyle(node).display !== 'none');
      if (button?.getClientRects().length && resizeHandle) {
        try { button.click(); } catch (_) {}
        return;
      }
      // A mounted theater button without the normal-mode resize handle means
      // the room is already in theater mode.
      if (button && !resizeHandle && attempts >= 10) return;
      if (attempts < 50) setTimeout(tryEnter, 160);
    };
    setTimeout(tryEnter, 180);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enterDefaultDesktopTheaterOnce, { once: true });
  else enterDefaultDesktopTheaterOnce();

  /* Core utilities */
  const $ = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') setTrustedHtml(el, v);
      else if (k in el) el[k] = v;
      else el.setAttribute(k, v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    const title = typeof props.title === 'string' ? props.title.trim() : '';
    if (title) setElementHint(el, title);
    return el;
  };

  function setElementHint(el, text) {
    if (!el || !text) return el;
    const v = String(text).trim();
    if (!v) return el;
    try { el.title = v; } catch (_) {}
    try { el.dataset.hint = v; } catch (_) {}
    try {
      if (/^(BUTTON|INPUT|SELECT|TEXTAREA)$/i.test(el.tagName || '')) {
        el.setAttribute('aria-label', v);
      }
    } catch (_) {}
    return el;
  }

  function htmlEscape(s) {
    return String(s ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  const TRUSTED_HTML_MARK = '__roomgridTrustedHtml';
  function trustedHtml(html) { return { [TRUSTED_HTML_MARK]: true, html: String(html ?? '') }; }
  function setTrustedHtml(el, value) {
    if (!el) return;
    if (value && typeof value === 'object' && value[TRUSTED_HTML_MARK] === true) el.innerHTML = value.html;
    else el.textContent = String(value ?? '');
  }

  const ICONS = {
    menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.2-5M4 5v5h5"/><path d="M4 13a8 8 0 0 0 14.2 5M20 19v-5h-5"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8"/>',
    volumeOff: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M18 9l-4 4M14 9l4 4"/>',
    camera: '<path d="M4 8h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="14" r="4"/>',
    record: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
    stop: '<rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" stroke="none"/>',
    pip: '<rect x="4" y="5" width="16" height="14" rx="2"/><rect x="12" y="12" width="6" height="4" rx="1"/>',
    expand: '<path d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 16v4h-4"/>',
    more: '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    resize: '<path d="M9 15h6V9M7 21h12V9"/>',
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    focus: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8v6H8z"/>',
    clean: '<path d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="12" cy="12" r="2"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    external: '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/>',
    folder: '<path d="M4 7h7l2 2h7v11H4z"/>',
    star: '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/>',
    split: '<rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/>',
    swap: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
    move: '<path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    trash: '<path d="M5 7h14M10 11v6M14 11v6M8 7l1-3h6l1 3M7 7l1 14h8l1-14"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
  };

  function iconSvg(name, size = 16) {
    const body = ICONS[name] || ICONS.more;
    return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  function iconLabel(name, text, size = 15) {
    return `${iconSvg(name, size)}<span class="btn-label">${htmlEscape(text)}</span>`;
  }

  const debounce = (fn, ms = 200) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  const fmtTime = (ts) => {
    if (!ts) return '—';
    const diff = (Date.now() - ts) / 1000;
    const ago = (n, u) => LANG === 'zh' ? `${n}${u} 前` : `${n}${u} ago`;
    if (diff < 60) return ago(Math.floor(diff), 's');
    if (diff < 3600) return ago(Math.floor(diff / 60), 'm');
    if (diff < 86400) return ago(Math.floor(diff / 3600), 'h');
    return ago(Math.floor(diff / 86400), 'd');
  };

  const uuid = () => {
    try {
      if (crypto?.randomUUID) return 'g_' + crypto.randomUUID().replace(/-/g, '').slice(0, 10);
      if (crypto?.getRandomValues) {
        const buf = new Uint32Array(2);
        crypto.getRandomValues(buf);
        return 'g_' + [...buf].map(n => n.toString(36)).join('').slice(0, 10);
      }
    } catch (_) {}
    return 'g_' + Math.random().toString(36).slice(2, 12);
  };

  const LIBRARY_GROUP_ID = 'library';
  const DEFAULT_GROUP_ID = 'all';
  const ONLINE_GROUP_ID = 'online';
  const ONLINE_FAVORITES_GROUP_ID = 'online-favorites';
  const ONLINE_FOLLOWING_GROUP_ID = 'online-following';
  const ONLINE_FOLLOWING_PAGE_SIZE = 9;
  const ONLINE_FOLLOWING_MOBILE_PAGE_SIZE = 4;
  const FAVORITE_GROUP_ID = 'fav';

  // v15.5: 稳定状态。多工作台/多窗口同时轮询时，不再用 loading / transient error 覆盖
  // 已确认的 online/offline/private，避免筛选、分页和 HLS 反复重建造成闪屏。
  const STABLE_ROOM_STATUSES = new Set(['online', 'offline', 'private']);
  function isStableRoomStatus(status) {
    return STABLE_ROOM_STATUSES.has(String(status || ''));
  }
  function isTransientRoomStatus(status) {
    return status === 'loading' || status === 'error';
  }

  function defaultShortcuts() {
    return {
      focusAdd: '/',
      refreshAll: 'r',
      gridView: 'g',
      focusView: 'f',
      pureMode: 'alt+p',
      focusThumbs: 'alt+t',
      recordingCenter: 'alt+shift+c',
      recordPage: 'alt+shift+r',
    };
  }

  function normalizeShortcutSpec(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!raw) return '';
    const parts = raw.split('+').filter(Boolean);
    const mods = new Set();
    let key = '';
    for (const part of parts) {
      if (part === 'control') mods.add('ctrl');
      else if (part === 'cmd' || part === 'command') mods.add('meta');
      else if (['ctrl', 'meta', 'alt', 'shift'].includes(part)) mods.add(part);
      else key = part === ' ' ? 'space' : part;
    }
    if (!key) return '';
    const out = [];
    ['ctrl', 'meta', 'alt', 'shift'].forEach(m => { if (mods.has(m)) out.push(m); });
    out.push(key);
    return out.join('+');
  }

  function sanitizeShortcuts(input, fallback = defaultShortcuts()) {
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const out = {};
    for (const [action, spec] of Object.entries(fallback)) {
      out[action] = normalizeShortcutSpec(source[action]) || normalizeShortcutSpec(spec);
    }
    return out;
  }

  function shortcutFromEvent(e) {
    const keyRaw = e.code === 'Space' ? 'space' : String(e.key || '').toLowerCase();
    const key = keyRaw === ' ' ? 'space' : keyRaw;
    if (!key || ['control', 'shift', 'alt', 'meta'].includes(key)) return '';
    const out = [];
    if (e.ctrlKey) out.push('ctrl');
    if (e.metaKey) out.push('meta');
    if (e.altKey) out.push('alt');
    if (e.shiftKey) out.push('shift');
    out.push(key);
    return normalizeShortcutSpec(out.join('+'));
  }

  function shortcutLabel(spec) {
    const normalized = normalizeShortcutSpec(spec);
    if (!normalized) return '';
    const names = { ctrl: 'Ctrl', meta: 'Meta', alt: 'Alt', shift: 'Shift', space: 'Space', arrowleft: 'Left', arrowright: 'Right', arrowup: 'Up', arrowdown: 'Down' };
    return normalized.split('+').map(part => names[part] || (part.length === 1 ? part.toUpperCase() : part)).join('+');
  }

  function defaultVideoTransform() {
    return { mirror: false, flip: false, rotation: 0, zoom: 1, x: 0, y: 0 };
  }

  function sanitizeVideoTransform(input) {
    const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const rotationRaw = Number(src.rotation) || 0;
    const rotation = ((Math.round(rotationRaw / 90) * 90) % 360 + 360) % 360;
    return {
      mirror: !!src.mirror,
      flip: !!src.flip,
      rotation,
      zoom: Math.max(1, Math.min(20, Number(src.zoom) || 1)),
      x: Math.max(-5000, Math.min(5000, Number(src.x) || 0)),
      y: Math.max(-5000, Math.min(5000, Number(src.y) || 0)),
    };
  }

  function isDefaultVideoTransform(transform) {
    const t = sanitizeVideoTransform(transform);
    return !t.mirror && !t.flip && t.rotation === 0 && t.zoom === 1 && t.x === 0 && t.y === 0;
  }

  function sanitizeVideoTransformMap(input) {
    const out = {};
    if (input && typeof input === 'object' && !Array.isArray(input)) {
      for (const [id, value] of Object.entries(input)) {
        const roomId = normalizeUsername(id);
        if (!roomId) continue;
        const transform = sanitizeVideoTransform(value);
        if (!isDefaultVideoTransform(transform)) out[roomId] = transform;
      }
    }
    return out;
  }

  function encodeSharePayload(data) {
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.slice(i, i + 0x8000));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function decodeSharePayload(data) {
    const normalized = String(data || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function normalizeUsername(raw) {
    let v = String(raw || '').trim();
    if (!v) return '';
    try {
      if (/^https?:\/\//i.test(v)) {
        const url = new URL(v);
        v = url.pathname.split('/').filter(Boolean)[0] || '';
      }
    } catch (_) {}
    return v.replace(/^@+/, '').replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  }

  function usernameSyntaxOk(v) {
    v = normalizeUsername(v);
    return !!v && v.length >= 2 && v.length <= 32 && /^[a-z0-9_-]+$/i.test(v) && !/^\d+$/.test(v);
  }

  function safeGroupName(raw, fallback = '') {
    const v = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    return (v || fallback || '').slice(0, 80);
  }

  function isSafeHttpUrl(raw, base = location.href) {
    try {
      const u = new URL(String(raw || ''), base);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch (_) { return false; }
  }

  function isSafeStreamUrl(raw) {
    const s = String(raw || '').trim();
    if (!s || s.length > 4096 || /[\u0000-\u001f\u007f]/.test(s)) return false;
    // Accept only http(s). Do not require a .m3u8 suffix because some CDNs serve playlists through signed routes.
    return isSafeHttpUrl(s);
  }

  function safeChaturbateHost(host) {
    const h = String(host || '').toLowerCase();
    return h === 'chaturbate.com' || h.endsWith('.chaturbate.com');
  }

  async function copyText(text) {
    text = String(text || '');
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      try {
        const ta = $('textarea', { value: text, style: { position: 'fixed', left: '-9999px', top: '-9999px', opacity: '0' } });
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (_) { return false; }
    }
  }

  function downloadBlob(blob, filename) {
    const a = $('a', { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a);
    a.click();
    // Large recordings need time for the browser to attach to the object URL.
    setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (_) {} }, 60000);
  }

  function openNoopener(url, target = '_blank') {
    const safeTarget = target || '_blank';
    const w = window.open(String(url || 'about:blank'), safeTarget, 'noopener,noreferrer');
    try { if (w) w.opener = null; } catch (_) {}
    return w;
  }

  function openBackgroundTab(url) {
    const targetUrl = String(url || 'about:blank');
    try {
      if (typeof GM_openInTab === 'function') {
        return GM_openInTab(targetUrl, { active: false, insert: true, setParent: true });
      }
    } catch (_) {}
    return openNoopener(targetUrl);
  }

  function safeFilePart(v) {
    return String(v || 'room').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 48) || 'room';
  }

  function stampForFile() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  function stopMediaElement(media, remove = false) {
    if (!media) return;
    try { media.muted = true; media.volume = 0; media.pause(); } catch (_) {}
    try {
      const srcObject = media.srcObject;
      if (srcObject && typeof srcObject.getTracks === 'function') {
        srcObject.getTracks().forEach(track => { try { track.stop(); } catch (_) {} });
      }
    } catch (_) {}
    try { media.srcObject = null; } catch (_) {}
    try {
      media.querySelectorAll?.('source').forEach(source => {
        try { source.removeAttribute('src'); source.src = ''; source.remove(); } catch (_) {}
      });
    } catch (_) {}
    try { media.removeAttribute('src'); media.src = ''; media.load(); } catch (_) {}
    if (remove) { try { media.remove(); } catch (_) {} }
  }

  function stopAllPageMedia(root = document) {
    // 当前页打开工作台、新开工作台或整页卸载前，先切断页面上原有的音视频。
    try { root.querySelectorAll('video,audio').forEach(media => stopMediaElement(media, false)); } catch (_) {}
  }

  /* =============================================================
   * 0.5. 国际化 / i18n  ——  默认跟随浏览器语言，可手动切换
   * ============================================================= */
  const I18N = {
    en: {
      // ---- workstation chrome ----
      title: 'Ziggy Room Suite',
      appTagline: 'All-in-one multiview workstation for rooms, recording, alerts, screenshots, reconnects, and data tools.',
      addPlaceholder: 'Username ↵',
      searchPlaceholder: 'Search rooms',
      invalidUsername: 'Invalid username',
      hideOffline: 'Hide offline',
      hidePrivate: 'Hide private',
      onlyOnline: 'Online only',
      sortLabel: 'Sort',
      sortManual: 'Manual',
      sortStatus: 'By status',
      sortName: 'By name',
      sortFavoriteName: 'Favorites, then name',
      sortAdded: 'By added time',
      refreshAll: 'Refresh all',
      notifyOnline: 'Online alerts',
      notifyFavoritesOnly: 'Alerts for favorites only',
      startOnOnlineFavorites: 'Open on Online Favorites at startup',
      startupSettings: 'Startup view and group',
      startupSettingsHint: 'Choose what the Workshop shows when it opens. Changes apply on the next Workshop load.',
      startupViewLabel: 'Startup layout',
      startupGroupLabel: 'Startup group',
      startupLastUsed: 'Last used',
      startupAutomatic: 'Automatic for this device',
      notifyTitle: 'Desktop notification + card flash when a model goes online',
      collapseSidebar: '',
      viewGrid: 'Grid',
      viewFocus: 'Focus',
      viewPhone: 'Phone',
      viewSplit: 'Split',
      viewModeLabel: 'Layout',
      visibleRooms: 'Visible models',
      phoneAutoMode: 'Automatically use Phone mode on phones',
      moreOps: 'More',
      pureMode: 'Clean',
      pureModeOn: 'Clean mode on',
      pureModeOff: 'Exit clean mode',
      pureModeHint: 'Temporarily hide all controls and overlays. Shortcut: Alt+P / Alt+C. Press Esc to exit.',
      focusThumbsShow: 'Show thumbnails',
      focusThumbsHide: 'Hide thumbnails',
      focusThumbsHint: 'Show or hide the thumbnail rail in Focus mode. Shortcut: Alt+T.',
      videoFitContain: 'Fit: full image',
      videoFitCover: 'Fit: fill window',
      videoFitHint: 'Switch between full image and cropped fill.',
      playbackSettingsTitle: 'Playback settings',
      maxStreamHeight: 'Max stream quality',
      maxQualityAuto: 'Auto / no cap',
      freeZoomLabel: 'Ctrl/Command + wheel zoom',
      freeZoomHint: 'Zoom a card with Ctrl/Command + mouse wheel, drag while zoomed, double-click to reset.',
      pureExitHint: 'Exit clean mode. Shortcut: Alt+P / Alt+C or Esc.',
      pureExitChip: 'Clean · Alt+P/C / Esc',
      syncedFromOtherTab: '(synced from another tab)',
      hintAddInput: 'Type a username and press Enter. Shortcut: /',
      hintSearchInput: 'Filter visible rooms by username',
      hintSidebarToggle: 'Show / hide group sidebar',
      hintVolume: 'Global volume. Per-room mute is still respected.',
      hintGridSize: 'Base tile size in grid view',
      hintSort: 'Sort rooms in the current group',
      hintMainRatio: 'Main-screen height in Focus mode. You can also drag the separator.',
      hintMainAspect: 'Main-screen aspect ratio in Focus mode',
      hintThumbSize: 'Thumbnail width in Focus mode',
      hintGroupTab: (n) => `Switch to ${n}. Drag rooms here to add them to this group.`,
      hintOnlineFavoritesTab: 'Show favorite rooms that are online now.',
      hintOnlineFollowingTab: 'Live rooms you follow. This view refreshes automatically, stays alphabetical, and streams at up to 480p.',
      hintLibraryTab: 'Show every saved room. The remove button deletes globally in this view.',
      hintNewGroup: 'Create an isolated group',
      hintMoreMenu: 'More tools and maintenance',
      // ---- sidebar ----
      groupsHeading: 'GROUPS',
      quickViewsHeading: 'QUICK VIEWS',
      myGroupsHeading: 'MY GROUPS',
      groupLibrary: 'All saved',
      groupAll: 'Default',
      groupOnline: 'Online now',
      groupOnlineFav: 'Online Favorites',
      groupOnlineFollowing: 'Online Following',
      groupFav: 'Favorites',
      newGroup: 'New group',
      newGroupPrompt: 'New group name:',
      renameGroup: 'Rename',
      renameGroupPrompt: 'Rename to:',
      deleteGroup: 'Delete group',
      deleteGroupConfirm: (n) => `Delete group "${n}"? Rooms stay saved and are only removed from this group.`,
      statTotal: 'Total',
      statOnline: 'Online',
      statMuted: 'Muted',
      // ---- card ----
      opRefresh: 'Refresh',
      opMuteToggle: 'Toggle mute',
      opPause: 'Pause',
      opResume: 'Resume',
      opScreenshot: 'Screenshot current frame',
      opRecordStart: 'Record current card',
      opRecordStop: 'Stop recording',
      opPiP: 'Picture-in-Picture',
      opFullscreen: 'Fullscreen',
      opMoveGroup: 'Add to group',
      opRemove: 'Remove from current group',
      opDeleteRoom: 'Delete saved room',
      opMirror: 'Mirror image',
      opFlip: 'Flip image',
      opRotateLeft: 'Rotate left',
      opRotateRight: 'Rotate right',
      opResetView: 'Reset view',
      opOpenRoom: 'Open room',
      opCopyUsername: 'Copy username',
      opCopyRoomLink: 'Copy room link',
      opOpenRecu: 'Open Recu.me profile',
      modelNameBackgroundTab: 'Open model in a background tab',
      opUnfollowAccount: 'Unfollow on Chaturbate',
      unfollowAccountConfirm: (n) => `Unfollow ${n} on Chaturbate? This changes your actual Chaturbate account.`,
      unfollowAccountDone: (n) => `${n} unfollowed on Chaturbate`,
      unfollowAccountFailed: (n) => `Could not unfollow ${n}`,
      unfollowSignInRequired: 'Sign in to Chaturbate before unfollowing rooms',
      opFavoriteAdd: 'Add favorite',
      opFavoriteRemove: 'Remove favorite',
      opMoveToFavorites: 'Move to favorites only',
      opAddSplit: 'Add to Split View',
      splitView: 'Split View',
      splitAddedFirst: (n) => `${n} added to pane 1. Choose a second model.`,
      splitAlreadyAdded: 'This model is already in Split View',
      splitNeedTwo: 'Choose two models before opening Split View',
      splitChoosePane: 'Choose pane to replace',
      splitReplacePane: (n, name) => `Replace pane ${n}: ${name}`,
      splitPickerTitle: (n) => `Choose model for pane ${n}`,
      splitPickerSearch: 'Search models',
      splitQuickPreview: 'Quick preview',
      splitPreviewHint: 'Long-press a model or use its preview button.',
      splitPreviewUse: (n) => `Use in pane ${n}`,
      splitPreviewRefresh: 'Refresh preview',
      splitPreviewUnavailable: 'Preview unavailable',
      splitPreviewClose: 'Close preview',
      splitOnlineFollowing: 'Online Following',
      splitOnlineFavorites: 'Online Favorites',
      splitOnline: 'Online',
      splitFavorites: 'Favorites',
      splitAllSaved: 'All Saved',
      splitOtherPane: 'Already in the other pane',
      splitCurrentPane: 'Already in this pane',
      splitNoMatches: 'No matching models',
      splitReplace: 'Replace',
      splitPrevOnline: 'Previous online model',
      splitNextOnline: 'Next online model',
      splitNoOtherOnline: 'No other online models available',
      splitSwap: 'Swap panes',
      splitExit: 'Exit split',
      splitFullscreen: 'Fullscreen',
      splitControlsPosition: 'Move one-handed controls',
      splitControlsTop: 'Top',
      splitControlsLowerLeft: 'Lower left',
      splitControlsLowerRight: 'Lower right',
      splitAudio: 'Use audio from this pane',
      splitPane: (n) => `Pane ${n}`,
      splitDivider: 'Drag to resize panes',
      copied: 'Copied',
      screenshotSaved: 'Screenshot saved',
      captureFailed: 'Screenshot failed. Browser/CORS may block drawing this stream.',
      recordingConsent: 'Recording is local and saves this video with its matching audio when the browser exposes it. Use it only when you have permission to save this content. Continue?',
      recordingStarted: 'Recording started',
      recordingSaved: 'Recording saved',
      recordingUnsupported: 'Recording is not supported for this video/browser',
      recordingSegmentSaved: 'Recording segment saved',
      recordingFinalSaved: 'Final recording segment saved',
      recordingPausedSource: 'Recording paused; waiting for the stream to return',
      recordingResumed: 'Recording resumed',
      recordingWaiting: 'Recording paused; click to stop',
      recordingNoData: 'No recording data to save',
      recordingSettingsSaved: 'Recording settings saved',
      recordingSegmentPrompt: 'Segment length in minutes (1-180):',
      recordingBitratePrompt: 'Video bitrate in Mbps (0.5-20):',
      recordingExitWarnToggle: 'Warn before leaving while recording',
      recordingExitWarnMessage: 'Recording is still active. Leave anyway?',
      recordingCenter: 'Recording center',
      recordingCenterEmpty: 'No active recordings',
      recordingActive: 'Recording',
      recordingWaitingShort: 'Waiting for source',
      recordingSavedSegments: 'Saved segments',
      recordingDuration: 'Duration',
      recordingBitrate: 'Bitrate',
      recordingFormatHint: 'Format: MP4 when supported by this browser; otherwise the best supported fallback.',
      recordingRecoverPrompt: (n) => `Resume recording intent for ${n} room(s) from the previous session?`,
      recordCurrentPage: 'Record visible models',
      recordCurrentGroup: 'Record current group',
      recordOnlineRooms: 'Record online rooms',
      stopAllRecordings: 'Stop all recordings',
      showRecordingOnly: 'Show recording only',
      hideRecordingOnly: 'Show all rooms',
      batchOpenCurrentPage: 'Open visible models',
      batchMoveCurrentPage: 'Move visible models to group',
      layoutSettings: 'Layout settings',
      recordingSettingsTitle: 'Recording settings',
      saveSettings: 'Save settings',
      backupPanel: 'Config backups',
      noBackups: 'No config backups found',
      restoreBackup: 'Restore',
      deleteBackup: 'Delete',
      statusHistory: 'Online/offline history',
      noStatusHistory: 'No history yet',
      groupRules: 'Group rules',
      favoriteFirst: 'Keep favorites first',
      tempUrlManager: 'Temporary URL manager',
      saveTempUrls: 'Save current temporary URLs',
      noTempUrls: 'No temporary URLs',
      sharePanel: 'Share workspace',
      shareCurrentWorkspace: 'Share current rooms and layout',
      shareCopyLink: 'Copy share link',
      shareLinkHint: 'This link restores rooms, groups, and layout settings in another workstation tab.',
      shareImportPrompt: (n) => `Import shared workspace with ${n} room(s)? Your current config will be backed up first.`,
      shareImported: 'Shared workspace imported',
      shareInvalid: 'Shared workspace link is invalid',
      shortcutPanel: 'Shortcuts',
      shortcutCaptureHint: 'Click a field and press the new shortcut. Backspace clears that field.',
      resetShortcuts: 'Reset shortcuts',
      shortcutFocusAdd: 'Focus add box',
      shortcutRefreshAll: 'Refresh all',
      shortcutGridView: 'Grid view',
      shortcutFocusView: 'Focus view',
      shortcutPureMode: 'Clean mode',
      shortcutFocusThumbs: 'Toggle thumbnails',
      shortcutRecordingCenter: 'Recording center',
      shortcutRecordPage: 'Record visible models',
      settingsCenter: 'Settings',
      settingsCenterHint: 'Layout, playback, recording, shortcuts, and settings backup',
      settingsOnlyHint: 'One backup contains the MultiCam model library, groups, layout, playback, recording, filters, notifications, and shortcuts, plus Reloaded and Mobile Clean View settings. Import replaces the current MultiCam model library with the one in the backup.',
      settingsExport: 'Export all Suite settings to GitHub',
      settingsImport: 'Import all Suite settings from GitHub',
      settingsImported: 'MultiCam, Reloaded, and Mobile Clean View settings imported',
      settingsImportedLegacy: 'Older settings-only backup imported; the current MultiCam model list and groups were kept',
      settingsImportConfirm: 'Import this backup? The current MultiCam model list and groups will be deleted and replaced by the list in this file. The current MultiCam configuration will be backed up first.',
      settingsImportLegacyConfirm: 'This is an older settings-only backup and contains no MultiCam model list. Import its settings while keeping the current models and groups?',
      // ---- statuses ----
      stOnline: 'Online',
      stOffline: 'Offline',
      stPrivate: 'Private',
      stLoading: 'Loading',
      stError: 'Error',
      stUnknown: 'Unknown',
      lastSeen: (t) => `Last online ${t}`,
      autoDetect: 'Auto-detecting…',
      // ---- empty state ----
      emptyTitle: 'No rooms in this group',
      emptyHint: 'Add a username at the top, switch group, or clear filters',
      // ---- toasts / floating button ----
      addRoom: (n) => `Add ${n}`,
      alreadyAdded: (n) => ` ${n} already in workstation`,
      openWorkstation: 'Open workstation',
      memoryStat: (n) => `${n} rooms saved`,
      memoryView: 'View saved list',
      collapseFAB: 'Collapse dock',
      dockAutoCollapse: 'Auto-collapse',
      dockAutoCollapseHint: 'seconds (0 = off)',
      dockAutoCollapseSaved: (n) => n > 0 ? `Dock auto-collapse set to ${n} seconds` : 'Dock auto-collapse disabled',
      dockSubtitle: 'MultiCam tools',
      dockCurrentRoom: (n) => `Current: ${n}`,
      dockNoRoom: 'No room detected',
      dockOpen: 'Open workstation',
      dockAdd: 'Add room',
      dockRemove: 'Remove room',
      dockFavoriteAdd: 'Add favorite',
      dockFavoriteRemove: 'Remove favorite',
      dockRecord: 'Record model',
      dockPauseRecording: 'Pause recording',
      dockResumeRecording: 'Resume recording',
      dockStopRecording: 'Stop and save',
      dockScreenshot: 'Screenshot video',
      dockPip: 'Picture-in-Picture',
      dockPause: 'Play / pause',
      dockMute: 'Mute / unmute',
      dockRecu: 'Recu.me profile',
      dockVideoMissing: 'No playable video found on this page',
      dockRecordQueued: 'Recording started in Recorder Hub',
      recorderHub: 'Recorder Hub',
      recorderConnecting: 'Connecting',
      recorderReconnecting: 'Reconnecting',
      recorderPrivate: 'Paused for private/secret show',
      recorderOffline: 'Offline',
      recorderFinalizing: 'Finalizing',
      recorderStopped: 'Stopped',
      recorderStoppedNoData: 'Stopped · Nothing was recorded',
      recorderInterrupted: 'Stopped · Recorder Hub was reloaded; the in-memory recording could not be recovered',
      recorderStopWaiting: 'Stop requested · waiting for Recorder Hub',
      recorderSaving: 'Saving file',
      recorderSaved: 'Download started',
      recorderAudioOn: 'Audio recorded',
      recorderAudioOff: 'No audio track',
      recorderWaitingTime: 'Waiting',
      recorderEstimatedSize: 'Size',
      recorderOpenHub: 'Open Recorder Hub',
      recorderPause: 'Pause',
      recorderResume: 'Resume',
      recorderPausedManual: 'Paused manually',
      recorderHubTitle: 'Recorder Hub',
      recorderHubSubtitle: 'One persistent recording service for Rooms and Workshop.',
      recorderRecording: 'Recording',
      recorderPausedPrivate: 'Paused for private/secret/group/password show',
      recorderPausedOffline: (time) => `Offline · stopping in ${time}`,
      recorderRetrying: 'Reconnecting',
      recorderOpenRoom: 'Open room',
      recorderRetry: 'Retry',
      recorderHubCloseWarning: 'Recordings are still active. Closing this tab stops them.',
      recorderHubWarning: 'Keep this tab open while recording. Workshop and room tabs may be closed.',
      recorderQualityPolicy: 'Source quality up to 1080p, with 192 kbps audio when available. Private/secret/group/password shows are omitted; offline rooms stop and save after 10 minutes.',
      added: 'Added',
      exists: 'Already exists',
      addFailed: 'Failed',
      addedNamed: (n) => `${n} added`,
      removedNamed: (n) => `${n} removed`,
      quickAddTitle: 'Add to workstation',
      quickRemoveTitle: 'Already in workstation — click to remove',
      // ---- notifications ----
      notifyTitleText: 'Model online',
      notifyBody: (n) => `${n} just went live`,
      permDenied: 'Notification permission denied. Card flash still works.\n\nYou can enable it in browser settings.',
      // ---- batch add ----
      manualImport: 'Batch add',
      manualImportPrompt: 'Paste usernames, one per line or separated by spaces/commas:',
      importReviewCancel: 'Cancel',
      manualImportDone: (a, e) => `Batch add complete: ${a} new, ${e} already existed`,
      // ---- more menu ----
      moreMenu: 'More',
      moreMenuTitle: 'More',
      menuLanguage: 'Language',
      menuAbout: 'About',
      menuExport: 'Export config',
      menuExportUsernames: 'Export usernames.txt',
      menuCopyUsernames: 'Copy usernames',
      menuMuteAll: 'Mute all',
      menuUnmuteAll: 'Unmute all',
      menuPauseVisible: '⏸ Pause visible',
      menuResumeVisible: 'Resume visible',
      menuStopRecordings: 'Stop all recordings',
      menuRecordingSettings: 'Recording settings',
      menuRecordingCenter: 'Recording center',
      menuLayoutSettings: 'Layout settings',
      menuPlaybackSettings: 'Playback settings',
      menuBackupPanel: 'Config backups',
      menuStatusHistory: 'Status history',
      menuGroupRules: 'Group rules',
      menuTempUrlManager: 'Temporary URLs',
      menuShareWorkspace: 'Share workspace',
      menuShortcutPanel: 'Shortcut panel',
      menuPureMode: 'Clean mode',
      menuToggleThumbs: 'Toggle thumbnails',
      menuToggleFit: 'Toggle video fit',
      menuShortcutHelp: 'Shortcuts / hints',
      shortcutsHelp: 'Hover any button/control to see its hint. Common shortcuts can be edited in the shortcut panel.\n\nDefaults:\n/  Focus username input\nr  Refresh all\ng  Grid view\nf  Focus view\no  Open hovered/focused room\nAlt+P or Alt+C  Clean mode on/off\nAlt+Shift+C  Recording center\nAlt+Shift+R  Record visible models\nEsc  Exit clean mode / fullscreen\nSpace  Pause/resume the main screen in Focus view\n←/→ or [/ ]  Switch the main screen in Focus view\nDouble-click card  Fullscreen',
      pausedVisible: 'Visible windows paused',
      resumedVisible: 'Visible windows resumed',
      menuImport: 'Import config',
      menuRepairData: 'Repair saved data',
      repairDone: 'Saved data has been normalized.',
      menuClearAll: 'Clear all data',
      clearAllConfirm: 'This will erase ALL rooms, groups and settings. Continue?',
      langZh: '中文',
      langEn: 'English',
      // ---- about panel ----
      aboutTitle: 'About',
      aboutAuthor: 'Author',
      aboutVersion: 'Version',
      aboutLicense: 'License',
      aboutSource: 'Source',
      aboutDonate: 'If this script saves you time…',
      aboutDonateBtn: 'Tip in ETH',
      aboutDonateAddrLabel: 'ETH address',
      aboutCopyAddr: 'Copy',
      aboutCopied: 'Copied',
      aboutClose: 'Close',
    },
    zh: {
      title: 'Ziggy Room Suite',
      appTagline: '多房间、多画面、录制、提醒、截图、重连和数据维护的一体化工作台。',
      addPlaceholder: '输入用户名 ↵',
      searchPlaceholder: '搜索房间',
      invalidUsername: '用户名格式不对',
      hideOffline: '隐藏离线',
      hidePrivate: '隐藏私密',
      onlyOnline: '仅看在线',
      sortLabel: '排序',
      sortManual: '手动排序',
      sortStatus: '按状态',
      sortName: '按名称',
      sortFavoriteName: '收藏优先，再按名称',
      sortAdded: '按添加时间',
      refreshAll: '全部刷新',
      notifyOnline: '上线提醒',
      notifyFavoritesOnly: '仅提醒收藏的房间',
      startOnOnlineFavorites: '启动时打开在线收藏',
      startupSettings: '启动视图和分组',
      startupSettingsHint: '选择工作台打开时显示的布局和分组。更改会在下次打开工作台时生效。',
      startupViewLabel: '启动布局',
      startupGroupLabel: '启动分组',
      startupLastUsed: '上次使用',
      startupAutomatic: '根据设备自动选择',
      notifyTitle: '主播上线时桌面通知 + 卡片闪烁',
      collapseSidebar: '',
      viewGrid: '平铺',
      viewFocus: '主屏',
      viewPhone: '手机',
      viewSplit: '分屏',
      viewModeLabel: '视图',
      visibleRooms: '单屏可见主播',
      phoneAutoMode: '在手机上自动使用手机模式',
      moreOps: '更多',
      pureMode: '纯净',
      pureModeOn: '已进入纯净模式',
      pureModeOff: '退出纯净模式',
      pureModeHint: '暂时隐藏所有工具栏、按钮和覆盖层。快捷键：Alt+P / Alt+C；按 Esc 退出。',
      focusThumbsShow: '显示缩略图',
      focusThumbsHide: '隐藏缩略图',
      focusThumbsHint: '显示或隐藏主屏模式的缩略图栏。快捷键：Alt+T。',
      videoFitContain: '画面：完整显示',
      videoFitCover: '画面：填满窗口',
      videoFitHint: '在完整显示和裁切填满之间切换。',
      playbackSettingsTitle: '播放设置',
      maxStreamHeight: '最高画质',
      maxQualityAuto: '自动 / 不限制',
      freeZoomLabel: 'Ctrl/Command + 滚轮缩放',
      freeZoomHint: '按 Ctrl/Command 加滚轮缩放窗口；放大后拖动画面；双击恢复。',
      pureExitHint: '退出纯净模式。快捷键：Alt+P / Alt+C 或 Esc。',
      pureExitChip: '纯净 · Alt+P/C / Esc',
      syncedFromOtherTab: '（来自其它标签页同步）',
      hintAddInput: '输入用户名后按 Enter 添加。快捷键：/',
      hintSearchInput: '按用户名过滤当前可见房间',
      hintSidebarToggle: '显示 / 隐藏分组侧边栏',
      hintVolume: '全局音量。单房间静音仍然优先。',
      hintGridSize: '平铺模式下的基础窗口尺寸',
      hintSort: '当前分组内的房间排序方式',
      hintMainRatio: '主屏模式下主屏高度，也可以拖动分隔条调整。',
      hintMainAspect: '主屏模式下主屏宽高比',
      hintThumbSize: '主屏模式下缩略图宽度',
      hintGroupTab: (n) => `切换到「${n}」。也可以把房间拖到这里加入该分组。`,
      hintOnlineFavoritesTab: '显示当前在线的收藏房间。',
      hintLibraryTab: '显示所有已保存房间。在这个视图点移除会全局删除。',
      hintNewGroup: '创建一个互相独立的新分组',
      hintMoreMenu: '更多工具和维护功能',
      groupsHeading: '分组',
      quickViewsHeading: '快捷视图',
      myGroupsHeading: '我的分组',
      groupLibrary: '全部保存',
      groupAll: '默认',
      groupOnline: '在线',
      groupOnlineFav: '在线收藏',
      groupOnlineFollowing: '正在直播的关注',
      groupFav: '收藏',
      newGroup: '新建分组',
      newGroupPrompt: '新分组名称：',
      renameGroup: '重命名',
      renameGroupPrompt: '重命名为：',
      deleteGroup: '删除分组',
      deleteGroupConfirm: (n) => `删除分组「${n}」？房间仍会保留，只会从该分组移除。`,
      statTotal: '总计',
      statOnline: '在线',
      statMuted: '静音',
      opRefresh: '刷新',
      opMuteToggle: '静音切换',
      opPause: '暂停',
      opResume: '继续播放',
      opScreenshot: '截图当前画面',
      opRecordStart: '录制当前窗口',
      opRecordStop: '停止录制',
      opPiP: '画中画',
      opFullscreen: '全屏',
      opMoveGroup: '加入分组',
      opRemove: '移出当前分组',
      opDeleteRoom: '彻底删除房间',
      opMirror: '左右镜像',
      opFlip: '上下翻转',
      opRotateLeft: '向左旋转',
      opRotateRight: '向右旋转',
      opResetView: '重置画面',
      opOpenRoom: '打开房间',
      opCopyUsername: '复制用户名',
      opCopyRoomLink: '复制房间链接',
      opOpenRecu: '打开 Recu.me 资料页',
      modelNameBackgroundTab: '在后台标签页打开主播',
      opUnfollowAccount: '在 Chaturbate 取消关注',
      unfollowAccountConfirm: (n) => `确定要在 Chaturbate 取消关注 ${n} 吗？这会修改你的 Chaturbate 账号。`,
      unfollowAccountDone: (n) => `已在 Chaturbate 取消关注 ${n}`,
      unfollowAccountFailed: (n) => `无法取消关注 ${n}`,
      unfollowSignInRequired: '请先登录 Chaturbate 再取消关注房间',
      opFavoriteAdd: '加入收藏',
      opFavoriteRemove: '取消收藏',
      opMoveToFavorites: '仅移到收藏',
      opAddSplit: '加入分屏',
      splitView: '分屏模式',
      splitAddedFirst: (n) => `${n} 已加入窗格 1，请再选择一个主播。`,
      splitAlreadyAdded: '该主播已在分屏中',
      splitNeedTwo: '请先选择两个主播',
      splitChoosePane: '选择要替换的窗格',
      splitReplacePane: (n, name) => `替换窗格 ${n}：${name}`,
      splitPickerTitle: (n) => `为窗格 ${n} 选择主播`,
      splitPickerSearch: '搜索主播',
      splitQuickPreview: '快速预览',
      splitPreviewHint: '长按主播或使用预览按钮。',
      splitPreviewUse: (n) => `用于窗格 ${n}`,
      splitPreviewRefresh: '刷新预览',
      splitPreviewUnavailable: '预览不可用',
      splitPreviewClose: '关闭预览',
      splitOnlineFollowing: '在线关注',
      splitOnlineFavorites: '在线收藏',
      splitOnline: '在线',
      splitFavorites: '收藏',
      splitAllSaved: '全部保存',
      splitOtherPane: '已在另一个窗格',
      splitCurrentPane: '已在当前窗格',
      splitNoMatches: '没有匹配的主播',
      splitReplace: '替换',
      splitPrevOnline: '上一个在线主播',
      splitNextOnline: '下一个在线主播',
      splitNoOtherOnline: '没有其他在线主播',
      splitSwap: '交换窗格',
      splitExit: '退出分屏',
      splitFullscreen: '全屏',
      splitControlsPosition: '移动单手控制区',
      splitControlsTop: '顶部',
      splitControlsLowerLeft: '左下',
      splitControlsLowerRight: '右下',
      splitAudio: '使用此窗格的声音',
      splitPane: (n) => `窗格 ${n}`,
      splitDivider: '拖动调整窗格大小',
      copied: '已复制',
      screenshotSaved: '截图已保存',
      captureFailed: '截图失败。浏览器跨域/CORS 可能阻止绘制该视频流。',
      recordingConsent: '录制只保存在本地，会在浏览器允许时保存该视频及对应音频。请只在你有权保存该内容时使用。继续？',
      recordingStarted: '已开始录制',
      recordingSaved: '录制已保存',
      recordingUnsupported: '当前视频或浏览器不支持录制',
      recordingSegmentSaved: '录制分段已保存',
      recordingFinalSaved: '最后录制片段已保存',
      recordingPausedSource: '录制已暂停，等待视频恢复',
      recordingResumed: '录制已恢复',
      recordingWaiting: '录制暂停中，点击停止',
      recordingNoData: '没有可保存的录制数据',
      recordingSettingsSaved: '录制设置已保存',
      recordingSegmentPrompt: '分段时长，单位分钟（1-180）：',
      recordingBitratePrompt: '视频码率，单位 Mbps（0.5-20）：',
      recordingExitWarnToggle: '录制中离开页面前提醒',
      recordingExitWarnMessage: '仍有录制正在进行，确定离开吗？',
      recordingCenter: '录制管理中心',
      recordingCenterEmpty: '暂无正在录制的窗口',
      recordingActive: '录制中',
      recordingWaitingShort: '等待视频源',
      recordingSavedSegments: '已保存分段',
      recordingDuration: '时长',
      recordingBitrate: '码率',
      recordingFormatHint: '格式：浏览器支持时优先 MP4，否则使用当前浏览器可用的最佳格式。',
      recordingRecoverPrompt: (n) => `检测到上次有 ${n} 个房间的录制意图，是否继续等待视频并恢复录制？`,
      recordCurrentPage: '录制当前可见主播',
      recordCurrentGroup: '录制当前分组',
      recordOnlineRooms: '录制在线房间',
      stopAllRecordings: '停止所有录制',
      showRecordingOnly: '只看录制中',
      hideRecordingOnly: '显示全部房间',
      batchOpenCurrentPage: '打开当前可见主播',
      batchMoveCurrentPage: '移动当前可见主播到分组',
      layoutSettings: '布局设置',
      recordingSettingsTitle: '录制设置',
      saveSettings: '保存设置',
      backupPanel: '配置备份',
      noBackups: '没有配置备份',
      restoreBackup: '恢复',
      deleteBackup: '删除',
      statusHistory: '上线/离线历史',
      noStatusHistory: '暂无历史',
      groupRules: '分组规则',
      favoriteFirst: '收藏优先置顶',
      tempUrlManager: '临时 URL 管理',
      saveTempUrls: '保存当前临时 URL',
      noTempUrls: '暂无临时 URL',
      sharePanel: '分享工作台',
      shareCurrentWorkspace: '分享当前房间和布局',
      shareCopyLink: '复制分享链接',
      shareLinkHint: '这个链接会在另一个工作台标签页里恢复房间、分组和布局设置。',
      shareImportPrompt: (n) => `导入这个分享工作台中的 ${n} 个房间？当前配置会先自动备份。`,
      shareImported: '已导入分享工作台',
      shareInvalid: '分享链接无效',
      shortcutPanel: '快捷键',
      shortcutCaptureHint: '点击输入框后按新的快捷键。Backspace 可清空当前项。',
      resetShortcuts: '恢复默认快捷键',
      shortcutFocusAdd: '聚焦添加框',
      shortcutRefreshAll: '刷新全部',
      shortcutGridView: '平铺视图',
      shortcutFocusView: '主屏视图',
      shortcutPureMode: '纯净模式',
      shortcutFocusThumbs: '显示 / 隐藏缩略图',
      shortcutRecordingCenter: '录制管理中心',
      shortcutRecordPage: '录制当前可见主播',
      stOnline: '在线',
      stOffline: '离线',
      stPrivate: '私密',
      stLoading: '加载中',
      stError: '错误',
      stUnknown: '未知',
      lastSeen: (t) => `上次在线 ${t}`,
      autoDetect: '将自动检测上线',
      emptyTitle: '当前分组没有房间',
      emptyHint: '在顶部输入用户名添加，或切换分组 / 取消过滤',
      addRoom: (n) => `加入 ${n}`,
      alreadyAdded: (n) => ` ${n} 已在工作台`,
      openWorkstation: '打开工作台',
      memoryStat: (n) => `已记录 ${n} 个房间`,
      memoryView: '查看记忆列表',
      collapseFAB: '收起工具坞',
      dockAutoCollapse: '自动收起',
      dockAutoCollapseHint: '秒（0 = 关闭）',
      dockAutoCollapseSaved: (n) => n > 0 ? `工具坞将在 ${n} 秒后自动收起` : '已关闭工具坞自动收起',
      dockSubtitle: 'MultiCam 工具',
      dockCurrentRoom: (n) => `当前：${n}`,
      dockNoRoom: '未识别到房间',
      dockOpen: '打开工作台',
      dockAdd: '加入房间',
      dockRemove: '移除房间',
      dockFavoriteAdd: '加入收藏',
      dockFavoriteRemove: '移出收藏',
      dockRecord: '在工作台录制',
      dockPauseRecording: '暂停录制',
      dockResumeRecording: '继续录制',
      dockStopRecording: '停止并保存',
      dockScreenshot: '截图当前视频',
      dockPip: '画中画',
      dockPause: '播放 / 暂停',
      dockMute: '静音 / 取消',
      dockRecu: 'Recu.me 资料页',
      dockVideoMissing: '当前页没有找到可操作的视频',
      dockRecordQueued: '已把录制意图发送到工作台',
      recorderWaitingTime: '等待',
      recorderEstimatedSize: '大小',
      recorderOpenHub: '打开录制中心',
      recorderPause: '暂停',
      recorderResume: '继续',
      recorderPausedManual: '手动暂停',
      recorderStopped: '已停止',
      recorderStoppedNoData: '已停止 · 没有录到可保存的数据',
      recorderInterrupted: '已停止 · 录制中心已重新加载，无法恢复内存中的录制',
      recorderStopWaiting: '已请求停止 · 正在等待录制中心',
      recorderHubTitle: '录制中心',
      recorderHubSubtitle: '房间工具和工作台共用一个持续录制服务。',
      recorderRecording: '录制中',
      recorderPausedPrivate: '私密、秘密、群组或密码房间暂停',
      recorderPausedOffline: (time) => `离线 · ${time} 后停止`,
      recorderRetrying: '正在重连',
      recorderOpenRoom: '打开房间',
      recorderRetry: '重试',
      recorderHubCloseWarning: '仍有录制正在进行。关闭此标签页会停止录制。',
      recorderHubWarning: '录制时请保持这个标签页打开。工作台和房间标签页可以关闭。',
      recorderQualityPolicy: '优先使用最高 1080p 源画质，并在可用时录制 192 kbps 音频。私密、秘密、群组或密码房间会暂停；离线 10 分钟后停止并保存。',
      added: '已加入',
      exists: '已存在',
      addFailed: '失败',
      addedNamed: (n) => `${n} 已加入`,
      removedNamed: (n) => `${n} 已移除`,
      quickAddTitle: '加入工作台',
      quickRemoveTitle: '已在工作台 — 点击移除',
      notifyTitleText: '主播上线',
      notifyBody: (n) => `${n} 已开播`,
      permDenied: '未获得桌面通知权限，仅卡片闪烁会生效。\n\n你可以去浏览器设置里手动开启。',
      manualImport: '批量添加',
      manualImportPrompt: '粘贴用户名，支持一行一个，或用空格/逗号分隔：',
      importReviewCancel: '取消',
      manualImportDone: (a, e) => `批量添加完成：新增 ${a}，已存在 ${e}`,
      moreMenu: '更多',
      moreMenuTitle: '更多',
      menuLanguage: '语言',
      menuAbout: '关于',
      menuExport: '导出配置',
      menuExportUsernames: '导出用户名 txt',
      menuCopyUsernames: '复制用户名列表',
      menuMuteAll: '全部静音',
      menuUnmuteAll: '取消全部静音',
      menuPauseVisible: '⏸ 暂停可见窗口',
      menuResumeVisible: '继续可见窗口',
      menuStopRecordings: '停止所有录制',
      menuRecordingSettings: '录制设置',
      menuRecordingCenter: '录制管理中心',
      menuLayoutSettings: '布局设置',
      menuPlaybackSettings: '播放设置',
      menuBackupPanel: '配置备份',
      menuStatusHistory: '状态历史',
      menuGroupRules: '分组规则',
      menuTempUrlManager: '临时 URL',
      menuShareWorkspace: '分享工作台',
      menuShortcutPanel: '快捷键面板',
      menuPureMode: '纯净模式',
      menuToggleThumbs: '显示 / 隐藏缩略图',
      menuToggleFit: '切换画面适应',
      menuShortcutHelp: '快捷键 / 提示说明',
      shortcutsHelp: '鼠标停在任何按钮或控件上，会显示即时说明。常用快捷键可以在快捷键面板里修改。\n\n默认：\n/  聚焦用户名输入框\nr  全部刷新\ng  平铺视图\nf  主屏视图\nAlt+P 或 Alt+C  开关纯净模式\nAlt+Shift+C  录制管理中心\nAlt+Shift+R  录制当前页\nEsc  退出纯净模式 / 全屏\n空格  主屏模式下暂停/继续主屏\n←/→ 或 [/ ]  主屏模式下切换主屏\n双击窗口  全屏',
      pausedVisible: '已暂停可见窗口',
      resumedVisible: '已继续可见窗口',
      menuImport: '导入配置',
      menuRepairData: '修复保存数据',
      repairDone: '已完成保存数据规范化。',
      menuClearAll: '清空所有数据',
      clearAllConfirm: '将清空所有房间、分组和设置，确定继续？',
      langZh: '中文',
      langEn: 'English',
      aboutTitle: '关于',
      aboutAuthor: '作者',
      aboutVersion: '版本',
      aboutLicense: '协议',
      aboutSource: '源码',
      aboutDonate: '如果这个脚本帮你节省了时间…',
      aboutDonateBtn: '请作者一杯咖啡 (ETH)',
      aboutDonateAddrLabel: 'ETH 地址',
      aboutCopyAddr: '复制',
      aboutCopied: '已复制',
      aboutClose: '关闭',
    },
  };

  const LANG_KEY = 'multicam_lang';
  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && I18N[stored]) return stored;
    const browserLangs = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
      navigator.userLanguage,
    ].filter(Boolean).map(v => String(v).toLowerCase());
    const primary = browserLangs.find(v => v.startsWith('zh') || v.startsWith('en')) || '';
    if (primary.startsWith('zh')) return 'zh';
    return 'en';
  }
  let LANG = detectLang();
  const t = (key, ...args) => {
    const v = (I18N[LANG] && I18N[LANG][key]) ?? I18N.en[key] ?? key;
    return typeof v === 'function' ? v(...args) : v;
  };
  function setLang(lang) {
    if (!I18N[lang] || lang === LANG) return;
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
  }

  /* =============================================================
   * 0.6. 元数据 / Meta —— 关于 + 捐赠
   * ============================================================= */
  const META = {
    version: '16.5.30',
    author: 'Ziggy',
    license: 'MIT',
    source: 'https://github.com/linuxNoob620/chaturbate-userscripts',
    eth: '0x6ad5b8Baf993C1C377B81Fa277c5d8350e339D07',
  };

  /* =============================================================
   * 1. 持久化层 / Storage  ——  schema 版本号兜底
   * ============================================================= */
  const STORE_KEY = 'ryujo_multicam_v8';
  const CONFIG_BACKUP_PREFIX = STORE_KEY + '_backup_';
  const RECORDING_INTENT_KEY = STORE_KEY + '_recording_intents_v1';
  const ROOM_STATUS_HISTORY_KEY = STORE_KEY + '_status_history_v1';
  const SAVED_TEMP_URLS_KEY = STORE_KEY + '_saved_temp_urls_v1';
  const MAX_CONFIG_BYTES = 2 * 1024 * 1024;
  const MAX_CONFIG_BACKUPS = 3;
  const RELOADED_VERSION = '1.8.0';
  const MOBILE_CLEAN_VIEW_VERSION = '2.1.0';
  const MOBILE_CLEAN_VIEW_SETTINGS_KEY = 'cb_desktop_mobile_comfort_v1';
  const GITHUB_SYNC_CONFIG_KEY = 'chaturbate_suite_github_sync_v1';
  const GITHUB_SYNC_STATE_KEY = 'chaturbate_suite_github_sync_state_v1';
  const GITHUB_AUTO_IMPORT_LEASE_KEY = 'chaturbate_suite_github_auto_import_lease_v1';
  const GITHUB_SYNC_FORMAT = 'chaturbate-suite-settings-encrypted-v1';
  const GITHUB_SYNC_TARGET = Object.freeze({
    owner: 'linuxNoob620',
    repo: 'chaturbate-userscript-settings',
    branch: 'main',
    path: 'settings/latest.enc.json',
  });
  const GITHUB_API_VERSION = '2022-11-28';
  const GITHUB_PBKDF2_ITERATIONS = 250000;
  const GITHUB_AUTO_IMPORT_CHECK_MS = 5 * 60 * 1000;
  const RELOADED_SETTING_KEYS = Object.freeze([
    'animationoff', 'bigthumb', 'defaultVideoWidth', 'hidemt', 'hpfltopen',
    'ignoredusers', 'isTheaterMode', 'newtabon', 'pclean', 'recautosave',
    'recvp9', 'refreshoff', 'reloadedGlobalChatSettingsV1', 'smallsnap',
    'videoControls', 'zoomoff',
  ]);
  const INJECTOR_ROUTE_POLL_VISIBLE_MS = 1000;
  const INJECTOR_ROUTE_POLL_HIDDEN_MS = 5000;

  function readCookieSetting(name) {
    const prefix = encodeURIComponent(name) + '=';
    const part = String(document.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(prefix));
    if (!part) return null;
    try { return decodeURIComponent(part.slice(prefix.length)); } catch (_) { return part.slice(prefix.length); }
  }

  function writeCookieSetting(name, value) {
    const safe = String(value || '').trim();
    if (!/^[a-z0-9_-]{1,40}$/i.test(safe)) return false;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(safe)}; path=/; max-age=31536000; SameSite=Lax`;
    return true;
  }

  function captureReloadedSettings() {
    const storage = {};
    for (const key of RELOADED_SETTING_KEYS) {
      const value = localStorage.getItem(key);
      if (value !== null && value.length <= 262144) storage[key] = value;
    }
    return { version: RELOADED_VERSION, storage, themeName: readCookieSetting('theme_name') };
  }

  function restoreReloadedSettings(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
    const values = snapshot.storage && typeof snapshot.storage === 'object' && !Array.isArray(snapshot.storage)
      ? snapshot.storage
      : snapshot;
    for (const key of RELOADED_SETTING_KEYS) localStorage.removeItem(key);
    for (const key of RELOADED_SETTING_KEYS) {
      const value = values[key];
      if (typeof value === 'string' && value.length <= 262144) localStorage.setItem(key, value);
    }
    if (typeof snapshot.themeName === 'string') writeCookieSetting('theme_name', snapshot.themeName);
    return true;
  }

  function sanitizeMobileCleanViewSettings(snapshot) {
    const source = snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)
      ? (snapshot.settings && typeof snapshot.settings === 'object' ? snapshot.settings : snapshot)
      : {};
    return {
      enabled: source.enabled !== false,
      hidePromos: source.hidePromos !== false,
      compactBrowse: source.compactBrowse !== false,
      portraitColumns: clampInt(source.portraitColumns, 1, 3, 2),
      landscapeColumns: clampInt(source.landscapeColumns, 2, 5, 4),
      autoHideSeconds: clampInt(source.autoHideSeconds, 0, 30, 5),
      side: source.side === 'left' || source.handedness === 'left' ? 'left' : 'right',
      portraitFullscreenMode: source.portraitFullscreenMode === 'fit' ? 'fit' : 'fill',
      landscapeFullscreenMode: source.landscapeFullscreenMode === 'fill' ? 'fill' : 'fit',
    };
  }

  function captureMobileCleanViewSettings() {
    let parsed = {};
    try { parsed = JSON.parse(localStorage.getItem(MOBILE_CLEAN_VIEW_SETTINGS_KEY) || '{}'); } catch (_) {}
    return { version: MOBILE_CLEAN_VIEW_VERSION, settings: sanitizeMobileCleanViewSettings(parsed) };
  }

  function restoreMobileCleanViewSettings(snapshot) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return false;
    const settings = sanitizeMobileCleanViewSettings(snapshot);
    localStorage.setItem(MOBILE_CLEAN_VIEW_SETTINGS_KEY, JSON.stringify(settings));
    document.dispatchEvent(new CustomEvent('ziggy-mobile-clean-view:import-settings', { detail: settings }));
    return true;
  }

  const defaultState = () => ({
    v: 8,
    rooms: [],   // {id, addedAt, group, order, lastStatus, lastSeenOnline, muted, notes}
    groups: [
      { id: LIBRARY_GROUP_ID, name: '__library__', order: 0, system: true },
      { id: DEFAULT_GROUP_ID, name: '__all__', order: 1, system: true },
      { id: ONLINE_FAVORITES_GROUP_ID, name: '__online_favorites__', order: 2, system: true },
      { id: ONLINE_FOLLOWING_GROUP_ID, name: '__online_following__', order: 3, system: true },
      { id: ONLINE_GROUP_ID, name: '__online__', order: 4, system: true },
      { id: FAVORITE_GROUP_ID, name: '__fav__', order: 5, system: true },
    ],
    settings: {
      volume: 0,
      gridSize: 400,
      gridCellSize: 80,
      layoutSize: 4,             // one screen capacity: 2 | 4 | 6 | 9
      phoneLayoutSize: 2,        // phone capacity: portrait 1x2, landscape 2x1
      pageIndex: 0,
      onlineFollowingPageIndex: 0,
      toolbarCollapsed: false,
      viewMode: 'grid',           // 'grid' | 'focus' | 'phone'
      phoneModeAuto: true,
      splitRoomIds: [],
      splitViewActive: false,
      splitRatio: 50,
      splitAudioRoomId: null,
      splitToolbarPosition: 'top',
      focusedRoomId: null,
      focusMainPct: 62,           // main screen width ratio in focus mode
      focusMainHPct: 64,          // main screen height ratio in focus mode
      focusAspect: 'auto',
      focusThumbSize: 150,
      filter: { hideOffline: false, hidePrivate: false, onlyOnline: false },
      sortBy: 'manual',
      notifyOnline: true,
      notifyFavoritesOnly: true,
      startOnOnlineFavorites: false,
      startupView: 'last',        // 'last' | 'auto' | 'grid' | 'focus' | 'phone'
      startupGroup: 'last',       // 'last' or a valid group id
      __startupGroupDefaultMigratedV1657: true,
      activeGroup: 'all',
      searchQuery: '',
      pureMode: false,
      focusThumbsCollapsed: false,
      videoFit: 'contain',
      freeZoom: true,
      maxStreamHeight: 1080,
      videoTransforms: {},
      showRecordingOnly: false,
      favoriteFirst: true,
      shortcuts: defaultShortcuts(),
      recordingSegmentMinutes: 10,
      recordingVideoBitrate: 6000000,
      recordingExitWarn: true,
      dockAutoCollapseSeconds: 5,
      pollMs: { offline: 60000, private: 30000, error: 10000, online: 120000 },
      sidebarCollapsed: false,
    },
  });


  function ensureSystemGroups(state) {
    if (!state || typeof state !== 'object') return state;
    state.groups = Array.isArray(state.groups) ? state.groups : [];
    const wanted = [
      { id: LIBRARY_GROUP_ID, name: '__library__', order: 0, system: true },
      { id: DEFAULT_GROUP_ID, name: '__all__', order: 1, system: true },
      { id: ONLINE_FAVORITES_GROUP_ID, name: '__online_favorites__', order: 2, system: true },
      { id: ONLINE_FOLLOWING_GROUP_ID, name: '__online_following__', order: 3, system: true },
      { id: ONLINE_GROUP_ID, name: '__online__', order: 4, system: true },
      { id: FAVORITE_GROUP_ID, name: '__fav__', order: 5, system: true },
    ];
    for (const g of wanted) {
      const found = state.groups.find(x => x.id === g.id);
      if (!found) state.groups.push({ ...g });
      else { found.name = g.name; found.system = true; found.order = g.order; }
    }
    state.groups.sort((a, b) => numeric(a.order, 999) - numeric(b.order, 999));
    return state;
  }

  /* =============================================================
   * 1.1. 分组成员关系 / Group membership
   * v12 模型：所有显示分组都是独立成员关系；library 是唯一聚合管理视图。
   * 在普通分组点 X 只移出当前分组；在 library 点 X 才彻底删除。
   * ============================================================= */
  function uniq(arr) { return [...new Set((arr || []).filter(Boolean))]; }
  function numeric(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
  function clampInt(v, min, max, fallback = min) {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }
  function normalizeCardSize(size) {
    if (!size || typeof size !== 'object') return null;
    const cols = clampInt(size.cols ?? size.columns ?? size.w, 3, 18, 0);
    const rows = clampInt(size.rows ?? size.h, 3, 18, 0);
    if (!cols || !rows) return null;
    return { cols, rows };
  }
  function normalizeCardSizeMap(map) {
    const out = {};
    if (map && typeof map === 'object' && !Array.isArray(map)) {
      for (const [k, v] of Object.entries(map)) {
        const key = String(k || '').trim() || 'all';
        const size = normalizeCardSize(v);
        if (size) out[key] = size;
      }
    }
    return out;
  }
  function setCardSizeForGroup(room, groupId, size) {
    if (!room) return;
    const key = String(groupId || 'all');
    const next = normalizeCardSize(size);
    const map = normalizeCardSizeMap(room.cardSizeByGroup);
    if (next) map[key] = next;
    else delete map[key];
    room.cardSizeByGroup = map;
    delete room.cardSize;
    if (!Object.keys(room.cardSizeByGroup).length) delete room.cardSizeByGroup;
  }
  function getRoomGroups(room) {
    const groups = Array.isArray(room?.groups) ? room.groups.slice() : [];
    if (room?.group) groups.push(room.group);
    // v12: all/default is a real group; only library is an aggregate view and is never stored as membership.
    return uniq(groups.filter(g => g && g !== LIBRARY_GROUP_ID && g !== ONLINE_GROUP_ID && g !== ONLINE_FAVORITES_GROUP_ID && g !== ONLINE_FOLLOWING_GROUP_ID));
  }
  function normalizeRoom(room, fallbackOrder = 0) {
    const r = room && typeof room === 'object' ? room : { id: String(room || '') };
    r.id = normalizeUsername(r.id);
    r.groups = getRoomGroups(r);
    r.group = r.groups[0] || null;
    r.addedAt = numeric(r.addedAt, Date.now());
    r.order = numeric(r.order, fallbackOrder);
    if (!r.groupOrder || typeof r.groupOrder !== 'object' || Array.isArray(r.groupOrder)) r.groupOrder = {};
    for (const g of r.groups) r.groupOrder[g] = numeric(r.groupOrder[g], r.order);
    if (!r.lastStatus) r.lastStatus = 'unknown';
    r.lastSeenOnline = numeric(r.lastSeenOnline, 0);
    r.muted = !!r.muted;
    const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
    const legacyCardSize = normalizeCardSize(r.cardSize);
    if (legacyCardSize && !sizeMap.all) sizeMap.all = legacyCardSize;
    if (Object.keys(sizeMap).length) r.cardSizeByGroup = sizeMap;
    else delete r.cardSizeByGroup;
    delete r.cardSize;
    return r;
  }
  function normalizeStateMemberships(state) {
    if (!state || typeof state !== 'object') return state;
    state.rooms = Array.isArray(state.rooms) ? state.rooms : [];
    const merged = new Map();
    state.rooms.forEach((room, idx) => {
      const r = normalizeRoom(room, idx);
      if (!r.id) return;
      const prev = merged.get(r.id);
      if (!prev) { merged.set(r.id, r); return; }
      const groups = uniq([...getRoomGroups(prev), ...getRoomGroups(r)]);
      prev.groups = groups;
      prev.group = groups[0] || null;
      prev.groupOrder = { ...(r.groupOrder || {}), ...(prev.groupOrder || {}) };
      for (const g of groups) prev.groupOrder[g] = numeric(prev.groupOrder[g], prev.order);
      prev.order = Math.min(numeric(prev.order, idx), numeric(r.order, idx));
      const mergedSizeMap = { ...(r.cardSizeByGroup || {}), ...(prev.cardSizeByGroup || {}) };
      if (Object.keys(mergedSizeMap).length) prev.cardSizeByGroup = normalizeCardSizeMap(mergedSizeMap);
      else delete prev.cardSizeByGroup;
      delete prev.cardSize;
      prev.addedAt = Math.min(numeric(prev.addedAt, Date.now()), numeric(r.addedAt, Date.now()));
      if (r.lastStatus && r.lastStatus !== 'unknown') prev.lastStatus = r.lastStatus;
      if (r.lastSeenOnline) prev.lastSeenOnline = Math.max(numeric(prev.lastSeenOnline, 0), numeric(r.lastSeenOnline, 0));
      prev.muted = !!(prev.muted || r.muted);
    });
    state.rooms = [...merged.values()];
    return state;
  }
  // Runtime-only Workshop rooms (currently Online Following) can participate
  // in Split View without being copied into the user's saved-room library.
  // The resolver remains false during initial state loading, so stale temporary
  // selections are safely discarded after a full page reload.
  let runtimeSplitRoomAvailable = () => false;
  function reconcileSplitState(state) {
    if (!state?.settings) return state;
    const validIds = new Set((state.rooms || []).map(room => normalizeUsername(room?.id)).filter(isLikelyUsername));
    const splitIds = uniq((Array.isArray(state.settings.splitRoomIds) ? state.settings.splitRoomIds : [])
      .map(normalizeUsername)
      .filter(id => validIds.has(id) || runtimeSplitRoomAvailable(id)))
      .slice(0, 2);
    state.settings.splitRoomIds = splitIds;
    state.settings.splitRatio = clampInt(state.settings.splitRatio, 20, 80, 50);
    if (!['top', 'lower-left', 'lower-right'].includes(state.settings.splitToolbarPosition)) state.settings.splitToolbarPosition = 'top';
    state.settings.splitViewActive = !!state.settings.splitViewActive && splitIds.length === 2;
    const audioId = normalizeUsername(state.settings.splitAudioRoomId || '');
    state.settings.splitAudioRoomId = splitIds.includes(audioId) ? audioId : (splitIds[0] || null);
    return state;
  }
  function sanitizeState(input) {
    const def = defaultState();
    const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const out = { ...def, v: numeric(src.v, def.v) };

    const rawGroups = Array.isArray(src.groups) ? src.groups.slice(0, 80) : def.groups;
    const seenGroups = new Set();
    out.groups = [];
    rawGroups.forEach((g, idx) => {
      if (!g || typeof g !== 'object') return;
      let id = String(g.id || '').trim();
      if (!id || !/^[a-z0-9_-]{1,48}$/i.test(id)) id = uuid();
      if (seenGroups.has(id)) return;
      seenGroups.add(id);
      let name = safeGroupName(g.name, id);
      if (!name) name = id;
      out.groups.push({
        id, name,
        order: clampInt(g.order, 0, 10000, idx),
        system: !!g.system && [LIBRARY_GROUP_ID, DEFAULT_GROUP_ID, ONLINE_GROUP_ID, ONLINE_FAVORITES_GROUP_ID, ONLINE_FOLLOWING_GROUP_ID, FAVORITE_GROUP_ID].includes(id),
      });
    });
    ensureSystemGroups(out);
    const validGroupIds = new Set(out.groups.map(g => g.id).filter(id => id !== LIBRARY_GROUP_ID && id !== ONLINE_GROUP_ID && id !== ONLINE_FAVORITES_GROUP_ID && id !== ONLINE_FOLLOWING_GROUP_ID));

    const allowedStatus = new Set(['online', 'offline', 'private', 'loading', 'error', 'unknown']);
    const rawRooms = Array.isArray(src.rooms) ? src.rooms.slice(0, 1200) : [];
    out.rooms = rawRooms.map((room, idx) => {
      const r = normalizeRoom(room, idx);
      if (!isLikelyUsername(r.id)) return null;
      const groups = getRoomGroups(r).filter(g => validGroupIds.has(g));
      const safe = {
        id: r.id,
        addedAt: Math.max(0, numeric(r.addedAt, Date.now())),
        group: groups[0] || null,
        groups,
        groupOrder: {},
        order: clampInt(r.order, 0, 1000000, idx),
        lastStatus: allowedStatus.has(r.lastStatus) ? r.lastStatus : 'unknown',
        lastSeenOnline: Math.max(0, numeric(r.lastSeenOnline, 0)),
        muted: !!r.muted,
      };
      if (r.privateLabel) safe.privateLabel = String(r.privateLabel).slice(0, 40);
      if (r.errorMsg) safe.errorMsg = String(r.errorMsg).slice(0, 120);
      for (const g of groups) safe.groupOrder[g] = clampInt(r.groupOrder?.[g], 0, 1000000, safe.order);
      const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
      if (Object.keys(sizeMap).length) safe.cardSizeByGroup = sizeMap;
      return safe;
    }).filter(Boolean);
    normalizeStateMemberships(out);

    const st = src.settings && typeof src.settings === 'object' && !Array.isArray(src.settings) ? src.settings : {};
    out.settings = { ...def.settings, ...st };
    const allowedSettingKeys = new Set([...Object.keys(def.settings), '__focusAutoMigratedV12']);
    for (const key of Object.keys(out.settings)) {
      if (!allowedSettingKeys.has(key)) delete out.settings[key];
    }
    out.settings.filter = { ...def.settings.filter, ...(st.filter && typeof st.filter === 'object' ? st.filter : {}) };
    out.settings.filter.hideOffline = !!out.settings.filter.hideOffline;
    out.settings.filter.hidePrivate = !!out.settings.filter.hidePrivate;
    out.settings.filter.onlyOnline = !!out.settings.filter.onlyOnline;
    out.settings.volume = Math.max(0, Math.min(1, Number(out.settings.volume) || 0));
    out.settings.gridSize = clampInt(out.settings.gridSize, 220, 900, def.settings.gridSize);
    out.settings.gridCellSize = clampInt(out.settings.gridCellSize, 56, 120, def.settings.gridCellSize);
    out.settings.layoutSize = [2, 4, 6, 9].includes(Number(out.settings.layoutSize)) ? Number(out.settings.layoutSize) : def.settings.layoutSize;
    out.settings.phoneLayoutSize = [2, 4, 6, 9].includes(Number(out.settings.phoneLayoutSize)) ? Number(out.settings.phoneLayoutSize) : def.settings.phoneLayoutSize;
    out.settings.pageIndex = clampInt(out.settings.pageIndex, 0, 100000, 0);
    out.settings.onlineFollowingPageIndex = clampInt(out.settings.onlineFollowingPageIndex, 0, 100000, 0);
    out.settings.viewMode = ['grid', 'focus', 'phone'].includes(out.settings.viewMode) ? out.settings.viewMode : 'grid';
    out.settings.phoneModeAuto = out.settings.phoneModeAuto !== false;
    out.settings.focusedRoomId = isLikelyUsername(out.settings.focusedRoomId) ? normalizeUsername(out.settings.focusedRoomId) : null;
    out.settings.focusMainPct = clampInt(out.settings.focusMainPct, 45, 76, def.settings.focusMainPct);
    out.settings.focusMainHPct = clampInt(out.settings.focusMainHPct, 44, 78, def.settings.focusMainHPct);
    out.settings.focusAspect = ['auto', '16:9', '4:3', '1:1', '9:16'].includes(out.settings.focusAspect) ? out.settings.focusAspect : 'auto';
    out.settings.focusThumbSize = clampInt(out.settings.focusThumbSize, 96, 260, def.settings.focusThumbSize);
    out.settings.sortBy = ['manual', 'status', 'name', 'favoriteName', 'addedAt'].includes(out.settings.sortBy) ? out.settings.sortBy : 'manual';
    out.settings.activeGroup = out.groups.some(g => g.id === out.settings.activeGroup) ? out.settings.activeGroup : DEFAULT_GROUP_ID;
    out.settings.searchQuery = normalizeUsername(out.settings.searchQuery || '');
    out.settings.pureMode = false;
    out.settings.focusThumbsCollapsed = !!out.settings.focusThumbsCollapsed;
    out.settings.videoFit = out.settings.videoFit === 'cover' ? 'cover' : 'contain';
    out.settings.freeZoom = out.settings.freeZoom !== false;
    out.settings.maxStreamHeight = [0, 240, 360, 480, 720, 1080, 1440, 2160].includes(Number(out.settings.maxStreamHeight)) ? Number(out.settings.maxStreamHeight) : def.settings.maxStreamHeight;
    out.settings.videoTransforms = sanitizeVideoTransformMap(st.videoTransforms);
    out.settings.showRecordingOnly = !!out.settings.showRecordingOnly;
    out.settings.favoriteFirst = out.settings.favoriteFirst !== false;
    out.settings.shortcuts = sanitizeShortcuts(st.shortcuts, def.settings.shortcuts);
    out.settings.recordingSegmentMinutes = clampInt(out.settings.recordingSegmentMinutes, 1, 180, def.settings.recordingSegmentMinutes);
    out.settings.recordingVideoBitrate = clampInt(out.settings.recordingVideoBitrate, 500000, 20000000, def.settings.recordingVideoBitrate);
    out.settings.recordingExitWarn = out.settings.recordingExitWarn !== false;
    out.settings.dockAutoCollapseSeconds = clampInt(out.settings.dockAutoCollapseSeconds, 0, 600, def.settings.dockAutoCollapseSeconds);
    out.settings.toolbarCollapsed = !!out.settings.toolbarCollapsed;
    out.settings.sidebarCollapsed = !!out.settings.sidebarCollapsed;
    out.settings.notifyOnline = out.settings.notifyOnline !== false;
    out.settings.notifyFavoritesOnly = out.settings.notifyFavoritesOnly !== false;
    out.settings.startupView = ['last', 'auto', 'grid', 'focus', 'phone'].includes(st.startupView)
      ? st.startupView
      : def.settings.startupView;
    const legacyStartupGroup = st.startOnOnlineFavorites === true ? ONLINE_FAVORITES_GROUP_ID : 'last';
    let requestedStartupGroup = Object.prototype.hasOwnProperty.call(st, 'startupGroup') ? String(st.startupGroup || '') : legacyStartupGroup;
    // 16.5.6 and earlier silently made Online Favorites the default. Migrate
    // that inherited value once; later explicit choices remain untouched.
    if (st.__startupGroupDefaultMigratedV1657 !== true
      && requestedStartupGroup === ONLINE_FAVORITES_GROUP_ID
      && st.startOnOnlineFavorites !== false) requestedStartupGroup = 'last';
    out.settings.startupGroup = requestedStartupGroup === 'last' || out.groups.some(g => g.id === requestedStartupGroup)
      ? requestedStartupGroup
      : 'last';
    out.settings.startOnOnlineFavorites = out.settings.startupGroup === ONLINE_FAVORITES_GROUP_ID;
    out.settings.__startupGroupDefaultMigratedV1657 = true;
    reconcileSplitState(out);
    out.settings.pollMs = { ...def.settings.pollMs, ...(st.pollMs && typeof st.pollMs === 'object' ? st.pollMs : {}) };
    for (const [k, fallback] of Object.entries(def.settings.pollMs)) {
      out.settings.pollMs[k] = clampInt(out.settings.pollMs[k], 5000, 300000, fallback);
    }
    return out;
  }

  function roomInGroup(room, groupId) {
    if (groupId === LIBRARY_GROUP_ID) return true;
    if (groupId === ONLINE_GROUP_ID) return room?.lastStatus === 'online';
    if (groupId === ONLINE_FAVORITES_GROUP_ID) return room?.lastStatus === 'online' && getRoomGroups(room).includes(FAVORITE_GROUP_ID);
    // Chaturbate's Online Rooms following page also contains broadcasters who
    // are presently private/hidden. They remain in this live virtual group but
    // are rendered with their protected status and no preview stream.
    if (groupId === ONLINE_FOLLOWING_GROUP_ID) return room?.onlineFollowing === true && room?.lastStatus !== 'offline';
    return getRoomGroups(room).includes(groupId || DEFAULT_GROUP_ID);
  }
  function roomOrderInGroup(room, groupId) {
    if (groupId === LIBRARY_GROUP_ID || groupId === DEFAULT_GROUP_ID || groupId === ONLINE_GROUP_ID) return numeric(room?.order, 0);
    if (groupId === ONLINE_FAVORITES_GROUP_ID) return numeric(room?.groupOrder?.[FAVORITE_GROUP_ID], numeric(room?.order, 0));
    return numeric(room?.groupOrder?.[groupId], numeric(room?.order, 0));
  }
  function nextOrderForGroup(state, groupId) {
    const list = groupId === LIBRARY_GROUP_ID ? state.rooms : state.rooms.filter(r => roomInGroup(r, groupId));
    return Math.max(-1, ...list.map(r => roomOrderInGroup(r, groupId))) + 1;
  }
  function ensureRoomInGroup(room, groupId, order) {
    normalizeRoom(room);
    if (!groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID || groupId === ONLINE_FOLLOWING_GROUP_ID) return false;
    const groups = getRoomGroups(room);
    const existed = groups.includes(groupId);
    if (!existed) groups.push(groupId);
    room.groups = uniq(groups);
    room.group = room.groups[0] || null;
    if (!room.groupOrder || typeof room.groupOrder !== 'object' || Array.isArray(room.groupOrder)) room.groupOrder = {};
    if (!existed || !Number.isFinite(Number(room.groupOrder[groupId]))) room.groupOrder[groupId] = numeric(order, room.order);
    return !existed;
  }
  function removeRoomFromGroup(room, groupId) {
    if (!room || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID || groupId === ONLINE_FOLLOWING_GROUP_ID) return false;
    const before = getRoomGroups(room);
    const after = before.filter(g => g !== groupId);
    if (after.length === before.length) return false;
    room.groups = after;
    room.group = after[0] || null;
    if (room.groupOrder && typeof room.groupOrder === 'object') delete room.groupOrder[groupId];
    return true;
  }

  function pruneConfigBackups(max = MAX_CONFIG_BACKUPS) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CONFIG_BACKUP_PREFIX)) keys.push(key);
      }
      keys.sort((a, b) => Number(b.slice(CONFIG_BACKUP_PREFIX.length)) - Number(a.slice(CONFIG_BACKUP_PREFIX.length)));
      keys.slice(Math.max(0, max)).forEach(key => { try { localStorage.removeItem(key); } catch (_) {} });
    } catch (_) {}
  }

  function backupCurrentConfig() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      pruneConfigBackups(MAX_CONFIG_BACKUPS - 1);
      localStorage.setItem(CONFIG_BACKUP_PREFIX + Date.now(), raw);
      pruneConfigBackups(MAX_CONFIG_BACKUPS);
      return true;
    } catch (_) {
      try { pruneConfigBackups(1); } catch (_) {}
      return false;
    }
  }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function loadRecordingIntents() {
    const ids = readJsonStorage(RECORDING_INTENT_KEY, []);
    return Array.isArray(ids) ? [...new Set(ids.map(normalizeUsername).filter(isLikelyUsername))] : [];
  }

  function saveRecordingIntents(ids) {
    writeJsonStorage(RECORDING_INTENT_KEY, [...new Set((ids || []).map(normalizeUsername).filter(isLikelyUsername))]);
  }

  function setRecordingIntent(id, on) {
    id = normalizeUsername(id);
    if (!isLikelyUsername(id)) return;
    const ids = new Set(loadRecordingIntents());
    if (on) ids.add(id);
    else ids.delete(id);
    saveRecordingIntents([...ids]);
  }

  function addRoomStatusHistory(id, status, extra = {}) {
    id = normalizeUsername(id);
    if (!isLikelyUsername(id) || !isStableRoomStatus(status)) return;
    const all = readJsonStorage(ROOM_STATUS_HISTORY_KEY, {});
    const list = Array.isArray(all[id]) ? all[id] : [];
    const last = list[0];
    if (last && last.status === status && Date.now() - Number(last.ts || 0) < 30000) return;
    list.unshift({
      ts: Date.now(),
      status,
      privateLabel: extra.privateLabel ? String(extra.privateLabel).slice(0, 40) : '',
    });
    all[id] = list.slice(0, 80);
    writeJsonStorage(ROOM_STATUS_HISTORY_KEY, all);
  }

  function loadRoomStatusHistory() {
    const all = readJsonStorage(ROOM_STATUS_HISTORY_KEY, {});
    return all && typeof all === 'object' && !Array.isArray(all) ? all : {};
  }

  function writeStoreRaw(json) {
    try {
      localStorage.setItem(STORE_KEY, json);
      pruneConfigBackups(MAX_CONFIG_BACKUPS);
      return true;
    } catch (e) {
      pruneConfigBackups(0);
      localStorage.setItem(STORE_KEY, json);
      return true;
    }
  }

  const Storage = {
    load() {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const s = sanitizeState(JSON.parse(raw));
          if (!s.settings.__focusAutoMigratedV12) { s.settings.focusAspect = 'auto'; s.settings.__focusAutoMigratedV12 = true; }
          return s;
        }
        return defaultState();
      } catch (e) {
        console.warn('[RoomGrid] Storage load failed, fallback to default', e);
        return defaultState();
      }
    },
    save(state) {
      try {
        const clean = sanitizeState(state);
        writeStoreRaw(JSON.stringify(clean));
        // localStorage 的 storage 事件不会在当前页面触发；补一个同页事件，
        // 让同标签页 SPA 切换主播 / QuickAdd 状态也能立即刷新。
        try { window.dispatchEvent(new CustomEvent('ryujo_multicam_storage', { detail: { state: clean } })); } catch (_) {}
      }
      catch (e) { console.warn('[RoomGrid] Storage save failed', e); }
    },
    clearAll() {
      try {
        localStorage.removeItem(STORE_KEY);
        try { window.dispatchEvent(new CustomEvent('ryujo_multicam_storage', { detail: { state: null } })); } catch (_) {}
      } catch (_) {}
    },
    has(id) {
      id = normalizeUsername(id);
      try { return !!this.load().rooms.find(r => r.id === id); } catch (_) { return false; }
    },
    add(id) {
      id = normalizeUsername(id);
      if (!isLikelyUsername(id)) return 'failed';
      const s = this.load();
      if (s.rooms.find(r => r.id === id)) return 'exists';
      const order = nextOrderForGroup(s, DEFAULT_GROUP_ID);
      s.rooms.push(normalizeRoom({
        id, addedAt: Date.now(), group: DEFAULT_GROUP_ID, groups: [DEFAULT_GROUP_ID], groupOrder: {},
        order, lastStatus: 'unknown', lastSeenOnline: 0, muted: false,
      }, order));
      this.save(s);
      void queueGithubSettingsAutoExport(`added room ${id}`);
      return 'added';
    },
    remove(id) {
      id = normalizeUsername(id);
      const s = this.load();
      const before = s.rooms.length;
      s.rooms = s.rooms.filter(r => r.id !== id);
      if (s.rooms.length !== before) { this.save(s); return true; }
      return false;
    },
  };

  function buildSuiteSettingsPayload(multicamState = Storage.load()) {
    const cleanState = sanitizeState(multicamState || Storage.load());
    const multicamSettings = {
      ...cleanState.settings,
      pageIndex: 0,
      focusedRoomId: null,
      searchQuery: '',
      pureMode: false,
      showRecordingOnly: false,
    };
    return {
      format: 'chaturbate-suite-settings-v4',
      exportedAt: new Date().toISOString(),
      scriptVersion: META.version,
      components: {
        multicamPro: {
          version: META.version,
          importMode: 'replace-library',
          settings: multicamSettings,
          rooms: cleanState.rooms,
          groups: cleanState.groups,
        },
        reloaded: captureReloadedSettings(),
        mobileCleanView: captureMobileCleanViewSettings(),
      },
    };
  }

  function exportSuiteSettingsLocal(multicamState = Storage.load()) {
    const payload = buildSuiteSettingsPayload(multicamState);
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      `chaturbate-suite-settings-${Date.now()}.json`,
    );
  }

  let githubSessionPassphrase = '';
  const githubAutoImportOwner = `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  function loadGithubSyncState() {
    const parsed = readJsonStorage(GITHUB_SYNC_STATE_KEY, {});
    return {
      lastAppliedRemoteAt: Math.max(0, numeric(parsed?.lastAppliedRemoteAt, 0)),
      lastAppliedSha: typeof parsed?.lastAppliedSha === 'string' ? parsed.lastAppliedSha : '',
      localChangedAt: Math.max(0, numeric(parsed?.localChangedAt, 0)),
      lastSnapshotFingerprint: typeof parsed?.lastSnapshotFingerprint === 'string' ? parsed.lastSnapshotFingerprint : '',
      lastCheckedAt: Math.max(0, numeric(parsed?.lastCheckedAt, 0)),
    };
  }

  function saveGithubSyncState(next) {
    writeJsonStorage(GITHUB_SYNC_STATE_KEY, {
      ...loadGithubSyncState(),
      ...(next && typeof next === 'object' ? next : {}),
    });
  }

  function githubPayloadFingerprintSource(payload) {
    const multicam = payload?.components?.multicamPro || {};
    return {
      multicamPro: {
        settings: multicam.settings || {},
        rooms: (Array.isArray(multicam.rooms) ? multicam.rooms : []).map(room => ({
          id: room.id,
          addedAt: room.addedAt,
          group: room.group,
          groups: room.groups,
          groupOrder: room.groupOrder,
          order: room.order,
          muted: room.muted,
          notes: room.notes || '',
        })),
        groups: Array.isArray(multicam.groups) ? multicam.groups : [],
      },
      reloaded: payload?.components?.reloaded || {},
      mobileCleanView: payload?.components?.mobileCleanView || {},
    };
  }

  async function githubPayloadFingerprint(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(githubPayloadFingerprintSource(payload)));
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return [...digest].map(value => value.toString(16).padStart(2, '0')).join('');
  }

  function githubSettingsFingerprint(multicamState = Storage.load()) {
    return githubPayloadFingerprint(buildSuiteSettingsPayload(multicamState));
  }

  function githubRemoteTimestamp(downloaded) {
    const value = downloaded?.payload?.exportedAt || downloaded?.envelope?.encryptedAt || '';
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async function recordGithubSyncBaseline(downloaded, multicamState = Storage.load()) {
    const fingerprint = await githubSettingsFingerprint(multicamState);
    const remoteAt = githubRemoteTimestamp(downloaded);
    saveGithubSyncState({
      lastAppliedRemoteAt: remoteAt,
      lastAppliedSha: downloaded?.sha || '',
      localChangedAt: 0,
      lastSnapshotFingerprint: fingerprint,
      lastCheckedAt: Date.now(),
    });
  }

  function defaultGithubDeviceName() {
    const mobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');
    const platform = navigator.userAgentData?.platform || navigator.platform || '';
    return mobile ? `Phone${platform ? ` (${platform})` : ''}` : `PC${platform ? ` (${platform})` : ''}`;
  }

  function loadGithubSyncConfig() {
    let parsed = {};
    try {
      const raw = typeof GM_getValue === 'function' ? GM_getValue(GITHUB_SYNC_CONFIG_KEY, '') : '';
      if (typeof raw === 'string' && raw) parsed = JSON.parse(raw);
      else if (raw && typeof raw === 'object') parsed = raw;
    } catch (_) {}
    return {
      ...GITHUB_SYNC_TARGET,
      token: typeof parsed.token === 'string' ? parsed.token.trim() : '',
      deviceName: typeof parsed.deviceName === 'string' && parsed.deviceName.trim()
        ? parsed.deviceName.trim().slice(0, 80)
        : defaultGithubDeviceName(),
      rememberPassphrase: parsed.rememberPassphrase !== false,
      passphrase: typeof parsed.passphrase === 'string' ? parsed.passphrase : '',
    };
  }

  function saveGithubSyncConfig(next) {
    const clean = {
      token: String(next?.token || '').trim(),
      deviceName: String(next?.deviceName || defaultGithubDeviceName()).trim().slice(0, 80),
      rememberPassphrase: next?.rememberPassphrase !== false,
      passphrase: next?.rememberPassphrase !== false ? String(next?.passphrase || '') : '',
    };
    githubSessionPassphrase = String(next?.passphrase || '');
    if (typeof GM_setValue === 'function') GM_setValue(GITHUB_SYNC_CONFIG_KEY, JSON.stringify(clean));
    return { ...GITHUB_SYNC_TARGET, ...clean, passphrase: githubSessionPassphrase || clean.passphrase };
  }

  function clearGithubSyncConfig() {
    githubSessionPassphrase = '';
    if (typeof GM_setValue === 'function') GM_setValue(GITHUB_SYNC_CONFIG_KEY, '');
    try { localStorage.removeItem(GITHUB_SYNC_STATE_KEY); } catch (_) {}
  }

  function bytesToBase64(bytes) {
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(String(value || '').replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function textToBase64(value) {
    return bytesToBase64(new TextEncoder().encode(String(value || '')));
  }

  function base64ToText(value) {
    return new TextDecoder().decode(base64ToBytes(value));
  }

  async function deriveGithubSyncKey(passphrase, salt, iterations, usages) {
    const material = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      usages,
    );
  }

  async function encryptSuiteSettingsPayload(payload, passphrase, deviceName) {
    if (!crypto?.subtle) throw new Error('This browser does not support secure settings encryption');
    if (String(passphrase || '').length < 8) throw new Error('Encryption passphrase must be at least 8 characters');
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));
    if (plaintext.byteLength > MAX_CONFIG_BYTES) throw new Error('Settings are too large to upload');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveGithubSyncKey(passphrase, salt, GITHUB_PBKDF2_ITERATIONS, ['encrypt']);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
    return {
      format: GITHUB_SYNC_FORMAT,
      version: 1,
      encryptedAt: new Date().toISOString(),
      deviceName: String(deviceName || 'Unknown device').slice(0, 80),
      crypto: {
        cipher: 'AES-GCM-256',
        kdf: 'PBKDF2-SHA-256',
        iterations: GITHUB_PBKDF2_ITERATIONS,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
      },
      ciphertext: bytesToBase64(ciphertext),
    };
  }

  async function decryptSuiteSettingsEnvelope(envelope, passphrase) {
    if (!envelope || envelope.format !== GITHUB_SYNC_FORMAT || envelope.version !== 1) {
      throw new Error('Unsupported encrypted settings format');
    }
    const iterations = Number(envelope.crypto?.iterations);
    if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) {
      throw new Error('Invalid encryption parameters');
    }
    const salt = base64ToBytes(envelope.crypto?.salt);
    const iv = base64ToBytes(envelope.crypto?.iv);
    const ciphertext = base64ToBytes(envelope.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || !ciphertext.length) throw new Error('Encrypted settings are incomplete');
    try {
      const key = await deriveGithubSyncKey(passphrase, salt, iterations, ['decrypt']);
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      if (plaintext.byteLength > MAX_CONFIG_BYTES) throw new Error('Decrypted settings are too large');
      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (error) {
      if (error?.message === 'Decrypted settings are too large') throw error;
      throw new Error('Unable to decrypt settings. Check the passphrase and try again.');
    }
  }

  function githubApiRequest(config, method, url, data = null) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        reject(new Error('Tampermonkey network access is unavailable'));
        return;
      }
      const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      };
      if (data != null) headers['Content-Type'] = 'application/json';
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data: data == null ? undefined : JSON.stringify(data),
        timeout: 30000,
        onload: response => {
          let parsed = null;
          try { parsed = response.responseText ? JSON.parse(response.responseText) : null; } catch (_) {}
          resolve({ status: Number(response.status), data: parsed, text: response.responseText || '' });
        },
        onerror: () => reject(new Error('Unable to reach GitHub')),
        ontimeout: () => reject(new Error('GitHub request timed out')),
      });
    });
  }

  function githubContentsApiUrl(config) {
    const path = config.path.split('/').map(encodeURIComponent).join('/');
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${path}`;
  }

  function githubResponseError(response, fallback) {
    const message = response?.data?.message || fallback || 'GitHub request failed';
    if (response?.status === 401) return new Error('GitHub rejected the token. Save a valid fine-grained token and try again.');
    if (response?.status === 403) return new Error('The GitHub token does not have Contents read/write permission for the settings repository.');
    if (response?.status === 404) return new Error('The private GitHub settings repository or settings file was not found.');
    return new Error(`GitHub ${response?.status || ''}: ${message}`.trim());
  }

  async function testGithubSyncConnection(config) {
    const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}`;
    const response = await githubApiRequest(config, 'GET', url);
    if (response.status !== 200) throw githubResponseError(response, 'Connection test failed');
    return response.data;
  }

  async function uploadSuiteSettingsToGithub(config, passphrase, multicamState = Storage.load()) {
    const payload = buildSuiteSettingsPayload(multicamState);
    const envelope = await encryptSuiteSettingsPayload(payload, passphrase, config.deviceName);
    const url = githubContentsApiUrl(config);
    for (let attempt = 0; attempt < 3; attempt++) {
      const existing = await githubApiRequest(config, 'GET', `${url}?ref=${encodeURIComponent(config.branch)}&cache_bust=${Date.now()}`);
      if (![200, 404].includes(existing.status)) throw githubResponseError(existing, 'Unable to read the current cloud backup');
      const requestBody = {
        message: `Update Chaturbate settings from ${config.deviceName}`,
        content: textToBase64(JSON.stringify(envelope, null, 2)),
        branch: config.branch,
      };
      if (existing.status === 200 && existing.data?.sha) requestBody.sha = existing.data.sha;
      const uploaded = await githubApiRequest(config, 'PUT', url, requestBody);
      if ([200, 201].includes(uploaded.status)) {
        return {
          payload,
          envelope,
          sha: uploaded.data?.content?.sha || '',
          commit: uploaded.data?.commit?.sha || '',
        };
      }
      if (uploaded.status !== 409 || attempt === 2) throw githubResponseError(uploaded, 'Unable to upload settings');
      await new Promise(resolve => setTimeout(resolve, 180 * (attempt + 1)));
    }
    throw new Error('GitHub settings upload did not complete');
  }

  let githubAutoExportQueue = Promise.resolve();

  function queueGithubSettingsAutoExport(reason = 'settings changed') {
    const config = loadGithubSyncConfig();
    const passphrase = config.passphrase || githubSessionPassphrase;
    if (!config.token || String(passphrase).length < 8) return null;
    const upload = githubAutoExportQueue
      .catch(() => {})
      .then(async () => {
        const latestState = Storage.load();
        const result = await uploadSuiteSettingsToGithub(config, passphrase, latestState);
        await recordGithubSyncBaseline(result, latestState);
        return result;
      });
    githubAutoExportQueue = upload;
    upload.catch(error => console.warn(`[Rooms] automatic GitHub export failed after ${reason}`, error));
    return upload;
  }

  function readIgnoredRoomNames() {
    const seen = new Set();
    return String(localStorage.getItem('ignoredusers') || '')
      .split(',')
      .map(normalizeUsername)
      .filter(username => {
        if (!username || seen.has(username)) return false;
        seen.add(username);
        return true;
      });
  }

  async function commitNewIgnoredRoom(rawUsername) {
    const username = normalizeUsername(rawUsername);
    if (!username || !isLikelyUsername(username)) throw new Error('Invalid room name');
    const ignored = readIgnoredRoomNames();
    if (ignored.includes(username)) return { added: false, cloud: 'not-needed' };

    ignored.push(username);
    localStorage.setItem('ignoredusers', ignored.join(','));

    const upload = queueGithubSettingsAutoExport(`banning ${username}`);
    if (!upload) {
      return { added: true, cloud: 'not-configured' };
    }
    try {
      const result = await upload;
      return { added: true, cloud: 'exported', result };
    } catch (error) {
      console.warn(`[Rooms] ${username} was banned, but its settings backup could not be uploaded`, error);
      return { added: true, cloud: 'failed', error };
    }
  }

  // The integrated Reloaded component is a separate IIFE. This narrow bridge
  // lets both its room-page ban and the Suite's room-card ban use exactly one
  // storage update and one event-driven cloud export.
  globalThis.__ziggySuiteCommitNewBan = commitNewIgnoredRoom;

  async function downloadSuiteSettingsFromGithub(config, passphrase) {
    const url = `${githubContentsApiUrl(config)}?ref=${encodeURIComponent(config.branch)}`;
    const response = await githubApiRequest(config, 'GET', url);
    if (response.status !== 200 || !response.data?.content) throw githubResponseError(response, 'No cloud backup is available yet');
    let envelope;
    try { envelope = JSON.parse(base64ToText(response.data.content)); }
    catch (_) { throw new Error('The GitHub settings file is not valid JSON'); }
    const payload = await decryptSuiteSettingsEnvelope(envelope, passphrase);
    return { payload, envelope, sha: response.data.sha || '' };
  }

  function githubSyncCredentials(options = {}) {
    const config = loadGithubSyncConfig();
    const passphrase = config.passphrase || githubSessionPassphrase;
    if (!config.token || !passphrase) {
      if (options.openSetup !== false) openGithubSyncSetup('Enter a GitHub token and encryption passphrase, then save.');
      return null;
    }
    return { config, passphrase };
  }

  function claimGithubAutoImportLease() {
    const now = Date.now();
    const existing = readJsonStorage(GITHUB_AUTO_IMPORT_LEASE_KEY, {});
    if (existing?.owner && existing.owner !== githubAutoImportOwner && numeric(existing.expiresAt, 0) > now) return false;
    writeJsonStorage(GITHUB_AUTO_IMPORT_LEASE_KEY, { owner: githubAutoImportOwner, expiresAt: now + 45000 });
    const claimed = readJsonStorage(GITHUB_AUTO_IMPORT_LEASE_KEY, {});
    return claimed?.owner === githubAutoImportOwner;
  }

  function releaseGithubAutoImportLease() {
    const current = readJsonStorage(GITHUB_AUTO_IMPORT_LEASE_KEY, {});
    if (current?.owner === githubAutoImportOwner) localStorage.removeItem(GITHUB_AUTO_IMPORT_LEASE_KEY);
  }

  let githubFingerprintMonitorBusy = false;
  async function monitorGithubLocalSettings() {
    if (githubFingerprintMonitorBusy) return;
    githubFingerprintMonitorBusy = true;
    try {
      const fingerprint = await githubSettingsFingerprint(Storage.load());
      const syncState = loadGithubSyncState();
      if (!syncState.lastSnapshotFingerprint) {
        saveGithubSyncState({ lastSnapshotFingerprint: fingerprint });
      } else if (syncState.lastSnapshotFingerprint !== fingerprint) {
        saveGithubSyncState({
          localChangedAt: Date.now(),
          lastSnapshotFingerprint: fingerprint,
        });
      }
    } catch (_) {
      // A failed local comparison must never interfere with the site.
    } finally {
      githubFingerprintMonitorBusy = false;
    }
  }

  async function maybeAutoImportGithubSettings(force = false) {
    if (!isWorkshopRoute()) return false;
    const config = loadGithubSyncConfig();
    const passphrase = config.passphrase || githubSessionPassphrase;
    if (!config.token || String(passphrase).length < 8) return false;
    if (isRecorderHubRoute() || loadRecordingIntents().length) return false;
    const syncState = loadGithubSyncState();
    if (!force && Date.now() - syncState.lastCheckedAt < GITHUB_AUTO_IMPORT_CHECK_MS) return false;
    if (!claimGithubAutoImportLease()) return false;
    try {
      const downloaded = await downloadSuiteSettingsFromGithub(config, passphrase);
      const currentFingerprint = await githubSettingsFingerprint(Storage.load());
      const remoteFingerprint = await githubPayloadFingerprint(downloaded.payload);
      const latestState = loadGithubSyncState();
      let localChangedAt = latestState.localChangedAt;
      if (latestState.lastSnapshotFingerprint && latestState.lastSnapshotFingerprint !== currentFingerprint) {
        localChangedAt = Date.now();
      }
      const remoteAt = githubRemoteTimestamp(downloaded);
      const firstCloudComparison = !latestState.lastSnapshotFingerprint && !latestState.lastAppliedRemoteAt;
      const remoteChanged = !latestState.lastAppliedSha || downloaded.sha !== latestState.lastAppliedSha;
      const settingsDiffer = remoteFingerprint !== currentFingerprint;
      const shouldImport = settingsDiffer && remoteChanged
        && (firstCloudComparison || remoteAt > Math.max(latestState.lastAppliedRemoteAt, localChangedAt));
      if (!shouldImport) {
        if (!settingsDiffer && remoteChanged) {
          await recordGithubSyncBaseline(downloaded, Storage.load());
          return false;
        }
        saveGithubSyncState({
          localChangedAt,
          lastSnapshotFingerprint: currentFingerprint,
          lastCheckedAt: Date.now(),
        });
        return false;
      }
      applySuiteSettingsPayload(downloaded.payload);
      await recordGithubSyncBaseline(downloaded, Storage.load());
      setTimeout(() => location.reload(), 450);
      return true;
    } catch (error) {
      saveGithubSyncState({ lastCheckedAt: Date.now() });
      console.warn('[Rooms] automatic GitHub import skipped', error);
      return false;
    } finally {
      releaseGithubAutoImportLease();
    }
  }

  function scheduleGithubAutoImport() {
    if (!isWorkshopRoute()) return;
    setTimeout(() => maybeAutoImportGithubSettings(), 2200);
    setTimeout(() => monitorGithubLocalSettings(), 5000);
    setInterval(() => monitorGithubLocalSettings(), 10000);
    setInterval(() => maybeAutoImportGithubSettings(), GITHUB_AUTO_IMPORT_CHECK_MS);
  }

  function ensureGithubSyncStyle() {
    if (document.getElementById('roomgrid-github-sync-style')) return;
    const style = document.createElement('style');
    style.id = 'roomgrid-github-sync-style';
    style.textContent = `
      .roomgrid-github-backdrop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.72);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      .roomgrid-github-panel{box-sizing:border-box;width:min(520px,100%);max-height:min(760px,92dvh);overflow-y:auto;padding:18px;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:#111827;color:#f8fafc;box-shadow:0 24px 80px rgba(0,0,0,.5)}
      .roomgrid-github-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.roomgrid-github-head h2{margin:0;font-size:19px}.roomgrid-github-close{width:42px;height:42px;border:0;border-radius:12px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;cursor:pointer}
      .roomgrid-github-copy{margin:0 0 14px;color:#cbd5e1;font-size:13px;line-height:1.45}.roomgrid-github-target{margin:0 0 12px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.06);color:#93c5fd;font-size:12px;overflow-wrap:anywhere}
      .roomgrid-github-field{display:grid;gap:5px;margin:10px 0;color:#cbd5e1;font-size:12px;font-weight:700}.roomgrid-github-field input{box-sizing:border-box;width:100%;min-height:44px;padding:9px 11px;border:1px solid rgba(255,255,255,.16);border-radius:10px;outline:none;background:#0f172a;color:#fff;font:14px system-ui}.roomgrid-github-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,.18)}
      .roomgrid-github-check{display:flex;align-items:center;gap:9px;margin:10px 0;color:#cbd5e1;font-size:13px}.roomgrid-github-check input{width:20px;height:20px;accent-color:#2563eb}.roomgrid-github-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.roomgrid-github-actions button{min-height:44px;padding:9px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font-weight:800;cursor:pointer}.roomgrid-github-actions button.primary{background:#2563eb}.roomgrid-github-actions button.success{background:#15803d}.roomgrid-github-actions button.warn{background:#a16207}.roomgrid-github-actions button.danger{background:#991b1b}.roomgrid-github-actions button:disabled{opacity:.5;cursor:wait}
      .roomgrid-github-status{min-height:38px;margin-top:12px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.05);color:#cbd5e1;font-size:12px;line-height:1.4}.roomgrid-github-status.error{color:#fecaca;background:rgba(127,29,29,.34)}.roomgrid-github-status.success{color:#bbf7d0;background:rgba(20,83,45,.36)}
      @media(max-width:520px){.roomgrid-github-backdrop{align-items:flex-end;padding:0}.roomgrid-github-panel{width:100%;max-height:92dvh;border-radius:18px 18px 0 0;padding-bottom:max(18px,env(safe-area-inset-bottom))}.roomgrid-github-actions{grid-template-columns:1fr}}
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function openGithubSyncSetup(initialMessage = '') {
    ensureGithubSyncStyle();
    document.getElementById('roomgrid-github-sync-backdrop')?.remove();
    const current = loadGithubSyncConfig();
    const backdrop = $('div', { id: 'roomgrid-github-sync-backdrop', class: 'roomgrid-github-backdrop' });
    const panel = $('section', { class: 'roomgrid-github-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'GitHub cloud settings' });
    const close = $('button', { class: 'roomgrid-github-close', type: 'button', title: 'Close', onclick: () => backdrop.remove() }, '×');
    const tokenInput = $('input', { type: 'password', autocomplete: 'off', value: current.token, placeholder: 'Fine-grained GitHub token' });
    const passphraseInput = $('input', { type: 'password', autocomplete: 'new-password', value: current.passphrase || githubSessionPassphrase, placeholder: 'At least 8 characters' });
    const deviceInput = $('input', { type: 'text', value: current.deviceName, maxlength: 80 });
    const rememberInput = $('input', { type: 'checkbox', checked: current.rememberPassphrase });
    const status = $('div', { class: 'roomgrid-github-status', role: 'status' }, initialMessage || (current.token ? 'GitHub credentials are saved on this device.' : 'GitHub cloud backup is not configured on this device.'));
    const setStatus = (message, kind = '') => {
      status.textContent = message;
      status.className = `roomgrid-github-status${kind ? ` ${kind}` : ''}`;
    };
    const readAndSave = () => saveGithubSyncConfig({
      token: tokenInput.value,
      passphrase: passphraseInput.value,
      deviceName: deviceInput.value,
      rememberPassphrase: rememberInput.checked,
    });
    const withBusy = async (button, action) => {
      const buttons = [...panel.querySelectorAll('button')];
      buttons.forEach(item => { item.disabled = true; });
      try { await action(); }
      catch (error) { setStatus(error.message || String(error), 'error'); }
      finally { buttons.forEach(item => { item.disabled = false; }); }
    };
    const saveButton = $('button', { class: 'primary', type: 'button', onclick: () => {
      const saved = readAndSave();
      if (!saved.token) { setStatus('Enter the fine-grained GitHub token.', 'error'); return; }
      if (String(saved.passphrase || '').length < 8) { setStatus('The encryption passphrase must be at least 8 characters.', 'error'); return; }
      setStatus('GitHub cloud settings saved on this device.', 'success');
      updateGithubSyncMenuLabel();
    } }, 'Save setup');
    const testButton = $('button', { type: 'button' }, 'Test connection');
    testButton.addEventListener('click', () => withBusy(testButton, async () => {
      const saved = readAndSave();
      if (!saved.token) throw new Error('Enter the fine-grained GitHub token first.');
      await testGithubSyncConnection(saved);
      setStatus('Connected to the private GitHub settings repository.', 'success');
      updateGithubSyncMenuLabel();
    }));
    const exportButton = $('button', { class: 'success', type: 'button' }, 'Export to GitHub');
    exportButton.addEventListener('click', () => withBusy(exportButton, async () => {
      const saved = readAndSave();
      if (!saved.token || String(saved.passphrase || '').length < 8) throw new Error('Save a token and passphrase first.');
      const result = await uploadSuiteSettingsToGithub(saved, saved.passphrase, Storage.load());
      await recordGithubSyncBaseline(result, Storage.load());
      setStatus(`Cloud backup uploaded ${result.commit ? `(${result.commit.slice(0, 7)})` : ''}.`, 'success');
    }));
    const importButton = $('button', { class: 'warn', type: 'button' }, 'Import from GitHub');
    importButton.addEventListener('click', () => withBusy(importButton, async () => {
      const saved = readAndSave();
      if (!saved.token || String(saved.passphrase || '').length < 8) throw new Error('Save a token and passphrase first.');
      const downloaded = await downloadSuiteSettingsFromGithub(saved, saved.passphrase);
      const roomCount = downloaded.payload?.components?.multicamPro?.rooms?.length;
      const detail = `Backup: ${downloaded.envelope.encryptedAt || 'unknown date'} from ${downloaded.envelope.deviceName || 'unknown device'}${Number.isInteger(roomCount) ? `, ${roomCount} models` : ''}.`;
      if (!confirm(`${detail}\n\nImporting replaces the current model library. Continue?`)) { setStatus('Import cancelled.'); return; }
      const result = applySuiteSettingsPayload(downloaded.payload);
      await recordGithubSyncBaseline(downloaded, Storage.load());
      setStatus(`Imported cloud backup${Number.isInteger(result.roomCount) ? ` with ${result.roomCount} models` : ''}. Reloading…`, 'success');
      setTimeout(() => location.reload(), 650);
    }));
    const localExportButton = $('button', { type: 'button', onclick: () => exportSuiteSettingsLocal(Storage.load()) }, 'Download local backup');
    const localImportButton = $('button', { type: 'button', onclick: () => importSuiteSettingsFile({ onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')) }) }, 'Import local backup');
    const clearButton = $('button', { class: 'danger', type: 'button', onclick: () => {
      if (!confirm('Erase the saved GitHub token and encryption passphrase from this device?')) return;
      clearGithubSyncConfig();
      tokenInput.value = '';
      passphraseInput.value = '';
      setStatus('GitHub credentials erased from this device.', 'success');
      updateGithubSyncMenuLabel();
    } }, 'Disconnect');
    panel.append(
      $('div', { class: 'roomgrid-github-head' }, [$('h2', {}, 'GitHub cloud backup'), close]),
      $('p', { class: 'roomgrid-github-copy' }, 'Exports upload one encrypted latest backup containing MultiCam, Reloaded, and Mobile Clean View settings. Imports download it and replace the current MultiCam model library after confirmation.'),
      $('div', { class: 'roomgrid-github-target' }, `${GITHUB_SYNC_TARGET.owner}/${GITHUB_SYNC_TARGET.repo} · ${GITHUB_SYNC_TARGET.path}`),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Device name'), deviceInput]),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Fine-grained GitHub token'), tokenInput]),
      $('label', { class: 'roomgrid-github-field' }, [$('span', {}, 'Encryption passphrase'), passphraseInput]),
      $('label', { class: 'roomgrid-github-check' }, [rememberInput, $('span', {}, 'Remember the encryption passphrase on this device')]),
      $('div', { class: 'roomgrid-github-actions' }, [saveButton, testButton, exportButton, importButton, localExportButton, localImportButton, clearButton]),
      status,
    );
    backdrop.appendChild(panel);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    setTimeout(() => (current.token ? passphraseInput : tokenInput).focus(), 0);
  }

  function updateGithubSyncMenuLabel() {
    const button = document.getElementById('githubsyncbutton');
    if (!button) return;
    const configured = !!loadGithubSyncConfig().token;
    button.textContent = configured ? 'GitHub Cloud: Configured' : 'GitHub Cloud: Setup required';
  }

  async function exportSuiteSettings(multicamState = Storage.load(), options = {}) {
    const credentials = githubSyncCredentials(options);
    if (!credentials) return null;
    try {
      const result = await uploadSuiteSettingsToGithub(credentials.config, credentials.passphrase, multicamState);
      await recordGithubSyncBaseline(result, Storage.load());
      alert(`Settings uploaded securely to GitHub${result.commit ? ` (${result.commit.slice(0, 7)})` : ''}.`);
      return result;
    } catch (error) {
      alert(`GitHub export failed: ${error.message || error}`);
      return null;
    }
  }

  async function importSuiteSettingsFromGithub(options = {}) {
    const credentials = githubSyncCredentials(options);
    if (!credentials) return null;
    try {
      const downloaded = await downloadSuiteSettingsFromGithub(credentials.config, credentials.passphrase);
      const roomCount = downloaded.payload?.components?.multicamPro?.rooms?.length;
      const detail = `Backup: ${downloaded.envelope.encryptedAt || 'unknown date'} from ${downloaded.envelope.deviceName || 'unknown device'}${Number.isInteger(roomCount) ? `, ${roomCount} models` : ''}.`;
      if (!confirm(`${detail}\n\nImporting replaces the current model library. Continue?`)) return null;
      const result = applySuiteSettingsPayload(downloaded.payload);
      await recordGithubSyncBaseline(downloaded, Storage.load());
      options.onImported?.(result);
      setTimeout(() => location.reload(), 650);
      return result;
    } catch (error) {
      if (typeof options.onError === 'function') options.onError(error);
      else alert(`GitHub import failed: ${error.message || error}`);
      return null;
    }
  }

  function applySuiteSettingsPayload(parsed) {
    const multicamComponent = parsed?.components?.multicamPro;
    const rawMulticam = multicamComponent?.settings || parsed?.settings;
    const rawRooms = Array.isArray(multicamComponent?.rooms)
      ? multicamComponent.rooms
      : (Array.isArray(multicamComponent?.models) ? multicamComponent.models : null);
    const rawGroups = Array.isArray(multicamComponent?.groups) ? multicamComponent.groups : null;
    const rawReloaded = parsed?.components?.reloaded || parsed?.reloaded;
    const rawMobileCleanView = parsed?.components?.mobileCleanView || parsed?.mobileCleanView;
    const hasMulticamSettings = !!rawMulticam && typeof rawMulticam === 'object' && !Array.isArray(rawMulticam);
    const replacesRoomLibrary = rawRooms !== null;
    const hasMulticam = hasMulticamSettings || replacesRoomLibrary;
    const hasReloaded = !!rawReloaded && typeof rawReloaded === 'object' && !Array.isArray(rawReloaded);
    const hasMobileCleanView = !!rawMobileCleanView && typeof rawMobileCleanView === 'object' && !Array.isArray(rawMobileCleanView);
    if (!hasMulticam && !hasReloaded && !hasMobileCleanView) throw new Error('No supported Suite settings were found');

    let nextState = null;
    if (hasMulticam) {
      const current = Storage.load();
      let nextSettings = current.settings;
      if (hasMulticamSettings) {
        const allowed = new Set(Object.keys(defaultState().settings));
        const imported = Object.fromEntries(Object.entries(rawMulticam).filter(([key]) => allowed.has(key)));
        nextSettings = sanitizeState({
          ...current,
          settings: { ...current.settings, ...imported },
        }).settings;
      }
      nextSettings.pureMode = false;
      nextSettings.activeGroup = DEFAULT_GROUP_ID;
      nextSettings.pageIndex = 0;
      nextSettings.focusedRoomId = null;
      nextSettings.searchQuery = '';
      nextSettings.showRecordingOnly = false;

      if (replacesRoomLibrary) {
        // A v3/v4 backup is authoritative: imported rooms/groups replace the old model library instead of merging with it.
        nextState = sanitizeState({
          v: current.v,
          rooms: rawRooms,
          groups: rawGroups || defaultState().groups,
          settings: nextSettings,
        });
      } else if (hasMulticamSettings) {
        // Backward compatibility for v2 settings-only exports: preserve the existing model library.
        nextState = { ...current, settings: nextSettings };
      }
    }
    if (!nextState && !hasReloaded && !hasMobileCleanView) throw new Error('no supported settings found');

    backupCurrentConfig();
    if (nextState) Storage.save(nextState);
    if (nextState && replacesRoomLibrary) {
      const importedIds = new Set(nextState.rooms.map(room => room.id));
      saveRecordingIntents(loadRecordingIntents().filter(id => importedIds.has(id)));
      const history = loadRoomStatusHistory();
      writeJsonStorage(ROOM_STATUS_HISTORY_KEY, Object.fromEntries(
        Object.entries(history).filter(([id]) => importedIds.has(normalizeUsername(id))),
      ));
    }
    if (hasReloaded && !restoreReloadedSettings(rawReloaded)) throw new Error('Reloaded settings are invalid');
    if (hasMobileCleanView && !restoreMobileCleanViewSettings(rawMobileCleanView)) throw new Error('Mobile Clean View settings are invalid');
    return {
      multicam: !!nextState,
      reloaded: hasReloaded,
      mobileCleanView: hasMobileCleanView,
      roomsReplaced: replacesRoomLibrary,
      roomCount: nextState ? nextState.rooms.length : null,
    };
  }

  function importSuiteSettingsFile(options = {}) {
    const inp = $('input', {
      type: 'file',
      accept: 'application/json,.json',
      style: { display: 'none' },
      onchange: async (event) => {
        const file = event.target.files?.[0];
        if (!file) { try { inp.remove(); } catch (_) {} return; }
        try {
          if (file.size > MAX_CONFIG_BYTES) throw new Error('file too large');
          const parsed = JSON.parse(await file.text());
          const importsRoomLibrary = Array.isArray(parsed?.components?.multicamPro?.rooms)
            || Array.isArray(parsed?.components?.multicamPro?.models);
          if (!confirm(t(importsRoomLibrary ? 'settingsImportConfirm' : 'settingsImportLegacyConfirm'))) return;
          const result = applySuiteSettingsPayload(parsed);
          options.onImported?.(result);
          setTimeout(() => location.reload(), 500);
        } catch (err) {
          if (typeof options.onError === 'function') options.onError(err);
          else alert((LANG === 'zh' ? '导入设置失败：' : 'Settings import failed: ') + err.message);
        } finally {
          setTimeout(() => { try { inp.remove(); } catch (_) {} }, 0);
        }
      },
    });
    document.body.appendChild(inp);
    inp.click();
    setTimeout(() => { try { if (!inp.files || !inp.files.length) inp.remove(); } catch (_) {} }, 60000);
  }

  Object.defineProperty(window, '__chaturbateSuiteSettings', {
    configurable: true,
    value: Object.freeze({
      exportSettings: () => exportSuiteSettings(Storage.load()),
      importSettings: () => importSuiteSettingsFromGithub({
        onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')),
      }),
      exportLocalSettings: () => exportSuiteSettingsLocal(Storage.load()),
      importLocalSettings: () => importSuiteSettingsFile({
        onImported: result => alert(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')),
      }),
      configureGithubSync: () => openGithubSyncSetup(),
      isGithubSyncConfigured: () => !!loadGithubSyncConfig().token,
    }),
  });

  /* =============================================================
   * 2. 状态层 / Store —— 简单响应式 + 持久化
   * ============================================================= */
  function createStore() {
    let state = Storage.load();
    const subs = new Set();
    const persistDebounced = debounce(() => Storage.save(state), 800);

    const notify = (path) => { for (const fn of subs) fn(state, path); };

    const update = (mutator, path = 'all') => {
      try {
        const result = mutator(state);
        // v15.5: mutator 返回 false 表示没有实际变化，避免同状态反复写 localStorage，
        // 减少多工作台之间 storage 事件 ping-pong 引发的重排/闪屏。
        if (result === false) return;
      }
      catch (err) { console.warn('[RoomGrid] store update failed', err); return; }
      persistDebounced();
      notify(path);
    };

    return {
      get state() { return state; },
      subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
      update,
      replaceState(nextState, path = 'all') {
        state = sanitizeState(nextState || defaultState());
        notify(path);
      },

      // ---- 房间 ----
      addRoom(id) {
        id = normalizeUsername(id);
        if (!isLikelyUsername(id)) return false;
        let changed = false;
        let newRoomAdded = false;
        update(s => {
          normalizeStateMemberships(s);
          const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
          const targetGroup = (ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID || ag === ONLINE_FAVORITES_GROUP_ID || ag === ONLINE_FOLLOWING_GROUP_ID) ? DEFAULT_GROUP_ID : ag;
          const existing = s.rooms.find(r => r.id === id);
          if (existing) {
            changed = ensureRoomInGroup(existing, targetGroup, nextOrderForGroup(s, targetGroup)) || changed;
            return;
          }
          const allOrder = nextOrderForGroup(s, DEFAULT_GROUP_ID);
          const groupOrder = nextOrderForGroup(s, targetGroup);
          s.rooms.push(normalizeRoom({
            id, addedAt: Date.now(),
            group: targetGroup,
            groups: [targetGroup],
            groupOrder: targetGroup === DEFAULT_GROUP_ID ? {} : { [targetGroup]: groupOrder },
            order: allOrder,
            lastStatus: 'unknown', lastSeenOnline: 0, muted: false,
          }, allOrder));
          changed = true;
          newRoomAdded = true;
        }, 'rooms');
        if (newRoomAdded) void queueGithubSettingsAutoExport(`added room ${id}`);
        return changed;
      },
      removeRoom(id) { id = normalizeUsername(id); update(s => { s.rooms = s.rooms.filter(r => r.id !== id); reconcileSplitState(s); }, 'rooms'); },
      removeRoomFromActiveGroup(id) {
        id = normalizeUsername(id);
        let globalRemoved = false;
        update(s => {
          normalizeStateMemberships(s);
          const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
          if (ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID) {
            const before = s.rooms.length;
            s.rooms = s.rooms.filter(r => r.id !== id);
            reconcileSplitState(s);
            globalRemoved = s.rooms.length !== before;
            return;
          }
          const r = s.rooms.find(r => r.id === id);
          if (ag === ONLINE_FAVORITES_GROUP_ID) {
            if (r) removeRoomFromGroup(r, FAVORITE_GROUP_ID);
            return;
          }
          if (r) removeRoomFromGroup(r, ag);
        }, 'rooms');
        return globalRemoved;
      },
      patchRoom(id, patch) {
        id = normalizeUsername(id);
        const allowed = new Set(['lastStatus', 'lastSeenOnline', 'muted', 'privateLabel', 'errorMsg']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = v;
        update(s => {
          const r = s.rooms.find(r => r.id === id);
          if (!r) return false;
          let changed = false;
          for (const [k, v] of Object.entries(clean)) {
            if (!Object.is(r[k], v)) { r[k] = v; changed = true; }
          }
          return changed;
        }, 'room:' + id);
      },
      setRoomCardSize(id, groupId, size) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (r) setCardSizeForGroup(r, groupId, size);
        }, 'rooms');
      },
      reorderRooms(orderedIds, targetGroup) {
        update(s => {
          normalizeStateMemberships(s);
          const actualGroup = targetGroup === ONLINE_FAVORITES_GROUP_ID ? FAVORITE_GROUP_ID : (targetGroup === ONLINE_FOLLOWING_GROUP_ID ? DEFAULT_GROUP_ID : targetGroup);
          orderedIds.forEach((id, idx) => {
            const r = s.rooms.find(r => r.id === id);
            if (!r) return;
            if (!actualGroup || actualGroup === LIBRARY_GROUP_ID || actualGroup === ONLINE_GROUP_ID || actualGroup === DEFAULT_GROUP_ID) {
              r.order = idx;
            } else {
              ensureRoomInGroup(r, actualGroup, idx);
              r.groupOrder[actualGroup] = idx;
            }
          });
        }, 'rooms');
      },
      moveToGroup(id, groupId) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID || groupId === ONLINE_FOLLOWING_GROUP_ID) return;
          ensureRoomInGroup(r, groupId, nextOrderForGroup(s, groupId));
        }, 'rooms');
      },
      toggleRoomInGroup(id, groupId) {
        id = normalizeUsername(id);
        let nowInGroup = false;
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID || groupId === ONLINE_FOLLOWING_GROUP_ID) return;
          if (roomInGroup(r, groupId)) {
            removeRoomFromGroup(r, groupId);
            nowInGroup = false;
          } else {
            ensureRoomInGroup(r, groupId, nextOrderForGroup(s, groupId));
            nowInGroup = true;
          }
        }, 'rooms');
        return nowInGroup;
      },
      moveOnlyToGroup(id, groupId) {
        id = normalizeUsername(id);
        update(s => {
          normalizeStateMemberships(s);
          const r = s.rooms.find(r => r.id === id);
          if (!r || !groupId || groupId === LIBRARY_GROUP_ID || groupId === ONLINE_GROUP_ID || groupId === ONLINE_FAVORITES_GROUP_ID || groupId === ONLINE_FOLLOWING_GROUP_ID) return;
          r.groups = [groupId];
          r.group = groupId;
          r.groupOrder = r.groupOrder && typeof r.groupOrder === 'object' && !Array.isArray(r.groupOrder) ? r.groupOrder : {};
          r.groupOrder[groupId] = nextOrderForGroup(s, groupId);
        }, 'rooms');
      },
      setAllMuted(muted) {
        update(s => {
          normalizeStateMemberships(s);
          s.rooms.forEach(r => { r.muted = !!muted; });
        }, 'rooms');
      },
      resetTileSizes() {
        update(s => {
          normalizeStateMemberships(s);
          s.rooms.forEach(r => { delete r.cardSize; delete r.cardSizeByGroup; });
        }, 'rooms');
      },
      repairData() {
        update(s => {
          normalizeStateMemberships(s);
          ensureSystemGroups(s);
          const validGroupIds = new Set((s.groups || []).map(g => g.id).filter(id => id !== LIBRARY_GROUP_ID && id !== ONLINE_GROUP_ID && id !== ONLINE_FAVORITES_GROUP_ID && id !== ONLINE_FOLLOWING_GROUP_ID));
          s.rooms.forEach((r, idx) => {
            r.groups = getRoomGroups(r).filter(g => validGroupIds.has(g));
            r.group = r.groups[0] || null;
            r.order = numeric(r.order, idx);
            if (!r.groupOrder || typeof r.groupOrder !== 'object' || Array.isArray(r.groupOrder)) r.groupOrder = {};
            for (const g of Object.keys(r.groupOrder)) if (!validGroupIds.has(g)) delete r.groupOrder[g];
            const sizeMap = normalizeCardSizeMap(r.cardSizeByGroup);
            const legacyCardSize = normalizeCardSize(r.cardSize);
            if (legacyCardSize && !sizeMap.all) sizeMap.all = legacyCardSize;
            if (Object.keys(sizeMap).length) r.cardSizeByGroup = sizeMap; else delete r.cardSizeByGroup;
            delete r.cardSize;
          });
          reconcileSplitState(s);
        }, 'all');
      },

      // ---- 分组 ----
      addGroup(name) {
        const safeName = safeGroupName(name, LANG === 'zh' ? '新分组' : 'New group');
        const id = uuid();
        update(s => { s.groups.push({ id, name: safeName, order: s.groups.length }); }, 'groups');
        return id;
      },
      renameGroup(id, name) { update(s => { const g = s.groups.find(g => g.id === id); if (g && !g.system) g.name = safeGroupName(name, g.name); }, 'groups'); },
      removeGroup(id) {
        update(s => {
          if (s.groups.find(g => g.id === id)?.system) return;
          s.groups = s.groups.filter(g => g.id !== id);
          s.rooms.forEach(r => removeRoomFromGroup(r, id));
          if (s.settings.activeGroup === id) s.settings.activeGroup = DEFAULT_GROUP_ID;
        }, 'groups');
      },
      setActiveGroup(id) { update(s => { if (s.groups.some(g => g.id === id)) { s.settings.activeGroup = id; s.settings.pageIndex = 0; } }, 'settings:activeGroup,pageIndex'); },

      // ---- Split View ----
      setSplitSlot(slot, id) {
        slot = slot === 1 ? 1 : 0;
        id = normalizeUsername(id);
        let changed = false;
        update(s => {
          reconcileSplitState(s);
          if (!s.rooms.some(room => room.id === id) && !runtimeSplitRoomAvailable(id)) return false;
          const ids = [...s.settings.splitRoomIds];
          const otherSlot = slot === 0 ? 1 : 0;
          if (ids[otherSlot] === id || ids[slot] === id) return false;
          const previous = ids[slot] || null;
          ids[slot] = id;
          s.settings.splitRoomIds = ids.filter(Boolean).slice(0, 2);
          if (s.settings.splitAudioRoomId === previous || !s.settings.splitAudioRoomId) s.settings.splitAudioRoomId = id;
          s.settings.splitViewActive = s.settings.splitRoomIds.length === 2;
          if (s.settings.splitViewActive) {
            s.settings.pureMode = false;
          }
          reconcileSplitState(s);
          changed = true;
        }, 'settings:splitRoomIds,splitViewActive,splitAudioRoomId');
        return changed;
      },
      setSplitActive(active) {
        update(s => {
          reconcileSplitState(s);
          const next = !!active && s.settings.splitRoomIds.length === 2;
          if (s.settings.splitViewActive === next) return false;
          s.settings.splitViewActive = next;
          if (next) {
            s.settings.pureMode = false;
          }
        }, 'settings:splitViewActive');
      },
      swapSplitRooms() {
        update(s => {
          reconcileSplitState(s);
          if (s.settings.splitRoomIds.length !== 2) return false;
          s.settings.splitRoomIds = [s.settings.splitRoomIds[1], s.settings.splitRoomIds[0]];
        }, 'settings:splitRoomIds');
      },
      setSplitAudio(id) {
        id = normalizeUsername(id);
        update(s => {
          reconcileSplitState(s);
          if (!s.settings.splitRoomIds.includes(id) || s.settings.splitAudioRoomId === id) return false;
          s.settings.splitAudioRoomId = id;
        }, 'settings:splitAudioRoomId');
      },
      clearSplitSelection() {
        update(s => {
          s.settings.splitRoomIds = [];
          s.settings.splitAudioRoomId = null;
          s.settings.splitViewActive = false;
        }, 'settings:splitRoomIds,splitAudioRoomId,splitViewActive');
      },
      reconcileSplitSelection() {
        let changed = false;
        update(s => {
          const beforeIds = JSON.stringify(s.settings.splitRoomIds || []);
          const beforeActive = !!s.settings.splitViewActive;
          const beforeAudio = s.settings.splitAudioRoomId || null;
          reconcileSplitState(s);
          changed = beforeIds !== JSON.stringify(s.settings.splitRoomIds || [])
            || beforeActive !== !!s.settings.splitViewActive
            || beforeAudio !== (s.settings.splitAudioRoomId || null);
          return changed || false;
        }, 'settings:splitRoomIds,splitViewActive,splitAudioRoomId');
        return changed;
      },

      // ---- 设置 ----
      patchSettings(patch) {
        const allowed = new Set([...Object.keys(defaultState().settings), '__focusAutoMigratedV12']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = v;
        const keys = Object.keys(clean);
        update(s => { Object.assign(s.settings, clean); reconcileSplitState(s); }, keys.length ? 'settings:' + keys.join(',') : 'settings');
      },
      patchFilter(patch) {
        const allowed = new Set(['hideOffline', 'hidePrivate', 'onlyOnline']);
        const clean = {};
        for (const [k, v] of Object.entries(patch || {})) if (allowed.has(k)) clean[k] = !!v;
        const keys = Object.keys(clean).map(k => 'filter.' + k);
        update(s => { Object.assign(s.settings.filter, clean); }, keys.length ? 'settings:' + keys.join(',') : 'settings');
      },
    };
  }

  /* =============================================================
   * 3. 通知 / Notify
   * ============================================================= */
  const Notify = {
    granted: false,
    init() {
      if ('Notification' in window && Notification.permission === 'granted') this.granted = true;
    },
    async request() {
      if (!('Notification' in window)) return false;
      if (Notification.permission === 'granted') { this.granted = true; return true; }
      if (Notification.permission === 'denied') return false;
      const r = await Notification.requestPermission();
      this.granted = r === 'granted';
      return this.granted;
    },
    fire(title, body) {
      if (!this.granted) return;
      try {
        const n = new Notification(title, { body, silent: false, tag: 'multicam-' + title });
        n.onclick = () => { window.focus(); n.close(); };
        setTimeout(() => n.close(), 8000);
      } catch (_) {}
    },
  };

  /* =============================================================
   * 4. 房间服务 / RoomService —— API + HLS + 重连 + 智能轮询
   * ============================================================= */
  function createRoomService(store) {
    const sessions = new Map();   // id -> { hls, video, status, retryCount, pollTimer, userPaused, background }
    const qualityCaps = new Map(); // id -> maximum stream height for a specific virtual view/consumer
    const domain = safeChaturbateHost(window.location.hostname) ? window.location.hostname : 'chaturbate.com';
    let rateLimitUntil = 0;

    function clearPoll(s) {
      if (s?.pollTimer) { clearTimeout(s.pollTimer); s.pollTimer = null; }
    }

    function onlinePollMs() {
      return Math.max(10000, Number(store.state.settings.pollMs?.online) || 120000);
    }

    async function fetchContext(id, signal) {
      const req = new AbortController();
      const timeout = setTimeout(() => { try { req.abort(); } catch (_) {} }, 15000);
      const abortFromParent = () => { try { req.abort(); } catch (_) {} };
      try {
        if (signal) {
          if (signal.aborted) abortFromParent();
          else signal.addEventListener('abort', abortFromParent, { once: true });
        }
        const res = await fetch(`https://${domain}/api/chatvideocontext/${encodeURIComponent(id)}/`, {
          credentials: 'include',
          signal: req.signal,
          referrer: `https://${domain}/${encodeURIComponent(id)}/`,
          referrerPolicy: 'strict-origin-when-cross-origin',
        });
        if (!res.ok) {
          const error = new Error('http ' + res.status);
          error.httpStatus = res.status;
          if (res.status === 429) {
            const retryAfter = Number(res.headers.get('retry-after')) || 0;
            error.retryAfterMs = retryAfter > 0 ? retryAfter * 1000 : 0;
          }
          throw error;
        }
        return res.json();
      } finally {
        clearTimeout(timeout);
        try { signal?.removeEventListener?.('abort', abortFromParent); } catch (_) {}
      }
    }

    function setStatus(id, status, extra = {}) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return;
      const room = store.state.rooms.find(r => r.id === id);
      const prev = s.status || room?.lastStatus || 'unknown';
      const opts = extra && typeof extra === 'object' ? extra : {};
      const transient = !!opts.transient;
      const safeExtra = { ...opts };
      delete safeExtra.transient;

      // v15.5: 后台探测中的 loading / 临时请求错误不覆盖稳定状态。
      // 否则 hideOffline / onlyOnline / 分页会短时间重算，表现为离线房间闪出、在线房间消失后又回来。
      if ((status === 'loading' || (status === 'error' && transient)) && isStableRoomStatus(prev)) {
        s.status = prev;
        s.pendingStatus = status;
        if (safeExtra.errorMsg) s.lastTransientError = safeExtra.errorMsg;
        return;
      }

      s.status = status;
      delete s.pendingStatus;
      const patch = { lastStatus: status, ...safeExtra };
      if (status === 'online') {
        const lastSeen = numeric(room?.lastSeenOnline, 0);
        if (prev !== 'online' || !lastSeen || Date.now() - lastSeen > 60000) patch.lastSeenOnline = Date.now();
      }
      store.patchRoom(id, patch);
      EventBus.emit('room:status', { id, status, previous: prev, extra: safeExtra });
      if (prev !== status && isStableRoomStatus(status)) addRoomStatusHistory(id, status, safeExtra);
      // 上线提醒
      const notificationEligible = !store.state.settings.notifyFavoritesOnly || roomInGroup(room, FAVORITE_GROUP_ID);
      if (prev && prev !== 'online' && status === 'online' && store.state.settings.notifyOnline && notificationEligible) {
        Notify.fire(t('notifyTitleText'), t('notifyBody', id));
        EventBus.emit('room:flash', id);
      }
    }

    function hardStopVideo(video) {
      stopMediaElement(video, true);
    }

    function hardStopRoomVideos(id) {
      id = normalizeUsername(id);
      // DOM 兜底：即使 cardMap/session 已经丢失，也按 room-id 把残留 video 杀掉。
      try {
        const safe = String(id).replace(/"/g, '');
        document.querySelectorAll(`video[data-multicam-room-id="${safe}"],video[data-multicam-room="${safe}"],audio[data-multicam-room-id="${safe}"],audio[data-multicam-room="${safe}"]`).forEach(hardStopVideo);
      } catch (_) {}
    }

    function destroyHls(s) {
      if (!s || !s.hls) return;
      try { s.hls.stopLoad(); } catch (_) {}
      try { s.hls.detachMedia(); } catch (_) {}
      try { s.hls.destroy(); } catch (_) {}
      s.hls = null;
    }

    function destroyPlayer(id, opts = {}) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) { hardStopRoomVideos(id); return; }
      if (opts.abort !== false && s.abortController) {
        try { s.abortController.abort(); } catch (_) {}
        s.abortController = null;
      }
      clearPoll(s)
      if (s.hls) { try { s.hls.stopLoad(); } catch (_) {} }
      hardStopVideo(s.video);
      hardStopRoomVideos(id);
      if (s.hls) { try { s.hls.detachMedia(); } catch (_) {} try { s.hls.destroy(); } catch (_) {} s.hls = null; }
      s.video = null;
      s.hlsSource = null;
    }

    function detachVideo(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (s) {
        if (s.hls) { try { s.hls.stopLoad(); } catch (_) {} try { s.hls.detachMedia(); } catch (_) {} try { s.hls.destroy(); } catch (_) {} s.hls = null; }
        hardStopVideo(s.video);
        s.video = null;
        s.hlsSource = null;
        if (store.state.rooms.some(r => r.id === id)) {
          s.background = true;
          if (s.status === 'online') schedulePoll(id, onlinePollMs());
        }
      }
      hardStopRoomVideos(id);
    }

    function attachVideo(id, video) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) { hardStopVideo(video); return; }
      clearPoll(s);
      s.background = false;
      s.video = video;
    }

    function schedulePoll(id, ms) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return;
      clearPoll(s);
      // Saved rooms without a visible card remain monitored, but at a quiet
      // cadence so they cannot monopolize the shared room-context endpoint.
      // Bringing a card on screen promotes it and refreshes it immediately.
      if (s.background) {
        const backgroundFloor = s.status === 'online' ? 3 * 60 * 1000 : 5 * 60 * 1000;
        ms = Math.max(ms, backgroundFloor);
      }
      // 错峰：±20%
      const jitter = ms * (0.8 + Math.random() * 0.4);
      s.pollTimer = setTimeout(() => { if (sessions.has(id)) connect(id); }, jitter);
    }

    function pause(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return false;
      s.userPaused = true;
      try { s.hls?.stopLoad?.(); } catch (_) {}
      try { s.video?.pause?.(); } catch (_) {}
      return true;
    }

    function resume(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s) return false;
      s.userPaused = false;
      try { s.hls?.startLoad?.(); } catch (_) {}
      try { s.video?.play?.().catch?.(() => {}); } catch (_) {}
      if (!s.video && store.state.rooms.some(r => r.id === id)) refresh(id);
      return true;
    }

    function isPaused(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      return !!(s?.userPaused || s?.video?.paused);
    }

    function togglePause(id) {
      return isPaused(id) ? (resume(id), false) : (pause(id), true);
    }

    function pauseAll(ids = null) {
      const list = ids && ids.length ? ids.map(normalizeUsername) : [...sessions.keys()];
      list.forEach(id => pause(id));
    }

    function resumeAll(ids = null) {
      const list = ids && ids.length ? ids.map(normalizeUsername) : [...sessions.keys()];
      list.forEach(id => resume(id));
    }

    function streamMaxHeight() {
      return Number(store.state.settings.maxStreamHeight) || 0;
    }

    function hlsLevelForMaxHeight(hls, maxHeight = streamMaxHeight()) {
      const levels = Array.isArray(hls?.levels) ? hls.levels : [];
      if (!levels.length || !maxHeight) return -1;
      let best = -1;
      let bestHeight = 0;
      let smallest = 0;
      let smallestHeight = Number(levels[0]?.height) || Infinity;
      levels.forEach((level, idx) => {
        const height = Number(level?.height) || 0;
        if (height && height < smallestHeight) { smallest = idx; smallestHeight = height; }
        if (height && height <= maxHeight && height >= bestHeight) {
          best = idx;
          bestHeight = height;
        }
      });
      return best >= 0 ? best : smallest;
    }

    function applyHlsQuality(hls, id = '') {
      if (!hls) return;
      id = normalizeUsername(id);
      const cap = qualityCaps.get(id);
      const level = hlsLevelForMaxHeight(hls, Number(cap) > 0 ? Number(cap) : streamMaxHeight());
      try { hls.autoLevelCapping = level; } catch (_) {}
      try { hls.loadLevel = level; } catch (_) {}
      try { hls.currentLevel = level; } catch (_) {}
    }

    function refreshQuality() {
      sessions.forEach((s, id) => { if (s?.hls) applyHlsQuality(s.hls, id); });
    }

    function setQualityCap(id, maxHeight = 0) {
      id = normalizeUsername(id);
      const value = Math.max(0, Number(maxHeight) || 0);
      if (value) qualityCaps.set(id, value);
      else qualityCaps.delete(id);
      const s = sessions.get(id);
      if (s?.hls) applyHlsQuality(s.hls, id);
    }

    function clearQualityCaps() {
      qualityCaps.clear();
      refreshQuality();
    }

    async function connect(id) {
      id = normalizeUsername(id);
      let s = sessions.get(id);
      if (!s) { s = { retryCount: 0 }; sessions.set(id, s); }

      // 新请求开始前中止旧请求。删除房间或快速刷新时，旧请求返回也不会再创建 video。
      if (s.abortController) { try { s.abortController.abort(); } catch (_) {} }
      const ac = new AbortController();
      s.abortController = ac;

      EventBus.emit('room:loading', id);
      setStatus(id, 'loading');

      // A 429 applies to the shared Chaturbate endpoint, not just one room.
      // Hold every session until the common cooldown expires so several cards
      // cannot immediately amplify the throttle by retrying independently.
      if (Date.now() < rateLimitUntil) {
        const wait = Math.max(1000, rateLimitUntil - Date.now());
        setStatus(id, 'error', { errorMsg: 'request throttled', transient: true });
        EventBus.emit('room:transient-error', { id, error: 'request throttled' });
        schedulePoll(id, wait);
        return { id, status: 'throttled', retryAfterMs: wait };
      }

      let data;
      try {
        data = await fetchContext(id, ac.signal);
      } catch (e) {
        if (ac.signal.aborted || !sessions.has(id) || sessions.get(id) !== s) return { id, status: 'aborted' };
        s.retryCount = (s.retryCount || 0) + 1;
        const throttled = Number(e?.httpStatus || 0) === 429;
        const errorText = throttled ? 'request throttled' : 'request failed';
        setStatus(id, 'error', { errorMsg: errorText, transient: true });
        EventBus.emit('room:transient-error', { id, error: errorText });
        let wait;
        if (throttled) {
          const requestedWait = Math.max(0, Number(e?.retryAfterMs || 0));
          wait = Math.max(requestedWait, Math.min(5 * 60 * 1000, 30000 * Math.pow(1.8, Math.min(5, s.retryCount - 1))));
          rateLimitUntil = Math.max(rateLimitUntil, Date.now() + wait);
        } else {
          wait = Math.min(60000, store.state.settings.pollMs.error * Math.pow(1.6, s.retryCount));
        }
        schedulePoll(id, wait);
        return { id, status: throttled ? 'throttled' : 'error', retryAfterMs: wait };
      }

      if (ac.signal.aborted || !sessions.has(id) || sessions.get(id) !== s) return { id, status: 'aborted' };
      if (s.abortController === ac) s.abortController = null;

      s.retryCount = 0;
      const cfg = store.state.settings.pollMs;

      if (data.room_status === 'offline') {
        setStatus(id, 'offline');
        destroyPlayer(id);
        s = sessions.get(id) || s;
        s.video = null;
        sessions.set(id, s);
        schedulePoll(id, cfg.offline);
        return { id, status: 'offline' };
      }
      if (['private', 'hidden', 'away', 'secret', 'group', 'password'].includes(String(data.room_status || '').toLowerCase())) {
        setStatus(id, 'private', { privateLabel: data.room_status });
        destroyPlayer(id);
        sessions.set(id, sessions.get(id) || s);
        schedulePoll(id, cfg.private);
        return { id, status: 'private' };
      }
      if (!data.hls_source) {
        setStatus(id, 'error', { errorMsg: 'no stream' });
        schedulePoll(id, cfg.error);
        return { id, status: 'error' };
      }
      if (!isSafeStreamUrl(data.hls_source)) {
        setStatus(id, 'error', { errorMsg: 'invalid stream url' });
        schedulePoll(id, cfg.error);
        return { id, status: 'error' };
      }

      // 在线 —— 触发 UI 创建 video，再回调 attach。
      // v15.5: 如果只是例行探测且流地址没变、video 仍在播放，不重建 video/HLS。
      // 这能消除多窗口/多房间场景中周期性 attach/detach 造成的闪屏。
      if (!sessions.has(id) || sessions.get(id) !== s) return { id, status: 'aborted' };
      const prevSource = s.hlsSource;
      const hasLiveVideo = !!s.video && !s.video.ended && (s.hls || s.video.src || s.video.srcObject);
      const sameActiveStream = s.status === 'online' && hasLiveVideo && prevSource === data.hls_source;
      s.hlsSource = data.hls_source;
      const viewerCount = numeric(data.num_users ?? data.viewer_count ?? data.users_in_room, 0);
      setStatus(id, 'online', viewerCount > 0 ? { viewerCount } : {});
      if (!sessions.has(id) || sessions.get(id) !== s) return { id, status: 'aborted' };
      if (!sameActiveStream) EventBus.emit('room:online', { id, hlsSource: data.hls_source });
      if (sessions.has(id) && sessions.get(id) === s) schedulePoll(id, cfg.online || onlinePollMs());
      return { id, status: 'online' };
    }

    function startHls(id, hlsSource) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (!s || !s.video || !isSafeStreamUrl(hlsSource)) return;
      const video = s.video;
      s.hlsSource = hlsSource;

      destroyHls(s);

      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ liveDurationInfinity: true, lowLatencyMode: true, maxBufferLength: 10 });
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (sessions.get(id)?.hls === hls) {
            applyHlsQuality(hls, id);
            if (sessions.get(id)?.userPaused) video.pause();
            else video.play().catch(() => {});
          }
        });
        if (Hls.Events.LEVELS_UPDATED) {
          hls.on(Hls.Events.LEVELS_UPDATED, () => {
            if (sessions.get(id)?.hls === hls) applyHlsQuality(hls, id);
          });
        }
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal || sessions.get(id)?.hls !== hls) return;
          // 致命错误：尝试 recover，多次失败后回到状态轮询
          s.retryCount = (s.retryCount || 0) + 1;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try { hls.startLoad(); } catch (_) {}
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try { hls.recoverMediaError(); } catch (_) {}
          }
          if (s.retryCount > 3) {
            destroyPlayer(id);
            // 退避后重新走 connect 流程（重新拉接口）
            const wait = Math.min(30000, 2000 * Math.pow(1.5, s.retryCount));
            if (sessions.has(id)) schedulePoll(id, wait);
            setStatus(id, 'error', { errorMsg: 'stream broken' });
          }
        });
        s.hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSource;
        video.addEventListener('loadedmetadata', () => {
          if (sessions.get(id)?.userPaused) video.pause();
          else video.play().catch(() => {});
        }, { once: true });
      }
    }

    function refresh(id) {
      id = normalizeUsername(id);
      // 强制重连：清理旧 hls + video + timer，再走 connect，避免刷新时双音轨。
      const s = sessions.get(id);
      if (s) {
        clearPoll(s)
        destroyHls(s);
        hardStopVideo(s.video);
        s.video = null;
        s.hlsSource = null;
      }
      if (!sessions.has(id)) sessions.set(id, { retryCount: 0 });
      return connect(id);
    }
    function probe(id) {
      id = normalizeUsername(id);
      if (!sessions.has(id)) sessions.set(id, { retryCount: 0, background: true });
      return connect(id);
    }
    async function refreshMany(ids, options = {}) {
      const unique = [...new Set((Array.isArray(ids) ? ids : []).map(normalizeUsername).filter(isLikelyUsername))];
      const concurrency = clampInt(options.concurrency, 1, 4, 2);
      const spacingMs = clampInt(options.spacingMs, 0, 2000, 300);
      const results = new Array(unique.length);
      let cursor = 0;
      let completed = 0;
      const worker = async () => {
        while (cursor < unique.length) {
          const index = cursor++;
          const id = unique[index];
          let result;
          try { result = await probe(id); }
          catch (error) { result = { id, status: 'error', error: String(error?.message || error) }; }
          results[index] = result || { id, status: 'unknown' };
          completed++;
          try { options.onProgress?.({ completed, total: unique.length, id, result: results[index] }); } catch (_) {}
          if (spacingMs && cursor < unique.length) await new Promise(resolve => setTimeout(resolve, spacingMs));
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, unique.length)) }, worker));
      return results;
    }
    function refreshAll() { return refreshMany([...sessions.keys()]); }
    function start(id, options = {}) {
      id = normalizeUsername(id);
      // 幂等：已有 session 就跳过（避免切分组时重复启动轮询）
      if (sessions.has(id)) {
        if (!options.background) sessions.get(id).background = false;
        return;
      }
      sessions.set(id, { retryCount: 0, background: !!options.background });
      connect(id);
    }
    function startBackground(id) { start(id, { background: true }); }
    function promote(id) {
      id = normalizeUsername(id);
      const s = sessions.get(id);
      if (s) s.background = false;
    }
    function stop(id) { id = normalizeUsername(id); destroyPlayer(id); sessions.delete(id); }
    function stopAll() { for (const id of [...sessions.keys()]) stop(id); stopAllPageMedia(); }
    function has(id) { id = normalizeUsername(id); return sessions.has(id); }

    return { start, startBackground, promote, stop, stopAll, refresh, refreshAll, refreshMany, attachVideo, detachVideo, startHls, has, pause, resume, togglePause, isPaused, pauseAll, resumeAll, refreshQuality, setQualityCap, clearQualityCaps };
  }

  /* =============================================================
   * 4.5. 用户名过滤 / Username validation
   *      已移除 followed-cams 自动抓取导入；这里只保留全站通用的用户名白名单与保留路径过滤。
   * ============================================================= */
  const USERNAME_EXCLUDE = new Set([
    'tags', 'tag', 'auth', 'followed-cams', 'multicam', 'events', 'jobs', 'terms',
    'privacy', 'support', 'billing', 'accounts', 'b', 'p', 'apps', 'affiliates',
    'static', 'feedback', 'sitemap', 'home', 'about', 'rules', 'login', 'logout',
    'signup', 'female-cams', 'male-cams', 'couple-cams', 'trans-cams', 's',
    'shortcuts', 'roomlist', 'photo_videos', 'in-private-show', 'external_link',
    'dmca', 'contact', 'mobile', 'tipping', 'tokens', 'token-purchase',
    'social', 'wiki', 'directory', 'spy-on-cams', 'private-shows', 'app',
    'photos-videos', 'pm', 'inbox', 'find-friends', 'broadcasters', 'broadcast',
    'discover', 'top', 'new', 'gold-shows', 'language', 'settings',
    'en', 'es', 'de', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh',
  ]);

  function isLikelyUsername(name) {
    name = normalizeUsername(name);
    if (!name) return false;
    if (USERNAME_EXCLUDE.has(name.toLowerCase())) return false;
    return usernameSyntaxOk(name);
  }

  function roomPageUrl(name) {
    const username = normalizeUsername(name);
    return username ? `${location.origin}/${encodeURIComponent(username)}/` : '';
  }

  function recuProfileUrl(name) {
    const username = normalizeUsername(name);
    return username ? `https://recu.me/performer/${encodeURIComponent(username)}` : '';
  }

  async function copyRoomPageLink(name) {
    const url = roomPageUrl(name);
    if (!url) return false;
    const copied = await copyText(url);
    toast(copied ? t('copied') : (LANG === 'zh' ? '复制失败' : 'Copy failed'));
    return copied;
  }

  function openRoomRecuProfile(name) {
    const url = recuProfileUrl(name);
    if (url) openBackgroundTab(url);
  }

  /* =============================================================
   * 5. 事件总线 / EventBus
   * ============================================================= */
  const EventBus = (() => {
    const m = new Map();
    return {
      on(ev, fn) { (m.get(ev) || m.set(ev, new Set()).get(ev)).add(fn); return () => m.get(ev).delete(fn); },
      emit(ev, payload) { (m.get(ev) || []).forEach(fn => { try { fn(payload); } catch (_) {} }); },
    };
  })();

  /* =============================================================
   * 5.5. Unified Recorder Hub
   * One background Chaturbate tab owns every recording. Other Suite surfaces
   * only enqueue commands and render the Hub's lightweight state snapshot.
   * ============================================================= */
  const RECORDER_COMMAND_KEY = 'ziggy_recorder_commands_v1';
  const RECORDER_STATE_KEY = 'ziggy_recorder_state_v1';
  const RECORDER_HEARTBEAT_KEY = 'ziggy_recorder_heartbeat_v1';
  const RECORDER_CHANNEL_NAME = 'ziggy_recorder_hub_v1';
  const RECORDER_OWNER_KEY = 'ziggy_recorder_owner_v1';
  const RECORDER_ACK_KEY = 'ziggy_recorder_ack_v1';
  const RECORDER_OWNER_TTL_MS = 6500;
  const RECORDER_STOP_ACK_TIMEOUT_MS = 30000;
  const RECORDER_HUB_WINDOW_NAME = 'ziggy-recorder-hub';

  function readRecorderOwnerLease() {
    try {
      const lease = JSON.parse(localStorage.getItem(RECORDER_OWNER_KEY) || 'null');
      return lease && typeof lease.id === 'string' && Number.isFinite(Number(lease.ts)) ? lease : null;
    } catch (_) { return null; }
  }

  function recorderOwnerLeaseFresh(lease = readRecorderOwnerLease()) {
    return !!lease && Date.now() - Number(lease.ts || 0) < RECORDER_OWNER_TTL_MS;
  }

  function legacyRecorderHeartbeatFresh() {
    return Date.now() - Number(localStorage.getItem(RECORDER_HEARTBEAT_KEY) || 0) < RECORDER_OWNER_TTL_MS;
  }

  function recorderServiceFresh() {
    return recorderOwnerLeaseFresh() || legacyRecorderHeartbeatFresh();
  }

  function reserveRecorderOwner() {
    if (recorderServiceFresh()) return false;
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const now = Date.now();
      localStorage.setItem(RECORDER_OWNER_KEY, JSON.stringify({ id, ts: now }));
      localStorage.setItem(RECORDER_HEARTBEAT_KEY, String(now));
      return readRecorderOwnerLease()?.id === id;
    } catch (_) { return false; }
  }

  function claimRecorderOwner(instanceId) {
    const lease = readRecorderOwnerLease();
    if (recorderOwnerLeaseFresh(lease)) {
      if (lease.id === instanceId) return true;
      if (!lease.id.startsWith('pending-')) return false;
    } else if (legacyRecorderHeartbeatFresh()) {
      // Compatibility with an older Hub that has no owner lease but is still
      // actively recording.
      return false;
    }
    try {
      const now = Date.now();
      localStorage.setItem(RECORDER_OWNER_KEY, JSON.stringify({ id: instanceId, ts: now }));
      localStorage.setItem(RECORDER_HEARTBEAT_KEY, String(now));
      return readRecorderOwnerLease()?.id === instanceId;
    } catch (_) { return false; }
  }

  function renewRecorderOwner(instanceId) {
    const lease = readRecorderOwnerLease();
    if (lease?.id !== instanceId) return false;
    try {
      const now = Date.now();
      localStorage.setItem(RECORDER_OWNER_KEY, JSON.stringify({ id: instanceId, ts: now }));
      localStorage.setItem(RECORDER_HEARTBEAT_KEY, String(now));
      return true;
    } catch (_) { return false; }
  }

  function releaseRecorderOwner(instanceId) {
    const lease = readRecorderOwnerLease();
    if (lease?.id !== instanceId) return;
    try {
      localStorage.removeItem(RECORDER_OWNER_KEY);
      localStorage.setItem(RECORDER_HEARTBEAT_KEY, '0');
    } catch (_) {}
  }

  const UnifiedRecorder = (() => {
    const recordings = new Map();
    const listeners = new Set();
    const stopPending = new Map();
    const completedStatuses = new Set(['saved', 'failed', 'stopped', 'interrupted']);
    let channel = null;
    try { channel = new BroadcastChannel(RECORDER_CHANNEL_NAME); } catch (_) {}

    function notify() {
      try { document.dispatchEvent(new CustomEvent('ziggy-recorder:state')); } catch (_) {}
      listeners.forEach(fn => { try { fn(recordings); } catch (_) {} });
    }

    function applySnapshot(snapshot) {
      const rows = Array.isArray(snapshot?.recordings) ? snapshot.recordings : [];
      const previous = new Map(recordings);
      const next = new Map();
      const now = Date.now();
      rows.forEach(row => {
        const id = normalizeUsername(row?.id);
        if (!isLikelyUsername(id)) return;
        const local = previous.get(id);
        const pending = stopPending.get(id);
        if (pending && local?.status === 'finalizing' && row?.status !== 'finalizing' && !completedStatuses.has(row?.status)) {
          next.set(id, local);
          return;
        }
        if (completedStatuses.has(row?.status)) stopPending.delete(id);
        next.set(id, { ...row, id });
      });
      stopPending.forEach((pending, id) => {
        if (next.has(id)) return;
        const local = previous.get(id);
        const age = now - Number(pending?.requestedAt || 0);
        if (local?.status === 'finalizing' && age < RECORDER_STOP_ACK_TIMEOUT_MS && recorderServiceFresh()) next.set(id, local);
        else stopPending.delete(id);
      });
      recordings.clear();
      next.forEach((row, id) => recordings.set(id, row));
      notify();
    }

    function applyCommandAck(ack) {
      if (!ack?.commandId) return;
      const matches = [...stopPending.entries()].filter(([, pending]) => pending?.commandId === ack.commandId);
      if (!matches.length) return;
      matches.forEach(([id, pending]) => {
        const row = recordings.get(id);
        if (ack.status === 'accepted') {
          pending.acknowledgedAt = Number(ack.ts || Date.now());
          stopPending.set(id, pending);
          if (row) recordings.set(id, {
            ...row,
            status: 'finalizing',
            stopAcknowledged: true,
            finalizingProgress: Math.max(5, Number(row.finalizingProgress || 0)),
          });
        } else if (ack.status === 'completed') {
          stopPending.delete(id);
          if (row && ack.result === 'missing') recordings.delete(id);
        }
      });
      if (ack.status === 'completed') loadSnapshot();
      else notify();
    }

    function loadSnapshot() {
      try { applySnapshot(JSON.parse(localStorage.getItem(RECORDER_STATE_KEY) || '{}')); } catch (_) {}
    }

    function enqueue(action, id = '') {
      id = normalizeUsername(id);
      const command = { commandId: `${Date.now()}_${Math.random().toString(36).slice(2)}`, action, id, ts: Date.now() };
      let queue = [];
      try { queue = JSON.parse(localStorage.getItem(RECORDER_COMMAND_KEY) || '[]'); } catch (_) {}
      if (!Array.isArray(queue)) queue = [];
      queue.push(command);
      localStorage.setItem(RECORDER_COMMAND_KEY, JSON.stringify(queue.slice(-100)));
      try { channel?.postMessage({ type: 'command', command }); } catch (_) {}
      return command;
    }

    function heartbeatFresh() {
      return recorderServiceFresh();
    }

    function openHub(active = false) {
      if (heartbeatFresh()) {
        try { channel?.postMessage({ type: 'focus-hub', active: !!active }); } catch (_) {}
        return null;
      }
      if (!reserveRecorderOwner()) {
        try { channel?.postMessage({ type: 'focus-hub', active: !!active }); } catch (_) {}
        return null;
      }
      const url = canonicalRecorderHubUrl();
      try {
        if (typeof GM_openInTab === 'function') return GM_openInTab(url, { active: !!active, insert: true, setParent: true });
      } catch (_) {}
      return active ? openNoopener(url) : openBackgroundTab(url);
    }

    function ensureHub() {
      if (!heartbeatFresh()) openHub(false);
    }

    function start(id) {
      id = normalizeUsername(id);
      if (!isLikelyUsername(id)) return false;
      recordings.set(id, {
        id, status: 'connecting', startedAt: Date.now(), recordedMs: 0,
        waitingMs: 0, bytes: 0, manualPaused: false, sourceStatus: 'unknown',
      });
      notify();
      enqueue('start', id);
      ensureHub();
      return true;
    }

    function stop(id) {
      id = normalizeUsername(id);
      if (!id) return false;
      const row = recordings.get(id);
      const command = enqueue('stop', id);
      stopPending.set(id, { commandId: command.commandId, requestedAt: Date.now(), acknowledgedAt: 0 });
      if (row) recordings.set(id, {
        ...row,
        status: 'finalizing',
        stopRequestedAt: Date.now(),
        stopAcknowledged: false,
        finalizingProgress: Math.max(1, Number(row.finalizingProgress || 0)),
      });
      notify();
      ensureHub();
      return true;
    }

    function pause(id) {
      id = normalizeUsername(id);
      const row = recordings.get(id);
      if (!row || ['finalizing', 'saved'].includes(row.status)) return false;
      recordings.set(id, { ...row, manualPaused: true, status: 'manual-paused' });
      notify();
      enqueue('pause', id);
      ensureHub();
      return true;
    }

    function resume(id) {
      id = normalizeUsername(id);
      const row = recordings.get(id);
      if (!row || ['finalizing', 'saved'].includes(row.status)) return false;
      recordings.set(id, { ...row, manualPaused: false, status: 'connecting' });
      notify();
      enqueue('resume', id);
      ensureHub();
      return true;
    }

    function toggle(id) {
      id = normalizeUsername(id);
      if (has(id)) return stop(id);
      if (recordings.has(id)) { recordings.delete(id); notify(); }
      return start(id);
    }
    function stopAll() {
      const command = enqueue('stop-all');
      const now = Date.now();
      recordings.forEach((row, id) => {
        if (completedStatuses.has(row?.status)) return;
        stopPending.set(id, { commandId: command.commandId, requestedAt: now, acknowledgedAt: 0 });
        recordings.set(id, {
          ...row,
          status: 'finalizing',
          stopRequestedAt: now,
          stopAcknowledged: false,
          finalizingProgress: Math.max(1, Number(row.finalizingProgress || 0)),
        });
      });
      notify();
      ensureHub();
    }
    function retry(id) { enqueue('retry', id); ensureHub(); }
    function has(id) {
      const row = recordings.get(normalizeUsername(id));
      return heartbeatFresh() && !!row && !completedStatuses.has(row.status);
    }
    function get(id) { return recordings.get(normalizeUsername(id)) || null; }
    function countActive() {
      let count = 0;
      recordings.forEach(row => { if (!completedStatuses.has(row?.status)) count++; });
      return heartbeatFresh() ? count : 0;
    }
    function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    channel && (channel.onmessage = event => {
      if (event.data?.type === 'state') applySnapshot(event.data.snapshot || {});
      else if (event.data?.type === 'command-ack') applyCommandAck(event.data.ack || {});
    });
    window.addEventListener('storage', event => {
      if (event.key === RECORDER_STATE_KEY) loadSnapshot();
      else if (event.key === RECORDER_ACK_KEY) {
        try { applyCommandAck(JSON.parse(event.newValue || '{}')); } catch (_) {}
      }
    });
    loadSnapshot();
    if (!heartbeatFresh() && recordings.size) { recordings.clear(); notify(); }
    return { recordings, start, pause, resume, stop, stopAll, retry, toggle, has, get, countActive, openHub, subscribe, loadSnapshot };
  })();
  window.__ziggyUnifiedRecorder = UnifiedRecorder;

  function initRecorderHub() {
    stopAllPageMedia();
    document.title = RECORDER_TAB_TITLE;
    try { window.name = RECORDER_HUB_WINDOW_NAME; } catch (_) {}
    document.documentElement.classList.add('ziggy-recorder-hub');
    document.body.replaceChildren();

    const hubInstanceId = crypto.randomUUID?.() || `hub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let ownsRecorder = claimRecorderOwner(hubInstanceId);
    const jobs = new Map();
    const processedCommands = new Set();
    const channel = (() => { try { return new BroadcastChannel(RECORDER_CHANNEL_NAME); } catch (_) { return null; } })();
    const hubStore = {
      state: {
        rooms: [],
        settings: {
          maxStreamHeight: 1080,
          notifyFavoritesOnly: false,
          notifyOnline: false,
          pollMs: { online: 12000, offline: 15000, private: 15000, error: 5000 },
        },
      },
      patchRoom(id, patch) {
        id = normalizeUsername(id);
        let room = this.state.rooms.find(item => item.id === id);
        if (!room) { room = { id, lastStatus: 'unknown', groups: [DEFAULT_GROUP_ID] }; this.state.rooms.push(room); }
        Object.assign(room, patch || {});
      },
    };
    const service = createRoomService(hubStore);

    document.head.appendChild($('style', { html: trustedHtml(`
      html.ziggy-recorder-hub,html.ziggy-recorder-hub body{margin:0;min-height:100%;background:#17202a;color:#f1f1f1;font-family:UbuntuRegular,Arial,sans-serif}
      .rec-hub{box-sizing:border-box;max-width:980px;margin:0 auto;padding:24px}.rec-head{display:flex;gap:14px;align-items:center;justify-content:space-between;border-bottom:1px solid #2d3e50;padding-bottom:18px}
      .rec-title{font:700 24px/1.2 UbuntuMedium,UbuntuRegular,Arial,sans-serif}.rec-sub{color:#b3b3b3;font-size:13px;margin-top:5px}.rec-actions{display:flex;gap:8px;flex-wrap:wrap}
      .rec-btn{box-sizing:border-box;min-height:38px;border:1px solid #2d3e50;border-radius:4px;background:#202c39;color:#f1f1f1;padding:0 14px;cursor:pointer}.rec-btn:hover{background:#253648}.rec-btn.danger{background:#8b1d1d;border-color:#a52a2a}.rec-btn.primary{background:#0c6a93;border-color:#0c6a93}
      .rec-list{display:grid;gap:12px;margin-top:18px}.rec-empty{padding:36px 16px;border:1px dashed #2d3e50;color:#b3b3b3;text-align:center}.rec-row{border:1px solid #2d3e50;border-radius:4px;background:#202c39;padding:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center}.rec-copy{min-width:0}
      .rec-row.is-recording{border-left:4px solid #ef4444}.rec-row.is-waiting{border-left:4px solid #d97706}.rec-row.is-finalizing{border-left:4px solid #68b5f0}.rec-name{overflow-wrap:anywhere;font:700 16px/1.2 UbuntuMedium,UbuntuRegular,Arial,sans-serif;color:#68b5f0}.rec-meta{margin-top:7px;color:#b3b3b3;font-size:12px;line-height:1.55;overflow-wrap:anywhere}.rec-progress{height:8px;background:#17202a;border-radius:999px;margin-top:10px;overflow:hidden}.rec-progress>i{display:block;height:100%;background:#68b5f0;transition:width .2s}.rec-hidden-media{position:fixed;left:-10000px;top:-10000px;width:2px;height:2px;overflow:hidden}
      @media(max-width:640px){
        .rec-hub{width:100%;padding:12px max(10px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))}
        .rec-head{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;padding-bottom:14px}.rec-title{font-size:21px}.rec-sub{font-size:12px;line-height:1.4}
        .rec-head>.rec-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0}.rec-head>.rec-actions .rec-btn{width:100%;min-width:0;padding:0 8px}
        .rec-list{gap:10px;margin-top:12px}.rec-empty{padding:28px 12px}.rec-row{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;padding:12px 10px}
        .rec-row>.rec-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:0}.rec-row>.rec-actions .rec-btn{width:100%;min-width:0;min-height:42px;padding:0 8px}.rec-row>.rec-actions .rec-btn.danger:last-child:nth-child(odd){grid-column:1/-1}
        .rec-meta{font-size:11px;line-height:1.6}.rec-progress{height:10px}
      }
    `) }));

    const list = $('div', { class: 'rec-list', 'aria-live': 'polite' });
    const hubRows = new Map();
    const shell = $('main', { class: 'rec-hub' }, [
      $('header', { class: 'rec-head' }, [
        $('div', {}, [
          $('div', { class: 'rec-title' }, t('recorderHubTitle')),
          $('div', { class: 'rec-sub' }, t('recorderHubSubtitle')),
        ]),
        $('div', { class: 'rec-actions' }, [
          $('button', { class: 'rec-btn', onclick: () => openNoopener(canonicalWorkshopUrl()) }, t('dockOpen')),
          $('button', { class: 'rec-btn danger', onclick: () => ownsRecorder ? [...jobs.keys()].forEach(stopJob) : UnifiedRecorder.stopAll() }, t('stopAllRecordings')),
        ]),
      ]),
      list,
      $('div', { class: 'rec-hidden-media', id: 'rec-hidden-media' }),
    ]);
    document.body.appendChild(shell);

    function formatDuration(ms) {
      const seconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }

    function formatBytes(bytes) {
      const n = Math.max(0, Number(bytes) || 0);
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
      if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
      return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }

    function recorderMimeType() {
      if (typeof MediaRecorder === 'undefined') return '';
      // WebM is the only long-running MediaRecorder container that currently
      // produces dependable timesliced chunks in both Chromium and Firefox.
      // Chromium advertises MP4 recording before every MP4 pipeline can
      // actually flush canvas + audio data, which left the Hub at 0.0 KB.
      return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=h264,aac', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4']
        .find(type => { try { return MediaRecorder.isTypeSupported(type); } catch (_) { return false; } }) || '';
    }

    function fileStamp(ts) {
      const d = new Date(ts || Date.now());
      const two = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}_${two(d.getHours())}-${two(d.getMinutes())}-${two(d.getSeconds())}`;
    }

    function currentRecordedMs(job) {
      return Number(job.recordedMs || 0) + (job.recordingSince ? Date.now() - job.recordingSince : 0);
    }

    function currentWaitingMs(job) {
      return Number(job.waitingMs || 0) + (job.waitingSince ? Date.now() - job.waitingSince : 0);
    }

    function freezeClocks(job) {
      const now = Date.now();
      if (job.recordingSince) job.recordedMs = Number(job.recordedMs || 0) + Math.max(0, now - job.recordingSince);
      if (job.waitingSince) job.waitingMs = Number(job.waitingMs || 0) + Math.max(0, now - job.waitingSince);
      job.recordingSince = 0;
      job.waitingSince = 0;
    }

    function pauseClock(job) {
      if (job.recordingSince) job.recordedMs = currentRecordedMs(job);
      job.recordingSince = 0;
      if (!job.waitingSince) job.waitingSince = Date.now();
    }

    function resumeClock(job) {
      if (!job.recordingSince) job.recordingSince = Date.now();
      if (job.waitingSince) job.waitingMs = Number(job.waitingMs || 0) + Date.now() - job.waitingSince;
      job.waitingSince = 0;
    }

    function summary(job) {
      const terminal = !!job.finalizing || ['finalizing', 'saved', 'failed', 'stopped', 'interrupted'].includes(job.status);
      return {
        id: job.id,
        status: job.status,
        startedAt: job.startedAt,
        recordedMs: terminal ? Number(job.recordedMs || 0) : currentRecordedMs(job),
        waitingMs: terminal ? Number(job.waitingMs || 0) : currentWaitingMs(job),
        bytes: Number(job.bytes || 0),
        resolution: job.width && job.height ? `${job.width}×${job.height}` : '',
        audio: !!job.audioEnabled,
        mimeType: job.mimeType || '',
        filename: job.filename || '',
        error: job.error || '',
        manualPaused: !!job.manualPaused,
        sourceStatus: job.sourceStatus || '',
        finalizingProgress: Number(job.finalizingProgress || 0),
        offlineDeadline: Number(job.offlineDeadline || 0),
      };
    }

    function publishState() {
      if (!ownsRecorder) { UnifiedRecorder.loadSnapshot(); render(); return; }
      const snapshot = { updatedAt: Date.now(), recordings: [...jobs.values()].map(summary) };
      try { localStorage.setItem(RECORDER_STATE_KEY, JSON.stringify(snapshot)); } catch (_) {}
      try { channel?.postMessage({ type: 'state', snapshot }); } catch (_) {}
      render();
    }

    function publishCommandAck(command, status, result = '') {
      if (!command?.commandId) return;
      const ack = {
        commandId: command.commandId,
        action: command.action || '',
        id: normalizeUsername(command.id),
        status,
        result,
        ts: Date.now(),
      };
      try { localStorage.setItem(RECORDER_ACK_KEY, JSON.stringify(ack)); } catch (_) {}
      try { channel?.postMessage({ type: 'command-ack', ack }); } catch (_) {}
    }

    function statusLabel(job) {
      if (job.manualPaused || job.status === 'manual-paused') return t('recorderPausedManual');
      if (job.status === 'recording') return t('recorderRecording');
      if (job.status === 'private') return t('recorderPausedPrivate');
      if (job.status === 'offline' || job.status === 'reconnecting') {
        const left = Math.max(0, Number(job.offlineDeadline || 0) - Date.now());
        const countdown = t('recorderPausedOffline', formatDuration(left));
        return job.status === 'reconnecting' ? `${t('recorderRetrying')} · ${countdown}` : countdown;
      }
      if (job.status === 'finalizing') return `${t('recorderStopped')} · ${t('recorderFinalizing')} ${Math.round(job.finalizingProgress || 0)}%`;
      if (job.status === 'saved') return t('recorderSaved');
      if (job.status === 'stopped') return job.error || t('recorderStoppedNoData');
      if (job.status === 'interrupted') return job.error || t('recorderInterrupted');
      if (job.status === 'failed') return job.error || t('recordingNoData');
      if (job.status === 'error') return job.error || t('recorderRetrying');
      return t('recorderConnecting');
    }

    function createHubRow(id) {
      const name = $('div', { class: 'rec-name' }, id);
      const meta = $('div', { class: 'rec-meta' });
      const progressFill = $('i');
      const progress = $('div', { class: 'rec-progress', hidden: true, role: 'progressbar', 'aria-label': t('recorderFinalizing') }, [progressFill]);
      const openButton = $('button', { class: 'rec-btn', onclick: () => openNoopener(`${location.origin}/${encodeURIComponent(id)}/`) }, t('recorderOpenRoom'));
      const retryButton = $('button', { class: 'rec-btn primary', onclick: () => ownsRecorder ? retryJob(id) : UnifiedRecorder.retry(id) }, t('recorderRetry'));
      const pauseButton = $('button', { class: 'rec-btn', onclick: () => {
        const job = (ownsRecorder ? jobs : UnifiedRecorder.recordings).get(id);
        if (!job) return;
        if (ownsRecorder) job.manualPaused ? resumeJob(id) : pauseJob(id);
        else job.manualPaused ? UnifiedRecorder.resume(id) : UnifiedRecorder.pause(id);
      } }, t('recorderPause'));
      const stopButton = $('button', { class: 'rec-btn danger', onclick: () => ownsRecorder ? stopJob(id) : UnifiedRecorder.stop(id) }, t('opRecordStop'));
      const row = $('section', { class: 'rec-row is-waiting', dataset: { recorderId: id } }, [
        $('div', { class: 'rec-copy' }, [name, meta, progress]),
        $('div', { class: 'rec-actions' }, [openButton, retryButton, pauseButton, stopButton]),
      ]);
      const entry = { row, name, meta, progress, progressFill, retryButton, pauseButton, stopButton };
      hubRows.set(id, entry);
      return entry;
    }

    function render() {
      const visibleJobs = ownsRecorder ? jobs : UnifiedRecorder.recordings;
      if (!visibleJobs.size) {
        hubRows.forEach(entry => entry.row.remove());
        hubRows.clear();
        if (!list.querySelector('.rec-empty')) list.replaceChildren($('div', { class: 'rec-empty' }, t('recordingCenterEmpty')));
        return;
      }
      list.querySelector('.rec-empty')?.remove();
      const liveIds = new Set(visibleJobs.keys());
      hubRows.forEach((entry, id) => {
        if (!liveIds.has(id)) { entry.row.remove(); hubRows.delete(id); }
      });
      visibleJobs.forEach(job => {
        const entry = hubRows.get(job.id) || createHubRow(job.id);
        const terminal = !!job.finalizing || ['finalizing', 'saved', 'failed', 'stopped', 'interrupted'].includes(job.status);
        const recordedMs = terminal ? Number(job.recordedMs || 0) : currentRecordedMs(job);
        const waitingMs = terminal ? Number(job.waitingMs || 0) : currentWaitingMs(job);
        const resolution = job.resolution || (job.width && job.height ? `${job.width}×${job.height}` : '—');
        entry.row.className = `rec-row is-${job.status === 'recording' ? 'recording' : (job.status === 'finalizing' ? 'finalizing' : 'waiting')}`;
        entry.meta.replaceChildren(
          document.createTextNode(`${statusLabel(job)} · ${t('recordingDuration')}: ${formatDuration(recordedMs)} · ${t('recorderWaitingTime')}: ${formatDuration(waitingMs)}`),
          $('br'),
          document.createTextNode(`${resolution} · ${job.audioEnabled || job.audio ? t('recorderAudioOn') : t('recorderAudioOff')} · ${formatBytes(job.bytes)}`),
        );
        const progressValue = Math.max(1, Number(job.finalizingProgress || 0));
        entry.progress.hidden = job.status !== 'finalizing';
        entry.progress.setAttribute('aria-valuemin', '0');
        entry.progress.setAttribute('aria-valuemax', '100');
        entry.progress.setAttribute('aria-valuenow', String(Math.round(progressValue)));
        entry.progressFill.style.width = `${progressValue}%`;
        entry.retryButton.hidden = job.status !== 'error';
        entry.pauseButton.hidden = terminal;
        entry.pauseButton.textContent = job.manualPaused ? t('recorderResume') : t('recorderPause');
        entry.stopButton.hidden = terminal;
        if (!entry.row.isConnected) list.appendChild(entry.row);
      });
    }

    async function prepareSink(job) {
      job.chunks = [];
      job.writeQueue = Promise.resolve();
      job.storageFailed = false;
      job.storageError = '';
      job.lastStorageEstimateAt = 0;
      if (!navigator.storage?.getDirectory) return;
      try {
        await navigator.storage.persist?.().catch(() => false);
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle('ziggy-recorder', { create: true });
        job.opfsDir = dir;
        job.opfsName = `${safeFilePart(job.id)}-${job.startedAt}.part`;
        job.fileHandle = await dir.getFileHandle(job.opfsName, { create: true });
        job.writer = await job.fileHandle.createWritable();
      } catch (_) {
        job.writer = null;
        job.fileHandle = null;
      }
    }

    function isQuotaError(error) {
      return error?.name === 'QuotaExceededError' || /quota|storage.*full|disk.*full|not enough space/i.test(String(error?.message || error || ''));
    }

    function withTimeout(promise, timeoutMs, message) {
      let timer = 0;
      return Promise.race([
        Promise.resolve(promise),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); }),
      ]).finally(() => clearTimeout(timer));
    }

    async function assertStorageHeadroom(job, incomingBytes) {
      if (!navigator.storage?.estimate || Date.now() - Number(job.lastStorageEstimateAt || 0) < 30000) return;
      job.lastStorageEstimateAt = Date.now();
      const estimate = await navigator.storage.estimate();
      const quota = Number(estimate.quota || 0);
      const usage = Number(estimate.usage || 0);
      if (!quota) return;
      const reserve = Math.max(512 * 1024 * 1024, Math.min(2 * 1024 * 1024 * 1024, quota * 0.05));
      if (quota - usage - Number(incomingBytes || 0) >= reserve) return;
      const error = new Error('Storage is nearly full; saving the recorded part now');
      error.name = 'QuotaExceededError';
      throw error;
    }

    function handleStorageFailure(job, error) {
      if (!job || job.storageFailed) return;
      job.storageFailed = true;
      job.storageError = String(error?.message || error || 'Recording storage failed');
      job.error = isQuotaError(error) ? `Storage limit reached. Saving the recorded part…` : `${job.storageError}. Saving the recorded part…`;
      job.status = 'error';
      pauseClock(job);
      try { if (job.recorder?.state === 'recording') job.recorder.pause(); } catch (_) {}
      publishState();
      setTimeout(() => finalizeJob(job, 'storage-error'), 0);
    }

    function queueChunk(job, chunk) {
      if (!chunk?.size || job.storageFailed || job.acceptChunks === false) return;
      job.bytes += chunk.size;
      if (job.writer) {
        job.writeQueue = job.writeQueue
          .then(async () => {
            await assertStorageHeadroom(job, chunk.size);
            await job.writer.write(chunk);
          })
          .catch(error => { handleStorageFailure(job, error); });
      }
      else job.chunks.push(chunk);
    }

    function drawFrame(job) {
      if (!job.canvas || !job.ctx || !job.video) return;
      if (job.video.readyState >= 2 && job.status === 'recording') {
        try {
          job.ctx.drawImage(job.video, 0, 0, job.width, job.height);
          job.canvasTrack?.requestFrame?.();
        } catch (_) {}
      }
    }

    function startFramePump(job) {
      if (!job?.video || job.framePumpActive) return;
      job.framePumpActive = true;
      if (typeof job.video.requestVideoFrameCallback === 'function') {
        const pump = () => {
          if (!job.framePumpActive) return;
          drawFrame(job);
          try { job.frameCallbackId = job.video.requestVideoFrameCallback(pump); } catch (_) { job.frameCallbackId = 0; }
        };
        try { job.frameCallbackId = job.video.requestVideoFrameCallback(pump); } catch (_) { job.frameCallbackId = 0; }
      } else {
        // Older Firefox builds have no requestVideoFrameCallback. 24 fps is a
        // much lighter fallback than an unconditional 30-fps 1080p timer.
        job.drawTimer = setInterval(() => drawFrame(job), 1000 / 24);
      }
    }

    function stopFramePump(job) {
      if (!job) return;
      job.framePumpActive = false;
      if (job.frameCallbackId && typeof job.video?.cancelVideoFrameCallback === 'function') {
        try { job.video.cancelVideoFrameCallback(job.frameCallbackId); } catch (_) {}
      }
      job.frameCallbackId = 0;
      clearInterval(job.drawTimer);
      job.drawTimer = 0;
    }

    async function beginRecorder(job) {
      if (job.recorder) return true;
      if (job.finalizing || !job.video.videoWidth || !job.video.videoHeight) return false;
      const sourceW = job.video.videoWidth;
      const sourceH = job.video.videoHeight;
      const scale = Math.min(1, 1920 / sourceW, 1080 / sourceH);
      job.width = Math.max(2, Math.round(sourceW * scale / 2) * 2);
      job.height = Math.max(2, Math.round(sourceH * scale / 2) * 2);
      job.canvas = document.createElement('canvas');
      job.canvas.width = job.width;
      job.canvas.height = job.height;
      job.ctx = job.canvas.getContext('2d', { alpha: false });
      const canvasStream = job.canvas.captureStream(0);
      const tracks = [...canvasStream.getVideoTracks()];
      job.canvasTrack = tracks[0] || null;
      try {
        const capture = job.video.captureStream || job.video.mozCaptureStream;
        if (typeof capture === 'function') {
          job.mediaElementStream = capture.call(job.video);
          const audioTrack = job.mediaElementStream?.getAudioTracks?.()[0];
          if (audioTrack) { tracks.push(audioTrack); job.audioEnabled = true; }
        }
      } catch (_) { job.mediaElementStream = null; }
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!job.audioEnabled && AudioCtx) {
          job.audioContext = new AudioCtx();
          job.audioDestination = job.audioContext.createMediaStreamDestination();
          job.audioSource = job.audioContext.createMediaElementSource(job.video);
          job.audioSource.connect(job.audioDestination);
          await job.audioContext.resume().catch(() => {});
          const audioTrack = job.audioDestination.stream.getAudioTracks()[0];
          if (audioTrack) { tracks.push(audioTrack); job.audioEnabled = true; }
        }
      } catch (_) { job.audioEnabled = false; }
      job.captureStream = new MediaStream(tracks);
      job.mimeType = recorderMimeType();
      if (!job.mimeType) throw new Error('MediaRecorder format unavailable');
      const videoBitsPerSecond = job.height >= 1080 ? 10000000 : (job.height >= 720 ? 6000000 : Math.max(2500000, Math.round(job.width * job.height * 8)));
      job.recorder = new MediaRecorder(job.captureStream, { mimeType: job.mimeType, videoBitsPerSecond: Math.min(12000000, videoBitsPerSecond), audioBitsPerSecond: 192000 });
      job.acceptChunks = true;
      job.recorder.ondataavailable = event => queueChunk(job, event.data);
      job.recorder.onerror = event => { job.error = event.error?.message || 'Recorder error'; job.status = 'error'; pauseClock(job); publishState(); };
      job.recorder.start(2000);
      drawFrame(job);
      startFramePump(job);
      return true;
    }

    function clearStableTimer(job) { if (job.stableTimer) clearTimeout(job.stableTimer); job.stableTimer = 0; }

    function clearPlaybackRetry(job) {
      if (job.playbackRetryTimer) clearTimeout(job.playbackRetryTimer);
      job.playbackRetryTimer = 0;
    }

    function ensureRecorderPlayback(job, delay = 0) {
      if (!job || job.stopRequested || job.finalizing || job.manualPaused || job.sourceStatus !== 'online') return;
      clearPlaybackRetry(job);
      const attempt = () => {
        if (!jobs.has(job.id) || job.stopRequested || job.finalizing || job.manualPaused || job.sourceStatus !== 'online') return;
        // The Hub is normally opened in a background tab. Muted autoplay is
        // required there; captureStream/Web Audio still captures source audio.
        job.video.muted = true;
        let playResult = null;
        try { playResult = job.video.play(); } catch (_) {}
        withTimeout(Promise.resolve(playResult), 5000, 'Timed out while starting recorder playback').catch(() => {}).finally(() => {
          if (!jobs.has(job.id) || job.stopRequested || job.finalizing || job.manualPaused || job.sourceStatus !== 'online') return;
          if (job.video.readyState >= 2 && job.video.videoWidth && job.video.videoHeight) waitForStablePublic(job);
          else job.playbackRetryTimer = setTimeout(() => ensureRecorderPlayback(job), 1500);
        });
      };
      if (delay > 0) job.playbackRetryTimer = setTimeout(attempt, delay);
      else attempt();
    }

    function waitForStablePublic(job) {
      if (!job || job.stopRequested || job.finalizing) return;
      clearStableTimer(job);
      clearPlaybackRetry(job);
      job.sourceStatus = 'online';
      if (job.manualPaused) {
        job.status = 'manual-paused';
        pauseClock(job);
        publishState();
        return;
      }
      job.status = 'connecting';
      job.error = '';
      pauseClock(job);
      job.stableTimer = setTimeout(async () => {
        if (!jobs.has(job.id) || job.stopRequested || job.finalizing || job.manualPaused) return;
        if (job.video.readyState < 2 || !job.video.videoWidth || !job.video.videoHeight) {
          ensureRecorderPlayback(job);
          publishState();
          return;
        }
        try {
          if (!job.recorder && !(await beginRecorder(job))) {
            ensureRecorderPlayback(job);
            publishState();
            return;
          }
          else if (job.recorder.state === 'paused') job.recorder.resume();
          startFramePump(job);
          job.status = 'recording';
          job.offlineDeadline = 0;
          resumeClock(job);
        } catch (error) {
          job.status = 'error';
          job.error = String(error?.message || error);
        }
        publishState();
      }, 1500);
      publishState();
    }

    function pauseForStatus(job, status) {
      if (!job || job.stopRequested || job.finalizing) return;
      clearStableTimer(job);
      clearPlaybackRetry(job);
      stopFramePump(job);
      pauseClock(job);
      try { if (job.recorder?.state === 'recording') job.recorder.pause(); } catch (_) {}
      job.sourceStatus = status;
      job.status = job.manualPaused ? 'manual-paused' : status;
      if (status === 'offline' || status === 'reconnecting') {
        if (!job.offlineDeadline) job.offlineDeadline = Date.now() + 10 * 60 * 1000;
        clearTimeout(job.offlineTimer);
        job.offlineTimer = setTimeout(() => {
          if (['offline', 'reconnecting'].includes(jobs.get(job.id)?.sourceStatus)) stopJob(job.id, 'offline-timeout');
        }, Math.max(0, job.offlineDeadline - Date.now()));
      } else {
        job.offlineDeadline = 0;
        clearTimeout(job.offlineTimer);
      }
      publishState();
    }

    async function startJob(id) {
      id = normalizeUsername(id);
      if (!isLikelyUsername(id) || jobs.has(id)) return;
      const job = {
        id, startedAt: Date.now(), status: 'connecting', recordedMs: 0, waitingMs: 0,
        waitingSince: Date.now(), bytes: 0, finalizingProgress: 0, audioEnabled: false,
        manualPaused: false, sourceStatus: 'unknown',
      };
      jobs.set(id, job);
      hubStore.state.rooms.push({ id, groups: [DEFAULT_GROUP_ID], lastStatus: 'unknown', muted: true });
      const video = $('video', { muted: true, autoplay: true, playsInline: true, crossOrigin: 'anonymous', dataset: { multicamRoomId: id } });
      job.video = video;
      document.getElementById('rec-hidden-media').appendChild(video);
      const mediaReady = () => {
        if (hubStore.state.rooms.find(room => room.id === id)?.lastStatus === 'online') ensureRecorderPlayback(job);
      };
      ['loadedmetadata', 'loadeddata', 'canplay', 'playing'].forEach(type => video.addEventListener(type, mediaReady));
      video.addEventListener('error', () => ensureRecorderPlayback(job, 1500));
      publishState();
      try { await withTimeout(prepareSink(job), 5000, 'Timed out while preparing recording storage'); }
      catch (_) { job.writer = null; job.fileHandle = null; }
      service.setQualityCap(id, 1080);
      service.start(id);
      publishState();
    }

    function waitForFinalizingMilestone(job, elapsedMs) {
      const wait = Number(job?.finalizingStartedAt || 0) + Math.max(0, Number(elapsedMs || 0)) - Date.now();
      return wait > 0 ? new Promise(resolve => setTimeout(resolve, wait)) : Promise.resolve();
    }

    function recorderMediaToolkit() {
      try {
        if (typeof Mediabunny !== 'undefined' && Mediabunny) return Mediabunny;
        return globalThis.Mediabunny || null;
      } catch (_) { return null; }
    }

    async function convertRecordingToMp4(blob, job) {
      const media = recorderMediaToolkit();
      if (!media) throw new Error('MP4 converter unavailable');
      const {
        ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input,
        Mp4OutputFormat, Output, Quality, StreamTarget,
      } = media;
      if (![ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, Quality, StreamTarget].every(Boolean)) {
        throw new Error('MP4 converter is incomplete');
      }

      const input = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
      let target = null;
      let outputHandle = null;
      let outputWritable = null;
      if (job.opfsDir) {
        job.opfsOutputName = `${safeFilePart(job.id)}-${job.startedAt}.mp4.part`;
        outputHandle = await job.opfsDir.getFileHandle(job.opfsOutputName, { create: true });
        job.opfsOutputHandle = outputHandle;
        outputWritable = await outputHandle.createWritable();
        target = new StreamTarget(outputWritable, { chunked: true, chunkSize: 8 * 1024 * 1024 });
      } else {
        target = new BufferTarget();
      }
      const output = new Output({ format: new Mp4OutputFormat(), target });
      const videoBitrate = job.height >= 1080 ? 10000000 : (job.height >= 720 ? 6000000 : Math.max(2500000, Math.round((job.width || 1280) * (job.height || 720) * 8)));
      const conversion = await Conversion.init({
        input,
        output,
        video: {
          codec: 'avc',
          quality: new Quality({ bitrate: Math.min(12000000, videoBitrate), bitrateMode: 'variable' }),
          hardwareAcceleration: 'prefer-hardware',
          forceTranscode: true,
        },
        audio: {
          codec: 'aac',
          quality: new Quality({ bitrate: 192000, bitrateMode: 'variable' }),
          forceTranscode: true,
        },
      });
      if (!conversion.isValid) {
        const reasons = (conversion.discardedTracks || []).map(item => item?.reason).filter(Boolean).join('; ');
        try { await outputWritable?.abort?.(); } catch (_) {}
        throw new Error(reasons ? `MP4 conversion unsupported: ${reasons}` : 'MP4 conversion unsupported in this browser');
      }
      let lastProgress = 0;
      let lastPublishedAt = 0;
      conversion.onProgress = value => {
        const progress = Math.max(0, Math.min(1, Number(value) || 0));
        const mapped = 65 + Math.round(progress * 30);
        if (mapped <= lastProgress && Date.now() - lastPublishedAt < 250) return;
        lastProgress = mapped;
        lastPublishedAt = Date.now();
        job.finalizingProgress = mapped;
        publishState();
      };
      try {
        await conversion.execute();
      } catch (error) {
        try { await outputWritable?.abort?.(); } catch (_) {}
        throw error;
      }
      let converted = null;
      if (outputHandle) converted = await outputHandle.getFile();
      else if (target.buffer) converted = new Blob([target.buffer], { type: 'video/mp4' });
      if (!converted?.size) throw new Error('MP4 conversion produced no data');
      return converted.type === 'video/mp4' ? converted : new Blob([converted], { type: 'video/mp4' });
    }

    async function finalizeJob(job, reason = 'manual', command = null) {
      if (!job || job.stopRequested || job.finalizing) return;
      job.stopRequested = true;
      job.finalizing = true;
      job.finalizingStartedAt = Date.now();
      job.status = 'finalizing';
      freezeClocks(job);
      clearStableTimer(job);
      clearTimeout(job.offlineTimer);
      job.finalizingProgress = 5;
      publishState();
      let pipelineError = job.storageError ? new Error(job.storageError) : null;
      try {
        if (job.recorder && job.recorder.state !== 'inactive') {
          try {
            await withTimeout(new Promise(resolve => {
              const done = () => resolve();
              job.recorder.addEventListener('stop', done, { once: true });
              try { job.recorder.requestData?.(); } catch (_) {}
              try { job.recorder.stop(); } catch (_) { resolve(); }
            }), 8000, 'Timed out while stopping MediaRecorder');
          } catch (error) { pipelineError ||= error; }
        }
        await waitForFinalizingMilestone(job, 250);
        job.acceptChunks = false;
        job.finalizingProgress = 35; publishState();
        try { await withTimeout(job.writeQueue, 20000, 'Timed out while flushing recording data'); }
        catch (error) { pipelineError ||= error; }
        await waitForFinalizingMilestone(job, 550);
        job.finalizingProgress = 60; publishState();
        let blob = null;
        if (job.writer && job.fileHandle) {
          try { await withTimeout(job.writer.close(), 20000, 'Timed out while closing the recording file'); }
          catch (error) { pipelineError ||= error; }
          try { blob = await withTimeout(job.fileHandle.getFile(), 10000, 'Timed out while reading the recorded file'); }
          catch (error) { pipelineError ||= error; }
        } else {
          blob = new Blob(job.chunks || [], { type: job.mimeType || 'video/webm' });
        }
        await waitForFinalizingMilestone(job, 900);
        job.finalizingProgress = 62; publishState();
        if (!blob?.size) {
          await waitForFinalizingMilestone(job, 1400);
          if (Number(job.bytes || 0) <= 0) {
            cleanupJob(job);
            job.status = 'stopped';
            job.error = t('recorderStoppedNoData');
            job.stopRequested = true;
            job.finalizing = false;
            job.acceptChunks = false;
            job.finalizingProgress = 100;
            publishState();
            publishCommandAck(command, 'completed', 'stopped-empty');
            setTimeout(() => removeJob(job.id), 12000);
            return;
          }
          throw pipelineError || new Error(t('recordingNoData'));
        }
        let outputBlob = blob;
        let ext = String(job.mimeType || '').includes('mp4') ? 'mp4' : 'webm';
        let conversionError = null;
        if (ext !== 'mp4') {
          try {
            outputBlob = await convertRecordingToMp4(blob, job);
            ext = 'mp4';
            job.mimeType = 'video/mp4';
          } catch (error) {
            conversionError = error;
            console.warn('[RoomGrid] MP4 conversion failed; preserving the WebM recording', error);
          }
        }
        job.finalizingProgress = 96; publishState();
        job.filename = `${safeFilePart(job.id)}_${fileStamp(job.startedAt)}.${ext}`;
        downloadBlob(outputBlob, job.filename);
        await waitForFinalizingMilestone(job, 1400);
        cleanupJob(job);
        job.finalizingProgress = 100;
        job.status = 'saved';
        job.finalizing = false;
        job.error = conversionError
          ? `MP4 conversion failed; saved WebM instead: ${conversionError.message || conversionError}`
          : (pipelineError ? `Saved partial recording after ${reason}: ${pipelineError.message || pipelineError}` : '');
        publishState();
        publishCommandAck(command, 'completed', 'saved');
        setTimeout(() => removeJob(job.id), 8000);
      } catch (error) {
        cleanupJob(job);
        job.status = 'failed';
        job.error = `Recording stopped, but no playable file could be saved: ${String(error?.message || error)}`;
        job.stopRequested = true;
        job.finalizing = false;
        job.acceptChunks = false;
        job.finalizingProgress = 0;
        publishState();
        publishCommandAck(command, 'completed', 'failed');
        setTimeout(() => removeJob(job.id), 15000);
      }
    }

    function cleanupJob(job) {
      clearStableTimer(job);
      clearPlaybackRetry(job);
      clearTimeout(job.offlineTimer);
      stopFramePump(job);
      service.stop(job.id);
      service.setQualityCap(job.id, 0);
      try { job.captureStream?.getTracks().forEach(track => track.stop()); } catch (_) {}
      try { job.mediaElementStream?.getTracks().forEach(track => track.stop()); } catch (_) {}
      try { job.audioSource?.disconnect(); } catch (_) {}
      try { job.audioContext?.close(); } catch (_) {}
      try { stopMediaElement(job.video, true); } catch (_) {}
    }

    function removeJob(id) {
      const job = jobs.get(normalizeUsername(id));
      if (!job) return;
      cleanupJob(job);
      if (job.opfsDir && job.opfsName) job.opfsDir.removeEntry(job.opfsName).catch(() => {});
      if (job.opfsDir && job.opfsOutputName) job.opfsDir.removeEntry(job.opfsOutputName).catch(() => {});
      jobs.delete(job.id);
      hubStore.state.rooms = hubStore.state.rooms.filter(room => room.id !== job.id);
      publishState();
    }

    function recoverInterruptedSnapshot() {
      let snapshot = null;
      try { snapshot = JSON.parse(localStorage.getItem(RECORDER_STATE_KEY) || 'null'); } catch (_) {}
      const rows = Array.isArray(snapshot?.recordings) ? snapshot.recordings : [];
      rows.forEach(row => {
        const id = normalizeUsername(row?.id);
        if (!isLikelyUsername(id) || ['saved', 'failed', 'stopped', 'interrupted'].includes(row?.status)) return;
        jobs.set(id, {
          ...row,
          id,
          status: 'interrupted',
          error: t('recorderInterrupted'),
          stopRequested: true,
          finalizing: false,
          finalizingProgress: 0,
          recordedMs: Number(row.recordedMs || 0),
          waitingMs: Number(row.waitingMs || 0),
          orphaned: true,
        });
        hubStore.state.rooms.push({ id, groups: [DEFAULT_GROUP_ID], lastStatus: row.sourceStatus || 'unknown', muted: true });
        setTimeout(() => removeJob(id), 12000);
      });
    }

    function stopJob(id, reason = 'manual', command = null) {
      const job = jobs.get(normalizeUsername(id));
      if (!job) return null;
      return finalizeJob(job, reason, command);
    }

    function pauseJob(id) {
      const job = jobs.get(normalizeUsername(id));
      if (!job || job.stopRequested || job.finalizing) return;
      job.manualPaused = true;
      clearStableTimer(job);
      stopFramePump(job);
      pauseClock(job);
      try { if (job.recorder?.state === 'recording') job.recorder.pause(); } catch (_) {}
      job.status = 'manual-paused';
      publishState();
    }

    function resumeJob(id) {
      const job = jobs.get(normalizeUsername(id));
      if (!job || job.stopRequested || job.finalizing) return;
      job.manualPaused = false;
      job.error = '';
      if (job.sourceStatus === 'private') pauseForStatus(job, 'private');
      else if (job.sourceStatus === 'offline' || job.sourceStatus === 'reconnecting') pauseForStatus(job, job.sourceStatus);
      else if (job.video?.readyState >= 2) waitForStablePublic(job);
      else {
        job.status = 'connecting';
        pauseClock(job);
        service.refresh(job.id);
        publishState();
      }
    }

    function retryJob(id) {
      const job = jobs.get(normalizeUsername(id));
      if (!job || job.stopRequested || job.finalizing) return;
      job.error = '';
      job.status = 'connecting';
      service.refresh(job.id);
      publishState();
    }

    function processCommand(command) {
      if (!ownsRecorder) return;
      if (!command?.commandId || processedCommands.has(command.commandId)) return;
      processedCommands.add(command.commandId);
      publishCommandAck(command, 'accepted');
      if (command.action === 'start') {
        Promise.resolve(startJob(command.id)).finally(() => publishCommandAck(command, 'completed', 'started'));
      } else if (command.action === 'pause') {
        pauseJob(command.id);
        publishCommandAck(command, 'completed', 'paused');
      } else if (command.action === 'resume') {
        resumeJob(command.id);
        publishCommandAck(command, 'completed', 'resumed');
      } else if (command.action === 'stop') {
        const task = stopJob(command.id, 'manual', command);
        if (!task) {
          // The previous Hub may have disappeared with an in-memory job. A
          // stale Stop still succeeds by publishing the authoritative empty
          // snapshot and acknowledging that there was nothing left to save.
          publishState();
          publishCommandAck(command, 'completed', 'missing');
        }
      } else if (command.action === 'stop-all') {
        const tasks = [...jobs.keys()].map(id => stopJob(id, 'manual')).filter(Boolean);
        if (!tasks.length) {
          publishState();
          publishCommandAck(command, 'completed', 'missing');
        } else {
          Promise.allSettled(tasks).finally(() => publishCommandAck(command, 'completed', 'stopped-all'));
        }
      } else if (command.action === 'retry') {
        retryJob(command.id);
        publishCommandAck(command, 'completed', 'retrying');
      } else {
        publishCommandAck(command, 'completed', 'ignored');
      }
    }

    function drainCommands() {
      if (!ownsRecorder) return;
      let queue = [];
      try { queue = JSON.parse(localStorage.getItem(RECORDER_COMMAND_KEY) || '[]'); } catch (_) {}
      if (Array.isArray(queue)) queue.forEach(processCommand);
      // Commands are a delivery queue, not durable history. Clearing handled
      // entries prevents an old Start command from being replayed after a
      // long-running Hub prunes its in-memory de-duplication set.
      if (Array.isArray(queue) && queue.length) {
        const handled = new Set(queue.map(item => item?.commandId).filter(Boolean));
        let latest = [];
        try { latest = JSON.parse(localStorage.getItem(RECORDER_COMMAND_KEY) || '[]'); } catch (_) {}
        if (!Array.isArray(latest)) latest = [];
        localStorage.setItem(RECORDER_COMMAND_KEY, JSON.stringify(latest.filter(item => !handled.has(item?.commandId)).slice(-100)));
      }
    }

    channel && (channel.onmessage = event => {
      if (event.data?.type === 'focus-hub' && ownsRecorder && event.data.active) {
        try { window.focus(); } catch (_) {}
      } else if (event.data?.type === 'command' && ownsRecorder) processCommand(event.data.command);
    });
    window.addEventListener('storage', event => {
      if (event.key === RECORDER_COMMAND_KEY && ownsRecorder) drainCommands();
      else if (event.key === RECORDER_STATE_KEY && !ownsRecorder) { UnifiedRecorder.loadSnapshot(); render(); }
    });
    EventBus.on('room:online', ({ id, hlsSource }) => {
      const job = jobs.get(id);
      if (!job || job.stopRequested || job.finalizing) return;
      job.sourceStatus = 'online';
      if (!job.video.isConnected) document.getElementById('rec-hidden-media')?.appendChild(job.video);
      service.attachVideo(id, job.video);
      service.startHls(id, hlsSource);
      ensureRecorderPlayback(job, 50);
    });
    EventBus.on('room:status', ({ id, status }) => {
      const job = jobs.get(id);
      if (!job || job.stopRequested || job.finalizing) return;
      job.sourceStatus = status;
      if (status === 'private') pauseForStatus(job, 'private');
      else if (status === 'offline') pauseForStatus(job, 'offline');
      else if (status === 'error') pauseForStatus(job, 'reconnecting');
      else if (status === 'online') ensureRecorderPlayback(job);
    });
    EventBus.on('room:transient-error', ({ id }) => {
      const job = jobs.get(id);
      if (job && !job.stopRequested && !job.finalizing) pauseForStatus(job, 'reconnecting');
    });
    UnifiedRecorder.subscribe(() => { if (!ownsRecorder) render(); });
    setInterval(() => {
      if (ownsRecorder) {
        if (!renewRecorderOwner(hubInstanceId)) ownsRecorder = false;
        else { drainCommands(); publishState(); return; }
      }
      UnifiedRecorder.loadSnapshot();
      if (!recorderServiceFresh() && claimRecorderOwner(hubInstanceId)) {
        ownsRecorder = true;
        drainCommands();
        publishState();
      } else render();
    }, 1000);
    if (ownsRecorder) {
      recoverInterruptedSnapshot();
      renewRecorderOwner(hubInstanceId);
      drainCommands();
      publishState();
    } else {
      UnifiedRecorder.loadSnapshot();
      render();
    }
    window.addEventListener('beforeunload', event => {
      if (!ownsRecorder || ![...jobs.values()].some(job => !['saved', 'failed', 'stopped', 'interrupted'].includes(job.status))) return;
      event.preventDefault();
      event.returnValue = t('recorderHubCloseWarning');
    });
    window.addEventListener('pagehide', () => { if (ownsRecorder) releaseRecorderOwner(hubInstanceId); });
  }

  /* =============================================================
   * 6. 模式分发
   * ============================================================= */
  function isPhoneLikeDevice() {
    const coarse = !!window.matchMedia?.('(pointer: coarse)')?.matches;
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    const uaMobile = navigator.userAgentData?.mobile === true || /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent || '');
    const screenShortEdge = Math.min(Number(window.screen?.width) || 9999, Number(window.screen?.height) || 9999);
    const viewportShortEdge = Math.min(Number(window.innerWidth) || 9999, Number(window.innerHeight) || 9999);
    return (uaMobile && viewportShortEdge <= 1000) || (coarse && touch && screenShortEdge <= 700);
  }

  function isNativeMobileSite() {
    if (!isPhoneLikeDevice()) return false;
    if (document.getElementById('desktop-spa-header')) return false;
    if (document.querySelector('[data-testid="header-nav-bar"], [data-testid="desktop-header"]')) return false;
    if (document.querySelector([
      '[data-testid="mobile-header"]',
      '[data-testid="mobile-navigation"]',
      '[data-testid="mobile-room-header"]',
      '.MobileHeader',
      '.evolve-header',
      '[class*="MobileHeader"]',
    ].join(','))) return true;
    return Math.min(Number(window.innerWidth) || 9999, Number(window.screen?.width) || 9999) <= 1100;
  }

  const isRecorderHub = isRecorderHubRoute();
  const isWorkstation = new URLSearchParams(location.search).get('multicam_mode') === '1';
  const hasExtensionContextMenus = GM_info?.scriptHandler === 'Ziggy Extension Adapter';
  if (isWorkstation) scheduleGithubAutoImport();
  if (isRecorderHub) {
    initRecorderHub();
    if (hasExtensionContextMenus) initInjector({ contextOnly: true });
  }
  else if (isWorkstation) {
    initWorkstation();
    if (hasExtensionContextMenus) initInjector({ contextOnly: true });
  }
  else initInjector();

  /* =============================================================
   * 7. 普通页面注入：浮动按钮 + 快捷键
   * ============================================================= */
  function initInjector(options = {}) {
    const contextOnly = options.contextOnly === true;
    const ROOM_PATH = /^\/([a-zA-Z0-9_-]+)\/?$/;
    const nativeMobilePage = isNativeMobileSite();
    document.documentElement.classList.toggle('ziggy-suite-mobile', nativeMobilePage);
    document.documentElement.dataset.ziggySuiteAvailable = '1';

    // ---- 当前房间（响应式：URL / canonical / DOM 变化时自动重算）----
    let currentRoom = null;
    let contextualRoom = null;
    let contextDockSummoned = false;
    let contextDockPageUrl = '';
    const currentRoomSubs = new Set();
    const activeDockRoom = () => contextualRoom || currentRoom;

    function extractRoomFromPath(pathname) {
      const m = (pathname || '').match(ROOM_PATH);
      const name = m ? normalizeUsername(m[1]) : null;
      return isLikelyUsername(name) ? name : null;
    }

    function extractRoomFromUrl(url) {
      if (!url) return null;
      try { return extractRoomFromPath(new URL(url, location.origin).pathname); }
      catch (_) { return null; }
    }

    function detectCurrentRoom() {
      // 1. URL 路径：/<username>/
      let next = extractRoomFromPath(location.pathname);
      if (next) return next;
      // 2. SPA 场景：URL/DOM 被异步替换时，canonical/og:url 往往先更新。
      const candidates = [
        document.querySelector('link[rel="canonical"]')?.href,
        document.querySelector('meta[property="og:url"]')?.content,
        document.querySelector('meta[name="twitter:url"]')?.content,
      ];
      for (const href of candidates) {
        next = extractRoomFromUrl(href);
        if (next) return next;
      }
      return null;
    }

    function recalcCurrentRoom() {
      if (contextDockSummoned && contextDockPageUrl && contextDockPageUrl !== location.href) {
        setDockCollapsed(true);
      }
      const next = detectCurrentRoom();
      if (next !== currentRoom) {
        currentRoom = next;
        currentRoomSubs.forEach(fn => { try { fn(currentRoom); } catch (_) {} });
      }
    }
    const recalcCurrentRoomSoon = debounce(recalcCurrentRoom, 180);
    recalcCurrentRoom();

    if (!contextOnly) {
      // hook history pushState/replaceState（chaturbate 是 SPA，URL 变化时不刷新）
      ['pushState', 'replaceState'].forEach(method => {
        const orig = history[method];
        history[method] = function () {
          const ret = orig.apply(this, arguments);
          setTimeout(recalcCurrentRoom, 0);
          setTimeout(recalcCurrentRoom, 250);
          setTimeout(recalcCurrentRoom, 900);
          return ret;
        };
      });
      window.addEventListener('popstate', () => setTimeout(recalcCurrentRoom, 50));
      window.addEventListener('hashchange', () => setTimeout(recalcCurrentRoom, 50));
      // 监听同标签内的异步切换，解决「换人后加入状态不变」。
      try {
        const routeMo = new MutationObserver(recalcCurrentRoomSoon);
        if (document.head) routeMo.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href', 'content'] });
        if (document.body) routeMo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
      // poll 兜底（万一还有别的 navigation 路径漏了）；隐藏标签页降低频率。
      let routePollTimer = 0;
      function scheduleRoutePoll() {
        clearTimeout(routePollTimer);
        const ms = document.hidden ? INJECTOR_ROUTE_POLL_HIDDEN_MS : INJECTOR_ROUTE_POLL_VISIBLE_MS;
        routePollTimer = setTimeout(() => { recalcCurrentRoom(); scheduleRoutePoll(); }, ms);
      }
      scheduleRoutePoll();
      document.addEventListener('visibilitychange', scheduleRoutePoll);
    }

    // 跨标签页同步
    const storageSubs = new Set();
    const fireStorageSubs = () => storageSubs.forEach(fn => { try { fn(); } catch (_) {} });
    window.addEventListener('storage', (e) => {
      if (e.key === STORE_KEY) fireStorageSubs();
    });
    window.addEventListener('ryujo_multicam_storage', fireStorageSubs);

    function refreshInjectorState() {
      recalcCurrentRoom();
      fireStorageSubs();
    }

    if (!contextOnly) {
      // SPA 路由兜底：CB 有些入口不会稳定走 pushState/popstate。
      // 用点击、hash、pageshow、DOM 变化做低成本监听，保证同标签切换主播后“已加入/加入”状态实时变。
      const routeCheckSoon = debounce(() => recalcCurrentRoom(), 80);
      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        setTimeout(routeCheckSoon, 0);
        setTimeout(routeCheckSoon, 160);
        setTimeout(routeCheckSoon, 650);
      }, true);
      window.addEventListener('hashchange', routeCheckSoon);
      window.addEventListener('pageshow', routeCheckSoon);
      document.addEventListener('visibilitychange', routeCheckSoon);
      try {
        const routeMo = new MutationObserver(routeCheckSoon);
        routeMo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
    }

    const buildWorkstationUrl = () => canonicalWorkshopUrl();
    const openWorkstationNew = () => {
      // 新开工作台前静音并停止当前页面媒体，避免“新工作台已开但旧页面还在出声”。
      stopAllPageMedia();
      openNoopener(buildWorkstationUrl());
    };
    function findDesktopNavigationSlot(kind) {
      const nav = document.querySelector('[data-testid="header-nav-bar"]') || document.querySelector('#desktop-spa-header nav') || document.querySelector('header nav');
      if (!nav) return null;
      return [...nav.querySelectorAll('a[href],button')].find(node => {
        const label = `${node.textContent || ''} ${node.getAttribute('aria-label') || ''}`.replace(/\s+/g, ' ').trim();
        const href = node.getAttribute('href') || '';
        if (kind === 'private') return /^PRIVATE SHOWS?$/i.test(label) || /(?:^|\/)private-shows?(?:\/|$|\?)/i.test(href);
        return /^(?:MERCH|SHOP)$/i.test(label) || /(?:^|\/)merch(?:andise)?(?:\/|$|\?)/i.test(href);
      }) || null;
    }

    function hideMerchNavigationItem() {
      const merch = findDesktopNavigationSlot('merch');
      if (!merch || merch.id === 'roomgrid-workshop-button') return;
      merch.hidden = true;
      merch.setAttribute('aria-hidden', 'true');
      merch.classList.add('roomgrid-hidden-merch-nav');
    }

    function ensureWorkshopHeaderButton() {
      if (nativeMobilePage) {
        document.getElementById('roomgrid-workshop-button')?.remove();
        return;
      }
      hideMerchNavigationItem();
      if (document.getElementById('roomgrid-workshop-button')) return;
      const privateSlot = findDesktopNavigationSlot('private');
      if (privateSlot) {
        const nav = privateSlot.closest('nav') || privateSlot.parentElement;
        const nativeCandidates = [...(nav?.querySelectorAll('a[href]') || [])].filter(node =>
          node !== privateSlot
          && !node.hasAttribute('disabled')
          && node.getAttribute('aria-disabled') !== 'true'
          && node.getAttribute('aria-current') !== 'page'
        );
        const nativeColorCounts = new Map();
        for (const node of nativeCandidates) {
          const color = getComputedStyle(node).color;
          nativeColorCounts.set(color, (nativeColorCounts.get(color) || 0) + 1);
        }
        const nativeTemplate = nativeCandidates.sort((a, b) =>
          (nativeColorCounts.get(getComputedStyle(b).color) || 0) - (nativeColorCounts.get(getComputedStyle(a).color) || 0)
        )[0];
        const button = nativeTemplate?.cloneNode(true) || privateSlot.cloneNode(true);
        button.querySelectorAll?.('[id]').forEach(node => node.removeAttribute('id'));
        button.id = 'roomgrid-workshop-button';
        button.classList.add('roomgrid-workshop-nav-link');
        button.removeAttribute('disabled');
        button.removeAttribute('aria-disabled');
        button.removeAttribute('aria-current');
        button.removeAttribute('aria-selected');
        button.removeAttribute('data-state');
        button.setAttribute('href', buildWorkstationUrl());
        button.setAttribute('aria-label', 'Open MultiCam Workshop');
        button.setAttribute('title', 'Open MultiCam Workshop');
        const label = button.querySelector('.HeaderNavBar__link-text,[class*="link-text"],[class*="LinkText"]')
          || [...button.querySelectorAll('span')].find(node => !node.children.length && node.textContent.trim())
          || button;
        label.textContent = 'WORKSHOP';
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          openWorkstationNew();
        });
        privateSlot.replaceWith(button);
        return;
      }
      const nav = document.querySelector('[data-testid="header-nav-bar"]') || document.querySelector('#desktop-spa-header nav') || document.querySelector('header nav');
      if (!nav) return;
      const template = nav.querySelector('a[href],button');
      const button = template?.cloneNode(true) || document.createElement('a');
      button.id = 'roomgrid-workshop-button';
      button.classList.add('roomgrid-workshop-nav-link');
      button.setAttribute('href', buildWorkstationUrl());
      button.setAttribute('aria-label', 'Open MultiCam Workshop');
      button.setAttribute('title', 'Open MultiCam Workshop');
      const label = button.querySelector('.HeaderNavBar__link-text,[class*="link-text"],[class*="LinkText"]') || button;
      label.textContent = 'WORKSHOP';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openWorkstationNew();
      });
      nav.appendChild(button);
    }

    function getPrimaryPageVideo() {
      const videos = [...document.querySelectorAll('video')]
        .filter(v => v && v.offsetWidth > 120 && v.offsetHeight > 80 && !v.ended);
      return videos.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0] || null;
    }

    function captureCurrentPageVideo() {
      const video = getPrimaryPageVideo();
      if (!video || !video.videoWidth || !video.videoHeight) { toast(t('dockVideoMissing')); return; }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) { toast(t('captureFailed')); return; }
          downloadBlob(blob, `roomgrid-page-${safeFilePart(currentRoom || 'video')}-${stampForFile()}.png`);
          toast(t('screenshotSaved'));
        }, 'image/png');
      } catch (_) {
        toast(t('captureFailed'));
      }
    }

    async function toggleCurrentPagePiP() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await video.requestPictureInPicture();
      } catch (_) {
        toast(t('dockVideoMissing'));
      }
    }

    function toggleCurrentPagePlayback() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      if (video.paused) video.play?.().catch?.(() => {});
      else video.pause?.();
    }

    function toggleCurrentPageMute() {
      const video = getPrimaryPageVideo();
      if (!video) { toast(t('dockVideoMissing')); return; }
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 0.5;
    }

    function queueCurrentRoomRecording() {
      const room = activeDockRoom();
      if (!room) { toast(t('dockNoRoom')); return; }
      if (!Storage.has(room)) Storage.add(room);
      if (!UnifiedRecorder.has(room)) UnifiedRecorder.start(room);
      toast(t('dockRecordQueued'));
      updateDockRoom();
    }

    function pauseResumeCurrentRoomRecording() {
      const room = activeDockRoom();
      if (!room) { toast(t('dockNoRoom')); return; }
      const recording = UnifiedRecorder.get(room);
      if (!recording) return;
      if (recording.manualPaused || recording.status === 'manual-paused') UnifiedRecorder.resume(room);
      else UnifiedRecorder.pause(room);
      updateDockRoom();
    }

    function stopCurrentRoomRecording() {
      const room = activeDockRoom();
      if (!room || !UnifiedRecorder.get(room)) return;
      UnifiedRecorder.stop(room);
      toast(t('recorderFinalizing'));
      updateDockRoom();
    }

    function openCurrentRoomRecu() {
      const room = activeDockRoom();
      if (!room) { toast(t('dockNoRoom')); return; }
      openNoopener(`https://recu.me/performer/${encodeURIComponent(room)}`);
    }

    // ---- RoomGrid 工具坞 ----
    const dockStyle = $('style', { html: trustedHtml(`
      .roomgrid-dock { position:fixed; right:18px; bottom:18px; z-index:2147483200; width:300px; font-family:UbuntuRegular,Arial,sans-serif; color:#f1f1f1; user-select:none; transition:bottom .2s ease,opacity .2s ease,transform .2s ease; }
      html.cmc-active body.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,58px) + env(safe-area-inset-bottom) + 10px); }
      html.cmc-active body.cmc-room.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,58px) + env(safe-area-inset-bottom) + 66px); }
      html.cmc-active body.cmc-chat-open .roomgrid-dock,
      html.cmc-active body.cmc-site-modal-open .roomgrid-dock,
      html.cmc-active body.cmc-fullscreen .roomgrid-dock { opacity:0; transform:translateY(12px); pointer-events:none; }
      .roomgrid-dock-card { border:1px solid #2d3e50; border-radius:4px; background:#202c39; box-shadow:0 8px 24px rgba(0,0,0,.28); overflow:hidden; }
      .roomgrid-dock-head { width:100%; min-height:44px; border:0; display:flex; align-items:center; gap:10px; padding:5px 8px; cursor:pointer; color:inherit; background:#202c39; text-align:left; }
      .roomgrid-dock-mark { width:34px; height:34px; border-radius:4px; display:grid; place-items:center; background:#0c6a93; font-weight:900; letter-spacing:.02em; }
      .roomgrid-dock-title { font-size:14px; font-weight:850; line-height:1.1; }
      .roomgrid-dock-sub { margin-top:2px; font-size:11px; color:#b3b3b3; }
      .roomgrid-dock-chevron { margin-left:auto; font-size:16px; opacity:.82; }
      .roomgrid-dock-body { display:grid; gap:10px; padding:10px; }
      .roomgrid-dock.arna-active { width:min(500px,calc(100vw - 36px)); }
      .roomgrid-dock-tabs { display:flex; gap:2px; padding:2px; border-radius:4px; background:#17202a; }
      .roomgrid-dock-tab { flex:1; min-height:32px; border:1px solid transparent; border-radius:3px; background:transparent; color:#b3b3b3; cursor:pointer; font:500 12px/1 UbuntuMedium,UbuntuRegular,Arial,sans-serif; }
      .roomgrid-dock-tab:hover { color:#fff; background:#253648; }
      .roomgrid-dock-tab.active { color:#fff; border-color:#0c6a93; background:#0c6a93; box-shadow:none; }
      .roomgrid-dock-tab-badge { display:none; min-width:18px; margin-left:4px; padding:1px 5px; border-radius:999px; background:#10b981; color:#fff; font-size:9px; line-height:14px; }
      .roomgrid-dock-pane { display:grid; gap:10px; min-width:0; }
      .roomgrid-dock-pane[hidden] { display:none !important; }
      .roomgrid-dock-room { font-size:12px; color:#cbd5e1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .roomgrid-dock-actions { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
      .roomgrid-dock-save-row { display:grid; grid-template-columns:1fr 1fr; gap:7px; grid-column:1/-1; }
      .roomgrid-dock-record-row { display:grid; grid-template-columns:1fr 1fr; gap:7px; grid-column:1/-1; }
      .roomgrid-dock-record-row[hidden],.roomgrid-dock-record-start[hidden],
      .roomgrid-dock-save-row[hidden],.roomgrid-dock-action[hidden] { display:none !important; }
      .roomgrid-dock-action { min-height:36px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#d7d7d7; cursor:pointer; font-size:12px; font-weight:500; text-align:left; padding:7px 9px; }
      .roomgrid-dock-action:hover { background:#253648; border-color:#3b5066; color:#fff; }
      .roomgrid-dock-action.primary { background:#0c6a93; border-color:#0c6a93; color:#fff; }
      .roomgrid-dock-action.roomgrid-recu-action { background:#5b2b73; border-color:#8d55a5; color:#fff; }
      .roomgrid-dock-action.roomgrid-recu-action:hover { background:#70388a; border-color:#a16abb; color:#fff; }
      .roomgrid-dock-action.success,.roomgrid-dock-action.warn { background:#17202a; border-color:#2d3e50; color:#d7d7d7; }
      .roomgrid-dock-setting { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:7px 8px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#b3b3b3; font-size:11px; }
      .roomgrid-dock-setting-control { display:flex; align-items:center; gap:5px; color:#94a3b8; white-space:nowrap; }
      .roomgrid-dock-setting-input { width:54px; height:27px; padding:3px 6px; border:1px solid #2d3e50; border-radius:3px; outline:none; background:#17202a; color:#fff; font:700 11px UbuntuRegular,Arial,sans-serif; text-align:center; }
      .roomgrid-dock-setting-input:focus { border-color:#68b5f0; box-shadow:0 0 0 2px rgba(104,181,240,.15); }
      .roomgrid-dock-foot { display:flex; justify-content:space-between; gap:8px; border-top:1px solid #2d3e50; padding-top:9px; }
      .roomgrid-dock-link { border:0; background:transparent; color:#cbd5e1; cursor:pointer; font-size:11px; padding:2px 0; }
      .roomgrid-dock-link:hover { color:#fff; text-decoration:underline; }
      .roomgrid-arna-pane { --arna-surface:#17202a; --arna-border:#2d3e50; --arna-muted:#b3b3b3; --arna-primary:#0c6a93; --arna-success:#22c55e; --arna-error:#ef4444; max-height:min(650px,calc(100vh - 190px)); overflow-y:auto; padding-right:2px; user-select:text; }
      .roomgrid-arna-pane, .roomgrid-arna-pane * { box-sizing:border-box; }
      .roomgrid-arna-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
      .roomgrid-arna-brand { display:flex; align-items:center; gap:7px; font-size:15px; font-weight:900; letter-spacing:.01em; }
      .roomgrid-arna-version { padding:2px 5px; border:1px solid var(--arna-border); border-radius:3px; color:var(--arna-muted); font-size:9px; font-weight:800; }
      .roomgrid-arna-caption { color:var(--arna-muted); font-size:10px; }
      .roomgrid-arna-subtabs { display:flex; gap:2px; padding:2px; border-radius:4px; background:#17202a; }
      .roomgrid-arna-subtab { flex:1; min-height:28px; border:0; border-radius:3px; background:transparent; color:var(--arna-muted); cursor:pointer; font-size:11px; font-weight:750; }
      .roomgrid-arna-subtab.active { background:#0c6a93; color:#fff; }
      .roomgrid-arna-search { position:relative; }
      .roomgrid-arna-search-icon { position:absolute; left:10px; top:9px; width:16px; height:16px; color:var(--arna-muted); pointer-events:none; }
      .roomgrid-arna-input { width:100%; height:35px; padding:7px 10px 7px 33px; border:1px solid var(--arna-border); border-radius:4px; outline:none; background:#17202a; color:#fff; font-size:12px; }
      .roomgrid-arna-input:focus { border-color:#68b5f0; box-shadow:0 0 0 2px rgba(104,181,240,.15); }
      .roomgrid-arna-view { display:grid; gap:9px; }
      .roomgrid-arna-view[hidden] { display:none !important; }
      .roomgrid-arna-label { display:flex; justify-content:space-between; gap:8px; color:var(--arna-muted); font-size:10px; }
      .roomgrid-arna-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
      .roomgrid-arna-item { display:flex; align-items:center; gap:8px; min-width:0; min-height:35px; padding:7px 8px; border:1px solid var(--arna-border); border-radius:4px; background:var(--arna-surface); color:#f8fafc; cursor:pointer; transition:border-color .15s,background .15s,opacity .15s; }
      .roomgrid-arna-item:hover { border-color:#68b5f0; background:#253648; }
      .roomgrid-arna-item img { flex:0 0 auto; width:16px; height:16px; }
      .roomgrid-arna-item-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; font-weight:700; }
      .roomgrid-arna-status { flex:0 0 auto; width:7px; height:7px; margin-left:auto; border-radius:50%; background:#475569; }
      .roomgrid-arna-item.checking .roomgrid-arna-status { background:#f59e0b; animation:roomgrid-arna-pulse 1s infinite; }
      .roomgrid-arna-item.found { border-color:rgba(16,185,129,.85); }
      .roomgrid-arna-item.found .roomgrid-arna-status { background:var(--arna-success); }
      .roomgrid-arna-item.not-found { opacity:.48; filter:grayscale(1); }
      .roomgrid-arna-item.not-found .roomgrid-arna-status { background:var(--arna-error); }
      .roomgrid-arna-save { justify-content:center; border-style:dashed; }
      .roomgrid-arna-actions { display:flex; gap:7px; }
      .roomgrid-arna-button { flex:1; min-height:32px; padding:6px 8px; border:1px solid var(--arna-border); border-radius:4px; background:var(--arna-surface); color:#f8fafc; cursor:pointer; font-size:11px; font-weight:750; }
      .roomgrid-arna-button:hover { border-color:#68b5f0; background:#253648; }
      .roomgrid-arna-list { display:grid; gap:4px; }
      .roomgrid-arna-row { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:34px; padding:7px 8px; border-bottom:1px solid #2d3e50; border-radius:3px; color:#f8fafc; cursor:pointer; font-size:11px; }
      .roomgrid-arna-row:hover { background:var(--arna-surface); }
      .roomgrid-arna-row-main { display:flex; align-items:center; gap:7px; min-width:0; }
      .roomgrid-arna-tag { padding:2px 6px; border-radius:3px; background:#253648; color:#cbd5e1; font-size:9px; }
      .roomgrid-arna-delete { border:0; background:transparent; color:var(--arna-muted); cursor:pointer; font-size:16px; }
      .roomgrid-arna-sites { max-height:190px; overflow-y:auto; border:1px solid var(--arna-border); border-radius:4px; background:#17202a; }
      .roomgrid-arna-site { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:32px; padding:6px 8px; border-bottom:1px solid #2d3e50; color:#f8fafc; font-size:11px; }
      .roomgrid-arna-empty { padding:22px 10px; text-align:center; color:var(--arna-muted); font-size:11px; }
      @keyframes roomgrid-arna-pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
      .roomgrid-dock.is-collapsed { width:auto; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-card { border-radius:4px; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-body { display:none; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-head { width:44px; height:44px; border-radius:4px; padding:4px; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-head > span:not(.roomgrid-dock-mark) { display:none !important; }
      .roomgrid-dock.is-collapsed .roomgrid-dock-sub, .roomgrid-dock.is-collapsed .roomgrid-dock-chevron { display:none; }
      html.ziggy-suite-mobile[data-ziggy-mobile-shell="1"] .roomgrid-dock.is-collapsed { display:none !important; }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) {
        position:fixed !important; inset:auto 0 0 0 !important; width:100vw !important; max-width:none !important;
        padding:0 !important; transform:none !important; z-index:2147483400 !important;
      }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-card {
        max-height:min(78dvh,720px); border-radius:4px 4px 0 0; border-bottom:0; background:#202c39;
        box-shadow:0 -12px 32px rgba(0,0,0,.42);
      }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-head { min-height:54px; padding:9px 12px; touch-action:manipulation; }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-body {
        max-height:calc(min(78dvh,720px) - 54px); overflow-y:auto; overscroll-behavior:contain;
        padding-bottom:max(12px,env(safe-area-inset-bottom));
      }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-action,
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-tab,
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-link { min-height:44px; touch-action:manipulation; }
      html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-arna-pane { max-height:none; overflow:visible; }
      @media (orientation:landscape) and (max-height:650px) {
        html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) { left:auto !important; width:min(520px,62vw) !important; }
        html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-card { max-height:100dvh; border-radius:4px 0 0 4px; }
        html.ziggy-suite-mobile .roomgrid-dock:not(.is-collapsed) .roomgrid-dock-body { max-height:calc(100dvh - 54px); }
      }
      @media (max-width:560px) { .roomgrid-dock.arna-active { right:8px; width:calc(100vw - 16px); } .roomgrid-arna-grid { grid-template-columns:1fr; } }
      @media (orientation:landscape) and (max-height:650px) { html.cmc-active body.cmc-room.cmc-has-bottom-nav:not(.cmc-controls-hidden):not(.cmc-chat-open):not(.cmc-fullscreen) .roomgrid-dock:not(.roomgrid-user-positioned) { bottom:calc(var(--cmc-nav-h,52px) + env(safe-area-inset-bottom) + 10px); } }
      /* Native Chaturbate treatment: flat surfaces, native blue, compact collapsed control. */
      html:not(.ziggy-suite-mobile) .roomgrid-dock { width:300px; font-family:UbuntuRegular,Arial,sans-serif; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-card { border:1px solid #2d3e50; border-radius:4px; background:#202c39; box-shadow:0 8px 24px rgba(0,0,0,.28); backdrop-filter:none; -webkit-backdrop-filter:none; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-head { min-height:44px; padding:5px 8px; background:#202c39; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-mark { width:34px; height:34px; border-radius:4px; background:#0c6a93; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-title { font-size:13px; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-sub { color:#b3b3b3; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-body { gap:8px; padding:8px; border-top:1px solid #2d3e50; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-tabs { padding:0; border-radius:4px; background:#17202a; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-tab { border-radius:3px; color:#b3b3b3; font-family:UbuntuMedium,UbuntuRegular,Arial,sans-serif; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-tab.active { border-color:#0c6a93; background:#0c6a93; box-shadow:none; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-action,
      html:not(.ziggy-suite-mobile) .roomgrid-dock-setting { border-color:#2d3e50; border-radius:4px; background:#17202a; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-action.primary { border-color:#0c6a93; background:#0c6a93; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock-action.success,
      html:not(.ziggy-suite-mobile) .roomgrid-dock-action.warn { border-color:#2d3e50; background:#17202a; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock.is-collapsed .roomgrid-dock-card,
      html:not(.ziggy-suite-mobile) .roomgrid-dock.is-collapsed .roomgrid-dock-head { border-radius:4px; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock.is-collapsed .roomgrid-dock-head { width:44px; height:44px; padding:4px; }
      html:not(.ziggy-suite-mobile) .roomgrid-dock.is-collapsed .roomgrid-dock-head > span:not(.roomgrid-dock-mark) { display:none !important; }

      /* Native room integration: the old floating launcher is never shown. */
      .roomgrid-dock { display:none !important; }
      .roomgrid-dock.roomgrid-native-desktop {
        position:absolute !important; right:auto !important; bottom:auto !important; left:0; top:0;
        z-index:2147483200; display:block !important; width:302px !important;
        max-width:calc(100vw - 16px); transform:none !important; opacity:1 !important;
        font-family:UbuntuRegular,Helvetica,Arial,sans-serif; user-select:none;
      }
      .roomgrid-dock.roomgrid-native-desktop.roomgrid-context-desktop {
        position:fixed !important; inset:78px 16px auto auto !important;
      }
      .roomgrid-dock.roomgrid-native-desktop.is-collapsed { display:none !important; }
      .roomgrid-native-desktop .roomgrid-dock-card {
        overflow:hidden; border:1px solid #2d3e50; border-radius:4px;
        background:#17202a; box-shadow:0 8px 24px rgba(0,0,0,.34);
      }
      .roomgrid-native-desktop .roomgrid-dock-head { display:none !important; }
      .roomgrid-native-desktop .roomgrid-dock-body { display:grid !important; gap:0; padding:0; border-top:0; }
      .roomgrid-native-desktop .roomgrid-dock-tabs { gap:0; padding:4px; border-bottom:1px solid #2d3e50; border-radius:0; background:#202c39; }
      .roomgrid-native-desktop .roomgrid-dock-tab { min-height:38px; }
      .roomgrid-native-desktop .roomgrid-dock-pane { gap:0; }
      .roomgrid-native-desktop .roomgrid-dock-room { padding:9px 12px; border-bottom:1px solid #2d3e50; color:#b3b3b3; }
      .roomgrid-native-desktop .roomgrid-dock-actions { display:block; }
      .roomgrid-native-desktop .roomgrid-dock-action {
        display:flex; width:100%; min-height:40px; align-items:center; padding:9px 12px;
        border:0; border-bottom:1px solid #2d3e50; border-radius:0; background:#17202a;
        color:#f1f1f1; font:500 12px/1.3 UbuntuRegular,Helvetica,Arial,sans-serif;
      }
      .roomgrid-native-desktop .roomgrid-dock-action:hover,
      .roomgrid-native-desktop .roomgrid-dock-action:focus-visible { background:#253648; color:#fff; outline:none; }
      .roomgrid-native-desktop .roomgrid-dock-action.primary { background:#0c6a93; }
      .roomgrid-native-desktop .roomgrid-dock-action.roomgrid-recu-action { background:#5b2b73; color:#fff; }
      .roomgrid-native-desktop .roomgrid-dock-action.roomgrid-recu-action:hover,
      .roomgrid-native-desktop .roomgrid-dock-action.roomgrid-recu-action:focus-visible { background:#70388a; color:#fff; }
      .roomgrid-native-desktop .roomgrid-dock-setting { margin:8px; }
      .roomgrid-native-desktop .roomgrid-dock-foot { padding:8px 12px; }
      .roomgrid-native-desktop .roomgrid-private-action { display:none; }
      .roomgrid-native-trigger {
        overflow:hidden; box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center;
        position:relative; top:-4px; float:right; width:auto; min-width:0; max-width:none; height:22px;
        margin:0; padding:3px 8px 2px;
        border:1px solid #0c6a93; border-radius:3px; background:#0c6a93; color:#fff;
        cursor:pointer; white-space:nowrap; text-overflow:ellipsis;
        font:500 12px/1.4 UbuntuMedium,UbuntuRegular,Helvetica,Arial,sans-serif;
      }
      .roomgrid-native-trigger:hover,.roomgrid-native-trigger:focus-visible { border-color:#68b5f0; background:#0f7fab; outline:none; }
      .roomgrid-native-fanclub-source { display:none !important; }

      .roomgrid-mobile-panel {
        box-sizing:border-box; width:100%; min-height:320px; padding:0 0 calc(76px + env(safe-area-inset-bottom));
        border-top:1px solid #2d3e50; background:#202c39; color:#f1f1f1;
        overflow-x:hidden; overflow-anchor:none; overscroll-behavior:contain; touch-action:pan-y;
        -webkit-overflow-scrolling:touch; font-family:UbuntuRegular,Helvetica,Arial,sans-serif;
      }
      .BaseRoomTab.PrivateTab > .roomgrid-mobile-panel {
        height:calc(100% - 68px); min-height:0; overflow-x:hidden; overflow-y:auto;
        overscroll-behavior:contain; touch-action:pan-y; -webkit-overflow-scrolling:touch;
        padding-bottom:env(safe-area-inset-bottom);
      }
      .roomgrid-mobile-panel[hidden] { display:none !important; }
      .roomgrid-mobile-panel .roomgrid-dock-body { display:grid !important; gap:0; padding:0; border:0; }
      .roomgrid-mobile-panel .roomgrid-dock-body,
      .roomgrid-mobile-panel .roomgrid-dock-pane { touch-action:pan-y; }
      .roomgrid-mobile-panel .roomgrid-arna-pane,
      .roomgrid-mobile-panel .roomgrid-arna-sites { max-height:none; overflow:visible; }
      .roomgrid-mobile-panel .roomgrid-dock-tabs { gap:0; padding:5px; border-radius:0; background:#17202a; }
      .roomgrid-mobile-panel .roomgrid-dock-tab { min-height:44px; font-size:14px; }
      .roomgrid-mobile-panel .roomgrid-dock-pane { gap:0; }
      .roomgrid-mobile-panel .roomgrid-dock-room { padding:12px 16px; border-bottom:1px solid #2d3e50; color:#b3b3b3; font-size:14px; }
      .roomgrid-mobile-panel .roomgrid-dock-actions { display:block; }
      .roomgrid-mobile-panel .roomgrid-dock-save-row { display:grid; grid-template-columns:1fr 1fr; }
      .roomgrid-mobile-panel .roomgrid-dock-action {
        display:flex; width:100%; min-height:52px; align-items:center; padding:12px 16px;
        border:0; border-bottom:1px solid #2d3e50; border-radius:0; background:#202c39;
        color:#f1f1f1; font:500 16px/1.35 UbuntuRegular,Helvetica,Arial,sans-serif;
        touch-action:manipulation;
      }
      .roomgrid-mobile-panel .roomgrid-dock-action:active,
      .roomgrid-mobile-panel .roomgrid-dock-action:focus-visible { background:#253648; outline:none; }
      .roomgrid-mobile-panel .roomgrid-dock-action.primary { background:#0c6a93; }
      .roomgrid-mobile-panel .roomgrid-send-tip-action { display:none; }
      .roomgrid-mobile-panel .roomgrid-dock-setting { margin:10px 12px; min-height:44px; }
      .roomgrid-mobile-panel .roomgrid-dock-foot { padding:10px 16px; }
      .roomgrid-mobile-panel .roomgrid-dock-collapse-link { display:none !important; }
      .roomgrid-mobile-native-hidden { display:none !important; }
      .roomgrid-mobile-tab { cursor:pointer; touch-action:manipulation; }
      .roomgrid-mobile-tab[aria-selected="true"],.roomgrid-mobile-tab.roomgrid-mobile-tab-active {
        color:#68b5f0 !important; border-bottom-color:#68b5f0 !important;
      }
      .roomgrid-mobile-token-source { display:none !important; }
      .roomgrid-mobile-tokens-menu-item {
        box-sizing:border-box; width:100%; min-height:44px; cursor:pointer;
        color:inherit; font:inherit; text-align:left;
      }
    `)});
    document.head.appendChild(dockStyle);

    const root = $('div', { class: 'roomgrid-dock' });
    // Always start collapsed on a fresh page load. Expansion is manual via the dock header or Shift+A.
    let collapsed = true;
    localStorage.setItem('ryujo_fab_collapsed', '1');
    let dockAutoCollapseTimer = 0;
    let dockPointerInside = false;
    let dragged = false, sx, sy, ox, oy;
    let nativeSendTipSource = null;
    let nativeDesktopRoomGridSource = null;
    let nativeDesktopRoomGridReplacesSource = false;
    let nativeRoomGridTrigger = null;
    let desktopVideoFitTimer = 0;
    let desktopVideoFitBusy = false;
    let desktopVideoFitAttempts = 0;
    let desktopVideoFitCompleted = false;
    let desktopVideoFitStartedAt = 0;
    let desktopVideoFitStableSamples = 0;
    let desktopVideoFitLastMeasurement = null;
    let desktopInitialRoomPositionTimer = 0;
    let desktopInitialRoomPositionAttempts = 0;
    let desktopInitialRoomPositioned = false;
    // Only a document that initially loaded as a desktop room page qualifies.
    // SPA navigation into a room later must not unexpectedly move the page.
    let desktopInitialRoomPositionCancelled = nativeMobilePage || !currentRoom;
    let desktopInitialRoomInputCancel = null;
    let mobilePrivateTab = null;
    let mobilePrivateBypass = false;
    let mobilePrivateMode = false;
    let mobileRoomGridOpen = false;
    let mobilePrivateActivationId = 0;
    let mobileTokensTab = null;
    let mobileTokensSlot = null;
    let mobileOverflowControl = null;
    let mobileTokensMenuItem = null;
    const mobileHiddenNodes = new Set();

    const roomLine = $('div', { class: 'roomgrid-dock-room' }, t('dockNoRoom'));
    const addBtn = $('button', { class: 'roomgrid-dock-action success', onclick: () => toggleCurrentRoomSaved() }, t('dockAdd'));
    const favoriteBtn = $('button', { class: 'roomgrid-dock-action', onclick: () => toggleCurrentRoomFavorite() }, t('dockFavoriteAdd'));
    const recuBtn = $('button', { class: 'roomgrid-dock-action roomgrid-recu-action', onclick: openCurrentRoomRecu }, t('dockRecu'));
    const recorderHubBtn = $('button', { class: 'roomgrid-dock-action', hidden: true, onclick: () => UnifiedRecorder.openHub(true) }, t('recorderOpenHub'));
    const recordStartBtn = $('button', { class: 'roomgrid-dock-action warn roomgrid-dock-record-start', onclick: queueCurrentRoomRecording }, t('dockRecord'));
    const recordPauseBtn = $('button', { class: 'roomgrid-dock-action warn', onclick: pauseResumeCurrentRoomRecording }, t('dockPauseRecording'));
    const recordStopBtn = $('button', { class: 'roomgrid-dock-action', onclick: stopCurrentRoomRecording }, t('dockStopRecording'));
    const recordControlRow = $('div', { class: 'roomgrid-dock-record-row', hidden: true }, [recordPauseBtn, recordStopBtn]);
    const sendTipMenuBtn = $('button', { class: 'roomgrid-dock-action roomgrid-send-tip-action', type: 'button', onclick: openNativeSendTip }, 'Send Tip');
    const privateMenuBtn = $('button', { class: 'roomgrid-dock-action roomgrid-private-action', type: 'button', onclick: openNativePrivateTab }, 'Private show options');
    const screenshotBtn = $('button', { class: 'roomgrid-dock-action', onclick: captureCurrentPageVideo }, t('dockScreenshot'));
    const pipBtn = $('button', { class: 'roomgrid-dock-action', onclick: toggleCurrentPagePiP }, t('dockPip'));
    const muteBtn = $('button', { class: 'roomgrid-dock-action', onclick: toggleCurrentPageMute }, t('dockMute'));
    const saveRow = $('div', { class: 'roomgrid-dock-save-row' }, [addBtn, favoriteBtn]);
    const head = $('button', { class: 'roomgrid-dock-head', title: 'Alt+M / Alt+A / Shift+A', onclick: () => { if (!dragged) toggleDock(); } }, [
      $('span', { class: 'roomgrid-dock-mark' }, '▦'),
      $('span', {}, [
        $('div', { class: 'roomgrid-dock-title' }, 'Rooms'),
        $('div', { class: 'roomgrid-dock-sub' }, t('dockSubtitle')),
      ]),
      $('span', { class: 'roomgrid-dock-chevron' }, '▾'),
    ]);
    const multicamTab = $('button', { class: 'roomgrid-dock-tab active', type: 'button' }, 'MultiCam');
    const arnaTabBadge = $('span', { class: 'roomgrid-dock-tab-badge' }, '0');
    const arnaTab = $('button', { class: 'roomgrid-dock-tab', type: 'button' }, [document.createTextNode('Cam ARNA '), arnaTabBadge]);
    const dockTabs = $('div', { class: 'roomgrid-dock-tabs', role: 'tablist' }, [multicamTab, arnaTab]);
    const dockAutoCollapseInput = $('input', {
      class: 'roomgrid-dock-setting-input', type: 'number', min: '0', max: '600', step: '1',
      value: String(getDockAutoCollapseSeconds()), title: t('dockAutoCollapseHint'),
    });
    const dockAutoCollapseSetting = $('label', { class: 'roomgrid-dock-setting' }, [
      $('span', {}, t('dockAutoCollapse')),
      $('span', { class: 'roomgrid-dock-setting-control' }, [dockAutoCollapseInput, $('span', {}, 's')]),
    ]);
    dockAutoCollapseInput.addEventListener('change', saveDockAutoCollapseSetting);
    const multicamPane = $('div', { class: 'roomgrid-dock-pane roomgrid-multicam-pane' }, [
      roomLine,
      $('div', { class: 'roomgrid-dock-actions' }, [
        $('button', { class: 'roomgrid-dock-action primary', onclick: openWorkstationNew }, t('dockOpen')),
        recorderHubBtn,
        recuBtn,
        saveRow,
        recordStartBtn,
        recordControlRow,
        screenshotBtn,
        pipBtn,
        muteBtn,
        sendTipMenuBtn,
        privateMenuBtn,
      ]),
      dockAutoCollapseSetting,
      $('div', { class: 'roomgrid-dock-foot' }, [
        $('button', { class: 'roomgrid-dock-link', onclick: () => { const s = Storage.load(); toast(t('memoryStat', s.rooms.length), 2500); } }, t('memoryView')),
        $('button', { class: 'roomgrid-dock-link roomgrid-dock-collapse-link', onclick: () => setDockCollapsed(true) }, t('collapseFAB')),
      ]),
    ]);
    const arnaPane = $('div', { class: 'roomgrid-dock-pane roomgrid-arna-pane', hidden: true });
    const body = $('div', { class: 'roomgrid-dock-body' }, [dockTabs, multicamPane, arnaPane]);
    // Every page load and every normal dock expansion starts on MultiCam.
    let activeDockTab = 'multicam';
    localStorage.setItem('roomgrid_active_dock_tab', 'multicam');
    const camArna = createCamArnaDock(arnaPane, {
      notify: (message) => toast(message, 2200),
      openExternal: (url) => openNoopener(url),
      onFoundCount: (count) => {
        arnaTabBadge.textContent = String(count);
        arnaTabBadge.style.display = count > 0 ? 'inline-block' : 'none';
      },
    });

    function setDockTab(tabName) {
      activeDockTab = tabName === 'arna' ? 'arna' : 'multicam';
      const showArna = activeDockTab === 'arna';
      multicamPane.hidden = showArna;
      arnaPane.hidden = !showArna;
      multicamTab.classList.toggle('active', !showArna);
      arnaTab.classList.toggle('active', showArna);
      multicamTab.setAttribute('aria-selected', showArna ? 'false' : 'true');
      arnaTab.setAttribute('aria-selected', showArna ? 'true' : 'false');
      root.classList.toggle('arna-active', showArna);
      if (showArna) camArna.activate(activeDockRoom());
      if (!collapsed) scheduleDockAutoCollapse();
    }
    multicamTab.addEventListener('click', () => setDockTab('multicam'));
    arnaTab.addEventListener('click', () => setDockTab('arna'));

    function toggleCurrentRoomSaved() {
      const room = activeDockRoom();
      if (!room) return;
      if (Storage.has(room)) {
        if (Storage.remove(room)) toast(t('removedNamed', room));
      } else {
        const r = Storage.add(room);
        toast(r === 'added' ? t('addedNamed', room) : r === 'exists' ? t('exists') : t('addFailed'));
      }
      refreshInjectorState();
      updateDockRoom();
    }

    function currentRoomIsFavorite() {
      const roomId = activeDockRoom();
      if (!roomId) return false;
      const room = Storage.load().rooms.find(item => item.id === roomId);
      return !!room && roomInGroup(room, FAVORITE_GROUP_ID);
    }

    function toggleCurrentRoomFavorite() {
      const roomId = activeDockRoom();
      if (!roomId) return;
      if (!Storage.has(roomId)) Storage.add(roomId);
      const state = Storage.load();
      const room = state.rooms.find(item => item.id === roomId);
      if (!room) return;
      const groups = new Set(getRoomGroups(room));
      const removing = groups.has(FAVORITE_GROUP_ID);
      if (removing) groups.delete(FAVORITE_GROUP_ID);
      else groups.add(FAVORITE_GROUP_ID);
      room.groups = [...groups];
      room.groupOrder = room.groupOrder && typeof room.groupOrder === 'object' ? room.groupOrder : {};
      if (!removing && !Number.isFinite(Number(room.groupOrder[FAVORITE_GROUP_ID]))) {
        room.groupOrder[FAVORITE_GROUP_ID] = nextOrderForGroup(state, FAVORITE_GROUP_ID);
      }
      Storage.save(state);
      toast(removing ? t('dockFavoriteRemove') : t('dockFavoriteAdd'));
      refreshInjectorState();
      updateDockRoom();
    }

    function updateDockRoom() {
      const room = activeDockRoom();
      const pageMediaAvailable = !!room && room === currentRoom;
      roomLine.textContent = room ? t('dockCurrentRoom', room) : t('dockNoRoom');
      addBtn.textContent = room && Storage.has(room) ? t('dockRemove') : t('dockAdd');
      addBtn.classList.toggle('success', !(room && Storage.has(room)));
      addBtn.classList.toggle('warn', !!(room && Storage.has(room)));
      addBtn.disabled = !room;
      addBtn.style.opacity = room ? '1' : '.55';
      const favorite = currentRoomIsFavorite();
      favoriteBtn.textContent = favorite ? t('dockFavoriteRemove') : t('dockFavoriteAdd');
      favoriteBtn.classList.toggle('warn', favorite);
      favoriteBtn.disabled = !room;
      favoriteBtn.style.opacity = room ? '1' : '.55';
      recuBtn.disabled = !room;
      recuBtn.style.opacity = room ? '1' : '.55';
      saveRow.hidden = !room;
      recuBtn.hidden = !room;
      recorderHubBtn.hidden = !!room;
      screenshotBtn.hidden = !pageMediaAvailable;
      pipBtn.hidden = !pageMediaAvailable;
      muteBtn.hidden = !pageMediaAvailable;
      sendTipMenuBtn.hidden = !pageMediaAvailable;
      privateMenuBtn.hidden = !pageMediaAvailable;
      const recording = room ? UnifiedRecorder.get(room) : null;
      const recordingActive = !!recording && UnifiedRecorder.has(room);
      const finalizing = !!recording && ['finalizing', 'saved'].includes(recording.status);
      const manuallyPaused = !!recording && (recording.manualPaused || recording.status === 'manual-paused');
      recordStartBtn.hidden = recordingActive;
      recordStartBtn.disabled = !room;
      recordStartBtn.style.opacity = room ? '1' : '.55';
      recordStartBtn.hidden = !room || recordingActive;
      recordControlRow.hidden = !room || !recordingActive;
      recordPauseBtn.textContent = manuallyPaused ? t('dockResumeRecording') : t('dockPauseRecording');
      recordPauseBtn.disabled = finalizing;
      recordStopBtn.disabled = finalizing;
      publishSuiteState();
    }

    function publishSuiteState() {
      const html = document.documentElement;
      html.dataset.ziggySuiteAvailable = '1';
      if (currentRoom) html.dataset.ziggySuiteRoom = currentRoom;
      else delete html.dataset.ziggySuiteRoom;
      html.dataset.ziggySuiteSaved = currentRoom && Storage.has(currentRoom) ? '1' : '0';
      html.dataset.ziggySuiteDockOpen = collapsed ? '0' : '1';
      document.dispatchEvent(new CustomEvent('ziggy-suite:state'));
    }
    currentRoomSubs.add(updateDockRoom);
    currentRoomSubs.add(() => { if (activeDockTab === 'arna') camArna.activate(activeDockRoom()); });
    storageSubs.add(updateDockRoom);
    UnifiedRecorder.subscribe(updateDockRoom);

    function syncDock() {
      root.classList.toggle('is-collapsed', !!collapsed);
      root.querySelector('.roomgrid-dock-chevron').textContent = collapsed ? '▴' : '▾';
      publishSuiteState();
    }

    function getDockAutoCollapseSeconds() {
      return clampInt(Storage.load().settings.dockAutoCollapseSeconds, 0, 600, 5);
    }

    function clearDockAutoCollapseTimer() {
      if (!dockAutoCollapseTimer) return;
      clearTimeout(dockAutoCollapseTimer);
      dockAutoCollapseTimer = 0;
    }

    function scheduleDockAutoCollapse() {
      clearDockAutoCollapseTimer();
      if (collapsed) return;
      // The mobile RoomGrid is a native tab, not a transient popup. Keep it open
      // until the user chooses another native room tab.
      if (nativeMobilePage && mobileRoomGridOpen) return;
      if (!nativeMobilePage && dockPointerInside) return;
      const seconds = getDockAutoCollapseSeconds();
      if (seconds <= 0) return;
      dockAutoCollapseTimer = setTimeout(() => {
        dockAutoCollapseTimer = 0;
        if (!nativeMobilePage && (dockPointerInside || root.matches(':hover'))) return;
        setDockCollapsed(true);
      }, seconds * 1000);
    }

    function setDockCollapsed(nextCollapsed, tabOnOpen = 'multicam') {
      collapsed = !!nextCollapsed;
      localStorage.setItem('ryujo_fab_collapsed', collapsed ? '1' : '0');
      if (collapsed) {
        clearDockAutoCollapseTimer();
        if (contextDockSummoned) {
          contextDockSummoned = false;
          contextualRoom = null;
          contextDockPageUrl = '';
          updateDockRoom();
        }
      } else {
        setDockTab(tabOnOpen === 'arna' ? 'arna' : 'multicam');
      }
      syncDock();
      syncNativeRoomGridPlacement();
      if (!collapsed) scheduleDockAutoCollapse();
    }

    function saveDockAutoCollapseSetting() {
      const seconds = clampInt(dockAutoCollapseInput.value, 0, 600, 5);
      const state = Storage.load();
      state.settings.dockAutoCollapseSeconds = seconds;
      Storage.save(state);
      dockAutoCollapseInput.value = String(seconds);
      toast(t('dockAutoCollapseSaved', seconds), 2200);
      scheduleDockAutoCollapse();
    }

    const toggleDock = () => {
      if (collapsed) setDockCollapsed(false, 'multicam');
      else setDockCollapsed(true);
    };

    function visibleNode(node) {
      if (!(node instanceof Element) || !node.isConnected) return false;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }

    function findNativeSendTipSource() {
      const nodes = [
        document.getElementById('sendTipButton'),
        document.querySelector('[data-testid="send-tip-button"]'),
      ].filter(Boolean);
      return nodes.find(node => !node.classList.contains('roomgrid-native-trigger')) || null;
    }

    function nativeActionText(node) {
      return String(node?.textContent || node?.value || node?.getAttribute?.('aria-label') || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
    }

    function desktopNativeActionCandidates() {
      return [...document.querySelectorAll('button,a,[role="button"],input[type="button"],input[type="submit"]')]
        .filter(node => !node.closest('#scriptcontrols,#zmc-root,.roomgrid-dock,.roomgrid-mobile-panel'));
    }

    function findNativeFanClubSource() {
      const mounted = document.querySelector('.roomgrid-native-fanclub-source');
      const direct = [
        document.getElementById('joinFanClubButton'),
        document.getElementById('join_fan_club_button'),
        document.querySelector('[data-testid="fanclub-button"]'),
        document.querySelector('.fanclubButton'),
        document.querySelector('[data-testid="join-fan-club-button"]'),
        document.querySelector('[data-testid*="fan-club" i]'),
      ].filter(Boolean);
      const candidates = [...new Set([...direct, ...desktopNativeActionCandidates()])]
        .filter(node => node !== mounted && visibleNode(node) && nativeActionText(node) === 'JOIN FAN CLUB')
        .sort((a, b) => {
          const ar = a.getBoundingClientRect();
          const br = b.getBoundingClientRect();
          return br.top - ar.top || (ar.width * ar.height) - (br.width * br.height);
        });
      // Theatre Mode can render a second action row while leaving the normal
      // row connected but hidden. Prefer that newly visible Fan Club control;
      // otherwise retain the already mounted source to avoid remount loops.
      return candidates[0] || (mounted?.isConnected ? mounted : null);
    }

    function findNativeRoomActionFallback() {
      const direct = [
        document.getElementById('followButton'),
        document.getElementById('unfollowButton'),
        document.querySelector('[data-testid="follow-button"]'),
        document.querySelector('[data-testid="unfollow-button"]'),
      ].filter(Boolean);
      const candidates = [...new Set([...direct, ...desktopNativeActionCandidates()])].filter(node => {
        if (!visibleNode(node)) return false;
        if (node.closest('nav,[role="navigation"]')) return false;
        const text = nativeActionText(node);
        return /^(?:FOLLOW|UNFOLLOW|FOLLOWING)(?:\s|$)/.test(text);
      });
      return candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0] || null;
    }

    function syncDesktopRoomGridTriggerSize(reference = findNativeRoomActionFallback()) {
      if (!nativeRoomGridTrigger || !visibleNode(reference)) return;
      const rect = reference.getBoundingClientRect();
      const style = getComputedStyle(reference);
      if (rect.width < 20 || rect.height < 12) return;
      Object.assign(nativeRoomGridTrigger.style, {
        boxSizing: 'border-box',
        width: 'auto',
        minWidth: '0',
        maxWidth: 'none',
        height: `${rect.height}px`,
        margin: style.margin,
        padding: style.padding,
        position: style.position === 'static' ? 'relative' : style.position,
        top: style.top,
        cssFloat: style.cssFloat,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        borderRadius: style.borderRadius,
      });
    }

    function openNativeSendTip() {
      const source = nativeSendTipSource || findNativeSendTipSource();
      setDockCollapsed(true);
      if (!source) { toast('Send Tip is not available in this room'); return; }
      source.click();
    }

    function positionDesktopRoomGridMenu() {
      if (nativeMobilePage || collapsed || !nativeRoomGridTrigger || !root.isConnected) return;
      const triggerRect = nativeRoomGridTrigger.getBoundingClientRect();
      const menuRect = root.getBoundingClientRect();
      const viewportLeft = window.scrollX || document.documentElement.scrollLeft || 0;
      const viewportTop = window.scrollY || document.documentElement.scrollTop || 0;
      const leftInViewport = Math.max(8, Math.min(innerWidth - menuRect.width - 8, triggerRect.right - menuRect.width));
      const spaceAbove = triggerRect.top - 8;
      const topInViewport = spaceAbove >= menuRect.height
        ? triggerRect.top - menuRect.height - 6
        : Math.min(innerHeight - menuRect.height - 8, triggerRect.bottom + 6);
      root.style.left = `${Math.round(viewportLeft + leftInViewport)}px`;
      root.style.top = `${Math.round(viewportTop + Math.max(8, topInViewport))}px`;
    }

    function removeDesktopRoomGridMount() {
      nativeRoomGridTrigger?.remove();
      nativeRoomGridTrigger = null;
      nativeDesktopRoomGridSource?.classList.remove('roomgrid-native-fanclub-source');
      nativeDesktopRoomGridSource = null;
      nativeDesktopRoomGridReplacesSource = false;
      nativeSendTipSource = null;
      root.classList.remove('roomgrid-native-desktop', 'roomgrid-context-desktop');
      if (!nativeMobilePage) root.remove();
    }

    function mountContextDesktopRoomGrid() {
      if (nativeMobilePage || !contextDockSummoned) return false;
      if (root.isConnected && root.classList.contains('roomgrid-context-desktop')) return true;
      removeDesktopRoomGridMount();
      root.classList.add('roomgrid-native-desktop', 'roomgrid-context-desktop');
      root.setAttribute('role', 'menu');
      root.setAttribute('aria-label', 'Rooms');
      if (!root.isConnected) document.body.appendChild(root);
      return true;
    }

    function mountDesktopRoomGrid() {
      if (nativeMobilePage || !currentRoom) { removeDesktopRoomGridMount(); return false; }
      const fanClubSource = findNativeFanClubSource();
      const source = fanClubSource || findNativeRoomActionFallback();
      const replacesSource = !!fanClubSource;
      if (!source) { removeDesktopRoomGridMount(); return false; }
      if (nativeDesktopRoomGridSource !== source
        || nativeDesktopRoomGridReplacesSource !== replacesSource
        || !nativeRoomGridTrigger?.isConnected) {
        removeDesktopRoomGridMount();
        nativeDesktopRoomGridSource = source;
        nativeDesktopRoomGridReplacesSource = replacesSource;
        nativeSendTipSource = findNativeSendTipSource();
        if (replacesSource) source.classList.add('roomgrid-native-fanclub-source');
        nativeRoomGridTrigger = $('button', {
          id: 'roomgrid-native-trigger',
          class: 'roomgrid-native-trigger',
          type: 'button',
          title: 'Open Rooms',
          'aria-label': 'Open Rooms',
          'aria-haspopup': 'menu',
          'aria-expanded': collapsed ? 'false' : 'true',
        }, 'ROOMS');
        const activate = event => {
          event.preventDefault();
          event.stopPropagation();
          toggleDock();
        };
        nativeRoomGridTrigger.addEventListener('click', activate);
        nativeRoomGridTrigger.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') activate(event);
          else if (event.key === 'ArrowUp') { event.preventDefault(); setDockCollapsed(false, 'multicam'); }
        });
        if (replacesSource) source.insertAdjacentElement('afterend', nativeRoomGridTrigger);
        else source.insertAdjacentElement('beforebegin', nativeRoomGridTrigger);
      }
      syncDesktopRoomGridTriggerSize(findNativeRoomActionFallback() || source);
      nativeSendTipSource = findNativeSendTipSource();
      root.classList.add('roomgrid-native-desktop');
      root.setAttribute('role', 'menu');
      root.setAttribute('aria-label', 'Rooms');
      if (!root.isConnected) document.body.appendChild(root);
      if (!collapsed) requestAnimationFrame(positionDesktopRoomGridMenu);
      return true;
    }

    function desktopVideoFitNodes() {
      if (nativeMobilePage || !currentRoom || document.fullscreenElement || isWorkstation) return null;
      const video = getPrimaryPageVideo();
      if (!video) return null;
      const panel = video.closest('#VideoPanel') || document.getElementById('VideoPanel');
      if (!panel || !panel.contains(video) || !visibleNode(panel)) return null;
      const roomContents = panel.closest('#TheaterModeRoomContents') || document.getElementById('TheaterModeRoomContents');
      if (!roomContents) return null;
      const handle = [...roomContents.querySelectorAll('.resizeHandle')].find(visibleNode);
      // Chaturbate hides this handle in Theatre Mode. Its visible state is the
      // most reliable signal that the room is in normal desktop split mode.
      if (!handle) return null;
      if (!nativeRoomGridTrigger || !visibleNode(nativeRoomGridTrigger)) return null;

      let anchor = nativeRoomGridTrigger;
      for (let node = anchor.parentElement, depth = 0; node && node !== document.body && depth < 4; node = node.parentElement, depth += 1) {
        const rect = node.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        if (rect.height <= 96 && rect.bottom >= anchorRect.bottom && rect.bottom - anchorRect.bottom <= 18) anchor = node;
        else if (rect.height > 96) break;
      }

      let topSection = panel.parentElement;
      while (topSection && topSection !== roomContents && !topSection.contains(handle)) topSection = topSection.parentElement;
      if (!topSection || !topSection.contains(handle)) topSection = roomContents;
      return { video, panel, handle, roomContents, topSection, anchor };
    }

    function applyDesktopVideoFit() {
      if (desktopVideoFitBusy || desktopVideoFitCompleted) return;
      if (!desktopVideoFitStartedAt) desktopVideoFitStartedAt = Date.now();
      const startupExpired = () => Date.now() - desktopVideoFitStartedAt >= 6000;
      const retryStartupFit = (delay = 140) => {
        if (startupExpired()) {
          desktopVideoFitCompleted = true;
          clearTimeout(desktopVideoFitTimer);
          return;
        }
        scheduleDesktopVideoFit(delay);
      };
      const nodes = desktopVideoFitNodes();
      if (!nodes) { retryStartupFit(); return; }
      const { video, panel, handle, roomContents, topSection, anchor } = nodes;

      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const handleRect = handle.getBoundingClientRect();
      const topRect = topSection.getBoundingClientRect();
      if (!viewportHeight || panelRect.width < 1 || anchorRect.height < 1 || topRect.width < 1
        || video.readyState < 2 || video.videoWidth < 1 || video.videoHeight < 1) {
        retryStartupFit();
        return;
      }

      // Chaturbate assembles the player and action row in several asynchronous
      // layout passes. Require two matching measurements before calculating the
      // one-time fit, otherwise a temporary geometry is persisted until refresh.
      const measurement = {
        viewportHeight,
        anchorBottom: anchorRect.bottom,
        panelWidth: panelRect.width,
        panelTop: panelRect.top,
        topWidth: topRect.width,
        handleWidth: handleRect.width,
      };
      const previous = desktopVideoFitLastMeasurement;
      const measurementStable = previous
        && Math.abs(previous.viewportHeight - measurement.viewportHeight) <= 1
        && Math.abs(previous.anchorBottom - measurement.anchorBottom) <= 1
        && Math.abs(previous.panelWidth - measurement.panelWidth) <= 1
        && Math.abs(previous.panelTop - measurement.panelTop) <= 1
        && Math.abs(previous.topWidth - measurement.topWidth) <= 1
        && Math.abs(previous.handleWidth - measurement.handleWidth) <= 1;
      desktopVideoFitLastMeasurement = measurement;
      desktopVideoFitStableSamples = measurementStable ? desktopVideoFitStableSamples + 1 : 1;
      if (desktopVideoFitStableSamples < 2) {
        retryStartupFit();
        return;
      }

      const videoRect = video.getBoundingClientRect();
      let heightPerWidth = videoRect.width > 0 ? videoRect.height / videoRect.width : 0;
      if (!(heightPerWidth > 0.3 && heightPerWidth < 1.1) && video.videoWidth > 0 && video.videoHeight > 0) {
        heightPerWidth = video.videoHeight / video.videoWidth;
      }
      if (!(heightPerWidth > 0.3 && heightPerWidth < 1.1)) heightPerWidth = 9 / 16;

      const rowSafety = 8;
      const heightDelta = (viewportHeight - rowSafety) - anchorRect.bottom;
      const nativeMinimumVideoWidth = 504;
      const nativeMinimumChatWidth = 155;
      const maximumByContainer = Math.floor(topRect.width - Math.max(0, handleRect.width) - nativeMinimumChatWidth);
      const maximumWidth = Math.max(nativeMinimumVideoWidth, maximumByContainer);
      const targetWidth = Math.round(Math.max(
        nativeMinimumVideoWidth,
        Math.min(maximumWidth, panelRect.width + (heightDelta / heightPerWidth)),
      ));
      if (!Number.isFinite(targetWidth) || Math.abs(targetWidth - panelRect.width) <= 3) {
        desktopVideoFitCompleted = true;
        clearTimeout(desktopVideoFitTimer);
        return;
      }

      const handleX = handleRect.left + (handleRect.width / 2);
      const targetX = panelRect.left + targetWidth + (handleRect.width / 2);
      const releaseDesktopVideoFit = () => {
        if (!desktopVideoFitBusy) return;
        desktopVideoFitBusy = false;
        setTimeout(() => {
          if (!panel.isConnected) {
            desktopVideoFitCompleted = true;
            return;
          }
          const nextWidth = panel.getBoundingClientRect().width;
          const madeProgress = Math.abs(nextWidth - panelRect.width) > 1;
          desktopVideoFitStableSamples = 0;
          desktopVideoFitLastMeasurement = null;
          // Re-measure the settled action row after every native drag. Some
          // Chaturbate layouts accept only a partial drag step, and the next
          // pass must calculate from the new persisted width.
          if (!startupExpired() && desktopVideoFitAttempts < 6) {
            scheduleDesktopVideoFit(madeProgress ? 140 : 220);
          } else {
            desktopVideoFitCompleted = true;
            clearTimeout(desktopVideoFitTimer);
          }
        }, 220);
      };
      desktopVideoFitAttempts += 1;
      desktopVideoFitBusy = true;
      try {
        handle.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true, cancelable: true,
          clientX: handleX, clientY: handleRect.top + (handleRect.height / 2),
          button: 0, buttons: 1,
        }));
        requestAnimationFrame(() => {
          try {
            roomContents.dispatchEvent(new MouseEvent('mousemove', {
              bubbles: true, cancelable: true,
              clientX: targetX, clientY: handleRect.top + (handleRect.height / 2),
              button: 0, buttons: 1,
            }));
          } catch (_) {
            releaseDesktopVideoFit();
            return;
          }
          requestAnimationFrame(() => {
            try {
              roomContents.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true, cancelable: true,
                clientX: targetX, clientY: handleRect.top + (handleRect.height / 2),
                button: 0, buttons: 0,
              }));
            } finally {
              releaseDesktopVideoFit();
            }
          });
        });
      } catch (_) {
        try {
          roomContents.dispatchEvent(new MouseEvent('mouseup', {
            bubbles: true, cancelable: true,
            clientX: targetX, clientY: handleRect.top + (handleRect.height / 2),
            button: 0, buttons: 0,
          }));
        } catch (_) {}
        releaseDesktopVideoFit();
      }
    }

    function scheduleDesktopVideoFit(delay = 120) {
      if (desktopVideoFitCompleted) return;
      if (!desktopInitialRoomPositioned && !desktopInitialRoomPositionCancelled) {
        scheduleDesktopInitialRoomPosition(Math.min(delay, 160));
        return;
      }
      clearTimeout(desktopVideoFitTimer);
      desktopVideoFitTimer = setTimeout(applyDesktopVideoFit, delay);
    }

    function clearDesktopInitialRoomPositionTimer() {
      clearTimeout(desktopInitialRoomPositionTimer);
      desktopInitialRoomPositionTimer = 0;
    }

    function removeDesktopInitialRoomInputListeners() {
      if (!desktopInitialRoomInputCancel) return;
      for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        document.removeEventListener(eventName, desktopInitialRoomInputCancel, true);
      }
      desktopInitialRoomInputCancel = null;
    }

    function cancelDesktopInitialRoomPosition() {
      desktopInitialRoomPositionCancelled = true;
      clearDesktopInitialRoomPositionTimer();
      removeDesktopInitialRoomInputListeners();
    }

    function applyDesktopInitialRoomPosition() {
      desktopInitialRoomPositionTimer = 0;
      if (desktopInitialRoomPositioned || desktopInitialRoomPositionCancelled) return;
      if (nativeMobilePage || isWorkstation || !currentRoom || document.fullscreenElement) {
        cancelDesktopInitialRoomPosition();
        return;
      }
      const nodes = desktopVideoFitNodes();
      if (!nodes) {
        desktopInitialRoomPositionAttempts += 1;
        if (desktopInitialRoomPositionAttempts < 24) scheduleDesktopInitialRoomPosition(180);
        else cancelDesktopInitialRoomPosition();
        return;
      }

      const panelRect = nodes.panel.getBoundingClientRect();
      if (!Number.isFinite(panelRect.top)) return;
      const targetTop = Math.max(0, Math.round(window.scrollY + panelRect.top));
      desktopInitialRoomPositioned = true;
      clearDesktopInitialRoomPositionTimer();
      removeDesktopInitialRoomInputListeners();
      window.scrollTo({ top: targetTop, left: window.scrollX, behavior: 'auto' });
      requestAnimationFrame(() => requestAnimationFrame(() => scheduleDesktopVideoFit(0)));
    }

    function scheduleDesktopInitialRoomPosition(delay = 160) {
      if (desktopInitialRoomPositioned || desktopInitialRoomPositionCancelled || desktopInitialRoomPositionTimer) return;
      desktopInitialRoomPositionTimer = setTimeout(applyDesktopInitialRoomPosition, delay);
    }

    function mobileTabText(node) {
      return String(node?.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function findMobilePrivateTab() {
      const selectors = 'li,[role="tab"],button,a';
      const candidates = [...document.querySelectorAll(selectors)].filter(node => {
        if (!visibleNode(node) || node.closest('#scriptcontrols,#zmc-root,.roomgrid-mobile-panel')) return false;
        const text = mobileTabText(node);
        return text === 'Private' || (node.classList.contains('roomgrid-mobile-tab') && /^(?:RoomGrid|Room Tools|Rooms)$/i.test(text));
      });
      return candidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      })[0] || null;
    }

    function findMobileTabStrip(tab) {
      let node = tab?.parentElement || null;
      for (let depth = 0; node && depth < 5; depth += 1, node = node.parentElement) {
        const text = mobileTabText(node);
        const rect = node.getBoundingClientRect();
        if (/Tokens/i.test(text) && /Bio/i.test(text) && /More Rooms/i.test(text) && rect.width >= innerWidth * 0.75 && rect.height < 180) return node;
      }
      return tab?.parentElement || null;
    }

    function findMobileTabByLabel(tabStrip, label) {
      if (!tabStrip) return null;
      const candidates = [...tabStrip.querySelectorAll('li,[role="tab"],button,a')].filter(node => {
        if (node.closest('#scriptcontrols,#zmc-root,.roomgrid-mobile-panel')) return false;
        return mobileTabText(node).toLowerCase() === label.toLowerCase();
      });
      return candidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      })[0] || null;
    }

    function mobileTabSlot(tabStrip, tab) {
      let slot = tab || null;
      while (slot?.parentElement && slot.parentElement !== tabStrip) slot = slot.parentElement;
      return slot?.parentElement === tabStrip ? slot : tab;
    }

    function findMobileOverflowControl(tabStrip) {
      if (!tabStrip) return null;
      const controls = [...tabStrip.querySelectorAll('li,[role="tab"],button,a')];
      const candidates = controls.filter(node => {
        const text = mobileTabText(node);
        const label = `${node.getAttribute('aria-label') || ''} ${node.getAttribute('title') || ''}`.trim();
        if (/^More Rooms$/i.test(text)) return false;
        return /^(?:⋮|…|\.\.\.)$/.test(text)
          || /(?:options|more tabs|overflow|\bmenu\b)/i.test(label);
      });
      const fallback = controls.filter(node => {
        const text = mobileTabText(node);
        const rect = node.getBoundingClientRect();
        return visibleNode(node) && rect.width > 0 && rect.width <= 100
          && !/^(?:Chat|Private|RoomGrid|Room Tools|Rooms|Tokens|Bio|More Rooms)$/i.test(text);
      }).sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
      if (!candidates.length) return fallback[0] || null;
      return candidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return (ar.width * ar.height) - (br.width * br.height);
      })[0] || null;
    }

    function findOpenMobileOverflowMenu(tabStrip, overflowControl) {
      if (!overflowControl) return null;
      const overflowRect = overflowControl.getBoundingClientRect();
      const selectors = '[role="menu"],[role="listbox"],[data-testid*="menu" i],[class*="Menu"],[class*="menu"]';
      const candidates = [...new Set(document.querySelectorAll(selectors))].filter(node => {
        if (!visibleNode(node) || node === tabStrip || node.contains(tabStrip) || tabStrip?.contains(node)) return false;
        if (node.closest('#scriptcontrols,#zmc-root,.roomgrid-mobile-panel')) return false;
        const rect = node.getBoundingClientRect();
        if (rect.width < 70 || rect.height < 32 || rect.width > innerWidth || rect.height > innerHeight * 0.9) return false;
        return !!node.querySelector('button,a,[role="menuitem"]');
      });
      return candidates.sort((a, b) => {
        const score = node => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          const roleBonus = node.getAttribute('role') === 'menu' ? 1000 : 0;
          const positionBonus = /fixed|absolute/.test(style.position) ? 500 : 0;
          const distance = Math.abs(rect.right - overflowRect.right) + Math.abs(rect.top - overflowRect.bottom);
          return roleBonus + positionBonus - distance;
        };
        return score(b) - score(a);
      })[0] || null;
    }

    function activateMobileTokensFromMenu(event) {
      event?.preventDefault?.();
      const source = mobileTokensTab;
      if (!source) return;
      collapsed = true;
      mobilePrivateMode = false;
      syncDock();
      setMobileRoomGridOpen(false);
      invokeNativeMobilePrivateTab(source);
      setTimeout(() => {
        mobileTokensMenuItem?.remove();
        mobileTokensMenuItem = null;
        try {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
        } catch (_) {}
      }, 0);
    }

    function mountMobileTokensMenuItem(tabStrip) {
      if (!nativeMobilePage || !mobileTokensTab || !mobileOverflowControl) return false;
      if (mobileTokensMenuItem?.isConnected) return true;
      const menu = findOpenMobileOverflowMenu(tabStrip, mobileOverflowControl);
      if (!menu) return false;
      const reference = [...menu.querySelectorAll('button,a,[role="menuitem"]')].find(node => {
        if (!visibleNode(node) || node.classList.contains('roomgrid-mobile-tokens-menu-item')) return false;
        return !node.closest('#scriptcontrols,#zmc-root,.roomgrid-mobile-panel');
      });
      let template = reference;
      let host = reference?.parentElement || menu;
      if (reference && host !== menu) {
        const siblingActions = [...host.children].filter(node => node.matches?.('button,a,[role="menuitem"]')
          || node.querySelector?.('button,a,[role="menuitem"]'));
        if (siblingActions.length === 1 && host.parentElement) {
          template = host;
          host = host.parentElement;
        }
      }
      const item = template ? template.cloneNode(true) : document.createElement('button');
      const action = item.matches?.('button,a,[role="menuitem"]')
        ? item
        : item.querySelector?.('button,a,[role="menuitem"]') || item;
      for (const node of [item, ...(item.querySelectorAll?.('[id]') || [])]) node.removeAttribute?.('id');
      action.removeAttribute('href');
      action.removeAttribute('data-testid');
      action.removeAttribute('aria-selected');
      action.removeAttribute('disabled');
      if (action.tagName === 'BUTTON') action.type = 'button';
      item.classList.add('roomgrid-mobile-tokens-menu-item');
      action.setAttribute('role', 'menuitem');
      action.setAttribute('aria-label', 'Tokens');
      action.textContent = 'Tokens';
      action.addEventListener('click', activateMobileTokensFromMenu);
      host.appendChild(item);
      mobileTokensMenuItem = item;
      return true;
    }

    function scheduleMobileTokensMenuMount() {
      const tabStrip = findMobileTabStrip(mobilePrivateTab);
      for (const delay of [0, 80, 180]) {
        setTimeout(() => mountMobileTokensMenuItem(tabStrip), delay);
      }
    }

    function handleMobileOverflowClick() {
      scheduleMobileTokensMenuMount();
    }

    function syncMobileRoomTabOrder(tabStrip) {
      if (!nativeMobilePage || !tabStrip || !mobilePrivateTab) return;
      const bioTab = findMobileTabByLabel(tabStrip, 'Bio');
      const tokensTab = findMobileTabByLabel(tabStrip, 'Tokens');
      const moreRoomsTab = findMobileTabByLabel(tabStrip, 'More Rooms');
      const overflowControl = findMobileOverflowControl(tabStrip);
      const nextTokensSlot = mobileTabSlot(tabStrip, tokensTab);
      if (mobileTokensSlot && mobileTokensSlot !== nextTokensSlot) mobileTokensSlot.classList.remove('roomgrid-mobile-token-source');
      mobileTokensTab = tokensTab || mobileTokensTab;
      mobileTokensSlot = nextTokensSlot || mobileTokensSlot;
      mobileTokensSlot?.classList.add('roomgrid-mobile-token-source');

      if (mobileOverflowControl !== overflowControl) {
        mobileOverflowControl?.removeEventListener('click', handleMobileOverflowClick, true);
        mobileOverflowControl = overflowControl;
        mobileOverflowControl?.addEventListener('click', handleMobileOverflowClick, true);
        mobileTokensMenuItem?.remove();
        mobileTokensMenuItem = null;
      }

      const desiredSlots = [
        mobileTabSlot(tabStrip, bioTab),
        mobileTabSlot(tabStrip, mobilePrivateTab),
        mobileTabSlot(tabStrip, moreRoomsTab),
        mobileTabSlot(tabStrip, overflowControl),
      ].filter((slot, index, list) => slot?.parentElement === tabStrip && list.indexOf(slot) === index);
      const currentOrder = [...tabStrip.children].filter(node => desiredSlots.includes(node));
      if (desiredSlots.length >= 3 && desiredSlots.some((slot, index) => currentOrder[index] !== slot)) {
        desiredSlots.forEach(slot => tabStrip.appendChild(slot));
      }
      mountMobileTokensMenuItem(tabStrip);
    }

    function restoreMobileRoomTabOrder() {
      mobileTokensSlot?.classList.remove('roomgrid-mobile-token-source');
      mobileTokensMenuItem?.remove();
      mobileOverflowControl?.removeEventListener('click', handleMobileOverflowClick, true);
      mobileTokensTab = null;
      mobileTokensSlot = null;
      mobileOverflowControl = null;
      mobileTokensMenuItem = null;
    }

    function restoreMobileNativeContent() {
      for (const node of [...mobileHiddenNodes]) {
        node.classList.remove('roomgrid-mobile-native-hidden');
        mobileHiddenNodes.delete(node);
      }
    }

    function hideMobileNativeContent(panel, tabStrip) {
      restoreMobileNativeContent();
      const parent = panel?.parentElement;
      if (!parent) return;
      if (parent.classList.contains('PrivateTab')) {
        for (const node of [...parent.children]) {
          if (node === panel || node.querySelector?.('#sendTipButton,[data-testid="send-tip-button"]')) continue;
          node.classList.add('roomgrid-mobile-native-hidden');
          mobileHiddenNodes.add(node);
        }
        return;
      }
      const stripRect = tabStrip?.getBoundingClientRect();
      for (const node of [...parent.children]) {
        if (node === panel || node === tabStrip || node.contains(tabStrip) || node.closest?.('#zmc-root')) continue;
        if (node.querySelector?.('#sendTipButton,[data-testid="send-tip-button"]')) continue;
        const rect = node.getBoundingClientRect();
        if (rect.height < 1 || (stripRect && rect.bottom < stripRect.bottom - 2)) continue;
        node.classList.add('roomgrid-mobile-native-hidden');
        mobileHiddenNodes.add(node);
      }
    }

    const mobilePanel = $('section', {
      id: 'roomgrid-mobile-panel',
      class: 'roomgrid-mobile-panel',
      role: 'tabpanel',
      'aria-label': 'Rooms',
      hidden: true,
    });

    function setMobileRoomGridOpen(open) {
      const wasOpen = mobileRoomGridOpen && !mobilePanel.hidden;
      const savedScrollTop = mobilePanel.scrollTop;
      mobileRoomGridOpen = !!open && !!currentRoom;
      mobilePanel.hidden = !mobileRoomGridOpen;
      if (mobilePrivateTab) {
        mobilePrivateTab.classList.toggle('roomgrid-mobile-tab-active', mobileRoomGridOpen);
        mobilePrivateTab.setAttribute('aria-selected', mobileRoomGridOpen ? 'true' : 'false');
        mobilePrivateTab.setAttribute('aria-expanded', mobileRoomGridOpen ? 'true' : 'false');
      }
      if (mobileRoomGridOpen) {
        const strip = findMobileTabStrip(mobilePrivateTab);
        hideMobileNativeContent(mobilePanel, strip);
        if (!wasOpen) mobilePanel.scrollIntoView?.({ block: 'nearest' });
        else if (mobilePanel.scrollTop !== savedScrollTop) mobilePanel.scrollTop = savedScrollTop;
      } else {
        restoreMobileNativeContent();
      }
    }

    function invokeNativeMobilePrivateTab(tab) {
      if (!tab) return false;
      try {
        const view = tab.ownerDocument?.defaultView || window;
        const nativeClick = view.HTMLElement?.prototype?.click;
        if (typeof nativeClick === 'function' && tab instanceof view.HTMLElement) {
          nativeClick.call(tab);
          return true;
        }
      } catch (_) {}
      try {
        tab.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window,
        }));
        return true;
      } catch (_) {
        return false;
      }
    }

    function activateMobileRoomGrid() {
      if (!nativeMobilePage || !mobilePrivateTab || mobilePrivateMode) return false;
      const activationId = ++mobilePrivateActivationId;
      const tab = mobilePrivateTab;
      mobilePrivateBypass = true;
      const nativeActivated = invokeNativeMobilePrivateTab(tab);
      const finishActivation = () => {
        if (activationId !== mobilePrivateActivationId) return;
        mobilePrivateBypass = false;
        if (!nativeMobilePage || mobilePrivateMode) return;
        setDockCollapsed(false, 'multicam');
        mountMobileRoomGrid();
        setMobileRoomGridOpen(true);
        requestAnimationFrame(() => {
          if (activationId !== mobilePrivateActivationId || mobilePrivateMode) return;
          mountMobileRoomGrid();
          setMobileRoomGridOpen(true);
        });
      };
      if (nativeActivated) setTimeout(finishActivation, 0);
      else finishActivation();
      return true;
    }

    function handleMobileRoomGridClick(event) {
      if (mobilePrivateBypass || mobilePrivateMode) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      activateMobileRoomGrid();
    }

    function handleMobileRoomGridKeydown(event) {
      const activationKey = event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space';
      if (!activationKey || mobilePrivateBypass || mobilePrivateMode) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      activateMobileRoomGrid();
    }

    function openNativePrivateTab() {
      if (!nativeMobilePage || !mobilePrivateTab) return;
      collapsed = true;
      mobilePrivateMode = true;
      syncDock();
      setMobileRoomGridOpen(false);
      mobilePrivateBypass = true;
      mobilePrivateTab.textContent = 'Private';
      mobilePrivateTab.classList.remove('roomgrid-mobile-tab');
      mobilePrivateTab.removeAttribute('aria-label');
      invokeNativeMobilePrivateTab(mobilePrivateTab);
      setTimeout(() => {
        mobilePrivateBypass = false;
      }, 0);
    }

    function restoreMobilePrivateTab() {
      setMobileRoomGridOpen(false);
      restoreMobileRoomTabOrder();
      if (mobilePrivateTab) {
        mobilePrivateTab.removeEventListener('click', handleMobileRoomGridClick, true);
        mobilePrivateTab.removeEventListener('keydown', handleMobileRoomGridKeydown, true);
        mobilePrivateTab.textContent = 'Private';
        mobilePrivateTab.classList.remove('roomgrid-mobile-tab', 'roomgrid-mobile-tab-active');
        mobilePrivateTab.removeAttribute('aria-label');
        mobilePrivateTab.removeAttribute('aria-expanded');
        mobilePrivateTab.removeAttribute('aria-controls');
        mobilePrivateTab.removeAttribute('tabindex');
      }
      mobilePrivateTab = null;
      mobilePrivateMode = false;
      mobilePanel.remove();
    }

    function mountMobileRoomGrid() {
      if (!nativeMobilePage || !currentRoom) { restoreMobilePrivateTab(); return false; }
      if (mobilePrivateMode) return false;
      const tab = findMobilePrivateTab();
      if (!tab) return false;
      if (mobilePrivateTab !== tab) {
        if (mobilePrivateTab) {
          mobilePrivateTab.removeEventListener('click', handleMobileRoomGridClick, true);
          mobilePrivateTab.removeEventListener('keydown', handleMobileRoomGridKeydown, true);
          mobilePrivateTab.classList.remove('roomgrid-mobile-tab', 'roomgrid-mobile-tab-active');
        }
        mobilePrivateTab = tab;
        tab.addEventListener('click', handleMobileRoomGridClick, true);
        tab.addEventListener('keydown', handleMobileRoomGridKeydown, true);
      }
      tab.textContent = 'Rooms';
      tab.classList.add('roomgrid-mobile-tab');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-label', 'Rooms');
      tab.setAttribute('aria-controls', mobilePanel.id);
      tab.setAttribute('tabindex', '0');
      const tabStrip = findMobileTabStrip(tab);
      if (!tabStrip) return false;
      syncMobileRoomTabOrder(tabStrip);
      const privateSlot = document.querySelector('#portrait-contents .BaseRoomTab.PrivateTab,.BaseRoomTab.PrivateTab');
      if (privateSlot) {
        const actionBar = [...privateSlot.children].find(node => node.querySelector?.('#sendTipButton,[data-testid="send-tip-button"]')) || null;
        const alreadyPlaced = mobilePanel.parentElement === privateSlot
          && (actionBar ? mobilePanel.nextSibling === actionBar : mobilePanel === privateSlot.lastElementChild);
        if (!alreadyPlaced) {
          const savedScrollTop = mobilePanel.scrollTop;
          privateSlot.insertBefore(mobilePanel, actionBar);
          mobilePanel.scrollTop = savedScrollTop;
        }
      } else {
        if (mobilePanel.previousElementSibling !== tabStrip) tabStrip.insertAdjacentElement('afterend', mobilePanel);
      }
      if (body.parentElement !== mobilePanel) mobilePanel.appendChild(body);
      setMobileRoomGridOpen(!collapsed && mobileRoomGridOpen);
      return true;
    }

    function syncNativeRoomGridPlacement() {
      if (!currentRoom) {
        if (contextDockSummoned && !nativeMobilePage) {
          clearTimeout(desktopVideoFitTimer);
          clearDesktopInitialRoomPositionTimer();
          restoreMobilePrivateTab();
          mountContextDesktopRoomGrid();
          syncDock();
          return;
        }
        collapsed = true;
        clearTimeout(desktopVideoFitTimer);
        clearDesktopInitialRoomPositionTimer();
        removeDesktopRoomGridMount();
        restoreMobilePrivateTab();
        syncDock();
        return;
      }
      if (nativeMobilePage) {
        clearTimeout(desktopVideoFitTimer);
        cancelDesktopInitialRoomPosition();
        removeDesktopRoomGridMount();
        if (!collapsed) mobilePrivateMode = false;
        mountMobileRoomGrid();
        setMobileRoomGridOpen(!collapsed);
      } else {
        restoreMobilePrivateTab();
        mountDesktopRoomGrid();
        nativeRoomGridTrigger?.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (!collapsed) requestAnimationFrame(positionDesktopRoomGridMenu);
        scheduleDesktopInitialRoomPosition();
      }
    }

    function openRoomsDock(detail = {}) {
      const requestedRoom = normalizeUsername(detail.modelId || '');
      contextualRoom = isLikelyUsername(requestedRoom) ? requestedRoom : null;
      contextDockSummoned = detail.summonedBy === 'browser-context-menu';
      contextDockPageUrl = contextDockSummoned ? location.href : '';
      updateDockRoom();
      setDockCollapsed(false, detail.tab === 'arna' ? 'arna' : 'multicam');
      updateDockRoom();
    }

    document.addEventListener('ziggy-suite:open-workshop', openWorkstationNew);
    document.addEventListener('ziggy-suite:open-rooms', event => openRoomsDock(event.detail));
    document.addEventListener('ziggy-suite:toggle-roomgrid', event => setDockCollapsed(false, event.detail?.tab === 'arna' ? 'arna' : 'multicam'));
    document.addEventListener('ziggy-suite:toggle-current-room', () => {
      if (currentRoom) toggleCurrentRoomSaved();
      else toast(t('dockNoRoom'));
    });
    document.addEventListener('ziggy-mobile-shell:ready', publishSuiteState);
    window.addEventListener('pagehide', () => {
      if (contextDockSummoned) setDockCollapsed(true);
      delete document.documentElement.dataset.ziggySuiteAvailable;
      delete document.documentElement.dataset.ziggySuiteRoom;
      delete document.documentElement.dataset.ziggySuiteSaved;
      delete document.documentElement.dataset.ziggySuiteDockOpen;
    });

    const dockCard = $('div', { class: 'roomgrid-dock-card' }, [head, body]);
    root.appendChild(dockCard);
    if (!nativeMobilePage && !contextOnly) {
      ensureWorkshopHeaderButton();
      const ensureWorkshopHeaderButtonSoon = debounce(ensureWorkshopHeaderButton, 120);
      try {
        const workshopButtonMo = new MutationObserver(ensureWorkshopHeaderButtonSoon);
        workshopButtonMo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
    }
    updateDockRoom();
    setDockTab('multicam');
    syncDock();
    syncNativeRoomGridPlacement();

    const syncNativeRoomGridPlacementSoon = debounce(syncNativeRoomGridPlacement, 100);
    currentRoomSubs.add(syncNativeRoomGridPlacementSoon);
    if (!desktopInitialRoomPositionCancelled) {
      desktopInitialRoomInputCancel = event => {
        if (desktopInitialRoomPositioned || desktopInitialRoomPositionCancelled) return;
        if (event.type === 'keydown' && !['PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) return;
        cancelDesktopInitialRoomPosition();
      };
      for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        document.addEventListener(eventName, desktopInitialRoomInputCancel, { capture: true, passive: true });
      }
    }
    if (!contextOnly) {
      try {
        const nativeRoomGridMo = new MutationObserver(syncNativeRoomGridPlacementSoon);
        nativeRoomGridMo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
    }
    addEventListener('resize', () => {
      if (!nativeMobilePage && !collapsed) positionDesktopRoomGridMenu();
      else syncNativeRoomGridPlacementSoon();
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
      if (collapsed || nativeMobilePage) return;
      if (root.contains(event.target) || nativeRoomGridTrigger?.contains(event.target)) return;
      setDockCollapsed(true);
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || collapsed) return;
      setDockCollapsed(true);
      nativeRoomGridTrigger?.focus?.();
    });
    document.addEventListener('click', event => {
      if (!nativeMobilePage || !mobileRoomGridOpen || !mobilePrivateTab) return;
      const strip = findMobileTabStrip(mobilePrivateTab);
      const selected = event.target?.closest?.('li,[role="tab"],button,a');
      if (selected && strip?.contains(selected) && selected !== mobilePrivateTab && !selected.contains(mobilePrivateTab)) {
        collapsed = true;
        mobilePrivateMode = false;
        syncDock();
        setMobileRoomGridOpen(false);
        setTimeout(syncNativeRoomGridPlacementSoon, 0);
      }
    }, true);

    // Treat clicks, typing, and control changes as activity and restart the inactivity countdown.
    for (const eventName of ['pointerdown', 'keydown', 'input', 'change']) {
      root.addEventListener(eventName, () => { if (!collapsed) scheduleDockAutoCollapse(); }, true);
    }
    root.addEventListener('pointerenter', () => {
      dockPointerInside = true;
      clearDockAutoCollapseTimer();
    });
    root.addEventListener('pointerleave', () => {
      dockPointerInside = false;
      if (!collapsed) scheduleDockAutoCollapse();
    });

    if (contextOnly) return;

    if (!nativeMobilePage) {
      head.addEventListener('mousedown', (e) => {
        sx = e.clientX; sy = e.clientY;
        const rect = root.getBoundingClientRect();
        ox = rect.left; oy = rect.top;
        dragged = false;
        const move = (ev) => {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 6) dragged = true;
          if (dragged) {
            root.classList.add('roomgrid-user-positioned');
            root.style.left = (ox + ev.clientX - sx) + 'px';
            root.style.top = (oy + ev.clientY - sy) + 'px';
            root.style.right = 'auto';
            root.style.bottom = 'auto';
          }
        };
        const up = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    }

    // —— 快捷键 ——
    document.addEventListener('keydown', (e) => {
      const targetTag = String(e.target?.tagName || '').toLowerCase();
      if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'a' && !['input', 'textarea', 'select'].includes(targetTag)) {
        e.preventDefault();
        setDockCollapsed(false, 'arna');
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key.toLowerCase() === 'm') { e.preventDefault(); openWorkstationNew(); }
      if (e.key.toLowerCase() === 'a' && currentRoom) {
        e.preventDefault();
        if (Storage.has(currentRoom)) toast(t('alreadyAdded', currentRoom));
        else {
          const r = Storage.add(currentRoom);
          toast(r === 'added' ? t('addedNamed', currentRoom) : t('addFailed'));
        }
        refreshInjectorState();
        updateDockRoom();
      }
    });

    // —— Toast ——
    function toast(text, ms = 1800) {
      const toastEl = $('div', {
        style: {
          position: 'fixed', left: '50%', top: '20%', transform: 'translateX(-50%)',
          background: 'rgba(20,20,24,.95)', color: '#fff', padding: '12px 20px',
          borderRadius: '10px', zIndex: 999999, fontSize: '14px', fontFamily: 'system-ui',
          boxShadow: '0 8px 24px rgba(0,0,0,.5)', backdropFilter: 'blur(10px)',
        },
      }, String(text || ''));
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), ms);
    }

    function initMobileReloadedMenu() {
      if (!nativeMobilePage) return;
      const style = $('style', { html: trustedHtml(`
        .ziggy-mobile-reloaded-link { display:flex !important; width:100% !important; min-height:54px !important; align-items:center !important; justify-content:flex-start !important; gap:12px !important; padding:0 22px !important; color:inherit !important; text-decoration:none !important; cursor:pointer !important; touch-action:manipulation; }
        .ziggy-mobile-reloaded-link .ziggy-mobile-reloaded-icon { font-size:25px; line-height:1; }
        .ziggy-mobile-reloaded-link .ziggy-mobile-reloaded-label { font:500 17px/1.2 UbuntuRegular,Arial,sans-serif; }
        .ziggy-mobile-reloaded-backdrop { position:fixed; inset:0; z-index:2147483500; display:flex; align-items:stretch; justify-content:flex-start; background:rgba(0,0,0,.68); font-family:UbuntuRegular,Arial,sans-serif; }
        .ziggy-mobile-reloaded-panel { box-sizing:border-box; width:min(82vw,370px); height:100dvh; max-height:none; overflow-y:auto; overscroll-behavior:contain; padding:max(14px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left)); border:0; border-right:1px solid #2d3e50; border-radius:0; background:#202c39; color:#f8fafc; box-shadow:14px 0 40px rgba(0,0,0,.36); }
        .ziggy-mobile-reloaded-head { position:sticky; top:-14px; z-index:2; display:flex; align-items:center; gap:10px; margin:-14px -2px 10px; padding:14px 2px 10px; background:#1d2a3a; }
        .ziggy-mobile-reloaded-title { min-width:0; flex:1; }
        .ziggy-mobile-reloaded-title strong { display:block; font-size:18px; }
        .ziggy-mobile-reloaded-title span { display:block; margin-top:2px; color:#aeb9c9; font-size:12px; }
        .ziggy-mobile-reloaded-close { width:44px; height:44px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#fff; font-size:22px; cursor:pointer; }
        .ziggy-mobile-reloaded-section { display:grid; gap:7px; margin-top:12px; }
        .ziggy-mobile-reloaded-section-title { color:#68b5f0; font-size:12px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
        .ziggy-mobile-reloaded-row { min-height:50px; display:flex; align-items:center; justify-content:space-between; gap:14px; padding:8px 11px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#f8fafc; }
        .ziggy-mobile-reloaded-row span { min-width:0; font-size:14px; font-weight:700; }
        .ziggy-mobile-reloaded-row input { flex:0 0 auto; width:24px; height:24px; accent-color:#0c6a93; }
        .ziggy-mobile-reloaded-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .ziggy-mobile-reloaded-action { min-height:48px; padding:9px 11px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#fff; font-size:13px; font-weight:700; cursor:pointer; touch-action:manipulation; }
        .ziggy-mobile-reloaded-action:hover,.ziggy-mobile-reloaded-action:focus-visible { border-color:#68b5f0; background:#253648; }
        .ziggy-mobile-reloaded-action.primary { background:#0c6a93; border-color:#0c6a93; }
        .ziggy-mobile-reloaded-action.cloud,.ziggy-mobile-reloaded-action.import { background:#17202a; }
        .ziggy-mobile-reloaded-note { margin-top:10px; padding:9px 11px; border-radius:4px; background:#17202a; color:#b9c5d4; font-size:12px; line-height:1.4; }
        @media (max-width:420px) { .ziggy-mobile-reloaded-actions { grid-template-columns:1fr; } }
      `)});
      document.head.appendChild(style);

      const settingDefinitions = [
        { label: 'Preview rooms', key: 'animationoff', inverted: true },
        { label: 'Open rooms in new tab', key: 'newtabon', inverted: true },
        { label: 'Auto refresh followed', key: 'refreshoff', inverted: false },
        { label: 'Big thumbnails', key: 'bigthumb', inverted: false },
        { label: 'Hide male/trans', key: 'hidemt', inverted: false },
        { label: '480px snapshots', key: 'smallsnap', inverted: false },
      ];

      function settingEnabled(definition) {
        const exists = localStorage.getItem(definition.key) !== null;
        return definition.inverted ? !exists : exists;
      }

      function setSettingEnabled(definition, enabled) {
        const shouldExist = definition.inverted ? !enabled : enabled;
        if (shouldExist) localStorage.setItem(definition.key, 'foo');
        else localStorage.removeItem(definition.key);
        document.dispatchEvent(new CustomEvent('ziggy-suite:reloaded-setting-changed', { detail: definition.key }));
      }

      function openMobileReloadedPanel() {
        document.getElementById('ziggy-mobile-reloaded-backdrop')?.remove();
        const backdrop = $('div', { id: 'ziggy-mobile-reloaded-backdrop', class: 'ziggy-mobile-reloaded-backdrop' });
        const panel = $('section', { class: 'ziggy-mobile-reloaded-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ziggy Suite' });
        const close = () => backdrop.remove();
        const closeButton = $('button', { class: 'ziggy-mobile-reloaded-close', type: 'button', 'aria-label': 'Close Reloaded settings', onclick: close }, '×');
        const toggles = settingDefinitions.map(definition => {
          const input = $('input', { type: 'checkbox', checked: settingEnabled(definition), 'aria-label': definition.label });
          input.addEventListener('change', () => setSettingEnabled(definition, input.checked));
          return $('label', { class: 'ziggy-mobile-reloaded-row' }, [$('span', {}, definition.label), input]);
        });
        const callSuite = (method) => {
          const api = window.__chaturbateSuiteSettings;
          if (!api || typeof api[method] !== 'function') { toast('Suite settings are not ready'); return; }
          close();
          api[method]();
        };
        const dispatch = (type, detail) => {
          close();
          document.dispatchEvent(new CustomEvent(type, { detail }));
        };
        const room = document.documentElement.dataset.ziggySuiteRoom || '';
        const saved = document.documentElement.dataset.ziggySuiteSaved === '1';
        const toolButton = (label, type, detail, className = '') => $('button', {
          class: `ziggy-mobile-reloaded-action ${className}`.trim(),
          type: 'button',
          onclick: () => dispatch(type, detail),
        }, label);
        const configured = !!window.__chaturbateSuiteSettings?.isGithubSyncConfigured?.();
        panel.append(
          $('div', { class: 'ziggy-mobile-reloaded-head' }, [
            $('div', { class: 'ziggy-mobile-reloaded-title' }, [$('strong', {}, 'Ziggy Suite'), $('span', {}, `Version ${META.version} · native mobile tools`)]),
            closeButton,
          ]),
          $('div', { class: 'ziggy-mobile-reloaded-section' }, [
            $('div', { class: 'ziggy-mobile-reloaded-section-title' }, 'Suite'),
            $('div', { class: 'ziggy-mobile-reloaded-actions' }, [
              toolButton('Open Workshop', 'ziggy-suite:open-workshop', null, 'primary'),
              $('button', { class: 'ziggy-mobile-reloaded-action', type: 'button', onclick: () => { close(); UnifiedRecorder.openHub(true); } }, 'Recorder Hub'),
              toolButton(room ? (saved ? `Remove ${room}` : `Add ${room}`) : 'Add current model', 'ziggy-suite:toggle-current-room'),
              toolButton('Rooms', 'ziggy-suite:toggle-roomgrid', { tab: 'multicam' }),
              toolButton('Cam ARNA', 'ziggy-suite:toggle-roomgrid', { tab: 'arna' }),
              toolButton('Video fullscreen', 'ziggy-mobile-clean-view:fullscreen'),
              toolButton('Picture-in-Picture', 'ziggy-mobile-clean-view:pip'),
              toolButton('Mobile Clean View settings', 'ziggy-mobile-clean-view:open-panel', { view: 'settings' }),
            ]),
          ]),
          $('div', { class: 'ziggy-mobile-reloaded-section' }, [
            $('div', { class: 'ziggy-mobile-reloaded-section-title' }, 'Backup'),
            $('div', { class: 'ziggy-mobile-reloaded-actions' }, [
              $('button', { class: 'ziggy-mobile-reloaded-action cloud', type: 'button', onclick: () => callSuite('exportSettings') }, 'Export all to GitHub'),
              $('button', { class: 'ziggy-mobile-reloaded-action import', type: 'button', onclick: () => callSuite('importSettings') }, 'Import all from GitHub'),
              $('button', { class: 'ziggy-mobile-reloaded-action', type: 'button', onclick: () => callSuite('configureGithubSync') }, configured ? 'GitHub Cloud: Configured' : 'Set up GitHub Cloud'),
            ]),
          ]),
          $('div', { class: 'ziggy-mobile-reloaded-section' }, [
            $('div', { class: 'ziggy-mobile-reloaded-section-title' }, 'Reloaded settings'),
            ...toggles,
          ]),
          $('div', { class: 'ziggy-mobile-reloaded-note' }, 'Chat is hidden only on Chaturbate’s native mobile layout. Desktop pages keep their normal chat and player. The encrypted backup includes MultiCam, Reloaded, and Mobile Clean View settings.'),
        );
        backdrop.appendChild(panel);
        backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
        document.body.appendChild(backdrop);
        closeButton.focus();
      }

      function replaceOfficialXLink(scope = document) {
        const anchors = [];
        if (scope instanceof HTMLAnchorElement) anchors.push(scope);
        if (scope === document || scope instanceof Element) anchors.push(...scope.querySelectorAll('a[href]'));
        for (const link of anchors) {
          if (link.dataset.ziggyReloadedReplacement === '1') continue;
          let url;
          try { url = new URL(link.href, location.href); } catch (_) { continue; }
          const host = url.hostname.toLowerCase().replace(/^www\./, '');
          if (!['x.com', 'twitter.com'].includes(host) || !/chaturbate/i.test(`${url.pathname}${url.search}`)) continue;
          link.dataset.ziggyReloadedReplacement = '1';
          link.classList.add('ziggy-mobile-reloaded-link');
          link.href = '#ziggy-reloaded-settings';
          link.removeAttribute('target');
          link.setAttribute('aria-label', 'Open Ziggy Suite');
          link.replaceChildren(
            $('span', { class: 'ziggy-mobile-reloaded-icon', 'aria-hidden': 'true', html: trustedHtml('<svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor"><path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5.2 4 6.5V20h2v2h4v-2h2v-3.5c2.4-1.3 4-3.5 4-6.5a8 8 0 0 0-8-8Zm-3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-5 3 2-2 2 2h-4Z"/></svg>') }),
            $('span', { class: 'ziggy-mobile-reloaded-label' }, 'Suite'),
          );
          link.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            openMobileReloadedPanel();
          });
        }
      }

      let replaceTimer = 0;
      const scheduleReplace = () => {
        clearTimeout(replaceTimer);
        replaceTimer = setTimeout(() => replaceOfficialXLink(document), 60);
      };
      replaceOfficialXLink();
      const observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') { scheduleReplace(); continue; }
          for (const node of record.addedNodes) {
            if (node instanceof Element) scheduleReplace();
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    }

    initMobileReloadedMenu();

    function readSuiteCookie(name) {
      const prefix = `${name}=`;
      const part = String(document.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(prefix));
      return part ? decodeURIComponent(part.slice(prefix.length)) : '';
    }

    async function postSuiteForm(url, entries, options = {}) {
      const data = new FormData();
      for (const [key, value] of Object.entries(entries || {})) data.append(key, value);
      const response = await fetch(url, {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'x-csrftoken': readSuiteCookie('csrftoken'),
          'x-requested-with': 'XMLHttpRequest',
        },
        referrer: options.referrer || location.href,
        body: data,
      });
      if (!response.ok && options.required !== false) throw new Error(`Chaturbate returned error ${response.status}`);
      return response;
    }

    async function banRoomFromCard(rawUsername) {
      const target = normalizeUsername(rawUsername);
      if (!target || !isLikelyUsername(target)) throw new Error('Invalid room name');

      const contextResponse = await fetch(`/api/chatvideocontext/${encodeURIComponent(target)}/`, {
        credentials: 'same-origin',
        headers: { 'x-requested-with': 'XMLHttpRequest' },
      });
      if (!contextResponse.ok) throw new Error('Sign in before banning a room');
      const context = await contextResponse.json();
      const viewer = normalizeUsername(context?.viewer_username);
      if (!viewer || viewer === 'anonymous') throw new Error('Sign in before banning a room');
      if (viewer === target) throw new Error('You cannot ban your own room');

      const csrf = readSuiteCookie('csrftoken');
      await Promise.allSettled([
        postSuiteForm(`/follow/unfollow/${encodeURIComponent(target)}/`, {
          location: 'FollowButton', csrfmiddlewaretoken: csrf,
        }, { required: false }),
        postSuiteForm(`/api/notes/for_user/${encodeURIComponent(target)}/`, { text: '' }, { required: false }),
        postSuiteForm('/api/messaging/delete-conversation/', {
          csrfmiddlewaretoken: csrf, to_username: target,
        }, { required: false, referrer: `${location.origin}/messages/` }),
      ]);

      await postSuiteForm(`/roomban/${encodeURIComponent(target)}/${encodeURIComponent(viewer)}/`, {
        csrfmiddlewaretoken: csrf,
      }, { referrer: `${location.origin}/${viewer}/` });

      return globalThis.__ziggySuiteCommitNewBan(target);
    }

    // ===========================================================
    // QuickAdd —— 在 chaturbate 主页/分类页的房间卡片上注入「+」按钮
    // 用 MutationObserver 监听动态加载，[data-username] 是稳定锚点
    // ===========================================================
    initQuickAdd();

    function initQuickAdd() {
      // 注入 QuickAdd 按钮的样式
      const style = $('style', { html: trustedHtml(`
        .multicam-native-card-actions { display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-left:auto; position:relative; }
        .multicam-quick-add,.multicam-quick-ban,.multicam-card-overflow-toggle {
          box-sizing:border-box; width:28px; height:28px; min-width:28px; padding:0; border:1px solid #2d3e50;
          border-radius:4px; background:#17202a; color:#d7d7d7; cursor:pointer; font:700 15px/1 UbuntuRegular,Arial,sans-serif;
          display:inline-flex; align-items:center; justify-content:center; box-shadow:none; touch-action:manipulation;
        }
        .multicam-quick-add,.multicam-quick-ban { opacity:0; transition:opacity .12s ease,background .12s ease,color .12s ease; }
        .multicam-qa-host:hover .multicam-quick-add,.multicam-qa-host:hover .multicam-quick-ban,.multicam-quick-add:focus-visible,.multicam-quick-ban:focus-visible,.multicam-quick-add.added { opacity:1; }
        .multicam-quick-add:hover,.multicam-quick-add:focus-visible,.multicam-card-overflow-toggle:hover { color:#fff; background:#0c6a93; border-color:#0c6a93; }
        .multicam-quick-ban:hover,.multicam-quick-ban:focus-visible { color:#fff; background:#991b1b; border-color:#ef4444; }
        .multicam-quick-ban:disabled { cursor:wait; opacity:.7; }
        .multicam-quick-add.added { color:#fff; background:#166534; border-color:#22c55e; }
        .multicam-quick-add.added:hover { background:#991b1b; border-color:#ef4444; }
        .multicam-mobile-card-menu { position:absolute; z-index:2147482000; right:0; bottom:34px; width:max-content; min-width:176px; padding:4px; border:1px solid #2d3e50; border-radius:4px; background:#202c39; box-shadow:0 8px 24px rgba(0,0,0,.34); }
        .multicam-mobile-card-menu button { width:100%; min-height:42px; padding:8px 10px; border:0; border-radius:3px; background:transparent; color:#f1f1f1; text-align:left; font:500 14px/1.2 UbuntuRegular,Arial,sans-serif; }
        .multicam-mobile-card-menu button:hover,.multicam-mobile-card-menu button:focus-visible { background:#253648; }
        html.ziggy-suite-mobile .multicam-quick-add,html.ziggy-suite-mobile .multicam-quick-ban { display:none !important; }
        html.ziggy-suite-mobile .multicam-card-overflow-toggle { display:inline-flex; }
        html:not(.ziggy-suite-mobile) .multicam-card-overflow-toggle { display:none; }
      `)});
      document.head.appendChild(style);

      const observed = new WeakSet();   // 已注入按钮的元素
      const elToUsername = new WeakMap(); // 元素 → 用户名

      function updateBtnState(btn, username) {
        const inList = Storage.has(username);
        btn.classList.toggle('added', inList);
        btn.textContent = inList ? '✓' : '▦';
        btn.setAttribute('aria-label', inList ? t('quickRemoveTitle') : t('quickAddTitle'));
        btn.title = inList ? t('quickRemoveTitle') : t('quickAddTitle');
      }

      function injectButton(host, username) {
        if (observed.has(host)) return;
        observed.add(host);
        elToUsername.set(host, username);
        host.classList.add('multicam-qa-host');
        const details = host.querySelector('[data-testid="room-card-details"],.RoomCardDetails,[class*="RoomCardDetails"],[data-testid="room-card-info"]') || host;
        let actionHost = details.querySelector(':scope > .multicam-native-card-actions');
        if (!actionHost) {
          actionHost = $('div', { class: 'multicam-native-card-actions' });
          details.appendChild(actionHost);
        }

        const btn = $('button', {
          class: 'multicam-quick-add',
          dataset: { multicamUsername: username, roomgridQuickAdd: '1' },
          onclick: (e) => {
            e.preventDefault(); e.stopPropagation();
            if (Storage.has(username)) {
              if (Storage.remove(username)) toast(t('removedNamed', username));
            } else {
              const r = Storage.add(username);
              if (r === 'added') toast(t('addedNamed', username));
            }
            refreshInjectorState();
            updateBtnState(btn, username);
          },
        }, '▦');

        const banBtn = $('button', {
          class: 'multicam-quick-ban',
          type: 'button',
          title: `Ban/ignore ${username}`,
          'aria-label': `Ban/ignore ${username}`,
          onclick: async (event) => {
            event.preventDefault(); event.stopPropagation();
            if (!confirm(`Do you want to ban/ignore ${username} ?\n${username} will never be able to contact you and you will never be able to visit this room again.`)) return;
            banBtn.disabled = true;
            banBtn.textContent = '…';
            try {
              const result = await banRoomFromCard(username);
              host.remove();
              if (result?.cloud === 'failed') toast(`${username} banned; GitHub backup failed`, 3500);
              else if (result?.cloud === 'not-configured') toast(`${username} banned; GitHub Cloud is not configured`, 3500);
              else toast(`${username} banned`);
            } catch (error) {
              banBtn.disabled = false;
              banBtn.textContent = '⊘';
              toast(`Ban failed: ${error?.message || error}`, 3500);
            }
          },
        }, '⊘');

        const overflowBtn = $('button', {
          class: 'multicam-card-overflow-toggle',
          type: 'button',
          title: 'Suite actions',
          'aria-label': 'Open Suite actions',
          onclick: (e) => {
            e.preventDefault(); e.stopPropagation();
            document.querySelectorAll('.multicam-mobile-card-menu').forEach(menu => menu.remove());
            const menu = $('div', { class: 'multicam-mobile-card-menu', role: 'menu' });
            const action = $('button', {
              type: 'button', role: 'menuitem',
              onclick: (event) => {
                event.preventDefault(); event.stopPropagation();
                if (Storage.has(username)) {
                  if (Storage.remove(username)) toast(t('removedNamed', username));
                } else if (Storage.add(username) === 'added') toast(t('addedNamed', username));
                refreshInjectorState();
                updateBtnState(btn, username);
                menu.remove();
              },
            }, Storage.has(username) ? '✓ Remove from Workshop' : '▦ Add to Workshop');
            const banAction = $('button', {
              type: 'button', role: 'menuitem',
              onclick: async (event) => {
                event.preventDefault(); event.stopPropagation();
                if (!confirm(`Do you want to ban/ignore ${username} ?\n${username} will never be able to contact you and you will never be able to visit this room again.`)) return;
                banAction.disabled = true;
                banAction.textContent = 'Banning…';
                try {
                  const result = await banRoomFromCard(username);
                  menu.remove();
                  host.remove();
                  if (result?.cloud === 'failed') toast(`${username} banned; GitHub backup failed`, 3500);
                  else if (result?.cloud === 'not-configured') toast(`${username} banned; GitHub Cloud is not configured`, 3500);
                  else toast(`${username} banned`);
                } catch (error) {
                  banAction.disabled = false;
                  banAction.textContent = '⊘ Ban/ignore room';
                  toast(`Ban failed: ${error?.message || error}`, 3500);
                }
              },
            }, '⊘ Ban/ignore room');
            menu.append(action, banAction);
            actionHost.appendChild(menu);
            const closeMenu = (event) => {
              if (!menu.contains(event.target) && event.target !== overflowBtn) {
                menu.remove();
                document.removeEventListener('click', closeMenu, true);
              }
            };
            setTimeout(() => document.addEventListener('click', closeMenu, true), 0);
          },
        }, '…');

        actionHost.append(btn, banBtn, overflowBtn);
        updateBtnState(btn, username);
      }

      // Scan only newly inserted card subtrees after the initial pass. Live
      // thumbnail/card mutations are frequent on desktop; rescanning the full
      // document for each one causes visible wheel/scroll jank.
      function scopedMatches(scope, selector) {
        if (scope === document) return [...document.querySelectorAll(selector)];
        if (!(scope instanceof Element)) return [];
        const matches = scope.matches(selector) ? [scope] : [];
        return matches.concat([...scope.querySelectorAll(selector)]);
      }

      function scan(scope = document) {
        if (document.hidden) return;
        let checked = 0;
        for (const el of scopedMatches(scope, '[data-username]')) {
          if (++checked > 900) break;
          const u = normalizeUsername(el.getAttribute('data-username'));
          if (!u || !isLikelyUsername(u)) continue;
          if (el.offsetWidth < 100 || el.offsetHeight < 80) continue;
          injectButton(el, u);
        }

        checked = 0;
        for (const li of scopedMatches(scope, 'li')) {
          if (++checked > 900) break;
          if (observed.has(li)) continue;
          if (li.offsetWidth < 100 || li.offsetHeight < 80) continue;
          const a = li.querySelector('a[href]');
          if (!a) continue;
          const href = a.getAttribute('href') || '';
          let path = href;
          if (/^https?:\/\//i.test(href)) {
            try { path = new URL(href).pathname; } catch (_) { continue; }
          }
          const m = path.match(ROOM_PATH);
          if (!m) continue;
          const u = normalizeUsername(m[1]);
          if (!isLikelyUsername(u)) continue;
          injectButton(li, u);
        }
      }

      let scanScheduled = false;
      const pendingScopes = new Set();
      function scheduleScan(scope = document) {
        if (document.hidden) return;
        pendingScopes.add(scope);
        if (pendingScopes.size > 80) {
          pendingScopes.clear();
          pendingScopes.add(document);
        }
        if (scanScheduled) return;
        scanScheduled = true;
        const run = () => {
          scanScheduled = false;
          const scopes = [...pendingScopes];
          pendingScopes.clear();
          scopes.forEach(candidate => scan(candidate));
        };
        try {
          if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 900 });
          else setTimeout(run, 260);
        } catch (_) { setTimeout(run, 260); }
      }

      document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleScan(); });
      scan();
      const mo = new MutationObserver(records => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node instanceof Element) scheduleScan(node);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });

      // 跨标签页 storage 同步：刷新所有按钮状态
      storageSubs.add(() => {
        document.querySelectorAll('.multicam-quick-add').forEach(btn => {
          const u = btn.dataset.multicamUsername || btn.dataset.username;
          if (u) updateBtnState(btn, u);
        });
      });
    }
  }

  /* =============================================================
   * 7.5. Cam ARNA archive search — native RoomGrid dock tab
   * ============================================================= */
  function createCamArnaDock(container, options = {}) {
    const config = { version: '2.5', maxHistory: 10 };
    const archiveSites = [
      { name: 'Archivebate', url: 'https://archivebate.com/profile/{username}', domain: 'archivebate.com' },
      { name: 'recu', url: 'https://recu.me/performer/{username}', domain: 'recu.me' },
      { name: 'Showcamrips', url: 'https://showcamrips.com/model/en/{username}', domain: 'showcamrips.com' },
      { name: 'CamRecordings', url: 'https://www.camshowrecordings.com/model/{username}', domain: 'camshowrecordings.com' },
      { name: 'CamWH', url: 'https://camwh.com/tags/{username}/', domain: 'camwh.com' },
      { name: 'TopCam', url: 'https://www.topcamvideos.com/showall/?search={username}', domain: 'topcamvideos.com' },
      { name: 'LoveCam', url: 'https://lovecamporn.com/showall/?search={username}', domain: 'lovecamporn.com' },
      { name: 'Camwhores.tv', url: 'https://www.camwhores.tv/search/{username}/', domain: 'camwhores.tv' },
      { name: 'Bestcam', url: 'https://bestcam.tv/model/{username}', domain: 'bestcam.tv' },
      { name: 'XHome', url: 'https://xhomealone.com/tags/{username}/', domain: 'xhomealone.com' },
      { name: 'StreamLeak', url: 'https://stream-leak.com/models/{username}/', domain: 'stream-leak.com' },
      { name: 'MFCamHub', url: 'https://mfcamhub.com/models/{username}/', domain: 'mfcamhub.com' },
      { name: 'CamRecord', url: 'https://camshowrecord.net/video/list?page=1&model={username}', domain: 'camshowrecord.net' },
      { name: 'CW Bay', url: 'https://www.camwhoresbay.com/search/{username}/', domain: 'camwhoresbay.com' },
      { name: 'CamSave', url: 'https://www.camsave1.com/?search={username}&women=true', domain: 'camsave1.com' },
      { name: 'OnScreens', url: 'https://www.onscreens.me/m/{username}', domain: 'onscreens.me' },
      { name: 'LiveCamRips', url: 'https://livecamrips.to/search/{username}/1', domain: 'livecamrips.to' },
      { name: 'CumCams', url: 'https://cumcams.cc/performer/{username}', domain: 'cumcams.cc' },
      { name: 'AllMyCam', url: 'https://allmy.cam/search/{username}/', domain: 'allmy.cam' },
      { name: 'LCRip', url: 'https://www.livecamsrip.com/{username}/profile', domain: 'livecamsrip.com' },
      { name: 'CamsRip', url: 'https://camsrip.com/{username}/profile', domain: 'camsrip.com' },
    ];
    const notify = typeof options.notify === 'function' ? options.notify : () => {};
    const openExternal = typeof options.openExternal === 'function' ? options.openExternal : (url) => openNoopener(url);
    const onFoundCount = typeof options.onFoundCount === 'function' ? options.onFoundCount : () => {};
    let mounted = false;
    let searchRun = 0;
    let debounceTimer = 0;
    let lastAutoRoom = '';
    let input = null;
    let archiveGrid = null;
    let counter = null;
    let historyList = null;
    let savedList = null;
    let siteToggleList = null;
    let fileInput = null;
    const subTabs = new Map();
    const views = new Map();

    function activate(room) {
      if (!mounted) mount();
      const candidate = String(room || '').trim();
      if (isValidUsername(candidate) && candidate !== lastAutoRoom) {
        lastAutoRoom = candidate;
        input.value = candidate;
        showView('search');
        checkAll(candidate);
      }
    }

    function mount() {
      mounted = true;
      container.textContent = '';

      const brand = $('div', { class: 'roomgrid-arna-brand' }, [
        document.createTextNode('ARNA'),
        $('span', { class: 'roomgrid-arna-version' }, config.version),
      ]);
      container.appendChild($('div', { class: 'roomgrid-arna-head' }, [
        brand,
        $('span', { class: 'roomgrid-arna-caption' }, 'Archive search'),
      ]));

      const subtabBar = $('div', { class: 'roomgrid-arna-subtabs', role: 'tablist' });
      for (const [name, label] of [['search', 'Search'], ['history', 'History'], ['saved', 'Saved'], ['tools', 'Tools']]) {
        const button = $('button', {
          class: `roomgrid-arna-subtab${name === 'search' ? ' active' : ''}`,
          type: 'button',
          onclick: () => showView(name),
        }, label);
        button.setAttribute('aria-selected', name === 'search' ? 'true' : 'false');
        subTabs.set(name, button);
        subtabBar.appendChild(button);
      }
      container.appendChild(subtabBar);

      const searchIcon = $('span', { class: 'roomgrid-arna-search-icon', html: trustedHtml(iconSvg('search', 16)) });
      input = $('input', {
        class: 'roomgrid-arna-input',
        id: 'roomgrid-arna-user',
        type: 'text',
        placeholder: 'Search username...',
        autocomplete: 'off',
        spellcheck: false,
      });
      container.appendChild($('div', { class: 'roomgrid-arna-search' }, [searchIcon, input]));

      const searchView = $('div', { class: 'roomgrid-arna-view' });
      counter = $('span', {}, '0 / 0 found');
      searchView.appendChild($('div', { class: 'roomgrid-arna-label' }, [
        $('span', {}, 'Archives / Recorders'),
        counter,
      ]));
      archiveGrid = $('div', { class: 'roomgrid-arna-grid' });
      searchView.appendChild(archiveGrid);
      searchView.appendChild($('button', {
        class: 'roomgrid-arna-item roomgrid-arna-save',
        type: 'button',
        onclick: saveCurrentProfile,
      }, $('span', { class: 'roomgrid-arna-item-name' }, 'Save to Favorites')));
      views.set('search', searchView);

      const historyView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      historyView.appendChild($('div', { class: 'roomgrid-arna-label' }, $('span', {}, 'Recent Searches')));
      historyList = $('div', { class: 'roomgrid-arna-list' });
      historyView.appendChild(historyList);
      views.set('history', historyView);

      const savedView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      const importButton = $('button', { class: 'roomgrid-arna-button', type: 'button' }, 'Import JSON');
      const exportButton = $('button', { class: 'roomgrid-arna-button', type: 'button' }, 'Export JSON');
      fileInput = $('input', { type: 'file', accept: '.json,application/json', hidden: true });
      importButton.addEventListener('click', () => fileInput.click());
      exportButton.addEventListener('click', exportSavedProfiles);
      fileInput.addEventListener('change', importSavedProfiles);
      savedView.appendChild($('div', { class: 'roomgrid-arna-actions' }, [importButton, exportButton, fileInput]));
      savedList = $('div', { class: 'roomgrid-arna-list' });
      savedView.appendChild(savedList);
      views.set('saved', savedView);

      const toolsView = $('div', { class: 'roomgrid-arna-view', hidden: true });
      toolsView.appendChild($('div', { class: 'roomgrid-arna-label' }, $('span', {}, 'Quick Links')));
      const toolGrid = $('div', { class: 'roomgrid-arna-grid' });
      const tools = [
        ['Schedule', 'https://www.cbhours.com/user/{u}.html'],
        ['Statistics', 'https://statbate.com/search/1/{u}'],
        ['Finder', 'https://camgirlfinder.net/models/sc/{u}'],
        ['Images', 'https://nrtool.to/nrtool/search?site=&s={u}'],
      ];
      for (const [label, url] of tools) {
        toolGrid.appendChild($('button', {
          class: 'roomgrid-arna-item',
          type: 'button',
          onclick: () => {
            const username = input.value.trim();
            if (isValidUsername(username)) openExternal(url.replace('{u}', encodeURIComponent(username)));
            else notify('Enter a valid username');
          },
        }, $('span', { class: 'roomgrid-arna-item-name' }, label)));
      }
      toolsView.appendChild(toolGrid);
      toolsView.appendChild($('div', { class: 'roomgrid-arna-label', style: { marginTop: '7px' } }, $('span', {}, 'Manage Sites')));
      siteToggleList = $('div', { class: 'roomgrid-arna-sites' });
      toolsView.appendChild(siteToggleList);
      views.set('tools', toolsView);

      for (const view of views.values()) container.appendChild(view);
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => checkAll(input.value.trim()), 600);
      });
      buildArchiveGrid();
      buildSiteToggles();
    }

    function showView(name) {
      for (const [key, button] of subTabs) {
        const active = key === name;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      }
      for (const [key, view] of views) view.hidden = key !== name;
      if (name === 'history') loadHistory();
      if (name === 'saved') loadSavedProfiles();
    }

    function getValue(key, fallback) {
      try { return GM_getValue(key, fallback); }
      catch (_) { return fallback; }
    }

    function setValue(key, value) {
      try { GM_setValue(key, value); }
      catch (_) {}
    }

    function isValidUsername(value) {
      return typeof value === 'string' && /^[a-zA-Z0-9_-]{3,50}$/.test(value);
    }

    function disabledSites() {
      const value = getValue('ca_disabled_sites', []);
      return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
    }

    function buildArchiveGrid() {
      archiveGrid.textContent = '';
      const disabled = disabledSites();
      for (const site of archiveSites) {
        if (disabled.includes(site.name)) continue;
        const icon = $('img', {
          src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=32`,
          alt: '',
          loading: 'lazy',
        });
        const item = $('button', {
          class: 'roomgrid-arna-item roomgrid-arna-archive',
          type: 'button',
          dataset: { url: site.url, name: site.name },
          onclick: () => {
            const username = input.value.trim();
            if (isValidUsername(username)) openExternal(site.url.replace('{username}', encodeURIComponent(username)));
            else notify('Enter a valid username');
          },
        }, [
          icon,
          $('span', { class: 'roomgrid-arna-item-name' }, site.name),
          $('span', { class: 'roomgrid-arna-status' }),
        ]);
        archiveGrid.appendChild(item);
      }
      updateCounter(0, archiveGrid.children.length);
    }

    function buildSiteToggles() {
      siteToggleList.textContent = '';
      const disabled = disabledSites();
      for (const site of archiveSites) {
        const checkbox = $('input', { type: 'checkbox', checked: !disabled.includes(site.name) });
        checkbox.addEventListener('change', () => {
          let current = disabledSites();
          if (checkbox.checked) current = current.filter(name => name !== site.name);
          else if (!current.includes(site.name)) current.push(site.name);
          setValue('ca_disabled_sites', current);
          buildArchiveGrid();
          const username = input.value.trim();
          if (isValidUsername(username)) checkAll(username);
        });
        siteToggleList.appendChild($('label', { class: 'roomgrid-arna-site' }, [
          $('span', {}, site.name),
          checkbox,
        ]));
      }
    }

    function checkAll(username) {
      const runId = ++searchRun;
      const items = [...archiveGrid.querySelectorAll('.roomgrid-arna-archive')];
      if (!isValidUsername(username)) {
        for (const item of items) item.classList.remove('checking', 'found', 'not-found');
        updateCounter(0, items.length);
        return;
      }
      saveHistory(username);
      let foundCount = 0;
      for (const item of items) {
        item.classList.remove('found', 'not-found');
        item.classList.add('checking');
      }
      updateCounter(0, items.length);
      for (const item of items) {
        const url = item.dataset.url.replace('{username}', encodeURIComponent(username));
        checkPage(url).then(exists => {
          if (runId !== searchRun || !item.isConnected) return;
          item.classList.remove('checking');
          if (exists) {
            item.classList.add('found');
            foundCount++;
          } else {
            item.classList.add('not-found');
          }
          updateCounter(foundCount, items.length);
        });
      }
    }

    function updateCounter(found, total) {
      if (counter) counter.textContent = `${found} / ${total} found`;
      onFoundCount(found);
    }

    function checkPage(url) {
      return new Promise(resolve => {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 10000,
            onload: response => resolve(analyzeResponse(response, url)),
            onerror: () => resolve(false),
            ontimeout: () => resolve(false),
          });
        } catch (_) { resolve(false); }
      });
    }

    function analyzeResponse(response, url) {
      try {
        if (!response || response.status === 404 || response.status >= 500) return false;
        const text = response.responseText;
        if (!text || typeof text !== 'string') return false;
        const lower = text.toLowerCase();
        const titleMatch = lower.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        if (url.includes('livecamrips.to')) {
          if (['no records found', 'no models found', 'no results', '0 models found'].some(pattern => lower.includes(pattern))) return false;
          if (!text.includes('class="video"') && !text.includes('model-card')) return false;
        }
        if (url.includes('cumcams.cc')) {
          if (/<h1[^>]*>404<\/h1>/i.test(text) || /performer\s*not\s*found/i.test(text)) return false;
          if (!text.includes('profile-info') && !text.includes('class="performer"')) return false;
        }
        if (url.includes('allmy.cam') && !text.includes('class="video-card"')) return false;
        if (url.includes('showcamrips') && text.includes('data:image/png;base64')) return false;
        if (url.includes('camshowrecordings.com') && !text.includes('class="h1modelpage"')) return false;
        if (url.includes('livecamsrip.com') && lower.includes('no records found')) return false;
        if (url.includes('camwhores.tv') || url.includes('camwhoresbay.com')) {
          if (lower.includes('there is no data in this list.') || /no\s*videos?\s*found|0\s*videos/i.test(lower)) return false;
        }
        if (['not found', '404', 'error'].some(term => title.includes(term))) return false;
        if ([/no\s*videos?\s*found/i, /no\s*results?\s*found/i, /does\s*not\s*exist/i, /\b0\s*results?\b/i].some(pattern => pattern.test(lower))) return false;
        return true;
      } catch (_) { return false; }
    }

    function saveHistory(username) {
      let history = getValue('ca_history', []);
      if (!Array.isArray(history)) history = [];
      history = history.filter(entry => entry !== username);
      history.unshift(username);
      setValue('ca_history', history.slice(0, config.maxHistory));
      if (views.get('history') && !views.get('history').hidden) loadHistory();
    }

    function loadHistory() {
      historyList.textContent = '';
      let history = getValue('ca_history', []);
      if (!Array.isArray(history)) history = [];
      history = history.filter(isValidUsername);
      if (!history.length) {
        historyList.appendChild($('div', { class: 'roomgrid-arna-empty' }, 'No history yet'));
        return;
      }
      for (const username of history) {
        historyList.appendChild($('button', {
          class: 'roomgrid-arna-row',
          type: 'button',
          onclick: () => selectUsername(username),
        }, [
          $('strong', {}, username),
          $('span', { style: { color: 'var(--arna-muted)' } }, '↺'),
        ]));
      }
    }

    function normalizeSavedProfiles(raw) {
      if (!Array.isArray(raw)) return [];
      const seen = new Set();
      const normalized = [];
      for (const source of raw) {
        const item = typeof source === 'string' ? { user: source, platform: '?' } : source;
        if (!item || !isValidUsername(item.user) || seen.has(item.user)) continue;
        seen.add(item.user);
        normalized.push({
          user: item.user,
          platform: typeof item.platform === 'string' ? item.platform.slice(0, 24) : '?',
        });
      }
      return normalized;
    }

    function saveCurrentProfile() {
      const username = input.value.trim();
      if (!isValidUsername(username)) { notify('Enter a valid username'); return; }
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (saved.some(item => item.user === username)) { notify(`${username} already saved`); return; }
      saved.push({ user: username, platform: 'CB' });
      setValue('ca_saved', saved);
      notify(`Saved ${username}`);
    }

    function loadSavedProfiles() {
      savedList.textContent = '';
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (!saved.length) {
        savedList.appendChild($('div', { class: 'roomgrid-arna-empty' }, 'No saved profiles'));
        return;
      }
      for (const item of saved) {
        const removeButton = $('button', {
          class: 'roomgrid-arna-delete',
          type: 'button',
          title: 'Remove saved profile',
        }, '×');
        removeButton.addEventListener('click', event => {
          event.stopPropagation();
          setValue('ca_saved', saved.filter(entry => entry.user !== item.user));
          loadSavedProfiles();
        });
        const row = $('div', { class: 'roomgrid-arna-row' }, [
          $('div', { class: 'roomgrid-arna-row-main' }, [
            $('strong', {}, item.user),
            $('span', { class: 'roomgrid-arna-tag' }, item.platform || '?'),
          ]),
          removeButton,
        ]);
        row.addEventListener('click', () => selectUsername(item.user));
        savedList.appendChild(row);
      }
    }

    function selectUsername(username) {
      input.value = username;
      showView('search');
      checkAll(username);
    }

    function exportSavedProfiles() {
      const saved = normalizeSavedProfiles(getValue('ca_saved', []));
      if (!saved.length) { notify('Nothing to export'); return; }
      downloadBlob(
        new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json;charset=utf-8' }),
        `arna_backup_${new Date().toISOString().slice(0, 10)}.json`,
      );
      notify('Export successful');
    }

    function importSavedProfiles(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = loadEvent => {
        try {
          const imported = normalizeSavedProfiles(JSON.parse(loadEvent.target.result));
          const current = normalizeSavedProfiles(getValue('ca_saved', []));
          const known = new Set(current.map(item => item.user));
          const additions = imported.filter(item => !known.has(item.user));
          setValue('ca_saved', current.concat(additions));
          notify(`Imported ${additions.length} profiles`);
          loadSavedProfiles();
        } catch (_) { notify('Invalid JSON file'); }
      };
      reader.onerror = () => notify('Error reading file');
      reader.readAsText(file);
      event.target.value = '';
    }

    return { activate };
  }

  /* =============================================================
   * 8. 工作台 / Workstation
   * ============================================================= */
  function initWorkstation() {
    document.title = t('title');
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content = 'width=device-width,initial-scale=1,viewport-fit=cover';
    const nativeLogoNode = document.querySelector('[data-testid="header-home-link-container"]')?.cloneNode(true) || null;
    if (nativeLogoNode instanceof Element) nativeLogoNode.classList.add('rg-native-logo-source');
    // 在当前页打开工作台时，先停止原页面自带的 video/audio，避免页面清空后仍有声音。
    stopAllPageMedia();
    // Keep Chaturbate's native mount nodes alive so its delayed startup code can
    // still find them. Moving the nodes preserves references and listeners while
    // removing the original page from the Workshop's visual and focus trees.
    const nativePageHost = document.createElement('div');
    nativePageHost.id = 'rg-native-page-host';
    nativePageHost.hidden = true;
    nativePageHost.setAttribute('aria-hidden', 'true');
    nativePageHost.setAttribute('inert', '');
    nativePageHost.style.setProperty('display', 'none', 'important');
    while (document.body.firstChild) nativePageHost.appendChild(document.body.firstChild);
    document.body.appendChild(nativePageHost);
    // The native home page is no longer visible after Workshop takes over, but
    // Chaturbate hydrates it asynchronously. Let startup finish, repeatedly
    // release the expensive hidden room-card payload, then detach the entire
    // native tree once its delayed bootstrap window has passed. The Workshop is
    // self-contained after that point and keeping the hidden tree would roughly
    // double its steady DOM size.
    const quiesceNativeRoomGrid = () => {
      if (!nativePageHost.isConnected) return;
      nativePageHost.querySelectorAll('.RoomCardGrid').forEach(roomGrid => {
        stopAllPageMedia(roomGrid);
        roomGrid.replaceChildren();
      });
    };
    setTimeout(quiesceNativeRoomGrid, 500);
    setTimeout(quiesceNativeRoomGrid, 3000);
    setTimeout(() => {
      if (!nativePageHost.isConnected) return;
      stopAllPageMedia(nativePageHost);
      nativePageHost.replaceChildren();
      nativePageHost.remove();
    }, 12000);
    const store = createStore();
    const phoneEnvironment = isPhoneLikeDevice();
    document.body.classList.toggle('rg-phone-device', phoneEnvironment);
    const startupPatch = { pageIndex: 0 };
    const startupGroup = String(store.state.settings.startupGroup || 'last');
    if (startupGroup !== 'last' && store.state.groups.some(group => group.id === startupGroup)) {
      startupPatch.activeGroup = startupGroup;
    }
    const startupView = String(store.state.settings.startupView || 'last');
    if (startupView === 'auto') {
      startupPatch.viewMode = phoneEnvironment ? 'phone' : 'grid';
    } else if (['grid', 'focus', 'phone'].includes(startupView)) {
      startupPatch.viewMode = startupView;
    } else if (phoneEnvironment && store.state.settings.phoneModeAuto) {
      startupPatch.viewMode = 'phone';
    } else if (!phoneEnvironment && store.state.settings.viewMode === 'phone') {
      // Phone mode is a device presentation choice, not a cloud-synced desktop layout.
      // A backup restored from a phone should therefore reopen as the normal desktop grid.
      startupPatch.viewMode = 'grid';
    }
    if (startupPatch.viewMode === 'phone' || phoneEnvironment) startupPatch.sidebarCollapsed = true;
    else if (startupPatch.viewMode === 'grid') startupPatch.sidebarCollapsed = false;
    store.patchSettings(startupPatch);
    const service = createRoomService(store);
    Notify.init();

    // 离开工作台页时，统一停流，避免浏览器残留音轨。

    window.addEventListener('pagehide', () => {
      // The dedicated Recorder Hub owns active recordings; closing Workshop must
      // never stop or finalize them.
      try { service.stopAll(); } catch (_) { stopAllPageMedia(); }
    });

    // 全局样式
    document.head.appendChild($('style', {
      html: trustedHtml(`
        :root {
          color-scheme: light;
          /* —— 更像标准 SaaS 产品的浅色设计系统：更清晰层级、更统一圆角、更轻的高光与阴影 —— */
          --bg: #f4f7fb;
          --bg-elevated: rgba(255,255,255,.88);
          --bg-card: #ffffff;
          --bg-input: #ffffff;
          --bg-hover: rgba(15,23,42,.05);
          --bg-overlay: rgba(15,23,42,.18);
          --border: #e6ebf2;
          --border-strong: #d3dce8;
          --text: #0f172a;
          --text-secondary: #334155;
          --text-muted: #64748b;
          --accent: #2563eb;
          --accent-hover: #1d4ed8;
          --accent-soft: rgba(37,99,235,.10);
          --info: #2563eb;
          --info-soft: rgba(37,99,235,.10);
          --success: #16a34a;
          --danger: #dc2626;
          --warning: #d97706;
          --radius-sm: 10px;
          --radius-md: 14px;
          --radius-lg: 18px;
          --shadow-sm: 0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.04);
          --shadow-md: 0 8px 24px rgba(15,23,42,.08);
          --shadow-lg: 0 18px 48px rgba(15,23,42,.12);
        }
        * { box-sizing: border-box; }
        body { margin:0; background:radial-gradient(circle at top left, rgba(37,99,235,.06), transparent 24%), linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%); color:var(--text);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow:hidden; }
        button { font-family:inherit; }
        ::-webkit-scrollbar { width:10px; height:10px; }
        ::-webkit-scrollbar-thumb { background:var(--border-strong); border-radius:999px; border:2px solid transparent; background-clip:padding-box; }
        ::-webkit-scrollbar-thumb:hover { background:#c1cada; background-clip:padding-box; }
        ::-webkit-scrollbar-track { background:transparent; }
        video:focus { outline:none; }
        .cam-card { position:relative; background:#f8fafc; border-radius:var(--radius-md); overflow:hidden;
          border:1px solid rgba(15,23,42,.08); box-shadow:var(--shadow-sm); transition:border-color .2s, box-shadow .2s, transform .15s;
          display:block; min-height:0; min-width:0; width:100%; height:100%; isolation:isolate; contain:layout paint; }
        .grid.view-grid { align-content:start; align-items:stretch; }
        .grid.view-grid .cam-card { aspect-ratio:auto; }
        .cam-card.dragging { opacity:.4; transform:scale(.96); }
        .cam-card[draggable="true"] { cursor:grab; }
        .cam-card[draggable="true"].dragging { cursor:grabbing; }
        .cam-card .icon-btn, .cam-card button { cursor:pointer; }
        .cam-card.drop-before { box-shadow: inset 3px 0 0 0 var(--accent), inset 0 3px 0 0 var(--accent); }
        .cam-card.drop-after  { box-shadow: inset -3px 0 0 0 var(--accent), inset 0 -3px 0 0 var(--accent); }
        /* 避免使用 .overlay 通用类名：CB 站点样式会把它拉伸成整卡黑色遮罩。 */
        .cam-card .mc-hover-ui { opacity:0; transition:opacity .14s ease, transform .14s ease; pointer-events:none; transform:translateY(-2px);
          background:transparent !important; width:auto !important; height:auto !important;
          filter:none !important; mix-blend-mode:normal !important; }
        .cam-card:hover .mc-hover-ui,
        .cam-card:not(.compact) .mc-hover-ui { opacity:1; transform:translateY(0); }
        .cam-card .mc-hover-ui.ops-row { position:absolute !important; top:8px !important; right:8px !important; left:auto !important; bottom:auto !important; display:flex !important; }
        .cam-card .mc-hover-ui button { pointer-events:auto; }
        .cam-card:hover .cam-video, .cam-card .cam-video:hover { filter:none !important; opacity:1 !important; }
        .cam-card::before, .cam-card::after { pointer-events:none; background:transparent !important; }
        .cam-video { position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
          background:transparent; z-index:1; pointer-events:none; }
        .cam-card.video-zoomed .cam-video { cursor:grab; }
        .cam-card.video-panning .cam-video { cursor:grabbing !important; }
        .cam-video::-webkit-media-controls,
        .cam-video::-webkit-media-controls-enclosure { display:none !important; opacity:0 !important; }
        .cam-card.not-online { background:linear-gradient(135deg, rgba(255,255,255,.92), rgba(241,245,249,.96)); }
        .status-layer { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:6px; color:var(--text-muted); font-size:12px; text-align:center;
          padding:16px; pointer-events:none; background:transparent; z-index:4; }
        .status-layer .status-icon { font-size:24px; line-height:1; opacity:.9; }
        .status-layer .status-chip { font-weight:650; padding:3px 9px; border-radius:999px;
          background:rgba(17,24,39,.045); border:1px solid rgba(17,24,39,.06); }
        .cam-card.flash { animation: flash 1.5s ease 3; }
        @keyframes flash {
          0%,100% { box-shadow:0 0 0 0 rgba(35,165,89,0); border-color:var(--border); }
          50% { box-shadow:0 0 0 4px rgba(35,165,89,.55); border-color:var(--success); }
        }
        /* —— 卡片浮层控件：透明毛玻璃，避免遮挡画面 —— */
        .cam-card video { -webkit-user-drag:none; user-drag:none; }
        .pill { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px;
          font-size:11px; font-weight:700; backdrop-filter:blur(8px) !important; -webkit-backdrop-filter:blur(8px) !important;
          background:rgba(255,255,255,.86); color:var(--text); border:1px solid rgba(255,255,255,.55); box-shadow:0 6px 16px rgba(15,23,42,.08); }
        .dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
        .svg-icon { width:1em; height:1em; display:inline-block; vertical-align:-.16em; flex:0 0 auto; }
        .btn-label { white-space:nowrap; }
        .ctrl-btn, .seg button { display:inline-flex; align-items:center; justify-content:center; gap:7px; }
        .icon-btn .svg-icon { width:15px; height:15px; }
        .status-dot-large { width:12px; height:12px; border-radius:999px; display:inline-block; background:currentColor; box-shadow:0 0 0 6px currentColor; opacity:.18; }
        .icon-btn { background:rgba(255,255,255,.88); backdrop-filter:blur(10px) !important; -webkit-backdrop-filter:blur(10px) !important;
          border:1px solid rgba(255,255,255,.7); color:var(--text-secondary); width:29px; height:29px; border-radius:9px; cursor:pointer;
          box-shadow:0 4px 12px rgba(15,23,42,.08); display:flex; align-items:center; justify-content:center; font-size:12px;
          transition:background .15s, transform .15s, color .15s, border-color .15s, box-shadow .15s; }
        .icon-btn:hover { background:#fff; color:var(--accent); border-color:rgba(37,99,235,.2); transform:translateY(-1px); box-shadow:0 8px 18px rgba(15,23,42,.12); }
        .icon-btn.danger:hover { background:var(--danger); }
        .icon-btn.recording { background:var(--danger); color:#fff; animation: recordPulse 1s ease infinite; }
        .icon-btn.recording.waiting { background:var(--warning); color:#fff; animation:none; }
        .cam-card.recording { outline:2px solid var(--danger); outline-offset:2px; }
        .cam-card.recording-waiting { outline-color:var(--warning); }
        @keyframes recordPulse { 0%,100% { opacity:1; } 50% { opacity:.58; } }
        /* —— 卡片响应式：根据宽度收起部分按钮 —— */
        .cam-card.compact .ops-extra { display:none; }
        .cam-card.compact .pill .pill-text { display:none; }
        .cam-card.compact .name-label { font-size:11px; padding:3px 7px; max-width:55%; }
        .cam-card.tiny .ops-row { gap:3px; }
        .cam-card.tiny .icon-btn { width:22px; height:22px; font-size:10px; }
        .cam-card.tiny .name-label { display:none; }
        .cam-card.tiny .pill { padding:2px 6px; font-size:10px; }

        /* —— 主屏（focus 模式）—— */
        .grid.view-focus { display:grid; grid-template-areas:'main' 'bar' 'thumbs';
          grid-template-rows:minmax(0,var(--focus-main-pct,68fr)) 10px minmax(108px,var(--focus-thumb-pct,32fr));
          grid-template-columns:minmax(0,1fr); gap:12px; padding:18px; height:100%; overflow:hidden; }
        .grid.view-focus .focused-row { grid-area:main; min-height:0; min-width:0; display:grid; place-items:center; overflow:hidden; position:relative; z-index:1; }
        .grid.view-focus .focused-row .cam-card { max-width:100%; max-height:100%; flex:0 0 auto; min-height:0; }
        .grid.view-focus .focused-row .cam-card.is-focus-main { border-color:var(--accent); box-shadow:0 0 0 1px rgba(16,163,127,.25); }
        .grid.view-focus .resizer { grid-area:bar; height:8px; min-height:8px; cursor:ns-resize; background:transparent; position:relative; z-index:2; }
        .grid.view-focus .resizer::before { content:''; position:absolute; left:50%;
          top:50%; transform:translate(-50%,-50%); width:50px; height:3px; border-radius:2px;
          background:var(--border-strong); transition:background .15s, width .15s; }
        .grid.view-focus .resizer:hover::before,
        .grid.view-focus .resizer.dragging::before { background:var(--accent); width:80px; }
        .grid.view-focus .thumbs-row { grid-area:thumbs; min-height:0; min-width:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--focus-thumb-min,180px),1fr));
          grid-auto-flow:row; gap:12px; overflow:auto; padding:2px 2px 8px; align-content:start; align-items:start; position:relative; z-index:1; }
        .grid.view-focus .thumbs-row .cam-card { cursor:pointer; width:100%; height:auto; min-height:0; aspect-ratio:var(--focus-thumb-aspect,16/9); }
        .grid.view-focus .thumbs-row .cam-card:hover { border-color:var(--accent); }

        /* —— 控件 —— */
        .group-tab { padding:10px 12px; border-radius:12px; cursor:pointer; font-size:13px;
          background:transparent; border:none; color:var(--text-secondary); text-align:left;
          transition:background .12s, color .12s, border-color .12s, box-shadow .12s; border:1px solid transparent;
          display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; }
        .group-tab:hover { background:#fff; color:var(--text); border-color:var(--border); box-shadow:var(--shadow-sm); }
        .group-tab.active { background:linear-gradient(180deg, rgba(37,99,235,.10), rgba(37,99,235,.06)); color:var(--accent); border-color:rgba(37,99,235,.18); box-shadow:var(--shadow-sm); }
        .group-tab.drop-target { background:var(--accent-soft); outline:1.5px dashed var(--accent); }
        .ctrl-input { background:var(--bg-input); border:1px solid var(--border); color:var(--text);
          padding:8px 12px; min-height:38px; border-radius:12px; font-size:13px; outline:none;
          box-shadow:0 1px 0 rgba(255,255,255,.7) inset; transition:border-color .15s, background .15s, box-shadow .15s; }
        .ctrl-input:focus { border-color:rgba(37,99,235,.38); box-shadow:0 0 0 4px rgba(37,99,235,.10); }
        .ctrl-input:hover:not(:focus) { border-color:var(--border-strong); }
        .ctrl-btn { background:var(--bg-input); border:1px solid var(--border); color:var(--text);
          padding:8px 12px; min-height:38px; border-radius:12px; font-size:13px; cursor:pointer;
          box-shadow:0 1px 0 rgba(255,255,255,.7) inset; transition:background .15s, border-color .15s, transform .15s, box-shadow .15s; }
        .ctrl-btn:hover { background:#fff; border-color:var(--border-strong); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
        .ctrl-btn.primary { background:linear-gradient(180deg, rgba(37,99,235,.12), rgba(37,99,235,.08)); border-color:rgba(37,99,235,.28); color:var(--accent); }
        .ctrl-btn.primary:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
        .ctrl-btn.disabled, .ctrl-btn:disabled { opacity:.5; cursor:not-allowed; }
        .toggle { display:inline-flex; align-items:center; gap:6px; cursor:pointer; font-size:12px;
          color:var(--text-secondary); padding:7px 10px; border-radius:12px; user-select:none; border:1px solid transparent;
          transition:background .12s, border-color .12s; }
        .toggle:hover { background:#fff; color:var(--text); border-color:var(--border); }
        .toggle input { accent-color:var(--accent); }
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center;
          height:100%; color:var(--text-muted); gap:16px; padding:40px; text-align:center; }
        .menu-pop { position:absolute; background:var(--bg-elevated); backdrop-filter:none;
          border:1px solid var(--border); border-radius:8px; padding:5px; min-width:180px;
          box-shadow:var(--shadow-lg); z-index:1000;
          display:flex; flex-direction:column; gap:1px; }
        .menu-pop button { background:transparent; border:none; color:var(--text);
          padding:8px 12px; text-align:left; cursor:pointer; border-radius:5px; font-size:13px; }
        .menu-pop button:hover { background:var(--bg-hover); }
        .menu-pop button.danger { color:var(--danger); }
        .menu-pop button.danger:hover { background:rgba(242,63,67,.15); }

        /* —— 视图切换段 segmented control —— */
        .seg { display:inline-flex; background:var(--bg-input); border:1px solid var(--border);
          border-radius:12px; padding:3px; box-shadow:0 1px 0 rgba(255,255,255,.7) inset; }
        .seg button { background:transparent; border:none; color:var(--text-secondary);
          padding:6px 12px; border-radius:9px; cursor:pointer; font-size:12px; font-weight:600;
          transition:background .15s, color .15s; }
        .seg button.active { background:var(--accent); color:#fff; box-shadow:0 6px 16px rgba(37,99,235,.20); }
        .seg button:hover:not(.active) { color:var(--text); }
        .toolbar-group { display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 10px; background:rgba(255,255,255,.76); border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow-sm); }
        .toolbar-group.compact { padding:6px 8px; }
        .toolbar-spacer { margin-left:auto; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .sidebar-brand { padding:14px 14px 12px; border-radius:16px; background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.82)); border:1px solid var(--border); box-shadow:var(--shadow-sm); margin-bottom:10px; }
        .sidebar-brand .title { font-size:15px; font-weight:800; letter-spacing:.01em; color:var(--text); }
        .sidebar-brand .sub { font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.45; }
        .sidebar-section-title { font-size:11px; color:var(--text-muted); padding:6px 8px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .sidebar-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-top:auto; padding:10px 4px 2px; }
        .sidebar-stat { background:rgba(255,255,255,.84); border:1px solid var(--border); border-radius:14px; padding:10px 8px; box-shadow:var(--shadow-sm); }
        .sidebar-stat .k { font-size:10px; color:var(--text-muted); margin-bottom:4px; }
        .sidebar-stat .v { font-size:14px; font-weight:800; color:var(--text); }

        .mc-tooltip { position:fixed; z-index:1000002; max-width:min(360px, calc(100vw - 24px));
          padding:6px 8px; border-radius:6px; background:rgba(17,24,39,.92); color:#fff;
          font-size:11px; line-height:1.35; pointer-events:none; box-shadow:var(--shadow-md);
          white-space:normal; transform:translateY(2px); opacity:0; transition:opacity .08s, transform .08s; }
        .mc-tooltip.show { opacity:1; transform:translateY(0); }


        .app-shell { display:flex; height:100vh; gap:10px; padding:10px; }
        .grid { background:linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,.14)); }
        body.rg-video-cover .cam-video { object-fit:cover !important; }
        body.rg-video-contain .cam-video { object-fit:contain !important; }

        .cam-card:not(.compact) .mc-hover-ui { opacity:0 !important; pointer-events:none !important; }
        .cam-card:hover .mc-hover-ui,
        .cam-card:focus-within .mc-hover-ui { opacity:1 !important; pointer-events:auto !important; }
        .cam-card .pill,
        .cam-card .name-label { opacity:0; pointer-events:none; transition:opacity .16s ease, transform .16s ease; }
        .cam-card:hover .pill,
        .cam-card:focus-within .pill,
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { opacity:1; pointer-events:auto; }
        .cam-card.not-online .pill,
        .cam-card.recording .pill { opacity:1; }
        .cam-card.recording .name-label { opacity:1; }
        .cam-card .ops-row {
          top:auto !important; right:auto !important; bottom:10px !important; left:50% !important;
          transform:translateX(-50%) translateY(8px) !important;
          display:flex !important; align-items:center !important; gap:3px !important;
          padding:4px !important; border-radius:999px !important;
          background:rgba(15,23,42,.42) !important; border:1px solid rgba(255,255,255,.18) !important;
          backdrop-filter:blur(14px) !important; -webkit-backdrop-filter:blur(14px) !important;
          box-shadow:0 10px 30px rgba(0,0,0,.18) !important;
        }
        .cam-card:hover .ops-row,
        .cam-card:focus-within .ops-row { transform:translateX(-50%) translateY(0) !important; }
        .cam-card .ops-row .icon-btn { width:28px; height:28px; border-radius:999px; color:rgba(255,255,255,.92); background:transparent; border:0; box-shadow:none; }
        .cam-card .ops-row .icon-btn:hover { background:rgba(255,255,255,.16); color:#fff; transform:none; box-shadow:none; }
        .cam-card .ops-row .icon-btn.danger:hover { background:rgba(220,38,38,.86); color:#fff; }
        .cam-card.compact .ops-extra { display:flex; }
        .cam-card.tiny .ops-extra { display:none; }
        .cam-card.tiny .ops-row .icon-btn { width:24px; height:24px; }
        .cam-card .name-label { top:8px !important; bottom:auto !important; left:8px !important; transform:translateY(-4px); }
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { transform:translateY(0); }
        .cam-card .pill { top:8px !important; right:8px !important; left:auto !important; }
        .grid.view-focus { grid-template-areas:'main thumbs' !important; grid-template-columns:minmax(0,1fr) minmax(190px,var(--focus-rail-width,260px)) !important; grid-template-rows:minmax(0,1fr) !important; gap:10px !important; padding:10px !important; background:#050607 !important; }
        .grid.view-focus .focused-row { background:#050607; border-radius:12px; }
        .grid.view-focus .focused-row .cam-card { border-radius:12px; border-color:rgba(255,255,255,.10); box-shadow:none; background:#000; }
        .grid.view-focus .focused-row .cam-video { background:#000; }
        .grid.view-focus .resizer { display:none !important; }
        .grid.view-focus .thumbs-row { grid-template-columns:1fr !important; gap:8px !important; padding:0 2px 0 0 !important; background:transparent; }
        .grid.view-focus .thumbs-row .cam-card { border-radius:10px; border-color:rgba(255,255,255,.12); opacity:.82; transition:opacity .14s,border-color .14s,transform .14s; }
        .grid.view-focus .thumbs-row .cam-card:hover { opacity:1; transform:translateY(-1px); }
        body.rg-focus-thumbs-collapsed .grid.view-focus { grid-template-areas:'main' !important; grid-template-columns:minmax(0,1fr) !important; }
        body.rg-focus-thumbs-collapsed .grid.view-focus .thumbs-row { display:none !important; }
        @media (max-width: 980px) {
          .grid.view-focus { grid-template-areas:'main' 'thumbs' !important; grid-template-columns:minmax(0,1fr) !important; grid-template-rows:minmax(0,1fr) minmax(92px,24vh) !important; }
          .grid.view-focus .thumbs-row { grid-template-columns:repeat(auto-fill,minmax(var(--focus-thumb-min,150px),1fr)) !important; padding:0 0 2px !important; }
        }

        /* —— v13.2：窗口优先最终覆盖。卡片默认只看画面，主屏默认只看主画面。 —— */
        .cam-card .ops-row .ops-extra,
        .cam-card .ops-row .icon-btn.danger { display:none !important; }
        .cam-card .ops-row .icon-btn.recording { display:flex !important; }
        .cam-card .ops-row { opacity:0; pointer-events:none; }
        .cam-card:hover .ops-row,
        .cam-card:focus-within .ops-row { opacity:1; pointer-events:auto; }
        .cam-card.is-online .pill,
        .cam-card.is-online .name-label { opacity:0 !important; pointer-events:none !important; }
        .cam-card.is-online:hover .pill,
        .cam-card.is-online:focus-within .pill,
        .cam-card.is-online:hover .name-label,
        .cam-card.is-online:focus-within .name-label { opacity:1 !important; }
        .grid.view-focus { display:block !important; position:relative !important; grid-template-areas:none !important; grid-template-columns:none !important; grid-template-rows:none !important; padding:0 !important; gap:0 !important; background:#000 !important; overflow:hidden !important; }
        .grid.view-focus .focused-row { position:absolute !important; inset:0 !important; grid-area:auto !important; min-width:0 !important; min-height:0 !important; display:grid !important; place-items:center !important; background:#000 !important; border-radius:0 !important; overflow:hidden !important; }
        .grid.view-focus .focused-row .cam-card { border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; }
        .grid.view-focus .focused-row .ops-row { top:14px !important; right:14px !important; bottom:auto !important; left:auto !important; transform:translateY(-6px) !important; }
        .grid.view-focus .focused-row .cam-card:hover .ops-row,
        .grid.view-focus .focused-row .cam-card:focus-within .ops-row { transform:translateY(0) !important; }
        .grid.view-focus .focused-row .name-label { top:auto !important; bottom:14px !important; left:14px !important; }
        .grid.view-focus .resizer { display:none !important; }
        .grid.view-focus .thumbs-row { position:absolute !important; grid-area:auto !important; left:14px !important; right:14px !important; bottom:10px !important; height:var(--focus-filmstrip-height,118px) !important;
          display:flex !important; gap:10px !important; overflow-x:auto !important; overflow-y:hidden !important; padding:10px !important; z-index:12 !important;
          background:rgba(15,23,42,.56) !important; border:1px solid rgba(255,255,255,.16) !important; border-radius:16px !important; box-shadow:0 14px 40px rgba(0,0,0,.32) !important;
          backdrop-filter:blur(14px) !important; -webkit-backdrop-filter:blur(14px) !important; transform:translateY(calc(100% - 20px)) !important; opacity:.20 !important;
          transition:transform .18s ease, opacity .18s ease, background .18s ease !important; }
        .grid.view-focus .thumbs-row:hover,
        .grid.view-focus .thumbs-row:focus-within { transform:translateY(0) !important; opacity:1 !important; background:rgba(15,23,42,.70) !important; }
        .grid.view-focus .thumbs-row .cam-card { flex:0 0 var(--focus-thumb-min,150px) !important; width:auto !important; height:100% !important; border-radius:10px !important; border-color:rgba(255,255,255,.18) !important; box-shadow:none !important; opacity:.86; }
        .grid.view-focus .thumbs-row .cam-card:hover { opacity:1; transform:translateY(-1px); }
        .grid.view-focus .thumbs-row .pill,
        .grid.view-focus .thumbs-row .name-label,
        .grid.view-focus .thumbs-row .ops-row { display:none !important; }
        body.rg-focus-thumbs-collapsed .grid.view-focus .thumbs-row { display:none !important; }
        body.rg-focus-mode { background:#000; }
        body.rg-focus-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-focus-mode .sidebar { display:none !important; }
        body.rg-focus-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; position:relative !important; }
        body.rg-focus-mode .top-accent { display:none !important; }
        body.rg-focus-mode header { position:absolute !important; left:12px !important; right:12px !important; top:10px !important; z-index:70 !important;
          transform:translateY(calc(-100% + 8px)) !important; opacity:.14 !important; transition:transform .18s ease, opacity .18s ease !important; }
        body.rg-focus-mode header:hover,
        body.rg-focus-mode header:focus-within { transform:translateY(0) !important; opacity:1 !important; }


        /* —— v14.0：重新按“多窗口视频优先”收敛。窗口是产品主体，控件只做临时 HUD。 —— */
        body { background:#0b0e13 !important; }
        .app-shell { gap:8px !important; padding:8px !important; background:#0b0e13 !important; }
        main { background:#07090d !important; border-color:rgba(255,255,255,.08) !important; border-radius:12px !important; box-shadow:none !important; }
        .top-accent { display:none !important; }
        header { padding:8px 10px !important; gap:8px !important; background:rgba(255,255,255,.92) !important; border-bottom:1px solid rgba(15,23,42,.08) !important; }
        .toolbar-group { padding:5px 7px !important; gap:6px !important; border-radius:10px !important; box-shadow:none !important; background:#fff !important; }
        .ctrl-btn, .ctrl-input { min-height:32px !important; border-radius:9px !important; padding:5px 9px !important; font-size:12px !important; }
        .seg { border-radius:10px !important; padding:2px !important; }
        .seg button { padding:5px 9px !important; border-radius:8px !important; }
        .toggle { padding:5px 7px !important; border-radius:9px !important; }
        .toolbar-spacer { gap:6px !important; }
        .sidebar { background:#111827 !important; color:#e5e7eb !important; border-color:rgba(255,255,255,.08) !important; border-radius:12px !important; box-shadow:none !important; padding:10px 8px !important; width:220px !important; }
        .sidebar-brand { background:transparent !important; border:0 !important; box-shadow:none !important; margin:0 0 4px !important; padding:8px 10px !important; }
        .sidebar-brand .title { color:#f8fafc !important; font-size:14px !important; }
        .sidebar-section-title { color:#94a3b8 !important; }
        .group-tab { color:#cbd5e1 !important; padding:8px 10px !important; border-radius:10px !important; }
        .group-tab:hover { background:rgba(255,255,255,.06) !important; border-color:rgba(255,255,255,.08) !important; box-shadow:none !important; color:#fff !important; }
        .group-tab.active { background:rgba(37,99,235,.18) !important; border-color:rgba(96,165,250,.30) !important; color:#bfdbfe !important; box-shadow:none !important; }
        .sidebar-stat { background:rgba(255,255,255,.04) !important; border-color:rgba(255,255,255,.08) !important; box-shadow:none !important; }
        .sidebar-stat .k { color:#94a3b8 !important; }
        .sidebar-stat .v { color:#f8fafc !important; }

        .grid.view-grid { background:#07090d !important; padding:8px !important; gap:6px !important; }
        .grid.view-grid .cam-card { border-radius:6px !important; }
        .cam-card { background:#000 !important; border:1px solid rgba(255,255,255,.075) !important; box-shadow:none !important; }
        .cam-card:hover, .cam-card:focus-within { border-color:rgba(96,165,250,.55) !important; box-shadow:0 0 0 1px rgba(96,165,250,.10) !important; }
        .cam-card.is-online .status-layer { display:none !important; }
        .cam-card .cam-video { background:#000 !important; }
        .cam-card .pill, .cam-card .name-label { opacity:0 !important; pointer-events:none !important; }
        .cam-card.not-online .pill,
        .cam-card.not-online .name-label,
        .cam-card.recording .name-label { opacity:1 !important; }
        .cam-card:hover .name-label,
        .cam-card:focus-within .name-label { opacity:1 !important; }
        .cam-card .name-label { left:8px !important; top:8px !important; bottom:auto !important; max-width:calc(100% - 52px) !important; background:rgba(0,0,0,.42) !important; color:#f8fafc !important; border-color:rgba(255,255,255,.10) !important; border-radius:6px !important; font-size:11px !important; padding:4px 7px !important; }
        .cam-card .pill { display:none !important; }
        .cam-card.not-online .pill { display:inline-flex !important; }
        .cam-card .ops-row {
          top:8px !important; right:8px !important; left:auto !important; bottom:auto !important;
          transform:none !important; padding:0 !important; background:transparent !important; border:0 !important; box-shadow:none !important;
          backdrop-filter:none !important; -webkit-backdrop-filter:none !important; opacity:0 !important;
        }
        .cam-card:hover .ops-row, .cam-card:focus-within .ops-row { opacity:1 !important; transform:none !important; }
        .cam-card .ops-row .icon-btn { width:30px !important; height:30px !important; border-radius:8px !important; background:rgba(0,0,0,.48) !important; color:#f8fafc !important; border:1px solid rgba(255,255,255,.14) !important; box-shadow:none !important; }
        .cam-card .ops-row .icon-btn:hover { background:rgba(37,99,235,.86) !important; border-color:rgba(96,165,250,.50) !important; }
        .cam-card .ops-row .icon-btn:not(:last-child) { display:none !important; }
        .cam-card.recording::after { content:'REC'; position:absolute; left:8px; bottom:8px; z-index:28; padding:3px 6px; border-radius:5px; background:rgba(220,38,38,.92); color:#fff; font-size:10px; font-weight:800; letter-spacing:.04em; pointer-events:none; }
        .cam-card.recording-waiting::after { content:'REC PAUSED'; background:rgba(217,119,6,.94); }
        .status-layer { color:#cbd5e1 !important; background:linear-gradient(180deg,rgba(15,23,42,.10),rgba(15,23,42,.24)) !important; }
        .status-layer .status-chip { background:rgba(255,255,255,.06) !important; color:#e5e7eb !important; border-color:rgba(255,255,255,.10) !important; }

        body.rg-focus-mode { background:#000 !important; }
        body.rg-focus-mode .app-shell { padding:0 !important; gap:0 !important; }
        body.rg-focus-mode .sidebar,
        body.rg-focus-mode .top-accent { display:none !important; }
        body.rg-focus-mode main { width:100vw !important; height:100vh !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; }
        body.rg-focus-mode header { transform:translateY(calc(-100% + 4px)) !important; opacity:.02 !important; pointer-events:auto !important; }
        body.rg-focus-mode header:hover,
        body.rg-focus-mode header:focus-within { transform:translateY(0) !important; opacity:1 !important; pointer-events:auto !important; }
        body.rg-focus-mode::before { content:''; position:fixed; left:0; right:0; top:0; height:14px; z-index:69; pointer-events:none; }
        body.rg-focus-mode:hover header { pointer-events:auto !important; }
        .grid.view-focus { padding:0 !important; background:#000 !important; }
        .grid.view-focus .focused-row .cam-card { border:0 !important; border-radius:0 !important; }
        .grid.view-focus .focused-row .name-label { top:auto !important; bottom:14px !important; left:14px !important; background:rgba(0,0,0,.34) !important; opacity:0 !important; }
        .grid.view-focus .focused-row .cam-card:hover .name-label,
        .grid.view-focus .focused-row .cam-card:focus-within .name-label { opacity:1 !important; }
        .grid.view-focus .focused-row .ops-row { top:14px !important; right:14px !important; opacity:0 !important; }
        .grid.view-focus .focused-row .cam-card:hover .ops-row,
        .grid.view-focus .focused-row .cam-card:focus-within .ops-row { opacity:1 !important; }
        .grid.view-focus .thumbs-row { transform:translateY(calc(100% + 6px)) !important; opacity:0 !important; bottom:8px !important; left:8px !important; right:8px !important; height:104px !important; }
        .grid.view-focus .thumbs-row:hover,
        .grid.view-focus .thumbs-row:focus-within { transform:translateY(0) !important; opacity:1 !important; }
        body:not(.rg-focus-thumbs-collapsed) .grid.view-focus::after { content:''; position:absolute; left:50%; bottom:7px; width:64px; height:4px; transform:translateX(-50%); border-radius:999px; background:rgba(255,255,255,.22); z-index:11; pointer-events:none; }
        body.rg-focus-thumbs-collapsed .grid.view-focus::after { display:none !important; }
        .grid.view-focus .thumbs-row .cam-card { border-radius:6px !important; }
        .grid.view-focus .thumbs-row .cam-card.is-focus-main { outline:2px solid rgba(96,165,250,.92) !important; outline-offset:-2px; }

        /* —— 纯净模式：隐藏工具栏、按钮和所有浮层，只保留画面 —— */
        body.rg-pure-mode { background:#000; }
        body.rg-pure-mode .sidebar,
        body.rg-pure-mode header,
        body.rg-pure-mode .top-accent,
        body.rg-pure-mode .mc-hover-ui,
        body.rg-pure-mode .favorite-toggle,
        body.rg-pure-mode .split-toggle,
        body.rg-pure-mode .pill,
        body.rg-pure-mode .name-label,
        body.rg-pure-mode .status-layer,
        body.rg-pure-mode .resizer,
        body.rg-pure-mode .menu-pop,
        body.rg-pure-mode .mc-tooltip { display:none !important; }
        body.rg-pure-mode main { width:100vw; height:100vh; background:#000; }
        body.rg-pure-mode .grid { padding:0 !important; gap:0 !important; background:#000; }
        body.rg-pure-mode .grid.view-focus { padding:0 !important; gap:0 !important; grid-template-areas:'main'; grid-template-rows:minmax(0,1fr) !important; }
        body.rg-pure-mode .grid.view-focus .focused-row { grid-area:main; }
        body.rg-pure-mode .grid.view-focus .thumbs-row { display:none !important; }
        body.rg-pure-mode .cam-card { border:none !important; border-radius:0 !important; box-shadow:none !important; background:#000 !important; outline:none !important; }
        body.rg-pure-mode .cam-video { background:#000 !important; }
        body.rg-pure-mode.pure-cursor-hidden,
        body.rg-pure-mode.pure-cursor-hidden * { cursor:none !important; }
        .pure-exit-chip { display:none; position:fixed; right:10px; bottom:10px; z-index:1000001;
          border:1px solid rgba(255,255,255,.22); background:rgba(0,0,0,.22); color:rgba(255,255,255,.72);
          border-radius:999px; padding:5px 9px; font-size:11px; cursor:pointer; opacity:.10; transition:opacity .15s, background .15s; }
        body.rg-pure-mode .pure-exit-chip { display:block; }
        body.rg-pure-mode .pure-exit-chip:hover,
        body.rg-pure-mode .pure-exit-chip:focus { opacity:1; background:rgba(0,0,0,.55); }

        /* 顶部一抹橙色细线，作为品牌呼应 */
        .top-accent { height:3px; background:linear-gradient(90deg,
          #60a5fa 0%, var(--accent) 35%, #22c55e 100%); flex-shrink:0; }

        /* v15 —— normal multiview product surface: light tone, collapsible shell, continuous layouts */
        body { background:#f3f1ea !important; }
        .app-shell { background:#f3f1ea !important; gap:8px !important; padding:8px !important; }
        main { background:#fbfaf6 !important; border-color:#dedbd2 !important; border-radius:14px !important; }
        .sidebar { background:#fbfaf6 !important; border-color:#dedbd2 !important; border-radius:14px !important; box-shadow:none !important; }
        header { background:#fbfaf6 !important; border-bottom-color:#dedbd2 !important; padding:10px 12px !important; gap:8px !important; }
        .top-accent { display:none !important; }
        .toolbar-group { background:#fffefb !important; border-color:#e3e0d7 !important; border-radius:10px !important; box-shadow:none !important; padding:6px 8px !important; }
        .toolbar-group-title { font-size:11px; line-height:1; font-weight:700; color:#7a7468; margin-right:2px; white-space:nowrap; }
        .ctrl-btn, .ctrl-input { border-radius:9px !important; min-height:34px !important; box-shadow:none !important; }
        .seg { border-radius:9px !important; box-shadow:none !important; }
        .seg button { border-radius:7px !important; }
        .layout-seg button { min-width:38px; }
        .shell-controls { position:fixed; left:10px; top:10px; z-index:1000001; display:flex; gap:6px; pointer-events:auto; }
        .shell-controls button { border:1px solid #dedbd2; background:rgba(255,254,251,.92); color:#334155; border-radius:9px; padding:6px 9px; min-height:30px; font-size:12px; cursor:pointer; box-shadow:0 6px 18px rgba(15,23,42,.08); }
        body:not(.rg-toolbar-collapsed) .shell-controls .show-toolbar-btn { display:none; }
        body:not(.rg-sidebar-collapsed) .shell-controls .show-sidebar-btn { display:none; }
        body.rg-toolbar-collapsed header,
        body.rg-toolbar-collapsed .top-accent { display:none !important; }
        body.rg-sidebar-collapsed .sidebar { display:none !important; }
        body.rg-sidebar-collapsed .app-shell { grid-template-columns:1fr !important; }

        .grid { background:#ece9df !important; padding:10px !important; }
        .grid.view-grid { height:100%; overflow:hidden !important; align-content:stretch !important; align-items:stretch !important; }
        .grid.view-grid .cam-card { border-radius:8px !important; border-color:#d4d0c6 !important; background:#f8f6ee !important; box-shadow:none !important; }
        .cam-card { background:#f8f6ee !important; }
        .cam-video { background:#f8f6ee !important; }
        .status-layer { background:#f8f6ee !important; }
        .cam-card .name-label, .cam-card .pill { background:rgba(255,254,251,.88) !important; color:#334155 !important; border-color:#e3e0d7 !important; box-shadow:none !important; }
        .cam-card .ops-row { bottom:8px !important; }
        .icon-btn { background:rgba(255,254,251,.88) !important; border-color:#e3e0d7 !important; box-shadow:none !important; color:#334155 !important; }
        .icon-btn:hover { background:#fff !important; color:var(--accent) !important; transform:none !important; }

        /* Focus multiview: main top-left, secondary right and bottom; resizers adapt secondaries */
        .grid.view-focus { display:grid !important; height:100% !important; overflow:hidden !important;
          grid-template-columns:minmax(260px,var(--focus-main-w,62fr)) 8px minmax(190px,var(--focus-side-w,38fr)) !important;
          grid-template-rows:minmax(220px,var(--focus-main-h,64fr)) 8px minmax(120px,var(--focus-bottom-h,36fr)) !important;
          grid-template-areas:'main vbar side' 'hbar hbar side' 'bottom bottom side' !important;
          gap:8px !important; padding:10px !important; background:#ece9df !important; }
        .grid.view-focus.no-bottom { grid-template-rows:minmax(0,1fr) !important; grid-template-areas:'main vbar side' !important; }
        .grid.view-focus.no-bottom .focus-bottom-row,
        .grid.view-focus.no-bottom .focus-h-resizer { display:none !important; }
        .grid.view-focus .focused-row { grid-area:main !important; display:grid !important; place-items:stretch !important; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-side-row { grid-area:side; display:grid; grid-auto-flow:row; gap:8px; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-bottom-row { grid-area:bottom; display:grid; grid-auto-flow:column; gap:8px; min-width:0; min-height:0; overflow:hidden; }
        .grid.view-focus .focus-side-row .cam-card,
        .grid.view-focus .focus-bottom-row .cam-card { width:100% !important; height:100% !important; min-height:0 !important; aspect-ratio:auto !important; border-radius:8px !important; }
        .grid.view-focus .focused-row .cam-card { width:100% !important; height:100% !important; max-width:100% !important; max-height:100% !important; border-radius:8px !important; }
        .grid.view-focus .resizer { display:block !important; background:transparent !important; position:relative; z-index:3; }
        .grid.view-focus .focus-v-resizer { grid-area:vbar; cursor:ew-resize; }
        .grid.view-focus .focus-h-resizer { grid-area:hbar; cursor:ns-resize; }
        .grid.view-focus .resizer::before { content:''; position:absolute; inset:0; margin:auto; border-radius:999px; background:#d4d0c6; opacity:.72; transition:opacity .12s, background .12s; }
        .grid.view-focus .focus-v-resizer::before { width:3px; height:52px; }
        .grid.view-focus .focus-h-resizer::before { width:52px; height:3px; }
        .grid.view-focus .resizer:hover::before,
        .grid.view-focus .resizer.dragging::before { background:var(--accent); opacity:1; }
        .grid.view-focus .thumbs-row { display:none !important; }

        /* v15.1 repairs: reliable collapsed sidebar, wheel-safe controls and readable group contrast */
        .app-shell { display:flex !important; min-width:0 !important; min-height:0 !important; }
        .sidebar { width:220px !important; min-width:220px !important; max-width:220px !important; flex:0 0 220px !important; color:#1f2937 !important; }
        .sidebar.is-collapsed,
        body.rg-sidebar-collapsed .sidebar { display:none !important; width:0 !important; min-width:0 !important; max-width:0 !important; flex:0 0 0 !important; flex-basis:0 !important; padding:0 !important; margin:0 !important; border:0 !important; overflow:hidden !important; }
        body.rg-sidebar-collapsed main { flex:1 1 100% !important; min-width:0 !important; }
        body.rg-toolbar-collapsed header,
        body.rg-toolbar-collapsed .top-accent { display:none !important; }
        .shell-controls { display:flex; align-items:center; }
        body:not(.rg-toolbar-collapsed):not(.rg-sidebar-collapsed) .shell-controls { display:none !important; }
        body.rg-toolbar-collapsed .shell-controls .show-toolbar-btn { display:inline-flex !important; }
        body.rg-sidebar-collapsed .shell-controls .show-sidebar-btn { display:inline-flex !important; }
        .sidebar-brand .title { color:#111827 !important; }
        .sidebar-section-title { color:#5f574a !important; font-weight:800 !important; letter-spacing:.08em !important; }
        .sidebar .group-tab { color:#293241 !important; font-weight:650 !important; background:transparent !important; border-color:transparent !important; }
        .sidebar .group-tab:hover { background:#f1efe7 !important; color:#111827 !important; border-color:#d8d3c5 !important; box-shadow:none !important; }
        .sidebar .group-tab.active { background:#e8efff !important; color:#0f172a !important; border-color:#b8c9ff !important; box-shadow:inset 3px 0 0 #2563eb !important; }
        .sidebar .group-tab > span:first-child { color:inherit !important; }
        .sidebar .group-tab > span:last-child { color:#475569 !important; background:#eee9dc !important; border-color:#d8d3c5 !important; }
        .sidebar .group-tab.active > span:last-child { color:#1d4ed8 !important; background:#dbeafe !important; border-color:#bfdbfe !important; }
        .sidebar-collapse-btn { border:1px solid #d8d3c5; background:#f1efe7; color:#334155; border-radius:8px; padding:4px 8px; font-size:12px; line-height:1.2; cursor:pointer; }
        .sidebar-collapse-btn:hover { background:#e7e2d5; color:#0f172a; border-color:#c9c1b1; }
        .sidebar .group-tab { display:flex !important; align-items:center !important; justify-content:space-between !important; gap:8px !important; }
        .sidebar .group-name { color:inherit !important; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .sidebar .group-count { color:#334155 !important; background:#eee9dc !important; border:1px solid #d8d3c5 !important; border-radius:999px; padding:2px 7px; min-width:26px; text-align:center; font-size:11px; line-height:1.25; font-weight:750; }
        .sidebar .group-tab.active .group-count { color:#1d4ed8 !important; background:#dbeafe !important; border-color:#bfdbfe !important; }
        .sidebar .group-tab[style] { color:#293241 !important; }
        .sidebar-stat { background:#fffefb !important; border-color:#e3e0d7 !important; }
        .sidebar-stat .k { color:#6b6256 !important; }
        .sidebar-stat .v { color:#111827 !important; }
        input[type=range], input[type=number], select { overscroll-behavior:contain; }
        /* v15.3: top controls stay on one row; compact mode hides labels on narrower screens. */
        header { flex-wrap:nowrap !important; overflow-x:auto !important; overflow-y:hidden !important; scrollbar-width:thin; white-space:nowrap; }
        header .toolbar-group { flex-wrap:nowrap !important; flex:0 0 auto !important; align-items:center !important; }
        header .toolbar-spacer { flex-wrap:nowrap !important; flex:0 0 auto !important; margin-left:auto !important; }
        header .ctrl-input { height:34px !important; }
        header select.ctrl-input { max-width:150px; }
        header .roomgrid-compact-select { width:auto !important; min-width:92px; padding-right:24px !important; }
        header .toolbar-group-title { flex:0 0 auto; }
        @media (max-width: 1360px) {
          header { gap:8px !important; padding:10px 12px !important; }
          header .toolbar-group { gap:6px !important; padding:4px 6px !important; }
          header .toolbar-group-title { display:none !important; }
          header .ctrl-input { height:32px !important; padding-top:5px !important; padding-bottom:5px !important; }
          header .ctrl-btn { min-height:32px !important; padding:5px 8px !important; }
          header .ctrl-btn .btn-label { display:none !important; }
          header input[placeholder] { max-width:150px !important; }
          header select.ctrl-input { max-width:118px !important; }
          header input[type=range] { width:72px !important; }
        }

        /* v15.4: interaction polish. Keep core layout intact; make common actions one click and reduce visual jank. */
        .cam-card { backface-visibility:hidden; transform:translateZ(0); }
        .cam-card.rg-card-enter { animation:rg-card-enter .16s ease-out both; }
        @keyframes rg-card-enter { from { opacity:.55; transform:scale(.985); } to { opacity:1; transform:scale(1); } }
        .cam-card .ops-row { transition:opacity .12s ease, transform .12s ease !important; }
        .cam-card .ops-row .icon-btn.quick-op { display:flex !important; }
        .cam-card.tiny .ops-row .icon-btn.quick-optional { display:none !important; }
        .cam-card .ops-row .icon-btn.quick-more { display:flex !important; }
        .cam-card.favorite-online { border-color:#22c55e !important; box-shadow:inset 0 0 0 2px rgba(34,197,94,.28) !important; }
        .cam-card .favorite-toggle {
          position:absolute !important; right:8px !important; bottom:8px !important; z-index:26 !important;
          width:30px !important; height:30px !important; display:flex !important; align-items:center !important; justify-content:center !important;
          border-radius:999px !important; color:#64748b !important; background:rgba(255,254,251,.92) !important;
          border:1px solid rgba(148,163,184,.45) !important; box-shadow:0 3px 12px rgba(15,23,42,.14) !important;
          opacity:.92; cursor:pointer;
        }
        .cam-card .favorite-toggle:hover { color:#d97706 !important; background:#fff !important; transform:translateY(-1px) !important; }
        .cam-card .favorite-toggle.favorite-active { color:#f59e0b !important; background:#fffbeb !important; border-color:#fbbf24 !important; }
        .cam-card .favorite-toggle.favorite-active .svg-icon { fill:currentColor; }
        .cam-card .split-toggle {
          position:absolute !important; right:44px !important; bottom:8px !important; z-index:26 !important;
          width:30px !important; height:30px !important; display:flex !important; align-items:center !important; justify-content:center !important;
          border-radius:999px !important; color:#64748b !important; background:rgba(255,254,251,.92) !important;
          border:1px solid rgba(148,163,184,.45) !important; box-shadow:0 3px 12px rgba(15,23,42,.14) !important;
          opacity:.92; cursor:pointer;
        }
        .cam-card .split-toggle:hover { color:#2563eb !important; background:#eff6ff !important; border-color:#60a5fa !important; transform:translateY(-1px) !important; }
        .cam-card .split-toggle.split-active { color:#fff !important; background:#2563eb !important; border-color:#60a5fa !important; }

        /* v15.9.37: foldable Split View with previews, online-model cycling, and one-handed controls. */
        body.rg-split-mode { overflow:hidden !important; background:#000 !important; }
        body.rg-split-mode .sidebar,
        body.rg-split-mode header,
        body.rg-split-mode .top-accent,
        body.rg-split-mode .shell-controls { display:none !important; }
        body.rg-split-mode .app-shell { width:100vw !important; height:100dvh !important; min-height:0 !important; padding:0 !important; gap:0 !important; }
        body.rg-split-mode main { width:100vw !important; height:100dvh !important; min-width:0 !important; min-height:0 !important; border:0 !important; border-radius:0 !important; background:#000 !important; }
        .grid.view-split {
          position:relative !important; display:grid !important; width:100% !important; height:100% !important; min-height:0 !important;
          padding:max(4px, env(safe-area-inset-top)) max(4px, env(safe-area-inset-right)) max(4px, env(safe-area-inset-bottom)) max(4px, env(safe-area-inset-left)) !important;
          gap:0 !important; overflow:hidden !important; background:#000 !important;
          grid-template-columns:minmax(0, var(--split-ratio, 50%)) 8px minmax(0, 1fr) !important;
          grid-template-rows:minmax(0, 1fr) !important;
        }
        .grid.view-split .split-pane { position:relative; min-width:0; min-height:0; overflow:hidden; background:#000; }
        .grid.view-split .split-pane .cam-card { width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; border:0 !important; border-radius:0 !important; aspect-ratio:auto !important; }
        .grid.view-split .split-pane .favorite-toggle,
        .grid.view-split .split-pane .split-toggle { display:none !important; }
        .grid.view-split .split-divider { position:relative; z-index:45; background:#111827; cursor:ew-resize; touch-action:none; }
        .grid.view-split .split-divider::after { content:''; position:absolute; inset:0; margin:auto; width:3px; height:48px; max-height:60%; border-radius:999px; background:rgba(255,255,255,.48); }
        .grid.view-split .split-divider.dragging::after { background:#60a5fa; }
        .split-pane-controls { position:absolute; left:8px; right:8px; bottom:8px; z-index:55; display:flex; align-items:center; justify-content:space-between; gap:8px; pointer-events:none; }
        .split-pane-controls .split-pane-label { max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:7px 10px; border-radius:999px; background:rgba(0,0,0,.58); color:#fff; font-size:12px; font-weight:750; backdrop-filter:blur(8px); }
        .split-pane-actions { display:flex; gap:6px; pointer-events:auto; }
        .split-pane-actions button,
        .split-toolbar button { min-width:42px; min-height:42px; display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid rgba(255,255,255,.22); border-radius:12px; background:rgba(15,23,42,.70); color:#fff; font:700 12px/1 system-ui,sans-serif; backdrop-filter:blur(10px); cursor:pointer; }
        .split-pane-actions button:hover,
        .split-pane-actions button.active,
        .split-toolbar button:hover { background:#2563eb; border-color:#60a5fa; }
        .split-pane-actions button:disabled { opacity:.38; cursor:not-allowed; background:rgba(15,23,42,.55); border-color:rgba(255,255,255,.14); }
        .split-toolbar { position:absolute; top:max(8px, env(safe-area-inset-top)); left:50%; z-index:60; display:flex; gap:6px; transform:translateX(-50%); padding:5px; border-radius:14px; background:rgba(0,0,0,.34); backdrop-filter:blur(10px); opacity:1; transition:opacity .2s ease, transform .2s ease; will-change:opacity,transform; }
        .split-toolbar.is-hidden { opacity:0; transform:translate(-50%,-10px); pointer-events:none; }
        .split-toolbar.position-lower-left { top:auto; bottom:max(64px, calc(env(safe-area-inset-bottom) + 56px)); left:max(8px, env(safe-area-inset-left)); right:auto; transform:none; }
        .split-toolbar.position-lower-right { top:auto; bottom:max(64px, calc(env(safe-area-inset-bottom) + 56px)); left:auto; right:max(8px, env(safe-area-inset-right)); transform:none; }
        .split-toolbar.position-lower-left.is-hidden,
        .split-toolbar.position-lower-right.is-hidden { transform:translateY(10px); }
        .split-toolbar .split-exit { background:rgba(185,28,28,.78); }
        .split-picker-row { display:grid; grid-template-columns:minmax(0,1fr) 46px; gap:6px; align-items:stretch; }
        .split-picker-row .split-picker-select { display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:10px; min-height:46px; width:100%; text-align:left; }
        .split-picker-preview-btn { min-width:44px; padding:0 !important; display:inline-flex; align-items:center; justify-content:center; }
        .split-quick-preview { display:none; margin-bottom:10px; padding:10px; border:1px solid var(--border); border-radius:12px; background:#f8fafc; }
        .split-quick-preview.is-open { display:block; }
        .split-preview-frame { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:10px; background:linear-gradient(135deg,#111827,#334155); }
        .split-preview-frame img { width:100%; height:100%; display:block; object-fit:contain; background:#05070a; }
        .split-preview-status { position:absolute; inset:auto 8px 8px; padding:6px 9px; border-radius:999px; background:rgba(0,0,0,.62); color:#fff; font-size:11px; font-weight:750; backdrop-filter:blur(6px); }
        .split-preview-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
        .split-preview-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:850; }
        .split-preview-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:6px; margin-top:8px; }
        @media (prefers-reduced-motion: reduce) { .split-toolbar { transition:none; } }
        @media (orientation:portrait), (max-aspect-ratio:1/1) {
          .grid.view-split { grid-template-columns:minmax(0,1fr) !important; grid-template-rows:minmax(0, var(--split-ratio, 50%)) 8px minmax(0,1fr) !important; }
          .grid.view-split .split-divider { cursor:ns-resize; }
          .grid.view-split .split-divider::after { width:48px; height:3px; max-width:60%; }
        }
        @media (max-width:520px) {
          .split-pane-controls { left:6px; right:6px; bottom:6px; }
          .split-pane-controls .split-pane-label { max-width:42%; font-size:11px; }
          .split-pane-actions button, .split-toolbar button { min-width:44px; min-height:44px; }
          .split-toolbar .btn-label { display:none; }
        }
        .cam-card .ops-row .icon-btn:active,
        .ctrl-btn:active,
        .group-tab:active { transform:scale(.96) !important; }
        /* v15.9.26: keep the workstation usable in short/zoomed windows. */
        html { min-height:100%; overflow-y:auto; }
        body { min-height:100vh; overflow-x:hidden !important; overflow-y:auto !important; }
        .app-shell { min-height:640px !important; }
        .grid.view-grid { overflow:auto !important; overscroll-behavior:contain; }
        body.rg-pure-mode,
        body.rg-focus-mode { overflow:hidden !important; }
        body.rg-pure-mode .app-shell,
        body.rg-focus-mode .app-shell { height:100vh !important; min-height:0 !important; }
        .grid.view-focus .focus-side-row .cam-card,
        .grid.view-focus .focus-bottom-row .cam-card { cursor:pointer; transition:border-color .12s ease, transform .12s ease, opacity .12s ease; }
        .grid.view-focus .focus-side-row .cam-card:hover,
        .grid.view-focus .focus-bottom-row .cam-card:hover { transform:translateY(-1px); border-color:rgba(37,99,235,.62) !important; }
        .roomgrid-modal-backdrop { position:fixed; inset:0; z-index:1000003; display:flex; align-items:center; justify-content:center; padding:18px; background:rgba(15,23,42,.40); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); }
        .roomgrid-modal { width:min(560px, calc(100vw - 36px)); background:#fffefb; border:1px solid #e3e0d7; border-radius:14px; box-shadow:0 22px 80px rgba(15,23,42,.24); padding:14px; color:#111827; }
        .roomgrid-modal-title { font-size:15px; font-weight:800; margin-bottom:6px; }
        .roomgrid-modal-hint { font-size:12px; line-height:1.45; color:#64748b; margin-bottom:10px; }
        .roomgrid-modal-textarea { width:100%; min-height:220px; resize:vertical; border:1px solid #dedbd2; border-radius:10px; padding:10px; outline:none; font:13px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background:#fff; color:#111827; }
        .roomgrid-modal-textarea:focus { border-color:rgba(37,99,235,.45); box-shadow:0 0 0 3px rgba(37,99,235,.10); }
        .roomgrid-modal-count { margin-top:8px; font-size:12px; color:#64748b; }
        .roomgrid-modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

        /* v15.10: continuous grid, compact navigation, and automatic phone workspace. */
        .grid.view-grid { overflow-x:hidden !important; overflow-y:auto !important; align-content:start !important; scroll-behavior:smooth; scrollbar-gutter:stable; }
        .sidebar-search { width:100% !important; min-height:38px; margin:5px 0 3px; }
        .sidebar-section-spaced { margin-top:10px !important; }
        .sidebar-group-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:4px; align-items:stretch; }
        .sidebar-group-row > .group-tab { min-width:0; width:100%; }
        .sidebar-group-more { width:34px; min-width:34px; border:1px solid transparent; border-radius:8px; background:transparent; color:#64748b; cursor:pointer; font-weight:850; }
        .sidebar-group-more:hover { background:#f1efe7; border-color:#d8d3c5; color:#111827; }
        .sidebar-summary { margin-top:auto; padding:10px 8px 4px; color:#64748b; font-size:12px; font-weight:650; }
        .sidebar-footer { display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,.65fr); gap:6px; padding-top:4px; }
        .sidebar-footer .ctrl-btn { justify-content:center; min-width:0; }
        .workshop-refresh-status { display:grid; gap:5px; padding:7px 4px 2px; color:var(--text-muted); font-size:10px; line-height:1.25; }
        .workshop-refresh-status[hidden] { display:none!important; }
        .workshop-refresh-track { height:7px; overflow:hidden; border:1px solid var(--border); border-radius:999px; background:#17202a; }
        .workshop-refresh-fill { display:block; width:0; height:100%; background:#0c6a93; transition:width .18s ease; }
        .grid.view-focus .focus-side-row { overflow-y:auto !important; overflow-x:hidden !important; align-content:start !important; overscroll-behavior:contain; padding-right:2px; }
        .grid.view-focus .focus-bottom-row,
        .grid.view-focus .focus-h-resizer { display:none !important; }

        body.rg-phone-device .ctrl-btn,
        body.rg-phone-device .icon-btn,
        body.rg-phone-device .group-tab,
        body.rg-phone-mode .ctrl-btn,
        body.rg-phone-mode .icon-btn,
        body.rg-phone-mode .group-tab { min-height:44px !important; }
        body.rg-phone-device .cam-card .ops-row,
        body.rg-phone-mode .cam-card .ops-row { opacity:1 !important; pointer-events:auto !important; transform:translateX(-50%) translateY(0) !important; }
        body.rg-phone-mode { width:100vw; height:100dvh; min-height:0 !important; overflow:hidden !important; background:#ece9df !important; }
        body.rg-phone-mode .app-shell { width:100vw !important; height:100dvh !important; min-height:0 !important; padding:max(3px,env(safe-area-inset-top)) max(3px,env(safe-area-inset-right)) max(3px,env(safe-area-inset-bottom)) max(3px,env(safe-area-inset-left)) !important; gap:0 !important; }
        body.rg-phone-mode main { position:relative; z-index:1; width:100% !important; height:100% !important; min-width:0 !important; min-height:0 !important; border-radius:10px !important; }
        body.rg-phone-mode header { position:relative; z-index:20; flex:0 0 auto; isolation:isolate; padding:5px 6px 5px 60px !important; gap:5px !important; min-height:52px; scrollbar-width:none; touch-action:pan-x; }
        body.rg-phone-mode header::-webkit-scrollbar { display:none; }
        body.rg-phone-mode header .toolbar-group { padding:2px 3px !important; gap:4px !important; }
        body.rg-phone-mode header .toolbar-group-title,
        body.rg-phone-mode header .btn-label { display:none !important; }
        body.rg-phone-mode header .ctrl-input { min-height:42px !important; max-width:112px !important; }
        body.rg-phone-mode .grid.view-phone { position:relative; z-index:1; padding:4px !important; gap:4px !important; min-height:0 !important; overflow-x:hidden !important; overflow-y:auto !important; overscroll-behavior:contain; scrollbar-gutter:auto; touch-action:pan-y; }
        body.rg-phone-mode .grid.view-phone .cam-card { border-radius:8px !important; touch-action:pan-y; }
        body.rg-phone-mode .sidebar { position:fixed !important; z-index:2147483000 !important; inset:max(4px,env(safe-area-inset-top)) auto max(4px,env(safe-area-inset-bottom)) max(4px,env(safe-area-inset-left)) !important; height:auto !important; border-radius:14px !important; box-shadow:0 22px 70px rgba(15,23,42,.32) !important; pointer-events:auto !important; touch-action:pan-y; overscroll-behavior:contain; }
        body.rg-phone-mode.rg-sidebar-collapsed .sidebar { display:none !important; }
        /* The base rule uses top:10px. Reset it here before anchoring to the
           phone safe-area bottom; otherwise the transparent flex box stretches
           across the viewport, centres Groups between cards, and intercepts taps. */
        body.rg-phone-mode .shell-controls { position:fixed !important; top:max(8px,env(safe-area-inset-top)) !important; right:auto !important; bottom:auto !important; left:max(8px,env(safe-area-inset-left)) !important; width:auto !important; height:auto !important; z-index:2147483500 !important; align-items:center !important; pointer-events:none !important; }
        body.rg-phone-mode .shell-controls button { min-width:48px; min-height:48px; padding:8px 12px; border-radius:14px; pointer-events:auto !important; touch-action:manipulation; }
        body.rg-phone-mode .shell-controls .show-sidebar-btn { width:48px; padding:0; font-size:0; }
        body.rg-phone-mode .shell-controls .show-sidebar-btn::before { content:'☰'; font-size:22px; line-height:1; }
        body.rg-phone-mode .more-menu-pop { position:fixed !important; inset:auto 6px max(6px,env(safe-area-inset-bottom)) 6px !important; min-width:0 !important; width:auto !important; max-height:82dvh !important; border-radius:16px !important; box-shadow:0 20px 70px rgba(15,23,42,.36) !important; }
        body.rg-phone-mode .roomgrid-modal-backdrop { align-items:flex-end; padding:0; }
        body.rg-phone-mode .roomgrid-modal { width:100%; max-height:88dvh; overflow-y:auto; border-radius:16px 16px 0 0; padding-bottom:max(14px,env(safe-area-inset-bottom)); }
        @media (orientation:landscape) and (max-height:600px) {
          body.rg-phone-mode header { min-height:46px; padding:2px 5px 2px 54px !important; }
          body.rg-phone-mode header .ctrl-btn,
          body.rg-phone-mode header .ctrl-input { min-height:38px !important; height:38px !important; }
          body.rg-phone-mode .cam-card .favorite-toggle,
          body.rg-phone-mode .cam-card .split-toggle { width:28px !important; height:28px !important; }
        }

        /* v16.1: Workshop follows Chaturbate's native desktop/mobile language. */
        :root {
          color-scheme:dark;
          --bg:#17202a;
          --bg-elevated:#202c39;
          --bg-card:#202c39;
          --bg-input:#17202a;
          --bg-hover:#253648;
          --border:#2d3e50;
          --border-strong:#3b5066;
          --text:#f1f1f1;
          --text-secondary:#d7d7d7;
          --text-muted:#b3b3b3;
          --accent:#68b5f0;
          --accent-hover:#8bc9f7;
          --accent-soft:rgba(12,106,147,.28);
          --shadow-sm:none;
          --shadow-md:none;
          --shadow-lg:0 8px 24px rgba(0,0,0,.32);
        }
        html,body { min-width:0 !important; max-width:100vw !important; background:#17202a !important; color:#f1f1f1 !important; font-family:UbuntuRegular,Arial,sans-serif !important; }
        .app-shell { background:#17202a !important; gap:8px !important; padding:8px !important; }
        main { background:#17202a !important; border:1px solid #2d3e50 !important; border-radius:4px !important; box-shadow:none !important; }
        header { background:#202c39 !important; border-bottom:1px solid #2d3e50 !important; }
        .toolbar-group { background:transparent !important; border-color:#2d3e50 !important; border-radius:4px !important; }
        .ctrl-btn,.ctrl-input,.seg { background:#17202a !important; border-color:#2d3e50 !important; border-radius:4px !important; color:#f1f1f1 !important; box-shadow:none !important; }
        .ctrl-btn.primary,.seg button.active { background:#0c6a93 !important; border-color:#0c6a93 !important; color:#fff !important; box-shadow:none !important; }
        .sidebar { width:272px !important; min-width:272px !important; max-width:272px !important; flex:0 0 272px !important; padding:12px !important; background:#202c39 !important; color:#f1f1f1 !important; border:1px solid #2d3e50 !important; border-radius:4px !important; box-shadow:none !important; }
        .sidebar-brand { padding:8px 4px 12px !important; background:transparent !important; border:0 !important; border-bottom:1px solid #2d3e50 !important; border-radius:0 !important; box-shadow:none !important; }
        .sidebar-brand .title { color:#f1f1f1 !important; }
        .sidebar-section-title { color:#b3b3b3 !important; }
        .sidebar .group-tab { color:#d7d7d7 !important; border-radius:4px !important; }
        .sidebar .group-tab:hover { background:#253648 !important; color:#fff !important; border-color:#3b5066 !important; }
        .sidebar .group-tab.active { background:#0c6a93 !important; color:#fff !important; border-color:#0c6a93 !important; box-shadow:none !important; }
        .sidebar .group-count,.sidebar .group-tab > span:last-child { color:#b3b3b3 !important; background:#17202a !important; border-color:#2d3e50 !important; }
        .sidebar .group-tab.active .group-count { color:#fff !important; background:rgba(0,0,0,.18) !important; border-color:rgba(255,255,255,.22) !important; }
        .sidebar-stat { background:#17202a !important; border-color:#2d3e50 !important; border-radius:4px !important; }
        .sidebar-stat .k { color:#b3b3b3 !important; }
        .sidebar-stat .v { color:#f1f1f1 !important; }
        .grid.view-grid,.grid.view-phone { background:#17202a !important; }
        .cam-card { border:1px solid #2d3e50 !important; border-radius:4px !important; background:#000 !important; box-shadow:none !important; }
        .cam-card:hover,.cam-card:focus-within { border-color:#68b5f0 !important; box-shadow:none !important; }
        .menu-pop,.roomgrid-modal { background:#202c39 !important; color:#f1f1f1 !important; border-color:#2d3e50 !important; border-radius:4px !important; }
        .menu-pop button { color:#f1f1f1 !important; }
        .menu-pop button:hover { background:#253648 !important; }
        .roomgrid-modal-textarea { background:#17202a !important; color:#f1f1f1 !important; border-color:#2d3e50 !important; }

        body.rg-phone-mode { background:#17202a !important; }
        body.rg-phone-mode .app-shell { padding:0 !important; background:#17202a !important; }
        body.rg-phone-mode main { border:0 !important; border-radius:0 !important; background:#17202a !important; }
        body.rg-phone-mode header {
          min-height:44px !important; padding:max(2px,env(safe-area-inset-top)) 4px 2px 48px !important;
          display:flex !important; flex-wrap:nowrap !important; overflow:hidden !important; background:#202c39 !important;
        }
        body.rg-phone-mode header > .toolbar-group:first-child { min-width:0; flex:1 1 auto !important; display:grid !important; grid-template-columns:44px minmax(86px,1fr) minmax(86px,1fr); gap:4px !important; border:0 !important; padding:0 !important; }
        body.rg-phone-mode header > .toolbar-group:first-child > .toolbar-group-title,
        body.rg-phone-mode header > .toolbar-group:first-child > button:not(.sidebar-toggle-btn) { display:none !important; }
        body.rg-phone-mode header > .toolbar-group:nth-child(2),
        body.rg-phone-mode header > .toolbar-group:nth-child(3),
        body.rg-phone-mode header .toolbar-spacer > .toolbar-group,
        body.rg-phone-mode header .toolbar-spacer > button:not(:last-child) { display:none !important; }
        body.rg-phone-mode header .toolbar-spacer { flex:0 0 auto !important; margin:0 !important; }
        body.rg-phone-mode header .ctrl-input { width:100% !important; max-width:none !important; min-width:0 !important; min-height:38px !important; height:38px !important; }
        body.rg-phone-mode header .ctrl-btn { min-height:38px !important; height:38px !important; }
        body.rg-phone-mode .grid.view-phone { padding:4px !important; gap:4px !important; background:#17202a !important; }
        body.rg-phone-mode .grid.view-phone .cam-card { border-radius:4px !important; }
        body.rg-phone-mode .sidebar { inset:0 auto 0 0 !important; width:min(82vw,340px) !important; min-width:0 !important; max-width:none !important; height:100dvh !important; padding:max(12px,env(safe-area-inset-top)) 12px max(12px,env(safe-area-inset-bottom)) !important; border:0 !important; border-right:1px solid #2d3e50 !important; border-radius:0 !important; background:#202c39 !important; }
        body.rg-phone-mode .shell-controls { top:max(2px,env(safe-area-inset-top)) !important; left:max(2px,env(safe-area-inset-left)) !important; }
        body.rg-phone-mode .shell-controls button { width:40px !important; min-width:40px !important; height:40px !important; min-height:40px !important; padding:0 !important; border:1px solid #2d3e50 !important; border-radius:4px !important; background:#202c39 !important; color:#fff !important; }
        body.rg-phone-mode .more-menu-pop { inset:auto 0 0 0 !important; max-height:82dvh !important; border-radius:0 !important; border-left:0 !important; border-right:0 !important; border-bottom:0 !important; }
        body.rg-phone-mode .roomgrid-modal { border-radius:0 !important; border-left:0 !important; border-right:0 !important; border-bottom:0 !important; }
        /* v16.2 native Chaturbate Workshop shell */
        body { overflow:hidden !important; }
        .rg-native-header { box-sizing:border-box; height:64px; min-height:64px; display:grid; grid-template-columns:auto minmax(260px,1fr) auto; align-items:center; gap:16px; padding:0 16px; background:#202c39; border-bottom:1px solid #2d3e50; color:#f1f1f1; }
        .rg-native-brand { display:flex; align-items:center; gap:14px; min-width:0; color:#f1f1f1; text-decoration:none; }
        .rg-native-logo { font:700 24px/1 Georgia,serif; letter-spacing:-1.5px; color:#fff; }
        .rg-native-logo-source { display:flex; align-items:center; max-width:150px; max-height:38px; overflow:hidden; }.rg-native-logo-source svg,.rg-native-logo-source img{display:block;max-width:150px;max-height:38px;width:auto;height:auto}
        .rg-native-brand-title { padding-left:14px; border-left:1px solid #2d3e50; font:500 13px/1 UbuntuMedium,UbuntuRegular,Arial,sans-serif; letter-spacing:.05em; }
        .rg-native-header-center { display:grid; grid-template-columns:minmax(140px,220px) auto minmax(150px,260px); justify-content:center; align-items:center; gap:6px; }
        .rg-native-header-actions { display:flex; align-items:center; justify-content:flex-end; gap:6px; }
        .rg-recorder-header-btn { position:relative; }
        .rg-recorder-header-count { display:none; position:absolute; top:-5px; right:-5px; min-width:17px; height:17px; box-sizing:border-box; padding:0 4px; border:2px solid #202c39; border-radius:999px; background:#e5484d; color:#fff; font:700 9px/13px UbuntuMedium,UbuntuRegular,Arial,sans-serif; text-align:center; }
        .rg-recorder-header-count.active { display:block; }
        .rg-native-header .ctrl-input,.rg-native-header .ctrl-btn { height:36px!important; min-height:36px!important; }
        .app-shell { height:calc(100dvh - 64px) !important; gap:0 !important; padding:0 !important; background:#17202a !important; }
        .app-shell > main { border:0 !important; border-radius:0 !important; }
        .top-accent { display:none !important; }
        .rg-native-nav { box-sizing:border-box; min-height:39px!important; height:39px; display:flex!important; align-items:center!important; gap:2px!important; padding:0 8px!important; overflow:visible!important; flex-wrap:nowrap!important; background:#202c39!important; border-bottom:1px solid #2d3e50!important; }
        .rg-native-nav .toolbar-group { min-width:0; height:38px; padding:0 4px!important; gap:3px!important; border:0!important; border-radius:0!important; background:transparent!important; }
        .rg-native-nav .toolbar-group-title { display:none!important; }
        .rg-native-nav .ctrl-btn,.rg-native-nav .ctrl-input,.rg-native-nav .seg { min-height:30px!important; height:30px!important; padding:4px 8px!important; border:0!important; border-radius:0!important; background:transparent!important; color:#b3b3b3!important; }
        .rg-native-nav .ctrl-btn:hover,.rg-native-nav .ctrl-btn:focus-visible { background:#253648!important; color:#fff!important; }
        .rg-native-nav .ctrl-btn.primary,.rg-native-nav .seg button.active { background:#0c6a93!important; color:#fff!important; }
        .rg-visible-count { margin-left:auto; padding:0 8px; color:#b3b3b3; font-size:11px; white-space:nowrap; }
        .rg-following-pager { display:none; align-items:center; gap:6px; margin:0; padding:6px; }
        .rg-following-pager.active { position:fixed; z-index:2147483200; bottom:12px; left:calc(50% + 136px); display:flex; transform:translateX(-50%); border:1px solid #2d3e50; border-radius:4px; background:rgba(23,32,42,.96); box-shadow:0 4px 18px rgba(0,0,0,.34); }
        body.rg-sidebar-collapsed .rg-following-pager.active { left:50%; }
        .rg-following-page-items { display:flex; align-items:center; gap:6px; }
        .rg-following-pager .rg-following-page-btn { box-sizing:border-box; min-width:36px!important; width:36px; height:36px!important; min-height:36px!important; padding:4px!important; justify-content:center; border:1px solid #2d3e50!important; border-radius:4px!important; background:#202c39!important; color:#68b5f0!important; font:500 12px/1 UbuntuMedium,UbuntuRegular,Arial,sans-serif!important; }
        .rg-following-pager .rg-following-page-btn:hover,.rg-following-pager .rg-following-page-btn:focus-visible { border-color:#3b5066!important; background:#253648!important; color:#fff!important; }
        .rg-following-pager .rg-following-page-btn.active { border-color:#0c6a93!important; background:#0c6a93!important; color:#fff!important; }
        .rg-following-pager .rg-following-page-btn:disabled { opacity:.45; cursor:default; }
        .rg-following-page-ellipsis { width:20px; color:#68b5f0; font-size:12px; text-align:center; }
        .sidebar { border:0!important; border-right:1px solid #2d3e50!important; border-radius:0!important; }
        .grid { padding:8px!important; }
        body.rg-online-following .grid { padding-bottom:62px!important; }
        .rg-control-backdrop { position:fixed; inset:0; z-index:2147483600; background:rgba(0,0,0,.56); }
        .rg-control-drawer { position:absolute; top:0; right:0; width:min(360px,92vw); height:100dvh; box-sizing:border-box; display:flex; flex-direction:column; overflow:hidden; background:#202c39; color:#f1f1f1; border-left:1px solid #2d3e50; box-shadow:-12px 0 32px rgba(0,0,0,.34); }
        .rg-control-drawer-head { display:flex; align-items:center; justify-content:space-between; min-height:58px; padding:0 12px; border-bottom:1px solid #2d3e50; }
        .rg-control-drawer-head strong { font-size:15px; }.rg-control-drawer-close { width:34px; height:34px; border:1px solid #2d3e50; border-radius:4px; background:#17202a; color:#fff; font-size:20px; }
        .rg-control-drawer-body { flex:1 1 auto; min-height:0; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; touch-action:pan-y; padding:8px 8px max(8px,env(safe-area-inset-bottom)); }
        .rg-drawer-section { padding:7px 0; border-bottom:1px solid #2d3e50; }.rg-drawer-section:last-child{border-bottom:0}
        .rg-drawer-title { padding:3px 8px 6px; color:#b3b3b3; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
        .rg-drawer-control { display:grid; grid-template-columns:minmax(0,1fr) minmax(110px,150px); align-items:center; gap:10px; min-height:42px; padding:5px 8px; color:#d7d7d7; font-size:12px; }
        .rg-drawer-control > select,.rg-drawer-control > input { width:100%!important; box-sizing:border-box; }
        .rg-control-drawer .menu-pop { position:static!important; inset:auto!important; display:block!important; width:100%!important; min-width:0!important; max-height:none!important; overflow:visible!important; padding:0!important; border:0!important; border-radius:0!important; box-shadow:none!important; background:transparent!important; }
        .rg-control-drawer .menu-pop button { width:100%; min-height:38px; border-radius:3px!important; }
        .cam-card { display:flex!important; flex-direction:column!important; overflow:hidden!important; }
        .cam-media { position:relative; min-width:0; min-height:0; flex:1; overflow:hidden; background:#000; }
        .cam-info { box-sizing:border-box; min-height:48px; display:flex; align-items:center; gap:8px; padding:6px 8px; border-top:1px solid #2d3e50; background:#202c39; }
        .cam-info-copy { min-width:0; flex:1; }.cam-info-name { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#68b5f0; font:500 12px/1.2 UbuntuMedium,UbuntuRegular,Arial,sans-serif; text-decoration:none; }.cam-info-name:hover,.cam-info-name:focus-visible{color:#8bc9f7;text-decoration:underline;outline:none}.cam-info-meta { margin-top:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#b3b3b3; font-size:10px; }
        .cam-info-actions { display:flex; align-items:center; gap:4px; }.cam-info-actions .icon-btn { position:static!important; width:28px!important; height:28px!important; border-radius:3px!important; background:#17202a!important; border:1px solid #2d3e50!important; color:#d7d7d7!important; }
        .cam-info-actions .icon-btn:hover { background:#253648!important;color:#fff!important; }
        .cam-info-actions .favorite-toggle,
        .cam-info-actions .favorite-toggle:hover,
        .cam-info-actions .favorite-toggle.favorite-active { position:static!important; background:#17202a!important; border-color:#2d3e50!important; transform:none!important; }
        .cam-info-actions .favorite-toggle.favorite-active { color:#f59e0b!important; }
        .cam-info-actions .quick-recu { color:#d8a7f0!important; border-color:#6f3e87!important; }
        .cam-info-actions .quick-recu:hover,.cam-info-actions .quick-recu:focus-visible { color:#fff!important; background:#5b2b73!important; border-color:#8d55a5!important; }
        .cam-card .name-label,.cam-card > .pill,.cam-card > .favorite-toggle,.cam-card > .split-toggle { display:none!important; }
        .cam-card .ops-row { top:auto!important; right:6px!important; bottom:52px!important; left:auto!important; transform:none!important; padding:4px!important; border:1px solid #2d3e50!important; border-radius:4px!important; background:#202c39!important; }
        .status-layer { pointer-events:none; }.status-layer .status-retry { pointer-events:auto; margin-top:8px; min-height:32px; padding:5px 10px; border:1px solid #0c6a93; border-radius:3px; background:#0c6a93; color:#fff; cursor:pointer; }
        .rg-mobile-only { display:none!important; }
        .grid.view-split .split-pane .cam-info,
        body.rg-pure-mode .cam-info,
        .cam-card:fullscreen .cam-info { display:none!important; }
        .grid.view-split .split-pane .cam-media,
        body.rg-pure-mode .cam-media,
        .cam-card:fullscreen .cam-media { width:100%; height:100%; flex:1 1 100%; }
        body.rg-pure-mode .rg-native-header { display:none!important; }
        body.rg-pure-mode .app-shell { height:100dvh!important; }
        body.rg-phone-mode .rg-native-header { display:grid!important; height:52px; min-height:52px; grid-template-columns:minmax(0,1fr) auto; gap:6px; padding:max(4px,env(safe-area-inset-top)) 6px 4px 52px!important; overflow:hidden!important; touch-action:auto!important; }
        body.rg-phone-mode .rg-native-logo-source,
        body.rg-phone-mode .rg-native-logo-source svg,
        body.rg-phone-mode .rg-native-logo-source img { max-width:112px; }
        body.rg-phone-mode .rg-native-logo { font-size:18px; }.rg-phone-mode .rg-native-brand-title { padding-left:8px; font-size:11px; }.rg-phone-mode .rg-native-header-center { grid-column:1/-1; display:none; }.rg-phone-mode .rg-native-header-actions .ctrl-btn { width:44px!important; min-width:44px!important; height:44px!important; min-height:44px!important; padding:0!important; overflow:hidden; font-size:0; }
        body.rg-phone-mode .app-shell { height:calc(100dvh - 52px)!important; }
        body.rg-phone-mode .rg-native-nav { height:44px; min-height:44px!important; padding:0 4px 0 46px!important; gap:4px!important; overflow:hidden!important; scrollbar-width:none; }
        body.rg-phone-mode .rg-native-nav::-webkit-scrollbar { display:none; }
        body.rg-phone-mode .rg-native-nav > .toolbar-group:first-child { display:flex!important; flex:0 0 auto!important; grid-template-columns:none!important; }
        body.rg-phone-mode .rg-mobile-only { display:flex!important; }
        body.rg-phone-mode input.rg-mobile-only { display:block!important; flex:1 1 82px; width:auto!important; min-width:72px!important; max-width:108px!important; }
        body.rg-phone-mode .rg-native-nav .roomgrid-compact-select { flex:0 0 86px!important; width:86px!important; min-width:86px!important; max-width:86px!important; }
        body.rg-phone-mode .rg-native-nav .ctrl-btn:not(.sidebar-toggle-btn):not(.rg-mobile-only):not(.rg-following-page-btn) { display:none!important; }
        body.rg-phone-mode .rg-visible-count { display:none!important; }
        body.rg-phone-mode .rg-following-pager.active { right:auto; bottom:max(6px,env(safe-area-inset-bottom)); left:50%; display:flex!important; max-width:calc(100vw - 8px); min-height:36px; gap:3px; padding:4px; }
        body.rg-phone-mode .rg-following-page-items { gap:3px; }
        body.rg-phone-mode .rg-following-pager .rg-following-page-btn { display:inline-flex!important; width:30px!important; min-width:30px!important; height:30px!important; min-height:30px!important; padding:2px!important; }
        body.rg-phone-mode .rg-following-page-ellipsis { width:14px; }
        body.rg-phone-mode .grid.view-phone { grid-template-columns:minmax(0,1fr)!important; }
        body.rg-phone-mode.rg-online-following .grid.view-phone { grid-template-columns:repeat(2,minmax(0,1fr))!important; }
        body.rg-phone-mode.rg-card-menu-open .grid.view-phone { overflow:hidden!important; overscroll-behavior:none!important; touch-action:none!important; }
        .card-ops-menu-backdrop { position:fixed; inset:0; z-index:2147483650; display:flex; align-items:flex-end; box-sizing:border-box; padding-top:calc(96px + env(safe-area-inset-top)); background:rgba(0,0,0,.56); overscroll-behavior:none; touch-action:none; }
        .card-ops-menu-pop { max-height:calc(100dvh - 16px); overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; }
        body.rg-phone-mode .card-ops-menu-backdrop .card-ops-menu-pop { position:relative!important; inset:auto!important; box-sizing:border-box; width:100%!important; min-width:0!important; max-height:calc(100dvh - 96px - env(safe-area-inset-top))!important; margin:0!important; padding:6px 6px max(8px,env(safe-area-inset-bottom))!important; overflow-x:hidden!important; overflow-y:auto!important; overscroll-behavior:contain!important; -webkit-overflow-scrolling:touch; touch-action:pan-y; border-right:0!important; border-bottom:0!important; border-left:0!important; border-radius:0!important; }
        body.rg-phone-mode .cam-info { min-height:46px; }.rg-phone-mode .cam-info-name{font-size:12px}.rg-phone-mode .cam-info-actions .icon-btn{width:32px!important;height:32px!important}
        body.rg-phone-mode .rg-control-drawer { width:100vw; border-left:0; }
        body.rg-phone-mode .rg-control-drawer .menu-pop.more-menu-pop { position:static!important; inset:auto!important; width:100%!important; min-width:0!important; max-height:none!important; overflow:visible!important; border-radius:0!important; box-shadow:none!important; }
        body.rg-control-drawer-open .grid { overflow:hidden!important; overscroll-behavior:none!important; touch-action:none!important; }
        .sidebar .group-tab.new-group-tab { color:#f1f1f1!important; border-color:#3b5066!important; }
        .sidebar .group-tab.new-group-tab:hover,.sidebar .group-tab.new-group-tab:focus-visible { background:#253648!important; color:#fff!important; }
        .shell-controls { top:72px!important; right:auto!important; left:8px!important; }
        body.rg-phone-mode .shell-controls { top:56px!important; left:max(4px,env(safe-area-inset-left))!important; }
        @media (orientation:landscape) and (max-height:600px) {
          body.rg-phone-mode .grid.view-phone { grid-template-columns:repeat(2,minmax(0,1fr))!important; }
          body.rg-phone-mode .card-ops-menu-backdrop .card-ops-menu-pop { max-height:calc(100dvh - 90px - env(safe-area-inset-top))!important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cam-card, .ctrl-btn, .icon-btn, .group-tab, .menu-pop, .mc-tooltip { transition:none !important; animation:none !important; }
        }
      `),
    }));

    // ---- 布局骨架 ----
    const sidebar = $('aside', { class: 'sidebar', style: {
      width: '248px', background: 'linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.78))', border: '1px solid var(--border)',
      borderRadius: '18px', padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px',
      flexShrink: '0', transition: 'width .2s, padding .2s', boxShadow: 'var(--shadow-md)',
    } });

    const nativeHeaderCenter = $('div', { class: 'rg-native-header-center' });
    const nativeHeaderActions = $('div', { class: 'rg-native-header-actions' });
    const nativeHeader = $('header', { class: 'rg-native-header' }, [
      $('a', { class: 'rg-native-brand', href: location.origin + '/', title: 'Back to Chaturbate' }, [
        nativeLogoNode || $('span', { class: 'rg-native-logo' }, 'Chaturbate'),
        $('span', { class: 'rg-native-brand-title' }, 'WORKSHOP'),
      ]),
      nativeHeaderCenter,
      nativeHeaderActions,
    ]);
    const main = $('main', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '0', background: 'linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.72))', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' } });
    const topAccent = $('div', { class: 'top-accent' });
    const toolbar = $('header', { class: 'rg-native-nav', style: {
      padding: '14px 16px', background: 'transparent',
      borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center',
      flexWrap: 'nowrap', flexShrink: '0', overflowX: 'auto', overflowY: 'hidden',
    } });
    const grid = $('section', { class: 'grid view-grid', style: {
      flex: '1', overflowY: 'auto', padding: '16px',
    } });

    main.append(topAccent, toolbar, grid);
    document.body.append(nativeHeader, $('div', { class: 'app-shell' }, [sidebar, main]));

    const toastHost = $('div', { style: { position: 'fixed', right: '16px', top: '16px', zIndex: '1000000', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none' } });
    document.body.appendChild(toastHost);
    function toast(msg) {
      const el = $('div', { style: { maxWidth: '360px', background: 'rgba(17,24,39,.88)', color: '#fff', padding: '9px 12px', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '12px', lineHeight: '1.35' } }, String(msg || ''));
      toastHost.appendChild(el);
      setTimeout(() => { try { el.style.opacity = '0'; el.style.transform = 'translateY(-4px)'; el.style.transition = 'opacity .18s, transform .18s'; } catch (_) {} }, 2200);
      setTimeout(() => { try { el.remove(); } catch (_) {} }, 2600);
    }

    function installHintSystem() {
      let tooltip = null;
      let timer = 0;
      let activeEl = null;

      const autoText = (el) => {
        if (!el) return '';
        const explicit = el.dataset?.hint || el.getAttribute?.('aria-label') || el.title;
        if (explicit) return explicit;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.placeholder || '';
        if (el.tagName === 'SELECT') return el.title || t('hintSort');
        if (el.tagName === 'BUTTON') return (el.textContent || '').replace(/\s+/g, ' ').trim();
        return '';
      };

      const ensure = (el) => {
        const text = autoText(el);
        if (text) setElementHint(el, text);
        return text;
      };

      const fill = (root = document.body) => {
        try {
          root.querySelectorAll('button,input,select,textarea,[title]').forEach(el => ensure(el));
        } catch (_) {}
      };

      const hide = () => {
        clearTimeout(timer);
        timer = 0;
        activeEl = null;
        if (tooltip) { try { tooltip.remove(); } catch (_) {} tooltip = null; }
      };

      const show = (el) => {
        if (!el || el.disabled || document.body.classList.contains('rg-pure-mode')) return;
        const text = ensure(el);
        if (!text) return;
        if (!tooltip) tooltip = $('div', { class: 'mc-tooltip' });
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        const rect = el.getBoundingClientRect();
        const tw = Math.min(tooltip.offsetWidth || 240, window.innerWidth - 24);
        let left = Math.max(8, Math.min(window.innerWidth - tw - 8, rect.left + rect.width / 2 - tw / 2));
        let top = rect.bottom + 8;
        if (top + (tooltip.offsetHeight || 32) > window.innerHeight - 8) top = Math.max(8, rect.top - (tooltip.offsetHeight || 32) - 8);
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        requestAnimationFrame(() => tooltip?.classList.add('show'));
      };

      const schedule = (el) => {
        clearTimeout(timer);
        activeEl = el;
        timer = setTimeout(() => show(el), 420);
      };

      document.addEventListener('pointerover', (e) => {
        const el = e.target?.closest?.('button,input,select,textarea,[data-hint],[title]');
        if (!el || el === activeEl) return;
        schedule(el);
      }, true);
      document.addEventListener('pointerout', (e) => {
        if (!activeEl) return;
        if (!activeEl.contains(e.relatedTarget)) hide();
      }, true);
      document.addEventListener('focusin', (e) => {
        const el = e.target?.closest?.('button,input,select,textarea,[data-hint],[title]');
        if (el) schedule(el);
      }, true);
      document.addEventListener('focusout', hide, true);
      document.addEventListener('click', hide, true);
      window.addEventListener('scroll', hide, true);
      try {
        const mo = new MutationObserver(ms => {
          for (const m of ms) for (const n of m.addedNodes || []) if (n.nodeType === 1) fill(n);
        });
        mo.observe(document.body, { childList: true, subtree: true });
      } catch (_) {}
      fill(document.body);
    }
    installHintSystem();

    function installWheelInputGuard() {
      const isGuarded = (el) => {
        if (!el || !el.closest) return false;
        const target = el.closest('input, select, textarea');
        if (!target) return false;
        const tag = target.tagName;
        const type = String(target.getAttribute('type') || '').toLowerCase();
        return tag === 'SELECT' || type === 'range' || type === 'number';
      };
      document.addEventListener('wheel', (e) => {
        if (!isGuarded(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        const target = e.target.closest('input, select, textarea');
        // 浏览器默认会用滚轮改 range / number / select 的值，进而触发整页重排；这里直接阻断。
        try { target.blur(); } catch (_) {}
      }, { capture: true, passive: false });
    }
    installWheelInputGuard();

    const recordings = UnifiedRecorder.recordings;
    const recordingLog = [];
    const pureExitChip = $('button', {
      class: 'pure-exit-chip',
      title: t('pureExitHint'),
      onclick: () => setPureMode(false),
    }, t('pureExitChip'));
    document.body.appendChild(pureExitChip);

    const shellControls = $('div', { class: 'shell-controls' });
    function setSidebarCollapsed(nextCollapsed) {
      const collapsed = !!nextCollapsed;
      document.body.classList.toggle('rg-sidebar-collapsed', collapsed);
      sidebar.classList.toggle('is-collapsed', collapsed);
      store.patchSettings({ sidebarCollapsed: collapsed });
    }

    const showToolbarBtn = $('button', {
      class: 'show-toolbar-btn',
      type: 'button',
      title: LANG === 'zh' ? '显示顶部工具栏' : 'Show toolbar',
      onclick: () => { document.body.classList.remove('rg-toolbar-collapsed'); store.patchSettings({ toolbarCollapsed: false }); },
    }, LANG === 'zh' ? '工具' : 'Tools');
    const showSidebarBtn = $('button', {
      class: 'show-sidebar-btn',
      type: 'button',
      title: LANG === 'zh' ? '显示左侧分组' : 'Show sidebar',
      'aria-label': LANG === 'zh' ? '显示左侧分组' : 'Show groups menu',
      onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(false); },
    }, LANG === 'zh' ? '分组' : 'Groups');
    shellControls.append(showToolbarBtn, showSidebarBtn);
    document.body.appendChild(shellControls);
    function syncShellControls() {
      if (!shellControls) return;
      const hidden = !!store.state.settings.pureMode || !!store.state.settings.splitViewActive;
      shellControls.style.display = !hidden && !!store.state.settings.toolbarCollapsed ? 'flex' : 'none';
    }

    let pureCursorTimer = 0;
    function closeTransientUi() {
      document.querySelectorAll('.menu-pop,.mc-tooltip').forEach(el => { try { el.remove(); } catch (_) {} });
    }
    function applyPureModeState() {
      const on = !!store.state.settings.pureMode;
      const splitOn = !!store.state.settings.splitViewActive && !on;
      const phoneOn = store.state.settings.viewMode === 'phone' && !on && !splitOn;
      const focusOn = store.state.settings.viewMode === 'focus' && !on && !splitOn;
      const thumbsCollapsed = !!store.state.settings.focusThumbsCollapsed;
      const videoFit = store.state.settings.videoFit === 'cover' ? 'cover' : 'contain';
      document.body.classList.toggle('rg-pure-mode', on);
      document.body.classList.toggle('rg-toolbar-collapsed', !!store.state.settings.toolbarCollapsed && !on);
      document.body.classList.toggle('rg-sidebar-collapsed', !!store.state.settings.sidebarCollapsed && !on);
      document.body.classList.toggle('rg-focus-thumbs-collapsed', thumbsCollapsed);
      document.body.classList.toggle('rg-video-cover', videoFit === 'cover');
      document.body.classList.toggle('rg-video-contain', videoFit !== 'cover');
      document.body.classList.toggle('rg-focus-mode', focusOn);
      document.body.classList.toggle('rg-phone-mode', phoneOn);
      document.body.classList.toggle('rg-split-mode', splitOn);
      const hideSidebar = splitOn || on || focusOn || !!store.state.settings.sidebarCollapsed;
      sidebar.style.setProperty('display', hideSidebar ? 'none' : 'flex', 'important');
      if (splitOn) requestAnimationFrame(() => window.scrollTo(0, 0));
      syncShellControls?.();
      document.body.classList.remove('pure-cursor-hidden');
      setElementHint(pureExitChip, t('pureExitHint'));
      pureExitChip.textContent = t('pureExitChip');
      if (typeof pureModeBtn !== 'undefined' && pureModeBtn) {
        setTrustedHtml(pureModeBtn, trustedHtml(iconLabel('clean', on ? t('pureModeOff') : t('pureMode'))));
        pureModeBtn.classList.toggle('primary', on);
        setElementHint(pureModeBtn, on ? t('pureModeOff') + ' · Alt+P/C' : t('pureModeHint'));
      }
      if (typeof focusThumbToggleBtn !== 'undefined' && focusThumbToggleBtn) {
        setTrustedHtml(focusThumbToggleBtn, trustedHtml(iconLabel('grid', thumbsCollapsed ? t('focusThumbsShow') : t('focusThumbsHide'))));
        focusThumbToggleBtn.classList.toggle('primary', !thumbsCollapsed && store.state.settings.viewMode === 'focus');
        setElementHint(focusThumbToggleBtn, t('focusThumbsHint'));
      }
      if (typeof videoFitBtn !== 'undefined' && videoFitBtn) {
        setTrustedHtml(videoFitBtn, trustedHtml(iconLabel('expand', videoFit === 'cover' ? t('videoFitCover') : t('videoFitContain'))));
        videoFitBtn.classList.toggle('primary', videoFit === 'cover');
        setElementHint(videoFitBtn, t('videoFitHint'));
      }
      if (typeof splitViewBtn !== 'undefined' && splitViewBtn) syncSplitButton();
      if (on) closeTransientUi();
      requestAnimationFrame(() => { applyGridSize(); applyFocusMainSizing(); });
    }
    function setPureMode(on) {
      store.patchSettings({ pureMode: !!on });
      if (on) toast(t('pureModeOn') + ' · Alt+P/C / Esc');
    }
    function togglePureMode() { setPureMode(!store.state.settings.pureMode); }
    function toggleFocusThumbs() { store.patchSettings({ focusThumbsCollapsed: !store.state.settings.focusThumbsCollapsed }); }
    function toggleVideoFit() { store.patchSettings({ videoFit: store.state.settings.videoFit === 'cover' ? 'contain' : 'cover' }); }
    function bumpPureCursor() {
      if (!store.state.settings.pureMode) return;
      document.body.classList.remove('pure-cursor-hidden');
      clearTimeout(pureCursorTimer);
      pureCursorTimer = setTimeout(() => {
        if (store.state.settings.pureMode) document.body.classList.add('pure-cursor-hidden');
      }, 1800);
    }
    document.addEventListener('mousemove', bumpPureCursor, true);
    document.addEventListener('pointerdown', bumpPureCursor, true);

    const patchSettingsSoft = (() => {
      let pending = {};
      const flush = debounce(() => {
        const patch = pending;
        pending = {};
        if (Object.keys(patch).length) store.patchSettings(patch);
      }, 180);
      return (patch) => { Object.assign(pending, patch || {}); flush(); };
    })();

    // ---- Toolbar 渲染 ----
    const tbInput = $('input', {
      class: 'ctrl-input', placeholder: t('addPlaceholder'), title: t('hintAddInput'),
      style: { width: '200px' },
      onpaste: (e) => {
        setTimeout(() => {
          const raw = String(e.target.value || '');
          const parts = raw.split(/[\s,;，；]+/).map(x => x.trim()).filter(Boolean);
          if (parts.length <= 1) return;
          const r = importUsernameList(parts);
          e.target.value = '';
          toast(t('manualImportDone', r.added, r.exists));
        }, 0);
      },
      onkeypress: (e) => {
        if (e.key === 'Enter') {
          const v = normalizeUsername(e.target.value);
          if (!v) return;
          if (!isLikelyUsername(v)) { toast(t('invalidUsername')); return; }
          if (store.addRoom(v)) service.start(v);
          e.target.value = '';
        }
      },
    });

    const searchInput = $('input', {
      class: 'ctrl-input',
      placeholder: t('searchPlaceholder'), title: t('hintSearchInput'),
      value: store.state.settings.searchQuery || '',
      style: { width: '150px' },
      oninput: debounce((e) => store.patchSettings({ searchQuery: normalizeUsername(e.target.value), pageIndex: 0 }), 80),
    });

    const tempUrlBtn = $('button', {
      class: 'ctrl-btn',
      title: LANG === 'zh' ? '导入临时 URL，刷新后消失，不保存到配置' : 'Import temporary URLs; they disappear after refresh',
      onclick: () => importTemporaryUrls(),
    }, LANG === 'zh' ? '导入URL' : 'URL');

    const mkToggle = (label, key, sub = false) => {
      const cb = $('input', { type: 'checkbox', checked: sub ? store.state.settings.filter[key] : store.state.settings[key],
        onchange: (e) => sub ? store.update(s => { s.settings.filter[key] = e.target.checked; s.settings.pageIndex = 0; }, 'settings') : store.patchSettings({ [key]: e.target.checked, pageIndex: 0 }) });
      return $('label', { class: 'toggle', title: String(label).replace(/^[^\p{L}\p{N}]+/u, '').trim() || String(label) }, [cb, label]);
    };

    function filterModeFromState() {
      const f = store.state.settings.filter || {};
      if (f.onlyOnline) return 'online';
      if (f.hideOffline && f.hidePrivate) return 'hideOfflinePrivate';
      if (f.hideOffline) return 'hideOffline';
      if (f.hidePrivate) return 'hidePrivate';
      return 'all';
    }
    function applyFilterMode(mode) {
      const next = { hideOffline: false, hidePrivate: false, onlyOnline: false };
      if (mode === 'online') next.onlyOnline = true;
      else if (mode === 'hideOffline') next.hideOffline = true;
      else if (mode === 'hidePrivate') next.hidePrivate = true;
      else if (mode === 'hideOfflinePrivate') { next.hideOffline = true; next.hidePrivate = true; }
      store.update(s => { Object.assign(s.settings.filter, next); s.settings.pageIndex = 0; }, 'settings:filter,pageIndex');
    }
    const filterSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: LANG === 'zh' ? '筛选当前分组' : 'Filter current group',
      onchange: (e) => applyFilterMode(e.target.value),
    }, [
      $('option', { value: 'all' }, LANG === 'zh' ? '全部状态' : 'All status'),
      $('option', { value: 'online' }, t('onlyOnline')),
      $('option', { value: 'hideOffline' }, t('hideOffline')),
      $('option', { value: 'hidePrivate' }, t('hidePrivate')),
      $('option', { value: 'hideOfflinePrivate' }, LANG === 'zh' ? '隐藏离线/私密' : 'Hide offline/private'),
    ]);
    filterSel.value = filterModeFromState();

    const sortSel = $('select', {
      class: 'ctrl-input',
      title: t('hintSort'),
      style: { padding: '6px 8px' },
      onchange: (e) => store.patchSettings({ sortBy: e.target.value, pageIndex: 0 }),
    }, [
      $('option', { value: 'manual' }, t('sortManual')),
      $('option', { value: 'status' }, t('sortStatus')),
      $('option', { value: 'name' }, t('sortName')),
      $('option', { value: 'favoriteName' }, t('sortFavoriteName')),
      $('option', { value: 'addedAt' }, t('sortAdded')),
    ]);
    sortSel.value = store.state.settings.sortBy;

    const refreshAllBtn = $('button', {
      class: 'ctrl-btn primary',
      title: t('refreshAll') + ' · R',
      style: { cursor: 'pointer' },
      onclick: refreshAllSources,
      html: trustedHtml(iconLabel('refresh', t('refreshAll'))),
    });

    const sidebarToggleBtn = $('button', {
      class: 'ctrl-btn sidebar-toggle-btn',
      type: 'button',
      title: t('hintSidebarToggle'),
      'aria-label': LANG === 'zh' ? '切换分组菜单' : 'Toggle groups menu',
      style: { cursor: 'pointer', minWidth: '38px', padding: '6px 10px' },
      onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(!store.state.settings.sidebarCollapsed); },
      html: trustedHtml(iconSvg('menu', 16)),
    });

    const toolbarCollapseBtn = $('button', {
      class: 'ctrl-btn',
      title: LANG === 'zh' ? '收起顶部工具栏' : 'Collapse toolbar',
      style: { cursor: 'pointer', minWidth: '38px', padding: '6px 10px' },
      onclick: () => store.patchSettings({ toolbarCollapsed: true }),
    }, LANG === 'zh' ? '收起' : 'Hide');

    // —— 视图模式：使用 select 减少顶部按钮数量 —— //
    function setViewMode(mode) {
      if (mode === 'phone') {
        store.patchSettings({ viewMode: 'phone', phoneModeAuto: true, sidebarCollapsed: true });
        return;
      }
      const phoneOverride = phoneEnvironment ? { phoneModeAuto: false } : {};
      if (mode !== 'focus') { store.patchSettings({ viewMode: 'grid', ...phoneOverride }); return; }
      if (!store.state.settings.focusedRoomId) {
        const vr = renderVisibleRooms();
        const first = vr.find(r => r.lastStatus === 'online') || vr[0];
        if (first) store.patchSettings({ viewMode: 'focus', focusedRoomId: first.id, focusThumbsCollapsed: false, ...phoneOverride });
        else store.patchSettings({ viewMode: 'focus', focusThumbsCollapsed: false, ...phoneOverride });
      } else {
        store.patchSettings({ viewMode: 'focus', focusThumbsCollapsed: false, ...phoneOverride });
      }
    }
    const viewModeSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: t('viewModeLabel') + ' · G/F',
      onchange: (e) => setViewMode(e.target.value),
    }, [
      $('option', { value: 'grid' }, t('viewGrid')),
      $('option', { value: 'focus' }, t('viewFocus')),
      $('option', { value: 'phone' }, t('viewPhone')),
    ]);
    function syncViewSeg() {
      viewModeSel.value = ['grid', 'focus', 'phone'].includes(store.state.settings.viewMode) ? store.state.settings.viewMode : 'grid';
    }
    syncViewSeg();

    const layoutSel = $('select', {
      class: 'ctrl-input roomgrid-compact-select',
      title: t('visibleRooms'),
      onchange: (e) => {
        const key = store.state.settings.viewMode === 'phone' ? 'phoneLayoutSize' : 'layoutSize';
        store.patchSettings({ [key]: Number(e.target.value), pageIndex: 0 });
      },
    }, [2, 4, 6, 9].map(n => $('option', { value: String(n) }, LANG === 'zh' ? `单屏 ${n}` : `${n} visible`)));
    layoutSel.value = String(store.state.settings.layoutSize || 4);

    // 全局音量
    const volSlider = $('input', {
      type: 'range', min: '0', max: '100', value: String(store.state.settings.volume * 100), title: t('hintVolume'),
      style: { width: '90px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const v = Number(e.target.value) / 100;
        store.state.settings.volume = v;
        patchSettingsSoft({ volume: v });
        requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
      },
      onchange: (e) => store.patchSettings({ volume: Number(e.target.value) / 100 }),
    });
    const volLabel = $('span', { style: { fontSize: '14px', color: 'var(--text-muted)', display:'inline-flex', alignItems:'center' }, html: trustedHtml(iconSvg('volume', 15)) });

    // 网格大小
    const sizeSlider = $('input', {
      type: 'range', min: '220', max: '900', value: String(store.state.settings.gridSize), title: t('hintGridSize'),
      style: { width: '110px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const gridSize = parseInt(e.target.value, 10);
        store.state.settings.gridSize = gridSize;
        patchSettingsSoft({ gridSize });
        applyGridSize();
      },
      onchange: (e) => store.patchSettings({ gridSize: parseInt(e.target.value, 10) }),
    });

    const focusScaleSlider = $('input', {
      type: 'range', min: '78', max: '94', value: String(store.state.settings.focusMainPct || 84),
      title: t('hintMainRatio'),
      style: { width: '95px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const focusMainPct = parseInt(e.target.value, 10);
        store.state.settings.focusMainPct = focusMainPct;
        patchSettingsSoft({ focusMainPct });
        applyGridSize();
        applyFocusMainSizing();
      },
      onchange: (e) => store.patchSettings({ focusMainPct: parseInt(e.target.value, 10) }),
    });

    const focusAspectSel = $('select', {
      class: 'ctrl-input',
      title: t('hintMainAspect'),
      style: { padding: '6px 8px', width: '86px' },
      onchange: (e) => {
        store.patchSettings({ focusAspect: e.target.value });
        applyFocusMainSizing();
      },
    }, [
      $('option', { value: 'auto' }, LANG === 'zh' ? '自适应' : 'Auto'),
      $('option', { value: '16:9' }, '16:9'),
      $('option', { value: '4:3' }, '4:3'),
      $('option', { value: '1:1' }, '1:1'),
      $('option', { value: '9:16' }, '9:16'),
    ]);
    focusAspectSel.value = store.state.settings.focusAspect || 'auto';

    const focusThumbSlider = $('input', {
      type: 'range', min: '96', max: '260', value: String(store.state.settings.focusThumbSize || 150),
      title: t('hintThumbSize'),
      style: { width: '80px', cursor: 'pointer', accentColor: 'var(--accent)' },
      oninput: (e) => {
        const focusThumbSize = parseInt(e.target.value, 10);
        store.state.settings.focusThumbSize = focusThumbSize;
        patchSettingsSoft({ focusThumbSize });
        applyGridSize();
      },
      onchange: (e) => store.patchSettings({ focusThumbSize: parseInt(e.target.value, 10) }),
    });

    const focusThumbToggleBtn = $('button', {
      class: 'ctrl-btn',
      title: t('focusThumbsHint'),
      style: { cursor: 'pointer' },
      onclick: () => toggleFocusThumbs(),
      html: trustedHtml(iconLabel('grid', t('focusThumbsHide'))),
    });

    const videoFitBtn = $('button', {
      class: 'ctrl-btn',
      title: t('videoFitHint'),
      style: { cursor: 'pointer' },
      onclick: () => toggleVideoFit(),
      html: trustedHtml(iconLabel('expand', t('videoFitContain'))),
    });

    const pureModeBtn = $('button', {
      class: 'ctrl-btn',
      title: t('pureModeHint'),
      style: { cursor: 'pointer' },
      onclick: () => togglePureMode(),
      html: trustedHtml(iconLabel('clean', t('pureMode'))),
    });

    const splitViewBtn = $('button', {
      class: 'ctrl-btn',
      title: t('splitView'),
      style: { cursor: 'pointer' },
      onclick: () => openSplitViewOrPicker(),
      html: trustedHtml(iconLabel('split', t('splitView'))),
    });
    function syncSplitButton() {
      const count = store.state.settings.splitRoomIds.length;
      setTrustedHtml(splitViewBtn, trustedHtml(iconLabel('split', `${t('splitView')} ${count}/2`)));
      splitViewBtn.classList.toggle('primary', !!store.state.settings.splitViewActive);
      setElementHint(splitViewBtn, count === 2 ? t('splitView') : t('splitNeedTwo'));
    }
    syncSplitButton();

    // 通知开关
    const notifyToggle = $('label', { class: 'toggle', title: t('notifyTitle') }, [
      $('input', {
        type: 'checkbox', checked: store.state.settings.notifyOnline,
        onchange: async (e) => {
          if (e.target.checked) {
            const ok = await Notify.request();
            if (!ok) alert(t('permDenied'));
          }
          store.patchSettings({ notifyOnline: e.target.checked });
        },
      }), t('notifyOnline'),
    ]);

    function importUsernameList(usernames) {
      const clean = [...new Set((usernames || [])
        .map(u => normalizeUsername(u))
        .filter(isLikelyUsername))];
      let added = 0, exists = 0;
      clean.forEach(u => {
        const hadRoom = !!store.state.rooms.find(r => r.id === u);
        if (store.addRoom(u)) {
          if (!hadRoom) service.start(u);
          added++;
        } else {
          exists++;
        }
      });
      return { added, exists, total: clean.length };
    }

    function openManualImportPrompt() {
      closeTransientUi();
      const backdrop = $('div', { class: 'roomgrid-modal-backdrop' });
      const panel = $('div', { class: 'roomgrid-modal' });
      const title = $('div', { class: 'roomgrid-modal-title' }, t('manualImport'));
      const hint = $('div', { class: 'roomgrid-modal-hint' }, t('manualImportPrompt'));
      const ta = $('textarea', {
        class: 'roomgrid-modal-textarea',
        placeholder: LANG === 'zh' ? 'alice\nbob\ncarol' : 'alice\nbob\ncarol',
      });
      const countEl = $('div', { class: 'roomgrid-modal-count' }, '0');
      let escHandler = null;
      const close = () => {
        if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
        try { backdrop.remove(); } catch (_) {}
      };
      const parse = () => String(ta.value || '').split(/[\s,;，；]+/).map(s => s.trim()).filter(Boolean);
      const update = () => {
        const count = [...new Set(parse().map(u => normalizeUsername(u)).filter(isLikelyUsername))].length;
        countEl.textContent = LANG === 'zh' ? `可添加 ${count} 个用户名` : `${count} valid usernames`;
      };
      const cancel = $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel'));
      const apply = $('button', {
        class: 'ctrl-btn primary',
        onclick: () => {
          const r = importUsernameList(parse());
          close();
          toast(t('manualImportDone', r.added, r.exists));
        },
      }, LANG === 'zh' ? '添加' : 'Add');
      ta.addEventListener('input', update);
      panel.append(title, hint, ta, countEl, $('div', { class: 'roomgrid-modal-actions' }, [cancel, apply]));
      backdrop.appendChild(panel);
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
      escHandler = (ev) => {
        if (ev.key === 'Escape') close();
      };
      document.addEventListener('keydown', escHandler);
      document.body.appendChild(backdrop);
      update();
      setTimeout(() => ta.focus(), 0);
    }

    // 批量添加按钮：只处理用户粘贴的用户名，不再抓取 followed-cams。
    const manualImportBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer' },
      title: t('manualImport'),
      onclick: openManualImportPrompt,
    }, t('manualImport'));

    // 更多菜单按钮（含语言切换、关于、捐赠）
    const moreBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer', minWidth: '40px', padding: '6px 12px' },
      title: t('hintMoreMenu'),
      onclick: (e) => openMoreMenu(e.currentTarget),
    }, t('moreMenu'));

    const settingsBtn = $('button', {
      class: 'ctrl-btn',
      style: { cursor: 'pointer' },
      title: t('settingsCenterHint'),
      html: trustedHtml(iconLabel('settings', t('settingsCenter'))),
      onclick: () => openSettingsCenter(),
    });
    const recorderHeaderBtn = $('button', {
      class: 'ctrl-btn rg-recorder-header-btn',
      style: { cursor: 'pointer' },
      title: t('recorderOpenHub'),
      'aria-label': t('recorderOpenHub'),
      html: trustedHtml(iconLabel('record', t('recordingCenter'))),
      onclick: () => UnifiedRecorder.openHub(true),
    });
    const recorderHeaderCount = $('span', { class: 'rg-recorder-header-count', 'aria-hidden': 'true' });
    recorderHeaderBtn.appendChild(recorderHeaderCount);
    function syncRecorderHeaderButton() {
      const count = UnifiedRecorder.countActive();
      recorderHeaderCount.textContent = String(count);
      recorderHeaderCount.classList.toggle('active', count > 0);
      recorderHeaderBtn.title = count > 0 ? `${t('recorderOpenHub')} · ${count}` : t('recorderOpenHub');
    }
    UnifiedRecorder.subscribe(syncRecorderHeaderButton);
    syncRecorderHeaderButton();

    // 横向分隔条：使用 var(--border) 而非硬编码
    const toolbarGroup = (children, style = {}, compact = false) => $('div', { class: 'toolbar-group' + (compact ? ' compact' : ''), style }, children);
    const lbl = (text) => $('span', { style: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' } }, text);

    const groupTitle = (text) => $('span', { class: 'toolbar-group-title' }, text);
    const visibleCountEl = $('span', { class: 'rg-visible-count', 'aria-live': 'polite' });
    const followingPrevBtn = $('button', {
      class: 'ctrl-btn rg-following-page-btn', type: 'button', title: LANG === 'zh' ? '上一页' : 'Previous page',
      onclick: () => setOnlineFollowingPage(currentOnlineFollowingPage() - 1),
    }, '‹');
    const followingPageItems = $('div', { class: 'rg-following-page-items', 'aria-live': 'polite' });
    const followingNextBtn = $('button', {
      class: 'ctrl-btn rg-following-page-btn', type: 'button', title: LANG === 'zh' ? '下一页' : 'Next page',
      onclick: () => setOnlineFollowingPage(currentOnlineFollowingPage() + 1),
    }, '›');
    const followingPager = $('nav', { class: 'rg-following-pager', 'aria-label': LANG === 'zh' ? '正在直播的关注分页' : 'Online Following pages' }, [followingPrevBtn, followingPageItems, followingNextBtn]);
    const mobileAddBtn = $('button', {
      class: 'ctrl-btn primary rg-mobile-only',
      type: 'button',
      title: t('manualImport'),
      onclick: openManualImportPrompt,
    }, LANG === 'zh' ? '添加' : 'Add');
    const mobileSearchInput = $('input', {
      class: 'ctrl-input rg-mobile-only',
      type: 'search',
      placeholder: LANG === 'zh' ? '搜索' : 'Search',
      value: store.state.settings.searchQuery || '',
      oninput: debounce((event) => {
        searchInput.value = event.target.value;
        store.patchSettings({ searchQuery: normalizeUsername(event.target.value), pageIndex: 0 });
      }, 80),
    });
    nativeHeaderCenter.append(tbInput, tempUrlBtn, searchInput);
    // Settings and maintenance now share the organized sidebar Menu. Keeping
    // only the live recorder indicator here removes the duplicated controls.
    nativeHeaderActions.append(recorderHeaderBtn);
    toolbar.append(
      toolbarGroup([sidebarToggleBtn, groupTitle(LANG === 'zh' ? '分组' : 'Groups')]),
      mobileAddBtn,
      mobileSearchInput,
      toolbarGroup([groupTitle(LANG === 'zh' ? '视图' : 'View'), viewModeSel, splitViewBtn, layoutSel], {}, true),
      refreshAllBtn,
      followingPager,
      visibleCountEl,
    );

    function onlineFollowingPageSize() {
      return (phoneEnvironment || store.state.settings.viewMode === 'phone')
        ? ONLINE_FOLLOWING_MOBILE_PAGE_SIZE
        : ONLINE_FOLLOWING_PAGE_SIZE;
    }
    function layoutSize() {
      if (store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID) return onlineFollowingPageSize();
      const key = store.state.settings.viewMode === 'phone' ? 'phoneLayoutSize' : 'layoutSize';
      const n = Number(store.state.settings[key] || (key === 'phoneLayoutSize' ? 2 : 4));
      return [2, 4, 6, 9].includes(n) ? n : 4;
    }
    function layoutShape() {
      const n = layoutSize();
      const portrait = window.matchMedia?.('(orientation: portrait)')?.matches || grid.clientHeight > grid.clientWidth;
      if (n === 2) return portrait ? { cols: 1, rows: 2 } : { cols: 2, rows: 1 };
      if (n === 6) return portrait ? { cols: 2, rows: 3 } : { cols: 3, rows: 2 };
      if (n === 9) return { cols: 3, rows: 3 };
      return { cols: 2, rows: 2 };
    }
    function fullVisibleRooms() { return visibleRooms(); }
    function onlineFollowingPageInfo(list = fullVisibleRooms()) {
      const pageSize = onlineFollowingPageSize();
      const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
      const requested = clampInt(store.state.settings.onlineFollowingPageIndex, 0, 100000, 0);
      const page = Math.min(requested, totalPages - 1);
      return { page, pageSize, totalPages, total: list.length };
    }
    function currentOnlineFollowingPage() {
      return onlineFollowingPageInfo().page;
    }
    function renderVisibleRooms() {
      const list = fullVisibleRooms();
      if (store.state.settings.activeGroup !== ONLINE_FOLLOWING_GROUP_ID) return list;
      const { page, pageSize } = onlineFollowingPageInfo(list);
      const start = page * pageSize;
      return list.slice(start, start + pageSize);
    }
    function setOnlineFollowingPage(rawPage) {
      if (store.state.settings.activeGroup !== ONLINE_FOLLOWING_GROUP_ID) return;
      const { totalPages } = onlineFollowingPageInfo();
      const page = Math.max(0, Math.min(totalPages - 1, Number(rawPage) || 0));
      if (page === currentOnlineFollowingPage()) return;
      grid.scrollTop = 0;
      store.patchSettings({ onlineFollowingPageIndex: page });
    }
    function followingPageTokens(page, totalPages) {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);
      if (page <= 2) return [0, 1, 2, 3, 4, 'ellipsis', totalPages - 1];
      if (page >= totalPages - 3) return [0, 'ellipsis', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
      return [0, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages - 1];
    }
    function renderFollowingPageItems(page, totalPages) {
      let ellipsisIndex = 0;
      followingPageItems.replaceChildren(...followingPageTokens(page, totalPages).map(token => {
        if (token === 'ellipsis') {
          ellipsisIndex += 1;
          return $('span', { class: 'rg-following-page-ellipsis', 'aria-hidden': 'true', dataset: { ellipsis: String(ellipsisIndex) } }, '…');
        }
        const active = token === page;
        return $('button', {
          class: `ctrl-btn rg-following-page-btn rg-following-page-number${active ? ' active' : ''}`,
          type: 'button',
          title: LANG === 'zh' ? `第 ${token + 1} 页` : `Page ${token + 1}`,
          'aria-label': LANG === 'zh' ? `第 ${token + 1} 页` : `Page ${token + 1}`,
          ...(active ? { 'aria-current': 'page' } : {}),
          onclick: () => setOnlineFollowingPage(token),
        }, String(token + 1));
      }));
    }
    function syncLayoutControls() {
      const size = layoutSize();
      const total = fullVisibleRooms().length;
      const following = store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID;
      layoutSel.hidden = following;
      layoutSel.disabled = following;
      followingPager.classList.toggle('active', following);
      document.body.classList.toggle('rg-online-following', following);
      if (following) {
        const { page, pageSize, totalPages } = onlineFollowingPageInfo();
        followingPrevBtn.disabled = page <= 0;
        followingNextBtn.disabled = page >= totalPages - 1;
        renderFollowingPageItems(page, totalPages);
        visibleCountEl.style.marginLeft = '0';
        visibleCountEl.textContent = LANG === 'zh' ? `每页 ${pageSize} 位 · 共 ${total} 位` : `${pageSize} per page · ${total} total`;
      } else {
        layoutSel.value = String(size);
        layoutSel.title = LANG === 'zh' ? `单屏显示 ${size} 个，共 ${total} 个；向下滚动查看更多` : `${size} visible at once, ${total} total; scroll down for more`;
        visibleCountEl.style.marginLeft = '';
        visibleCountEl.textContent = LANG === 'zh' ? `${size} 可见 / ${total} 总数` : `${size} visible · ${total} total`;
      }
    }

    function applyGridSize() {
      const mode = store.state.settings.viewMode;
      if (store.state.settings.splitViewActive) {
        grid.style.display = 'grid';
        grid.style.gridTemplateAreas = '';
        grid.style.gridTemplateColumns = '';
        grid.style.gridTemplateRows = '';
        grid.style.gap = '0';
        grid.style.alignItems = 'stretch';
        grid.style.alignContent = 'stretch';
        grid.style.overflow = 'hidden';
        grid.style.setProperty('--split-ratio', clampInt(store.state.settings.splitRatio, 20, 80, 50) + '%');
        return;
      }
      if (mode === 'focus') {
        const w = Math.max(45, Math.min(76, Number(store.state.settings.focusMainPct || 62)));
        const h = Math.max(44, Math.min(78, Number(store.state.settings.focusMainHPct || 64)));
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `minmax(260px, ${w}fr) 8px minmax(190px, ${100 - w}fr)`;
        grid.style.gridTemplateRows = `minmax(220px, ${h}fr) 8px minmax(120px, ${100 - h}fr)`;
        grid.style.gridTemplateAreas = `'main vbar side' 'hbar hbar side' 'bottom bottom side'`;
        grid.style.gap = '8px';
        grid.style.alignItems = 'stretch';
        grid.style.alignContent = 'stretch';
        grid.style.overflow = 'hidden';
        grid.style.setProperty('--focus-main-w', w + 'fr');
        grid.style.setProperty('--focus-side-w', (100 - w) + 'fr');
        grid.style.setProperty('--focus-main-h', h + 'fr');
        grid.style.setProperty('--focus-bottom-h', (100 - h) + 'fr');
        requestAnimationFrame(applyFocusMainSizing);
        return;
      }
      const shape = layoutShape();
      const gridStyle = getComputedStyle(grid);
      const paddingY = (parseFloat(gridStyle.paddingTop) || 0) + (parseFloat(gridStyle.paddingBottom) || 0);
      const gap = 8;
      const viewportHeight = Math.max(180, grid.clientHeight - paddingY);
      const rowHeight = Math.max(110, Math.floor((viewportHeight - gap * (shape.rows - 1)) / shape.rows));
      grid.style.display = 'grid';
      grid.style.gridTemplateAreas = '';
      grid.style.gridTemplateColumns = `repeat(${shape.cols}, minmax(0, 1fr))`;
      grid.style.gridTemplateRows = '';
      grid.style.gridAutoRows = `${rowHeight}px`;
      grid.style.gridAutoFlow = 'row';
      grid.style.gap = gap + 'px';
      grid.style.alignItems = 'stretch';
      grid.style.alignContent = 'start';
      grid.style.overflowX = 'hidden';
      grid.style.overflowY = 'auto';
      grid.style.overscrollBehavior = 'contain';
    }

    function gridMetrics() {
      const base = clampInt(store.state.settings.gridCellSize || 80, 56, 120, 80);
      const row = Math.max(32, Math.round(base * 9 / 16));
      return { base, row };
    }

    function defaultTileSize() {
      const { base, row } = gridMetrics();
      const target = clampInt(store.state.settings.gridSize || 400, 220, 900, 400);
      const cols = clampInt(Math.round(target / base), 3, 18, 5);
      const rows = clampInt(Math.round((cols * base * 9 / 16) / row), 3, 18, cols);
      return { cols, rows };
    }

    function tileSizeForRoom(room) {
      const groupId = store.state.settings.activeGroup || DEFAULT_GROUP_ID;
      const map = normalizeCardSizeMap(room?.cardSizeByGroup);
      return normalizeCardSize(map[groupId]) || defaultTileSize();
    }

    function applyCardGridSizing(card, room) {
      if (!card) return;
      card.classList.remove('is-focus-main');
      card.style.gridColumn = '';
      card.style.gridRow = '';
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.maxWidth = '';
      card.style.maxHeight = '';
      card.style.aspectRatio = 'auto';
    }

    function parseFocusAspect() {
      const v = store.state.settings.focusAspect || 'auto';
      if (v === 'auto') return null;
      if (v === '4:3') return 4 / 3;
      if (v === '1:1') return 1;
      if (v === '9:16') return 9 / 16;
      return 16 / 9;
    }

    function resetCardSizing(card) {
      if (!card) return;
      card.classList.remove('is-focus-main');
      card.classList.remove('is-split-card');
      card.style.width = '';
      card.style.height = '';
      card.style.flex = '';
      card.style.margin = '';
      card.style.maxWidth = '';
      card.style.maxHeight = '';
      card.style.aspectRatio = '16 / 9';
      card.style.gridColumn = '';
      card.style.gridRow = '';
    }

    function applyFocusMainSizing() {
      if (store.state.settings.viewMode !== 'focus') return;
      const row = grid.querySelector('.focused-row');
      const card = row && row.querySelector('.cam-card');
      if (!row || !card) return;
      card.classList.add('is-focus-main');
      card.style.width = '100%';
      card.style.height = '100%';
      card.style.maxWidth = '100%';
      card.style.maxHeight = '100%';
      card.style.flex = '1 1 auto';
      card.style.aspectRatio = 'auto';
    }

    window.addEventListener('resize', debounce(() => {
      // Entering fullscreen resizes the viewport. Rebuilding the grid here
      // reparents its cards, and browsers immediately leave fullscreen when
      // the fullscreen element is moved in the DOM. The exit resize runs after
      // fullscreenElement clears, so normal layout sizing still resumes then.
      if (document.fullscreenElement) return;
      if (store.state.settings.viewMode === 'focus') applyFocusMainSizing();
      else renderGrid();
    }, 120));

    // ---- 侧边栏渲染 ----
    const workshopRefreshState = {
      busy: false,
      completed: 0,
      total: 0,
      failed: 0,
      throttled: 0,
      message: '',
      lastCompletedAt: 0,
      clearTimer: 0,
    };
    let workshopRefreshPromise = null;

    function renderSidebar() {
      const shellHidesSidebar = !!store.state.settings.pureMode
        || !!store.state.settings.splitViewActive
        || store.state.settings.viewMode === 'focus';
      if (shellHidesSidebar) {
        sidebar.style.setProperty('display', 'none', 'important');
        return;
      }
      sidebar.replaceChildren();
      const collapsed = !!store.state.settings.sidebarCollapsed;
      sidebar.dataset.collapsed = collapsed ? 'true' : 'false';
      sidebar.classList.toggle('is-collapsed', collapsed);
      document.body.classList.toggle('rg-sidebar-collapsed', collapsed);
      if (collapsed) {
        sidebar.style.setProperty('display', 'none', 'important');
        sidebar.style.setProperty('width', '0px', 'important');
        sidebar.style.setProperty('min-width', '0px', 'important');
        sidebar.style.setProperty('max-width', '0px', 'important');
        sidebar.style.setProperty('flex-basis', '0px', 'important');
        sidebar.style.setProperty('padding', '0px', 'important');
        sidebar.style.setProperty('border-width', '0px', 'important');
        return;
      }
      const phoneSidebar = phoneEnvironment || store.state.settings.viewMode === 'phone';
      const sidebarWidth = phoneSidebar ? 'min(82vw, 340px)' : '272px';
      sidebar.style.setProperty('display', 'flex', 'important');
      sidebar.style.setProperty('width', sidebarWidth, 'important');
      sidebar.style.setProperty('min-width', sidebarWidth, 'important');
      sidebar.style.setProperty('max-width', sidebarWidth, 'important');
      sidebar.style.setProperty('flex-basis', sidebarWidth, 'important');
      sidebar.style.setProperty('padding', '10px 8px', 'important');
      sidebar.style.setProperty('border-width', '1px', 'important');

      const counts = countByGroup();
      const sidebarRooms = regularRoomsForView();
      const total = sidebarRooms.length;
      const online = sidebarRooms.filter(r => r.lastStatus === 'online').length;

      sidebar.append($('div', { class: 'sidebar-brand' }, [
        $('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' } }, [
          $('div', { class: 'title' }, LANG === 'zh' ? '分组' : 'Groups'),
          $('button', {
            class: 'sidebar-collapse-btn',
            type: 'button',
            title: LANG === 'zh' ? '收起左侧分组' : 'Collapse groups',
            onclick: (event) => { event.stopPropagation(); setSidebarCollapsed(true); },
          }, LANG === 'zh' ? '收起' : 'Hide'),
        ]),
        $('div', { class: 'sub' }, LANG === 'zh' ? '工作台房间和快速视图' : 'Workshop rooms and quick views'),
      ]));

      const sidebarSearch = $('input', {
        class: 'ctrl-input sidebar-search',
        type: 'search',
        placeholder: t('searchPlaceholder'),
        value: store.state.settings.searchQuery || '',
        oninput: debounce((e) => store.patchSettings({ searchQuery: normalizeUsername(e.target.value), pageIndex: 0 }), 80),
      });
      sidebar.appendChild(sidebarSearch);

      const groupDisplayName = (g) => {
        if (g.name === '__library__') return t('groupLibrary');
        if (g.name === '__all__') return t('groupAll');
        if (g.name === '__online_favorites__') return t('groupOnlineFav');
        if (g.name === '__online_following__') return t('groupOnlineFollowing');
        if (g.name === '__online__') return t('groupOnline');
        if (g.name === '__fav__') return t('groupFav');
        return g.name;
      };

      const renderGroup = (g) => {
        if (!g) return;
        const isActive = store.state.settings.activeGroup === g.id;
        const tab = $('button', {
          class: 'group-tab' + (isActive ? ' active' : ''),
          dataset: { groupId: g.id },
          title: g.id === LIBRARY_GROUP_ID
            ? t('hintLibraryTab')
            : (g.id === ONLINE_FAVORITES_GROUP_ID ? t('hintOnlineFavoritesTab') : (g.id === ONLINE_FOLLOWING_GROUP_ID ? t('hintOnlineFollowingTab') : t('hintGroupTab', groupDisplayName(g)))),
          onclick: () => {
            grid.scrollTop = 0;
            store.setActiveGroup(g.id);
            if (g.id === ONLINE_GROUP_ID || g.id === ONLINE_FAVORITES_GROUP_ID) {
              setTimeout(() => refreshWorkshopRooms({ scope: g.id, automatic: true }), 0);
            }
            if (phoneEnvironment || store.state.settings.viewMode === 'phone') store.patchSettings({ sidebarCollapsed: true });
          },
          oncontextmenu: (e) => { if (!g.system) { e.preventDefault(); openGroupMenu(e, g); } },
          ondragover: (e) => { if (g.id === LIBRARY_GROUP_ID || g.id === ONLINE_GROUP_ID || g.id === ONLINE_FAVORITES_GROUP_ID || g.id === ONLINE_FOLLOWING_GROUP_ID) return; e.preventDefault(); tab.classList.add('drop-target'); },
          ondragleave: () => tab.classList.remove('drop-target'),
          ondrop: (e) => {
            if (g.id === LIBRARY_GROUP_ID || g.id === ONLINE_GROUP_ID || g.id === ONLINE_FAVORITES_GROUP_ID || g.id === ONLINE_FOLLOWING_GROUP_ID) return;
            e.preventDefault(); tab.classList.remove('drop-target');
            const id = e.dataTransfer.getData('text/room-id');
            if (id) store.moveToGroup(id, g.id);
          },
        }, [
          $('span', { class: 'group-name' }, groupDisplayName(g)),
          $('span', { class: 'group-count' }, String(counts[g.id] || 0)),
        ]);

        const row = $('div', { class: 'sidebar-group-row' }, [tab]);
        if (!g.system) {
          row.appendChild($('button', {
            class: 'sidebar-group-more',
            title: LANG === 'zh' ? '分组菜单' : 'Group menu',
            onclick: (e) => { e.stopPropagation(); openGroupMenu(e, g); },
          }, '•••'));
        }
        sidebar.appendChild(row);
        if (g.id === ONLINE_FOLLOWING_GROUP_ID && onlineFollowingStatus.kind !== 'ready' && onlineFollowingStatus.kind !== 'idle') {
          sidebar.appendChild($('div', {
            class: 'online-following-sync-status',
            style: {
              color: 'var(--text-muted)', fontSize: '11px', lineHeight: '1.35',
              padding: '0 10px 7px', overflowWrap: 'anywhere',
            },
          }, onlineFollowingStatus.message));
        }
      };

      const byId = new Map(store.state.groups.map(g => [g.id, g]));
      sidebar.append($('div', { class: 'sidebar-section-title' }, t('quickViewsHeading')));
      [ONLINE_FOLLOWING_GROUP_ID, ONLINE_FAVORITES_GROUP_ID, ONLINE_GROUP_ID, LIBRARY_GROUP_ID].forEach(id => renderGroup(byId.get(id)));

      sidebar.append($('div', { class: 'sidebar-section-title sidebar-section-spaced' }, t('myGroupsHeading')));
      [DEFAULT_GROUP_ID, FAVORITE_GROUP_ID].forEach(id => renderGroup(byId.get(id)));
      [...store.state.groups]
        .filter(g => !g.system)
        .sort((a, b) => a.order - b.order)
        .forEach(renderGroup);

      sidebar.appendChild($('button', {
        class: 'group-tab new-group-tab',
        title: t('hintNewGroup'),
        style: { color: 'var(--text-secondary)', marginTop: '8px', justifyContent: 'center', borderStyle: 'dashed' },
        onclick: () => {
          const name = prompt(t('newGroupPrompt'));
          if (name && name.trim()) store.addGroup(name.trim());
        },
      }, t('newGroup')));

      sidebar.appendChild($('div', { class: 'sidebar-summary' }, LANG === 'zh'
        ? `${total} 位主播 · ${online} 位在线`
        : `${total} models · ${online} online`));

      const refreshLabel = workshopRefreshState.busy
        ? (LANG === 'zh' ? '刷新中…' : 'Refreshing…')
        : (LANG === 'zh' ? '刷新工作台' : 'Refresh Workshop');
      const sidebarRefresh = $('button', {
        class: 'ctrl-btn primary workshop-refresh-btn',
        type: 'button',
        disabled: workshopRefreshState.busy,
        onclick: () => refreshWorkshopRooms({ scope: 'all', force: true }),
      }, refreshLabel);
      const sidebarMenu = $('button', { class: 'ctrl-btn', type: 'button', onclick: () => openMoreMenu(sidebarMenu) }, LANG === 'zh' ? '菜单' : 'Menu');
      const percent = workshopRefreshState.total
        ? Math.round(workshopRefreshState.completed / workshopRefreshState.total * 100)
        : 0;
      const progressText = workshopRefreshState.busy
        ? (LANG === 'zh'
          ? `正在刷新 ${workshopRefreshState.completed}/${workshopRefreshState.total}`
          : `Refreshing ${workshopRefreshState.completed}/${workshopRefreshState.total}`)
        : workshopRefreshState.message;
      const refreshStatus = $('div', {
        class: 'workshop-refresh-status',
        hidden: !progressText,
        role: 'status',
        'aria-live': 'polite',
      }, [
        $('span', {}, progressText),
        $('div', {
          class: 'workshop-refresh-track',
          role: 'progressbar',
          'aria-valuemin': '0',
          'aria-valuemax': '100',
          'aria-valuenow': String(percent),
        }, [$('i', { class: 'workshop-refresh-fill', style: { width: `${percent}%` } })]),
      ]);
      sidebar.append(refreshStatus, $('div', { class: 'sidebar-footer' }, [sidebarRefresh, sidebarMenu]));
    }

    function countByGroup() {
      const rooms = regularRoomsForView();
      const c = {
        [LIBRARY_GROUP_ID]: rooms.length,
        [ONLINE_GROUP_ID]: rooms.filter(r => r.lastStatus === 'online').length,
        [ONLINE_FAVORITES_GROUP_ID]: rooms.filter(r => roomInGroup(r, ONLINE_FAVORITES_GROUP_ID)).length,
        [ONLINE_FOLLOWING_GROUP_ID]: onlineFollowingRooms().length,
      };
      for (const r of rooms) for (const g of getRoomGroups(r)) c[g] = (c[g] || 0) + 1;
      return c;
    }

    function openGroupMenu(e, g) {
      const menu = $('div', { class: 'menu-pop',
        style: { left: e.clientX + 'px', top: e.clientY + 'px' } }, [
        $('button', { onclick: () => { const n = prompt(t('renameGroupPrompt'), g.name); if (n) store.renameGroup(g.id, n.trim()); menu.remove(); } }, t('renameGroup')),
        $('button', { class: 'danger', onclick: () => {
          if (confirm(t('deleteGroupConfirm', g.name))) store.removeGroup(g.id);
          menu.remove();
        } }, t('deleteGroup')),
      ]);
      document.body.appendChild(menu);
      const close = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    // ---- 卡片管理 ----
    const cardMap = new Map();   // id -> {root, video, statusEl, badgeEl}
    const parkedCardOrder = [];
    const MAX_PARKED_CARDS = 27;
    const mediaViewportIds = new Set();
    const mediaAttachPendingIds = new Set();
    const mediaRequestQueue = [];
    const mediaRequestQueuedIds = new Set();
    let mediaRequestPumpTimer = 0;
    let mediaRequestScopeSignature = '';
    // Keep request bursts controlled while allowing a nine-card page to begin
    // all preview requests in roughly 2.4 seconds instead of six seconds.
    const MEDIA_REQUEST_STAGGER_MS = 300;

    const backgroundServiceQueue = [];
    const backgroundServiceQueuedIds = new Set();
    let backgroundServicePumpTimer = 0;
    const BACKGROUND_SERVICE_STAGGER_MS = 1000;

    function isRoomMediaProtected(roomId) {
      const room = findRoomAny(roomId);
      return store.state.settings.focusedRoomId === roomId && store.state.settings.viewMode === 'focus'
        || store.state.settings.splitRoomIds.includes(roomId)
        || !!room && room.muted === false;
    }

    function isCardNearViewport(roomId) {
      if (mediaViewportIds.has(roomId)) return true;
      const card = cardMap.get(roomId)?.root;
      if (!card?.isConnected) return false;
      const cardRect = card.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const margin = Math.max(120, gridRect.height * .75);
      return cardRect.bottom >= gridRect.top - margin && cardRect.top <= gridRect.bottom + margin;
    }

    function shouldAttachRoomMedia(roomId) {
      return isRoomMediaProtected(roomId) || isCardNearViewport(roomId);
    }

    function requestRoomMediaNow(roomId) {
      const room = findRoomAny(roomId);
      const cardEntry = cardMap.get(roomId);
      if (!room || !cardEntry || cardEntry.video || !shouldAttachRoomMedia(roomId)) return;
      if (room.sourceUrl) {
        attachTemporarySource(room);
        return;
      }
      if (mediaAttachPendingIds.has(roomId)) return;
      mediaAttachPendingIds.add(roomId);
      if (!service.has(roomId)) {
        service.start(roomId);
        setTimeout(() => mediaAttachPendingIds.delete(roomId), 6000);
        return;
      }
      service.promote(roomId);
      if (room.lastStatus !== 'online') {
        service.refresh(roomId);
        setTimeout(() => mediaAttachPendingIds.delete(roomId), 6000);
        return;
      }
      service.refresh(roomId);
      setTimeout(() => mediaAttachPendingIds.delete(roomId), 5000);
    }

    function pumpRoomMediaQueue() {
      clearTimeout(mediaRequestPumpTimer);
      mediaRequestPumpTimer = 0;
      while (mediaRequestQueue.length) {
        const roomId = mediaRequestQueue.shift();
        mediaRequestQueuedIds.delete(roomId);
        if (!cardMap.get(roomId)?.root?.isConnected || !shouldAttachRoomMedia(roomId)) continue;
        requestRoomMediaNow(roomId);
        break;
      }
      if (mediaRequestQueue.length) mediaRequestPumpTimer = setTimeout(pumpRoomMediaQueue, MEDIA_REQUEST_STAGGER_MS);
    }

    function pruneRoomMediaQueue(allowedIds) {
      const signature = [...allowedIds].join('\u001f');
      if (signature === mediaRequestScopeSignature) return;
      mediaRequestScopeSignature = signature;
      const keep = roomId => allowedIds.has(roomId) || isRoomMediaProtected(roomId);
      for (let index = mediaRequestQueue.length - 1; index >= 0; index -= 1) {
        const roomId = mediaRequestQueue[index];
        if (keep(roomId)) continue;
        mediaRequestQueue.splice(index, 1);
        mediaRequestQueuedIds.delete(roomId);
      }
      if (mediaRequestPumpTimer) {
        clearTimeout(mediaRequestPumpTimer);
        mediaRequestPumpTimer = 0;
      }
      if (mediaRequestQueue.length) mediaRequestPumpTimer = setTimeout(pumpRoomMediaQueue, 0);
    }

    function requestRoomMediaIfNeeded(roomId) {
      const room = findRoomAny(roomId);
      if (!room || cardMap.get(roomId)?.video || !shouldAttachRoomMedia(roomId)) return;
      if (room.sourceUrl) {
        requestRoomMediaNow(roomId);
        return;
      }
      if (mediaRequestQueuedIds.has(roomId) || mediaAttachPendingIds.has(roomId)) return;
      mediaRequestQueuedIds.add(roomId);
      if (isRoomMediaProtected(roomId)) mediaRequestQueue.unshift(roomId);
      else mediaRequestQueue.push(roomId);
      if (!mediaRequestPumpTimer) mediaRequestPumpTimer = setTimeout(pumpRoomMediaQueue, 0);
    }

    function pumpBackgroundServiceQueue() {
      clearTimeout(backgroundServicePumpTimer);
      backgroundServicePumpTimer = 0;
      while (backgroundServiceQueue.length) {
        const roomId = backgroundServiceQueue.shift();
        backgroundServiceQueuedIds.delete(roomId);
        if (!findRoomAny(roomId) || service.has(roomId)) continue;
        service.startBackground(roomId);
        break;
      }
      if (backgroundServiceQueue.length) backgroundServicePumpTimer = setTimeout(pumpBackgroundServiceQueue, BACKGROUND_SERVICE_STAGGER_MS);
    }

    function queueBackgroundServiceStart(roomId) {
      roomId = normalizeUsername(roomId);
      if (!roomId || service.has(roomId) || backgroundServiceQueuedIds.has(roomId)) return;
      backgroundServiceQueuedIds.add(roomId);
      backgroundServiceQueue.push(roomId);
      if (!backgroundServicePumpTimer) backgroundServicePumpTimer = setTimeout(pumpBackgroundServiceQueue, BACKGROUND_SERVICE_STAGGER_MS);
    }

    function releaseRoomMediaIfPossible(roomId) {
      if (isRoomMediaProtected(roomId) || isCardNearViewport(roomId)) return;
      const room = findRoomAny(roomId);
      const cardEntry = cardMap.get(roomId);
      if (!cardEntry?.video) return;
      mediaAttachPendingIds.delete(roomId);
      if (room?.sourceUrl) {
        try { cardEntry.tempHls?.destroy?.(); } catch (_) {}
        cardEntry.tempHls = null;
      } else {
        service.detachVideo(roomId);
      }
      try { cardEntry.video?.pause?.(); } catch (_) {}
      try { cardEntry.video?.remove?.(); } catch (_) {}
      cardEntry.video = null;
      if (room) renderCardState(room);
    }

    const cardMediaObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const roomId = entry.target?.dataset?.roomId;
        if (!roomId) return;
        if (entry.isIntersecting) {
          mediaViewportIds.add(roomId);
          requestRoomMediaIfNeeded(roomId);
        } else {
          mediaViewportIds.delete(roomId);
          releaseRoomMediaIfPossible(roomId);
        }
      });
    }, { root: grid, rootMargin: '75% 0px', threshold: .01 }) : null;

    function observeCardMedia(roomId) {
      const card = cardMap.get(roomId)?.root;
      if (!card) return;
      if (cardMediaObserver) cardMediaObserver.observe(card);
      else mediaViewportIds.add(roomId);
    }

    function forgetCardMedia(roomId) {
      const card = cardMap.get(roomId)?.root;
      if (card && cardMediaObserver) cardMediaObserver.unobserve(card);
      mediaViewportIds.delete(roomId);
      mediaAttachPendingIds.delete(roomId);
      mediaRequestQueuedIds.delete(roomId);
      const queueIndex = mediaRequestQueue.indexOf(roomId);
      if (queueIndex >= 0) mediaRequestQueue.splice(queueIndex, 1);
    }

    function removeParkedCardId(roomId) {
      const index = parkedCardOrder.indexOf(roomId);
      if (index >= 0) parkedCardOrder.splice(index, 1);
    }

    function disposeCardEntry(roomId, { stopSession = false } = {}) {
      const entry = cardMap.get(roomId);
      if (!entry) return;
      forgetCardMedia(roomId);
      pauseRecordingForSourceLoss(roomId, { silent: true });
      const room = findRoomAny(roomId);
      if (room?.sourceUrl) {
        try { entry.tempHls?.destroy?.(); } catch (_) {}
      } else if (stopSession) service.stop(roomId);
      else service.detachVideo(roomId);
      try { entry.video?.pause?.(); } catch (_) {}
      try { entry.video?.remove?.(); } catch (_) {}
      entry.video = null;
      entry.tempHls = null;
      try { entry.resizeObserver?.disconnect(); } catch (_) {}
      entry.resizeObserver = null;
      try { entry.root.remove(); } catch (_) {}
      removeParkedCardId(roomId);
      cardMap.delete(roomId);
    }

    function trimParkedCards() {
      while (parkedCardOrder.length > MAX_PARKED_CARDS) {
        const roomId = parkedCardOrder.shift();
        const entry = cardMap.get(roomId);
        if (!entry || entry.root.isConnected) continue;
        disposeCardEntry(roomId);
      }
    }

    function parkCardEntry(roomId) {
      const entry = cardMap.get(roomId);
      if (!entry || !entry.root.isConnected) return;
      forgetCardMedia(roomId);
      pauseRecordingForSourceLoss(roomId, { silent: true });
      const room = findRoomAny(roomId);
      if (room?.sourceUrl) {
        try { entry.tempHls?.destroy?.(); } catch (_) {}
        entry.tempHls = null;
      } else service.detachVideo(roomId);
      try { entry.video?.pause?.(); } catch (_) {}
      try { entry.video?.remove?.(); } catch (_) {}
      entry.video = null;
      entry.root.remove();
      removeParkedCardId(roomId);
      parkedCardOrder.push(roomId);
      trimParkedCards();
    }

    function activateCardEntry(roomId) {
      removeParkedCardId(roomId);
      observeCardMedia(roomId);
    }

    // v15.6-minimal: 临时 URL 窗口。只存在于当前页面内存，刷新后消失；不写入 localStorage。
    const tempRooms = [];
    const onlineFollowingRoomIndex = new Map();
    let onlineFollowingRoomList = [];
    let savedRoomIndex = new Map(store.state.rooms.map(room => [room.id, room]));
    function regularTemporaryRooms() { return tempRooms.filter(room => !room.onlineFollowing); }
    function onlineFollowingRooms() { return onlineFollowingRoomList; }
    function findOnlineFollowingRoom(id) { return onlineFollowingRoomIndex.get(String(id || '')) || null; }
    function regularRoomsForView() { return [...store.state.rooms, ...regularTemporaryRooms()]; }
    function allRoomsForView() { return [...store.state.rooms, ...tempRooms]; }
    function findRoomAny(id) {
      id = String(id || '');
      return savedRoomIndex.get(id) || findOnlineFollowingRoom(id) || tempRooms.find(r => r.id === id) || null;
    }
    runtimeSplitRoomAvailable = id => !!findOnlineFollowingRoom(normalizeUsername(id));
    let onlineFollowingSyncBusy = false;
    let onlineFollowingSyncPromise = null;
    let onlineFollowingLastSync = 0;
    let onlineFollowingInitialOrderReady = false;
    let onlineFollowingNextOrder = 0;
    const onlineFollowingSuppressedUntil = new Map();
    const ONLINE_FOLLOWING_CACHE_KEY = 'ziggy_online_following_cache_v1';
    const ONLINE_FOLLOWING_CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
    let onlineFollowingRateLimitUntil = 0;
    let onlineFollowingRetryDelayMs = 2 * 60 * 1000;
    let onlineFollowingRetryTimer = 0;
    let onlineFollowingStatus = { kind: 'idle', message: '' };
    let onlineFollowingCacheSavedAt = 0;

    function setOnlineFollowingStatus(kind, message = '') {
      onlineFollowingStatus = { kind, message };
      scheduleSidebarRender();
    }

    function readOnlineFollowingCache() {
      try {
        const parsed = JSON.parse(localStorage.getItem(ONLINE_FOLLOWING_CACHE_KEY) || 'null');
        const savedAt = Number(parsed?.savedAt || 0);
        if (!savedAt || Date.now() - savedAt > ONLINE_FOLLOWING_CACHE_MAX_AGE_MS || !Array.isArray(parsed?.rooms)) return null;
        const rooms = parsed.rooms.map(item => ({
          id: normalizeUsername(item?.id),
          lastStatus: item?.lastStatus === 'private' ? 'private' : 'online',
        })).filter(item => isLikelyUsername(item.id));
        return rooms.length ? { savedAt, rooms } : null;
      } catch (_) { return null; }
    }

    function writeOnlineFollowingCache(rooms) {
      try {
        localStorage.setItem(ONLINE_FOLLOWING_CACHE_KEY, JSON.stringify({
          savedAt: Date.now(),
          rooms: rooms.map(item => ({ id: item.id, lastStatus: item.lastStatus === 'private' ? 'private' : 'online' })),
        }));
      } catch (_) {}
    }

    function onlineFollowingRetryAfterMs(response) {
      const value = String(response?.headers?.get?.('Retry-After') || '').trim();
      if (!value) return 0;
      const seconds = Number(value);
      if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
      const date = Date.parse(value);
      return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
    }

    function onlineFollowingHttpError(response) {
      const error = new Error(`HTTP ${response.status}`);
      error.httpStatus = Number(response.status || 0);
      error.retryAfterMs = onlineFollowingRetryAfterMs(response);
      return error;
    }

    function scheduleOnlineFollowingRetry(waitMs) {
      clearTimeout(onlineFollowingRetryTimer);
      const wait = Math.max(1000, Number(waitMs) || 2 * 60 * 1000);
      onlineFollowingRetryTimer = setTimeout(() => {
        onlineFollowingRetryTimer = 0;
        syncOnlineFollowing(true);
      }, wait + 250);
    }

    function registerOnlineFollowingFailure(error, cachedAvailable = onlineFollowingRooms().length > 0) {
      const throttled = Number(error?.httpStatus || 0) === 429;
      const requestedWait = Math.max(0, Number(error?.retryAfterMs || 0));
      const wait = throttled
        ? Math.max(requestedWait, 5 * 60 * 1000, onlineFollowingRetryDelayMs)
        : Math.max(2 * 60 * 1000, Math.min(10 * 60 * 1000, onlineFollowingRetryDelayMs));
      onlineFollowingRateLimitUntil = Math.max(onlineFollowingRateLimitUntil, Date.now() + wait);
      onlineFollowingRetryDelayMs = Math.min(30 * 60 * 1000, Math.max(2 * 60 * 1000, Math.round(wait * 1.8)));
      const seconds = Math.max(1, Math.ceil(wait / 1000));
      setOnlineFollowingStatus('retrying', cachedAvailable
        ? `Showing the last successful list · retrying in ${seconds}s`
        : `Following list temporarily unavailable · retrying in ${seconds}s`);
      scheduleOnlineFollowingRetry(wait);
    }

    function onlineFollowingIsSuppressed(roomId) {
      const until = Number(onlineFollowingSuppressedUntil.get(roomId) || 0);
      if (until > Date.now()) return true;
      onlineFollowingSuppressedUntil.delete(roomId);
      return false;
    }

    function parseOnlineFollowingDocument(source) {
      const doc = source?.querySelectorAll
        ? source
        : new DOMParser().parseFromString(String(source || ''), 'text/html');
      const found = new Map();
      const candidates = new Set();
      // The native Following page contains a separate "Recommended For You"
      // strip using the same RoomCard markup. Only read the direct Online Rooms
      // grid inside the paginated followed-room list.
      const onlineGrids = [...doc.querySelectorAll('.HomepagePaginatedRoomlist > .RoomCardGrid:not(.RoomCardGrid--oneRow)')];
      const scopes = onlineGrids.length ? onlineGrids : [doc];
      scopes.forEach(scope => scope.querySelectorAll('[data-testid="room-card"]').forEach(card => {
        const anchor = card.querySelector('a[data-testid="room-card-username"][href],a.RoomCardThumbnail[href],a[href]');
        if (anchor) candidates.add(anchor);
      }));
      scopes.forEach(scope => scope.querySelectorAll('a[data-testid="room-card-username"][href]').forEach(anchor => candidates.add(anchor)));
      if (!candidates.size) {
        scopes.forEach(scope => scope.querySelectorAll('li a[href],article a[href],[class*="room"] a[href],[class*="Room"] a[href],[class*="card"] a[href],[class*="Card"] a[href]')
          .forEach(anchor => candidates.add(anchor)));
      }
      candidates.forEach(anchor => {
        let url;
        try { url = new URL(anchor.getAttribute('href'), location.origin); } catch (_) { return; }
        if (!safeChaturbateHost(url.hostname)) return;
        const match = url.pathname.match(/^\/([A-Za-z0-9_-]+)\/?$/);
        const id = normalizeUsername(match?.[1] || '');
        if (!isLikelyUsername(id)) return;
        const card = anchor.closest('[data-testid="room-card"],li,article,[class*="room"],[class*="Room"],[class*="card"],[class*="Card"]');
        if (!anchor.querySelector('img,video') && !card?.querySelector('img,video')) return;
        const label = card?.querySelector('[data-testid="thumbnail-label"]')?.textContent || '';
        const statusText = `${anchor.textContent || ''} ${card?.textContent || ''} ${label}`.toLowerCase();
        const protectedRoom = /\b(?:in private|private|hidden|secret|group|password)\b/.test(statusText);
        const previous = found.get(id);
        found.set(id, { id, lastStatus: protectedRoom || previous?.lastStatus === 'private' ? 'private' : 'online' });
      });
      return [...found.values()];
    }

    function onlineFollowingPageUrls(source) {
      const doc = source?.querySelectorAll
        ? source
        : new DOMParser().parseFromString(String(source || ''), 'text/html');
      const pages = new Map();
      doc.querySelectorAll('.HomepagePaginatedRoomlist .Pagination a[href],a.Pagination__link[href]').forEach(anchor => {
        try {
          const url = new URL(anchor.getAttribute('href'), location.origin);
          if (!safeChaturbateHost(url.hostname) || !/^\/followed-cams\/?$/.test(url.pathname)) return;
          const page = Math.max(1, Math.trunc(numeric(url.searchParams.get('page'), 1)));
          if (page > 1 && page <= 50) pages.set(page, url.href);
        } catch (_) {}
      });
      return [...pages.entries()].sort((a, b) => a[0] - b[0]).map(([, url]) => url);
    }

    function expectedOnlineFollowingCount(source) {
      const doc = source?.querySelectorAll
        ? source
        : new DOMParser().parseFromString(String(source || ''), 'text/html');
      for (const anchor of doc.querySelectorAll('a[href*="followed-cams"]')) {
        const match = String(anchor.textContent || '').match(/\(\s*([\d,.\s]+)\s*\//);
        if (!match) continue;
        const count = Number(match[1].replace(/[^\d]/g, ''));
        if (Number.isFinite(count) && count >= 0) return count;
      }
      return 0;
    }

    function loadRenderedOnlineFollowing(pageUrl = `${location.origin}/followed-cams/`) {
      return new Promise((resolve, reject) => {
        const frame = document.createElement('iframe');
        frame.name = 'ziggy-following-sync-frame';
        frame.title = 'Online Following synchronizer';
        frame.setAttribute('aria-hidden', 'true');
        // Chaturbate's followed page tries to frame-bust with top.location.
        // Keep scripts and same-origin DOM access for rendering, but explicitly
        // deny top navigation so the hidden synchronizer cannot replace Workshop.
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
        Object.assign(frame.style, {
          position: 'fixed', left: '-100000px', top: '0', width: '1280px', height: '900px',
          opacity: '0.001', pointerEvents: 'none', border: '0', zIndex: '-1',
        });
        let settled = false;
        let pollTimer = 0;
        let timeoutTimer = 0;
        let latestRooms = [];
        let lastSignature = '';
        let stablePasses = 0;
        const cleanup = () => {
          clearInterval(pollTimer);
          clearTimeout(timeoutTimer);
          try { frame.remove(); } catch (_) {}
        };
        const finish = (rooms) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(rooms);
        };
        const fail = () => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('Rendered followed rooms did not become available'));
        };
        const inspect = () => {
          try {
            const doc = frame.contentDocument;
            if (!doc?.body) return;
            const rooms = parseOnlineFollowingDocument(doc);
            if (!rooms.length) return;
            latestRooms = rooms;
            const signature = rooms.map(room => `${room.id}:${room.lastStatus}`).join('|');
            if (signature === lastSignature) stablePasses += 1;
            else {
              lastSignature = signature;
              stablePasses = 0;
            }
            if (stablePasses >= 2) finish(rooms);
          } catch (_) {}
        };
        frame.addEventListener('load', inspect);
        // Keep the followed-cams URL native. Chaturbate forwards unknown page
        // query parameters to its room-list API, and Cloudflare may reject the
        // resulting request. Only the site's own `page` parameter belongs here.
        frame.src = new URL(pageUrl, location.origin).href;
        (document.body || document.documentElement).appendChild(frame);
        pollTimer = setInterval(inspect, 400);
        timeoutTimer = setTimeout(() => latestRooms.length ? finish(latestRooms) : fail(), 10000);
      });
    }

    function onlineFollowingDocumentIsChallenge(doc) {
      const text = `${doc?.title || ''} ${doc?.body?.textContent || ''}`.slice(0, 12000).toLowerCase();
      return /cloudflare|verify you are human|verification|checking your browser|just a moment|challenge-platform/.test(text);
    }

    async function fetchOnlineFollowingDocument(url) {
      const response = await fetch(url, { credentials: 'include', cache: 'default' });
      if (!response.ok) throw onlineFollowingHttpError(response);
      return new DOMParser().parseFromString(await response.text(), 'text/html');
    }

    async function loadAllOnlineFollowing() {
      const firstUrl = `${location.origin}/followed-cams/`;
      const firstDocument = await fetchOnlineFollowingDocument(firstUrl);
      let firstRooms = parseOnlineFollowingDocument(firstDocument);
      if (!firstRooms.length && onlineFollowingDocumentIsChallenge(firstDocument)) {
        const error = new Error('Browser verification interrupted the Following list');
        error.httpStatus = 429;
        throw error;
      }
      if (!firstRooms.length && !firstDocument.querySelector('.HomepagePaginatedRoomlist')) {
        firstRooms = await loadRenderedOnlineFollowing(firstUrl);
      }
      const merged = new Map();
      const mergeRooms = rooms => rooms.forEach(item => {
        const previous = merged.get(item.id);
        merged.set(item.id, {
          id: item.id,
          lastStatus: item.lastStatus === 'private' || previous?.lastStatus === 'private' ? 'private' : 'online',
        });
      });
      mergeRooms(firstRooms);
      const expectedCount = expectedOnlineFollowingCount(firstDocument);
      const firstPageSize = Math.max(1, firstRooms.length);
      for (let page = 2; page <= 50 && (!expectedCount || merged.size < expectedCount); page += 1) {
        const pageUrl = new URL(firstUrl);
        pageUrl.searchParams.set('page', String(page));
        let doc;
        try {
          doc = await fetchOnlineFollowingDocument(pageUrl.href);
        } catch (error) {
          return { rooms: [...merged.values()], complete: false, expectedCount, error };
        }
        let rooms = parseOnlineFollowingDocument(doc);
        if (!rooms.length && page === 2) {
          try { rooms = await loadRenderedOnlineFollowing(pageUrl.href); } catch (_) {}
        }
        if (!rooms.length) break;
        const before = merged.size;
        mergeRooms(rooms);
        if (merged.size === before) break;
        if (rooms.length < firstPageSize && (!expectedCount || merged.size >= expectedCount)) break;
      }
      return { rooms: [...merged.values()], complete: !expectedCount || merged.size >= expectedCount, expectedCount, error: null };
    }

    function syncOnlineFollowingQualityCaps() {
      const active = store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID;
      onlineFollowingRooms().forEach(room => service.setQualityCap(room.id, active ? 480 : 0));
    }

    function applyOnlineFollowingRooms(followed, { preserveMissing = false } = {}) {
      const followingIsVisible = store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID;
      const previousVisibleIds = followingIsVisible ? renderVisibleRooms().map(room => room.id) : [];
      const ids = followed.map(item => item.id);
      const currentFollowing = onlineFollowingRooms();
      const currentById = new Map(currentFollowing.map(room => [room.id, room]));
      const incomingById = new Map(followed.map(item => [item.id, item]));
      const oldIds = new Set(currentById.keys());
      const nextFollowing = [];
      const changedRooms = [];
      let structureChanged = !onlineFollowingInitialOrderReady;
      const createRoom = (item, order) => ({
        id: item.id, displayName: item.id, temporary: true, onlineFollowing: true,
        lastStatus: item.lastStatus, privateLabel: item.lastStatus === 'private' ? 'Private' : '', addedAt: Date.now(),
        lastSeenOnline: item.lastStatus === 'online' ? Date.now() : 0, order,
        groups: [], groupOrder: {}, muted: true,
      });

      if (!onlineFollowingInitialOrderReady) {
        followed.slice().sort((a, b) => a.id.localeCompare(b.id)).forEach(item => {
          nextFollowing.push(createRoom(item, onlineFollowingNextOrder++));
        });
        onlineFollowingInitialOrderReady = true;
      } else {
        onlineFollowingNextOrder = Math.max(
          onlineFollowingNextOrder,
          ...currentFollowing.map(room => numeric(room.order, -1) + 1),
        );
        currentFollowing
          .slice()
          .sort((a, b) => numeric(a.order, 0) - numeric(b.order, 0))
          .forEach(room => {
            const item = incomingById.get(room.id);
            if (!item) {
              if (preserveMissing) nextFollowing.push(room);
              else structureChanged = true;
              return;
            }
            const previousStatus = room.lastStatus;
            const previousLabel = room.privateLabel || '';
            room.lastStatus = item.lastStatus;
            room.privateLabel = item.lastStatus === 'private' ? 'Private' : '';
            if (item.lastStatus === 'online') room.lastSeenOnline = Date.now();
            if (previousStatus !== room.lastStatus || previousLabel !== room.privateLabel) changedRooms.push(room);
            nextFollowing.push(room);
          });
        followed.forEach(item => {
          if (!currentById.has(item.id)) {
            nextFollowing.push(createRoom(item, onlineFollowingNextOrder++));
            structureChanged = true;
          }
        });
      }
      const currentOrder = currentFollowing.map(room => room.id);
      const nextOrder = nextFollowing.map(room => room.id);
      if (currentOrder.length !== nextOrder.length || currentOrder.some((id, index) => id !== nextOrder[index])) structureChanged = true;
      if (structureChanged) {
        for (let index = tempRooms.length - 1; index >= 0; index--) {
          if (tempRooms[index]?.onlineFollowing) tempRooms.splice(index, 1);
        }
        tempRooms.push(...nextFollowing);
        onlineFollowingRoomIndex.clear();
        nextFollowing.forEach(room => onlineFollowingRoomIndex.set(room.id, room));
        onlineFollowingRoomList = nextFollowing;
        store.reconcileSplitSelection();
      }
      const nextIds = new Set(preserveMissing ? nextFollowing.map(item => item.id) : ids);
      oldIds.forEach(id => {
        if (nextIds.has(id)) return;
        service.setQualityCap(id, 0);
        if (!store.state.rooms.some(room => room.id === id)) service.stop(id);
      });
      onlineFollowingLastSync = Date.now();
      if (structureChanged) {
        syncOnlineFollowingQualityCaps();
        scheduleSidebarRender();
        if (followingIsVisible) {
          const nextVisibleIds = renderVisibleRooms().map(room => room.id);
          const visiblePageChanged = previousVisibleIds.length !== nextVisibleIds.length
            || previousVisibleIds.some((id, index) => id !== nextVisibleIds[index]);
          if (visiblePageChanged) scheduleGridRender();
          else if (!document.hidden) syncLayoutControls();
        }
      } else {
        changedRooms.forEach(renderCardState);
        if (changedRooms.length && store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID
          && (store.state.settings.filter?.hideOffline || store.state.settings.filter?.hidePrivate || store.state.settings.filter?.onlyOnline)) {
          scheduleGridRender();
        }
      }
    }

    function hydrateOnlineFollowingCache() {
      const cached = readOnlineFollowingCache();
      if (!cached) return false;
      onlineFollowingCacheSavedAt = cached.savedAt;
      const rooms = cached.rooms.filter(item => !onlineFollowingIsSuppressed(item.id));
      applyOnlineFollowingRooms(rooms);
      setOnlineFollowingStatus('cached', 'Showing the last successful list · checking for updates');
      return true;
    }

    async function syncOnlineFollowing(force = false) {
      if (onlineFollowingSyncBusy) return onlineFollowingSyncPromise;
      if (!force && Date.now() - onlineFollowingLastSync < 4.5 * 60 * 1000) return;
      if (Date.now() < onlineFollowingRateLimitUntil) {
        const wait = onlineFollowingRateLimitUntil - Date.now();
        const seconds = Math.max(1, Math.ceil(wait / 1000));
        setOnlineFollowingStatus('retrying', onlineFollowingRooms().length
          ? `Showing the last successful list · retrying in ${seconds}s`
          : `Following list temporarily unavailable · retrying in ${seconds}s`);
        scheduleOnlineFollowingRetry(wait);
        return;
      }
      onlineFollowingSyncBusy = true;
      setOnlineFollowingStatus(onlineFollowingRooms().length ? 'cached' : 'loading', onlineFollowingRooms().length
        ? 'Showing the last successful list · checking for updates'
        : 'Loading followed rooms…');
      onlineFollowingSyncPromise = (async () => {
        try {
          const result = await loadAllOnlineFollowing();
          const followed = result.rooms.filter(item => !onlineFollowingIsSuppressed(item.id));
          applyOnlineFollowingRooms(followed, { preserveMissing: !result.complete });
          if (result.complete) {
            writeOnlineFollowingCache(followed);
            onlineFollowingCacheSavedAt = Date.now();
            onlineFollowingRetryDelayMs = 2 * 60 * 1000;
            onlineFollowingRateLimitUntil = 0;
            clearTimeout(onlineFollowingRetryTimer);
            onlineFollowingRetryTimer = 0;
            setOnlineFollowingStatus('ready', '');
          } else {
            registerOnlineFollowingFailure(result.error || new Error('Following list was incomplete'), true);
          }
        } catch (error) {
          console.warn('[RoomGrid] Online Following sync failed', error);
          registerOnlineFollowingFailure(error);
        } finally {
          onlineFollowingSyncBusy = false;
          onlineFollowingSyncPromise = null;
        }
      })();
      return onlineFollowingSyncPromise;
    }

    function roomIdsForWorkshopRefresh(scope = 'all') {
      if (scope === 'all' || scope === LIBRARY_GROUP_ID || scope === ONLINE_GROUP_ID) return store.state.rooms.map(room => room.id);
      if (scope === ONLINE_FAVORITES_GROUP_ID) return store.state.rooms.filter(room => roomInGroup(room, FAVORITE_GROUP_ID)).map(room => room.id);
      return store.state.rooms.filter(room => roomInGroup(room, scope)).map(room => room.id);
    }

    async function refreshWorkshopRooms(options = {}) {
      const scope = options.scope || 'all';
      if (scope === ONLINE_FOLLOWING_GROUP_ID) return syncOnlineFollowing(true);
      if (workshopRefreshPromise) return workshopRefreshPromise;
      const freshnessKey = scope === ONLINE_GROUP_ID ? 'all' : scope;
      workshopRefreshState.lastByScope ||= new Map();
      if (options.automatic && Date.now() - Number(workshopRefreshState.lastByScope.get(freshnessKey) || 0) < 60000) return null;
      const ids = roomIdsForWorkshopRefresh(scope);
      clearTimeout(workshopRefreshState.clearTimer);
      Object.assign(workshopRefreshState, { busy: true, completed: 0, total: ids.length, failed: 0, throttled: 0, message: '' });
      refreshAllBtn.disabled = true;
      scheduleSidebarRender();
      if (!ids.length) {
        Object.assign(workshopRefreshState, { busy: false, message: LANG === 'zh' ? '没有可刷新的房间' : 'No rooms to refresh' });
        refreshAllBtn.disabled = false;
        scheduleSidebarRender();
        return [];
      }
      workshopRefreshPromise = service.refreshMany(ids, {
        concurrency: 2,
        spacingMs: 300,
        onProgress: ({ completed, result }) => {
          workshopRefreshState.completed = completed;
          if (result?.status === 'throttled') workshopRefreshState.throttled++;
          else if (result?.status === 'error') workshopRefreshState.failed++;
          scheduleSidebarRender();
        },
      });
      try {
        const results = await workshopRefreshPromise;
        const notes = [];
        if (workshopRefreshState.throttled) notes.push(`${workshopRefreshState.throttled} deferred`);
        if (workshopRefreshState.failed) notes.push(`${workshopRefreshState.failed} failed`);
        workshopRefreshState.message = LANG === 'zh'
          ? `工作台已刷新${notes.length ? ` · ${notes.join(' · ')}` : ''}`
          : `Workshop refreshed${notes.length ? ` · ${notes.join(' · ')}` : ''}`;
        workshopRefreshState.lastCompletedAt = Date.now();
        workshopRefreshState.lastByScope.set(freshnessKey, workshopRefreshState.lastCompletedAt);
        return results;
      } finally {
        workshopRefreshState.busy = false;
        workshopRefreshPromise = null;
        refreshAllBtn.disabled = false;
        scheduleSidebarRender();
        workshopRefreshState.clearTimer = setTimeout(() => {
          workshopRefreshState.message = '';
          scheduleSidebarRender();
        }, 6000);
      }
    }

    async function refreshAllSources() {
      const scope = store.state.settings.activeGroup || DEFAULT_GROUP_ID;
      if (scope === ONLINE_FOLLOWING_GROUP_ID) {
        refreshAllBtn.disabled = true;
        try { await syncOnlineFollowing(true); }
        finally { refreshAllBtn.disabled = false; }
        return;
      }
      return refreshWorkshopRooms({ scope, force: true });
    }
    function isDirectMediaUrl(url) { return /\.(m3u8|mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(String(url || '')); }
    function isHlsUrl(url) { return /\.m3u8(?:[?#].*)?$/i.test(String(url || '')) || /m3u8/i.test(String(url || '')); }
    function tempIdFromUrl(url) {
      try {
        const u = new URL(String(url));
        const name = (u.hostname + u.pathname).replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'url';
        return 'tmp_' + name + '_' + Math.random().toString(36).slice(2, 7);
      } catch (_) { return 'tmp_url_' + Math.random().toString(36).slice(2, 9); }
    }
    function extractMediaUrlFromHtml(html, baseUrl) {
      const srcs = [];
      const push = (v) => {
        if (!v) return;
        let s = String(v).replace(/\\\//g, '/').replace(/&amp;/g, '&').trim();
        try { s = new URL(s, baseUrl).href; } catch (_) {}
        if (isSafeHttpUrl(s) && isDirectMediaUrl(s)) srcs.push(s);
      };
      String(html || '').replace(/https?:\\?\/\\?\/[^\s"'<>]+?(?:m3u8|mp4|webm|mov|m4v)(?:[^\s"'<>]*)?/ig, m => { push(m); return m; });
      String(html || '').replace(/(?:src|source|file|url)["']?\s*[:=]\s*["']([^"']+)["']/ig, (_, m) => { push(m); return _; });
      return srcs.find(isHlsUrl) || srcs[0] || '';
    }
    async function fetchTextBestEffort(url) {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('http ' + res.status);
      return res.text();
    }
    async function importTemporaryUrls() {
      const raw = prompt(LANG === 'zh' ? '粘贴 URL，支持房间页、m3u8、mp4/webm。普通网页会尝试解析真实播放源；失败请手动粘贴真实播放地址。' : 'Paste URLs. Room pages, m3u8, mp4/webm are supported. Normal pages will be parsed best-effort.');
      if (!raw) return;
      const parts = String(raw).split(/[\s,，]+/).map(x => x.trim()).filter(Boolean);
      let added = 0, failed = 0;
      for (const part of parts) {
        try {
          if (!isSafeHttpUrl(part)) { failed++; continue; }
          const u = new URL(part, location.href);
          if (safeChaturbateHost(u.hostname)) {
            const username = normalizeUsername(part);
            if (username && isLikelyUsername(username)) {
              const activeGroup = store.state.settings.activeGroup;
              const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID || activeGroup === ONLINE_FOLLOWING_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
              if (!findRoomAny(username)) tempRooms.push({ id: username, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'unknown', lastSeenOnline: 0, muted: false, temporary: true });
              service.start(username);
              added++;
              continue;
            }
          }
          let mediaUrl = isDirectMediaUrl(part) ? part : '';
          if (!mediaUrl) {
            try { mediaUrl = extractMediaUrlFromHtml(await fetchTextBestEffort(part), part); } catch (_) {}
          }
          if (!mediaUrl) { failed++; continue; }
          const id = tempIdFromUrl(mediaUrl);
          const activeGroup = store.state.settings.activeGroup;
          const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID || activeGroup === ONLINE_FOLLOWING_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
          tempRooms.push({ id, displayName: new URL(mediaUrl).hostname, sourceUrl: mediaUrl, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'online', lastSeenOnline: Date.now(), muted: false, temporary: true });
          added++;
        } catch (_) { failed++; }
      }
      store.patchSettings({ pageIndex: 0 });
      renderSidebar();
      renderGrid();
      toast(LANG === 'zh' ? `临时 URL：新增 ${added}，失败 ${failed}` : `Temporary URLs: ${added} added, ${failed} failed`);
    }

    function statusMeta(s) {
      switch (s) {
        case 'online': return { color: '#16a34a', label: t('stOnline') };
        case 'offline': return { color: '#64748b', label: t('stOffline') };
        case 'private': return { color: '#d97706', label: t('stPrivate') };
        case 'loading': return { color: '#2563eb', label: t('stLoading') };
        case 'error': return { color: '#dc2626', label: LANG === 'zh' ? '流不可用' : 'Stream unavailable' };
        default: return { color: '#64748b', label: t('stUnknown') };
      }
    }

    function saveOnlineFollowingRoom(roomId) {
      const room = findOnlineFollowingRoom(roomId);
      if (!room) return false;
      const added = store.addRoom(roomId);
      const saved = store.state.rooms.find(item => item.id === roomId);
      if (!saved) return false;
      store.patchRoom(roomId, {
        lastStatus: room.lastStatus,
        lastSeenOnline: room.lastSeenOnline,
        privateLabel: room.privateLabel || '',
        muted: true,
      });
      service.setQualityCap(roomId, 0);
      scheduleSidebarRender();
      scheduleGridRender();
      toast(added ? `${roomId} added to Workshop` : `${roomId} is already saved`);
      return true;
    }

    async function unfollowOnlineFollowingRoom(rawUsername) {
      const target = normalizeUsername(rawUsername);
      if (!target || !isLikelyUsername(target)) return false;

      try {
        // This function runs inside the standalone Workshop scope, while the
        // general Suite cookie helper belongs to the normal-site scope. Read
        // the token locally so Workshop unfollow works independently.
        const cookiePrefix = 'csrftoken=';
        const cookiePart = String(document.cookie || '')
          .split(';')
          .map(value => value.trim())
          .find(value => value.startsWith(cookiePrefix));
        const csrf = cookiePart ? decodeURIComponent(cookiePart.slice(cookiePrefix.length)) : '';
        if (!csrf) throw new Error(t('unfollowSignInRequired'));
        // Match Chaturbate's native FollowButton request. In particular, keep
        // the CSRF value in the form body and do not add a second CSRF header.
        const data = new FormData();
        data.append('location', 'FollowButton');
        data.append('csrfmiddlewaretoken', csrf);
        const response = await fetch(`/follow/unfollow/${encodeURIComponent(target)}/`, {
          credentials: 'same-origin',
          method: 'POST',
          headers: { 'x-requested-with': 'XMLHttpRequest' },
          referrer: `${location.origin}/${target}/`,
          body: data,
        });
        if (!response.ok) throw new Error(`Chaturbate returned error ${response.status}`);
        if (response.redirected && /(?:login|auth)/i.test(response.url || '')) {
          throw new Error(t('unfollowSignInRequired'));
        }

        // A 200 response alone is not enough: confirm that Chaturbate's own
        // followed-room list no longer contains the broadcaster before the UI
        // announces success or removes its temporary card.
        let stillFollowed = true;
        for (let attempt = 0; attempt < 3 && stillFollowed; attempt += 1) {
          if (attempt) await new Promise(resolve => setTimeout(resolve, 700 * attempt));
          const result = await loadAllOnlineFollowing();
          // Never treat a throttled/partial followed list as proof that the
          // account unfollow succeeded.
          stillFollowed = !result.complete || result.rooms.some(item => item.id === target);
        }
        if (stillFollowed) throw new Error('Chaturbate still reports this room as followed');

        // The native followed-room list can briefly remain stale after the
        // account request succeeds. Ignore that stale result while it catches up.
        onlineFollowingSuppressedUntil.set(target, Date.now() + 120000);
        for (let index = tempRooms.length - 1; index >= 0; index--) {
          if (tempRooms[index]?.onlineFollowing && tempRooms[index].id === target) tempRooms.splice(index, 1);
        }
        onlineFollowingRoomIndex.delete(target);
        service.setQualityCap(target, 0);
        if (!store.state.rooms.some(room => room.id === target)) service.stop(target);
        onlineFollowingLastSync = Date.now();
        scheduleSidebarRender();
        if (store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID) scheduleGridRender();
        toast(t('unfollowAccountDone', target));
        return true;
      } catch (error) {
        console.warn('[RoomGrid] Chaturbate unfollow failed', error);
        toast(`${t('unfollowAccountFailed', target)}: ${error?.message || error}`, 4000);
        return false;
      }
    }

    function buildCard(room) {
      // v15.9.31: the card itself is the drag surface; controls remain normal click targets.
      const card = $('div', { class: 'cam-card rg-card-enter', dataset: { roomId: room.id }, draggable: !phoneEnvironment });
      setTimeout(() => { try { card.classList.remove('rg-card-enter'); } catch (_) {} }, 220);

      // 状态徽标（左上）
      const badge = $('div', { class: 'pill',
        style: { position: 'absolute', top: '8px', left: '8px', zIndex: '20' } });
      // 名字（左下，常驻）
      const name = $('div', {
        class: 'name-label',
        style: { position: 'absolute', bottom: '8px', left: '8px', zIndex: '20',
          background: 'rgba(15,23,42,.46)', color: '#fff', padding: '5px 9px', borderRadius: '999px',
          fontSize: '12px', fontWeight: '650', pointerEvents: 'none', maxWidth: '72%',
          border: '1px solid rgba(255,255,255,.16)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      }, room.id);

      const dragBlockedSelector = '.icon-btn,.menu-pop,.roomgrid-modal-backdrop,button,input,select,textarea,a';
      let dragStartBlocked = false;
      card.addEventListener('pointerdown', (e) => {
        dragStartBlocked = e.button !== 0 || !!e.target?.closest?.(dragBlockedSelector) || getVideoTransform(room.id).zoom !== 1;
      });
      card.addEventListener('pointerup', () => { dragStartBlocked = false; });
      card.addEventListener('pointercancel', () => { dragStartBlocked = false; });
      card.addEventListener('dragstart', (e) => {
        if (dragStartBlocked || getVideoTransform(room.id).zoom !== 1) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/room-id', room.id);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setDragImage(card, card.offsetWidth / 2, Math.min(48, card.offsetHeight / 2)); } catch (_) {}
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        dragStartBlocked = false;
        card.classList.remove('dragging');
        document.querySelectorAll('.cam-card').forEach(c => c.classList.remove('drop-before', 'drop-after'));
      });

      // 操作条（右上，hover 显示）
      const opsRow = $('div', { class: 'mc-hover-ui ops-row',
        style: { position: 'absolute', top: '10px', right: '10px', left: 'auto', bottom: 'auto', zIndex: '25', display: 'flex', gap: '6px', background: 'transparent', width: 'auto', height: 'auto' } });
      const mkOp = (iconName, title, onclick, opts = {}) =>
        setElementHint($('button', {
          class: 'icon-btn' + (opts.danger ? ' danger' : '') + (opts.extra ? ' ops-extra' : ''),
          title,
          html: trustedHtml(iconSvg(iconName, 15)),
          onclick: (e) => { e.stopPropagation(); onclick(e); },
        }), title);

      const refreshBtn = mkOp('refresh', t('opRefresh'), () => service.refresh(room.id), { extra: true });
      const muteBtn = mkOp(room.muted ? 'volume' : 'volumeOff', t('opMuteToggle'), () => {
        const target = store.state.rooms.find(r => r.id === room.id);
        if (!target) return;
        store.patchRoom(room.id, { muted: !target.muted });
        requestAnimationFrame(() => applyMute(room.id));
      });
      const shotBtn = mkOp('camera', t('opScreenshot'), () => captureCardScreenshot(room.id), { extra: true });
      const recordBtn = mkOp('record', t('opRecordStart'), () => toggleCardRecording(room.id), { extra: true });
      const fullBtn = mkOp('expand', t('opFullscreen'), () => {
        document.fullscreenElement ? document.exitFullscreen() : card.requestFullscreen().catch(() => {});
      }, { extra: true });
      const moreOpsBtn = mkOp('more', t('moreOps'), (ev) => openCardOpsMenu(ev, room.id, card));
      const removeBtn = mkOp('close', t('opRemove'), () => {
        stopCardRecording(room.id, true);
        const globallyRemoved = store.removeRoomFromActiveGroup(room.id);
        if (globallyRemoved) service.stop(room.id);
        else service.detachVideo(room.id);
      }, { danger: true });
      const favoriteBtn = room.temporary ? null : mkOp('star', t('opFavoriteAdd'), () => {
        store.toggleRoomInGroup(room.id, FAVORITE_GROUP_ID);
      });
      favoriteBtn?.classList.add('favorite-toggle');
      const copyLinkBtn = isLikelyUsername(room.id) ? mkOp('copy', t('opCopyRoomLink'), () => {
        void copyRoomPageLink(room.id);
      }) : null;
      copyLinkBtn?.classList.add('quick-op', 'quick-copy-link');
      const recuProfileBtn = isLikelyUsername(room.id) ? mkOp('external', t('opOpenRecu'), () => {
        openRoomRecuProfile(room.id);
      }) : null;
      recuProfileBtn?.classList.add('quick-op', 'quick-recu');
      const splitBtn = room.temporary ? null : mkOp('split', t('opAddSplit'), () => handleAddRoomToSplit(room.id));
      splitBtn?.classList.add('split-toggle');
      muteBtn.classList.add('quick-op', 'quick-mute');
      refreshBtn.classList.add('quick-op', 'quick-refresh', 'quick-optional');
      fullBtn.classList.add('quick-op', 'quick-full', 'quick-optional');
      moreOpsBtn.classList.add('quick-op', 'quick-more');
      opsRow.append(muteBtn, refreshBtn, recordBtn, fullBtn);

      // 状态文字（中央覆盖层）
      const statusEl = $('div', { class: 'status-layer' });
      const media = $('div', { class: 'cam-media' }, [badge, name, statusEl]);
      const infoNameTag = isLikelyUsername(room.id) ? 'a' : 'div';
      const infoName = $(infoNameTag, {
        class: 'cam-info-name',
        ...(infoNameTag === 'a' ? {
          href: location.origin + '/' + encodeURIComponent(room.id) + '/',
          target: '_blank',
          rel: 'noopener noreferrer',
          title: t('modelNameBackgroundTab'),
          onclick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            openBackgroundTab(event.currentTarget.href);
          },
        } : {}),
      }, room.displayName || room.id);
      const infoMeta = $('div', { class: 'cam-info-meta' }, statusMeta(room.lastStatus).label);
      const infoActions = $('div', { class: 'cam-info-actions' });
      if (room.onlineFollowing && !store.state.rooms.some(item => item.id === room.id)) {
        const addRoomBtn = mkOp('plus', LANG === 'zh' ? '添加房间' : 'Add room', () => saveOnlineFollowingRoom(room.id));
        addRoomBtn.classList.add('quick-op', 'quick-add-room');
        infoActions.appendChild(addRoomBtn);
      }
      if (favoriteBtn) infoActions.appendChild(favoriteBtn);
      if (copyLinkBtn) infoActions.appendChild(copyLinkBtn);
      if (recuProfileBtn) infoActions.appendChild(recuProfileBtn);
      infoActions.appendChild(moreOpsBtn);
      const info = $('div', { class: 'cam-info' }, [
        $('div', { class: 'cam-info-copy' }, [infoName, infoMeta]),
        infoActions,
      ]);
      card.append(media, info);

      // —— 双击全屏 ——
      card.addEventListener('mouseenter', () => {
        try {
          card.style.filter = 'none';
          card.style.opacity = '1';
          const v = card.querySelector('.cam-video');
          if (v) { v.style.filter = 'none'; v.style.opacity = '1'; v.controls = false; v.removeAttribute('controls'); }
        } catch (_) {}
      });

      card.addEventListener('dblclick', (e) => {
        if (e.target.closest('.icon-btn')) return;
        // Cancel the browser/video element's native double-click action. Without
        // this, the same gesture can request fullscreen here and immediately
        // toggle it off again when the native default action runs.
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const transform = getVideoTransform(room.id);
        if (transform.zoom !== 1 || transform.x || transform.y) {
          patchVideoTransform(room.id, { zoom: 1, x: 0, y: 0 });
          return;
        }
        document.fullscreenElement ? document.exitFullscreen() : card.requestFullscreen().catch(() => {});
      });

      card.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.icon-btn')) return;
        e.preventDefault();
        openCardOpsMenu(e, room.id, card);
      });

      // —— 卡片作为 drop 目标（dragover/drop 不会被 video 拦截）——
      card.addEventListener('dragover', (e) => {
        const draggingEl = document.querySelector('.cam-card.dragging');
        if (!draggingEl) return;
        const draggingId = draggingEl.dataset.roomId;
        if (draggingId === room.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // 计算插入位置：鼠标在卡片左/上半 → before，右/下半 → after
        const rect = card.getBoundingClientRect();
        // grid 布局可能横可能竖，取占比更大的轴
        const useHoriz = rect.width >= rect.height;
        const ratio = useHoriz
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;
        const before = ratio < 0.5;
        // 仅切换两个 class，避免反复 toggle 导致动画抖动
        if (before) {
          if (!card.classList.contains('drop-before')) {
            card.classList.add('drop-before'); card.classList.remove('drop-after');
          }
        } else {
          if (!card.classList.contains('drop-after')) {
            card.classList.add('drop-after'); card.classList.remove('drop-before');
          }
        }
      });
      card.addEventListener('dragleave', (e) => {
        // 只有真的离开卡片才移除（避免子元素事件冒泡误清）
        if (!card.contains(e.relatedTarget)) {
          card.classList.remove('drop-before', 'drop-after');
        }
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData('text/room-id');
        const isBefore = card.classList.contains('drop-before');
        card.classList.remove('drop-before', 'drop-after');
        if (!fromId || fromId === room.id) return;
        reorderByDrop(fromId, room.id, isBefore ? 'before' : 'after');
      });

      installCardZoomHandlers(card, room.id);

      cardMap.set(room.id, { root: card, media, info, infoMeta, video: null, statusEl, badge, favoriteBtn, splitBtn, muteBtn, recordBtn, removeBtn, resizeObserver: null });
      observeCardMedia(room.id);

      // —— 响应式：根据卡片宽度自动加 .compact / .tiny class ——
      // 避免按钮 + pill + 名字标签在小卡片时互相覆盖
      try {
        const ro = new ResizeObserver(entries => {
          for (const entry of entries) {
            const w = entry.contentRect.width;
            card.classList.toggle('compact', w < 320);
            card.classList.toggle('tiny', w < 230);
          }
        });
        ro.observe(card);
        const entry = cardMap.get(room.id);
        if (entry) entry.resizeObserver = ro;
      } catch (_) { /* 旧浏览器忽略 */ }

      // —— focus 模式：单击非主屏卡片（缩略图）→ 设为主屏 ——
      card.addEventListener('click', (e) => {
        if (store.state.settings.viewMode !== 'focus') return;
        if (e.target.tagName === 'VIDEO') return; // 让 video 控件正常响应
        if (e.target.closest('.icon-btn')) return;
        if (store.state.settings.focusedRoomId === room.id) return;
        // v15.4：新主屏布局的右侧 / 下方副窗口也可以直接点击切主屏。
        const p = card.parentElement;
        const canPromote = p?.classList.contains('thumbs-row') || p?.classList.contains('focus-side-row') || p?.classList.contains('focus-bottom-row');
        if (!canPromote) return;
        focusRoom(room.id);
      });

      return card;
    }

    function updateCardButtons(id) {
      const c = cardMap.get(id);
      if (!c) return;
      const savedRoom = store.state.rooms.find(r => r.id === id);
      const room = findRoomAny(id);
      const favorite = !!savedRoom && roomInGroup(savedRoom, FAVORITE_GROUP_ID);
      if (c.favoriteBtn) {
        setElementHint(c.favoriteBtn, favorite ? t('opFavoriteRemove') : t('opFavoriteAdd'));
        c.favoriteBtn.classList.toggle('favorite-active', favorite);
        c.favoriteBtn.setAttribute('aria-pressed', favorite ? 'true' : 'false');
      }
      c.root.classList.toggle('is-favorite', favorite);
      c.root.classList.toggle('favorite-online', favorite && room?.lastStatus === 'online');
      const splitSelected = !!room && store.state.settings.splitRoomIds.includes(room.id);
      if (c.splitBtn) {
        setElementHint(c.splitBtn, splitSelected ? t('splitAlreadyAdded') : t('opAddSplit'));
        c.splitBtn.classList.toggle('split-active', splitSelected);
        c.splitBtn.setAttribute('aria-pressed', splitSelected ? 'true' : 'false');
      }
      c.root.classList.toggle('is-split-selected', splitSelected);
      if (c.muteBtn && room) {
        setTrustedHtml(c.muteBtn, trustedHtml(iconSvg(room.muted ? 'volume' : 'volumeOff', 15)));
        setElementHint(c.muteBtn, room.muted ? (LANG === 'zh' ? '取消静音' : 'Unmute') : (LANG === 'zh' ? '静音' : 'Mute'));
      }
      if (c.removeBtn) {
        setElementHint(c.removeBtn, (store.state.settings.activeGroup === LIBRARY_GROUP_ID || store.state.settings.activeGroup === ONLINE_GROUP_ID) ? t('opDeleteRoom') : (store.state.settings.activeGroup === ONLINE_FAVORITES_GROUP_ID ? t('opFavoriteRemove') : t('opRemove')));
      }
      const rec = recordings.get(id);
      const recWaiting = !!rec && !['recording', 'finalizing', 'complete', 'saved'].includes(rec.status);
      if (c.recordBtn) {
        setTrustedHtml(c.recordBtn, trustedHtml(iconSvg(rec ? 'stop' : 'record', 15)));
        setElementHint(c.recordBtn, recWaiting ? t('recordingWaiting') : (rec ? t('opRecordStop') : t('opRecordStart')));
        c.recordBtn.classList.toggle('recording', !!rec);
        c.recordBtn.classList.toggle('waiting', recWaiting);
      }
      c.root.classList.toggle('recording', !!rec);
      c.root.classList.toggle('recording-waiting', recWaiting);
    }

    function captureCardScreenshot(roomId) {
      const c = cardMap.get(roomId);
      const video = c?.video;
      if (!video || !video.videoWidth || !video.videoHeight) { toast(t('captureFailed')); return; }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { toast(t('captureFailed')); return; }
          downloadBlob(blob, `roomgrid-${safeFilePart(roomId)}-${stampForFile()}.png`);
          toast(t('screenshotSaved'));
        }, 'image/png');
      } catch (err) {
        console.warn('[RoomGrid] screenshot failed', err);
        toast(t('captureFailed'));
      }
    }

    function startCardRecording(roomId) {
      roomId = normalizeUsername(roomId);
      if (UnifiedRecorder.has(roomId)) return;
      if (!UnifiedRecorder.start(roomId)) { toast(t('recordingUnsupported')); return; }
      updateCardButtons(roomId);
      toast(t('dockRecordQueued'));
    }

    function pauseRecordingForSourceLoss(roomId, opts = {}) {
      // Status handling belongs to the Recorder Hub so all launch surfaces obey
      // the same private/offline/reconnect policy.
      return UnifiedRecorder.has(roomId);
    }

    function resumeWaitingRecording(roomId) {
      return UnifiedRecorder.has(roomId);
    }

    function stopCardRecording(roomId, options = false) {
      if (!UnifiedRecorder.has(roomId)) return;
      UnifiedRecorder.stop(roomId);
      updateCardButtons(roomId);
    }

    function toggleCardRecording(roomId) {
      if (UnifiedRecorder.has(roomId)) stopCardRecording(roomId);
      else startCardRecording(roomId);
    }

    function stopAllRecordings(options = {}) {
      UnifiedRecorder.stopAll();
    }

    function openRecordingSettings() {
      openRecordingSettingsPanel();
    }

    function fmtDuration(ms) {
      const sec = Math.max(0, Math.floor(Number(ms || 0) / 1000));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }

    function fmtBytes(bytes) {
      const n = Math.max(0, Number(bytes) || 0);
      if (n < 1024) return `${n} B`;
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
      if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
      return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }

    function openToolPanel(title, build) {
      closeTransientUi();
      document.querySelectorAll('.roomgrid-modal-backdrop').forEach(el => { try { el.remove(); } catch (_) {} });
      const backdrop = $('div', { class: 'roomgrid-modal-backdrop' });
      const panel = $('div', { class: 'roomgrid-modal', style: { width: 'min(760px, calc(100vw - 36px))', maxHeight: 'min(780px, calc(100vh - 36px))', overflowY: 'auto' } });
      const head = $('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' } }, [
        $('div', { class: 'roomgrid-modal-title', style: { marginBottom: '0' } }, title),
        $('button', { class: 'ctrl-btn', onclick: () => close() }, '×'),
      ]);
      const body = $('div');
      let cleanup = null;
      const close = () => {
        try { cleanup?.(); } catch (_) {}
        try { backdrop.remove(); } catch (_) {}
      };
      backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
      panel.append(head, body);
      backdrop.appendChild(panel);
      document.body.appendChild(backdrop);
      cleanup = build?.(body, close) || null;
      return { body, close };
    }

    function handleAddRoomToSplit(roomId) {
      roomId = normalizeUsername(roomId);
      if (!findRoomAny(roomId)) return;
      const ids = [...store.state.settings.splitRoomIds];
      if (ids.includes(roomId)) {
        if (ids.length === 2) store.setSplitActive(true);
        else toast(t('splitAlreadyAdded'));
        return;
      }
      if (ids.length < 2) {
        const slot = ids.length;
        store.setSplitSlot(slot, roomId);
        if (slot === 0) toast(t('splitAddedFirst', roomId));
        return;
      }
      openSplitSlotChooser(roomId);
    }

    function openSplitSlotChooser(roomId) {
      const ids = [...store.state.settings.splitRoomIds];
      openToolPanel(t('splitChoosePane'), (body, close) => {
        const choices = $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' } });
        [0, 1].forEach(slot => {
          const current = ids[slot] || '—';
          choices.appendChild($('button', {
            class: 'ctrl-btn primary',
            style: { minHeight: '64px', whiteSpace: 'normal' },
            onclick: () => { store.setSplitSlot(slot, roomId); close(); },
          }, t('splitReplacePane', slot + 1, current)));
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, roomId),
          choices,
        );
      });
    }

    function splitPreviewSnapshotUrl(roomId, fallback = false) {
      const id = encodeURIComponent(normalizeUsername(roomId));
      const stamp = Date.now();
      return fallback
        ? `https://jpeg.live.mmcdn.com/minifwap/${id}.jpg?f=${stamp}`
        : `https://jpeg.live.mmcdn.com/stream?room=${id}&f=${stamp}`;
    }

    function openSplitPicker(slot) {
      slot = slot === 1 ? 1 : 0;
      const otherId = store.state.settings.splitRoomIds[slot === 0 ? 1 : 0] || null;
      openToolPanel(t('splitPickerTitle', slot + 1), (body, close) => {
        let mode = store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID ? 'onlineFollowing' : 'onlineFavorites';
        let previewRoom = null;
        let previewTimer = 0;
        let previewFallback = false;
        const search = $('input', { class: 'ctrl-input', type: 'search', placeholder: t('splitPickerSearch'), style: { width: '100%' } });
        const tabs = $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(104px,1fr))', gap: '6px', margin: '10px 0' } });
        const list = $('div', { style: { display: 'grid', gap: '6px', maxHeight: 'min(58vh,520px)', overflowY: 'auto', paddingRight: '2px' } });
        const previewName = $('div', { class: 'split-preview-name' });
        const previewImage = $('img', { alt: '' });
        const previewStatus = $('div', { class: 'split-preview-status' }, t('splitQuickPreview'));
        const previewUseBtn = $('button', { class: 'ctrl-btn primary' });
        const previewPanel = $('div', { class: 'split-quick-preview' }, [
          $('div', { class: 'split-preview-head' }, [
            previewName,
            $('button', { class: 'ctrl-btn', title: t('splitPreviewClose'), html: trustedHtml(iconSvg('close', 17)), onclick: () => closePreview() }),
          ]),
          $('div', { class: 'split-preview-frame' }, [previewImage, previewStatus]),
          $('div', { class: 'split-preview-actions' }, [
            $('button', { class: 'ctrl-btn', title: t('splitPreviewRefresh'), html: trustedHtml(iconLabel('refresh', t('splitPreviewRefresh'), 16)), onclick: () => refreshPreview() }),
            previewUseBtn,
          ]),
        ]);
        const modes = [
          ['onlineFollowing', t('splitOnlineFollowing')],
          ['onlineFavorites', t('splitOnlineFavorites')],
          ['online', t('splitOnline')],
          ['favorites', t('splitFavorites')],
          ['all', t('splitAllSaved')],
        ];

        function closePreview() {
          clearInterval(previewTimer);
          previewTimer = 0;
          previewRoom = null;
          previewPanel.classList.remove('is-open');
          previewImage.removeAttribute('src');
        }
        function refreshPreview() {
          if (!previewRoom) return;
          previewFallback = false;
          previewStatus.textContent = statusMeta(previewRoom.lastStatus).label;
          previewImage.src = splitPreviewSnapshotUrl(previewRoom.id, false);
        }
        function openPreview(room) {
          clearInterval(previewTimer);
          previewRoom = room;
          previewName.textContent = room.id;
          previewImage.alt = `${t('splitQuickPreview')}: ${room.id}`;
          previewPanel.classList.add('is-open');
          const blocked = room.id === otherId || store.state.settings.splitRoomIds[slot] === room.id;
          previewUseBtn.disabled = blocked;
          previewUseBtn.textContent = room.id === otherId
            ? t('splitOtherPane')
            : (store.state.settings.splitRoomIds[slot] === room.id ? t('splitCurrentPane') : t('splitPreviewUse', slot + 1));
          previewUseBtn.onclick = () => {
            if (blocked) return;
            store.setSplitSlot(slot, room.id);
            close();
          };
          refreshPreview();
          previewTimer = setInterval(refreshPreview, 2200);
          requestAnimationFrame(() => previewPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
        previewImage.addEventListener('load', () => {
          if (previewRoom) previewStatus.textContent = statusMeta(previewRoom.lastStatus).label;
        });
        previewImage.addEventListener('error', () => {
          if (!previewRoom) return;
          if (!previewFallback) {
            previewFallback = true;
            previewImage.src = splitPreviewSnapshotUrl(previewRoom.id, true);
          } else previewStatus.textContent = t('splitPreviewUnavailable');
        });

        const bindLongPressPreview = (target, room) => {
          let timer = 0;
          let longPressed = false;
          let startX = 0;
          let startY = 0;
          const cancel = () => { clearTimeout(timer); timer = 0; };
          target.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            cancel();
            longPressed = false;
            startX = event.clientX;
            startY = event.clientY;
            timer = setTimeout(() => { longPressed = true; openPreview(room); }, 480);
          }, { passive: true });
          target.addEventListener('pointermove', event => {
            if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) cancel();
          }, { passive: true });
          target.addEventListener('pointerup', cancel, { passive: true });
          target.addEventListener('pointercancel', cancel, { passive: true });
          target.addEventListener('click', event => {
            if (!longPressed) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            longPressed = false;
          }, true);
          target.addEventListener('contextmenu', event => {
            event.preventDefault();
            openPreview(room);
          });
        };

        const render = () => {
          const q = normalizeUsername(search.value || '');
          tabs.querySelectorAll('button').forEach(btn => btn.classList.toggle('primary', btn.dataset.mode === mode));
          let rooms = mode === 'onlineFollowing' ? [...onlineFollowingRooms()] : [...store.state.rooms];
          if (mode === 'onlineFavorites') rooms = rooms.filter(room => roomInGroup(room, ONLINE_FAVORITES_GROUP_ID));
          else if (mode === 'online') rooms = rooms.filter(room => room.lastStatus === 'online');
          else if (mode === 'favorites') rooms = rooms.filter(room => roomInGroup(room, FAVORITE_GROUP_ID));
          if (q) rooms = rooms.filter(room => room.id.includes(q));
          if (mode !== 'onlineFollowing') {
            rooms.sort((a, b) => (b.lastStatus === 'online' ? 1 : 0) - (a.lastStatus === 'online' ? 1 : 0) || a.id.localeCompare(b.id));
          }
          list.replaceChildren();
          if (!rooms.length) {
            list.appendChild($('div', { class: 'roomgrid-modal-hint', style: { padding: '18px 4px' } }, t('splitNoMatches')));
            return;
          }
          rooms.forEach(room => {
            const meta = statusMeta(room.lastStatus);
            const inOtherPane = room.id === otherId;
            const currentPane = store.state.settings.splitRoomIds[slot] === room.id;
            const selectBtn = $('button', {
              class: 'ctrl-btn split-picker-select',
              disabled: inOtherPane || currentPane,
              title: inOtherPane ? t('splitOtherPane') : room.id,
              onclick: () => { store.setSplitSlot(slot, room.id); close(); },
            }, [
              $('span', { class: 'dot', style: { background: meta.color } }),
              $('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '750' } }, room.id),
              $('span', { style: { color: 'var(--text-muted)', fontSize: '11px' } }, inOtherPane ? t('splitOtherPane') : meta.label),
            ]);
            const previewBtn = $('button', {
              class: 'ctrl-btn split-picker-preview-btn',
              title: `${t('splitQuickPreview')}: ${room.id}`,
              html: trustedHtml(iconSvg('clean', 18)),
              onclick: () => openPreview(room),
            });
            const row = $('div', { class: 'split-picker-row', dataset: { roomId: room.id } }, [selectBtn, previewBtn]);
            bindLongPressPreview(selectBtn, room);
            list.appendChild(row);
          });
        };
        modes.forEach(([key, label]) => tabs.appendChild($('button', {
          class: 'ctrl-btn' + (key === mode ? ' primary' : ''),
          dataset: { mode: key },
          onclick: () => { mode = key; render(); },
        }, label)));
        search.addEventListener('input', debounce(render, 80));
        body.append(
          $('div', { class: 'roomgrid-modal-hint', style: { marginBottom: '8px' } }, t('splitPreviewHint')),
          previewPanel,
          search,
          tabs,
          list,
        );
        render();
        setTimeout(() => search.focus(), 0);
        return closePreview;
      });
    }

    function openSplitViewOrPicker() {
      const ids = store.state.settings.splitRoomIds;
      if (ids.length === 2) store.setSplitActive(true);
      else openSplitPicker(ids.length ? 1 : 0);
    }

    function buildShareSnapshot() {
      const snapshot = sanitizeState({
        ...store.state,
        settings: {
          ...store.state.settings,
          pageIndex: 0,
          focusedRoomId: null,
          pureMode: false,
          toolbarCollapsed: false,
          sidebarCollapsed: false,
          showRecordingOnly: false,
        },
      });
      return snapshot;
    }

    function buildShareLink() {
      const url = new URL(location.href);
      url.searchParams.set('multicam_mode', '1');
      url.hash = 'roomgrid=' + encodeSharePayload(buildShareSnapshot());
      return url.toString();
    }

    async function openSharePanel() {
      openToolPanel(t('sharePanel'), (body) => {
        const link = buildShareLink();
        const input = $('textarea', {
          class: 'roomgrid-modal-textarea',
          readonly: true,
          value: link,
          style: { minHeight: '120px' },
          onclick: (e) => e.currentTarget.select(),
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('shareLinkHint')),
          input,
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn primary', onclick: async () => {
              await copyText(link);
              toast(t('copied'));
            } }, t('shareCopyLink')),
          ]),
        );
      });
    }

    function loadSharedWorkspaceFromHash() {
      const hash = String(location.hash || '').replace(/^#/, '');
      const payload = hash.startsWith('roomgrid=') ? hash.slice('roomgrid='.length) : '';
      if (!payload) return false;
      try {
        const shared = sanitizeState(decodeSharePayload(payload));
        if (!shared.rooms.length) throw new Error('empty share');
        if (!confirm(t('shareImportPrompt', shared.rooms.length))) return false;
        backupCurrentConfig();
        store.replaceState(shared, 'all');
        toast(t('shareImported'));
        try {
          const url = new URL(location.href);
          url.hash = '';
          history.replaceState(null, '', url.toString());
        } catch (_) {}
        return true;
      } catch (err) {
        console.warn('[RoomGrid] shared workspace import failed', err);
        toast(t('shareInvalid'));
        return false;
      }
    }

    function currentPageRoomIds() {
      const gridRect = grid.getBoundingClientRect();
      const visibleIds = [...grid.querySelectorAll('.cam-card[data-room-id]')]
        .filter(card => {
          const rect = card.getBoundingClientRect();
          return rect.bottom > gridRect.top && rect.top < gridRect.bottom && rect.right > gridRect.left && rect.left < gridRect.right;
        })
        .map(card => card.dataset.roomId)
        .filter(Boolean);
      return visibleIds.length ? [...new Set(visibleIds)] : renderVisibleRooms().slice(0, layoutSize()).map(r => r.id);
    }

    function currentGroupRoomIds() {
      return fullVisibleRooms().map(r => r.id);
    }

    function recordRoomIds(ids) {
      const clean = [...new Set((ids || []).map(normalizeUsername).filter(Boolean))];
      if (!clean.length) return;
      clean.forEach(id => startCardRecording(id));
      renderGrid();
    }

    function recordCurrentPage() {
      recordRoomIds(currentPageRoomIds());
    }

    function recordCurrentGroup() {
      recordRoomIds(currentGroupRoomIds());
    }

    function recordOnlineRooms() {
      recordRoomIds(fullVisibleRooms().filter(r => r.lastStatus === 'online').map(r => r.id));
    }

    function pauseCurrentPage() {
      const ids = currentPageRoomIds();
      service.pauseAll(ids);
      requestAnimationFrame(() => ids.forEach(updateCardButtons));
      toast(t('pausedVisible'));
    }

    function openCurrentPageRooms() {
      currentPageRoomIds().forEach(id => openNoopener(location.origin + '/' + id + '/'));
    }

    function moveCurrentPageToGroup() {
      const name = prompt(t('newGroupPrompt'));
      if (!name || !name.trim()) return;
      const safeName = safeGroupName(name, '');
      let group = store.state.groups.find(g => safeGroupName(g.name, g.id).toLowerCase() === safeName.toLowerCase());
      const groupId = group?.id || store.addGroup(safeName);
      currentPageRoomIds().forEach(id => store.moveToGroup(id, groupId));
    }

    function queueRecordingIntent(roomId) {
      roomId = normalizeUsername(roomId);
      if (!roomId || UnifiedRecorder.has(roomId)) return;
      UnifiedRecorder.start(roomId);
      updateCardButtons(roomId);
    }

    function checkRecordingIntentRecovery() {
      UnifiedRecorder.loadSnapshot();
      renderGrid();
    }

    function renderRecordingCenterBody(body) {
      body.replaceChildren();
      const actions = $('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' } }, [
        $('button', { class: 'ctrl-btn primary', onclick: () => UnifiedRecorder.openHub(true) }, t('recorderOpenHub')),
        $('button', { class: 'ctrl-btn primary', onclick: recordCurrentPage }, t('recordCurrentPage')),
        $('button', { class: 'ctrl-btn', onclick: recordCurrentGroup }, t('recordCurrentGroup')),
        $('button', { class: 'ctrl-btn', onclick: recordOnlineRooms }, t('recordOnlineRooms')),
        $('button', { class: 'ctrl-btn', onclick: () => { store.patchSettings({ showRecordingOnly: !store.state.settings.showRecordingOnly, pageIndex: 0 }); } }, store.state.settings.showRecordingOnly ? t('hideRecordingOnly') : t('showRecordingOnly')),
        $('button', { class: 'ctrl-btn danger', onclick: () => stopAllRecordings({ final: true }) }, t('stopAllRecordings')),
      ]);
      body.appendChild(actions);

      const rows = [...recordings.entries()];
      if (!rows.length) {
        body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('recordingCenterEmpty')));
      } else {
        const table = $('div', { style: { display: 'grid', gap: '8px' } });
        rows.forEach(([id, rec]) => {
          const status = rec.manualPaused || rec.status === 'manual-paused'
            ? t('recorderPausedManual')
            : (rec.status === 'recording'
              ? t('recordingActive')
              : (rec.status === 'finalizing'
                ? `${t('recorderStopped')} · ${t('recorderFinalizing')} ${Math.round(rec.finalizingProgress || 0)}%`
                : (rec.status === 'stopped'
                  ? (rec.error || t('recorderStoppedNoData'))
                  : (rec.status === 'interrupted' ? (rec.error || t('recorderInterrupted')) : (rec.status || t('recordingWaitingShort'))))));
          const duration = fmtDuration(rec.recordedMs || 0);
          table.appendChild($('div', { style: { border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' } }, [
            $('div', {}, [
              $('div', { style: { fontWeight: '750' } }, id),
              $('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' } },
                `${status} · ${t('recordingDuration')}: ${duration} · ${rec.resolution || '—'} · ${(rec.audio || rec.audioEnabled) ? t('recorderAudioOn') : t('recorderAudioOff')} · ${fmtBytes(rec.bytes)}`),
            ]),
            $('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' } }, [
              !['finalizing', 'saved', 'failed', 'stopped', 'interrupted'].includes(rec.status) ? $('button', {
                class: 'ctrl-btn',
                onclick: () => (rec.manualPaused || rec.status === 'manual-paused') ? UnifiedRecorder.resume(id) : UnifiedRecorder.pause(id),
              }, (rec.manualPaused || rec.status === 'manual-paused') ? t('recorderResume') : t('recorderPause')) : null,
              !['finalizing', 'saved', 'failed', 'stopped', 'interrupted'].includes(rec.status) ? $('button', { class: 'ctrl-btn danger', onclick: () => UnifiedRecorder.stop(id) }, t('opRecordStop')) : null,
            ]),
          ]));
        });
        body.appendChild(table);
      }

      if (recordingLog.length) {
        body.appendChild($('div', { class: 'roomgrid-modal-title', style: { marginTop: '14px' } }, LANG === 'zh' ? '最近保存' : 'Recent saves'));
        body.appendChild($('div', { style: { display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' } },
          recordingLog.slice(0, 12).map(log => $('div', {}, `${new Date(log.ts).toLocaleTimeString()} · ${log.roomId} · ${log.ext.toUpperCase()} · ${fmtBytes(log.size)}`))));
      }
    }

    function openRecordingCenter() {
      openToolPanel(t('recordingCenter'), (body) => {
        renderRecordingCenterBody(body);
        const timer = setInterval(() => renderRecordingCenterBody(body), 1000);
        return () => clearInterval(timer);
      });
    }

    function openRecordingSettingsPanel() {
      openToolPanel(t('recordingSettingsTitle'), (body, close) => {
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('recorderQualityPolicy')),
          $('div', { class: 'roomgrid-modal-hint', style: { marginTop: '10px' } }, t('recorderHubSubtitle')),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn primary', onclick: () => UnifiedRecorder.openHub(true) }, t('recorderOpenHub')),
            $('button', { class: 'ctrl-btn', onclick: close }, t('aboutClose')),
          ]),
        );
      });
    }

    function openLayoutSettings() {
      openToolPanel(t('layoutSettings'), (body, close) => {
        const layout = $('select', { class: 'ctrl-input' }, [2, 4, 6, 9].map(n => $('option', { value: String(n), selected: Number(store.state.settings.layoutSize) === n }, LANG === 'zh' ? `${n} 位可见` : `${n} visible`)));
        const phoneLayout = $('select', { class: 'ctrl-input' }, [2, 4, 6, 9].map(n => $('option', { value: String(n), selected: Number(store.state.settings.phoneLayoutSize) === n }, LANG === 'zh' ? `${n} 位可见` : `${n} visible`)));
        const mainW = $('input', { class: 'ctrl-input', type: 'number', min: '45', max: '76', value: String(store.state.settings.focusMainPct || 62) });
        const mainH = $('input', { class: 'ctrl-input', type: 'number', min: '44', max: '78', value: String(store.state.settings.focusMainHPct || 64) });
        const thumb = $('input', { class: 'ctrl-input', type: 'number', min: '96', max: '260', value: String(store.state.settings.focusThumbSize || 150) });
        const notify = $('input', { type: 'checkbox', checked: !!store.state.settings.notifyOnline });
        const notifyFavoritesOnly = $('input', { type: 'checkbox', checked: !!store.state.settings.notifyFavoritesOnly, disabled: !store.state.settings.notifyOnline });
        const phoneModeAuto = $('input', { type: 'checkbox', checked: store.state.settings.phoneModeAuto !== false });
        notify.addEventListener('change', () => { notifyFavoritesOnly.disabled = !notify.checked; });
        body.append(
          $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '网格单屏可见' : 'Grid visible models', layout]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '手机单屏可见' : 'Phone visible models', phoneLayout]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('hintThumbSize'), thumb]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '主屏宽度' : 'Main width', mainW]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [LANG === 'zh' ? '主屏高度' : 'Main height', mainH]),
          ]),
          $('label', { class: 'toggle', style: { marginTop: '10px' } }, [phoneModeAuto, t('phoneAutoMode')]),
          $('label', { class: 'toggle', style: { marginTop: '10px' } }, [notify, t('notifyOnline')]),
          $('label', { class: 'toggle', style: { marginTop: '8px' } }, [notifyFavoritesOnly, t('notifyFavoritesOnly')]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: async () => {
              if (notify.checked && !store.state.settings.notifyOnline) await Notify.request();
              store.patchSettings({
                layoutSize: Number(layout.value),
                phoneLayoutSize: Number(phoneLayout.value),
                phoneModeAuto: !!phoneModeAuto.checked,
                ...(phoneEnvironment && phoneModeAuto.checked ? { viewMode: 'phone', sidebarCollapsed: true } : {}),
                focusMainPct: clampInt(mainW.value, 45, 76, 62),
                focusMainHPct: clampInt(mainH.value, 44, 78, 64),
                focusThumbSize: clampInt(thumb.value, 96, 260, 150),
                notifyOnline: !!notify.checked,
                notifyFavoritesOnly: !!notifyFavoritesOnly.checked,
              });
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openStartupSettings() {
      openToolPanel(t('startupSettings'), (body, close) => {
        const view = $('select', { class: 'ctrl-input', 'aria-label': t('startupViewLabel') }, [
          $('option', { value: 'last' }, t('startupLastUsed')),
          $('option', { value: 'auto' }, t('startupAutomatic')),
          $('option', { value: 'grid' }, t('viewGrid')),
          $('option', { value: 'focus' }, t('viewFocus')),
          $('option', { value: 'phone' }, t('viewPhone')),
        ]);
        view.value = store.state.settings.startupView || 'last';

        const groupLabel = group => {
          if (group.name === '__library__') return t('groupLibrary');
          if (group.name === '__all__') return t('groupAll');
          if (group.name === '__online_favorites__') return t('groupOnlineFav');
          if (group.name === '__online_following__') return t('groupOnlineFollowing');
          if (group.name === '__online__') return t('groupOnline');
          if (group.name === '__fav__') return t('groupFav');
          return group.name;
        };
        const group = $('select', { class: 'ctrl-input', 'aria-label': t('startupGroupLabel') }, [
          $('option', { value: 'last' }, t('startupLastUsed')),
          ...[...store.state.groups]
            .sort((a, b) => numeric(a.order, 999) - numeric(b.order, 999))
            .map(item => $('option', { value: item.id }, groupLabel(item))),
        ]);
        group.value = store.state.settings.startupGroup || 'last';
        if (!group.value) group.value = 'last';

        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('startupSettingsHint')),
          $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('startupViewLabel'), view]),
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('startupGroupLabel'), group]),
          ]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              store.patchSettings({
                startupView: view.value,
                startupGroup: group.value,
                startOnOnlineFavorites: group.value === ONLINE_FAVORITES_GROUP_ID,
              });
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openPlaybackSettingsPanel() {
      openToolPanel(t('playbackSettingsTitle'), (body, close) => {
        const quality = $('select', { class: 'ctrl-input' }, [
          $('option', { value: '0' }, t('maxQualityAuto')),
          ...[240, 360, 480, 720, 1080, 1440, 2160].map(n => $('option', { value: String(n) }, `${n}p`)),
        ]);
        quality.value = String(Number(store.state.settings.maxStreamHeight) || 0);
        const freeZoom = $('input', { type: 'checkbox', checked: store.state.settings.freeZoom !== false });
        body.append(
          $('div', { style: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' } }, [
            $('label', { style: { display: 'grid', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' } }, [t('maxStreamHeight'), quality]),
            $('label', { class: 'toggle' }, [freeZoom, t('freeZoomLabel')]),
          ]),
          $('div', { class: 'roomgrid-modal-hint', style: { marginTop: '10px' } }, t('freeZoomHint')),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              store.patchSettings({ maxStreamHeight: Number(quality.value) || 0, freeZoom: !!freeZoom.checked });
              service.refreshQuality();
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openBackupPanel() {
      openToolPanel(t('backupPanel'), (body) => {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(CONFIG_BACKUP_PREFIX)) keys.push(key);
        }
        keys.sort((a, b) => Number(b.slice(CONFIG_BACKUP_PREFIX.length)) - Number(a.slice(CONFIG_BACKUP_PREFIX.length)));
        if (!keys.length) { body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('noBackups'))); return; }
        keys.forEach(key => {
          const ts = Number(key.slice(CONFIG_BACKUP_PREFIX.length));
          body.appendChild($('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '8px 0' } }, [
            $('div', {}, Number.isFinite(ts) ? new Date(ts).toLocaleString() : key),
            $('button', { class: 'ctrl-btn', onclick: () => { const raw = localStorage.getItem(key); if (raw) { backupCurrentConfig(); localStorage.setItem(STORE_KEY, raw); location.reload(); } } }, t('restoreBackup')),
            $('button', { class: 'ctrl-btn danger', onclick: () => { localStorage.removeItem(key); openBackupPanel(); } }, t('deleteBackup')),
          ]));
        });
      });
    }

    function openStatusHistoryPanel() {
      openToolPanel(t('statusHistory'), (body) => {
        const all = loadRoomStatusHistory();
        const rows = Object.entries(all).flatMap(([id, list]) => (Array.isArray(list) ? list : []).map(item => ({ id, ...item })))
          .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
          .slice(0, 120);
        if (!rows.length) { body.appendChild($('div', { class: 'roomgrid-modal-hint' }, t('noStatusHistory'))); return; }
        rows.forEach(row => {
          body.appendChild($('div', { style: { display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' } }, [
            $('span', { style: { color: 'var(--text-muted)' } }, new Date(row.ts).toLocaleString()),
            $('span', {}, row.id),
            $('span', { style: { fontWeight: '750' } }, row.privateLabel || row.status),
          ]));
        });
      });
    }

    function openGroupRulesPanel() {
      openToolPanel(t('groupRules'), (body, close) => {
        const favorite = $('input', { type: 'checkbox', checked: store.state.settings.favoriteFirst !== false });
        body.append(
          $('label', { class: 'toggle' }, [favorite, t('favoriteFirst')]),
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => { store.patchSettings({ favoriteFirst: !!favorite.checked }); close(); } }, t('saveSettings')),
          ]),
        );
      });
    }

    function openTemporaryUrlManager() {
      openToolPanel(t('tempUrlManager'), (body) => {
        const saved = readJsonStorage(SAVED_TEMP_URLS_KEY, []);
        const current = tempRooms.filter(r => r.sourceUrl);
        body.appendChild($('button', { class: 'ctrl-btn primary', onclick: () => {
          const next = [...new Map([...saved, ...current.map(r => ({ url: r.sourceUrl, name: r.displayName || r.id }))].filter(x => x?.url).map(x => [x.url, x])).values()];
          writeJsonStorage(SAVED_TEMP_URLS_KEY, next.slice(0, 80));
          toast(t('copied'));
        } }, t('saveTempUrls')));
        const rows = [...saved, ...current.map(r => ({ url: r.sourceUrl, name: r.displayName || r.id }))];
        if (!rows.length) body.appendChild($('div', { class: 'roomgrid-modal-hint', style: { marginTop: '10px' } }, t('noTempUrls')));
        rows.forEach(row => body.appendChild($('div', { style: { padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px', wordBreak: 'break-all' } }, `${row.name || ''} ${row.url || ''}`)));
      });
    }

    function exportWorkstationSettings() {
      exportSuiteSettings(store.state);
    }

    function importWorkstationSettings() {
      importSuiteSettingsFromGithub({
        onImported: result => {
          document.querySelectorAll('.roomgrid-modal-backdrop').forEach(el => { try { el.remove(); } catch (_) {} });
          toast(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy'));
        },
      });
    }

    function openSettingsCenter() {
      openToolPanel(t('settingsCenter'), (body) => {
        const action = (label, handler, primary = false) => $('button', {
          class: 'ctrl-btn' + (primary ? ' primary' : ''),
          style: { minHeight: '44px', justifyContent: 'flex-start' },
          onclick: handler,
        }, label);
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('settingsOnlyHint')),
          $('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '9px' } }, [
            action(t('startupSettings'), () => openStartupSettings()),
            action(t('layoutSettings'), () => openLayoutSettings()),
            action(t('playbackSettingsTitle'), () => openPlaybackSettingsPanel()),
            action(t('recordingSettingsTitle'), () => openRecordingSettingsPanel()),
            action(t('shortcutPanel'), () => openShortcutPanel()),
            action(t('settingsExport'), () => exportWorkstationSettings(), true),
            action(t('settingsImport'), () => importWorkstationSettings(), true),
            action('Configure GitHub Cloud', () => openGithubSyncSetup()),
            action('Download local backup', () => exportSuiteSettingsLocal(store.state)),
            action('Import local backup', () => importSuiteSettingsFile({ onImported: result => toast(t(result.roomsReplaced ? 'settingsImported' : 'settingsImportedLegacy')) })),
          ]),
        );
      });
    }

    function openShortcutPanel() {
      openToolPanel(t('shortcutPanel'), (body, close) => {
        const actions = [
          ['focusAdd', t('shortcutFocusAdd')],
          ['refreshAll', t('shortcutRefreshAll')],
          ['gridView', t('shortcutGridView')],
          ['focusView', t('shortcutFocusView')],
          ['pureMode', t('shortcutPureMode')],
          ['focusThumbs', t('shortcutFocusThumbs')],
          ['recordingCenter', t('shortcutRecordingCenter')],
          ['recordPage', t('shortcutRecordPage')],
        ];
        const current = sanitizeShortcuts(store.state.settings.shortcuts, defaultShortcuts());
        const inputs = {};
        const gridBox = $('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(160px,1fr) minmax(140px,220px)', gap: '8px 10px', alignItems: 'center' } });
        actions.forEach(([action, label]) => {
          const input = $('input', {
            class: 'ctrl-input',
            value: shortcutLabel(current[action]),
            readonly: true,
            onkeydown: (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.key === 'Backspace' || e.key === 'Delete') {
                input.dataset.spec = '';
                input.value = '';
                return;
              }
              const spec = shortcutFromEvent(e);
              if (!spec) return;
              input.dataset.spec = spec;
              input.value = shortcutLabel(spec);
            },
          });
          input.dataset.spec = current[action];
          inputs[action] = input;
          gridBox.append($('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, label), input);
        });
        body.append(
          $('div', { class: 'roomgrid-modal-hint' }, t('shortcutCaptureHint')),
          gridBox,
          $('div', { class: 'roomgrid-modal-actions' }, [
            $('button', { class: 'ctrl-btn', onclick: () => {
              const defaults = defaultShortcuts();
              for (const [action, input] of Object.entries(inputs)) {
                input.dataset.spec = defaults[action] || '';
                input.value = shortcutLabel(defaults[action] || '');
              }
            } }, t('resetShortcuts')),
            $('button', { class: 'ctrl-btn', onclick: close }, t('importReviewCancel')),
            $('button', { class: 'ctrl-btn primary', onclick: () => {
              const next = {};
              for (const [action, input] of Object.entries(inputs)) next[action] = normalizeShortcutSpec(input.dataset.spec || '');
              store.patchSettings({ shortcuts: sanitizeShortcuts(next, defaultShortcuts()) });
              close();
            } }, t('saveSettings')),
          ]),
        );
      });
    }

    function loadSavedTemporarySources() {
      const saved = readJsonStorage(SAVED_TEMP_URLS_KEY, []);
      if (!Array.isArray(saved)) return;
      saved.slice(0, 80).forEach(item => {
        if (!isSafeHttpUrl(item?.url) || !isDirectMediaUrl(item.url)) return;
        const id = tempIdFromUrl(item.url);
        if (findRoomAny(id)) return;
        const activeGroup = store.state.settings.activeGroup;
        const groupId = (!activeGroup || activeGroup === LIBRARY_GROUP_ID || activeGroup === ONLINE_GROUP_ID || activeGroup === ONLINE_FAVORITES_GROUP_ID || activeGroup === ONLINE_FOLLOWING_GROUP_ID) ? DEFAULT_GROUP_ID : activeGroup;
        tempRooms.push({ id, displayName: item.name || new URL(item.url).hostname, sourceUrl: item.url, group: groupId, groups: [groupId], addedAt: Date.now(), order: 100000 + tempRooms.length, lastStatus: 'online', lastSeenOnline: Date.now(), muted: false, temporary: true });
      });
    }

    /* ---- 卡片"更多"操作菜单（全屏 / 移动到分组 / 主屏聚焦）---- */
    let cardOpsMenuCleanup = null;
    function closeCardOpsMenu() {
      if (typeof cardOpsMenuCleanup === 'function') cardOpsMenuCleanup();
      cardOpsMenuCleanup = null;
      document.body?.classList.remove('rg-card-menu-open');
    }

    function openCardOpsMenu(e, roomId, card) {
      // 关闭已有的卡片菜单
      const existing = document.querySelector('.card-ops-menu-pop');
      if (existing) { closeCardOpsMenu(); return; }
      const rect = e.currentTarget?.getBoundingClientRect?.() || card?.getBoundingClientRect?.() || { left: e.clientX || 0, right: e.clientX || 0, bottom: e.clientY || 0 };
      const usePointer = Number.isFinite(e.clientX) && Number.isFinite(e.clientY) && !e.currentTarget?.classList?.contains('icon-btn');
      const menu = $('div', { class: 'menu-pop card-ops-menu-pop', style: { minWidth: '190px' } });

      const item = (icon, label, onclick) => setElementHint($('button', {
        title: label,
        onclick: () => { closeCardOpsMenu(); onclick(); },
      }, label), label);

      // 主屏切换（focus 模式专属）
      if (store.state.settings.viewMode === 'focus') {
        const isFocused = store.state.settings.focusedRoomId === roomId;
        menu.appendChild(item(isFocused ? '' : '', isFocused
          ? (LANG === 'zh' ? '已是主屏' : 'Currently main')
          : (LANG === 'zh' ? '设为主屏' : 'Set as main'),
          () => { if (!isFocused) store.patchSettings({ focusedRoomId: roomId }); }));
      }
      menu.appendChild(item('', service.isPaused(roomId) ? t('opResume') : t('opPause'), () => service.togglePause(roomId)));
      menu.appendChild(item('', t('opRefresh'), () => service.refresh(roomId)));
      const currentRoom = store.state.rooms.find(x => x.id === roomId);
      const followingRoom = findOnlineFollowingRoom(roomId);
      if (!currentRoom && followingRoom) {
        menu.appendChild(item('', LANG === 'zh' ? '添加房间' : 'Add room', () => saveOnlineFollowingRoom(roomId)));
      }
      if (followingRoom) {
        const unfollowItem = item('', t('opUnfollowAccount'), () => { void unfollowOnlineFollowingRoom(roomId); });
        unfollowItem.style.color = '#f87171';
        menu.appendChild(unfollowItem);
      }
      if (isLikelyUsername(roomId)) {
        menu.appendChild(item('', t('opCopyRoomLink'), () => { void copyRoomPageLink(roomId); }));
        const recuItem = item('', t('opOpenRecu'), () => openRoomRecuProfile(roomId));
        recuItem.classList.add('card-menu-recu');
        recuItem.style.color = '#d8a7f0';
        menu.appendChild(recuItem);
      }
      if (currentRoom) {
        menu.appendChild(item('', currentRoom.muted ? (LANG === 'zh' ? '取消静音' : 'Unmute') : (LANG === 'zh' ? '静音' : 'Mute'), () => {
          store.patchRoom(roomId, { muted: !currentRoom.muted });
          requestAnimationFrame(() => applyMute(roomId));
        }));
      }
      const inFav = currentRoom ? roomInGroup(currentRoom, FAVORITE_GROUP_ID) : false;
      if (currentRoom) {
        menu.appendChild(item(inFav ? '' : '', inFav ? t('opFavoriteRemove') : t('opFavoriteAdd'), () => store.toggleRoomInGroup(roomId, FAVORITE_GROUP_ID)));
      }
      if (currentRoom || followingRoom) {
        menu.appendChild(item('', t('opAddSplit'), () => handleAddRoomToSplit(roomId)));
      }
      menu.appendChild(item('', t('opScreenshot'), () => captureCardScreenshot(roomId)));
      menu.appendChild(item('', recordings.has(roomId) ? t('opRecordStop') : t('opRecordStart'), () => toggleCardRecording(roomId)));
      menu.appendChild(item('', t('opCopyUsername'), async () => { await copyText(roomId); toast(t('copied')); }));
      if (currentRoom) {
        menu.appendChild(item('', t('opMoveGroup'), () => openMoveMenu(e, roomId)));
        menu.appendChild(item('', t('opDeleteRoom'), () => { stopCardRecording(roomId, true); service.stop(roomId); store.removeRoom(roomId); }));
      }

      if (phoneEnvironment || store.state.settings.viewMode === 'phone') {
        const backdrop = $('div', { class: 'card-ops-menu-backdrop', role: 'presentation' });
        const closeOnEscape = (event) => { if (event.key === 'Escape') closeCardOpsMenu(); };
        cardOpsMenuCleanup = () => {
          menu.remove();
          backdrop.remove();
          document.removeEventListener('keydown', closeOnEscape);
          document.body?.classList.remove('rg-card-menu-open');
        };
        backdrop.appendChild(menu);
        backdrop.addEventListener('click', event => { if (event.target === backdrop) closeCardOpsMenu(); });
        document.body.appendChild(backdrop);
        document.body.classList.add('rg-card-menu-open');
        document.addEventListener('keydown', closeOnEscape);
        menu.querySelector('button')?.focus({ preventScroll: true });
      } else {
        const close = (event) => { if (!menu.contains(event.target)) closeCardOpsMenu(); };
        const closeOnLayoutChange = () => closeCardOpsMenu();
        cardOpsMenuCleanup = () => {
          menu.remove();
          document.removeEventListener('click', close);
          window.removeEventListener('resize', closeOnLayoutChange);
          grid.removeEventListener('scroll', closeOnLayoutChange);
        };
        document.body.appendChild(menu);
        Object.assign(menu.style, { position: 'fixed', right: 'auto', bottom: 'auto' });
        const viewport = window.visualViewport;
        const viewportLeft = Number(viewport?.offsetLeft || 0);
        const viewportTop = Number(viewport?.offsetTop || 0);
        const viewportWidth = Number(viewport?.width || window.innerWidth);
        const viewportHeight = Number(viewport?.height || window.innerHeight);
        const margin = 8;
        const maxHeight = Math.max(120, viewportHeight - margin * 2);
        menu.style.maxHeight = `${maxHeight}px`;
        const menuWidth = Math.min(Math.max(menu.offsetWidth, 190), Math.max(190, viewportWidth - margin * 2));
        const menuHeight = Math.min(menu.scrollHeight, maxHeight);
        const anchorX = usePointer ? e.clientX : rect.right - menuWidth;
        const left = Math.max(viewportLeft + margin, Math.min(anchorX, viewportLeft + viewportWidth - menuWidth - margin));
        const belowTop = (usePointer ? e.clientY : rect.bottom) + 4;
        const aboveBottom = (usePointer ? e.clientY : rect.top) - 4;
        const viewportBottom = viewportTop + viewportHeight;
        const spaceBelow = viewportBottom - belowTop - margin;
        const spaceAbove = aboveBottom - viewportTop - margin;
        const top = (spaceBelow >= menuHeight || spaceBelow >= spaceAbove)
          ? Math.max(viewportTop + margin, Math.min(belowTop, viewportBottom - menuHeight - margin))
          : Math.max(viewportTop + margin, aboveBottom - menuHeight);
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        window.addEventListener('resize', closeOnLayoutChange, { passive: true });
        grid.addEventListener('scroll', closeOnLayoutChange, { passive: true });
        setTimeout(() => document.addEventListener('click', close), 0);
      }
    }

    /* ---- 拖拽落点写回 store ---- */
    function reorderByDrop(fromId, toId, position /* 'before' | 'after' */) {
      fromId = normalizeUsername(fromId);
      toId = normalizeUsername(toId);
      if (!fromId || !toId || fromId === toId) return;

      const ag = store.state.settings.activeGroup || DEFAULT_GROUP_ID;
      const targetGroup = ag === ONLINE_FAVORITES_GROUP_ID
        ? FAVORITE_GROUP_ID
        : ((ag === LIBRARY_GROUP_ID || ag === ONLINE_GROUP_ID || ag === ONLINE_FOLLOWING_GROUP_ID) ? undefined : ag);
      const manualRooms = (ag === LIBRARY_GROUP_ID ? [...store.state.rooms] : store.state.rooms.filter(r => roomInGroup(r, ag)))
        .sort((a, b) => roomOrderInGroup(a, ag) - roomOrderInGroup(b, ag) || a.id.localeCompare(b.id));
      const manualIds = manualRooms.map(r => r.id);

      // 以当前屏幕实际可见顺序为准进行插入；再把结果合并回完整手动顺序。
      // 这样在分页、搜索、隐藏离线/私密时，隐藏房间不会被错误重排或产生重复 order。
      const visibleIds = visibleRooms().map(r => r.id).filter(id => manualIds.includes(id));
      const fi = visibleIds.indexOf(fromId);
      let ti = visibleIds.indexOf(toId);
      if (fi < 0 || ti < 0) return;
      visibleIds.splice(fi, 1);
      if (fi < ti) ti--;
      if (position === 'after') ti++;
      visibleIds.splice(Math.max(0, Math.min(visibleIds.length, ti)), 0, fromId);

      const visibleSet = new Set(visibleIds);
      let cursor = 0;
      const mergedIds = manualIds.map(id => visibleSet.has(id) ? visibleIds[cursor++] : id);
      while (cursor < visibleIds.length) mergedIds.push(visibleIds[cursor++]);

      const patch = {};
      if (store.state.settings.sortBy !== 'manual') patch.sortBy = 'manual';
      if (store.state.settings.viewMode === 'focus') {
        const focusedId = store.state.settings.focusedRoomId;
        // 主屏与副屏互拖时按“交换屏幕位置”处理：拖副屏到主屏，副屏变主屏；拖主屏到副屏，目标变主屏。
        if (focusedId === toId && fromId !== focusedId) patch.focusedRoomId = fromId;
        else if (focusedId === fromId && toId !== focusedId) patch.focusedRoomId = toId;
      }

      store.reorderRooms(mergedIds, targetGroup);
      if (Object.keys(patch).length) store.patchSettings(patch);
    }

    function openMoveMenu(e, roomId) {
      const groups = [...store.state.groups].sort((a, b) => a.order - b.order);
      const r = store.state.rooms.find(x => x.id === roomId);
      const groupDisplayName = (g) => {
        if (g.name === '__library__') return t('groupLibrary');
        if (g.name === '__all__') return t('groupAll');
        if (g.name === '__online_favorites__') return t('groupOnlineFav');
        if (g.name === '__online_following__') return t('groupOnlineFollowing');
        if (g.name === '__online__') return t('groupOnline');
        if (g.name === '__fav__') return t('groupFav');
        return g.name;
      };
      const menu = $('div', { class: 'menu-pop',
        style: { left: e.clientX + 'px', top: e.clientY + 'px' } });
      groups.filter(g => g.id !== LIBRARY_GROUP_ID && g.id !== ONLINE_GROUP_ID && g.id !== ONLINE_FAVORITES_GROUP_ID && g.id !== ONLINE_FOLLOWING_GROUP_ID).forEach(g => {
        const inGroup = roomInGroup(r, g.id);
        const label = (inGroup ? ' ' : ' ') + groupDisplayName(g);
        menu.appendChild($('button', {
          title: groupDisplayName(g),
          onclick: () => { store.toggleRoomInGroup(roomId, g.id); menu.remove(); },
          style: inGroup ? { color: 'var(--accent)' } : {},
        }, label));
      });
      document.body.appendChild(menu);
      const close = (ev) => { if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener('click', close); } };
      setTimeout(() => document.addEventListener('click', close), 0);
    }

    /* ---- 更多菜单按钮触发 ---- */
    let _moreMenuClose = null;
    function openMoreMenu(anchor) {
      const existing = document.querySelector('.rg-control-backdrop');
      if (existing) {
        existing.remove();
        document.body.classList.remove('rg-control-drawer-open');
        _moreMenuClose = null;
        return;
      }

      const backdrop = $('div', { class: 'rg-control-backdrop' });
      const drawer = $('aside', { class: 'rg-control-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': LANG === 'zh' ? '工作台控制' : 'Workshop controls' });
      const menu = $('div', {
        class: 'menu-pop more-menu-pop',
      });
      const closeDrawer = () => {
        backdrop.remove();
        document.body.classList.remove('rg-control-drawer-open');
        _moreMenuClose = null;
      };
      const closeButton = $('button', { class: 'rg-control-drawer-close', type: 'button', 'aria-label': 'Close controls', onclick: closeDrawer }, '×');
      drawer.append(
        $('div', { class: 'rg-control-drawer-head' }, [$('strong', {}, LANG === 'zh' ? '工作台控制' : 'Workshop controls'), closeButton]),
        $('div', { class: 'rg-control-drawer-body' }, [menu]),
      );
      backdrop.appendChild(drawer);
      backdrop.addEventListener('click', event => { if (event.target === backdrop) closeDrawer(); });

      const sectionLabel = (zh, en) => LANG === 'zh' ? zh : en;
      const divider = () => $('div', { style: { height: '1px', background: 'var(--border)', margin: '6px 0' } });
      const sectionTitle = (label) => $('div', {
        style: {
          padding: '7px 10px 4px',
          fontSize: '11px',
          lineHeight: '1',
          color: 'var(--text-muted)',
          fontWeight: '750',
          letterSpacing: '.02em',
        },
      }, label);
      const item = (label, onClick, opts = {}) => $('button', {
        class: opts.danger ? 'danger' : '',
        title: opts.title || label,
        onclick: () => {
          closeDrawer();
          try { onClick?.(); } catch (err) { console.warn('[RoomGrid] menu action failed', err); }
        },
      }, label);
      const addSection = (label, items) => {
        const section = $('section', { class: 'rg-drawer-section' }, [sectionTitle(label)]);
        items.filter(Boolean).forEach(el => section.appendChild(el));
        menu.appendChild(section);
      };
      const drawerControl = (label, control) => $('label', { class: 'rg-drawer-control' }, [$('span', {}, label), control]);

      const currentPageIds = () => {
        return currentPageRoomIds();
      };

      addSection(sectionLabel('筛选与播放', 'Filters and playback'), [
        drawerControl(sectionLabel('状态', 'Status'), filterSel),
        drawerControl(sectionLabel('排序', 'Sort'), sortSel),
        drawerControl(sectionLabel('音量', 'Volume'), volSlider),
      ]);

      addSection(sectionLabel('界面', 'Interface'), [
        item(t('settingsCenter'), () => openSettingsCenter()),
        item(t('menuLayoutSettings'), () => openLayoutSettings()),
        item(t('menuPlaybackSettings'), () => openPlaybackSettingsPanel()),
        item(store.state.settings.toolbarCollapsed ? sectionLabel('显示顶部工具栏', 'Show top controls') : sectionLabel('收起顶部工具栏', 'Collapse top controls'), () => {
          { const v = !store.state.settings.toolbarCollapsed; document.body.classList.toggle('rg-toolbar-collapsed', v); store.patchSettings({ toolbarCollapsed: v }); }
        }),
        item(store.state.settings.sidebarCollapsed ? sectionLabel('显示左侧分组', 'Show groups') : sectionLabel('收起左侧分组', 'Collapse groups'), () => {
          { const v = !store.state.settings.sidebarCollapsed; document.body.classList.toggle('rg-sidebar-collapsed', v); sidebar.classList.toggle('is-collapsed', v); store.patchSettings({ sidebarCollapsed: v }); }
        }),
        item(t('menuPureMode'), () => togglePureMode(), { title: t('pureModeHint') }),
      ]);

      addSection(sectionLabel('窗口', 'Windows'), [
        item(t('menuToggleFit'), () => toggleVideoFit(), { title: t('videoFitHint') }),
        item(t('menuToggleThumbs'), () => toggleFocusThumbs(), { title: t('focusThumbsHint') }),
        item(t('menuPauseVisible'), () => {
          const ids = currentPageIds();
          service.pauseAll(ids);
          requestAnimationFrame(() => ids.forEach(updateCardButtons));
          toast(t('pausedVisible'));
        }, { title: t('menuPauseVisible') }),
        item(t('menuResumeVisible'), () => {
          const ids = currentPageIds();
          service.resumeAll(ids);
          requestAnimationFrame(() => ids.forEach(updateCardButtons));
          toast(t('resumedVisible'));
        }, { title: t('menuResumeVisible') }),
        item(t('menuMuteAll'), () => {
          store.setAllMuted(true);
          requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
        }),
        item(t('menuUnmuteAll'), () => {
          store.setAllMuted(false);
          requestAnimationFrame(() => store.state.rooms.forEach(r => applyMute(r.id)));
        }),
        item(t('batchOpenCurrentPage'), () => openCurrentPageRooms()),
        item(t('batchMoveCurrentPage'), () => moveCurrentPageToGroup()),
      ]);

      addSection(sectionLabel('录制', 'Recording'), [
        item(t('recorderOpenHub'), () => UnifiedRecorder.openHub(true)),
        item(t('menuRecordingCenter'), () => openRecordingCenter()),
        item(t('menuRecordingSettings'), () => openRecordingSettingsPanel()),
        item(t('recordCurrentPage'), () => recordCurrentPage()),
        item(t('recordCurrentGroup'), () => recordCurrentGroup()),
        item(t('recordOnlineRooms'), () => recordOnlineRooms()),
        item(store.state.settings.showRecordingOnly ? t('hideRecordingOnly') : t('showRecordingOnly'), () => {
          store.patchSettings({ showRecordingOnly: !store.state.settings.showRecordingOnly, pageIndex: 0 });
        }),
        item(t('menuStopRecordings'), () => stopAllRecordings({ final: true })),
      ]);

      addSection(sectionLabel('数据', 'Data'), [
        item(t('manualImport'), () => openManualImportPrompt(), { title: t('manualImport') }),
        item(t('menuBackupPanel'), () => openBackupPanel()),
        item(t('menuStatusHistory'), () => openStatusHistoryPanel()),
        item(t('menuGroupRules'), () => openGroupRulesPanel()),
        item(t('menuTempUrlManager'), () => openTemporaryUrlManager()),
        item(t('menuShareWorkspace'), () => openSharePanel()),
        item(t('menuExport'), () => {
          const data = JSON.stringify(sanitizeState(store.state), null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          downloadBlob(blob, `roomgrid-config-${Date.now()}.json`);
        }),
        item(t('menuImport'), () => {
          const inp = $('input', { type: 'file', accept: 'application/json',
            style: { display: 'none' },
            onchange: async (e) => {
              const f = e.target.files[0];
              if (!f) { try { inp.remove(); } catch (_) {} return; }
              try {
                if (f.size > MAX_CONFIG_BYTES) throw new Error('file too large');
                const text = await f.text();
                const obj = sanitizeState(JSON.parse(text));
                if (!obj.rooms.length && !confirm(LANG === 'zh' ? '导入文件里没有有效房间，仍要继续？' : 'No valid rooms found in this file. Continue?')) return;
                const summary = LANG === 'zh'
                  ? `导入配置将替换当前配置。\n\n当前：${store.state.rooms.length} 个房间 / ${store.state.groups.length} 个分组\n导入：${obj.rooms.length} 个房间 / ${obj.groups.length} 个分组\n\n已尽量保存最近 ${MAX_CONFIG_BACKUPS} 个备份。继续？`
                  : `Importing will replace the current config.\n\nCurrent: ${store.state.rooms.length} rooms / ${store.state.groups.length} groups\nImport: ${obj.rooms.length} rooms / ${obj.groups.length} groups\n\nThe last ${MAX_CONFIG_BACKUPS} backups are kept when possible. Continue?`;
                if (!confirm(summary)) return;
                obj.settings.toolbarCollapsed = false;
                obj.settings.sidebarCollapsed = false;
                backupCurrentConfig();
                writeStoreRaw(JSON.stringify(obj));
                location.reload();
              } catch (err) {
                alert('Import failed: ' + err.message);
              } finally {
                setTimeout(() => { try { inp.remove(); } catch (_) {} }, 0);
              }
            },
          });
          document.body.appendChild(inp); inp.click();
          setTimeout(() => { try { if (!inp.files || !inp.files.length) inp.remove(); } catch (_) {} }, 60000);
        }),
        item(t('menuCopyUsernames'), async () => {
          await copyText(store.state.rooms.map(r => r.id).sort().join('\n'));
          toast(t('copied'));
        }),
        item(t('menuExportUsernames'), () => {
          const names = store.state.rooms.map(r => r.id).sort().join('\n');
          downloadBlob(new Blob([names + (names ? '\n' : '')], { type: 'text/plain;charset=utf-8' }), `roomgrid-usernames-${Date.now()}.txt`);
        }),
        item(t('menuRepairData'), () => {
          store.repairData();
          alert(t('repairDone'));
        }),
      ]);

      addSection(sectionLabel('语言', 'Language'), [
        $('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '0 8px 4px' } }, [
          $('button', {
            style: {
              padding: '7px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: LANG === 'zh' ? 'var(--accent)' : 'var(--bg-input)',
              color: LANG === 'zh' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
            },
            onclick: () => { closeDrawer(); setLang('zh'); },
          }, t('langZh')),
          $('button', {
            style: {
              padding: '7px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: LANG === 'en' ? 'var(--accent)' : 'var(--bg-input)',
              color: LANG === 'en' ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '12px',
            },
            onclick: () => { closeDrawer(); setLang('en'); },
          }, t('langEn')),
        ]),
      ]);

      addSection(sectionLabel('帮助', 'Help'), [
        item(t('menuShortcutPanel'), () => openShortcutPanel(), { title: t('menuShortcutPanel') }),
        item(t('menuShortcutHelp'), () => alert(t('shortcutsHelp')), { title: t('menuShortcutHelp') }),
        item(t('menuAbout'), () => showAboutPanel(), { title: t('menuAbout') }),
      ]);

      menu.appendChild(item(t('menuClearAll'), () => {
        if (confirm(t('clearAllConfirm'))) {
          try { service.stopAll(); } catch (_) { stopAllPageMedia(); }
          Storage.clearAll();
          location.reload();
        }
      }, { danger: true }));

      document.body.appendChild(backdrop);
      document.body.classList.add('rg-control-drawer-open');
      _moreMenuClose = closeDrawer;
      closeButton.focus();
    }

    /* ---- 关于面板（含 ETH 捐赠地址）---- */

    function showAboutPanel() {
      const overlay = $('div', {
        style: {
          position: 'fixed', inset: '0', background: 'rgba(17,24,39,.32)', backdropFilter: 'blur(2px)',
          zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        onclick: (e) => { if (e.target === overlay) overlay.remove(); },
      });

      const card = $('div', {
        style: {
          background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px',
          padding: '26px 28px', minWidth: '340px', maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)', color: 'var(--text)',
        },
      });

      const row = (label, value) => $('div', {
        style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0',
          borderBottom: '1px solid var(--border)', fontSize: '13px' },
      }, [
        $('span', { style: { color: 'var(--text-muted)' } }, label),
        $('span', { style: { color: 'var(--text)', fontFamily: 'ui-monospace,monospace' } }, value),
      ]);

      const copyBtn = $('button', {
        style: {
          padding: '4px 10px', fontSize: '11px', background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)',
          border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '8px',
        },
        onclick: async () => {
          try {
            await navigator.clipboard.writeText(META.eth);
            copyBtn.textContent = t('aboutCopied');
            setTimeout(() => { copyBtn.textContent = t('aboutCopyAddr'); }, 1500);
          } catch (_) {
            // fallback
            const ta = $('textarea', { value: META.eth, style: { position: 'fixed', opacity: '0' } });
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); copyBtn.textContent = t('aboutCopied'); } catch(_) {}
            ta.remove();
            setTimeout(() => { copyBtn.textContent = t('aboutCopyAddr'); }, 1500);
          }
        },
      }, t('aboutCopyAddr'));

      card.append(
        $('div', { style: { fontSize: '20px', fontWeight: '700', marginBottom: '4px' } }, t('aboutTitle')),
        $('div', { style: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.45' } }, `${t('title')} · ${t('appTagline')}`),
        row(t('aboutAuthor'), META.author),
        row(t('aboutVersion'), 'v' + META.version),
        row(t('aboutLicense'), META.license),
        // 捐赠区（次级展示）
        $('div', {
          style: {
            marginTop: '20px', padding: '14px', background: 'var(--bg)',
            border: '1px dashed var(--border-strong)', borderRadius: '10px',
          },
        }, [
          $('div', { style: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' } }, t('aboutDonate')),
          $('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' } }, t('aboutDonateAddrLabel') + ' (Ethereum / EVM):'),
          $('div', {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-input)', padding: '8px 10px', borderRadius: '6px',
              fontSize: '11px', fontFamily: 'ui-monospace,monospace', wordBreak: 'break-all',
            },
          }, [
            $('span', { style: { flex: '1', color: 'var(--text-secondary)' } }, META.eth),
            copyBtn,
          ]),
        ]),
        $('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '20px' } }, [
          $('button', {
            style: { padding: '8px 18px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
            onclick: () => overlay.remove(),
          }, t('aboutClose')),
        ]),
      );

      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    function visibleRooms() {
      const s = store.state;
      const ag = s.settings.activeGroup || DEFAULT_GROUP_ID;
      const sourceRooms = ag === ONLINE_FOLLOWING_GROUP_ID ? onlineFollowingRooms() : regularRoomsForView();
      let list = ag === ONLINE_FOLLOWING_GROUP_ID
        ? sourceRooms
        : (ag === LIBRARY_GROUP_ID ? [...sourceRooms] : sourceRooms.filter(r => roomInGroup(r, ag)));
      const q = normalizeUsername(s.settings.searchQuery || '');
      if (q) list = list.filter(r => normalizeUsername(r.id).includes(q));
      const f = s.settings.filter;
      if (f.hideOffline) list = list.filter(r => r.lastStatus !== 'offline');
      if (f.hidePrivate) list = list.filter(r => r.lastStatus !== 'private');
      if (f.onlyOnline) list = list.filter(r => r.lastStatus === 'online');
      if (s.settings.showRecordingOnly) list = list.filter(r => recordings.has(r.id));
      if (ag === ONLINE_FOLLOWING_GROUP_ID) {
        // applyOnlineFollowingRooms already maintains the stable initial order
        // and appends newly-online rooms. Re-sorting the full followed list on
        // every pager/sidebar query caused avoidable O(n log n) work and card
        // movement, so return that maintained order directly.
        return list;
      }
      const sb = s.settings.sortBy;
      if (sb === 'manual') list.sort((a, b) => roomOrderInGroup(a, ag) - roomOrderInGroup(b, ag));
      else if (sb === 'name') list.sort((a, b) => a.id.localeCompare(b.id));
      else if (sb === 'favoriteName') list.sort((a, b) => {
        const favoriteDelta = Number(roomInGroup(b, FAVORITE_GROUP_ID)) - Number(roomInGroup(a, FAVORITE_GROUP_ID));
        return favoriteDelta || a.id.localeCompare(b.id);
      });
      else if (sb === 'addedAt') list.sort((a, b) => b.addedAt - a.addedAt);
      else if (sb === 'status') {
        const rank = { online: 0, private: 1, loading: 2, error: 3, offline: 4, unknown: 5 };
        list.sort((a, b) => (rank[a.lastStatus] ?? 9) - (rank[b.lastStatus] ?? 9));
      }
      if (sb !== 'favoriteName' && s.settings.favoriteFirst !== false && ag !== FAVORITE_GROUP_ID) {
        list = list
          .map((room, idx) => ({ room, idx, fav: roomInGroup(room, FAVORITE_GROUP_ID) ? 1 : 0 }))
          .sort((a, b) => (b.fav - a.fav) || (a.idx - b.idx))
          .map(item => item.room);
      }
      return list;
    }

    function renderCardState(room) {
      const c = cardMap.get(room.id);
      if (!c) return;
      const muted = room.muted;
      const meta = statusMeta(room.lastStatus);
      if (c.infoMeta) {
        const parts = [meta.label];
        if (Number(room.viewerCount) > 0) parts.push(`${Number(room.viewerCount).toLocaleString()} ${LANG === 'zh' ? '观众' : 'viewers'}`);
        if (room.lastSeenOnline && room.lastStatus !== 'online') parts.push(`${LANG === 'zh' ? '最近在线' : 'last online'} ${fmtTime(room.lastSeenOnline)}`);
        if (room.privateLabel) parts.push(room.privateLabel);
        c.infoMeta.textContent = parts.join(' · ');
      }

      c.badge.replaceChildren();
      c.badge.append(
        $('span', { class: 'dot', style: { background: meta.color } }),
        $('span', { class: 'pill-text' }, meta.label),
        muted ? $('span', { style: { marginLeft: '4px', fontSize: '10px', color: 'var(--text-muted)' } }, LANG === 'zh' ? '静音' : 'Muted') : null,
      );
      updateCardButtons(room.id);

      // 状态覆盖层文本 + video DOM 清理
      if (room.lastStatus === 'online') {
        c.root.classList.remove('not-online');
        c.statusEl.style.display = 'none';
        applyMute(room.id);
        resumeWaitingRecording(room.id);
      } else {
        c.root.classList.add('not-online');
        c.statusEl.style.display = 'flex';
        pauseRecordingForSourceLoss(room.id);
        // 关键修复：状态非 online 时彻底清理 video 节点。
        // 否则会在卡片中央显示大黑块，且可能残留音频。
        if (c.video) {
          service.detachVideo(room.id);
          c.video = null;
        } else {
          service.detachVideo(room.id);
        }
        const lines = [
          $('div', { class: 'status-icon', style: { color: meta.color } }, [$('span', { class: 'status-dot-large' })]),
          $('div', { class: 'status-chip', style: { color: meta.color } }, meta.label),
          room.lastSeenOnline
            ? $('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, t('lastSeen', fmtTime(room.lastSeenOnline)))
            : null,
          (room.lastStatus === 'offline' || room.lastStatus === 'private')
            ? $('div', { style: { fontSize: '10px', color: 'var(--text-muted)', opacity: '.7' } }, t('autoDetect'))
            : null,
          (room.lastStatus === 'offline' || room.lastStatus === 'private' || room.lastStatus === 'error')
            ? $('button', {
                class: 'status-retry',
                type: 'button',
                onclick: event => { event.preventDefault(); event.stopPropagation(); service.refresh(room.id); },
              }, room.lastStatus === 'error' ? (LANG === 'zh' ? '重试流' : 'Retry stream') : (LANG === 'zh' ? '立即检查' : 'Check now'))
            : null,
        ];
        c.statusEl.replaceChildren();
        lines.forEach(l => l && c.statusEl.appendChild(l));
      }
    }

    function applyMute(id) {
      const c = cardMap.get(id);
      const r = findRoomAny(id);
      if (!c || !c.video || !r) return;
      const v = store.state.settings.volume;
      const splitIds = store.state.settings.splitRoomIds;
      const splitMuted = !!store.state.settings.splitViewActive && splitIds.includes(id) && store.state.settings.splitAudioRoomId !== id;
      c.video.volume = (r.muted || splitMuted) ? 0 : v;
      c.video.muted = r.muted || splitMuted || v === 0;
    }

    function getVideoTransform(roomId) {
      return sanitizeVideoTransform(store.state.settings.videoTransforms?.[normalizeUsername(roomId)]);
    }

    function buildVideoTransformCss(transform) {
      const t = sanitizeVideoTransform(transform);
      const parts = [];
      if (t.x || t.y) parts.push(`translate(${t.x}px, ${t.y}px)`);
      if (t.zoom !== 1) parts.push(`scale(${t.zoom})`);
      if (t.mirror || t.flip) parts.push(`scale(${t.mirror ? -1 : 1}, ${t.flip ? -1 : 1})`);
      if (t.rotation) parts.push(`rotate(${t.rotation}deg)`);
      return parts.join(' ');
    }

    function patchVideoTransform(roomId, patch) {
      roomId = normalizeUsername(roomId);
      if (!roomId) return;
      const next = sanitizeVideoTransform({ ...getVideoTransform(roomId), ...(patch || {}) });
      store.update(s => {
        s.settings.videoTransforms = sanitizeVideoTransformMap(s.settings.videoTransforms);
        if (isDefaultVideoTransform(next)) delete s.settings.videoTransforms[roomId];
        else s.settings.videoTransforms[roomId] = next;
      }, 'settings:videoTransforms');
      applyVideoTransform(roomId);
    }

    function resetVideoTransform(roomId) {
      patchVideoTransform(roomId, defaultVideoTransform());
    }

    function applyVideoTransform(roomId) {
      const c = cardMap.get(normalizeUsername(roomId));
      if (!c?.video) return;
      const transform = getVideoTransform(roomId);
      const css = buildVideoTransformCss(transform);
      c.video.style.transform = css;
      c.video.style.transformOrigin = 'center center';
      c.video.style.cursor = transform.zoom > 1 ? 'grab' : '';
      c.root.classList.toggle('video-transformed', !isDefaultVideoTransform(transform));
      c.root.classList.toggle('video-zoomed', transform.zoom > 1);
    }

    function applyAllVideoTransforms() {
      cardMap.forEach((_, id) => applyVideoTransform(id));
    }

    let activeCardPan = null;
    window.addEventListener('mousemove', (e) => {
      const pan = activeCardPan;
      if (!pan) return;
      if (!pan.card.isConnected) {
        pan.card.classList.remove('video-panning');
        activeCardPan = null;
        return;
      }
      const cur = getVideoTransform(pan.roomId);
      patchVideoTransform(pan.roomId, {
        x: cur.x + e.clientX - pan.lastX,
        y: cur.y + e.clientY - pan.lastY,
      });
      pan.lastX = e.clientX;
      pan.lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => {
      const pan = activeCardPan;
      if (!pan) return;
      activeCardPan = null;
      pan.card.classList.remove('video-panning');
      applyVideoTransform(pan.roomId);
    });

    function installCardZoomHandlers(card, roomId) {
      const isUiTarget = (target) => !!target?.closest?.('.icon-btn,.menu-pop,.roomgrid-modal-backdrop,button,input,select,textarea,a');
      card.addEventListener('wheel', (e) => {
        if (store.state.settings.freeZoom === false || (!e.ctrlKey && !e.metaKey) || isUiTarget(e.target)) return;
        e.preventDefault();
        const cur = getVideoTransform(roomId);
        const nextZoom = Math.max(1, Math.min(20, cur.zoom * (e.deltaY < 0 ? 1.12 : 0.88)));
        const rounded = Math.round(nextZoom * 100) / 100;
        patchVideoTransform(roomId, { zoom: rounded, x: rounded === 1 ? 0 : cur.x, y: rounded === 1 ? 0 : cur.y });
      }, { passive: false });
      card.addEventListener('mousedown', (e) => {
        if (store.state.settings.freeZoom === false || e.button !== 0 || isUiTarget(e.target)) return;
        const cur = getVideoTransform(roomId);
        if (cur.zoom <= 1) return;
        if (activeCardPan?.card && activeCardPan.card !== card) activeCardPan.card.classList.remove('video-panning');
        activeCardPan = { card, roomId, lastX: e.clientX, lastY: e.clientY };
        card.classList.add('video-panning');
        const c = cardMap.get(roomId);
        if (c?.video) c.video.style.cursor = 'grabbing';
        e.preventDefault();
      });
    }

    function attachVideoElement(roomId) {
      const c = cardMap.get(roomId);
      if (!c) return null;
      // 移除旧 video：必须同步销毁 HLS，否则旧 buffer 可能继续出声。
      if (c.video) {
        pauseRecordingForSourceLoss(roomId);
        service.detachVideo(roomId);
        c.video = null;
      }
      const video = $('video', {
        controls: false, autoplay: true, playsInline: true, draggable: false, disablePictureInPicture: false,
        controlsList: 'nodownload noplaybackrate nofullscreen',
        dataset: { multicamRoom: roomId, multicamRoomId: roomId },
        class: 'cam-video',
        style: { pointerEvents: 'none', filter: 'none', opacity: '1' },
      });
      try { video.controls = false; video.removeAttribute('controls'); } catch (_) {}
      const r = findRoomAny(roomId);
      const v = store.state.settings.volume;
      video.volume = r?.muted ? 0 : v;
      video.muted = r?.muted || v === 0;
      // Insert inside the card's native media area, immediately behind the status overlay.
      (c.media || c.root).insertBefore(video, c.statusEl);
      c.video = video;
      applyMute(roomId);
      video.addEventListener('play', () => updateCardButtons(roomId));
      video.addEventListener('pause', () => updateCardButtons(roomId));
      video.addEventListener('loadeddata', () => resumeWaitingRecording(roomId));
      video.addEventListener('playing', () => resumeWaitingRecording(roomId));
      service.attachVideo(roomId, video);
      applyVideoTransform(roomId);
      updateCardButtons(roomId);
      setTimeout(() => resumeWaitingRecording(roomId), 1200);
      return video;
    }

    function attachTemporarySource(room) {
      if (!room || !room.sourceUrl) return;
      const c = cardMap.get(room.id);
      if (!c) return;
      const video = attachVideoElement(room.id);
      if (!video) return;
      video.controls = true;
      video.style.pointerEvents = 'auto';
      try { c.tempHls?.destroy?.(); } catch (_) {}
      c.tempHls = null;
      if (isHlsUrl(room.sourceUrl) && window.Hls && Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true, enableWorker: true });
        c.tempHls = hls;
        hls.loadSource(room.sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = room.sourceUrl;
      }
      video.play?.().catch?.(() => {});
      renderCardState(room);
    }

    // ---- Grid 渲染（增量，支持 grid / focus 双模式）----
    function activateSplitAudio(roomId) {
      roomId = normalizeUsername(roomId);
      if (!store.state.settings.splitRoomIds.includes(roomId)) return;
      store.setSplitAudio(roomId);
      const savedRoom = store.state.rooms.find(item => item.id === roomId);
      const room = findRoomAny(roomId);
      if (room?.muted) {
        if (savedRoom) store.patchRoom(roomId, { muted: false });
        else {
          room.muted = false;
          renderCardState(room);
        }
      }
      requestAnimationFrame(() => store.state.settings.splitRoomIds.forEach(applyMute));
    }

    function splitOnlineCycleIds(slot) {
      slot = slot === 1 ? 1 : 0;
      const otherId = store.state.settings.splitRoomIds[slot === 0 ? 1 : 0] || null;
      const currentId = store.state.settings.splitRoomIds[slot] || null;
      const useOnlineFollowing = store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID
        || (!!findOnlineFollowingRoom(currentId) && !savedRoomIndex.has(currentId));
      const rooms = useOnlineFollowing
        ? [...onlineFollowingRooms()].filter(room => room.lastStatus === 'online')
        : store.state.rooms
          .filter(room => roomInGroup(room, ONLINE_GROUP_ID))
          .sort((a, b) => roomOrderInGroup(a, ONLINE_GROUP_ID) - roomOrderInGroup(b, ONLINE_GROUP_ID) || a.id.localeCompare(b.id));
      return rooms
        .filter(room => room.id !== otherId)
        .map(room => room.id);
    }

    function cycleSplitOnline(slot, direction) {
      slot = slot === 1 ? 1 : 0;
      direction = direction < 0 ? -1 : 1;
      const currentId = store.state.settings.splitRoomIds[slot] || null;
      const ids = splitOnlineCycleIds(slot);
      const alternatives = ids.filter(id => id !== currentId);
      if (!alternatives.length) {
        toast(t('splitNoOtherOnline'));
        return false;
      }
      const currentIndex = ids.indexOf(currentId);
      const targetId = currentIndex < 0
        ? (direction < 0 ? ids[ids.length - 1] : ids[0])
        : ids[(currentIndex + direction + ids.length) % ids.length];
      if (!targetId || targetId === currentId) return false;
      return store.setSplitSlot(slot, targetId);
    }

    const SPLIT_TOOLBAR_IDLE_MS = 2400;
    let splitToolbarHideTimer = 0;
    let splitToolbarActivityCleanup = null;
    let splitToolbarLastActivity = 0;

    function cleanupSplitToolbarAutohide(resetActivity = false) {
      clearTimeout(splitToolbarHideTimer);
      splitToolbarHideTimer = 0;
      splitToolbarActivityCleanup?.();
      splitToolbarActivityCleanup = null;
      if (resetActivity) splitToolbarLastActivity = 0;
    }

    function installSplitToolbarAutohide(toolbar) {
      cleanupSplitToolbarAutohide(false);
      const controller = new AbortController();
      const { signal } = controller;

      const setHidden = hidden => {
        if (!toolbar.isConnected) return;
        toolbar.classList.toggle('is-hidden', hidden);
        toolbar.dataset.autohide = hidden ? 'hidden' : 'visible';
        toolbar.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        if ('inert' in toolbar) toolbar.inert = hidden;
      };
      const scheduleHide = () => {
        clearTimeout(splitToolbarHideTimer);
        const remaining = Math.max(0, SPLIT_TOOLBAR_IDLE_MS - (Date.now() - splitToolbarLastActivity));
        splitToolbarHideTimer = setTimeout(() => {
          if (toolbar.matches(':hover') || toolbar.contains(document.activeElement)) {
            splitToolbarLastActivity = Date.now();
            scheduleHide();
            return;
          }
          setHidden(true);
        }, remaining);
      };
      const showAndRearm = () => {
        splitToolbarLastActivity = Date.now();
        setHidden(false);
        scheduleHide();
      };

      grid.addEventListener('pointermove', showAndRearm, { passive: true, signal });
      grid.addEventListener('pointerdown', showAndRearm, { passive: true, signal });
      grid.addEventListener('focusin', showAndRearm, { signal });
      document.addEventListener('keydown', showAndRearm, { signal });
      toolbar.addEventListener('pointerenter', showAndRearm, { passive: true, signal });
      toolbar.addEventListener('pointerleave', scheduleHide, { passive: true, signal });

      if (!splitToolbarLastActivity) splitToolbarLastActivity = Date.now();
      if (Date.now() - splitToolbarLastActivity >= SPLIT_TOOLBAR_IDLE_MS) setHidden(true);
      else {
        setHidden(false);
        scheduleHide();
      }
      splitToolbarActivityCleanup = () => controller.abort();
    }

    function splitToolbarPositionLabel(position) {
      if (position === 'lower-left') return t('splitControlsLowerLeft');
      if (position === 'lower-right') return t('splitControlsLowerRight');
      return t('splitControlsTop');
    }

    function cycleSplitToolbarPosition() {
      const order = ['top', 'lower-right', 'lower-left'];
      const current = store.state.settings.splitToolbarPosition || 'top';
      const next = order[(Math.max(0, order.indexOf(current)) + 1) % order.length];
      store.patchSettings({ splitToolbarPosition: next });
    }

    function cleanupSplitLayout() {
      cleanupSplitToolbarAutohide(true);
      grid.querySelectorAll('.split-pane').forEach(pane => {
        pane.querySelectorAll('.cam-card').forEach(card => grid.appendChild(card));
        pane.remove();
      });
      grid.querySelectorAll('.split-divider,.split-toolbar').forEach(el => el.remove());
    }

    function attachSplitDividerHandlers(divider) {
      let dragging = false;
      let pointerId = null;
      const updateRatio = event => {
        if (!dragging) return;
        const rect = grid.getBoundingClientRect();
        const portrait = rect.height >= rect.width;
        const raw = portrait
          ? ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100
          : ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const ratio = clampInt(raw, 20, 80, 50);
        store.state.settings.splitRatio = ratio;
        grid.style.setProperty('--split-ratio', ratio + '%');
      };
      divider.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        dragging = true;
        pointerId = event.pointerId;
        divider.classList.add('dragging');
        try { divider.setPointerCapture(pointerId); } catch (_) {}
        event.preventDefault();
      });
      divider.addEventListener('pointermove', updateRatio);
      const finish = event => {
        if (!dragging) return;
        updateRatio(event);
        dragging = false;
        divider.classList.remove('dragging');
        try { divider.releasePointerCapture(pointerId); } catch (_) {}
        pointerId = null;
        store.patchSettings({ splitRatio: store.state.settings.splitRatio });
      };
      divider.addEventListener('pointerup', finish);
      divider.addEventListener('pointercancel', finish);
    }

    function renderSplitLayout() {
      reconcileSplitState(store.state);
      const ids = store.state.settings.splitRoomIds;
      const rooms = ids.map(findRoomAny).filter(Boolean);
      if (rooms.length !== 2) {
        store.setSplitActive(false);
        return;
      }

      const wantIds = new Set(ids);
      const allRoomIds = new Set(allRoomsForView().map(room => room.id));
      for (const [id, c] of cardMap) {
        if (wantIds.has(id)) continue;
        forgetCardMedia(id);
        pauseRecordingForSourceLoss(id, { silent: true });
        if (allRoomIds.has(id)) service.detachVideo(id); else service.stop(id);
        try { c.video?.pause(); } catch (_) {}
        try { c.video?.remove(); } catch (_) {}
        c.video = null;
        try { c.resizeObserver?.disconnect(); } catch (_) {}
        c.resizeObserver = null;
        try { c.root.remove(); } catch (_) {}
        cardMap.delete(id);
      }

      const panes = rooms.map((room, slot) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
        }
        resetCardSizing(c.root);
        c.root.classList.add('is-split-card');
        c.root.style.width = '100%';
        c.root.style.height = '100%';
        c.root.style.aspectRatio = 'auto';
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);

        const cycleIds = splitOnlineCycleIds(slot);
        const canCycleOnline = cycleIds.some(id => id !== room.id);
        const prevOnlineBtn = $('button', {
          disabled: !canCycleOnline,
          title: canCycleOnline ? t('splitPrevOnline') : t('splitNoOtherOnline'),
          html: trustedHtml(iconSvg('chevronLeft', 20)),
          onclick: event => { event.stopPropagation(); cycleSplitOnline(slot, -1); },
        });
        const nextOnlineBtn = $('button', {
          disabled: !canCycleOnline,
          title: canCycleOnline ? t('splitNextOnline') : t('splitNoOtherOnline'),
          html: trustedHtml(iconSvg('chevronRight', 20)),
          onclick: event => { event.stopPropagation(); cycleSplitOnline(slot, 1); },
        });
        const audioActive = store.state.settings.splitAudioRoomId === room.id;
        const audioBtn = $('button', {
          class: audioActive ? 'active' : '',
          title: t('splitAudio'),
          html: trustedHtml(iconSvg(audioActive ? 'volume' : 'volumeOff', 18)),
          onclick: event => { event.stopPropagation(); activateSplitAudio(room.id); },
        });
        const replaceBtn = $('button', {
          title: t('splitReplace'),
          html: trustedHtml(iconLabel('refresh', t('splitReplace'), 17)),
          onclick: event => { event.stopPropagation(); openSplitPicker(slot); },
        });
        const controls = $('div', { class: 'split-pane-controls' }, [
          $('div', { class: 'split-pane-label' }, `${t('splitPane', slot + 1)} · ${room.id}`),
          $('div', { class: 'split-pane-actions' }, [prevOnlineBtn, nextOnlineBtn, audioBtn, replaceBtn]),
        ]);
        return $('div', { class: 'split-pane', dataset: { splitSlot: String(slot), roomId: room.id } }, [c.root, controls]);
      });

      const divider = $('div', { class: 'split-divider', title: t('splitDivider'), role: 'separator' });
      attachSplitDividerHandlers(divider);
      const swapBtn = $('button', {
        title: t('splitSwap'),
        html: trustedHtml(iconLabel('swap', t('splitSwap'), 17)),
        onclick: () => store.swapSplitRooms(),
      });
      const toolbarPosition = store.state.settings.splitToolbarPosition || 'top';
      const positionBtn = $('button', {
        title: `${t('splitControlsPosition')} · ${splitToolbarPositionLabel(toolbarPosition)}`,
        html: trustedHtml(iconSvg('move', 18)),
        onclick: () => cycleSplitToolbarPosition(),
      });
      const fullscreenBtn = $('button', {
        title: t('splitFullscreen'),
        html: trustedHtml(iconSvg('expand', 18)),
        onclick: () => { document.fullscreenElement ? document.exitFullscreen() : grid.requestFullscreen().catch(() => {}); },
      });
      const exitBtn = $('button', {
        class: 'split-exit',
        title: t('splitExit'),
        html: trustedHtml(iconLabel('close', t('splitExit'), 17)),
        onclick: () => store.clearSplitSelection(),
      });
      const splitToolbar = $('div', {
        class: `split-toolbar position-${toolbarPosition}`,
        dataset: { position: toolbarPosition },
      }, [positionBtn, swapBtn, fullscreenBtn, exitBtn]);

      grid.replaceChildren(panes[0], divider, panes[1], splitToolbar);
      installSplitToolbarAutohide(splitToolbar);
      grid.style.setProperty('--split-ratio', clampInt(store.state.settings.splitRatio, 20, 80, 50) + '%');
      store.state.settings.splitRoomIds.forEach(applyMute);
      syncSplitButton();
    }

    function renderGrid() {
      const mode = store.state.settings.viewMode;
      const splitActive = !!store.state.settings.splitViewActive
        && Array.isArray(store.state.settings.splitRoomIds)
        && store.state.settings.splitRoomIds.length === 2;
      // 切换 grid class
      grid.classList.toggle('view-grid', (mode === 'grid' || mode === 'phone') && !splitActive);
      grid.classList.toggle('view-phone', mode === 'phone' && !splitActive);
      grid.classList.toggle('view-focus', mode === 'focus' && !splitActive);
      grid.classList.toggle('view-split', splitActive);

      applyGridSize();
      if (splitActive) {
        renderSplitLayout();
        applyPureModeState();
        return;
      }

      cleanupSplitLayout();
      const fullList = renderVisibleRooms();
      syncLayoutControls();
      const list = fullList;
      const wantIds = new Set(list.map(r => r.id));
      pruneRoomMediaQueue(wantIds);

      // 移除不可见/已删除的卡片：先停流再移 DOM，避免删除后残留声音。
      // 如果只是被过滤/分组隐藏，不删除 session，只 detach 媒体，保留后续状态轮询。
      const allRoomIds = new Set(allRoomsForView().map(r => r.id));
      for (const [id, c] of cardMap) {
        if (!wantIds.has(id)) {
          if (!allRoomIds.has(id)) disposeCardEntry(id, { stopSession: true });
          else if (c.root.isConnected) parkCardEntry(id);
        }
      }

      // 空态
      if (fullList.length === 0) {
        if (!grid.querySelector('.empty-state')) {
          grid.replaceChildren();
          grid.style.display = 'flex';
          grid.append($('div', { class: 'empty-state' }, [
            $('div', { style: { fontSize: '60px', opacity: '.3' } }, ''),
            $('div', { style: { fontSize: '15px' } }, t('emptyTitle')),
            $('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, t('emptyHint')),
          ]));
        }
        return;
      }
      // 清掉空态（如果有）
      const empty = grid.querySelector('.empty-state');
      if (empty) empty.remove();

      if (mode === 'focus') {
        renderFocusLayout(list);
      } else {
        renderGridLayout(list);
      }
    }

    /* —— grid 布局：均分 —— */
    function renderGridLayout(list) {
      syncLayoutControls();
      grid.classList.remove('no-bottom');
      // 清掉 focus 模式专属容器
      grid.querySelectorAll('.focused-row, .thumbs-row, .focus-side-row, .focus-bottom-row, .resizer').forEach(el => {
        // 先把里面的 cam-card detach 出来，避免一并被 remove
        el.querySelectorAll('.cam-card').forEach(c => grid.appendChild(c));
        el.remove();
      });

      const orderedCards = document.createDocumentFragment();
      list.forEach((room) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
        }
        activateCardEntry(room.id);
        resetCardSizing(c.root);
        applyCardGridSizing(c.root, room);
        orderedCards.appendChild(c.root);
      });
      grid.appendChild(orderedCards);
      list.forEach((room) => {
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);
      });
    }

    function focusRoom(roomId) {
      if (!roomId) return;
      store.patchSettings({ viewMode: 'focus', focusedRoomId: roomId, focusThumbsCollapsed: false });
    }

    function focusStep(delta) {
      const list = renderVisibleRooms();
      if (!list.length) return;
      const cur = store.state.settings.focusedRoomId;
      let idx = list.findIndex(r => r.id === cur);
      if (idx < 0) idx = 0;
      const next = list[(idx + delta + list.length) % list.length];
      if (next) focusRoom(next.id);
    }

    /* —— focus 模式分隔条拖动：调整主屏宽高，副窗口自适应 —— */
    function attachFocusResizerHandlers(resizer, axis) {
      let dragging = false, startX = 0, startY = 0, startW = 62, startH = 64, currentW = 62, currentH = 64;
      const apply = (w, h) => {
        currentW = Math.max(45, Math.min(76, w));
        currentH = Math.max(44, Math.min(78, h));
        grid.style.gridTemplateColumns = `minmax(260px, ${currentW}fr) 8px minmax(190px, ${100 - currentW}fr)`;
        grid.style.gridTemplateRows = `minmax(220px, ${currentH}fr) 8px minmax(120px, ${100 - currentH}fr)`;
        grid.style.setProperty('--focus-main-w', currentW + 'fr');
        grid.style.setProperty('--focus-side-w', (100 - currentW) + 'fr');
        grid.style.setProperty('--focus-main-h', currentH + 'fr');
        grid.style.setProperty('--focus-bottom-h', (100 - currentH) + 'fr');
        requestAnimationFrame(applyFocusMainSizing);
      };
      resizer.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = Math.max(45, Math.min(76, Number(store.state.settings.focusMainPct || 62)));
        startH = Math.max(44, Math.min(78, Number(store.state.settings.focusMainHPct || 64)));
        currentW = startW;
        currentH = startH;
        resizer.classList.add('dragging');
        document.body.style.cursor = axis === 'x' ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      const move = (e) => {
        if (!dragging) return;
        if (axis === 'x') {
          const gridW = Math.max(1, grid.clientWidth || window.innerWidth || 1);
          apply(startW + ((e.clientX - startX) / gridW) * 100, currentH);
        } else {
          const gridH = Math.max(1, grid.clientHeight || window.innerHeight || 1);
          apply(currentW, startH + ((e.clientY - startY) / gridH) * 100);
        }
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        store.patchSettings({ focusMainPct: Math.round(currentW), focusMainHPct: Math.round(currentH) });
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    }

    /* —— focus 布局：左上主屏；右侧 / 右下 / 下方为副窗口 —— */
    function renderFocusLayout(list) {
      let focusedId = store.state.settings.focusedRoomId;
      if (!list.some(r => r.id === focusedId)) {
        const preferred = list.find(r => r.lastStatus === 'online') || list[0];
        focusedId = preferred?.id || null;
        if (focusedId !== store.state.settings.focusedRoomId) store.state.settings.focusedRoomId = focusedId;
      }

      let focusedRow = grid.querySelector('.focused-row');
      let sideRow = grid.querySelector('.focus-side-row');
      let bottomRow = grid.querySelector('.focus-bottom-row');
      let vResizer = grid.querySelector('.focus-v-resizer');
      let hResizer = grid.querySelector('.focus-h-resizer');
      if (!focusedRow) focusedRow = $('div', { class: 'focused-row' });
      if (!sideRow) sideRow = $('div', { class: 'focus-side-row' });
      if (!bottomRow) bottomRow = $('div', { class: 'focus-bottom-row' });
      if (!vResizer) {
        vResizer = $('div', { class: 'resizer focus-v-resizer', title: LANG === 'zh' ? '拖动调整主屏宽度' : 'Drag to resize main width' });
        attachFocusResizerHandlers(vResizer, 'x');
      }
      if (!hResizer) {
        hResizer = $('div', { class: 'resizer focus-h-resizer', title: LANG === 'zh' ? '拖动调整主屏高度' : 'Drag to resize main height' });
        attachFocusResizerHandlers(hResizer, 'y');
      }

      focusedRow.style.gridArea = 'main';
      vResizer.style.gridArea = 'vbar';
      hResizer.style.gridArea = 'hbar';
      sideRow.style.gridArea = 'side';
      bottomRow.style.gridArea = 'bottom';

      [focusedRow, vResizer, hResizer, sideRow, bottomRow].forEach(el => {
        if (el.parentElement !== grid) grid.appendChild(el);
      });

      // Remove legacy containers if any
      grid.querySelectorAll('.thumbs-row').forEach(el => {
        el.querySelectorAll('.cam-card').forEach(c => sideRow.appendChild(c));
        el.remove();
      });

      // Direct children cards are collected before assigning.
      [...grid.children].forEach(el => {
        if (el.classList && el.classList.contains('cam-card')) sideRow.appendChild(el);
      });

      const focusedRoom = list.find(r => r.id === focusedId);
      const secondary = list.filter(r => r.id !== focusedId);
      const sideList = secondary;
      const bottomList = [];

      grid.classList.add('no-bottom');
      sideRow.style.gridTemplateRows = '';
      sideRow.style.gridAutoRows = 'minmax(104px, 140px)';
      sideRow.style.gridTemplateColumns = 'minmax(0, 1fr)';
      sideRow.style.overflowY = 'auto';
      bottomRow.style.gridTemplateColumns = bottomList.length ? `repeat(${bottomList.length}, minmax(0, 1fr))` : '1fr';
      bottomRow.style.gridTemplateRows = 'minmax(0, 1fr)';
      if (!bottomList.length) {
        grid.style.gridTemplateRows = 'minmax(0, 1fr)';
        grid.style.gridTemplateAreas = `'main vbar side'`;
      } else {
        applyGridSize();
      }

      const ensureCard = (room, parent, idx) => {
        let c = cardMap.get(room.id);
        if (!c) {
          buildCard(room);
          c = cardMap.get(room.id);
        }
        activateCardEntry(room.id);
        resetCardSizing(c.root);
        const cards = [...parent.children].filter(el => el.classList && el.classList.contains('cam-card'));
        const ref = cards[idx];
        if (c.root.parentElement !== parent || ref !== c.root) parent.insertBefore(c.root, ref || null);
        requestRoomMediaIfNeeded(room.id);
        renderCardState(room);
        c.root.classList.toggle('is-focus-main', room.id === focusedId);
        return c;
      };

      if (focusedRoom) {
        const c = ensureCard(focusedRoom, focusedRow, 0);
        c.root.classList.add('is-focus-main');
        applyFocusMainSizing();
      } else {
        [...focusedRow.children].forEach(el => { if (el.classList && el.classList.contains('cam-card')) sideRow.appendChild(el); });
      }

      sideList.forEach((room, idx) => ensureCard(room, sideRow, idx));
      bottomList.forEach((room, idx) => ensureCard(room, bottomRow, idx));

      const keep = new Set(list.map(r => r.id));
      [focusedRow, sideRow, bottomRow].forEach(parent => {
        [...parent.children].forEach(el => {
          const id = el.dataset?.roomId;
          if (id && !keep.has(id)) sideRow.appendChild(el);
        });
      });

      requestAnimationFrame(applyFocusMainSizing);
      syncLayoutControls();
    }

    // ---- 渲染调度：合并同一帧内的多次状态变化，减少批量添加、切页和状态刷新时的抖动 ----
    let sidebarRenderRaf = 0;
    let gridRenderRaf = 0;
    let focusSizingRaf = 0;
    let sidebarRenderDeferred = false;
    let gridRenderDeferred = false;
    function scheduleSidebarRender() {
      if (document.hidden) { sidebarRenderDeferred = true; return; }
      if (sidebarRenderRaf) return;
      sidebarRenderRaf = requestAnimationFrame(() => { sidebarRenderRaf = 0; sidebarRenderDeferred = false; renderSidebar(); });
    }
    function scheduleGridRender() {
      if (document.hidden) { gridRenderDeferred = true; return; }
      if (gridRenderRaf) return;
      gridRenderRaf = requestAnimationFrame(() => { gridRenderRaf = 0; gridRenderDeferred = false; renderGrid(); });
    }
    function scheduleFocusSizing() {
      if (focusSizingRaf) return;
      focusSizingRaf = requestAnimationFrame(() => { focusSizingRaf = 0; applyFocusMainSizing(); });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      if (sidebarRenderDeferred) scheduleSidebarRender();
      if (gridRenderDeferred) scheduleGridRender();
    });

    // ---- Store 订阅 ----
    store.subscribe((state, path) => {
      if (path === 'rooms' || path === 'all') {
        savedRoomIndex = new Map(state.rooms.map(room => [room.id, room]));
      }
      const isSettingsPath = path === 'settings' || (typeof path === 'string' && path.startsWith('settings:'));
      const settingKeys = isSettingsPath && typeof path === 'string' && path.includes(':')
        ? path.slice(path.indexOf(':') + 1).split(',').filter(Boolean)
        : [];
      const hasSetting = (...keys) => !settingKeys.length || keys.some(k => settingKeys.includes(k) || settingKeys.some(x => x.startsWith(k + '.')));

      if (path === 'groups' || path === 'rooms' || path === 'all' || isSettingsPath) {
        const fullRefresh = path === 'groups' || path === 'rooms' || path === 'all' || path === 'settings' || !settingKeys.length;
        const needsSidebar = fullRefresh || hasSetting('activeGroup', 'sidebarCollapsed');
        const needsGrid = fullRefresh || hasSetting(
          'activeGroup', 'filter', 'sortBy', 'searchQuery', 'layoutSize', 'phoneLayoutSize', 'phoneModeAuto', 'pageIndex', 'onlineFollowingPageIndex',
          'viewMode', 'focusedRoomId', 'focusMainPct', 'focusMainHPct', 'focusAspect', 'focusThumbSize',
          'showRecordingOnly', 'favoriteFirst', 'splitRoomIds', 'splitViewActive', 'splitRatio', 'splitAudioRoomId', 'splitToolbarPosition'
        );

        if (needsSidebar) scheduleSidebarRender();
        if (needsGrid) scheduleGridRender();

        sortSel.value = state.settings.sortBy;
        filterSel.value = filterModeFromState();
        sizeSlider.value = String(state.settings.gridSize);
        if (document.activeElement !== searchInput) searchInput.value = state.settings.searchQuery || '';
        focusScaleSlider.value = String(state.settings.focusMainPct || 62);
        focusAspectSel.value = state.settings.focusAspect || 'auto';
        focusThumbSlider.value = String(state.settings.focusThumbSize || 150);
        syncViewSeg();
        syncLayoutControls();
        syncShellControls();
        applyPureModeState();
        if (hasSetting('maxStreamHeight')) service.refreshQuality();
        if (hasSetting('activeGroup')) {
          syncOnlineFollowingQualityCaps();
          if (state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID) syncOnlineFollowing();
        }
        if (hasSetting('videoTransforms')) applyAllVideoTransforms();
        if (needsGrid || hasSetting('toolbarCollapsed', 'sidebarCollapsed', 'pureMode')) scheduleFocusSizing();
      }
      if (path && path.startsWith('room:')) {
        const id = path.slice(5);
        const r = state.rooms.find(x => x.id === id);
        if (r) renderCardState(r);
        scheduleSidebarRender();
        // 状态排序时，单卡状态变化也要重排
        if (state.settings.splitViewActive || state.settings.activeGroup === ONLINE_GROUP_ID || state.settings.activeGroup === ONLINE_FAVORITES_GROUP_ID || state.settings.sortBy === 'status' || state.settings.filter?.hideOffline || state.settings.filter?.hidePrivate || state.settings.filter?.onlyOnline) scheduleGridRender();
      }
    });

    // ---- EventBus 订阅 ----
    EventBus.on('room:online', ({ id, hlsSource }) => {
      if (!findRoomAny(id)) { service.stop(id); return; }
      mediaAttachPendingIds.delete(id);
      if (!shouldAttachRoomMedia(id)) {
        service.detachVideo(id);
        const offscreenRoom = findRoomAny(id);
        if (offscreenRoom) renderCardState(offscreenRoom);
        return;
      }
      const video = attachVideoElement(id);
      if (!video) return;
      service.startHls(id, hlsSource);
      const r = findRoomAny(id);
      if (r) renderCardState(r);
      requestAnimationFrame(applyFocusMainSizing);
    });
    EventBus.on('room:status', ({ id, status, extra }) => {
      const room = findOnlineFollowingRoom(id);
      if (!room) return;
      room.lastStatus = status || room.lastStatus;
      if (status === 'online') {
        room.lastSeenOnline = Date.now();
      }
      if (status === 'private') room.privateLabel = String(extra?.label || room.privateLabel || 'Private');
      renderCardState(room);
      if (store.state.settings.activeGroup === ONLINE_FOLLOWING_GROUP_ID
        && (store.state.settings.filter?.hideOffline || store.state.settings.filter?.hidePrivate || store.state.settings.filter?.onlyOnline)) {
        scheduleGridRender();
      }
    });
    EventBus.on('room:flash', (id) => {
      const c = cardMap.get(id);
      if (!c) return;
      c.root.classList.remove('flash');
      void c.root.offsetWidth;  // 强制重排重启动画
      c.root.classList.add('flash');
      setTimeout(() => c.root.classList.remove('flash'), 5000);
    });

    // ---- 跨标签页实时同步 ----
    // 当用户在主播页点击「加入」时，已打开的工作台立刻感知并新增卡片（无需刷新）
    window.addEventListener('storage', (e) => {
      if (e.key !== STORE_KEY) return;
      try {
        if (!e.newValue) { syncFromExternalState(defaultState()); return; }
        const ext = sanitizeState(JSON.parse(e.newValue));
        if (!ext || !Array.isArray(ext.rooms)) return;
        syncFromExternalState(ext);
      } catch (_) {}
    });

    function syncFromExternalState(ext) {
      const normalized = sanitizeState(ext && typeof ext === 'object' ? ext : defaultState());
      const currentById = new Map(store.state.rooms.map(r => [r.id, r]));
      const extRooms = (Array.isArray(normalized.rooms) ? normalized.rooms : []).map(r => {
        const local = currentById.get(r.id);
        if (local && isStableRoomStatus(local.lastStatus) && isTransientRoomStatus(r.lastStatus)) {
          return {
            ...r,
            lastStatus: local.lastStatus,
            lastSeenOnline: Math.max(numeric(local.lastSeenOnline, 0), numeric(r.lastSeenOnline, 0)),
            privateLabel: local.lastStatus === 'private' ? (local.privateLabel || r.privateLabel) : r.privateLabel,
          };
        }
        return r;
      });
      const curIds = new Set(store.state.rooms.map(r => r.id));
      const nextIds = new Set(extRooms.map(r => r.id));
      const removedRoomIds = [...curIds].filter(id => !nextIds.has(id));
      const newRoomIds = [...nextIds].filter(id => !curIds.has(id));

      // 多窗口只同步房间 / 分组，不同步 viewMode / focusedRoomId / filter 等本窗口视图设置。
      // 否则一个窗口切主屏会把另一个窗口的主屏也顶掉。
      const localSettings = JSON.parse(JSON.stringify(store.state.settings || defaultState().settings));
      const nextState = {
        ...normalized,
        rooms: extRooms,
        groups: Array.isArray(normalized.groups) && normalized.groups.length ? normalized.groups : store.state.groups,
        settings: localSettings,
      };
      const groupIds = new Set(nextState.groups.map(g => g.id));
      if (!groupIds.has(nextState.settings.activeGroup)) nextState.settings.activeGroup = DEFAULT_GROUP_ID;
      if (nextState.settings.focusedRoomId && !nextIds.has(nextState.settings.focusedRoomId)) {
        const preferred = extRooms.find(r => r.lastStatus === 'online') || extRooms[0];
        nextState.settings.focusedRoomId = preferred?.id || null;
      }

      // 外部标签页同步只替换内存状态，不回写 localStorage，避免多个工作台互相触发 storage ping-pong。
      store.replaceState(nextState, 'all');

      // service 启停（replaceState 之后，避免 service 提前 fire 状态时找不到对应数据）
      for (const id of removedRoomIds) service.stop(id);
      for (const id of newRoomIds) queueBackgroundServiceStart(id);
      for (const id of nextIds) {
        if (!service.has(id)) queueBackgroundServiceStart(id);
      }
    }

    // ---- 全局拖动结束 ----
    grid.addEventListener('dragover', (e) => e.preventDefault());

    // ---- 快捷键 ----
    function shortcutMatches(e, action) {
      const shortcuts = sanitizeShortcuts(store.state.settings.shortcuts, defaultShortcuts());
      return shortcutFromEvent(e) === shortcuts[action];
    }

    document.addEventListener('keydown', (e) => {
      const key = String(e.key || '').toLowerCase();
      if (e.key === 'Escape') closeTransientUi();
      if (shortcutMatches(e, 'pureMode') || (e.altKey && key === 'c')) { e.preventDefault(); togglePureMode(); return; }
      if (shortcutMatches(e, 'focusThumbs')) { e.preventDefault(); toggleFocusThumbs(); return; }
      if (e.key === 'Escape' && store.state.settings.pureMode) { e.preventDefault(); setPureMode(false); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (shortcutMatches(e, 'refreshAll')) { e.preventDefault(); refreshAllSources(); return; }
      if (shortcutMatches(e, 'focusAdd')) { e.preventDefault(); tbInput.focus(); return; }
      if (shortcutMatches(e, 'recordingCenter')) { e.preventDefault(); openRecordingCenter(); return; }
      if (shortcutMatches(e, 'recordPage')) { e.preventDefault(); recordCurrentPage(); return; }
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
      if (store.state.settings.viewMode === 'focus') {
        if (e.code === 'Space') {
          e.preventDefault();
          const id = store.state.settings.focusedRoomId;
          if (id) { service.togglePause(id); requestAnimationFrame(() => updateCardButtons(id)); }
        }
        if (e.key === 'ArrowRight' || e.key === ']') { e.preventDefault(); focusStep(1); }
        if (e.key === 'ArrowLeft' || e.key === '[') { e.preventDefault(); focusStep(-1); }
      }
      // 视图切换：g = grid, f = focus
      if (shortcutMatches(e, 'gridView')) { e.preventDefault(); setViewMode('grid'); return; }
      if (shortcutMatches(e, 'focusView')) {
        e.preventDefault();
        setViewMode('focus');
        return;
      }
    });

    // ---- 首次渲染 + 全量启动 service ----
    // service 独立于 UI 运行：所有 store 中的房间都参与轮询，
    // 这样切到其它分组时，被隐藏房间的上线事件也能被检测到并触发桌面通知。
    loadSharedWorkspaceFromHash();
    loadSavedTemporarySources();
    const hydratedOnlineFollowingCache = hydrateOnlineFollowingCache();
    renderSidebar();
    renderGrid();
    applyPureModeState();
    const freshOnlineFollowingCache = hydratedOnlineFollowingCache
      && Date.now() - onlineFollowingCacheSavedAt < 5 * 60 * 1000;
    // Online Following and saved-room status are independent data sources.
    // Start both without making one wait for the other; the saved-room queue is
    // already paced and therefore cannot create the old cold-start burst.
    if (!freshOnlineFollowingCache) void syncOnlineFollowing(true);
    setTimeout(() => {
      for (const r of store.state.rooms) queueBackgroundServiceStart(r.id);
    }, 1200);
    UnifiedRecorder.subscribe(() => {
      cardMap.forEach((_, id) => updateCardButtons(id));
      if (store.state.settings.showRecordingOnly) scheduleGridRender();
    });
    setTimeout(checkRecordingIntentRecovery, 1200);

    // 兜底：定期检查 sessions 与 rooms 是否一致（防止某些边缘 case 数据漂移）
    setInterval(() => {
      for (const r of store.state.rooms) {
        if (!service.has(r.id)) queueBackgroundServiceStart(r.id);
      }
    }, 60000);
    setInterval(() => { if (!workshopRefreshState.busy) syncOnlineFollowing(); }, 5 * 60 * 1000);

    // 调试入口默认不暴露到页面；需要时先在控制台设置 localStorage.ryujo_multicam_debug = '1' 后刷新。
    try {
      if (localStorage.getItem('ryujo_multicam_debug') === '1') window.__multicam = { store, service, EventBus };
      else if (window.__multicam) delete window.__multicam;
    } catch (_) {}
  }

})();


/* =============================================================
 * Integrated component: Chaturbate Reloaded 1.8.0
 * Original author: Ladroop. License: MIT.
 * Its storage resets are scoped so they cannot erase MultiCam.
 * ============================================================= */
(function() {
    'use strict';

    // Integrated Reloaded 1.8.0: keep it off the standalone MultiCam workstation and prevent duplicate startup.
    if (new URLSearchParams(location.search).get('multicam_mode') === '1' || new URLSearchParams(location.search).get('multicam_recorder') === '1') { return; }
    var reloadedPath = String(location.pathname || '');
    if (location.hostname === 'secure.chaturbate.com' || /^\/(?:security|auth|apps|api|b|fullvideo)(?:\/|$)/.test(reloadedPath) || /^\/accounts\/followers(?:\/|$)/.test(reloadedPath)) { return; }
    if (window.__chaturbateReloadedIntegratedRunning) { return; }
    window.__chaturbateReloadedIntegratedRunning = true;

    // Reloaded historically cleared all site storage. In the suite that would erase MultiCam.
    // Limit the reset to Reloaded settings and runtime caches.
    var reloadedOwnedStorageKeys = [
        'animationoff', 'bigthumb', 'defaultVideoWidth', 'hidemt', 'hpfltopen',
        'ignoredusers', 'isTheaterMode', 'login', 'newtabon', 'pclean',
        'recautosave', 'recvp9', 'refreshoff', 'regloaded', 'smallsnap',
        'videoControls', 'zoomoff'
    ];
    // The global chat-filter profile is intentionally not session-cleared so it is remembered for every room.
    function clearReloadedLocalStorage() {
        reloadedOwnedStorageKeys.forEach(function(key) { localStorage.removeItem(key); });
        for (var storageIndex = localStorage.length - 1; storageIndex >= 0; storageIndex--) {
            var storageKey = localStorage.key(storageIndex);
            if (storageKey && (storageKey.indexOf('region_') === 0 || /Tokens$/.test(storageKey))) {
                localStorage.removeItem(storageKey);
            }
        }
    }
    var currpage=document.location.href;
    var roomname= currpage.split("/")[3];
    if (!readCookie("ssession")){
        clearReloadedLocalStorage();
        createCookie("ssession","foo");
    }
    if (roomname=="messages"){
        if(window.opener){
            if (window.opener.innerWidth!=window.innerWidth){
                setTimeout(function(){document.getElementById("desktop-spa-header").style.display="none";},200);
                return;
            }
        }
    }

    if (roomname=="my_collection"){
        if (document.getElementsByTagName("video").length>0){
            savedprvdownload();
        }
        return;
    }

    // The native mobile site uses a completely different layout. Stop the
    // legacy desktop component before it injects any CSS; the Suite's compact
    // mobile Reloaded panel above still exposes the useful shared settings.
    if (!document.getElementById("desktop-spa-header")){return;}
    setgenstyle();
    if (roomname=="photo_videos"){
        collectiondownload();
        return;
    }
    var version=GM_info.script.version;
    var scriptname=GM_info.script.name;
    var i=0;
    var n=0;
    var stor="greg44609";
    var domain="https://"+window.location.hostname+"/";
    var thisfap="";
    var fapbr="";
    var cimg=new Image();
    var lt2=0;
    var usernoteslist = "";
    if (currpage.indexOf(stor)!=-1){document.location.href=domain;}
    var note='<svg style="height: 2.0em; width: 2.0em;" viewBox="0 0 12 12" xmlns="https://www.w3.org/2000/svg"><path fill="hsla(0, 100%, 50%, 0.8)" d="M5.5 2.00002H2C1.73478 2.00002 1.48043 2.10537 1.29289 2.29291C1.10536 2.48044 1 2.7348 1 3.00002V10C1 10.2652 1.10536 10.5196 1.29289 10.7071C1.48043 10.8947 1.73478 11 2 11H9C9.26522 11 9.51957 10.8947 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6.50002" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.25 1.24985C9.44891 1.05094 9.7187 0.939194 10 0.939194C10.2813 0.939194 10.5511 1.05094 10.75 1.24985C10.9489 1.44877 11.0607 1.71855 11.0607 1.99985C11.0607 2.28116 10.9489 2.55094 10.75 2.74985L6 7.49985L4 7.99985L4.5 5.99985L9.25 1.24985Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var nonote='<svg style="height: 2.0em; width: 2.0em;" viewBox="0 0 12 12" xmlns="https://www.w3.org/2000/svg"><path fill="hsla(197, 10%, 98%, 0.3)" d="M5.5 2.00002H2C1.73478 2.00002 1.48043 2.10537 1.29289 2.29291C1.10536 2.48044 1 2.7348 1 3.00002V10C1 10.2652 1.10536 10.5196 1.29289 10.7071C1.48043 10.8947 1.73478 11 2 11H9C9.26522 11 9.51957 10.8947 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6.50002" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.25 1.24985C9.44891 1.05094 9.7187 0.939194 10 0.939194C10.2813 0.939194 10.5511 1.05094 10.75 1.24985C10.9489 1.44877 11.0607 1.71855 11.0607 1.99985C11.0607 2.28116 10.9489 2.55094 10.75 2.74985L6 7.49985L4 7.99985L4.5 5.99985L9.25 1.24985Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    var notegrey='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 12 12" role="img"><path stroke="#48484E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5.5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6.5"></path><path stroke="#48484E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.25 1.25a1.06 1.06 0 0 1 1.5 1.5L6 7.5 4 8l.5-2z"></path></svg>';
    var sitelocation="";
    var username="anonymous";
    var supporter=false;
    var login=false;
    var pageType="";
    var thumbobserver1=new MutationObserver(addevent2);
    var banusers=[];
    var noaccess=false;
    var hidurl=domain+"api/ts/roomlist/room-list/?&hidden=true&limit=90&offset=";
    var hprom=false;
    var hidoffset=0;
    var hiddenarray=[];
    var tr2="https://www.chaturbate.com/translate_a/";
    var observer3 = new MutationObserver(varea);
    var observerConfig3 = {childList: true, subtree: true};
    var region=["asia","europe_russia","northamerica","southamerica","other"];
    var niceregion=["Asia","Europe/Russia","North America","South America","Other (Australia, Africa, etc.)"];
    var rcount=0;
    var regoffset=0;
    var regioarray=[];
    var regiofetch=true;
    var biodata="";
    var openthumbname="";
    var referenceNode="";
    var fetching=0;
    var hlsfetching=false;
    var br="";
    var vfilter="brightness(100%) contrast(100%) invert(0%) saturate(100%) hue-rotate(0deg)";
    var ofils="";
    var vmirror="none";
    var pos1=0;
    var pos2=0;
    var pos3=0;
    var pos4=0;
    var vareaid="";
    var pageobserver=new MutationObserver(pageevent);
    var pageobserverConfig ={attributes : true, attributeFilter : ['class'] };
    var ctitle=document.title;
    var opennote="";
    var data="";
    var room_status="";
    var videoSrc="";
    var stream;
    var vidwidth=854;
    var hls = new Hls();
    var vidpausetime=0;
    var vidonpause=false;
    var gojpg=false;
    var fatalerror=0;
    var restarts=0;
    var pimg = new Image();
    var recording=false;
    var c1=0;
    var c2=0;
    var c3=0;
    var c4=0;
    var c5=0;
    var c6=0;
    var c7=0;
    var c7a=100;
    var c8=0;
    var c10=0;
    var reloadedChatSettingsKey='reloadedGlobalChatSettingsV1';
    var reloadedChatControlsRoot=null;
    var reloadedChatObserver=null;
    var reloadedPmChatObserver=null;
    var reloadedChatObservedNode=null;
    var reloadedPmChatObservedNode=null;
    var reloadedChatInitTimer=0;
    var reloadedChatInitAttempts=0;
    var firstentry=true;
    var twaiting=false;
    var chatrules="";
    var tabblink=false;
    var alarmrun=false;
    var roomstatus="";
    var oldroomstatus="";
    var roomthumbs="";
    var followstar="";
    var nrt=0;
    var scBusy=false;
    var csBusy=false;
    var bcBusy=false;
    var c4Busy=false;
    var smBusy=false;
    var mfcBusy=false;

    function normalizeReloadedChatToggle(value){
        return Number(value)===1 ? 1 : 0;
    }

    function readReloadedChatSettings(){
        var defaults={version:1,c1:0,c2:0,c3:0,c4:0,c5:0,c6:0,c7:0,c7a:100,c8:0,c10:0,language:''};
        try {
            var raw=localStorage.getItem(reloadedChatSettingsKey);
            if (!raw){return defaults;}
            var saved=JSON.parse(raw);
            if ((!saved)||(typeof saved!='object')||(Array.isArray(saved))){return defaults;}
            var threshold=parseInt(saved.c7a,10);
            if (!Number.isFinite(threshold)){threshold=100;}
            threshold=Math.max(2,Math.min(1000,threshold));
            var language=typeof saved.language=='string'&&/^[a-z-]{2,8}$/i.test(saved.language) ? saved.language : '';
            return {
                version:1,
                c1:normalizeReloadedChatToggle(saved.c1),
                c2:normalizeReloadedChatToggle(saved.c2),
                c3:normalizeReloadedChatToggle(saved.c3),
                c4:normalizeReloadedChatToggle(saved.c4),
                c5:normalizeReloadedChatToggle(saved.c5),
                c6:normalizeReloadedChatToggle(saved.c6),
                c7:normalizeReloadedChatToggle(saved.c7),
                c7a:threshold,
                c8:normalizeReloadedChatToggle(saved.c8),
                c10:normalizeReloadedChatToggle(saved.c10),
                language:language
            };
        } catch (error) {
            return defaults;
        }
    }

    function applyReloadedChatSettings(){
        var saved=readReloadedChatSettings();
        c1=saved.c1;
        c2=saved.c2;
        c3=saved.c3;
        c4=saved.c4;
        c5=saved.c5;
        c6=saved.c6;
        c7=saved.c7;
        c7a=saved.c7a;
        c8=saved.c8;
        c10=saved.c10;
        ['c1','c2','c3','c4','c5','c6','c7','c8','c10'].forEach(function(id){
            var control=document.getElementById(id);
            if (control){control.value=String(saved[id]);}
        });
        var thresholdControl=document.getElementById('c7a');
        if (thresholdControl){thresholdControl.value=String(saved.c7a);}
        var languageControl=document.getElementById('language');
        if (languageControl&&saved.language){
            var languageExists=Array.from(languageControl.options).some(function(option){return option.value==saved.language;});
            if (languageExists){languageControl.value=saved.language;}
        }
        smallemoonoff();
    }

    function saveReloadedChatSettings(){
        var languageControl=document.getElementById('language');
        var settings={
            version:1,c1:Number(c1),c2:Number(c2),c3:Number(c3),c4:Number(c4),
            c5:Number(c5),c6:Number(c6),c7:Number(c7),c7a:Number(c7a),
            c8:Number(c8),c10:Number(c10),language:languageControl ? languageControl.value : ''
        };
        try {localStorage.setItem(reloadedChatSettingsKey,JSON.stringify(settings));} catch (error) {}
    }

    function applyReloadedChatSettingsToMessages(){
        twaiting=true;
        chatadjust();
        setTimeout(function(){twaiting=false;},200);
    }

    window.addEventListener('storage',function(event){
        if (event.key!=reloadedChatSettingsKey){return;}
        applyReloadedChatSettings();
        applyReloadedChatSettingsToMessages();
    });
    if (document.querySelector('[data-testid="close-entrance-terms"]')){
        document.querySelector('[data-testid="close-entrance-terms"]').click();
    }
    if (document.getElementsByClassName("dismiss_notice_tfa_and_email").length>0){
        document.getElementsByClassName("dismiss_notice_tfa_and_email")[0].click();
    }
    if (document.getElementsByClassName("siteNotice").length>0){
        var links = document.getElementsByClassName("siteNotice")[0].getElementsByTagName("a");
        for (n=0; n<links.length; n++){
            if (!links[n].hasAttribute("href")){
                links[n].click();
            }
        }
        n=0;
    }
    if (!document.hasFocus()){
        document.addEventListener("visibilitychange",headerReady);
        return;
    }
    headerReady();
    return;
    function headerReady(){
        document.removeEventListener("visibilitychange",headerReady);
        if (document.querySelector('[data-testid="header-top-row"]')){
            getUserinfo();
            return;
        }
        n++;
        if(n==100){return;}
        setTimeout(headerReady,100);
    }
    function getUserinfo(){
        refresher();
        var scripts=document.getElementsByTagName("script");
        for (n=0; n<scripts.length; n++){
            if(!scripts[n].hasAttribute("scr")){
                if (scripts[n].innerHTML.includes("Minimal extend implementation")){
                    var userinfo=scripts[n].innerHTML.split("logged_in_user: JSON.parse('")[1].split("')")[0];
                    if(userinfo=="null"){
                        break;
                    }
                    login=true;
                    var userinfojson=JSON.parse('"'+userinfo+'"').replaceAll('"','');
                    username=userinfojson.split('username: ')[1].split(',')[0];
                    if (userinfojson.split('is_supporter: ')[1].split(',')[0]=="true"){
                        supporter=true;
                    }
                    if (userinfojson.split('is_staff: ')[1].split(',')[0]=="true"){
                        alert("Please be nice Mr. Chaturbate staff. 😳");
                    }
                    break;
                }
            }
        }
        getsaving();
        hidemtenter();
        makeScriptMenu();
    }
    function makeScriptMenu(){
        var newdiv=document.createElement('div');
        newdiv.id="holdpage";
        newdiv.className="holdpage";
        document.getElementById("base").prepend(newdiv);
        var top="";
        if (login){
            top=document.querySelector('[data-testid="user-header-menu"]');
        }else{
            top=document.getElementsByClassName("HeaderTopRow__anon-buttons")[0];
        }
        newdiv=document.createElement('div');
        newdiv.id="scriptsettings";
        newdiv.className="HeaderUserProfileIconContainer";
        newdiv.title="Script menu";
        newdiv.innerHTML='<div class="HeaderUserProfileIcon suite-skull-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5.2 4 6.5V20h2v2h4v-2h2v-3.5c2.4-1.3 4-3.5 4-6.5a8 8 0 0 0-8-8Zm-3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm6 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-5 3 2-2 2 2h-4Z"/></svg></div>';
        newdiv.addEventListener("click",togglescriptMenu);
        top.prepend(newdiv);
        moreoptions();
        getignorelist();
        setTimeout(getPagetype,100);
    }
    function togglescriptMenu(){
        if(document.getElementById("scriptcontrols").style.display=="none"){
            document.getElementById("scriptcontrols").style.display="block";
            document.getElementById("main").addEventListener("click",togglescriptMenu);
        }else{
            document.getElementById("scriptcontrols").style.display="none";
            document.getElementById("main").removeEventListener("click",togglescriptMenu);
        }
    }
    function pageevent(){
        if (sitelocation==document.location.href.split("/")[3]){return;}
        document.getElementById("holdpage").style.display="block";
        pageobserver.disconnect();
        thumbobserver1.disconnect();
        document.querySelector('[data-testid="room-bio-tab-contents"]').innerHTML="";
        cleanuppage();
        getPagetype();
    }
    function getPagetype(){
        unfollowoption();
        currpage=document.location.href;
        roomname=currpage.split("/")[3];
        sitelocation=roomname;
        var newpageType="thumbs";
        if (document.getElementById("main")){
            if (document.getElementById("main").innerHTML.includes("HTTP 404")){newpageType="notfound";}
            var mainClass=document.getElementById("main").classList;
            if (mainClass.contains("roomPage")){newpageType="profile";}
            if (mainClass.contains("discover")){newpageType="discover";}
            if (mainClass.contains("tags")){newpageType="tags";}
            if (mainClass.contains("chat_roomlogin")){newpageType="password";}
            if (mainClass.contains("chat_profile")){newpageType="ppage";}
            pageobserver.observe(document.getElementById("main"),pageobserverConfig);
        }
        if (document.querySelector('[data-testid="denied-notice"]')){newpageType="noaccess";}
        pageType=newpageType;
        if (login){
            document.getElementById("ignore").style.display="none";
            if ((pageType=="profile")||(pageType=="password")||(pageType=="ppage")||(pageType=="noaccess")){
                document.getElementById("ignore").style.display="block";
            }
        }
        if (pageType!="thumbs"){
            document.getElementById("holdpage").style.display="none";
        }
        if (pageType=="thumbs"){
            setTimeout(function(){document.getElementById("holdpage").style.display="none";},4000);
            setTimeout(thumbpageset,500);
        }
        if (pageType=="profile"){
            profilepageset();
        }
        if (pageType=="ppage"){
            profilepageset();
        }
        if (pageType=="password"){
            roomname=currpage.split("/")[4];
            passwordfollow();
        }
        if (pageType=="noaccess"){
            bannedroom();
        }
    }
    function thumbpageset(){
        buildnotepop();
        reloadoption();
        getnoteslist();
    }
    function profilepageset(){
        n=0;
        bioreadytest();
    }
    function bioreadytest(){
        if (!document.querySelector('[data-testid="room-bio-tab-contents"]')){
            n++;
            if(n==100){return;}
            setTimeout(bioreadytest, 100);
            return;
        }
        n=0;
        bioreadytest2();
    }
    function bioreadytest2(){
        if (document.querySelector('[data-testid="room-bio-tab-contents"]').getElementsByTagName("table").length==0){
            n++;
            if(n==100){return;}
            setTimeout(bioreadytest2, 100);
            return;
        }
        setTimeout(dobiothings, 1000);
    }

    function reloadoption(){
        if (document.getElementById("reloadoption")){return;}
        var loc=document.querySelector('[data-paction="Search"]');
        var newelem=document.createElement('div');
        newelem.style.cursor="pointer";
        newelem.innerHTML="⟳";
        newelem.style.fontSize="25px";
        newelem.style.color="#0c6a93";
        newelem.id="reloadoption";
        newelem.addEventListener("click", function(){window.location.reload();});
        loc.prepend(newelem);
    }

    function hidemtenter(){
        subsel();
        var genroomname=document.location.href.split("/")[3];
        if (document.getElementsByClassName("gender-tab").length >1){
            var toptabs=document.getElementsByClassName("gender-tab");
            for (n=0; n<toptabs.length; n++){
                if (toptabs[n].href){
                    toptabs[n].style.display="block";
                }
            }
            if (!localStorage.getItem("hidemt")){return;}
            if (genroomname=="followed-cams"){return;}
            for (n=0; n<toptabs.length; n++){
                if (toptabs[n].href){
                    if (toptabs[n].href.indexOf("/male-")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/male/")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/trans-")!=-1){
                        toptabs[n].style.display="none";
                    }
                    if (toptabs[n].href.indexOf("/trans/")!=-1){
                        toptabs[n].style.display="none";
                    }
                }
            }
        }
        if(document.querySelector('[data-testid="gender-nav-m"]')){
            document.querySelector('[data-testid="gender-nav-m"]').style.display="block";
            document.querySelector('[data-testid="gender-nav-t"]').style.display="block";
            if (!localStorage.getItem("hidemt")){return;}
            if (genroomname=="followed-cams"){return;}
            document.querySelector('[data-testid="gender-nav-m"]').style.display="none";
            document.querySelector('[data-testid="gender-nav-t"]').style.display="none";
            if ((genroomname=="male-cams")||(genroomname=="trans-cams")){
                document.location.href=domain;
            }
        }
    }

    function cleanuppage(){
        observer3.disconnect();
        resetReloadedChatRuntime();
        if (document.getElementById("notepop")){
            document.getElementById("notepop").remove();
        }
        var toolsMenuButton=document.getElementById("reloadedtoolsbutton");
        if (toolsMenuButton){
            toolsMenuButton.setAttribute("aria-expanded","false");
            toolsMenuButton.style.cursor="pointer";
        }
        if (document.getElementById("reloadedtoolspanel")){
            document.getElementById("reloadedtoolspanel").remove();
        }
        if (document.getElementById("clean")){
            document.getElementById("clean").remove();
        }
        if (document.getElementById("infore")){
            document.getElementById("infore").remove();
        }
        if (document.getElementById("controls")){
            document.getElementById("controls").remove();
        }
        if (document.getElementById("chatcontrols")){
            document.getElementById("chatcontrols").remove();
        }
        if (document.getElementById("rulespop")){
            document.getElementById("rulespop").remove();
        }
    }

    function moreoptions(){
        var root=document.createElement('div');
        root.id='scriptcontrols';
        root.className='scriptset suite-native-menu';
        root.style.display='none';
        root.setAttribute('role','dialog');
        root.setAttribute('aria-label','Ziggy Suite settings');
        document.querySelector('[data-testid="header-top-row"]').appendChild(root);

        function makeSection(label){
            var section=document.createElement('section');
            section.className='suite-menu-section';
            var title=document.createElement('div');
            title.className='suite-menu-section-title';
            title.textContent=label;
            section.appendChild(title);
            root.appendChild(section);
            return section;
        }
        function makeRow(section,id,label,handler,options){
            options=options||{};
            var row=document.createElement(options.tag||'button');
            if(id) row.id=id;
            row.className='suite-menu-row'+(options.primary?' primary':'')+(options.danger?' danger':'');
            if(row.tagName==='BUTTON') row.type='button';
            var icon=document.createElement('span');
            icon.className='suite-menu-row-icon';
            icon.setAttribute('aria-hidden','true');
            icon.textContent=options.icon||'›';
            var text=document.createElement('span');
            text.className='suite-menu-row-label';
            text.textContent=label;
            row.append(icon,text);
            if(options.value){
                var value=document.createElement('span');
                value.className='suite-menu-row-value';
                value.textContent=options.value;
                row.appendChild(value);
            }
            if(handler) row.addEventListener('click',function(event){event.stopPropagation();handler(event);});
            section.appendChild(row);
            return row;
        }
        function makeSwitch(section,rowId,inputId,label,initialValue,handler,hidden){
            var row=document.createElement('label');
            row.id=rowId;
            row.className='suite-menu-row suite-menu-switch-row';
            if(hidden) row.style.display='none';
            var text=document.createElement('span');
            text.className='suite-menu-row-label';
            text.textContent=label;
            var input=document.createElement('input');
            input.id=inputId;
            input.type='range';
            input.min='0';
            input.max='1';
            input.step='1';
            input.value=String(initialValue);
            input.className='suite-menu-switch';
            input.addEventListener('click',function(event){event.stopPropagation();});
            input.addEventListener('input',function(){input.setAttribute('value',input.value);});
            input.addEventListener('change',function(event){input.setAttribute('value',input.value);handler(event);});
            row.append(text,input);
            section.appendChild(row);
            return row;
        }
        function dispatchSuite(type,detail){document.dispatchEvent(new CustomEvent(type,{detail:detail||{}}));}

        var head=document.createElement('header');
        head.className='suite-menu-head';
        var headText=document.createElement('div');
        headText.innerHTML='<strong>Ziggy Chaturbate Suite</strong><span>Version '+version+'</span>';
        var close=document.createElement('button');
        close.type='button';
        close.className='suite-menu-close';
        close.setAttribute('aria-label','Close Suite menu');
        close.textContent='×';
        close.addEventListener('click',function(event){event.stopPropagation();togglescriptMenu();});
        head.append(headText,close);
        root.appendChild(head);

        var workspace=makeSection('Workspace');
        makeRow(workspace,'suiteopenworkshop','Open Workshop',function(){dispatchSuite('ziggy-suite:open-workshop');},{icon:'▦',primary:true});
        makeRow(workspace,'suiteroomgrid','Rooms',function(){dispatchSuite('ziggy-suite:toggle-roomgrid',{tab:'multicam'});},{icon:'⊞'});
        makeRow(workspace,'suitecamarna','Cam ARNA',function(){dispatchSuite('ziggy-suite:toggle-roomgrid',{tab:'arna'});},{icon:'⌕'});
        var recorderRow=makeRow(workspace,'suiterecorderhub','Recorder Hub',function(){window.__ziggyUnifiedRecorder?.openHub?.(true);},{icon:'●'});
        function syncRecorderRow(){
            var count=window.__ziggyUnifiedRecorder?.countActive?.()||0;
            var label=recorderRow.querySelector('.suite-menu-row-label');
            if(label) label.textContent='Recorder Hub'+(count?' · '+count+' active':'');
        }
        window.__ziggyUnifiedRecorder?.subscribe?.(syncRecorderRow);
        syncRecorderRow();

        var tools=makeSection('Tools');
        var reloaded=makeRow(tools,'reloadedtoolsbutton','Reloaded Tools',toggleReloadedToolsFromMenu,{icon:'⚙'});
        reloaded.setAttribute('aria-controls','reloadedtoolspanel');
        reloaded.setAttribute('aria-expanded','false');
        var mount=document.createElement('div');
        mount.id='reloadedtoolsmount';
        mount.className='suite-menu-embedded-tools';
        tools.appendChild(mount);
        if(login){
            makeRow(tools,'managebans','Bans and ignored rooms',bantoggle,{icon:'⊘'});
            var banlist=document.createElement('div');
            banlist.id='banlist';
            banlist.className='suite-ban-list';
            banlist.style.display='none';
            banlist.innerHTML='<select id="banusers" class="darkselect"></select><div class="suite-ban-actions"><input id="unbanbut" type="button" value="Unban"><input id="permbut" type="button" value="Make permanent"></div>';
            tools.appendChild(banlist);
            makeRow(tools,'ignore','Ban/ignore this room',banignore,{icon:'×',danger:true});
        }

        var preferences=makeSection('Preferences');
        makeSwitch(preferences,'h2','a2','Preview rooms',1,anionoff,!!supporter);
        makeSwitch(preferences,'h3','a3','Open rooms in new tab',1,newtabon,false);
        makeSwitch(preferences,'h4','a4','Auto refresh followed',0,refreshoff,!login);
        makeSwitch(preferences,'h6','a6','Big thumbnails',0,bigthumb,false);
        makeSwitch(preferences,'h5','a5','Hide male/trans',0,hidemt,false);
        makeSwitch(preferences,'h9','a9','480px snapshots',0,smallsnap,false);

        var data=makeSection('Data');
        makeRow(data,'suiteexport','Export all to GitHub',function(){window.__chaturbateSuiteSettings?.exportSettings?.();},{icon:'↑'});
        makeRow(data,'suiteimport','Import all from GitHub',function(){window.__chaturbateSuiteSettings?.importSettings?.();},{icon:'↓'});
        makeRow(data,'githubsyncbutton',window.__chaturbateSuiteSettings?.isGithubSyncConfigured?.()?'GitHub Cloud configured':'Set up GitHub Cloud',function(){window.__chaturbateSuiteSettings?.configureGithubSync?.();},{icon:'☁'});
        makeRow(data,'suitelocalexport','Download local backup',function(){window.__chaturbateSuiteSettings?.exportLocalSettings?.();},{icon:'⇩'});
        makeRow(data,'suitelocalimport','Import local backup',function(){window.__chaturbateSuiteSettings?.importLocalSettings?.();},{icon:'⇧'});
        if(login){
            makeRow(data,'saved','Save Reloaded settings',savesetting,{icon:'✓'});
            makeRow(data,'clear','Clear Reloaded settings',clearsettings,{icon:'×',danger:true});
        }
        setsw();
        root.querySelectorAll('.suite-menu-switch').forEach(function(input){input.setAttribute('value',input.value);});
    }

    function legacyMoreoptions(){
        var newelem=document.createElement('div');
        newelem.id="scriptcontrols";
        newelem.style.display="none";
        newelem.className="scriptset";
        document.querySelector('[data-testid="header-top-row"]').appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="scriptinfo";
        newelem.innerHTML=scriptname+" Version: "+version;
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="suiteexport";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Export all Suite settings to GitHub";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.exportSettings();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="suiteimport";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Import all Suite settings from GitHub";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.importSettings();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="githubsyncbutton";
        newelem.style.cursor="pointer";
        newelem.innerHTML=window.__chaturbateSuiteSettings?.isGithubSyncConfigured?.()
            ? "GitHub Cloud: Configured"
            : "GitHub Cloud: Setup required";
        newelem.addEventListener("click", function(event){
            event.stopPropagation();
            if (window.__chaturbateSuiteSettings){window.__chaturbateSuiteSettings.configureGithubSync();}
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="reloadedtoolsbutton";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Reloaded Tools";
        newelem.setAttribute("role","button");
        newelem.setAttribute("tabindex","0");
        newelem.setAttribute("aria-controls","reloadedtoolspanel");
        newelem.setAttribute("aria-expanded","false");
        newelem.addEventListener("click",toggleReloadedToolsFromMenu);
        newelem.addEventListener("keydown",function(event){
            if ((event.key=="Enter")||(event.key==" ")){
                event.preventDefault();
                toggleReloadedToolsFromMenu(event);
            }
        });
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('div');
        newelem.id="reloadedtoolsmount";
        newelem.style.clear="both";
        newelem.style.width="100%";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.innerHTML="--Script settings--<div style='float:right'>Off ↔ On</div>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h2";
        newelem.innerHTML="Preview rooms : <input type='range' id='a2' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        if (supporter){
            newelem.style.display="none";
        }
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h3";
        newelem.innerHTML="Open rooms in new tab : <input type='range' id='a3' min=0 max=1 value=1 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h4";
        if (!login){
            newelem.style.display="none";
        }
        newelem.innerHTML="Auto refresh followed : <input type='range' id='a4' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h6";
        newelem.innerHTML="Big thumbnails : <input type='range' id='a6' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h5";
        newelem.innerHTML="Hide male/trans : <input type='range' id='a5' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.id="h9";
        newelem.innerHTML="480px snapshots : <input type='range' id='a9' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;accent-color: #f47321;'>";
        document.getElementById("scriptcontrols").appendChild(newelem);

        if(login){
        newelem=document.createElement('span');
        newelem.id="saved";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Save all settings.";
        newelem.addEventListener("click", savesetting );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.id="clear";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Clear all saved settings.";
        newelem.addEventListener("click", clearsettings );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.id="clear";
        newelem.style.cursor="pointer";
        newelem.innerHTML="Manage ban's.";
        newelem.addEventListener("click", bantoggle );
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.innerHTML="<select id='banusers' class='darkselect' style='width:220px'></select><br><input id='unbanbut' type='button' value='Unban' style='margin:8px 0px 0px 0px'><input id='permbut' type='button' value='Make permanent' style='margin:8px 15px 0px 8px'>";
        newelem.id="banlist";
        newelem.style.display="none";
        document.getElementById("scriptcontrols").appendChild(newelem);
        newelem=document.createElement('span');
        newelem.innerHTML="Ban/ignore this room.";
        newelem.id="ignore";
        newelem.style.cursor="pointer";
        newelem.addEventListener("click", banignore );
        document.getElementById("scriptcontrols").appendChild(newelem);
        }
        document.getElementById("a1").addEventListener("change",zoomoff);
        document.getElementById("a2").addEventListener("change",anionoff);
        document.getElementById("a3").addEventListener("change",newtabon);
        document.getElementById("a4").addEventListener("change",refreshoff);
        document.getElementById("a5").addEventListener("change",hidemt);
        document.getElementById("a6").addEventListener("change",bigthumb);
        document.getElementById("a9").addEventListener("change",smallsnap);
        setsw();
    }

    function setsw(){
        if (localStorage.getItem("smallsnap")){
            document.getElementById("a9").value=1;
        }else{
            document.getElementById("a9").value=0;
        }
        if (localStorage.getItem("bigthumb")){
            document.getElementById("a6").value=1;
        }else{
            document.getElementById("a6").value=0;
        }
        if (localStorage.getItem("hidemt")){
            document.getElementById("a5").value=1;
        }else{
            document.getElementById("a5").value=0;
        }
        if (localStorage.getItem("refreshoff")){
            document.getElementById("a4").value=1;
        }else{
            document.getElementById("a4").value=0;
        }
        if (localStorage.getItem("newtabon")){
            document.getElementById("a3").value=0;
        }else{
            document.getElementById("a3").value=1;
        }
        if (localStorage.getItem("animationoff")){
            document.getElementById("a2").value=0;
        }else{
            document.getElementById("a2").value=1;
        }
        if (roomname!="discover"){
            document.body.classList.add("thumbpage");
            setclass();
        }
    }

    function setclass(){
        document.body.classList.remove("zoom");
        document.body.classList.remove("bigzoom");
        document.body.classList.remove("bigThumb");
        if(localStorage.getItem("bigthumb")){
            document.body.classList.add("bigThumb");
        }
    }

    function smallsnap(){
        if (document.getElementById("a9").value==1){
            localStorage.setItem("smallsnap","foo");
        }else{
            localStorage.removeItem("smallsnap");
        }
    }
    function bigthumb(){
        if (document.getElementById("a6").value==1){
             localStorage.setItem("bigthumb","foo");
        }else{
            localStorage.removeItem("bigthumb");
        }
        setclass();
    }
    function hidemt(){
        if (document.getElementById("a5").value==1){
            localStorage.setItem("hidemt","foo");
        }else{
            localStorage.removeItem("hidemt");
        }
        hidemtenter();
    }
    function refreshoff(){
        if (document.getElementById("a4").value==1){
            localStorage.setItem("refreshoff","foo");
        }else{
            localStorage.removeItem("refreshoff");
        }
    }
    function newtabon(){
        if (document.getElementById("a3").value==0){
             localStorage.setItem("newtabon","foo");
        }else{
            localStorage.removeItem("newtabon");
        }
    }
    function anionoff(){
        if (document.getElementById("a2").value==0){
            localStorage.setItem("animationoff","foo");
        }else{
            localStorage.removeItem("animationoff");
        }
    }

    function savesetting(){
        document.getElementById("saved").removeEventListener("click", savesetting );
        var theme_name="lightmode";
        if (readCookie("theme_name")){
            theme_name=readCookie("theme_name");
        }
        var bigthumb=0;
        if (localStorage.getItem("bigthumb")){
            bigthumb=1;
        }
        var hidemt=0;
        if (localStorage.getItem("hidemt")){
            hidemt=1;
        }
        var newtabon=0;
        if (localStorage.getItem("newtabon")){
            newtabon=1;
        }
        var refreshoff=0;
        if (localStorage.getItem("refreshoff")){
            refreshoff=1;
        }
        var zoomoff=0;
        if (localStorage.getItem("zoomoff")){
            zoomoff=1;
        }
        var animationoff=0;
        if (localStorage.getItem("animationoff")){
            animationoff=1;
        }
        var cleanprof=0;
        if (localStorage.getItem("pclean")){
            cleanprof=1;
        }
        var recautosave=0;
        if (localStorage.getItem("recautosave")){
            recautosave=1;
        }
        var recvp9=0;
        if (localStorage.getItem("recvp9")){
            recvp9=1;
        }
        var smallsnap=0;
        if (localStorage.getItem("smallsnap")){
            smallsnap=1;
        }
        var isTheaterMode=localStorage.getItem("isTheaterMode");
        var defaultVideoWidth =localStorage.getItem("defaultVideoWidth");
        var videoControls =localStorage.getItem("videoControls");
        var hpfltopen=localStorage.getItem("hpfltopen");
        var allstring="good boy#refreshoff#"+refreshoff+
            "#bigthumb#"+bigthumb+
            "#hidemt#"+hidemt+
            "#newtabon#"+newtabon+
            "#zoomoff#"+zoomoff+
            "#animationoff#"+animationoff+
            "#cleanprof#"+cleanprof+
            "#recautosave#"+recautosave+
            "#recvp9#"+recvp9+
            "#smallsnap#"+smallsnap+
            "#isTheaterMode#"+isTheaterMode+
            "#defaultVideoWidth#"+defaultVideoWidth+
            "#videoControls#"+videoControls+
            "#theme_name#"+theme_name+
            "#hpfltopen#"+hpfltopen;
        var url=domain+"api/notes/for_user/"+stor+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", allstring );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){document.getElementById("saved").innerHTML="Settings saved";setTimeout(function(){document.getElementById("saved").innerHTML="Save all settings.";document.getElementById("saved").addEventListener("click", savesetting );},2000);});
    }

    function clearsettings(){
        document.getElementById("clear").removeEventListener("click", clearsettings );
        var url=domain+"api/notes/for_user/"+stor+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", "" );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){document.getElementById("clear").innerHTML="Saved settings removed.";setTimeout(function(){document.getElementById("clear").innerHTML="Clear all saved settings.";document.getElementById("clear").addEventListener("click", clearsettings );},2000);});
    }

    function getsaving(){
        if (!login){
            localStorage.removeItem("login");
            return;
        }else{
            if (localStorage.getItem("login")){
                return;
            }
        }
        clearReloadedLocalStorage();
        localStorage.setItem("login","foo");
        var url=domain+"api/notes/for_user/"+stor+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data) {
                    if (data.text == null){return;}
                    restoresettings(data.text);
                });
            });
    }

    function restoresettings(data){
        var resave=false;
        if (data.indexOf("good boy")!=0){return;}
        if (data.indexOf("refreshoff#")!=-1){
            var refreshoff=data.split("refreshoff#")[1].split("#")[0];
            localStorage.setItem("refreshoff","foo");
            if (refreshoff==0){localStorage.removeItem("refreshoff");}
        }
        if (data.indexOf("newtabon#")!=-1){
            var newtabon=data.split("newtabon#")[1].split("#")[0];
            localStorage.setItem("newtabon","foo");
            if (newtabon==0){localStorage.removeItem("newtabon");}
        }
        if (data.indexOf("hidemt#")!=-1){
            var hidemt=data.split("hidemt#")[1].split("#")[0];
            localStorage.setItem("hidemt","foo");
            if (hidemt==0){localStorage.removeItem("hidemt");}
        }
        if (data.indexOf("bigthumb#")!=-1){
            var bigthumb=data.split("bigthumb#")[1].split("#")[0];
            localStorage.setItem("bigthumb","foo");
            if (bigthumb==0){localStorage.removeItem("bigthumb");}
        }
        if (data.indexOf("zoomoff#")!=-1){
            var zoomoff=data.split("zoomoff#")[1].split("#")[0];
            localStorage.setItem("zoomoff","foo");
            if (zoomoff==0){localStorage.removeItem("zoomoff");}
        }
        if (data.indexOf("animationoff#")!=-1){
            var animationoff=data.split("animationoff#")[1].split("#")[0];
            localStorage.setItem("animationoff","foo");
            if (animationoff==0){localStorage.removeItem("animationoff");}
        }
        if (supporter){
            localStorage.removeItem("animationoff");
        }
        if (data.indexOf("cleanprof#")!=-1){
            var cleanprof=data.split("cleanprof#")[1].split("#")[0];
            localStorage.setItem("pclean","foo");
            if (cleanprof==0){localStorage.removeItem("pclean");}
        }
        if (data.indexOf("recautosave#")!=-1){
            var recautosave=data.split("recautosave#")[1].split("#")[0];
            localStorage.setItem("recautosave","foo");
            if (recautosave==0){localStorage.removeItem("recautosave");}
        }
        if (data.indexOf("recvp9#")!=-1){
            var recvp9=data.split("recvp9#")[1].split("#")[0];
            localStorage.setItem("recvp9","foo");
            if (recvp9==0){localStorage.removeItem("recvp9");}
        }
        if (data.indexOf("smallsnap#")!=-1){
            var smallsnap=data.split("smallsnap#")[1].split("#")[0];
            localStorage.setItem("smallsnap","foo");
            if (smallsnap==0){localStorage.removeItem("smallsnap");}
        }
        if (data.indexOf("isTheaterMode#")!=-1){
            var isTheaterMode=data.split("isTheaterMode#")[1].split("#")[0];
            if (!jsontest(isTheaterMode)){resave=true;isTheaterMode='{"isTheaterMode":false}';}
            localStorage.setItem("isTheaterMode",isTheaterMode);
        }
        if (data.indexOf("defaultVideoWidth#")!=-1){
            var defaultVideoWidth=data.split("defaultVideoWidth#")[1].split("#")[0];
            if (!jsontest(defaultVideoWidth)){resave=true;defaultVideoWidth='{"videoWidth":893,"videoHeight":502.3125,"lastChosenVideoWidth":902,"lastChosenChatWidth":962}';}
            localStorage.setItem("defaultVideoWidth",defaultVideoWidth);
        }
        if (data.indexOf("videoControls#")!=-1){
            var videoControls=data.split("videoControls#")[1].split("#")[0];
            if (!jsontest(videoControls)){resave=true;videoControls='{"volume":60,"isMuted":false}';}
            localStorage.setItem("videoControls",videoControls);
        }
        var exp=new Date().getTime()+86400000;
        if (data.indexOf("hpfltopen#")!=-1){
            var hpfltopen=data.split("hpfltopen#")[1].split("#")[0];
            hpfltopen=hpfltopen.split('expiration":')[0]+'expiration":'+exp+'}';
            if (!jsontest(hpfltopen)){resave=true;hpfltopen='{"value":"true","expiration":2780331592470}';}
            localStorage.setItem("hpfltopen",hpfltopen);
        }
        if (data.indexOf("theme_name#")!=-1){
            var theme_name=data.split("theme_name#")[1].split("#")[0];
            createCookie("theme_name",theme_name);
        }
        var outtime=500;
        if (resave){
            outtime=1000;
            savesetting();
        }
        setTimeout(function(){document.location.reload();},outtime);
    }

    function jsontest(jsonstr){
        if (jsonstr==""){return false;}
        if (jsonstr==null){return false;}
        try {
            JSON.parse(jsonstr);
            return true;
        } catch(e) {
            return false;
        }
    }

    function dobiothings(){
        hidemtenter();
        if(pageType=="ppage"){
            if (currpage.split("model=").length==1){return;}
            roomname=currpage.split("model=")[1].split("&")[0];
            if (roomname==username){return;}
            rebuildbio();
        }else{
            afterrebuild();
        }
    }

    function afterrebuild(){
        if (login){
            if((pageType=="ppage")){
                document.querySelector('[data-testid="bio-header"]').innerHTML="<a href='"+domain+roomname+"?tab=bio' id=biotop>"+roomname.charAt(0).toUpperCase()+roomname.slice(1)+"'s Bio (Go to the cam page)</a>";
            }else{
                document.querySelector('[data-testid="bio-header"]').innerHTML="<a href='"+domain+"p/"+username+"?tab=bio&model="+roomname+"' id=biotop>"+roomname.charAt(0).toUpperCase()+roomname.slice(1)+"'s Bio and Free Webcam (Go to the bio)</a>";
            }
            document.getElementById("biotop").addEventListener("click", function(event){window.location.replace(this.href);event.stopPropagation();event.preventDefault();return false;});
        }

        makevidcontrol();
        cleaninit();
        linkfix();
        info(true);
        buildnotepop();
        if (document.getElementsByTagName("video").length>0){
            getvid();
            vreset();
            iagree();
        }
    }

    function unfollowoption(){
        if (document.getElementById("unfollowit")){return;}
        var newelem=document.createElement('a');
        newelem.style.display="none";
        newelem.id="unfollowit";
        newelem.href="#";
        newelem.className="HeaderNavBar__link";
        newelem.innerHTML='<div class="type--smpx type--medium textColor HeaderNavBar__link-text">UNFOLLOW THIS PAGE(AND ERASE NOTES)</div>';
        document.querySelector('[data-testid="header-nav-bar"]').appendChild(newelem);
        document.getElementById("unfollowit").addEventListener("click",unfollowthispage);
    }

    function iagree(){
        triggerMouseEvent (document.getElementsByClassName("inputDiv")[0], "mousedown");
        if (document.getElementsByClassName("acceptRulesButton").length>0){
            document.getElementsByClassName("acceptRulesButton")[0].click();
        }
        if (document.querySelector('[data-testid="dismissible-message-dismiss"]')){
            document.querySelector('[data-testid="dismissible-message-dismiss"]').click();
        }
    }

    function triggerMouseEvent (node, eventType) {
        var clickEvent = new Event(eventType, { bubbles: true, cancelable: true });
        node.dispatchEvent (clickEvent);
    }

    function setgenstyle(){
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = ".userUpload img{display:none}"+
            ".lockOverlayBg {background-color:rgba(0, 0, 0, 0) !important;top:50% !important}"+
            ".lockOverlayBg img{display:none}"+
            ".userUpload div{background-color:rgba(0, 0, 0, 0) !important}"+
            ".previewBorder {display:block !important}"+
            ".previewText {color:black !important}"+
            ".photoVideoDetailSection img{filter: blur(0px) !important;height:auto !important;width:auto !important; margin-left: auto;margin-right: auto;display:block;min-width:50%;min-height:50%;max-width:100%;max-height:100%}"+
            ".BioContents{position:relative !important}"+
            ".bioContentText div{background-color:rgba(0, 0, 0, 0) !important}"+
            ".cbLogo {display:none !important}"+
            ".overlay {display:none !important;}"+
            ".subsel{background-color: #0c6a93 !important; color:#fff;outline:0px}"+
            ".profplayer{z-index:99;position:absolute;top:10px;right:10px;border:1px solid rgb(221, 221, 221);border-radius:4px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32)}"+
            ".darkmode .profplayer{z-index:99;position:absolute;top:10px;right:10px;border:1px solid rgb(29, 29, 29);border-radius:4px;box-shadow:0px 0px 32px rgba(255, 255, 255, 0.22)}"+
            ".profdivplayer{z-index:99;position:absolute;top:10px;right:10px;overflow:hidden;resize:horizontal;direction:rtl;border:1px solid rgb(221, 221, 221);border-radius:4px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32);background-color:rgba(0, 0, 0, 0.32)}"+
            ".darkmode .profdivplayer{z-index:99;position:absolute;top:10px;right:10px;overflow:hidden;resize:horizontal;direction:rtl;border:1px solid rgb(29, 29, 29);border-radius:4px;box-shadow:0px 0px 32px rgba(255, 255, 255, 0.22);background-color:rgba(255, 255, 255, 0.22)}"+
            ".darkmode .darkselect{background-color: #202c39 !important; color:#b3b3b3 !important; border-color:#2d3e50 !important}"+//<<
            ".tinput {background-color: #dde9f5 !important; color:#5e81a4 !important; border-color:#8bb3da !important}"+
            ".darkmode .tinput {background-color: #202c39 !important; color:#b3b3b3 !important; border-color:#2d3e50 !important}"+
            ".proftext {width: 350px; height: 45px; line-height: 14px; border-width: 1px; border-style: solid; border-color: #acacac; border-radius: 4px; padding: 7px 8px; overflow: auto;background-color: rgb(230, 230, 230);color:#000;min-width:200px;min-height:45px}"+
            ".darkmode .proftext{width: 350px; height: 45px; line-height: 14px; border-width: 1px; border-style: solid; border-color: #2d3e50; border-radius: 4px; padding: 7px 8px; overflow: auto;background-color: rgb(20,20,20);color:#fff;min-width:200px;min-height:45px}"+
            ".profbutton {border-width: 1px; border-style: solid; border-color: #acacac; border-radius: 4px;background-color: rgb(230, 230, 230);color:#000;cursor: pointer;}"+
            ".darkmode .profbutton {border-color: #dddddd; border-radius: 4px;background-color: rgb(20,20,20);color:#fff;}"+
            ".profbutton:hover:active {transform: scale(0.92)}"+
            ".cleanprof .profpos {display:none !important}"+
            ".cleanprof .profmar {margin-top:0px !important;}"+
            ".cleanprof .profcur{cursor:default !important }"+
            ".translated {background-color:#FFFFE0;color:red;margin-left:10px;padding:0px 5px 0px 5px;text-shadow:0px 0px !important}"+
            ".darkmode .translated {background-color:#000020;color:red;margin-left:10px;padding:0px 5px 0px 5px;text-shadow:0px 0px !important}"+
            ".popclass {background-color:rgb(255, 255, 211)}"+
            ".darkmode .popclass {background-color:rgb(30, 30, 10)}"+
            ".smallemo img.emoticonImage {max-height:22px !important;}"+
            ".bigThumb .RoomCardGrid{grid-template-columns:repeat(auto-fill, minmax(302px, 1fr)) !important}"+
            ".RoomCardGrid{grid-template-columns:repeat(auto-fill, minmax(174px, 1fr)) !important}"+
            ".RoomCardGrid {overflow:visible !important}"+
            ".roomCard,.RoomCard {transition:border-color .12s ease,box-shadow .12s ease}"+
            ".roomCard:hover,.RoomCard:hover {transform:none !important}"+
            ".RoomCard.multicam-qa-host:hover {position:relative;z-index:60}"+
            ".thumbpage .content{overflow: visible; !important ;margin-right:12px !important;margin-left:12px !important}"+
            ".list{overflow: visible !important}"+
            ".MoreRooms{overflow: visible !important}"+
            ".FollowedDropdown__section-title{visibility:hidden !important}"+
            ".FollowedDropdown__rooms:nth-of-type(2n+1){display:none !important}"+
            ".FollowRecommendedRoomlist{display:none !important}"+
            ".HomepageFallbackRoomlist{display:none !important}"+
            ".DesktopRoomlistRoot__separator{display:none !important}"+
            ".suite-skull-icon{display:flex!important;align-items:center!important;justify-content:center!important;border-radius:4px!important;background:#0c6a93!important;color:#fff!important;border:1px solid #2d3e50!important;}"+
            ".scriptset.suite-native-menu{position:fixed;width:306px;max-width:calc(100vw - 20px);max-height:calc(100dvh - 82px);overflow-y:auto;overscroll-behavior:contain;box-sizing:border-box;padding:0;top:68px;right:10px;z-index:2147483000;background:#202c39;color:#f1f1f1;border:1px solid #2d3e50;border-radius:4px;box-shadow:0 8px 24px rgba(0,0,0,.34);font-family:UbuntuRegular,Arial,sans-serif;}"+
            ".suite-menu-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;background:#202c39;border-bottom:1px solid #2d3e50;}"+
            ".suite-menu-head strong{display:block;color:#f1f1f1;font-size:14px;line-height:1.2}.suite-menu-head span{display:block;margin-top:2px;color:#b3b3b3;font-size:11px}.suite-menu-close{width:30px;height:30px;padding:0;border:1px solid #2d3e50;border-radius:4px;background:#17202a;color:#d7d7d7;font-size:20px;cursor:pointer}.suite-menu-close:hover{background:#253648;color:#fff}"+
            ".suite-menu-section{padding:8px 8px 4px;border-bottom:1px solid #2d3e50}.suite-menu-section:last-child{border-bottom:0}.suite-menu-section-title{padding:3px 4px 6px;color:#b3b3b3;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}"+
            ".suite-menu-row{box-sizing:border-box;width:100%;min-height:36px;display:flex;align-items:center;gap:9px;margin:0 0 2px;padding:7px 8px;border:0;border-radius:3px;background:transparent;color:#d7d7d7;text-align:left;font:500 12px/1.25 UbuntuRegular,Arial,sans-serif;cursor:pointer}.suite-menu-row:hover,.suite-menu-row:focus-visible{background:#253648;color:#fff;outline:none}.suite-menu-row.primary{background:#0c6a93;color:#fff}.suite-menu-row.danger{color:#fca5a5}.suite-menu-row-icon{width:18px;flex:0 0 18px;text-align:center;color:#68b5f0;font-size:14px}.suite-menu-row-label{min-width:0;flex:1}.suite-menu-row-value{color:#b3b3b3;font-size:11px}"+
            ".suite-menu-switch-row{cursor:default}.suite-menu-switch-row:hover{background:#253648}.suite-menu-switch{-webkit-appearance:none;appearance:none;width:36px!important;height:20px!important;min-width:36px;margin:0;border:1px solid #43566b;border-radius:999px;background:#17202a;cursor:pointer;accent-color:#0c6a93}.suite-menu-switch::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border:0;border-radius:50%;background:#d7d7d7;box-shadow:none}.suite-menu-switch[value='1']{background:#0c6a93;border-color:#0c6a93}.suite-menu-switch[value='1']::-webkit-slider-thumb{background:#fff}"+
            ".suite-menu-embedded-tools{width:100%}.suite-ban-list{box-sizing:border-box;padding:7px 8px;background:#17202a;border:1px solid #2d3e50;border-radius:3px}.suite-ban-list select{width:100%!important;box-sizing:border-box}.suite-ban-actions{display:flex;gap:6px;margin-top:6px}.suite-ban-actions input{flex:1;min-height:32px;border:1px solid #2d3e50;border-radius:3px;background:#253648;color:#fff}"+
            "#reloadedtoolspanel{box-sizing:border-box;width:100%!important;padding:4px 0 2px;border:0!important;background:transparent!important}#reloadedtoolspanel button{min-height:34px!important;color:#d7d7d7!important;background:#17202a!important;border:1px solid #2d3e50!important;border-radius:3px!important;font-family:UbuntuRegular,Arial,sans-serif!important;font-size:12px!important;text-shadow:none!important}#reloadedtoolspanel button:hover{background:#253648!important;color:#fff!important}"+
            "#reloadedtoolspanel span:not([style*='display: none']):not([style*='display:none']){display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;float:none!important;top:auto!important;right:auto!important;margin:2px 0!important;padding:7px 8px!important;color:#d7d7d7!important;background:#17202a!important;border:1px solid #2d3e50!important;border-radius:3px!important;font-family:UbuntuRegular,Arial,sans-serif!important;font-size:12px!important;text-shadow:none!important}#reloadedtoolspanel br{display:none!important}#reloadedtoolspanel input[type='range']{accent-color:#0c6a93}"+
            ".HeaderUserProfileMenu {z-index:104}"+
            ".holdpage {position: fixed;  display: block; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0); z-index: 200; cursor: wait;}"+
            ".InChatMessage {display:none}"+
            ".roomPage .main-content-wrapper{padding-left: 10px;padding-right: 0px !important}";
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function getnoteslist(){
        if(!login){usernoteslist="";addevent2();return;}
        var url=domain+"api/notes/usernames/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.json().then(function(data) {
                    usernoteslist=data;
                }).then(addevent2());
            });
    }

    function addevent2(){
        document.getElementById("holdpage").style.display="block";
        currpage=document.location.href;
        roomname= currpage.split("/")[3];
        thumbobserver1.disconnect();
        setTimeout(addevent2a,500);
    }

    function addevent2a(){
        if (document.getElementById("unfollowit")){
            document.getElementById("unfollowit").style.display="none";
            if (document.location.href.split("/")[4]=="offline"){
                document.getElementById("unfollowit").style.display="block";
            }
        }
        hidemtenter();
        if (currpage!=document.location.href){
            notepopclose();
        }
        currpage=document.location.href;
        var genclass="";
        var tags=document.querySelectorAll('[data-testid="room-card"]');
        if (localStorage.getItem("ignoredusers")){
            banusers=localStorage.getItem("ignoredusers").split(",");
        }
        for (n=0; n<tags.length; n++){
            var thumbroomname=tags[n].querySelector('[data-testid="room-card-username"]').innerHTML;
            if (banusers.indexOf(thumbroomname)!=-1){
                tags[n].style.display="none";
            }
            if ((localStorage.getItem("hidemt"))&&(roomname!="followed-cams")){
                if(tags[n].querySelector('[data-testid="room-card-gender"]')){
                    genclass=tags[n].querySelector('[data-testid="room-card-gender"]').classList;
                    if ((genclass.contains("genderm"))||(genclass.contains("genders"))){
                         tags[n].style.display="none";
                    }
                }
            }
            if(!tags[n].name){
                tags[n].name="Camslut";
                if (!supporter){
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("mouseenter", moveimg);
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("mouseleave", moveimgstop);
                }
                if (login){
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').title="Visit "+thumbroomname+"'s chatroom.";
                    tags[n].querySelector('[data-testid="room-card-image-anchor"]').addEventListener("click", function(event){
                        if (localStorage.getItem("newtabon")){
                            return;
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        openInNewTab(this.href,"_blank");
                    });

                    tags[n].getElementsByClassName("RoomCardDetails")[0].addEventListener("click", function(event){event.stopPropagation();});
                    tags[n].getElementsByClassName("RoomCardDetails")[0].style.cursor="default";
                    tags[n].querySelector('[data-testid="room-card-username"]').href=domain+"p/"+username+"/?tab=bio&model="+thumbroomname;
                    tags[n].querySelector('[data-testid="room-card-username"]').title="Visit "+thumbroomname+"'s bio.";

                    tags[n].querySelector('[data-testid="room-card-username"]').addEventListener("click", function(event){
                        event.stopPropagation();
                        event.preventDefault();
                        var target="_self";
                        if (!localStorage.getItem("newtabon")){
                            target="_blank";
                        }
                        openInNewTab(this.href, target);
                    });
                }else{
                    tags[n].addEventListener("click", function(event){
                        if (localStorage.getItem("newtabon")){
                            return;
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        openInNewTab(this.querySelector('[data-testid="room-card-username"]').href,"_blank");
                    });
                }

                if (usernoteslist!=""){
                    var newelem=document.createElement('div');
                    if (usernoteslist.usernames.indexOf(thumbroomname)!=-1){
                        newelem.innerHTML=note;
                    }else{
                        newelem.innerHTML=nonote;
                    }
                    newelem.style.position="absolute";
                    newelem.style.top="0px";
                    newelem.style.left="0px";
                    newelem.addEventListener("click", function(event){event.stopPropagation();shownote(this.name,event.pageY,event.pageX);});
                    newelem.style.cursor="pointer";
                    newelem.setAttribute("name", thumbroomname);
                    newelem.name=thumbroomname;
                    newelem.title="User notes";
                    tags[n].appendChild(newelem);
                }
            }
        }
        document.getElementById("holdpage").style.display="none";
        showhidden();
    }

    function openInNewTab(href,target){
        var a=document.createElement('a');
        a.style.display = 'none';
        a.target=target;
        a.rel='noopener noreferrer';
        a.href=href;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function startthumbobserver(){
        var node=document.querySelector('[data-testid="room-list"]');
        if (node) thumbobserver1.observe(node,{subtree:true,childList:true});
    }

    function showhidden(){
        if (document.location.href.split("/")[3]=="spy-on-cams"){showhidden4();startthumbobserver();return;}
        if (document.location.href.split("/")[3]!="followed-cams"){startthumbobserver();return;}
        if (document.location.href.split("/")[4]=="offline"){startthumbobserver();return;}
        hidoffset=0;
        hiddenarray=[];
        showhidden2();
    }
    function showhidden2(){
        if (hprom){return;}
        hprom=true;
        var url=hidurl+hidoffset*90;
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    hprom=false;
                    return;
                }
                response.json().then(function(data){
                    if (data.rooms != null){
                        var hiddenlist=data.rooms;
                        for (n=0; n<hiddenlist.length; n++){
                            hiddenarray.push(hiddenlist[n].username);
                        }
                        var pages=Math.ceil(data.total_count/90);
                        hidoffset++;
                        if (hidoffset!=pages){
                            hprom=false;
                            showhidden2();
                        }else{
                            hprom=false;
                            showhidden3();
                        }
                    }
                });
            });
    }
    function showhidden3(){
        var tags=document.querySelector('[data-testid="room-list-container"]').querySelectorAll('[data-testid="room-card"]');
        for (n=0; n<tags.length; n++){
            var oldtext=tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML;
            var name=tags[n].querySelector('[data-testid="room-card-username"]').innerHTML;
            var newtext=oldtext.replace(" HIDDEN","");
            newtext=newtext.replace("HIDDEN","");
            tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext;
            tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "";

            if (hiddenarray.indexOf(name)!=-1){
                if (newtext != ""){
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext+" HIDDEN";
                }else{
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML="HIDDEN";
                }
                tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "blue";
            }
        }
        startthumbobserver();
    }
    function showhidden4(){
        if (document.querySelector('[data-testid="hidden-cams-roomlist"]')){
            var tags=document.querySelector('[data-testid="hidden-cams-roomlist"]').querySelectorAll('[data-testid="room-card"]');
            for (n=0; n<tags.length; n++){
                var oldtext=tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML;
                var newtext=oldtext.replace(" HIDDEN","");
                newtext=newtext.replace("HIDDEN","");
                tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext;
                if (newtext != ""){
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML=newtext+" HIDDEN";
                }else{
                    tags[n].querySelector('[data-testid="thumbnail-label"]').innerHTML="HIDDEN";
                }
                tags[n].querySelector('[data-testid="thumbnail-label"]').style.backgroundColor = "blue";
            }
        }
    }
    function shownote(name,pageY,pageX){
        if(document.getElementById("notepop").style.display=="block"){
            notepopclose();
            if (openthumbname==name){
                return;
            }
        }
        document.getElementById("notepop").style.height="170px";
        document.getElementById("notearea").value="";
        document.getElementById("notenote").innerHTML=notegrey + " Note";
        document.getElementById("notepopLink").style.color="grey";
        opennote="";
        openthumbname=name;
        document.getElementById("notearea").innerHTML="";
        document.getElementById("notepop").style.top=pageY+100+"px";
        document.getElementById("notepop").style.left=pageX+20+"px";
        document.getElementById("notepop").style.display="block";
        document.getElementById("notepopName").style.color="grey";
        document.getElementById("notepopName").innerHTML=openthumbname;
        setTimeout(function(){document.getElementById("main").addEventListener("click",notepopclose);},100);
        var url=domain+"api/notes/for_user/"+openthumbname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    document.getElementById("notearea").value="!! This room is banned !!";
                    return;
                }
                response.json().then(function(data){
                    if (data.text != null){
                        document.getElementById("notearea").value=data.text;
                        opennote=data.text;
                        if (usernoteslist.usernames.indexOf(openthumbname)==-1){
                            usernoteslist.usernames.push(openthumbname);
                            updatedm2();
                        }
                    }
                    getusercolor();
                });
            });
    }

    function getusercolor(){
        var url=domain+"api/messaging/profile/"+openthumbname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    if (data.can_pm){document.getElementById("notepopLink").style.color="green";}
                    var Bcolor="#939393";
                    if (data.sitewide_user.has_tokens){Bcolor="#69a";}
                    if (data.sitewide_user.tipped_recently){Bcolor="#1e5cfb";}
                    if (data.sitewide_user.tipped_alot_recently){Bcolor="#be6aff";}
                    if (data.sitewide_user.tipped_tons_recently){Bcolor="#804baa";}
                    document.getElementById("notepopName").style.color=Bcolor;
                });
            });
    }

    function buildnotepop(){
        var newelem=document.createElement('span');
        newelem.id="notepop";
        newelem.style.display="none";
        newelem.style.position="absolute";
        newelem.style.overflow="hidden";
        newelem.style.backgroundColor="rgb(255, 255, 255)";
        newelem.style.border="1px solid rgb(221, 221, 221)";
        newelem.style.borderRadius="4px";
        newelem.style.width="188px";
        newelem.style.height="170px";
        newelem.style.zIndex="999";
        newelem.style.boxShadow="0px 0px 32px rgba(0, 0, 0, 0.32)";
        document.getElementById("footer-holder").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "#dddddd";
        newelem.style.fontWeight="bold";
        newelem.style.height="15px";
        newelem.style.fontSize="15px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.innerHTML='<span id="notepopName" style="text-Overflow: ellipsis; overflow:hidden; width:150px; height:20px; display:inline-block;cursor:pointer " ></span><span><img src="https://web.static.mmcdn.com/tsdefaultassets/close-gray.svg" style="position: absolute; height: 13px; width: 13px; right: 8px;" title="Close" id="noteclose"></span>';
        document.getElementById("notepop").appendChild(newelem);
        document.getElementById("notepopName").addEventListener("click", function(){var target="_self";if (!localStorage.getItem("newtabon")){target="_blank";}window.open(domain+"p/"+username+"/?tab=bio&model="+openthumbname, target);});
        document.getElementById("noteclose").addEventListener("click", notepopclose);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "white";
        newelem.style.border="1px solid rgb(221, 221, 221)";
        newelem.style.height="15px";
        newelem.style.fontSize="12px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.style.cursor="pointer";
        newelem.addEventListener("click", function(){opendm2(openthumbname);});
        newelem.id="notepopLink";
        newelem.innerHTML='<img src="https://web.static.mmcdn.com/tsdefaultassets/popout-grey-d.svg" height="12px" width="12px"><b> Open DM in new window</b>';
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.backgroundColor = "white";
        newelem.style.color="grey";
        newelem.style.height="10px";
        newelem.style.fontSize="12px";
        newelem.style.padding="8px";
        newelem.style.textAlign="left";
        newelem.id="notenote";
        newelem.innerHTML=notegrey + " Note";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('textarea');
        newelem.id="notearea";
        newelem.style.height="60px";
        newelem.style.fontSize="12px";
        newelem.style.border="1px solid rgb(172, 172, 172)";
        newelem.style.borderRadius="4px";
        newelem.style.backgroundColor="rgb(255, 255, 255)";
        newelem.style.resize="none";
        newelem.style.padding="5px";
        newelem.style.width="85%";
        newelem.setAttribute("placeholder", "Enter notes about this user (only seen by you)");
        newelem.setAttribute("spellcheck", false);
        newelem.addEventListener("input",openbutton);
        newelem.id="notearea";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.id="notecancelsubmit";
        document.getElementById("notepop").appendChild(newelem);
        newelem=document.createElement("span");
        newelem.style.position="relative";
        newelem.style.top="12px";
        newelem.style.left="-15px";
        newelem.addEventListener("click",closebutton);
        newelem.innerHTML='<a href="#" >Cancel</a>';
        document.getElementById("notecancelsubmit").appendChild(newelem);
        var subbutstyle="color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 5px; position: relative; right: 40px; top:10px; float: right; border-radius: 4px; cursor: pointer;";
        newelem=document.createElement("span");
        newelem.setAttribute("style", subbutstyle);
        newelem.addEventListener("click",savenote);
        newelem.innerHTML="Save";
        document.getElementById("notecancelsubmit").appendChild(newelem);
    }

    function savenote(){
        var notetext=document.getElementById("notearea").value;
        var url=domain+"api/notes/for_user/"+openthumbname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", notetext );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(aftersave);
    }

    function aftersave(){
        var notetext=document.getElementById("notearea").value;
        var doupdate=false;
        if ((opennote=="")||(notetext=="")){
            doupdate=true;
        }
        opennote=notetext;
        closebutton();
        if (doupdate){updatedm();}
    }

    function notepopclose(){
        document.getElementById("main").removeEventListener("click",notepopclose);
        document.getElementById("notepop").style.display="none";
    }

    function openbutton(){
        document.getElementById("notepop").style.height="215px";
        document.getElementById("notenote").innerHTML=notegrey + " Note (unsaved)";
        document.getElementById("notearea").value=document.getElementById("notearea").value.replace("$"," "+new Date().toLocaleDateString()+" ");
        if(opennote==document.getElementById("notearea").value){
            closebutton();
        }
    }
    function closebutton(){
        document.getElementById("notenote").innerHTML=notegrey + " Note";
        document.getElementById("notepop").style.height="170px";
        document.getElementById("notearea").value=opennote;
    }

    function opendm2(that){
        var dmurl="messages/";
        if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
        var url=domain+dmurl+that;
        var dmwindow=window.open(url,that,'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
        dmwindow.onload = function(){
            this.addEventListener('unload', function(){setTimeout(function(){updatedm();},1000);});
        };
    }

    function updatedm(){
        var url=domain+"api/notes/usernames/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.json().then(function(data) {
                    usernoteslist=data;
                }).then(updatedm2);
            });
    }

    function updatedm2(){
        var tags=document.querySelectorAll('[title="User notes"]');
        for (n=0; n<tags.length; n++){
             if (usernoteslist.usernames.indexOf(tags[n].getAttribute("name"))!=-1){
                 tags[n].innerHTML=note;
             }else{
                 tags[n].innerHTML=nonote;
             }
         }
    }

    function moveimg(){
        if(localStorage.getItem("animationoff")){return;}
        thisfap=this;
        if (thisfap.getElementsByClassName("thumbnail_label_offline").length!=0){return;}
        fapbr=thisfap.getElementsByTagName("img")[0].src.split("/")[4].split("?")[0];
        cimg.addEventListener("load",regetimg);
        lt2=new Date().getTime();
        cimg.src = "https://jpeg.live.mmcdn.com/minifwap/"+fapbr+"?f="+lt2;
    }

    function moveimgstop(){
        cimg.removeEventListener("load",regetimg);
    }

    function regetimg(){
        var lt=new Date().getTime()-lt2;
        if (lt>180){lt=180;}
        thisfap.getElementsByTagName("img")[0].src=cimg.src;
        setTimeout(function(){lt2=new Date().getTime();cimg.src = "https://jpeg.live.mmcdn.com/minifwap/"+fapbr+"?f="+lt2;}, 200-lt);
    }

    function refresher(){
        document.addEventListener("visibilitychange", function(){
            if (document.hidden){return;}
            if (document.location.href.split("/")[3]=="followed-cams"){
                if (localStorage.getItem("refreshoff")){
                    openInNewTab(document.location.href, "_self");
                }
            }
            setsw();
        });
    }

    function subsel(){
        if (document.getElementById("subselection")){document.getElementById("subselection").remove();}
        if (pageType!="thumbs"){return;}
        if (document.location.search.indexOf("keywords")!=-1){return;}
        if((document.location.href.indexOf("spy-on-cams")==-1)&&(document.location.href.indexOf("followed-cams")==-1)&&(document.location.href.indexOf("/current_app_use/")==-1)){
            var newelem=document.createElement('button');
            newelem.className="ButtonColor-blue GenderNav__button active";
            newelem.style.height="34px";
            newelem.id="subselection";
            var data='<form><select class="subsel Button active" id="subsel" style="margin: -3px 0px 0px 0px;border:0px";background-color:#0c6a93;color:#ffffff outline:0px;>'+
                '<option value="/XX-cams">All cams in category</option>'+
                '<option value="/exhibitionist-cams/XX">Exhibitionist cams</option>'+
                '<option value="/gaming-cams/XX">Gaming cams</option>'+
                '<option value="/new-cams/XX">New Cams</option>'+
                '<option value="/teen-cams/XX">Teen cams (18+)</option>'+
                '<option value="/18to21-cams/XX">18 to 21 cams</option>'+
                '<option value="/21to35-cams/XX">21 to 35 cams</option>'+
                '<option value="/30to50-cams/XX">30 to 50 cams</option>'+
                '<option value="/mature-cams/XX">Mature cams (50+)</option>'+
                '<option value="/north-american-cams/XX">North American cams</option>'+
                '<option value="/euro-russian-cams/XX">Euro Russian cams</option>'+
                '<option value="/south-american-cams/XX">South American cams</option>'+
                '<option value="/asian-cams/XX">Asian cams</option>'+
                '<option value="/other-region-cams/XX">Other region cams</option>'+
                '<option value="/6-tokens-per-minute-private-cams/XX">6 Tokens per minute</option>'+
                '<option value="/12-18-tokens-per-minute-private-cams/XX">12 - 18 Tokens per minute</option>'+
                '<option value="/30-42-tokens-per-minute-private-cams/XX">30 - 42 Tokens per minute</option>'+
                '<option value="/60-72-tokens-per-minute-private-cams/XX">60 - 72 Tokens per minute</option>'+
                '<option value="/90-tokens-per-minute-private-cams/XX">90+ Tokens per minute</option>'+
                '</select></form>';
            var	uloc=document.location.href+"//";
            var loc=uloc.split("/");
            var	check=loc[3]+loc[4];
            var gen="";
            if(check.indexOf("male") != -1){gen="male";}
            if(check.indexOf("female") != -1){gen="female";}
            if(check.indexOf("couple") != -1){gen="couple";}
            if(check.indexOf("trans") != -1){gen="trans";}
            data=data.replace(/XX/gi,gen);
            if (gen === ""){data=data.replace("-cams","");}
            data=data.replace('<option value="/'+loc[3],'<option selected value="/'+loc[3]);
            newelem.innerHTML=data;
            document.querySelector('[data-testid="gender-nav-scrollable-container"]').appendChild(newelem);
            document.getElementById("subsel").addEventListener('change',subselected);
        }
    }

    function subselected(){
        document.location.href=document.getElementById("subsel").options[document.getElementById("subsel").selectedIndex].value;
    }

    function tabpm(){
        if (document.visibilityState=="visible"){return;}
        if (tabblink==true){return;}
        tabblink=true;
        tabblinker();
    }

    function tabblinker(){
        if (document.title == "PM !! PM"){
            document.title = "!! PM !!";
        }else{
            document.title = "PM !! PM";
        }
        if (document.visibilityState!="visible"){
            setTimeout(tabblinker,500);
        }else{
            document.title=ctitle;
            tabblink=false;
        }
    }

    function activateReloadedToolsTab(tabName){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if (recording&&(toolsPanel.dataset.activeTab=="video")&&(tabName!="video")){return;}
        var tabNames=["info","clean","chat","video"];
        var requestedTab=document.getElementById("reloaded-tab-"+tabName);
        if ((!requestedTab)||(requestedTab.style.display=="none")){tabName="info";}
        toolsPanel.dataset.activeTab=tabName;
        for (var tabIndex=0;tabIndex<tabNames.length;tabIndex++){
            var currentName=tabNames[tabIndex];
            var currentTab=document.getElementById("reloaded-tab-"+currentName);
            var currentPane=document.getElementById("reloaded-pane-"+currentName);
            var isActive=currentName==tabName;
            if (currentPane){currentPane.style.display=isActive?"block":"none";}
            if (currentTab){
                currentTab.setAttribute("aria-selected",isActive?"true":"false");
                currentTab.style.background="#0c6a93";
                currentTab.style.boxShadow=isActive?"inset 0 0 0 2px rgba(255,255,255,.9)":"none";
                currentTab.style.opacity=isActive?"1":".78";
            }
        }
        var videoControls=document.getElementById("controls");
        if (videoControls){videoControls.style.display=tabName=="video"?"block":"none";}
        var chatControls=document.getElementById("chatcontrols");
        if (chatControls){chatControls.style.display=tabName=="chat"?"block":"none";}
        if (tabName=="video"){setres();}
    }

    function setReloadedToolsMenuState(expanded,cursor){
        var toolsButton=document.getElementById("reloadedtoolsbutton");
        if (!toolsButton){return;}
        if (typeof expanded=="boolean"){
            toolsButton.setAttribute("aria-expanded",expanded?"true":"false");
        }
        if (cursor){toolsButton.style.cursor=cursor;}
    }

    function toggleReloadedTools(event){
        if (event){event.stopPropagation();}
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if (toolsPanel.style.display=="block"){
            if (recording){return;}
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab(toolsPanel.dataset.activeTab||"info");
    }

    function toggleReloadedToolsFromMenu(event){
        if (event){event.stopPropagation();}
        toggleReloadedTools(event);
    }

    function setReloadedToolsTabAvailable(tabName,available){
        var toolTab=document.getElementById("reloaded-tab-"+tabName);
        if (!toolTab){return;}
        toolTab.style.display=available?"block":"none";
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if ((!available)&&toolsPanel&&(toolsPanel.dataset.activeTab==tabName)){
            activateReloadedToolsTab("info");
        }
    }

    function makevidcontrol(){
        var butstyle="margin-right: 5px;color: rgb(255, 255, 255); background-color:#F47321; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 3px; position: relative;right: 1px;top:-4px; float: right; border-radius: 4px; cursor: pointer; display: inline;";
        var slistyle="text-align: left; width: 310px;margin-right: 4px;color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; text-shadow: rgb(241, 129, 18) 1px 1px 0px; padding: 4px 10px 3px; position: relative; top: 0px; right: 1px; float: right; border-radius: 4px; display: inline;";
        var cbutstyle="margin-right: 5px;color: rgb(255, 255, 255); background: rgba(0, 0, 0, 0) linear-gradient(rgb(255, 151, 53) 0%, rgb(255, 158, 54) 50%, rgb(255, 112, 2) 60%) repeat scroll 0% 0%; font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; text-shadow: rgb(241, 129, 18) 1px 1px 0px; padding: 4px 10px 3px; position: relative;right: 1px; float: right; border-radius: 4px; cursor: pointer; display: inline;";
        var place2=document.querySelector('[data-paction="BroadcasterFeedback"]');
        if(pageType=="ppage"){
            place2=document.getElementsByClassName("tabBar")[0];
        }
        if (pageType=="noaccess"){
            place2=document.getElementsByClassName("top-section")[0];
        }
        if (place2&&window.getComputedStyle(place2).position=="static"){place2.style.position="relative";}
        var newelem="";
        if(pageType=="ppage"){
            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="FOLLOW";
            newelem.setAttribute("title", "Follow the bitch.");
            newelem.addEventListener("click", followbut);
            newelem.id="followbut";
            newelem.style.display="none";
            place2.appendChild(newelem);

            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="UNFOLLOW";
            newelem.setAttribute("title", "Dump her.");
            newelem.addEventListener("click", unfollowbut);
            newelem.style.backgroundColor="#8b8b8b";
            newelem.id="unfollowbut";
            newelem.style.display="none";
            place2.appendChild(newelem);

            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="JOIN FAN CLUB";
            newelem.addEventListener("click", function(){
                var fcwindow= window.open(domain+"fanclub/join/"+roomname+"/?source=SupporterSourceJoinFanClubButton","");
                fcwindow.onload = function(){
                    fcwindow.addEventListener('unload', function(){setTimeout(function(){
                        document.getElementById("fanclubbut").style.display="none";
                        document.getElementById("fanclubmembut").style.display="none";
                        newinfo();},1000);});
                };
            });
            newelem.style.backgroundColor="#009900";
            newelem.id="fanclubbut";
            newelem.style.display="none";
            place2.appendChild(newelem);
            newelem=document.createElement('span');
            newelem.setAttribute("style", butstyle);
            newelem.innerHTML="MEMBER";
            newelem.addEventListener("click", function(){window.open(domain+"fanclub/join/"+roomname+"/?source=SupporterSourceJoinFanClubButton","");});
            newelem.style.backgroundColor="#009900";
            newelem.id="fanclubmembut";
            newelem.style.display="none";
            place2.appendChild(newelem);
        }
        var toolsPanel=document.createElement('div');
        toolsPanel.id="reloadedtoolspanel";
        toolsPanel.style.display="none";
        toolsPanel.style.position="relative";
        toolsPanel.style.border="0";
        toolsPanel.style.borderRadius="0";
        toolsPanel.style.width="100%";
        toolsPanel.style.maxWidth="100%";
        toolsPanel.style.maxHeight="none";
        toolsPanel.style.overflow="visible";
        toolsPanel.style.boxSizing="border-box";
        toolsPanel.style.padding="4px 0";
        toolsPanel.style.margin="4px 0 6px";
        toolsPanel.style.top="auto";
        toolsPanel.style.right="auto";
        toolsPanel.style.zIndex="1";
        toolsPanel.style.background="transparent";
        toolsPanel.setAttribute("class","popclass");
        toolsPanel.addEventListener("click",function(event){event.stopPropagation();});
        var toolsMount=document.getElementById("reloadedtoolsmount");
        if (!toolsMount){
            toolsMount=document.createElement('div');
            toolsMount.id="reloadedtoolsmount";
            toolsMount.style.clear="both";
            toolsMount.style.width="100%";
            var toolsMenuButton=document.getElementById("reloadedtoolsbutton");
            if (toolsMenuButton&&toolsMenuButton.parentNode){
                toolsMenuButton.parentNode.insertBefore(toolsMount,toolsMenuButton.nextSibling);
            }else{
                var scriptMenu=document.getElementById("scriptcontrols");
                if (scriptMenu){scriptMenu.appendChild(toolsMount);}
            }
        }
        if (!toolsMount.parentNode){return;}
        toolsMount.appendChild(toolsPanel);

        var toolsTabs=document.createElement('div');
        toolsTabs.style.display="flex";
        toolsTabs.style.gap="5px";
        toolsTabs.style.alignItems="center";
        toolsTabs.style.marginBottom="10px";
        toolsTabs.setAttribute("role","tablist");
        toolsPanel.appendChild(toolsTabs);
        var toolTabNames=[["info","Info"],["clean","Clean"],["chat","Chat"],["video","Video"]];
        for (var toolTabIndex=0;toolTabIndex<toolTabNames.length;toolTabIndex++){
            var toolTab=document.createElement('button');
            toolTab.type="button";
            toolTab.id="reloaded-tab-"+toolTabNames[toolTabIndex][0];
            toolTab.dataset.tab=toolTabNames[toolTabIndex][0];
            toolTab.innerHTML=toolTabNames[toolTabIndex][1];
            toolTab.setAttribute("role","tab");
            toolTab.setAttribute("aria-controls","reloaded-pane-"+toolTabNames[toolTabIndex][0]);
            toolTab.style.flex="1";
            toolTab.style.border="0";
            toolTab.style.borderRadius="10px";
            toolTab.style.padding="6px 8px";
            toolTab.style.cursor="pointer";
            toolTab.style.fontWeight="700";
            toolTab.style.color="#fff";
            toolTab.style.background="#0c6a93";
            if ((toolTabNames[toolTabIndex][0]=="chat")||(toolTabNames[toolTabIndex][0]=="video")){toolTab.style.display="none";}
            toolTab.addEventListener("click",function(event){event.stopPropagation();activateReloadedToolsTab(this.dataset.tab);});
            toolsTabs.appendChild(toolTab);
        }
        var closeToolsTab=document.createElement('button');
        closeToolsTab.type="button";
        closeToolsTab.innerHTML="&times;";
        closeToolsTab.title="Close Reloaded tools";
        closeToolsTab.style.border="0";
        closeToolsTab.style.background="#0c6a93";
        closeToolsTab.style.borderRadius="10px";
        closeToolsTab.style.color="inherit";
        closeToolsTab.style.fontSize="20px";
        closeToolsTab.style.cursor="pointer";
        closeToolsTab.addEventListener("click",toggleReloadedTools);
        toolsTabs.appendChild(closeToolsTab);

        var toolPaneNames=["info","clean","chat","video"];
        for (var toolPaneIndex=0;toolPaneIndex<toolPaneNames.length;toolPaneIndex++){
            var toolPane=document.createElement('div');
            toolPane.id="reloaded-pane-"+toolPaneNames[toolPaneIndex];
            toolPane.style.display="none";
            toolPane.style.minHeight="44px";
            toolPane.setAttribute("role","tabpanel");
            toolPane.setAttribute("aria-labelledby","reloaded-tab-"+toolPaneNames[toolPaneIndex]);
            toolsPanel.appendChild(toolPane);
        }

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RELOAD ROOM INFO";
        newelem.addEventListener("click", newinfo);
        if (pageType=="noaccess"){newelem.style.display="none";}
        newelem.id="infore";
        document.getElementById("reloaded-pane-info").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="CLEAN PROFILE = ON";
        newelem.style.display="none";
        newelem.id="clean";
        newelem.addEventListener("click", cleancookie);
        document.getElementById("reloaded-pane-clean").appendChild(newelem);
        newelem=document.createElement('div');
        newelem.id="controls";
        newelem.style.display="block";
        newelem.style.position="relative";
        newelem.style.border="0";
        newelem.style.width="100%";
        newelem.style.padding="0";
        newelem.style.top="auto";
        newelem.style.right="auto";
        newelem.style.zIndex="1";
        document.getElementById("reloaded-pane-video").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RESET ALL";
        newelem.addEventListener("click",vreset);
        document.getElementById("controls").appendChild(newelem);


        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="MIRROR";
        newelem.addEventListener("click",mirror);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="INVERT";
        newelem.addEventListener("click",invert);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="DRAG";
        newelem.style.cursor="move";
        newelem.addEventListener("mousedown",dragMouseDown);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="BRIGHTNESS : <input type='range' id='myRange' min=50 max=250 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange").addEventListener("input",badjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="CONTRAST : <input type='range' id='myRange1' min=25 max=225 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange1").addEventListener("input",cadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="SATURATION : <input type='range' id='myRange2' min=0 max=200 value=100 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange2").addEventListener("input",sadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.innerHTML="HUE : <input type='range' id='myRange3' min=180 max=540 value=360 style='width: 200px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("controls").appendChild(newelem);
        document.getElementById("myRange3").addEventListener("input",hadjust);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="SNAPSHOT";
        newelem.id="snapbut";
        newelem.addEventListener("click",snapshot);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="RECORD";
        newelem.id="recbut";
        newelem.addEventListener("click",recstart);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);
        newelem=document.createElement('br');
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.innerHTML="HIDE CONTROL PANEL";
        newelem.id="vcontr2";
        newelem.addEventListener("click",vcontrol);
        document.getElementById("controls").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", cbutstyle);
        newelem.id="rectime";
        newelem.style.display="none";
        newelem.style.cursor="default";
        newelem.innerHTML="REC(1): 00:00:00";
        document.getElementById("controls").appendChild(newelem);
        if(!window.__ziggyReloadedRecorderSubscribed){
            window.__ziggyReloadedRecorderSubscribed=true;
            window.__ziggyUnifiedRecorder?.subscribe?.(syncUnifiedRecordingUi);
        }
        syncUnifiedRecordingUi();
        activateReloadedToolsTab("info");
        if ((pageType=="noaccess")||(pageType=="ppage")){return;}

        newelem=document.createElement('div');
        newelem.id="chatcontrols";
        newelem.style.display="none";
        newelem.style.position="relative";
        newelem.style.border="0";
        newelem.style.width="100%";
        newelem.style.padding="0";
        newelem.style.top="auto";
        newelem.style.right="auto";
        newelem.style.zIndex="1";
        newelem.style.overflow="auto";
        document.getElementById("reloaded-pane-chat").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Small emoticons : <input type='range' id='c1' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Notice : <input type='range' id='c2' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Subject change : <input type='range' id='c3' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Mod/fan enter-leave : <input type='range' id='c4' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        if (document.location.href.split(".").length>2){newelem.style.display="none";}
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Grey user chat : <input type='range' id='c5' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Moderator chat : <input type='range' id='c6' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Lovense messages : <input type='range' id='c8' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Tips smaller than : <input class='tinput' type='number' id='c7a' min='2' max='1000' value='100' style='width: 4em;height:11px;cursor: pointer; '> tokens.<input type='range' id='c7' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Translate chat to: <select id='language' class='darkselect'></select><input type='range' id='c10' min=0 max=1 value=0 style='width: 40px;height:11px;cursor: pointer;float: right;'>";
        document.getElementById("chatcontrols").appendChild(newelem);

        newelem=document.createElement('span');
        newelem.setAttribute("style", slistyle);
        newelem.style.margin="2px";
        newelem.innerHTML="Tokens received : <span id='tclear' style='cursor:pointer'>  (Clear)</span><span id='c9' style='width: 40px;height:11px;float: right; color:black'>0</span>";
        document.getElementById("chatcontrols").appendChild(newelem);
        tr2=tr2.replace("www.chaturbate","translate.googleapis")+"single?client=gtx&sl=auto&tl=";
        var languages=["Afrikaans","Albanian","Arabic","Armenian","Azerbaijani","Balinese","Basque","Belarusian","Bengali","Bosnian","Bulgarian","Cantonese","Catalan","Chinese","Corsican","Croatian","Czech","Danish","Dutch","English","Estonian","Filipino","Finnish","French","Georgian","German","Greek","Hebrew","Hindi","Hungarian","Icelandic","Indonesian","Irish","Italian","Japanese","Javanese","Kazakh","Korean","Latvian","Limburgan","Lithuanian","Luxembourgish","Macedonian","Maltese","Mongolian","Myanmar","Norwegian","Papiamento","Persian","Polish","Portuguese","Punjabi","Romanian","Russian","Sanskrit","Serbian","Sicilian","Slovak","Slovenian","Somali","Spanish","Sundanese","Swahili","Swedish","Tamil","Thai","Turkish","Ukrainian","Urdu","Uzbek","Vietnamese","Yiddish"];
        var langcode=["af","sq","ar","hy","az","ban","eu","be","bn","bs","bg","yue","ca","zh","co","hr","cs","da","nl","en","et","fil","fi","fr","ka","de","el","he","hi","hu","is","id","ga","it","ja","jv","kk","ko","lv","li","lt","lb","mk","mt","mn","my","no","pap","fa","pl","pt","pa","ro","ru","sa","sr","scn","sk","sl","so","es","su","sw","sv","ta","th","tr","uk","ur","uz","vi","yi"];
        for(i=0;i < languages.length;i++) {
            var option=document.createElement('option');
            option.textContent=languages[i];
            option.value=langcode[i];
            document.getElementById("language").appendChild(option);
        }
        // The controls are already complete at this point. Make Chat available
        // immediately instead of waiting for the unrelated room-info API.
        setReloadedToolsTabAvailable("chat",true);
        scheduleReloadedChatInit(true);
    }

    function followbut(){
        var url=domain+"follow/follow/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
        document.getElementById("followbut").style.display="none";
        document.getElementById("unfollowbut").style.display="block";
        });
    }

    function unfollowbut(){
        var url=domain+"follow/unfollow/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
        document.getElementById("unfollowbut").style.display="none";
        document.getElementById("followbut").style.display="block";
        });
    }

    function snapshot(){
        document.getElementById("snapbut").removeEventListener("click",snapshot);
        document.getElementById("snapbut").style.color="red";
        var video = document.getElementsByTagName('video')[0];
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var imgqual="0.95";
        var fontsize=12;
        if (video.videoWidth < video.videoHeight){
            fontsize=6;
        }
        if (localStorage.getItem("smallsnap")){
            imgqual="0.75";
            if (video.videoWidth > video.videoHeight){
                canvas.height = 480;
                canvas.width=parseInt(video.videoWidth*480/video.videoHeight);
            }else{
                canvas.width = 480;
                canvas.height = parseInt(video.videoHeight*480/video.videoWidth);

            }
        }
        ctx.font=fontsize*canvas.height/480+"px Georgia";
        ctx.drawImage(video, 0, 0,video.videoWidth,video.videoHeight,0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.fillText(roomname+"@chaturbate. Made with chaturbate reloaded userscript by Ladroop.",10,canvas.height-10);
        var starttime=new Date().toISOString().split(".")[0]+"GMT";
        starttime=starttime.replaceAll(":","-");
        var snapname=roomname+"-"+starttime+".jpg";
        canvas.toBlob(function(blob) {
                GM_download({
                    url: blob,
                    name: snapname,
                    onload: imgdlready
                });
        }, 'image/jpeg', imgqual);
    }

    function imgdlready(){
        document.getElementById("snapbut").style.color="white";
        document.getElementById("snapbut").addEventListener("click",snapshot);
    }

    function getvid(){
        vareaid=document.getElementsByTagName("video")[0].id;
        observer3.observe(document.getElementsByTagName("video")[0].parentNode, observerConfig3);
    }

    function varea(){
        if((pageType=="ppage")||(pageType=="noaccess")){
            var video=document.getElementsByTagName("video")[0];
            video.style.filter=vfilter;
            video.style.transform=vmirror;
            return video;
        }
        var vnode=document.getElementById(vareaid);
        if(!vnode){
            vnode=document.getElementById("chat-player");
            if(!vnode){
                return;
            }
        }
        vnode.style.filter=vfilter;
		vnode.style.transform=vmirror;
        if (document.querySelector('[data-testid="video-container"]')&&vnode.src){
            document.querySelector('[data-testid="video-container"]').style.background="rgb(51, 51, 51)";
        }
        setReloadedToolsTabAvailable("video",true);
            if (!vnode.src){
            if (recording){
                recstop();
                setTimeout(function(){document.getElementById("controls").style.display="none";},5000);
            }else{
                document.getElementById("controls").style.display="none";
            }
        }
        return vnode;
    }

	function badjust(){
		br=document.getElementById("myRange").value;
		ofils=varea().style.filter.split(" ");
        vfilter="brightness("+br+"%) "+ofils[1]+" "+ofils[2]+" "+ofils[3]+" "+ofils[4];
        varea();
	}

	function cadjust(){
		br=document.getElementById("myRange1").value;
		ofils=varea().style.filter.split(" ");
        vfilter=ofils[0]+" contrast("+br+"%) "+ofils[2]+" "+ofils[3]+" "+ofils[4];
		varea();
    }

	function sadjust(){
		br=document.getElementById("myRange2").value;
		ofils=varea().style.filter.split(" ");
		vfilter=ofils[0]+" "+ofils[1]+" "+ofils[2]+" saturate("+br+"%) "+ofils[4];
        varea();
	}

	function hadjust(){
		br=document.getElementById("myRange3").value;
		if (br > 359){br=br-360;}
		ofils=varea().style.filter.split(" ");
		vfilter=ofils[0]+" "+ofils[1]+" "+ofils[2]+" "+ofils[3]+" hue-rotate("+br+"deg)";
        varea();
	}

	function invert(){
		ofils=varea().style.filter.split(" ");
		br=" invert(100%) ";
		if (ofils[2]=="invert(100%)"){br=" invert(0%) ";}
		vfilter=ofils[0]+" "+ofils[1]+br+ofils[3]+" "+ofils[4];
        varea();
	}

	function mirror(){
		if (varea().style.transform=="none"){
            vmirror="matrix(-1, 0, 0, 1, 0, 0)";
			varea();

		}else{
            vmirror="none";
			varea();
		}
	}

	function vreset(){
        vfilter="brightness(100%) contrast(100%) invert(0%) saturate(100%) hue-rotate(0deg)";
        vmirror="none";
  		varea();
 		document.getElementById("myRange").value=100;
		document.getElementById("myRange1").value=100;
		document.getElementById("myRange2").value=100;
		document.getElementById("myRange3").value=360;
	}

    function vcontrol(){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if ((toolsPanel.style.display=="block")&&(toolsPanel.dataset.activeTab=="video")){
            if (recording){return;}
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab("video");
    }

    function setres(){
        if (document.querySelector('[data-testid="quality-option"]')){
            var voptions=document.querySelectorAll('[data-testid="quality-option"]');
            if (voptions[voptions.length-1].style.color){
                voptions[0].click();
            }
        }
    }

    function dragMouseDown(e) {
        e.preventDefault();
        pos1=e.pageX;
        pos2=e.pageY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

     function elementDrag(e) {
        e.preventDefault();
        pos3=pos1-e.pageX;
        pos4=pos2-e.pageY;
        pos1=e.pageX;
        pos2=e.pageY;
        if (e.clientY <130){return;}
        var pos5=parseInt(document.getElementById("controls").style.right)+pos3;
        var pos6=parseInt(document.getElementById("controls").style.top)-pos4;
        if (pos5 < -18){pos5=-18;}
        if (pos5 > window.innerWidth-450){pos5= window.innerWidth-450;}
        document.getElementById("controls").style.right = pos5 + "px";
        document.getElementById("controls").style.top = pos6 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function info(anon){
        var cred="same-origin";
        if (!anon){cred="omit";}
        var url=domain+"api/chatvideocontext/"+roomname+"/";
        var requestFinished=false;
        function finishInfoRequest(){
            if (requestFinished){return;}
            requestFinished=true;
            fetching=Math.max(0,fetching-1);
        }
        fetching++;
        fetch(url,{ credentials: cred}).then(
            function(response) {
                if (response.status !== 200){
                    wprof("Error:","<div style='color:red'>You have no access to this room</div>");
                    finishInfoRequest();
                    if (anon){
                        noaccess=true;
                        info(false);
                        return;
                    }
                    return;
                }
                return response.json().then(function(roomdata) {
                    data=roomdata;
                    finishInfoRequest();
                    if (biodata==""){
                        fanbiodata();
                    }else{
                        setprofileinfo();
                    }
                });
            }).catch(function(error){
                finishInfoRequest();
                console.warn("[Ziggy Suite] Reloaded room info was unavailable or not JSON.",error);
                scheduleReloadedChatInit(false);
            });
    }

    function fanbiodata(){
        var url=domain+"api/biocontext/"+roomname;
        fetch(url,{ credentials: "omit",referrer: domain+roomname+"/"}).then(
            function(response) {
                if (response.status !== 200){
                    setprofileinfo();
                    return;
                }
                response.json().then(function(data) {
                    biodata=data;
                    setprofileinfo();
                });
            });
    }

    function setprofileinfo(){
        room_status=data.room_status;
        username=data.viewer_username;
        if (room_status =="offline"){
            setReloadedToolsTabAvailable("video",false);
            setReloadedToolsTabAvailable("chat",false);
        }
        if(pageType=="ppage"){
            setReloadedToolsTabAvailable("video",false);
            document.getElementsByClassName("voteText")[0].innerHTML="";
            document.getElementsByClassName("voteText")[1].innerHTML="";
            document.getElementsByClassName("highPercent")[0].innerHTML="";
            if (data.satisfaction_score.up_votes){
                document.getElementsByClassName("voteText")[0].innerHTML=data.satisfaction_score.up_votes;
                document.getElementsByClassName("voteText")[1].innerHTML=data.satisfaction_score.down_votes;
                document.getElementsByClassName("highPercent")[0].innerHTML=data.satisfaction_score.percent+"%";
                if (data.satisfaction_score.percent<85){
                    document.getElementsByClassName("highPercent")[0].style.color="red";
                }
            }
        }
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof("Schedule:","<a href='https://www.cbhours.com/user/"+roomname+".html' rel=noreferrer target='_new'>Open in cbhours</a>");
        if ((!document.getElementById("reloaded-tab-video"))||(document.getElementById("reloaded-tab-video").style.display=="none")){
            if (!data.opt_out){
                wprof("Full video (anon):","<a href='https://www.girls4cock.com/fullvideo/?b="+roomname+"' rel=noreferrer target='_new'>Open full video mode as anonymous</a>");
                if (pageType!="noaccess"){
                    wprof("Full video:","<a href='"+domain+"fullvideo/?b="+roomname+"' rel=noreferrer target='_new'>Open full video mode</a>");
                }
            }
        }
        wprof("Myfreecams:","<a href='#' id='mfcName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='mfcCheck' > Check </button><span id=mfcStatus></span>","mfcProf");
        document.getElementById("mfcProf").style.display="none";
        wprof("Cam4:","<a href='#' id='c4Name' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='c4Check' > Check </button><span id=c4Status></span>","c4Prof");
        document.getElementById("c4Prof").style.display="none";
        wprof("Bongacams:","<a href='#' id='bcName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='bcCheck' > Check </button><span id=bcStatus></span>","bcProf");
        document.getElementById("bcProf").style.display="none";
        wprof("Streamate:","<a href='#' id='smName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='smCheck' > Check </button><span id=smStatus></span>","smProf");
        document.getElementById("smProf").style.display="none";
        wprof("Camsoda:","<a href='#' id='csName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='csCheck' > Check </button><span id=csStatus></span>","csProf");
        document.getElementById("csProf").style.display="none";
        wprof("Stripchat:","<a href='#' id='scName' rel=noreferrer target='_new'>dummy</a>&nbsp&nbsp<button type='button' class='profbutton' id='scCheck' > Check </button><span id=scStatus></span>","scProf");
        document.getElementById("scProf").style.display="none";
        if (data.opt_out){
            wprof("On network sites:","No");
        }
        makerulesarea(data.chat_rules);
        if(data.chat_rules!=""){
            wprof ("Chat rules:","Yes <button type='button' class='profbutton' id='rulesview'>Show chatrules</button>");
            document.getElementById("rulesview").addEventListener("click",function(){
                if(document.getElementById("rulespop").style.display=="none"){
                    document.getElementById("rulespop").innerHTML=chatrules;
                    document.getElementById("rulespop").style.display="block";
                }
                else{
                    document.getElementById("rulespop").style.display="none";
                    document.getElementById("rulespop").innerHTML="";
                }
            });
        }
        if(pageType=="ppage"){
            if(!noaccess){
                if (data.following){
                    document.getElementById("unfollowbut").style.display="block";
                }else{
                    document.getElementById("followbut").style.display="block";
                }
                if (data.fan_club_is_member){
                    document.getElementById("fanclubmembut").style.display="block";
                }else{
                    if (data.performer_has_fanclub){
                        document.getElementById("fanclubbut").style.display="block";
                    }
                }
            }
        }
        if (room_status =="offline"){
            if (biodata.last_broadcast){
                wprof("Last online:",biodata.last_broadcast.split("T")[0]);
            }
        }
        if (data.num_viewers!=0){
            wprof("Users in room:",data.num_viewers+" <button class='profbutton' type='button' id='userview' style='display:none'> Show userlist.</button>");
            document.getElementById("userview").addEventListener("click",getuserlist);
        }else{
            wprof("Users in room:","0<a href=# id='userview' style='display:none'></a>");
        }
        if (data.low_satisfaction_score){
            wprof("Satisfaction score:","<font color=#CC0000>LOW !!!</font>");
        }
        if (data.is_moderator){
            wprof("Moderator:","Yes");
        }
        if (data.fan_club_is_member){
            wprof("Fanclub member:","Yes");
        }
        videoSrc=data.hls_source;
        wprof("Room status:",'<span id="rstatus">'+room_status+'</span> <button class="profbutton" type="button" id="hls">Update/copy URL</button>');
        document.getElementById("hls").addEventListener("click",function(){getnewhls(!noaccess,true);});
        if(document.querySelector('[data-testid="offline-content-container"]')){
            if(document.querySelector('[data-testid="offline-content-container"]').style.display=="block"){
                wprof("<div id='alarmmode1'>Status alarm mode:</div>","<div id='alarmmode'><input type='range' id='alrmtype' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Reload if visible <-> Alarm on status change<div>");
           }
        }else{
            if (videoSrc == ""){
                wprof("<div id='alarmmode1'>Status alarm mode:</div>","<div id='alarmmode'><input type='range' id='alrmtype' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Reload if visible <-> Alarm on status change<div>");
            }
        }
        wprof("Status alarm:","<div><input type='range' id='alrm' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> Off <-> On<div>");
        document.getElementById("alrm").addEventListener("change",setalrm);
        document.title=ctitle;
        if (data.tips_in_past_24_hours !== 0){
            wprof("You tipped:",data.tips_in_past_24_hours+" Tk/24h");
        }
        wprof("Nationality:","<span id='flaginfo'>wait....</span>");
        wprof("Region:","<span id='regioninfo'>wait....</span>");
        getregion(false);
        if (pageType=="ppage"){
            if (room_status.indexOf("hidden")!=-1){
                wprof("Hidden show message:",data.hidden_message);
            }
        }
        if ((room_status=="offline")||(pageType=="ppage")){
            wprof("Room topic:","<div style='width:450px;height:auto'>"+data.room_title+"</div>");
        }
        if (biodata.performer_has_fanclub){
            wprof("Fanclub costs:",biodata.fan_club_cost*3+" Tk / 3 Months");
        }
        if (!data.is_age_verified){
            wprof("Status:","Exhibitionist");
        }else{
            if (data.allow_private_shows){
                wprof("Private recording:",data.allow_show_recordings ? "Yes":"No");
                if (data.spy_private_show_price!=0){
                    if (data.premium_private_price!=0){
                        wprof("Min. premium private:",data.premium_private_min_minutes+" Minutes");
                        wprof("Premium privateshow:",data.premium_private_price+" Tk/min");
                    }
                }
                if (data.spy_private_show_price !== 0){
                    if ((data.fan_club_spy_private_show_price !==null)&&(data.fan_club_spy_private_show_price!==data.spy_private_show_price)){
                        if(data.fan_club_spy_private_show_price==0){
                            wprof("Fan Spy on private:","Free");
                        }else{
                            wprof("Fan Spy on private:",data.fan_club_spy_private_show_price+" Tk/min");
                        }
                    }
                    wprof("Spy on private:",data.spy_private_show_price+" Tk/min");
                }else{
                    wprof("Spy on private:","Disabled");
                }
                wprof("Minimum private:",data.private_min_minutes+" Minutes");
                wprof("Privateshow:",data.private_show_price+" Tk/min");
            }else{
                wprof("Privateshow:","Disabled");
            }
        }
        if (login){
            if (pageType!="noaccess"){
                if (roomname!=username){
                    var dmurl="messages/";
                    if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
                    wprof ("DM:","<a href='"+domain+dmurl+roomname+"/' id='dmpop'>Open window</a>");
                    document.getElementById("dmpop").addEventListener("click", function(event){opendm(this);event.stopPropagation();event.preventDefault();return false;});
                }
            }
            getnotes();
            gojpg=false;
            createimage();
        }
        if ((room_status!="offline")&&(pageType!="ppage")){chatchange();}
    }

    function getuserlist(){
        if (regiofetch){alert("Please wait");return;}
        if(document.getElementById("rulespop").style.display=="block"){
            document.getElementById("rulespop").style.display="none";
            document.getElementById("rulespop").innerHTML="";
            return;
        }else{
            document.getElementById("rulespop").style.display="block";
        }

        var listurl=domain+"api/getchatuserlist/?sort_by=a&roomname="+roomname+"&exclude_staff=false";
        fetch(listurl,{credentials: "omit",referrerPolicy: "no-referrer"}).then(
            function(response) {
                if (response.status !== 200){
                    return;
                }
                response.text().then(function(userdata) {
                    formatuserlist(userdata);
                });
            });
    }

    function setalrm(){
        if (document.getElementById("alrm").value==0){document.title=ctitle;return;}
        ctitle=document.title;
        getnewhls(true,false);
        setTimeout(function(){
            oldroomstatus=roomstatus;
            if(!alarmrun){
            alarmrun=true;
            testalarm();}},1000);
    }

    function testalarm(){
        document.title="\u23F0 "+ctitle;
        setTimeout(function(){
            if(document.getElementById("alrm").value==0){alarmrun=false;return;}
            getnewhls(true,false,2);
        }, 60000);
    }

    function testalarm2(){
        if (roomstatus != oldroomstatus){
            if (!document.getElementById("alrmtype")){
                playalarm();
                alarmtab();
                alarmrun=false;
            }else{
                if(document.getElementById("alrmtype").value==0){
                    if ((roomstatus=="public")||(roomstatus.indexOf("watching")!=-1)){
                        if (pageType=="ppage"){
                            window.focus();
                            setTimeout(newinfo,1000);
                            return;
                        }
                        forceopen(roomname);
                    }
                    oldroomstatus=roomstatus;
                    if (alarmrun){
                        testalarm();
                        return;
                    }
                }
                playalarm();
                alarmtab();
                alarmrun=false;
            }
        }else{
            if (alarmrun){
                testalarm();
            }
        }
    }

    function playalarm(){
        if (document.getElementById("alrm")){
            if (document.getElementById("alrm").value==0){return;}
        }
        setTimeout(playalarm,2000);
    }

    function alarmtab(){
        if (document.getElementById("alrm")){
            if (document.getElementById("alrm").value==0){document.title=ctitle;return;}
        }
        if (document.title != "ALARM"){
            document.title = "ALARM";
        }else{
            document.title = "!!!!!!";
        }
        setTimeout(alarmtab,500);
    }

    function formatuserlist(userdata){
        var broadcastarray=[];
        for(i=0;i < region.length;i++) {
            broadcastarray[i]=JSON.parse(localStorage.getItem("region_"+region[i]));
        }
        var bc="";
        var userarray=userdata.split(",");
        var height=15*userarray.length+120;
        var scroll="";
        if (height<240){height=240;}
        if (height>500){height=500;scroll=";overflow-y:scroll";}
        var userstring="<div style='float:right;color:black'>(Close)</div><div onclick='event.stopPropagation()' style='cursor:default;color:black;width:350px;height:"+height+"px"+scroll+"'>";
        for (i=1; i<userarray.length; i++){
            var user=userarray[i].split("|");
            if (user[1]=="o"){user[1]="#dc5500";}
            if (user[1]=="m"){user[1]="#dc0000";}
            if (user[1]=="f"){user[1]="#090";}
            if (user[1]=="l"){user[1]="#804baa";}
            if (user[1]=="p"){user[1]="#be6aff";}
            if (user[1]=="tr"){user[1]="#1e5cfb";}
            if (user[1]=="t"){user[1]="#69a";}
            if (user[1]=="g"){user[1]="#939393";}
            if (user[2]=="m"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/male.svg";}
            if (user[2]=="f"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/female.svg";}
            if (user[2]=="c"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/couple.svg";}
            if (user[2]=="s"){user[2]="https://web.static.mmcdn.com/tsdefaultassets/gendericons/trans.svg";}
            if (user[3]=="t"){user[3]="<span title='follower'>⭐</span>";}
            if (user[3]=="f"){user[3]="";}
            bc="";
            for(n=0;n < region.length;n++) {
                if (broadcastarray[n].indexOf(user[0])!=-1){
                    bc="<span title='broadcaster' name='broadcast' broadcaster='"+user[0]+"'>🖥️</span>";
                    break;
                }
            }
            if (user[0]==roomname){
                bc="<span title='broadcaster' name='broadcast' broadcaster='"+user[0]+"'>🖥️</span>";
            }
            if ((user[0]==roomname)||(user[0]==username)){
                userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a style='font-weight: bold;color:"+user[1]+"'>"+user[0]+"</a> "+user[3]+"<br>";
            }else{
                if (login){
                    userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a target=_blank style='font-weight: bold;color:"+user[1]+"' href='"+domain+"p/"+username+"?tab=bio&model="+user[0]+"'>"+user[0]+"</a> "+user[3]+"<br>";
                }else{
                    userstring=userstring+"<img style='height:16px' src='"+user[2]+"'>"+bc+"<a target=_blank style='font-weight: bold;color:"+user[1]+"' href='"+domain+user[0]+"'>"+user[0]+"</a> "+user[3]+"<br>";
                }
            }
        }
        userstring=userstring+"+"+userarray[0].split("|")[0]+" Anonymous users.</div>";
        document.getElementById("rulespop").innerHTML=userstring;
        broadcastarray="";
        broadcastcheck(document.getElementsByName("broadcast").length-1);
    }

    function broadcastcheck(n){
        if (n<0){return;}
        var name=document.getElementsByName("broadcast")[n].getAttribute("broadcaster");
        var url=domain+"get_edge_hls_url_ajax/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "room_slug", name );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "omit",
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+name+"/",
            body: data
        }).then(function(response){
            response.json().then(function(data){
                if(data.room_status=="offline"){
                    document.getElementsByName("broadcast")[n].innerHTML="🖥️❌";
                    document.getElementsByName("broadcast")[n].title="broadcaster offline";
                }
                document.getElementsByName("broadcast")[n].addEventListener("mouseenter",showicon);
                document.getElementsByName("broadcast")[n].addEventListener("mouseout",unshowicon);
                n--;
                broadcastcheck(n);
                return;
            });
        });
    }
    function showicon(){
        var newimg=document.createElement('img');
        newimg.id="picon";
        newimg.style.width="250px";
        newimg.style.position="absolute";
        newimg.style.top="0px";
        newimg.style.right="0px";
        newimg.src="https://thumb.live.mmcdn.com/riw/"+this.getAttribute("broadcaster")+".jpg?"+new Date().getTime();
        document.getElementById("rulespop").prepend(newimg);

    }
    function unshowicon(){
        document.getElementById("picon").remove();
    }

    function resetReloadedChatRuntime(){
        clearTimeout(reloadedChatInitTimer);
        reloadedChatInitTimer=0;
        reloadedChatInitAttempts=0;
        if (reloadedChatObserver){reloadedChatObserver.disconnect();}
        if (reloadedPmChatObserver){reloadedPmChatObserver.disconnect();}
        reloadedChatObserver=null;
        reloadedPmChatObserver=null;
        reloadedChatObservedNode=null;
        reloadedPmChatObservedNode=null;
        reloadedChatControlsRoot=null;
    }

    function nativeReloadedChatReady(){
        return !!document.getElementById("ChatTabContainer")
            || document.getElementsByClassName("message-list").length>0
            || !!document.querySelector('[data-testid="chat-message"]');
    }

    function bindReloadedChatMessageObservers(){
        var messageLists=document.getElementsByClassName("message-list");
        var observenode=messageLists[0]||null;
        var pmobservenode=messageLists[1]||null;
        var chatobserverConfig={childList:true};
        if (observenode!==reloadedChatObservedNode){
            if (reloadedChatObserver){reloadedChatObserver.disconnect();}
            reloadedChatObserver=null;
            reloadedChatObservedNode=observenode;
            if (observenode){
                reloadedChatObserver=new MutationObserver(chatadjust);
                reloadedChatObserver.observe(observenode,chatobserverConfig);
            }
        }
        if (pmobservenode!==reloadedPmChatObservedNode){
            if (reloadedPmChatObserver){reloadedPmChatObserver.disconnect();}
            reloadedPmChatObserver=null;
            reloadedPmChatObservedNode=pmobservenode;
            if (pmobservenode){
                reloadedPmChatObserver=new MutationObserver(pmchatadjust);
                reloadedPmChatObserver.observe(pmobservenode,chatobserverConfig);
            }
        }
    }

    function scheduleReloadedChatInit(resetAttempts){
        if (resetAttempts){reloadedChatInitAttempts=0;}
        if (reloadedChatInitTimer){return;}
        reloadedChatInitTimer=setTimeout(function checkReloadedChat(){
            reloadedChatInitTimer=0;
            var controlsRoot=document.getElementById("chatcontrols");
            if (!controlsRoot){return;}
            if (nativeReloadedChatReady()){
                chatchange();
                return;
            }
            reloadedChatInitAttempts++;
            if (reloadedChatInitAttempts<30){scheduleReloadedChatInit(false);}
        },180);
    }

    function chatchange(){
        var controlsRoot=document.getElementById("chatcontrols");
        if (!controlsRoot){return;}
        setReloadedToolsTabAvailable("chat",true);
        applyReloadedChatSettings();
        if (reloadedChatControlsRoot!==controlsRoot){
            reloadedChatControlsRoot=controlsRoot;
            ["c1","c2","c3","c4","c5","c6","c7","c7a","c8","c10"].forEach(function(controlId){
                var control=document.getElementById(controlId);
                if (control){control.addEventListener("change",chatsetchange);}
            });
            var languageControl=document.getElementById("language");
            if (languageControl){languageControl.addEventListener("change",saveReloadedChatSettings);}
            var clearControl=document.getElementById("tclear");
            if (clearControl){clearControl.addEventListener("click",cleartokens);}
            if (localStorage.getItem(roomname+"Tokens")){
                var tokenControl=document.getElementById("c9");
                if (tokenControl){tokenControl.innerHTML=localStorage.getItem(roomname+"Tokens");}
                firstentry=false;
            }
        }
        bindReloadedChatMessageObservers();
        if (!nativeReloadedChatReady()){scheduleReloadedChatInit(false);}
        applyReloadedChatSettingsToMessages();
    }

    function pmchatadjust(){
        tabpm();
        chatadjust();
    }

    function cleartokens(){
        document.getElementById("c9").innerHTML=0;
        localStorage.removeItem(roomname+"Tokens");
    }

    function chatsetchange(){
        c1=document.getElementById("c1").value;
        c2=document.getElementById("c2").value;
        c3=document.getElementById("c3").value;
        c4=document.getElementById("c4").value;
        c5=document.getElementById("c5").value;
        c6=document.getElementById("c6").value;
        c7=document.getElementById("c7").value;
        c7a=document.getElementById("c7a").value;
        if (c7a<2){c7a=2;document.getElementById("c7a").value=2;}
        if (c7a>1000){c7a=1000;document.getElementById("c7a").value=1000;}
        c8=document.getElementById("c8").value;
        c10=document.getElementById("c10").value;
        saveReloadedChatSettings();
        smallemoonoff();
        applyReloadedChatSettingsToMessages();
    }

    function chatadjust(){
        if (!firstentry){
            twaiting=true;
            setTimeout(function(){twaiting=false;}, 200);
            firstentry=true;
        }
        var tags=document.getElementsByClassName('msg-list-fvm');
        for (n=0; n<tags.length; n++){
            chattamper(n);
        }
    }

    function chattamper(tag){
        var messages=document.getElementsByClassName('msg-list-fvm')[tag].querySelectorAll('[data-testid="chat-message"]');
        var chatmessages=messages.length;
        if (chatmessages==0){return;}
        var translated=0;
        for (i = chatmessages-1; i > 0; i--) {

            var noticeelm=messages[i].querySelector('[data-testid="room-notice"]');
            if (noticeelm!=null){
                var noticeclasses=noticeelm.classList;
                var notetext=noticeelm.querySelector('[data-testid="room-notice-viewport"]').textContent;
                if (noticeclasses.length==1){
                    if (notetext.indexOf("Notice:")==0){
                        if (c2==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                    if (notetext.indexOf("Moderator")==0){
                        if (c4==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                    if (notetext.indexOf("Fan club member")==0){
                        if (c4==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                }
                if (noticeclasses.contains("titleChange")){
                    if (c3==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
                if (noticeclasses.contains("isTip")){
                    var tokens=parseInt(notetext.split("tipped ")[1].split(" ")[0]);
                    if (tag==0){
                        if(messages[i].style.display=="flex"){
                            if(!twaiting){
                                document.getElementById("c9").innerHTML=parseInt(document.getElementById("c9").innerHTML)+tokens;
                                localStorage.setItem(roomname+"Tokens",document.getElementById("c9").innerHTML);
                            }
                        }
                    }
                    if ((c7==1)&&(tokens<c7a)){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
            }

            if (messages[i].querySelector('[data-testid="chat-message-text"]')!=null){
                var chattext=messages[i].querySelector('[data-testid="chat-message-text"]').textContent;
                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="broadcaster"){
                    if ((chattext.indexOf("Lovense")!=-1)||(chattext.indexOf("------")!=-1)||(chattext.indexOf("******")!=-1)||(chattext.indexOf("The High Tipper")!=-1)||(chattext.indexOf("The king Tipper")!=-1)||(chattext.indexOf("Special Commands:")!=-1)||(chattext.indexOf("Blitz Mode")!=-1)||(chattext.indexOf("the critical hit rate")!=-1)){
                        messages[i].name="notranslate";
                        if (c8==1){
                            messages[i].style.display="none";
                        }else{
                            messages[i].style.display="block";
                        }
                    }
                }

                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="defaultUser"){
                    if (c5==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }
                if (messages[i].querySelector('[data-testid="chat-message-username"]').className=="mod"){
                    if (c6==1){
                        messages[i].style.display="none";
                    }else{
                        messages[i].style.display="block";
                    }
                }

                if (c10==1){
                    if(!messages[i].name){
                        if (messages[i].style.display!="none"){
                            var splitmode=true;
                            var splitchatblock=false;
                            if(document.getElementsByClassName('msg-list-fvm')[tag].classList.contains("message-list")){splitchatblock=true;}
                            if(document.getElementById("ChatTabContainer").style.display=="none"){splitmode=false;}
                            if ((splitmode&&splitchatblock)||(!splitmode&&!splitchatblock)){
                                messages[i].name="translate";
                                translated++;
                                if (translated<8){
                                    translate(messages[i]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function translate(elm){
        var chattext=elm.querySelector('[data-testid="chat-message-text"]').textContent;
        var result="";
        chattext=chattext.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,"");
        chattext=chattext.replace(/\./gi,"{.}");
        chattext=chattext.replace(/\?/gi,"{?}");
        chattext=chattext.replace(/\!/gi,"{!}");
        chattext=chattext.replace(/\|/gi,"{|}");
        chattext=chattext.replace(/\&/gi,"{{");
        chattext=chattext.toLowerCase();
        if (chattext.length>2){
            chattext=encodeURI(chattext);
            var lang=document.getElementById("language").options[document.getElementById("language").selectedIndex].value;
            GM_xmlhttpRequest({
                method: "GET",
                timeout: 5000,
                mozAnon: true,
                anonymous: true,
                url: tr2+lang+"&dt=t&q="+chattext,
                onload: function(response) {
                    if (response.status !== 200){
                        result="Translate error "+response.status;
                    }else{
                        result=JSON.parse(response.responseText)[0][0][0];
                        result=result.replace(/\\u200b/gi,"");
                        result=result.replace(/\\u003d/gi,"=");
                        result=result.replace(/\\u003c/gi,"<");
                        result=result.replace(/\\u003e/gi,">");
                        result=result.replace(/\{\{/gi,"&");
                        result=result.replace(/\{/gi,"");
                        result=result.replace(/\}/gi,"");
                    }
                    showtranslate(result,elm);
                },
                ontimeout: function(){
                    result="Translate error timeout";
                    showtranslate(result,elm);
                }
            });
        }
    }

    function showtranslate(result,elm){
        var newelem=document.createElement('span');
        newelem.innerHTML=result;
        newelem.className="translated";
        elm.firstChild.lastElementChild.appendChild(newelem);
    }

    function smallemoonoff(){
        if (c1==1){
            document.body.classList.add("smallemo");
        }else{
            document.body.classList.remove("smallemo");
        }
    }

    function ccontrol(){
        var toolsPanel=document.getElementById("reloadedtoolspanel");
        if (!toolsPanel){return;}
        if ((toolsPanel.style.display=="block")&&(toolsPanel.dataset.activeTab=="chat")){
            toolsPanel.style.display="none";
            setReloadedToolsMenuState(false);
            return;
        }
        toolsPanel.style.display="block";
        setReloadedToolsMenuState(true);
        activateReloadedToolsTab("chat");
    }

    function opendm(that){
       var dmwindow= window.open(that.href,'DMpop','toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
       dmwindow.onload = function(){
           this.addEventListener('unload', function(){setTimeout(function(){newinfo();},1000);});
       };
    }

    function getnotes(){
        var url=domain+"api/notes/for_user/"+roomname+"/";
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                     wprof("Attention:","This room is banned.");
                    return;
                }
                response.json().then(function(data) {
                    if (data.text == null){data.text="";}
                    opennote=data.text;
                    buildprofnote();
                });
            });
    }

    function makerulesarea(rule){
        if (document.getElementById("rulespop")){return;}
        var rulestyle="cursor:pointer;z-index:999;top:10px;left:10px;box-shadow:0px 0px 32px rgba(0, 0, 0, 0.32);border-radius:4px;border:1px solid rgb(221, 221, 221);background-color:rgb(200, 200, 200);position:absolute; display:none; white-space: pre-line; text-align: left; line-height: 1.4; height: auto; width:500px; padding: 10px 10px 10px 10px; box-sizing: border-box; overflow-wrap: break-word; word-break: break-word; padding: 15px;";
        var newelem=document.createElement('span');
        newelem.setAttribute("style", rulestyle);
        newelem.id="rulespop";
        chatrules="<div style='color:black'><b>"+roomname+" chatrules:</b><br><br>"+rule+"<br><br><center>(Click to close)</center></div>";
        newelem.addEventListener("click",function(){this.style.display="none";this.innerHTML="";});
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function createimage(){
        if ((pageType!="ppage")&&(pageType!="noaccess")){return;}
        hls.detachMedia();
        if (document.getElementById("profimg")){
            document.getElementById("profimg").remove();
        }
        if (document.getElementById("profjpgimg")){
            pimg.removeEventListener("load",regetimgprof);
            pimg.removeEventListener("error",errorimgprof);
            document.getElementById("profjpgimg").remove();
        }
        if (document.getElementById("profplayer")){
            document.removeEventListener("visibilitychange",vidpause);
            document.getElementById("profplayer").remove();
            document.getElementById("controls").style.display="none";
            setReloadedToolsTabAvailable("video",false);
        }
        if ((room_status=="public")||(room_status.indexOf("watching")!=-1)){
            if (!gojpg){
                if (videoSrc!=""){
                    makevidplayer();
                    startvid();
                    return;
                }
            }
            makejpgplayer();
            return;
        }
        var url="https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg";
        fetch(url,{
            cache: "no-cache",
            credentials: "same-origin",referrer: domain}).then(
            function(response){
                response.blob().then(
                    function(rawimg){
                        var imgsize=rawimg.size;
                        if ((imgsize<4408)||(imgsize>4415)){
                            makeimg();
                        }else{
                            makecrd();
                        }
                    });
                }
        );
    }

    function makecrd(){
        if (noaccess){return;}
        if (data.summary_card_image==""){return;}
        var newelem=document.createElement('img');
        newelem.src=data.summary_card_image;
        newelem.className="profplayer";
        newelem.id="profimg";
        newelem.style.height="480px";
        newelem.style.maxWidth="854px";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function makeimg(){
        var newelem=document.createElement('img');
        newelem.src="https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg";
        newelem.className="profplayer";
        newelem.id="profimg";
        newelem.style.height="270px";
        newelem.style.width="480px";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
    }

    function makejpgplayer(){
        var newelem=document.createElement('canvas');
        newelem.width="854";
        newelem.height="480";
        newelem.id="profjpgimg";
        newelem.style.display="none";
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newelem);
        pimg.addEventListener("load",regetimgprof);
        pimg.addEventListener("error",errorimgprof);
        pimg.crossOrigin = "Anonymous";
        n=new Date().getTime();
        pimg.src = "https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+n;
        var canvas=document.querySelector('canvas');
        stream = canvas.captureStream ? canvas.captureStream() : canvas.mozCaptureStream();
        makevidplayer();
        document.querySelector('video').srcObject=stream;
        document.querySelector('video').play();
    }

    function errorimgprof(){
        if (gojpg){return;}
        recstop();
        setTimeout(function(){getnewhls(true,false,1);},2000);
    }

    function regetimgprof(){
        var lt=new Date().getTime()-n;
        if (lt>180){lt=180;}
        if ((document.visibilityState!="visible")&&(!recording)){
            setTimeout(regetimgprof,2000);
        }else{
            var canvas = document.querySelector('canvas');
            canvas.getContext('2d').drawImage(pimg, 0, 0, pimg.width, pimg.height);
            setTimeout(function(){n=new Date().getTime();pimg.src = "https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+n;}, 200-lt);
        }
    }

    function makevidplayer(){
         if(document.getElementById("tabs_content_container")){
            document.getElementById("tabs_content_container").style.minHeight=parseInt(0.562*window.innerWidth-5)+"px";
        }
        var vidobserver=new MutationObserver(vidsize);
        var vidobserverConfig ={attributes : true, attributeFilter : ['style'] };
        var control=localStorage.getItem("videoControls");
        var newdivelem=document.createElement('div');
        newdivelem.className="profdivplayer";
        newdivelem.style.width=vidwidth+"px";
        newdivelem.id="profplayer";
        newdivelem.style.backgroundImage = "url('https://jpeg.live.mmcdn.com/minifwap/"+roomname+".jpg')";
        newdivelem.style.backgroundPosition="top";
        newdivelem.style.backgroundRepeat="no-repeat";
        newdivelem.style.backgroundSize="100% calc(100% - 3px)";
        var newelem=document.createElement('video');
        newelem.style.width="100%";
        newelem.controls=true;
        if (control.indexOf("true")!=-1){newelem.muted=true;}
        var volume=control.split(":")[1].split(",")[0];
        newelem.volume=volume/100;
        newelem.poster="https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+ new Date().getTime();
        newelem.height=parseInt(vidwidth*0.562)+1;
        newelem.id="profvid";
        newelem.setAttribute("playsinline", "");
        newelem.setAttribute("autoplay", "");
        newdivelem.appendChild(newelem);
        document.querySelector('[data-testid="room-bio-tab-contents"]').appendChild(newdivelem);
        vidobserver.observe(document.getElementById("profplayer"), vidobserverConfig);
        if(!document.querySelector('canvas')){
            document.addEventListener("visibilitychange",vidpause);
        }
        setReloadedToolsTabAvailable("video",true);
    }

    function vidsize(){
        vidwidth=parseInt(document.getElementById("profplayer").style.width);
        if (vidwidth<80){vidwidth=80;document.getElementById("profplayer").style.width=vidwidth+"px";}
        if (vidwidth>window.innerWidth-75){vidwidth=window.innerWidth-75;document.getElementById("profplayer").style.width=vidwidth+"px";}
        document.getElementById("profvid").height=parseInt(vidwidth*0.562)+1;
    }

    function startvid(){
        getnewhls(true,false,3);
    }

    function startvid2(){
        if(document.visibilityState!="visible"){return;}
        setReloadedToolsTabAvailable("video",true);
        if (videoSrc==""){
            createimage();
            return;
        }
        var video=document.getElementsByTagName('video')[0];
        video.poster="https://jpeg.live.mmcdn.com/stream?room="+roomname+"&f="+ new Date().getTime();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (fatalerror==0){
                setTimeout(function(){
                    fatalerror=0;
                  }, 15000);
            }
            fatalerror++;
            if (fatalerror > 10){
                restarts++;
                setTimeout(function(){restarts=0;}, 15000);
                if (restarts==3){
                    restarts=0;
                    if (!recording){
                        gojpg=true;
                        hls.detachMedia();
                        createimage();
                        setTimeout(function(){gojpg=false;getnewhls(true,false,1);},15000);
                        return;
                    }
                    fatalerror=0;
                    hls.detachMedia();
                    getnewhls(true,false,3);
                    return;
                }
            }

        });
    }

    function vidpause(){
        if (recording){return;}
        if (document.hidden){
            clearTimeout(vidpausetime);
            vidpausetime=setTimeout(function(){
                if (document.hidden){
                    vidonpause=true;
                    hls.stopLoad();
                    hls.detachMedia();
                }
            },10000);
        }else{
            if (!document.hidden){
                clearTimeout(vidpausetime);
                if (vidonpause){
                    vidonpause=false;
                    startvid();
                }
            }
        }
    }

    function recstop(){
        // Legacy room-player source changes must not stop the Recorder Hub.
        return;
    }
    function syncUnifiedRecordingUi(){
        var controller=window.__ziggyUnifiedRecorder;
        var rec=controller?.get?.(roomname);
        var button=document.getElementById('recbut');
        var timer=document.getElementById('rectime');
        if(button){
            button.textContent=rec?'STOP RECORDING':'RECORD';
            button.style.color=rec?.status==='recording'?'#ff6b6b':'white';
            button.title=rec?('Recorder Hub: '+String(rec.status||'active')):'Start recording in Recorder Hub';
        }
        if(timer){
            timer.style.display=rec?'block':'none';
            if(rec){
                var total=Math.max(0,Number(rec.recordedMs)||0);
                var h=String(Math.floor(total/3600000)).padStart(2,'0');
                var m=String(Math.floor(total%3600000/60000)).padStart(2,'0');
                var s=String(Math.floor(total%60000/1000)).padStart(2,'0');
                timer.textContent=String(rec.status||'active').toUpperCase()+' '+h+':'+m+':'+s;
            }
        }
    }
    function recstart(){
        var controller=window.__ziggyUnifiedRecorder;
        if(!controller||!roomname){return;}
        controller.toggle(roomname);
        setTimeout(syncUnifiedRecordingUi,100);
    }
    function buildprofnote(){
        var subbutraw="<span id='profsubmit' style='color: rgb(255, 255, 255); background: rgb(244, 115, 33); font-family: UbuntuMedium, Helvetica, Arial, sans-serif; font-size: 12px; padding: 4px 10px 5px; position: relative; left: 120px; float: left; border-radius: 4px; cursor: pointer;'>Save</span>";
        wprof("",'<div width="200px" id="profnote" style="display:none"><a href=# id="profcancel">Cancel</a>'+subbutraw+'</div>');
//        wprof("Personal notes:","<textarea id='proftext' class='proftext' spellcheck='false' placeholder='Enter notes about this user (only seen by you)'></textarea>");
        wprof("Personal notes:","<textarea id='proftext' class='proftext' spellcheck='false' placeholder='Enter notes about this user (only seen by you)\nWrite site short code (sc:, cs:, bc:, c4:, mfc:, sm:) and modelname to check if the model is online on other sites'></textarea>");
        document.getElementById("proftext").value=opennote;
        document.getElementById("proftext").addEventListener("input",profopenbutton);
        document.getElementById("profcancel").addEventListener("click",profclosebutton);
        document.getElementById("profsubmit").addEventListener("click",profsavenote);
        setExtern();
    }

    function profsavenote(){
        var notetext=document.getElementById("proftext").value;
        var url=domain+"api/notes/for_user/"+roomname+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", notetext );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(profaftersave);
    }

    function profaftersave(){
        opennote=document.getElementById("proftext").value;
        profclosebutton();
    }

    function profopenbutton(){
        document.getElementById("profnote").style.display="block";
        document.getElementById("proftext").value=document.getElementById("proftext").value.replace("$"," "+new Date().toLocaleDateString()+" ");
        if(opennote==document.getElementById("proftext").value){
            profclosebutton();
        }
    }

    function profclosebutton(){
        document.getElementById("profnote").style.display="none";
        document.getElementById("proftext").value=opennote;
    }

    function setExtern(){
        var testnote=opennote.toLowerCase().replaceAll((/[\r\n]+/g)," ");
        if (testnote.includes("cs:")){
            var csName=testnote.split("cs:")[1].split(" ")[0];
            if (csName.length>2){
                document.getElementById("csName").innerHTML=csName;
                document.getElementById("csName").href="https://camsoda.com/"+csName;
                document.getElementById("csCheck").addEventListener("click",function(){csCheck(csName);});
                document.getElementById("csProf").style.display="";
            }
        }
        if (testnote.includes("sc:")){
            var scName=testnote.split("sc:")[1].split(" ")[0];
            if (scName.length>2){
                document.getElementById("scName").innerHTML=scName;
                document.getElementById("scName").href="https://stripchat.com/"+scName;
                document.getElementById("scCheck").addEventListener("click",function(){scCheck(scName);});
                document.getElementById("scProf").style.display="";
            }
        }
        if (testnote.includes("sm:")){
            var smName=testnote.split("sm:")[1].split(" ")[0];
            if (smName.length>2){
                document.getElementById("smName").innerHTML=smName;
                document.getElementById("smName").href="https://streamate.com/cam/"+smName;
                document.getElementById("smCheck").addEventListener("click",function(){smCheck(smName);});
                document.getElementById("smProf").style.display="";
            }
        }
        if (testnote.includes("bc:")){
            var bcName=testnote.split("bc:")[1].split(" ")[0];
            if (bcName.length>2){
                document.getElementById("bcName").innerHTML=bcName;
                document.getElementById("bcName").href="https://bongacams.com/"+bcName;
                document.getElementById("bcCheck").addEventListener("click",function(){bcCheck(bcName);});
                document.getElementById("bcProf").style.display="";
            }
        }
        if (testnote.includes("c4:")){
            var c4Name=testnote.split("c4:")[1].split(" ")[0];
            if (c4Name.length>2){
                document.getElementById("c4Name").innerHTML=c4Name;
                document.getElementById("c4Name").href="https://cam4.com/"+c4Name;
                document.getElementById("c4Check").addEventListener("click",function(){c4Check(c4Name);});
                document.getElementById("c4Prof").style.display="";
            }
        }
        if (testnote.includes("mfc:")){
            var mfcName=testnote.split("mfc:")[1].split(" ")[0];
            if (mfcName.length>2){
                document.getElementById("mfcName").innerHTML=mfcName;
                document.getElementById("mfcName").href="https://myfreecams.com/#"+mfcName;
                document.getElementById("mfcCheck").addEventListener("click",function(){mfcCheck(mfcName);});
                document.getElementById("mfcProf").style.display="";
            }
        }

    }

    function wprof(col1,col2,id){
        var container=document.getElementsByClassName("BioContents")[0];
        var newtr=document.createElement('tr');
        if (id){newtr.id=id;}
        newtr.setAttribute("style", "font-size: 14px; font-weight: normal; line-height: 15px; vertical-align: top; text-align: left;");
        newtr.setAttribute("name", "info");
        var newtd=document.createElement('td');
        newtd.setAttribute("style", "padding-bottom: 9px; font-family: UbuntuMedium, Arial, Helvetica, sans-serif; height: 16px;");
        newtd.className="label";
        var newspan=document.createElement('span');
        newspan.className="defaultColor";
        newspan.innerHTML=col1;
        newtd.appendChild(newspan);
        var newtd2=document.createElement('td');
        newtd2.setAttribute("style", "font-size: 14px; line-height: 16px; font-family: UbuntuRegular, Arial, Helvetica, sans-serif;");
        newtd2.className="contentText";
        newtd2.innerHTML=col2;
        newtr.appendChild(newtd);
        newtr.appendChild(newtd2);
        var referenceNode=container.getElementsByTagName("table")[0];
        referenceNode.insertBefore(newtr, referenceNode.getElementsByTagName("tr")[2]);
    }

    function newinfo(easy){
        if (fetching!==0){alert("Slow down !");return;}
        if (regiofetch){alert("Please wait !");return;}
        regiofetch=true;
        if (easy!=1){
            localStorage.setItem("regloaded","bar");
        }
        if(document.getElementById("rulespop")){document.getElementById("rulespop").style.display="none";}
        var tags=document.getElementsByName("info");
  		for(i=tags.length-1;i>=0;i--){
            tags[i].remove();
        }
        info(true);
    }

    function cleaninit(){
        var p=0;
        var maxoke="";
        var attr="";
        var tags=document.querySelectorAll('[rel="nofollow"]');
        for (n=0; n<tags.length; n++){
            if (tags[n].style.position){
                if (tags[n].style.position=="fixed"){
                    tags[n].style.position="absolute";
                }
                if (tags[n].style.position.indexOf("var")!=-1){
                    tags[n].style.position="absolute";
                }
                if (tags[n].style.position.indexOf("absolute")!=-1){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profpos");
                    p++;
                }
            }
            if (tags[n].style.marginTop){
                maxoke=-30;
                if(tags[n].style.marginTop.indexOf("px")!=-1){maxoke=-200;}
                if (parseFloat(tags[n].style.marginTop)<maxoke){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profmar");
                    p++;
                }
            }
            if (tags[n].style.margin){
                maxoke=-30;
                if(tags[n].style.margin.split(" ")[0].indexOf("px")!=-1){maxoke=-200;}
                if (parseFloat(tags[n].style.margin)<maxoke){
                    if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                        attr=tags[n].getAttribute("style");
                        attr=attr.split("!important").join("");
                        tags[n].setAttribute("style",attr);
                    }
                    tags[n].classList.add("profmar");
                    p++;
                }
            }
            if (tags[n].style.cursor){
                if (tags[n].getAttribute("style").indexOf("!important")!=-1){
                    attr=tags[n].getAttribute("style");
                    attr=attr.split("!important").join("");
                    tags[n].setAttribute("style",attr);
                }
                tags[n].classList.add("profcur");
                p++;
            }
        }
        document.getElementById("clean").style.display="none";
        if (p!==0){
            document.getElementById("clean").style.display="block";
            cleanup();
        }
    }

	function cleancookie(){
        if (localStorage.getItem("pclean")){
            localStorage.removeItem("pclean");
		}else{
            localStorage.setItem("pclean", "foo");
        }
		cleanup();
	}

    function cleanup(){
        var claction=!localStorage.getItem("pclean");
        if (claction){
            document.getElementById("clean").innerHTML= "CLEAN PROFILE = ON&nbsp;";
            document.body.classList.add("cleanprof");
        }else{
            document.getElementById("clean").innerHTML= "CLEAN PROFILE = OFF";
            document.body.classList.remove("cleanprof");
        }
    }

   function linkfix(){
        var bioarea= document.getElementsByClassName('BioContents')[0];
        var tags = bioarea.getElementsByTagName('a');
        for (i=0; i<tags.length; i++){
            if (tags[i].href.indexOf('?url=') != -1){
                var linkout=decodeURIComponent(tags[i].href).split("?url=")[1];
                tags[i].href=linkout;
            }
         }
    }

    function collectiondownload(){
        document.getElementById("main").addEventListener("click", collectiondownload2);
        collectiondownload2();
    }

    function collectiondownload2(){
        setTimeout(function(){collectiondownload3();}, 2000);
    }

    function collectiondownload3(){
        if(document.getElementsByTagName("video").length>0){
            if(document.getElementsByTagName("video")[0].src){
                if(!document.getElementById("link")){
                    var newelem=document.createElement('a');
                    newelem.id="link";
                    newelem.style.position="relative";
                    newelem.style.left="250px";
                    newelem.style.top="5px";
                    newelem.href= document.getElementsByTagName("video")[0].src;
                    newelem.target="_blank";
                    newelem.innerHTML="Right click, save to disk.";
                    newelem.style.backgroundColor="white";
                    newelem.style.marginLeft="20px";
                    document.getElementsByClassName("createdAt")[0].parentNode.appendChild(newelem);
                }
            }
        }
    }

    function savedprvdownload(){
        setTimeout(function(){savedprvdownload3();}, 2000);
    }

    function savedprvdownload3(){
        var newelem=document.createElement('a');
        newelem.href= document.getElementsByTagName("video")[0].src;
        newelem.target="_blank";
        newelem.innerHTML="Right click, save to disk.<br>";
        newelem.style.backgroundColor="white";
        newelem.style.marginLeft="20px";
        document.getElementById("tsRecordedShowPlayer").appendChild(newelem);
    }

    function passwordfollow(){
        setTimeout(function(){
            var unfollow=document.querySelector('[data-testid="unfollow-button"]');
            var follow=document.querySelector('[data-testid="follow-button"]');
            if (unfollow.style.display=="none"){
                follow.parentNode.parentNode.style.display="block";
                follow.style.display="block";
            }
                unfollow.addEventListener("click", function(){setTimeout(function(){document.location.reload();}, 500);} );
                follow.addEventListener("click", function(){setTimeout(function(){document.location.reload();}, 500);} );
        }, 1000);
        var newelem=document.createElement('div');
        newelem.className="BioContents";
        var newtable=document.createElement('table');
        newelem.appendChild(newtable);
        var newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        newtr=document.createElement('tr');
        newelem.style.position="relative";
        newelem.style.float="left";
        newtable.appendChild(newtr);
        document.getElementsByClassName("defaultColor")[0].appendChild(newelem);
        var dmurl="messages/";
        if (document.getElementById("dmListIconRoot")){dmurl="dm/";}
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof ("DM:","<a href='"+domain+dmurl+roomname+"/' id='dmpop'>Open window</a>");
        wprof("Video:",'<div id="rstatus"></div>');
        wprof("Video status:","<a href=# id='hls'>Update status</a>");
        wprof("Check:","Off <input type='range' id='pwalrm' min=0 max=1 value=0 style='width: 35px;height:auto;cursor: pointer'> On || Enter the room if you get access.");
        document.getElementById("pwalrm").addEventListener("change",setpwalrm);
        getnewhls(true,false);
        document.getElementById("hls").addEventListener("click",function(){getnewhls(true,true);});
        document.getElementById("dmpop").addEventListener("click", function(event){opendm3(this);event.stopPropagation();event.preventDefault();return false;});
        getnotes();
        document.getElementsByClassName("tooltip")[0].innerHTML="If follow does not work this room banned your region or gender.";
        document.getElementById("tsContent").style.minHeight="400px";
    }

    function setpwalrm(){
        if (document.getElementById("pwalrm").value==0){return;}
        if (alarmrun==false){
            alarmrun=true;
            checkpwalarm();
        }
    }

    function checkpwalarm(){
        setTimeout(function(){
            if(document.getElementById("pwalrm").value==0){alarmrun=false;return;}
            var url=domain+"api/chatvideocontext/"+roomname+"/";
            fetch(url,{credentials: "same-origin"}).then(
            function(response) {
                if (response.status == 200){
                    forceopen(roomname);
                    return;
                }
                checkpwalarm();
            });
        },60000);
    }

    function forceopen(room){
        window.focus();
        setTimeout(function(){document.location.href=domain+room;},1000);
    }

    function opendm3(that){
       window.open(that.href,'DMpop','toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=1000,height=800');
    }

    function bannedroom(){
        var url=domain+"api/chatvideocontext/"+roomname+"/";
        fetch(url,{method: 'HEAD', credentials: "omit"}).then(
            function(response) {
                if (response.status !== 200){
                    noaccess=true;
                    setprofile();
                    return;
                }else{
                    document.location.href=domain+'p/'+username+'?tab=bio&model='+roomname;
                    return;
                }
            });
    }

    function setprofile(){
        document.getElementsByClassName("BaseRoomContents")[0].style.minHeight=parseInt(0.562*window.innerWidth-5)+"px";
        var newelem=document.createElement('div');
        newelem.style.width="100%";
        newelem.style.height="1px";
        newelem.setAttribute('data-testid', 'room-bio-tab-contents');
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        newelem=document.createElement('div');
        newelem.style.margin="14px 14px";
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        newelem=document.createElement('div');
        newelem.className="BioContents";
        newelem.style.margin="20px";
        var newtable=document.createElement('table');
        newelem.appendChild(newtable);
        var newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        newtr=document.createElement('tr');
        newtable.appendChild(newtr);
        document.getElementsByClassName("BaseRoomContents")[0].appendChild(newelem);
        putinlinks();
        makevidcontrol();
        getnewhls(true,false,1);
        setTimeout(function(){
            if (room_status!="public"){
                if(room_status.indexOf("watching")==-1){
                    setReloadedToolsTabAvailable("video",false);
                    document.getElementById("controls").style.display="none";
                }
            }
        },1000);
    }

    function putinlinks(){
        wprof("","<a href=# id=moreinfo>Click here to search for more info.</a>");
        document.getElementById("moreinfo").addEventListener("click",moreinfo);
        wprof("Find:","<a href='https://camgirlfinder.net/models/cb/"+roomname+"' rel=noreferrer target='_new'>Open in camgirlfinder</a>");
        wprof("Statistics:","<a href='https://statbate.com/search/1/"+roomname+"' rel=noreferrer target='_new'>Open in statbate</a>");
        wprof("Schedule:","<a href='https://www.cbhours.com/user/"+roomname+".html' rel=noreferrer target='_new' id='userview'>Open in cbhours</a>");
        wprof("Video status:","<a href=# id='hls'>Update status</a>");
        document.getElementById("hls").addEventListener("click",function(){getnewhls(true,true,1);});
        wprof("Video:",'<div id="rstatus">'+room_status+'</div>');
        wprof("Nationality:","<span id='flaginfo'>wait....</span>");
        wprof("Region:","<span id='regioninfo'>wait....</span>");
        setTimeout(function(){
            getregion(false);
        },1000);
        if(login){
            getnotes();
        }
    }

    function moreinfo(){
        if (room_status!="public"){
            document.getElementById("moreinfo").innerHTML="Room is not public.";
            setTimeout(function(){document.getElementById("moreinfo").innerHTML="Click here to search for more info.";},3000);
            return;
        }
        document.getElementById("moreinfo").removeEventListener("click",moreinfo);
        document.getElementById("moreinfo").innerHTML="Please wait....";
        var dataurl=domain+"affiliates/api/onlinerooms/?format=json&wm=DEieF";
        fetch(dataurl,{credentials: "omit",referrerPolicy: "no-referrer"}).then(
            function(response) {
                if (response.status !== 200){
                    document.getElementById("moreinfo").innerHTML="Error reading roomlist.";
                    return;
                }
                response.json().then(function(data) {
                    for (n=0; n<data.length; n++){
                        if (data[n].username==roomname){
                            wprof("Gender:",data[n].gender);
                            wprof("Given location:",data[n].location);
                            if (data[n].country !=""){
                                if (document.getElementById("flaginfo").innerHTML!=data[n].country){
                                    wprof("Nationality:",data[n].country);
                                }
                            }
                            wprof("Room topic:","<div style='width:450px;height:auto'>"+data[n].room_subject+"</div>");
                            wprof("Spoken languages:",data[n].spoken_languages);
                            wprof("Name:", data[n].display_name);
                            wprof("Birthday:",data[n].birthday);
                            wprof("Age:",data[n].age);
                            wprof("Time online:",toTime(data[n].seconds_online));
                            wprof("Users in room:",data[n].num_users);
                            wprof("Followers:",data[n].num_followers);
                            document.getElementById("moreinfo").innerHTML="";
                            data="";
                            break;
                        }
                    }
                    if (n==data.length){
                        document.getElementById("moreinfo").innerHTML="No information found, user may no longer be in public or opt-out.";
                        setTimeout(function(){
                            document.getElementById("moreinfo").innerHTML="Click here to search for more info.";
                            document.getElementById("moreinfo").addEventListener("click",moreinfo);
                        },3000);
                    }
                    data="";
                });
            });
    }
    function toTime(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8).replace(":","h").replace(":","m")+"s";
    }

	function createCookie(name,value,days,cdomain){
        var expires="";
        if (cdomain){
            cdomain=";domain=."+cdomain;
        }else{
            cdomain = "";
        }
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }
        document.cookie = name+"="+value+expires+"; path=/"+cdomain;
	}

	function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' '){
                c = c.substring(1,c.length);
            }
            if (c.indexOf(nameEQ) === 0){
                return c.substring(nameEQ.length,c.length);
            }
        }
        return null;
	}

    function rebuildbio(){
        referenceNode=document.getElementsByClassName("BioContents")[0].getElementsByTagName("table")[0];
        document.querySelector('[data-paction="RoomTabs"]').remove();
        removebionode();
        document.getElementsByClassName("editbio")[0].remove();
        document.getElementsByClassName("tooltip defaultTooltipColor")[0].remove();
        document.querySelector('[data-paction-name="ActiveRoom"]').innerHTML=tocap(roomname) + "'s Bio";
        document.querySelector('[data-paction-name="ActiveRoom"]').title=tocap(roomname) + "'s Bio";
        document.title=tocap(roomname) + "'s Bio";
        ctitle=document.title;
        getbiodata(true);
    }

    function tocap(name){
        if (!name){return "";}
        return name.charAt(0).toUpperCase()+name.slice(1);
    }

    function getbiodata(anon){
        var cred="same-origin";
        if (!anon){cred="omit";}
        var url=domain+"api/biocontext/"+roomname;
        fetch(url,{ credentials: cred,referrer: domain+roomname+"/"}).then(
            function(response) {
                if (response.status !== 200){
                    if (anon){
                        getbiodata(false);
                        return;
                    }
                    document.location.href=domain+roomname+"/";
                    return;
                }
                response.json().then(function(data) {
                    biodata=data;
                    buildbio();
                    afterrebuild();
                });
            });
    }

    function removebionode(){
        if (referenceNode.getElementsByTagName("tr")[3]){
            referenceNode.getElementsByTagName("tr")[3].remove();
            removebionode();
        }
    }

    function buildbio(){
        referenceNode.getElementsByTagName("tr")[2].getElementsByTagName("span")[0].innerHTML="Real Name:";
        referenceNode.getElementsByTagName("tr")[2].getElementsByTagName("td")[1].innerHTML=tocap(biodata.real_name);

        var newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
        newnode.getElementsByTagName("span")[0].innerHTML="Followers:";
        newnode.getElementsByTagName("td")[1].innerHTML=biodata.follower_count;
        referenceNode.appendChild(newnode);

        if (biodata.display_birthday){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Birth Date:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.display_birthday;
            referenceNode.appendChild(newnode);
        }
        if (biodata.display_age){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Age:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.display_age;
            referenceNode.appendChild(newnode);
        }

            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="I Am";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.sex)+" "+tocap(biodata.subgender);
            referenceNode.appendChild(newnode);

            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Interested In:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.interested_in[0])+" "+tocap(biodata.interested_in[1])+" "+tocap(biodata.interested_in[2])+" "+tocap(biodata.interested_in[3]);
            referenceNode.appendChild(newnode);

        if (biodata.location){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Location:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.location);
            referenceNode.appendChild(newnode);
        }
        if (biodata.time_since_last_broadcast){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Last Broadcast:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.time_since_last_broadcast;
            referenceNode.appendChild(newnode);
        }
        if (biodata.languages){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Language(s):";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.languages);
            referenceNode.appendChild(newnode);
        }
       if (biodata.body_type){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Body Type:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.body_type);
            referenceNode.appendChild(newnode);
        }
        if (biodata.smoke_drink){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Smoke / Drink:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.smoke_drink);
            referenceNode.appendChild(newnode);
        }
        if (biodata.body_decorations){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Body Decorations:";
            newnode.getElementsByTagName("td")[1].innerHTML=tocap(biodata.body_decorations);
            referenceNode.appendChild(newnode);
        }
        if (biodata.social_medias[0]){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Social Media:";
            newnode.getElementsByTagName("td")[1].innerHTML="Available on cam page.";
            referenceNode.appendChild(newnode);
        }
        if (biodata.photo_sets[0]){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Photo/video:";
            newnode.getElementsByTagName("td")[1].innerHTML="<a href='"+domain+"photo_videos/photoset/detail/"+roomname+"/"+biodata.photo_sets[0].id+"' target=_blank> Open in new tab.</a>";
            referenceNode.appendChild(newnode);
        }
        newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
        newnode.getElementsByTagName("span")[0].innerHTML="About Me:";
        newnode.getElementsByTagName("td")[1].innerHTML=biodata.about_me;
        referenceNode.appendChild(newnode);
        if (biodata.wish_list){
            newnode=referenceNode.getElementsByTagName("tr")[2].cloneNode(true);
            newnode.getElementsByTagName("span")[0].innerHTML="Wish List:";
            newnode.getElementsByTagName("td")[1].innerHTML=biodata.wish_list;
            referenceNode.appendChild(newnode);
        }
    }

   function getnewhls(anon,clicked,next){
        if (hlsfetching==true){return;}
        hlsfetching=true;
        var cred="same-origin";
        if (!anon){cred="omit";}
        var oldmsg=document.getElementById("hls").innerHTML;
        if(clicked){
            document.getElementById("hls").innerHTML="Copying....";
        }else{
            document.getElementById("hls").innerHTML="Checking....";
        }
        var url=domain+"get_edge_hls_url_ajax/";
        var csrftoken= readCookie("csrftoken");
        var edge="";
        if (videoSrc!=""){
            edge=videoSrc.split("/")[2];
        }
        var data = new FormData();
        data.append( "room_slug", roomname );
        data.append( "jpeg", 1 );
        if (next==1){
            data.append( "bandwidth", "high" );
            data.append( "current_edge", edge );
            data.append( "exclude_edge", "" );
        }
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: cred,
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                if (anon){
                    hlsfetching=false;
                    getnewhls(false,clicked,next);
                    return;
                }
                document.getElementById("hls").innerHTML=oldmsg;
                if (next==2){testalarm2();}
                hlsfetching=false;
                return;
            }
            response.json().then(function(data){
                var oldstatus=document.getElementById("rstatus").innerHTML;
                document.getElementById("rstatus").innerHTML=data.room_status;
                document.getElementById("hls").innerHTML=oldmsg;
                roomstatus=data.room_status;
                room_status=data.room_status;
                videoSrc=data.url;
                if (pageType=="ppage"){
                    if(!next){
                        var cansee=true;
                        var couldsee=false;
                        if (data.url==""){cansee=false;}
                        if (oldstatus=="public"){couldsee=true;}
                        if (oldstatus.includes("watching")){couldsee=true;}
                        if (couldsee != cansee){newinfo(1);}
                    }
                }
                if (clicked){navigator.clipboard.writeText(videoSrc);}
                hlsfetching=false;
                if (next==1){createimage();}
                if (next==2){testalarm2();}
                if (next==3){startvid2();}
            });
        });
    }

    function getregion(again){
        for(i=0;i < region.length;i++) {
            if (!localStorage.getItem("region_"+region[i])){
               localStorage.removeItem("regloaded");
            }
        }
        if (localStorage.getItem("regloaded")=="bar"){
            loadregion();
            return;
        }
        if (localStorage.getItem("regloaded")){
            for(i=0;i < region.length;i++) {
                regioarray=JSON.parse(localStorage.getItem("region_"+region[i]));
                 if (regioarray.indexOf(roomname)!=-1){
                    document.getElementById("regioninfo").innerHTML=niceregion[i];
                    if (regioarray[regioarray.indexOf(roomname)+1].length==2){
                        document.getElementById("flaginfo").innerHTML=regioarray[regioarray.indexOf(roomname)+1];
                    }else{
                        document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
                    }
                     regiofetch=false;
                     document.getElementById("userview").style.display="initial";
                     return;
                }
            }
            if ((room_status=="offline")||(room_status=="away")){
                document.getElementById("regioninfo").parentNode.parentNode.style.display="none";
                document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
                regiofetch=false;
                document.getElementById("userview").style.display="initial";
                return;
            }
            if(!again){
                loadregion();
                return;
            }
        }else{
            if(!again){
                loadregion();
                return;
            }
        }
        regiofetch=false;
        document.getElementById("userview").style.display="initial";
        document.getElementById("regioninfo").parentNode.parentNode.style.display="none";
        document.getElementById("flaginfo").parentNode.parentNode.style.display="none";
    }
    function loadregion(){
        regioarray=[];
        if (localStorage.getItem("regloaded")){
            regioarray=JSON.parse(localStorage.getItem("region_"+region[rcount]));
        }
        getregiondata();
    }
    function getregiondata(){
        var url=domain+"api/public/affiliates/onlinerooms/?limit=500&offset="+regoffset*500+"&region="+region[rcount]+"&wm=DEieF&client_ip=212.77.7.51";
        fetch(url,{ credentials: "omit"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    if (data.results != null){
                        var regiolist=data.results;
                        for (n=0; n<regiolist.length; n++){
                            var name=regiolist[n].username;
                            if (regioarray.indexOf(name)==-1){
                                var flag=regiolist[n].country;
                                regioarray.push(name);
                                if (flag.length==2){
                                    regioarray.push(flag);
                                }
                            }
                        }
                        var pages=Math.ceil(data.count/500);
                        regoffset++;
                        if (regoffset!=pages){
                            getregiondata();
                            return;
                        }else{
                            regioarray.push("");
                            localStorage.setItem("region_"+region[rcount],JSON.stringify(regioarray));
                            rcount++;
                            regoffset=0;
                            if (rcount!=region.length){
                                loadregion();
                            }else{
                                rcount=0;
                                localStorage.setItem("regloaded","foo");
                                getregion(true);
                            }
                        }
                    }
                });
            });
    }

    function bantoggle(){
        if (document.getElementById("banlist").style.display=="none"){
            document.getElementById("banlist").style.display="block";
            banusers=[];
            getbanlist(1);
        }else{
            document.getElementById("banusers").innerHTML="";
            document.getElementById("unbanbut").removeEventListener("click", unbanit );
            document.getElementById("permbut").removeEventListener("click", permban );
            document.getElementById("banlist").style.display="none";
        }
    }

    function getbanlist(page){
        var url=domain+"api/ts/chat/ban-list/?page="+page;
        var nowdate=new Date();
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    var selectnode=document.getElementById("banusers");
                    var option=document.createElement('option');
                    option.textContent="Select a user.";
                    option.value=0;
                    selectnode.appendChild(option);
                    var banlist=data.ban_dict.bans;
                    for (n=0; n<banlist.length; n++){
                        var expdate=new Date(banlist[n].expires_at);
                        var expwhen=expdate-nowdate;
                        var expdays=Math.ceil(expwhen/86400000);
                        option=document.createElement('option');
                        option.textContent=banlist[n].username;
                        if (expdays>100){
                            option.textContent=option.textContent+" 🔒";
                        }else{
                            option.textContent=option.textContent+" ("+expdays+" days)";
                        }
                        option.value=banlist[n].id;
                        selectnode.appendChild(option);
                        banusers.push(banlist[n].username);
                    }
                    if (data.ban_dict.current_page!=data.ban_dict.page_count){
                        page++;
                        getbanlist(page);
                        return;
                    }
                    localStorage.setItem("ignoredusers",banusers.toString());
                    document.getElementById("unbanbut").addEventListener("click", unbanit );
                    document.getElementById("permbut").addEventListener("click", permban );
                });
            });
    }

    function unbanit(){
        var banid=document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].value;
        if (banid==0){return;}
        var url=domain+"edit_room_ban/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "banid", banid);
        data.append( "action", "remove_ban");
        data.append( "room_username", username);
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            document.getElementById("banusers").innerHTML="";
            banusers=[];
            getbanlist(1);
       });
    }
    function permban(){
        var banid=document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].value;
        if (banid==0){return;}
        if (document.getElementById("banusers").options[document.getElementById("banusers").selectedIndex].textContent.split(" ").length<3){return;}
        var url=domain+"edit_room_ban/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "banid", banid);
        data.append( "action", "ban_perm");
        data.append( "room_username", username);
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            document.getElementById("banusers").innerHTML="";
            banusers=[];
            getbanlist(1);
       });
    }

    function unfollowthispage(){
        var thumbholder=document.getElementsByClassName("RoomCardGrid")[0];
        roomthumbs=thumbholder.getElementsByClassName("RoomCard");
        nrt=roomthumbs.length;
        if(confirm("Do you want to unfollow these "+thumbholder.getElementsByClassName("RoomCard__followStar").length+" rooms?")){
            thumbobserver1.disconnect();
            document.getElementById("unfollowit").removeEventListener("click",unfollowthispage);
            unfollowroom2();
        }
    }

    function unfollowroom(){
        setTimeout(unfollowroom2,600);
    }

    function unfollowroom2(){
        document.getElementById("unfollowit").innerHTML="<a href=#>WAIT... "+nrt+"</a>";
        nrt--;
        if (nrt<0){
            var page=parseInt(document.location.href.split("page=")[1]);
            if (page){page--;}
            document.location.href=domain+"followed-cams/offline/?page="+page;
        }
        followstar=roomthumbs[nrt].querySelector('[data-testid="follow-star"]');
        var name=roomthumbs[nrt].querySelector('[data-testid="room-card-image-anchor"]').getAttribute("data-room");
        if (followstar.title=="Unfollow"){
            unfollowpage(name);
        }else{
            followpage(name);
        }

    }

    function followpage(name){
        var url=domain+"follow/follow/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+roomname+"/",
            body: data
        }).then(function(){
            followstar.title="Unfollow";
            unfollowroom();
        });
    }

    function unfollowpage(name){
        var url=domain+"follow/unfollow/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "location", "FollowButton" );
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Unfollowing failed.");
                return;
            }
            clearnote(name);
        });
    }

    function clearnote(name){
        var url=domain+"api/notes/for_user/"+name+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "text", "" );
        fetch(url,
              {
            method: "POST",
            headers: {
                'x-csrftoken': csrftoken,
                'x-requested-with': 'XMLHttpRequest'
            },
            body: data
        }).then(function(){
            if (name==roomname){makeban2(name);return;}
            roomthumbs[nrt].remove();
            unfollowroom();
        });
    }

    function getignorelist(){
        if (!login){return;}
        if (localStorage.getItem("ignoredusers")){
            checkignore();
            return;
        }
        getignoreusers(1);
    }

    function getignoreusers(page){
        var url=domain+"api/ts/chat/ban-list/?page="+page;
        fetch(url,{ credentials: "same-origin"}).then(
            function(response) {
                if (response.status !== 200) {
                    return;
                }
                response.json().then(function(data){
                    var banlist=data.ban_dict.bans;
                    for (n=0; n<banlist.length; n++){
                        banusers.push(banlist[n].username);
                    }
                    if (data.ban_dict.current_page!=data.ban_dict.page_count){
                        page++;
                        getignoreusers(page);
                        return;
                    }
                    localStorage.setItem("ignoredusers",banusers.toString());
                    checkignore();
                });
            });
    }

    function checkignore(){
        if (roomname==""){return;}
        banusers=localStorage.getItem("ignoredusers").split(",");
        if (banusers.indexOf(roomname)!=-1){
            document.location.href=domain;
        }

        if (roomname=="roomlogin"){
            if (banusers.indexOf(currpage.split("/")[4])!=-1){
                document.location.href=domain;
            }
        }
        if(pageType=="ppage"){
            if (currpage.split("model=").length==1){return;}
            if (roomname==username){return;}
            if (banusers.indexOf(currpage.split("model=")[1].split("&")[0])!=-1){
                document.location.href=domain;
            }
        }
    }

    function banignore(){
        if ((roomname==username)||(roomname==stor)||(roomname=="p")){
            alert("Sorry, i can not let you do that.");
            return;
        }
        makeban(roomname);

    }

    function makeban(bname){
        if(!confirm("Do you want to ban/ignore "+bname+" ?\n"+bname+" will never be able to contact you and you will never be able to visit this room again.")){return;}
        unfollowpage(bname);
    }

    function makeban2(bname){
        var url=domain+"api/messaging/delete-conversation/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "csrfmiddlewaretoken", csrftoken );
        data.append( "to_username", bname );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+"messages/",
            body: data
        }).then(function(){
            makeban3(bname);
        });
    }

    function makeban3(bname){
        var url=domain+"roomban/"+bname+"/"+username+"/";
        var csrftoken= readCookie("csrftoken");
        var data = new FormData();
        data.append( "csrfmiddlewaretoken", csrftoken );
        fetch(url,{
            credentials: "same-origin",
            method: "POST",
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            referrer: domain+username+"/",
            body: data
        }).then(function(response){
            if (response.status !== 200) {
                alert("Error "+response.status);
                return;
            }
            response.json().then(function(data){
                var finishBanNavigation=function(){setTimeout(function(){document.location.href=domain;},200);};
                if (typeof globalThis.__ziggySuiteCommitNewBan==="function"){
                    Promise.resolve(globalThis.__ziggySuiteCommitNewBan(bname))
                        .catch(function(error){console.warn("[Rooms] ban backup failed",error);})
                        .finally(finishBanNavigation);
                    return;
                }
                banusers=String(localStorage.getItem("ignoredusers")||"").split(",").filter(Boolean);
                if (banusers.indexOf(bname)===-1){banusers.push(bname);}
                localStorage.setItem("ignoredusers",banusers.toString());
                finishBanNavigation();
            });
        });
    }
    function csCheck(model){
        if (csBusy){return;}
        csBusy=true;
        setCsStatus("");
        var scStatus="unkown";
        url="https://www.camsoda.com/api/v1/chat/react/"+model+"?"+new Date().getTime();
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setCsStatus("error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                scStatus=result.chat.status;
                if (scStatus=="online"){
                    scStatus="Online - playlist copied";
                    var playlist="https://"+result.stream.edge_servers[0]+"/"+result.stream.stream_name+"_v1/index.m3u8?token="+result.stream.token;
                    navigator.clipboard.writeText(playlist);
                }
                setCsStatus(scStatus);
            },
            ontimeout: function(){
                setCsStatus("Timeout error");
            }
        });
    }
    function setCsStatus(csStatus){
        document.getElementById("csStatus").innerHTML=" "+csStatus;
        setTimeout(function(){csBusy=false;},1000);
    }

    function scCheck(model){
        if (scBusy){return;}
        scBusy=true;
        setScStatus("");
        var scStatus="unkown";
        url="https://stripchat.com/api/front/v2/models/username/"+model+"/cam?"+new Date().getTime();
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setScStatus("error");
                    return;
                }else{
                    var result=JSON.parse(response.responseText);
                    scStatus=result.user.user.status;
                    if (scStatus=="off"){
                        scStatus="Offline";
                    }
                    if (scStatus=="public"){
                        scStatus = "Online - playlist copied.";
                        var scId=result.user.user.id;
                        var playlist="https://edge-hls.growcdnssedge.com/hls/"+scId+"/master/"+scId+"_480p.m3u8";
                        navigator.clipboard.writeText(playlist);
                    }
                    setScStatus(scStatus);
                }
            },
            ontimeout: function(){
                setScStatus("Timeout error");
            }
        });
    }
    function setScStatus(scStatus){
        document.getElementById("scStatus").innerHTML=" "+scStatus;
        setTimeout(function(){scBusy=false;},1000);
    }

    function smCheck(model){
        if (smBusy){return;}
        smBusy=true;
        setSmStatus("");
        var smStatus="Error";
        url="https://manifest-server.naiadsystems.com/live/s:"+model+".json";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    smStatus="Offline";
                }
                if (response.status == 403){
                    smStatus="Private";
                }
                if (response.status == 200){
                    smStatus="Online - playlist copied";
                    var result=JSON.parse(response.responseText);
                    var playlist=result.formats["mp4-hls"].manifest;
                    navigator.clipboard.writeText(playlist);
                }
                setSmStatus(smStatus);
            },
            ontimeout: function(){
                setSmStatus("Timeout error");
            }
        });
    }
    function setSmStatus(smStatus){
        document.getElementById("smStatus").innerHTML=" "+smStatus;
        setTimeout(function(){smBusy=false;},1000);
    }

    function bcCheck(model){
        if (bcBusy){return;}
        bcBusy=true;
        setBcStatus("");
        var bcStatus="Online - playlist copied";
        url="https://bongacams.com/tools/amf.php";
        GM_xmlhttpRequest({
            method: "POST",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            data: "method=getRoomData&args%5B%5D="+model+"&args%5B%5D=false&args%5B%5D=false",
            referrer: "https://bongacams.com/"+model,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
            },
            credentials: "omit",
            onload: function(response) {
                    if (response.status !== 200){
                        setBcStatus("Site error");
                        return;
                    }else{
                        var result=JSON.parse(response.responseText);
                         if (result.status=="error"){
                            setBcStatus("Model not found");
                            return;
                        }
                        var show=result.performerData.showType;
                        if (show!="public"){bcStatus="Private";}
                        if (show=="group"){bcStatus="Groupshow";}
                        if (result.performerData.isAway==true){bcStatus="Away";}
                        if (result.performerData.isOnline==false){bcStatus="Offline";}
                        if (bcStatus=="Online - playlist copied"){
                            var edge=result.localData.videoServerUrl;
                            var playlist="https:"+edge+"/hls/stream_"+result.performerData.displayName+"/playlist.m3u8";
                            navigator.clipboard.writeText(playlist);
                        }
                        setBcStatus(bcStatus);
                    }
            },
            ontimeout: function(){
                setBcStatus("Timeout error");
            }
        });
    }
    function setBcStatus(bcStatus){
        document.getElementById("bcStatus").innerHTML=" "+bcStatus;
        setTimeout(function(){bcBusy=false;},1000);
    }

    function c4Check(model){
        if (c4Busy){return;}
        c4Busy=true;
        setC4Status("");
        url="https://webchat.cam4.com/requestAccess?roomname="+model;
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setC4Status("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.status=="roomOffline"){
                    setC4Status("Offline");
                    return;
                }
                if (result.privateStream==true){
                    setC4Status("Private");
                    return;
                }
                getC4Video(model);
            },
            ontimeout: function(){
                setC4Status("Timeout error");
            }
        });
    }
    function setC4Status(c4Status){
        document.getElementById("c4Status").innerHTML=" "+c4Status;
        setTimeout(function(){c4Busy=false;},1000);
    }

    function getC4Video(model){
        url="https://cam4.com/rest/v1.0/profile/"+model+"/streamInfo";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setC4Status("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.canUseCDN==false){
                    setC4Status("Private");
                    return;
                }
                if (!result.cdnURL){
                    setC4Status("Connecting");
                    return;
                }
                var playlist=result.cdnURL;
                navigator.clipboard.writeText(playlist);
                setC4Status("Online - playlist copied");
            },
            ontimeout: function(){
                setC4Status("Timeout error");
            }
        });

    }

    function mfcCheck(model){
        if (mfcBusy){return;}
        mfcBusy=true;
        setMfcStatus("");
        url="https://api-edge.myfreecams.com/usernameLookup/"+model;
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setMfcStatus("Error");
                    return;
                }
                var result=JSON.parse(response.responseText);
                if (result.result.message != "user found"){
                    setMfcStatus("User not found");
                    return;
                }
                if (!result.result.user.sessions[0]){
                    setMfcStatus("Offline");
                    return;
                }

                var status=result.result.user.sessions[0].vstate;
                if (status==0){
                    var modelnr=result.result.user.id;
                    var videoserver=result.result.user.sessions[0].server_name;
                    var phase=result.result.user.sessions[0].phase;
                    getmfcvideo(modelnr,videoserver,phase);
                    return;
                }
                if (status==12){
                    setMfcStatus("Private");
                    return;
                }
                if (status==13){
                    setMfcStatus("Group show");
                    return;
                }
                if (status==14){
                    setMfcStatus("Clubshow");
                    return;
                }
                if (status==2){
                    setMfcStatus("Not broadcasting");
                    return;
                }
                if (status==90){
                    setMfcStatus("Online - webcam off");
                    return;
                }
                setMfcStatus("Unknown status "+status);

            },
            ontimeout: function(){
                setMfcStatus("Timeout error");
            }
        });
    }
    function setMfcStatus(mfcStatus){
        document.getElementById("mfcStatus").innerHTML=" "+mfcStatus;
        setTimeout(function(){mfcBusy=false;},1000);
    }
    function getmfcvideo(modelnr,videoserver,phase){
        modelnr=modelnr+100000000;
        var servernr=videoserver.split("ideo")[1];
        url="https://edgevideo.myfreecams.com/llhls/NxServer/"+servernr+"/ngrp:mfc_"+phase+modelnr+".f4v_cmaf/playlist.m3u8?nc=0.6190622874050598&v=1.97.23";
        GM_xmlhttpRequest({
            method: "GET",
            timeout: 5000,
            mozAnon: true,
            anonymous: true,
            url: url,
            onload: function(response) {
                if (response.status !== 200){
                    setMfcStatus("Connecting or away");
                    return;
                }
                data=response.responseText;
                var chunk="chunklist"+data.split("chunklist")[1].split("m3u8")[0]+"m3u8";
                var playlist="https://"+videoserver+".myfreecams.com/NxServer/ngrp:mfc_"+phase+modelnr+".f4v_cmaf/"+chunk+"?nc=0.813118007341&v=1.96";
                setMfcStatus("Online - playlist copied");
                navigator.clipboard.writeText(playlist);
            },
            ontimeout: function(){
                setMfcStatus("Timeout error");
            }
        });
    }

})();

/* Integrated component: Ziggy Mobile Clean View 2.2.0 (native mobile only) */
(function () {
  'use strict';

  const VERSION = '2.2.0';
  const STORE_KEY = 'cb_desktop_mobile_comfort_v1';
  const ROOT_ID = 'zmc-root';
  const STYLE_ID = 'zmc-style';
  const INSTANCE_KEY = '__ziggyMobileCleanViewRunning';
  const SUITE_EVENTS = Object.freeze({
    ready: 'ziggy-mobile-shell:ready',
    state: 'ziggy-suite:state',
    workshop: 'ziggy-suite:open-workshop',
    roomGrid: 'ziggy-suite:toggle-roomgrid',
    toggleRoom: 'ziggy-suite:toggle-current-room',
  });
  const CONTROL_EVENTS = Object.freeze({
    openPanel: 'ziggy-mobile-clean-view:open-panel',
    fullscreen: 'ziggy-mobile-clean-view:fullscreen',
    pip: 'ziggy-mobile-clean-view:pip',
  });
  const BLOCKED_PATH = /^\/(?:accounts|security|auth|apps|api|b|billingsupport|purchase|tipping)(?:\/|$)/i;
  const ROOM_PATH_EXCLUSIONS = new Set([
    '', 'accounts', 'affiliates', 'apps', 'b', 'billingsupport', 'contest',
    'discover', 'followed-cams', 'fullvideo', 'jobs', 'law_enforcement',
    'privacy', 'security', 'spy-on-cams', 'support', 'tags', 'terms', 'v2apps',
  ]);
  const CHAT_TARGET_SELECTORS = [
    '[data-testid="chat-floating-window"]',
    '#draggableCanvasChatWindow',
    '#ChatTabContainer',
    '[data-testid="mobile-chat"]',
    '[data-testid="chat-tab-content"]',
    '[data-testid="chat-container"]',
    '[data-testid="chat-messages"]',
    '[data-testid="chat-message-list"]',
    '.mobile-chat-container',
    '.draggableCanvasChatWindow',
  ];
  const ORIGINAL_MOBILE_HIDE_CHAT_SELECTORS = [
    '.hasDarkBackground > div',
    '.hasDarkBackground',
    '.hasDarkBackground.draggableCanvasChatWindow.draggableCanvasWindow',
  ];
  const CHAT_TAB_SELECTORS = [
    '[data-testid="mobile-chat-tab"]',
    '[data-testid="chat-tab"]',
    '[data-room-tab="chat"]',
    '[aria-controls="ChatTabContainer"]',
    'a[href="#chat"]',
    'button[value="chat"]',
  ];
  const NATIVE_FULLSCREEN_CHAT_SELECTORS = [
    ...CHAT_TARGET_SELECTORS,
    '[data-testid="fullscreen-chat"]',
    '[data-testid="fullscreen-chat-panel"]',
    '[data-testid*="chat-message"]',
    '[data-testid*="message-list"]',
    '[role="log"]',
    '[class*="FullscreenChat"]',
    '[class*="fullscreenChat"]',
    '[class*="fullscreen-chat"]',
    '[class*="ChatPanel"]',
    '[class*="chatPanel"]',
    '[class*="chat-panel"]',
  ];
  const NATIVE_FULLSCREEN_SPLITTER_SELECTORS = [
    '[role="separator"]',
    '[data-testid*="resize"]',
    '[data-testid*="split"]',
    '[data-testid*="drag-handle"]',
    '[class*="ResizeHandle"]',
    '[class*="resizeHandle"]',
    '[class*="resize-handle"]',
    '[class*="Resizer"]',
    '[class*="resizer"]',
    '[class*="Splitter"]',
    '[class*="splitter"]',
  ];
  const DEFAULTS = Object.freeze({
    enabled: true,
    hidePromos: true,
    compactBrowse: true,
    portraitColumns: 2,
    landscapeColumns: 4,
    autoHideSeconds: 5,
    side: 'right',
    portraitFullscreenMode: 'fill',
    landscapeFullscreenMode: 'fit',
  });

  if (window[INSTANCE_KEY]) return;
  window[INSTANCE_KEY] = true;

  let settings = loadSettings();
  let root = null;
  let panelOpen = false;
  let settingsOpen = false;
  let idleTimer = 0;
  let syncTimer = 0;
  let lastUrl = location.href;
  let lastRoomRedirect = '';
  let boundVideo = null;
  let fullscreenSession = null;
  const hiddenNodes = new Set();
  const hiddenState = new WeakMap();

  function clampInt(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  }

  function readStoredValue() {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(STORE_KEY, null);
    } catch (_) {}
    try { return localStorage.getItem(STORE_KEY); } catch (_) { return null; }
  }

  function writeStoredValue(value) {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(STORE_KEY, value);
      }
    } catch (_) {}
    try { localStorage.setItem(STORE_KEY, value); } catch (_) {}
  }

  function sanitizeSettings(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
      enabled: source.enabled !== false,
      hidePromos: source.hidePromos !== false,
      compactBrowse: source.compactBrowse !== false,
      portraitColumns: clampInt(source.portraitColumns, 1, 3, 2),
      landscapeColumns: clampInt(source.landscapeColumns, 2, 5, 4),
      autoHideSeconds: clampInt(source.autoHideSeconds, 0, 30, 5),
      side: source.side === 'left' || source.handedness === 'left' ? 'left' : 'right',
      portraitFullscreenMode: source.portraitFullscreenMode === 'fit' ? 'fit' : 'fill',
      landscapeFullscreenMode: source.landscapeFullscreenMode === 'fill' ? 'fill' : 'fit',
    };
  }

  function loadSettings() {
    try {
      const raw = readStoredValue();
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return sanitizeSettings(parsed);
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  function saveSettings(patch) {
    settings = sanitizeSettings({ ...settings, ...patch });
    writeStoredValue(JSON.stringify(settings));
    syncEnvironment();
    renderSettings();
    resetIdleTimer();
  }

  function isMobileDevice() {
    const mobileUa = navigator.userAgentData?.mobile === true
      || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    const coarse = !!window.matchMedia?.('(pointer: coarse)')?.matches;
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    const screenShort = Math.min(Number(screen?.width) || 9999, Number(screen?.height) || 9999);
    return mobileUa || (coarse && touch && screenShort <= 900);
  }

  function isNativeMobileSite() {
    if (!isMobileDevice()) return false;
    // Chaturbate's desktop application keeps this root even when its window is
    // narrow or the browser is using a mobile user agent. Never apply Clean
    // View to that layout (including "Desktop Site" on a phone).
    if (document.getElementById('desktop-spa-header')) return false;
    if (document.querySelector('[data-testid="header-nav-bar"], [data-testid="desktop-header"]')) return false;
    const marker = document.querySelector([
      '[data-testid="mobile-header"]',
      '[data-testid="mobile-navigation"]',
      '[data-testid="mobile-room-header"]',
      '.MobileHeader',
      '.evolve-header',
      '[class*="MobileHeader"]',
    ].join(','));
    if (marker) return true;
    // The native mobile shell does not expose one stable marker on every route.
    // This fallback is used only on a real touch/mobile device after the desktop
    // roots above have been ruled out.
    return Math.min(Number(innerWidth) || 9999, Number(screen?.width) || 9999) <= 1100;
  }

  function isBlockedPage() {
    if (location.hostname === 'secure.chaturbate.com') return true;
    if (BLOCKED_PATH.test(location.pathname || '')) return true;
    if (new URLSearchParams(location.search).get('multicam_mode') === '1' || new URLSearchParams(location.search).get('multicam_recorder') === '1') return true;
    return !!document.body?.classList.contains('age-gate--shown');
  }

  function currentRoomName() {
    const parts = String(location.pathname || '').split('/').filter(Boolean);
    if (parts.length === 1) {
      const name = parts[0].toLowerCase();
      if (!ROOM_PATH_EXCLUSIONS.has(name) && /^[a-z0-9_-]{1,64}$/i.test(name)) return name;
    }
    for (const selector of ['[data-testid="roomSubject-roomName"]', '[data-testid="room-username"]']) {
      const name = String(document.querySelector(selector)?.textContent || '').trim().toLowerCase();
      if (/^[a-z0-9_-]{1,64}$/i.test(name) && !ROOM_PATH_EXCLUSIONS.has(name)) return name;
    }
    return '';
  }

  function isRoomPage() {
    const room = currentRoomName();
    const hasVideo = !!document.querySelector('video,[data-testid="video-panel"],#VideoPanel,[data-testid="video-container"],#chat-player');
    if (!hasVideo) return false;
    if (room) return true;
    if (/^\/fullvideo(?:\/|$)/i.test(location.pathname || '') && exactChatTabs().length) return true;
    return !!document.querySelector('[data-testid="room-bio-tab-contents"],.roomBio,.BaseRoomContents,#ChatTabContainer,[data-testid="roomSubjectContainer"]');
  }

  function isBrowsePage() {
    return !isRoomPage() && !!document.querySelector('[data-testid="room-list"],.RoomCardGrid,[data-testid="room-card"]');
  }

  function injectViewport() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      (document.head || document.documentElement).appendChild(meta);
    }
    meta.content = 'width=device-width,initial-scale=1,viewport-fit=cover';
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --zmc-accent:#ff6b21;
        --zmc-accent-strong:#e9550f;
        --zmc-bg:#0f172a;
        --zmc-surface:#172235;
        --zmc-surface-2:#243247;
        --zmc-text:#f8fafc;
        --zmc-muted:#aeb9c9;
        --zmc-border:rgba(255,255,255,.14);
        --zmc-shadow:0 22px 70px rgba(0,0,0,.42);
        --zmc-grid-cols:2;
      }
      html.zmc-active,
      html.zmc-active body {
        width:100% !important;
        max-width:100% !important;
        overflow-x:hidden !important;
      }
      html.zmc-active .zmc-chat-hidden {
        display:none !important;
        visibility:hidden !important;
        pointer-events:none !important;
        content-visibility:hidden !important;
      }
      html.zmc-active body.zmc-hide-promos .FollowRecommendedRoomlist,
      html.zmc-active body.zmc-hide-promos .HomepageFallbackRoomlist,
      html.zmc-active body.zmc-hide-promos .DesktopRoomlistRoot__separator,
      html.zmc-active body.zmc-hide-promos [data-testid="promo-banner"],
      html.zmc-active body.zmc-hide-promos .contest_banner,
      html.zmc-active body.zmc-hide-promos .adBanner { display:none !important; }
      html.zmc-active body.zmc-compact-browse .RoomCardGrid {
        display:grid !important;
        grid-template-columns:repeat(var(--zmc-grid-cols),minmax(0,1fr)) !important;
        gap:6px !important;
        width:100% !important;
        min-width:0 !important;
        margin:0 !important;
        padding:6px !important;
        list-style:none !important;
      }
      html.zmc-active body.zmc-browse main,
      html.zmc-active body.zmc-browse .content,
      html.zmc-active body.zmc-browse [data-testid="room-list"],
      html.zmc-active body.zmc-browse [data-testid="room-list-container"],
      html.zmc-active body.zmc-browse .DesktopRoomlistRoot,
      html.zmc-active body.zmc-browse .HomepagePaginatedRoomlist,
      html.zmc-active body.zmc-browse .RoomCardGrid {
        box-sizing:border-box !important;
        min-width:0 !important;
        width:100% !important;
        max-width:100% !important;
        margin-left:0 !important;
        margin-right:0 !important;
      }
      html.zmc-active body.zmc-browse .RoomCardGrid > * {
        min-width:0 !important;
        max-width:100% !important;
      }
      html.zmc-active body.zmc-compact-browse [data-testid="room-card"],
      html.zmc-active body.zmc-compact-browse .RoomCard {
        width:auto !important;
        min-width:0 !important;
        margin:0 !important;
      }
      html.zmc-active body.zmc-compact-browse .RoomCardThumbnail,
      html.zmc-active body.zmc-compact-browse [data-testid="room-card-image-anchor"] {
        display:block !important;
        width:100% !important;
        aspect-ratio:4/3 !important;
        overflow:hidden !important;
      }
      html.zmc-active body.zmc-compact-browse .RoomCardThumbnail__image,
      html.zmc-active body.zmc-compact-browse [data-testid="room-card-image"] {
        width:100% !important;
        height:100% !important;
        object-fit:cover !important;
      }
      html.zmc-active body.zmc-compact-browse .RoomCardDetails {
        min-width:0 !important;
        padding:6px !important;
      }
      html.zmc-active body.zmc-compact-browse .RoomCardSubject {
        display:-webkit-box !important;
        -webkit-box-orient:vertical !important;
        -webkit-line-clamp:2 !important;
        overflow:hidden !important;
      }
      html.zmc-active body.zmc-room .zmc-video-target,
      html.zmc-active body.zmc-room .zmc-video-target [data-testid="video-container"] {
        width:100% !important;
        max-width:none !important;
        margin-inline:0 !important;
      }
      html.zmc-active body.zmc-room .zmc-video-target video {
        width:100% !important;
        max-width:100% !important;
        object-fit:contain !important;
      }
      html.zmc-active body.zmc-native-fullscreen .zmc-native-chat-hidden,
      html.zmc-active body.zmc-native-fullscreen .zmc-native-splitter-hidden {
        display:none !important;
        visibility:hidden !important;
        pointer-events:none !important;
        width:0 !important;
        height:0 !important;
        min-width:0 !important;
        min-height:0 !important;
        max-width:0 !important;
        max-height:0 !important;
        flex:0 0 0 !important;
        margin:0 !important;
        padding:0 !important;
        border:0 !important;
        overflow:hidden !important;
      }
      html.zmc-active body.zmc-native-fullscreen,
      html.zmc-active body.zmc-native-fullscreen .zmc-native-fullscreen-root {
        box-sizing:border-box !important;
        width:100vw !important;
        height:100dvh !important;
        min-width:0 !important;
        min-height:0 !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        overflow:hidden !important;
        overscroll-behavior:none !important;
      }
      html.zmc-active body.zmc-native-fullscreen .zmc-native-layout-reset,
      html.zmc-active body.zmc-native-fullscreen .zmc-native-fullscreen-video-region {
        box-sizing:border-box !important;
        width:100% !important;
        height:100% !important;
        min-width:0 !important;
        min-height:0 !important;
        max-width:none !important;
        max-height:none !important;
        flex:1 1 100% !important;
        flex-basis:100% !important;
        margin:0 !important;
        overflow:hidden !important;
      }
      html.zmc-active body.zmc-native-fullscreen .zmc-native-fullscreen-video-region [data-testid="video-container"],
      html.zmc-active body.zmc-native-fullscreen .zmc-native-fullscreen-video-region #chat-player {
        box-sizing:border-box !important;
        width:100% !important;
        height:100% !important;
        min-width:0 !important;
        min-height:0 !important;
        max-width:none !important;
        max-height:none !important;
        aspect-ratio:auto !important;
        margin:0 !important;
        overflow:hidden !important;
      }
      html.zmc-active body.zmc-native-fullscreen .zmc-native-fullscreen-video-region video {
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        object-fit:contain !important;
        object-position:center center !important;
        transform:none !important;
      }
      html.zmc-video-fullscreen,
      html.zmc-video-fullscreen body {
        overflow:hidden !important;
        overscroll-behavior:none !important;
      }
      html.zmc-video-fullscreen #zmc-root,
      html.zmc-video-fullscreen .roomgrid-dock { display:none !important; }
      .zmc-video-only-host {
        position:relative !important;
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        padding:0 !important;
        overflow:hidden !important;
        background:#000 !important;
        touch-action:none !important;
        user-select:none !important;
        -webkit-user-select:none !important;
        overscroll-behavior:none !important;
      }
      .zmc-video-only-host.zmc-video-only-fallback {
        position:fixed !important;
        inset:0 !important;
        z-index:2147483646 !important;
        width:100vw !important;
        height:100dvh !important;
      }
      .zmc-video-only-host:fullscreen,
      .zmc-video-only-host:-webkit-full-screen {
        width:100vw !important;
        height:100dvh !important;
      }
      .zmc-video-only-host > :not(.zmc-video-keep):not(.zmc-video-only-controls) {
        display:none !important;
      }
      .zmc-video-only-host .zmc-video-keep {
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        padding:0 !important;
        overflow:hidden !important;
      }
      html.zmc-video-fullscreen body.zmc-room .zmc-video-only-host video.zmc-video-only-video {
        position:absolute !important;
        inset:0 !important;
        display:block !important;
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        object-fit:var(--zmc-fullscreen-object-fit,cover) !important;
        object-position:var(--zmc-fullscreen-object-x,50%) var(--zmc-fullscreen-object-y,50%) !important;
        transform:translate3d(var(--zmc-fullscreen-pan-x,0px),var(--zmc-fullscreen-pan-y,0px),0) scale(var(--zmc-fullscreen-zoom,1)) !important;
        transform-origin:center center !important;
        transition:none !important;
        will-change:transform;
        touch-action:none !important;
      }
      .zmc-video-only-controls {
        position:absolute;
        z-index:2147483647;
        left:max(10px,env(safe-area-inset-left));
        right:max(10px,env(safe-area-inset-right));
        bottom:max(12px,env(safe-area-inset-bottom));
        display:flex;
        align-items:center;
        justify-content:center;
        flex-wrap:wrap;
        gap:5px;
        padding:6px;
        border:1px solid rgba(255,255,255,.18);
        border-radius:16px;
        background:rgba(15,23,42,.82);
        color:#fff;
        box-shadow:0 14px 42px rgba(0,0,0,.42);
        backdrop-filter:blur(14px);
        -webkit-backdrop-filter:blur(14px);
        opacity:0;
        transform:translateY(12px);
        pointer-events:none;
        transition:opacity .18s ease,transform .18s ease;
        font:750 13px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        touch-action:manipulation;
      }
      .zmc-video-only-controls.is-visible {
        opacity:1;
        transform:translateY(0);
        pointer-events:auto;
      }
      .zmc-video-only-controls button {
        min-width:40px;
        min-height:44px;
        padding:7px 8px;
        border:1px solid rgba(255,255,255,.16);
        border-radius:11px;
        background:#243247;
        color:#fff;
        font:inherit;
        cursor:pointer;
        touch-action:manipulation;
      }
      .zmc-video-only-controls button.is-active { background:#2563eb; border-color:#93c5fd; }
      .zmc-video-only-controls .zmc-fullscreen-status {
        min-width:60px;
        color:#e2e8f0;
        text-align:center;
        font-variant-numeric:tabular-nums;
      }
      .zmc-video-only-controls .zmc-fullscreen-exit { background:#b91c1c; border-color:#fca5a5; }
      #zmc-root {
        display:none;
        position:fixed;
        inset:0;
        z-index:2147483300;
        pointer-events:none;
        color:var(--zmc-text);
        font:600 14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      html.zmc-active #zmc-root { display:block; }
      html.zmc-active[data-ziggy-suite-dock-open="1"] #zmc-root { display:none !important; }
      html[data-ziggy-suite-available="1"] #zmc-root .zmc-launcher { display:none !important; }
      #zmc-root, #zmc-root * { box-sizing:border-box; }
      #zmc-root button, #zmc-root input, #zmc-root select { font:inherit; }
      .zmc-launcher {
        position:fixed;
        right:max(10px,env(safe-area-inset-right));
        bottom:calc(70px + env(safe-area-inset-bottom));
        min-width:50px;
        height:50px;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        padding:0 13px;
        border:1px solid rgba(255,255,255,.18);
        border-radius:999px;
        background:linear-gradient(135deg,var(--zmc-accent),var(--zmc-accent-strong));
        color:#fff;
        box-shadow:0 12px 36px rgba(0,0,0,.34);
        cursor:pointer;
        pointer-events:auto;
        touch-action:manipulation;
        transition:opacity .18s ease,transform .18s ease,min-width .18s ease;
      }
      body.zmc-side-left .zmc-launcher {
        right:auto;
        left:max(10px,env(safe-area-inset-left));
      }
      .zmc-launcher-icon { font-size:19px; line-height:1; }
      .zmc-launcher-label { font-weight:850; }
      #zmc-root.is-idle:not(.is-open) .zmc-launcher {
        min-width:48px;
        width:48px;
        padding:0;
        opacity:.62;
        transform:scale(.94);
      }
      #zmc-root.is-idle:not(.is-open) .zmc-launcher-label { display:none; }
      #zmc-root.is-open .zmc-launcher { opacity:0; pointer-events:none; transform:translateY(10px); }
      .zmc-backdrop {
        position:fixed;
        inset:0;
        display:none;
        background:rgba(2,6,23,.58);
        backdrop-filter:blur(3px);
        -webkit-backdrop-filter:blur(3px);
        pointer-events:auto;
      }
      .zmc-sheet {
        position:fixed;
        left:0;
        right:0;
        bottom:0;
        display:none;
        max-height:min(74dvh,680px);
        overflow-y:auto;
        padding:10px 12px max(14px,env(safe-area-inset-bottom));
        border:1px solid var(--zmc-border);
        border-radius:20px 20px 0 0;
        background:linear-gradient(180deg,var(--zmc-surface),var(--zmc-bg));
        box-shadow:var(--zmc-shadow);
        pointer-events:auto;
        overscroll-behavior:contain;
      }
      #zmc-root.is-open .zmc-backdrop,
      #zmc-root.is-open .zmc-sheet { display:block; }
      .zmc-grabber {
        width:42px;
        height:4px;
        margin:1px auto 10px;
        border-radius:999px;
        background:rgba(255,255,255,.26);
      }
      .zmc-sheet-head {
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:12px;
      }
      .zmc-sheet-title { min-width:0; flex:1; }
      .zmc-sheet-title strong { display:block; font-size:17px; }
      .zmc-sheet-title span { display:block; margin-top:2px; color:var(--zmc-muted); font-size:11px; }
      .zmc-icon-button {
        width:44px;
        height:44px;
        border:1px solid var(--zmc-border);
        border-radius:13px;
        background:var(--zmc-surface-2);
        color:#fff;
        cursor:pointer;
        touch-action:manipulation;
      }
      .zmc-actions {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:9px;
      }
      .zmc-action {
        min-height:58px;
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        border:1px solid var(--zmc-border);
        border-radius:14px;
        background:var(--zmc-surface-2);
        color:#fff;
        text-align:left;
        cursor:pointer;
        touch-action:manipulation;
      }
      .zmc-action.primary { background:linear-gradient(135deg,#2563eb,#168da1); }
      .zmc-action.success { background:linear-gradient(135deg,#15803d,#0f766e); }
      .zmc-action:disabled { opacity:.42; cursor:default; }
      .zmc-action-icon { flex:0 0 auto; width:28px; font-size:21px; text-align:center; }
      .zmc-action-copy { min-width:0; }
      .zmc-action-copy strong { display:block; font-size:13px; }
      .zmc-action-copy span { display:block; margin-top:2px; overflow:hidden; color:rgba(255,255,255,.70); font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
      .zmc-settings { display:none; }
      #zmc-root.show-settings .zmc-main { display:none; }
      #zmc-root.show-settings .zmc-settings { display:block; }
      .zmc-setting {
        min-height:54px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:10px 2px;
        border-bottom:1px solid rgba(255,255,255,.09);
      }
      .zmc-setting-copy strong { display:block; }
      .zmc-setting-copy span { display:block; margin-top:2px; color:var(--zmc-muted); font-size:11px; }
      .zmc-setting input[type="checkbox"] { width:22px; height:22px; accent-color:var(--zmc-accent); }
      .zmc-setting select,
      .zmc-setting input[type="number"] {
        min-width:82px;
        min-height:42px;
        padding:6px 8px;
        border:1px solid var(--zmc-border);
        border-radius:10px;
        background:var(--zmc-surface-2);
        color:#fff;
      }
      .zmc-status {
        margin-top:11px;
        padding:9px 10px;
        border:1px solid rgba(255,255,255,.09);
        border-radius:11px;
        color:var(--zmc-muted);
        background:rgba(255,255,255,.045);
        font-size:11px;
      }
      .zmc-toast {
        position:fixed;
        left:50%;
        bottom:calc(82px + env(safe-area-inset-bottom));
        max-width:calc(100vw - 28px);
        padding:10px 14px;
        border-radius:999px;
        background:rgba(2,6,23,.94);
        color:#fff;
        box-shadow:0 10px 34px rgba(0,0,0,.34);
        opacity:0;
        transform:translate(-50%,12px);
        transition:opacity .16s,transform .16s;
        pointer-events:none;
      }
      .zmc-toast.is-visible { opacity:1; transform:translate(-50%,0); }
      body.zmc-site-modal #zmc-root,
      body.zmc-fullscreen #zmc-root { display:none !important; }
      @media (orientation:landscape) and (max-height:650px) {
        .zmc-launcher { bottom:calc(12px + env(safe-area-inset-bottom)); }
        .zmc-sheet { left:auto; width:min(460px,58vw); max-height:100dvh; border-radius:18px 0 0 18px; }
        body.zmc-side-left .zmc-sheet { left:0; right:auto; border-radius:0 18px 18px 0; }
      }
      @media (prefers-reduced-motion:reduce) {
        .zmc-launcher,.zmc-toast { transition:none !important; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = String(text);
    return element;
  }

  function makeAction(icon, title, subtitle, className, handler) {
    const button = makeElement('button', 'zmc-action' + (className ? ' ' + className : ''));
    button.type = 'button';
    const iconNode = makeElement('span', 'zmc-action-icon', icon);
    iconNode.setAttribute('aria-hidden', 'true');
    const copy = makeElement('span', 'zmc-action-copy');
    copy.append(makeElement('strong', '', title), makeElement('span', '', subtitle));
    button.append(iconNode, copy);
    button.addEventListener('click', handler);
    return button;
  }

  function createUi() {
    if (root || !document.body) return;
    root = makeElement('div');
    root.id = ROOT_ID;
    root.dataset.version = VERSION;

    const launcher = makeElement('button', 'zmc-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open mobile tools');
    launcher.append(makeElement('span', 'zmc-launcher-icon', '⋯'), makeElement('span', 'zmc-launcher-label', 'Tools'));
    launcher.addEventListener('click', () => setPanelOpen(true));

    const backdrop = makeElement('button', 'zmc-backdrop');
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Close mobile tools');
    backdrop.addEventListener('click', () => setPanelOpen(false));

    const sheet = makeElement('section', 'zmc-sheet');
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Mobile tools');
    sheet.appendChild(makeElement('div', 'zmc-grabber'));

    const closeButton = makeElement('button', 'zmc-icon-button', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => setPanelOpen(false));
    const title = makeElement('div', 'zmc-sheet-title');
    title.append(makeElement('strong', '', 'Mobile Clean View'), makeElement('span', 'zmc-room-label', 'Chat is hidden'));
    const head = makeElement('div', 'zmc-sheet-head');
    head.append(title, closeButton);

    const main = makeElement('div', 'zmc-main');
    const actions = makeElement('div', 'zmc-actions');
    const fullscreenButton = makeAction('⛶', 'Video-only fullscreen', 'Fill, pinch, zoom, and pan', 'primary', enterVideoOnlyFullscreen);
    fullscreenButton.classList.add('zmc-fullscreen-action');
    const pipButton = makeAction('▣', 'Picture-in-Picture', 'Pop out the current video', '', togglePictureInPicture);
    pipButton.classList.add('zmc-pip-action');
    const workshopButton = makeAction('▦', 'Workshop', 'Open the MultiCam workstation', '', () => requestSuiteAction(SUITE_EVENTS.workshop));
    workshopButton.classList.add('zmc-workshop-action');
    const roomGridButton = makeAction('⊞', 'Rooms', 'Open rooms and Cam ARNA', '', () => requestSuiteAction(SUITE_EVENTS.roomGrid));
    roomGridButton.classList.add('zmc-roomgrid-action');
    const addButton = makeAction('★', 'Add model', 'Save this room to Workshop', 'success', () => requestSuiteAction(SUITE_EVENTS.toggleRoom));
    addButton.classList.add('zmc-add-action');
    const settingsButton = makeAction('⚙', 'Settings', 'Mobile layout and dock options', '', () => {
      settingsOpen = true;
      syncPanelState();
    });
    actions.append(fullscreenButton, pipButton, workshopButton, roomGridButton, addButton, settingsButton);
    main.append(actions, makeElement('div', 'zmc-status', 'Chat stays hidden on mobile room pages.'));

    const settingsPanel = makeElement('div', 'zmc-settings');
    const backButton = makeElement('button', 'zmc-icon-button', '‹');
    backButton.type = 'button';
    backButton.setAttribute('aria-label', 'Back to tools');
    backButton.addEventListener('click', () => {
      settingsOpen = false;
      syncPanelState();
    });
    const settingsTitle = makeElement('div', 'zmc-sheet-title');
    settingsTitle.append(makeElement('strong', '', 'Settings'), makeElement('span', '', 'Native mobile layout only'));
    const settingsHead = makeElement('div', 'zmc-sheet-head');
    settingsHead.append(backButton, settingsTitle);
    const settingsList = makeElement('div', 'zmc-settings-list');
    settingsPanel.append(settingsHead, settingsList);

    sheet.append(head, main, settingsPanel);
    root.append(launcher, backdrop, sheet, makeElement('div', 'zmc-toast'));
    document.body.appendChild(root);
    renderSettings();
  }

  function settingRow(title, subtitle, control) {
    const row = makeElement('label', 'zmc-setting');
    const copy = makeElement('span', 'zmc-setting-copy');
    copy.append(makeElement('strong', '', title), makeElement('span', '', subtitle));
    row.append(copy, control);
    return row;
  }

  function checkboxControl(checked, onChange) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.addEventListener('change', () => onChange(input.checked));
    return input;
  }

  function selectControl(options, value, onChange) {
    const select = document.createElement('select');
    for (const [optionValue, label] of options) {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = label;
      select.appendChild(option);
    }
    select.value = String(value);
    select.addEventListener('change', () => onChange(select.value));
    return select;
  }

  function renderSettings() {
    const list = root?.querySelector('.zmc-settings-list');
    if (!list) return;
    list.replaceChildren(
      settingRow('Compact room grid', 'Two columns in portrait by default', checkboxControl(settings.compactBrowse, value => saveSettings({ compactBrowse: value }))),
      settingRow('Hide promotional sections', 'Keep browsing focused on room cards', checkboxControl(settings.hidePromos, value => saveSettings({ hidePromos: value }))),
      settingRow('Portrait columns', 'Models shown across the screen', selectControl([['1', '1'], ['2', '2'], ['3', '3']], settings.portraitColumns, value => saveSettings({ portraitColumns: value }))),
      settingRow('Landscape columns', 'Models shown across the screen', selectControl([['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']], settings.landscapeColumns, value => saveSettings({ landscapeColumns: value }))),
      settingRow('Portrait fullscreen', 'How video first fills a tall screen', selectControl([['fill', 'Fill'], ['fit', 'Fit']], settings.portraitFullscreenMode, value => saveSettings({ portraitFullscreenMode: value }))),
      settingRow('Landscape fullscreen', 'How video first fills a wide screen', selectControl([['fit', 'Fit'], ['fill', 'Fill']], settings.landscapeFullscreenMode, value => saveSettings({ landscapeFullscreenMode: value }))),
      settingRow('Dock auto-hide', 'Seconds before the dock becomes compact', selectControl([['0', 'Off'], ['3', '3 s'], ['5', '5 s'], ['8', '8 s'], ['12', '12 s']], settings.autoHideSeconds, value => saveSettings({ autoHideSeconds: value }))),
      settingRow('Dock side', 'Choose the easiest thumb position', selectControl([['right', 'Right'], ['left', 'Left']], settings.side, value => saveSettings({ side: value })))
    );
  }

  function setPanelOpen(open) {
    panelOpen = !!open;
    if (!panelOpen) settingsOpen = false;
    syncPanelState();
    resetIdleTimer();
  }

  function syncPanelState() {
    if (!root) return;
    root.classList.toggle('is-open', panelOpen);
    root.classList.toggle('show-settings', panelOpen && settingsOpen);
    const sheet = root.querySelector('.zmc-sheet');
    if (sheet) sheet.setAttribute('aria-hidden', panelOpen ? 'false' : 'true');
  }

  function showToast(message) {
    const toast = root?.querySelector('.zmc-toast');
    if (!toast) return;
    toast.textContent = String(message || '');
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 1900);
  }

  function hideNode(node) {
    if (!(node instanceof Element) || node.closest('#zmc-root')) return;
    if (!hiddenState.has(node)) {
      hiddenState.set(node, {
        ariaHidden: node.getAttribute('aria-hidden'),
        inert: 'inert' in node ? !!node.inert : null,
      });
    }
    hiddenNodes.add(node);
    node.classList.add('zmc-chat-hidden');
    node.setAttribute('aria-hidden', 'true');
    if ('inert' in node) node.inert = true;
  }

  function restoreNode(node) {
    if (!(node instanceof Element)) return;
    const previous = hiddenState.get(node);
    node.classList.remove('zmc-chat-hidden');
    if (previous) {
      if (previous.ariaHidden == null) node.removeAttribute('aria-hidden');
      else node.setAttribute('aria-hidden', previous.ariaHidden);
      if (previous.inert != null && 'inert' in node) node.inert = previous.inert;
    } else {
      node.removeAttribute('aria-hidden');
      if ('inert' in node) node.inert = false;
    }
    hiddenNodes.delete(node);
  }

  function restoreAllHiddenNodes() {
    for (const node of [...hiddenNodes]) restoreNode(node);
  }

  function exactChatTabs() {
    const found = new Set();
    for (const selector of CHAT_TAB_SELECTORS) {
      try { document.querySelectorAll(selector).forEach(node => found.add(node)); } catch (_) {}
    }
    document.querySelectorAll('button,a,li,[role="tab"]').forEach(node => {
      if (node.closest('#zmc-root')) return;
      const text = String(node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === 'chat') found.add(node);
    });
    return [...found];
  }

  function switchAwayFromChat(chatTabs) {
    const room = currentRoomName();
    if (!room || lastRoomRedirect === room) return;
    const activeChat = chatTabs.find(tab =>
      tab.getAttribute('aria-selected') === 'true'
      || tab.classList.contains('active')
      || tab.classList.contains('activeTab')
      || tab.classList.contains('selected')
    );
    if (!activeChat) return;
    const scope = activeChat.parentElement || document;
    const replacement = [...scope.querySelectorAll('button,a,li,[role="tab"]')].find(node => {
      const text = String(node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return text === 'bio' || text === 'watch';
    });
    if (replacement) {
      lastRoomRedirect = room;
      try { replacement.click(); } catch (_) {}
    }
  }

  function hideChat() {
    const chatTabs = exactChatTabs();
    switchAwayFromChat(chatTabs);
    for (const tab of chatTabs) {
      const controlledId = String(tab.getAttribute('aria-controls') || '').trim();
      if (controlledId) hideNode(document.getElementById(controlledId));
      const href = String(tab.getAttribute('href') || '').trim();
      if (/^#[A-Za-z][\w:.-]*$/.test(href)) hideNode(document.getElementById(href.slice(1)));
      if (tab.id) {
        try { document.querySelectorAll(`[role="tabpanel"][aria-labelledby="${CSS.escape(tab.id)}"]`).forEach(hideNode); } catch (_) {}
      }
    }
    chatTabs.forEach(hideNode);
    for (const selector of CHAT_TARGET_SELECTORS) {
      try { document.querySelectorAll(selector).forEach(hideNode); } catch (_) {}
    }
    for (const selector of ORIGINAL_MOBILE_HIDE_CHAT_SELECTORS) {
      try { document.querySelectorAll(selector).forEach(hideNode); } catch (_) {}
    }
  }

  function clearNativeFullscreenMarks() {
    document.querySelectorAll([
      '.zmc-native-fullscreen-root',
      '.zmc-native-layout-reset',
      '.zmc-native-fullscreen-video-region',
      '.zmc-native-chat-hidden',
      '.zmc-native-splitter-hidden',
    ].join(',')).forEach(node => node.classList.remove(
      'zmc-native-fullscreen-root',
      'zmc-native-layout-reset',
      'zmc-native-fullscreen-video-region',
      'zmc-native-chat-hidden',
      'zmc-native-splitter-hidden'
    ));
  }

  function elementMarker(node) {
    if (!(node instanceof Element)) return '';
    return [
      node.id,
      node.className,
      node.getAttribute('data-testid'),
      node.getAttribute('role'),
      node.getAttribute('aria-label'),
      node.getAttribute('aria-orientation'),
    ].map(value => typeof value === 'string' ? value : '').join(' ').toLowerCase();
  }

  function visibleElementRect(node) {
    if (!(node instanceof Element)) return null;
    const rect = node.getBoundingClientRect?.();
    if (!rect || rect.width < 1 || rect.height < 1) return null;
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return null;
    return rect;
  }

  function expandNativeChatPanel(node, rootNode, video) {
    if (!(node instanceof Element) || node.contains(video) || node.closest('#zmc-root')) return null;
    let panel = node;
    const viewportArea = Math.max(1, innerWidth * innerHeight);
    for (let depth = 0; depth < 4; depth += 1) {
      const parent = panel.parentElement;
      if (!parent || parent === rootNode || parent === document.body || parent.contains(video)) break;
      const rect = visibleElementRect(parent);
      if (!rect || rect.width * rect.height > viewportArea * 0.72) break;
      const marker = elementMarker(parent);
      const ownsChatUi = /chat|message|conversation/.test(marker)
        || !!parent.querySelector('[role="log"],input[placeholder*="message" i],textarea[placeholder*="message" i]');
      if (!ownsChatUi) break;
      panel = parent;
    }
    return panel;
  }

  function markNativeChatPanels(rootNode, video) {
    const candidates = new Set();
    for (const selector of NATIVE_FULLSCREEN_CHAT_SELECTORS) {
      try { rootNode.querySelectorAll(selector).forEach(node => candidates.add(node)); } catch (_) {}
    }
    for (const node of candidates) {
      if (!(node instanceof Element) || node.matches('button,input,textarea,[role="tab"]')) continue;
      if (node.contains(video) || node.closest('#zmc-root')) continue;
      const rect = visibleElementRect(node);
      if (!rect || rect.width < 110 || rect.height < 110) continue;
      const marker = elementMarker(node);
      const chatLike = /chat|message|conversation|\blog\b/.test(marker)
        || node.getAttribute('role') === 'log'
        || !!node.querySelector('[role="log"],input[placeholder*="message" i],textarea[placeholder*="message" i]');
      if (!chatLike) continue;
      expandNativeChatPanel(node, rootNode, video)?.classList.add('zmc-native-chat-hidden');
    }
  }

  function markNativeSplitters(rootNode, video) {
    const candidates = new Set();
    for (const selector of NATIVE_FULLSCREEN_SPLITTER_SELECTORS) {
      try { rootNode.querySelectorAll(selector).forEach(node => candidates.add(node)); } catch (_) {}
    }
    try {
      rootNode.querySelectorAll('div,button').forEach(node => {
        const cursor = getComputedStyle(node).cursor;
        if (/resize/.test(cursor)) candidates.add(node);
      });
    } catch (_) {}
    for (const node of candidates) {
      if (!(node instanceof Element) || node.contains(video) || node.closest('#zmc-root')) continue;
      const rect = visibleElementRect(node);
      if (!rect) continue;
      const longAndThin = (rect.width >= 120 && rect.height <= 72 && rect.width >= rect.height * 3)
        || (rect.height >= 120 && rect.width <= 72 && rect.height >= rect.width * 3);
      if (!longAndThin) continue;
      const marker = elementMarker(node);
      const cursor = getComputedStyle(node).cursor;
      if (node.getAttribute('role') !== 'separator' && !/resiz|split|separat|drag.?handle/.test(marker) && !/resize/.test(cursor)) continue;
      node.classList.add('zmc-native-splitter-hidden');
    }
  }

  function findNativeFullscreenRoot(videoTarget) {
    const current = fullscreenElement();
    if (current instanceof Element && current.contains(videoTarget)) return current;
    let fallback = null;
    let node = videoTarget;
    while (node instanceof Element && node !== document.body) {
      const rect = visibleElementRect(node);
      if (rect && rect.width >= innerWidth * 0.85 && rect.height >= innerHeight * 0.85) fallback = node;
      if (/full.?screen|theater/.test(elementMarker(node)) && fallback) return node;
      node = node.parentElement;
    }
    return fallback || document.body;
  }

  function syncNativeFullscreenLayout(videoTarget, active) {
    clearNativeFullscreenMarks();
    if (!active || !(videoTarget instanceof Element)) return;
    const video = findPrimaryVideo();
    if (!(video instanceof HTMLVideoElement)) return;
    const rootNode = findNativeFullscreenRoot(videoTarget);
    rootNode.classList.add('zmc-native-fullscreen-root');
    videoTarget.classList.add('zmc-native-fullscreen-video-region');
    let node = videoTarget.parentElement;
    for (let depth = 0; node instanceof Element && depth < 7; depth += 1) {
      if (node === rootNode || node === document.body) break;
      node.classList.add('zmc-native-layout-reset');
      node = node.parentElement;
    }
    markNativeChatPanels(rootNode, video);
    markNativeSplitters(rootNode, video);
  }

  function firstVisible(selectors) {
    const candidates = [];
    for (const selector of selectors) {
      try { candidates.push(...document.querySelectorAll(selector)); } catch (_) {}
    }
    return candidates.find(node => {
      const rect = node.getBoundingClientRect?.();
      return rect && rect.width > 80 && rect.height > 44;
    }) || candidates[0] || null;
  }

  function findVideoTarget() {
    return firstVisible(['[data-testid="video-panel"]', '#VideoPanel', '[data-testid="video-container"]', '#chat-player', 'video']);
  }

  function findPrimaryVideo() {
    const videos = [...document.querySelectorAll('video')].filter(video => {
      const rect = video.getBoundingClientRect?.();
      return rect && rect.width > 80 && rect.height > 44 && !video.ended;
    });
    return videos.sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return (br.width * br.height) - (ar.width * ar.height);
    })[0] || document.querySelector('video');
  }

  function videoSupportsPiP(video) {
    if (!video || video.disablePictureInPicture) return false;
    const standard = typeof video.requestPictureInPicture === 'function' && typeof document.exitPictureInPicture === 'function';
    const webkit = typeof video.webkitSetPresentationMode === 'function'
      && (typeof video.webkitSupportsPresentationMode !== 'function' || video.webkitSupportsPresentationMode('picture-in-picture'));
    return standard || webkit;
  }

  function pictureInPictureActive(video = boundVideo) {
    try {
      return !!video && (document.pictureInPictureElement === video || video.webkitPresentationMode === 'picture-in-picture');
    } catch (_) {
      return false;
    }
  }

  async function togglePictureInPicture() {
    const video = findPrimaryVideo();
    if (!videoSupportsPiP(video)) {
      showToast('Picture-in-Picture is not available for this video');
      return;
    }
    try {
      if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
      else if (video.webkitPresentationMode === 'picture-in-picture') video.webkitSetPresentationMode('inline');
      else if (typeof video.requestPictureInPicture === 'function') await video.requestPictureInPicture();
      else video.webkitSetPresentationMode('picture-in-picture');
      updateShellState();
      setPanelOpen(false);
    } catch (_) {
      showToast('Tap play once, then try Picture-in-Picture again');
    }
  }

  function findFullscreenHost(video) {
    if (!(video instanceof HTMLVideoElement)) return null;
    const host = video.closest('[data-testid="video-container"],#chat-player,.video-container,[data-testid="video-panel"],#VideoPanel');
    if (host && host !== video) return host;
    return video.parentElement instanceof Element ? video.parentElement : null;
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function orientationFullscreenMode() {
    return innerWidth > innerHeight ? settings.landscapeFullscreenMode : settings.portraitFullscreenMode;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  }

  function fullscreenBounds(session = fullscreenSession) {
    if (!session?.host || !session.video) return { cropMaxX: 0, cropMaxY: 0, zoomMaxX: 0, zoomMaxY: 0 };
    const rect = session.host.getBoundingClientRect();
    const width = Math.max(1, rect.width || innerWidth || 1);
    const height = Math.max(1, rect.height || innerHeight || 1);
    const intrinsicWidth = Math.max(1, Number(session.video.videoWidth) || Number(session.video.clientWidth) || 16);
    const intrinsicHeight = Math.max(1, Number(session.video.videoHeight) || Number(session.video.clientHeight) || 9);
    const baseScale = session.mode === 'fill'
      ? Math.max(width / intrinsicWidth, height / intrinsicHeight)
      : Math.min(width / intrinsicWidth, height / intrinsicHeight);
    const baseWidth = intrinsicWidth * baseScale;
    const baseHeight = intrinsicHeight * baseScale;
    const fillMode = session.mode === 'fill';
    return {
      cropMaxX: fillMode ? Math.max(0, (baseWidth - width) / 2) : 0,
      cropMaxY: fillMode ? Math.max(0, (baseHeight - height) / 2) : 0,
      zoomMaxX: fillMode
        ? Math.max(0, width * (session.zoom - 1) / 2)
        : Math.max(0, (baseWidth * session.zoom - width) / 2),
      zoomMaxY: fillMode
        ? Math.max(0, height * (session.zoom - 1) / 2)
        : Math.max(0, (baseHeight * session.zoom - height) / 2),
    };
  }

  function objectPositionPercent(pan, maximum) {
    if (maximum <= 0.01) return 50;
    return clampNumber(50 - (pan / maximum) * 50, 0, 100);
  }

  function updateFullscreenTransform() {
    const session = fullscreenSession;
    if (!session?.host || !session.video) return;
    session.zoom = clampNumber(session.zoom, 1, 3);
    const bounds = fullscreenBounds(session);
    session.cropPanX = clampNumber(session.cropPanX, -bounds.cropMaxX, bounds.cropMaxX);
    session.cropPanY = clampNumber(session.cropPanY, -bounds.cropMaxY, bounds.cropMaxY);
    session.panX = clampNumber(session.panX, -bounds.zoomMaxX, bounds.zoomMaxX);
    session.panY = clampNumber(session.panY, -bounds.zoomMaxY, bounds.zoomMaxY);
    session.host.style.setProperty('--zmc-fullscreen-object-fit', session.mode === 'fill' ? 'cover' : 'contain');
    session.host.style.setProperty('--zmc-fullscreen-object-x', objectPositionPercent(session.cropPanX, bounds.cropMaxX).toFixed(3) + '%');
    session.host.style.setProperty('--zmc-fullscreen-object-y', objectPositionPercent(session.cropPanY, bounds.cropMaxY).toFixed(3) + '%');
    session.host.style.setProperty('--zmc-fullscreen-zoom', String(session.zoom));
    session.host.style.setProperty('--zmc-fullscreen-pan-x', session.panX.toFixed(2) + 'px');
    session.host.style.setProperty('--zmc-fullscreen-pan-y', session.panY.toFixed(2) + 'px');
    if (session.controls) {
      session.controls.dataset.mode = session.mode;
      session.controls.dataset.zoom = session.zoom.toFixed(3);
      session.controls.dataset.panX = (session.cropPanX + session.panX).toFixed(2);
      session.controls.dataset.panY = (session.cropPanY + session.panY).toFixed(2);
      session.controls.dataset.cropPanX = session.cropPanX.toFixed(2);
      session.controls.dataset.cropPanY = session.cropPanY.toFixed(2);
      session.controls.dataset.zoomPanX = session.panX.toFixed(2);
      session.controls.dataset.zoomPanY = session.panY.toFixed(2);
      session.controls.querySelector('.zmc-fullscreen-status').textContent = (session.mode === 'fill' ? 'Fill ' : 'Fit ') + session.zoom.toFixed(1) + '×';
      session.controls.querySelector('[data-mode="fit"]')?.classList.toggle('is-active', session.mode === 'fit');
      session.controls.querySelector('[data-mode="fill"]')?.classList.toggle('is-active', session.mode === 'fill');
    }
  }

  function setFullscreenMode(mode, resetView = true) {
    const session = fullscreenSession;
    if (!session) return;
    session.mode = mode === 'fit' ? 'fit' : 'fill';
    if (resetView) {
      session.zoom = 1;
      session.panX = 0;
      session.panY = 0;
      session.cropPanX = 0;
      session.cropPanY = 0;
    }
    updateFullscreenTransform();
    showFullscreenControls();
  }

  function setFullscreenZoom(nextZoom, focalX = 0, focalY = 0) {
    const session = fullscreenSession;
    if (!session) return;
    const previousZoom = session.zoom;
    const zoom = clampNumber(nextZoom, 1, 3);
    if (Math.abs(zoom - previousZoom) < 0.001) return;
    const ratio = zoom / previousZoom;
    session.panX = focalX - (focalX - session.panX) * ratio;
    session.panY = focalY - (focalY - session.panY) * ratio;
    session.zoom = zoom;
    updateFullscreenTransform();
    showFullscreenControls();
  }

  function resetFullscreenView(useOrientationDefault = true) {
    const session = fullscreenSession;
    if (!session) return;
    if (useOrientationDefault) session.mode = orientationFullscreenMode();
    session.zoom = 1;
    session.panX = 0;
    session.panY = 0;
    session.cropPanX = 0;
    session.cropPanY = 0;
    updateFullscreenTransform();
    showFullscreenControls();
  }

  function hideFullscreenControls() {
    fullscreenSession?.controls?.classList.remove('is-visible');
  }

  function showFullscreenControls() {
    const session = fullscreenSession;
    if (!session?.controls) return;
    clearTimeout(session.controlsTimer);
    session.controls.classList.add('is-visible');
    session.controlsTimer = setTimeout(hideFullscreenControls, 3000);
  }

  function makeFullscreenControl(label, action, options = {}) {
    const button = makeElement('button', options.className || '', label);
    button.type = 'button';
    if (options.mode) button.dataset.mode = options.mode;
    if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      action();
    });
    return button;
  }

  function createFullscreenControls() {
    const controls = makeElement('div', 'zmc-video-only-controls is-visible');
    controls.setAttribute('role', 'toolbar');
    controls.setAttribute('aria-label', 'Video-only fullscreen controls');
    const status = makeElement('span', 'zmc-fullscreen-status', 'Fill 1.0×');
    controls.append(
      makeFullscreenControl('Fit', () => setFullscreenMode('fit'), { mode: 'fit' }),
      makeFullscreenControl('Fill', () => setFullscreenMode('fill'), { mode: 'fill' }),
      makeFullscreenControl('−', () => setFullscreenZoom((fullscreenSession?.zoom || 1) - 0.25), { ariaLabel: 'Zoom out' }),
      status,
      makeFullscreenControl('+', () => setFullscreenZoom((fullscreenSession?.zoom || 1) + 0.25), { ariaLabel: 'Zoom in' }),
      makeFullscreenControl('Reset', () => resetFullscreenView(true)),
      makeFullscreenControl('Exit', exitVideoOnlyFullscreen, { className: 'zmc-fullscreen-exit' })
    );
    for (const eventName of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'dblclick']) {
      controls.addEventListener(eventName, event => event.stopPropagation());
    }
    return controls;
  }

  function markFullscreenVideo(session, video) {
    if (!session?.host || !(video instanceof HTMLVideoElement)) return false;
    session.host.querySelectorAll('.zmc-video-keep').forEach(node => node.classList.remove('zmc-video-keep'));
    session.host.querySelectorAll('.zmc-video-only-video').forEach(node => node.classList.remove('zmc-video-only-video'));
    let node = video;
    while (node && node !== session.host) {
      node.classList.add('zmc-video-keep');
      node = node.parentElement;
    }
    if (node !== session.host) return false;
    video.classList.add('zmc-video-only-video');
    session.video = video;
    updateFullscreenTransform();
    return true;
  }

  function localFullscreenPoint(session, point) {
    const rect = session.host.getBoundingClientRect();
    return { x: point.x - rect.left - rect.width / 2, y: point.y - rect.top - rect.height / 2 };
  }

  function beginPinch(session) {
    const points = [...session.pointers.values()];
    if (points.length < 2) return;
    const first = points[0];
    const second = points[1];
    const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    const local = localFullscreenPoint(session, midpoint);
    session.gesture = {
      kind: 'pinch',
      distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
      zoom: session.zoom,
      panX: session.panX,
      panY: session.panY,
      cropPanX: session.cropPanX,
      cropPanY: session.cropPanY,
      focalX: local.x,
      focalY: local.y,
      moved: true,
    };
  }

  function handleFullscreenPointerDown(event) {
    const session = fullscreenSession;
    if (!session || event.target.closest?.('.zmc-video-only-controls')) return;
    event.preventDefault();
    showFullscreenControls();
    try { session.host.setPointerCapture(event.pointerId); } catch (_) {}
    session.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (session.pointers.size === 1) {
      session.gesture = {
        kind: 'pan',
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        panX: session.panX,
        panY: session.panY,
        cropPanX: session.cropPanX,
        cropPanY: session.cropPanY,
        moved: false,
      };
    } else if (session.pointers.size === 2) {
      beginPinch(session);
    }
  }

  function handleFullscreenPointerMove(event) {
    const session = fullscreenSession;
    if (!session || !session.pointers.has(event.pointerId)) return;
    event.preventDefault();
    session.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (session.pointers.size >= 2) {
      if (session.gesture?.kind !== 'pinch') beginPinch(session);
      const points = [...session.pointers.values()];
      const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
      const ratio = distance / Math.max(1, session.gesture.distance);
      const zoom = clampNumber(session.gesture.zoom * ratio, 1, 3);
      const zoomRatio = zoom / session.gesture.zoom;
      session.zoom = zoom;
      session.panX = session.gesture.focalX - (session.gesture.focalX - session.gesture.panX) * zoomRatio;
      session.panY = session.gesture.focalY - (session.gesture.focalY - session.gesture.panY) * zoomRatio;
      updateFullscreenTransform();
      return;
    }
    const gesture = session.gesture;
    if (gesture?.kind === 'pan' && gesture.pointerId === event.pointerId) {
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      if (Math.hypot(dx, dy) > 7) gesture.moved = true;
      if (session.mode === 'fill' && session.zoom <= 1.001) {
        session.cropPanX = gesture.cropPanX + dx;
        session.cropPanY = gesture.cropPanY + dy;
        session.panX = gesture.panX;
        session.panY = gesture.panY;
      } else {
        session.panX = gesture.panX + dx;
        session.panY = gesture.panY + dy;
        session.cropPanX = gesture.cropPanX;
        session.cropPanY = gesture.cropPanY;
      }
      updateFullscreenTransform();
    }
  }

  function handleFullscreenPointerEnd(event) {
    const session = fullscreenSession;
    if (!session || !session.pointers.has(event.pointerId)) return;
    event.preventDefault();
    const wasSingleTap = session.pointers.size === 1
      && session.gesture?.kind === 'pan'
      && session.gesture.pointerId === event.pointerId
      && !session.gesture.moved;
    session.pointers.delete(event.pointerId);
    try { session.host.releasePointerCapture(event.pointerId); } catch (_) {}
    if (wasSingleTap) {
      const now = performance.now();
      const last = session.lastTap;
      if (last && now - last.time < 330 && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 45) {
        session.lastTap = null;
        setFullscreenMode(session.mode === 'fill' ? 'fit' : 'fill');
      } else {
        session.lastTap = { time: now, x: event.clientX, y: event.clientY };
      }
    }
    if (session.pointers.size === 1) {
      const [pointerId, point] = session.pointers.entries().next().value;
      session.gesture = {
        kind: 'pan', pointerId, startX: point.x, startY: point.y,
        panX: session.panX, panY: session.panY,
        cropPanX: session.cropPanX, cropPanY: session.cropPanY,
        moved: true,
      };
    } else if (!session.pointers.size) {
      session.gesture = null;
    }
    showFullscreenControls();
  }

  function bindFullscreenGestures(session) {
    session.host.addEventListener('pointerdown', handleFullscreenPointerDown, { passive: false });
    session.host.addEventListener('pointermove', handleFullscreenPointerMove, { passive: false });
    session.host.addEventListener('pointerup', handleFullscreenPointerEnd, { passive: false });
    session.host.addEventListener('pointercancel', handleFullscreenPointerEnd, { passive: false });
  }

  function unbindFullscreenGestures(session) {
    session.host?.removeEventListener('pointerdown', handleFullscreenPointerDown);
    session.host?.removeEventListener('pointermove', handleFullscreenPointerMove);
    session.host?.removeEventListener('pointerup', handleFullscreenPointerEnd);
    session.host?.removeEventListener('pointercancel', handleFullscreenPointerEnd);
  }

  function cleanupVideoOnlyFullscreen(session = fullscreenSession) {
    if (!session || session !== fullscreenSession) return;
    clearTimeout(session.controlsTimer);
    unbindFullscreenGestures(session);
    session.controls?.remove();
    session.host?.querySelectorAll('.zmc-video-keep').forEach(node => node.classList.remove('zmc-video-keep'));
    session.host?.querySelectorAll('.zmc-video-only-video').forEach(node => node.classList.remove('zmc-video-only-video'));
    session.host?.classList.remove('zmc-video-only-host', 'zmc-video-only-fallback');
    for (const property of [
      '--zmc-fullscreen-object-fit', '--zmc-fullscreen-object-x', '--zmc-fullscreen-object-y',
      '--zmc-fullscreen-zoom', '--zmc-fullscreen-pan-x', '--zmc-fullscreen-pan-y',
    ]) {
      session.host?.style.removeProperty(property);
    }
    document.documentElement.classList.remove('zmc-video-fullscreen');
    document.body?.classList.remove('zmc-fullscreen');
    fullscreenSession = null;
    try { scrollTo({ top: session.scrollY, left: session.scrollX, behavior: 'instant' }); } catch (_) {}
    scheduleSync();
  }

  async function exitVideoOnlyFullscreen() {
    const session = fullscreenSession;
    if (!session || session.exiting) return;
    session.exiting = true;
    const current = fullscreenElement();
    try {
      if (current && (current === session.host || session.host.contains(current))) {
        if (typeof document.exitFullscreen === 'function') await document.exitFullscreen();
        else if (typeof document.webkitExitFullscreen === 'function') await document.webkitExitFullscreen();
      }
    } catch (_) {}
    cleanupVideoOnlyFullscreen(session);
  }

  async function enterVideoOnlyFullscreen() {
    if (fullscreenSession) {
      showFullscreenControls();
      setPanelOpen(false);
      return;
    }
    const video = findPrimaryVideo();
    const host = findFullscreenHost(video);
    if (!video || !host) {
      showToast('The room video is not ready yet');
      return;
    }
    try {
      if (pictureInPictureActive(video)) {
        if (document.pictureInPictureElement === video && typeof document.exitPictureInPicture === 'function') await document.exitPictureInPicture();
        else if (video.webkitPresentationMode === 'picture-in-picture') video.webkitSetPresentationMode('inline');
      }
    } catch (_) {}
    const controls = createFullscreenControls();
    const session = {
      host,
      video,
      controls,
      mode: orientationFullscreenMode(),
      zoom: 1,
      panX: 0,
      panY: 0,
      cropPanX: 0,
      cropPanY: 0,
      pointers: new Map(),
      gesture: null,
      lastTap: null,
      controlsTimer: 0,
      landscape: innerWidth > innerHeight,
      fallback: false,
      entering: true,
      exiting: false,
      scrollX: scrollX,
      scrollY: scrollY,
    };
    fullscreenSession = session;
    host.classList.add('zmc-video-only-host');
    host.appendChild(controls);
    bindFullscreenGestures(session);
    markFullscreenVideo(session, video);
    document.documentElement.classList.add('zmc-video-fullscreen');
    document.body?.classList.add('zmc-fullscreen');
    setPanelOpen(false);
    showFullscreenControls();

    let requested = false;
    try {
      if (typeof host.requestFullscreen === 'function') {
        requested = true;
        try {
          await host.requestFullscreen({ navigationUI: 'hide' });
        } catch (_) {
          await host.requestFullscreen();
        }
      } else if (typeof host.webkitRequestFullscreen === 'function') {
        requested = true;
        await host.webkitRequestFullscreen();
      }
    } catch (_) {
      requested = false;
    }
    if (fullscreenSession !== session) return;
    session.entering = false;
    const current = fullscreenElement();
    if (!requested || !(current === host || host.contains(current))) {
      session.fallback = true;
      host.classList.add('zmc-video-only-fallback');
    }
    updateFullscreenTransform();
  }

  function handleVideoOnlyFullscreenChange() {
    const session = fullscreenSession;
    if (!session || session.entering || session.fallback || session.exiting) return;
    const current = fullscreenElement();
    if (!(current === session.host || session.host.contains(current))) cleanupVideoOnlyFullscreen(session);
  }

  function syncVideoOnlyFullscreen() {
    const session = fullscreenSession;
    if (!session) return;
    if (!session.host.isConnected || !isRoomPage()) {
      exitVideoOnlyFullscreen();
      return;
    }
    const video = findPrimaryVideo();
    if (video && video !== session.video) {
      if (!session.host.contains(video) || !markFullscreenVideo(session, video)) {
        exitVideoOnlyFullscreen();
        return;
      }
    }
    const landscape = innerWidth > innerHeight;
    if (landscape !== session.landscape) {
      session.landscape = landscape;
      resetFullscreenView(true);
    } else {
      updateFullscreenTransform();
    }
  }

  function handleBoundVideoState() {
    if (fullscreenSession && pictureInPictureActive(boundVideo)) exitVideoOnlyFullscreen();
    scheduleSync();
  }

  function bindVideo(video) {
    if (video === boundVideo) return;
    if (boundVideo) {
      for (const event of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'webkitbeginfullscreen', 'webkitendfullscreen']) {
        boundVideo.removeEventListener(event, handleBoundVideoState);
      }
    }
    boundVideo = video || null;
    if (boundVideo) {
      for (const event of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'webkitbeginfullscreen', 'webkitendfullscreen']) {
        boundVideo.addEventListener(event, handleBoundVideoState);
      }
    }
  }

  function pseudoFullscreenActive(videoTarget) {
    if (document.fullscreenElement) return true;
    const video = findPrimaryVideo();
    if (video?.webkitDisplayingFullscreen) return true;
    const classText = String(document.documentElement.className || '') + ' ' + String(document.body?.className || '');
    if (/(?:^|\s)(?:is-)?(?:video-)?fullscreen(?:\s|$)|theater[-_ ]?fullscreen/i.test(classText)) return true;
    if (!videoTarget || innerWidth <= innerHeight) return false;
    const rect = videoTarget.getBoundingClientRect?.();
    return !!rect
      && rect.left <= 4
      && rect.top <= 4
      && rect.right >= innerWidth - 4
      && rect.bottom >= innerHeight - 4;
  }

  function knownSiteModalOpen() {
    const selectors = [
      '[data-testid="tip-modal-container"]',
      '[data-testid*="purchase-modal"]',
      '[data-testid="login-modal"]',
      '[role="dialog"][aria-modal="true"]',
    ];
    for (const selector of selectors) {
      for (const node of document.querySelectorAll(selector)) {
        if (node.closest?.('#zmc-root')) continue;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) return true;
      }
    }
    return false;
  }

  function requestSuiteAction(eventName) {
    if (document.documentElement.dataset.ziggySuiteAvailable !== '1') {
      showToast('Ziggy Chaturbate Suite is not active');
      return;
    }
    setPanelOpen(false);
    document.dispatchEvent(new CustomEvent(eventName));
  }

  function updateShellState() {
    if (!root) return;
    const suiteAvailable = document.documentElement.dataset.ziggySuiteAvailable === '1';
    const room = document.documentElement.dataset.ziggySuiteRoom || currentRoomName();
    const saved = document.documentElement.dataset.ziggySuiteSaved === '1';
    const video = findPrimaryVideo();
    const pipAvailable = videoSupportsPiP(video);
    const pipActive = pictureInPictureActive(video);
    const roomLabel = root.querySelector('.zmc-room-label');
    if (roomLabel) roomLabel.textContent = room ? room + ' · chat hidden' : 'Chat is hidden on room pages';
    const pipButton = root.querySelector('.zmc-pip-action');
    if (pipButton) {
      pipButton.disabled = !pipAvailable;
      pipButton.querySelector('strong').textContent = pipActive ? 'Exit Picture-in-Picture' : 'Picture-in-Picture';
    }
    const fullscreenButton = root.querySelector('.zmc-fullscreen-action');
    if (fullscreenButton) fullscreenButton.disabled = !video || !findFullscreenHost(video);
    for (const selector of ['.zmc-workshop-action', '.zmc-roomgrid-action']) {
      const button = root.querySelector(selector);
      if (button) button.disabled = !suiteAvailable;
    }
    const addButton = root.querySelector('.zmc-add-action');
    if (addButton) {
      addButton.disabled = !suiteAvailable || !room;
      addButton.querySelector('strong').textContent = saved ? 'Remove model' : 'Add model';
      addButton.querySelector('.zmc-action-copy span').textContent = room
        ? (saved ? room + ' is in Workshop' : 'Save ' + room + ' to Workshop')
        : 'Open a model room first';
    }
    const status = root.querySelector('.zmc-status');
    if (status) status.textContent = suiteAvailable
      ? 'Chat is hidden. Workshop and Rooms are connected.'
      : 'Chat is hidden. Install Ziggy Chaturbate Suite to enable Workshop and Rooms.';
  }

  function markVideoTarget(target) {
    document.querySelectorAll('.zmc-video-target').forEach(node => {
      if (node !== target) node.classList.remove('zmc-video-target');
    });
    if (target instanceof Element) target.classList.add('zmc-video-target');
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    root?.classList.remove('is-idle');
    if (!root || panelOpen || settings.autoHideSeconds <= 0) return;
    idleTimer = setTimeout(() => root?.classList.add('is-idle'), settings.autoHideSeconds * 1000);
  }

  function syncEnvironment() {
    if (!document.body) return;
    createUi();
    const supported = isNativeMobileSite() && !isBlockedPage();
    const active = supported && settings.enabled;
    const room = active && isRoomPage();
    const browse = active && isBrowsePage();
    const landscape = innerWidth > innerHeight;
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle('zmc-supported', supported);
    html.classList.toggle('zmc-active', active);
    if (active) html.dataset.ziggyMobileShell = '1';
    else delete html.dataset.ziggyMobileShell;
    body.classList.toggle('zmc-room', room);
    body.classList.toggle('zmc-browse', browse);
    body.classList.toggle('zmc-landscape', active && landscape);
    body.classList.toggle('zmc-portrait', active && !landscape);
    body.classList.toggle('zmc-hide-promos', active && settings.hidePromos);
    body.classList.toggle('zmc-compact-browse', browse && settings.compactBrowse);
    body.classList.toggle('zmc-side-left', active && settings.side === 'left');
    body.classList.toggle('zmc-site-modal', active && knownSiteModalOpen());
    html.style.setProperty('--zmc-grid-cols', String(landscape ? settings.landscapeColumns : settings.portraitColumns));

    if (!active) {
      panelOpen = false;
      settingsOpen = false;
      syncPanelState();
      restoreAllHiddenNodes();
      markVideoTarget(null);
      bindVideo(null);
      body.classList.remove('zmc-fullscreen');
      body.classList.remove('zmc-native-fullscreen');
      clearNativeFullscreenMarks();
      if (fullscreenSession) exitVideoOnlyFullscreen();
      return;
    }

    const videoTarget = room ? findVideoTarget() : null;
    const video = room ? findPrimaryVideo() : null;
    markVideoTarget(videoTarget);
    bindVideo(video);
    if (room) hideChat();
    else restoreAllHiddenNodes();
    if (fullscreenSession) syncVideoOnlyFullscreen();
    const anyFullscreen = room && pseudoFullscreenActive(videoTarget);
    const nativeFullscreen = anyFullscreen && !fullscreenSession;
    body.classList.toggle('zmc-fullscreen', anyFullscreen);
    body.classList.toggle('zmc-native-fullscreen', nativeFullscreen);
    syncNativeFullscreenLayout(videoTarget, nativeFullscreen);
    updateShellState();
    syncPanelState();
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        lastRoomRedirect = '';
        panelOpen = false;
        settingsOpen = false;
      }
      syncEnvironment();
      resetIdleTimer();
    }, 90);
  }

  function hookHistory() {
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      if (typeof original !== 'function' || original.__zmcWrapped) continue;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        scheduleSync();
        return result;
      };
      wrapped.__zmcWrapped = true;
      history[method] = wrapped;
    }
    addEventListener('popstate', scheduleSync);
    addEventListener('hashchange', scheduleSync);
  }

  function start() {
    if (!isMobileDevice() || isBlockedPage()) return;
    injectViewport();
    installStyle();
    const ready = () => {
      if (!document.body) return;
      createUi();
      hookHistory();
      syncEnvironment();
      const observer = new MutationObserver(mutations => {
        if (mutations.some(mutation => !mutation.target?.closest?.('#zmc-root'))) scheduleSync();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      addEventListener('resize', scheduleSync, { passive: true });
      addEventListener('orientationchange', scheduleSync, { passive: true });
      window.visualViewport?.addEventListener('resize', scheduleSync, { passive: true });
      addEventListener('fullscreenchange', () => { handleVideoOnlyFullscreenChange(); scheduleSync(); });
      addEventListener('webkitfullscreenchange', () => { handleVideoOnlyFullscreenChange(); scheduleSync(); });
      addEventListener('pointerdown', resetIdleTimer, { passive: true });
      document.addEventListener(SUITE_EVENTS.state, scheduleSync);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && fullscreenSession) exitVideoOnlyFullscreen();
        else if (event.key === 'Escape' && panelOpen) setPanelOpen(false);
      });
      document.dispatchEvent(new CustomEvent(SUITE_EVENTS.ready));
      resetIdleTimer();
      setInterval(syncEnvironment, 2500);
    };
    if (document.body) ready();
    else document.addEventListener('DOMContentLoaded', ready, { once: true });
  }

  // Mirror these settings into site storage so the Suite can include them in
  // the same encrypted backup. Tampermonkey storage remains the primary copy.
  writeStoredValue(JSON.stringify(settings));
  document.addEventListener('ziggy-mobile-clean-view:import-settings', event => {
    settings = sanitizeSettings(event.detail);
    writeStoredValue(JSON.stringify(settings));
    if (isNativeMobileSite()) {
      syncEnvironment();
      renderSettings();
      resetIdleTimer();
    }
  });
  document.addEventListener(CONTROL_EVENTS.openPanel, event => {
    if (!isNativeMobileSite() || isBlockedPage()) return;
    settingsOpen = event.detail?.view === 'settings';
    setPanelOpen(true);
  });
  document.addEventListener(CONTROL_EVENTS.fullscreen, () => {
    if (isNativeMobileSite() && !isBlockedPage()) enterVideoOnlyFullscreen();
  });
  document.addEventListener(CONTROL_EVENTS.pip, () => {
    if (isNativeMobileSite() && !isBlockedPage()) togglePictureInPicture();
  });

  start();
})();
