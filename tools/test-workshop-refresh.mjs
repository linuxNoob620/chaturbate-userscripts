import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const ref = process.argv.find(arg => arg.startsWith('--ref='))?.slice(6);
const source = ref ? execFileSync('git', ['show', `${ref}:Chaturbate MultiCam Pro + Cam ARNA.user.js`], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  : await readFile(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const begin = source.indexOf('  function createRoomService(');
const end = source.indexOf('\n  /* ===', begin);
const factory = source.slice(begin, end);

function fixture(ids) {
  const pending = [], events = [], timers = new Map();
  let timerId = 0;
  let now = Date.now();
  const store = {
    state: { rooms: ids.map(id => ({ id, lastStatus: 'offline' })), settings: { pollMs: { online: 120000, offline: 60000, private: 60000, error: 1000 } } },
    patchRoom(id, patch) { Object.assign(this.state.rooms.find(r => r.id === id), patch); },
  };
  const globals = {
    store, AbortController, URL, console, Date: { now: () => now },
    window: { location: { hostname: 'chaturbate.com' } }, document: { querySelectorAll: () => [] },
    normalizeUsername: x => String(x).toLowerCase(), isLikelyUsername: x => /^[a-z0-9_]+$/.test(x),
    safeChaturbateHost: () => true, isSafeStreamUrl: () => true,
    isStableRoomStatus: x => ['online', 'offline', 'private'].includes(x),
    numeric: (x, fallback) => Number(x) || fallback,
    clampInt: (x, min, max, fallback) => Math.max(min, Math.min(max, Number.isFinite(Number(x)) ? Number(x) : fallback)),
    EventBus: { emit: (name, data) => events.push({ name, data }) },
    addRoomStatusHistory() {}, stopMediaElement() {}, stopAllPageMedia() {},
    setTimeout(fn, ms) { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout(id) { timers.delete(id); },
    fetch(url, options) { return new Promise((resolve, reject) => { const request = { url, signal: options.signal, respond: resolve, fail: () => reject(new Error('network failure')), resolve: data => resolve({ ok: true, json: async () => data }), throttle: () => resolve({ ok: false, status: 429, headers: { get: () => '60' } }) }; options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }); pending.push(request); }); },
  };
  const service = vm.runInNewContext(`${factory}\ncreateRoomService(store)`, globals);
  return { service, pending, events, store, timers, advance: ms => { now += ms; } };
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

{
  const f = fixture(['alpha', 'offline']);
  const check = f.service.probe('alpha');
  f.store.state.rooms[0].privateLabel = 'private';
  f.pending[0].resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
  await check;
  assert.equal(f.store.state.rooms[0].privateLabel, '', 'public clears an obsolete private label');
  const listeners = new Map();
  const video = { currentTime: 1, readyState: 4, paused: false, ended: false, isConnected: true,
    addEventListener(name, fn) { listeners.set(name, fn); },
    removeEventListener(name, fn) { if (listeners.get(name) === fn) listeners.delete(name); } };
  f.service.attachVideo('alpha', video);
  const starting = f.service.refreshMany(['alpha'], { preservePlaying: true });
  f.pending.at(-1).resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
  assert.notEqual((await starting)[0].status, 'playing', 'initial attachment is not proof of playback');
  video.currentTime = 2; listeners.get('timeupdate')();
  const progress = [];
  assert.equal((await f.service.refreshMany(['alpha'], { preservePlaying: true, onProgress: p => progress.push(p.completed) }))[0].status, 'playing');
  assert.deepEqual(progress, [1], 'all-healthy refresh still completes progress');
  const regular = f.service.refreshMany(['alpha']);
  f.pending.at(-1).resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
  assert.notEqual((await regular)[0].status, 'playing', 'ordinary polling still requests status');
  const beforeBatch = f.pending.length;
  const batch = f.service.refreshMany(['alpha', 'offline'], { preservePlaying: true });
  assert.equal(f.pending.length, beforeBatch + 1, 'playing preview does not request status; offline room does');
  assert.match(f.pending.at(-1).url, /\/offline\/$/);
  f.pending.at(-1).resolve({ room_status: 'offline' });
  const result = await batch;
  assert.equal(result[0].status, 'playing');
  f.advance(10001);
  const stalled = f.service.refreshMany(['alpha'], { preservePlaying: true });
  assert.equal(f.pending.length, beforeBatch + 2, 'old playback progress cannot mask a stalled stream');
  f.pending.at(-1).resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
  assert.notEqual((await stalled)[0].status, 'playing');
  video.currentTime = 3; listeners.get('timeupdate')();
  for (const patch of [{ paused: true }, { ended: true }, { readyState: 1 }, { seeking: true }, { error: { code: 3 } }, { isConnected: false }]) {
    const original = Object.fromEntries(Object.keys(patch).map(key => [key, video[key]]));
    Object.assign(video, patch);
    const retry = f.service.refreshMany(['alpha'], { preservePlaying: true });
    f.pending.at(-1).resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
    assert.notEqual((await retry)[0].status, 'playing', 'unhealthy preview is rechecked');
    Object.assign(video, original);
  }
  const forced = f.service.refresh('alpha');
  assert.equal(listeners.size, 0, 'explicit reconnect disposes its playback listener');
  f.pending.at(-1).resolve({ room_status: 'public', hls_source: 'https://example.com/live.m3u8' });
  await forced;
  f.service.attachVideo('alpha', video);
  f.service.attachVideo('alpha', video);
  assert.equal(listeners.size, 1, 'reattachment owns exactly one progress listener');
  f.service.detachVideo('alpha');
  assert.equal(listeners.size, 0, 'playback observer removed with its video');
}
console.log('Smart refresh: healthy playback bypass, failed/paused/detached checks, label reset and listener disposal passed.');

{
  const f = fixture(['offline', 'private']);
  const first = f.service.refreshMany(['offline', 'private'], { reuseFresh: true });
  f.pending[0].resolve({ room_status: 'offline' });
  f.pending[1].resolve({ room_status: 'private' });
  await first;
  const reuse = f.service.refreshMany(['offline', 'private'], { reuseFresh: true });
  assert.equal(f.pending.length, 2, 'smart refresh must not recheck recent successful statuses');
  const reused = await reuse;
  assert.deepEqual(Array.from(reused, r => r.status), ['fresh', 'fresh']);
  assert.deepEqual(Array.from(reused, r => r.roomStatus), ['offline', 'private']);
  const forced = f.service.refreshMany(['offline'], { reuseFresh: true, force: true });
  assert.equal(f.pending.length, 3, 'Check all bypasses recent context reuse');
  f.pending[2].resolve({ room_status: 'offline' }); await forced;
  f.advance(60000);
  const stale = f.service.refreshMany(['offline', 'private'], { reuseFresh: true });
  assert.equal(f.pending.length, 5, 'checks expire at the freshness boundary');
  f.pending[3].resolve({ room_status: 'offline' }); f.pending[4].resolve({ room_status: 'private' }); await stale;
  f.service.stop('private');
  const restart = f.service.refreshMany(['private'], { reuseFresh: true });
  assert.equal(f.pending.length, 6, 'stopped sessions do not leave a retained freshness cache');
  f.pending[5].resolve({ room_status: 'private' }); await restart;
}
{
  const f = fixture(['alpha']);
  const first = f.service.probe('alpha'); f.pending[0].resolve({ room_status: 'offline' }); await first;
  const failed = f.service.probe('alpha'); f.pending[1].fail(); await failed;
  assert.equal(f.store.state.rooms[0].lastStatus, 'offline', 'transient failure preserves stable presentation');
  const retry = f.service.refreshMany(['alpha'], { reuseFresh: true });
  assert.equal(f.pending.length, 3, 'a failed check cannot reuse an earlier stable status');
  f.pending[2].resolve({ room_status: 'offline' }); await retry;
  const invalid = f.service.probe('alpha'); f.pending[3].resolve({ room_status: 'public' }); await invalid;
  const recover = f.service.refreshMany(['alpha'], { reuseFresh: true });
  assert.equal(f.pending.length, 5, 'a body lacking a stream is not a successful context');
  f.pending[4].resolve({ room_status: 'offline' }); await recover;
}
{
  const f = fixture(['alpha']);
  let finishBody;
  const request = f.service.probe('alpha');
  f.pending[0].respond({ ok: true, json: () => new Promise(resolve => { finishBody = resolve; }) });
  await settle();
  const batch = f.service.refreshMany(['alpha'], { reuseFresh: true });
  assert.equal(f.pending.length, 1, 'an in-flight body is shared, never declared fresh');
  let completed = false; batch.then(() => { completed = true; }); await settle();
  assert.equal(completed, false, 'freshness requires completed body consumption and processing');
  finishBody({ room_status: 'offline' }); await Promise.all([request, batch]);
  assert.equal((await f.service.refreshMany(['alpha'], { reuseFresh: true }))[0].status, 'fresh');
}
{
  const f = fixture(['alpha']);
  const online = { room_status: 'public', hls_source: 'https://example.com/live.m3u8' };
  const check = f.service.probe('alpha'); f.pending[0].resolve(online); await check;
  assert.equal((await f.service.refreshMany(['alpha'], { reuseFresh: true }))[0].status, 'fresh', 'background online status may be reused');
  const listeners = new Map();
  const video = { currentTime: 1, readyState: 4, paused: false, ended: false, isConnected: true,
    addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) };
  f.service.attachVideo('alpha', video);
  const preparing = f.service.refreshMany(['alpha'], { reuseFresh: true, preservePlaying: true });
  assert.equal(f.pending.length, 2, 'an attached preview without advancing playback must recheck even fresh context');
  f.pending[1].resolve(online); await preparing;
  video.currentTime = 2; listeners.get('timeupdate')();
  assert.equal((await f.service.refreshMany(['alpha'], { reuseFresh: true, force: true, preservePlaying: true }))[0].status, 'playing', 'Check all retains healthy playback');
  video.error = { code: 3 };
  const failed = f.service.refreshMany(['alpha'], { reuseFresh: true, preservePlaying: true });
  assert.equal(f.pending.length, 3, 'fresh context does not mask failed attached media');
  f.pending[2].resolve(online); await failed;
}
{
  const f = fixture(['a', 'b', 'c', 'd', 'e', 'f']);
  let visible = true;
  const batch = f.service.refreshMany(f.store.state.rooms.map(r => r.id), { reuseFresh: true, shouldContinue: () => visible });
  visible = false;
  for (const request of f.pending) request.resolve({ room_status: 'offline' });
  const results = await batch;
  assert.equal(f.pending.length, 4, 'hiding stops admission beyond the initial four requests');
  assert.equal(results.filter(r => r.status === 'cancelled').length, 2);
  visible = true;
  const resumed = f.service.refreshMany(f.store.state.rooms.map(r => r.id), { reuseFresh: true, shouldContinue: () => visible });
  await settle();
  assert.equal(f.pending.length, 6, 'resume reuses completed checks and checks the unfinished remainder');
  for (const request of f.pending.slice(4)) request.resolve({ room_status: 'offline' });
  assert.equal((await resumed).filter(r => r.status === 'fresh').length, 4);
}
console.log('Freshness-aware refresh: recent/stale/forced/error/body lifetime/unhealthy media/hidden-resume cases passed.');

const coordinator = source.slice(source.indexOf('    function roomIdsForWorkshopRefresh('), source.indexOf('    function isDirectMediaUrl(', source.indexOf('    function roomIdsForWorkshopRefresh(')));
function coordinatorFixture() {
  const calls = [], mediaRequests = [];
  const rooms = [{ id: 'fresh_visible', favorite: true }, { id: 'stale_visible', favorite: true }, { id: 'background' }];
  const globals = {
    store: { state: { rooms, settings: { activeGroup: 'all' } } },
    RECENT_FOLLOWED_GROUP_ID: 'recent', LIBRARY_GROUP_ID: 'library', ONLINE_GROUP_ID: 'online', ONLINE_FAVORITES_GROUP_ID: 'favorites', FAVORITE_GROUP_ID: 'favorite', DEFAULT_GROUP_ID: 'all',
    recentRoomMap: new Map(), allRoomsForView: () => rooms, roomInGroup: room => room.favorite,
    findRoomAny: id => rooms.find(room => room.id === id),
    mediaViewportIds: new Set(['fresh_visible', 'stale_visible']), isCardNearViewport: () => false,
    service: {
      hasFreshContext: id => id === 'fresh_visible',
      refreshMany(ids, options) {
        return new Promise(resolve => { calls.push({ ids: [...ids], options, resolve }); });
      },
    },
    document: { hidden: false }, workshopPageSuspended: false,
    workshopRefreshState: {}, workshopRefreshPromise: null, workshopRefreshRoomIds: new Set(),
    refreshAllBtn: { disabled: false }, cardMap: new Map(), LANG: 'en',
    scheduleSidebarRender() {}, updateWorkshopRefreshUi() {}, scheduleWorkshopSidebarCounts() {},
    requestRoomMediaIfNeeded: id => mediaRequests.push(id),
    setTimeout: () => 1, clearTimeout() {}, console,
  };
  const api = vm.runInNewContext(`${coordinator}\n({ roomIdsForWorkshopRefresh, refreshWorkshopRooms, refreshAllSources })`, globals);
  function finish(index, statuses = calls[index].ids.map(() => 'offline')) {
    const call = calls[index];
    const results = call.ids.map((id, item) => ({ id, status: statuses[item] }));
    results.forEach((result, item) => call.options.onProgress({ completed: item + 1, result }));
    call.resolve(results);
  }
  return { api, globals, calls, finish, mediaRequests };
}
{
  const f = coordinatorFixture();
  assert.deepEqual(Array.from(f.api.roomIdsForWorkshopRefresh()), ['stale_visible', 'fresh_visible', 'background'], 'visible stale/failed checks receive first admission');
  const smart = f.api.refreshWorkshopRooms({ scope: 'all' });
  const forced = f.api.refreshWorkshopRooms({ scope: 'all', force: true });
  assert.equal(f.calls.length, 1, 'Check all queues after an already-running smart batch');
  f.finish(0, ['offline', 'fresh', 'offline']); await smart; await settle();
  assert.equal(f.calls.length, 2, 'Check all is not incorrectly satisfied by a smart pass');
  assert.equal(f.calls[1].options.force, true);
  const shared = f.api.refreshWorkshopRooms({ scope: 'favorites' });
  assert.equal(f.calls.length, 2, 'a forced full pass can satisfy a narrower smart request');
  f.finish(1); await Promise.all([forced, shared]);
}
{
  const f = coordinatorFixture();
  const favorites = f.api.refreshWorkshopRooms({ scope: 'favorites' });
  const all = f.api.refreshWorkshopRooms({ scope: 'all' });
  assert.equal(f.calls.length, 1);
  f.finish(0); await favorites; await settle();
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].ids.length, 3, 'full refresh cannot inherit favorites-only work');
  f.finish(1); await all;
}
{
  const f = coordinatorFixture();
  f.globals.store.state.rooms[2].lastStatus = 'online';
  f.globals.cardMap.set('background', { video: null });
  const pass = f.api.refreshAllSources();
  assert.equal(f.calls[0].options.force, false, 'ordinary shortcut/group refresh uses freshness');
  f.finish(0, ['playing', 'fresh', 'fresh']); await pass;
  assert.match(f.globals.workshopRefreshState.message, /1 playing previews kept/);
  assert.match(f.globals.workshopRefreshState.message, /2 recent checks reused/);
  assert.deepEqual(f.mediaRequests, ['background'], 'fresh online status still queues missing visible media for a current URL');
  assert.equal(await f.api.refreshWorkshopRooms({ scope: 'all', automatic: true }), null, 'successful scope retains its automatic refresh cooldown');
}
{
  const f = coordinatorFixture();
  const failed = f.api.refreshWorkshopRooms({ scope: 'all', automatic: true });
  f.finish(0, ['error', 'fresh', 'throttled']); await failed;
  assert.match(f.globals.workshopRefreshState.message, /1 failed/);
  assert.match(f.globals.workshopRefreshState.message, /1 deferred/);
  const retry = f.api.refreshWorkshopRooms({ scope: 'all', automatic: true });
  assert.equal(f.calls.length, 2, 'failed/deferred scope must not be marked fully fresh');
  f.finish(1); await retry;
}
{
  const f = coordinatorFixture(); f.globals.document.hidden = true;
  await f.api.refreshWorkshopRooms({ scope: 'all', force: true });
  await f.api.refreshWorkshopRooms({ scope: 'all', force: false });
  assert.equal(f.calls.length, 0, 'hidden Workshop must not start requests');
  assert.equal(f.globals.workshopRefreshState.deferred.get('all').force, true, 'later smart request must not downgrade a deferred Check all');
  f.globals.document.hidden = false;
  const resumed = f.api.refreshWorkshopRooms(f.globals.workshopRefreshState.deferred.get('all'));
  assert.equal(f.calls[0].options.force, true);
  // This directly runs the preserved request; avoid scheduling the same fixture request twice.
  f.globals.workshopRefreshState.deferred.clear();
  f.finish(0); await resumed;
}
console.log('Workshop coordinator: priority, forced-vs-smart sharing, scope expansion, truthful counts, cooldown and hidden deferral passed.');
