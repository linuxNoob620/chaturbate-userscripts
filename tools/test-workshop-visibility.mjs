import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' })
  : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const workshopStart = source.indexOf('  function initWorkstation() {');
const workshop = source.slice(workshopStart, source.indexOf('\n})();', workshopStart));
function section(start, end, text = workshop) {
  const a = text.indexOf(start), b = text.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `extract ${start}`);
  return text.slice(a, b);
}
const management = section('    const cardMap = new Map();', '    function removeParkedCardId(');
const attachment = section('    function attachVideoElement(', '    // ---- Grid');
const online = section("    EventBus.on('room:online'", "    EventBus.on('room:flash'");
let checks = 0;
function test(name, body) { body(); checks++; console.log(`ok ${checks} - ${name}`); }

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    fire(name, event = {}) { for (const fn of [...(listeners.get(name) || [])]) fn(event); },
    listeners,
  };
}
function rect(left, top, right, bottom) { return { left, top, right, bottom, width: right - left, height: bottom - top }; }
function fixture({ observer = true } = {}) {
  const rooms = new Map(), timers = new Map(), rafs = new Map(), calls = [], observers = [];
  let nextTimer = 0;
  const document = Object.assign(eventTarget(), { hidden: false, fullscreenElement: null, pictureInPictureElement: null });
  const window = eventTarget();
  const grid = Object.assign(eventTarget(), { rect: rect(0, 100, 800, 600), getBoundingClientRect() { return this.rect; }, contains(node) { return node.inGrid === true; } });
  function IntersectionObserver(fn, options) {
    const instance = { fn, options, observe() {}, unobserve() {} };
    observers.push(instance); return instance;
  }
  if (observer) window.IntersectionObserver = IntersectionObserver;
  const bus = { events: new Map(), on(name, fn) { this.events.set(name, fn); }, emit(name, value) { this.events.get(name)?.(value); } };
  const sessions = new Set();
  const service = {
    has: id => sessions.has(id),
    start(id) { sessions.add(id); calls.push(['start', id]); },
    startBackground(id) { sessions.add(id); calls.push(['background', id]); },
    promote(id) { calls.push(['promote', id]); },
    probe(id) { sessions.add(id); calls.push(['probe', id]); },
    stop(id) { sessions.delete(id); calls.push(['stop', id]); },
    detachVideo(id) { calls.push(['detach', id]); },
    attachVideo(id, video) { calls.push(['attach', id]); video.attached = true; },
    pause(id) { calls.push(['pause', id]); },
    startHls(id, url) { calls.push(['hls', id, url]); },
  };
  function videoNode(options) {
    return Object.assign(eventTarget(), {
      isConnected: true, paused: true, readyState: 0, currentTime: 0, autoplay: true, style: {},
      ...options, removeAttribute() {},
      pause() { this.paused = true; },
      play() { this.paused = false; calls.push(['play']); return Promise.resolve(); },
      remove() { this.isConnected = false; },
    });
  }
  const globals = {
    document, window, grid, innerWidth: 800, innerHeight: 600, IntersectionObserver,
    store: { state: { settings: { splitRoomIds: [], volume: .5 } } },
    findRoomAny: id => rooms.get(id), allRoomsForView: () => [...rooms.values()],
    normalizeUsername: x => String(x), service, EventBus: bus, workshopRefreshRoomIds: new Set(),
    workshopRefreshState: {}, resumeDeferredWorkshopRefreshes() {},
    setTimeout(fn, ms) { timers.set(++nextTimer, { fn, ms }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(fn) { rafs.set(++nextTimer, fn); return nextTimer; },
    cancelAnimationFrame(id) { rafs.delete(id); },
    stopMediaElement(video, remove) { calls.push(['stopMedia', video]); video.src = ''; video.pause(); if (remove) video.remove(); },
    renderCardState() {}, applyMute() {}, applyVideoTransform() {}, updateCardButtons() {},
    isHlsUrl: url => url.endsWith('.m3u8'),
    $(name, options) { assert.equal(name, 'video'); return videoNode(options); },
  };
  const api = vm.runInNewContext(`${management}\n${attachment}\n${online}\n({
    cardMap, mediaViewportIds, mediaAttachPendingIds, mediaRequestQueue, backgroundServiceQueue,
    shouldAttachRoomMedia, requestRoomMediaIfNeeded, requestRoomMediaNow, pumpRoomMediaQueue,
    queueBackgroundServiceStart, pumpBackgroundServiceQueue,
    suspendWorkshopMedia: typeof suspendWorkshopMedia === 'function' ? suspendWorkshopMedia : null,
    reconcileWorkshopMediaVisibility: typeof reconcileWorkshopMediaVisibility === 'function' ? reconcileWorkshopMediaVisibility : null,
    attachVideoElement, attachTemporarySource,
    scheduleWorkshopMediaVisibility: typeof scheduleWorkshopMediaVisibility === 'function' ? scheduleWorkshopMediaVisibility : null,
    releaseRoomMediaIfPossible, observeCardMedia
  })`, globals);
  const add = (id, { top = 150, left = 10, width = 300, height = 180, sourceUrl, video = false, muted = true } = {}) => {
    const room = { id, lastStatus: 'online', muted, ...(sourceUrl ? { sourceUrl } : {}) };
    rooms.set(id, room);
    const root = {
      isConnected: true, inGrid: true, rect: rect(left, top, left + width, top + height),
      getBoundingClientRect() { return this.rect; },
      contains(node) { return node === this || node === entry.video; },
      insertBefore(node) { node.isConnected = true; },
      dataset: { roomId: id },
    };
    const entry = { root, media: root, statusEl: {}, video: video ? videoNode({ paused: false, readyState: 3, currentTime: 1 }) : null };
    api.cardMap.set(id, entry);
    return entry;
  };
  const tickRaf = () => { const pending = [...rafs.values()]; rafs.clear(); pending.forEach(fn => fn()); };
  const tickTimers = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(({ fn }) => fn()); };
  return { api, globals, document, window, grid, rooms, add, calls, timers, rafs, sessions, observers, bus, tickRaf, tickTimers };
}

test('only actual visible card rectangles qualify, including unmuted/split cards', () => {
  const f = fixture(); f.add('visible'); f.add('below', { top: 650, muted: false }); f.add('beside', { left: 850 }); f.add('zero', { height: 0 });
  f.globals.store.state.settings.splitRoomIds = ['below'];
  f.api.mediaViewportIds.add('below');
  assert.equal(f.api.shouldAttachRoomMedia('visible'), true);
  for (const id of ['below', 'beside', 'zero']) assert.equal(f.api.shouldAttachRoomMedia(id), false, id);
  f.grid.rect = rect(0, 650, 800, 1000);
  assert.equal(f.api.shouldAttachRoomMedia('below'), false, 'scroll container outside actual viewport');
});

test('hidden documents reject visible geometry and queued media starts', () => {
  const f = fixture(); f.add('visible'); f.document.hidden = true;
  f.api.requestRoomMediaIfNeeded('visible'); f.api.requestRoomMediaNow('visible'); f.api.queueBackgroundServiceStart('visible');
  assert.equal(f.api.mediaRequestQueue.length, 0); assert.equal(f.api.backgroundServiceQueue.length, 0);
  assert.equal(f.calls.length, 0);
});

test('visibility teardown stops owned videos, temporary HLS and pending start queues', () => {
  const f = fixture(), playing = f.add('playing', { video: true }), paused = f.add('paused', { video: true });
  paused.video.paused = true;
  const temp = f.add('temp', { sourceUrl: 'https://example.com/a.m3u8', video: true });
  let destroyed = 0; temp.tempHls = { destroy() { destroyed++; } };
  f.add('queued'); f.api.requestRoomMediaIfNeeded('queued'); f.api.queueBackgroundServiceStart('background');
  f.api.scheduleWorkshopMediaVisibility();
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(playing.video, null); assert.equal(paused.video, null); assert.equal(temp.video, null);
  assert.equal(playing.visibilityPaused, false); assert.equal(paused.visibilityPaused, true);
  assert.equal(destroyed, 1); assert.equal(temp.tempHls, null);
  assert.equal(f.api.mediaRequestQueue.length, 0); assert.equal(f.api.backgroundServiceQueue.length, 0);
  assert.equal(f.timers.size, 0); assert.equal(f.rafs.size, 0);
  assert.ok(f.calls.some(c => c[0] === 'stop' && c[1] === 'playing'));
  assert.equal(f.calls.filter(c => c[0] === 'stopMedia').length, 3);
});

test('return only queues visible cards, without trusting stale intersection records', () => {
  const f = fixture(); f.add('visible'); f.add('offscreen', { top: 800 });
  f.document.hidden = true; f.document.fire('visibilitychange');
  f.document.hidden = false; f.document.fire('visibilitychange'); f.tickRaf();
  assert.deepEqual([...f.api.mediaRequestQueue], ['visible']);
  f.tickTimers(); assert.deepEqual(f.calls.filter(c => c[0] === 'start'), [['start', 'visible']]);
});

test('late room online events and direct attachments cannot start hidden media', () => {
  const f = fixture(); const entry = f.add('visible');
  f.document.hidden = true;
  f.bus.emit('room:online', { id: 'visible', hlsSource: 'https://example.com/a.m3u8' });
  assert.equal(f.api.attachVideoElement('visible'), null);
  assert.equal(entry.video, null);
  assert.equal(f.calls.some(c => c[0] === 'hls' || c[0] === 'attach'), false);
  f.document.hidden = false;
  f.bus.emit('room:online', { id: 'visible', hlsSource: 'https://example.com/a.m3u8' });
  assert.ok(entry.video); assert.equal(f.calls.filter(c => c[0] === 'hls').length, 1);
});

test('temporary direct sources wait for visibility and then attach normally', () => {
  const f = fixture(); const entry = f.add('temp', { sourceUrl: 'https://example.com/a.mp4' });
  f.document.hidden = true; f.api.attachTemporarySource(f.rooms.get('temp')); assert.equal(entry.video, null);
  f.document.hidden = false; f.api.attachTemporarySource(f.rooms.get('temp'));
  assert.equal(entry.video.src, 'https://example.com/a.mp4');
  assert.equal(f.calls.filter(c => c[0] === 'play').length, 1);
  assert.equal(f.calls.some(c => c[0] === 'attach'), false, 'temporary sources have no shared room-service session');
});

test('actual visible fullscreen survives observer geometry, but hidden fullscreen does not', () => {
  const f = fixture(); const entry = f.add('full', { top: 800, video: true });
  f.document.fullscreenElement = entry.root;
  assert.equal(f.api.shouldAttachRoomMedia('full'), true);
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.video, null);
});

