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
// Execute the shipped ordering/card loop: native order outranks API order,
// timestamps and names, without losing newly returned rooms or mutating cache.
const loopStart = source.indexOf('        // Keep React\'s native children intact;', end);
const loopEnd = source.indexOf("        session.natives.forEach(({ node }) => { node.style.display = 'none'; });", loopStart);
const cardLoop = source.slice(loopStart, loopEnd);
function node(tagName = 'div') {
  return { tagName, children: [], dataset: {}, style: {},
    append(...children) { this.children.push(...children); } };
}
for (const input of [rooms, [{ id: 'z_room', onlineSince: 10 }, { id: 'a_room', onlineSince: 20 }, { id: 'b_room', onlineSince: 20 }]]) {
 for (const nativeIds of [[], input.map(room => room.id).reverse(), [input[1].id, input[0].id, input[1].id, 'missing_room']]) {
  const list = node();
  const expected = [...new Set(nativeIds)].filter(id => input.some(room => room.id === id));
  expected.push(...Array.from(input, room => room.id).filter(id => !expected.includes(id)));
  vm.runInNewContext(cardLoop, { rooms: input, list,
    session: { natives: [{ node: { querySelectorAll: () => nativeIds.map(textContent => ({textContent})) } }] },
    normalizeUsername: value => String(value || '').trim().toLowerCase(),
    document: { createElement: node }, roomPageUrl: id => `https://chaturbate.com/${id}/` });
  assert.deepEqual(list.children.map(card => card.dataset.roomId), expected, 'Following must keep native order; append new API rooms without custom sorting');
  assert.equal(list.children[0].children[0].children[1].textContent, expected[0]);
  const link = list.children[0].children[0];
  assert.equal(link.children[0].tagName, 'img', 'retain the native linked thumbnail');
  assert.equal(link.children[0].alt, expected[0]);
  assert.equal(link.href, `https://chaturbate.com/${expected[0]}/`);
  assert.equal(link.style.position, 'relative');
  assert.equal(link.style.userSelect, 'none');
  assert.doesNotMatch(cardLoop, /contextmenu|preventDefault|touchstart|touchend/, 'the browser owns link menus and touch navigation');
 }
}
// Execute the shipped visibility path: paint the real linked image above media,
// restore it on detach, and retain the existing eight-player/ownership policy.
const visibilityStart = source.indexOf('            const image = card.querySelector(\'img\');', loopEnd);
const visibilityEnd = source.indexOf('\n          }\n        }, { root:', visibilityStart);
const visibilityLoop = `for (const once of [0]) { ${source.slice(visibilityStart, visibilityEnd)} }`;
const image = { className: 'FollowedDropdown__room-image', src: 'https://example.test/thumb.jpg',
  style: {}, before(video) { this.video = video; } };
const card = { querySelector: () => image };
const session = { videos: new Map() };
const starts = [], stops = [], attached = [];
const visibilityContext = { card, id: 'test_room', entry: { isIntersecting: true }, session,
  document: { hidden: false, createElement: tagName => ({ tagName, style: {}, remove() { this.removed = true; } }) },
  rooms: [{ id: 'test_room', lastStatus: 'online' }],
  service: { start: id => starts.push(id), stop: id => stops.push(id), attachVideo: (id, v) => attached.push(v) } };
vm.runInNewContext(visibilityLoop, visibilityContext);
assert.match(image.style.cssText, /position:absolute;left:0;top:0;opacity:0\.01;z-index:2/);
assert.equal(image.video.muted, true);
assert.equal(image.video.playsInline, true);
vm.runInNewContext(visibilityLoop, visibilityContext);
assert.equal(starts.length, 1, 'repeated visible callback must retain its player');
visibilityContext.entry.isIntersecting = false;
vm.runInNewContext(visibilityLoop, visibilityContext);
assert.equal(image.style.cssText, '', 'restore the linked static thumbnail when offscreen');
assert.equal(attached[0].removed, true);
assert.equal(session.videos.size, 0);
assert.equal(stops.length, 1);
visibilityContext.entry.isIntersecting = true;
vm.runInNewContext(visibilityLoop, visibilityContext);
assert.equal(starts.length, 2, 're-entry must recreate only the visible preview');
assert.notEqual(attached[0], attached[1]);
assert.doesNotMatch(visibilityLoop, /contextmenu|preventDefault|touchstart|touchend/);
assert.equal(rooms[0].id, 'room_0', 'rendering must not mutate cached data');
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
console.log('Following pagination, status, native order, failure and lifecycle guards passed.');
