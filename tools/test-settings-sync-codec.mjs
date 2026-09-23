import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/settings-sync-codec.js', import.meta.url), 'utf8');
const codec = new Function(`${source}\nreturn createSettingsSyncCodec();`)();
const clone = (value) => structuredClone(value);
const chatKey = 'reloadedGlobalChatSettingsV1';
const groups = [
  { id: 'library', name: '__library__', order: 0, system: true },
  { id: 'all', name: '__all__', order: 1, system: true },
  { id: 'online-favorites', name: '__online_favorites__', order: 2, system: true },
  { id: 'online', name: '__online__', order: 3, system: true },
  { id: 'fav', name: '__fav__', order: 4, system: true },
  { id: 'custom', name: 'Custom group', order: 5, system: false },
];
function room(id = 'model_one', order = 0) {
  return { id, addedAt: 1700000000000 + order, groups: ['all', 'custom'], group: 'all', groupOrder: { all: order, custom: order }, order, notes: 'private note', muted: false, lastStatus: 'online', lastSeenOnline: 1711111111111, privateLabel: 'Private', errorMsg: 'old transient error', cardSizeByGroup: { all: { cols: 3, rows: 4 } } };
}
function payload() {
  return {
    format: 'chaturbate-suite-settings-v4', scriptVersion: '16.6.22', exportedAt: '2026-09-23T12:00:00.000Z',
    components: {
      multicamPro: {
        version: '16.6.22', importMode: 'replace-library', rooms: [room()], groups: clone(groups),
        settings: {
          favoriteFirst: true, notifyFavoritesOnly: true, notifyOnline: true,
          pollMs: { offline: 60000, private: 30000, error: 10000, online: 120000 }, maxStreamHeight: 1080,
          startupGroup: 'last', startOnOnlineFavorites: false, startupView: 'last',
          shortcuts: { focusAdd: '/', refreshAll: 'r', gridView: 'g', pureMode: '' }, videoFit: 'contain', freeZoom: true,
          volume: 0.3, layoutSize: 4, phoneLayoutSize: 2, activeGroup: 'custom', searchQuery: 'local search',
          filter: { onlyOnline: true }, sortBy: 'name', pageIndex: 3, splitViewActive: true,
          splitRoomIds: ['model_one', 'model_two'], videoTransforms: { model_one: { zoom: 2, panX: 20, panY: 0 } },
        },
      },
      reloaded: {
        version: '1.8.0', themeName: 'dark',
        storage: {
          animationoff: 'foo', bigthumb: 'foo', hidemt: 'foo', newtabon: 'foo', pclean: 'foo', refreshoff: 'foo', smallsnap: 'foo', zoomoff: 'foo',
          ignoredusers: ' MODEL_TWO ,@model_three,model_two',
          [chatKey]: JSON.stringify({ version: 1, c1: 0, c2: 1, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c7a: 100, c8: 0, c10: 1, language: 'de' }),
          defaultVideoWidth: '{"videoWidth":893}', isTheaterMode: '{"isTheaterMode":true}',
          videoControls: '{"volume":60,"isMuted":false}', recautosave: 'foo', recvp9: 'foo', hpfltopen: '{"value":true}',
        },
      },
      mobileCleanView: {
        version: '2.2.0', settings: { enabled: true, hidePromos: true, compactBrowse: false, autoHideSeconds: 5, portraitColumns: 3, landscapeColumns: 5, side: 'left', portraitFullscreenMode: 'fill', landscapeFullscreenMode: 'fit' },
      },
    },
  };
}
let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`ok ${passed} - ${name}`); }

check('capture emits approved fields only and splits chat and ignored members', () => {
  const data = payload();
  const before = clone(data);
  const map = codec.capture(data);
  assert.deepEqual(Object.keys(map['room/model_one']).sort(), ['id', 'addedAt', 'groups', 'groupOrder', 'order', 'notes'].sort());
  assert.deepEqual(Object.keys(map).filter((key) => key.startsWith('multicam/')).map((key) => key.slice(9)).sort(), [...codec.sharedKeys.multicam].sort());
  assert.equal(map['ignored/model_two'], true);
  assert.equal(map['ignored/model_three'], true);
  assert.equal(Object.keys(map).filter((key) => key.startsWith('ignored/')).length, 2);
  assert.equal(map['chat/language'], 'de');
  assert.equal(map['chat/c2'], 1);
  assert.equal(map['multicam/shortcuts'].pureMode, '');
  for (const key of ['themeName', 'videoControls', 'defaultVideoWidth', 'isTheaterMode', 'hpfltopen', 'recautosave', 'recvp9']) assert.equal(map[`reloaded/${key}`], undefined);
  assert.deepEqual(data, before);
});

