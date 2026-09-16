import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// These are deterministic extracted-production tests, not live-browser/UI proof.
// Only browser/library boundaries are faked; lifecycle and parsing logic below
// comes from the distributed player source. No requests, storage or tabs escape.
const path = new URL('../standalone/recu-responsive/player.js', import.meta.url);
const source = readFileSync(path, 'utf8');
assert.match(source, /\brrpBoot\(\);\s*$/);
const exported = source.replace(/\brrpBoot\(\);\s*$/, `
globalThis.testPlayer = { RRPPlayer, rrpBoot, rrpRoute, rrpSource, rrpTime,
  rrpSnapshot, rrpOriginalURL, RRP_CSS };
globalThis.replacePlayerForBootTest = value => { RRPPlayer = value; };
`);
const route = '/example/video/123/play/';
const now = 1800000000000;
const plain = value => JSON.parse(JSON.stringify(value));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const eventSurfaces = new WeakMap();

function harness(options = {}) {
  const timers = new Map(), observers = [], engines = [], overlays = [], boards = [], transports = [];
  const actions = [];
  let timerId = 0, elapsed = 0, nativeVideo;

  class Target {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, handler, opts = {}) {
      if (opts.signal?.aborted) return;
      const record = { handler, once: !!opts.once, capture: !!opts.capture, signal: opts.signal };
      const records = this.listeners.get(type) || [];
      records.push(record); this.listeners.set(type, records);
      opts.signal?.addEventListener('abort', () => this.removeEventListener(type, handler), { once: true });
    }
    removeEventListener(type, handler) {
      this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item.handler !== handler));
    }
    emit(type, fields = {}, options = {}) {
      const results = [], event = { type, target: this, ...fields };
      for (const record of [...(this.listeners.get(type) || [])]) {
        if (record.signal?.aborted) continue;
        if (typeof options.capture === 'boolean' && record.capture !== options.capture) continue;
        if (record.once) this.removeEventListener(type, record.handler);
        results.push(record.handler(event));
      }
      return results;
    }
    listenerCount(type) { return (this.listeners.get(type) || []).length; }
  }
  class AbortController {
    constructor() { this.signal = new Target(); this.signal.aborted = false; }
    abort() { if (!this.signal.aborted) { this.signal.aborted = true; this.signal.emit('abort'); } }
  }
  class Node extends Target {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
      this.dataset = {}; this.attributes = new Map(); this.hidden = false; this.disabled = false;
      this.textContent = ''; this.className = ''; this.hover = false; this.focusVisible = false;
      this.classList = {
        contains: value => this.className.split(/\s+/).includes(value),
        add: value => { if (!this.classList.contains(value)) this.className = `${this.className} ${value}`.trim(); },
        remove: value => { this.className = this.className.split(/\s+/).filter(x => x !== value).join(' '); },
      };
      const properties = new Map();
      this.style = { setProperty: (name, value, priority = '') => properties.set(name, { value, priority }),
        removeProperty: name => properties.delete(name), getPropertyValue: name => properties.get(name)?.value || '',
        getPropertyPriority: name => properties.get(name)?.priority || '' };
      if (tag === 'video') {
        this.currentTime = 0; this.duration = NaN; this.readyState = 0; this.paused = true;
        this.muted = false; this.volume = 1; this.playbackRate = 1; this.seeking = false;
        this.playCalls = 0; this.pauseCalls = 0; this.frames = new Map(); this.frameId = 0;
      }
      if (tag === 'canvas') this.context = { drawImage() {}, clearRect() {} };
    }
    get isConnected() { return this.tagName === 'BODY' || !!this.parentNode?.isConnected || !!this.host?.isConnected; }
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
      if (name === 'class') this.className = String(value);
      else if (name === 'hidden') this.hidden = true;
      else if (name.startsWith('data-')) this.dataset[name.slice(5)] = String(value);
      else this[name] = String(value);
    }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    append(...nodes) { for (const node of nodes) { node.remove(); node.parentNode = this; this.children.push(node); } }
    prepend(...nodes) { for (const node of nodes.reverse()) { node.remove(); node.parentNode = this; this.children.unshift(node); } }
    before(node) {
      assert(this.parentNode, 'fixture insertion requires a connected native host');
      node.remove(); node.parentNode = this.parentNode;
      this.parentNode.children.splice(this.parentNode.children.indexOf(this), 0, node);
    }
    remove() {
      if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
      this.parentNode = null;
    }
    attachShadow() { this.shadowRoot = new Node('shadow'); this.shadowRoot.host = this; return this.shadowRoot; }
    matches(selector) {
      if (selector === ':hover') return this.hover;
      if (selector === ':focus-visible') return this.focusVisible;
      if (selector.includes(',')) return selector.split(',').some(part => this.matches(part));
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      const attribute = /^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);
      if (attribute) return this.attributes.has(attribute[1]) &&
        (attribute[2] === undefined || this.attributes.get(attribute[1]) === attribute[2]);
      const [tag, className] = selector.split('.');
      return (!tag || this.tagName.toLowerCase() === tag) && (!className || this.classList.contains(className));
    }
    closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest(selector) || null; }
    querySelectorAll(selector) {
      return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    getBoundingClientRect() { return { left: 0, width: 500, height: 20 }; }
    getContext() { return this.context; }
    focus(options) {
      this.focusCalls = (this.focusCalls || 0) + 1; this.focusOptions = options;
      let root = this; while (root.parentNode) root = root.parentNode;
      if (root.host) { root.activeElement = this; document.activeElement = root.host; }
      else document.activeElement = this;
    }
    pause() { this.paused = true; this.pauseCalls++; actions.push('video.pause'); }
    play() { this.paused = false; this.playCalls++; actions.push('video.play'); return Promise.resolve(); }
    requestVideoFrameCallback(callback) { const id = ++this.frameId; this.frames.set(id, callback); return id; }
    cancelVideoFrameCallback(id) { this.frames.delete(id); }
  }
  const body = new Node('body'), nativeHost = new Node('div'), nativeSurface = new Node('div');
  nativeSurface.className = 'video-content-wrapper'; nativeSurface.setAttribute('data-run', options.nativeRun ?? 'on');
  nativeHost.id = 'plyr_container'; nativeSurface.append(nativeHost); body.append(nativeSurface);
  function makeVideo(extra = {}) {
    const video = new Node('video'); video.className = 'video-player';
    video.readyState = 1; video.duration = 600; video.currentTime = 35;
    const sourceNode = new Node('source'); sourceNode.src = 'https://media.example/recording/master.m3u8?session=private';
    video.append(sourceNode);
    video.plyr = { config: { keyboard: { global: true, focused: true } }, pause: () => video.pause(),
      previewThumbnails: { thumbnails: [{ frames: options.frames || [] }] } };
    Object.assign(video, extra); return video;
  }
  nativeVideo = makeVideo(options.video); nativeHost.append(nativeVideo);
  const document = new Target();
  Object.assign(document, { body, createElement: tag => new Node(tag),
    getElementById: id => body.querySelector(`#${id}`),
    querySelector: selector => selector === '#plyr_container video.video-player'
      ? nativeVideo.isConnected ? nativeVideo : null : body.querySelector(selector) });
  const window = new Target(); window.top = window.self = window;
  if (options.iframe) window.top = {};
  window.Hls = {};
  window.timeline = { hls: { media: nativeVideo, levels: options.levels || [{ height: 720 }, { height: 1080 }, { height: 2160 }] },
    destroy() { actions.push('timeline.destroy'); } };
  window.autoplay = { clearPrefetch() { actions.push('autoplay.clearPrefetch'); }, pause() { actions.push('autoplay.pause'); } };
  const location = { origin: 'https://recu.me', pathname: options.route || route,
    href: options.href || `https://recu.me${options.route || route}`, assigned: [],
    assign(url) { this.assigned.push(url); actions.push('location.assign'); },
    reloads: 0, reload() { this.reloads++; actions.push('reload'); } };
  const history = { state: { native: 'preserved' }, replacements: [],
    replaceState(state, title, url) {
      this.replacements.push({ state, title, url }); location.href = url; actions.push('history.replaceState');
    } };
  class Engine extends Target {
    static isBrowserSupported() { return options.supported !== false; }
    constructor() {
      super(); this.attachGate = deferred(); this.loadGate = deferred(); this.destroyCalls = 0;
      this.configurations = []; this.selections = [];
      this.tracks = (options.tracks || [720, 1080, 2160].map((height, id) => ({ id, height, bandwidth: height * 1000 })))
        .map(track => ({ ...track })); engines.push(this);
    }
    attach(video) { this.video = video; actions.push('engine.attach'); return options.deferAttach ? this.attachGate.promise : Promise.resolve(); }
    configure(config) {
      this.configurations.push(config); actions.push('engine.configure');
      this.config = { ...this.config, ...config, abr: { ...this.config?.abr, ...config.abr,
        restrictions: { ...this.config?.abr?.restrictions, ...config.abr?.restrictions } } };
    }
    getVideoTracks() { return this.tracks; }
    selectVideoTrack(track, clearBuffer) {
      this.selections.push({ track, clearBuffer }); actions.push('engine.selectVideoTrack');
      for (const item of this.tracks) item.active = item === track;
    }
    load(url, time, mime) {
      this.loadArgs = { url, time, mime }; actions.push('engine.load');
      this.video.currentTime = time; this.video.duration = 600; this.video.readyState = 4;
      return options.deferLoad ? this.loadGate.promise : Promise.resolve();
    }
    destroy() { this.destroyCalls++; actions.push('engine.destroy'); return Promise.resolve(); }
  }
  class Overlay {
    constructor(engine, stage, video) {
      this.engine = engine; this.stage = stage; this.video = video; this.destroyCalls = 0;
      const controls = new Node('div'), seekHost = new Node('div'), seek = new Node('input');
      controls.className = 'shaka-controls-container'; seekHost.className = 'shaka-seek-bar-container';
      seek.className = 'shaka-seek-bar';
      const menus = ['shaka-overflow-menu', 'shaka-sub-menu', 'shaka-context-menu'].map(className => {
        const menu = new Node('div'); menu.className = `${className} shaka-hidden`; return menu;
      });
      seekHost.append(seek); controls.append(seekHost, ...menus); stage.append(controls); overlays.push(this);
    }
    configure(config) { this.config = config; }
    async destroy() { this.destroyCalls++; await this.engine.destroy(); }
  }
  class Storyboards {
    constructor(config) { this.config = config; this.disposeCalls = 0; this.prepared = [];
      this.state = { ready: 0, total: 2, failed: 0 }; boards.push(this); }
    prepare(time) { this.prepared.push(time); }
    get() { return null; }
    status() { return this.state; }
    change(state) { this.state = state; this.config.onChange(); }
    dispose() { this.disposeCalls++; }
  }
  class Transport {
    constructor(config) { this.config = config; this.disposeCalls = 0; this.disposeGate = deferred(); transports.push(this); }
    install() { actions.push('transport.install'); }
    dispose() { this.disposeCalls++; actions.push('transport.dispose'); return options.deferTransportDispose ? this.disposeGate.promise : Promise.resolve(); }
  }
  class Clock extends Date { static now() { return now + elapsed; } }
  const context = vm.createContext({ URL, Date: Clock, AbortController, Error, performance: { now: () => 10 + elapsed },
    document, window, location, history, RRP_SK: { Player: Engine, ui: { Overlay } }, RRPStoryboards: Storyboards,
    RRPSegmentTransport: Transport, RRP_BUILD: 'fixture', RRP_SH_CSS: options.css ?? `:root { --test: 1; }${' '.repeat(1100)}`,
    activeStreamCleanup() { actions.push('native.cleanup'); window.timeline.hls.media = null; },
    sessionStorage: new Proxy({}, { get() { actions.push('storage.access'); throw new Error('Player must not use session storage.'); } }),
    setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay, due: elapsed + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.connected = false; observers.push(this); }
      observe() { this.connected = true; }
      disconnect() { this.connected = false; }
    },
  });
  vm.runInContext(exported, context, { filename: path.pathname });
  const api = context.testPlayer;
  const host = () => document.getElementById('recu-responsive-player');
  const button = text => host()?.shadowRoot.querySelectorAll('button').find(node => node.textContent === text);
  const message = () => host()?.shadowRoot.querySelector('.rrp-message');
  const reconcile = () => {
    for (const observer of observers) if (observer.connected) observer.callback();
    for (const [id, timer] of [...timers]) if (timer.delay === 200) { timers.delete(id); timer.fn(); }
  };
  const newPlayer = () => {
    const hostNode = new Node('div'); hostNode.attachShadow(); body.append(hostNode);
    const player = new api.RRPPlayer(nativeVideo, hostNode, new Node('span'), new Node('button'));
    eventSurfaces.set(player, { window, document }); return player;
  };
  return { api, context, window, document, location, history, nativeHost, nativeSurface, timers, observers, actions,
    engines, overlays, boards, transports, makeVideo, Node, newPlayer, host, button, message, reconcile,
    advance(ms) {
      const end = elapsed + ms;
      for (let count = 0; ; count++) {
        const next = [...timers].filter(([, timer]) => timer.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        assert(count < 1000, 'Fixture timer loop must stay bounded.');
        elapsed = next[1].due; timers.delete(next[0]); next[1].fn();
      }
      elapsed = end;
    },
    get video() { return nativeVideo; },
    replaceVideo(extra = {}) {
      nativeVideo.remove(); nativeVideo = makeVideo(extra); nativeHost.append(nativeVideo);
      window.timeline.hls.media = nativeVideo; return nativeVideo;
    },
    click(text = 'Use responsive player') { const target = button(text); assert(target, `Missing button: ${text}`); return target.emit('click')[0]; },
  };
}

