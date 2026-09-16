import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Extracted production controller, grouping rules and room service. DOM, HLS,
// fetch and timers are controlled boundaries; this is not live-browser proof.
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
function block(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Missing implementation block: ${start}`);
  return source.slice(a, b);
}
const implementation = block('  function roomInGroup(', '  function nextOrderForGroup(')
  + block('  function createRoomService(', '\n  /* ===')
  + block('  function createWorkshopDropdown(', '  function createNativeRoomQualitySync(');
const settle = () => new Promise(resolve => setImmediate(resolve));
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); Object.values(value).forEach(freeze);
  }
  return value;
};
const room = (id, extra = {}) => ({ id, lastStatus: 'online', order: 0, groups: [], ...extra });

// Inspect the flat, emitted component rules; this is not a browser CSS/layout engine.
function styleRules(css) {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
    selectors: selectors.split(',').map(selector => selector.trim().replace(/\s+/g, ' ')),
    declarations: Object.fromEntries(body.split(';').filter(value => value.includes(':')).map(value => {
      const colon = value.indexOf(':'); return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
    })),
  }));
}
function declarationsFor(rules, selector) {
  const matching = rules.filter(rule => rule.selectors.includes(selector));
  assert(matching.length, `Missing component CSS selector: ${selector}`);
  return Object.assign({}, ...matching.map(rule => rule.declarations));
}
const nativeThemeRules = () => styleRules(block('        /* Native listing presentation.', '      `),'));

