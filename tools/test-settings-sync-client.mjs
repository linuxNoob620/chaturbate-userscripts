import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(`../src/${name}.js`, import.meta.url), 'utf8');
const { core, client } = vm.runInNewContext(`${read('settings-sync-core')}\n${read('settings-sync-client')}
  const core = createSettingsSyncCore(); ({core, client:createSettingsSyncClient(core)});`);
const plain = value => JSON.parse(JSON.stringify(value));
const value = value => ({ deleted: false, value });
const deleted = { deleted: true };
const seed = () => core.seed({ a: 'A', b: 1 }, 'sync-test');
const init = () => client.initialize(seed(), 'pc');
const batch = (id, key = 'a', before = 'A', after = 'B', baseRevision = 1, extra = {}) => ({ id,
  changes: [{ key, before: value(before), after: value(after), baseRevision, ...extra }] });
const op = (device, seq, key, baseRevision, value) => ({ device, seq, id: `${device}:${seq}`, key, baseRevision, value });
const remoteEdit = (doc, key = 'a', next = 'remote', device = 'phone', base = doc.fields[key].revision, seq = 1) =>
  core.merge(doc, [op(device, seq, key, base, next)]).document;
let count = 0;
function test(name, run) { run(); count++; console.log(`ok ${count} - ${name}`); }

// Domain selector is deliberately synthetic here: the production codec owns Suite-specific references.
function referenceGuard(candidate, remote, operations) {
  const current = core.values(candidate), previous = core.values(remote), result = new Set();
  for (const [key, room] of Object.entries(current)) if (key.startsWith('room/')) {
    for (const group of room.groups) if (!current[`group/${group}`]) {
      const groupKey = `group/${group}`;
      if (previous[groupKey] && operations.some(item => item.key === groupKey && item.deleted && !item.blocked)) result.add(groupKey);
      else if (operations.some(item => item.key === key && !item.deleted && !item.blocked)) result.add(key);
      else throw new Error('Unattributable invalid reference');
    }
  }
  return [...result];
}

const structuralSeed = (groups = ['A']) => core.seed({ 'group/A': true, 'room/one': { groups, note: '' } }, 'structural-test');
const structuralChange = (key, before, after, baseRevision = 1) => ({ key, before, after, baseRevision });

test('ingestion is immutable and a repeated WAL ID is a no-op', () => {
  const state = init(), journal = batch('batch-1');
  const ingested = client.ingest(state, journal);
  assert.equal(state.pending.length, 0);
  assert.equal(ingested.pending.length, 1);
  assert.deepEqual(plain(client.ingest(ingested, journal)), plain(ingested));
  assert.deepEqual(plain(client.view(ingested)), { a: 'B', b: 1 });
});

test('causally linked pending edits coalesce while retaining the first base', () => {
  let state = client.ingest(init(), batch('first'));
  state = client.ingest(state, batch('second', 'a', 'B', 'C'));
  assert.equal(state.pending.length, 1);
  assert.equal(state.pending[0].before.value, 'A');
  assert.equal(state.pending[0].after.value, 'C');
  assert.equal(state.pending[0].baseRevision, 1);
  assert.deepEqual(plain(state.seen), ['first', 'second']);
});

test('concurrent differing local intents remain separate and create conflict evidence', () => {
  let state = client.ingest(init(), batch('first'));
  state = client.ingest(state, batch('second', 'a', 'A', 'C'));
  const prepared = client.prepare(state, seed());
  assert.equal(prepared.operations.length, 2);
  assert.equal(prepared.document.fields.a.value, 'B');
  assert.equal(prepared.document.conflicts['pc:2'].incoming.value, 'C');
});

test('unrelated offline remote edits survive preparing local intent', () => {
  const state = client.ingest(init(), batch('first'));
  const prepared = client.prepare(state, remoteEdit(seed(), 'b', 2));
  assert.deepEqual(plain(core.values(prepared.document)), { a: 'B', b: 2 });
  assert.equal(prepared.state.confirmed.fields.a.value, 'A');
  assert.equal(prepared.state.flight.operations[0].id, 'pc:1');
  assert.equal(prepared.state.nextSeq, 2);
});

test('409 retry retains operation identity and original captured base', () => {
  const first = client.prepare(client.ingest(init(), batch('first')), seed());
  const fresh = remoteEdit(seed());
  const retry = client.prepare(first.state, fresh);
  assert.equal(retry.operations[0].id, first.operations[0].id);
  assert.equal(retry.operations[0].baseRevision, 1);
  assert.equal(retry.document.fields.a.value, 'remote');
  assert.equal(retry.document.conflicts['pc:1'].incoming.value, 'B');
});

