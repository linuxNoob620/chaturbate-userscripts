import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';

// Executes the actual userscript Store, persistence adapter, codec, sanitizers,
// private storage wrapper and Workshop storage listeners. Browser events/timers
// and the controller's receipt boundary are controlled fixtures, not live UI or
// real IndexedDB/cloud acceptance. All records below are synthetic.
const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Userscript boundaries exist: ${start}`);
  return source.slice(from, to);
}
const code = [
  section('function createSettingsSyncCodec()', 'function createSettingsSyncClient('),
  section('  const suiteNativeStorage =', '  const RECU_BRIDGE_PARAM'),
  section('  const uuid =', '  const LIBRARY_GROUP_ID'),
  section('  const STABLE_ROOM_STATUSES =', '  function shortcutFromEvent('),
  section('  function defaultVideoTransform()', '  function encodeSharePayload('),
  section('  function normalizeUsername(', '  function isSafeHttpUrl('),
  section('  const USERNAME_EXCLUDE =', '  function roomPageUrl('),
  section('  const defaultState =', '  function pruneConfigBackups('),
  section('  function pruneConfigBackups(', '  function backupCurrentConfig('),
  section('  let pendingStoreWriter =', '  function buildSuiteSettingsPayload('),
  section('  function workshopMembershipSignature(', '  function showSuiteToast('),
  section('  function createStore()', '  /* ============================================================='),
].join('\n');
const externalListeners = section('    // ---- 跨标签页实时同步 ----', '    // ---- 全局拖动结束 ----');
const storeKey = 'ryujo_multicam_v8';
const clone = (value) => JSON.parse(JSON.stringify(value));

function harness({ enabled = false } = {}) {
  const values = new Map();
  const timers = new Map();
  const listeners = new Map();
  const events = [];
  const receipts = [];
  const writes = [];
  const warnings = [];
  const membershipExports = [];
  const controls = { failWrites: false, bridgeEnabled: enabled };
  let nextTimer = 0;
  const nativeStorage = {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(String(key)) ?? null; },
    setItem(key, value) {
      if (controls.failWrites) throw new Error('Injected quota failure');
      values.set(String(key), String(value));
      writes.push({ key: String(key), value: String(value) });
    },
    removeItem(key) { values.delete(String(key)); },
  };
  const window = {
    localStorage: nativeStorage,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    dispatchEvent(event) {
      events.push(event);
      for (const callback of listeners.get(event.type) || []) callback(event);
    },
  };
  const factory = new Function('window', 'setTimeout', 'clearTimeout', 'CustomEvent', 'console', 'crypto', 'controls', 'receipts', 'membershipExports', `
    const STORE_KEY = '${storeKey}', CONFIG_BACKUP_PREFIX = 'test-backup-', MAX_CONFIG_BACKUPS = 3;
    const META = { version: ${JSON.stringify(source.match(/\/\/ @version\s+(\S+)/)[1])} }, RELOADED_VERSION = '1.8.0', LANG = 'en';
    const LIBRARY_GROUP_ID = 'library', DEFAULT_GROUP_ID = 'all', ONLINE_GROUP_ID = 'online';
    const ONLINE_FAVORITES_GROUP_ID = 'online-favorites', FAVORITE_GROUP_ID = 'fav', RECENT_FOLLOWED_GROUP_ID = 'recent-followed';
    function githubLocalSettingsSnapshot(state) { return JSON.stringify(state); }
    function queueGithubSettingsAutoExport(reason) { membershipExports.push(reason); return Promise.resolve(); }
    ${code}
    const codec = createSettingsSyncCodec();
    suiteSettingsSyncBridge = {
      enabled() { return controls.bridgeEnabled; },
      beforeWrite(key, raw) {
        if (!controls.bridgeEnabled || !codec.isStorageKey(key)) return null;
        const before = storeSyncPayload(Storage.load({ strict: true }));
        const after = codec.withStorageValue(before, key, raw);
        const receipt = { key, before: codec.capture(before), after: codec.capture(after), success: null };
        receipts.push(receipt);
        return receipt;
      },
      afterWrite(receipt, success) { if (receipt) receipt.success = success; },
      schedule() {},
    };
    function attach(store) {
      const service = { stop() {}, has() { return true; } };
      function queueBackgroundServiceStart() {}
      ${externalListeners}
    }
    return { createStore, Storage, defaultState, sanitizeState, sharedStoreSnapshot, storeSyncPayload,
      rebaseSuiteStoreState, codec, attach, pendingWriter: () => pendingStoreWriter };
  `);
  const api = factory(window,
    (callback) => { const id = ++nextTimer; timers.set(id, callback); return id; },
    (id) => timers.delete(id),
    class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    { warn(...args) { warnings.push(args); } }, webcrypto, controls, receipts, membershipExports);
  const initial = api.defaultState();
  initial.groups.push({ id: 'custom', name: 'Synthetic group', order: 5, system: false });
  initial.rooms = ['model_one', 'model_two'].map((id, order) => ({
    id, addedAt: 1700000000000 + order, groups: ['all', 'custom'], group: 'all', groupOrder: { all: order, custom: order }, order,
    lastStatus: order ? 'offline' : 'online', lastSeenOnline: 1700000000000, muted: true,
    cardSizeByGroup: { all: { cols: 4, rows: 3 } },
  }));
  Object.assign(initial.settings, { activeGroup: 'all', layoutSize: 4, volume: 0.25, searchQuery: 'local',
    splitRoomIds: ['model_one', 'model_two'], splitViewActive: true, splitAudioRoomId: 'model_two',
    videoTransforms: { model_one: { zoom: 2, x: 10, y: 20, rotation: 90, mirror: true, flip: false } } });
  values.set(storeKey, JSON.stringify(api.sanitizeState(initial)));
  return {
    api, values, timers, events, receipts, writes, warnings, membershipExports, controls, window,
    makeStore({ attach = false } = {}) { const store = api.createStore(); if (attach) api.attach(store); return store; },
    persisted() { return api.Storage.load({ strict: true }); },
    external(next, { projection = false } = {}) {
      const clean = api.sanitizeState(clone(next));
      const raw = JSON.stringify(clean);
      values.set(storeKey, raw);
      if (projection) window.dispatchEvent({ type: 'ryujo_multicam_storage', detail: { state: clean, syncProjection: true } });
      else window.dispatchEvent({ type: 'storage', key: storeKey, newValue: raw });
    },
    drain() {
      for (let count = 0; timers.size; count += 1) {
        assert.ok(count < 100, 'bounded Store timer queue');
        const [id, callback] = timers.entries().next().value;
        timers.delete(id);
        callback();
      }
    },
  };
}

let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed += 1; console.log(`ok ${passed} - ${name}`); }
  catch (error) { failures.push({ name, error }); console.error(`FAIL - ${name}\n${error.stack}`); }
}

check('Workshop lookup follows room identity after a status-only save', () => {
  for (const enabled of [false, true]) {
    const h = harness({ enabled }), store = h.makeStore();
    const lookup = new Function('store', 'tempRooms', 'recentRoomMap',
      section('    let savedRoomIndex =', '    function roomIdsForWorkshopRefresh(')
      + '\nreturn findRoomAny;')(store, [], new Map());
    assert.equal(lookup('model_two').lastStatus, 'offline');
    store.patchRoom('model_one', { lastSeenOnline: 1700000060000 });
    h.drain();
    store.patchRoom('model_two', { lastStatus: 'online', lastSeenOnline: 1800000000000 });
    assert.equal(lookup('model_two'), store.state.rooms.find(room => room.id === 'model_two'));
    assert.equal(lookup('model_two').lastStatus, 'online');
  }
});

for (const enabled of [false, true]) {
  const mode = enabled ? 'enabled' : 'disabled';
  check(`shared preference persists immediately with sync ${mode}`, () => {
    const h = harness({ enabled });
    const store = h.makeStore();
    store.patchSettings({ favoriteFirst: false });
    assert.equal(h.persisted().settings.favoriteFirst, false);
    assert.equal(store.persistence, 'saved');
    assert.equal(h.timers.size, 0);
    assert.equal(h.receipts.length, enabled ? 1 : 0);
    if (enabled) {
      assert.equal(h.receipts[0].success, true);
      assert.equal(h.receipts[0].after['multicam/favoriteFirst'], false);
    }
  });

  check(`room/group creation and move-only metadata are normalized before codec with sync ${mode}`, () => {
    const h = harness({ enabled });
    const store = h.makeStore();
    const group = store.addGroup('New synthetic group');
    assert.ok(h.persisted().groups.some((entry) => entry.id === group && entry.system === false));
    assert.equal(store.addRoom('model_three'), true);
    assert.ok(h.persisted().rooms.some((entry) => entry.id === 'model_three'));
    store.moveOnlyToGroup('model_one', group);
    let persisted = h.persisted();
    assert.deepEqual(persisted.rooms.find((entry) => entry.id === 'model_one').groups, [group]);
    assert.deepEqual(Object.keys(persisted.rooms.find((entry) => entry.id === 'model_one').groupOrder), [group]);
    store.removeRoom('model_three');
    store.removeGroup(group);
    persisted = h.persisted();
    assert.ok(!persisted.rooms.some((entry) => entry.id === 'model_three'));
    assert.ok(!persisted.groups.some((entry) => entry.id === group));
    assert.deepEqual(persisted.rooms.find((entry) => entry.id === 'model_one').groups, []);
    assert.equal(store.persistence, 'saved');
    assert.equal(h.warnings.length, 0);
  });

  check(`a status-only stale Store cannot overwrite newer persisted shared state with sync ${mode}`, () => {
    const h = harness({ enabled });
    const stale = h.makeStore();
    const newer = h.persisted();
    newer.settings.favoriteFirst = false;
    newer.settings.notifyOnline = false;
    newer.rooms[1].groups = ['fav']; newer.rooms[1].group = 'fav'; newer.rooms[1].groupOrder = { fav: 0 };
    h.values.set(storeKey, JSON.stringify(newer)); // Simulate a save before this tab receives a storage event.
    stale.patchRoom('model_one', { lastStatus: 'private', privateLabel: 'Synthetic private', lastSeenOnline: 1800000000000 });
    assert.equal(stale.persistence, 'pending');
    assert.equal(stale.flush(), true);
    const saved = h.persisted();
    assert.equal(saved.settings.favoriteFirst, false);
    assert.equal(saved.settings.notifyOnline, false);
    assert.deepEqual(saved.rooms[1].groups, ['fav']);
    assert.equal(saved.rooms[0].lastStatus, 'private');
    assert.equal(stale.state.settings.favoriteFirst, false);
  });
}

check('mixed local-first and shared preference patches still persist shared changes immediately', () => {
  for (const patch of [{ volume: 0.6, favoriteFirst: false }, { favoriteFirst: false, volume: 0.6 }]) {
    const h = harness();
    const store = h.makeStore();
    store.patchSettings(patch);
    assert.equal(h.persisted().settings.favoriteFirst, false);
    assert.equal(store.persistence, 'saved');
  }
});

for (const projection of [false, true]) {
  check(`ordinary ${projection ? 'projection' : 'external event'} retains pending draft edits and incoming shared edits`, () => {
    const h = harness({ enabled: true });
    const store = h.makeStore({ attach: true });
    h.controls.failWrites = true;
    store.patchSettings({ notifyOnline: false });
    assert.equal(store.persistence, 'failed');
    h.controls.failWrites = false;
    const incoming = h.persisted();
    incoming.settings.favoriteFirst = false;
    incoming.settings.layoutSize = 2;
    const writesBefore = h.writes.length;
    h.external(incoming, { projection });
    assert.equal(h.writes.length, writesBefore, 'incoming event must not echo a storage write');
    assert.equal(store.state.settings.notifyOnline, false, 'failed local draft survives');
    assert.equal(store.state.settings.favoriteFirst, false, 'new incoming preference survives');
    assert.equal(store.state.settings.layoutSize, 4, 'Workshop retains its local layout');
    assert.equal(store.persistence, 'pending');
    assert.equal(store.flush(), true);
    assert.equal(h.persisted().settings.notifyOnline, false);
    assert.equal(h.persisted().settings.favoriteFirst, false);
  });
}

check('ordinary incoming state preserves pending local view changes and debounced persistence', () => {
  const h = harness();
  const store = h.makeStore({ attach: true });
  store.patchSettings({ layoutSize: 9, volume: 0.7 });
  assert.equal(store.persistence, 'pending');
  const incoming = h.persisted();
  incoming.settings.notifyFavoritesOnly = false;
  incoming.settings.layoutSize = 2;
  h.external(incoming);
  assert.equal(store.persistence, 'pending');
  assert.equal(store.state.settings.layoutSize, 9);
  assert.equal(store.state.settings.volume, 0.7);
  assert.equal(store.state.settings.notifyFavoritesOnly, false);
  h.drain();
  assert.equal(h.persisted().settings.layoutSize, 9);
  assert.equal(h.persisted().settings.notifyFavoritesOnly, false);
});

check('explicit authoritative replacement cancels the old draft and its pending timer', () => {
  const h = harness();
  const store = h.makeStore({ attach: true });
  store.patchSettings({ layoutSize: 9, volume: 0.7 });
  assert.equal(store.persistence, 'pending');
  const replacement = h.persisted();
  replacement.rooms = [replacement.rooms[1]];
  replacement.settings.layoutSize = 2;
  replacement.settings.volume = 0;
  replacement.settings.favoriteFirst = false;
  assert.equal(h.api.Storage.save(replacement, { authoritative: true }), true);
  assert.equal(store.persistence, 'saved');
  assert.equal(h.api.pendingWriter(), null);
  assert.equal(h.timers.size, 0);
  assert.deepEqual(store.state.rooms.map((entry) => entry.id), ['model_two']);
  assert.equal(store.state.settings.layoutSize, 2);
  assert.equal(store.state.settings.volume, 0);
  h.drain();
  assert.equal(h.persisted().settings.layoutSize, 2);
  assert.equal(h.persisted().settings.volume, 0);
});

check('theatre preference persists locally and survives shared sync projection', () => {
  const h = harness(); const store = h.makeStore({ attach: true });
  assert.equal(store.state.settings.defaultTheaterMode, true);
  store.patchSettings({ defaultTheaterMode: false });
  assert.equal(store.flush(), true);
  assert.equal(h.persisted().settings.defaultTheaterMode, false);
  const incoming = h.persisted(); incoming.settings.favoriteFirst = false;
  h.external(incoming);
  assert.equal(store.state.settings.defaultTheaterMode, false);
  assert.equal(h.makeStore().state.settings.defaultTheaterMode, false);
});

check('ordinary shared projection leaves playback, transforms, card sizes and view state intact', () => {
  const h = harness();
  const store = h.makeStore({ attach: true });
  const before = clone(store.state);
  const incoming = h.persisted();
  incoming.settings.favoriteFirst = false;
  incoming.settings.layoutSize = 9;
  incoming.settings.volume = 1;
  incoming.settings.activeGroup = 'fav';
  incoming.settings.videoTransforms = {};
  incoming.settings.splitViewActive = false;
  h.external(incoming, { projection: true });
  assert.equal(store.state.settings.favoriteFirst, false);
  for (const field of ['layoutSize', 'volume', 'activeGroup', 'searchQuery', 'videoTransforms', 'splitRoomIds', 'splitViewActive', 'splitAudioRoomId']) {
    assert.deepEqual(store.state.settings[field], before.settings[field], field);
  }
  assert.equal(store.state.rooms[0].muted, before.rooms[0].muted);
  assert.deepEqual(store.state.rooms[0].cardSizeByGroup, before.rooms[0].cardSizeByGroup);
});

check('runtime Pure Mode survives flush while the saved configuration keeps it transient', () => {
  const h = harness();
  const store = h.makeStore();
  store.patchSettings({ pureMode: true });
  assert.equal(store.state.settings.pureMode, true);
  assert.equal(store.flush(), true);
  assert.equal(store.state.settings.pureMode, true, 'flushing persistence must not close current Pure Mode');
  assert.equal(h.persisted().settings.pureMode, false);
  store.patchRoom('model_one', { lastStatus: 'offline' });
  h.drain();
  assert.equal(store.state.settings.pureMode, true);
});

check('corrupt persisted state makes flush fail without throwing, losing its draft, or overwriting corruption', () => {
  const h = harness();
  const store = h.makeStore();
  const original = h.values.get(storeKey);
  store.patchSettings({ layoutSize: 9 });
  h.values.set(storeKey, '{invalid');
  assert.equal(store.flush(), false);
  assert.equal(store.persistence, 'failed');
  assert.equal(store.state.settings.layoutSize, 9);
  assert.equal(h.values.get(storeKey), '{invalid');
  assert.ok(h.events.some((event) => event.type === 'ryujo_multicam_persistence' && event.detail.status === 'failed'));
  h.values.set(storeKey, original);
  assert.equal(store.flush(), true);
  assert.equal(h.persisted().settings.layoutSize, 9);
});

check('failed writes leave shared drafts retryable and do not acknowledge successful receipts', () => {
  const h = harness({ enabled: true });
  const store = h.makeStore();
  h.controls.failWrites = true;
  store.patchSettings({ notifyFavoritesOnly: false });
  assert.equal(store.persistence, 'failed');
  assert.equal(store.state.settings.notifyFavoritesOnly, false);
  assert.equal(h.persisted().settings.notifyFavoritesOnly, true);
  assert.ok(h.receipts.length > 0);
  assert.ok(h.receipts.every((receipt) => receipt.success === false));
  h.controls.failWrites = false;
  assert.equal(store.flush(), true);
  assert.equal(h.persisted().settings.notifyFavoritesOnly, false);
  assert.equal(h.receipts.at(-1).success, true);
});

console.log(`Settings sync Store integration: ${passed} passed, ${failures.length} failed (extracted actual userscript, synthetic data).`);
if (failures.length) process.exitCode = 1;