function fixture(options = {}) {
  const requests = [], timers = new Map(), observers = [], engines = [], globalEvents = [];
  let elapsed = 0, nextTimer = 0, reads = 0, writes = 0, histories = 0, globalStops = 0, maximumRequests = 0;
  class Target {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, fn, settings = {}) {
      const list = this.listeners.get(type) || []; list.push({ fn, settings }); this.listeners.set(type, list);
    }
    removeEventListener(type, fn) { this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item.fn !== fn)); }
    emit(type, extra = {}) {
      const event = { type, target: this, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, ...extra };
      for (const { fn, settings } of [...(this.listeners.get(type) || [])]) {
        if (settings.once) this.removeEventListener(type, fn);
        fn(event);
      }
      return event;
    }
  }
  class Element extends Target {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.children = []; this.parentElement = null;
      this.attributes = new Map(); this.dataset = {}; this.style = { setProperty(name, value) { this[name] = value; } };
      this.className = ''; this._text = ''; this.value = ''; this.disabled = false;
      this.rect = { top: 10, bottom: 40, left: 100, width: 120, height: 30 };
      this.pauseCalls = 0; this.playCalls = 0; this.paused = true; this.readyState = 4;
    }
    get isConnected() { return this === document.body || this === document.head || !!this.parentElement?.isConnected; }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    set textContent(value) { this._text = String(value); this.replaceChildren(); }
    get src() { return this.getAttribute('src') || ''; }
    set src(value) { this.setAttribute('src', value); }
    setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === 'id') this.id = String(value); }
    getAttribute(name) {
      if (name.startsWith('data-')) return this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] ?? null;
      return this.attributes.get(name) ?? null;
    }
    hasAttribute(name) { return this.getAttribute(name) !== null; }
    removeAttribute(name) { this.attributes.delete(name); }
    append(...nodes) { for (const node of nodes) this.insertBefore(node, null); }
    insertBefore(node, before) {
      node.remove(); const index = before ? this.children.indexOf(before) : this.children.length;
      assert(index >= 0, 'Fixture insertion reference must be a current child.');
      node.parentElement = this; this.children.splice(index, 0, node); return node;
    }
    remove() {
      if (this.parentElement) this.parentElement.children.splice(this.parentElement.children.indexOf(this), 1);
      this.parentElement = null;
    }
    replaceChildren(...nodes) { for (const node of [...this.children]) node.remove(); this.append(...nodes); }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    matches(selector) {
      return selector.split(',').some(part => {
        const value = part.trim(), tag = value.match(/^[a-z]+/i)?.[0];
        if (tag && tag.toUpperCase() !== this.tagName) return false;
        const id = value.match(/#([\w-]+)/)?.[1]; if (id && this.id !== id) return false;
        for (const match of value.matchAll(/\.([\w-]+)/g)) if (!this.className.split(/\s+/).includes(match[1])) return false;
        for (const match of value.matchAll(/\[([^=\]]+)(?:=["']?([^\]"']*)["']?)?\]/g)) {
          const attr = this.getAttribute(match[1]); if (attr === null || (match[2] !== undefined && attr !== match[2])) return false;
        }
        return true;
      });
    }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
    getBoundingClientRect() { return this.rect; }
    focus() { document.activeElement = this; }
    click() { if (!this.disabled) return this.emit('click'); }
    pause() { this.pauseCalls++; this.paused = true; }
    play() { this.playCalls++; this.paused = false; return Promise.resolve(); }
    canPlayType() { return ''; }
  }
  const document = new Target(); document.hidden = false; document.body = new Element('body'); document.head = new Element('head');
  document.createElement = tag => new Element(tag);
  document.querySelectorAll = selector => [...document.body.querySelectorAll(selector), ...document.head.querySelectorAll(selector)];
  document.querySelector = selector => document.querySelectorAll(selector)[0] || null;
  document.getElementById = id => document.querySelector(`#${id}`);
  const anchor = new Element('button'); anchor.textContent = 'Workshop'; document.body.append(anchor);
  const nativeVideo = new Element('video'); nativeVideo.dataset.multicamRoomId = 'alpha'; nativeVideo.src = 'blob:native-fixture';
  nativeVideo.paused = false; document.body.append(nativeVideo);
  const location = { href: 'https://chaturbate.com/alpha/', origin: 'https://chaturbate.com', hostname: 'chaturbate.com' };
  const window = new Target(); window.location = location;
  class Hls {
    static Events = { MANIFEST_PARSED: 'manifest', LEVELS_UPDATED: 'levels', ERROR: 'error' };
    static ErrorTypes = { NETWORK_ERROR: 'network', MEDIA_ERROR: 'media' };
    static isSupported() { return true; }
    constructor() { this.listeners = new Map(); this.destroyCalls = 0; this.levels = [{ height: 360 }, { height: 480 }]; engines.push(this); }
    on(type, fn) { this.listeners.set(type, fn); }
    loadSource(url) { this.url = url; }
    attachMedia(video) { this.video = video; video.src = 'blob:preview-fixture'; }
    stopLoad() {}
    detachMedia() { this.detached = true; }
    destroy() { this.destroyCalls++; }
  }
  window.Hls = Hls;
  const saved = freeze({ rooms: options.rooms || Array.from({ length: 10 }, (_, i) => room(i ? `room_${i}` : 'alpha', { order: i })),
    groups: [{ id: 'online', name: 'Online' }, { id: 'online-favorites', name: 'Online favorites' }, { id: 'library', name: 'Library' },
      { id: 'fav', name: 'Favorites' }, { id: 'custom', name: 'Custom group' }], settings: {} });
  const recent = freeze(options.recent || []), savedBefore = JSON.stringify(saved);
  const EventBus = { emit(type, payload) { globalEvents.push({ type, payload }); }, on() { throw new Error('Dropdown must not subscribe to global room events.'); } };
  const denyWrite = () => { writes++; throw new Error('Dropdown must not persist state.'); };
  const context = vm.createContext({ console, document, window, location, AbortController, URL, Hls, innerWidth: 1200, innerHeight: 800,
    Date: class extends Date { static now() { return 1800000000000 + elapsed; } },
    Math: Object.assign(Object.create(Math), { random: () => 0.5 }),
    ONLINE_GROUP_ID: 'online', ONLINE_FAVORITES_GROUP_ID: 'online-favorites', LIBRARY_GROUP_ID: 'library',
    FAVORITE_GROUP_ID: 'fav', DEFAULT_GROUP_ID: 'default', RECENT_FOLLOWED_GROUP_ID: 'recent-followed',
    STORE_KEY: 'fixture-store', RECENT_FOLLOWED_PREFIX: 'fixture-recent-', EventBus,
    Storage: { load() { reads++; return saved; }, save: denyWrite, update: denyWrite, add: denyWrite, remove: denyWrite },
    localStorage: { setItem: denyWrite, removeItem: denyWrite }, GM_setValue: denyWrite,
    recentFollowedRooms: () => recent, getRoomGroups: value => value?.groups || [],
    roomPageUrl: id => `${location.origin}/${id}/`, canonicalWorkshopUrl: () => `${location.origin}/?multicam=1`,
    t: key => ({ groupOnline: 'Online now', groupOnlineFav: 'Online favorites', groupLibrary: 'All saved' })[key] || key,
    normalizeUsername: value => String(value || '').toLowerCase(), isLikelyUsername: value => /^[a-z0-9_]+$/.test(value),
    safeChaturbateHost: () => true, isSafeStreamUrl: url => String(url).startsWith('https://media.example/'),
    isStableRoomStatus: status => ['online', 'offline', 'private'].includes(status),
    numeric: (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback,
    clampInt: (value, min, max, fallback) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : fallback)),
    getComputedStyle: () => ({ backgroundColor: 'rgb(20, 30, 40)' }),
    addRoomStatusHistory() { histories++; },
    stopMediaElement(video) { if (video) { video.pause(); video.removeAttribute('src'); } },
    stopAllPageMedia() { globalStops++; nativeVideo.pause(); },
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay, due: elapsed + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    IntersectionObserver: class {
      constructor(callback, settings) { this.callback = callback; this.settings = settings; this.targets = new Set(); this.connected = true; observers.push(this); }
      observe(node) { this.targets.add(node); }
      unobserve(node) { this.targets.delete(node); }
      disconnect() { this.connected = false; this.targets.clear(); }
    },
    fetch(url, settings) {
      return new Promise((resolve, reject) => {
        const request = { url, id: new URL(url).pathname.split('/').at(-2), signal: settings.signal, settled: false,
          resolve(data = { room_status: 'public', hls_source: 'https://media.example/live.m3u8' }) {
            if (this.settled) return; this.settled = true; resolve({ ok: true, json: async () => data });
          } };
        settings.signal.addEventListener('abort', () => {
          if (!options.ignoreAbort && !request.settled) { request.settled = true; reject(new Error('Controlled abort')); }
        }, { once: true });
        requests.push(request);
        maximumRequests = Math.max(maximumRequests, requests.filter(item => !item.settled && !item.signal.aborted).length);
      });
    },
  });
  vm.runInContext(`${implementation}\nglobalThis.dropdown = createWorkshopDropdown();`, context);
  const dropdown = context.dropdown; dropdown.bind(anchor);
  const panel = () => document.getElementById('ziggy-workshop-dropdown');
  const cards = () => panel()?.querySelectorAll('.wd-card') || [];
  const button = name => panel()?.querySelectorAll('button').find(node => node.textContent === name || node.getAttribute('aria-label') === name);
  const f = { context, dropdown, document, window, location, anchor, nativeVideo, requests, timers, observers, engines, globalEvents, saved,
    panel, cards, button, open() { dropdown.toggle(anchor); },
    select(id) { const tab = panel().querySelectorAll('[role=tab]').find(node => node.dataset.group === id); assert(tab, `Missing tab: ${id}`); tab.click(); },
    intersect(nodes = cards(), isIntersecting = true) {
      const observer = observers.at(-1); assert(observer?.connected); observer.callback(nodes.map(target => ({ target, isIntersecting })));
    },
    advance(ms) {
      const end = elapsed + ms;
      for (let count = 0; ; count++) {
        const next = [...timers].filter(([, timer]) => timer.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break; assert(count < 1000, 'Unbounded fixture timer loop.');
        elapsed = next[1].due; timers.delete(next[0]); next[1].fn();
      }
      elapsed = end;
    },
    async finishRequests(data) {
      for (let count = 0; count < 100; count++) {
        const pending = requests.filter(request => !request.settled && !request.signal.aborted);
        if (!pending.length) return;
        pending.forEach(request => request.resolve(data)); await settle();
      }
      throw new Error('Unbounded status requests.');
    },
    assertIsolated() {
      assert.equal(writes, 0); assert.equal(histories, 0); assert.equal(globalStops, 0); assert.equal(globalEvents.length, 0);
      assert.equal(nativeVideo.pauseCalls, 0); assert.equal(nativeVideo.src, 'blob:native-fixture');
      assert.equal(JSON.stringify(saved), savedBefore, 'Preview status must not mutate the saved snapshot.');
    },
    get reads() { return reads; }, get maximumRequests() { return maximumRequests; },
  };
  return f;
}

