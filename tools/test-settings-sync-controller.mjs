// Actual protocol/client/codec/controller; deterministic in-memory I/O boundaries only.
// No browser profile, credentials, GitHub request, or user's settings are accessed.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = name => fs.readFileSync(new URL(`../src/settings-sync-${name}.js`, import.meta.url), 'utf8');
const { core, client, codec } = new Function(`${source('core')}\n${source('client')}\n${source('codec')}
  const core=createSettingsSyncCore(); return {core,client:createSettingsSyncClient(core),codec:createSettingsSyncCodec()};`)();
const controllerSource = source('controller');
const copy = value => JSON.parse(JSON.stringify(value));
const CONFIG = 'ziggy_suite_sync_v2_config';
const MIRROR = 'ziggy_suite_sync_v2_view';
const WAL = 'ziggy_suite_sync_v2_wal_';
const owner = 'synthetic-test-account';
const room = { id: 'test_model', addedAt: 1, groups: ['all'], groupOrder: { all: 0 }, order: 0, notes: 'original' };
const groups = [
  { id: 'library', name: '__library__', order: 0, system: true },
  { id: 'all', name: '__all__', order: 1, system: true },
  { id: 'online-favorites', name: '__online_favorites__', order: 2, system: true },
  { id: 'online', name: '__online__', order: 3, system: true },
  { id: 'fav', name: '__fav__', order: 4, system: true },
];
const payload = () => ({ format: 'chaturbate-suite-settings-v4', components: {
  multicamPro: { version: '16.6.22', settings: { favoriteFirst: false, notifyOnline: true, layoutSize: 2, searchQuery: 'tab-only' }, rooms: [copy(room)], groups: copy(groups) },
  reloaded: { version: '1.8.0', storage: { bigthumb: 'no' }, themeName: 'dark' },
  mobileCleanView: { version: '2.0.0', settings: { enabled: true, hidePromos: true, compactBrowse: true, autoHideSeconds: 5, side: 'left' } },
} });

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fixture({ enrolled = true } = {}) {
  const data = new Map(), vaults = new Map(), timers = new Map(), events = [], notices = [], requests = [];
  const held = new Set();
  let storageFault = null, vaultFault = null, applyFault = null, updateTail = Promise.resolve();
  let tick = 100000, serial = 0, activeAccount = owner, local = payload(), auth = { token: 'synthetic-only', passphrase: 'synthetic-test-passphrase', rememberPassphrase: true };
  const initial = core.seed(codec.capture(local), 'test-sync');
  let remote = { account: owner, document: copy(initial), sha: 'sha-1', etag: 'etag-1' };
  let readHook = null, writeHook = null;
  const storage = {
    get length() { return data.size; }, key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) {
      events.push(['set', key]);
      if (storageFault?.('set', key)) throw new Error('injected localStorage failure');
      data.set(key, String(value));
    },
    removeItem(key) {
      events.push(['remove', key]);
      if (storageFault?.('remove', key)) throw new Error('injected localStorage failure');
      data.delete(key);
    },
  };
  const vault = {
    async read(key) { await updateTail; return vaults.has(key) ? copy(vaults.get(key)) : null; },
    update(key, mutator) {
      const operation = updateTail.then(() => {
        events.push(['transaction', key]);
        const proposed = mutator(vaults.has(key) ? copy(vaults.get(key)) : null);
        assert.equal(typeof proposed?.then, 'undefined', 'mutator must be synchronous');
        if (vaultFault?.(proposed)) throw new Error('injected canonical commit failure');
        vaults.set(key, copy(proposed.state));
        events.push(['commit', key]);
        return copy(proposed);
      });
      updateTail = operation.catch(() => {});
      return operation;
    },
    close() { events.push(['close']); },
  };
  const locks = {
    async request(name, options, action) {
      if (typeof options === 'function') { action = options; options = {}; }
      if (held.has(name)) {
        assert.equal(options.ifAvailable, true, 'unexpected overlapping blocking lock in fixture');
        return action(null);
      }
      held.add(name);
      try { return await action({ name }); } finally { held.delete(name); }
    },
  };
  function newController() {
    const create = new Function('setTimeout', 'clearTimeout', `${controllerSource}\nreturn createSettingsSyncController;`)(
      (callback, delay) => { const id = ++serial; timers.set(id, { callback, delay }); return id; }, id => timers.delete(id));
    return create({ core, client, codec, vault, storage, locks,
      capture: () => copy(local),
      apply: next => { events.push(['apply']); if (applyFault?.(next)) throw new Error('injected projection failure'); local = copy(next); },
      account: () => activeAccount, credentials: () => copy(auth),
      readRemote: async (...args) => {
        requests.push({ method: 'GET', etag: args[1] || '' });
        if (readHook) return readHook(...args);
        return remote && copy(remote);
      },
      writeRemote: async (credentials, next, sha) => {
        requests.push({ method: 'PUT', sha, document: copy(next.document) });
        if (writeHook) return writeHook(next, sha);
        return commitRemote(next, sha);
      },
      readLegacy: async () => { events.push(['legacy']); return payload(); },
      notify: (message, persistent) => notices.push({ message, persistent }),
      randomId: () => `test-id-${String(++serial).padStart(6, '0')}`, now: () => tick,
    });
  }
  function commitRemote(next, sha) {
    if ((remote?.sha || '') !== sha) return { conflict: true };
    remote = { ...copy(next), sha: `sha-${++serial}`, etag: `etag-${serial}` };
    return { sha: remote.sha };
  }
  if (enrolled) {
    vaults.set(owner, { client: client.initialize(initial, 'pc'), sha: 'sha-1', etag: '', checkedAt: 0, retryAt: 0, failures: 0 });
    data.set(CONFIG, JSON.stringify({ enabled: true, account: owner, syncId: initial.syncId }));
    data.set(MIRROR, JSON.stringify({ account: owner, document: initial, map: codec.capture(local) }));
  }
  const controller = newController();
  function editStorage(key, value, { target = controller, success = true } = {}) {
    const journal = target.beforeWrite(key, value);
    if (success) local = codec.withStorageValue(local, key, value);
    target.afterWrite(journal, success);
    return journal;
  }
  const edit = (value, options) => editStorage('bigthumb', value, options);
  function remoteEdit(key, next, { deleted = false } = {}) {
    const seq = (remote.document.acks.phone || 0) + 1;
    remote.document = core.merge(remote.document, [{ device: 'phone', seq, id: `phone:${seq}`, key,
      baseRevision: remote.document.fields[key]?.revision ?? null, ...(deleted ? { deleted: true } : { value: next }) }]).document;
    remote.sha = `phone-sha-${++serial}`; remote.etag = `phone-etag-${serial}`;
  }
  async function fireTimer(delay) {
    // Advance only the explicit retry timer, not automatic/background sync timers.
    for (let turn = 0; turn < 100; turn++) {
      const entry = [...timers].find(([, timer]) => timer.delay === delay);
      if (entry) { timers.delete(entry[0]); entry[1].callback(); return; }
      await Promise.resolve();
    }
    assert.fail(`Expected controlled ${delay}ms timer was not scheduled`);
  }
  return { controller, newController, edit, editStorage, remoteEdit, commitRemote, storage, vault, data, events, notices, requests, timers,
    initial, fireTimer, wal: () => [...data.keys()].filter(key => key.startsWith(WAL)), state: () => copy(vaults.get(owner)),
    get local() { return copy(local); }, set local(next) { local = copy(next); },
    get remote() { return remote && copy(remote); }, set remote(next) { remote = next && copy(next); },
    set account(next) { activeAccount = next; }, set auth(next) { auth = next; },
    set now(next) { tick = next; }, set readHook(next) { readHook = next; }, set writeHook(next) { writeHook = next; },
    set storageFault(next) { storageFault = next; }, set vaultFault(next) { vaultFault = next; }, set applyFault(next) { applyFault = next; },
  };
}

