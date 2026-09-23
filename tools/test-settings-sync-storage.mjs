import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/settings-sync-storage.js', import.meta.url), 'utf8');
const createStorage = new Function(`${source}\nreturn createSettingsSyncStorage;`)();

// Deliberately bounded fake: tests the adapter's request/transaction event
// handling and one-transaction RMW shape, not a browser's IndexedDB engine.
// Readwrite transactions are serialized across all connections to this factory.
function fixture({ openMode = 'normal', holdCommit = false, missingStore = false } = {}) {
  const tasks = [];
  const databases = new Map();
  const connections = [];
  const transactions = [];
  const commits = [];
  const delayedOpens = [];
  let nextFault = null;
  let opens = 0;
  const faultError = new Error('injected storage fault');
  const queue = (task) => tasks.push(task);

  function makeConnection(record) {
    const db = {
      closed: false,
      objectStoreNames: { contains: (name) => record.stores.has(name) },
      createObjectStore(name) { record.stores.add(name); },
      close() { this.closed = true; },
      transaction(name, mode) {
        assert.equal(name, 'vaults');
        if (this.closed) throw new Error('connection closed');
        const fault = nextFault;
        nextFault = null;
        if (fault === 'transaction') throw faultError;
        const pending = [];
        const tx = {
          mode, calls: [], started: false, ended: false, aborting: false,
          objectStore(storeName) {
            assert.equal(storeName, 'vaults');
            return {
              get(key) { return issue('get', key); },
              put(value, key) {
                assert.equal(mode, 'readwrite');
                return issue('put', key, structuredClone(value));
              },
            };
          },
          abort() {
            if (tx.ended || tx.aborting) throw new Error('transaction inactive');
            tx.aborting = true;
            queue(() => finish(false));
          },
        };
        let scheduled = false;
        let working;
        function finish(success) {
          if (tx.ended) return;
          tx.ended = true;
          if (success) {
            if (mode === 'readwrite') record.values = working;
            tx.oncomplete?.({ target: tx });
          } else {
            tx.onabort?.({ target: tx });
          }
          assert.equal(record.waiting.shift(), tx);
          record.waiting[0]?.start();
        }
        function step() {
          scheduled = false;
          if (tx.aborting || tx.ended) return;
          const operation = pending.shift();
          if (operation) {
            const { kind, key, value, request } = operation;
            if (fault === `${kind}Error`) {
              request.error = faultError;
              tx.error = faultError;
              request.onerror?.({ target: request });
              tx.onerror?.({ target: request });
              if (!tx.aborting) tx.abort();
            } else {
              if (kind === 'get') request.result = structuredClone(working.get(key));
              else { working.set(key, value); request.result = key; }
              request.onsuccess?.({ target: request });
            }
            schedule();
            return;
          }
          const complete = () => {
            if (tx.ended || tx.aborting) return;
            if (fault === 'commitAbort') { tx.error = faultError; finish(false); }
            else if (fault === 'transactionError') {
              tx.error = faultError;
              tx.onerror?.({ target: tx });
              if (!tx.aborting) tx.abort();
            } else finish(true);
          };
          if (holdCommit) commits.push(complete);
          else queue(complete);
        }
        function schedule() {
          if (tx.started && !scheduled && !tx.aborting && !tx.ended) {
            scheduled = true;
            queue(step);
          }
        }
        function issue(kind, key, value) {
          if (tx.aborting || tx.ended) throw new Error('transaction inactive');
          tx.calls.push(kind);
          if (fault === `${kind}Throw`) throw faultError;
          const request = {};
          pending.push({ kind, key, value, request });
          schedule();
          return request;
        }
        tx.start = () => {
          tx.started = true;
          working = new Map(Array.from(record.values, ([key, value]) => [key, structuredClone(value)]));
          schedule();
        };
        transactions.push(tx);
        record.waiting.push(tx);
        if (record.waiting.length === 1) tx.start();
        return tx;
      },
    };
    connections.push(db);
    return db;
  }

  const indexedDB = {
    open(name, version) {
      opens += 1;
      assert.equal(version, 1);
      if (openMode === 'throw') throw faultError;
      const request = {};
      const complete = () => {
        let record = databases.get(name);
        const upgrade = !record;
        if (!record) {
          record = { values: new Map(), stores: new Set(), waiting: [] };
          databases.set(name, record);
        }
        request.result = makeConnection(record);
        let aborted = false;
        request.transaction = { abort() { aborted = true; } };
        if (upgrade && !missingStore) request.onupgradeneeded?.({ target: request });
        if (aborted) { request.error = faultError; request.onerror?.({ target: request }); }
        else request.onsuccess?.({ target: request });
      };
      if (openMode === 'blocked') {
        queue(() => request.onblocked?.({ target: request }));
        delayedOpens.push(complete);
      } else if (openMode === 'hang') delayedOpens.push(complete);
      else if (openMode === 'error') queue(() => { request.error = faultError; request.onerror?.({ target: request }); });
      else queue(complete);
      return request;
    },
  };
  return {
    indexedDB, connections, transactions, commits, faultError,
    get opens() { return opens; },
    fault(value) { nextFault = value; },
    releaseOpen() { delayedOpens.splice(0).forEach(queue); },
    releaseCommit() { commits.splice(0).forEach(queue); },
    seed(name, key, value) { databases.get(name).values.set(key, value); },
    async drain() {
      for (let i = 0, idle = 0; i < 10000; i += 1) {
        if (tasks.length) { tasks.shift()(); idle = 0; }
        else idle += 1;
        await Promise.resolve();
        if (idle === 8) return;
      }
      throw new Error('Fake IndexedDB task limit exceeded.');
    },
    async settle(promise) {
      let outcome;
      promise.then((value) => { outcome = { value }; }, (error) => { outcome = { error }; });
      await this.drain();
      assert.ok(outcome, 'operation should settle within the bounded fake task queue');
      if ('error' in outcome) throw outcome.error;
      return outcome.value;
    },
  };
}

