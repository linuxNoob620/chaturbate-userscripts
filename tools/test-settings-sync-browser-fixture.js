// Run in a real secure browser origin with the production storage factory in scope.
async function settingsSyncBrowserFixture(createStorage) {
  const name = 'ziggy-suite-sync-disposable-test-' + crypto.randomUUID();
  const first = createStorage({ indexedDB, name }), second = createStorage({ indexedDB, name });
  const checks = [];
  const check = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  try {
    check(await first.read('disposable') === null, 'new database is empty');
    await Promise.all(Array.from({ length: 40 }, (_, index) => (index % 2 ? first : second).update('disposable', state => ({ state: { count: (state?.count || 0) + 1 } }))));
    check((await first.read('disposable')).count === 40, 'two real IDB connections serialize 40 concurrent updates');
    try { await first.update('disposable', state => { state.count = 999; throw new Error('intentional rollback'); }); } catch (error) { if (!error.message.includes('intentional')) throw error; }
    check((await second.read('disposable')).count === 40, 'failed mutation rolls back in native IndexedDB');
    let active = 0, max = 0;
    await Promise.all(Array.from({ length: 8 }, () => navigator.locks.request(name, async () => { max = Math.max(max, ++active); await Promise.resolve(); active--; })));
    check(max === 1, 'native Web Locks serialize workers');
    await first.close(); await second.close();
    const reopened = createStorage({ indexedDB, name });
    check((await reopened.read('disposable')).count === 40, 'state survives close and reopen');
    await reopened.close();
    return { checks, cleaned: true };
  } finally {
    await first.close(); await second.close();
    await new Promise((resolve, reject) => { const request = indexedDB.deleteDatabase(name); request.onsuccess = resolve; request.onerror = () => reject(request.error); request.onblocked = () => reject(new Error('fixture cleanup blocked')); });
  }
}