let checks = 0, failures = 0;
async function check(label, run) {
  try { await run(); checks++; console.log(`PASS ${label}`); }
  catch (error) { failures++; console.error(`FAIL ${label}\n${error.stack}`); }
}

function press(player, key, options = {}) {
  const state = { prevented: 0, stopped: 0 };
  const surfaces = eventSurfaces.get(player), type = options.type || 'keydown';
  const target = options.target || player.stage;
  const path = options.path || [options.pathTarget || target, player.stage, player.shadow, player.host,
    surfaces.document.body, surfaces.document, surfaces.window];
  const event = { key, target, composedPath: () => path,
    preventDefault: () => { state.prevented = 1; }, stopPropagation: () => { state.stopped = 1; },
    stopImmediatePropagation: () => { state.stopped = 1; }, ...options };
  if (options.withoutComposedPath) delete event.composedPath;
  // Model the relevant capture order, not browser default activation/rendering.
  surfaces.window.emit(type, event, { capture: true });
  if (!state.stopped) surfaces.document.emit(type, event, { capture: true });
  if (!state.stopped && path.includes(player.stage)) player.stage.emit(type, event, { capture: true });
  if (!state.stopped && path.includes(player.stage)) player.stage.emit(type, event, { capture: false });
  if (!state.stopped) surfaces.document.emit(type, event, { capture: false });
  if (!state.stopped) surfaces.window.emit(type, event, { capture: false });
  return state;
}

await check('route and media parsing reject non-recording paths and unsafe or non-HLS URLs', () => {
  const h = harness();
  for (const value of [route, '/Name-2_/video/1/play', '/a/video/0/play/']) assert.equal(h.api.rrpRoute(value), true, value);
  for (const value of ['/', '/a/', '/a/video/1/', '/a/video/x/play/', '/a/video/1/play/extra',
    '/a/video/1/play/?x=1', '/a/video/1/play/#x', '/a%2fb/video/1/play/', '/a.b/video/1/play/', '//a/video/1/play/']) {
    assert.equal(h.api.rrpRoute(value), false, value);
  }
  assert.equal(h.api.rrpSource(h.video), 'https://media.example/recording/master.m3u8?session=private');
  const node = h.video.querySelector('source');
  for (const url of ['http://media.example/a.m3u8', 'javascript:alert(1)', 'data:text/plain,a',
    'blob:https://recu.me/id', 'https://name:secret@media.example/a.m3u8', 'https://media.example/a.mp4']) {
    node.src = url; assert.equal(h.api.rrpSource(h.video), '', url);
  }
  node.remove(); h.video.currentSrc = 'https://media.example/MASTER.M3U8';
  assert.equal(h.api.rrpSource(h.video), h.video.currentSrc);
});

await check('original URL uses whole-second t while preserving same-recording query values and fragment', () => {
  const h = harness();
  const href = `https://recu.me${route}?quality=high&q=a%20b&t=1&t=2&tag=x&tag=y&rrp_player=old&rrp_player=other#chapter`;
  const result = new URL(h.api.rrpOriginalURL(123.987, href));
  assert.equal(result.origin, h.location.origin); assert.equal(result.pathname, route);
  assert.equal(result.searchParams.get('t'), '123'); assert.equal(result.searchParams.getAll('t').length, 1);
  assert.equal(result.searchParams.get('rrp_player'), 'original');
  assert.equal(result.searchParams.getAll('rrp_player').length, 1);
  assert.equal(result.searchParams.get('quality'), 'high'); assert.equal(result.searchParams.get('q'), 'a b');
  assert.deepEqual(result.searchParams.getAll('tag'), ['x', 'y']); assert.equal(result.hash, '#chapter');
  assert.equal(h.api.rrpOriginalURL(0), `https://recu.me${route}?t=0&rrp_player=original`);
  assert.equal(h.api.rrpOriginalURL(1.999), `https://recu.me${route}?t=1&rrp_player=original`);
  assert.equal(h.location.href, `https://recu.me${route}`, 'URL construction is not navigation.');
});