let passed = 0;
async function check(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

await check('missing reads are null and one connection is reused', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  assert.equal(await f.settle(storage.read('one')), null);
  assert.equal(await f.settle(storage.read('two')), null);
  assert.equal(f.opens, 1);
  assert.ok(f.transactions.every((tx) => tx.mode === 'readonly' && tx.calls.join() === 'get'));
  await storage.close();
});

await check('canonical state, pending operations and revision commit as one detached record', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  const input = { state: { local: { theme: 'dark' }, pending: [{ id: 'op-1' }], revision: 4 }, result: { id: 'op-1' } };
  const output = await f.settle(storage.update('vault', (current) => { assert.equal(current, null); return input; }));
  assert.deepEqual(output, input);
  assert.equal(f.transactions.length, 1);
  assert.equal(f.transactions[0].mode, 'readwrite');
  assert.deepEqual(f.transactions[0].calls, ['get', 'put']);
  input.state.revision = 9;
  output.state.pending[0].id = 'changed';
  const stored = await f.settle(storage.read('vault'));
  assert.equal(stored.revision, 4);
  assert.equal(stored.pending[0].id, 'op-1');
  stored.local.theme = 'light';
  assert.equal((await f.settle(storage.read('vault'))).local.theme, 'dark');
  await storage.close();
});

await check('read and update promises wait for transaction complete, not request success', async () => {
  const f = fixture({ holdCommit: true });
  const storage = createStorage({ indexedDB: f.indexedDB });
  let updateDone = false;
  const update = storage.update('vault', () => ({ state: { value: 1 } })).then(() => { updateDone = true; });
  await f.drain();
  assert.deepEqual(f.transactions[0].calls, ['get', 'put']);
  assert.equal(updateDone, false);
  f.releaseCommit();
  await f.settle(update);
  let readDone = false;
  const read = storage.read('vault').then(() => { readDone = true; });
  await f.drain();
  assert.equal(readDone, false);
  f.releaseCommit();
  await f.settle(read);
  await storage.close();
});

await check('independent connections perform serializable read-modify-write without lost updates', async () => {
  const f = fixture();
  const first = createStorage({ indexedDB: f.indexedDB });
  const second = createStorage({ indexedDB: f.indexedDB });
  const operations = Array.from({ length: 30 }, (_, index) => (index % 2 ? first : second).update('vault', (state) => ({
    state: { count: (state?.count || 0) + 1, pending: [...(state?.pending || []), index] },
  })));
  await f.settle(Promise.all(operations));
  const state = await f.settle(first.read('vault'));
  assert.equal(state.count, 30);
  assert.equal(new Set(state.pending).size, 30);
  assert.ok(f.transactions.filter((tx) => tx.mode === 'readwrite').every((tx) => tx.calls.join() === 'get,put'));
  await Promise.all([first.close(), second.close()]);
});