test('uncertain successful PUT is recognized from remote ack without replay', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), seed());
  const retry = client.prepare(prepared.state, prepared.document);
  assert.equal(retry.operations.length, 0);
  assert.equal(retry.state.flight, null);
  assert.equal(retry.state.nextSeq, 2);
  assert.deepEqual(plain(retry.document), plain(prepared.document));
});

test('pending edits arriving during upload are never acknowledged with the flight', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), seed());
  const during = client.ingest(prepared.state, batch('later', 'b', 1, 2));
  const accepted = client.accept(during, prepared.document);
  assert.equal(accepted.flight, null);
  assert.equal(accepted.pending.length, 1);
  assert.equal(accepted.pending[0].batchId, 'later');
  assert.equal(client.prepare(accepted, prepared.document).operations[0].id, 'pc:2');
});

test('same-field pending edit remaps only to confirmed accepted flight revision', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), seed());
  const during = client.ingest(prepared.state, batch('later', 'a', 'B', 'C'));
  const accepted = client.accept(during, prepared.document);
  assert.equal(accepted.pending[0].baseRevision, 2);
  const next = client.prepare(accepted, prepared.document);
  assert.equal(next.document.fields.a.value, 'C');
  assert.deepEqual(plain(next.document.conflicts), {});
});

test('failed flight conflict cannot rebase a dependent local edit onto the remote winner', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), remoteEdit(seed()));
  const during = client.ingest(prepared.state, batch('later', 'a', 'B', 'C'));
  const accepted = client.accept(during, prepared.document);
  assert.equal(accepted.pending[0].baseRevision, 1);
  const next = client.prepare(accepted, prepared.document);
  assert.equal(next.document.fields.a.value, 'remote');
  assert.ok(next.document.conflicts['pc:1']);
  assert.equal(next.document.conflicts['pc:2'].incoming.value, 'C');
});

test('ABA after uncertain success prevents guessed revision remapping', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), seed());
  const during = client.ingest(prepared.state, batch('later', 'a', 'B', 'C'));
  let remote = remoteEdit(prepared.document, 'a', 'X');
  remote = remoteEdit(remote, 'a', 'B', 'phone', remote.fields.a.revision, 2);
  const accepted = client.accept(during, remote);
  assert.equal(accepted.pending[0].baseRevision, 1);
  assert.ok(client.prepare(accepted, remote).document.conflicts['pc:2']);
});

test('partially acknowledged prefix preserves remaining sequence and pending intents', () => {
  let state = client.ingest(init(), batch('first'));
  state = client.ingest(state, batch('second', 'b', 1, 2));
  const prepared = client.prepare(state, seed());
  const partial = core.merge(seed(), [prepared.operations[0]]).document;
  const retry = client.prepare(prepared.state, partial);
  assert.equal(retry.operations.length, 1);
  assert.equal(retry.operations[0].id, 'pc:2');
  assert.deepEqual(plain(core.values(retry.document)), { a: 'B', b: 2 });
  assert.equal(client.accept(retry.state, retry.document).flight, null);
});

test('causal resolution chain recomputes dependent numeric bases after 409', () => {
  let state = client.ingest(init(), batch('first', 'a', 'A', 'B', 1, { resolves: ['old:1'] }));
  state = client.ingest(state, batch('second', 'a', 'B', 'C'));
  const first = client.prepare(state, seed());
  assert.equal(first.operations[1].baseRevision, 2);
  const remote = remoteEdit(seed(), 'b', 2);
  const retry = client.prepare(first.state, remote);
  assert.equal(retry.operations[1].baseRevision, 3);
  assert.equal(retry.operations[1].id, 'pc:2');
  assert.equal(retry.document.fields.a.value, 'C');
});

test('causal resolution chain cannot use an earlier conflicted operation revision', () => {
  let state = client.ingest(init(), batch('first', 'a', 'A', 'B', 1, { resolves: ['old:1'] }));
  state = client.ingest(state, batch('second', 'a', 'B', 'C'));
  const prepared = client.prepare(state, remoteEdit(seed()));
  assert.equal(prepared.operations[1].baseRevision, 1);
  assert.ok(prepared.document.conflicts['pc:1']);
  assert.ok(prepared.document.conflicts['pc:2']);
});

