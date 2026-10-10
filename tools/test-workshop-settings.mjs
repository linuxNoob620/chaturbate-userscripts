import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
function block(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Missing production block ${start}`);
  return source.slice(a, b);
}
const checks = [];
const test = (name, fn) => checks.push({ name, fn });

// A small deterministic DOM fixture. It does not establish real browser layout,
// pointer interaction, native notifications or mobile acceptance.
class Node {
  constructor(tag, props = {}, children = []) {
    this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.style = {};
    this.listeners = new Map(); this.class = ''; this._open = false;
    this.classList = {
      contains: c => this.class.split(' ').includes(c),
      add: c => { if (!this.classList.contains(c)) this.class = `${this.class} ${c}`.trim(); },
      remove: c => { this.class = this.class.split(' ').filter(x => x !== c).join(' '); },
      toggle: (c, enabled) => { const on = enabled ?? !this.classList.contains(c); this.classList[on ? 'add' : 'remove'](c); return on; },
    };
    Object.assign(this, props); this.append(...(Array.isArray(children) ? children : [children]));
  }
  get parentElement() { return this.parentNode?.tagName !== '#COMMENT' ? this.parentNode : null; }
  get isConnected() { return this.tagName === 'BODY' || !!this.parentNode?.isConnected; }
  get childElementCount() { return this.children.filter(x => x instanceof Node && x.tagName !== '#COMMENT').length; }
  get firstElementChild() { return this.children.find(x => x instanceof Node && x.tagName !== '#COMMENT') || null; }
  get textContent() { return this.children.map(x => x instanceof Node ? x.textContent : String(x)).join(''); }
  set textContent(value) { this.replaceChildren(String(value)); }
  get open() { return this._open; }
  set open(value) { this._open = !!value; this.emit('toggle'); }
  append(...nodes) { for (const n of nodes) { if (n instanceof Node) { n.remove(); n.parentNode = this; } this.children.push(n); } }
  appendChild(n) { this.append(n); return n; }
  insertBefore(n, before) { n.remove(); n.parentNode = this; this.children.splice(this.children.indexOf(before), 0, n); return n; }
  replaceWith(n) { const parent = this.parentNode, index = parent?.children.indexOf(this); if (!parent) return; n.remove(); parent.children[index] = n; n.parentNode = parent; this.parentNode = null; }
  remove() { if (this.parentNode) { this.parentNode.children = this.parentNode.children.filter(x => x !== this); this.parentNode = null; } }
  replaceChildren(...nodes) { for (const child of this.children) if (child instanceof Node) child.parentNode = null; this.children = []; this.append(...nodes); }
  contains(n) { return n === this || this.children.some(x => x instanceof Node && x.contains(n)); }
  matches(selector) {
    if (selector.includes(',')) return selector.split(',').some(s => this.matches(s));
    selector = selector.trim();
    if (selector === '[hidden]' || selector === '[inert]') return !!this[selector.slice(1, -1)];
    const attr = selector.match(/^\[data-settings-section="(.*?)"\]$/); if (attr) return this.dataset.settingsSection === attr[1];
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.includes(':not([disabled])')) return !this.disabled && this.tagName.toLowerCase() === selector.split(':')[0];
    if (selector === 'a[href]') return this.tagName === 'A' && !!this.href;
    if (selector === '[tabindex="0"]') return this.tabIndex === 0;
    return this.tagName.toLowerCase() === selector;
  }
  querySelectorAll(selector) { const out = []; for (const child of this.children) if (child instanceof Node) { if (child.matches(selector)) out.push(child); out.push(...child.querySelectorAll(selector)); } return out; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest(selector) || null; }
  addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  emit(name, event = {}) { for (const fn of [...(this.listeners.get(name) || [])]) fn({ target: this, ...event }); }
  getClientRects() { return this.isConnected ? [1] : []; }
  focus() { this.document().activeElement = this; }
  document() { let n = this; while (n.parentNode) n = n.parentNode; return n.ownerDocument || n; }
  setAttribute(key, value) { this[key] = value; }
  removeAttribute(key) { delete this[key]; }
  scrollIntoView() {}
}
function fixture() {
  const document = new Node('body'); document.body = document; document.ownerDocument = document;
  document.createComment = () => new Node('#comment');
  const previous = new Node('button'); document.append(previous); previous.focus();
  const toolbar = new Node('div'); document.append(toolbar);
  const controls = Object.fromEntries(['viewModeSel', 'volSlider', 'searchInput', 'filterSel', 'sortSel', 'tbInput', 'tempUrlBtn'].map(k => [k, new Node(k === 'tempUrlBtn' ? 'button' : 'input')]));
  toolbar.append(...Object.values(controls));
  const calls = [], mounted = [], observers = []; let cleaned = 0;
  const context = vm.createContext({ document, console, ...controls, LANG: 'en', _moreMenuClose: null,
    MutationObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() { this.active = true; } disconnect() { this.active = false; } },
    $: (...args) => new Node(...args), t: k => k, settingsBtn: previous,
    store: { state: { settings: { toolbarCollapsed: false, sidebarCollapsed: false }, rooms: [], groups: [] }, patchSettings() {}, flush: () => true },
    sidebar: new Node('div'), currentPageRoomIds: () => [], refreshWorkshopRooms: args => calls.push({ ...args }),
    closeTransientUi() { context._moreMenuClose?.(); }, requestAnimationFrame: fn => fn(), toast() {},
    followedAccount: () => '', openGithubSyncSetup(_message, host) { mounted.push('cloud'); host.append(new Node('input')); },
  });
  vm.runInContext(block('    let workshopInlineToolHost =', '    function handleAddRoomToSplit('), context);
  for (const builder of ['openLayoutSettings', 'openStartupSettings', 'openPlaybackSettingsPanel', 'openGroupRulesPanel', 'openWorkshopChatSettings', 'openShortcutPanel', 'openWorkshopNotificationSettings', 'openBackupPanel']) {
    context[builder] = () => { mounted.push(builder); return context.openToolPanel(builder, body => { body.append(new Node('input')); return () => cleaned++; }); };
  }
  vm.runInContext(block('    function openMoreMenu(', '    /* ---- 关于面板') + block('    function openSettingsCenter()', '    function readWorkshopChatSettings('), context);
  return { context, document, previous, toolbar, controls, calls, mounted, observers,
    get cleaned() { return cleaned; }, section(k) { return document.querySelector(`[data-settings-section="${k}"]`); },
    open(k) { context.openMoreMenu(previous, k); return this.section(k); }, close() { context._moreMenuClose?.(); } };
}

test('one lazy drawer contains eight sections and keeps original controls', () => {
  const h = fixture(); h.context.openMoreMenu(h.previous);
  assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 1);
  assert.equal(h.document.querySelectorAll('.rg-settings-section').length, 8);
  assert.equal(h.mounted.length, 0, 'closed sections must not initialize editors/media/cloud');
  h.open('layout'); assert.deepEqual(h.mounted, ['openLayoutSettings']);
  const input = h.section('layout').querySelector('.rg-settings-form').firstElementChild;
  input.value = 'draft'; h.section('layout').open = false; h.section('layout').open = true;
  assert.equal(h.mounted.length, 1); assert.equal(input.value, 'draft');
  h.context.openSettingsCenter(); assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 1);
  assert.notEqual(h.controls.viewModeSel.parentNode, h.toolbar);
  h.close(); assert.equal(h.controls.viewModeSel.parentNode, h.toolbar);
  assert.equal(h.document.activeElement, h.previous); assert.equal(h.cleaned, 1);
});

test('forced and ordinary refresh retain exact distinct contracts', () => {
  const h = fixture(); const section = h.open('refresh');
  const buttons = section.querySelectorAll('button');
  buttons.find(x => x.textContent === 'Refresh stale rooms').onclick();
  buttons.find(x => x.textContent === 'Check all now').onclick();
  assert.deepEqual(h.calls, [{ scope: 'all', force: false }, { scope: 'all', force: true }]);
  assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 1); h.close();
});

test('cloud setup is nested and initialized only once; controls return on disposal', () => {
  const h = fixture(); h.open('sync'); assert.equal(h.mounted.length, 0);
  const cloud = h.section('sync').querySelector('.rg-settings-subsection'); cloud.open = true;
  assert.deepEqual(h.mounted, ['cloud']);
  const input = cloud.querySelector('input'); input.value = 'draft'; cloud.open = false; cloud.open = true;
  assert.deepEqual(h.mounted, ['cloud']); assert.equal(cloud.querySelector('input'), input);
  assert.equal(h.document.querySelector('#roomgrid-github-sync-backdrop'), null);
  h.open('groups'); h.open('advanced'); h.open('previews'); h.close();
  for (const control of Object.values(h.controls)) assert.equal(control.parentNode, h.toolbar);
  assert.equal(h.document.listeners.get('keydown').size, 0);
  assert(h.observers.every(x => !x.active));
});

test('inline save remains in drawer, cancel disposes once and reopening rebuilds', () => {
  const h = fixture(); h.open('layout');
  const host = h.section('layout').querySelector('.rg-settings-inline'); let close;
  h.context.withWorkshopInlineToolHost(host, () => h.context.openToolPanel('test', (_, c) => { close = c; return () => h.mounted.push('disposed'); }));
  close('saved'); assert.match(host.textContent, /Saved on this device/);
  assert.equal(h.section('layout').open, true); assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 1);
  close(); close(); assert.equal(h.mounted.filter(x => x === 'disposed').length, 1);
  assert.equal(host.childElementCount, 0); assert.equal(h.section('layout').open, false);
  h.section('layout').open = true; assert.equal(host.childElementCount, 2);
  h.close(); assert.equal(h.mounted.filter(x => x === 'disposed').length, 2);
});

test('repeated drawer cycles release precise observer and keyboard ownership', () => {
  const h = fixture();
  for (let i = 0; i < 15; i++) { h.open('layout'); h.close(); }
  assert.equal(h.cleaned, 15); assert.equal(h.document.listeners.get('keydown').size, 0);
  assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 0);
  assert(h.observers.every(x => !x.active));
});
test('initially detached controls retain identity and drafts without retaining a closed drawer', () => {
  const h = fixture(), add = h.controls.tbInput, url = h.controls.tempUrlBtn;
  add.remove(); url.remove(); add.value = 'unfinished-room';
  for (let i = 0; i < 5; i++) {
    h.open('advanced'); const drawer = h.document.querySelector('.rg-control-drawer');
    assert(drawer.contains(add)); assert(drawer.contains(url)); assert.equal(add.value, 'unfinished-room');
    h.close(); assert.equal(add.parentNode, null); assert.equal(url.parentNode, null);
    assert.equal(drawer.contains(add), false); assert.equal(drawer.contains(url), false);
    assert.equal(add.value, 'unfinished-room');
  }
  assert.equal(h.controls.tbInput, add); assert.equal(h.controls.tempUrlBtn, url);
});
test('native Filters entry opens Groups and sorting directly', () => {
  assert.match(source, /onclick: \(\) => openMoreMenu\(filtersButton, 'groups'\)/);
  const h = fixture(); h.context.openMoreMenu(h.previous, 'groups');
  assert.equal(h.section('groups').open, true); assert.equal(h.section('layout').open, false);
  assert(h.section('groups').contains(h.controls.filterSel)); h.close();
  assert.equal(h.controls.searchInput.parentNode, h.toolbar);
});

test('Escape closes drawer, nested confirmation owns Escape, external removal disposes', () => {
  const h = fixture(); h.open('layout');
  const modal = new Node('div', { class: 'roomgrid-modal-backdrop' }); h.document.append(modal);
  h.document.emit('keydown', { key: 'Escape', preventDefault() {}, stopImmediatePropagation() {} });
  assert(h.context._moreMenuClose); modal.remove();
  h.document.emit('keydown', { key: 'Escape', preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(h.context._moreMenuClose, null);
  h.open('layout'); h.document.querySelector('.rg-control-backdrop').remove();
  h.observers.at(-1).fn(); assert.equal(h.context._moreMenuClose, null);
  assert.equal(h.controls.viewModeSel.parentNode, h.toolbar);
});

test('all pre-existing menu workflows remain reachable', () => {
  const menu = block('    function openMoreMenu(', '    /* ---- 关于面板');
  for (const name of ['openLayoutSettings', 'openStartupSettings', 'openPlaybackSettingsPanel', 'openGroupRulesPanel', 'openShortcutPanel', 'exportWorkstationSettings', 'importWorkstationSettings', 'exportSuiteSettingsLocal', 'importSuiteSettingsFile', 'openGithubSyncSetup', 'openBackupPanel', 'openManualImportPrompt', 'openStatusHistoryPanel', 'openTemporaryUrlManager', 'openSharePanel', 'openSplitViewOrPicker', 'togglePureMode', 'setAllMuted', 'repairData', 'menuExportUsernames', 'menuCopyUsernames', 'menuClearAll', 'menuAbout']) assert(menu.includes(name), name);
  assert.match(menu, /opts\.close \? null : host/);
  assert.match(menu, /const host = opts\.host \|\| actionHost/);
});

function chatFixture(initial = {}) {
  let raw = JSON.stringify(initial), writes = 0, events = 0, fail = false;
  const ctx = vm.createContext({ Object, localStorage: { getItem: () => raw, setItem(_key, value) { if (fail) throw new Error('quota'); raw = value; writes++; } },
    document: { dispatchEvent() { events++; } }, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } } });
  vm.runInContext(block('    function readWorkshopChatSettings()', '    function openWorkshopChatSettings()'), ctx);
  return { ctx, get saved() { return JSON.parse(raw); }, set raw(value) { raw = value; }, get writes() { return writes; }, get events() { return events; }, set fail(value) { fail = value; } };
}
test('chat save merges only edited fields over latest shared settings', () => {
  const h = chatFixture({ c1: 0, c5: 0, language: 'de', customCompatibility: 'keep' });
  const baseline = h.ctx.readWorkshopChatSettings();
  h.raw = JSON.stringify({ c1: 1, c5: 0, language: 'fr', customCompatibility: 'keep', newField: 123 });
  h.ctx.saveWorkshopChatSettings(baseline, { ...baseline, c5: 1 });
  assert.equal(h.saved.c1, 1); assert.equal(h.saved.language, 'fr'); assert.equal(h.saved.c5, 1);
  assert.equal(h.saved.customCompatibility, 'keep'); assert.equal(h.saved.newField, 123);
  assert.equal(h.writes, 1); assert.equal(h.events, 1);
  h.ctx.saveWorkshopChatSettings(h.ctx.readWorkshopChatSettings(), h.ctx.readWorkshopChatSettings());
  assert.equal(h.writes, 1, 'no-op must not schedule needless shared sync');
});
test('chat invalid or failed storage never rewrites settings or emits saved event', () => {
  const h = chatFixture({ c1: 0 }); const baseline = h.ctx.readWorkshopChatSettings();
  for (const raw of ['{bad', '[]', 'null', '42']) { h.raw = raw; assert.throws(() => h.ctx.saveWorkshopChatSettings(baseline, { c1: 1 })); }
  h.raw = JSON.stringify({ c1: 0 }); h.fail = true;
  assert.throws(() => h.ctx.saveWorkshopChatSettings(baseline, { c1: 1 }), /quota/);
  assert.equal(h.writes, 0); assert.equal(h.events, 0);
});
test('actual chat editor validates input, preserves unknown language and reports quota failure', () => {
  const h = fixture(); let raw = JSON.stringify({ language: 'future-language', c7a: 100, c7: 1, custom: 'keep' }), fail = false, writes = 0;
  h.context.localStorage = { getItem: () => raw, setItem(_key, value) { if (fail) throw new Error('quota'); raw = value; writes++; } };
  h.context.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  h.context.document.dispatchEvent = () => true;
  vm.runInContext(source.match(/const RELOADED_CHAT_LANGUAGES = Object\.freeze\(\[[\s\S]*?\]\);/)[0] + block('    function readWorkshopChatSettings()', '    function openWorkshopNotificationSettings()'), h.context);
  const section = h.open('chat'), language = section.querySelector('select');
  assert.equal(language.value, 'future-language'); assert(language.children.some(x => x.value === 'future-language'));
  const threshold = section.querySelectorAll('input').find(x => x.type === 'number');
  const save = section.querySelectorAll('button').find(x => x.textContent === 'saveSettings');
  threshold.value = '1'; save.onclick(); assert.equal(writes, 0); assert.match(section.textContent, /whole token amount/);
  threshold.value = '101'; fail = true; save.onclick(); assert.equal(writes, 0); assert.match(section.textContent, /were not saved: quota/);
  fail = false; save.onclick(); assert.equal(writes, 1); assert.equal(JSON.parse(raw).c7a, 101);
  assert.equal(JSON.parse(raw).custom, 'keep'); assert.equal(JSON.parse(raw).language, 'future-language');
  assert.match(section.textContent, /saved locally/); assert.equal(h.document.querySelectorAll('.rg-control-backdrop').length, 1);
  h.close();
});
test('actual playback editor preserves stored quality and failure never acknowledges Saved', () => {
  const h = fixture(); let persisted = false, refreshed = 0;
  h.context.store.state.settings = { maxStreamHeight: 1080, freeZoom: false, defaultTheaterMode: false };
  h.context.store.patchSettings = patch => Object.assign(h.context.store.state.settings, patch);
  h.context.store.flush = () => persisted;
  h.context.service = { refreshQuality() { refreshed++; } };
  vm.runInContext(block('    function openPlaybackSettingsPanel()', '    function openBackupPanel()'), h.context);
  const section = h.open('previews'), selects = section.querySelectorAll('select');
  assert.equal(selects[0].value, '1080'); assert.equal(selects[1].value, 'normal');
  const save = section.querySelectorAll('button').find(x => x.textContent === 'saveSettings');
  save.onclick(); assert.equal(refreshed, 0); assert(!section.textContent.includes('Saved on this device'));
  persisted = true; save.onclick(); assert.equal(refreshed, 1); assert.match(section.textContent, /Saved on this device/);
  assert.equal(h.context.store.state.settings.maxStreamHeight, 1080); assert.equal(section.open, true); h.close();
});
test('permission result after drawer disposal cannot save local alert settings', async () => {
  const h = fixture(); let resolve, patches = 0;
  h.context.Notify = { request: () => new Promise(r => { resolve = r; }) };
  h.context.store.state.settings.notifyOnline = false;
  h.context.store.patchSettings = () => patches++;
  vm.runInContext(block('    function openWorkshopNotificationSettings()', '    function openShortcutPanel()'), h.context);
  const section = h.open('notifications'); section.querySelectorAll('input')[0].checked = true;
  const save = section.querySelectorAll('button').find(x => x.textContent === 'saveSettings');
  const pending = save.onclick(); assert.equal(save.disabled, true); h.close(); resolve('granted'); await pending;
  assert.equal(patches, 0); assert.equal(h.context._moreMenuClose, null);
});
test('inline Split preview pauses on collapse, resumes once and disposes hidden media ownership', () => {
  const h = fixture(), timers = new Map(), win = new Node('window'); let next = 0, snapshots = 0;
  h.context.window = win; h.context.workshopPageSuspended = false;
  h.context.store.state.settings.splitRoomIds = [];
  h.context.store.state.rooms = [{ id: 'sample', lastStatus: 'online' }];
  Object.assign(h.context, { roomInGroup: () => true, ONLINE_FAVORITES_GROUP_ID: 'of', FAVORITE_GROUP_ID: 'f',
    statusMeta: status => ({ label: status, color: '#fff' }), iconSvg: () => '', iconLabel: () => '', trustedHtml: x => x,
    normalizeUsername: x => String(x), debounce: fn => fn,
    splitPreviewSnapshotUrl: () => `https://example.invalid/${++snapshots}.jpg`,
    setTimeout: () => 0, clearTimeout() {},
    setInterval(fn) { timers.set(++next, fn); return next; }, clearInterval(id) { timers.delete(id); },
  });
  vm.runInContext(block('    function openSplitPicker(', '    function openSplitViewOrPicker('), h.context);
  const section = h.open('previews'), host = section.querySelectorAll('.rg-settings-inline').at(-1);
  h.context.withWorkshopInlineToolHost(host, () => h.context.openSplitPicker(0));
  const image = host.querySelector('img'), search = host.querySelector('input'); search.value = 'draft';
  host.querySelector('.split-picker-preview-btn').onclick();
  assert.equal(snapshots, 1); assert.equal(timers.size, 1); assert(image.src);
  section.open = false; assert.equal(timers.size, 0); assert.equal(image.src, undefined);
  image.emit('error'); assert.equal(snapshots, 1, 'late error cannot fetch a fallback while collapsed');
  section.open = true; assert.equal(snapshots, 2); assert.equal(timers.size, 1); assert.equal(search.value, 'draft');
  section.emit('toggle'); h.document.emit('visibilitychange'); assert.equal(snapshots, 2); assert.equal(timers.size, 1);
  h.document.hidden = true; h.document.emit('visibilitychange'); assert.equal(timers.size, 0); assert.equal(image.src, undefined);
  h.document.hidden = false; h.document.emit('visibilitychange'); assert.equal(snapshots, 3); assert.equal(timers.size, 1);
  section.open = false; h.close(); assert.equal(timers.size, 0);
  assert.equal(section.listeners.get('toggle').size, 1, 'only the drawer section mount handler remains on its detached node');
  assert.equal(h.document.listeners.get('visibilitychange').size, 0);
  assert.equal(win.listeners.get('pagehide').size, 0); assert.equal(win.listeners.get('pageshow').size, 0);
  image.emit('error'); assert.equal(snapshots, 3, 'disposed preview cannot restart network activity');
});
test('central chat choices retain legacy mappings in separate IIFE scope', () => {
  const constant = source.match(/const RELOADED_CHAT_LANGUAGES = Object\.freeze\((\[[\s\S]*?\])\);/)[1];
  const ctx = vm.createContext({}); const pairs = vm.runInContext(constant, ctx);
  const labels = JSON.parse(source.match(/var languages=(\[.*?\]);/)[1]);
  const codes = JSON.parse(source.match(/var langcode=(\[.*?\]);/)[1]);
  assert.deepEqual(Array.from(pairs, pair => Array.from(pair)), codes.map((code, i) => [code, labels[i]]));
  const legacy = source.slice(source.indexOf('var languages='));
  assert(!legacy.includes('RELOADED_CHAT_LANGUAGES'), 'Suite lexical constant must not cross the integrated IIFE boundary');
  const builder = block('    function openWorkshopChatSettings()', '    function openWorkshopNotificationSettings()');
  assert.match(builder, /Number\.isInteger\(amount\)/); assert.match(builder, /baseline = \{ \.\.\.baseline, \.\.\.submitted \}/);
  assert(!builder.includes('baseline = saveWorkshopChatSettings'), 'latest unrelated remote values must not turn unchanged stale UI into changes on next save');
});
test('successful preference saves acknowledge persistence in-place', () => {
  for (const [start, end] of [['openLayoutSettings', 'openStartupSettings'], ['openStartupSettings', 'openPlaybackSettingsPanel'], ['openPlaybackSettingsPanel', 'openBackupPanel'], ['openShortcutPanel', 'loadSavedTemporarySources']]) {
    const code = block(`    function ${start}()`, `    function ${end}(`);
    assert.match(code, /store\.flush\(\)/, start); assert.match(code, /close\('saved'\)/, start);
  }
  const shortcuts = block('    function openShortcutPanel()', '    function loadSavedTemporarySources(');
  assert.match(shortcuts, /if \(e\.key === 'Tab' \|\| e\.key === 'Escape'\) return;/);
});
test('preview quality and native room layout retain their distinct settings', () => {
  const playback = block('    function openPlaybackSettingsPanel()', '    function openBackupPanel(');
  assert.match(playback, /Workshop preview quality/); assert.match(playback, /480p is recommended/);
  assert.match(playback, /quality\.value = String\(Number\(store\.state\.settings\.maxStreamHeight\)/);
  assert.match(playback, /defaultTheaterMode: theater\.value === 'theatre'/);
  assert.match(source, /maxStreamHeight: 480/);
});
test('inline GitHub host preserves separate confirmations and native alerts distinction', () => {
  const github = block('  function openGithubSyncSetup(', '  function ');
  assert.match(github, /initialMessage = '', host = null/);
  assert.match(github, /if \(host\) \{ host\.appendChild\(panel\); return \{ panel \}; \}/);
  assert.match(github, /if \(!host\)/);
  const alerts = block('    function openWorkshopNotificationSettings()', '    function openShortcutPanel(');
  assert.match(alerts, /Favorites do not subscribe you/); assert.match(alerts, /cannot provide browser-closed delivery/);
  assert(!alerts.includes('nativeModelNotifications'), 'local alert checkbox must not mutate native bell preference');
});

let failed = 0;
for (const { name, fn } of checks) { try { await fn(); console.log(`PASS ${name}`); } catch (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); } }
if (failed) process.exitCode = 1;
else console.log(`Workshop settings: ${checks.length} extracted-source checks passed. Real browser/phone interaction is not established by these fixtures.`);
