import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/settings-sync-core.js', import.meta.url), 'utf8');
const core = vm.runInNewContext(`${source}\ncreateSettingsSyncCore()`, { console });
const plain = value => JSON.parse(JSON.stringify(value));
const seed = (map = { a: 'initial', b: 1 }) => core.seed(map, 'test-document');
const op = (device, seq, key, baseRevision, value, extra = {}) => ({ id: `${device}:${seq}`, device, seq, key, baseRevision, value, ...extra });
const remove = (device, seq, key, baseRevision, extra = {}) => ({ id: `${device}:${seq}`, device, seq, key, baseRevision, deleted: true, ...extra });
const merge = (doc, ...ops) => core.merge(doc, ops).document;
let count = 0;
function test(name, run) { run(); count++; console.log(`ok ${count} - ${name}`); }

test('seeding round trips flat JSON values without aliasing', () => {
  const map = { name: 'x', options: { z: [true, null, 3], a: false } }, doc = seed(map);
  assert.equal(core.validate(doc), true);
  assert.deepEqual(plain(core.values(doc)), map);
  map.options.z.push(4);
  assert.equal(core.values(doc).options.z.length, 3);
});

test('diff is stable, deletion-explicit and ignores object key order', () => {
  assert.deepEqual(plain(core.diff({ z: 1, a: { b: 1, c: 2 }, gone: null }, { z: 2, a: { c: 2, b: 1 }, add: false })),
    [{ key: 'add', value: false }, { key: 'gone', deleted: true }, { key: 'z', value: 2 }]);
});

test('unrelated offline updates merge independently', () => {
  const doc = merge(seed(), op('laptop', 1, 'a', 1, 'offline'), op('phone', 1, 'b', 1, 2));
  assert.deepEqual(plain(core.values(doc)), { a: 'offline', b: 2 });
  assert.deepEqual(plain(doc.conflicts), {});
});

test('same-field concurrent edits retain both values and acknowledge conflict', () => {
  const doc = merge(seed(), op('laptop', 1, 'a', 1, 'first'), op('phone', 1, 'a', 1, 'second'));
  assert.equal(doc.fields.a.value, 'first');
  assert.equal(doc.acks.phone, 1);
  assert.equal(doc.conflicts['phone:1'].incoming.value, 'second');
  assert.equal(doc.conflicts['phone:1'].current.value, 'first');
});

test('lost response and replay have exactly-once effect', () => {
  const command = op('laptop', 1, 'a', 1, 'changed'), doc = merge(seed(), command);
  const retry = core.merge(doc, [command]);
  assert.equal(retry.changed, false);
  assert.deepEqual(plain(retry.document), plain(doc));
});

test('conflicted operations are idempotent on replay', () => {
  const command = op('phone', 1, 'a', 1, 'second');
  const doc = merge(seed(), op('laptop', 1, 'a', 1, 'first'), command);
  assert.deepEqual(plain(core.merge(doc, [command])), { document: plain(doc), changed: false });
});

test('same-device contiguous operations apply in order', () => {
  const doc = merge(seed(), op('pc', 1, 'a', 1, 'one'), op('pc', 2, 'a', 2, 'two'));
  assert.equal(doc.fields.a.value, 'two');
  assert.equal(doc.acks.pc, 2);
});

test('sequence gaps and reversed delivery reject atomically', () => {
  const doc = seed(), snapshot = plain(doc);
  assert.throws(() => merge(doc, op('pc', 2, 'a', 1, 'two')), /sequence gap/);
  assert.throws(() => merge(doc, op('pc', 1, 'a', 1, 'one'), op('pc', 3, 'b', 1, 5)), /sequence gap/);
  assert.deepEqual(plain(doc), snapshot);
});

test('identical concurrent JSON values coalesce without conflict', () => {
  const doc = merge(seed(), op('pc', 1, 'a', 1, { z: 1, a: 2 }), op('phone', 1, 'a', 1, { a: 2, z: 1 }));
  assert.equal(doc.fields.a.revision, 2);
  assert.equal(doc.acks.phone, 1);
  assert.deepEqual(plain(doc.conflicts), {});
});

test('deletion survives unchanged stale-device fields and unrelated edits', () => {
  let doc = merge(seed(), remove('pc', 1, 'a', 1));
  doc = merge(doc, op('phone', 1, 'b', 1, 3));
  assert.deepEqual(plain(core.values(doc)), { b: 3 });
  assert.equal(doc.fields.a.deleted, true);
  assert.deepEqual(plain(core.diff({ a: 'initial', b: 1 }, { a: 'initial', b: 3 })), [{ key: 'b', value: 3 }]);
});