let passed = 0, failed = 0;
async function check(name, run) {
  try { await run(); passed++; console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); }
}

await check('closed binding is idempotent and performs no storage reads, requests or media work', () => {
  const f = fixture(); f.dropdown.bind(f.anchor); f.dropdown.sync();
  assert.equal(f.anchor.listeners.get('mouseenter').length, 1); assert.equal(f.reads, 0);
  assert.equal(f.panel(), null); assert.equal(f.requests.length, 0); assert.equal(f.engines.length, 0);
  f.anchor.emit('mouseenter'); f.advance(179); assert.equal(f.panel(), null);
  f.anchor.emit('mouseleave'); f.advance(1000); assert.equal(f.panel(), null);
  f.document.hidden = true; f.open(); assert.equal(f.reads, 0); f.assertIsolated();
});

await check('opening presents categories and safe full-Workshop link without loading offscreen media', async () => {
  const f = fixture(); f.open();
  assert.equal(f.reads, 1); assert.equal(f.anchor.getAttribute('aria-expanded'), 'true');
  assert.deepEqual(f.panel().querySelectorAll('[role=tab]').map(node => node.textContent),
    ['Online now', 'Online favorites', 'Recently followed', 'All saved']);
  const full = f.panel().querySelector('.wd-full');
  assert.equal(full.href, 'https://chaturbate.com/?multicam=1'); assert.equal(full.target, '_blank'); assert.equal(full.rel, 'noopener');
  assert.equal(f.cards().length, 10); assert.equal(f.requests.length, 4);
  assert.equal(f.panel().querySelectorAll('video').length, 0); assert.equal(f.panel().querySelectorAll('img[src]').length, 0);
  f.dropdown.close(); await settle(); assert.equal(f.timers.size, 0); f.assertIsolated();
});

