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

function fixture({ mobile = false, labels = [], currentSrc = 'blob:native-one', delay = 0, startupHeight, rawSettings, nativeHls = false } = {}) {
  const clicks = [], pending = [], recoveryWrites = [];
  let now = 0, hostAvailable = true, videoAvailable = true;
  const state = { options: [], video: null };
  const host = { querySelectorAll(selector) {
    assert.ok(['[data-testid="quality-option"]', '#chat-player .vjs-menu-item'].includes(selector),
      `fixture requires an inspected native quality menu, received ${selector}`);
    return selector === (mobile ? '#chat-player .vjs-menu-item' : '[data-testid="quality-option"]') ? state.options : [];
  } };
  function newVideo(src = currentSrc) {
    return { currentSrc: src, videoHeight: 540, paused: false, ended: false, seeking: false, readyState: 4, closest(selector) {
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
  const document = { hidden: false, querySelector(selector) {
    assert.equal(selector, '#TheaterModePlayer video, #basePlayer video, #VideoPanel video',
      'only the normal-room native player is discovered, never Workshop/card videos');
    return videoAvailable ? state.video : null;
  } };
  let raw = rawSettings ?? JSON.stringify({ settings: { nativeRoomStartupHeight: startupHeight } });
  const hls = nativeHls ? { media: state.video, currentLevel: 0, manualLevel: -1, autoLevelEnabled: true,
    levels: [{ height: 540 }, { height: 720 }, { height: 1080 }],
    set loadLevel(value) { recoveryWrites.push(value); this.manualLevel = value; this.autoLevelEnabled = false; },
  } : null;
  const page = { hlsInstance: hls };
  const ctx = vm.createContext({ document, WeakMap, unsafeWindow: page, performance: { now: () => now }, STORE_KEY: 'fixture-store', localStorage: { getItem: () => raw } });
  vm.runInContext(`${qualityCode}\nglobalThis.sync = createNativeRoomQualitySync();`, ctx);
  return {
    state, clicks, hls, page, document, recoveryWrites, sync: ctx.sync, setLabels, newVideo,
    setStartupHeight(value) { raw = JSON.stringify({ settings: { nativeRoomStartupHeight: value } }); },
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
  for (const startupHeight of [240, 360, 480, 720, 1080]) test(`${platform}: configured ${startupHeight}p startup`, () => {
    const f = fixture({ mobile, startupHeight, labels: ['2160p', '1080p', '720p', '480p', '360p', '240p'] });
    f.sync('room_one');
    assert.deepEqual(f.clicks, [`${startupHeight}p`]);
    f.setStartupHeight(240); f.sync('room_one');
    assert.equal(f.clicks.length, 1, 'saving a startup preference does not override an already-owned source');
  });
  test(`${platform}: unavailable requested quality chooses highest lower rendition`, () => {
    const f = fixture({ mobile, startupHeight: 720, labels: ['1080p', '540p', '360p'] });
    f.sync('room_one'); assert.deepEqual(f.clicks, ['540p']);
  });
  test(`${platform}: latest preference is read when delayed options become available`, () => {
    const f = fixture({ mobile, labels: ['Auto'] });
    f.sync('room_one'); f.setStartupHeight(480); f.setLabels(['1080p', '720p', '480p']);
    f.sync('room_one'); assert.deepEqual(f.clicks, ['480p']);
  });
  for (const startupHeight of [0, 1440, 2160, -1, 'invalid', null]) test(`${platform}: invalid cap falls back to 1080p`, () => {
    const f = fixture({ mobile, startupHeight, labels: ['2160p', '1080p', '720p'] });
    f.sync('room_one'); assert.deepEqual(f.clicks, ['1080p']);
  });
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

test('unreadable settings retain the existing default without breaking playback', () => {
  const f = fixture({ rawSettings: '{bad', labels: ['1080p', '720p'] });
  f.sync('room_one'); assert.deepEqual(f.clicks, ['1080p']);
});

test('mobile accessibility selected suffix is not parsed as the quality label', () => {
  const f = fixture({ mobile: true, labels: [
    { label: '1080p', textContent: '1080p selected, quality level' }, '720p',
  ] });
  f.sync('room_one');
  assert.deepEqual(f.clicks, ['1080p']);
});

test('fixed 1080p label with an automatic 540p fallback is recovered without a menu/source reload', () => {
  const f = fixture({ nativeHls: true, labels: [{ label: '1080p', color: 'orange' }, '720p', 'Auto'] });
  f.sync('room_one'); f.advance(1000); f.sync('room_one');
  f.advance(4999); f.sync('room_one'); assert.deepEqual(f.recoveryWrites, []);
  f.advance(1); f.sync('room_one'); assert.deepEqual(f.recoveryWrites, [2]);
  assert.deepEqual(f.clicks, [], 'recovery does not toggle an intermediate quality');
  assert.equal(f.state.video.currentSrc, 'blob:native-one');
  for (let i = 0; i < 20; i++) { f.advance(1000); f.sync('room_one'); }
  assert.deepEqual(f.recoveryWrites, [2], 'settled manual playback is not repeatedly forced');
});

test('recovery follows the current manually selected lower quality, not the startup default', () => {
  const f = fixture({ nativeHls: true, labels: [{ label: '1080p', color: 'orange' }, '720p', 'Auto'] });
  f.sync('room_one'); f.state.options[1].select();
  f.advance(1000); f.sync('room_one'); f.advance(5000); f.sync('room_one');
  assert.deepEqual(f.recoveryWrites, [1]);
});

for (const mode of ['auto', 'manual', 'correct-level', 'correct-height', 'hidden', 'paused', 'ended', 'seeking', 'buffering', 'other-media', 'other-room', 'missing-hls', 'missing-level', 'mobile-menu']) test(`recovery leaves ${mode} alone`, () => {
  const f = fixture({ nativeHls: true, mobile: mode === 'mobile-menu', labels: [{ label: '1080p', color: 'orange' }, '720p', 'Auto'] });
  f.sync('room_one');
  if (mode === 'auto') f.state.options[2].select();
  if (mode === 'manual') { f.hls.manualLevel = 1; f.hls.autoLevelEnabled = false; }
  if (mode === 'correct-level') f.hls.currentLevel = 2;
  if (mode === 'correct-height') f.state.video.videoHeight = 1080;
  if (mode === 'hidden') f.document.hidden = true;
  if (['paused', 'ended', 'seeking'].includes(mode)) f.state.video[mode] = true;
  if (mode === 'buffering') f.state.video.readyState = 2;
  if (mode === 'other-media') f.hls.media = {};
  if (mode === 'missing-hls') f.page.hlsInstance = null;
  if (mode === 'missing-level') f.hls.levels.pop();
  for (let i = 0; i < 20; i++) { f.advance(1000); f.sync(mode === 'other-room' ? 'room_two' : 'room_one'); }
  assert.deepEqual(f.recoveryWrites, []);
});

test('persistent failures are bounded to two recoveries per source, with a 30-second cooldown', () => {
  const f = fixture({ nativeHls: true, labels: [{ label: '1080p', color: 'orange' }, '720p', 'Auto'] });
  f.sync('room_one');
  for (let i = 0; i < 100; i++) {
    f.hls.manualLevel = -1; f.hls.autoLevelEnabled = true;
    f.advance(1000); f.sync('room_one');
    if (i < 35) assert.ok(f.recoveryWrites.length <= 1, 'no immediate retry loop');
  }
  assert.deepEqual(f.recoveryWrites, [2, 2]);
});

test('interrupted mismatch observation restarts the grace period and new sources get their own budget', () => {
  const f = fixture({ nativeHls: true, labels: [{ label: '1080p', color: 'orange' }, '720p', 'Auto'] });
  f.sync('room_one'); f.advance(1000); f.sync('room_one'); f.advance(4000); f.sync('room_one');
  f.document.hidden = true; f.sync('room_one'); f.advance(10000);
  f.document.hidden = false; f.sync('room_one'); f.advance(4999); f.sync('room_one');
  assert.deepEqual(f.recoveryWrites, []);
  f.advance(1); f.sync('room_one'); assert.deepEqual(f.recoveryWrites, [2]);
  f.state.video.currentSrc = 'blob:new-source'; f.hls.manualLevel = -1; f.hls.autoLevelEnabled = true;
  f.sync('room_one'); f.advance(1); f.sync('room_one'); f.advance(5000); f.sync('room_one');
  assert.deepEqual(f.recoveryWrites, [2, 2], 'new source is not delayed by the old source cooldown');
});

test('throwing page-owned HLS access is contained and throwing writes consume the bounded budget', () => {
  const f = fixture({ nativeHls: true, labels: [{ label: '1080p', color: 'orange' }, '720p'] });
  f.sync('room_one');
  Object.defineProperty(f.page, 'hlsInstance', { get() { throw Error('page bridge unavailable'); }, configurable: true });
  f.advance(1000); assert.doesNotThrow(() => f.sync('room_one'));
  Object.defineProperty(f.page, 'hlsInstance', { value: f.hls });
  let attempts = 0;
  Object.defineProperty(f.hls, 'loadLevel', { set() { attempts++; throw Error('obsolete player'); } });
  for (let i = 0; i < 100; i++) { f.advance(1000); assert.doesNotThrow(() => f.sync('room_one')); }
  assert.equal(attempts, 2);
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