check('capture/apply round-trip is detached and preserves all device-local state', () => {
  const data = payload();
  const map = codec.capture(data);
  const applied = codec.apply(data, map);
  assert.deepEqual(codec.capture(applied), map);
  assert.deepEqual(applied.components.multicamPro.settings, data.components.multicamPro.settings);
  assert.deepEqual(applied.components.multicamPro.rooms, data.components.multicamPro.rooms);
  assert.deepEqual(applied.components.mobileCleanView.settings, data.components.mobileCleanView.settings);
  assert.equal(applied.components.reloaded.themeName, 'dark');
  assert.equal(applied.components.reloaded.storage.videoControls, data.components.reloaded.storage.videoControls);
  applied.components.multicamPro.rooms[0].groups.push('fav');
  map['room/model_one'].notes = 'changed map';
  assert.equal(data.components.multicamPro.rooms[0].notes, 'private note');
  assert.deepEqual(data.components.multicamPro.rooms[0].groups, ['all', 'custom']);
});

check('apply changes shared preferences while retaining local current settings', () => {
  const data = payload();
  const remote = payload();
  remote.components.multicamPro.settings.favoriteFirst = false;
  remote.components.multicamPro.settings.volume = 1;
  remote.components.multicamPro.settings.layoutSize = 9;
  remote.components.mobileCleanView.settings.enabled = false;
  remote.components.mobileCleanView.settings.side = 'right';
  remote.components.reloaded.themeName = 'light';
  remote.components.reloaded.storage.videoControls = '{"volume":100,"isMuted":true}';
  const applied = codec.apply(data, codec.capture(remote));
  assert.equal(applied.components.multicamPro.settings.favoriteFirst, false);
  assert.equal(applied.components.multicamPro.settings.volume, 0.3);
  assert.equal(applied.components.multicamPro.settings.layoutSize, 4);
  assert.equal(applied.components.mobileCleanView.settings.enabled, false);
  assert.equal(applied.components.mobileCleanView.settings.side, 'left');
  assert.equal(applied.components.reloaded.themeName, 'dark');
  assert.equal(applied.components.reloaded.storage.videoControls, data.components.reloaded.storage.videoControls);
});

check('room deletion is authoritative and new rooms get local safe runtime defaults', () => {
  const data = payload();
  const map = codec.capture(data);
  delete map['room/model_one'];
  map['room/model_two'] = { ...clone(codec.capture(data)['room/model_one']), id: 'model_two' };
  const applied = codec.apply(data, map);
  assert.deepEqual(applied.components.multicamPro.rooms.map((entry) => entry.id), ['model_two']);
  assert.equal(applied.components.multicamPro.rooms[0].muted, true);
  assert.equal(applied.components.multicamPro.rooms[0].lastStatus, 'unknown');
  assert.equal(applied.components.multicamPro.rooms[0].lastSeenOnline, 0);
  assert.equal(applied.components.multicamPro.rooms[0].cardSizeByGroup, undefined);
});

check('group deletion neither creates nor removes rooms and builtin groups remain fixed', () => {
  const data = payload();
  const map = codec.capture(data);
  for (const key of Object.keys(map).filter((key) => key.startsWith('group/'))) delete map[key];
  const applied = codec.apply(data, map);
  assert.deepEqual(applied.components.multicamPro.groups, groups.slice(0, 5));
  assert.equal(applied.components.multicamPro.rooms.length, 1);
  // Projection never silently strips references. The structural gate rejects
  // this candidate before the root's canonical-state sanitizer can discard them.
  assert.deepEqual(applied.components.multicamPro.rooms[0].groups, ['all', 'custom']);
  assert.throws(() => codec.validateReferences(map), /orphan group reference/);
  const poisoned = codec.capture(data);
  poisoned['group/all'].name = 'Changed builtin';
  assert.throws(() => codec.apply(data, poisoned), /invariant/);
});

check('deleted ignored members and Reloaded flags do not reappear from current state', () => {
  const data = payload();
  const map = codec.capture(data);
  delete map['ignored/model_two'];
  delete map['reloaded/animationoff'];
  const applied = codec.apply(data, map);
  assert.equal(applied.components.reloaded.storage.ignoredusers, 'model_three');
  assert.equal(applied.components.reloaded.storage.animationoff, undefined);
  assert.equal(applied.components.reloaded.storage.bigthumb, 'foo');
});