test('only actual PiP survives hidden tab; leaving PiP stops it immediately', () => {
  const f = fixture(); const entry = f.add('pip'); f.api.attachVideoElement('pip');
  const video = entry.video; f.document.pictureInPictureElement = video;
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.video, video);
  f.document.pictureInPictureElement = null; video.fire('leavepictureinpicture');
  assert.equal(entry.video, null);
});

test('pagehide/BFCache suspends all owned media and pageshow restores visible-only work', () => {
  const f = fixture(); const entry = f.add('pip', { video: true }); f.document.pictureInPictureElement = entry.video;
  f.api.suspendWorkshopMedia(true); assert.equal(entry.video, null);
  f.api.requestRoomMediaIfNeeded('pip'); assert.equal(f.api.mediaRequestQueue.length, 0);
  f.document.pictureInPictureElement = null; f.window.fire('pageshow'); f.tickRaf();
  assert.deepEqual([...f.api.mediaRequestQueue], ['pip']);
});

test('paused preview state transfers once and does not override subsequent user resume', () => {
  const f = fixture(); const entry = f.add('paused', { video: true }); entry.video.paused = true;
  f.document.hidden = true; f.document.fire('visibilitychange'); f.document.hidden = false;
  f.api.attachVideoElement('paused'); assert.equal(entry.video.autoplay, false);
  assert.equal(Object.hasOwn(entry, 'visibilityPaused'), false);
  f.api.attachVideoElement('paused'); assert.equal(entry.video.autoplay, true);
  assert.equal(f.calls.filter(c => c[0] === 'pause').length, 1);
});