const cases = [];
const test = (name, action) => cases.push({ name, action });

test('codec dependency contract exists and a write-ahead intent survives controller recreation', async () => {
  assert.equal(typeof codec.withStorageValue, 'function');
  assert.equal(typeof codec.validate, 'function');
  assert(codec.storageKeys.includes('bigthumb'));
  const h = fixture();
  const key = h.controller.beforeWrite('bigthumb', 'yes');
  assert(h.data.has(key)); assert.equal(h.local.components.reloaded.storage.bigthumb, 'no');
  assert.equal(h.requests.length, 0);
  // Crash between WAL and projection: the user's captured intent is still recoverable.
  h.controller.dispose();
  const resumed = h.newController();
  await resumed.run({ force: true });
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'yes');
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'yes');
  assert.equal(h.wal().length, 0); assert.equal((await resumed.status()).queued, 0);
  assert(h.events.findIndex(event => event[0] === 'commit') < h.events.findIndex(event => event[0] === 'remove' && event[1] === key));
});

test('failed local writes cancel intent; WAL storage failure blocks the original write', async () => {
  const h = fixture(); h.edit('yes', { success: false });
  assert.equal(h.wal().length, 0);
  h.storageFault = (kind, key) => kind === 'set' && key.startsWith(WAL);
  assert.throws(() => h.edit('yes'), /localStorage failure/);
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'no');
  assert.equal(h.requests.length, 0);
});