test('deletion and re-add are explicit, and pending view never changes confirmed data', () => {
  const deletedBatch = { id: 'delete', changes: [{ key: 'a', before: value('A'), after: deleted, baseRevision: 1 }] };
  const prepared = client.prepare(client.ingest(init(), deletedBatch), seed());
  const state = client.ingest(prepared.state, { id: 'restore', changes: [{ key: 'a', before: deleted, after: value('restored'), baseRevision: 1 }] });
  assert.equal(client.view(state).a, 'restored');
  assert.equal(state.confirmed.fields.a.value, 'A');
  const accepted = client.accept(state, prepared.document);
  assert.equal(client.prepare(accepted, prepared.document).document.fields.a.value, 'restored');
});

test('schema, dangerous keys, history gaps, sync-ID changes and device collisions fail closed', () => {
  assert.throws(() => client.ingest(init(), { ...batch('bad'), extra: true }));
  assert.throws(() => client.ingest(init(), batch('bad', '__proto__')));
  assert.throws(() => client.prepare(init(), core.seed({ a: 'A', b: 1 }, 'different')), /identity/);
  const collision = core.merge(seed(), [op('pc', 1, 'a', 1, 'collision')]).document;
  assert.throws(() => client.prepare(init(), collision), /another writer/);
  const acknowledged = client.accept(client.prepare(client.ingest(init(), batch('first')), seed()).state, collision);
  assert.throws(() => client.prepare(acknowledged, seed()), /rolled back/);
  const bad = plain(init()); bad.pending.push({});
  assert.throws(() => client.view(bad));
});

test('bounded queues and batch histories reject atomically without evicting WAL IDs', () => {
  const state = init();
  const many = { id: 'many', changes: Array.from({ length: client.limits.intents }, (_, index) =>
    ({ key: `key${index}`, before: deleted, after: value(index), baseRevision: null })) };
  const full = client.ingest(state, many);
  assert.throws(() => client.ingest(full, batch('excess')), /capacity/);
  assert.equal(full.pending.length, client.limits.intents);
  assert.deepEqual(plain(full.seen), ['many']);
  const history = plain(init()); history.seen = Array.from({ length: client.limits.seen }, (_, index) => `batch${index}`);
  assert.throws(() => client.ingest(history, batch('new')), /history capacity/);
  assert.equal(state.pending.length, 0);
});

test('old completed batches stay deduplicated after future confirmed remote updates', () => {
  const prepared = client.prepare(client.ingest(init(), batch('first')), seed());
  let state = client.accept(prepared.state, prepared.document);
  state = client.accept(state, remoteEdit(prepared.document, 'a', 'newer'));
  state = client.ingest(state, batch('first'));
  assert.equal(state.pending.length, 0);
  assert.equal(client.view(state).a, 'newer');
});

test('partial prefix acknowledgement safely rebases its remaining causal dependent', () => {
  let state = client.ingest(init(), batch('first', 'a', 'A', 'B', 1, { resolves: ['old:1'] }));
  state = client.ingest(state, batch('second', 'a', 'B', 'C'));
  const prepared = client.prepare(state, seed());
  const prefix = core.merge(seed(), [prepared.operations[0]]).document;
  const retried = client.prepare(prepared.state, prefix);
  assert.equal(retried.operations[0].id, 'pc:2');
  assert.equal(retried.operations[0].baseRevision, 2);
  assert.equal(retried.document.fields.a.value, 'C');
  assert.deepEqual(plain(retried.document.conflicts), {});
});

test('caller may compact deleted-WAL history while active intent IDs still deduplicate', () => {
  const state = plain(client.ingest(init(), batch('first')));
  state.seen = [];
  assert.equal(client.validate(state), true);
  const duplicate = client.ingest(state, batch('first'));
  assert.equal(duplicate.pending.length, 1);
  const staged = plain(client.prepare(duplicate, seed()).state);
  staged.seen = [];
  assert.equal(client.ingest(staged, batch('first')).pending.length, 0);
  staged.flight.operations[0].value = 'tampered';
  assert.throws(() => client.validate(staged), /changed intent/);
});

test('own atomic group deletion succeeds, but concurrent room edit preserves the group and both intents', () => {
  const doc = structuralSeed();
  const state = client.ingest(client.initialize(doc, 'pc'), { id: 'delete-group', changes: [
    structuralChange('group/A', value(true), deleted),
    structuralChange('room/one', value({ groups: ['A'], note: '' }), value({ groups: [], note: '' })),
  ] });
  const ordinary = client.prepare(state, doc, referenceGuard);
  assert.equal(ordinary.document.fields['group/A'].deleted, true);
  assert.deepEqual(plain(ordinary.document.conflicts), {});
  const remote = remoteEdit(doc, 'room/one', { groups: ['A'], note: 'concurrent note' });
  const guarded = client.prepare(state, remote, referenceGuard);
  assert.equal(guarded.document.fields['group/A'].value, true);
  assert.equal(guarded.document.fields['room/one'].value.note, 'concurrent note');
  assert.equal(guarded.operations[0].blocked, 'structural-conflict');
  assert.equal(guarded.document.conflicts['pc:1'].reason, 'structural-conflict');
  assert.deepEqual(plain(guarded.document.conflicts['pc:2'].incoming.value.groups), []);
  assert.equal(guarded.state.flight.outcomes['delete-group:0'].accepted, false);
  assert.equal(guarded.document.acks.pc, 2);
  assert.equal(client.accept(guarded.state, guarded.document).flight, null);
});

