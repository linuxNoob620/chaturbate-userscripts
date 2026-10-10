import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  function enterDefaultDesktopTheaterOnce()');
const end = source.indexOf("  if (document.readyState === 'loading')", start);
assert(start >= 0 && end > start);
function fixture({ setting, workshop = false, room = true, mounted = true, visible = true, resize = true, corrupt = false } = {}) {
  let clicks = 0, raw = corrupt ? '{bad' : JSON.stringify({ settings: { defaultTheaterMode: setting } });
  const timers = [];
  const button = { getClientRects: () => visible ? [1] : [], click: () => clicks++ };
  const ctx = vm.createContext({ roomNameForTabTitle: () => room ? 'test' : '', isWorkshopRoute: () => workshop,
    STORE_KEY: 'test-store', localStorage: { getItem: () => raw },
    document: { getElementById: () => mounted ? button : null, querySelector: () => null,
      querySelectorAll: () => resize ? [{ getClientRects: () => [1] }] : [] },
    getComputedStyle: () => ({ display: 'block' }), setTimeout: callback => timers.push(callback) });
  vm.runInContext(source.slice(start, end) + ';enterDefaultDesktopTheaterOnce();', ctx);
  return { run() { let steps = 0; while (timers.length) { assert(++steps < 60); timers.shift()(); } },
    step() { timers.shift()?.(); }, mount() { mounted = true; },
    disable() { raw = JSON.stringify({ settings: { defaultTheaterMode: false } }); }, get clicks() { return clicks; } };
}
for (const setting of [undefined, true]) { const h = fixture({ setting }); h.run(); assert.equal(h.clicks, 1); }
for (const options of [{ setting: false }, { workshop: true }, { room: false }, { resize: false }, { mounted: false }, { corrupt: true }, { setting: false, visible: false, resize: false }]) {
  const h = fixture(options); h.run(); assert.equal(h.clicks, 0, JSON.stringify(options));
}
const h = fixture(); h.disable(); h.run(); assert.equal(h.clicks, 0, 'disabled while awaiting native controls');
const normal = fixture({ setting: false, resize: false }); normal.run();
assert.equal(normal.clicks, 1, 'Normal selection must exit a restored theatre layout on room load');
for (const setting of [true, false]) {
  const late = fixture({ setting, mounted: false, resize: setting });
  late.step(); late.mount(); late.run(); assert.equal(late.clicks, 1, 'late native control applies selection once');
  late.run(); assert.equal(late.clicks, 1, 'no continuing enforcement after the startup transition');
}
const changed = fixture({ resize: false }); changed.step(); changed.disable(); changed.run();
assert.equal(changed.clicks, 1, 'latest Normal preference is read while awaiting theatre state');
assert.match(source, /defaultTheaterMode: true/);
const panel = source.slice(source.indexOf('    function openPlaybackSettingsPanel()'), source.indexOf('    function openBackupPanel()'));
assert.match(panel, /theater.value = store.state.settings.defaultTheaterMode === false \? 'normal' : 'theatre'/);
assert.match(panel, /defaultTheaterMode: theater.value === 'theatre'/);
assert.match(panel, /if \(!store.flush\(\)\) return/);
console.log('Room layout: 14 behavior scenarios and settings wiring passed (synthetic, not live browser acceptance).');
