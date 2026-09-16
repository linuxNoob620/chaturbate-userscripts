import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  function installRoomRowScrolling() {');
const end = source.indexOf('  async function loadFollowingApiRooms(', start);
assert(start > 0 && end > start);

function fixture({ pitch = 190, columns = 2, nested = true } = {}) {
  let handler;
  const page = { scrollTop: 100, scrollHeight: 8000, clientHeight: 800, scrollTo({ top }) { this.scrollTop = top; } };
  const grid = { scrollTop: 0, scrollHeight: 2000, clientHeight: nested ? 500 : 2000, parentElement: {},
    scrollTo({ top }) { this.scrollTop = top; },
    children: Array.from({ length: columns * 4 }, (_, i) => ({ matches: () => true,
      getBoundingClientRect: () => ({ width: 250, height: pitch - 10, top: 80 + Math.floor(i / columns) * pitch }) })) };
  const document = { scrollingElement: page, body: grid.parentElement, documentElement: {},
    addEventListener(name, fn, opts) { assert.equal(name, 'wheel'); assert.equal(opts.passive, false); handler = fn; } };
  const target = { closest(selector) { return selector.startsWith('.RoomCardGrid') ? grid : null; } };
  vm.runInNewContext(source.slice(start, end) + '\ninstallRoomRowScrolling();', { document, getComputedStyle: () => ({ overflowY: 'auto' }) });
  return { page, grid, document, wheel(extra = {}) {
    const event = { target, cancelable: true, deltaMode: 0, deltaX: 0, deltaY: 100, wheelDeltaY: -120,
      preventDefault() { this.defaultPrevented = true; }, ...extra };
    handler(event); return event;
  } };
}

let passed = 0;
for (const columns of [2, 4, 8]) {
  const f = fixture({ columns }); assert(f.wheel().defaultPrevented); assert.equal(f.grid.scrollTop, 380);
  f.wheel({ deltaY: -100 }); assert.equal(f.grid.scrollTop, 0); passed++;
}
const native = fixture({ pitch: 340, columns: 4, nested: false });
native.wheel(); assert.equal(native.page.scrollTop, 780); passed++;
const resized = fixture({ pitch: 250 }); resized.wheel(); assert.equal(resized.grid.scrollTop, 500); passed++;
const line = fixture(); line.wheel({ deltaMode: 1, deltaY: 3, wheelDeltaY: undefined }); assert.equal(line.grid.scrollTop, 380); passed++;
const scaledWheel = fixture(); scaledWheel.wheel({ deltaY: 100.00000366797828 }); assert.equal(scaledWheel.grid.scrollTop, 380); passed++;
for (const extra of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { deltaX: 3 },
  { deltaY: 4 }, { deltaY: 45.5 }, { wheelDeltaY: 30 }, { deltaMode: 2 }, { defaultPrevented: true }, { cancelable: false },
  { target: { closest: () => null } }, { target: { isContentEditable: true } }, { target: { closest: () => ({}) } }]) {
  const f = fixture(); const event = f.wheel(extra);
  assert.equal(f.grid.scrollTop, 0, JSON.stringify(extra)); assert.equal(f.page.scrollTop, 100); passed++;
}
const fullscreen = fixture(); fullscreen.document.fullscreenElement = {}; fullscreen.wheel(); assert.equal(fullscreen.grid.scrollTop, 0); passed++;
const edge = fixture(); edge.grid.scrollTop = 1490; edge.wheel(); assert.equal(edge.grid.scrollTop, 1500);
assert(!edge.wheel().defaultPrevented); passed++;
const oneRow = fixture(); oneRow.grid.children.length = 2; assert(!oneRow.wheel().defaultPrevented); passed++;
console.log(`Room-row wheel scrolling: ${passed} extracted-source checks passed; actual browser geometry tested separately.`);
