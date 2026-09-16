import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

// Exercise the shipped implementation, not a second copy of its selection policy.
// Fake native completion is driven by an explicit clock, never a real sleep.
const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' })
  : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const start = source.indexOf('  function createNativeRoomQualitySync() {');
const end = source.indexOf('  function initInjector(', start);
assert.ok(start >= 0 && end > start, 'extract the shipped normal-room default-quality owner');
const qualityCode = source.slice(start, end);
let checks = 0;
function test(name, run) {
  try { run(); checks++; }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
}

function fixture({ mobile = false, labels = [], currentSrc = 'blob:native-one', delay = 0 } = {}) {
  const clicks = [], pending = [];
  let now = 0, hostAvailable = true, videoAvailable = true;
  const state = { options: [], video: null };
  const host = { querySelectorAll(selector) {
    assert.ok(['[data-testid="quality-option"]', '#chat-player .vjs-menu-item'].includes(selector),
      `fixture requires an inspected native quality menu, received ${selector}`);
    return selector === (mobile ? '#chat-player .vjs-menu-item' : '[data-testid="quality-option"]') ? state.options : [];
  } };
  function newVideo(src = currentSrc) {
    return { currentSrc: src, closest(selector) {
      assert.equal(selector, '#TheaterModePlayer, #basePlayer, #VideoPanel');
      return hostAvailable ? host : null;
    } };
  }
  state.video = newVideo();
  function setLabels(next) {
    state.options = next.map(item => {
      const spec = typeof item === 'string' ? { label: item } : item;
      const attrs = { ...(spec.attrs || {}) }, classes = new Set(spec.classes || []);
      const option = {
        label: spec.label,
        // Video.js includes a separate selected/accessibility suffix outside its label node.
        textContent: spec.textContent ?? `${spec.label}${mobile ? ' selected' : ''}`,
        disabled: !!spec.disabled,
        style: { color: spec.color || '' },
        classList: { contains: name => classes.has(name) },
        getAttribute: name => attrs[name] ?? null,
        querySelector(selector) {
          assert.equal(selector, '.vjs-menu-item-text');
          return mobile && spec.labelNode !== false ? { textContent: spec.label } : null;
        },
        select() {
          for (const entry of state.options) {
            entry.style.color = '';
            entry.selected(false);
          }
          if (mobile) classes.add('vjs-selected');
          else option.style.color = 'rgb(255, 153, 0)';
          attrs['aria-checked'] = 'true';
        },
        selected(value) {
          attrs['aria-checked'] = String(value);
          if (value) classes.add('vjs-selected'); else classes.delete('vjs-selected');
        },
        click() {
          clicks.push(spec.label);
          if (spec.throws) throw Error('fixture native click failed');
          if (delay) pending.push({ at: now + delay, complete: () => option.select() });
          else option.select();
        },
      };
      return option;
    });
  }
  setLabels(labels);
  const document = { querySelector(selector) {
    assert.equal(selector, '#TheaterModePlayer video, #basePlayer video, #VideoPanel video',
      'only the normal-room native player is discovered, never Workshop/card videos');
    return videoAvailable ? state.video : null;
  } };
  const ctx = vm.createContext({ document, WeakMap });
  vm.runInContext(`${qualityCode}\nglobalThis.sync = createNativeRoomQualitySync();`, ctx);
  return {
    state, clicks, sync: ctx.sync, setLabels, newVideo,
    hostAvailable(value) { hostAvailable = value; },
    videoAvailable(value) { videoAvailable = value; },
    advance(ms) {
      now += ms;
      for (const job of pending.filter(job => job.at <= now)) {
        pending.splice(pending.indexOf(job), 1);
        job.complete();
      }
    },
  };
}

