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
requireText("child.inert = true", 'Recorder Hub native shell is not made inert');
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

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('Suite lifecycle, unified identity, Recorder Hub, and Focus-removal regression checks passed.\n');