test('queue bounds reject before creating an undrainable WAL or oversized batch', () => {
  const h = fixture();
  for (let index = 0; index < 512; index++) h.data.set(`${WAL}capacity-${index}`, JSON.stringify({
    id: `capacity-${index}`, account: owner, writer: 'capacity-writer', sequence: index + 1, changes: [],
  }));
  assert.throws(() => h.edit('yes'), /queue|capacity|limit|full/i);
  assert.equal(h.wal().length, 512);
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'no');
  const large = fixture();
  const users = Array.from({ length: 513 }, (_, index) => `test_model_${index}`).join(',');
  assert.throws(() => large.controller.beforeWrite('ignoredusers', users), /queue|capacity|limit|large/i);
  assert.equal(large.wal().length, 0);
});

test('a full offline canonical batch drains while newer different-field WAL stays projected', async () => {
  const h = fixture();
  const users = Array.from({ length: 512 }, (_, index) => `test_model_${index}`).join(',');
  h.editStorage('ignoredusers', users);
  h.readHook = () => { throw new Error('injected offline'); };
  await assert.rejects(h.controller.run({ force: true }), /injected offline/);
  assert.equal(h.state().client.pending.length, 512); assert.equal(h.wal().length, 0);
  h.edit('yes'); h.readHook = null;
  const entered = deferred(), release = deferred();
  h.writeHook = async (next, sha) => { entered.resolve(); await release.promise; return h.commitRemote(next, sha); };
  const uploading = h.controller.run({ force: true }); await entered.promise;
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'yes', 'deferred local value must not be replaced by canonical projection');
  assert.equal(h.wal().length, 1, 'the full batch must not prematurely consume the newer intent');
  assert.equal((await h.controller.status()).queued, 513);
  release.resolve(); await uploading;
  assert.equal(h.remote.document.acks.pc, 512);
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'yes');
  assert.equal((await h.controller.status()).queued, 1);
  h.writeHook = null; await h.controller.run({ force: true });
  assert.equal(h.remote.document.acks.pc, 513);
  const values = core.values(h.remote.document);
  assert.equal(values['reloaded/bigthumb'], 'yes');
  assert.equal(Object.keys(values).filter(key => key.startsWith('ignored/')).length, 512);
  assert.equal((await h.controller.status()).queued, 0); assert.equal(h.wal().length, 0);
});