await check('different vault keys and database names remain isolated', async () => {
  const f = fixture();
  const first = createStorage({ indexedDB: f.indexedDB, name: 'account-a' });
  const second = createStorage({ indexedDB: f.indexedDB, name: 'account-b' });
  await f.settle(first.update('one', () => ({ state: ['first'] })));
  await f.settle(first.update('two', () => ({ state: { value: 2 } })));
  await f.settle(second.update('one', () => ({ state: false })));
  assert.deepEqual(await f.settle(first.read('one')), ['first']);
  assert.deepEqual(await f.settle(first.read('two')), { value: 2 });
  assert.equal(await f.settle(second.read('one')), false);
  assert.equal(await f.settle(second.read('two')), null);
  await Promise.all([first.close(), second.close()]);
});

for (const fault of ['transaction', 'getThrow', 'getError', 'putThrow', 'putError', 'commitAbort', 'transactionError']) {
  await check(`${fault} propagates and preserves the complete previous record`, async () => {
    const f = fixture();
    const storage = createStorage({ indexedDB: f.indexedDB });
    const old = { value: 'old', pending: ['old-op'], revision: 3 };
    await f.settle(storage.update('vault', () => ({ state: old })));
    f.fault(fault);
    await assert.rejects(f.settle(storage.update('vault', (state) => {
      state.value = 'new'; state.pending.push('new-op'); state.revision = 4;
      return { state };
    })), (error) => error === f.faultError);
    assert.deepEqual(await f.settle(storage.read('vault')), old);
    await storage.close();
  });
}

for (const fault of ['getError', 'commitAbort', 'transactionError']) {
  await check(`readonly ${fault} never reports a successful read`, async () => {
    const f = fixture();
    const storage = createStorage({ indexedDB: f.indexedDB });
    await f.settle(storage.update('vault', () => ({ state: { value: 1 } })));
    f.fault(fault);
    await assert.rejects(f.settle(storage.read('vault')), (error) => error === f.faultError);
    assert.deepEqual(await f.settle(storage.read('vault')), { value: 1 });
    await storage.close();
  });
}

await check('an external transaction abort rejects even when no request failed', async () => {
  const f = fixture({ holdCommit: true });
  const storage = createStorage({ indexedDB: f.indexedDB });
  const pending = storage.update('vault', () => ({ state: { value: 1 } }));
  const rejection = assert.rejects(pending, /transaction aborted/);
  await f.drain();
  f.transactions[0].abort();
  await f.drain();
  await rejection;
  await storage.close();
});

await check('throwing mutator aborts without modifying the current record', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  await f.settle(storage.update('vault', () => ({ state: { value: 1 } })));
  const error = new Error('mutator failure');
  await assert.rejects(f.settle(storage.update('vault', (state) => { state.value = 2; throw error; })), (caught) => caught === error);
  assert.deepEqual(await f.settle(storage.read('vault')), { value: 1 });
  await storage.close();
});

await check('async and rejected-promise mutators are rejected without unhandled rejections', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  await assert.rejects(f.settle(storage.update('vault', async () => ({ state: {} }))), /synchronous/);
  await assert.rejects(f.settle(storage.update('vault', async () => { throw new Error('async failure'); })), /synchronous/);
  assert.equal(await f.settle(storage.read('vault')), null);
  await new Promise((resolve) => setImmediate(resolve));
  await storage.close();
});

await check('keys, non-JSON values, accessor properties and prototype keys fail closed', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  for (const key of [null, undefined, 0, {}, '', '__proto__', 'constructor', 'prototype', 'x'.repeat(1025)]) {
    await assert.rejects(storage.read(key), /Invalid sync storage key/);
    await assert.rejects(storage.update(key, () => ({ state: {} })), /Invalid sync storage key/);
  }
  assert.equal(f.opens, 0);
  await assert.rejects(storage.update('vault', null), /mutator function/);
  const cycle = {}; cycle.self = cycle;
  const accessor = Object.defineProperty({}, 'value', { enumerable: true, get() { throw new Error('getter must not run'); } });
  const invalid = [undefined, NaN, Infinity, 2n, new Date(), () => {}, cycle, accessor, { value: undefined }, new Array(1), JSON.parse('{"__proto__":{"polluted":true}}'), { nested: { constructor: {} } }];
  for (const state of invalid) await assert.rejects(f.settle(storage.update('vault', () => ({ state }))), /JSON|Unsafe|accessor/);
  for (const value of [null, {}, [], { result: 1 }]) await assert.rejects(f.settle(storage.update('vault', () => value)), /must return/);
  assert.equal(await f.settle(storage.read('vault')), null);
  assert.equal({}.polluted, undefined);
  await storage.close();
});

