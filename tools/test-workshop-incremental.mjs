import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

// These fixtures execute extracted shipped functions. Mutation counts measure
// calls to DOM-writing APIs, not estimated browser timing or live-site parity.
const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
function block(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Missing shipped source block: ${start}`);
  return source.slice(a, b);
}
const tests = [];
const test = (name, run) => tests.push({ name, run });

function domFixture() {
  const counts = { style: 0, attributes: 0, html: 0, text: 0, children: 0, classList: 0 };
  class Node {
    constructor(tag = 'div', props = {}, children = []) {
      this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = new Map();
      this.listeners = new Map(); this._text = ''; this._html = ''; this.hidden = false;
      this.style = new Proxy({}, { set(object, key, value) { counts.style++; object[key] = value; return true; } });
      const classes = new Set();
      this.classList = {
        contains: value => classes.has(value),
        add(...values) { counts.classList++; values.forEach(value => classes.add(value)); },
        remove(...values) { counts.classList++; values.forEach(value => classes.delete(value)); },
        toggle(value, force) { counts.classList++; const on = force ?? !classes.has(value); if (on) classes.add(value); else classes.delete(value); return on; },
      };
      Object.assign(this, props); this.append(...(Array.isArray(children) ? children : [children]));
    }
    get isConnected() { return !!this.parentElement || this.tagName === 'BODY'; }
    get firstElementChild() { return this.children[0] || null; }
    get nextElementSibling() { const siblings = this.parentElement?.children || []; return siblings[siblings.indexOf(this) + 1] || null; }
    get textContent() { return this._text + this.children.map(node => node.textContent ?? String(node)).join(''); }
    set textContent(value) { counts.text++; this._text = String(value); this.children = []; }
    get innerHTML() { return this._html; }
    set innerHTML(value) { counts.html++; this._html = String(value); this.children = []; }
    append(...nodes) { nodes.filter(node => node !== null && node !== undefined).forEach(node => this.appendChild(node)); }
    appendChild(node) { counts.children++; node.remove?.(); if (typeof node === 'object') node.parentElement = this; this.children.push(node); return node; }
    insertBefore(node, cursor) { counts.children++; node.remove(); const index = cursor ? this.children.indexOf(cursor) : this.children.length; assert.ok(index >= 0); this.children.splice(index, 0, node); node.parentElement = this; return node; }
    replaceChildren(...nodes) { counts.children++; this.children.forEach(node => { if (typeof node === 'object') node.parentElement = null; }); this.children = []; this._text = ''; this.append(...nodes); }
    remove() { if (this.parentElement) { counts.children++; this.parentElement.children = this.parentElement.children.filter(node => node !== this); this.parentElement = null; } }
    setAttribute(name, value) { counts.attributes++; this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(callback); }
    removeEventListener(type, callback) { this.listeners.set(type, (this.listeners.get(type) || []).filter(fn => fn !== callback)); }
    querySelector() { return null; }
    contains(node) { return node === this || this.children.some(child => child.contains?.(node)); }
  }
  const reset = () => Object.keys(counts).forEach(key => { counts[key] = 0; });
  return { Node, counts, reset };
}

function cardFixture(status = 'offline') {
  const dom = domFixture(), { Node } = dom;
  const room = { id: 'alpha', lastStatus: status, muted: true, lastSeenOnline: 500, groups: ['library'] };
  const body = new Node('body'), root = new Node('article'); body.append(root);
  const card = { root, badge: new Node(), infoMeta: new Node(), statusEl: new Node(),
    favoriteBtn: new Node('button'), splitBtn: new Node('button'), muteBtn: new Node('button'), removeBtn: new Node('button'), video: null };
  const cardMap = new Map([[room.id, card]]); let detaches = 0;
  const ctx = vm.createContext({ console, cardMap, LANG: 'en', store: { state: { rooms: [room], settings: { splitRoomIds: [], activeGroup: 'library', volume: 0.7 } } },
    currentSavedRoomIndex: () => new Map([[room.id, room]]), findRoomAny: () => room,
    roomInGroup: (item, group) => item.groups.includes(group), FAVORITE_GROUP_ID: 'favorites', LIBRARY_GROUP_ID: 'library',
    ONLINE_GROUP_ID: 'online', ONLINE_FAVORITES_GROUP_ID: 'onlineFavorites', RECENT_FOLLOWED_GROUP_ID: 'recent',
    statusMeta: value => ({ label: value[0].toUpperCase() + value.slice(1), color: value === 'online' ? '#0f0' : '#999' }),
    fmtTime: value => `${value} ago`, t: (...args) => args.join(' '), $: (...args) => new Node(...args),
    setElementHint(node, value) { node.setAttribute('title', value); node.setAttribute('aria-label', value); },
    trustedHtml: value => value, iconSvg: value => `<svg>${value}</svg>`, setTrustedHtml: (node, value) => { node.innerHTML = value; },
    service: { detachVideo() { detaches++; }, refresh() {} }, resumeWaitingRecording() {},
  });
  vm.runInContext(block('    function updateCardButtons(', '    function captureCardScreenshot(')
    + block('    function renderCardState(', '    function getVideoTransform('), ctx);
  return { ...dom, room, card, ctx, cardMap, detaches: () => detaches };
}

test('100 unchanged offline renders keep the overlay, retry button and all DOM fields', () => {
  const f = cardFixture(); f.ctx.renderCardState(f.room);
  const children = [...f.card.statusEl.children], retry = children.find(node => node.tagName === 'BUTTON');
  assert.ok(retry, 'offline status remains manually retryable'); f.reset(); const detaches = f.detaches();
  for (let n = 0; n < 100; n++) f.ctx.renderCardState(f.room);
  assert.deepEqual(f.card.statusEl.children, children);
  assert.equal(f.card.statusEl.children.find(node => node.tagName === 'BUTTON'), retry);
  assert.ok(!f.card.badge.textContent.includes('null'));
  assert.equal(f.detaches(), detaches, 'unchanged missing video does not repeatedly detach');
  assert.deepEqual(f.counts, { style: 0, attributes: 0, html: 0, text: 0, children: 0, classList: 0 });
});

test('changed offline fields update once; online transition hides rather than destroys the overlay', () => {
  const f = cardFixture(); f.ctx.renderCardState(f.room); const first = f.card.statusEl.children[0];
  f.room.lastSeenOnline = 800; f.ctx.renderCardState(f.room);
  assert.notEqual(f.card.statusEl.children[0], first);
  assert.match(f.card.statusEl.textContent, /800 ago/);
  const offlineChildren = [...f.card.statusEl.children]; f.reset();
  f.ctx.renderCardState(f.room); assert.equal(f.counts.children, 0);
  f.room.lastStatus = 'online'; f.ctx.renderCardState(f.room);
  assert.equal(f.card.statusEl.style.display, 'none'); assert.deepEqual(f.card.statusEl.children, offlineChildren);
  f.room.lastStatus = 'offline'; f.ctx.renderCardState(f.room);
  assert.equal(f.card.statusEl.style.display, 'flex');
  assert.equal(f.card.statusEl.children.filter(node => node.tagName === 'BUTTON').length, 1);
});

test('an unexpected video on an unchanged offline card is still detached without rebuilding its overlay', () => {
  const f = cardFixture(); f.ctx.renderCardState(f.room); const children = [...f.card.statusEl.children], before = f.detaches();
  f.card.video = new f.Node('video'); f.reset(); f.ctx.renderCardState(f.room);
  assert.equal(f.detaches(), before + 1); assert.equal(f.card.video, null);
  assert.deepEqual(f.card.statusEl.children, children); assert.equal(f.counts.children, 0);
});

test('unchanged card actions preserve icons; mute/favorite/split changes remain represented', () => {
  const f = cardFixture('online'); f.ctx.updateCardButtons(f.room.id); const icon = f.card.muteBtn.innerHTML; f.reset();
  for (let n = 0; n < 100; n++) f.ctx.updateCardButtons(f.room.id);
  assert.equal(f.card.muteBtn.innerHTML, icon);
  assert.equal(f.counts.html + f.counts.attributes + f.counts.classList, 0);
  f.room.muted = false; f.ctx.updateCardButtons(f.room.id); assert.notEqual(f.card.muteBtn.innerHTML, icon);
  assert.equal(f.counts.html, 1);
  f.room.groups.push('favorites'); f.ctx.updateCardButtons(f.room.id);
  assert.equal(f.card.favoriteBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(f.counts.html, 1, 'unrelated favorite updates must not rewrite the mute icon');
  f.ctx.store.state.settings.splitRoomIds = [f.room.id]; f.ctx.updateCardButtons(f.room.id);
  assert.equal(f.card.splitBtn.getAttribute('aria-pressed'), 'true');
  f.ctx.store.state.settings.activeGroup = 'recent'; f.ctx.updateCardButtons(f.room.id);
  assert.equal(f.card.removeBtn.hidden, true);
});

test('repeated card mute application does not write unchanged media state', () => {
  const f = cardFixture('online'); let writes = 0;
  f.card.video = new Proxy({ volume: 0, muted: true }, { set(object, key, value) { writes++; object[key] = value; return true; } });
  for (let n = 0; n < 100; n++) f.ctx.applyMute(f.room.id);
  assert.equal(writes, 0); f.room.muted = false; f.ctx.applyMute(f.room.id);
  assert.equal(f.card.video.volume, 0.7); assert.equal(f.card.video.muted, false); assert.equal(writes, 2);
  f.ctx.store.state.settings.splitViewActive = true; f.ctx.store.state.settings.splitRoomIds = [f.room.id];
  f.ctx.store.state.settings.splitAudioRoomId = 'beta'; f.ctx.applyMute(f.room.id);
  assert.equal(f.card.video.volume, 0); assert.equal(f.card.video.muted, true);
});

test('100 unchanged adaptive card sizings have zero style/class writes; split reset is exact', () => {
  const f = domFixture(), card = new f.Node('article');
  const ctx = vm.createContext({}); vm.runInContext(block('    function applyCardGridSizing(', '    function resetCardSizing('), ctx);
  ctx.applyCardGridSizing(card, { id: 'alpha' }); f.reset();
  for (let n = 0; n < 100; n++) ctx.applyCardGridSizing(card, { id: 'alpha' });
  assert.equal(f.counts.style + f.counts.classList, 0);
  card.style.width = '640px'; card.style.height = '360px'; card.style.gridColumn = '1'; card.style.gridRow = '2';
  card.classList.add('is-split-card'); ctx.applyCardGridSizing(card, { id: 'alpha' });
  assert.equal(card.style.width, '100%'); assert.equal(card.style.height, 'auto'); assert.equal(card.style.aspectRatio, 'auto');
  assert.equal(card.style.gridColumn, ''); assert.equal(card.style.gridRow, ''); assert.equal(card.classList.contains('is-split-card'), false);
});

test('stable order preserves cards/media/focus and membership changes only insert the new card', () => {
  const f = domFixture(), grid = new f.Node('body'), cardMap = new Map();
  for (const id of ['a', 'b', 'c']) { const root = new f.Node('article', { id }), video = new f.Node('video'); root.append(video); grid.append(root); cardMap.set(id, { root, video }); }
  const original = [...grid.children], focused = cardMap.get('b').root, video = cardMap.get('b').video;
  const ctx = vm.createContext({ grid, cardMap, document: { activeElement: focused, createDocumentFragment: () => new f.Node('fragment') },
    syncLayoutControls() {}, activateCardEntry() {}, resetCardSizing() {}, applyCardGridSizing() {}, requestRoomMediaIfNeeded() {}, renderCardState() {},
    buildCard(room) { cardMap.set(room.id, { root: new f.Node('article', { id: room.id }), video: null }); },
  });
  vm.runInContext(block('    function renderGridLayout(', '    // ---- 渲染调度'), ctx); f.reset();
  const rooms = ids => ids.map(id => ({ id }));
  for (let n = 0; n < 100; n++) ctx.renderGridLayout(rooms(['a', 'b', 'c']));
  assert.deepEqual(grid.children, original); assert.equal(f.counts.children, 0);
  ctx.renderGridLayout(rooms(['c', 'a', 'b'])); assert.deepEqual(grid.children.map(node => node.id), ['c', 'a', 'b']);
  assert.equal(f.counts.children, 2, 'one existing card detach/insert is enough');
  f.reset(); ctx.renderGridLayout(rooms(['c', 'new', 'a', 'b']));
  assert.deepEqual(grid.children.map(node => node.id), ['c', 'new', 'a', 'b']); assert.equal(f.counts.children, 1);
  assert.equal(cardMap.get('b').video, video); assert.equal(ctx.document.activeElement, focused);
});

test('combined grid rendering never resets and rewrites already-correct adaptive card styles', () => {
  const f = domFixture(), grid = new f.Node('body'), cardMap = new Map(), list = ['alpha', 'beta'].map(id => ({ id }));
  for (const room of list) { const root = new f.Node('article'); grid.append(root); cardMap.set(room.id, { root }); }
  const ctx = vm.createContext({ grid, cardMap, document: { createDocumentFragment: () => new f.Node('fragment') },
    syncLayoutControls() {}, activateCardEntry() {}, requestRoomMediaIfNeeded() {}, renderCardState() {},
  });
  vm.runInContext(block('    function applyCardGridSizing(', "    window.addEventListener('resize', debounce(")
    + block('    function renderGridLayout(', '    // ---- 渲染调度'), ctx);
  ctx.renderGridLayout(list); f.reset();
  for (let n = 0; n < 100; n++) ctx.renderGridLayout(list);
  assert.equal(f.counts.style + f.counts.classList + f.counts.children, 0, 'idempotent sizing must also remain idempotent through its real caller');
});

function panFixture(initial = {}) {
  const dom = domFixture(), { Node } = dom, body = new Node('body'), card = new Node('article'), video = new Node('video');
  body.append(card); card.append(video);
  const listeners = new Map(), documentListeners = new Map(), frames = new Map(); let frameId = 0, writes = 0;
  const settings = { freeZoom: true, videoTransforms: { alpha: { mirror: true, flip: false, rotation: 90, zoom: 2, x: 0, y: 0, ...initial } } };
  const ctx = vm.createContext({ console, cardMap: new Map([['alpha', { root: card, video }]]), normalizeUsername: value => value,
    window: { addEventListener(type, callback) { listeners.set(type, callback); } },
    document: { hidden: false, addEventListener(type, callback) { documentListeners.set(type, callback); } },
    store: { state: { settings }, update(mutator) { writes++; mutator(this.state); } },
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; }, cancelAnimationFrame(id) { frames.delete(id); },
  });
  vm.runInContext(block('  function defaultVideoTransform(', '  function encodeSharePayload(')
    + block('    function getVideoTransform(', '    function rememberWorkshopPause('), ctx);
  ctx.installCardZoomHandlers(card, 'alpha');
  const event = (x = 0, y = 0) => ({ button: 0, clientX: x, clientY: y, preventDefault() {}, target: card });
  const start = (x = 0, y = 0) => card.listeners.get('mousedown')[0](event(x, y));
  const move = (x, y) => listeners.get('mousemove')(event(x, y));
  const flushFrame = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); };
  const state = () => JSON.parse(JSON.stringify(settings.videoTransforms.alpha));
  return { ...dom, card, video, ctx, listeners, documentListeners, frames, start, move, flushFrame, state, writes: () => writes };
}

test('100 pan moves paint only one frame and persist the exact final transform once', () => {
  const f = panFixture({ x: 10, y: -20 }); f.start(5, 8); f.reset();
  for (let n = 1; n <= 100; n++) f.move(5 + n, 8 + n * 2);
  assert.equal(f.writes(), 0, 'pointer movement is transient');
  assert.equal(f.frames.size, 1, 'coalesce all pending movement into one animation frame');
  assert.equal(f.counts.style, 0, 'no immediate per-movement video style writes');
  f.flushFrame(); assert.match(f.video.style.transform, /translate\(110px, 180px\)/);
  assert.equal(f.writes(), 0); assert.equal(f.frames.size, 0);
  f.listeners.get('mouseup')();
  assert.equal(f.writes(), 1); assert.deepEqual(f.state(), { mirror: true, flip: false, rotation: 90, zoom: 2, x: 110, y: 180 });
  f.listeners.get('mouseup')(); assert.equal(f.writes(), 1, 'duplicate release cannot commit again');
});

test('mouse release before the animation frame still preserves its latest movement', () => {
  const f = panFixture(); f.start(); f.move(17, 23); f.listeners.get('mouseup')();
  assert.equal(f.frames.size, 0); assert.equal(f.writes(), 1); assert.equal(f.state().x, 17); assert.equal(f.state().y, 23);
});

for (const mode of ['blur', 'pagehide', 'hidden', 'disconnected']) test(`pan cancellation after ${mode} cannot later write`, () => {
  const f = panFixture({ x: 13, y: 27 }); f.start(); f.move(40, 60); f.flushFrame(); f.move(50, 70);
  if (mode === 'hidden') { f.ctx.document.hidden = true; f.documentListeners.get('visibilitychange')(); }
  else if (mode === 'disconnected') { f.card.remove(); f.move(60, 80); }
  else f.listeners.get(mode)();
  f.flushFrame(); f.listeners.get('mouseup')();
  assert.equal(f.frames.size, 0); assert.equal(f.writes(), 0);
  assert.equal(f.state().x, 13); assert.equal(f.state().y, 27);
  assert.equal(f.card.classList.contains('video-panning'), false);
});

for (const boundary of ['move', 'frame', 'release']) test(`newer persisted transform during pan is retained at ${boundary}`, () => {
  const f = panFixture(); f.start(); f.move(100, 200);
  const newer = { mirror: false, flip: true, rotation: 180, zoom: 3, x: 31, y: 47 };
  f.ctx.store.state.settings.videoTransforms.alpha = { ...newer };
  if (boundary === 'move') f.move(110, 210);
  else if (boundary === 'frame') f.flushFrame();
  f.listeners.get('mouseup')(); f.flushFrame();
  assert.equal(f.writes(), 0); assert.deepEqual(f.state(), newer);
  assert.equal(f.card.classList.contains('video-panning'), false);
});

for (const boundary of ['move', 'frame', 'release']) test(`replacement preview cancels its previous pan at ${boundary}`, () => {
  const f = panFixture(); f.start(); f.move(100, 200);
  const replacement = new f.Node('video'); f.video.remove(); f.card.append(replacement);
  f.ctx.cardMap.get('alpha').video = replacement;
  if (boundary === 'move') f.move(110, 210);
  else if (boundary === 'frame') f.flushFrame();
  f.listeners.get('mouseup')(); f.flushFrame();
  assert.equal(f.writes(), 0); assert.equal(f.state().x, 0); assert.equal(f.state().y, 0);
  assert.equal(f.frames.size, 0); assert.equal(f.card.classList.contains('video-panning'), false);
});

test('pan bounds retain the old clamped-per-movement final transform on reversing direction', () => {
  const f = panFixture({ x: 4990, y: -4990 }); f.start(); f.move(100, -100); f.move(90, -90); f.listeners.get('mouseup')();
  assert.equal(f.state().x, 4990, '100px movement clamps to 5000, then 10px reverse ends at 4990');
  assert.equal(f.state().y, -4990);
});

test('status-only room notifications do not rebuild Groups or invalidate unchanged membership/order', () => {
  const room = { id: 'alpha', lastStatus: 'offline', muted: true }, state = { rooms: [room], settings: { activeGroup: 'online', sortBy: 'manual', filter: {} } };
  let subscriber, cards = 0, sidebar = 0, counts = 0, grid = 0;
  const ctx = vm.createContext({
    store: { state, subscribe(callback) { subscriber = callback; } },
    currentSavedRoomIndex: () => new Map([[room.id, room]]), renderedRoomStatuses: new Map([[room.id, room.lastStatus]]),
    renderCardState() { cards++; }, scheduleSidebarRender() { sidebar++; }, scheduleWorkshopSidebarCounts() { counts++; }, scheduleGridRender() { grid++; },
    workshopRefreshState: { busy: false }, ONLINE_GROUP_ID: 'online', ONLINE_FAVORITES_GROUP_ID: 'onlineFavorites',
  });
  vm.runInContext(block('    store.subscribe((state, path) => {', '    // ---- EventBus 订阅 ----'), ctx);
  for (let n = 0; n < 100; n++) { room.lastSeenOnline = n; subscriber(state, 'room:alpha'); }
  assert.equal(cards, 100, 'the affected card still receives its latest fields');
  assert.equal(sidebar + counts + grid, 0, 'unchanged status is not a category/order change');
  room.lastStatus = 'online'; subscriber(state, 'room:alpha');
  assert.equal(sidebar, 0); assert.equal(counts, 1); assert.equal(grid, 1, 'Online membership must be reconciled');
  room.muted = false; subscriber(state, 'room:alpha'); assert.equal(counts, 1); assert.equal(grid, 1);
  state.settings.activeGroup = 'library'; room.lastStatus = 'offline'; subscriber(state, 'room:alpha');
  assert.equal(counts, 2); assert.equal(grid, 1, 'manual unfiltered library order does not depend on room status');
  state.settings.filter.hideOffline = true; room.lastStatus = 'online'; subscriber(state, 'room:alpha');
  assert.equal(counts, 3); assert.equal(grid, 2, 'explicit status filtering still invalidates membership');
});

test('visibility reconciliation reads the grid and each card once per pass, never across scrolls', () => {
  let gridReads = 0, requests = 0, releases = 0; const cardReads = new Map();
  const rect = { top: 0, left: 0, bottom: 500, right: 500, width: 500, height: 500 };
  const entries = ['alpha', 'beta', 'gamma'].map(id => [id, { root: { isConnected: true,
    getBoundingClientRect() { cardReads.set(id, (cardReads.get(id) || 0) + 1); return { ...rect }; }, contains() { return false; } } }]);
  const ctx = vm.createContext({ console, document: { hidden: false }, workshopPageSuspended: false, mediaVisibilityRaf: 0, cardVisibilityRead: null,
    cardMap: new Map(entries), mediaViewportIds: new Set(), innerHeight: 800, innerWidth: 1000,
    grid: { contains() { return true; }, getBoundingClientRect() { gridReads++; return { ...rect }; } },
    requestRoomMediaIfNeeded(id) { requests++; assert.equal(ctx.isCardNearViewport(id), true, 'nested request reuses its pass geometry'); },
    releaseRoomMediaIfPossible() { releases++; },
  });
  vm.runInContext(block('    function isRoomMediaProtected(', '    function requestRoomMediaNow(')
    + block('    function reconcileWorkshopMediaVisibility(', '    function scheduleWorkshopMediaVisibility('), ctx);
  ctx.reconcileWorkshopMediaVisibility();
  assert.equal(gridReads, 1); assert.equal(requests, 3); assert.equal(releases, 0);
  assert.deepEqual([...cardReads.values()], [1, 1, 1]);
  rect.top = 1000; rect.bottom = 1500; ctx.reconcileWorkshopMediaVisibility();
  assert.equal(gridReads, 2); assert.equal(requests, 3); assert.equal(releases, 3);
  assert.deepEqual([...cardReads.values()], [2, 2, 2], 'scroll pass must not reuse stale rectangles');
  const before = gridReads; ctx.isCardNearViewport('alpha'); assert.equal(gridReads, before + 1, 'cache is released after the pass');
  ctx.document.hidden = true; ctx.reconcileWorkshopMediaVisibility(); assert.equal(gridReads, before + 1, 'hidden reconciliation avoids layout reads');
});

test('a failed media reconciliation releases its pass-local geometry cache', () => {
  let gridReads = 0, cardReads = 0;
  const rect = { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 };
  const root = { isConnected: true, getBoundingClientRect() { cardReads++; return rect; }, contains() { return false; } };
  const ctx = vm.createContext({ document: { hidden: false }, workshopPageSuspended: false, mediaVisibilityRaf: 0, cardVisibilityRead: null,
    innerHeight: 800, innerWidth: 1000, cardMap: new Map([['alpha', { root }]]), mediaViewportIds: new Set(),
    grid: { contains() { return true; }, getBoundingClientRect() { gridReads++; return rect; } },
    requestRoomMediaIfNeeded() { throw new Error('fixture failure'); }, releaseRoomMediaIfPossible() {},
  });
  vm.runInContext(block('    function isRoomMediaProtected(', '    function requestRoomMediaNow(')
    + block('    function reconcileWorkshopMediaVisibility(', '    function scheduleWorkshopMediaVisibility('), ctx);
  assert.throws(() => ctx.reconcileWorkshopMediaVisibility(), /fixture failure/);
  assert.equal(gridReads, 1); assert.equal(cardReads, 1);
  ctx.isCardNearViewport('alpha'); assert.equal(gridReads, 2); assert.equal(cardReads, 2, 'failed pass cannot leave stale geometry for a later caller');
});

let failed = 0;
for (const { name, run } of tests) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.stack}`); }
}
console.log(`${tests.length - failed}/${tests.length} Workshop incremental checks passed${ref ? ` against ${ref}` : ''}.`);
process.exitCode = failed ? 1 : 0;