await check('original URL rejects negative, nonfinite and nonnumeric timestamps instead of retaining a stale t', () => {
  const h = harness(), href = `https://recu.me${route}?t=50`;
  for (const time of [-1, -0.1, NaN, Infinity, -Infinity, undefined, null, true, '12', '1&redirect=https://evil.invalid', {}, [1]]) {
    assert.throws(() => h.api.rrpOriginalURL(time, href), undefined, `Invalid time: ${String(time)}`);
  }
});

await check('original URL rejects other origins, protocols, credentials and recording routes', () => {
  const h = harness();
  for (const href of [`http://recu.me${route}`, `https://evil.invalid${route}`, `https://recu.me.evil.invalid${route}`,
    `https://recu.me:444${route}`, `https://user:secret@recu.me${route}`, `https://evil.invalid@recu.me${route}`,
    'javascript:alert(1)', 'data:text/html,hello', `blob:https://recu.me${route}`, '/relative/path',
    'https://recu.me/example/', 'https://recu.me/example/video/999/play/', 'https://recu.me/other/video/123/play/']) {
    assert.throws(() => h.api.rrpOriginalURL(12, href), undefined, `Invalid destination: ${href}`);
  }
});

await check('initial playback snapshots contain no media URLs and never persist state', () => {
  const h = harness(); const snapshot = plain(h.api.rrpSnapshot(h.video));
  assert.deepEqual(Object.keys(snapshot).sort(), ['expires', 'muted', 'paused', 'rate', 'route', 'time', 'volume']);
  assert.equal(snapshot.time, 35); assert.equal(snapshot.expires, now + 300000);
  assert.equal(h.actions.includes('storage.access'), false);
  assert.equal(h.api.rrpTime(3661.9), '1:01:01'); assert.equal(h.api.rrpTime(-10), '0:00');
});

await check('boot is inert off-route, inside frames and without a supported native source', () => {
  for (const options of [{ route: '/' }, { iframe: true }]) {
    const h = harness(options); h.api.rrpBoot(); assert.equal(h.host(), null); assert.equal(h.observers.length, 0);
  }
  const h = harness(); h.video.plyr = null; h.api.rrpBoot();
  assert.equal(h.host(), null); assert.equal(h.engines.length, 0); assert.deepEqual(h.actions, []);
});

await check('toolbar waits for native readiness and repeated reconciliation does not duplicate it', () => {
  const h = harness(); h.api.rrpBoot(); const host = h.host();
  assert(host); assert.equal(h.engines.length, 0); assert.equal(h.boards.length, 0);
  assert.equal(host.dataset.build, 'fixture'); assert.equal(host.rrpDiagnostics().build, 'fixture');
  assert.equal(h.video.pauseCalls, 0); assert.equal(h.nativeHost.style.getPropertyValue('display'), '');
  assert.equal(h.button('Use original player').hidden, true);
  h.reconcile(); h.api.rrpBoot(); assert.equal(h.host(), host); assert.equal(h.observers.length, 1);
});

await check('boot before native readiness leaves metadata, autoplay and preferences to the original player', async () => {
  const h = harness({ nativeRun: 'off', video: { readyState: 0, duration: NaN } }); h.api.rrpBoot();
  for (const event of ['loadedmetadata', 'canplay', 'playing']) assert.equal(h.video.listenerCount(event), 0);
  h.video.readyState = 1; h.video.duration = 600; h.nativeSurface.setAttribute('data-run', 'on');
  h.video.currentTime = 77; h.video.volume = 0.8; h.video.playbackRate = 1.25; h.video.muted = true; h.video.play();
  const nativeState = plain(h.api.rrpSnapshot(h.video));
  for (const event of ['loadedmetadata', 'canplay', 'playing']) h.video.emit(event);
  await flush(); h.reconcile();
  assert.deepEqual(plain(h.api.rrpSnapshot(h.video)), nativeState);
  assert.equal(h.actions.includes('storage.access'), false);
});

await check('start uses owned host fullscreen, native video PiP and shadow-local stylesheet variables', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.equal(h.overlays[0].config.fullScreenElement, player.host);
  assert.equal(h.overlays[0].config.documentPictureInPicture.enabled, false);
  const style = player.shadow.querySelector('style'); assert.match(style.textContent, /:host\s*\{/); assert.doesNotMatch(style.textContent, /:root\b/);
  assert.match(h.api.RRP_CSS, /:host\(:fullscreen\)\s+\.rrp-stage/);
  assert.equal(h.actions.filter(action => action === 'native.cleanup').length, 1);
  assert(h.actions.indexOf('native.cleanup') < h.actions.indexOf('engine.load'));
  assert.equal(h.window.timeline.hls.media, null); assert.equal(player.metrics.originalStopped, true);
  assert.deepEqual(plain(h.video.plyr.config.keyboard), { global: false, focused: false });
  assert.equal(h.nativeHost.style.getPropertyValue('display'), 'none');
  assert.equal(h.nativeHost.style.getPropertyPriority('display'), 'important');
  assert.equal(h.engines[0].loadArgs.time, 35); assert.equal(player.loaded, true);
  await player.dispose();
});

await check('volume requests the always-expanded library option with stock mute and volume controls', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.equal(h.overlays[0].config.alwaysShowVolumeBar, true);
  assert(h.overlays[0].config.controlPanelElements.includes('volume'));
  assert(h.overlays[0].config.controlPanelElements.includes('mute'));
  await player.dispose();
});

await check('startup fixes the highest available quality at or below 1080p before loading and selects it afterward', async () => {
  for (const heights of [[360, 2160, 1080, 720], [360, 720, 480], [480], [1080, 1080, 720]]) {
    const tracks = heights.map((height, id) => ({ id, height, bandwidth: (id + 1) * 1000000 }));
    const h = harness({ levels: heights.map(height => ({ height })), tracks }), player = h.newPlayer();
    await player.start(); const engine = h.engines[0], first = engine.configurations[0];
    const expected = tracks.filter(track => track.height <= 1080)
      .sort((a, b) => b.height - a.height || b.bandwidth - a.bandwidth)[0];
    assert.equal(first.abr.enabled, false); assert.equal(first.abr.useNetworkInformation, false);
    assert.equal(first.abr.restrictions.minHeight, expected.height);
    assert.equal(first.abr.restrictions.maxHeight, expected.height);
    assert(h.actions.indexOf('engine.configure') < h.actions.indexOf('engine.load'));
    assert.equal(engine.selections.length, 1); assert.equal(engine.selections[0].track.id, expected.id);
    assert.equal(engine.selections[0].clearBuffer, true);
    assert(h.actions.indexOf('engine.selectVideoTrack') > h.actions.indexOf('engine.load'));
    assert.equal(engine.config.abr.enabled, false);
    assert.equal(engine.config.abr.restrictions.minHeight, 0); assert.equal(engine.config.abr.restrictions.maxHeight, Infinity);
    await player.dispose();
  }
});

await check('quality startup ignores invalid heights and avoids reselecting an already-active preferred track', async () => {
  const invalid = [0, -1, NaN, Infinity, '1080', undefined, 2160];
  for (const withPreferred of [true, false]) {
    const tracks = invalid.map((height, id) => ({ id, height, bandwidth: 1000000 }));
    if (withPreferred) tracks.push({ id: 100, height: 720, bandwidth: 2000000, active: true });
    const h = harness({ levels: tracks, tracks }), player = h.newPlayer(); await player.start();
    const engine = h.engines[0], restrictions = engine.configurations[0].abr.restrictions;
    assert.equal(restrictions.minHeight, withPreferred ? 720 : 0);
    assert.equal(restrictions.maxHeight, withPreferred ? 720 : 1080);
    assert.equal(engine.selections.length, 0); assert.equal(engine.config.abr.enabled, false);
    await player.dispose();
  }
});

await check('loaded fixed-quality default does not overwrite later manual quality or Auto choices', async () => {
  const h = harness(), player = h.newPlayer(); await player.start(); const engine = h.engines[0];
  for (const height of [720, 2160]) {
    engine.selectVideoTrack(engine.tracks.find(track => track.height === height), true);
    const selections = engine.selections.length, configurations = engine.configurations.length;
    for (const type of ['playing', 'waiting', 'seeked', 'loadeddata', 'canplay']) player.video.emit(type);
    player.activity(); h.advance(20000);
    assert.equal(engine.selections.length, selections); assert.equal(engine.configurations.length, configurations);
    assert.equal(engine.tracks.find(track => track.active).height, height);
  }
  engine.configure({ abr: { enabled: true } }); const configurations = engine.configurations.length;
  player.video.emit('playing'); player.activity(); h.advance(20000);
  assert.equal(engine.config.abr.enabled, true); assert.equal(engine.configurations.length, configurations);
  await player.dispose();
});

