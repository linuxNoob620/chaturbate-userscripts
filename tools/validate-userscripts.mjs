import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeMeta = process.argv.includes('--write-meta');
const owner = 'linuxNoob620';
const repo = 'chaturbate-userscripts';
const scripts = [
  {
    file: 'Chaturbate MultiCam Pro + Cam ARNA.user.js',
    meta: 'Chaturbate MultiCam Pro + Cam ARNA.meta.js',
    internalVersion: /version:\s*'([^']+)'/,
    canonicalRef: true,
    required: ['// @connect           api.github.com'],
  },
  {
    file: 'Chaturbate Desktop Mobile Comfort.user.js',
    meta: 'Chaturbate Desktop Mobile Comfort.meta.js',
    internalVersion: /const VERSION\s*=\s*'([^']+)'/,
    required: [],
  },
];

const failures = [];
const report = [];

function metadata(source, file) {
  const start = source.indexOf('// ==UserScript==');
  const endMarker = '// ==/UserScript==';
  const end = source.indexOf(endMarker);
  if (start !== 0 || end < 0) {
    failures.push(`${file}: invalid userscript header`);
    return '';
  }
  return `${source.slice(start, end + endMarker.length)}\n`;
}

function field(header, name) {
  return header.match(new RegExp(`^// @${name}\\s+(.+)$`, 'm'))?.[1]?.trim() || '';
}

