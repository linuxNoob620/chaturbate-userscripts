import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  function enterDefaultDesktopTheaterOnce()');
const end = source.indexOf("  if (document.readyState === 'loading')", start);
assert(start >= 0 && end > start);
function fixture({ setting, workshop = false, room = true, mounted = true, resize = true, corrupt = false } = {}) {
  let clicks = 0, raw = corrupt ? '{bad' : JSON.stringify({ settings: { defaultTheaterMode: setting } });
  const timers = [];
  const button = { getClientRects: () => [1], click: () => clicks++ };
  const ctx = vm.createContext({ roomNameForTabTitle: () => room ? 'test' : '', isWorkshopRoute: () => workshop,
    STORE_KEY: 'test-store', localStorage: { getItem: () => raw },
    document: { getElementById: () => mounted ? button : null, querySelector: () => null,
      querySelectorAll: () => resize ? [{ getClientRects: () => [1] }] : [] },
    getComputedStyle: () => ({ display: 'block' }), setTimeout: callback => timers.push(callback) });
  vm.runInContext(source.slice(start, end) + ';enterDefaultDesktopTheaterOnce();', ctx);
  return { run() { let steps = 0; while (timers.length) { assert(++steps < 60); timers.shift()(); } },
    disable() { raw = JSON.stringify({ settings: { defaultTheaterMode: false } }); }, get clicks() { return clicks; } };
}
for (const setting of [undefined, true]) { const h = fixture({ setting }); h.run(); assert.equal(h.clicks, 1); }
for (const options of [{ setting: false }, { workshop: true }, { room: false }, { resize: false }, { mounted: false }, { corrupt: true }]) {
  const h = fixture(options); h.run(); assert.equal(h.clicks, 0, JSON.stringify(options));
}
const h = fixture(); h.disable(); h.run(); assert.equal(h.clicks, 0, 'disabled while awaiting native controls');
assert.match(source, /defaultTheaterMode: true/);
const panel = source.slice(source.indexOf('    function openPlaybackSettingsPanel()'), source.indexOf('    function openBackupPanel()'));
assert.match(panel, /checked: store.state.settings.defaultTheaterMode !== false/);
assert.match(panel, /defaultTheaterMode: !!theater.checked/);
assert.match(panel, /if \(!store.flush\(\)\) return/);
console.log('Theatre default: 9 behavior cases and settings wiring passed (synthetic, not live browser acceptance).');