await check('recording HLS configuration retains embedded timestamps without claiming real-media timing proof', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.equal(h.engines[0].config.manifest.hls.ignoreManifestTimestampsInSegmentsMode, true);
  await player.dispose();
});

await check('automatic startup preserves page focus while explicit startup retains stage keyboard focus', async () => {
  for (const focus of [false, true]) {
    const h = harness(), outside = new h.Node('input'); h.document.body.append(outside); outside.focus();
    const player = h.newPlayer(); await player.start({ focus });
    assert.equal(player.stage.focusCalls || 0, focus ? 1 : 0);
    assert.equal(h.document.activeElement, focus ? player.host : outside);
    await player.dispose();
  }
});

await check('keyboard ownership uses host-filtered window capture, focused stage and disabled stock shortcuts', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.equal(player.stage.getAttribute('tabindex'), '0');
  assert.equal(h.overlays[0].config.enableKeyboardPlaybackControls, false);
  assert.equal(player.stage.listeners.get('keydown').filter(listener => listener.capture).length, 0);
  for (const type of ['keydown', 'keyup']) {
    assert.equal(h.window.listenerCount(type), 1);
    assert.equal(h.window.listeners.get(type)[0].capture, true);
    assert.equal(h.document.listenerCount(type), 0);
  }
  assert.equal(player.stage.focusCalls, 1); assert.deepEqual(plain(player.stage.focusOptions), { preventScroll: true });
  assert.equal(player.shadow.activeElement, player.stage); assert.equal(h.document.activeElement, player.host);
  h.window.emit('keydown', { key: ' ', target: h.document.body });
  h.document.emit('keydown', { key: 'k', target: h.document.body });
  assert.equal(player.video.playCalls, 0);
  press(player, 'Tab'); assert.equal(player.keyboardFocus, true);
  await player.dispose(); assert.equal(player.stage.listenerCount('keydown'), 0);
  assert.equal(h.window.listenerCount('keydown'), 0); assert.equal(h.window.listenerCount('keyup'), 0);
  const calls = player.video.playCalls; press(player, ' '); assert.equal(player.video.playCalls, calls);
});

await check('window keyboard listeners leave outside-host events and their defaults untouched', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  const outside = new h.Node('input'); h.document.body.append(outside);
  const path = [outside, h.document.body, h.document, h.window], snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const type of ['keydown', 'keyup']) {
    for (const key of [' ', 'K', 'F', 'T', 'S', 'm', 'j', 'l', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
      for (const ctrlKey of [false, true]) {
        assert.deepEqual(press(player, key, { type, target: outside, path, ctrlKey }), { prevented: 0, stopped: 0 }, `${type} ${key}`);
        assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
      }
    }
  }
  await player.dispose();
});

await check('window capture shields native document hotkeys on both phases without cancelling button defaults', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  const button = new h.Node('button'); player.controls.append(button);
  let siteActions = 0;
  for (const type of ['keydown', 'keyup']) h.document.addEventListener(type, event => {
    const key = event.key.toLowerCase();
    if ([' ', 'f', 't', 's'].includes(key) || ((event.ctrlKey || event.metaKey) && ['arrowleft', 'arrowright'].includes(key))) {
      siteActions++; event.preventDefault(); event.stopImmediatePropagation(); h.video.pause();
    }
  }, { capture: true });
  const snapshot = plain(h.api.rrpSnapshot(player.video)), nativePauses = h.video.pauseCalls;
  for (const type of ['keydown', 'keyup']) {
    for (const [key, modifiers] of [[' ', {}], ['F', {}], ['t', {}], ['S', {}],
      ['ArrowLeft', { ctrlKey: true }], ['ArrowRight', { metaKey: true }]]) {
      assert.deepEqual(press(player, key, { type, target: button, ...modifiers }), { prevented: 0, stopped: 1 }, `${type} ${key}`);
      assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
    }
  }
  assert.equal(siteActions, 0); assert.equal(h.video.pauseCalls, nativePauses);
  assert.deepEqual(press(player, 'Enter', { target: button }), { prevented: 0, stopped: 0 });
  const path = [h.document.body, h.document, h.window];
  assert.deepEqual(press(player, ' ', { target: h.document.body, path }), { prevented: 1, stopped: 1 });
  assert.equal(siteActions, 1, 'The site still receives its own outside-host shortcut.');
  assert.equal(h.video.pauseCalls, nativePauses + 1);
  await player.dispose();
});

await check('keyup shielding never repeats the keydown playback or fullscreen action', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  press(player, ' '); assert.equal(player.video.playCalls, 1);
  assert.deepEqual(press(player, ' ', { type: 'keyup' }), { prevented: 0, stopped: 1 });
  assert.equal(player.video.playCalls, 1); assert.equal(player.video.paused, false);
  assert.deepEqual(press(player, 'K', { type: 'keyup' }), { prevented: 0, stopped: 0 });
  assert.equal(player.video.paused, false); press(player, 'k'); assert.equal(player.video.paused, true);
  let enters = 0; h.document.fullscreenEnabled = true;
  player.host.requestFullscreen = () => { enters++; return Promise.resolve(); };
  press(player, 'f'); assert.equal(enters, 1);
  assert.deepEqual(press(player, 'F', { type: 'keyup' }), { prevented: 0, stopped: 1 }); assert.equal(enters, 1);
  await player.dispose();
});

await check('timeline Space uses the composed inner target while non-arrow navigation and shortcuts remain native', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.deepEqual(press(player, ' ', { target: player.host, pathTarget: player.seek }), { prevented: 1, stopped: 1 });
  assert.equal(player.video.playCalls, 1); assert.equal(player.video.paused, false);
  assert.deepEqual(press(player, ' ', { target: player.seek, withoutComposedPath: true }), { prevented: 0, stopped: 0 });
  assert.equal(player.video.paused, false, 'Without an ownership path, the wrapper must fail closed.');
  assert.deepEqual(press(player, ' ', { target: player.seek }), { prevented: 1, stopped: 1 });
  assert.equal(player.video.paused, true);
  const snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const key of ['Home', 'End', 'PageUp', 'PageDown', 'k', 'j', 'l', 'm', 'f', 'Enter', 'Escape', 'Tab']) {
    assert.deepEqual(press(player, key, { target: player.seek }), { prevented: 0, stopped: key === 'f' ? 1 : 0 }, key);
    assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot, key);
  }
  await player.dispose();
});

await check('focused timeline Left and Right seek five seconds once at capture and clamp at media boundaries', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  player.seek.emit('pointerdown'); h.window.emit('pointerup'); player.seek.focus();
  assert.equal(h.document.activeElement, player.host); assert.equal(player.shadow.activeElement, player.seek);
  let nativeKeys = 0; h.document.addEventListener('keydown', () => { nativeKeys++; }, { capture: true });
  for (const [key, start, expected] of [['ArrowLeft', 35, 30], ['ArrowRight', 35, 40],
    ['ArrowLeft', 2, 0], ['ArrowRight', 598, 599.9]]) {
    player.video.currentTime = start; const volume = player.video.volume;
    const owned = { target: player.host, pathTarget: player.seek };
    assert.deepEqual(press(player, key, owned), { prevented: 1, stopped: 1 }, key);
    assert.equal(player.video.currentTime, expected); assert.equal(player.video.volume, volume);
    assert.deepEqual(press(player, key, { ...owned, type: 'keyup' }), { prevented: 0, stopped: 0 }, key);
    assert.equal(player.video.currentTime, expected, 'Keyup must not repeat a seek.');
  }
  assert.equal(nativeKeys, 0, 'Timeline arrows must be handled before native document shortcuts.');
  for (const duration of [NaN, Infinity]) {
    player.video.duration = duration; player.video.currentTime = 50;
    for (const key of ['ArrowLeft', 'ArrowRight']) {
      assert.deepEqual(press(player, key, { target: player.seek }), { prevented: 0, stopped: 0 });
      assert.equal(player.video.currentTime, 50);
    }
  }
  await player.dispose();
});

await check('focused timeline Up and Down change bounded volume once without seeking or changing mute', async () => {
  const h = harness(), player = h.newPlayer(); await player.start(); player.seek.focus();
  for (const muted of [false, true]) for (const [key, start, expected] of [
    ['ArrowUp', 0.5, 0.55], ['ArrowDown', 0.5, 0.45], ['ArrowUp', 0.99, 1], ['ArrowDown', 0.01, 0]]) {
    player.video.volume = start; player.video.muted = muted;
    const owned = { target: player.host, pathTarget: player.seek };
    assert.deepEqual(press(player, key, owned), { prevented: 1, stopped: 1 }, key);
    assert.equal(player.video.volume, expected); assert.equal(player.video.currentTime, 35);
    assert.equal(player.video.muted, muted);
    assert.deepEqual(press(player, key, { ...owned, type: 'keyup' }), { prevented: 0, stopped: 0 }, key);
    assert.equal(player.video.volume, expected, 'Keyup must not repeat a volume adjustment.');
  }
  const snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) {
    assert.deepEqual(press(player, key, { target: player.seek, withoutComposedPath: true }), { prevented: 0, stopped: 0 });
    assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
  }
  await player.dispose();
});

