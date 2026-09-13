import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' })
  : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const start = source.indexOf('    function applyGridSize() {');
const end = source.indexOf('    function gridMetrics()', start);
assert.ok(start >= 0 && end > start, 'extract the shipped Workshop sizing function');

const style = { setProperty(name, value) { this[name] = value; } };
const settings = { splitViewActive: false, splitRatio: 65 };
const ctx = vm.createContext({
  grid: { style }, store: { state: { settings } }, phoneEnvironment: false,
  density: 4, layoutSize() { return ctx.density; },
  clampInt: (value, min, max) => Math.max(min, Math.min(max, value)),
});
vm.runInContext(source.slice(start, end), ctx);
for (const [density, min] of [[2, 604], [4, 302], [6, 240], [9, 200], [0, 302]]) {
  ctx.density = density;
  ctx.applyGridSize();
  assert.equal(style.gridTemplateColumns, `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`,
    `density ${density} follows available space and shrinks below the card minimum`);
  assert.equal(style.gridAutoRows, 'max-content');
  assert.equal(style.gridAutoFlow, 'row', 'preserve stable source order, not dense packing');
  assert.equal(style.overflowY, 'auto');
  const previous = JSON.stringify(style);
  ctx.applyGridSize();
  assert.equal(JSON.stringify(style), previous, 'repeated sizing remains stable');
}
ctx.phoneEnvironment = true;
ctx.applyGridSize();
assert.equal(style.gridTemplateColumns, 'repeat(auto-fill, minmax(min(100%, 174px), 1fr))',
  'phone adapts to available width instead of fixing portrait and landscape to two columns');
assert.match(source, /body\.rg-workshop-native\.rg-phone-device \.grid:not\(\.view-split\) \{ grid-template-columns:repeat\(auto-fill,minmax\(min\(100%,174px\),1fr\)\)!important;/,
  'mobile CSS must not override the adaptive inline template with fixed columns');
assert.equal(style.gap, '7px');
settings.splitViewActive = true;
ctx.applyGridSize();
assert.equal(style.gridTemplateColumns, '', 'Split View CSS still owns its tracks');
assert.equal(style['--split-ratio'], '65%');
assert.equal(style.overflow, 'hidden');
settings.splitViewActive = false;
ctx.phoneEnvironment = false;
ctx.density = 4;
ctx.applyGridSize();
assert.equal(style.gridTemplateColumns, 'repeat(auto-fill, minmax(min(100%, 302px), 1fr))',
  'leaving Split View restores adaptive tracks');
assert.equal(style.gap, '8px');
assert.equal(style.overflowY, 'auto');
console.log('Workshop adaptive-grid sizing checks passed (density, narrow-container clamp, phone, split transitions).');