test('hide before the first autoplay frame does not become a permanent Pause', () => {
  const f = fixture(), entry = f.add('loading');
  f.api.attachVideoElement('loading');
  assert.equal(entry.video.paused, true, 'actual newly created HTMLVideoElement default');
  assert.equal(entry.video.readyState, 0);
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.visibilityPaused, false);
  f.document.hidden = false; f.api.attachVideoElement('loading');
  assert.equal(entry.video.autoplay, true);
  assert.equal(f.calls.filter(c => c[0] === 'pause').length, 0);
});

test('explicit Workshop Pause during preparation is retained despite having no first frame', () => {
  const f = fixture(), entry = f.add('loading'); f.api.attachVideoElement('loading');
  entry.pauseIntent = true;
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.visibilityPaused, true);
  f.document.hidden = false; f.api.attachVideoElement('loading');
  assert.equal(entry.video.autoplay, false); assert.equal(f.calls.filter(c => c[0] === 'pause').length, 1);
  entry.video.fire('play'); assert.equal(entry.pauseIntent, false);
});

test('decoded metadata without the first play event still resumes autoplay', () => {
  const f = fixture(), entry = f.add('loading'); f.api.attachVideoElement('loading');
  entry.video.readyState = 3;
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.visibilityPaused, false);
  f.document.hidden = false; f.api.attachVideoElement('loading'); assert.equal(entry.video.autoplay, true);
  entry.video.fire('play'); entry.video.paused = true;
  f.document.hidden = true; f.document.fire('visibilitychange');
  assert.equal(entry.visibilityPaused, true, 'native control pause after play is retained even at timestamp zero');
});