check('unknown, unsafe and noncanonical map keys reject before application', () => {
  const data = payload();
  const before = clone(data);
  for (const key of ['unknown/key', 'multicam/volume', 'mobile/portraitColumns', 'reloaded/videoControls', 'reloaded/recautosave', 'chat/c9', 'ignored/MODEL_TWO', 'ignored/%6Dodel_two', 'room/%ZZ', 'room/model_one/extra', 'room/__proto__']) {
    assert.throws(() => codec.apply(data, { ...codec.capture(data), [key]: true }), /Invalid shared settings/);
  }
  assert.throws(() => codec.apply(data, JSON.parse('{"__proto__":{"polluted":true}}')), /unsafe property/);
  assert.equal({}.polluted, undefined);
  assert.deepEqual(data, before);
});

check('v4 components and compatible component versions are mandatory', () => {
  for (const mutate of [
    (data) => { data.format = 'chaturbate-suite-settings-v3'; },
    (data) => { delete data.components.reloaded; },
    (data) => { data.components.mobileCleanView.version = '3.0.0'; },
    (data) => { data.components.multicamPro.version = '17.0.0'; },
    (data) => { data.components.reloaded.version = 'unknown'; },
    (data) => { data.components.multicamPro.rooms = {}; },
  ]) {
    const data = payload(); mutate(data);
    assert.throws(() => codec.capture(data), /Invalid shared settings/);
  }
});

check('malformed cloud fields reject instead of coercing or truncating', () => {
  const data = payload();
  for (const [key, value] of [
    ['multicam/notifyOnline', 'true'], ['multicam/maxStreamHeight', 999], ['multicam/startupView', 'focus'],
    ['multicam/pollMs', { offline: 1, private: 2, error: 3, online: 4 }], ['multicam/shortcuts', { refreshAll: 'r' }],
    ['mobile/autoHideSeconds', 31], ['mobile/enabled', 1], ['chat/c7a', 1001], ['chat/c1', true], ['chat/language', 'not-a-language'],
    ['ignored/model_two', false], ['reloaded/bigthumb', 1], ['reloaded/bigthumb', 'x'.repeat(129)],
  ]) assert.throws(() => codec.apply(data, { ...codec.capture(data), [key]: value }), /Invalid shared settings/);
  for (const mutate of [
    (entry) => { entry.notes = 'x'.repeat(65537); },
    (entry) => { entry.order = -1; },
    (entry) => { entry.addedAt = NaN; },
    (entry) => { entry.groups.push('library'); },
    (entry) => { entry.groupOrder.extra = 1; },
    (entry) => { entry.muted = true; },
  ]) {
    const map = codec.capture(data); mutate(map['room/model_one']);
    assert.throws(() => codec.apply(data, map), /Invalid shared settings/);
  }
});

check('chat and ignored-user capture validates local import data too', () => {
  for (const raw of ['bad JSON', '{}', '{"version":2}', JSON.stringify({ version: 1, c1: 0, extra: true })]) {
    const data = payload(); data.components.reloaded.storage[chatKey] = raw;
    assert.throws(() => codec.capture(data), /chat/);
  }
  for (const raw of ['bad name', '__proto__', 'constructor', '1234', 'https://invalid.example/']) {
    const data = payload(); data.components.reloaded.storage.ignoredusers = raw;
    assert.throws(() => codec.capture(data), /Invalid shared settings/);
  }
});

check('record counts, cycles, accessors and duplicate identities are rejected', () => {
  const duplicate = payload(); duplicate.components.multicamPro.rooms.push(room());
  assert.throws(() => codec.capture(duplicate), /duplicate/);
  const tooMany = payload(); tooMany.components.multicamPro.rooms = Array.from({ length: 1201 }, (_, index) => room(`model_${index}`, index));
  assert.throws(() => codec.capture(tooMany), /multicam schema/);
  const customOnly = Object.fromEntries(Array.from({ length: 76 }, (_, index) => [`group/custom_${index}`, { id: `custom_${index}`, name: 'custom', order: 5 + index, system: false }]));
  assert.throws(() => codec.validate(customOnly), /record count/);
  const nullNote = payload(); nullNote.components.multicamPro.rooms[0].notes = null;
  assert.throws(() => codec.capture(nullNote), /room field/);
  const cyclic = payload(); cyclic.extra = cyclic;
  assert.throws(() => codec.capture(cyclic), /acyclic/);
  const accessor = payload(); Object.defineProperty(accessor, 'value', { enumerable: true, get() { throw new Error('must not execute'); } });
  assert.throws(() => codec.capture(accessor), /unsafe property/);
});

