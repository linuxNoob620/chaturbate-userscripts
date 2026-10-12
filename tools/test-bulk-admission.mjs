import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const section = (a, b) => { const x = source.indexOf(a), y = source.indexOf(b, x + a.length); assert(x >= 0 && y > x); return source.slice(x, y); };
function fixture() {
  const rooms = new Set(), jobs = [], admitted = [], notices = []; let failSave = false, active = 0, peak = 0;
  const c = vm.createContext({ Promise, Set, Math, normalizeUsername: s => String(s).trim().toLowerCase(), isLikelyUsername: s => /^[a-z0-9_]+$/.test(s),
    clampInt: (n, lo, hi, fallback) => Math.max(lo, Math.min(hi, n ?? fallback)), hasHealthyPlayback: () => false, hasFreshContext: () => false,
    document: { hidden: false }, workshopPageSuspended: false, findRoomAny: id => rooms.has(id), toast: s => notices.push(s),
    probe: id => { admitted.push(id); active++; peak = Math.max(peak, active); return new Promise(resolve => jobs.push(() => { active--; resolve({ id, status: 'online' }); })); },
    store: { addRooms(ids) { if (failSave) throw Error('saving failed'); ids.forEach(id => rooms.add(id)); return { newIds: ids, added: ids.length, exists: 0 }; } }, setTimeout });
  vm.runInContext(section('    async function refreshMany(', '    function refreshAll('), c);
  c.service = { refreshMany: c.refreshMany };
  vm.runInContext(section('    let bulkRoomRefreshTail =', '    function openManualImportPrompt('), c);
  return { c, rooms, jobs, admitted, notices, get peak() { return peak; }, fail() { failSave = true; }, async tick() { for (let n = 0; n < 8; n++) await Promise.resolve(); }, async finish() { for (let n = 0; n < 100; n++) { await this.tick(); if (!jobs.length) return; jobs.splice(0).forEach(fn => fn()); } throw Error('unbounded queue'); } };
}
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
await check('overlapping imports share one four-worker bulk admission', async () => {
  const f = fixture(); f.c.importUsernameList(Array.from({ length: 20 }, (_, i) => `one_${i}`)); f.c.importUsernameList(['two_a', 'two_b']);
  await f.tick(); assert.equal(f.admitted.length, 4); assert(!f.admitted.includes('two_a'));
  await f.finish(); assert.equal(f.admitted.length, 22); assert.equal(f.peak, 4);
});
await check('failed persistence dispatches no status work', async () => { const f = fixture(); f.fail(); assert.throws(() => f.c.importUsernameList(['x']), /saving failed/); await f.tick(); assert.equal(f.admitted.length, 0); });
await check('hidden owner stops queued admission after active work settles', async () => { const f = fixture(); f.c.importUsernameList(Array.from({ length: 20 }, (_, i) => `room_${i}`)); await f.tick(); f.c.document.hidden = true; await f.finish(); assert.equal(f.admitted.length, 4); });
await check('removed rooms are not dispatched by a later queued batch', async () => { const f = fixture(); f.c.importUsernameList(['one']); f.c.importUsernameList(['two']); await f.tick(); f.rooms.delete('two'); await f.finish(); assert.deepEqual(f.admitted, ['one']); });
console.log(`${passed} bulk admission checks passed; synthetic request transport, actual batch worker code.`);