test('deferred same-field WAL keeps its causal predecessor when a full canonical batch drains', async () => {
  const h = fixture(); h.edit('yes');
  const users = Array.from({ length: 511 }, (_, index) => `test_model_${index}`).join(',');
  h.editStorage('ignoredusers', users);
  h.readHook = () => { throw new Error('injected offline'); };
  await assert.rejects(h.controller.run({ force: true }), /injected offline/);
  assert.equal(h.state().client.pending.length, 512);
  h.edit('newer'); h.readHook = null;
  await h.controller.run({ force: true });
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'newer');
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'yes');
  await h.controller.run({ force: true });
  assert.deepEqual(h.remote.document.conflicts, {}, 'a sequential edit on this device is not a concurrent conflict');
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'newer');
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'newer');
  assert.equal((await h.controller.status()).queued, 0);
});

test('canonical transaction failure retains WAL and prevents network work', async () => {
  const h = fixture(); h.edit('yes');
  h.vaultFault = () => true;
  await assert.rejects(h.controller.run({ force: true }), /canonical commit failure/);
  assert.equal(h.wal().length, 1); assert.equal(h.state().client.pending.length, 0);
  assert.equal(h.requests.length, 0);
  h.vaultFault = null; await h.controller.run({ force: true });
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'yes');
});

test('replay after canonical commit but failed WAL removal does not duplicate the operation', async () => {
  const h = fixture(); h.edit('yes');
  h.storageFault = (kind, key) => kind === 'remove' && key.startsWith(WAL);
  await assert.rejects(h.controller.run({ force: true }), /localStorage failure/);
  assert.equal(h.state().client.pending.length, 1); assert.equal(h.wal().length, 1);
  h.storageFault = null; await h.newController().run({ force: true });
  assert.equal(h.remote.document.acks.pc, 1); assert.equal(h.wal().length, 0);
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 1);
});

test('a local edit during upload remains queued and follows the acknowledged predecessor', async () => {
  const h = fixture(), entered = deferred(), release = deferred(); h.edit('yes');
  h.writeHook = async (next, sha) => { entered.resolve(); await release.promise; return h.commitRemote(next, sha); };
  const pending = h.controller.run({ force: true }); await entered.promise;
  h.edit('newer'); release.resolve(); await pending;
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'yes');
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'newer');
  assert.equal((await h.controller.status()).queued, 1);
  h.writeHook = null; await h.controller.run({ force: true });
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'newer');
  assert.deepEqual(h.remote.document.conflicts, {}); assert.equal((await h.controller.status()).queued, 0);
});

test('wall-clock rollback cannot reverse sequential local edits or create a false conflict', async () => {
  const h = fixture(); h.edit('yes'); h.now = 99999; h.edit('newer');
  await h.controller.run({ force: true });
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'newer');
  assert.deepEqual(h.remote.document.conflicts, {});
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'newer');
});

test('observed edits across tabs retain their causal order independently of random writer IDs', async () => {
  const h = fixture(), otherTab = h.newController();
  // The later-created writer saves first. Lexical writer sorting reverses these edits
  // and can silently restore "yes" because the newer "no" equals the confirmed base.
  h.edit('yes', { target: otherTab });
  h.edit('no');
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'no');
  assert.equal(h.wal().length, 2);
  await h.controller.run({ force: true });
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'no');
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'no');
  assert.deepEqual(h.remote.document.conflicts, {});
  assert.equal((await h.controller.status()).queued, 0);
});

test('409 recomputes from fresh cloud contents and preserves unrelated remote changes', async () => {
  const h = fixture(); h.edit('yes'); let first = true;
  h.writeHook = (next, sha) => {
    if (first) { first = false; h.remoteEdit('multicam/notifyOnline', false); return { conflict: true }; }
    return h.commitRemote(next, sha);
  };
  const pending = h.controller.run({ force: true });
  await h.fireTimer(1000); await pending;
  const puts = h.requests.filter(request => request.method === 'PUT');
  assert.equal(puts.length, 2); assert.notEqual(puts[0].sha, puts[1].sha);
  assert.equal(puts[0].document.acks.pc, puts[1].document.acks.pc);
  assert.equal(core.values(h.remote.document)['multicam/notifyOnline'], false);
  assert.equal(core.values(h.remote.document)['reloaded/bigthumb'], 'yes');
});