check('rebase keeps incoming shared changes when draft has only local UI or runtime changes', () => {
  const base = payload();
  const draft = clone(base);
  draft.components.multicamPro.settings.layoutSize = 9;
  draft.components.multicamPro.settings.activeGroup = 'fav';
  draft.components.multicamPro.rooms[0].lastStatus = 'offline';
  const incoming = clone(base);
  incoming.components.multicamPro.settings.favoriteFirst = false;
  incoming.components.multicamPro.rooms[0].notes = 'new remote note';
  incoming.components.multicamPro.rooms.push(room('model_two', 1));
  const rebased = codec.rebase(base, draft, incoming);
  assert.equal(rebased.components.multicamPro.settings.favoriteFirst, false);
  assert.equal(rebased.components.multicamPro.settings.layoutSize, 9);
  assert.equal(rebased.components.multicamPro.settings.activeGroup, 'fav');
  assert.equal(rebased.components.multicamPro.rooms[0].lastStatus, 'offline');
  assert.equal(rebased.components.multicamPro.rooms[0].notes, 'new remote note');
  assert.equal(rebased.components.multicamPro.rooms.length, 2);
});

check('rebase overlays only real draft edits and deletions onto incoming shared state', () => {
  const base = payload();
  const draft = clone(base);
  draft.components.multicamPro.settings.notifyOnline = false;
  draft.components.multicamPro.rooms = [];
  draft.components.reloaded.storage.ignoredusers = 'model_three';
  const incoming = clone(base);
  incoming.components.multicamPro.settings.favoriteFirst = false;
  incoming.components.multicamPro.rooms.push(room('model_two', 1));
  incoming.components.reloaded.storage.ignoredusers += ',model_four';
  const before = clone([base, draft, incoming]);
  const rebased = codec.rebase(base, draft, incoming);
  assert.equal(rebased.components.multicamPro.settings.notifyOnline, false);
  assert.equal(rebased.components.multicamPro.settings.favoriteFirst, false);
  assert.deepEqual(rebased.components.multicamPro.rooms.map((entry) => entry.id), ['model_two']);
  assert.equal(rebased.components.reloaded.storage.ignoredusers, 'model_four,model_three');
  assert.deepEqual([base, draft, incoming], before);
});

check('rebase treats an edited room as one conservative conflict unit but ignores key order', () => {
  const base = payload();
  const draft = clone(base);
  draft.components.multicamPro.rooms[0].notes = 'draft note';
  const incoming = clone(base);
  incoming.components.multicamPro.rooms[0].notes = 'incoming note';
  incoming.components.multicamPro.rooms[0].order = 5;
  assert.equal(codec.rebase(base, draft, incoming).components.multicamPro.rooms[0].notes, 'draft note');
  assert.equal(codec.rebase(base, draft, incoming).components.multicamPro.rooms[0].order, 0);
  const reordered = clone(base);
  reordered.components.multicamPro.rooms[0].groupOrder = { custom: 0, all: 0 };
  assert.equal(codec.rebase(base, reordered, incoming).components.multicamPro.rooms[0].order, 5);
});

check('storage-key routing excludes device and retired preferences', () => {
  for (const key of [...codec.sharedKeys.reloaded, chatKey, 'ignoredusers', 'ryujo_multicam_v8', 'cb_desktop_mobile_comfort_v1']) assert.equal(codec.isStorageKey(key), true);
  for (const key of ['videoControls', 'defaultVideoWidth', 'isTheaterMode', 'themeName', 'hpfltopen', 'recautosave', 'recvp9', 'unknown']) assert.equal(codec.isStorageKey(key), false);
  assert.ok(Object.isFrozen(codec.sharedKeys));
  assert.ok(Object.isFrozen(codec.sharedKeys.multicam));
  assert.ok(Object.isFrozen(codec.storageKeys));
  assert.equal(codec.storageKeys.length, 12);
});