await check('focused stock volume Up and Down bypass native shadow-host cancellation while other keys remain native', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  const volume = new h.Node('input'); volume.setAttribute('type', 'range'); volume.className = 'shaka-volume-bar';
  player.controls.append(volume); volume.focus();
  assert.equal(h.document.activeElement, player.host); assert.equal(player.shadow.activeElement, volume);
  let nativeKeys = 0;
  h.document.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown'].includes(event.key) && event.target === player.host) {
      nativeKeys++; event.preventDefault();
    }
  }, { capture: true });
  const owned = { target: player.host, pathTarget: volume };
  for (const muted of [false, true]) for (const [key, start, expected] of [
    ['ArrowUp', 0.49, 0.54], ['ArrowDown', 0.49, 0.44], ['ArrowUp', 0.99, 1], ['ArrowDown', 0.01, 0]]) {
    player.video.volume = start; player.video.muted = muted;
    assert.deepEqual(press(player, key, owned), { prevented: 1, stopped: 1 }, key);
    assert.equal(player.video.volume, expected); assert.equal(player.video.currentTime, 35); assert.equal(player.video.muted, muted);
    assert.deepEqual(press(player, key, { ...owned, type: 'keyup' }), { prevented: 0, stopped: 0 });
    h.advance(500); assert.equal(player.video.volume, expected, 'No keyup repeat or delayed reversal.');
  }
  assert.equal(nativeKeys, 0, 'The cancelling document listener must not see owned vertical volume keys.');
  const snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const key of [' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'j', 'l', 'k', 'm', 'f']) {
    assert.deepEqual(press(player, key, owned), { prevented: 0, stopped: [' ', 'f'].includes(key) ? 1 : 0 }, key);
    assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
  }
  for (const modifier of ['ctrlKey', 'metaKey', 'altKey', 'isComposing']) for (const key of ['ArrowUp', 'ArrowDown']) {
    // Use the input as the event target here to isolate wrapper modifier handling from the modelled site listener.
    assert.deepEqual(press(player, key, { target: volume, [modifier]: true }), { prevented: 0, stopped: 0 });
    assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
  }
  await player.dispose();
});

await check('background Space and K toggle once, and rejected play promises remain contained', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  assert.deepEqual(press(player, ' '), { prevented: 1, stopped: 1 }); assert.equal(player.video.playCalls, 1);
  assert.deepEqual(press(player, 'K'), { prevented: 1, stopped: 1 }); assert.equal(player.video.pauseCalls, 1);
  assert.equal(player.video.paused, true);
  player.video.play = () => Promise.reject(new Error('Controlled media rejection'));
  assert.deepEqual(press(player, 'k'), { prevented: 1, stopped: 1 }); await flush();
  await player.dispose();
});

await check('background seek shortcuts use five and ten second steps and clamp at media boundaries', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  for (const [key, expected] of [['ArrowRight', 40], ['ArrowLeft', 30], ['J', 25], ['l', 45]]) {
    player.video.currentTime = 35;
    assert.deepEqual(press(player, key), { prevented: 1, stopped: 1 }); assert.equal(player.video.currentTime, expected, key);
  }
  player.video.currentTime = 2; press(player, 'j'); assert.equal(player.video.currentTime, 0);
  player.video.currentTime = 598; press(player, 'l'); assert.equal(player.video.currentTime, 599.9);
  for (const duration of [NaN, Infinity]) {
    player.video.duration = duration; player.video.currentTime = 50;
    assert.deepEqual(press(player, 'ArrowRight'), { prevented: 0, stopped: 0 }); assert.equal(player.video.currentTime, 50);
  }
  await player.dispose();
});

await check('background volume and mute shortcuts have bounded values and do not change seek time', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  player.video.volume = 0.5;
  assert.deepEqual(press(player, 'ArrowUp'), { prevented: 1, stopped: 1 }); assert.equal(player.video.volume, 0.55);
  press(player, 'ArrowDown'); assert.equal(player.video.volume, 0.5);
  player.video.volume = 0.99; press(player, 'ArrowUp'); assert.equal(player.video.volume, 1);
  player.video.volume = 0.01; press(player, 'ArrowDown'); assert.equal(player.video.volume, 0);
  player.video.muted = false; press(player, 'M'); assert.equal(player.video.muted, true);
  press(player, 'm'); assert.equal(player.video.muted, false); assert.equal(player.video.currentTime, 35);
  await player.dispose();
});

await check('button, range and text-entry contexts keep defaults while reserved site shortcuts are shielded', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  const contexts = [new h.Node('button'), new h.Node('input'), new h.Node('textarea'), new h.Node('select')];
  contexts[1].setAttribute('type', 'range'); contexts[1].className = 'shaka-playback-rate';
  for (const [attribute, value] of [['contenteditable', ''], ['contenteditable', 'true'], ['role', 'textbox']]) {
    const node = new h.Node('div'); node.setAttribute(attribute, value); contexts.push(node);
  }
  const textInput = new h.Node('input'); textInput.setAttribute('type', 'text'); contexts.push(textInput);
  const snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const context of contexts) {
    const descendant = new h.Node('span'); context.append(descendant); player.controls.append(context);
    for (const target of [context, descendant]) for (const key of [' ', 'k', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown', 'j', 'm', 'f']) {
      assert.deepEqual(press(player, key, { target }), { prevented: 0, stopped: [' ', 'f'].includes(key) ? 1 : 0 }, `${context.tagName} ${key}`);
      assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
    }
  }
  await player.dispose();
});

await check('modifier shortcuts and composition preserve defaults while site-reserved propagation is blocked', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  const snapshot = plain(h.api.rrpSnapshot(player.video));
  for (const target of [player.stage, player.seek]) for (const modifier of ['ctrlKey', 'metaKey', 'altKey', 'isComposing']) {
    for (const key of [' ', 'k', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'f']) {
      const shielded = [' ', 'f'].includes(key) || (['ctrlKey', 'metaKey'].includes(modifier) && ['ArrowLeft', 'ArrowRight'].includes(key));
      assert.deepEqual(press(player, key, { target, [modifier]: true }), { prevented: 0, stopped: shielded ? 1 : 0 }, `${modifier} ${key}`);
      assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot);
    }
  }
  for (const key of ['Escape', 'Enter', 'Tab', 'x', '1', 'Home', 'End']) {
    assert.deepEqual(press(player, key), { prevented: 0, stopped: 0 }, key);
  }
  assert.deepEqual(plain(h.api.rrpSnapshot(player.video)), snapshot); await player.dispose();
});

await check('F toggles the owned fullscreen host and handles denial or unavailable API safely', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  let enters = 0, exits = 0;
  h.document.fullscreenEnabled = true; h.document.fullscreenElement = null;
  player.host.requestFullscreen = () => { enters++; h.document.fullscreenElement = player.host; return Promise.resolve(); };
  h.document.exitFullscreen = () => { exits++; h.document.fullscreenElement = null; return Promise.resolve(); };
  assert.deepEqual(press(player, 'f'), { prevented: 1, stopped: 1 }); assert.equal(enters, 1);
  assert.deepEqual(press(player, 'F'), { prevented: 1, stopped: 1 }); assert.equal(exits, 1);
  h.document.fullscreenEnabled = false;
  assert.deepEqual(press(player, 'f'), { prevented: 0, stopped: 1 }); assert.equal(enters, 1);
  h.document.fullscreenEnabled = true;
  player.host.requestFullscreen = () => Promise.reject(new Error('Controlled fullscreen denial'));
  press(player, 'f'); await flush(); assert.match(player.message.textContent, /Fullscreen unavailable/);
  await player.dispose();
});

await check('unsupported ownership, conflicting previews and missing CSS fail before native takeover', async () => {
  const failures = [
    ['engine', /Native playback engine is not ready/],
    ['ownership', /Native player ownership is not ready/],
    ['cleanup', /Native playback cleanup is inaccessible/],
    ['conflict', /Disable Accurate Timeline Previews/],
    ['stylesheet', /Player stylesheet is unavailable/],
    ['browser', /Unsupported player\/source/],
  ];
  for (const [mode, expectedError] of failures) {
    const h = harness({ css: mode === 'stylesheet' ? '' : undefined, supported: mode !== 'browser' });
    if (mode === 'engine') h.window.timeline = undefined;
    if (mode === 'ownership') h.window.timeline.hls.media = {};
    if (mode === 'cleanup') delete h.context.activeStreamCleanup;
    if (mode === 'conflict') { const old = new h.Node('div'); old.id = 'recu-accurate-previews'; h.document.body.append(old); }
    const player = h.newPlayer(); await assert.rejects(player.start(), expectedError);
    assert.equal(h.engines.length, 0, mode); assert.equal(h.video.pauseCalls, 0, mode);
    assert.equal(h.actions.includes('native.cleanup'), false, mode); await player.dispose();
  }
});