for (const item of scripts) {
  const scriptPath = path.join(root, item.file);
  const source = await readFile(scriptPath, 'utf8');
  const header = metadata(source, item.file);
  const version = field(header, 'version');
  const updateUrl = field(header, 'updateURL');
  const downloadUrl = field(header, 'downloadURL');
  const branchPath = item.canonicalRef ? 'refs/heads/main' : 'main';
  const expectedBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branchPath}/`;
  const internalVersion = source.match(item.internalVersion)?.[1] || '';
  const syntax = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });

  if (syntax.status !== 0) failures.push(`${item.file}: syntax check failed\n${syntax.stderr}`);
  if (!/^\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) failures.push(`${item.file}: invalid @version ${version || '(missing)'}`);
  if (internalVersion !== version) failures.push(`${item.file}: internal version ${internalVersion || '(missing)'} does not match ${version}`);
  if (!updateUrl.startsWith(expectedBase) || !updateUrl.endsWith('.meta.js')) failures.push(`${item.file}: unexpected @updateURL`);
  if (!downloadUrl.startsWith(expectedBase) || !downloadUrl.endsWith('.user.js')) failures.push(`${item.file}: unexpected @downloadURL`);
  for (const required of item.required) if (!header.includes(required)) failures.push(`${item.file}: missing ${required.trim()}`);
  const credentialPattern = new RegExp(`\\b(?:github_${'pat_'}|gh[pousr]_|glpat-)[A-Za-z0-9_\\-]{12,}`);
  if (credentialPattern.test(source)) failures.push(`${item.file}: possible embedded access token`);
  if (item.file.includes('MultiCam Pro')) {
    const menuStart = source.indexOf('    function moreoptions(){');
    const menuEnd = source.indexOf('\n    function ', menuStart + 10);
    const menuSource = menuStart >= 0 && menuEnd > menuStart ? source.slice(menuStart, menuEnd) : '';
    if (!menuSource) failures.push(`${item.file}: Suite menu function was not found`);
    if (/\bupdateGithubSyncMenuLabel\s*\(/.test(menuSource)) {
      failures.push(`${item.file}: Suite menu calls a private Workshop helper and can leave the wait overlay active`);
    }
    if (!menuSource.includes('isGithubSyncConfigured')) failures.push(`${item.file}: safe GitHub status bridge is missing from Suite menu`);
    if (!source.includes('ziggy-mobile-reloaded-backdrop')) failures.push(`${item.file}: native mobile Suite menu is missing`);
    if (!source.includes('mobileCleanView: captureMobileCleanViewSettings()')) failures.push(`${item.file}: mobile-view backup component is missing`);
    if (!source.includes('onclick: openCurrentRoomRecu')) failures.push(`${item.file}: Rooms Recu.me button is missing`);
    if (!source.includes('https://recu.me/performer/${encodeURIComponent(room)}')) failures.push(`${item.file}: Rooms Recu.me URL is not tied to the active model`);
    if (!source.includes('Integrated Suite mobile-view component')) failures.push(`${item.file}: integrated mobile-view runtime is missing`);
    if (!source.includes("const supported = isNativeMobileSite() && !isBlockedPage();")) failures.push(`${item.file}: integrated mobile view is not gated to native mobile`);
    if (!source.includes("fullscreen: 'ziggy-mobile-clean-view:fullscreen'")) failures.push(`${item.file}: Suite-to-Clean-View fullscreen bridge is missing`);
    if (!source.includes("const INSTANCE_MARKER_ID = 'ziggy-chaturbate-suite-runtime'")) failures.push(`${item.file}: cross-sandbox duplicate runtime guard is missing`);
    if (!source.includes("id: 'roomgrid-native-trigger'")) failures.push(`${item.file}: native desktop RoomGrid trigger is missing`);
    if (!source.includes("#portrait-contents .BaseRoomTab.PrivateTab")) failures.push(`${item.file}: native mobile RoomGrid tab panel mount is missing`);
    if (!source.includes("document.querySelectorAll('button,a,li,[role=\"tab\"]')")) failures.push(`${item.file}: mobile Chat tab removal does not cover native list-item tabs`);
    if (source.includes("root.appendChild($('div', { class: 'roomgrid-dock-card'")) failures.push(`${item.file}: legacy floating RoomGrid dock mount is still present`);
    if (!source.includes("target: '_blank'")) failures.push(`${item.file}: Workshop model-name new-tab link is missing`);
    if (!source.includes("class: 'card-ops-menu-backdrop'")) failures.push(`${item.file}: mobile Workshop card-menu backdrop is missing`);
    if (!source.includes('body.rg-phone-mode.rg-card-menu-open .grid.view-phone')) failures.push(`${item.file}: mobile Workshop menu scroll isolation is missing`);
    if (!source.includes("if (nativeMobilePage && mobileRoomGridOpen) return;")) failures.push(`${item.file}: native mobile RoomGrid tab can still auto-collapse`);
    if (!source.includes('function activateMobileRoomGrid()') || !source.includes('invokeNativeMobilePrivateTab(tab)')) {
      failures.push(`${item.file}: mobile RoomGrid does not activate Chaturbate's native Private-tab carousel first`);
    }
    for (const removedWindowFirstMarker of ['viewerMode', 'rg-viewer-mode', 'startupWindowFirst', 'menuViewerMode', 'shortcutViewerMode']) {
      if (source.includes(removedWindowFirstMarker)) failures.push(`${item.file}: removed Window-first mode marker remains: ${removedWindowFirstMarker}`);
    }
    if (!source.includes("startupView: 'last'") || !source.includes('function openStartupSettings()')) failures.push(`${item.file}: Workshop startup view/group settings are missing`);
    if (!source.includes("startupGroup: 'last'") || !source.includes('__startupGroupDefaultMigratedV1657')) failures.push(`${item.file}: Workshop startup group does not default and migrate to Last used`);
    if (!source.includes("queueGithubSettingsAutoExport('Workshop membership changed')")) failures.push(`${item.file}: persisted Workshop membership changes do not trigger the scoped GitHub backup`);
    if (/function (?:maybeAutoImportGithubSettings|scheduleGithubAutoImport)/.test(source)) failures.push(`${item.file}: automatic import must remain removed`);
    if (!source.includes("'aria-label': t('startupViewLabel')") || !source.includes("'aria-label': t('startupGroupLabel')")) failures.push(`${item.file}: startup settings controls are missing distinct accessible labels`);
    for (const removedFollowingMarker of [
      'ONLINE_FOLLOWING_GROUP_ID', 'syncOnlineFollowing', 'ziggy_online_following_cache',
      'ziggy-following-sync-frame', 'rg-following-pager', 'splitOnlineFollowing',
    ]) {
      if (source.includes(removedFollowingMarker)) failures.push(`${item.file}: removed Workshop Online Following marker remains: ${removedFollowingMarker}`);
    }
    if (!source.includes("g.id === 'online-following'")) failures.push(`${item.file}: legacy Online Following state is not scrubbed during sanitization`);
    if (source.includes('pendingScopes.add(nativeMobilePage ? scope : document)') || source.includes("if (!nativeMobilePage) {\n          scheduleScan(document);")) {
      failures.push(`${item.file}: desktop room-card mutations still trigger full-document rescans`);
    }
    const fullscreenDblClickStart = source.indexOf("card.addEventListener('dblclick'");
    const fullscreenDblClickEnd = source.indexOf("card.addEventListener('contextmenu'", fullscreenDblClickStart);
    const fullscreenDblClickSource = fullscreenDblClickStart >= 0 && fullscreenDblClickEnd > fullscreenDblClickStart
      ? source.slice(fullscreenDblClickStart, fullscreenDblClickEnd)
      : '';
    for (const required of ['e.preventDefault()', 'e.stopPropagation()', 'e.stopImmediatePropagation()', 'toggleWorkshopNativeFullscreen(card)']) {
      if (!fullscreenDblClickSource.includes(required)) failures.push(`${item.file}: Workshop double-click fullscreen guard is missing ${required}`);
    }
    if (!source.includes('async function toggleWorkshopNativeFullscreen(card)')
      || !source.includes("const target = card.querySelector('.cam-media') || card")
      || !source.includes('await target.requestFullscreen()')
      || !source.includes('infoActions.appendChild(fullBtn)')) {
      failures.push(`${item.file}: Workshop does not use native fullscreen on its existing media surface`);
    }
    const nativeRoomFullscreenStart = source.indexOf('  async function enterVideoOnlyFullscreen()');
    const nativeRoomFullscreenEnd = source.indexOf('\n  function handleVideoOnlyFullscreenChange()', nativeRoomFullscreenStart);
    const nativeRoomFullscreenSource = nativeRoomFullscreenStart >= 0 && nativeRoomFullscreenEnd > nativeRoomFullscreenStart
      ? source.slice(nativeRoomFullscreenStart, nativeRoomFullscreenEnd)
      : '';
    for (const required of ['const host = findFullscreenHost(video)', 'await host.requestFullscreen()', "showToast('Full screen is unavailable')"]) {
      if (!nativeRoomFullscreenSource.includes(required)) failures.push(`${item.file}: native room fullscreen is missing ${required}`);
    }
    for (const removed of ['createFullscreenControls()', "host.classList.add('zmc-video-only-host')", 'bindFullscreenGestures(session)']) {
      if (nativeRoomFullscreenSource.includes(removed)) failures.push(`${item.file}: room fullscreen still creates the retired custom interface: ${removed}`);
    }
    if (source.includes("settingRow('Portrait fullscreen'") || source.includes("settingRow('Landscape fullscreen'")) {
      failures.push(`${item.file}: retired custom fullscreen fit/fill settings remain visible`);
    }
    if (!source.includes("if (document.fullscreenElement) return;\n      renderGrid();")) {
      failures.push(`${item.file}: Workshop resize handler can reparent the fullscreen card`);
    }
    if (!source.includes("if (!s.rooms.some(room => room.id === id)) return false")) failures.push(`${item.file}: Split state accepts rooms outside the saved library`);
    const cardOpsStart = source.indexOf('function openCardOpsMenu(');
    const cardOpsEnd = source.indexOf('function openMoveMenu(', cardOpsStart);
    const cardOpsSource = cardOpsStart >= 0 && cardOpsEnd > cardOpsStart ? source.slice(cardOpsStart, cardOpsEnd) : '';
    for (const key of ['opMirror', 'opFlip', 'opRotateLeft', 'opRotateRight', 'opResetView', 'opOpenRoom', 'opPiP']) {
      if (cardOpsSource.includes(`t('${key}')`)) failures.push(`${item.file}: removed Workshop card-menu action ${key} returned`);
    }
    if (source.includes("['openRoom', t('shortcutOpenRoom')]")) failures.push(`${item.file}: removed Workshop Open-room shortcut returned`);
    if (source.includes("const openBtn = mkOp('external'") || source.includes("const pipBtn = mkOp('pip'")) failures.push(`${item.file}: removed Workshop card quick action returned`);
    if (!source.includes("title: t('modelNameBackgroundTab')")) failures.push(`${item.file}: Workshop model-name background-tab hint is missing`);
    for (const removed of ['UnifiedRecorder', 'MediaRecorder', 'Recorder Hub', 'multicam_recorder', 'RECORDER_OWNER_KEY', 'convertRecordingToMp4', 'ensureRecorderMediaToolkit', '@resource          mediabunny']) {
      if (source.includes(removed)) failures.push(`${item.file}: removed recording runtime remains: ${removed}`);
    }
    for (const required of ['rg-workshop-native', 'rg-native-categories', 'rg-refresh-progress', 'roomgrid-mobile-recu-tab', 'Export settings to GitHub', 'Import settings from GitHub']) {
      if (!source.includes(required)) failures.push(`${item.file}: native Workshop / direct mobile control is missing: ${required}`);
    }
    if (!source.includes("findDesktopNavigationSlot('private')")) failures.push(`${item.file}: desktop Workshop navigation does not replace Private Shows`);
    if (!source.includes("const WORKSHOP_TAB_TITLE = 'Ziggy Chaturbate Suite · Workshop'")) failures.push(`${item.file}: unique Workshop tab title is missing`);
    if (!source.includes("function canonicalWorkshopUrl()")) failures.push(`${item.file}: canonical Workshop URL helper is missing`);
    if (!source.includes('ROOM_TAB_RESERVED_PATHS')) failures.push(`${item.file}: integrated model-room tab renamer is missing`);
    if (!source.includes("const RECU_TAB_LABEL = 'Recu.me'")) failures.push(`${item.file}: native model-room Recu.me tab label is missing`);
    if (!source.includes('// @match             https://recu.me/*')) failures.push(`${item.file}: Recu.me Cloudflare relay match is missing`);
    if (!source.includes("const RECU_BRIDGE_KEY_PREFIX = 'ziggy_recu_bridge_v1_'")) failures.push(`${item.file}: Recu.me background-tab relay is missing`);
    if (!source.includes("if (location.hostname === 'recu.me')")) failures.push(`${item.file}: normal Recu.me visits are not isolated from the Suite runtime`);
    if (!source.includes('function ensureRecuRoomTab()')) failures.push(`${item.file}: native model-room Recu.me tab adapter is missing`);
    if (!source.includes('function parseRecuProfile(html, room, pageUrl =')) failures.push(`${item.file}: sanitized Recu.me performer parser is missing`);
    if (!source.includes('function sanitizeRecuProfilePayload(payload, room)')) failures.push(`${item.file}: relayed Recu.me data is not revalidated on Chaturbate`);
    if (!source.includes('function requestRecuProfileThroughTab(room, generation, pageUrl =')) failures.push(`${item.file}: Recu.me 403 fallback is missing`);
    if (!source.includes('a.tabLink[data-testid="room-tab-Share"]')) failures.push(`${item.file}: Recu.me does not reuse the native Share tab`);
    if (!source.includes("document.querySelector('#roomTabs > #shareTab,#shareTab')")) failures.push(`${item.file}: Recu.me does not reuse the native Share panel`);
    if (!source.includes("['loading', 'loaded'].includes(panel.dataset.ziggyRecuState)")) failures.push(`${item.file}: Recu.me tab is missing its lazy-load guard`);
    if (!source.includes("url.hostname.endsWith('.mediafront.net')")) failures.push(`${item.file}: Recu.me thumbnails are not host validated`);
    if (source.includes('frame[src*="recu.me"]')) failures.push(`${item.file}: Recu.me integration attempts a CSP-blocked iframe`);
    if (!source.includes('nativeColorCounts')) failures.push(`${item.file}: Workshop navigation does not inherit a normal native nav item`);
    if (!source.includes('document.body.classList.add(\'rg-control-drawer-open\')')) failures.push(`${item.file}: Workshop drawer scroll isolation is missing`);
    if (!source.includes('if (!isMobileDevice() || isBlockedPage()) return;')) failures.push(`${item.file}: mobile view still starts on blocked Workshop routes`);
    if ((source.match(/^\/\/ ==UserScript==$/gm) || []).length !== 1) failures.push(`${item.file}: embedded component added an extra userscript metadata block`);
    const mobileStop = source.indexOf('if (!document.getElementById("desktop-spa-header")){return;}');
    const reloadedStyle = source.indexOf('    setgenstyle();', mobileStop);
    if (mobileStop < 0 || reloadedStyle < mobileStop) failures.push(`${item.file}: Reloaded desktop CSS is not isolated from native mobile`);
  }
  if (item.file.includes('Desktop Mobile Comfort')) {
    if (!source.includes('ziggy-mobile-clean-view:import-settings')) failures.push(`${item.file}: shared Suite settings import bridge is missing`);
    for (const selector of ['.hasDarkBackground > div', '.hasDarkBackground', '.hasDarkBackground.draggableCanvasChatWindow.draggableCanvasWindow']) {
      if (!source.includes(selector)) failures.push(`${item.file}: original mobile chat selector ${selector} is missing`);
    }
    if (!source.includes('for (const selector of ORIGINAL_MOBILE_HIDE_CHAT_SELECTORS)')) {
      failures.push(`${item.file}: original mobile chat selectors are not integrated into hideChat`);
    }
    if (!source.includes('const supported = isNativeMobileSite() && !isBlockedPage();')) {
      failures.push(`${item.file}: Clean View behavior is not gated to native mobile`);
    }
  }

  const metaPath = path.join(root, item.meta);
  if (writeMeta) await writeFile(metaPath, header, 'utf8');
  let meta = '';
  try { meta = await readFile(metaPath, 'utf8'); }
  catch { failures.push(`${item.meta}: missing; run with --write-meta`); }
  if (meta && meta.replace(/\r\n/g, '\n') !== header.replace(/\r\n/g, '\n')) failures.push(`${item.meta}: does not match the script header`);
  report.push(`${item.file}: ${version}`);
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`Validated ${report.join(', ')}${writeMeta ? ' and regenerated metadata files' : ''}.\n`);
