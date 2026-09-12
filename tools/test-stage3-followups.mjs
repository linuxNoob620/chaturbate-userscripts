import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const tracking = source.slice(source.indexOf('  const RECENT_FOLLOWED_GROUP_ID'), source.indexOf('  // v15.5: 稳定状态。'));
assert.ok(tracking.includes('installFollowTracking'));
const values = new Map(), events = [];
class FakeXHR {
  constructor() { this.listeners = new Map(); }
  open() {} send() {}
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  emit(type) { [...(this.listeners.get(type) || [])].forEach(fn => fn()); }
}
let response = { ok: true, clone: () => ({ json: async () => ({ following: true }) }) };
const page = { $reactAppContext: { logged_in_user: { username: 'account_one' } }, fetch: () => Promise.resolve(response),
  dispatchEvent: event => events.push(event.type), XMLHttpRequest: FakeXHR };
const context = vm.createContext({ window: page, unsafeWindow: page, URL, console, Date, Map, Set, WeakMap,
  location: { href: 'https://chaturbate.com/', origin: 'https://chaturbate.com' },
  document: { querySelector: () => null },
  localStorage: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) },
  normalizeUsername: s => String(s || '').trim().toLowerCase(), isLikelyUsername: s => /^[a-z0-9_]{2,40}$/.test(s),
  CustomEvent: class { constructor(type) { this.type = type; } },
});
vm.runInContext(tracking + ';globalThis.api={recentFollowedRooms,recordFollowResult,installFollowTracking,resetNativeRoomEntryPreferences};', context);
const api = context.api, now = Date.now();
api.recordFollowResult('account_one', 'room_one', true, now - 2000);
api.recordFollowResult('account_one', 'room_two', true, now - 1000);
api.recordFollowResult('account_one', 'room_one', true, now);
assert.deepEqual(Array.from(api.recentFollowedRooms('account_one', now), r => r.id), ['room_two', 'room_one']);
assert.equal(api.recentFollowedRooms('account_one', now)[1].followedAt, now - 2000, 'duplicate Follow cannot renew time');
assert.equal(api.recentFollowedRooms('account_one', now + 86400000).length, 0);
assert.equal(api.recentFollowedRooms('account_two', now).length, 0);
api.recordFollowResult('account_two', 'other_room', true, now);
assert.equal(values.has('ziggy_recent_followed_v1_account_two'), false, 'changed account cannot receive an old result');
api.recordFollowResult('account_one', 'room_one', false, now);
assert.equal(api.recentFollowedRooms('account_one', now).length, 1);
api.recordFollowResult('account_one', 'older_response', true, now - 5000);
assert.ok(api.recentFollowedRooms('account_one', now).some(r => r.id === 'room_two'), 'late response must retain other rooms followed more recently');
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
api.installFollowTracking();
await page.fetch('/follow/follow/room_three/', { method: 'POST' }); await tick();
assert.ok(api.recentFollowedRooms().some(r => r.id === 'room_three'));
const before = events.length;
await page.fetch('/api/ts/follow/notifications/room_four', { method: 'POST' }); await tick();
await page.fetch('/follow/follow/room_four/', { method: 'GET' }); await tick();
await page.fetch('https://example.com/follow/follow/room_four/', { method: 'POST' }); await tick();
response = { ok: false };
await page.fetch('/follow/follow/room_four/', { method: 'POST' }); await tick();
response = { ok: true, clone: () => ({ json: async () => ({ error: 'failed' }) }) };
await page.fetch('/follow/follow/room_four/', { method: 'POST' }); await tick();
assert.equal(events.length, before, 'unrelated, failed and non-follow responses cannot create history');
const xhr = new page.XMLHttpRequest();
xhr.open('POST', '/follow/follow/stale_room/'); xhr.send();
xhr.open('POST', '/follow/follow/xhr_room/'); xhr.send();
xhr.status = 200; xhr.responseText = '{"following":true}'; xhr.emit('load'); xhr.emit('loadend');
assert.ok(api.recentFollowedRooms().some(r => r.id === 'xhr_room'));
assert.ok(!api.recentFollowedRooms().some(r => r.id === 'stale_room'));
assert.equal(xhr.listeners.get('load').size, 0);
assert.equal(xhr.listeners.get('loadend').size, 0);
let finishOld;
response = { ok: true, clone: () => ({ json: () => new Promise(resolve => { finishOld = resolve; }) }) };
await page.fetch('/follow/follow/race_room/', { method: 'POST' }); await tick();
response = { ok: true, clone: () => ({ json: async () => ({ following: false }) }) };
await page.fetch('/follow/unfollow/race_room/', { method: 'POST' }); await tick();
finishOld({ following: true }); await tick();
assert.ok(!api.recentFollowedRooms().some(r => r.id === 'race_room'), 'older Follow response cannot reverse a newer successful Unfollow');
values.set('videoControls', 'broken JSON'); values.set('selectedRoomTab', 'Share');
api.resetNativeRoomEntryPreferences();
assert.equal(values.get('selectedRoomTab'), 'Bio', 'corrupt audio preference cannot prevent Bio fallback');
values.set('videoControls', JSON.stringify({ volume: 73, isMuted: false }));
values.set('selectedRoomTab', 'Share');
api.resetNativeRoomEntryPreferences();
assert.deepEqual(JSON.parse(values.get('videoControls')), { volume: 73, isMuted: true });
assert.equal(values.get('selectedRoomTab'), 'Bio');
values.set('selectedRoomTab', 'More Rooms Like This'); api.resetNativeRoomEntryPreferences();
assert.equal(values.get('selectedRoomTab'), 'More Rooms Like This');