for (const mobile of [false, true]) {
  const platform = mobile ? 'mobile' : 'desktop';
  for (const [labels, expected] of [
    [['720p', '2160p', 'Auto', '1080p', '480p'], '1080p'],
    [['1440p', '480p', 'Auto', '720p'], '720p'],
    [['240p', '480p', '360p'], '480p'],
    [['160p', 'Auto'], '160p'],
    [['1080p60', '2160p60', '720p60'], '1080p60'],
    [['1080p 29.97 fps', '720p'], '1080p 29.97 fps'],
  ]) test(`${platform}: unordered ladder ${labels.join('/')}`, () => {
    const f = fixture({ mobile, labels });
    f.sync('room_one');
    assert.deepEqual(f.clicks, [expected]);
    for (let n = 0; n < 20; n++) f.sync('room_one');
    assert.deepEqual(f.clicks, [expected], 'reconciliation does not reselect a settled source');
  });

  test(`${platform}: delayed options remain eligible`, () => {
    const f = fixture({ mobile, labels: ['Auto'] });
    f.sync('room_one');
    assert.deepEqual(f.clicks, []);
    f.setLabels([]); f.sync('room_one');
    f.setLabels(['Auto', '720p', '1080p']); f.sync('room_one');
    assert.deepEqual(f.clicks, ['1080p']);
  });

  test(`${platform}: disabled labels are not selected`, () => {
    const f = fixture({ mobile, labels: [
      { label: '1080p', attrs: { 'aria-disabled': 'true' } },
      { label: '960p', disabled: true }, '720p', '480p',
    ] });
    f.sync('room_one');
    assert.deepEqual(f.clicks, ['720p']);
  });

  test(`${platform}: a completed default leaves subsequent manual lower quality alone`, () => {
    const f = fixture({ mobile, labels: ['1080p', '720p'] });
    f.sync('room_one');
    f.state.options[1].select();
    for (let n = 0; n < 30; n++) f.sync('room_one');
    assert.deepEqual(f.clicks, ['1080p']);
    assert.equal(f.state.options[1].getAttribute('aria-checked'), 'true');
  });

  test(`${platform}: new source and new player each receive the default once`, () => {
    const f = fixture({ mobile, labels: ['1080p', '720p'] });
    f.sync('room_one');
    f.state.options[1].select();
    f.state.video.currentSrc = 'blob:native-two';
    f.sync('room_two');
    f.state.options[1].select();
    f.state.video = f.newVideo('blob:native-three');
    f.sync('room_three');
    assert.deepEqual(f.clicks, ['1080p', '1080p', '1080p']);
  });

  test(`${platform}: route change waits while the previous source is still attached`, () => {
    const f = fixture({ mobile, labels: ['1080p', '720p'] });
    f.sync('room_one');
    f.state.options[1].select();
    f.sync('room_two');
    assert.deepEqual(f.clicks, ['1080p'], 'old room stream is not reselected during navigation');
    f.state.video.currentSrc = 'blob:room-two';
    f.sync('room_two');
    assert.deepEqual(f.clicks, ['1080p', '1080p']);
  });
}

for (const spec of [
  { label: '1080p', color: 'rgb(255, 153, 0)' },
  { label: '1080p', attrs: { 'aria-checked': 'true' } },
  { label: '1080p', classes: ['vjs-selected'] },
]) test('already-selected native indicators do not cause a duplicate click', () => {
  const f = fixture({ labels: [spec, '720p'] });
  f.sync('room_one');
  assert.deepEqual(f.clicks, []);
  f.state.options[1].select(); f.sync('room_one');
  assert.deepEqual(f.clicks, [], 'already-selected default still completes ownership');
});

test('native 100 ms completion cannot accumulate repeated selection callbacks', () => {
  const f = fixture({ labels: ['720p', '1080p', '2160p'], delay: 100 });
  f.sync('room_one');
  for (let elapsed = 0; elapsed < 100; elapsed++) { f.advance(1); f.sync('room_one'); }
  assert.deepEqual(f.clicks, ['1080p']);
  assert.equal(f.state.options[1].getAttribute('aria-checked'), 'true');
  f.setLabels([{ label: '1080p', color: 'rgb(255, 153, 0)' }, '720p']);
  f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p'], 'a native menu rebuild does not reset source ownership');
});

