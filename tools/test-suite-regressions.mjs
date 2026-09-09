import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'Chaturbate MultiCam Pro + Cam ARNA.user.js');
const source = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
const failures = [];

function requireText(text, message) {
  if (!source.includes(text)) failures.push(message);
}

function rejectText(text, message) {
  if (source.includes(text)) failures.push(message);
}

requireText("const FILE_INSTANCE_MARKER_ID = 'ziggy-chaturbate-suite-file-runtime'", 'file-wide cross-sandbox runtime owner is missing');
requireText("document.getElementById(LEGACY_INSTANCE_MARKER_ID)", 'file-wide guard does not block an older Suite runtime');
requireText('function refreshNativeLayoutMode()', 'dynamic desktop/mobile layout reconciliation is missing');
requireText('let nativeMobilePage = isNativeMobileSite()', 'layout state is still frozen at injector startup');
requireText('const stopRecorderNativeNode = node =>', 'Recorder Hub native media teardown is missing');
requireText('const disposeRecorderNativeChild = child =>', 'Recorder Hub native document pruning is missing');
requireText('child.remove();', 'Recorder Hub leaves the hidden native document mounted');
rejectText('child.hidden = true', 'Recorder Hub still hides the native document instead of pruning it');
requireText('let recorderPublishedEmptyState = false', 'Recorder Hub does not suppress redundant empty-state broadcasts');
requireText('const RECORDER_PROCESSED_COMMAND_LIMIT = 500', 'Recorder Hub command de-duplication history is unbounded');
requireText("window.addEventListener('pageshow', () => {", 'back-forward-cache state restoration is missing');
requireText('publishSuiteState();', 'Suite availability is not republished after page restoration');

rejectText('if (!document.hasFocus())', 'essential Suite startup is still gated on document focus');
rejectText('function legacyMoreoptions()', 'dead legacy Suite menu remains');
rejectText("$('option', { value: 'focus' }", 'Focus remains selectable in Workshop');
rejectText("setViewMode('focus')", 'Focus keyboard activation remains');
rejectText('function renderFocusLayout(', 'Focus renderer remains');
rejectText('function attachFocusResizerHandlers(', 'Focus resizing code remains');
rejectText('.grid.view-focus', 'Focus-only CSS remains');
rejectText('body.rg-focus-mode', 'Focus-only body state remains');
rejectText("'Reloaded Tools'", 'Reloaded is still presented as a separate tool');
rejectText("'Cam ARNA'", 'Cam ARNA is still presented as a separate tool');
rejectText("'Save Reloaded settings'", 'Reloaded-specific save wording remains');
rejectText("'Clear Reloaded settings'", 'Reloaded-specific clear wording remains');
rejectText('delete document.documentElement.dataset.ziggySuiteAvailable', 'pagehide can expose the legacy mobile launcher after bfcache restoration');
rejectText('`roomgrid-config-${Date.now()}.json`', 'local config download still exposes the retired RoomGrid name');
rejectText('`roomgrid-usernames-${Date.now()}.txt`', 'username export still exposes the retired RoomGrid name');

rejectText('ONLINE_FOLLOWING_GROUP_ID', 'Workshop still defines the removed Online Following group');
rejectText('function syncOnlineFollowing(', 'Workshop still runs the removed Online Following synchronizer');
rejectText('ziggy_online_following_cache', 'Workshop still persists the removed Online Following cache');
rejectText('ziggy-following-sync-frame', 'Workshop still creates the removed Following parser iframe');
rejectText('rg-following-pager', 'Workshop still contains the removed Online Following pager');
rejectText('splitOnlineFollowing', 'Split View still exposes the removed Online Following source');
requireText("g.id === 'online-following'", 'Legacy Online Following groups are not removed during state sanitization');
requireText("void refreshWorkshopRooms({ scope: 'all', automatic: true });", 'Workshop mount does not refresh saved-room status independently');
requireText('const visible = new Set(ids.filter(id => mediaViewportIds.has(id) || isCardNearViewport(id)))', 'Workshop refresh does not prioritize visible cards');
requireText('scheduleWorkshopSidebarCounts();', 'Workshop refresh still rebuilds the sidebar for every status response');
requireText('function openCardOpsMenu(e, roomId, card) {\n      const currentRoom = findRoomAny(roomId);', 'Workshop card menu does not resolve the selected saved room');
rejectText('currentRoom || followingRoom', 'Workshop card menu references the removed Following source');
requireText("card.addEventListener('auxclick', (event) => {", 'Workshop cards do not handle background middle-click opening');
requireText('openRoomPageInBackground(room.id);', 'Workshop model links do not use the shared background-tab path');
requireText('loadInBackground: options.active !== true', 'Room tabs do not pass the intended foreground/background state to Tampermonkey');
requireText('preferNativeMobileGroup: true', 'Android room tabs do not request the native mobile group path');
requireText("const EXTENSION_TAB_BRIDGE_MARKER_ID = 'ziggy-extension-tab-bridge'", 'The userscript cannot use the extension tab-group bridge');
requireText("return window.open(target.href, '_blank');", 'Tampermonkey lacks the native grouped-child fallback on Android');
rejectText("media.addEventListener('click', event => {", 'Phone Workshop video taps still open room tabs');
rejectText("media.addEventListener('dblclick', event => {", 'Phone Workshop media still suppresses the shared double-click fullscreen path');
requireText("card.addEventListener('dblclick', (e) => {", 'Workshop cards are missing the shared double-click fullscreen handler');
requireText('void toggleWorkshopNativeFullscreen(card);', 'Workshop double-click does not request native fullscreen');
requireText('openRoomPageInBackground(room.id, { active: phoneEnvironment });', 'Phone model-name taps do not request a foreground grouped room tab');
requireText("class: 'rg-sidebar-dismiss-backdrop'", 'Phone Workshop sidebar is missing its outside-tap dismiss layer');

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Suite lifecycle, unified identity, Recorder Hub, and Focus-removal regression checks passed.\n');