const queueCode = source.slice(source.indexOf('  let githubAutoExportQueue'), source.indexOf('  function readIgnoredRoomNames'));
let uploads = 0, failure = false, unlocked = true;
const notices = [], q = vm.createContext({ console: { warn() {} }, setTimeout: fn => setTimeout(fn, 0), clearTimeout,
  document: {}, DEFAULT_GROUP_ID: 'all',
  loadGithubSyncConfig: () => ({ token: unlocked ? 'test-only' : '', passphrase: 'test-passphrase' }), githubSessionPassphrase: '',
  flushPendingSuiteSettings() {}, Storage: { load: () => ({}) },
  uploadSuiteSettingsToGithub: async () => { uploads++; if (failure) throw Error('test failure'); return { sha: 'ok' }; },
  recordGithubSyncBaseline: async () => true, notices,
});
vm.runInContext(queueCode + ';showGithubExportNotice=(m)=>notices.push(m);globalThis.queue=queueGithubSettingsAutoExport;', q);
await Promise.all([q.queue(), q.queue(), q.queue()]);
assert.equal(uploads, 1, 'rapid saves coalesce');
assert.deepEqual(notices, ['Exporting settings…', 'Settings exported to GitHub.']);
failure = true;
await assert.rejects(q.queue()); await tick();
assert.match(notices.at(-1), /Auto export failed/);
unlocked = false;
await q.queue();
assert.equal(uploads, 2, 'missing credentials must not upload');
assert.match(notices.at(-1), /saved locally/);
assert.doesNotMatch(source, /function (?:maybeAutoImportGithubSettings|scheduleGithubAutoImport|monitorGithubLocalSettings)/);
assert.match(source, /function importSuiteSettingsFromGithub/);
const recentView = source.slice(source.indexOf('    const tempRooms = [];'), source.indexOf('    async function refreshWorkshopRooms('));
const visible = source.slice(source.indexOf('    function visibleRooms()'), source.indexOf('    function renderCardState(room)'));
const history = [{ id: 'saved_room', followedAt: 20 }, { id: 'recent_room', followedAt: 30 }], stopped = [];
const saved = { id: 'saved_room', lastStatus: 'offline', groups: ['default'] };
const view = vm.createContext({ Map, Set, JSON, String,
  RECENT_FOLLOWED_GROUP_ID: 'recent-followed', RECENT_FOLLOWED_PREFIX: 'recent_', DEFAULT_GROUP_ID: 'default',
  LIBRARY_GROUP_ID: 'library', ONLINE_GROUP_ID: 'online', ONLINE_FAVORITES_GROUP_ID: 'online-favorites', FAVORITE_GROUP_ID: 'fav',
  store: { state: { rooms: [saved], settings: { activeGroup: 'recent-followed', filter: {}, sortBy: 'name' } } },
  followedAccount: () => 'account_one', recentFollowedRooms: () => history,
  service: { stop: id => stopped.push(id) }, window: { addEventListener() {} }, document: { addEventListener() {} },
  setInterval: () => 1, clearInterval() {}, setTimeout() {}, scheduleSidebarRender() {}, scheduleGridRender() {},
  normalizeUsername: s => String(s || ''), roomInGroup: (r,g) => r.groups.includes(g),
  mediaViewportIds: new Set(), isCardNearViewport: () => false,
});
vm.runInContext(recentView + visible + ';globalThis.api={reconcileRecentRooms,visibleRooms,roomIdsForWorkshopRefresh};', view);
view.api.reconcileRecentRooms();
assert.deepEqual(Array.from(view.api.visibleRooms(),r=>r.id), ['recent_room','saved_room']);
assert.equal(view.api.visibleRooms()[1], saved, 'saved identity is reused, not duplicated');
assert.equal(view.api.visibleRooms()[1].lastStatus, 'offline', 'offline entries remain visible by default');
assert.deepEqual(new Set(view.api.roomIdsForWorkshopRefresh()), new Set(['saved_room','recent_room']));
view.store.state.settings.activeGroup = 'library';
assert.deepEqual(Array.from(view.api.roomIdsForWorkshopRefresh()), ['saved_room'], 'normal full refresh does not poll recent history');
assert.deepEqual(Array.from(view.api.visibleRooms(),r=>r.id), ['saved_room'], 'recent entries do not become library members');
history.splice(1,1);view.api.reconcileRecentRooms();
assert.deepEqual(stopped, ['recent_room'], 'expiry releases the unsaved preview service');
console.log('Stage 3 follow-ups: account isolation, confirmed follows, expiry/order, no preference-update tracking, entry preferences, export coalescing/failure, manual-only import passed.');