test('remote group deletion guards a new local room without creating an orphan or losing its value', () => {
  const doc = structuralSeed([]);
  const state = client.ingest(client.initialize(doc, 'pc'), { id: 'add-room', changes: [
    structuralChange('room/new', deleted, value({ groups: ['A'], note: 'keep me' }), null),
  ] });
  const remote = core.merge(doc, [{ device: 'phone', id: 'phone:1', seq: 1, key: 'group/A', baseRevision: 1, deleted: true }]).document;
  const result = client.prepare(state, remote, referenceGuard);
  assert.equal(result.document.fields['room/new'], undefined);
  assert.deepEqual(plain(result.document.conflicts['pc:1'].current), { revision: null, deleted: true });
  assert.equal(result.document.conflicts['pc:1'].incoming.value.note, 'keep me');
  assert.equal(result.document.conflicts['pc:1'].reason, 'structural-conflict');
  assert.deepEqual(referenceGuard(result.document, remote, result.operations), []);
  assert.equal(client.prepare(result.state, result.document, referenceGuard).operations.length, 0);
});

test('guard passes handle cascades and recompute all guards from original intents after CAS retry', () => {
  const doc = core.seed({ 'group/A': true, 'group/B': true, 'room/one': { groups: ['A'], note: '' } }, 'structural-test');
  const state = client.ingest(client.initialize(doc, 'pc'), { id: 'move-and-delete', changes: [
    structuralChange('group/A', value(true), deleted),
    structuralChange('room/one', value({ groups: ['A'], note: '' }), value({ groups: ['B'], note: '' })),
  ] });
  const remote = core.merge(doc, [{ device: 'phone', id: 'phone:1', seq: 1, key: 'group/B', baseRevision: 1, deleted: true }]).document;
  let passes = 0;
  const guarded = client.prepare(state, remote, (...args) => { passes++; return referenceGuard(...args); });
  assert.equal(passes, 3);
  assert.ok(guarded.operations.every(item => item.blocked === 'structural-conflict'));
  assert.equal(core.values(guarded.document)['group/A'], true);
  const repaired = remoteEdit(remote, 'group/B', true, 'phone', remote.fields['group/B'].revision, 2);
  const retry = client.prepare(guarded.state, repaired, referenceGuard);
  assert.deepEqual(plain(retry.operations.map(item => item.id)), ['pc:1', 'pc:2']);
  assert.ok(retry.operations.every(item => !item.blocked));
  assert.equal(retry.document.fields['group/A'].deleted, true);
  assert.deepEqual(plain(retry.document.fields['room/one'].value.groups), ['B']);
});

test('invalid selectors fail before returning a candidate and cannot mutate inputs or escape bounds', () => {
  const doc = structuralSeed([]), state = client.ingest(client.initialize(doc, 'pc'), { id: 'delete', changes: [
    structuralChange('group/A', value(true), deleted),
  ] });
  const snapshot = plain(state);
  assert.throws(() => client.prepare(state, doc, () => ['missing']), /unknown/);
  assert.throws(() => client.prepare(state, doc, () => ['group/A', 'group/A']), /duplicate/);
  assert.throws(() => client.prepare(state, doc, () => ['group/A']), /cannot be resolved/);
  assert.throws(() => client.prepare(state, doc, () => Promise.resolve([])), /invalid list/);
  assert.throws(() => client.prepare(state, doc, () => { throw new Error('Invalid remote references'); }), /Invalid remote/);
  const safe = client.prepare(state, doc, (candidate, remote, operations) => {
    candidate.fields['group/A'].deleted = false; remote.syncId = 'mutated'; operations[0].key = 'mutated'; return [];
  });
  assert.equal(safe.document.fields['group/A'].deleted, true);
  assert.equal(doc.syncId, 'structural-test');
  assert.deepEqual(plain(state), snapshot);
});

console.log(`Settings sync client: ${count} focused queue checks passed.`);