check('withStorageValue replaces only the addressed source and represents deletion explicitly', () => {
  const data = payload();
  const before = clone(data);
  const nextState = { v: 8, rooms: [room('model_four', 4)], groups: clone(groups), settings: { ...data.components.multicamPro.settings, favoriteFirst: false } };
  const replaced = codec.withStorageValue(data, 'ryujo_multicam_v8', JSON.stringify(nextState));
  assert.deepEqual(replaced.components.multicamPro.rooms, nextState.rooms);
  assert.equal(replaced.components.multicamPro.settings.favoriteFirst, false);
  assert.deepEqual(replaced.components.reloaded, data.components.reloaded);
  const removed = codec.withStorageValue(data, 'ryujo_multicam_v8', null);
  assert.deepEqual(removed.components.multicamPro.rooms, []);
  assert.deepEqual(removed.components.multicamPro.groups, []);
  assert.deepEqual(removed.components.multicamPro.settings, data.components.multicamPro.settings);
  assert.deepEqual(codec.withStorageValue(data, 'cb_desktop_mobile_comfort_v1', null).components.mobileCleanView.settings, {});
  assert.equal(codec.withStorageValue(data, 'bigthumb', null).components.reloaded.storage.bigthumb, undefined);
  assert.equal(codec.withStorageValue(data, 'bigthumb', 'yes').components.reloaded.storage.bigthumb, 'yes');
  assert.deepEqual(data, before);
  for (const [key, raw] of [['videoControls', '{}'], ['bigthumb', undefined], ['ryujo_multicam_v8', '{}'], ['ryujo_multicam_v8', '{'], ['cb_desktop_mobile_comfort_v1', 'null']]) {
    assert.throws(() => codec.withStorageValue(data, key, raw), /Invalid shared settings/);
  }
});

check('validate exposes the same strict map boundary and returns an independent copy', () => {
  const map = codec.capture(payload());
  const validated = codec.validate(map);
  assert.deepEqual(validated, map);
  validated['room/model_one'].notes = 'changed';
  assert.equal(map['room/model_one'].notes, 'private note');
  assert.throws(() => codec.validate({ 'multicam/volume': 0.5 }), /unknown multicam field/);
});

function withoutCustomMembership(map, id = 'model_one') {
  const record = map[`room/${id}`];
  record.groups = record.groups.filter((group) => group !== 'custom');
  delete record.groupOrder.custom;
}

check('reference validation rejects orphan custom groups but recognizes implicit builtins', () => {
  const map = codec.capture(payload());
  const validated = codec.validateReferences(map);
  assert.deepEqual(validated, map);
  validated['room/model_one'].notes = 'detached';
  assert.equal(map['room/model_one'].notes, 'private note');
  delete map['group/custom'];
  assert.throws(() => codec.validateReferences(map), /orphan group reference/);
  withoutCustomMembership(map);
  map['room/model_one'].groups.push('fav');
  map['room/model_one'].groupOrder.fav = 0;
  delete map['group/all'];
  delete map['group/fav'];
  assert.doesNotThrow(() => codec.validateReferences(map));
});

check('a local group deletion conflicts when a concurrent remote room now references it', () => {
  const remote = codec.capture(payload());
  const candidate = clone(remote);
  delete candidate['group/custom'];
  const operations = [{ key: 'group/custom', deleted: true }];
  const before = clone([candidate, remote, operations]);
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, operations), ['group/custom']);
  assert.deepEqual([candidate, remote, operations], before);
});

check('a remote group deletion conflicts with a local room membership update', () => {
  const remote = codec.capture(payload());
  const updatedRoom = clone(remote['room/model_one']);
  delete remote['group/custom'];
  withoutCustomMembership(remote);
  const candidate = { ...clone(remote), 'room/model_one': updatedRoom };
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, [{ key: 'room/model_one', value: updatedRoom }]), ['room/model_one']);
});

check('a new local room referencing an absent group conflicts instead of losing membership', () => {
  const remote = codec.capture(payload());
  const newRoom = { ...clone(remote['room/model_one']), id: 'model_new', groups: ['missing'], groupOrder: { missing: 0 } };
  const candidate = { ...clone(remote), 'room/model_new': newRoom };
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, [{ key: 'room/model_new', value: newRoom }]), ['room/model_new']);
});

check('complete local group removal with every membership update in the batch remains valid', () => {
  const remote = codec.capture(payload());
  remote['room/model_two'] = { ...clone(remote['room/model_one']), id: 'model_two' };
  const candidate = clone(remote);
  delete candidate['group/custom'];
  withoutCustomMembership(candidate);
  withoutCustomMembership(candidate, 'model_two');
  const operations = [
    { key: 'group/custom', deleted: true },
    { key: 'room/model_one', value: candidate['room/model_one'] },
    { key: 'room/model_two', value: candidate['room/model_two'] },
  ];
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, operations), []);
  assert.doesNotThrow(() => codec.validateReferences(candidate));
  // New groups and their room memberships may likewise be created together.
  const created = clone(remote);
  created['group/new_group'] = { id: 'new_group', name: 'New group', order: 6, system: false };
  created['room/model_one'].groups.push('new_group');
  created['room/model_one'].groupOrder.new_group = 0;
  assert.deepEqual(codec.structuralConflictKeys(created, remote, [
    { key: 'group/new_group', value: created['group/new_group'] },
    { key: 'room/model_one', value: created['room/model_one'] },
  ]), []);
});

