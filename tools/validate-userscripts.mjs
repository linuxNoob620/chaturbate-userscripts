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
    if (!menuSource) failures.push(`${item.file}: Reloaded menu function was not found`);
    if (/\bupdateGithubSyncMenuLabel\s*\(/.test(menuSource)) {
      failures.push(`${item.file}: Reloaded menu calls a private MultiCam helper and can leave the wait overlay active`);
    }
    if (!menuSource.includes('isGithubSyncConfigured')) failures.push(`${item.file}: safe GitHub status bridge is missing from Reloaded menu`);
    if (!source.includes('ziggy-mobile-reloaded-backdrop')) failures.push(`${item.file}: native mobile Reloaded menu is missing`);
    if (!source.includes('mobileCleanView: captureMobileCleanViewSettings()')) failures.push(`${item.file}: Mobile Clean View backup component is missing`);
    if (!source.includes('onclick: openCurrentRoomRecu')) failures.push(`${item.file}: RoomGrid Recu.me button is missing`);
    if (!source.includes('https://recu.me/performer/${encodeURIComponent(room)}')) failures.push(`${item.file}: Rooms Recu.me URL is not tied to the active model`);
    if (!source.includes('Integrated component: Ziggy Mobile Clean View')) failures.push(`${item.file}: integrated Mobile Clean View runtime is missing`);
    if (!source.includes("const supported = isNativeMobileSite() && !isBlockedPage();")) failures.push(`${item.file}: integrated Mobile Clean View is not gated to native mobile`);
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
    if (!source.includes('queueGithubSettingsAutoExport(`added room ${id}`)')) failures.push(`${item.file}: new Workshop rooms do not trigger the scoped GitHub backup`);
    if (!source.includes("allow-scripts allow-same-origin allow-presentation")) failures.push(`${item.file}: Online Following synchronizer sandbox is missing presentation support`);
    if (source.includes("searchParams.set('ziggy_following_sync'")) failures.push(`${item.file}: Online Following synchronizer must use Chaturbate's native URL without custom query parameters`);
    if (!source.includes("'aria-label': t('startupViewLabel')") || !source.includes("'aria-label': t('startupGroupLabel')")) failures.push(`${item.file}: startup settings controls are missing distinct accessible labels`);
    if (source.includes('(await loadAllOnlineFollowing()).filter(item => !savedIds.has(item.id))')) failures.push(`${item.file}: saved followed rooms are incorrectly omitted from Online Following`);
    if (!source.includes('async function unfollowOnlineFollowingRoom')) failures.push(`${item.file}: Online Following account unfollow action is missing`);
    if (!source.includes("t('opUnfollowAccount')")) failures.push(`${item.file}: Online Following card menu does not expose account unfollow`);
    if (!source.includes('onlineFollowingSuppressedUntil')) failures.push(`${item.file}: Online Following unfollow stale-sync suppression is missing`);
    if (!source.includes('const ONLINE_FOLLOWING_PAGE_SIZE = 9')) failures.push(`${item.file}: Online Following desktop page size is not nine`);
    if (!source.includes('const ONLINE_FOLLOWING_MOBILE_PAGE_SIZE = 4')) failures.push(`${item.file}: Online Following mobile page size is not four`);
    if (!source.includes("return (phoneEnvironment || store.state.settings.viewMode === 'phone')")
      || !source.includes('const { page, pageSize } = onlineFollowingPageInfo(list)')
      || !source.includes('return list.slice(start, start + pageSize)')) {
      failures.push(`${item.file}: Online Following pagination does not apply the responsive page size`);
    }
    if (!source.includes("body.rg-phone-mode.rg-online-following .grid.view-phone { grid-template-columns:repeat(2,minmax(0,1fr))!important; }")) {
      failures.push(`${item.file}: Online Following mobile grid is not fixed to 2x2`);
    }
    const fullscreenDblClickStart = source.indexOf("card.addEventListener('dblclick'");
    const fullscreenDblClickEnd = source.indexOf("card.addEventListener('contextmenu'", fullscreenDblClickStart);
    const fullscreenDblClickSource = fullscreenDblClickStart >= 0 && fullscreenDblClickEnd > fullscreenDblClickStart
      ? source.slice(fullscreenDblClickStart, fullscreenDblClickEnd)
      : '';
    for (const required of ['e.preventDefault()', 'e.stopPropagation()', 'e.stopImmediatePropagation()', 'card.requestFullscreen()']) {
      if (!fullscreenDblClickSource.includes(required)) failures.push(`${item.file}: Workshop double-click fullscreen guard is missing ${required}`);
    }
    if (!source.includes("if (document.fullscreenElement) return;\n      if (store.state.settings.viewMode === 'focus') applyFocusMainSizing();")) {
      failures.push(`${item.file}: Workshop resize handler can reparent the fullscreen card`);
    }
    if (!source.includes("splitOnlineFollowing: 'Online Following'")) failures.push(`${item.file}: Split picker lacks Online Following`);
    if (!source.includes("let rooms = mode === 'onlineFollowing' ? [...onlineFollowingRooms()] : [...store.state.rooms]")) {
      failures.push(`${item.file}: Split picker does not source Online Following rooms`);
    }
    if (!source.includes("if (!s.rooms.some(room => room.id === id) && !runtimeSplitRoomAvailable(id)) return false")) {
      failures.push(`${item.file}: Split state still rejects runtime Online Following rooms`);
    }
    if (!source.includes('const rooms = ids.map(findRoomAny).filter(Boolean)')) {
      failures.push(`${item.file}: Split renderer cannot resolve Online Following rooms`);
    }
    const cardOpsStart = source.indexOf('function openCardOpsMenu(');
    const cardOpsEnd = source.indexOf('function openMoveMenu(', cardOpsStart);
    const cardOpsSource = cardOpsStart >= 0 && cardOpsEnd > cardOpsStart ? source.slice(cardOpsStart, cardOpsEnd) : '';
    for (const key of ['opMirror', 'opFlip', 'opRotateLeft', 'opRotateRight', 'opResetView', 'opOpenRoom', 'opPiP']) {
      if (cardOpsSource.includes(`t('${key}')`)) failures.push(`${item.file}: removed Workshop card-menu action ${key} returned`);
    }
    if (source.includes("['openRoom', t('shortcutOpenRoom')]")) failures.push(`${item.file}: removed Workshop Open-room shortcut returned`);
    if (source.includes("const openBtn = mkOp('external'") || source.includes("const pipBtn = mkOp('pip'")) failures.push(`${item.file}: removed Workshop card quick action returned`);
    if (!source.includes("title: t('modelNameBackgroundTab')")) failures.push(`${item.file}: Workshop model-name background-tab hint is missing`);
    if (!source.includes("const RECORDER_OWNER_KEY = 'ziggy_recorder_owner_v1'")) failures.push(`${item.file}: Recorder Hub single-owner lease is missing`);
    if (!source.includes('let ownsRecorder = claimRecorderOwner(hubInstanceId)')) failures.push(`${item.file}: Recorder Hub owner claim is missing`);
    if (!source.includes('const visibleJobs = ownsRecorder ? jobs : UnifiedRecorder.recordings')) failures.push(`${item.file}: duplicate Recorder Hubs do not render the owner snapshot`);
    if (!source.includes("channel?.postMessage({ type: 'focus-hub'")) failures.push(`${item.file}: existing Recorder Hub focus/reuse request is missing`);
    if (!source.includes("status === 'offline' || status === 'reconnecting'")) failures.push(`${item.file}: recorder reconnects do not preserve the offline timeout`);
    if (!source.includes("['offline', 'reconnecting'].includes(jobs.get(job.id)?.sourceStatus)")) failures.push(`${item.file}: recorder offline timeout cannot stop reconnecting jobs`);
    if (!source.includes('function handleStorageFailure(job, error)')) failures.push(`${item.file}: recorder storage failure salvage path is missing`);
    if (!source.includes("finalizeJob(job, 'storage-error')")) failures.push(`${item.file}: storage failures do not automatically finalize partial recordings`);
    if (!source.includes("withTimeout(job.writeQueue, 20000")) failures.push(`${item.file}: recorder finalization write timeout is missing`);
    if (!source.includes("findDesktopNavigationSlot('private')")) failures.push(`${item.file}: desktop Workshop navigation does not replace Private Shows`);
    if (!source.includes("const WORKSHOP_TAB_TITLE = 'Ziggy Room Suite'")) failures.push(`${item.file}: unique Workshop tab title is missing`);
    if (!source.includes("function canonicalWorkshopUrl()")) failures.push(`${item.file}: canonical Workshop URL helper is missing`);
    if (!source.includes('ROOM_TAB_RESERVED_PATHS')) failures.push(`${item.file}: integrated model-room tab renamer is missing`);
    if (!source.includes('nativeColorCounts')) failures.push(`${item.file}: Workshop navigation does not inherit a normal native nav item`);
    if (!source.includes('document.body.classList.add(\'rg-control-drawer-open\')')) failures.push(`${item.file}: Workshop drawer scroll isolation is missing`);
    if (!source.includes('if (!isMobileDevice() || isBlockedPage()) return;')) failures.push(`${item.file}: Mobile Clean View still starts on blocked Workshop routes`);
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