test('stale edit against deletion preserves the tombstone and conflicting value', () => {
  const doc = merge(seed(), remove('pc', 1, 'a', 1), op('phone', 1, 'a', 1, 'old edit'));
  assert.equal(doc.fields.a.deleted, true);
  assert.equal(doc.conflicts['phone:1'].incoming.value, 'old edit');
});

test('explicit re-add using observed tombstone revision succeeds', () => {
  const doc = merge(seed(), remove('pc', 1, 'a', 1), op('phone', 1, 'a', 2, 'restored'));
  assert.equal(doc.fields.a.value, 'restored');
  assert.equal(doc.fields.a.revision, 3);
});

test('concurrent deletions coalesce and deletion of absent key makes a tombstone', () => {
  const doc = merge(seed(), remove('pc', 1, 'a', 1), remove('phone', 1, 'a', 1), remove('pc', 2, 'missing', null));
  assert.equal(doc.fields.a.revision, 2);
  assert.equal(doc.fields.missing.deleted, true);
  assert.deepEqual(plain(doc.conflicts), {});
});

test('ABA does not permit a stale edit after value restoration', () => {
  const doc = merge(seed(), op('pc', 1, 'a', 1, 'temporary'), op('pc', 2, 'a', 2, 'initial'), op('phone', 1, 'a', 1, 'stale'));
  assert.equal(doc.fields.a.value, 'initial');
  assert.equal(doc.fields.a.revision, 3);
  assert.ok(doc.conflicts['phone:1']);
});

test('explicit resolution removes only named conflicts and preserves concurrent conflicts', () => {
  let doc = merge(seed(), op('pc', 1, 'a', 1, 'first'), op('phone', 1, 'a', 1, 'second'));
  const resolve = op('pc', 2, 'a', 2, 'chosen', { resolves: ['phone:1'] });
  doc = merge(doc, op('tablet', 1, 'a', 1, 'third'), resolve);
  assert.equal(doc.fields.a.value, 'chosen');
  assert.equal(doc.conflicts['phone:1'], undefined);
  assert.equal(doc.conflicts['tablet:1'].incoming.value, 'third');
});

test('stale resolution is acknowledged as a new conflict and clears nothing', () => {
  let doc = merge(seed(), op('pc', 1, 'a', 1, 'first'), op('phone', 1, 'a', 1, 'second'));
  doc = merge(doc, op('pc', 2, 'a', 2, 'third'), op('phone', 2, 'a', 2, 'third', { resolves: ['phone:1'] }));
  assert.ok(doc.conflicts['phone:1']);
  assert.ok(doc.conflicts['phone:2']);
  assert.equal(doc.fields.a.value, 'third');
});

test('resolution cannot remove conflicts for another field', () => {
  const doc = merge(seed(), op('pc', 1, 'b', 1, 2), op('phone', 1, 'b', 1, 3));
  assert.throws(() => merge(doc, op('pc', 2, 'a', 1, 'x', { resolves: ['phone:1'] })), /another field/);
});

test('corrupt document schemas, future revisions and ack mismatch reject', () => {
  for (const mutate of [d => { d.format = 'unknown'; }, d => { d.extra = true; }, d => { d.fields.a.revision = 9; },
    d => { d.fields.a.deleted = true; }, d => { d.acks.pc = 0; }, d => { d.acks.pc = 1; }, d => { d.revision = 1.5; }]) {
    const doc = plain(seed()); mutate(doc); assert.throws(() => core.validate(doc));
  }
  assert.throws(() => merge(seed(), op('pc', 1, 'a', 99, 2)), /future revision/);
  const bad = plain(merge(seed(), op('pc', 1, 'a', 1, 'one'), op('phone', 1, 'a', 1, 'two')));
  delete bad.acks.phone;
  assert.throws(() => core.validate(bad), /invalid conflict/);
});

test('prototype and accessor keys reject without executing accessors', () => {
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    assert.throws(() => seed(JSON.parse(`{"${key}": 1}`)), /unsafe/);
    assert.throws(() => seed({ safe: JSON.parse(`{"${key}": 1}`) }), /unsafe/);
    assert.throws(() => merge(seed(), op('pc', 1, key, null, 1)));
  }
  let invoked = false;
  const access = { get value() { invoked = true; return 1; } };
  assert.throws(() => seed(access), /unsafe/);
  assert.equal(invoked, false);
  assert.throws(() => seed(Object.create({ inherited: 1 })), /non-JSON/);
});