check('rerunning after blocked room rollback detects newly exposed group-deletion conflicts', () => {
  const remote = codec.capture(payload());
  const candidate = clone(remote);
  delete candidate['group/custom'];
  candidate['room/model_one'].groups = ['remote_deleted_group'];
  candidate['room/model_one'].groupOrder = { remote_deleted_group: 0 };
  const operations = [
    { key: 'group/custom', deleted: true },
    { key: 'room/model_one', value: clone(candidate['room/model_one']) },
  ];
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, operations), ['room/model_one']);
  // Simulate core recomputation: a blocked room retains its remote value.
  operations[1].blocked = 'structural-conflict';
  candidate['room/model_one'] = clone(remote['room/model_one']);
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, operations), ['group/custom']);
  operations[0].blocked = 'structural-conflict';
  candidate['group/custom'] = clone(remote['group/custom']);
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, operations), []);
  assert.doesNotThrow(() => codec.validateReferences(candidate));
});

check('structural detection deduplicates keys and rejects invalid or unattributable maps', () => {
  const remote = codec.capture(payload());
  remote['room/model_two'] = { ...clone(remote['room/model_one']), id: 'model_two' };
  const candidate = clone(remote);
  delete candidate['group/custom'];
  assert.deepEqual(codec.structuralConflictKeys(candidate, remote, [{ key: 'group/custom', deleted: true }]), ['group/custom']);
  assert.throws(() => codec.structuralConflictKeys(candidate, remote, []), /unattributable orphan/);
  assert.throws(() => codec.structuralConflictKeys(candidate, remote, [{ key: 'group/custom', deleted: true, blocked: 'structural-conflict' }]), /unattributable orphan/);
  assert.throws(() => codec.structuralConflictKeys(candidate, candidate, [{ key: 'group/custom', deleted: true }]), /orphan group reference/);
  assert.throws(() => codec.structuralConflictKeys(remote, remote, [{ key: 'group/custom', blocked: true }]), /block marker/);
  assert.throws(() => codec.structuralConflictKeys(remote, remote, Array.from({ length: 513 }, () => ({ key: 'group/custom', deleted: true }))), /operation batch/);
});

check('startup group custom references conflict on either side of a concurrent group deletion', () => {
  const remote = codec.capture(payload());
  withoutCustomMembership(remote);
  remote['multicam/startupGroup'] = 'custom';
  const localDeletion = clone(remote);
  delete localDeletion['group/custom'];
  assert.throws(() => codec.validateReferences(localDeletion), /multicam\/startupGroup -> group\/custom/);
  assert.deepEqual(codec.structuralConflictKeys(localDeletion, remote, [{ key: 'group/custom', deleted: true }]), ['group/custom']);
  const remoteDeletion = clone(localDeletion);
  remoteDeletion['multicam/startupGroup'] = 'last';
  assert.deepEqual(codec.structuralConflictKeys(localDeletion, remoteDeletion, [{ key: 'multicam/startupGroup', value: 'custom' }]), ['multicam/startupGroup']);
  assert.deepEqual(codec.structuralConflictKeys(remoteDeletion, remote, [
    { key: 'group/custom', deleted: true }, { key: 'multicam/startupGroup', value: 'last' },
  ]), []);
});

check('last and every implicit system startup group remain valid without explicit group records', () => {
  for (const id of ['last', 'all', 'fav', 'library', 'online', 'online-favorites']) {
    const map = { 'multicam/startupGroup': id };
    assert.doesNotThrow(() => codec.validateReferences(map));
    assert.deepEqual(codec.structuralConflictKeys(map, {}, [{ key: 'multicam/startupGroup', value: id }]), []);
  }
  assert.deepEqual(codec.structuralConflictKeys({ 'multicam/startupGroup': 'missing' }, {}, [
    { key: 'multicam/startupGroup', value: 'missing' },
  ]), ['multicam/startupGroup']);
});

console.log(`Settings sync codec: ${passed} checks passed.`);