await check('status work stays at four concurrent requests when visible online previews join the queue', async () => {
  const f = fixture(); f.open(); f.intersect();
  assert(f.maximumRequests <= 4, `Observed ${f.maximumRequests} concurrent requests.`);
  await f.finishRequests(); f.advance(100); assert(f.maximumRequests <= 4);
  f.dropdown.close(); await settle(); f.assertIsolated();
});

await check('only visible cards own media, at most six videos play, and offscreen/close destroys their engines', async () => {
  const f = fixture(); f.open(); await f.finishRequests(); f.advance(100);
  assert.equal(f.engines.length, 0); f.intersect(); await f.finishRequests(); f.advance(100);
  assert.equal(f.panel().querySelectorAll('video').length, 6);
  f.engines.forEach(engine => engine.listeners.get('manifest')?.());
  assert(f.panel().querySelectorAll('video').every(video => video.playCalls === 1));
  const first = f.cards().slice(0, 2), oldVideos = first.map(card => card.querySelector('video'));
  for (const video of f.panel().querySelectorAll('video')) { assert.equal(video.muted, true); assert.equal(video.autoplay, true); }
  f.intersect(first, false); await settle();
  assert(oldVideos.every(video => !video.isConnected && video.pauseCalls > 0));
  assert.equal(f.panel().querySelectorAll('video').length, 6);
  assert(first.every(card => !card.querySelector('img').hasAttribute('src')));
  f.dropdown.close(); await settle();
  assert(f.engines.every(engine => engine.destroyCalls === 1)); assert.equal(f.timers.size, 0); f.assertIsolated();
});