await check('invalid stored data fails reads and prevents mutator invocation', async () => {
  const f = fixture();
  const storage = createStorage({ indexedDB: f.indexedDB });
  await f.settle(storage.read('vault'));
  f.seed('ziggy-suite-sync-v2', 'vault', JSON.parse('{"__proto__":{"polluted":true}}'));
  await assert.rejects(f.settle(storage.read('vault')), /Unsafe/);
  let invoked = false;
  await assert.rejects(f.settle(storage.update('vault', () => { invoked = true; return { state: {} }; })), /Unsafe/);
  assert.equal(invoked, false);
  await storage.close();
});

for (const openMode of ['throw', 'error', 'blocked']) {
  await check(`open ${openMode} rejects, never falls back or silently retries, and closes late connection`, async () => {
    const f = fixture({ openMode });
    const storage = createStorage({ indexedDB: f.indexedDB });
    await assert.rejects(f.settle(storage.read('vault')), /fault|blocked/);
    await assert.rejects(f.settle(storage.read('vault')), /fault|blocked/);
    assert.equal(f.opens, 1);
    f.releaseOpen();
    await f.drain();
    assert.ok(f.connections.every((db) => db.closed));
    await storage.close();
  });
}

await check('unavailable IndexedDB and missing schema reject clearly', async () => {
  const unavailable = createStorage({});
  await assert.rejects(unavailable.read('vault'), /unavailable/);
  await unavailable.close();
  const f = fixture({ missingStore: true });
  const storage = createStorage({ indexedDB: f.indexedDB });
  await assert.rejects(f.settle(storage.read('vault')), /missing its vaults/);
  assert.ok(f.connections[0].closed);
  await storage.close();
});

await check('opening has a bounded 5000ms timeout and cleans late connection', async () => {
  let timeout;
  let delay;
  let cleared = false;
  const withTimer = new Function('setTimeout', 'clearTimeout', `${source}\nreturn createSettingsSyncStorage;`)(
    (fn, ms) => { timeout = fn; delay = ms; return 1; },
    () => { cleared = true; },
  );
  const f = fixture({ openMode: 'hang' });
  const storage = withTimer({ indexedDB: f.indexedDB });
  const pending = storage.read('vault');
  const rejection = assert.rejects(pending, /timed out/);
  assert.equal(delay, 5000);
  timeout();
  await rejection;
  assert.equal(cleared, true);
  f.releaseOpen();
  await f.drain();
  assert.ok(f.connections[0].closed);
  await storage.close();
});

await check('close during pending open is terminal and disposes late connection', async () => {
  const f = fixture({ openMode: 'hang' });
  const storage = createStorage({ indexedDB: f.indexedDB });
  const rejection = assert.rejects(storage.read('vault'), /closed/);
  await storage.close();
  await rejection;
  f.releaseOpen();
  await f.drain();
  assert.ok(f.connections[0].closed);
  await assert.rejects(storage.read('vault'), /closed/);
  await assert.rejects(storage.update('vault', () => ({ state: {} })), /closed/);
});

await check('close waits for admitted transactions and permits their commit', async () => {
  const f = fixture({ holdCommit: true });
  const storage = createStorage({ indexedDB: f.indexedDB });
  const pending = storage.update('vault', () => ({ state: { revision: 1 } }));
  await f.drain();
  let closed = false;
  const closing = storage.close().then(() => { closed = true; });
  await f.drain();
  assert.equal(closed, false);
  assert.ok(f.connections[0].closed);
  f.releaseCommit();
  assert.deepEqual(await f.settle(pending), { state: { revision: 1 } });
  await closing;
  await storage.close();
});

for (const event of ['onversionchange', 'onclose']) {
  await check(`${event} makes the adapter terminal instead of reconnecting silently`, async () => {
    const f = fixture();
    const storage = createStorage({ indexedDB: f.indexedDB });
    await f.settle(storage.read('vault'));
    f.connections[0][event]();
    await assert.rejects(storage.read('vault'), /version changed|closed unexpectedly/);
    assert.equal(f.opens, 1);
    if (event === 'onversionchange') assert.ok(f.connections[0].closed);
    await storage.close();
  });
}

console.log(`Settings sync storage: ${passed} checks passed (bounded IndexedDB fake; native-browser verification is separate).`);
