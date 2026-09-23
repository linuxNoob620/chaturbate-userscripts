/**
 * Transactional canonical settings storage; no localStorage/GM fallback.
 * read(key) resolves a detached JSON value, or null for a missing record.
 * update(key, mutate) calls mutate(detachedCurrentOrNull) synchronously. It must
 * return { state: JSONValue, result?: JSONValue }; the same detached envelope is
 * returned only after the single readwrite transaction commits. Store the local
 * state, pending operations and applied revision together inside that state.
 * close() is terminal and waits for already-created transactions to settle.
 */
function createSettingsSyncStorage({ indexedDB, name = 'ziggy-suite-sync-v2' } = {}) {
  const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);
  const active = new Set();
  let connection = null;
  let opening = null;
  let cancelOpen = null;
  let terminalError = null;

  function cloneJSON(value, ancestors = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'object' || ancestors.has(value)) throw new TypeError('Sync storage requires acyclic JSON values.');
    const isArray = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (!isArray && prototype !== Object.prototype && prototype !== null) throw new TypeError('Sync storage requires plain JSON objects.');
    ancestors.add(value);
    const output = isArray ? [] : {};
    const keys = Reflect.ownKeys(value);
    if (isArray && keys.length !== value.length + 1) throw new TypeError('Sync storage requires dense JSON arrays.');
    for (const key of keys) {
      if (isArray && key === 'length') continue;
      if (typeof key !== 'string' || forbiddenKeys.has(key)) throw new TypeError('Unsafe sync storage property.');
      if (isArray && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length)) throw new TypeError('Sync storage requires JSON arrays.');
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) throw new TypeError('Sync storage does not accept accessor or hidden properties.');
      output[key] = cloneJSON(descriptor.value, ancestors);
    }
    ancestors.delete(value);
    return output;
  }

  function validateKey(key) {
    if (typeof key !== 'string' || !key.length || key.length > 1024 || forbiddenKeys.has(key)) throw new TypeError('Invalid sync storage key.');
  }

  function open() {
    if (terminalError) return Promise.reject(terminalError);
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      let settled = false;
      let timer = null;
      const fail = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cancelOpen = null;
        reject(error);
      };
      cancelOpen = fail;
      try {
        if (!indexedDB || typeof indexedDB.open !== 'function') throw new Error('IndexedDB is unavailable; sync storage cannot commit atomically.');
        if (typeof name !== 'string' || !name.length) throw new TypeError('Invalid sync database name.');
        const request = indexedDB.open(name, 1);
        timer = setTimeout(() => fail(new Error('Opening sync storage timed out.')), 5000);
        request.onblocked = () => fail(new Error('Opening sync storage is blocked by another connection.'));
        request.onerror = () => fail(request.error || new Error('Opening sync storage failed.'));
        request.onupgradeneeded = () => {
          if (settled || terminalError) {
            request.transaction.abort();
            request.result.close();
            return;
          }
          try {
            if (!request.result.objectStoreNames.contains('vaults')) request.result.createObjectStore('vaults');
          } catch (error) {
            request.transaction.abort();
            fail(error);
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          if (settled || terminalError) {
            db.close();
            return;
          }
          if (!db.objectStoreNames.contains('vaults')) {
            db.close();
            fail(new Error('Sync storage is missing its vaults object store.'));
            return;
          }
          connection = db;
          db.onversionchange = () => {
            terminalError = new Error('Sync storage version changed; reload before continuing.');
            db.close();
          };
          db.onclose = () => {
            terminalError = terminalError || new Error('Sync storage connection closed unexpectedly.');
          };
          settled = true;
          clearTimeout(timer);
          cancelOpen = null;
          resolve(db);
        };
      } catch (error) {
        fail(error);
      }
    });
    return opening;
  }

  async function transact(key, mutate) {
    validateKey(key);
    if (terminalError) throw terminalError;
    const db = await open();
    if (terminalError) throw terminalError;
    const transaction = db.transaction('vaults', mutate ? 'readwrite' : 'readonly');
    let resolveOperation;
    let rejectOperation;
    const operation = new Promise((resolve, reject) => {
      resolveOperation = resolve;
      rejectOperation = reject;
    });
    active.add(operation);
    let outcome;
    let failure = null;
    let abortRequested = false;
    const finish = (error) => {
      active.delete(operation);
      if (error) rejectOperation(error);
      else resolveOperation(outcome);
    };
    const abort = (error) => {
      failure = failure || error;
      if (abortRequested) return;
      abortRequested = true;
      try { transaction.abort(); } catch (_) { finish(failure); }
    };
    transaction.oncomplete = () => finish(failure);
    transaction.onabort = () => finish(failure || transaction.error || new Error('Sync storage transaction aborted.'));
    transaction.onerror = (event) => abort(event.target.error || transaction.error || new Error('Sync storage transaction failed.'));
    try {
      const store = transaction.objectStore('vaults');
      const request = store.get(key);
      request.onerror = () => abort(request.error || new Error('Reading sync storage failed.'));
      request.onsuccess = () => {
        try {
          const current = request.result === undefined ? null : cloneJSON(request.result);
          if (!mutate) {
            outcome = current;
            return;
          }
          const proposed = mutate(current);
          if (proposed && typeof proposed.then === 'function') {
            Promise.resolve(proposed).catch(() => {});
            throw new TypeError('Sync storage mutators must be synchronous.');
          }
          if (!proposed || Array.isArray(proposed) || !Object.prototype.hasOwnProperty.call(proposed, 'state')) throw new TypeError('Sync storage mutators must return { state, result? }.');
          outcome = cloneJSON(proposed);
          const write = store.put(outcome.state, key);
          write.onerror = () => abort(write.error || new Error('Writing sync storage failed.'));
        } catch (error) {
          abort(error);
        }
      };
    } catch (error) {
      abort(error);
    }
    return operation;
  }

  return {
    read(key) { return transact(key, null); },
    update(key, mutate) {
      if (typeof mutate !== 'function') return Promise.reject(new TypeError('Sync storage requires a mutator function.'));
      return transact(key, mutate);
    },
    async close() {
      terminalError = terminalError || new Error('Sync storage is closed.');
      if (cancelOpen) cancelOpen(terminalError);
      if (connection) connection.close();
      await Promise.allSettled(Array.from(active));
      connection = null;
    },
  };
}