await check('disposal during attachment prevents late native takeover and new UI creation', async () => {
  const h = harness({ deferAttach: true }), player = h.newPlayer(), start = player.start();
  await player.dispose(); h.engines[0].attachGate.resolve(); await start;
  assert.equal(h.overlays.length, 0); assert.equal(h.actions.includes('native.cleanup'), false);
  assert.equal(h.video.pauseCalls, 0); assert.equal(player.stage.isConnected, false);
  assert.equal(h.transports[0].disposeCalls, 1); assert.equal(h.engines[0].destroyCalls, 1);
});

await check('disposal during load prevents late ready, play and preview continuation', async () => {
  const h = harness({ deferLoad: true, video: { paused: false } }), player = h.newPlayer(), start = player.start();
  await flush(); assert.equal(player.metrics.originalStopped, true);
  const prepared = h.boards[0].prepared.length; await player.dispose();
  h.engines[0].loadGate.resolve(); await start;
  assert.equal(player.loaded, undefined); assert.equal(player.video.playCalls, 0);
  assert.equal(h.boards[0].prepared.length, prepared); assert.equal(h.boards[0].disposeCalls, 1);
  assert.equal(player.stage.isConnected, false);
});

await check('critical playback error survives every later storyboard status update', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  h.engines[0].emit('error', { detail: { severity: 1, code: 1002 } }); assert.equal(player.failed, undefined);
  h.engines[0].emit('error', { detail: { severity: 2, code: 3016 } });
  const failure = player.message.textContent; assert.match(failure, /Playback failed.*3016/);
  for (const state of [{ ready: 1, total: 2, failed: 0 }, { ready: 2, total: 2, failed: 0 }, { ready: 0, total: 2, failed: 2 }]) {
    h.boards[0].change(state); assert.equal(player.message.textContent, failure);
  }
  await player.dispose();
});

await check('critical playback error is not overwritten by a subsequently rejected play promise', async () => {
  const h = harness({ deferLoad: true, video: { paused: false } }), player = h.newPlayer();
  const play = deferred(), start = player.start(); await flush();
  player.video.play = () => play.promise;
  h.engines[0].loadGate.resolve(); await flush();
  h.engines[0].emit('error', { detail: { severity: 2, code: 3016 } });
  const failure = player.message.textContent; assert.match(failure, /Playback failed.*3016/);
  play.reject(new Error('Media playback aborted')); await start;
  assert.equal(player.message.textContent, failure); await player.dispose();
});

await check('disposal is idempotent, awaits transport and restores exact native style and keyboard', async () => {
  const h = harness({ deferTransportDispose: true }), keyboard = h.video.plyr.config.keyboard;
  h.nativeHost.style.setProperty('display', 'inline-flex', 'important');
  const player = h.newPlayer(); await player.start(); player.measureSeek();
  assert.equal(player.video.frames.size, 1); assert(h.timers.size > 0);
  let done = false; const disposal = player.dispose().then(() => { done = true; }); await flush();
  assert.equal(done, false); assert.equal(player.alive, false); assert.equal(h.timers.size, 0);
  assert.equal(player.video.frames.size, 0); assert.equal(h.window.listenerCount('pointerup'), 0);
  assert.equal(player.stage.listenerCount('pointermove'), 0);
  h.transports[0].disposeGate.resolve(); await disposal; await player.dispose();
  assert.equal(h.overlays[0].destroyCalls, 1); assert.equal(h.transports[0].disposeCalls, 1);
  assert.equal(h.video.plyr.config.keyboard, keyboard);
  assert.equal(h.nativeHost.style.getPropertyValue('display'), 'inline-flex');
  assert.equal(h.nativeHost.style.getPropertyPriority('display'), 'important');
  assert.equal(player.stage.isConnected, false);
});

await check('failed pre-handoff retries remove only their owned stylesheet without accumulating styles', async () => {
  const h = harness({ deferAttach: true }), host = new h.Node('div'); host.attachShadow(); h.document.body.append(host);
  const toolbarStyle = new h.Node('style'); toolbarStyle.textContent = '.rrp-toolbar { color: white; }';
  host.shadowRoot.append(toolbarStyle);
  for (let attempt = 0; attempt < 3; attempt++) {
    const player = new h.api.RRPPlayer(h.video, host, new h.Node('span'), new h.Node('button'));
    const start = player.start(), failed = assert.rejects(start, /Controlled attachment failure/);
    assert.equal(host.shadowRoot.querySelectorAll('style').length, 2);
    const ownedStyle = player.playerStyle; assert(ownedStyle?.isConnected);
    h.engines[attempt].attachGate.reject(new Error('Controlled attachment failure')); await failed; await player.dispose();
    assert.equal(ownedStyle.isConnected, false); assert.equal(player.stage.isConnected, false);
    assert.equal(host.shadowRoot.querySelectorAll('style').length, 1);
    assert.equal(host.shadowRoot.querySelector('style'), toolbarStyle);
  }
  assert.equal(h.actions.includes('native.cleanup'), false); assert.equal(h.video.pauseCalls, 0);
});

await check('focus loss clears stale preview state except during an actual hover or drag', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  player.video.paused = false; player.keyboardFocus = true; player.previewTime = 20; player.preview.hidden = false;
  player.stage.emit('focusout', { target: player.seek });
  assert.equal(player.keyboardFocus, false); assert.equal(player.previewTime, null); assert.equal(player.preview.hidden, true);
  const idle = h.timers.get(player.hideTimer); h.timers.delete(player.hideTimer); idle.fn();
  assert.equal(player.stage.classList.contains('rrp-idle'), true, 'An abandoned preview must not keep controls visible.');
  for (const [hover, drag] of [[true, false], [false, true]]) {
    player.seekHost.hover = hover; player.pointerDown = drag;
    player.keyboardFocus = true; player.previewTime = 99; player.preview.hidden = false;
    player.stage.emit('focusout', { target: player.seek });
    assert.equal(player.keyboardFocus, false); assert.equal(player.previewTime, 99); assert.equal(player.preview.hidden, false);
  }
  await player.dispose();
});

await check('idle overlay retains its hit target and buffering or seek-completion events do not wake it', async () => {
  const h = harness(), player = h.newPlayer(); await player.start(); player.video.paused = false;
  const idleRule = /\.rrp-stage\.rrp-idle\s+\.shaka-controls-container\s*\{([^}]+)\}/.exec(h.api.RRP_CSS);
  assert(idleRule); assert.match(idleRule[1], /opacity\s*:\s*0/);
  assert.doesNotMatch(idleRule[1], /pointer-events\s*:\s*none/);
  player.activity(); h.advance(2500); assert(player.stage.classList.contains('rrp-idle'));
  const hideTimer = player.hideTimer;
  for (const type of ['waiting', 'playing', 'seeked']) {
    player.video.emit(type); assert(player.stage.classList.contains('rrp-idle'), type);
    if (type === 'waiting') assert.equal(player.hideTimer, hideTimer, 'Buffering must not restart the idle timer.');
  }
  player.video.emit('seeking'); assert.equal(player.video.frames.size, 1);
  assert(player.stage.classList.contains('rrp-idle'), 'Seek metrics must not wake controls.');
  const [frameId, frame] = [...player.video.frames][0]; player.video.frames.delete(frameId);
  frame(0, { mediaTime: 80 }); assert.equal(player.metrics.seeks.length, 1);
  for (const type of ['play', 'pause', 'ended']) {
    player.video.emit(type); assert.equal(player.stage.classList.contains('rrp-idle'), false, type);
    h.advance(2500); assert(player.stage.classList.contains('rrp-idle'));
  }
  player.stage.emit('pointermove'); assert.equal(player.stage.classList.contains('rrp-idle'), false);
  await player.dispose();
});

await check('buffering and seek recovery rearm idle hiding after an expired timer without revealing hidden controls', async () => {
  for (const type of ['playing', 'seeked']) {
    const h = harness(), player = h.newPlayer(); await player.start(); player.video.paused = false;
    if (type === 'playing') player.video.readyState = 2;
    else player.video.seeking = true;
    player.activity(); h.advance(2500);
    assert.equal(player.stage.classList.contains('rrp-idle'), false); assert.equal(h.timers.size, 0);
    player.video.readyState = 4; player.video.seeking = false; player.video.emit(type);
    assert.equal(player.stage.classList.contains('rrp-idle'), false);
    h.advance(2499); assert.equal(player.stage.classList.contains('rrp-idle'), false);
    h.advance(1); assert.equal(player.stage.classList.contains('rrp-idle'), true);
    player.video.emit(type); assert.equal(player.stage.classList.contains('rrp-idle'), true);
    h.advance(2500); assert.equal(player.stage.classList.contains('rrp-idle'), true);
    await player.dispose();
  }
});