test('observer has zero preload margin and callbacks recheck actual page visibility', () => {
  const f = fixture(); const entry = f.add('visible');
  assert.equal(f.observers[0].options.rootMargin, '0px');
  f.document.hidden = true; f.observers[0].fn([{ target: entry.root, isIntersecting: true }]);
  assert.equal(f.api.mediaRequestQueue.length, 0);
});

test('no-IntersectionObserver fallback reconciles on scroll and resize without marking every card visible', () => {
  const f = fixture({ observer: false }); f.add('visible'); f.add('offscreen', { top: 800 });
  f.api.observeCardMedia('offscreen'); assert.equal(f.api.mediaViewportIds.has('offscreen'), false);
  f.grid.fire('scroll'); f.tickRaf(); assert.deepEqual([...f.api.mediaRequestQueue], ['visible']);
  f.window.fire('resize'); assert.equal(f.rafs.size, 1);
});

test('split layout starts media after the card is attached to its visible pane', () => {
  const split = section('    function renderSplitLayout()', '    function renderGrid()');
  const insertion = split.indexOf('grid.replaceChildren(');
  assert.ok(insertion >= 0 && split.indexOf('requestRoomMediaIfNeeded(room.id)', insertion) > insertion);
  assert.match(split.slice(insertion), /activateCardEntry\(room\.id\)/);
});

