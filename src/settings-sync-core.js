// Standalone, deterministic settings protocol. Embed this exact factory in the userscript.
function createSettingsSyncCore() {
  'use strict';
  const FORMAT = 'ziggy-settings-sync-v2';
  const LIMIT = Object.freeze({ document: 2 * 1024 * 1024, value: 128 * 1024,
    operation: 160 * 1024, fields: 10000, devices: 256, conflicts: 512, operations: 512 });
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const fail = message => { throw new Error(`Settings sync: ${message}`); };
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const revision = value => integer(value) && value > 0;
  const safeKey = key => typeof key === 'string' && key.length > 0 && key.length <= 512
    && !/[\u0000-\u001f\u007f]/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key);
  const identifier = value => typeof value === 'string' && /^[A-Za-z0-9._-]{1,128}$/.test(value)
    && safeKey(value);
  const clone = value => JSON.parse(canonical(value));

  function keys(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('expected a plain object');
    const proto = Object.getPrototypeOf(value);
    const ctor = proto && Object.getOwnPropertyDescriptor(proto, 'constructor');
    if (proto !== null && (Object.getPrototypeOf(proto) !== null || !ctor
      || typeof ctor.value !== 'function' || ctor.value.name !== 'Object')) fail('non-JSON object');
    const names = Reflect.ownKeys(value);
    for (const key of names) {
      const desc = Object.getOwnPropertyDescriptor(value, key);
      if (!safeKey(key) || !desc.enumerable || !own(desc, 'value')) fail('unsafe object property');
    }
    return names;
  }

  function shape(value, required, optional = []) {
    const names = keys(value);
    if (required.some(key => !own(value, key))
      || names.some(key => !required.includes(key) && !optional.includes(key))) fail('unknown or incomplete schema');
  }

  function jsonSize(value, maximum) {
    const seen = new Set();
    let nodes = 0, minimumSize = 0;
    const budget = amount => { minimumSize += amount; if (minimumSize > maximum) fail('size limit exceeded'); };
    const visit = (item, depth) => {
      if (++nodes > 100000 || depth > 32) fail('JSON complexity limit exceeded');
      budget(1);
      if (typeof item === 'string') { budget(item.length + 1); return; }
      if (item === null || typeof item === 'boolean') return;
      if (typeof item === 'number') { if (!Number.isFinite(item)) fail('non-JSON number'); return; }
      if (typeof item !== 'object' || seen.has(item)) fail('non-JSON value');
      seen.add(item);
      if (Array.isArray(item)) {
        if (item.length > 100000 || Reflect.ownKeys(item).length !== item.length + 1) fail('non-JSON array');
        for (let index = 0; index < item.length; index++) {
          const desc = Object.getOwnPropertyDescriptor(item, String(index));
          if (!desc || !own(desc, 'value') || !desc.enumerable) fail('non-JSON array');
          visit(desc.value, depth + 1);
        }
      } else for (const key of keys(item)) { budget(key.length + 3); visit(item[key], depth + 1); }
      seen.delete(item);
    };
    visit(value, 0);
    // Use our own traversal: inherited toJSON methods must not execute or change the checked payload.
    const serialized = canonical(value);
    let bytes = 0;
    for (const character of serialized) {
      const code = character.codePointAt(0);
      bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
      if (bytes > maximum) fail('size limit exceeded');
    }
    return serialized;
  }

  function state(value, withRevision, maximumRevision, allowMissing = false) {
    shape(value, withRevision ? ['revision', 'deleted'] : ['deleted'], ['value']);
    if (typeof value.deleted !== 'boolean' || (value.deleted ? own(value, 'value') : !own(value, 'value')))
      fail('a state must contain a value or an explicit tombstone');
    if (withRevision && !(allowMissing && value.revision === null && value.deleted)
      && (!revision(value.revision) || value.revision > maximumRevision)) fail('invalid field revision');
    if (!value.deleted) jsonSize(value.value, LIMIT.value);
  }

  function validate(document) {
    jsonSize(document, LIMIT.document);
    shape(document, ['format', 'syncId', 'revision', 'fields', 'acks', 'conflicts']);
    if (document.format !== FORMAT || !identifier(document.syncId) || !revision(document.revision))
      fail('unsupported document');
    const fields = keys(document.fields), devices = keys(document.acks), conflicts = keys(document.conflicts);
    if (fields.length > LIMIT.fields || devices.length > LIMIT.devices || conflicts.length > LIMIT.conflicts)
      fail('document capacity exceeded');
    for (const key of fields) state(document.fields[key], true, document.revision);
    for (const device of devices) if (!identifier(device) || !revision(document.acks[device])
      || document.acks[device] >= document.revision) fail('invalid acknowledgement');
    for (const id of conflicts) {
      const conflict = document.conflicts[id];
      shape(conflict, ['id', 'key', 'device', 'seq', 'baseRevision', 'revision', 'current', 'incoming'], ['reason']);
      if (own(conflict, 'reason') && conflict.reason !== 'structural-conflict') fail('invalid conflict reason');
      if (!identifier(conflict.device) || !revision(conflict.seq) || id !== `${conflict.device}:${conflict.seq}`
        || conflict.id !== id || !safeKey(conflict.key) || !(document.acks[conflict.device] >= conflict.seq)
        || !revision(conflict.revision) || conflict.revision > document.revision
        || !(conflict.baseRevision === null || revision(conflict.baseRevision))
        || conflict.baseRevision >= conflict.revision) fail('invalid conflict');
      state(conflict.current, true, conflict.revision - 1, true);
      state(conflict.incoming, false, document.revision);
    }
    return true;
  }

  function fieldMap(map) {
    const names = keys(map);
    if (names.length > LIMIT.fields) fail('too many fields');
    jsonSize(map, LIMIT.document);
    for (const key of names) jsonSize(map[key], LIMIT.value);
    return names;
  }

  // Object property insertion order is not a settings change; array order remains meaningful.
  function canonical(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${Array.prototype.map.call(value, canonical).join(',')}]`;
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }

  function same(a, b) {
    return a.deleted === b.deleted && (a.deleted || canonical(a.value) === canonical(b.value));
  }

  function seed(map, syncId) {
    if (!identifier(syncId)) fail('invalid sync identity');
    const document = { format: FORMAT, syncId, revision: 1, fields: {}, acks: {}, conflicts: {} };
    for (const key of fieldMap(map).sort()) document.fields[key] = { revision: 1, deleted: false, value: clone(map[key]) };
    validate(document);
    return document;
  }

  function values(document) {
    validate(document);
    const map = {};
    for (const key of Object.keys(document.fields)) if (!document.fields[key].deleted) map[key] = clone(document.fields[key].value);
    return map;
  }

  function diff(before, after) {
    fieldMap(before); fieldMap(after);
    const changes = [];
    for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) {
      if (!own(after, key)) changes.push({ key, deleted: true });
      else if (!own(before, key) || canonical(before[key]) !== canonical(after[key])) changes.push({ key, value: clone(after[key]) });
    }
    return changes;
  }

  function operation(op) {
    jsonSize(op, LIMIT.operation);
    shape(op, ['id', 'device', 'seq', 'key', 'baseRevision'], ['value', 'deleted', 'resolves', 'blocked']);
    if (!identifier(op.device) || !revision(op.seq) || op.id !== `${op.device}:${op.seq}`
      || !safeKey(op.key) || !(op.baseRevision === null || revision(op.baseRevision))) fail('invalid operation identity or revision');
    if (own(op, 'deleted') && typeof op.deleted !== 'boolean') fail('invalid deletion marker');
    if (own(op, 'blocked') && op.blocked !== 'structural-conflict') fail('invalid conflict guard');
    const incoming = op.deleted === true ? { deleted: true } : { deleted: false, value: op.value };
    if ((op.deleted === true && own(op, 'value')) || (op.deleted !== true && !own(op, 'value'))) fail('invalid operation value');
    state(incoming, false, 0);
    if (own(op, 'resolves') && (!Array.isArray(op.resolves) || !op.resolves.length
      || op.resolves.length > LIMIT.conflicts || new Set(op.resolves).size !== op.resolves.length
      || op.resolves.some(id => typeof id !== 'string' || !/^[A-Za-z0-9._-]{1,128}:[1-9][0-9]*$/.test(id)))) fail('invalid conflict resolution list');
    return incoming;
  }

  function merge(original, operations) {
    validate(original);
    if (!Array.isArray(operations) || operations.length > LIMIT.operations) fail('operation batch limit exceeded');
    // Work on a clone so validation/capacity failures cannot partially acknowledge a batch.
    const document = clone(original);
    let changed = false;
    for (const op of operations) {
      const incoming = operation(op);
      const ack = own(document.acks, op.device) ? document.acks[op.device] : 0;
      if (op.seq <= ack) continue;
      if (op.seq !== ack + 1) fail('operation sequence gap');
      if (op.baseRevision !== null && op.baseRevision > document.revision) fail('operation refers to a future revision');
      const current = own(document.fields, op.key) ? document.fields[op.key] : { revision: null, deleted: true };
      const matches = op.baseRevision === current.revision;
      const resolving = own(op, 'resolves');
      // A stale resolution must never clear evidence, even when its chosen value is identical.
      const acceptable = !own(op, 'blocked') && (matches || (!resolving && same(current, incoming)));
      if (document.revision === Number.MAX_SAFE_INTEGER) fail('revision exhausted');
      const nextRevision = document.revision + 1;
      if (acceptable) {
        if (resolving) {
          for (const id of op.resolves) {
            if (own(document.conflicts, id) && document.conflicts[id].key !== op.key) fail('resolution names another field');
          }
          for (const id of op.resolves) delete document.conflicts[id];
        }
        // Coalescing preserves a field's revision; a real change (including a new tombstone) gets a fresh one.
        if (!same(current, incoming) || current.revision === null) document.fields[op.key] = { revision: nextRevision, ...clone(incoming) };
      } else {
        document.conflicts[op.id] = { id: op.id, key: op.key, device: op.device, seq: op.seq,
          baseRevision: op.baseRevision, revision: nextRevision, current: clone(current), incoming: clone(incoming),
          ...(own(op, 'blocked') ? { reason: op.blocked } : {}) };
      }
      document.revision = nextRevision;
      document.acks[op.device] = op.seq;
      changed = true;
    }
    validate(document);
    return { document, changed };
  }

  return Object.freeze({ seed, validate, values, diff, merge, limits: LIMIT });
}