await check('actual Shaka overflow, submenu and context menu classes keep idle controls visible only while open', async () => {
  const h = harness(), player = h.newPlayer(); await player.start(); player.video.paused = false;
  const runIdle = () => {
    player.activity();
    const timer = h.timers.get(player.hideTimer); assert.equal(timer.delay, 2500);
    h.timers.delete(player.hideTimer); timer.fn();
  };
  assert.equal(player.menuOpen(), false); runIdle(); assert(player.stage.classList.contains('rrp-idle'));
  for (const className of ['shaka-overflow-menu', 'shaka-sub-menu', 'shaka-context-menu']) {
    const menu = player.stage.querySelector(`.${className}`); assert(menu, `Missing actual UI class: ${className}`);
    menu.classList.remove('shaka-hidden');
    assert.equal(player.menuOpen(), true, className); runIdle();
    assert.equal(player.stage.classList.contains('rrp-idle'), false, `Open ${className} must remain usable without hover/focus.`);
    menu.classList.add('shaka-hidden');
    assert.equal(player.menuOpen(), false, className); runIdle();
    assert.equal(player.stage.classList.contains('rrp-idle'), true, `Hidden ${className} must not pin the overlay.`);
  }
  await player.dispose();
});

await check('pointer ownership includes blank space inside every actual Shaka menu without pinning outside controls', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  for (const className of ['shaka-overflow-menu', 'shaka-sub-menu', 'shaka-context-menu']) {
    const menu = player.stage.querySelector(`.${className}`), blank = new h.Node('div'); menu.append(blank);
    player.controls.emit('pointerover', { target: blank }); assert.equal(player.hoverControls, true, className);
    player.controls.emit('pointerout', { relatedTarget: blank }); assert.equal(player.hoverControls, true, className);
    player.controls.emit('pointerout', { relatedTarget: player.video }); assert.equal(player.hoverControls, false, className);
  }
  await player.dispose();
});

await check('return to original assigns only the timestamp URL after complete player and transport disposal', async () => {
  const h = harness({ deferTransportDispose: true }), player = h.newPlayer(); await player.start();
  h.location.href = `https://recu.me${route}?quality=high&t=12#details`;
  player.video.currentTime = 222.99; player.video.volume = 0.2; player.video.paused = true;
  const returning = player.returnOriginal(); await flush();
  assert.equal(player.returnButton.disabled, true); assert.equal(h.location.assigned.length, 0);
  assert.equal(h.actions.includes('storage.access'), false);
  h.transports[0].disposeGate.resolve(); await returning;
  assert.deepEqual(h.location.assigned, [`https://recu.me${route}?quality=high&t=222&rrp_player=original#details`]);
  assert.equal(h.location.reloads, 0); assert.equal(player.stage.isConnected, false); assert.equal(player.alive, false);
  assert(h.actions.indexOf('engine.destroy') < h.actions.indexOf('location.assign'));
  assert(h.actions.indexOf('transport.dispose') < h.actions.indexOf('location.assign'));
  assert.equal(h.actions.includes('storage.access'), false, 'Returning must not save pause, volume or other state.');
});

await check('return during pending or failed load uses the initial native timestamp rather than the empty replacement', async () => {
  for (const mode of ['pending', 'failed']) {
    const h = harness({ deferLoad: true }), player = h.newPlayer();
    const start = player.start(), outcome = start.then(() => ({ ok: true }), error => ({ ok: false, error }));
    await flush(); assert.equal(player.initial.time, 35); assert.equal(player.loaded, undefined);
    h.video.currentTime = 0; player.video.currentTime = 0;
    if (mode === 'failed') {
      h.engines[0].loadGate.reject(new Error('Controlled load failure'));
      assert.equal((await outcome).ok, false);
    }
    await player.returnOriginal(); assert.deepEqual(h.location.assigned, [`https://recu.me${route}?t=35&rrp_player=original`], mode);
    assert.equal(player.alive, false); assert.equal(h.actions.includes('storage.access'), false);
    if (mode === 'pending') { h.engines[0].loadGate.resolve(); await outcome; }
    assert.equal(player.loaded, undefined); assert.equal(player.video.playCalls, 0);
  }
});

await check('return to original rejects a stale recording owner without navigating or disposing its replacement', async () => {
  const h = harness(), player = h.newPlayer(); await player.start();
  h.location.pathname = '/example/video/999/play/'; h.location.href = `https://recu.me${h.location.pathname}`;
  await assert.rejects(player.returnOriginal());
  assert.equal(h.location.assigned.length, 0); assert.equal(h.location.reloads, 0);
  assert.equal(h.engines[0].destroyCalls, 0); await player.dispose();
});

await check('return to original does not assign a URL when disposal fails', async () => {
  const h = harness({ deferTransportDispose: true }), player = h.newPlayer(); await player.start();
  const returning = player.returnOriginal(); const rejected = assert.rejects(returning, /Controlled disposal failure/);
  await flush(); h.transports[0].disposeGate.reject(new Error('Controlled disposal failure')); await rejected;
  assert.equal(h.location.assigned.length, 0); assert.equal(h.location.reloads, 0);
});

function bootJobs(h) {
  const jobs = [];
  class Job {
    constructor(video, host, message, back) {
      Object.assign(this, { video, host, message, back, route: h.location.pathname, alive: true, disposeCalls: 0,
        gate: deferred(), metrics: { originalStopped: false, seeks: [], previews: [] } }); jobs.push(this);
    }
    start(options) { this.startOptions = options; return this.gate.promise; }
    dispose() { this.disposeCalls++; this.alive = false; return Promise.resolve(); }
  }
  h.context.replacePlayerForBootTest(Job); h.api.rrpBoot(); return jobs;
}

await check('ready owned native playback with storyboard frames starts automatically once without stealing focus', async () => {
  for (const paused of [true, false]) {
    const h = harness({ video: { readyState: 2, paused, muted: true, volume: 0.4, playbackRate: 1.25 }, frames: [{}] });
    const outside = new h.Node('input'); h.document.body.append(outside); outside.focus();
    h.api.rrpBoot(); assert.equal(h.engines.length, 0); h.advance(200); await flush();
    assert.equal(h.engines.length, 1); assert.equal(h.host().rrpDiagnostics().loaded, true);
    assert.equal(h.document.activeElement, outside); assert.equal(h.engines[0].video.currentTime, 35);
    assert.equal(h.engines[0].video.paused, paused); assert.equal(h.engines[0].video.muted, true);
    assert.equal(h.engines[0].video.volume, 0.4); assert.equal(h.engines[0].video.playbackRate, 1.25);
    h.reconcile(); h.advance(20000); await flush(); assert.equal(h.engines.length, 1);
    assert.equal(h.actions.filter(action => action === 'native.cleanup').length, 1);
    h.window.emit('pagehide'); await flush(); assert.equal(h.timers.size, 0);
  }
});

await check('automatic start waits for readyState, native HLS ownership and cleanup availability', async () => {
  for (const mode of ['readiness', 'ownership', 'cleanup']) {
    const h = harness({ video: { readyState: mode === 'readiness' ? 1 : 2 }, frames: [{}] });
    const cleanup = h.context.activeStreamCleanup;
    if (mode === 'ownership') h.window.timeline.hls.media = {};
    if (mode === 'cleanup') delete h.context.activeStreamCleanup;
    const jobs = bootJobs(h); h.advance(2000); assert.equal(jobs.length, 0, mode);
    h.video.readyState = 2; h.window.timeline.hls.media = h.video; h.context.activeStreamCleanup = cleanup;
    h.advance(200); assert.equal(jobs.length, 1, mode); assert.equal(jobs[0].startOptions.focus, false);
    jobs[0].gate.resolve(); await flush(); h.window.emit('pagehide');
  }
});

await check('automatic takeover waits while native fullscreen or picture-in-picture is active', async () => {
  for (const property of ['fullscreenElement', 'pictureInPictureElement']) {
    const h = harness({ video: { readyState: 2 }, frames: [{}] }); h.document[property] = h.video;
    const jobs = bootJobs(h); h.advance(2000); assert.equal(jobs.length, 0, property);
    assert.equal(h.video.pauseCalls, 0); h.document[property] = null; h.advance(200);
    assert.equal(jobs.length, 1, property); assert.equal(jobs[0].startOptions.focus, false);
    jobs[0].gate.resolve(); await flush(); h.window.emit('pagehide');
  }
});

