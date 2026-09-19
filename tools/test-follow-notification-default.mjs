import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const tracking = source.slice(source.indexOf('  const RECENT_FOLLOWED_GROUP_ID'), source.indexOf('  // v15.5:'));
const request = source.slice(source.indexOf('  async function requestNativeRoomNotifications('), source.indexOf('\n  /*', source.indexOf('  async function requestNativeRoomNotifications(')));
const tick = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
function fixture() {
  const calls = [], notices = [], storage = new Map();
  let frequency = 'smart', followed = true, response = { notification_frequency: 'smart' }, gate, postFail = false;
  const reply = value => ({ ok: true, redirected: false, json: async () => value, text: async () => '', clone() { return this; } });
  class XHR {
    listeners = new Map();
    open() {} send() {}
    addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
    removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
    emit(type) { for (const fn of [...(this.listeners.get(type) || [])]) fn(); }
  }
  const page = {
    $reactAppContext: { logged_in_user: { username: 'account_one' } }, XMLHttpRequest: XHR, dispatchEvent() {},
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (url.startsWith('/api/chatvideocontext/')) {
        const snapshot = { following: followed, follow_notification_frequency: frequency };
        if (gate) { const pending = gate; gate = undefined; await pending.promise; }
        return reply(snapshot);
      }
      if (url.startsWith('/api/ts/follow/notifications/')) {
        if (postFail) throw Error('network failure');
        frequency = new URLSearchParams(options.body).get('notification_frequency'); return reply({});
      }
      return reply(response);
    },
  };
  const context = vm.createContext({ window: page, unsafeWindow: page, URL, URLSearchParams, AbortController, setTimeout, clearTimeout, console,
    location: { href: 'https://chaturbate.com/', origin: 'https://chaturbate.com' },
    document: { cookie: 'csrftoken=test-only', querySelector: () => null },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    normalizeUsername: value => String(value || '').toLowerCase(), isLikelyUsername: value => /^[a-z0-9_]{2,40}$/.test(value),
    CustomEvent: class {}, showSuiteToast: (message, options) => notices.push({ message, options }),
    fetch: (...args) => page.fetch(...args),
  });
  vm.runInContext(tracking + request + ';installFollowTracking();', context);
  return { page, calls, notices, storage,
    set frequency(value) { frequency = value; }, get frequency() { return frequency; },
    set response(value) { response = value; }, set gate(value) { gate = value; }, set postFail(value) { postFail = value; },
    follow: () => page.fetch('/follow/follow/room_one/', { method: 'POST' }),
    manual: value => page.fetch('/api/ts/follow/notifications/room_one', { method: 'POST', body: new URLSearchParams({ notification_frequency: value }) }),
    writes: () => calls.filter(c => c.url.startsWith('/api/ts/follow/notifications/')),
  };
}
let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log('PASS ' + name); }
await check('confirmed native Follow sets Auto to Never and verifies before toast', async () => {
  const f = fixture(); await f.follow(); await tick();
  assert.equal(f.frequency, 'none'); assert.equal(f.writes().length, 1); assert.equal(f.calls.length, 4);
  assert.match(f.notices[0].message, /set to Never/); assert(f.storage.size > 0);
});
await check('existing explicit Always survives repeated Follow', async () => {
  const f = fixture(); f.frequency = 'all'; await f.follow(); await tick();
  assert.equal(f.writes().length, 0); assert.equal(f.frequency, 'all'); assert.equal(f.notices.length, 0);
});
await check('Never needs no redundant write', async () => {
  const f = fixture(); f.frequency = 'none'; await f.follow(); await tick(); assert.equal(f.writes().length, 0);
});
await check('failed or malformed Follow does not change preferences', async () => {
  const f = fixture(); f.response = { error: 'failed', notification_frequency: 'smart' }; await f.follow(); await tick();
  f.response = {}; await f.follow(); await tick(); assert.equal(f.calls.length, 2);
});
await check('explicit Always while preflight waits takes precedence', async () => {
  const f = fixture(), gate = deferred(); f.gate = gate; await f.follow(); await tick();
  await f.manual('all'); gate.resolve(); await tick();
  assert.equal(f.writes().length, 1); assert.equal(f.frequency, 'all'); assert.equal(f.notices.length, 0);
});
await check('explicit choice before delayed Follow result prevents automatic write', async () => {
  const f = fixture(), gate = deferred();
  f.response = gate.promise; await f.follow(); await tick(); await f.manual('all');
  gate.resolve({ notification_frequency: 'smart' }); await tick(); assert.equal(f.writes().length, 1); assert.equal(f.frequency, 'all');
});
await check('unfollow while preflight waits cancels automatic update', async () => {
  const f = fixture(), gate = deferred(); f.gate = gate; await f.follow(); await tick();
  f.response = { following: false }; await f.page.fetch('/follow/unfollow/room_one/', { method: 'POST' });
  gate.resolve(); await tick(); assert.equal(f.writes().length, 0); assert.equal(f.notices.length, 0);
});
await check('account change before write cancels automatic update', async () => {
  const f = fixture(), gate = deferred(); f.gate = gate; await f.follow(); await tick();
  f.page.$reactAppContext.logged_in_user.username = 'account_two'; gate.resolve(); await tick(); assert.equal(f.writes().length, 0);
});
await check('failed preference write gives visible warning, not success or endless retries', async () => {
  const f = fixture(); f.postFail = true; await f.follow(); await tick();
  assert.equal(f.writes().length, 1); assert.match(f.notices[0].message, /could not confirm/); assert.equal(f.notices[0].options.persistent, true);
});
await check('XHR native Follow path also defaults to Never and releases listeners', async () => {
  const f = fixture(), xhr = new f.page.XMLHttpRequest(); xhr.open('POST', '/follow/follow/room_one/'); xhr.send();
  xhr.status = 200; xhr.responseText = '{"notification_frequency":"smart"}'; xhr.emit('load'); xhr.emit('loadend'); await tick();
  assert.equal(f.frequency, 'none'); assert.equal(f.writes().length, 1); assert.equal(xhr.listeners.get('load').size, 0);
});
console.log(`${passed} follow-default checks passed`);