test('unknown and above-cap-only labels do not select Auto or guess a rendition', () => {
  const f = fixture({ labels: ['Auto', 'Source', '2160p', '1440p', '1920x1080', '1080p HDR', '1080px'] });
  for (let n = 0; n < 5; n++) f.sync('room_one');
  assert.deepEqual(f.clicks, []);
  f.setLabels(['720p', '1080p']); f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p'], 'unrecognized options must not permanently complete the owner');
});

test('absent room, video, source or native host does nothing and can recover', () => {
  const f = fixture({ labels: ['1080p'], currentSrc: '' });
  f.sync(null); f.sync(''); f.sync('room_one');
  f.state.video.currentSrc = 'blob:native-one';
  f.videoAvailable(false); f.sync('room_one');
  f.videoAvailable(true); f.hostAvailable(false); f.sync('room_one');
  assert.deepEqual(f.clicks, []);
  f.hostAvailable(true); f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p']);
});

test('a synchronously failed native click can retry on the next reconciliation', () => {
  const f = fixture({ labels: [{ label: '1080p', throws: true }] });
  f.sync('room_one');
  f.setLabels(['1080p']); f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p', '1080p']);
});

test('mobile accessibility selected suffix is not parsed as the quality label', () => {
  const f = fixture({ mobile: true, labels: [
    { label: '1080p', textContent: '1080p selected, quality level' }, '720p',
  ] });
  f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p']);
});

test('Workshop dispatch and context-only injector never create the room quality owner', () => {
  const bootStart = source.indexOf('  const isWorkstation = new URLSearchParams');
  const bootEnd = source.indexOf('  /* ===', bootStart);
  assert.ok(bootStart >= 0 && bootEnd > bootStart);
  const declaration = source.match(/const syncNativeRoomQuality = contextOnly \? \(\) => \{\} : createNativeRoomQualitySync\(\);/);
  assert.ok(declaration, 'context-only initialization remains explicitly inert');
  for (const workshop of [false, true]) for (const extension of [false, true]) {
    let owners = 0, invocations = 0, workstations = 0;
    const ctx = vm.createContext({
      URLSearchParams, location: { search: workshop ? '?multicam_mode=1' : '' },
      GM_info: { scriptHandler: extension ? 'Ziggy Extension Adapter' : 'Tampermonkey' },
      installFollowTracking() {}, resetNativeRoomEntryPreferences() {},
      isPhoneLikeDevice() { return false; }, installRoomRowScrolling() {},
      initWorkstation() { workstations++; },
      initInjector(options = {}) {
        const inner = vm.createContext({ contextOnly: options.contextOnly === true,
          createNativeRoomQualitySync() { owners++; return () => invocations++; } });
        vm.runInContext(`${declaration[0]} syncNativeRoomQuality('room_one');`, inner);
      },
    });
    vm.runInContext(source.slice(bootStart, bootEnd), ctx);
    assert.equal(workstations, Number(workshop));
    assert.equal(owners, Number(!workshop));
    assert.equal(invocations, Number(!workshop));
  }
});

test('quality is reconciled with room lifecycle and legacy positional chooser is absent', () => {
  const recalcStart = source.indexOf('    function recalcCurrentRoom() {');
  const recalcEnd = source.indexOf('    const recalcCurrentRoomSoon', recalcStart);
  assert.ok(recalcStart >= 0 && recalcEnd > recalcStart);
  assert.match(source.slice(recalcStart, recalcEnd), /syncNativeRoomQuality\(currentRoom\);/);
  assert.doesNotMatch(source, /\bsetres\s*\(/, 'legacy first-option selection cannot compete with the cap');
  assert.doesNotMatch(qualityCode, /(?:new Hls|\.src\s*=|\.currentSrc\s*=|\.style\.[a-zA-Z]+\s*=|requestFullscreen|addEventListener|setInterval|setTimeout)/,
    'selection adds no player, source/layout replacement or independent timer/listener lifetime');
});

console.log(`Native normal-room quality: ${checks} extracted-source checks passed (desktop/mobile ladders, 1080p cap, native async selection, source ownership, manual changes, Workshop exclusion).`);