test('same-field concurrent values remain in a visible persistent conflict', async () => {
  const h = fixture(); h.edit('yes'); h.remoteEdit('reloaded/bigthumb', 'phone');
  await h.controller.run({ force: true });
  const conflicts = Object.values((await h.controller.status()).conflicts);
  assert.equal(conflicts.length, 1); assert.equal(conflicts[0].incoming.value, 'yes');
  assert.equal(conflicts[0].current.value, 'phone');
  assert(h.notices.some(notice => notice.persistent && /Both versions are kept/.test(notice.message)));
});

test('a concurrent deleted group preserves the incoming membership as a structural conflict', async () => {
  const h = fixture();
  h.remoteEdit('group/custom', { id: 'custom', name: 'Synthetic custom group', order: 5, system: false });
  await h.controller.run({ force: true });
  const multicam = h.local.components.multicamPro;
  multicam.rooms[0].groups.push('custom'); multicam.rooms[0].groupOrder.custom = 0;
  h.editStorage('ryujo_multicam_v8', JSON.stringify(multicam));
  h.remoteEdit('group/custom', undefined, { deleted: true });
  await h.controller.run({ force: true });
  const values = core.values(h.remote.document);
  assert.equal(Object.hasOwn(values, 'group/custom'), false);
  assert.deepEqual(values['room/test_model'].groups, ['all']);
  assert.deepEqual(h.local.components.multicamPro.rooms[0].groups, ['all']);
  const conflicts = Object.values((await h.controller.status()).conflicts);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].key, 'room/test_model');
  assert.equal(conflicts[0].reason, 'structural-conflict');
  assert.deepEqual(conflicts[0].incoming.value.groups, ['all', 'custom']);
  assert(h.notices.some(notice => notice.persistent && /Both versions are kept/.test(notice.message)));
});

test('a structural conflict for an absent new room can explicitly resolve to keep deletion', async () => {
  const h = fixture();
  h.remoteEdit('group/custom', { id: 'custom', name: 'Synthetic custom group', order: 5, system: false });
  await h.controller.run({ force: true });
  const multicam = h.local.components.multicamPro;
  multicam.rooms.push({ id: 'new_model', addedAt: 2, groups: ['custom'], groupOrder: { custom: 0 }, order: 1, notes: 'retained in conflict' });
  h.editStorage('ryujo_multicam_v8', JSON.stringify(multicam));
  h.remoteEdit('group/custom', undefined, { deleted: true });
  await h.controller.run({ force: true });
  const status = await h.controller.status();
  assert.equal(Object.hasOwn(status.document.fields, 'room/new_model'), false);
  const conflict = Object.values(status.conflicts).find(entry => entry.key === 'room/new_model');
  assert(conflict); assert.equal(conflict.reason, 'structural-conflict');
  h.controller.resolveConflict(conflict.key, status.document.fields[conflict.key]?.revision ?? null, [conflict.id], { deleted: true });
  await h.controller.run({ force: true });
  assert.deepEqual(h.remote.document.conflicts, {});
  assert.equal(h.remote.document.fields['room/new_model'].deleted, true);
  assert.equal(h.local.components.multicamPro.rooms.some(entry => entry.id === 'new_model'), false);
  assert.equal((await h.controller.status()).queued, 0);
});

test('uncertain successful PUT is recognized by acknowledgement without a second PUT', async () => {
  const h = fixture(); h.edit('yes');
  h.writeHook = (next, sha) => { h.commitRemote(next, sha); throw new Error('connection lost after commit'); };
  await assert.rejects(h.controller.run({ force: true }), /connection lost/);
  assert(h.state().client.flight); assert.equal((await h.controller.status()).queued, 1);
  h.writeHook = null; await h.newController().run({ force: true });
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 1);
  assert.equal(h.remote.document.acks.pc, 1); assert.equal((await h.controller.status()).queued, 0);
});