await check('close aborts pending status work and late noncooperative responses cannot remount or persist', async () => {
  const f = fixture({ ignoreAbort: true }); f.open(); const pending = [...f.requests], panel = f.panel();
  f.dropdown.close(); assert(pending.every(request => request.signal.aborted)); assert.equal(panel.isConnected, false);
  pending.forEach(request => request.resolve()); await settle(); f.advance(1000);
  assert.equal(f.panel(), null); assert.equal(f.requests.length, pending.length); assert.equal(f.engines.length, 0);
  assert.equal(f.timers.size, 0); f.assertIsolated();
});

await check('category switch cancels previous probes and destroys previews before rendering the new category', async () => {
  const f = fixture({ ignoreAbort: true, rooms: [room('alpha', { groups: ['fav'] }), room('beta'), room('gamma'), room('delta'), room('epsilon')] });
  f.open(); f.intersect(); const pending = [...f.requests], oldVideos = f.panel().querySelectorAll('video');
  f.select('online-favorites');
  assert(pending.every(request => request.signal.aborted), 'Previous category probes must be aborted.');
  assert(oldVideos.every(video => !video.isConnected));
  assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['alpha']);
  const count = f.requests.length; pending.forEach(request => request.resolve()); await settle(); f.advance(100);
  assert.equal(f.requests.length, count, 'Old workers must not continue after category change.');
  f.dropdown.close(); await settle(); f.assertIsolated();
});

await check('categories preserve online/favorite membership, saved ordering, recent order and groups without writing storage', async () => {
  const f = fixture({ rooms: [room('alpha', { groups: ['fav'], order: 3 }), room('beta', { order: 1, lastStatus: 'offline' }),
    room('gamma', { groups: ['custom'], order: 2 })], recent: [room('unsaved'), room('alpha')] });
  f.open(); assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['gamma', 'alpha']);
  f.select('online-favorites'); assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['alpha']);
  f.select('recent-followed'); assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['unsaved', 'alpha']);
  f.select('library'); assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['beta', 'gamma', 'alpha']);
  const groups = f.panel().querySelector('select'); groups.value = 'custom'; groups.emit('change');
  assert.deepEqual(f.cards().map(card => card.dataset.workshopPreviewId), ['gamma']);
  assert.equal(f.cards()[0].href, 'https://chaturbate.com/gamma/'); f.dropdown.close(); await settle(); f.assertIsolated();
});

await check('hidden, changed route, detached anchor and pagehide release all owned work', async () => {
  for (const mode of ['hidden', 'route', 'anchor', 'pagehide']) {
    const f = fixture(); f.open(); f.intersect(); const requests = [...f.requests];
    if (mode === 'hidden') { f.document.hidden = true; f.document.emit('visibilitychange'); }
    if (mode === 'route') { f.location.href = 'https://chaturbate.com/beta/'; f.dropdown.sync(); }
    if (mode === 'anchor') { f.anchor.remove(); f.dropdown.sync(); }
    if (mode === 'pagehide') f.window.emit('pagehide');
    await settle(); assert.equal(f.panel(), null, mode); assert(requests.every(request => request.signal.aborted), mode);
    assert.equal(f.timers.size, 0, mode); assert(f.observers.every(observer => !observer.connected), mode); f.assertIsolated();
  }
});

await check('repeated opening owns one panel, one observer and no previous request continuation', async () => {
  const f = fixture({ ignoreAbort: true });
  for (let cycle = 0; cycle < 5; cycle++) {
    f.open(); f.dropdown.sync(); assert.equal(f.document.querySelectorAll('#ziggy-workshop-dropdown').length, 1);
    assert.equal(f.observers.filter(observer => observer.connected).length, 1);
    const pending = f.requests.filter(request => !request.settled); f.dropdown.close();
    pending.forEach(request => request.resolve()); await settle();
    assert.equal(f.panel(), null); assert.equal(f.timers.size, 0); f.assertIsolated();
  }
  assert.equal(f.document.querySelectorAll('#ziggy-workshop-dropdown-style').length, 1);
});

