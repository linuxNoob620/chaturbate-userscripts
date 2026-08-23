// ==UserScript==
// @name               Chaturbate Desktop Mobile Comfort
// @namespace          ziggy.chaturbate.mobile-comfort
// @version            1.5.0
// @description        Makes both Chaturbate's desktop-on-phone and native mobile layouts easier to browse and watch in portrait or landscape.
// @author             Ziggy + Codex
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

  const SCRIPT_NAME = 'Desktop Mobile Comfort';
  const VERSION = '1.5.0';
  const STORE_KEY = 'cb_desktop_mobile_comfort_v1';
  const ROOT_ID = 'cmc-root';
  const STYLE_ID = 'cmc-style';
  const ROOM_PATH_EXCLUSIONS = new Set([
    '', 'accounts', 'affiliates', 'apps', 'b', 'billingsupport', 'contest', 'discover',
    'followed-cams', 'fullvideo', 'jobs', 'law_enforcement', 'privacy', 'security',
    'spy-on-cams', 'support', 'tags', 'terms', 'v2apps',
  ]);
  const SAFE_PATH_BLOCK = /^\/(?:accounts|security|auth|apps|api|b|fullvideo|billingsupport|purchase|tipping)(?:\/|$)/i;
  const CHAT_TARGET_SELECTORS = [
    '[data-testid="chat-floating-window"]',
    '#draggableCanvasChatWindow',
    '#ChatTabContainer',
    '[data-testid="mobile-chat"]',
    '[data-testid="chat-tab-content"]',
    '[data-testid="chat-container"]',
    '.mobile-chat-container',
  ];
  const SITE_CHAT_TAB_SELECTOR = [
    '[data-testid="mobile-chat-tab"]',
    '[data-testid="chat-tab"]',
    '[data-room-tab="chat"]',
    '[aria-controls="ChatTabContainer"]',
    'a[href="#chat"]',
  ].join(',');

  const DEFAULTS = Object.freeze({
    enabled: true,
    compactHeader: true,
    bottomNav: true,
    hidePromos: true,
    stickyFilters: true,
    portraitColumns: 2,
    landscapeColumns: 4,
    density: 'comfortable',
    roomTabs: true,
    chatMode: 'bubble',
    chatUnreadBadge: true,
    autoHideControls: true,
    autoHideSeconds: 5,
    handedness: 'right',
    compactRoomInfo: true,
  });

  let settings = loadSettings();
  let root = null;
  let panelOpen = false;
  let activeSettingsTab = 'general';
  let roomTab = 'watch';
  let chatOpen = false;
  let chatUnread = 0;
  let comfortDockOpen = false;
  let observedChatTarget = null;
  let chatMessageObserver = null;
  let chatSwipeStart = null;
  let observedVideoTarget = null;
  let observedRoomVideo = null;
  let pipPositionFrame = 0;
  const hiddenElementState = new WeakMap();
  let activityTimer = 0;
  let syncTimer = 0;
  let lastUrl = location.href;

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
        return;
      }
    } catch (_) {}
    try { localStorage.setItem(STORE_KEY, value); } catch (_) {}
  }

  function loadSettings() {
    let parsed = null;
    try {
      const raw = readStoredValue();
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (_) {}
    return sanitizeSettings(parsed);
  }

  function sanitizeSettings(input) {
    const next = { ...DEFAULTS, ...(input && typeof input === 'object' ? input : {}) };
    next.enabled = next.enabled !== false;
    next.compactHeader = next.compactHeader !== false;
    next.bottomNav = next.bottomNav !== false;
    next.hidePromos = next.hidePromos !== false;
    next.stickyFilters = next.stickyFilters !== false;
    next.portraitColumns = clampInt(next.portraitColumns, 1, 3, 2);
    next.landscapeColumns = clampInt(next.landscapeColumns, 2, 5, 4);
    next.density = ['compact', 'comfortable', 'large'].includes(next.density) ? next.density : 'comfortable';
    next.roomTabs = next.roomTabs !== false;
    next.chatMode = ['bubble', 'hidden', 'original'].includes(next.chatMode) ? next.chatMode : 'bubble';
    next.chatUnreadBadge = next.chatUnreadBadge !== false;
    next.autoHideControls = next.autoHideControls !== false;
    next.autoHideSeconds = clampInt(next.autoHideSeconds, 0, 20, 5);
    next.handedness = next.handedness === 'left' ? 'left' : 'right';
    next.compactRoomInfo = next.compactRoomInfo !== false;
    return next;
  }

  function clampInt(value, min, max, fallback) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function saveSettings(patch) {
    settings = sanitizeSettings({ ...settings, ...patch });
    if (settings.chatMode !== 'bubble') {
      chatOpen = false;
      chatUnread = 0;
    }
    writeStoredValue(JSON.stringify(settings));
    applyEnvironment();
    renderPanel();
    resetActivityTimer();
  }

  function isPhoneLike() {
    const uaMobile = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent || '');
    const coarse = !!window.matchMedia?.('(pointer: coarse)')?.matches;
    const touch = Number(navigator.maxTouchPoints || 0) > 0;
    const viewportShort = Math.min(window.innerWidth || 9999, window.innerHeight || 9999);
    const screenShort = Math.min(Number(window.screen?.width) || 9999, Number(window.screen?.height) || 9999);
    return uaMobile || (coarse && touch && Math.min(viewportShort, screenShort) <= 900) || viewportShort <= 720;
  }

  function isNativeMobileLayout() {
    return /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent || '');
  }

  function isBlockedPage() {
    if (location.hostname === 'secure.chaturbate.com') return true;
    if (SAFE_PATH_BLOCK.test(location.pathname || '')) return true;
    if (new URLSearchParams(location.search).get('multicam_mode') === '1') return true;
    return !!document.body?.classList.contains('age-gate--shown');
  }

  function isRoomPage() {
    const segments = String(location.pathname || '').split('/').filter(Boolean);
    const slug = segments.length === 1 ? segments[0].toLowerCase() : '';
    const hasVideo = !!document.querySelector('[data-testid="video-panel"], #VideoPanel, [data-testid="video-container"], #chat-player, video');
    if (!hasVideo) return false;

    // Real room pages often contain a related-room grid below the profile. That grid must not
    // turn the page back into a browse page or the room chat/layout rules never activate.
    if (segments.length === 1 && !ROOM_PATH_EXCLUSIONS.has(slug)) return true;
    return !!document.querySelector('[data-testid="room-bio-tab-contents"], .roomBio, .BaseRoomContents, #ChatTabContainer, [data-testid="roomSubjectContainer"]');
  }

  function isBrowsePage() {
    return !isRoomPage() && !!document.querySelector('[data-testid="room-list"], .RoomCardGrid');
  }

  function visibleElement(selector) {
    return [...document.querySelectorAll(selector)].find(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    }) || null;
  }

  function siteModalIsOpen() {
    return !!visibleElement('[data-testid="tip-modal-container"], [data-testid*="purchase-modal"], [data-testid="login-modal"]');
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
        --cmc-accent:#ff6b21;
        --cmc-accent-strong:#e9550f;
        --cmc-bg:#111827;
        --cmc-surface:#182233;
        --cmc-surface-2:#243146;
        --cmc-text:#f8fafc;
        --cmc-muted:#aeb9c9;
        --cmc-border:rgba(255,255,255,.14);
        --cmc-shadow:0 18px 50px rgba(0,0,0,.34);
        --cmc-dock-h:50px;
        --cmc-grid-cols:2;
        --cmc-card-gap:8px;
        --cmc-chat-sheet-h:min(60dvh,620px);
        --cmc-chat-panel-w:min(36vw,430px);
      }
      #${ROOT_ID} { display:none; position:relative; z-index:2147483000; font:500 14px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:var(--cmc-text); }
      html.cmc-supported #${ROOT_ID} { display:block; }
      #${ROOT_ID}, #${ROOT_ID} * { box-sizing:border-box; }
      #${ROOT_ID} button, #${ROOT_ID} select, #${ROOT_ID} input { font:inherit; }

      html.cmc-active body { overflow-x:hidden !important; padding-bottom:0 !important; }
      html.cmc-active body > main,
      html.cmc-active body .content,
      html.cmc-active body .main-content-wrapper { width:100% !important; min-width:0 !important; max-width:none !important; margin-left:0 !important; margin-right:0 !important; }
      html.cmc-active body .content { padding:8px !important; }
      html.cmc-active body.cmc-compact-header [data-testid="header-top-row"] {
        position:sticky !important; top:0 !important; z-index:9000 !important; min-height:50px !important;
        padding:5px 8px !important; gap:6px !important; background:var(--cmc-page-bg,#fff) !important;
        box-shadow:0 1px 0 rgba(15,23,42,.12) !important;
      }
      html.cmc-active body.cmc-compact-header [data-testid="header-top-row"] > * { min-width:0 !important; }
      html.cmc-active body.cmc-compact-header [data-testid="header-search"] { flex:1 1 auto !important; min-width:80px !important; }
      html.cmc-active body.cmc-compact-header [data-testid="evolve-broadcast-link"] { display:none !important; }
      html.cmc-active body.cmc-has-comfort-dock [data-testid="header-nav-bar"] { display:none !important; }
      html.cmc-active body.cmc-sticky-filters [data-testid="gender-nav-scrollable-container"] {
        position:sticky !important; top:50px !important; z-index:8990 !important; background:var(--cmc-page-bg,#fff) !important;
        box-shadow:0 1px 0 rgba(15,23,42,.10) !important;
      }
      html.cmc-active body.cmc-sticky-filters [data-testid="filter-button"] { min-height:42px !important; }

      html.cmc-active body.cmc-browse [data-testid="room-list"],
      html.cmc-active body.cmc-browse [data-testid="room-list-container"],
      html.cmc-active body.cmc-browse .DesktopRoomlistRoot { width:100% !important; max-width:none !important; margin:0 !important; padding:0 !important; }
      html.cmc-active body.cmc-browse .RoomCardGrid {
        display:grid !important; grid-template-columns:repeat(var(--cmc-grid-cols),minmax(0,1fr)) !important;
        gap:var(--cmc-card-gap) !important; width:100% !important; padding:8px !important; margin:0 !important;
        overflow:visible !important; list-style:none !important;
      }
      html.cmc-active body.cmc-browse [data-testid="room-card"] { width:auto !important; min-width:0 !important; margin:0 !important; }
      html.cmc-active body.cmc-browse .RoomCardThumbnail,
      html.cmc-active body.cmc-browse [data-testid="room-card-image-anchor"] { display:block !important; width:100% !important; aspect-ratio:4/3 !important; overflow:hidden !important; border-radius:10px 10px 0 0 !important; }
      html.cmc-active body.cmc-browse .RoomCardThumbnail__image,
      html.cmc-active body.cmc-browse [data-testid="room-card-image"] { width:100% !important; height:100% !important; object-fit:cover !important; }
      html.cmc-active body.cmc-browse .RoomCardDetails { min-width:0 !important; padding:7px !important; }
      html.cmc-active body.cmc-browse [data-testid="room-card-username"] { max-width:100% !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; font-weight:750 !important; }
      html.cmc-active body.cmc-browse .RoomCardSubject { display:-webkit-box !important; -webkit-box-orient:vertical !important; -webkit-line-clamp:2 !important; overflow:hidden !important; line-height:1.25 !important; }
      html.cmc-active body.cmc-density-compact .RoomCardSubject,
      html.cmc-active body.cmc-density-compact .sub-info { display:none !important; }
      html.cmc-active body.cmc-density-compact .RoomCardDetails { padding:5px !important; }
      html.cmc-active body.cmc-density-large .RoomCardThumbnail,
      html.cmc-active body.cmc-density-large [data-testid="room-card-image-anchor"] { aspect-ratio:1/1 !important; }
      html.cmc-active body.cmc-browse [data-testid="room-list-pagination-component"] {
        position:relative !important; bottom:auto !important; z-index:1 !important;
        width:max-content !important; max-width:calc(100vw - 16px) !important; margin:10px auto !important; padding:6px !important;
        border:1px solid rgba(15,23,42,.14) !important; border-radius:14px !important; background:rgba(255,255,255,.94) !important;
        box-shadow:0 10px 30px rgba(15,23,42,.18) !important; backdrop-filter:blur(12px) !important;
      }
      html.cmc-active body.cmc-browse [data-testid="room-list-pagination-component"] button { min-width:42px !important; min-height:42px !important; }
      html.cmc-active body.cmc-hide-promos .FollowRecommendedRoomlist,
      html.cmc-active body.cmc-hide-promos .HomepageFallbackRoomlist,
      html.cmc-active body.cmc-hide-promos .DesktopRoomlistRoot__separator,
      html.cmc-active body.cmc-hide-promos [data-testid="promo-banner"],
      html.cmc-active body.cmc-hide-promos .contest_banner,
      html.cmc-active body.cmc-hide-promos .adBanner { display:none !important; }

      html.cmc-active body.cmc-room .cmc-video-target { width:100% !important; max-width:none !important; margin:0 !important; }
      html.cmc-active body.cmc-room .cmc-video-target [data-testid="video-container"],
      html.cmc-active body.cmc-room [data-testid="video-container"] { width:100% !important; max-width:none !important; aspect-ratio:16/9 !important; background:#000 !important; }
      html.cmc-active body.cmc-room .cmc-video-target video { max-height:100% !important; object-fit:contain !important; }
      html.cmc-active body.cmc-room.cmc-info-compact .cmc-info-target { max-height:44vh !important; overflow:auto !important; }
      html.cmc-active body.cmc-desktop-mobile.cmc-room .BaseRoomContents,
      html.cmc-active body.cmc-desktop-mobile.cmc-room #TheaterModeRoomContents,
      html.cmc-active body.cmc-desktop-mobile.cmc-room .topSectionWrapper,
      html.cmc-active body.cmc-desktop-mobile.cmc-room #VideoPanel,
      html.cmc-active body.cmc-desktop-mobile.cmc-room .roomBio {
        width:100% !important; min-width:0 !important; max-width:none !important; margin-left:0 !important; margin-right:0 !important;
      }
      html.cmc-active body.cmc-desktop-mobile.cmc-room .topSectionWrapper { display:block !important; padding:4px !important; }
      html.cmc-active body.cmc-desktop-mobile.cmc-room .playerTitleBar { min-height:44px !important; padding:7px 10px !important; font-size:14px !important; }
      html.cmc-active body.cmc-room [data-testid="gender-nav-scrollable-container"] { display:none !important; }
      html.cmc-active body.cmc-native-mobile.cmc-room.cmc-portrait .cmc-video-target,
      html.cmc-active body.cmc-native-mobile.cmc-room.cmc-portrait .cmc-video-target [data-testid="video-container"] {
        height:auto !important; min-height:0 !important; max-height:none !important; aspect-ratio:16/9 !important;
      }

      html.cmc-active body.cmc-room.cmc-chat-mode-bubble:not(.cmc-chat-open) .cmc-chat-target,
      html.cmc-active body.cmc-room.cmc-chat-mode-hidden .cmc-chat-target {
        display:none !important; visibility:hidden !important; pointer-events:none !important;
      }
      html.cmc-active body.cmc-room.cmc-chat-mode-bubble .cmc-site-chat-tab,
      html.cmc-active body.cmc-room.cmc-chat-mode-hidden .cmc-site-chat-tab { display:none !important; }
      html.cmc-active body.cmc-room.cmc-chat-mode-bubble.cmc-chat-open .cmc-chat-target {
        display:flex !important; flex-direction:column !important; position:fixed !important; z-index:2147482500 !important;
        inset:auto 6px 6px 6px !important;
        width:auto !important; height:var(--cmc-chat-sheet-h) !important; max-width:none !important; max-height:none !important;
        border:1px solid var(--cmc-border) !important; border-radius:18px !important; overflow:hidden !important;
        visibility:visible !important; pointer-events:auto !important; transform:none !important;
        background:var(--cmc-surface) !important; box-shadow:var(--cmc-shadow) !important;
      }
      html.cmc-active body.cmc-room [data-testid="chat-input"] { min-height:44px !important; font-size:16px !important; }
      html.cmc-active body.cmc-room [data-testid="send-button"],
      html.cmc-active body.cmc-room [data-testid="emoji-button"] { min-width:44px !important; min-height:44px !important; }
      html.cmc-active body.cmc-room.cmc-landscape [data-testid="header-top-row"],
      html.cmc-active body.cmc-room.cmc-landscape [data-testid="header-nav-bar"],
      html.cmc-active body.cmc-room.cmc-landscape [data-testid="gender-nav-scrollable-container"] { display:none !important; }
      html.cmc-active body.cmc-room.cmc-landscape:not(.cmc-chat-mode-original) .topSectionWrapper { width:100% !important; margin:0 !important; padding:0 !important; }
      html.cmc-active body.cmc-room.cmc-landscape:not(.cmc-chat-mode-original) .cmc-video-target { width:100% !important; height:100dvh !important; padding-bottom:0 !important; overflow:hidden !important; }
      html.cmc-active body.cmc-room.cmc-landscape:not(.cmc-chat-mode-original) .cmc-video-target [data-testid="video-container"],
      html.cmc-active body.cmc-room.cmc-landscape:not(.cmc-chat-mode-original) [data-testid="video-container"] { height:calc(100dvh - 46px) !important; aspect-ratio:auto !important; }
      html.cmc-active body.cmc-room.cmc-landscape.cmc-chat-mode-bubble.cmc-chat-open .cmc-chat-target {
        inset:0 0 0 auto !important; width:var(--cmc-chat-panel-w) !important; height:100dvh !important;
        max-width:88vw !important; border:0 !important; border-left:1px solid rgba(255,255,255,.16) !important;
        border-radius:0 !important;
      }
      .cmc-comfort-dock {
        display:none; position:fixed; z-index:2147483000; left:max(10px,env(safe-area-inset-left)); bottom:max(10px,env(safe-area-inset-bottom));
        width:min(310px,calc(100vw - 94px)); color:var(--cmc-text); user-select:none; transition:opacity .2s ease,transform .2s ease;
      }
      body.cmc-has-comfort-dock .cmc-comfort-dock { display:block; }
      .cmc-comfort-dock-card { overflow:hidden; border:1px solid var(--cmc-border); border-radius:16px; background:rgba(17,24,39,.92); box-shadow:var(--cmc-shadow); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); }
      .cmc-comfort-dock-head { width:100%; min-height:var(--cmc-dock-h); display:flex; align-items:center; gap:9px; padding:8px 10px; border:0; background:linear-gradient(135deg,rgba(249,115,22,.92),rgba(234,88,12,.86)); color:#fff; text-align:left; cursor:pointer; touch-action:manipulation; }
      .cmc-comfort-dock-mark { flex:0 0 auto; width:34px; height:34px; display:grid; place-items:center; border-radius:10px; background:rgba(255,255,255,.16); font-size:18px; font-weight:900; }
      .cmc-comfort-dock-copy { min-width:0; display:block; }
      .cmc-comfort-dock-title { display:block; font-size:14px; font-weight:850; line-height:1.1; }
      .cmc-comfort-dock-sub { display:block; margin-top:2px; overflow:hidden; color:rgba(255,255,255,.78); font-size:10px; text-overflow:ellipsis; white-space:nowrap; }
      .cmc-comfort-dock-chevron { margin-left:auto; font-size:16px; opacity:.84; }
      .cmc-bottom-nav { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; padding:8px; }
      .cmc-nav-item { min-width:0; min-height:44px; display:flex; flex-direction:row; align-items:center; justify-content:flex-start; gap:8px; padding:7px 10px; border:1px solid rgba(255,255,255,.08); border-radius:10px; background:rgba(255,255,255,.05); color:var(--cmc-muted); text-decoration:none; cursor:pointer; }
      .cmc-nav-item:hover, .cmc-nav-item:focus-visible, .cmc-nav-item.is-active { color:#fff; background:rgba(255,255,255,.10); outline:none; }
      .cmc-nav-item.is-active { color:#ff985f; }
      .cmc-nav-icon { flex:0 0 auto; width:20px; font-size:18px; line-height:1; text-align:center; }
      .cmc-nav-label { max-width:100%; overflow:hidden; text-overflow:ellipsis; font-size:11px; font-weight:750; white-space:nowrap; }
      .cmc-bottom-nav .cmc-nav-item:last-child { grid-column:1 / -1; }
      .cmc-comfort-dock.is-collapsed { width:auto; }
      .cmc-comfort-dock.is-collapsed .cmc-comfort-dock-card,
      .cmc-comfort-dock.is-collapsed .cmc-comfort-dock-head { border-radius:999px; }
      .cmc-comfort-dock.is-collapsed .cmc-bottom-nav,
      .cmc-comfort-dock.is-collapsed .cmc-comfort-dock-sub,
      .cmc-comfort-dock.is-collapsed .cmc-comfort-dock-chevron { display:none; }
      .cmc-comfort-dock:not(.is-collapsed) ~ .cmc-room-tabs { opacity:0; pointer-events:none; }

      .cmc-fab {
        position:fixed; z-index:2147483001; bottom:calc(12px + env(safe-area-inset-bottom)); min-width:48px; min-height:48px;
        display:flex; align-items:center; justify-content:center; padding:0 13px; border:1px solid rgba(255,255,255,.20); border-radius:999px;
        background:var(--cmc-bg); color:#fff; box-shadow:var(--cmc-shadow); cursor:pointer;
      }
      body.cmc-handed-right .cmc-fab { right:12px; }
      body.cmc-handed-left .cmc-fab { left:12px; }
      body.cmc-has-comfort-dock .cmc-fab { display:none; }
      html.cmc-active .cmc-fab { background:var(--cmc-accent); }

      .cmc-room-tabs {
        position:fixed; z-index:2147482800; left:50%; bottom:max(8px,env(safe-area-inset-bottom)); transform:translateX(-50%);
        display:flex; gap:4px; padding:4px; border:1px solid var(--cmc-border); border-radius:999px;
        background:rgba(17,24,39,.88); box-shadow:var(--cmc-shadow); backdrop-filter:blur(12px); transition:opacity .2s ease,transform .2s ease;
      }
      .cmc-room-tabs button { min-width:72px; min-height:42px; border:0; border-radius:999px; background:transparent; color:var(--cmc-muted); font-weight:750; cursor:pointer; }
      .cmc-room-tabs button.is-active { background:var(--cmc-accent); color:#fff; }
      body:not(.cmc-room) .cmc-room-tabs, body.cmc-room-tabs-off .cmc-room-tabs, body.cmc-landscape .cmc-room-tabs { display:none; }

      .cmc-chat-bubble {
        display:none; position:fixed; z-index:2147483100; bottom:max(10px,env(safe-area-inset-bottom));
        min-width:52px; min-height:48px; align-items:center; justify-content:center; gap:5px; padding:0 12px;
        border:1px solid rgba(255,255,255,.22); border-radius:999px; background:var(--cmc-accent); color:#fff;
        font-weight:800; box-shadow:var(--cmc-shadow); cursor:pointer; touch-action:manipulation;
        transition:opacity .2s ease,transform .2s ease;
      }
      body.cmc-room.cmc-chat-available.cmc-chat-mode-bubble:not(.cmc-chat-open) .cmc-chat-bubble { display:flex; }
      body.cmc-handed-right .cmc-chat-bubble { right:max(10px,env(safe-area-inset-right)); }
      body.cmc-handed-left .cmc-chat-bubble { left:max(10px,env(safe-area-inset-left)); }
      body.cmc-has-comfort-dock.cmc-handed-left .cmc-chat-bubble { bottom:calc(var(--cmc-dock-h) + env(safe-area-inset-bottom) + 18px); }
      body.cmc-roomgrid-present .cmc-chat-bubble { right:auto !important; left:max(10px,env(safe-area-inset-left)) !important; bottom:calc(var(--cmc-dock-h) + env(safe-area-inset-bottom) + 18px) !important; }
      .cmc-chat-count {
        display:none; min-width:19px; height:19px; align-items:center; justify-content:center; padding:0 5px;
        border-radius:999px; background:#fff; color:#b42318; font-size:10px; line-height:1; font-weight:900;
      }
      .cmc-chat-bubble.has-unread .cmc-chat-count { display:inline-flex; }

      .cmc-pip-button {
        display:none; position:fixed; z-index:2147483050; min-width:54px; min-height:44px; align-items:center; justify-content:center;
        padding:0 11px; border:1px solid rgba(255,255,255,.24); border-radius:999px; background:rgba(15,23,42,.88); color:#fff;
        font-weight:850; box-shadow:0 8px 24px rgba(0,0,0,.28); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
        cursor:pointer; touch-action:manipulation; transition:opacity .2s ease,transform .2s ease,background .2s ease;
      }
      body.cmc-room.cmc-pip-available .cmc-pip-button { display:flex; }
      .cmc-pip-button[aria-pressed="true"] { background:var(--cmc-accent); }
      .cmc-pip-button.cmc-pip-offscreen,
      body.cmc-controls-hidden .cmc-pip-button { opacity:0; transform:translateY(-8px); pointer-events:none; }
      body.cmc-chat-open .cmc-pip-button,
      body.cmc-panel-open .cmc-pip-button,
      body.cmc-site-modal-open .cmc-pip-button,
      body.cmc-fullscreen .cmc-pip-button { display:none !important; }

      .cmc-chat-backdrop { display:none; position:fixed; z-index:2147482400; inset:0; background:rgba(0,0,0,.44); backdrop-filter:blur(2px); pointer-events:auto; }
      body.cmc-chat-open .cmc-chat-backdrop { display:block; }
      .cmc-chat-close {
        display:none; position:fixed; z-index:2147482600; right:14px;
        bottom:calc(var(--cmc-chat-sheet-h) - 34px);
        width:44px; height:44px; align-items:center; justify-content:center; border:1px solid var(--cmc-border);
        border-radius:999px; background:rgba(17,24,39,.94); color:#fff; font-size:26px; line-height:1;
        box-shadow:0 8px 24px rgba(0,0,0,.3); cursor:pointer; touch-action:manipulation;
      }
      body.cmc-chat-open .cmc-chat-close { display:flex; }

      .cmc-panel-backdrop { display:none; position:fixed; z-index:2147483600; inset:0; align-items:flex-end; justify-content:center; padding:0; background:rgba(0,0,0,.54); backdrop-filter:blur(4px); pointer-events:auto; }
      .cmc-panel-backdrop.is-open { display:flex; }
      .cmc-panel { width:100%; max-height:min(88dvh,760px); overflow:auto; padding:12px 12px calc(14px + env(safe-area-inset-bottom)); border:1px solid var(--cmc-border); border-radius:20px 20px 0 0; background:var(--cmc-bg); color:var(--cmc-text); box-shadow:var(--cmc-shadow); }
      .cmc-panel-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .cmc-panel-title { font-size:17px; font-weight:850; }
      .cmc-panel-subtitle { color:var(--cmc-muted); font-size:11px; }
      .cmc-close { width:44px; height:44px; border:1px solid var(--cmc-border); border-radius:12px; background:var(--cmc-surface-2); color:#fff; cursor:pointer; }
      .cmc-settings-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; margin-bottom:12px; padding:4px; border-radius:13px; background:var(--cmc-surface); }
      .cmc-settings-tabs button { min-height:42px; border:0; border-radius:10px; background:transparent; color:var(--cmc-muted); font-weight:750; cursor:pointer; }
      .cmc-settings-tabs button.is-active { background:var(--cmc-surface-2); color:#fff; }
      .cmc-settings-page { display:grid; gap:8px; }
      .cmc-setting { min-height:48px; display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:12px; padding:9px 10px; border:1px solid var(--cmc-border); border-radius:12px; background:var(--cmc-surface); }
      .cmc-setting-copy { min-width:0; }
      .cmc-setting-label { display:block; font-weight:750; }
      .cmc-setting-hint { display:block; margin-top:2px; color:var(--cmc-muted); font-size:11px; }
      .cmc-setting input[type="checkbox"] { width:24px; height:24px; accent-color:var(--cmc-accent); }
      .cmc-setting select, .cmc-setting input[type="number"] { min-width:88px; min-height:40px; padding:6px 8px; border:1px solid var(--cmc-border); border-radius:9px; background:var(--cmc-surface-2); color:#fff; }
      .cmc-panel-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
      .cmc-panel-actions button { min-height:44px; padding:8px 13px; border:1px solid var(--cmc-border); border-radius:11px; background:var(--cmc-surface-2); color:#fff; font-weight:750; cursor:pointer; }
      .cmc-panel-actions .danger { color:#fecaca; }
      .cmc-toast { position:fixed; z-index:2147483700; left:50%; bottom:calc(var(--cmc-dock-h) + env(safe-area-inset-bottom) + 18px); transform:translateX(-50%) translateY(10px); max-width:calc(100vw - 32px); padding:9px 13px; border-radius:999px; background:rgba(15,23,42,.94); color:#fff; opacity:0; pointer-events:none; transition:opacity .16s,transform .16s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .cmc-toast.is-visible { opacity:1; transform:translateX(-50%) translateY(0); }

      body.cmc-controls-hidden .cmc-room-tabs { opacity:0; transform:translate(-50%,18px); pointer-events:none; }
      body.cmc-chat-open .cmc-comfort-dock,
      body.cmc-panel-open .cmc-comfort-dock,
      body.cmc-site-modal-open .cmc-comfort-dock,
      body.cmc-site-modal-open .cmc-fab,
      body.cmc-site-modal-open .cmc-room-tabs,
      body.cmc-site-modal-open .cmc-chat-bubble,
      body.cmc-site-modal-open .cmc-chat-backdrop,
      body.cmc-site-modal-open .cmc-chat-close { display:none !important; }
      body.cmc-fullscreen .cmc-comfort-dock,
      body.cmc-fullscreen .cmc-fab,
      body.cmc-fullscreen .cmc-room-tabs,
      body.cmc-fullscreen .cmc-chat-bubble { display:none !important; }

      @media (orientation:landscape) and (max-height:650px) {
        :root { --cmc-dock-h:48px; }
        .cmc-comfort-dock { bottom:max(8px,env(safe-area-inset-bottom)); width:min(286px,46vw); }
        .cmc-nav-item { min-height:40px; }
        .cmc-room-tabs { bottom:8px; }
        .cmc-chat-bubble { bottom:max(8px,env(safe-area-inset-bottom)); }
        .cmc-chat-close { top:8px; right:8px; bottom:auto; }
        body.cmc-chat-open .cmc-chat-backdrop { background:rgba(0,0,0,.22); backdrop-filter:none; }
      }
      @media (prefers-reduced-motion:reduce) {
        .cmc-comfort-dock,.cmc-room-tabs,.cmc-chat-bubble,.cmc-pip-button,.cmc-toast { transition:none !important; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function el(tag, attributes = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('data-')) node.setAttribute(key, value);
      else if (key in node) node[key] = value;
      else node.setAttribute(key, value);
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child == null) continue;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  function createUi() {
    if (!document.body || document.getElementById(ROOT_ID)) return;
    root = el('div', { id: ROOT_ID });

    const fab = el('button', { class: 'cmc-fab', type: 'button', title: `${SCRIPT_NAME} settings`, 'aria-label': `${SCRIPT_NAME} settings` }, 'Comfort');
    fab.addEventListener('click', () => togglePanel(true));

    const nav = el('nav', { class: 'cmc-bottom-nav', 'aria-label': 'Mobile quick navigation' }, [
      navLink('⌂', 'Home', '/'),
      navLink('★', 'Following', '/followed-cams/'),
      navLink('⌕', 'Discover', '/discover/'),
      navLink('#', 'Tags', '/tags/'),
      navButton('⚙', 'Comfort', () => togglePanel(true)),
    ]);
    const dockHead = el('button', {
      class: 'cmc-comfort-dock-head',
      type: 'button',
      title: 'Open Comfort dock',
      'aria-label': 'Open Comfort dock',
      'aria-expanded': 'false',
    }, [
      el('span', { class: 'cmc-comfort-dock-mark', text: 'C', 'aria-hidden': 'true' }),
      el('span', { class: 'cmc-comfort-dock-copy' }, [
        el('span', { class: 'cmc-comfort-dock-title', text: 'Comfort' }),
        el('span', { class: 'cmc-comfort-dock-sub', text: 'Quick navigation' }),
      ]),
      el('span', { class: 'cmc-comfort-dock-chevron', text: '▴', 'aria-hidden': 'true' }),
    ]);
    dockHead.addEventListener('click', () => setComfortDockOpen(!comfortDockOpen));
    const comfortDock = el('div', { class: 'cmc-comfort-dock is-collapsed' }, [
      el('div', { class: 'cmc-comfort-dock-card' }, [dockHead, nav]),
    ]);

    const roomTabs = el('div', { class: 'cmc-room-tabs', role: 'tablist', 'aria-label': 'Room view' }, [
      roomTabButton('watch', 'Watch'),
      roomTabButton('info', 'Info'),
    ]);

    const chatBubble = el('button', {
      class: 'cmc-chat-bubble',
      type: 'button',
      title: 'Open chat',
      'aria-label': 'Open chat',
      'aria-expanded': 'false',
    }, [
      el('span', { class: 'cmc-chat-label', text: 'Chat' }),
      el('span', { class: 'cmc-chat-count', 'aria-hidden': 'true' }),
    ]);
    chatBubble.addEventListener('click', () => setChatOpen(true));

    const pipButton = el('button', {
      class: 'cmc-pip-button',
      type: 'button',
      text: 'PiP',
      title: 'Pop video out into Picture-in-Picture',
      'aria-label': 'Open video in Picture-in-Picture',
      'aria-pressed': 'false',
    });
    pipButton.addEventListener('click', togglePictureInPicture);

    const chatBackdrop = el('div', { class: 'cmc-chat-backdrop', 'aria-hidden': 'true' });
    chatBackdrop.addEventListener('click', () => setChatOpen(false));

    const chatClose = el('button', {
      class: 'cmc-chat-close',
      type: 'button',
      text: '×',
      title: 'Close chat',
      'aria-label': 'Close chat',
    });
    chatClose.addEventListener('click', () => setChatOpen(false));

    const backdrop = el('div', { class: 'cmc-panel-backdrop' });
    backdrop.addEventListener('click', event => { if (event.target === backdrop) togglePanel(false); });

    const toast = el('div', { class: 'cmc-toast', role: 'status', 'aria-live': 'polite' });
    root.append(fab, comfortDock, roomTabs, chatBubble, pipButton, chatBackdrop, chatClose, backdrop, toast);
    document.body.appendChild(root);
    renderPanel();
    syncComfortDockUi();
    syncRoomTabs();
  }

  function navLink(icon, label, href) {
    const link = el('a', { class: 'cmc-nav-item', href }, [
      el('span', { class: 'cmc-nav-icon', text: icon }),
      el('span', { class: 'cmc-nav-label', text: label }),
    ]);
    return link;
  }

  function navButton(icon, label, onClick) {
    const button = el('button', { class: 'cmc-nav-item', type: 'button' }, [
      el('span', { class: 'cmc-nav-icon', text: icon }),
      el('span', { class: 'cmc-nav-label', text: label }),
    ]);
    button.addEventListener('click', onClick);
    return button;
  }

  function roomTabButton(value, label) {
    const button = el('button', { type: 'button', role: 'tab', 'data-room-tab': value, text: label });
    button.addEventListener('click', () => setRoomTab(value));
    return button;
  }

  function settingRow(label, hint, control) {
    return el('label', { class: 'cmc-setting' }, [
      el('span', { class: 'cmc-setting-copy' }, [
        el('span', { class: 'cmc-setting-label', text: label }),
        el('span', { class: 'cmc-setting-hint', text: hint }),
      ]),
      control,
    ]);
  }

  function checkboxSetting(key, label, hint) {
    const input = el('input', { type: 'checkbox', checked: !!settings[key], 'data-setting': key });
    input.addEventListener('change', () => saveSettings({ [key]: input.checked }));
    return settingRow(label, hint, input);
  }

  function selectSetting(key, label, hint, options) {
    const select = el('select', { 'data-setting': key });
    for (const [value, text] of options) select.appendChild(el('option', { value: String(value), text, selected: String(settings[key]) === String(value) }));
    select.addEventListener('change', () => saveSettings({ [key]: /^\d+$/.test(select.value) ? Number(select.value) : select.value }));
    return settingRow(label, hint, select);
  }

  function renderPanel() {
    if (!root) return;
    const backdrop = root.querySelector('.cmc-panel-backdrop');
    if (!backdrop) return;
    backdrop.replaceChildren();
    backdrop.classList.toggle('is-open', panelOpen);
    if (!panelOpen) return;

    const panel = el('section', { class: 'cmc-panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${SCRIPT_NAME} settings` });
    const close = el('button', { class: 'cmc-close', type: 'button', text: '×', title: 'Close settings', 'aria-label': 'Close settings' });
    close.addEventListener('click', () => togglePanel(false));
    panel.appendChild(el('div', { class: 'cmc-panel-head' }, [
      el('div', {}, [
        el('div', { class: 'cmc-panel-title', text: SCRIPT_NAME }),
        el('div', { class: 'cmc-panel-subtitle', text: `Version ${VERSION} · ${isNativeMobileLayout() ? 'native mobile' : 'desktop layout on a small screen'}` }),
      ]),
      close,
    ]));

    const tabs = el('div', { class: 'cmc-settings-tabs', role: 'tablist' });
    [['general', 'General'], ['browse', 'Browse'], ['room', 'Room']].forEach(([value, label]) => {
      const button = el('button', { type: 'button', role: 'tab', text: label, class: activeSettingsTab === value ? 'is-active' : '' });
      button.addEventListener('click', () => { activeSettingsTab = value; renderPanel(); });
      tabs.appendChild(button);
    });
    panel.appendChild(tabs);

    const page = el('div', { class: 'cmc-settings-page' });
    if (activeSettingsTab === 'general') {
      page.append(
        checkboxSetting('enabled', 'Enhancements enabled', 'Pause styling without uninstalling the script.'),
        checkboxSetting('compactHeader', 'Compact sticky header', 'Keeps search and account controls reachable.'),
        checkboxSetting('bottomNav', 'Compact Comfort dock', 'Collapsed quick navigation that stays clear of the fullscreen button.'),
        checkboxSetting('hidePromos', 'Hide promotional sections', 'Leaves account, safety, tipping, and payment interfaces untouched.'),
        selectSetting('handedness', 'One-handed side', 'Positions floating controls for your preferred hand.', [['right', 'Right'], ['left', 'Left']]),
      );
    } else if (activeSettingsTab === 'browse') {
      page.append(
        selectSetting('portraitColumns', 'Portrait columns', 'Model cards shown across the screen.', [[1, '1 column'], [2, '2 columns'], [3, '3 columns']]),
        selectSetting('landscapeColumns', 'Landscape columns', 'Model cards shown across the unfolded or rotated screen.', [[2, '2 columns'], [3, '3 columns'], [4, '4 columns'], [5, '5 columns']]),
        selectSetting('density', 'Card density', 'Controls how much room information appears.', [['compact', 'Compact'], ['comfortable', 'Comfortable'], ['large', 'Large thumbnails']]),
        checkboxSetting('stickyFilters', 'Sticky category and filter bar', 'Keeps browsing controls within thumb reach.'),
      );
    } else {
      page.append(
        checkboxSetting('roomTabs', 'Watch / Info controls', 'Adds a clear portrait room switcher.'),
        selectSetting('chatMode', 'Chat', 'Choose how chat behaves on a phone-sized screen.', [['bubble', 'Floating bubble'], ['hidden', 'Always hidden'], ['original', 'Original site layout']]),
        checkboxSetting('chatUnreadBadge', 'Unread chat badge', 'Shows a small count while the floating chat is closed.'),
        checkboxSetting('autoHideControls', 'Auto-hide viewing controls', 'Tap the page to reveal the controls again.'),
        selectSetting('autoHideSeconds', 'Control hide delay', 'Choose 0 to keep controls visible.', [[0, 'Never'], [3, '3 seconds'], [5, '5 seconds'], [8, '8 seconds'], [12, '12 seconds'], [20, '20 seconds']]),
        checkboxSetting('compactRoomInfo', 'Compact room information', 'Limits long room information until you scroll it.'),
      );
    }
    panel.appendChild(page);

    const reset = el('button', { class: 'danger', type: 'button', text: 'Reset settings' });
    reset.addEventListener('click', () => {
      if (!confirm('Reset Desktop Mobile Comfort settings?')) return;
      settings = { ...DEFAULTS };
      writeStoredValue(JSON.stringify(settings));
      applyEnvironment();
      renderPanel();
      showToast('Comfort settings reset');
    });
    panel.appendChild(el('div', { class: 'cmc-panel-actions' }, [reset]));
    backdrop.appendChild(panel);
  }

  function togglePanel(open) {
    panelOpen = typeof open === 'boolean' ? open : !panelOpen;
    if (panelOpen) setComfortDockOpen(false, false);
    document.body?.classList.toggle('cmc-panel-open', panelOpen);
    document.body?.classList.remove('cmc-controls-hidden');
    renderPanel();
    if (!panelOpen) resetActivityTimer();
  }

  function syncComfortDockUi() {
    if (!root) return;
    const dock = root.querySelector('.cmc-comfort-dock');
    const head = root.querySelector('.cmc-comfort-dock-head');
    if (!dock || !head) return;
    dock.classList.toggle('is-collapsed', !comfortDockOpen);
    head.setAttribute('aria-expanded', comfortDockOpen ? 'true' : 'false');
    head.setAttribute('aria-label', comfortDockOpen ? 'Collapse Comfort dock' : 'Open Comfort dock');
    head.title = comfortDockOpen ? 'Collapse Comfort dock' : 'Open Comfort dock';
    const chevron = head.querySelector('.cmc-comfort-dock-chevron');
    if (chevron) chevron.textContent = comfortDockOpen ? '▾' : '▴';
  }

  function setComfortDockOpen(open, restartTimer = true) {
    comfortDockOpen = !!open;
    if (comfortDockOpen) document.body?.classList.remove('cmc-controls-hidden');
    syncComfortDockUi();
    if (restartTimer) resetActivityTimer();
  }

  function setRoomTab(tab) {
    roomTab = ['watch', 'info'].includes(tab) ? tab : 'watch';
    setChatOpen(false);
    const body = document.body;
    if (!body) return;
    syncRoomTabs();
    if (roomTab === 'watch') document.querySelector('.cmc-video-target')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (roomTab === 'info') document.querySelector('.cmc-info-target')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    resetActivityTimer();
  }

  function syncRoomTabs() {
    if (!root) return;
    root.querySelectorAll('[data-room-tab]').forEach(button => {
      const active = button.dataset.roomTab === roomTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function firstMatching(selectors) {
    for (const selector of selectors) {
      const candidate = [...document.querySelectorAll(selector)].find(node => !node.closest?.(`#${ROOT_ID}`));
      if (candidate) return candidate;
    }
    return null;
  }

  function findChatTarget() {
    const direct = firstMatching(CHAT_TARGET_SELECTORS);
    if (direct) return direct;

    const messageList = firstMatching(['.message-list', '[data-testid="chat-messages"]', '.chat-messages']);
    const composer = firstMatching(['[data-testid="chat-input"]', 'textarea[placeholder*="message" i]', 'input[placeholder*="message" i]']);
    let candidate = messageList?.parentElement || composer?.parentElement || null;
    for (let depth = 0; candidate && depth < 6; depth += 1, candidate = candidate.parentElement) {
      if (candidate === document.body || candidate === document.documentElement || candidate.tagName === 'MAIN') break;
      const hasMessages = candidate.matches?.('.message-list, [data-testid="chat-messages"], .chat-messages')
        || !!candidate.querySelector?.('.message-list, [data-testid="chat-messages"], .chat-messages');
      const hasComposer = candidate.matches?.('[data-testid="chat-input"]')
        || !!candidate.querySelector?.('[data-testid="chat-input"], textarea[placeholder*="message" i], input[placeholder*="message" i]');
      const containsVideo = candidate.matches?.('video, #VideoPanel, [data-testid="video-panel"], [data-testid="video-container"]')
        || !!candidate.querySelector?.('video, [data-testid="video-container"]');
      if (hasMessages && hasComposer && !containsVideo) return candidate;
    }
    return null;
  }

  function findSiteChatTabs() {
    const tabs = new Set();
    document.querySelectorAll(SITE_CHAT_TAB_SELECTOR).forEach(node => {
      if (!node.closest?.(`#${ROOT_ID}`)) tabs.add(node);
    });
    document.querySelectorAll('button, a, [role="tab"]').forEach(node => {
      if (node.closest?.(`#${ROOT_ID}`)) return;
      if (String(node.textContent || '').trim().toLowerCase() !== 'chat') return;
      const siblingLabels = [...(node.parentElement?.querySelectorAll(':scope > button, :scope > a, :scope > [role="tab"]') || [])]
        .map(sibling => String(sibling.textContent || '').trim().toLowerCase());
      const looksLikeRoomTabs = node.matches('[role="tab"]')
        || !!node.closest('[data-testid*="room" i], .native-room-tabs')
        || siblingLabels.some(label => ['watch', 'private', 'tokens', 'bio', 'more rooms'].includes(label));
      if (looksLikeRoomTabs) tabs.add(node);
    });
    return [...tabs];
  }

  function setScriptHidden(node, hidden) {
    if (!node) return;
    if (hidden) {
      if (!hiddenElementState.has(node)) {
        hiddenElementState.set(node, {
          hadAriaHidden: node.hasAttribute('aria-hidden'),
          ariaHidden: node.getAttribute('aria-hidden'),
          hadInert: node.hasAttribute('inert'),
          inert: !!node.inert,
        });
      }
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('inert', '');
      node.inert = true;
      return;
    }
    const previous = hiddenElementState.get(node);
    if (!previous) return;
    if (previous.hadAriaHidden) node.setAttribute('aria-hidden', previous.ariaHidden);
    else node.removeAttribute('aria-hidden');
    if (previous.hadInert) node.setAttribute('inert', '');
    else node.removeAttribute('inert');
    node.inert = previous.inert;
    hiddenElementState.delete(node);
  }

  function syncChatAccessibility(chat = observedChatTarget) {
    const hidden = settings.chatMode === 'hidden' || (settings.chatMode === 'bubble' && !chatOpen);
    setScriptHidden(chat, hidden);
    document.querySelectorAll('.cmc-site-chat-tab').forEach(tab => setScriptHidden(tab, settings.chatMode !== 'original'));
  }

  function syncChatUi() {
    if (!root) return;
    const bubble = root.querySelector('.cmc-chat-bubble');
    const count = root.querySelector('.cmc-chat-count');
    if (!bubble || !count) return;
    bubble.setAttribute('aria-expanded', chatOpen ? 'true' : 'false');
    const showUnread = settings.chatUnreadBadge && !chatOpen && chatUnread > 0;
    bubble.classList.toggle('has-unread', showUnread);
    count.textContent = chatUnread > 99 ? '99+' : String(chatUnread);
  }

  function bindChatTarget(chat) {
    if (observedChatTarget === chat) return;
    chatMessageObserver?.disconnect();
    chatMessageObserver = null;
    if (observedChatTarget && observedChatTarget !== chat) setScriptHidden(observedChatTarget, false);
    observedChatTarget = chat || null;
    if (!chat) return;

    const messages = chat.querySelector('.message-list, [data-testid="chat-messages"], .chat-messages') || chat;
    chatMessageObserver = new MutationObserver(mutations => {
      if (chatOpen || settings.chatMode !== 'bubble' || !settings.chatUnreadBadge) return;
      const additions = mutations.reduce((total, mutation) => total + mutation.addedNodes.length, 0);
      if (!additions) return;
      chatUnread = Math.min(999, chatUnread + additions);
      syncChatUi();
    });
    chatMessageObserver.observe(messages, { childList: true, subtree: false });

    if (!chat.dataset.cmcSwipeClose) {
      chat.dataset.cmcSwipeClose = '1';
      chat.addEventListener('touchstart', event => {
        const touch = event.touches?.[0];
        const rect = chat.getBoundingClientRect();
        if (!touch || document.body?.classList.contains('cmc-landscape') || touch.clientY > rect.top + 76) {
          chatSwipeStart = null;
          return;
        }
        chatSwipeStart = { x: touch.clientX, y: touch.clientY };
      }, { passive: true });
      chat.addEventListener('touchend', event => {
        const touch = event.changedTouches?.[0];
        if (!touch || !chatSwipeStart) return;
        const deltaX = Math.abs(touch.clientX - chatSwipeStart.x);
        const deltaY = touch.clientY - chatSwipeStart.y;
        chatSwipeStart = null;
        if (deltaY > 80 && deltaX < 60) setChatOpen(false);
      }, { passive: true });
    }
  }

  function setChatOpen(open) {
    const shouldOpen = !!open;
    if (!shouldOpen) {
      chatOpen = false;
      document.body?.classList.remove('cmc-chat-open');
      syncChatAccessibility();
      syncChatUi();
      resetActivityTimer();
      return;
    }
    if (!document.body?.classList.contains('cmc-room') || settings.chatMode !== 'bubble') return;
    let chat = syncTargets();
    if (!chat) {
      const siteChatTab = findSiteChatTabs()[0] || null;
      if (siteChatTab) {
        siteChatTab.click();
        window.setTimeout(() => {
          chat = syncTargets();
          if (chat) setChatOpen(true);
          else showToast('Chat is not available on this room layout');
        }, 160);
      } else {
        showToast('Chat is not available on this room layout');
      }
      return;
    }
    chatOpen = true;
    chatUnread = 0;
    document.body.classList.add('cmc-chat-open');
    document.body.classList.remove('cmc-controls-hidden');
    syncChatAccessibility(chat);
    syncChatUi();
    root?.querySelector('.cmc-chat-close')?.focus({ preventScroll: true });
    resetActivityTimer();
  }

  function findRoomVideo(videoTarget) {
    if (!videoTarget) return null;
    if (videoTarget.matches?.('video')) return videoTarget;
    const videos = [...videoTarget.querySelectorAll?.('video') || []].filter(video => !video.closest?.(`#${ROOT_ID}`));
    return videos.sort((a, b) => {
      const aRect = a.getBoundingClientRect?.() || { width: 0, height: 0 };
      const bRect = b.getBoundingClientRect?.() || { width: 0, height: 0 };
      return (bRect.width * bRect.height) - (aRect.width * aRect.height);
    })[0] || null;
  }

  function videoSupportsPictureInPicture(video) {
    if (!video || video.disablePictureInPicture) return false;
    try {
      const standard = typeof video.requestPictureInPicture === 'function' && typeof document.exitPictureInPicture === 'function';
      const webkit = typeof video.webkitSetPresentationMode === 'function'
        && (typeof video.webkitSupportsPresentationMode !== 'function' || video.webkitSupportsPresentationMode('picture-in-picture'));
      return standard || webkit;
    } catch (_) {
      return false;
    }
  }

  function pictureInPictureIsActive(video = observedRoomVideo) {
    if (!video) return false;
    try {
      return document.pictureInPictureElement === video || video.webkitPresentationMode === 'picture-in-picture';
    } catch (_) {
      return false;
    }
  }

  function syncPictureInPictureUi() {
    const button = root?.querySelector('.cmc-pip-button');
    const available = videoSupportsPictureInPicture(observedRoomVideo);
    const active = available && pictureInPictureIsActive();
    document.body?.classList.toggle('cmc-pip-available', available);
    if (!button) return;
    button.textContent = active ? 'Exit PiP' : 'PiP';
    button.title = active ? 'Return video to the page' : 'Pop video out into Picture-in-Picture';
    button.setAttribute('aria-label', active ? 'Exit Picture-in-Picture' : 'Open video in Picture-in-Picture');
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function handlePictureInPictureChange() {
    syncPictureInPictureUi();
    queuePictureInPicturePosition();
    resetActivityTimer();
  }

  function bindPictureInPictureTarget(videoTarget, video) {
    if (observedVideoTarget === videoTarget && observedRoomVideo === video) {
      syncPictureInPictureUi();
      queuePictureInPicturePosition();
      return;
    }
    if (observedRoomVideo) {
      for (const eventName of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'loadedmetadata', 'emptied']) {
        observedRoomVideo.removeEventListener(eventName, handlePictureInPictureChange);
      }
    }
    observedVideoTarget = videoTarget || null;
    observedRoomVideo = video || null;
    if (observedRoomVideo) {
      for (const eventName of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'loadedmetadata', 'emptied']) {
        observedRoomVideo.addEventListener(eventName, handlePictureInPictureChange);
      }
    }
    syncPictureInPictureUi();
    queuePictureInPicturePosition();
  }

  function positionPictureInPictureButton() {
    pipPositionFrame = 0;
    const button = root?.querySelector('.cmc-pip-button');
    const anchor = observedRoomVideo || observedVideoTarget;
    if (!button || !anchor || !document.body?.classList.contains('cmc-room')) {
      button?.classList.add('cmc-pip-offscreen');
      return;
    }
    let rect = anchor.getBoundingClientRect();
    if ((rect.width <= 80 || rect.height <= 45) && observedVideoTarget && observedVideoTarget !== anchor) {
      rect = observedVideoTarget.getBoundingClientRect();
    }
    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
    const visible = rect.width > 80 && rect.height > 45 && rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
    button.classList.toggle('cmc-pip-offscreen', !visible);
    if (!visible) return;

    const inset = 10;
    button.style.top = `${Math.round(Math.max(inset, Math.min(viewportHeight - 54, rect.top + inset)))}px`;
    if (document.body.classList.contains('cmc-handed-left')) {
      button.style.left = `${Math.round(Math.max(inset, rect.left + inset))}px`;
      button.style.right = 'auto';
    } else {
      button.style.right = `${Math.round(Math.max(inset, viewportWidth - rect.right + inset))}px`;
      button.style.left = 'auto';
    }
  }

  function queuePictureInPicturePosition() {
    if (pipPositionFrame) return;
    pipPositionFrame = window.requestAnimationFrame(positionPictureInPictureButton);
  }

  async function togglePictureInPicture(event) {
    event?.preventDefault();
    event?.stopPropagation();
    const video = observedRoomVideo;
    if (!videoSupportsPictureInPicture(video)) {
      showToast('Picture-in-Picture is not supported for this video');
      return;
    }
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else if (video.webkitPresentationMode === 'picture-in-picture') {
        video.webkitSetPresentationMode('inline');
      } else {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        if (typeof video.requestPictureInPicture === 'function') await video.requestPictureInPicture();
        else video.webkitSetPresentationMode('picture-in-picture');
      }
      syncPictureInPictureUi();
      resetActivityTimer();
    } catch (_) {
      showToast('PiP could not start. Tap play once and try again.');
    }
  }

  function syncTargets() {
    const video = firstMatching(['[data-testid="video-panel"]', '#VideoPanel', '[data-testid="video-container"]', '#chat-player', 'video']);
    const roomVideo = findRoomVideo(video);
    const chat = findChatTarget();
    const info = firstMatching(['[data-testid="room-bio-tab-contents"]', '.roomBio', '[data-testid="roomSubjectContainer"]', '[data-testid="room-subject"]']);
    const siteChatTabs = new Set(findSiteChatTabs());
    document.querySelectorAll('.cmc-video-target').forEach(node => { if (node !== video) node.classList.remove('cmc-video-target'); });
    document.querySelectorAll('.cmc-chat-target').forEach(node => { if (node !== chat) node.classList.remove('cmc-chat-target'); });
    document.querySelectorAll('.cmc-info-target').forEach(node => { if (node !== info) node.classList.remove('cmc-info-target'); });
    if (video && !video.classList.contains('cmc-video-target')) video.classList.add('cmc-video-target');
    if (chat && !chat.classList.contains('cmc-chat-target')) chat.classList.add('cmc-chat-target');
    if (info && !info.classList.contains('cmc-info-target')) info.classList.add('cmc-info-target');
    document.querySelectorAll('.cmc-site-chat-tab').forEach(node => {
      if (!siteChatTabs.has(node) || node.closest?.(`#${ROOT_ID}`)) {
        setScriptHidden(node, false);
        node.classList.remove('cmc-site-chat-tab');
      }
    });
    siteChatTabs.forEach(node => node.classList.add('cmc-site-chat-tab'));
    document.body?.classList.toggle('cmc-chat-available', !!chat || siteChatTabs.size > 0);
    bindPictureInPictureTarget(video, roomVideo);
    bindChatTarget(chat);
    syncChatAccessibility(chat);
    syncChatUi();
    return chat;
  }

  function applyEnvironment() {
    if (!document.body) return;
    createUi();
    const phoneLike = isPhoneLike();
    const blocked = isBlockedPage();
    const supported = phoneLike && !blocked;
    const active = supported && settings.enabled;
    const room = active && isRoomPage();
    const browse = active && isBrowsePage() && !room;
    const landscape = window.matchMedia?.('(orientation: landscape)')?.matches || window.innerWidth > window.innerHeight;
    const modalOpen = active && siteModalIsOpen();
    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle('cmc-supported', supported);
    html.classList.toggle('cmc-active', active);
    body.classList.toggle('cmc-native-mobile', active && isNativeMobileLayout());
    body.classList.toggle('cmc-desktop-mobile', active && !isNativeMobileLayout());
    body.classList.toggle('cmc-room', room);
    body.classList.toggle('cmc-browse', browse);
    body.classList.toggle('cmc-landscape', active && landscape);
    body.classList.toggle('cmc-portrait', active && !landscape);
    body.classList.toggle('cmc-compact-header', active && settings.compactHeader);
    body.classList.toggle('cmc-has-comfort-dock', active && settings.bottomNav);
    // Kept as a compatibility clearance signal for the merged RoomGrid dock.
    body.classList.toggle('cmc-has-bottom-nav', active && settings.bottomNav);
    body.classList.toggle('cmc-no-bottom-nav', active && !settings.bottomNav);
    if (!active || !settings.bottomNav) comfortDockOpen = false;
    body.classList.toggle('cmc-hide-promos', active && settings.hidePromos);
    body.classList.toggle('cmc-sticky-filters', active && settings.stickyFilters);
    body.classList.toggle('cmc-density-compact', active && settings.density === 'compact');
    body.classList.toggle('cmc-density-comfortable', active && settings.density === 'comfortable');
    body.classList.toggle('cmc-density-large', active && settings.density === 'large');
    if (!room || settings.chatMode !== 'bubble') chatOpen = false;
    body.classList.toggle('cmc-chat-mode-bubble', room && settings.chatMode === 'bubble');
    body.classList.toggle('cmc-chat-mode-hidden', room && settings.chatMode === 'hidden');
    body.classList.toggle('cmc-chat-mode-original', room && settings.chatMode === 'original');
    body.classList.toggle('cmc-room-tabs-off', active && !settings.roomTabs);
    body.classList.toggle('cmc-info-compact', room && settings.compactRoomInfo);
    body.classList.toggle('cmc-handed-left', supported && settings.handedness === 'left');
    body.classList.toggle('cmc-handed-right', supported && settings.handedness !== 'left');
    body.classList.toggle('cmc-site-modal-open', modalOpen);
    body.classList.toggle('cmc-fullscreen', supported && !!document.fullscreenElement);
    body.classList.toggle('cmc-roomgrid-present', supported && !!document.querySelector('.roomgrid-dock'));

    const columns = landscape ? settings.landscapeColumns : settings.portraitColumns;
    html.style.setProperty('--cmc-grid-cols', String(columns));
    html.style.setProperty('--cmc-card-gap', settings.density === 'compact' ? '5px' : settings.density === 'large' ? '10px' : '8px');
    let chat = null;
    if (room) chat = syncTargets();
    if (!chat) chatOpen = false;
    body.classList.toggle('cmc-chat-open', room && chatOpen && settings.chatMode === 'bubble' && !!chat);
    if (room) syncChatAccessibility(chat);
    else {
      bindChatTarget(null);
      bindPictureInPictureTarget(null, null);
      body.classList.remove('cmc-chat-open', 'cmc-chat-available', 'cmc-pip-available', 'cmc-controls-hidden');
    }
    syncChatUi();
    queuePictureInPicturePosition();
    updateActiveNav();
    syncComfortDockUi();
    syncRoomTabs();
  }

  function updateActiveNav() {
    if (!root) return;
    const path = location.pathname || '/';
    root.querySelectorAll('.cmc-bottom-nav a').forEach(link => {
      const hrefPath = new URL(link.href, location.href).pathname;
      link.classList.toggle('is-active', hrefPath === '/' ? path === '/' : path.startsWith(hrefPath));
    });
  }

  function resetActivityTimer() {
    clearTimeout(activityTimer);
    document.body?.classList.remove('cmc-controls-hidden');
    if (!settings.autoHideControls || settings.autoHideSeconds <= 0 || !document.body?.classList.contains('cmc-room')) return;
    if (panelOpen || chatOpen || siteModalIsOpen()) return;
    activityTimer = window.setTimeout(() => {
      comfortDockOpen = false;
      syncComfortDockUi();
      document.body?.classList.add('cmc-controls-hidden');
    }, settings.autoHideSeconds * 1000);
  }

  function showToast(message) {
    const toast = root?.querySelector('.cmc-toast');
    if (!toast) return;
    toast.textContent = String(message || '');
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        roomTab = 'watch';
        chatOpen = false;
        chatUnread = 0;
        panelOpen = false;
        comfortDockOpen = false;
      }
      applyEnvironment();
      resetActivityTimer();
    }, 80);
  }

  function mutationNeedsSync(mutation) {
    const target = mutation.target;
    if (target?.closest?.(`#${ROOT_ID}`)) return false;
    if (target?.closest?.('.cmc-chat-target')) return false;
    if (mutation.type === 'childList') return true;
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const before = new Set(String(mutation.oldValue || '').split(/\s+/).filter(Boolean));
      const after = new Set(String(target?.className || '').split(/\s+/).filter(Boolean));
      const changed = [...before].filter(name => !after.has(name)).concat([...after].filter(name => !before.has(name)));
      return changed.some(name => !name.startsWith('cmc-'));
    }
    return true;
  }

  function hookHistory() {
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      if (typeof original !== 'function' || original.__cmcWrapped) continue;
      const wrapped = function (...args) {
        const result = original.apply(this, args);
        scheduleSync();
        return result;
      };
      wrapped.__cmcWrapped = true;
      history[method] = wrapped;
    }
    addEventListener('popstate', scheduleSync);
  }

  function start() {
    injectViewport();
    installStyle();
    const ready = () => {
      if (!document.body) return;
      createUi();
      applyEnvironment();
      hookHistory();
      const observer = new MutationObserver(mutations => {
        if (mutations.some(mutationNeedsSync)) scheduleSync();
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style', 'open'] });
      addEventListener('resize', scheduleSync, { passive: true });
      addEventListener('orientationchange', scheduleSync, { passive: true });
      addEventListener('scroll', queuePictureInPicturePosition, { passive: true, capture: true });
      addEventListener('fullscreenchange', scheduleSync);
      addEventListener('pointerdown', resetActivityTimer, { passive: true });
      addEventListener('touchstart', resetActivityTimer, { passive: true });
      addEventListener('focusin', resetActivityTimer, { passive: true });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && panelOpen) togglePanel(false);
        else if (event.key === 'Escape' && chatOpen) setChatOpen(false);
      });
      resetActivityTimer();
    };
    if (document.body) ready();
    else document.addEventListener('DOMContentLoaded', ready, { once: true });
  }

  start();
})();