test('pause/account mismatch block sync and changed paused settings cannot silently resume', async () => {
  const h = fixture(); h.edit('yes'); h.account = 'another-test-account';
  await assert.rejects(h.controller.run({ force: true }), /account used during setup/);
  assert.equal(h.requests.length, 0); assert.equal(h.wal().length, 1);
  h.account = owner; h.controller.pause();
  assert.equal(await h.controller.run({ force: true }), false);
  h.local = codec.withStorageValue(h.local, 'bigthumb', 'changed-while-paused');
  await assert.rejects(h.controller.resume(), /Review .*before resuming/);
  assert.equal(h.controller.enabled(), false); assert.equal(h.wal().length, 1);
});

test('paused edits require explicit current review, preserve a backup, and reject a stale review', async () => {
  const h = fixture(); h.controller.pause();
  h.local = codec.withStorageValue(h.local, 'bigthumb', null);
  let firstReview;
  await assert.rejects(h.controller.resume(), error => {
    assert.match(error.message, /1 local change.*1 deletion/);
    firstReview = error.reviewedMap; return true;
  });
  assert.equal(h.controller.enabled(), false); assert.equal(h.wal().length, 0);
  const changed = h.local; changed.components.mobileCleanView.settings.hidePromos = false; h.local = changed;
  let currentReview;
  await assert.rejects(h.controller.resume({ reviewedMap: firstReview }), error => {
    assert.match(error.message, /2 local change.*1 deletion/);
    currentReview = error.reviewedMap; return true;
  });
  assert.equal(h.controller.enabled(), false); assert.equal(h.wal().length, 0);
  const beforeResume = h.local;
  await h.controller.resume({ reviewedMap: currentReview });
  assert.equal(h.controller.enabled(), true); assert.equal(h.wal().length, 1);
  const backup = JSON.parse(h.data.get('ziggy_suite_sync_v2_enrollment_backup_resume'));
  assert.equal(backup.account, owner); assert.deepEqual(backup.payload, beforeResume);
  await h.controller.run({ force: true });
  assert.equal(h.remote.document.fields['reloaded/bigthumb'].deleted, true);
  assert.equal(core.values(h.remote.document)['mobile/hidePromos'], false);
  assert.deepEqual(h.remote.document.conflicts, {}); assert.equal((await h.controller.status()).queued, 0);
});

test('untracked shared edits and deletions pause projection without replacing either copy', async () => {
  for (const next of ['older-tab-edit', null]) {
    const h = fixture();
    h.local = codec.withStorageValue(h.local, 'bigthumb', next);
    h.remoteEdit('multicam/notifyOnline', false);
    const localBefore = h.local, remoteBefore = h.remote, canonicalBefore = h.state();
    await assert.rejects(h.controller.run({ force: true }), /untracked local settings changes/);
    assert.deepEqual(h.local, localBefore, 'unobserved browser data must remain available for recovery');
    assert.deepEqual(h.remote, remoteBefore, 'cloud data must not be rewritten');
    assert.deepEqual(h.state(), canonicalBefore);
    assert.equal(h.events.filter(event => event[0] === 'apply').length, 0);
    assert.equal(h.requests.length, 0);
  }
});

test('no-op and runtime-only writes do not require a hydrated account, but shared edits do', () => {
  const h = fixture(); h.account = '';
  h.data.set('bigthumb', 'no');
  assert.equal(h.controller.beforeWrite('bigthumb', 'no'), null, 'identical persisted bytes are a no-op');
  h.data.delete('bigthumb');
  assert.equal(h.controller.beforeWrite('bigthumb', 'no'), null, 'identical captured value is also a no-op');
  const mobile = { ...h.local.components.mobileCleanView.settings, side: 'right' };
  assert.equal(h.controller.beforeWrite('cb_desktop_mobile_comfort_v1', JSON.stringify(mobile)), null);
  const multicam = h.local.components.multicamPro;
  multicam.rooms[0].status = 'online'; multicam.settings.searchQuery = 'local-only-query';
  assert.equal(h.controller.beforeWrite('ryujo_multicam_v8', JSON.stringify(multicam)), null);
  assert.throws(() => h.controller.beforeWrite('bigthumb', 'yes'), /account used during setup/);
  assert.equal(h.wal().length, 0); assert.equal(h.requests.length, 0);
});

