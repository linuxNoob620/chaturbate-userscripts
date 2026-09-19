import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('  async function requestNativeRoomNotifications(');
const end = source.indexOf('\n  /*', start);
assert(start > 0 && end > start);
function fixture(replies, cookie = 'csrftoken=test-only') {
  const calls = [], timers = new Map(); let n = 0;
  const context = vm.createContext({ AbortController, URLSearchParams,
    normalizeUsername: value => String(value).toLowerCase(), isLikelyUsername: value => /^[a-z0-9_]+$/.test(value),
    document: { cookie }, setTimeout: fn => { timers.set(++n, fn); return n; }, clearTimeout: id => timers.delete(id),
    fetch: async (url, options) => { calls.push({ url, options }); const reply = replies.shift(); if (typeof reply === 'function') return reply(options); if (reply instanceof Error) throw reply; return { ok: true, redirected: false, text: async () => '', json: async () => reply }; },
  });
  const request = vm.runInContext(source.slice(start, end) + ';requestNativeRoomNotifications', context);
  return { request, calls, timers };
}
let passed = 0;
async function check(name, fn) { await fn(); console.log('PASS ' + name); passed++; }
const followed = frequency => ({ following: true, follow_notification_frequency: frequency });
await check('read only uses native room context and preserves exact Auto meaning', async () => {
  const f = fixture([followed('smart')]); const r = await f.request('room_one');
  assert.equal(r.frequency, 'smart'); assert.equal(f.calls.length, 1); assert.equal(f.calls[0].options.method, undefined); assert.equal(f.timers.size, 0);
});
await check('save preflights following and confirms submitted native value', async () => {
  const f = fixture([followed('smart'), {}, followed('all')]);
  assert.equal((await f.request('room_one', 'all')).frequency, 'all');
  assert.equal(f.calls.length, 3); const post = f.calls[1];
  assert.equal(post.url, '/api/ts/follow/notifications/room_one'); assert.equal(post.options.method, 'POST');
  assert.equal(post.options.body.toString(), 'notification_frequency=all');
  assert.equal(post.options.headers['X-CSRFToken'], 'test-only');
  assert(f.calls.every(c => !/email|unfollow|follow\/follow/.test(c.url))); assert.equal(f.timers.size, 0);
});
await check('does not follow an unfollowed room or send a preference write', async () => {
  const f = fixture([{ following: false, follow_notification_frequency: 'none' }]);
  await assert.rejects(f.request('room_one', 'all'), /Follow this model/); assert.equal(f.calls.length, 1);
});
await check('unrecognized preference fails closed', async () => {
  const f = fixture([followed('unexpected')]); await assert.rejects(f.request('room_one'), /Unrecognized/);
});
await check('invalid submitted preference never makes a request', async () => {
  const f = fixture([]); await assert.rejects(f.request('room_one', 'yes'), /Invalid/); assert.equal(f.calls.length, 0);
});
await check('mismatched readback cannot report saved', async () => {
  const f = fixture([followed('smart'), {}, followed('smart')]); await assert.rejects(f.request('room_one', 'all'), /could not be confirmed/);
});
await check('missing CSRF never writes', async () => {
  const f = fixture([followed('smart')], ''); await assert.rejects(f.request('room_one', 'all'), /Sign in/); assert.equal(f.calls.length, 1);
});
await check('timeout remains active through response body', async () => {
  let release; const f = fixture([options => ({ ok: true, redirected: false, json: () => new Promise((resolve, reject) => {
    release = resolve; options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }) })]); const result = f.request('room_one'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(typeof release, 'function'); assert.equal(f.timers.size, 1); [...f.timers.values()][0]();
  await assert.rejects(result, /aborted/); assert.equal(f.timers.size, 0);
});
await check('panel disposal cancels pending read', async () => {
  const controller = new AbortController(); const f = fixture([options => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))]);
  const result = f.request('room_one', undefined, controller.signal); controller.abort(); await assert.rejects(result, /aborted/); assert.equal(f.timers.size, 0);
});
await check('UI requires explicit save, differentiates local alerts, and does not subscribe', () => {
  const panel = source.slice(source.indexOf('    function openNativeNotifications('), source.indexOf('    function openLayoutSettings('));
  assert.match(panel, /Save preference/); assert.match(panel, /Auto.*not Off/); assert.match(panel, /Separate local Workshop alerts/);
  assert.match(panel, /return \(\) => controller.abort/); assert.doesNotMatch(panel, /Notification.requestPermission|pushManager.subscribe|email_notifications/);
});
console.log(`${passed} native notification checks passed`);