await check('outside click, Escape and full Workshop link close while preserving native playback', async () => {
  for (const mode of ['outside', 'escape', 'full']) {
    const f = fixture(); f.open();
    if (mode === 'outside') f.document.emit('pointerdown', { target: f.nativeVideo });
    if (mode === 'escape') { f.document.emit('keydown', { key: 'Escape' }); assert.equal(f.document.activeElement, f.anchor); }
    if (mode === 'full') f.panel().querySelector('.wd-full').click();
    await settle(); assert.equal(f.panel(), null); f.assertIsolated();
  }
});

await check('isolated room service stopAll never stops same-room native video or emits global room events', async () => {
  const f = fixture();
  f.context.previewStore = { state: { rooms: [room('alpha')], settings: { notifyOnline: false, pollMs: { online: 120000, offline: 120000, private: 120000, error: 30000 } } },
    patchRoom(id, patch) { Object.assign(this.state.rooms.find(item => item.id === id), patch); } };
  f.context.previewEvents = [];
  const service = vm.runInContext(`createRoomService(previewStore, { recordHistory:false, isolateMedia:true,
    eventBus:{ emit(name, data) { previewEvents.push({name,data}); } } })`, f.context);
  const request = service.probe('alpha'); f.requests[0].resolve({ room_status: 'offline' }); await request;
  assert(f.context.previewEvents.length > 0); service.stopAll(); service.stop('alpha'); f.assertIsolated();
});

await check('dropdown rows reserve natural name height outside the 16:9 media box', async () => {
  const f = fixture(); f.open();
  const rules = styleRules(f.document.getElementById('ziggy-workshop-dropdown-style').textContent);
  const grid = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-grid');
  const media = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-media');
  const card = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-card');
  const name = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-name');
  assert.equal(grid['grid-auto-rows'], 'max-content'); assert.equal(grid['align-content'], 'start');
  assert.equal(media['aspect-ratio'], '16/9'); assert.equal(media.position, 'relative');
  assert.equal(card.display, 'block'); assert(!card.height || card.height === 'auto');
  assert.equal(card['aspect-ratio'], undefined, 'The ratio belongs to media, not the entire card including its name.');
  assert(!name.position || name.position === 'static'); assert.notEqual(name.height, '0');
  for (const root of f.cards()) {
    const mediaNode = root.querySelector('.wd-media'), nameNode = root.querySelector('.wd-name');
    assert.equal(nameNode.parentElement, root); assert.equal(mediaNode.parentElement, root);
    assert.equal(root.children.indexOf(nameNode), root.children.indexOf(mediaNode) + 1);
    assert.equal(nameNode.textContent, root.dataset.workshopPreviewId);
  }
  for (const selector of ['#ziggy-workshop-dropdown .wd-media img', '#ziggy-workshop-dropdown .wd-media video']) {
    const child = declarationsFor(rules, selector);
    assert.equal(child.position, 'absolute'); assert.equal(child.width, '100%'); assert.equal(child.height, '100%');
  }
  f.dropdown.close(); await settle(); f.assertIsolated();
});

