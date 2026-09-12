import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const file = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const ref = process.argv.find(x => x.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' }) : readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
function block(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Missing source block ${start}`);
  return source.slice(a, b);
}
const tests = [];
const test = (name, run) => tests.push({ name, run });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('empty shortcuts disable; missing shortcuts retain defaults', () => {
  const ctx = vm.createContext({});
  vm.runInContext(block('  function normalizeShortcutSpec(', '  function shortcutFromEvent('), ctx);
  assert.equal(ctx.sanitizeShortcuts({ refreshAll: '' }, { refreshAll: 'r' }).refreshAll, '');
  assert.equal(ctx.sanitizeShortcuts({}, { refreshAll: 'r' }).refreshAll, 'r');
});

test('explicitly disabled Clean mode also disables its legacy Alt+C alias', () => {
  let listener, toggles = 0;
  const ctx = vm.createContext({
    document: { addEventListener: (_, fn) => { listener = fn; } },
    store: { state: { settings: { shortcuts: { pureMode: '' } } } },
    defaultShortcuts: () => ({ pureMode: 'x' }), togglePureMode: () => toggles++, closeTransientUi() {},
  });
  vm.runInContext(block('  function normalizeShortcutSpec(', '  function shortcutLabel(') + block('    function shortcutMatches(', '    // ---- 首次渲染'), ctx);
  const event = { key: 'c', altKey: true, preventDefault() {}, target: { closest: () => null } };
  listener(event); assert.equal(toggles, 0);
  ctx.store.state.settings.shortcuts.pureMode = 'x';
  listener(event); assert.equal(toggles, 1, 'enabled action retains the pre-existing alias');
  listener({ ...event, isComposing: true }); assert.equal(toggles, 1);
});

test('Suite state publishing accepts both reused rooms and DOM-event arguments', () => {
  let reads = 0, events = 0;
  const ctx = vm.createContext({
    document: { documentElement: { dataset: {} }, dispatchEvent() { events++; } },
    CustomEvent: class { constructor(type) { this.type = type; } }, currentRoom: 'alpha', collapsed: false,
    Storage: { has(id) { reads++; return id === 'alpha'; } },
  });
  vm.runInContext(block('    function publishSuiteState(', '    currentRoomSubs.add('), ctx);
  ctx.publishSuiteState([{ id: 'alpha' }]);
  assert.equal(reads, 0, 'same render must reuse its saved-room snapshot');
  assert.equal(ctx.document.documentElement.dataset.ziggySuiteSaved, '1');
  ctx.publishSuiteState({ type: 'ziggy-mobile-shell:ready' });
  assert.equal(reads, 1, 'event listener argument must not be mistaken for an array');
  assert.equal(events, 2);
});

test('recording runtime is removed', () => {
  for (const token of ['UnifiedRecorder','MediaRecorder','Recorder Hub','convertRecordingToMp4']) assert.ok(!source.includes(token), token);
});

for (const mode of ['completion', 'timeout', 'parent abort', 'parse failure']) test(`request body lifetime: ${mode}`, async () => {
  const body = deferred(), timers = new Map(), parent = new AbortController();
  let requestSignal;
  const ctx = vm.createContext({ AbortController, domain: 'example.invalid',
    setTimeout(fn) { timers.set(1, fn); return 1; }, clearTimeout(id) { timers.delete(id); },
    fetch: async (_, options) => {
      requestSignal = options.signal;
      requestSignal.addEventListener('abort', () => body.reject(new Error('aborted')), { once: true });
      return { ok: true, json: () => body.promise };
    },
  });
  vm.runInContext(block('    async function fetchContext(', '    function setStatus('), ctx);
  const result = ctx.fetchContext('alpha', parent.signal);
  const outcome = result.then(value => ({ value }), error => ({ error }));
  await settle();
  assert.equal(timers.size, 1, 'timeout must survive response headers');
  if (mode === 'timeout') timers.get(1)();
  else if (mode === 'parent abort') parent.abort();
  else if (mode === 'parse failure') body.reject(new SyntaxError('bad JSON'));
  else body.resolve({ room_status: 'offline' });
  const settled = await outcome;
  if (mode === 'completion') assert.equal(settled.value.room_status, 'offline');
  else assert.ok(settled.error);
  if (mode === 'timeout' || mode === 'parent abort') assert.equal(requestSignal.aborted, true);
  assert.equal(timers.size, 0, 'timer is released at completion/failure');
});

test('broader refresh waits for narrow refresh then checks requested scope', async () => {
  const first = deferred(), calls = [];
  const ctx = vm.createContext({ console, Date, Set, Map, Promise, LANG: 'en', ONLINE_GROUP_ID: 'online',
    workshopRefreshPromise: first.promise, workshopRefreshRoomIds: new Set(['favorite']),
    workshopRefreshState: {}, refreshAllBtn: {}, cardMap: new Map(),
    roomIdsForWorkshopRefresh: scope => scope === 'all' ? ['favorite', 'other'] : ['favorite'],
    service: { async refreshMany(ids) { calls.push([...ids]); return ids; } },
    clearTimeout() {}, setTimeout() { return 1; }, scheduleSidebarRender() {}, updateWorkshopRefreshUi() {}, scheduleWorkshopSidebarCounts() {},
  });
  vm.runInContext(block('    async function refreshWorkshopRooms(', '    async function refreshAllSources('), ctx);
  const result = ctx.refreshWorkshopRooms({ scope: 'all', force: true });
  await settle();
  assert.equal(calls.length, 0);
  ctx.workshopRefreshPromise = null; ctx.workshopRefreshRoomIds.clear(); first.resolve(['favorite']);
  await result;
  assert.deepEqual(calls, [['favorite', 'other']]);
});

class Node {
  constructor(tag, props = {}, children = []) { this.tagName = tag.toUpperCase(); this.children = []; this.style = {}; this.dataset = {}; this.listeners = new Map(); Object.assign(this, props); this.append(...(Array.isArray(children) ? children : [children])); }
  append(...nodes) { for (const n of nodes) { if (n === null || n === undefined) { this.children.push(String(n)); continue; } if (typeof n === 'object') { n.remove(); n.parentElement = this; } this.children.push(n); } }
  appendChild(n) { this.append(n); return n; }
  remove() { if (this.parentElement) { this.parentElement.children = this.parentElement.children.filter(x => x !== this); this.parentElement = null; } }
  get isConnected() { return !!this.parentElement || this.tagName === 'BODY'; }
  get textContent() { return this.children.map(n => typeof n === 'object' ? n.textContent : String(n)).join(''); }
  set textContent(value) { this.children = [String(value)]; }
  contains(n) { return n === this || this.children.some(x => typeof x === 'object' && x.contains(n)); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  querySelectorAll(selector) { const out = []; for (const child of this.children) if (typeof child === 'object') { if (selector === '.roomgrid-modal-backdrop' && child.class === 'roomgrid-modal-backdrop') out.push(child); out.push(...child.querySelectorAll(selector)); } return out; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  setAttribute(name, value) { this[name] = String(value); }
  focus() {}
}

test('replacing a tool panel disposes it exactly once', () => {
  const document = new Node('body'); document.body = document; document.activeElement = null;
  const ctx = vm.createContext({ document, console, closeTransientUi() {}, $: (...args) => new Node(...args),
    requestAnimationFrame: fn => fn(), MutationObserver: class { observe() {} disconnect() {} },
  });
  vm.runInContext(block('    function openToolPanel(', '    function handleAddRoomToSplit('), ctx);
  let cleaned = 0;
  const a = ctx.openToolPanel('A', () => () => cleaned++);
  const b = ctx.openToolPanel('B', () => null);
  assert.equal(cleaned, 1); a.close(); assert.equal(cleaned, 1);
  b.close(); assert.equal(document.children.length, 0);
});

test('offline badge never appends null and unchanged badge is retained', () => {
  const badge = new Node('div'), card = { badge, infoMeta: new Node('div'), root: { classList: { remove() {}, add() {} } }, statusEl: new Node('div') };
  const ctx = vm.createContext({ cardMap: new Map([['alpha', card]]), LANG: 'en',
    statusMeta: () => ({ label: 'Online', color: '#fff' }), $: (...args) => new Node(...args), updateCardButtons() {},
    applyMute() {}, resumeWaitingRecording() {},
  });
  vm.runInContext(block('    function renderCardState(', '    function applyMute('), ctx);
  ctx.renderCardState({ id: 'alpha', lastStatus: 'online', muted: false });
  assert.ok(!badge.textContent.includes('null'));
  const child = badge.children[0];
  ctx.renderCardState({ id: 'alpha', lastStatus: 'online', muted: false });
  assert.equal(badge.children[0], child, 'unchanged status must preserve badge nodes');
});

test('100 mobile mount passes preserve native Private and do not rewrite Rooms', () => {
  let writes = 0;
  const strip = {}, nativeTab = { textContent: 'Private' }, panel = { id: 'panel', previousElementSibling: strip };
  const tab = { isConnected: true, parentElement: strip, get textContent() { return 'Rooms'; },
    set textContent(_) { writes++; }, classList: { add() {} }, setAttribute() {} };
  const ctx = vm.createContext({ nativeMobilePage: true, currentRoom: 'alpha',
    mobilePrivateTab: tab, nativeMobilePrivateTab: null, mobilePanel: panel, body: { parentElement: panel },
    findMobilePrivateTab: () => nativeTab, findMobileTabStrip: () => strip,
    syncMobileRoomTabOrder() {}, document: { querySelector: () => null }, collapsed: true, mobileRoomGridOpen: false,
    setMobileRoomGridOpen() {}, restoreMobilePrivateTab() {},
  });
  vm.runInContext(block('    function mountMobileRoomGrid()', '    function syncNativeRoomGridPlacement()'), ctx);
  for (let i=0;i<100;i++) assert.equal(ctx.mountMobileRoomGrid(), true);
  assert.equal(writes, 0);
  assert.equal(nativeTab.textContent, 'Private');
});

test('failed primary ban performs no secondary destructive operation', async () => {
  const calls = [];
  const ctx = vm.createContext({ normalizeUsername: x => x, isLikelyUsername: () => true,
    fetch: async () => ({ ok: true, json: async () => ({ viewer_username: 'viewer' }) }),
    readSuiteCookie: () => 'fixture', location: { origin: 'https://example.invalid' },
    postSuiteForm: async url => { calls.push(url); if (url.startsWith('/roomban/')) throw new Error('failed'); },
  });
  vm.runInContext(block('    async function banRoomFromCard(', '    // ==========================================================='), ctx);
  await assert.rejects(ctx.banRoomFromCard('alpha'), /failed/);
  assert.deepEqual(calls, ['/roomban/alpha/viewer/']);
});

test('re-rendering unchanged Workshop order never reparents cards', () => {
  const grid = new Node('div'), ids = ['a', 'b', 'c'];
  for (const id of ids) grid.appendChild(new Node('article', { id }));
  const roots = [...grid.children];
  Object.defineProperty(grid, 'firstElementChild', { get: () => grid.children[0] || null });
  for (const root of roots) Object.defineProperty(root, 'nextElementSibling', { get: () => grid.children[grid.children.indexOf(root) + 1] || null });
  let moves = 0;
  grid.insertBefore = (node, cursor) => { moves++; node.remove(); const index = cursor ? grid.children.indexOf(cursor) : grid.children.length; grid.children.splice(index, 0, node); node.parentElement = grid; };
  const originalAppend = grid.appendChild.bind(grid);
  grid.appendChild = node => { moves++; return originalAppend(node); };
  const ctx = vm.createContext({ grid, cardMap: new Map(roots.map(root => [root.id, { root }])),
    document: { createDocumentFragment: () => new Node('fragment') },
    syncLayoutControls() {}, activateCardEntry() {}, resetCardSizing() {}, applyCardGridSizing() {}, requestRoomMediaIfNeeded() {}, renderCardState() {},
  });
  vm.runInContext(block('    function renderGridLayout(', '    // ---- 渲染调度'), ctx);
  for (let i = 0; i < 100; i++) ctx.renderGridLayout(ids.map(id => ({ id })));
  assert.equal(moves, 0);
  assert.deepEqual(grid.children, roots);
  ctx.renderGridLayout(['c', 'a', 'b'].map(id => ({ id })));
  assert.equal(moves, 1); assert.deepEqual(grid.children.map(x => x.id), ['c', 'a', 'b']);
});

test('ban local commit is awaited even when secondary cleanup fails', async () => {
  const commit = deferred(); let completed = false;
  const ctx = vm.createContext({ normalizeUsername: x => x, isLikelyUsername: () => true,
    fetch: async () => ({ ok: true, json: async () => ({ viewer_username: 'viewer' }) }),
    readSuiteCookie: () => 'fixture', location: { origin: 'https://example.invalid' },
    postSuiteForm: async url => { if (url.startsWith('/follow/')) throw new Error('cleanup failed'); return { json: async () => ({ success: true }) }; },
    __ziggySuiteCommitNewBan: () => commit.promise,
  });
  vm.runInContext(block('    async function banRoomFromCard(', '    // ==========================================================='), ctx);
  const result = ctx.banRoomFromCard('alpha').then(() => { completed = true; }, error => { completed = true; return error; });
  await settle(); assert.equal(completed, false, 'must not abandon in-progress local commit');
  commit.reject(new Error('local write failed'));
  assert.match((await result).message, /local ban state could not be saved/);
});


test('HTTP-success application-rejected ban performs no cleanup', async () => {
  const calls = [];
  const ctx = vm.createContext({ normalizeUsername: x => x, isLikelyUsername: () => true,
    fetch: async () => ({ ok: true, json: async () => ({ viewer_username: 'viewer' }) }),
    readSuiteCookie: () => 'fixture', location: { origin: 'https://example.invalid' },
    postSuiteForm: async url => { calls.push(url); return { json: async () => ({ success: false }) }; },
    __ziggySuiteCommitNewBan() { throw new Error('must not commit'); },
  });
  vm.runInContext(block('    async function banRoomFromCard(', '    // ==========================================================='), ctx);
  await assert.rejects(ctx.banRoomFromCard('alpha'), /not accepted/);
  assert.deepEqual(calls, ['/roomban/alpha/viewer/']);
});

test('archive searches cap concurrency and cancel obsolete requests', async () => {
  const requests = [];
  const items = Array.from({ length: 9 }, () => ({ isConnected: true, dataset: { url: 'https://example.invalid/{username}' }, classList: { add() {}, remove() {} } }));
  const ctx = vm.createContext({ AbortController, searchRun: 0, searchAbort: null,
    archiveGrid: { querySelectorAll: () => items }, isValidUsername: x => !!x, saveHistory() {}, updateCounter() {}, analyzeResponse: () => true,
    GM_xmlhttpRequest(options) { const handle = { aborted: false, abort() { this.aborted = true; options.onabort?.(); } }; requests.push({ options, handle }); return handle; },
  });
  vm.runInContext(block('    function checkAll(', '    function updateCounter(') + block('    function checkPage(', '    function analyzeResponse('), ctx);
  ctx.checkAll('alpha'); await settle();
  assert.equal(requests.length, 3, 'only three sites may be checked concurrently');
  ctx.checkAll('beta'); await settle();
  assert.ok(requests.slice(0, 3).every(x => x.handle.aborted));
  assert.equal(requests.length, 6, 'obsolete queued work must not start');
  requests[3].options.onload({ status: 200 }); await settle();
  assert.equal(requests.length, 7);
  ctx.checkAll(''); await settle();
  assert.ok(requests.slice(4).every(x => x.handle.aborted));
});

test('keyboard editing guard covers inputs, editable ancestors and composition', () => {
  const ctx = vm.createContext({});
  const start = source.indexOf('  function isShortcutEditingTarget(');
  assert.ok(start >= 0, 'editing guard is missing');
  vm.runInContext(block('  function isShortcutEditingTarget(', '  function shortcutLabel('), ctx);
  assert.equal(ctx.isShortcutEditingTarget({ target: { closest: () => ({}) } }), true);
  assert.equal(ctx.isShortcutEditingTarget({ target: { isContentEditable: true } }), true);
  assert.equal(ctx.isShortcutEditingTarget({ isComposing: true, target: {} }), true);
  assert.equal(ctx.isShortcutEditingTarget({ target: { closest: () => null } }), false);
});

test('native action discovery rejects text before layout and measures candidates once', () => {
  class Candidate { constructor(text, top) { this.textContent = text; this.top = top; this.isConnected = true; this.reads = 0; } getBoundingClientRect() { this.reads++; return { top: this.top, width: 100, height: 20 }; } }
  const candidates = Array.from({ length: 100 }, () => new Candidate('unrelated', 0));
  candidates.push(new Candidate('JOIN FAN CLUB', 20), new Candidate('JOIN FAN CLUB', 40));
  const ctx = vm.createContext({ Element: Candidate, document: { querySelector: () => null, getElementById: () => null },
    nativeActionText: node => node.textContent, desktopNativeActionCandidates: () => candidates,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible' }),
  });
  vm.runInContext(block('    function visibleNode(', '    function findNativeSendTipSource(') + block('    function findNativeFanClubSource(', '    function ',), ctx);
  assert.equal(ctx.findNativeFanClubSource(), candidates.at(-1));
  assert.equal(candidates.slice(0, 100).reduce((n, node) => n + node.reads, 0), 0);
  assert.ok(candidates.slice(-2).every(node => node.reads === 1));
  const hidden = new Candidate('hidden', 0); hidden.getBoundingClientRect = () => ({ width: 0, height: 0 });
  assert.equal([hidden, candidates.at(-1)].find(ctx.visibleNode), candidates.at(-1), 'Array.find index must not be treated as a cached rectangle');
});

test('known deferred pan work is reproduced without changing final transform semantics', () => {
  const listeners = new Map(), cardListeners = new Map(), frames = new Map();
  let state = { x: 0, y: 0, zoom: 2 }, writes = 0, paints = 0;
  const card = { isConnected: true, classList: { add() {}, remove() {} }, addEventListener: (type, fn) => cardListeners.set(type, fn) };
  const ctx = vm.createContext({ window: { addEventListener: (type, fn) => listeners.set(type, fn) },
    store: { state: { settings: { freeZoom: true } } }, cardMap: new Map([['a', { video: { style: {} } }]]),
    getVideoTransform: () => ({ ...state }), sanitizeVideoTransform: value => ({ ...value }),
    patchVideoTransform: (_, value) => { state = { ...state, ...value }; writes++; }, applyVideoTransform: () => paints++,
    requestAnimationFrame: fn => { frames.set(1, fn); return 1; }, cancelAnimationFrame: id => frames.delete(id),
  });
  vm.runInContext(block('    let activeCardPan = null;', '    function attachVideoElement('), ctx);
  ctx.installCardZoomHandlers(card, 'a');
  cardListeners.get('mousedown')({ button: 0, clientX: 0, clientY: 0, preventDefault() {} });
  for (let i = 1; i <= 100; i++) listeners.get('mousemove')({ clientX: i, clientY: i * 2 });
  // Not an optimization pass: transient-only state was withdrawn because cloud
  // imports could miss it. Preserve this measurement for a revision-aware fix.
  assert.equal(writes, 100);
  listeners.get('mouseup')(); assert.equal(state.x, 100); assert.equal(state.y, 200);
  listeners.get('mouseup')(); assert.equal(writes, 100);
});

let failed = 0;
for (const { name, run } of tests) { try { await run(); console.log(`PASS ${name}`); } catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); } }
console.log(`${tests.length - failed}/${tests.length} Stage 2 UI/request checks passed${ref ? ` against ${ref}` : ''}.`);
process.exitCode = failed ? 1 : 0;
