// Pure durable-queue coordinator. The caller persists returned state before attempting a PUT.
function createSettingsSyncClient(core) {
  'use strict';
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const fail = message => { throw new Error(`Settings sync client: ${message}`); };
  const limits = Object.freeze({ intents: 512, seen: 10000, state: 8 * 1024 * 1024 });
  const positive = value => Number.isSafeInteger(value) && value > 0;
  const id = value => typeof value === 'string' && /^[A-Za-z0-9._:-]{1,180}$/.test(value)
    && !['__proto__', 'prototype', 'constructor'].includes(value);
  const deviceId = value => id(value) && /^[A-Za-z0-9._-]{1,128}$/.test(value);
  const copy = value => value === null || typeof value !== 'object' ? value : Array.isArray(value)
    ? Array.prototype.map.call(value, copy) : Object.fromEntries(Object.keys(value).map(key => [key, copy(value[key])]));
  const stable = value => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value)
    ? `[${Array.prototype.map.call(value, stable).join(',')}]`
    : `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  const equal = (left, right) => stable(left) === stable(right);

  function shape(value, required, optional = []) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid object');
    const proto = Object.getPrototypeOf(value), ctor = proto && Object.getOwnPropertyDescriptor(proto, 'constructor');
    if (proto !== null && (Object.getPrototypeOf(proto) !== null || !ctor || typeof ctor.value !== 'function'
      || ctor.value.name !== 'Object')) fail('invalid object prototype');
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !own(descriptor, 'value')
        || (!required.includes(key) && !optional.includes(key))) fail('unknown or unsafe property');
    }
    if (required.some(key => !own(value, key))) fail('incomplete object');
  }

  function array(value, maximum) {
    if (!Array.isArray(value) || value.length > maximum || Reflect.ownKeys(value).length !== value.length + 1)
      fail('invalid list or list capacity exceeded');
    for (let i = 0; i < value.length; i++) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
      if (!descriptor || !own(descriptor, 'value') || !descriptor.enumerable) fail('unsafe list');
    }
  }

  function field(value) {
    shape(value, ['deleted'], ['value']);
    if (typeof value.deleted !== 'boolean' || (value.deleted ? own(value, 'value') : !own(value, 'value')))
      fail('invalid field state');
    if (!value.deleted) core.diff({}, { value: value.value });
  }

  function change(value, intent = false) {
    shape(value, intent ? ['id', 'batchId', 'key', 'before', 'after', 'baseRevision']
      : ['key', 'before', 'after', 'baseRevision'], intent ? ['dependsOn', 'resolves'] : ['resolves']);
    if (typeof value.key !== 'string') fail('invalid field key');
    core.diff({ [value.key]: null }, {});
    field(value.before); field(value.after);
    if (value.baseRevision !== null && !positive(value.baseRevision)) fail('invalid captured revision');
    if (intent && (!id(value.id) || !id(value.batchId) || !value.id.startsWith(`${value.batchId}:`)
      || !/^(0|[1-9][0-9]*)$/.test(value.id.slice(value.batchId.length + 1))
      || (own(value, 'dependsOn') && !id(value.dependsOn))))
      fail('invalid intent identity');
    if (own(value, 'resolves')) {
      array(value.resolves, core.limits.conflicts);
      if (!value.resolves.length || new Set(value.resolves).size !== value.resolves.length
        || value.resolves.some(item => !/^[A-Za-z0-9._-]{1,128}:[1-9][0-9]*$/.test(item))) fail('invalid resolution list');
    }
  }

  function bounded(value) {
    // Bound before serialization, then check actual UTF-8 bytes (without platform APIs).
    let minimum = 0;
    const visit = item => {
      minimum += typeof item === 'string' ? item.length + 2 : 1;
      if (minimum > limits.state) fail('local state capacity exceeded');
      if (item && typeof item === 'object') for (const key of Object.keys(item)) { minimum += key.length + 3; visit(item[key]); }
    };
    visit(value);
    let bytes = 0;
    for (const character of stable(value)) {
      const code = character.codePointAt(0);
      bytes += code < 128 ? 1 : code < 2048 ? 2 : code < 65536 ? 3 : 4;
      if (bytes > limits.state) fail('local state capacity exceeded');
    }
  }

  function validate(state) {
    shape(state, ['device', 'confirmed', 'pending', 'flight', 'nextSeq', 'seen']);
    core.validate(state.confirmed);
    if (!deviceId(state.device) || !positive(state.nextSeq)
      || (state.confirmed.acks[state.device] || 0) >= state.nextSeq) fail('invalid device sequence');
    array(state.pending, limits.intents); array(state.seen, limits.seen);
    if (state.seen.some(item => !id(item)) || new Set(state.seen).size !== state.seen.length) fail('invalid batch history');
    let all = state.pending;
    if (state.flight !== null) {
      const flight = state.flight;
      shape(flight, ['intents', 'seqStart', 'operations', 'outcomes', 'candidateRevision']);
      array(flight.intents, limits.intents); array(flight.operations, limits.intents);
      if (!flight.intents.length || !positive(flight.seqStart)
        || flight.seqStart + flight.intents.length !== state.nextSeq
        || flight.seqStart <= (state.confirmed.acks[state.device] || 0)
        || !(flight.candidateRevision === null || positive(flight.candidateRevision))) fail('invalid flight sequence');
      // Operations/outcomes are predictions only. Rebuild operations from original intents on every attempt.
      if (flight.operations.length && flight.operations.length !== flight.intents.length) fail('invalid flight operations');
      flight.operations.forEach((operation, index) => {
        shape(operation, ['device', 'id', 'seq', 'key', 'baseRevision'], ['value', 'deleted', 'resolves', 'blocked']);
        const intent = flight.intents[index], seq = flight.seqStart + index;
        if (operation.device !== state.device || operation.id !== `${state.device}:${seq}` || operation.seq !== seq
          || operation.key !== intent.key || !(operation.baseRevision === null || positive(operation.baseRevision)))
          fail('invalid staged operation');
        if (own(operation, 'blocked') && operation.blocked !== 'structural-conflict') fail('invalid staged conflict guard');
        const target = own(operation, 'deleted') ? { deleted: operation.deleted } : { deleted: false, value: operation.value };
        field(target);
        if ((own(operation, 'deleted') && own(operation, 'value')) || !equal(target, intent.after)
          || !equal(operation.resolves || [], intent.resolves || [])) fail('staged operation changed intent');
      });
      const outcomeIds = Object.keys(flight.outcomes || {});
      shape(flight.outcomes, [], flight.intents.map(item => item.id));
      for (const outcomeId of outcomeIds) {
        const outcome = flight.outcomes[outcomeId];
        shape(outcome, ['accepted', 'revision', 'after']); field(outcome.after);
        if (typeof outcome.accepted !== 'boolean' || !(outcome.revision === null || positive(outcome.revision))) fail('invalid outcome');
      }
      all = [...flight.intents, ...state.pending];
    }
    if (all.length > limits.intents || new Set(all.map(item => item.id)).size !== all.length) fail('intent capacity or identity conflict');
    for (const item of all) change(item, true);
    bounded(state);
    return true;
  }

  function initialize(document, device) {
    core.validate(document);
    const state = { device, confirmed: copy(document), pending: [], flight: null,
      nextSeq: (document.acks[device] || 0) + 1, seen: [] };
    validate(state);
    return state;
  }

  function ingest(original, batch) {
    validate(original);
    shape(batch, ['id', 'changes']);
    if (!id(batch.id) || batch.id.length > 150) fail('invalid batch identity');
    array(batch.changes, limits.intents);
    for (const item of batch.changes) change(item);
    const state = copy(original);
    if (state.seen.includes(batch.id) || [...(state.flight?.intents || []), ...state.pending]
      .some(item => item.batchId === batch.id)) return state;
    if (state.seen.length >= limits.seen) fail('batch history capacity exceeded; journal retained');
    state.seen.push(batch.id);
    batch.changes.forEach((item, index) => {
      const pending = state.pending;
      const previous = [...(state.flight?.intents || []), ...pending].reverse().find(candidate => candidate.key === item.key);
      const linked = previous && equal(previous.after, item.before);
      if (linked && pending.includes(previous) && !own(previous, 'resolves') && !own(item, 'resolves')) {
        previous.after = copy(item.after);
      } else {
        const intent = { id: `${batch.id}:${index}`, batchId: batch.id, ...copy(item) };
        if (linked) intent.dependsOn = previous.id;
        pending.push(intent);
      }
    });
    validate(state);
    return state;
  }

  function remoteCheck(state, remote) {
    core.validate(remote);
    if (remote.syncId !== state.confirmed.syncId) fail('remote sync identity changed');
    if (remote.revision < state.confirmed.revision || (remote.revision === state.confirmed.revision
      && !equal(remote, state.confirmed))) fail('remote document rolled back or forked');
    for (const [device, seq] of Object.entries(state.confirmed.acks))
      if (!(remote.acks[device] >= seq)) fail('remote acknowledgement regressed');
    for (const [key, value] of Object.entries(state.confirmed.fields)) {
      const next = remote.fields[key];
      if (!next || next.revision < value.revision || (next.revision === value.revision && !equal(next, value)))
        fail('remote field history regressed');
    }
    if ((remote.acks[state.device] || 0) >= state.nextSeq) fail('device identity is in use by another writer');
  }

  function accept(original, remote) {
    validate(original); remoteCheck(original, remote);
    const state = copy(original), flight = state.flight;
    if (flight) {
      const ack = remote.acks[state.device] || 0;
      const count = Math.max(0, Math.min(flight.intents.length, ack - flight.seqStart + 1));
      const completed = flight.intents.slice(0, count);
      for (const intent of [...flight.intents.slice(count), ...state.pending]) {
        const predecessor = completed.find(item => item.id === intent.dependsOn);
        if (!predecessor) continue;
        const outcome = flight.outcomes[predecessor.id], current = remote.fields[predecessor.key];
        const seq = flight.seqStart + flight.intents.indexOf(predecessor);
        if (outcome?.accepted && !own(remote.conflicts, `${state.device}:${seq}`) && current
          && current.revision === outcome.revision && equal(outcome.after, predecessor.after)
          && equal(predecessor.after, intent.before)
          && equal({ deleted: current.deleted, ...(!current.deleted ? { value: current.value } : {}) }, outcome.after))
          intent.baseRevision = outcome.revision;
        // Unknown historical outcomes retain their captured base; never guess through an ABA or resolved conflict.
        delete intent.dependsOn;
      }
      if (count === flight.intents.length) state.flight = null;
      else if (count) {
        flight.intents = flight.intents.slice(count);
        flight.seqStart += count;
        flight.operations = [];
        flight.outcomes = {};
        flight.candidateRevision = null;
      }
    }
    state.confirmed = copy(remote);
    validate(state);
    return state;
  }

  function prepare(original, remote, conflictKeys) {
    if (conflictKeys !== undefined && typeof conflictKeys !== 'function') fail('invalid conflict selector');
    const state = accept(original, remote);
    if (!state.flight && state.pending.length) {
      if (!Number.isSafeInteger(state.nextSeq + state.pending.length)) fail('device sequence exhausted');
      state.flight = { intents: state.pending, seqStart: state.nextSeq, operations: [], outcomes: {}, candidateRevision: null };
      state.nextSeq += state.pending.length;
      state.pending = [];
    }
    let document;
    const blocked = new Set();
    // Each pass either returns a validated candidate or blocks at least one additional local key.
    for (;;) {
      document = copy(remote);
      const operations = [], outcomes = {}, flight = state.flight;
      if (flight) {
        flight.intents.forEach((intent, index) => {
          const previous = intent.dependsOn && outcomes[intent.dependsOn];
          const baseRevision = previous?.accepted && equal(intent.before, previous.after) ? previous.revision : intent.baseRevision;
          const seq = flight.seqStart + index;
          const operation = { device: state.device, id: `${state.device}:${seq}`, seq, key: intent.key, baseRevision,
            ...(intent.after.deleted ? { deleted: true } : { value: copy(intent.after.value) }),
            ...(own(intent, 'resolves') ? { resolves: copy(intent.resolves) } : {}),
            ...(blocked.has(intent.key) ? { blocked: 'structural-conflict' } : {}) };
          document = core.merge(document, [operation]).document;
          operations.push(operation);
          outcomes[intent.id] = { accepted: !own(document.conflicts, operation.id),
            revision: document.fields[intent.key]?.revision ?? null, after: copy(intent.after) };
        });
        flight.operations = operations;
        flight.outcomes = outcomes;
        flight.candidateRevision = document.revision;
      }
      if (!conflictKeys) break;
      const keys = conflictKeys(copy(document), copy(remote), copy(operations));
      array(keys, limits.intents);
      if (!keys.length) break;
      if (new Set(keys).size !== keys.length || keys.some(key => typeof key !== 'string'
        || !operations.some(operation => operation.key === key))) fail('conflict selector named an unknown or duplicate local key');
      const added = keys.filter(key => !blocked.has(key));
      if (!added.length) fail('structural conflict cannot be resolved without discarding remote data');
      for (const key of added) blocked.add(key);
    }
    validate(state);
    return { state, document, operations: copy(state.flight?.operations || []) };
  }

  function repairIdentity(original, device) {
    validate(original);
    if (!deviceId(device) || device === original.device || own(original.confirmed.acks, device))
      fail('repair requires a fresh device identity');
    const state = copy(original);
    state.device = device;
    // A cloned flight's acknowledgements/outcomes cannot identify which browser wrote it.
    // Retain every intent, but require review instead of borrowing that causal authority.
    state.pending = [...(state.flight?.intents || []), ...state.pending].map(intent => {
      const retained = { ...intent, baseRevision: null };
      delete retained.dependsOn;
      delete retained.resolves;
      return retained;
    });
    state.flight = null;
    state.nextSeq = 1;
    validate(state);
    return state;
  }

  function view(state) {
    validate(state);
    const map = core.values(state.confirmed);
    for (const intent of [...(state.flight?.intents || []), ...state.pending]) {
      if (intent.after.deleted) delete map[intent.key];
      else map[intent.key] = copy(intent.after.value);
    }
    return map;
  }

  return Object.freeze({ initialize, ingest, prepare, accept, repairIdentity, view, validate, limits });
}
