// ==UserScript==
// @name               Ziggy Mobile Clean View
// @namespace          ziggy.chaturbate.mobile-comfort
// @version            2.2.0
// @description        A clean Chaturbate mobile layout with chat hidden, video-only fullscreen, Picture-in-Picture, and one shared tools dock.
// @author             Ziggy
// @homepageURL        https://github.com/linuxNoob620/chaturbate-userscripts
// @supportURL         https://github.com/linuxNoob620/chaturbate-userscripts/issues
// @updateURL          https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Chaturbate%20Desktop%20Mobile%20Comfort.meta.js
// @downloadURL        https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Chaturbate%20Desktop%20Mobile%20Comfort.user.js
// @match              https://chaturbate.com/*
// @match              https://*.chaturbate.com/*
// @exclude            https://secure.chaturbate.com/*
// @run-at             document-start
// @grant              GM_getValue
// @grant              GM_setValue
// ==/UserScript==

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
    if (new URLSearchParams(location.search).get('multicam_mode') === '1') return true;
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
    const roomGridButton = makeAction('⊞', 'RoomGrid', 'Open rooms and Cam ARNA', '', () => requestSuiteAction(SUITE_EVENTS.roomGrid));
    roomGridButton.classList.add('zmc-roomgrid-action');
    const addButton = makeAction('★', 'Add model', 'Save this room to RoomGrid', 'success', () => requestSuiteAction(SUITE_EVENTS.toggleRoom));
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
    document.querySelectorAll('button,a,[role="tab"]').forEach(node => {
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
      || tab.classList.contains('selected')
    );
    if (!activeChat) return;
    const scope = activeChat.parentElement || document;
    const replacement = [...scope.querySelectorAll('button,a,[role="tab"]')].find(node => {
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
        ? (saved ? room + ' is in RoomGrid' : 'Save ' + room + ' to RoomGrid')
        : 'Open a model room first';
    }
    const status = root.querySelector('.zmc-status');
    if (status) status.textContent = suiteAvailable
      ? 'Chat is hidden. Workshop and RoomGrid are connected.'
      : 'Chat is hidden. Install Ziggy Chaturbate Suite to enable Workshop and RoomGrid.';
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
    if (!isMobileDevice()) return;
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