await check('full Workshop phone inline media stays 16:9 with fullscreen, split and pure-mode exclusions', () => {
  const rules = nativeThemeRules();
  const phone = declarationsFor(rules,
    'body.rg-workshop-native.rg-phone-device:not(.rg-pure-mode) .grid:not(.view-split) .cam-card:not(:fullscreen) > .cam-media:not(:fullscreen)');
  assert.equal(phone['aspect-ratio'], '16/9!important');
  const ratioRules = rules.filter(rule => rule.declarations['aspect-ratio'] && rule.selectors.some(selector => selector.includes('.cam-media')));
  assert(ratioRules.length >= 2, 'Both general and phone-specific inline rules must be covered.');
  for (const rule of ratioRules) for (const selector of rule.selectors) {
    assert.match(selector, /^body\.rg-workshop-native/);
    assert(selector.includes(':not(.rg-pure-mode)')); assert(selector.includes('.grid:not(.view-split)'));
    assert(selector.includes('.cam-card:not(:fullscreen) > .cam-media:not(:fullscreen)'));
    assert.equal(rule.declarations['aspect-ratio'], '16/9!important');
  }
  const grid = declarationsFor(rules, 'body.rg-workshop-native .grid:not(.view-split)');
  assert.equal(grid['grid-auto-rows'], 'max-content!important');
});

await check('dropdown themed scrollbar rules stay inside its owned scroll grid', async () => {
  const f = fixture(); f.open();
  const rules = styleRules(f.document.getElementById('ziggy-workshop-dropdown-style').textContent);
  const themed = rules.filter(rule => Object.keys(rule.declarations).some(key => key.startsWith('scrollbar-'))
    || rule.selectors.some(selector => selector.includes('::-webkit-scrollbar')));
  assert.equal(themed.length, 4, 'Standard scrollbar colors and WebKit bar/track/thumb must all be present.');
  for (const rule of themed) for (const selector of rule.selectors) {
    assert.match(selector, /^#ziggy-workshop-dropdown \.wd-grid(?:::?-webkit-scrollbar(?:-track|-thumb)?)?$/,
      'A dropdown scrollbar rule must never target the page or another component.');
  }
  const grid = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-grid');
  assert.equal(grid['scrollbar-width'], 'thin');
  assert.match(grid['scrollbar-color'], /var\(--wd-muted,[^)]+\) var\(--wd-bg,[^)]+\)/);
  const track = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-grid::-webkit-scrollbar-track');
  const thumb = declarationsFor(rules, '#ziggy-workshop-dropdown .wd-grid::-webkit-scrollbar-thumb');
  assert.match(track.background, /^var\(--wd-bg,/); assert.match(thumb.background, /^var\(--wd-muted,/);
  assert(thumb.border.includes(track.background), 'The thumb border must share the themed track background.');
  f.dropdown.close(); await settle();
});

await check('native Workshop themed scrollbars are scoped to its grid, sidebar and category strip', () => {
  // The pre-existing legacy Workshop stylesheet has separate generic rules;
  // these guards cover the native-listing theme added by this scoped change.
  const rules = nativeThemeRules(), containers = ['.grid', '.sidebar', '.rg-native-categories'];
  const themed = rules.filter(rule => Object.keys(rule.declarations).some(key => key.startsWith('scrollbar-'))
    || rule.selectors.some(selector => selector.includes('::-webkit-scrollbar')));
  for (const rule of themed) for (const selector of rule.selectors) {
    assert.match(selector, /^body\.rg-workshop-native /, 'The native Workshop theme must not introduce global scrollbar styling.');
  }
  for (const container of containers) {
    const selector = `body.rg-workshop-native ${container}`, normal = declarationsFor(rules, selector);
    assert.equal(normal['scrollbar-width'], 'thin');
    const colors = normal['scrollbar-color']?.match(/#[\da-f]{3,8}/gi);
    assert.equal(colors?.length, 2); assert.notEqual(colors[0], colors[1]);
    assert.equal(declarationsFor(rules, `${selector}::-webkit-scrollbar-track`).background, colors[1]);
    const thumb = declarationsFor(rules, `${selector}::-webkit-scrollbar-thumb`);
    assert.equal(thumb.background, colors[0]); assert(thumb.border.includes(colors[1]));
    assert.equal(declarationsFor(rules, `${selector}::-webkit-scrollbar`).width, '9px');
  }
});

console.log(`Workshop dropdown: ${passed} checks passed; ${failed} failed (controlled DOM/network/media boundaries).`);
if (failed) process.exitCode = 1;
