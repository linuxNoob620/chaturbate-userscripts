import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Retained implementation boundaries: ${start}`);
  return source.slice(from, to);
}

let passed = 0;
function check(name, action) { action(); passed += 1; console.log(`ok ${passed} - ${name}`); }

check('the two-row wheel interceptor and every installation reference are removed', () => {
  assert.doesNotMatch(source, /installRoomRowScrolling/);
  assert.doesNotMatch(source, /wheelDeltaY/);
  assert.doesNotMatch(source, /Math\.sign\(event\.deltaY\)\s*\*\s*pitch\s*\*\s*2/);
  assert.doesNotMatch(source, /scroller\.scrollTo\(\{\s*top:\s*next,\s*behavior:\s*['"]instant['"]/);
  assert.match(source, /installFollowTracking\(\);\s*if \(!isWorkstation\) resetNativeRoomEntryPreferences\(\);/);
});

const inputGuard = section('    function installWheelInputGuard() {', '    installWheelInputGuard();');
const cardZoom = section('    function installCardZoomHandlers(card, roomId) {', '    function rememberWorkshopPause(');

function wheelFixture({ freeZoom = true } = {}) {
  const documentHandlers = new Map();
  const cardHandlers = new Map();
  const patches = [];
  const store = { state: { settings: { freeZoom } } };
  const document = { addEventListener(name, callback, options) { documentHandlers.set(name, { callback, options }); } };
  const card = { addEventListener(name, callback, options) { cardHandlers.set(name, { callback, options }); } };
  const context = {
    document, card, store,
    getVideoTransform() { return { zoom: 2, x: 12, y: 24 }; },
    patchVideoTransform(roomId, patch) { patches.push({ roomId, patch }); },
  };
  vm.runInNewContext(`${inputGuard}\n${cardZoom}\ninstallWheelInputGuard(); installCardZoomHandlers(card, 'synthetic_model');`, context);
  return {
    patches, documentHandlers, cardHandlers,
    wheel(extra = {}, onCard = true) {
      const event = {
        target: { closest() { return null; } },
        deltaY: 100, deltaX: 0, deltaMode: 0, ctrlKey: false, metaKey: false,
        defaultPrevented: false, propagationStopped: false,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() { this.propagationStopped = true; },
        ...extra,
      };
      documentHandlers.get('wheel').callback(event);
      if (onCard && !event.propagationStopped) cardHandlers.get('wheel').callback(event);
      return event;
    },
  };
}

check('remaining wheel handlers leave ordinary page/grid scrolling native', () => {
  const fixture = wheelFixture();
  for (const surface of ['homepage', 'following dropdown', 'Workshop dropdown', 'full Workshop']) {
    for (const extra of [
      { deltaY: 100 }, { deltaY: -100 }, { deltaY: 3, deltaMode: 1 },
      { deltaY: 0.75 }, { deltaY: 45.5 }, { deltaY: 800, deltaMode: 2 },
      { deltaX: 20, deltaY: 0 }, { deltaX: 20, deltaY: 20 },
    ]) {
      const event = fixture.wheel(extra);
      assert.equal(event.defaultPrevented, false, `${surface}: ${JSON.stringify(extra)}`);
      assert.equal(event.propagationStopped, false, surface);
    }
  }
  assert.equal(fixture.patches.length, 0);
});

check('Ctrl/Command wheel card zoom remains scoped to cards', () => {
  for (const modifier of ['ctrlKey', 'metaKey']) {
    const fixture = wheelFixture();
    const pageEvent = fixture.wheel({ [modifier]: true }, false);
    assert.equal(pageEvent.defaultPrevented, false, 'native page/browser zoom is not intercepted');
    const cardEvent = fixture.wheel({ [modifier]: true, deltaY: -100 });
    assert.equal(cardEvent.defaultPrevented, true);
    assert.equal(fixture.patches.length, 1);
    assert.equal(fixture.patches[0].roomId, 'synthetic_model');
    assert.equal(fixture.patches[0].patch.zoom, 2.24);
    assert.equal(fixture.patches[0].patch.x, 12);
    assert.equal(fixture.patches[0].patch.y, 24);
  }
});

check('disabled card zoom leaves modified wheel events native', () => {
  const fixture = wheelFixture({ freeZoom: false });
  assert.equal(fixture.wheel({ ctrlKey: true }).defaultPrevented, false);
  assert.equal(fixture.wheel({ metaKey: true }).defaultPrevented, false);
  assert.equal(fixture.patches.length, 0);
});

check('existing range, number and select wheel-value protection remains intact', () => {
  for (const [tagName, type] of [['INPUT', 'range'], ['INPUT', 'number'], ['SELECT', '']]) {
    const fixture = wheelFixture();
    let blurred = false;
    const control = { tagName, getAttribute() { return type; }, closest() { return this; }, blur() { blurred = true; } };
    const event = fixture.wheel({ target: control });
    assert.equal(event.defaultPrevented, true);
    assert.equal(event.propagationStopped, true);
    assert.equal(blurred, true);
    assert.equal(fixture.patches.length, 0);
    assert.equal(fixture.documentHandlers.get('wheel').options.capture, true);
    assert.equal(fixture.documentHandlers.get('wheel').options.passive, false);
  }
});

check('text inputs are not intercepted by the wheel-value guard or card zoom', () => {
  const fixture = wheelFixture();
  const control = { tagName: 'INPUT', getAttribute() { return 'text'; }, closest() { return this; } };
  assert.equal(fixture.wheel({ target: control }).defaultPrevented, false);
  assert.equal(fixture.wheel({ target: control, ctrlKey: true }).defaultPrevented, false);
  assert.equal(fixture.patches.length, 0);
});

check('user wheel input still passively cancels initial room positioning without consuming scrolling', () => {
  const install = section('    if (!desktopInitialRoomPositionCancelled) {\n      desktopInitialRoomInputCancel = event => {', '    if (!contextOnly) {');
  const handlers = new Map();
  const controls = { cancellations: 0 };
  vm.runInNewContext(`
    let desktopInitialRoomPositioned = false, desktopInitialRoomPositionCancelled = false;
    let desktopInitialRoomInputCancel = null;
    function cancelDesktopInitialRoomPosition() { controls.cancellations += 1; desktopInitialRoomPositionCancelled = true; }
    ${install}
  `, {
    controls,
    document: { addEventListener(name, callback, options) { handlers.set(name, { callback, options }); } },
  });
  const wheel = handlers.get('wheel');
  assert.ok(wheel);
  assert.equal(wheel.options.passive, true);
  assert.equal(wheel.options.capture, true);
  let prevented = false;
  wheel.callback({ type: 'wheel', deltaY: 100, preventDefault() { prevented = true; } });
  assert.equal(controls.cancellations, 1);
  assert.equal(prevented, false);
});

console.log(`Natural room scrolling: ${passed} source/retained-handler checks passed; actual browser scrolling is separate acceptance.`);