await check('missing storyboard frames receive a bounded readiness grace that resets when native readiness is lost', async () => {
  const h = harness({ video: { readyState: 2 } }), jobs = bootJobs(h);
  h.advance(1400); assert.equal(jobs.length, 0);
  h.video.readyState = 1; h.advance(200); h.video.readyState = 2; h.advance(1600);
  assert.equal(jobs.length, 0, 'The first ready period must not count toward the second.');
  h.advance(200); assert.equal(jobs.length, 1); assert.equal(jobs[0].startOptions.focus, false);
  jobs[0].gate.resolve(); await flush(); h.window.emit('pagehide');
});

await check('automatic readiness polling stops after 20 seconds and explicit retry still works', async () => {
  const h = harness({ video: { readyState: 1 } }), jobs = bootJobs(h);
  h.advance(19800); assert.equal(jobs.length, 0); assert.equal(h.timers.size, 1);
  h.advance(200); assert.equal(jobs.length, 0); assert.equal(h.timers.size, 0);
  assert.match(h.message().textContent, /retry/);
  h.video.readyState = 2; h.advance(20000); assert.equal(jobs.length, 0);
  const start = h.click(); assert.equal(jobs.length, 1); assert.equal(jobs[0].startOptions.focus, true);
  jobs[0].gate.resolve(); await start; h.window.emit('pagehide');
});

await check('original-player URL marker prevents retake and explicit launch removes only that marker', async () => {
  const href = `https://recu.me${route}?rrp_player=original&quality=high&t=12&tag=x&tag=y#chapter`;
  const h = harness({ href, video: { readyState: 2 }, frames: [{}] }), jobs = bootJobs(h);
  h.advance(40000); h.reconcile(); assert.equal(jobs.length, 0); assert.equal(h.timers.size, 0);
  assert.equal(h.history.replacements.length, 0); assert.equal(h.video.pauseCalls, 0);
  const state = h.history.state, start = h.click(); assert.equal(jobs.length, 1);
  assert.equal(jobs[0].startOptions.focus, true); assert.equal(h.history.replacements.length, 1);
  const replacement = h.history.replacements[0], url = new URL(replacement.url);
  assert.equal(replacement.state, state); assert.equal(url.searchParams.has('rrp_player'), false);
  assert.equal(url.pathname, route); assert.equal(url.searchParams.get('quality'), 'high');
  assert.equal(url.searchParams.get('t'), '12'); assert.deepEqual(url.searchParams.getAll('tag'), ['x', 'y']);
  assert.equal(url.hash, '#chapter'); assert.equal(h.location.assigned.length, 0); assert.equal(h.location.reloads, 0);
  jobs[0].gate.resolve(); await start; h.window.emit('pagehide');
});

await check('manual launch and pagehide cancel the pending automatic takeover', async () => {
  for (const mode of ['manual', 'pagehide']) {
    const h = harness({ video: { readyState: 2 }, frames: [{}] }), jobs = bootJobs(h);
    const start = mode === 'manual' ? h.click() : undefined;
    if (mode === 'pagehide') h.window.emit('pagehide');
    h.advance(40000); assert.equal(jobs.length, mode === 'manual' ? 1 : 0);
    assert.equal(h.timers.size, 0);
    if (start) { assert.equal(jobs[0].startOptions.focus, true); jobs[0].gate.resolve(); await start; h.window.emit('pagehide'); }
  }
});

await check('automatic callback rejects a stale route or disconnected owner before delayed reconciliation runs', () => {
  for (const mode of ['route', 'host', 'video']) {
    const h = harness({ video: { readyState: 2 }, frames: [{}] }), jobs = bootJobs(h);
    if (mode === 'route') { h.location.pathname = '/example/'; h.location.href = 'https://recu.me/example/'; }
    if (mode === 'host') h.host().remove();
    if (mode === 'video') h.video.remove();
    h.advance(200); assert.equal(jobs.length, 0, `${mode} changed before the observer's debounce ran.`);
    assert.equal(h.video.pauseCalls, 0); h.window.emit('pagehide'); assert.equal(h.timers.size, 0);
  }
});

await check('automatic startup failure is not retried in a background loop', async () => {
  const h = harness({ video: { readyState: 2 }, frames: [{}] }), jobs = bootJobs(h);
  h.advance(200); assert.equal(jobs.length, 1);
  jobs[0].gate.reject(new Error('Controlled auto failure')); await flush();
  h.advance(40000); assert.equal(jobs.length, 1); assert.equal(h.timers.size, 0);
  assert.equal(h.message().textContent, 'Controlled auto failure'); assert.equal(h.button('Use responsive player').disabled, false);
  const retry = h.click(); assert.equal(jobs.length, 2); jobs[1].gate.resolve(); await retry;
  h.window.emit('pagehide');
});

await check('failed original-player return navigates to an original-only URL instead of an automatic reload loop', async () => {
  const h = harness(), jobs = bootJobs(h), start = h.click(); jobs[0].gate.resolve(); await start;
  jobs[0].returnOriginal = () => Promise.reject(new Error('Controlled disposal failure'));
  await h.click('Use original player');
  assert.deepEqual(h.location.assigned, [`https://recu.me${route}?t=0&rrp_player=original`]);
  assert.equal(h.location.reloads, 0); h.window.emit('pagehide');
});

await check('stale rejected startup cannot dispose, clear or relabel its successor', async () => {
  const h = harness(), jobs = bootJobs(h), first = h.click();
  h.replaceVideo(); h.reconcile(); const second = h.click(), newMessage = h.message().textContent;
  assert.equal(jobs.length, 2); assert.equal(jobs[0].disposeCalls, 1);
  jobs[0].gate.reject(new Error('Old load interrupted')); await first;
  assert.equal(jobs[1].disposeCalls, 0); assert.equal(h.host().rrpDiagnostics().active, true);
  assert.equal(h.message().textContent, newMessage);
  jobs[1].gate.resolve(); await second; assert.equal(h.button('Use responsive player').hidden, true);
});

await check('stale successful startup cannot hide the new launch control', async () => {
  const h = harness(), jobs = bootJobs(h), first = h.click();
  h.replaceVideo(); h.reconcile(); const newLaunch = h.button('Use responsive player');
  jobs[0].gate.resolve(); await first; assert.equal(newLaunch.hidden, false); assert.equal(newLaunch.disabled, false);
});

await check('current startup failures select retry before handoff and original-player return after handoff', async () => {
  for (const stopped of [false, true]) {
    const h = harness(), jobs = bootJobs(h), start = h.click(); jobs[0].metrics.originalStopped = stopped;
    jobs[0].gate.reject(new Error('Controlled startup failure')); await start;
    assert.equal(h.message().textContent, 'Controlled startup failure');
    assert.equal(h.button('Use responsive player').hidden, stopped);
    assert.equal(h.button('Use original player').hidden, !stopped);
    assert.equal(jobs[0].disposeCalls, stopped ? 0 : 1);
    if (!stopped) assert.equal(h.button('Use responsive player').disabled, false);
  }
});

await check('pagehide aborts controls, disconnects observer and prevents remount', async () => {
  const h = harness({ video: { readyState: 0 } }), jobs = bootJobs(h), start = h.click();
  h.window.emit('pagehide'); assert.equal(h.host(), null); assert.equal(jobs[0].disposeCalls, 1);
  assert.equal(h.observers[0].connected, false); assert.equal(h.video.listenerCount('loadedmetadata'), 0);
  h.reconcile(); assert.equal(h.host(), null);
  jobs[0].gate.reject(new Error('Cancelled by navigation')); await start;
});

await check('ordinary pageshow does not consume the later back-forward-cache reload handler', () => {
  const h = harness(); h.api.rrpBoot();
  h.window.emit('pageshow', { persisted: false }); h.window.emit('pageshow', { persisted: false });
  assert.equal(h.location.reloads, 0); assert.equal(h.window.listenerCount('pageshow'), 1);
  h.window.emit('pagehide'); assert.equal(h.host(), null);
  h.window.emit('pageshow', { persisted: true }); assert.equal(h.location.reloads, 1);
});

await check('leaving the supported route removes the host and stops the boot observer', () => {
  const h = harness(); h.api.rrpBoot(); h.location.pathname = '/example/'; h.reconcile();
  assert.equal(h.host(), null); assert.equal(h.observers[0].connected, false); assert.equal(h.timers.size, 0);
});

await check('unstarted toolbar follows native-video replacement rather than retaining a stale launch closure', async () => {
  const h = harness(), jobs = bootJobs(h), oldHost = h.host();
  const replacement = h.replaceVideo(); h.reconcile(); const start = h.click();
  assert(h.host() !== oldHost, 'The old toolbar must be replaced with its native video.');
  assert(jobs[0].video === replacement, 'Launch must receive the replacement video, not the old closure.');
  jobs[0].gate.resolve(); await start;
});

console.log(`Player module: ${checks} checks passed; ${failures} failed (mocked DOM/library boundaries, no live UI claims).`);
if (failures) process.exitCode = 1;
