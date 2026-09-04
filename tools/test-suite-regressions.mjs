import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'Chaturbate MultiCam Pro + Cam ARNA.user.js');
const source = await readFile(file, 'utf8');
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

requireText("onlineFollowingSortBy: 'name'", 'Online Following does not have an independent persisted sort mode');
requireText("['viewers', t('sortViewers')]", 'Online Following is missing the Most viewers choice');
requireText('function parseFollowingViewerCount(card)', 'Following-page viewer counts are not parsed');
requireText('[data-testid*="viewer" i], .viewers, [class*="ViewerCount"]', 'Following-page viewer parsing does not recognize the current Chaturbate .viewers markup');
requireText("const card = anchor.closest('[data-testid=\"room-card\"]')\n          || anchor.closest('li,article", 'Following parsing can stop at the RoomCardThumbnail link instead of the complete room card');
requireText("if (!firstRooms.length) {\n        firstRooms = await loadRenderedOnlineFollowing(firstUrl);", 'Following sync does not fall back when Chaturbate server-renders an empty hydrated container');
requireText("if (!rooms.length) {\n          try { rooms = await loadRenderedOnlineFollowing(pageUrl.href); } catch (_) {}", 'Following sync does not render later hydrated pages when their HTML contains no cards');
requireText('function compareOnlineFollowingRooms(a, b, mode = store.state.settings.onlineFollowingSortBy)', 'Online Following snapshot sorting is missing');
requireText('function resortOnlineFollowingRooms()', 'Online Following cannot explicitly reapply its selected stable order');
requireText('applyOnlineFollowingRooms(followed, { preserveMissing: !result.complete, resort })', 'Following sync does not distinguish stable automatic updates from explicit resorting');
requireText('void syncOnlineFollowing(true, true);', 'Workshop mount does not refresh Online Following in the background');
requireText("void refreshWorkshopRooms({ scope: 'all', automatic: true });", 'Workshop mount does not refresh saved-room status independently');
requireText("card.addEventListener('auxclick', (event) => {", 'Workshop cards do not handle background middle-click opening');
requireText('openRoomPageInBackground(room.id);', 'Workshop model links do not use the shared background-tab path');
requireText('loadInBackground: true', 'Background room tabs do not include the Tampermonkey compatibility flag');
requireText("class: 'rg-sidebar-dismiss-backdrop'", 'Phone Workshop sidebar is missing its outside-tap dismiss layer');

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Suite lifecycle, unified identity, Recorder Hub, and Focus-removal regression checks passed.\n');
