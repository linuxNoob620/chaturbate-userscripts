import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const filename = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const baseline = process.argv.includes('--baseline');
const source = baseline
  ? execFileSync('git', ['show', `backup/pre-stage2-16.6.13-20260909:${filename}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, filename), 'utf8');
const start = source.indexOf('  function pruneConfigBackups(');
const end = source.indexOf('\n  /* =============================================================', source.indexOf('  function createStore()', start));
assert.ok(start >= 0 && end > start, 'Persistence implementation boundaries must exist');
const implementation = source.slice(start, end);
const workshopSyncStart = source.indexOf('    // ---- 跨标签页实时同步 ----');
const workshopSyncEnd = source.indexOf('    // ---- 全局拖动结束 ----', workshopSyncStart);
assert.ok(workshopSyncStart >= 0 && workshopSyncEnd > workshopSyncStart, 'Workshop storage sync boundaries must exist');
const workshopSync = source.slice(workshopSyncStart, workshopSyncEnd);
const initialState = () => ({ v: 1, rooms: [], groups: [{ id: 'default' }], settings: { activeGroup: 'default', filter: {}, layoutSize: 2 } });

function harness() {
  const values = new Map([['config', JSON.stringify(initialState())]]);
  const timers = new Map();
  const events = [];
  const eventListeners = new Map();
  const queueSnapshots = [];
  const controls = { failWrites: false, failBackup: false, failCount: 0, now: 1000, applied: 0, reloads: 0, alerts: [] };
  let timerId = 0;
  const localStorage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (controls.failWrites || (controls.failBackup && key.startsWith('backup-'))) throw new Error('QuotaExceededError');
      if (controls.failCount > 0) { controls.failCount--; throw new Error('QuotaExceededError'); }
      values.set(key, String(value));
    },
    removeItem(key) { if (controls.failRemovals) throw new Error('Storage unavailable'); values.delete(key); },
  };
  const context = vm.createContext({
    console: { warn() {}, log() {} }, crypto: webcrypto, TextEncoder, TextDecoder,
    Uint8Array, JSON, Number, String, Error, Promise,
    Date: class extends Date { static now() { return controls.now; } },
    localStorage, window: {
      addEventListener(type, callback) {
        if (!eventListeners.has(type)) eventListeners.set(type, new Set());
        eventListeners.get(type).add(callback);
      },
      dispatchEvent(event) { events.push(event); eventListeners.get(event.type)?.forEach(callback => callback(event)); },
    },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    navigator: { userAgent: 'Node test', platform: 'Windows' }, document: {},
    location: { reload() { controls.reloads++; } }, alert(message) { controls.alerts.push(message); }, confirm() { return true; },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); }, setInterval() {},
    btoa(value) { return Buffer.from(value, 'binary').toString('base64'); },
    atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
    GM_getValue() { return JSON.stringify({ token: 'fake-token', passphrase: 'fake-passphrase' }); },
    GM_setValue() {}, controls, queueSnapshots,
  });
  vm.runInContext(`
    const STORE_KEY='config', CONFIG_BACKUP_PREFIX='backup-', MAX_CONFIG_BACKUPS=3;
    const RECORDING_INTENT_KEY='recordings', ROOM_STATUS_HISTORY_KEY='history';
    const GITHUB_SYNC_STATE_KEY='sync', GITHUB_AUTO_IMPORT_LEASE_KEY='lease', GITHUB_AUTO_IMPORT_CHECK_MS=100;
    const GITHUB_SYNC_CONFIG_KEY='credentials', GITHUB_SYNC_FORMAT='encrypted', GITHUB_PBKDF2_ITERATIONS=250000;
    const GITHUB_SYNC_TARGET={owner:'test',repo:'test',branch:'main',path:'settings.json'}, GITHUB_API_VERSION='2022-11-28';
    const MAX_CONFIG_BYTES=2000000, META={version:'16.6.13'}, LANG='en';
    const DEFAULT_GROUP_ID='default', LIBRARY_GROUP_ID='library', ONLINE_GROUP_ID='online', ONLINE_FAVORITES_GROUP_ID='online-favorites';
    const FAVORITE_GROUP_ID='favorites', RECENT_FOLLOWED_GROUP_ID='recent-followed';
    function defaultState() { return ${JSON.stringify(initialState())}; }
    function sanitizeState(state) { return JSON.parse(JSON.stringify(state)); }
    function normalizeUsername(value) { return String(value || '').toLowerCase(); }
    function isLikelyUsername(value) { return /^[a-z][a-z0-9_]+$/.test(value); }
    function normalizeStateMemberships() {}
    function normalizeRoom(room) { return room; }
    function nextOrderForGroup(state) { return state.rooms.length; }
    function ensureRoomInGroup() { return false; }
    function numeric(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
    function isStableRoomStatus(value) { return ['online','offline','private'].includes(value); }
    function isTransientRoomStatus(value) { return ['unknown','loading','error'].includes(value); }
    function captureReloadedSettings() { return { storage: { ignoredusers: localStorage.getItem('ignoredusers') || '' } }; }
    function captureMobileCleanViewSettings() { return {}; }
    function isWorkshopRoute() { return true; }
    function isRecorderHubRoute() { return false; }
    function t(value) { return value; }
    function debounce(fn) { let timer; return (...args) => { clearTimeout(timer); timer=setTimeout(() => fn(...args)); }; }
    ${implementation}
    globalThis.api={Storage,backupCurrentConfig,pruneConfigBackups,writeStoreRaw,createStore,
      buildSuiteSettingsPayload,recordGithubSyncBaseline,saveGithubSyncState,loadGithubSyncState,
      uploadSuiteSettingsToGithub,exportSuiteSettings,
      importSuiteSettingsFromGithub,applySuiteSettingsPayload};
    globalThis.attachWorkshopStore = store => {
      const service = { stop() {}, has() { return true; } };
      function queueBackgroundServiceStart() {}
      ${workshopSync}
    };
  `, context);
  return { context, api: context.api, controls, values, timers, events, queueSnapshots,
    run(code) { return vm.runInContext(code, context); },
    drain() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); },
  };
}

const cases = [];
function test(name, action) { cases.push({ name, action }); }

test('failed save reports false, emits no saved-state event, and retains last backup', () => {
  const h = harness();
  h.values.set('backup-500', 'last-good');
  h.controls.failWrites = true;
  assert.equal(h.api.Storage.save(initialState()), false);
  assert.equal(h.values.get('backup-500'), 'last-good');
  assert.equal(h.events.filter(event => event.type === 'ryujo_multicam_storage').length, 0);
});

test('failed backup creation does not prune existing recovery copies', () => {
  const h = harness();
  for (const stamp of [100, 200, 300]) h.values.set(`backup-${stamp}`, `original-${stamp}`);
  h.controls.failBackup = true;
  assert.equal(h.api.backupCurrentConfig(), false);
  assert.equal([...h.values.keys()].filter(key => key.startsWith('backup-')).length, 3);
});

test('backup pruning retains the latest recovery copy even for a zero request', () => {
  const h = harness();
  h.values.set('backup-100', 'older'); h.values.set('backup-200', 'newer');
  h.api.pruneConfigBackups(0);
  assert.equal(h.values.get('backup-200'), 'newer');
});

test('failed direct add/remove do not claim success or export', () => {
  const h = harness();
  h.run(`queueGithubSettingsAutoExport = () => { queueSnapshots.push(Storage.load()); };`);
  h.controls.failWrites = true;
  assert.equal(h.api.Storage.add('model_one'), 'failed');
  h.values.set('config', JSON.stringify({ ...initialState(), rooms: [{ id: 'model_one' }] }));
  assert.equal(h.api.Storage.remove('model_one'), false);
  assert.equal(h.queueSnapshots.length, 0);
});

test('store add persists the added room before queueing its cloud export', () => {
  const h = harness();
  h.run(`queueGithubSettingsAutoExport = () => { queueSnapshots.push(Storage.load()); };`);
  const store = h.api.createStore();
  store.addRoom('model_one');
  assert.equal(h.queueSnapshots[0]?.rooms[0]?.id, 'model_one');
});

test('membership exports follow successful add/remove saves, not status writes or authoritative imports', () => {
  const h = harness();
  h.run(`queueGithubSettingsAutoExport = () => { queueSnapshots.push(Storage.load()); };`);
  const state = initialState(); state.rooms.push({ id: 'model_one', groups: ['default'] });
  assert.equal(h.api.Storage.save(state), true);
  assert.equal(h.queueSnapshots.length, 1);
  state.rooms[0].lastStatus = 'online';
  h.api.Storage.save(state);
  assert.equal(h.queueSnapshots.length, 1);
  state.rooms = [];
  h.api.Storage.save(state);
  assert.equal(h.queueSnapshots.length, 2);
  assert.equal(h.queueSnapshots[1].rooms.length, 0);
  state.rooms.push({ id: 'model_two', groups: ['default'] });
  h.api.Storage.save(state, { authoritative: true });
  assert.equal(h.queueSnapshots.length, 2);
});

test('pending failed store writes remain retryable and cannot queue export', () => {
  const h = harness();
  h.run(`queueGithubSettingsAutoExport = () => { queueSnapshots.push(Storage.load()); };`);
  const store = h.api.createStore();
  h.controls.failWrites = true;
  store.addRoom('model_one');
  assert.equal(store.persistence, 'failed');
  assert.equal(h.queueSnapshots.length, 0);
  h.controls.failWrites = false;
  assert.equal(store.flush(), true);
  assert.equal(store.persistence, 'saved');
  assert.equal(JSON.parse(h.values.get('config')).rooms[0].id, 'model_one');
});

test('external replacement cancels an obsolete pending write', () => {
  const h = harness();
  const store = h.api.createStore();
  store.update(state => { state.settings.layoutSize = 4; });
  const replacement = { ...initialState(), settings: { ...initialState().settings, layoutSize: 3 } };
  h.values.set('config', JSON.stringify(replacement));
  store.replaceState(replacement);
  assert.equal(h.timers.size, 0);
  h.drain();
  assert.equal(JSON.parse(h.values.get('config')).settings.layoutSize, 3);
});

test('uploaded baseline never marks later persisted settings clean', async () => {
  const h = harness();
  const sent = h.api.buildSuiteSettingsPayload();
  h.api.saveGithubSyncState({ localChangedAt: 500, lastSnapshotFingerprint: 'old' });
  const next = initialState(); next.settings.layoutSize = 4;
  h.api.Storage.save(next);
  await h.api.recordGithubSyncBaseline({ payload: sent, sha: 'sent-sha' });
  assert.notEqual(h.api.loadGithubSyncState().localChangedAt, 0);
});

test('uploaded baseline never clears an in-memory debounced change', async () => {
  const h = harness();
  const store = h.api.createStore();
  const sent = h.api.buildSuiteSettingsPayload();
  store.update(state => { state.settings.layoutSize = 4; });
  await h.api.recordGithubSyncBaseline({ payload: sent, sha: 'sent-sha' });
  assert.notEqual(h.api.loadGithubSyncState().localChangedAt, 0);
});

test('automatic import has no implementation or scheduler', () => {
  assert.doesNotMatch(source, /function (?:maybeAutoImportGithubSettings|scheduleGithubAutoImport|monitorGithubLocalSettings)/);
});

test('manual import rejects a local edit while download is pending', async () => {
  const h = harness();
  const store = h.api.createStore();
  h.run(`downloadSuiteSettingsFromGithub = () => new Promise(resolve => { globalThis.resolveDownload=resolve; });
    applySuiteSettingsPayload = () => { controls.applied++; return {}; };`);
  const pending = h.api.importSuiteSettingsFromGithub();
  store.update(state => { state.settings.layoutSize = 4; });
  h.context.resolveDownload({ payload: h.api.buildSuiteSettingsPayload(), sha: 'remote', envelope: {} });
  assert.equal(await pending, null);
  assert.equal(h.controls.applied, 0);
});

for (const persisted of [false, true]) {
  test(`manual import allows ${persisted ? 'persisted' : 'pending'} status-only updates during download`, async () => {
    const h = harness();
    const state = initialState(); state.rooms = [{ id: 'model_one', lastStatus: 'unknown' }];
    h.values.set('config', JSON.stringify(state));
    const store = h.api.createStore();
    const payload = h.api.buildSuiteSettingsPayload();
    h.run(`downloadSuiteSettingsFromGithub = () => new Promise(resolve => { globalThis.resolveDownload=resolve; });
      applySuiteSettingsPayload = () => { controls.applied++; return {}; };`);
    const pending = h.api.importSuiteSettingsFromGithub();
    store.update(s => { s.rooms[0].lastStatus = 'online'; s.rooms[0].lastSeenOnline = 1234; });
    if (persisted) assert.equal(store.flush(), true);
    h.context.resolveDownload({ payload, sha: 'remote', envelope: {} });
    assert.notEqual(await pending, null);
    assert.equal(h.controls.applied, 1);
    assert.deepEqual(h.controls.alerts, []);
  });
}

test('manual import flushes edits made before download, but aborts if they cannot persist', async () => {
  for (const failWrites of [false, true]) {
    const h = harness(); const store = h.api.createStore();
    store.update(s => { s.settings.layoutSize = 4; });
    h.controls.failWrites = failWrites;
    h.run(`downloadSuiteSettingsFromGithub = async () => {
      controls.downloads = (controls.downloads || 0) + 1;
      controls.downloadLayout = Storage.load().settings.layoutSize;
      return {payload:buildSuiteSettingsPayload(),sha:'remote',envelope:{}};
    }; applySuiteSettingsPayload = () => { controls.applied++; return {}; };`);
    const result = await h.api.importSuiteSettingsFromGithub();
    assert.equal(h.controls.applied, failWrites ? 0 : 1);
    assert.equal(h.controls.downloads || 0, failWrites ? 0 : 1);
    if (failWrites) assert.equal(result, null);
    else assert.equal(h.controls.downloadLayout, 4);
  }
});

for (const persisted of [false, true]) test(`manual import protects ${persisted ? 'persisted' : 'pending'} custom card sizes`, async () => {
  const h = harness(); const before = initialState(); before.rooms = [{id:'model_one'}];
  h.values.set('config', JSON.stringify(before));
  const store = h.api.createStore();
  h.run(`downloadSuiteSettingsFromGithub = () => new Promise(resolve => { globalThis.resolveDownload=resolve; });
    applySuiteSettingsPayload = () => { controls.applied++; return {}; };`);
  const pending = h.api.importSuiteSettingsFromGithub();
  store.update(s => { s.rooms[0].cardSizeByGroup = {default:{cols:4,rows:4}}; });
  if (persisted) store.flush();
  h.context.resolveDownload({payload:h.api.buildSuiteSettingsPayload(),sha:'remote',envelope:{}});
  assert.equal(await pending, null);
  assert.equal(h.controls.applied, 0);
});

test('manual import can repair corrupt storage while preserving its recoverable original', async () => {
  const h = harness(); const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  h.values.set('config', '{broken original');
  h.context.remotePayload = payload;
  h.run(`downloadSuiteSettingsFromGithub = async () => ({payload:remotePayload,sha:'remote',envelope:{}});`);
  assert.equal((await h.api.importSuiteSettingsFromGithub()).multicam, true);
  assert.equal(h.values.get('backup-1000'), '{broken original');
});

test('manual import does not overwrite damaged storage that changed during download', async () => {
  const h = harness(); const payload = h.api.buildSuiteSettingsPayload();
  h.values.set('config', '{broken original');
  h.run(`downloadSuiteSettingsFromGithub=()=>new Promise(resolve=>{globalThis.resolveDownload=resolve;});
    applySuiteSettingsPayload=()=>{controls.applied++;return {};};`);
  const pending = h.api.importSuiteSettingsFromGithub();
  h.values.set('config', '{changed original');
  h.context.resolveDownload({payload,sha:'remote',envelope:{}});
  assert.equal(await pending, null);
  assert.equal(h.controls.applied, 0);
});

test('baseline rejects a change that arrives during fingerprint hashing', async () => {
  const h = harness();
  const store = h.api.createStore();
  const pending = h.api.recordGithubSyncBaseline({ payload: h.api.buildSuiteSettingsPayload(), sha: 'sent' });
  store.update(state => { state.settings.layoutSize = 4; });
  await pending;
  assert.notEqual(h.api.loadGithubSyncState().localChangedAt, 0);
});

test('unchanged successfully uploaded settings establish a clean baseline', async () => {
  const h = harness();
  h.api.saveGithubSyncState({ localChangedAt: 500, lastSnapshotFingerprint: 'old' });
  await h.api.recordGithubSyncBaseline({ payload: h.api.buildSuiteSettingsPayload(), sha: 'sent' });
  assert.equal(h.api.loadGithubSyncState().localChangedAt, 0);
  assert.equal(h.api.loadGithubSyncState().lastAppliedSha, 'sent');
});

test('manual export acknowledges only its uploaded snapshot', async () => {
  const h = harness();
  h.run(`uploadSuiteSettingsToGithub = () => new Promise(resolve => { globalThis.resolveUpload=resolve; });`);
  const sent = h.api.buildSuiteSettingsPayload();
  const pending = h.api.exportSuiteSettings();
  const edited = initialState(); edited.settings.layoutSize = 4;
  h.api.Storage.save(edited);
  h.context.resolveUpload({ payload: sent, sha: 'sent' });
  await pending;
  assert.notEqual(h.api.loadGithubSyncState().localChangedAt, 0);
});

test('backup creation preserves prior backup from the same millisecond', () => {
  const h = harness();
  h.values.set('backup-1000', 'prior-copy');
  assert.equal(h.api.backupCurrentConfig(), true);
  assert.equal(h.values.get('backup-1000'), 'prior-copy');
  assert.equal(h.values.get('backup-1001'), h.values.get('config'));
});

test('import persistence failure does not continue to imported-success state', () => {
  const h = harness();
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  h.controls.failWrites = true;
  assert.throws(() => h.api.applySuiteSettingsPayload(payload), /could not be backed up/);
});

test('import baseline accepts the synchronously applied canonical settings', async () => {
  const h = harness();
  h.run(`downloadSuiteSettingsFromGithub = async () => ({ payload: globalThis.remotePayload, sha: 'remote', envelope: {} });`);
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.settings.activeGroup = 'favorites';
  h.context.remotePayload = payload;
  const imported = await h.api.importSuiteSettingsFromGithub();
  assert.equal(imported.multicam, true);
  assert.equal(h.api.Storage.load().settings.activeGroup, 'default');
  assert.equal(h.api.loadGithubSyncState().localChangedAt, 0);
  h.drain();
  assert.equal(h.controls.reloads, 1);
});

test('an edit after import cancels its delayed reload', async () => {
  const h = harness();
  h.run(`downloadSuiteSettingsFromGithub = async () => ({ payload: globalThis.remotePayload, sha: 'remote', envelope: {} });`);
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  h.context.remotePayload = payload;
  await h.api.importSuiteSettingsFromGithub();
  const edited = initialState(); edited.settings.layoutSize = 4;
  h.api.Storage.save(edited);
  h.drain();
  assert.equal(h.controls.reloads, 0);
});

test('quota retry can succeed without deleting the last recovery copy', () => {
  const h = harness();
  h.values.set('backup-100', 'older'); h.values.set('backup-200', 'newer');
  h.controls.failCount = 1;
  const edited = initialState(); edited.settings.layoutSize = 4;
  assert.equal(h.api.Storage.save(edited), true);
  assert.equal(h.values.get('backup-200'), 'newer');
  assert.equal(h.api.Storage.load().settings.layoutSize, 4);
});

test('upload flushes pending state before building its immutable payload', async () => {
  const h = harness();
  const store = h.api.createStore();
  store.update(state => { state.settings.layoutSize = 4; });
  h.run(`encryptSuiteSettingsPayload = async payload => { globalThis.encryptedPayload=JSON.stringify(payload); return {}; };
    githubApiRequest = async (config, method) => method === 'GET' ? {status:200,data:{sha:'old'}} : {status:200,data:{content:{sha:'new'}}};`);
  const pending = h.api.uploadSuiteSettingsToGithub({ deviceName: 'test', path: 'settings.json' }, 'fake-passphrase');
  store.update(state => { state.settings.layoutSize = 8; });
  const result = await pending;
  assert.equal(JSON.parse(h.context.encryptedPayload).components.multicamPro.settings.layoutSize, 4);
  assert.equal(result.payload.components.multicamPro.settings.layoutSize, 4);
  assert.equal(h.api.Storage.load().settings.layoutSize, 4);
  assert.equal(store.state.settings.layoutSize, 8);
});

test('upload never starts encryption when the local flush fails', async () => {
  const h = harness();
  const store = h.api.createStore();
  store.update(state => { state.settings.layoutSize = 4; });
  h.controls.failWrites = true;
  h.run(`encryptSuiteSettingsPayload = async () => { controls.encrypted=true; return {}; };
    githubApiRequest = async (config, method) => ({status: method === 'GET' ? 404 : 201, data:{}});`);
  await assert.rejects(h.api.uploadSuiteSettingsToGithub({ path: 'settings.json' }, 'fake-passphrase'), /could not be saved/);
  assert.equal(h.controls.encrypted, undefined);
  assert.equal(store.persistence, 'failed');
});

test('default fallback cannot overwrite corrupt stored config through an ordinary add', () => {
  const h = harness();
  h.values.set('config', '{corrupted-json');
  assert.equal(h.api.Storage.load().rooms.length, 0);
  assert.equal(h.api.Storage.add('model_one'), 'failed');
  assert.equal(h.values.get('config'), '{corrupted-json');
});

test('explicit import can replace corrupt config only after preserving its raw bytes', () => {
  const h = harness();
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  h.values.set('config', '{corrupted-json');
  assert.equal(h.api.applySuiteSettingsPayload(payload).multicam, true);
  assert.equal(h.values.get('backup-1000'), '{corrupted-json');
  assert.equal(h.api.Storage.load().rooms.length, 0);
});

test('failed import backup leaves the active config untouched', () => {
  const h = harness();
  const before = h.values.get('config');
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.settings.layoutSize = 4;
  h.controls.failBackup = true;
  assert.throws(() => h.api.applySuiteSettingsPayload(payload), /could not be backed up/);
  assert.equal(h.values.get('config'), before);
});

test('secondary-component failure reports partial import and never records success or reloads', async () => {
  const h = harness();
  const before = h.values.get('config');
  const payload = h.api.buildSuiteSettingsPayload();
  payload.components.multicamPro.settings.layoutSize = 4;
  h.context.remotePayload = payload;
  h.run(`downloadSuiteSettingsFromGithub = async () => ({ payload: globalThis.remotePayload, sha: 'remote', envelope: {} });
    function restoreReloadedSettings() { localStorage.setItem('ignoredusers','partial'); throw new Error('QuotaExceededError'); }`);
  assert.equal(await h.api.importSuiteSettingsFromGithub(), null);
  assert.equal(h.values.get('backup-1000'), before);
  assert.match(h.controls.alerts[0], /possible partial changes/);
  assert.equal(h.api.loadGithubSyncState().lastAppliedSha, '');
  h.drain();
  assert.equal(h.controls.reloads, 0);
});

test('corrupt local config cannot export fallback defaults over the cloud backup', async () => {
  const h = harness();
  h.values.set('config', '{corrupted-json');
  h.run(`encryptSuiteSettingsPayload = async () => { controls.encrypted=true; return {}; };
    githubApiRequest = async (config, method) => ({status: method === 'GET' ? 404 : 201, data:{}});`);
  await assert.rejects(h.api.uploadSuiteSettingsToGithub({ path: 'settings.json' }, 'fake-passphrase'), /Stored settings are unreadable/);
  assert.equal(h.controls.encrypted, undefined);
});

test('failed clear reports failure without emitting a cleared-state event', () => {
  const h = harness();
  const before = h.values.get('config');
  h.controls.failRemovals = true;
  assert.equal(h.api.Storage.clearAll(), false);
  assert.equal(h.values.get('config'), before);
  assert.equal(h.events.filter(event => event.type === 'ryujo_multicam_storage').length, 0);
  assert.equal(h.events.find(event => event.type === 'ryujo_multicam_persistence')?.detail.status, 'failed');
});

test('successful clear and explicit replacement cannot restore a pending old config', () => {
  const h = harness();
  const store = h.api.createStore();
  store.update(state => { state.settings.layoutSize = 4; });
  assert.equal(h.api.Storage.clearAll(), true);
  store.replaceState(initialState());
  assert.equal(store.flush(), true);
  h.drain();
  assert.equal(h.values.has('config'), false);
});

test('clock rollback cannot prune the newly required pre-import backup', () => {
  const h = harness();
  for (const stamp of [2000, 3000, 4000]) h.values.set(`backup-${stamp}`, `older-${stamp}`);
  const currentRaw = h.values.get('config');
  assert.equal(h.api.backupCurrentConfig(), true);
  assert.ok([...h.values.entries()].some(([key, value]) => key.startsWith('backup-') && value === currentRaw));
});

test('same-page Suite import replaces Workshop settings before a room status write', () => {
  const h = harness();
  const before = initialState();
  before.rooms = [{ id: 'model_one', lastStatus: 'offline' }];
  h.values.set('config', JSON.stringify(before));
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.settings.layoutSize = 4;
  h.api.applySuiteSettingsPayload(payload);
  store.patchRoom('model_one', { lastStatus: 'online' });
  store.flush();
  assert.equal(h.api.Storage.load().settings.layoutSize, 4, 'status persistence must not restore pre-import Workshop settings');
  assert.equal(store.state.settings.layoutSize, 4);
});

test('authoritative same-page import cancels an older Workshop pending write', () => {
  const h = harness();
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  store.update(state => { state.settings.layoutSize = 8; });
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.settings.layoutSize = 4;
  h.api.applySuiteSettingsPayload(payload);
  h.drain();
  assert.equal(h.api.Storage.load().settings.layoutSize, 4);
  assert.equal(store.state.settings.layoutSize, 4);
  assert.equal(store.persistence, 'saved');
});

test('ordinary external room sync still preserves this Workshop view settings', () => {
  const h = harness();
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  const external = initialState();
  external.settings.layoutSize = 4;
  external.rooms = [{ id: 'model_two', lastStatus: 'online' }];
  h.context.window.dispatchEvent({ type: 'storage', key: 'config', newValue: JSON.stringify(external) });
  assert.equal(store.state.settings.layoutSize, 2);
  assert.equal(store.state.rooms[0].id, 'model_two');
});

test('authoritative import replaces the full library without preserving old room status', () => {
  const h = harness();
  const before = initialState();
  before.rooms = [{ id: 'model_one', lastStatus: 'online' }, { id: 'model_old', lastStatus: 'offline' }];
  h.values.set('config', JSON.stringify(before));
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.rooms = [{ id: 'model_one', lastStatus: 'unknown' }, { id: 'model_new', lastStatus: 'offline' }];
  h.api.applySuiteSettingsPayload(payload);
  assert.equal(store.state.rooms[0].lastStatus, 'unknown');
  assert.deepEqual(Array.from(store.state.rooms, room => room.id), ['model_one', 'model_new']);
});

test('ordinary same-page persistence does not authorize a full Workshop replacement', () => {
  const h = harness();
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  const ordinary = initialState(); ordinary.settings.layoutSize = 4;
  assert.equal(h.api.Storage.save(ordinary), true);
  assert.equal(store.state.settings.layoutSize, 2);
  assert.equal(h.events.find(event => event.type === 'ryujo_multicam_storage').detail.authoritative, false);
});

test('status activity does not cancel import reload or revert imported Workshop settings', async () => {
  const h = harness();
  const before = initialState(); before.rooms = [{ id: 'model_one', lastStatus: 'offline' }];
  h.values.set('config', JSON.stringify(before));
  const store = h.api.createStore();
  h.context.attachWorkshopStore(store);
  const payload = h.api.buildSuiteSettingsPayload();
  delete payload.components.reloaded; delete payload.components.mobileCleanView;
  payload.components.multicamPro.settings.layoutSize = 4;
  h.context.remotePayload = payload;
  h.run(`downloadSuiteSettingsFromGithub = async () => ({ payload: globalThis.remotePayload, sha: 'remote', envelope: {} });`);
  assert.equal((await h.api.importSuiteSettingsFromGithub()).multicam, true);
  store.patchRoom('model_one', { lastStatus: 'online' });
  h.drain();
  assert.equal(h.controls.reloads, 1, 'status-only activity must not prevent import completion');
  assert.equal(h.api.Storage.load().settings.layoutSize, 4);
  assert.equal(store.state.settings.layoutSize, 4);
});

// Recording data is now deliberately left untouched. Only owned status-history
// cleanup is still part of an import transaction.
for (const failedKey of ['history']) {
  test(`failed ${failedKey} import cleanup reports partial failure without success or reload`, async () => {
    const h = harness();
    const before = h.values.get('config');
    const oldIntents = JSON.stringify(['removed_model']);
    const oldHistory = JSON.stringify({ removed_model: [{ status: 'online', ts: 500 }] });
    h.values.set('recordings', oldIntents);
    h.values.set('history', oldHistory);
    const payload = h.api.buildSuiteSettingsPayload();
    delete payload.components.reloaded; delete payload.components.mobileCleanView;
    payload.components.multicamPro.settings.layoutSize = 4;
    h.context.remotePayload = payload;
    h.context.failedCleanupKey = failedKey;
    h.run(`downloadSuiteSettingsFromGithub = async () => ({ payload: globalThis.remotePayload, sha: 'remote', envelope: {} });
      const originalSet = localStorage.setItem;
      localStorage.setItem = (key, value) => { if (key === failedCleanupKey) throw new Error('QuotaExceededError'); return originalSet(key, value); };`);
    let acknowledged = false;
    assert.equal(await h.api.importSuiteSettingsFromGithub({ onImported() { acknowledged = true; } }), null);
    assert.equal(acknowledged, false);
    assert.match(h.controls.alerts[0], /possible partial changes/);
    assert.match(h.controls.alerts[0], failedKey === 'recordings' ? /recording intents/i : /status history/i);
    assert.equal(h.values.get('backup-1000'), before);
    assert.equal(h.api.Storage.load().settings.layoutSize, 4, 'the already committed configuration is retained, not silently rolled back');
    assert.equal(h.values.get(failedKey), failedKey === 'recordings' ? oldIntents : oldHistory);
    assert.equal(h.api.loadGithubSyncState().lastAppliedSha, '');
    h.drain();
    assert.equal(h.controls.reloads, 0);
  });
}

let failures = 0;
for (const { name, action } of cases) {
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
console.log(`${baseline ? 'Baseline reproduction' : 'Stage 2 persistence'}: ${cases.length - failures}/${cases.length} passed.`);
process.exitCode = failures ? 1 : 0;
