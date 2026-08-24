// ==UserScript==
// @name               Ziggy Mobile Clean View
// @namespace          ziggy.chaturbate.mobile-comfort
// @version            2.0.0
// @description        A clean Chaturbate mobile layout with chat hidden, Picture-in-Picture, and one shared tools dock.
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

  const VERSION = '2.0.0';
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
  const CHAT_TAB_SELECTORS = [
    '[data-testid="mobile-chat-tab"]',
    '[data-testid="chat-tab"]',
    '[data-room-tab="chat"]',
    '[aria-controls="ChatTabContainer"]',
    'a[href="#chat"]',
    'button[value="chat"]',
  ];
  const DEFAULTS = Object.freeze({
    enabled: true,
    hidePromos: true,
    compactBrowse: true,
    portraitColumns: 2,
    landscapeColumns: 4,
    autoHideSeconds: 5,
    side: 'right',
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
        return;
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
      html.zmc-active body { overflow-x:hidden !important; }
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
    const pipButton = makeAction('▣', 'Picture-in-Picture', 'Pop out the current video', 'primary', togglePictureInPicture);
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
    actions.append(pipButton, workshopButton, roomGridButton, addButton, settingsButton);
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

  function bindVideo(video) {
    if (video === boundVideo) return;
    if (boundVideo) {
      for (const event of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'webkitbeginfullscreen', 'webkitendfullscreen']) {
        boundVideo.removeEventListener(event, scheduleSync);
      }
    }
    boundVideo = video || null;
    if (boundVideo) {
      for (const event of ['enterpictureinpicture', 'leavepictureinpicture', 'webkitpresentationmodechanged', 'webkitbeginfullscreen', 'webkitendfullscreen']) {
        boundVideo.addEventListener(event, scheduleSync);
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
    const supported = isMobileDevice() && !isBlockedPage();
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
      return;
    }

    const videoTarget = room ? findVideoTarget() : null;
    const video = room ? findPrimaryVideo() : null;
    markVideoTarget(videoTarget);
    bindVideo(video);
    if (room) hideChat();
    else restoreAllHiddenNodes();
    body.classList.toggle('zmc-fullscreen', room && pseudoFullscreenActive(videoTarget));
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
      addEventListener('fullscreenchange', scheduleSync);
      addEventListener('webkitfullscreenchange', scheduleSync);
      addEventListener('pointerdown', resetIdleTimer, { passive: true });
      document.addEventListener(SUITE_EVENTS.state, scheduleSync);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && panelOpen) setPanelOpen(false);
      });
      document.dispatchEvent(new CustomEvent(SUITE_EVENTS.ready));
      resetIdleTimer();
      setInterval(syncEnvironment, 2500);
    };
    if (document.body) ready();
    else document.addEventListener('DOMContentLoaded', ready, { once: true });
  }

  start();
})();