test('split-picker thumbnail requests/fallbacks are visibility-gated and ownership is disposed', () => {
  const picker = section('    function openSplitPicker(', '    function openSplitViewOrPicker(');
  const refresh = section('        function refreshPreview()', '        function openPreview(', picker);
  const error = section("        previewImage.addEventListener('error'", '        const bindLongPressPreview', picker);
  const cleanup = section('        const syncPreviewVisibility', '\n      });\n    }', picker);
  for (const body of [refresh, error]) {
    assert.match(body, /document\.hidden \|\| workshopPageSuspended \|\| !previewPanel\.isConnected/);
    assert.ok(body.indexOf('document.hidden') < body.indexOf('previewImage.src ='));
  }
  assert.match(cleanup, /previewImage\.removeAttribute\('src'\)/);
  for (const name of ['visibilitychange', 'pagehide', 'pageshow']) {
    assert.ok(cleanup.includes(`addEventListener('${name}', syncPreviewVisibility)`));
    assert.ok(cleanup.includes(`removeEventListener('${name}', syncPreviewVisibility)`));
  }
});

test('thumbnail hiding cancels the source/timer, suppresses late fallback and restarts once on return', () => {
  const picker = section('    function openSplitPicker(', '    function openSplitViewOrPicker(');
  const refresh = section('        function refreshPreview()', '        function openPreview(', picker);
  const error = section("        previewImage.addEventListener('error'", '        const bindLongPressPreview', picker);
  const sync = section('        const syncPreviewVisibility', "        document.addEventListener('visibilitychange'", picker);
  const document = { hidden: false }, timers = new Map(), requests = [], imageEvents = new Map();
  let timerId = 0;
  const image = {
    addEventListener(name, fn) { imageEvents.set(name, fn); },
    removeAttribute(name) { assert.equal(name, 'src'); this.cleared = true; },
    set src(value) { requests.push(value); this.cleared = false; },
  };
  const ctx = vm.createContext({
    document, workshopPageSuspended: false, previewRoom: { id: 'alpha', lastStatus: 'online' },
    previewPanel: { isConnected: true }, previewImage: image, previewTimer: 0, previewFallback: false,
    previewStatus: {}, statusMeta: status => ({ label: status }), t: key => key,
    splitPreviewSnapshotUrl: (id, fallback) => `${id}:${fallback}`,
    clearInterval: id => timers.delete(id),
    setInterval(fn) { timers.set(++timerId, fn); return timerId; },
  });
  const run = vm.runInContext(`${refresh}\n${error}\n${sync}\n({ sync: syncPreviewVisibility, refresh: refreshPreview })`, ctx);
  run.sync(); assert.equal(requests.length, 1); assert.equal(timers.size, 1);
  document.hidden = true; run.sync();
  assert.equal(timers.size, 0); assert.equal(image.cleared, true);
  run.refresh(); imageEvents.get('error')(); assert.equal(requests.length, 1, 'late fallback cannot fetch');
  document.hidden = false; run.sync(); assert.equal(requests.length, 2); assert.equal(timers.size, 1);
  ctx.workshopPageSuspended = true; run.sync();
  imageEvents.get('error')(); assert.equal(requests.length, 2); assert.equal(timers.size, 0);
});

async function asyncTest(name, body) { await body(); checks++; console.log(`ok ${checks} - ${name}`); }
const settle = () => new Promise(resolve => setImmediate(resolve));