test('account switches across async boundaries stop projection, cloud writes, and enrollment', async () => {
  const h = fixture(); h.edit('yes');
  h.readHook = () => { const remote = h.remote; h.account = 'another-test-account'; return remote; };
  await assert.rejects(h.controller.run({ force: true }), /account used during setup/);
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 0);
  assert.equal(h.state().client.pending.length, 1);
  const projecting = fixture();
  const pending = projecting.controller.run({ force: true });
  projecting.account = 'another-test-account';
  await assert.rejects(pending, /account/i);
  assert.equal(projecting.events.filter(event => event[0] === 'apply').length, 0, 'account must be rechecked after asynchronous vault reads');
  const enrolling = fixture({ enrolled: false });
  const preview = await enrolling.controller.enrollmentPreview();
  enrolling.readHook = () => { const remote = enrolling.remote; enrolling.account = 'another-test-account'; return remote; };
  await assert.rejects(enrolling.controller.enroll(preview), /account/i);
  assert.equal(enrolling.events.filter(event => event[0] === 'apply').length, 0, 'setup must not project the previous account after asynchronous read');
  assert.equal(enrolling.controller.enabled(), false);
});

test('missing cloud or rollback cannot overwrite local settings or reinitialize the file', async () => {
  const h = fixture(); h.edit('yes'); h.remote = null;
  await assert.rejects(h.controller.run({ force: true }), /missing/);
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 0);
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'yes');
  h.remote = { account: owner, document: h.initial, sha: 'sha-1' };
  await h.controller.run({ force: true });
  const confirmed = h.state().client.confirmed;
  h.remote = { account: owner, document: h.initial, sha: 'rolled-back' };
  await assert.rejects(h.controller.run({ force: true }), /backwards|rolled back/);
  assert.deepEqual(h.state().client.confirmed, confirmed);
});

test('projection failure retains canonical intent and blocks pre-projection network work', async () => {
  const h = fixture(); h.edit('yes'); h.applyFault = () => true;
  await assert.rejects(h.controller.run({ force: true }), /projection failure/);
  assert.equal(h.state().client.pending.length, 1); assert.equal(h.requests.length, 0);
  h.applyFault = null; await h.newController().run({ force: true });
  assert.equal(h.local.components.reloaded.storage.bigthumb, 'yes');
  assert.equal(h.local.components.multicamPro.settings.searchQuery, 'tab-only');
  assert.equal(h.local.components.mobileCleanView.settings.side, 'left');
});

test('projection failure after accepted upload recovers without replaying the cloud operation', async () => {
  const h = fixture(); h.edit('yes'); let projections = 0;
  h.applyFault = () => ++projections === 2;
  await assert.rejects(h.controller.run({ force: true }), /projection failure/);
  assert.equal(h.state().client.confirmed.acks.pc, 1);
  h.applyFault = null; await h.controller.run({ force: true });
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 1);
  assert.equal(JSON.parse(h.data.get(MIRROR)).document.acks.pc, 1);
});

test('two controllers share one network worker and idle checks are throttled', async () => {
  const h = fixture(), entered = deferred(), release = deferred(); h.edit('yes');
  h.readHook = async () => { entered.resolve(); await release.promise; return h.remote; };
  const first = h.controller.run({ force: true }); await entered.promise;
  const sibling = h.newController();
  assert.equal(await sibling.run({ force: true }), false);
  assert.equal(h.requests.length, 1);
  release.resolve(); await first; h.readHook = null;
  const count = h.requests.length;
  assert.equal(await sibling.run(), false); assert.equal(h.requests.length, count);
});