test('non-JSON values, cyclic data, array holes and unknown operation keys reject', () => {
  const circular = {}; circular.self = circular;
  for (const value of [undefined, NaN, Infinity, 1n, () => {}, new Date(), circular, [, 1]]) assert.throws(() => seed({ value }));
  assert.throws(() => merge(seed(), op('pc', 1, 'a', 1, 'x', { timestamp: 123 })), /schema/);
  assert.throws(() => merge(seed(), op('pc', 1, 'a', 1, 'x', { deleted: true })), /operation value/);
});

test('value, document, queue and retained-device bounds fail closed', () => {
  assert.throws(() => seed({ large: 'x'.repeat(core.limits.value + 1) }), /size limit/);
  assert.throws(() => seed(Object.fromEntries(Array.from({ length: 22 }, (_, i) => [`k${i}`, 'x'.repeat(100000)]))), /size limit/);
  assert.throws(() => core.merge(seed(), Array(core.limits.operations + 1).fill(op('pc', 1, 'a', 1, 2))), /batch limit/);
  const doc = plain(seed());
  doc.revision = core.limits.devices + 1;
  for (let i = 0; i < core.limits.devices; i++) doc.acks[`d${i}`] = 1;
  assert.throws(() => merge(doc, op('new-device', 1, 'a', 1, 'x')), /capacity/);
  assert.equal(Object.keys(doc.acks).length, core.limits.devices);
});

test('serialization does not invoke inherited array JSON hooks', () => {
  const array = [1, 2];
  let invoked = false;
  Object.setPrototypeOf(array, { toJSON() { invoked = true; return ['hijacked']; } });
  assert.deepEqual(plain(core.values(seed({ value: array }))), { value: [1, 2] });
  assert.equal(invoked, false);
});

test('conflict capacity retains all evidence and permits explicit resolution', () => {
  const original = merge(seed(), op('pc', 1, 'a', 1, 'first'));
  const conflicts = Array.from({ length: core.limits.conflicts }, (_, index) => op('phone', index + 1, 'a', 1, `choice ${index}`));
  const full = core.merge(original, conflicts).document;
  assert.throws(() => merge(full, op('phone', core.limits.conflicts + 1, 'a', 1, 'extra')), /capacity/);
  assert.equal(Object.keys(full.conflicts).length, core.limits.conflicts);
  assert.equal(full.acks.phone, core.limits.conflicts);
  const resolved = merge(full, op('pc', 2, 'a', 2, 'first', { resolves: ['phone:1'] }));
  assert.equal(Object.keys(resolved.conflicts).length, core.limits.conflicts - 1);
  assert.ok(resolved.conflicts[`phone:${core.limits.conflicts}`]);
});

test('bounded deterministic randomized unrelated edits converge regardless of device order', () => {
  for (let round = 0; round < 30; round++) {
    const map = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`k${index}`, index]));
    const ops = Object.keys(map).map((key, index) => op(`d${index}`, 1, key, 1, index + round + 1));
    const forward = core.merge(seed(map), ops).document;
    const reverse = core.merge(seed(map), [...ops].reverse()).document;
    assert.deepEqual(plain(core.values(forward)), plain(core.values(reverse)));
    assert.deepEqual(plain(forward.conflicts), {});
    assert.equal(core.merge(forward, ops).changed, false);
  }
});

test('structural guards preserve existing or absent fields as acknowledged conflict evidence', () => {
  const command = { ...op('pc', 1, 'room/new', null, { group: 'deleted-group' }), blocked: 'structural-conflict' };
  const initial = seed({}), doc = merge(initial, command);
  assert.deepEqual(plain(core.values(doc)), {});
  assert.deepEqual(plain(doc.conflicts['pc:1'].current), { revision: null, deleted: true });
  assert.deepEqual(plain(doc.conflicts['pc:1'].incoming), { deleted: false, value: { group: 'deleted-group' } });
  assert.equal(doc.conflicts['pc:1'].reason, 'structural-conflict');
  assert.equal(doc.acks.pc, 1);
  assert.equal(core.merge(doc, [command]).changed, false);
  const existing = merge(seed(), { ...remove('pc', 1, 'a', 1), blocked: 'structural-conflict' });
  assert.equal(existing.fields.a.value, 'initial');
  assert.equal(existing.conflicts['pc:1'].incoming.deleted, true);
  assert.throws(() => merge(seed(), { ...op('pc', 1, 'a', 1, 'x'), blocked: 'unsupported' }), /conflict guard/);
  const invalid = plain(doc); invalid.conflicts['pc:1'].reason = 'unknown';
  assert.throws(() => core.validate(invalid), /conflict reason/);
});

console.log(`Settings sync core: ${count} focused protocol checks passed.`);
