// I/O coordinator. Canonical state/outbox are transactional; legacy stores are replayable projections.
function createSettingsSyncController(deps) {
  'use strict';
  const { core, client, codec, vault, storage, locks, capture, apply, account,
    credentials, readRemote, writeRemote, readLegacy, notify, randomId } = deps;
  const CONFIG = 'ziggy_suite_sync_v2_config';
  const MIRROR = 'ziggy_suite_sync_v2_view';
  const JOURNAL = 'ziggy_suite_sync_v2_wal_';
  const BACKUP = 'ziggy_suite_sync_v2_enrollment_backup';
  const now = deps.now || Date.now;
  const writer = randomId();
  let sequence = 0;
  let projecting = false;
  let timer = null;
  let disposed = false;
  let lastStatus = '';
  const same = (a, b) => core.diff({ v: a }, { v: b }).length === 0;
  const value = (map, key) => Object.hasOwn(map, key) ? { deleted: false, value: map[key] } : { deleted: true };
  const parse = key => {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  };
  const config = () => parse(CONFIG);
  const enabled = () => config()?.enabled === true;
  const enrolled = () => !!config()?.account;
  function identity() {
    const saved = config();
    if (!saved?.enabled) throw new Error('Automatic sync is not enabled on this browser.');
    if (!saved.account || account() !== saved.account) throw new Error('Sync paused: sign in to the account used during setup.');
    if (!locks?.request) throw new Error('Sync paused: this browser does not provide safe cross-tab locking.');
    return saved;
  }
  function report(message, persistent = false) {
    if (lastStatus === message) return;
    lastStatus = message;
    notify(message, persistent);
  }
  function journalEntries(owner) {
    const entries = [];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key?.startsWith(JOURNAL)) continue;
      const item = parse(key);
      if (item?.account === owner) entries.push({ key, item });
    }
    if (entries.length > 512) throw new Error('Sync queue is full. Pending changes are preserved; open sync settings.');
    // Order known predecessors first, including another tab's edit. UUID order and clocks
    // cannot describe a user observing and then reversing a change in a different tab.
    const remaining = entries.sort((a, b) => a.item.writer.localeCompare(b.item.writer) || a.item.sequence - b.item.sequence);
    const ordered = [];
    while (remaining.length) {
      const ids = new Set(remaining.map(entry => entry.item.id));
      const index = remaining.findIndex(entry => !(entry.item.parents || []).some(id => ids.has(id)));
      if (index < 0) throw new Error('Sync journal ordering is invalid. Queued changes are retained for recovery.');
      ordered.push(...remaining.splice(index, 1));
    }
    return ordered;
  }
  function queue(changes, owner) {
    if (!changes.length) return null;
    const id = randomId();
    const key = JOURNAL + id;
    const item = { id, account: owner, writer, sequence: ++sequence, changes };
    // Write-ahead, synchronous: closing the page immediately after Save cannot lose the intent.
    const existing = journalEntries(owner);
    const ancestors = new Set(existing.flatMap(entry => entry.item.parents || []));
    item.parents = existing.filter(entry => !ancestors.has(entry.item.id)).map(entry => entry.item.id);
    const queued = existing.reduce((sum, entry) => sum + entry.item.changes.length, 0);
    if (existing.length >= 512 || changes.length + queued > 512)
      throw new Error('Sync queue capacity reached. This edit was not queued; sync existing changes before retrying.');
    storage.setItem(key, JSON.stringify(item));
    return key;
  }
  function beforeWrite(key, nextRaw) {
    if (projecting || !enabled() || !codec.storageKeys.includes(key)) return null;
    if (storage.getItem(key) === nextRaw) return null;
    const before = capture();
    const after = codec.withStorageValue(before, key, nextRaw);
    const from = codec.capture(before), to = codec.capture(after);
    const delta = core.diff(from, to);
    if (!delta.length) return null;
    const saved = identity();
    const mirror = parse(MIRROR);
    if (!mirror || mirror.account !== saved.account || mirror.document.syncId !== saved.syncId)
      throw new Error('Sync is starting. Your existing settings are safe; retry this edit shortly.');
    core.validate(mirror.document);
    const changes = delta.map(change => ({
      key: change.key, before: value(from, change.key), after: value(to, change.key),
      baseRevision: mirror.document.fields[change.key]?.revision ?? null,
    }));
    return queue(changes, saved.account);
  }
  function afterWrite(key, succeeded) {
    if (!key) return;
    if (!succeeded) { storage.removeItem(key); return; }
    schedule(3000);
  }
  async function ingest(owner) {
    const entries = journalEntries(owner);
    if (!entries.length) return (await vault.read(owner));
    const consumed = [];
    const result = await vault.update(owner, state => {
      if (!state) throw new Error('Sync journal has no enrolled base; recovery is required.');
      for (const { key, item } of entries) {
        const active = [...(state.client.flight?.intents || []), ...state.client.pending];
        const replay = state.client.seen.includes(item.id) || active.some(intent => intent.batchId === item.id);
        // Keep excess WAL intact while the earlier canonical batch drains. Never let a full
        // offline backlog prevent the request that can acknowledge and release it.
        if (!replay && active.length + item.changes.length > 512) break;
        state.client = client.ingest(state.client, { id: item.id, changes: item.changes });
        consumed.push(key);
      }
      return { state };
    });
    // Canonical commit completed before removal. Failure here is replay-safe through batch identities.
    for (const key of consumed) storage.removeItem(key);
    return result.state;
  }
  async function project(owner) {
    const state = await ingest(owner);
    if (identity().account !== owner) throw new Error('Account changed; settings projection cancelled.');
    if (!state) throw new Error('Sync state is missing. Re-enroll without discarding your local settings.');
    const fields = client.view(state.client);
    const deferred = journalEntries(owner).flatMap(entry => entry.item.changes);
    // Un-ingested edits are still the user's current view, not permission to restore an
    // older canonical value while uploading a full batch.
    for (const change of deferred) {
      if (change.after.deleted) delete fields[change.key];
      else fields[change.key] = change.after.value;
    }
    codec.validate(fields);
    try { codec.validateReferences(fields); }
    catch (_) {
      report('Sync is checking overlapping group changes. Existing local settings are retained until the structural conflict is resolved.', true);
      return state; // Let the merge classify it; never sanitize away an orphan membership.
    }
    const currentMap = codec.capture(capture());
    const mirror = parse(MIRROR);
    if (mirror?.map && mirror.account === owner) {
      const active = [...(state.client.flight?.intents || []), ...state.client.pending, ...deferred];
      for (const change of core.diff(mirror.map, currentMap)) {
        const current = value(currentMap, change.key);
        if (same(current, value(fields, change.key)) || active.some(intent => intent.key === change.key && same(intent.after, current))) continue;
        throw new Error('Sync paused: untracked local settings changes were found, possibly from an older open tab. Both local and cloud data are kept. Reload old Suite tabs and review before syncing.');
      }
    }
    projecting = true;
    try {
      apply(codec.apply(capture(), fields));
      storage.setItem(MIRROR, JSON.stringify({ account: owner, document: state.client.confirmed, map: codec.capture(capture()) }));
    } finally { projecting = false; }
    // Only the exclusive lock holder reads/removes WAL entries; discarded seen IDs cannot race a stale reader.
    const remaining = new Set(journalEntries(owner).map(entry => entry.item.id));
    await vault.update(owner, current => {
      current.client.seen = current.client.seen.filter(id => remaining.has(id));
      return { state: current };
    });
    return state;
  }
  function rebaseDeferred(owner, local, remote) {
    const flight = local.flight;
    if (!flight) return;
    const active = [...flight.intents, ...local.pending];
    for (const { key, item } of journalEntries(owner)) {
      let changed = false;
      for (const change of item.changes) {
        const previous = [...active].reverse().find(intent => intent.key === change.key);
        const index = previous ? flight.intents.indexOf(previous) : -1;
        if (index < 0) continue;
        const outcome = flight.outcomes[previous.id], field = remote.fields[change.key];
        const seq = flight.seqStart + index;
        // Proof is this exact acknowledged flight outcome/revision, not coincidental equal
        // values. An intervening device edit/ABA/conflict must still require review.
        if (outcome?.accepted && (remote.acks[local.device] || 0) >= seq && !remote.conflicts[`${local.device}:${seq}`]
          && field?.revision === outcome.revision && same(value(core.values(remote), change.key), outcome.after)
          && same(previous.after, change.before) && same(outcome.after, previous.after)
          && change.baseRevision === (local.confirmed.fields[change.key]?.revision ?? null)) {
          change.baseRevision = outcome.revision; changed = true;
        }
      }
      if (changed) storage.setItem(key, JSON.stringify(item));
    }
  }
  function checkRemote(state, remote, saved) {
    if (!remote || remote.account !== saved.account || remote.document.syncId !== saved.syncId)
      throw new Error('Cloud sync identity changed or is missing. No settings were replaced.');
    core.validate(remote.document);
    codec.validateReferences(core.values(remote.document));
    if (remote.document.revision < state.client.confirmed.revision)
      throw new Error('Cloud sync revision moved backwards. Automatic replacement was stopped.');
  }
  async function run({ force = false } = {}) {
    if (!enabled() || disposed) return false;
    deps.flush?.();
    const saved = identity();
    return locks.request(`ziggy-suite-sync-v2:${saved.account}`, { ifAvailable: true }, async lock => {
      if (!lock) return false;
      let state = await project(saved.account);
      if (!force && now() < (state.retryAt || 0)) return false;
      const hasWork = state.client.pending.length || state.client.flight;
      if (!force && !hasWork && now() - (state.checkedAt || 0) < 25000) return false;
      const auth = credentials();
      if (!auth.token || auth.passphrase?.length < 8) throw new Error('Sync paused: save the GitHub token and encryption passphrase on this device.');
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          identity();
          const remote = await readRemote(auth, state.etag || '', state);
          checkRemote(state, remote, saved);
          identity();
          state = await ingest(saved.account);
          rebaseDeferred(saved.account, state.client, remote.document);
          const prepared = client.prepare(state.client, remote.document, (candidate, base, operations) =>
            codec.structuralConflictKeys(core.values(candidate), core.values(base), operations));
          codec.validateReferences(core.values(prepared.document));
          state = (await vault.update(saved.account, current => {
            current.client = prepared.state;
            current.sha = remote.sha;
            current.etag = remote.etag || '';
            return { state: current };
          })).state;
          if (prepared.operations.length) {
            report('Syncing settings…', true);
            identity();
            const result = await writeRemote(auth, { account: saved.account, document: prepared.document }, remote.sha);
            if (result.conflict) { state.etag = ''; await new Promise(resolve => setTimeout(resolve, 1000)); continue; }
            identity();
            // Edits made during encryption/upload join while the flight's causal outcomes still exist.
            state = await ingest(saved.account);
            rebaseDeferred(saved.account, state.client, prepared.document);
            state = (await vault.update(saved.account, current => {
              current.client = client.accept(current.client, prepared.document);
              current.sha = result.sha; current.etag = '';
              current.checkedAt = now(); current.retryAt = 0; current.failures = 0;
              return { state: current };
            })).state;
          } else {
            state = (await vault.update(saved.account, current => {
              current.client = client.accept(current.client, remote.document);
              current.checkedAt = now(); current.retryAt = 0; current.failures = 0;
              return { state: current };
            })).state;
          }
          state = await project(saved.account);
          const conflicts = Object.keys(state.client.confirmed.conflicts).length;
          const pending = state.client.pending.length || state.client.flight || journalEntries(saved.account).length;
          if (conflicts) report(`Settings sync needs review: ${conflicts} conflicting change(s). Both versions are kept. Open GitHub cloud settings.`, true);
          else if (pending) { report('Uploaded earlier changes. Newer changes are queued.'); schedule(3000); }
          else if (prepared.operations.length) report('Settings synced to GitHub.');
          return true;
        }
        throw new Error('Other devices are updating settings. Your changes remain queued for retry.');
      } catch (error) {
        await vault.update(saved.account, current => {
          current.failures = Math.min(8, (current.failures || 0) + 1);
          current.retryAt = now() + Math.max(error.retryMs || 0, Math.min(15 * 60000, 15000 * 2 ** (current.failures - 1)));
          return { state: current };
        });
        throw error;
      }
    });
  }
  function schedule(delay = 0) {
    if (disposed || !enabled()) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      run().catch(error => report(error.message || 'Sync paused. Local changes are retained.', true));
    }, delay);
  }
  async function enrollmentPreview() {
    if (!locks?.request) throw new Error('Safe automatic sync requires Web Locks in this browser.');
    const owner = account();
    if (!owner) throw new Error('Wait for your signed-in account to load before enabling sync.');
    const auth = credentials();
    if (!auth.token || auth.passphrase?.length < 8 || !auth.rememberPassphrase)
      throw new Error('Save a token and remember the encryption passphrase for unattended sync.');
    const payload = capture(), map = codec.capture(payload);
    const remote = await readRemote(auth);
    let document = remote?.document;
    if (remote && remote.account !== owner) throw new Error('The cloud sync file belongs to a different account.');
    if (!document) {
      // Start from the existing recoverable cloud backup, never from an unreviewed empty default.
      const legacy = await readLegacy(auth);
      document = core.seed(codec.capture(legacy), randomId());
    }
    core.validate(document); codec.validateReferences(core.values(document));
    return { owner, payload, map, document, sha: remote?.sha || '',
      differences: core.diff(core.values(document), map).length };
  }
  async function enroll(preview) {
    const owner = preview.owner;
    return locks.request(`ziggy-suite-sync-v2:${owner}`, async () => {
      if (account() !== owner || !same(codec.capture(capture()), preview.map))
        throw new Error('Local settings/account changed during setup. Review again.');
      if (enabled()) throw new Error('This browser is already enrolled. Use Sync now or review conflicts.');
      const existing = await vault.read(owner);
      if (account() !== owner) throw new Error('Account changed during setup.');
      if (existing) throw new Error('A previous sync queue exists. Resume it instead of replacing it.');
      storage.setItem(BACKUP, JSON.stringify({ account: owner, savedAt: now(), payload: preview.payload }));
      let local = client.initialize(preview.document, randomId());
      const remoteMap = core.values(preview.document);
      const changes = Object.keys(preview.map).filter(key => !Object.hasOwn(remoteMap, key) || !same(remoteMap[key], preview.map[key])).map(key => ({
        key, before: value(remoteMap, key), after: value(preview.map, key),
        // Differing existing fields are conflicts, not silently chosen by setup order.
        baseRevision: null,
      }));
      if (changes.length) local = client.ingest(local, { id: randomId(), changes });
      const auth = credentials();
      const latest = await readRemote(auth);
      if (account() !== owner) throw new Error('Account changed during setup.');
      if ((latest?.sha || '') !== preview.sha) throw new Error('Cloud settings changed during setup. Review again.');
      if (!latest) {
        const created = await writeRemote(auth, { account: owner, document: preview.document }, '');
        if (created.conflict) throw new Error('Another device initialized sync. Review the new cloud state.');
      }
      if (account() !== owner) throw new Error('Account changed during setup. Cloud state was preserved; setup remains disabled.');
      storage.setItem(CONFIG, JSON.stringify({ enabled: false, enrolling: true, account: owner, syncId: preview.document.syncId }));
      await vault.update(owner, old => {
        if (old) throw new Error('An existing queue cannot be overwritten.');
        return { state: { client: local, sha: '', etag: '', checkedAt: 0, retryAt: 0, failures: 0 } };
      });
      if (account() !== owner) throw new Error('Account changed during setup. Local enrollment was retained but not activated.');
      storage.setItem(CONFIG, JSON.stringify({ enabled: true, account: owner, syncId: preview.document.syncId }));
      await project(owner);
      schedule();
    });
  }
  async function status() {
    const saved = config();
    const state = saved?.account ? await vault.read(saved.account) : null;
    return { enabled: !!saved?.enabled, account: saved?.account || '',
      queued: (state?.client.pending.length || 0) + (state?.client.flight?.intents?.length || 0)
        + (saved?.account ? journalEntries(saved.account).reduce((sum, entry) => sum + entry.item.changes.length, 0) : 0),
      conflicts: state?.client.confirmed.conflicts || {}, document: state?.client.confirmed || null };
  }
  function resolveConflict(key, revision, ids, chosen) {
    const saved = identity();
    const mirror = parse(MIRROR);
    revision = revision ?? null;
    if ((mirror?.document.fields[key]?.revision ?? null) !== revision) throw new Error('This setting changed again. Refresh the conflict list.');
    queue([{ key, before: value(core.values(mirror.document), key), after: chosen,
      baseRevision: revision, resolves: ids }], saved.account);
    schedule();
  }
  function pause() {
    const saved = config();
    if (saved) storage.setItem(CONFIG, JSON.stringify({ ...saved, enabled: false }));
    clearTimeout(timer); timer = null;
  }
  async function resume({ reviewedMap = null } = {}) {
    const saved = config();
    if (!saved || account() !== saved.account || !locks?.request) throw new Error('No matching enrolled state to resume.');
    return locks.request(`ziggy-suite-sync-v2:${saved.account}`, async () => {
      const state = await vault.read(saved.account);
      if (!state || account() !== saved.account) throw new Error('No matching enrolled state to resume.');
      const local = codec.capture(capture()), mirror = parse(MIRROR);
      const expected = saved.enrolling ? codec.capture(parse(BACKUP)?.payload) : mirror?.map;
      if (!expected) throw new Error('The local review baseline is missing. Settings are retained; restore/review the enrollment backup before resuming.');
      const delta = core.diff(expected, local);
      if (delta.length && (!reviewedMap || !same(local, reviewedMap))) {
        const error = new Error(`Review ${delta.length} local change(s), including ${delta.filter(change => change.deleted).length} deletion(s), before resuming.`);
        error.reviewedMap = local;
        throw error;
      }
      if (delta.length) {
        storage.setItem(BACKUP + '_resume', JSON.stringify({ account: saved.account, savedAt: now(), payload: capture() }));
        const document = mirror?.document || state.client.confirmed;
        queue(delta.map(change => ({ key: change.key, before: value(expected, change.key), after: value(local, change.key),
          baseRevision: document.fields[change.key]?.revision ?? null })), saved.account);
      }
      storage.setItem(CONFIG, JSON.stringify({ ...saved, enrolling: false, enabled: true })); schedule();
    });
  }
  return Object.freeze({ enabled, enrolled, beforeWrite, afterWrite, schedule, run, status, enrollmentPreview, enroll,
    resolveConflict, pause, resume, dispose() { disposed = true; clearTimeout(timer); vault.close(); } });
}