await asyncTest('refresh workers stop admitting requests when their optional lifetime ends', async () => {
  const shared = section('    async function refreshMany(', '    function refreshAll()', source);
  const pending = [], progress = [];
  let allowed = true;
  const refreshMany = vm.runInNewContext(`${shared}\nrefreshMany`, {
    normalizeUsername: x => x, isLikelyUsername: () => true,
    clampInt: (value, min, max, fallback) => value === undefined ? fallback : Math.max(min, Math.min(max, value)),
    probe(id) { return new Promise(resolve => pending.push({ id, resolve })); },
    setTimeout,
  });
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const pass = refreshMany(ids, { shouldContinue: () => allowed, onProgress: result => progress.push(result) });
  assert.equal(pending.length, 4);
  allowed = false;
  pending.forEach(({ id, resolve }) => resolve({ id, status: 'aborted' }));
  const results = await pass;
  assert.equal(pending.length, 4, 'aborted current requests must not admit next IDs');
  assert.deepEqual(Array.from(results, result => result.status), ['aborted', 'aborted', 'aborted', 'aborted', 'cancelled', 'cancelled']);
  assert.equal(progress.length, 4, 'unrequested rooms are not reported completed');
  const hiddenPass = await refreshMany(ids, { shouldContinue: () => false });
  assert.equal(pending.length, 4, 'an initially cancelled batch issues no requests');
  assert.ok(hiddenPass.every(result => result.status === 'cancelled'));
});

function refreshLifecycleFixture(hidden = false) {
  const calls = [], messages = [];
  const state = { lastCompletedAt: 0 };
  const ctx = vm.createContext({
    console, Date, Set, Map, Promise, LANG: 'en', ONLINE_GROUP_ID: 'online',
    document: { hidden }, workshopPageSuspended: false, workshopRefreshState: state,
    workshopRefreshPromise: null, workshopRefreshRoomIds: new Set(), refreshAllBtn: {}, cardMap: new Map(),
    roomIdsForWorkshopRefresh: () => ['a', 'b'],
    service: { refreshMany(ids, options) { return new Promise(resolve => calls.push({ ids, options, resolve })); } },
    clearTimeout() {}, setTimeout() { return 1; }, scheduleSidebarRender() {},
    updateWorkshopRefreshUi() { messages.push(state.message); }, scheduleWorkshopSidebarCounts() {},
  });
  vm.runInContext(section('    async function refreshWorkshopRooms(', '    async function refreshAllSources('), ctx);
  return { ctx, calls, state, messages };
}

await asyncTest('background startup defers its full refresh until visible', async () => {
  const f = refreshLifecycleFixture(true);
  await f.ctx.refreshWorkshopRooms({ scope: 'all', automatic: true });
  assert.equal(f.calls.length, 0); assert.equal(f.state.lastCompletedAt, 0);
  assert.match(f.state.message, /paused/); assert.equal(f.state.deferred.has('all'), true);
  f.ctx.document.hidden = false; f.ctx.resumeDeferredWorkshopRefreshes();
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].options.shouldContinue(), true);
  f.calls[0].resolve([{ id: 'a', status: 'online' }, { id: 'b', status: 'offline' }]); await settle();
  assert.ok(f.state.lastCompletedAt > 0); assert.match(f.state.message, /Workshop refreshed/);
});

await asyncTest('rapid hide/show cannot resurrect an old refresh generation or claim premature completion', async () => {
  const f = refreshLifecycleFixture();
  const initial = f.ctx.refreshWorkshopRooms({ scope: 'all', force: true });
  f.ctx.document.hidden = true; f.state.generation = 1;
  assert.equal(f.calls[0].options.shouldContinue(), false);
  f.ctx.document.hidden = false;
  assert.equal(f.calls[0].options.shouldContinue(), false, 'same old worker must stay cancelled after return');
  f.calls[0].resolve([{ id: 'a', status: 'aborted' }, { id: 'b', status: 'cancelled' }]);
  await initial; await settle();
  assert.equal(f.calls.length, 2); assert.equal(f.state.lastCompletedAt, 0);
  assert.equal(f.messages.some(message => /Workshop refreshed/.test(message)), false);
  assert.equal(f.calls[1].options.shouldContinue(), true);
  f.calls[1].resolve([{ id: 'a', status: 'online' }, { id: 'b', status: 'offline' }]); await settle();
  assert.ok(f.state.lastCompletedAt > 0); assert.match(f.state.message, /Workshop refreshed/);
});

console.log(`Workshop visibility: ${checks} extracted-source checks passed. Browser visibility/network acceptance remains separate.`);