test('enrollment preserves legacy rooms absent from a new device instead of inferring deletion', async () => {
  const h = fixture({ enrolled: false }); h.remote = null;
  const empty = h.local; empty.components.multicamPro.rooms = []; h.local = empty;
  const preview = await h.controller.enrollmentPreview();
  await h.controller.enroll(preview); await h.controller.run({ force: true });
  assert(core.values(h.remote.document)['room/test_model']);
  assert.equal(h.local.components.multicamPro.rooms[0].id, 'test_model');
  assert(h.data.has('ziggy_suite_sync_v2_enrollment_backup'));
  assert(h.events.some(event => event[0] === 'legacy'));
});

test('cloud change between enrollment preview and confirmation leaves browser unenrolled', async () => {
  const h = fixture({ enrolled: false });
  const preview = await h.controller.enrollmentPreview();
  h.remoteEdit('multicam/notifyOnline', false);
  await assert.rejects(h.controller.enroll(preview), /changed during setup/);
  assert.equal(h.controller.enabled(), false); assert.equal(await h.vault.read(owner), null);
  assert.equal(h.requests.filter(request => request.method === 'PUT').length, 0);
});

test('enrollment config failures cannot orphan a vault and pending enrollment resumes from its backup', async () => {
  const beforeVault = fixture({ enrolled: false });
  const firstPreview = await beforeVault.controller.enrollmentPreview();
  beforeVault.storageFault = (kind, key) => kind === 'set' && key === CONFIG;
  await assert.rejects(beforeVault.controller.enroll(firstPreview), /localStorage failure/);
  assert.equal(await beforeVault.vault.read(owner), null, 'the recovery marker must precede canonical enrollment');
  assert.equal(beforeVault.controller.enabled(), false);
  beforeVault.storageFault = null;
  await beforeVault.controller.enroll(firstPreview);
  assert.equal(beforeVault.controller.enabled(), true, 'failure before vault creation remains retryable');

  const afterVault = fixture({ enrolled: false });
  afterVault.local = codec.withStorageValue(afterVault.local, 'bigthumb', 'local-setup-choice');
  const secondPreview = await afterVault.controller.enrollmentPreview(), localBefore = afterVault.local;
  let writes = 0;
  afterVault.storageFault = (kind, key) => kind === 'set' && key === CONFIG && ++writes === 2;
  await assert.rejects(afterVault.controller.enroll(secondPreview), /localStorage failure/);
  assert.equal(afterVault.controller.enabled(), false);
  assert.equal(JSON.parse(afterVault.data.get(CONFIG)).enrolling, true);
  assert(await afterVault.vault.read(owner));
  assert.deepEqual(afterVault.local, localBefore);
  assert.equal(afterVault.data.has(MIRROR), false, 'no projection has occurred before activation');
  assert.equal(afterVault.requests.filter(request => request.method === 'PUT').length, 0);

  afterVault.storageFault = null; afterVault.controller.dispose();
  const resumed = afterVault.newController();
  afterVault.local = codec.withStorageValue(afterVault.local, 'bigthumb', 'changed-after-failed-setup');
  await assert.rejects(resumed.resume(), /Review .*before resuming/);
  assert.equal(resumed.enabled(), false);
  afterVault.local = localBefore;
  await resumed.resume(); await resumed.run({ force: true });
  assert.equal(resumed.enabled(), true);
  assert.equal(JSON.parse(afterVault.data.get(CONFIG)).enrolling, false);
  const conflicts = Object.values((await resumed.status()).conflicts);
  assert.equal(conflicts.length, 1, 'resumed enrollment preserves both differing shared values');
  assert.equal(conflicts[0].incoming.value, 'local-setup-choice');
  assert.equal(conflicts[0].current.value, 'no');
});

let failures = 0;
for (const { name, action } of cases) {
  try { await action(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack}`); }
}
console.log(`Settings sync controller: ${cases.length - failures}/${cases.length} passed (controlled I/O, not live browser/device acceptance).`);
process.exitCode = failures ? 1 : 0;
