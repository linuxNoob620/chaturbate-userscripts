import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  function openNativeMobileChildTab(');
const end = source.indexOf('  function safeFilePart(', start);
assert(start > 0 && end > start);
function fixture(ua, touch, coarse) {
  const native = [], gm = [];
  const context = vm.createContext({ URL, navigator: { userAgent: ua, maxTouchPoints: touch }, location: { href: 'https://chaturbate.com/?multicam_mode=1', origin: 'https://chaturbate.com' },
    window: { matchMedia: () => ({ matches: coarse }), open: (...args) => { native.push(args); return {}; } },
    safeChaturbateHost: host => host === 'chaturbate.com', openWithExtensionTabBridge: () => null,
    GM_openInTab: (...args) => { gm.push(args); return {}; }, openNoopener: () => { throw Error('unexpected fallback'); },
  });
  const open = vm.runInContext(source.slice(start, end) + ';openBackgroundTab', context);
  return { open, native, gm };
}
let count = 0;
function check(name, fn) { fn(); console.log('PASS ' + name); count++; }
const url = 'https://chaturbate.com/room_one/';
check('Quetta desktop user-agent uses native child navigation', () => {
  const f = fixture('Mozilla/5.0 (X11; Linux x86_64) Chrome/148.0.0.0', 5, true);
  f.open(url, { preferNativeMobileGroup: true }); assert.equal(f.native.length, 1); assert.equal(f.gm.length, 0);
  assert.deepEqual(f.native[0], [url, '_blank']);
});
check('Android mobile keeps the same native child path', () => {
  const f = fixture('Mozilla/5.0 (Linux; Android 10; K) Mobile', 5, true);
  f.open(url, { preferNativeMobileGroup: true }); assert.equal(f.native.length, 1); assert.equal(f.gm.length, 0);
});
check('desktop mouse browser retains background extension path', () => {
  const f = fixture('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0, false);
  f.open(url, { preferNativeMobileGroup: true }); assert.equal(f.gm.length, 1); assert.equal(f.native.length, 0); assert.equal(f.gm[0][1].active, false);
});
check('touchscreen with fine primary pointer does not change desktop policy', () => {
  const f = fixture('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 10, false);
  f.open(url, { preferNativeMobileGroup: true }); assert.equal(f.gm.length, 1);
});
check('archive/helper openings do not acquire room-navigation behavior', () => {
  const f = fixture('Android', 5, true); f.open(url); assert.equal(f.native.length, 0); assert.equal(f.gm.length, 1);
});
check('native child path remains same-origin HTTPS only', () => {
  const f = fixture('Android', 5, true);
  for (const target of ['https://recu.me/performer/room_one', 'http://chaturbate.com/room_one/']) f.open(target, { preferNativeMobileGroup: true });
  assert.equal(f.native.length, 0);
});
console.log(`${count} room-tab preference checks passed`);
