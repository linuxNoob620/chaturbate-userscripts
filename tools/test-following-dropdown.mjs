import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  async function loadFollowingApiRooms(');
const end = source.indexOf('  function createFollowingDropdownSync(', start);
const calls = [];
const context = vm.createContext({
  normalizeUsername: value => String(value || '').toLowerCase(),
  isLikelyUsername: value => /^[a-z][a-z0-9_]+$/.test(value),
  fetch: async (url, options) => {
    calls.push({ url, options });
    const offset = Number(new URL(url, 'https://chaturbate.com').searchParams.get('offset'));
    return { ok: true, json: async () => ({ total_count: 91,
      rooms: Array.from({ length: offset ? 1 : 90 }, (_, i) => ({ username: `room_${offset + i}`,
        current_show: offset ? 'private' : 'public', num_users: i, start_timestamp: 1000 + offset + i })) }) };
  },
});
const load = vm.runInContext(`${source.slice(start, end)}; loadFollowingApiRooms`, context);
const signal = new AbortController().signal;
const rooms = await load(signal);
assert.equal(rooms.length, 91);
assert.equal(calls.length, 2);
assert.equal(calls[0].options.signal, signal);
assert.equal(calls[0].options.credentials, 'include');
assert.equal(rooms[90].lastStatus, 'private');
assert.equal(rooms[90].onlineSince, 1090);
const comparator = source.match(/rooms\.slice\(\)\.sort\((\(a, b\) => b\.onlineSince[^\n]+)\)\) \{/)[1];
const sorted = rooms.slice().sort(vm.runInContext(comparator, context));
assert.equal(sorted[0].id, 'room_90');
assert.equal(rooms[0].id, 'room_0', 'sorting must not mutate shared data');
context.fetch = async () => ({ ok: false, status: 429 });
await assert.rejects(load(signal), /429/);
context.fetch = async () => ({ ok: true, json: async () => ({ rooms: [], total_count: 10 }) });
await assert.rejects(load(signal), /Incomplete/);
assert(source.includes('session.observer?.disconnect()'));
assert(source.includes('service.stop(id); video.remove()'));
assert(source.includes("document.addEventListener('visibilitychange', sync)"));
assert(source.includes('recordHistory: false'));
assert(source.includes("root: container.closest('.FollowedDropdown')"));
assert(source.includes('session.videos.size >= 8'));
assert(!source.includes('ONLINE_FOLLOWING_GROUP_ID'));
assert(!source.includes('syncOnlineFollowing'));
assert(!source.includes('ziggy_online_following_cache'));
assert(!source.includes('ziggy-following-sync-frame'));
console.log('Following pagination, status, timestamp sorting, failure and lifecycle guards passed.');
