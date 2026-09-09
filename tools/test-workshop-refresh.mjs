import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const begin = source.indexOf('  function createRoomService(');
const end = source.indexOf('\n  /* ===', begin);
const factory = source.slice(begin, end);

function fixture(ids) {
  const pending = [], events = [], timers = new Map();
  let timerId = 0;
  const store = {
    state: { rooms: ids.map(id => ({ id, lastStatus: 'offline' })), settings: { pollMs: { online: 120000, offline: 60000, private: 60000, error: 1000 } } },
    patchRoom(id, patch) { Object.assign(this.state.rooms.find(r => r.id === id), patch); },
  };
  const globals = {
    store, AbortController, URL, console,
    window: { location: { hostname: 'chaturbate.com' } }, document: { querySelectorAll: () => [] },
    normalizeUsername: x => String(x).toLowerCase(), isLikelyUsername: x => /^[a-z0-9_]+$/.test(x),
    safeChaturbateHost: () => true, isSafeStreamUrl: () => true,
    isStableRoomStatus: x => ['online', 'offline', 'private'].includes(x),
    numeric: (x, fallback) => Number(x) || fallback,
    clampInt: (x, min, max, fallback) => Math.max(min, Math.min(max, Number.isFinite(Number(x)) ? Number(x) : fallback)),
    EventBus: { emit: (name, data) => events.push({ name, data }) },
    addRoomStatusHistory() {}, stopMediaElement() {}, stopAllPageMedia() {},
    setTimeout(fn, ms) { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout(id) { timers.delete(id); },
    fetch(url, options) { return new Promise((resolve, reject) => { const request = { url, signal: options.signal, resolve: data => resolve({ ok: true, json: async () => data }), throttle: () => resolve({ ok: false, status: 429, headers: { get: () => '60' } }) }; options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }); pending.push(request); }); },
  };
  const service = vm.runInNewContext(`${factory}\ncreateRoomService(store)`, globals);
  return { service, pending, events, store, timers };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

{
  const f = fixture(['alpha']);
  const first = f.service.probe('alpha'), shared = f.service.probe('alpha');
  assert.equal(f.pending.length, 1, 'overlapping probes must share one request');
  f.pending[0].resolve({ room_status: 'offline' });
  await Promise.all([first, shared]);
  const next = f.service.probe('alpha');
  assert.equal(f.pending.length, 2, 'later manual checks must still fetch fresh status');
  f.pending[1].resolve({ room_status: 'offline' }); await next;
}
{
  const f = fixture(['alpha']);
  const first = f.service.probe('alpha');
  const forced = f.service.refresh('alpha');
  assert.equal(f.pending[0].signal.aborted, true);
  assert.equal(f.pending.length, 2);
  await first;
  const shared = f.service.probe('alpha');
  assert.equal(f.pending.length, 2, 'old completion must not evict the replacement request');
  f.pending[1].resolve({ room_status: 'offline' }); await Promise.all([forced, shared]);
}
{
  const f = fixture(['alpha']);
  const old = f.service.probe('alpha'); f.service.stop('alpha');
  const next = f.service.probe('alpha');
  assert.equal(f.pending.length, 2, 'stop/restart must not reuse an aborted session');
  f.pending[1].resolve({ room_status: 'offline' }); await Promise.all([old, next]);
}
{
  const ids = ['visible_a', 'visible_b', 'other_a', 'other_b', 'other_c', 'other_d'];
  const f = fixture(ids), progress = [];
  const batch = f.service.refreshMany([...ids, ids[0]], { onProgress: x => progress.push(x.completed) });
  assert.equal(f.pending.length, 4, 'initial batch is bounded to four');
  assert.deepEqual(f.pending.map(r => r.url.split('/').at(-2)), ids.slice(0, 4), 'priority order is preserved');
  f.pending[0].resolve({ room_status: 'offline' }); await settle();
  assert.equal(f.pending.length, 5, 'next request starts without a fixed pacing timer');
  f.pending[1].resolve({ room_status: 'offline' }); await settle();
  assert.equal(f.pending.length, 6);
  for (const r of f.pending.slice(2)) r.resolve({ room_status: 'offline' });
  const results = await batch;
  assert.equal(results.length, ids.length); assert.deepEqual(progress, [1, 2, 3, 4, 5, 6]);
}
{
  const f = fixture(['a', 'b', 'c', 'd', 'e', 'f']);
  const batch = f.service.refreshMany(f.store.state.rooms.map(r => r.id));
  f.pending[0].throttle(); await settle();
  for (const r of f.pending.slice(1)) r.resolve({ room_status: 'offline' });
  const results = await batch;
  assert.equal(f.pending.length, 4, 'shared cooldown must prevent new network requests');
  assert.equal(results.length, 6, 'deferred rooms remain represented in progress/results');
  assert.equal(results.filter(r => r.status === 'throttled').length, 3);
}
{
  const f = fixture(['alpha']);
  const first = f.service.probe('alpha');
  const online = { room_status: 'public', hls_source: 'https://example.com/live.m3u8' };
  f.pending[0].resolve(online); await first;
  const video = { ended: false, src: online.hls_source };
  f.service.attachVideo('alpha', video);
  const before = f.events.filter(e => e.name === 'room:online').length;
  const refresh = f.service.refreshMany(['alpha']); f.pending[1].resolve(online); await refresh;
  assert.equal(f.events.filter(e => e.name === 'room:online').length, before, 'unchanged active stream must not be reattached');
  video.readyState = 4;
  const renewed = f.service.probe('alpha');
  f.pending[2].resolve({ ...online, hls_source: online.hls_source + '?token=renewed' }); await renewed;
  assert.equal(f.events.filter(e => e.name === 'room:online').length, before, 'token renewal must preserve healthy playback');
  const changed = f.service.probe('alpha');
  f.pending[3].resolve({ ...online, hls_source: 'https://example.com/new-broadcast.m3u8?token=renewed' }); await changed;
  assert.equal(f.events.filter(e => e.name === 'room:online').length, before + 1, 'a different stream must reconnect');
  video.error = { code: 3 };
  const broken = f.service.probe('alpha');
  f.pending[4].resolve({ ...online, hls_source: 'https://example.com/new-broadcast.m3u8?token=next' }); await broken;
  assert.equal(f.events.filter(e => e.name === 'room:online').length, before + 2, 'token comparison must not preserve failed playback');
}
console.log('Workshop refresh behavior: sharing, forced replacement, stop/restart, four-worker queue, cooldown, progress, and stream continuity passed.');
