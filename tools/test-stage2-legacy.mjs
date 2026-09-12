import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ref = process.argv.find(arg => arg.startsWith('--source-ref='))?.split('=').slice(1).join('=');
const filename = 'Chaturbate MultiCam Pro + Cam ARNA.user.js';
const source = ref ? execFileSync('git', ['show', `${ref}:${filename}`], { encoding: 'utf8' }) : fs.readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8');
function fn(name) {
  const start = source.search(new RegExp(`^ {0,4}function ${name}\\(`, 'm'));
  assert.notEqual(start, -1, `Missing shipped function ${name}`);
  const tail = source.slice(start);
  const next = tail.slice(tail.indexOf('\n') + 1).search(/^ {0,4}function \w+\(/m);
  return next < 0 ? tail : tail.slice(0, tail.indexOf('\n') + 1 + next);
}
const tick = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const response = (data = {}, status = 200) => ({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) });
function element() {
  return { style: { display: 'none', right: '10px', top: '140px' }, value: '', innerHTML: '', textContent: '', listeners: new Map(),
    addEventListener(type, listener) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(listener); },
    removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); },
    appendChild(child) { this.child = child; return child; },
  };
}
function harness(names, extra = {}) {
  const nodes = new Map();
  const document = Object.assign(element(), { location: { href: 'https://chaturbate.com/followed-cams/offline/?page=1' }, visibilityState: 'visible',
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    createElement: element, getElementsByTagName: () => [element()], querySelector: () => null,
  });
  const timers = [], requests = [], alerts = [], storage = new Map();
  const context = vm.createContext({ document, window: { innerWidth: 1200 }, URL, FormData, Promise, console,
    setTimeout: callback => { timers.push(callback); return timers.length; }, clearTimeout: () => {},
    alert: message => alerts.push(message), confirm: () => true, readCookie: () => 'test-only',
    fetch: (url, options) => { const request = deferred(); requests.push({ url, options, ...request }); return request.promise; },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    domain: 'https://chaturbate.com/', username: 'viewer', roomname: 'alpha', openthumbname: '', opennote: '', popupNote: '',
    reloadedNoteGeneration: 0, reloadedNoteSaveGeneration: 0, reloadedProfileNoteGeneration: 0, reloadedProfileNoteSaveGeneration: 0,
    notegrey: '<svg></svg>', usernoteslist: { usernames: [] }, updatedm: () => {}, updatedm2: () => {},
    hprom: false, hidurl: '/hidden?offset=', hidoffset: 0, hiddenarray: [], n: 0, i: 0,
    region: ['asia', 'europe'], regioarray: [], regionPageSeen: new Set(), regoffset: 0, rcount: 0, regiofetch: true,
    pos1: 0, pos2: 0, pos3: 0, pos4: 0,
    ...extra,
  });
  vm.runInContext(names.map(fn).join('\n'), context);
  return { context, nodes, timers, requests, alerts, storage, document };
}
const tests = [];
const test = (name, run) => tests.push({ name, run });

test('note A then B cannot overwrite B when A resolves last', async () => {
  const h = harness(['shownote', 'notepopclose'], { getusercolor: () => {} });
  h.context.shownote('alpha', 0, 0); h.context.shownote('beta', 0, 0);
  h.requests[1].resolve(response({ text: 'Beta note' })); await tick();
  h.requests[0].resolve(response({ text: 'Alpha note' })); await tick();
  assert.equal(h.document.getElementById('notearea').value, 'Beta note');
});
test('closing the popup invalidates pending note reads', async () => {
  const h = harness(['shownote', 'notepopclose'], { getusercolor: () => {} });
  h.context.shownote('alpha', 0, 0); h.context.notepopclose();
  h.requests[0].resolve(response({ text: 'Late note' })); await tick();
  assert.equal(h.document.getElementById('notearea').value, '');
});
test('pending popup note read preserves a same-room draft', async () => {
  const h = harness(['shownote', 'notepopclose'], { getusercolor: () => {} });
  h.context.shownote('alpha', 0, 0);
  h.document.getElementById('notearea').value = 'New unsaved user draft';
  h.requests[0].resolve(response({ text: 'Earlier server note' })); await tick();
  assert.equal(h.document.getElementById('notearea').value, 'New unsaved user draft');
  assert.equal(h.context.popupNote, 'Earlier server note');
});
test('pending popup note read preserves a typed-then-deleted draft', async () => {
  const h = harness(['shownote', 'notepopclose', 'openbutton', 'closebutton'], { getusercolor: () => {} });
  h.context.shownote('alpha', 0, 0);
  h.document.getElementById('notearea').value = 'Draft'; h.context.openbutton();
  h.document.getElementById('notearea').value = ''; h.context.openbutton();
  h.requests[0].resolve(response({ text: 'Earlier server note' })); await tick();
  assert.equal(h.document.getElementById('notearea').value, '');
});
test('pending popup note read cannot replace an acknowledged save', async () => {
  const h = harness(['shownote', 'notepopclose', 'savenote', 'aftersave', 'closebutton'], { getusercolor: () => {} });
  h.context.shownote('alpha', 0, 0);
  h.document.getElementById('notearea').value = 'Submitted draft'; h.context.savenote();
  h.requests[1].resolve(response()); await tick();
  h.requests[0].resolve(response({ text: 'Earlier server note' })); await tick();
  assert.equal(h.document.getElementById('notearea').value, 'Submitted draft');
  assert.equal(h.context.popupNote, 'Submitted draft');
});
for (const status of [403, 500, 'network']) {
  test(`popup note load failure ${status} preserves draft and uses noneditable status`, async () => {
    const h = harness(['shownote', 'notepopclose'], { getusercolor: () => {} });
    h.context.shownote('alpha', 0, 0); h.document.getElementById('notearea').value = 'Keep my draft';
    if (status === 'network') h.requests[0].reject(new Error('Mock offline'));
    else h.requests[0].resolve(response({}, status));
    await tick();
    assert.equal(h.document.getElementById('notearea').value, 'Keep my draft');
    assert.match(h.document.getElementById('notenote').textContent, status === 'network' ? /load failed/i : new RegExp(`HTTP ${status}`));
  });
}
test('profile note HTTP failure reports the actual status without claiming a ban', async () => {
  const messages = []; const h = harness(['getnotes'], { wprof: (...args) => messages.push(args) });
  h.context.getnotes(); h.requests[0].resolve(response({}, 500)); await tick();
  assert.match(messages[0][1], /HTTP 500/); assert.doesNotMatch(messages[0][1], /banned/);
});
test('stale note-color responses cannot recolor a different user', async () => {
  const h = harness(['getusercolor']); h.context.openthumbname = 'alpha'; h.context.reloadedNoteGeneration = 1;
  h.context.getusercolor('alpha', 1); h.context.openthumbname = 'beta'; h.context.reloadedNoteGeneration = 2;
  h.requests[0].resolve(response({ can_pm: true, sitewide_user: { tipped_tons_recently: true } })); await tick();
  assert.equal(h.document.getElementById('notepopLink').style.color, undefined);
  assert.equal(h.document.getElementById('notepopName').style.color, undefined);
});
test('profile note reads do not render after route changes', async () => {
  let builds = 0;
  const h = harness(['getnotes'], { buildprofnote: () => builds++ });
  h.context.getnotes(); h.document.location.href = 'https://chaturbate.com/beta/';
  h.requests[0].resolve(response({ text: 'Alpha note' })); await tick(); assert.equal(builds, 0);
});
for (const profile of [false, true]) {
  const save = profile ? 'profsavenote' : 'savenote';
  const after = profile ? 'profaftersave' : 'aftersave';
  const close = profile ? 'profclosebutton' : 'closebutton';
  const area = profile ? 'proftext' : 'notearea';
  test(`${save} acknowledges the sent payload without discarding later typing`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'Submitted'; h.context[save]();
    assert.equal(h.requests[0].options.body.get('text'), 'Submitted');
    h.document.getElementById(area).value = 'New unsaved draft';
    h.requests[0].resolve(response()); await tick();
    assert.equal(h.document.getElementById(area).value, 'New unsaved draft');
    assert.equal(profile ? h.context.opennote : h.context.popupNote, 'Submitted');
  });
  test(`${save} does not mark HTTP failures saved`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'Unsaved'; h.context[save]();
    h.requests[0].resolve(response({}, 500)); await tick();
    assert.equal(profile ? h.context.opennote : h.context.popupNote, '');
    assert.equal(h.document.getElementById(area).value, 'Unsaved');
    assert.ok(h.alerts.length);
  });
  test(`${save} ignores a success for an editor belonging to the previous room`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'Alpha draft'; h.context[save]();
    if (profile) h.context.roomname = 'beta'; else h.context.openthumbname = 'beta';
    h.document.getElementById(area).value = 'Beta draft'; h.requests[0].resolve(response()); await tick();
    assert.equal(h.document.getElementById(area).value, 'Beta draft');
    assert.equal(profile ? h.context.opennote : h.context.popupNote, '');
  });
  test(`${save} keeps network failures unsaved and reports them`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'Unsaved'; h.context[save]();
    h.requests[0].reject(new Error('Mock offline')); await tick();
    assert.equal(h.document.getElementById(area).value, 'Unsaved'); assert.equal(h.alerts.length, 1);
  });
  test(`${save} serializes immutable payloads while editing remains available`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'First submission'; h.context[save]();
    h.document.getElementById(area).value = 'Second submission'; h.context[save]();
    h.document.getElementById(area).value = 'Still editing';
    assert.equal(h.requests.length, 1, 'second POST must wait for first acknowledgement');
    assert.equal(h.document.getElementById(area).disabled, undefined);
    h.requests[0].resolve(response()); await tick();
    assert.equal(h.requests.length, 2); assert.equal(h.requests[1].options.body.get('text'), 'Second submission');
    h.requests[1].resolve(response()); await tick();
    assert.equal(profile ? h.context.opennote : h.context.popupNote, 'Second submission');
    assert.equal(h.document.getElementById(area).value, 'Still editing');
  });
  test(`${save} queued save survives first failure and room change with captured identity`, async () => {
    const h = harness([save, after, close]); h.context.openthumbname = 'alpha';
    h.document.getElementById(area).value = 'First submission'; h.context[save]();
    h.document.getElementById(area).value = 'Second submission'; h.context[save]();
    assert.equal(h.requests.length, 1);
    if (profile) { h.context.roomname = 'beta'; h.context.reloadedProfileNoteGeneration++; }
    else { h.context.openthumbname = 'beta'; h.context.reloadedNoteGeneration++; }
    h.document.getElementById(area).value = 'Beta draft';
    h.requests[0].resolve(response({}, 500)); await tick();
    assert.equal(h.requests.length, 2); assert.match(h.requests[1].url, /\/alpha\/$/);
    assert.equal(h.requests[1].options.body.get('text'), 'Second submission');
    h.requests[1].resolve(response()); await tick();
    assert.equal(h.document.getElementById(area).value, 'Beta draft');
    assert.equal(profile ? h.context.opennote : h.context.popupNote, '');
  });
}
test('getnoteslist initializes card handlers only after JSON finishes', async () => {
  let calls = 0; const json = deferred();
  const h = harness(['getnoteslist'], { login: true, addevent2: () => calls++ });
  h.context.getnoteslist(); h.requests[0].resolve({ status: 200, ok: true, json: () => json.promise }); await tick();
  assert.equal(calls, 0); json.resolve({ usernames: ['alpha'] }); await tick(); assert.equal(calls, 1);
});
for (const repeated of [false, true]) {
  test(`hidden pagination terminates on ${repeated ? 'repeated no-progress' : 'empty zero-count'} pages`, async () => {
    let count = 0, finished = 0;
    const h = harness(['showhidden2'], { showhidden3: () => finished++, startthumbobserver: () => {}, fetch: () => {
      count++; return count > 5 ? new Promise(() => {}) : Promise.resolve(response({ rooms: repeated ? [{ username: 'alpha' }] : [], total_count: repeated ? 900 : 0 }));
    } });
    h.context.showhidden2(); await tick();
    assert.equal(count, repeated ? 2 : 1); assert.equal(finished, 1); assert.equal(h.context.hprom, false);
  });
}
test('region pagination terminates empty regions instead of increasing offsets forever', async () => {
  let count = 0, finished = 0;
  const h = harness(['loadregion', 'getregiondata'], { getregion: () => finished++, fetch: () => {
    count++; return count > 5 ? new Promise(() => {}) : Promise.resolve(response({ results: [], count: 0 }));
  } });
  h.context.loadregion(); await tick(); assert.equal(count, 2); assert.equal(finished, 1);
});
test('region pagination stops repeated pages even with cached room entries', async () => {
  let count = 0, finished = 0;
  const h = harness(['loadregion', 'getregiondata'], { region: ['asia'], getregion: () => finished++, fetch: () => {
    count++; return count > 5 ? new Promise(() => {}) : Promise.resolve(response({ results: [{ username: 'alpha', country: 'DE' }], count: 5000 }));
  } });
  h.storage.set('regloaded', 'foo'); h.storage.set('region_asia', '["alpha","DE",""]');
  h.context.loadregion(); await tick(); assert.equal(count, 2); assert.equal(finished, 1);
});
test('pagination failures release busy flags', async () => {
  const hidden = harness(['showhidden2'], { startthumbobserver: () => {} });
  hidden.context.showhidden2(); hidden.requests[0].reject(new Error('Mock offline')); await tick(); assert.equal(hidden.context.hprom, false);
  const region = harness(['getregiondata']); region.context.getregiondata(); region.requests[0].resolve(response({}, 500)); await tick();
  assert.equal(region.context.regiofetch, false);
});
test('repeated HLS starts own exactly one ERROR listener', () => {
  const listeners = new Set();
  const names = ['startvid2']; if (/function reloadedHlsError\(/.test(source)) names.push('reloadedHlsError');
  const h = harness(names, { videoSrc: 'https://example.invalid/live.m3u8', setReloadedToolsTabAvailable: () => {},
    Hls: { Events: { ERROR: 'error' } }, fatalerror: 0, restarts: 0, hls: { loadSource() {}, attachMedia() {}, on: (_, fn) => listeners.add(fn), off: (_, fn) => listeners.delete(fn) },
  });
  h.context.startvid2(); h.context.startvid2(); assert.equal(listeners.size, 1);
});
test('bulk Unfollow never follows already-unfollowed cards', () => {
  const actions = [];
  const h = harness(['unfollowroom2'], { nrt: 1, roomthumbs: [{ querySelector: selector => selector.includes('follow-star') ? { title: 'Follow' } : { getAttribute: () => 'alpha' } }],
    unfollowpage: () => actions.push('unfollow'), followpage: () => actions.push('follow'), unfollowroom: () => actions.push('next'),
  });
  h.context.unfollowroom2(); assert.deepEqual(actions, ['next']);
});
test('bulk Unfollow completion returns before dereferencing index minus one', () => {
  const h = harness(['unfollowroom2'], { nrt: 0, roomthumbs: [] });
  assert.doesNotThrow(() => h.context.unfollowroom2()); assert.match(h.document.location.href, /page=1$/);
});
test('bulk Unfollow retains note cleanup after primary success and waits before advancing', async () => {
  let removed = 0, next = 0, banned = 0;
  const h = harness(['unfollowpage', 'clearnote'], { roomthumbs: [{ remove: () => removed++ }], nrt: 0, unfollowroom: () => next++,
    makeban2: () => banned++, makeban3: () => banned++,
  });
  h.context.unfollowpage('alpha'); assert.equal(h.requests.length, 1); assert.match(h.requests[0].url, /\/follow\/unfollow\/alpha\/$/);
  h.requests[0].resolve(response()); await tick();
  assert.equal(h.requests.length, 2); assert.match(h.requests[1].url, /\/api\/notes\/for_user\/alpha\/$/);
  assert.equal(h.requests[1].options.body.get('text'), ''); assert.equal(removed, 0); assert.equal(next, 0);
  h.requests[1].resolve(response()); await tick();
  assert.equal(removed, 1); assert.equal(next, 1); assert.equal(banned, 0, 'same-room cleanup must never become a ban');
});
for (const status of [403, 500, 'network']) {
  test(`bulk Unfollow failure ${status} never starts note cleanup`, async () => {
    let cleared = 0, removed = 0, next = 0, observed = 0;
    const h = harness(['unfollowpage'], { clearnote: () => cleared++, roomthumbs: [{ remove: () => removed++ }], nrt: 0,
      unfollowroom: () => next++, unfollowthispage: () => {}, startthumbobserver: () => observed++,
    });
    h.context.unfollowpage('alpha');
    if (status === 'network') h.requests[0].reject(new Error('Mock offline')); else h.requests[0].resolve(response({}, status));
    await tick(); assert.equal(cleared, 0); assert.equal(removed, 0); assert.equal(next, 0); assert.equal(observed, 1); assert.equal(h.alerts.length, 1);
  });
}
for (const status of [500, 'network']) {
  test(`bulk Unfollow reports note cleanup ${status} as partial success`, async () => {
    let removed = 0, next = 0;
    const h = harness(['unfollowpage', 'clearnote'], { roomthumbs: [{ remove: () => removed++ }], nrt: 0, unfollowroom: () => next++,
      unfollowthispage: () => {}, startthumbobserver: () => {},
    });
    h.context.unfollowpage('alpha'); h.requests[0].resolve(response()); await tick(); assert.equal(h.requests.length, 2);
    if (status === 'network') h.requests[1].reject(new Error('Mock offline')); else h.requests[1].resolve(response({}, status));
    await tick(); assert.equal(removed, 1); assert.equal(next, 1); assert.equal(h.alerts.length, 1);
    assert.match(h.alerts[0], /Unfollow succeeded.*note cleanup failed/i);
  });
}
test('afterBan unfollow never duplicates note cleanup or bulk advancement', async () => {
  let cleared = 0, next = 0;
  const h = harness(['unfollowpage'], { clearnote: () => cleared++, unfollowroom: () => next++ });
  h.context.unfollowpage('alpha', true); h.requests[0].resolve(response()); await tick();
  assert.equal(cleared, 0); assert.equal(next, 0); assert.equal(h.requests.length, 1);
});
test('ban starts with the primary ban action, not unfollow', () => {
  const actions = [];
  const h = harness(['makeban'], { unfollowpage: () => actions.push('unfollow'), makeban3: () => actions.push('ban') });
  h.context.makeban('alpha'); assert.deepEqual(actions, ['ban']);
});
for (const status of [403, 500]) {
  test(`failed primary ban HTTP ${status} never runs destructive cleanup`, async () => {
    const actions = [];
    const h = harness(['makeban3'], { unfollowpage: () => actions.push('unfollow'), clearnote: () => actions.push('clear'), makeban2: () => actions.push('delete') });
    h.context.makeban3('alpha'); h.requests[0].resolve(response({}, status)); await tick();
    assert.deepEqual(actions, []); assert.equal(h.alerts.length, 1); assert.equal(h.storage.has('ignoredusers'), false);
  });
}
test('application-level failed ban never runs cleanup', async () => {
  const actions = [];
  const h = harness(['makeban3'], { unfollowpage: () => actions.push('unfollow'), clearnote: () => actions.push('clear'), makeban2: () => actions.push('delete') });
  h.context.makeban3('alpha'); h.requests[0].resolve(response({ success: false })); await tick();
  assert.deepEqual(actions, []); assert.equal(h.alerts.length, 1);
});
test('successful ban gates cleanup and commits the captured user despite optional cleanup failure', async () => {
  const actions = [];
  const h = harness(['makeban3'], { __ziggySuiteCommitNewBan: name => actions.push(`commit:${name}`),
    unfollowpage: (name, afterBan) => { actions.push(`unfollow:${name}:${afterBan}`); return Promise.reject(new Error('Mock optional cleanup failure')); },
    clearnote: name => actions.push(`clear:${name}`), makeban2: name => actions.push(`delete:${name}`),
  });
  h.context.makeban3('alpha'); assert.deepEqual(actions, []); h.context.roomname = 'beta';
  h.requests[0].resolve(response({ success: true })); await tick();
  assert.deepEqual(actions, ['unfollow:alpha:true', 'clear:alpha', 'delete:alpha', 'commit:alpha']); assert.equal(h.alerts.length, 1);
});
for (const cloud of ['exported', 'failed']) {
  test(`legacy ban waits for local commit before navigation with cloud ${cloud}`, async () => {
    const commit = deferred();
    const h = harness(['makeban3'], { __ziggySuiteCommitNewBan: () => commit.promise,
      unfollowpage: () => {}, clearnote: () => {}, makeban2: () => {},
    });
    h.context.makeban3('alpha'); h.requests[0].resolve(response({ success: true })); await tick();
    assert.equal(h.timers.length, 0); commit.resolve({ added: true, cloud }); await tick();
    assert.equal(h.timers.length, 1); h.timers[0](); assert.equal(h.document.location.href, 'https://chaturbate.com/');
  });
}
for (const mode of ['bridge rejection', 'fallback storage exception']) {
  test(`legacy ban local save ${mode} reports partial success and does not navigate`, async () => {
    const extra = mode === 'bridge rejection'
      ? { __ziggySuiteCommitNewBan: () => Promise.reject(new Error('Mock quota')) }
      : { localStorage: { getItem: () => null, setItem: () => { throw new Error('Mock quota'); } } };
    const h = harness(['makeban3'], { ...extra, console: { warn() {} }, unfollowpage: () => {}, clearnote: () => {}, makeban2: () => {} });
    h.context.makeban3('alpha'); h.requests[0].resolve(response({ success: true })); await tick();
    assert.equal(h.timers.length, 0); assert.equal(h.alerts.length, 1);
    assert.match(h.alerts[0], /Ban succeeded, but local ban state could not be saved/i);
    assert.match(h.document.location.href, /followed-cams\/offline/);
  });
}
test('translation response renders as text', () => {
  const h = harness(['showtranslate']); const destination = element();
  const text = '<img src=x onerror=alert(1)> translated'; h.context.showtranslate(text, { firstChild: { lastElementChild: destination } });
  assert.equal(destination.child.textContent, text); assert.equal(destination.child.innerHTML, '');
});
test('plain profile API fields cannot become active HTML', () => {
  function row() {
    const labels = [element()], cells = [element(), element()];
    return { labels, cells, getElementsByTagName: tag => tag === 'span' ? labels : cells, cloneNode: row };
  }
  const rows = [row(), row(), row()];
  const referenceNode = { getElementsByTagName: () => rows, appendChild: node => rows.push(node) };
  const payload = '<img src=x onerror=alert(1)>';
  const names = ['buildbio', 'tocap'];
  const h = harness(names, { referenceNode, biodata: { real_name: payload, follower_count: 10, sex: '', subgender: '', interested_in: [], social_medias: [], photo_sets: [], about_me: '' }, sanitizeReloadedBioHtml: value => value });
  h.context.buildbio(); assert.equal(rows[2].cells[1].textContent, payload); assert.equal(rows[2].cells[1].innerHTML, '');
});
test('outbound profile wrappers never become javascript links or throw on invalid escapes', () => {
  const links = [
    { href: 'https://chaturbate.com/external/?url=https%3A%2F%2Fexample.test%2Fsafe' },
    { href: 'https://chaturbate.com/external/?url=javascript%3Aalert(1)' },
    { href: 'https://chaturbate.com/external/?url=%E0%A4%A' },
  ];
  const names = ['linkfix']; if (/function safeReloadedProfileUrl\(/.test(source)) names.push('safeReloadedProfileUrl');
  const h = harness(names); h.document.getElementsByClassName = () => [{ getElementsByTagName: () => links }];
  assert.doesNotThrow(() => h.context.linkfix());
  assert.equal(links[0].href, 'https://example.test/safe'); assert.ok(!links[1].href.startsWith('javascript:'));
});
test('rich bio sanitizer retains basic presentation while removing active HTML, event handlers, and unsafe URLs', () => {
  function rich(tagName, inputAttributes, inputStyles = {}, namespaceURI = 'http://www.w3.org/1999/xhtml') {
    const attrs = new Map(Object.entries(inputAttributes)); const styles = new Map(Object.entries(inputStyles));
    return { tagName, namespaceURI, childNodes: [], attrs, removed: false,
      get attributes() { return [...attrs].map(([name, value]) => ({ name, value })); },
      removeAttribute(name) { attrs.delete(name); if (name === 'style') styles.clear(); },
      setAttribute(name, value) { attrs.set(name, value); }, remove() { this.removed = true; }, replaceWith() { this.removed = true; },
      style: { [Symbol.iterator]: () => styles.keys(), getPropertyValue: name => styles.get(name), setProperty: (name, value) => styles.set(name, value) }, styles,
    };
  }
  const nodes = [
    rich('DIV', { style: 'color:red;position:fixed', onclick: 'attack()', title: 'Safe title' }, { color: 'red', position: 'fixed' }),
    rich('A', { href: 'java\nscript:attack()', onmouseover: 'attack()', target: '_blank' }),
    rich('A', { href: '/safe', target: '_blank' }),
    rich('IMG', { src: 'https://example.test/image.png', onerror: 'attack()', alt: 'Safe image' }),
    rich('IMG', { src: 'data:image/svg+xml,<svg onload=attack()>' }),
    rich('SCRIPT', {}), rich('svg', {}, {}, 'http://www.w3.org/2000/svg'),
  ];
  const h = harness(['sanitizeReloadedBioHtml', 'safeReloadedProfileUrl']);
  h.document.createElement = () => ({ innerHTML: '', content: { querySelectorAll: () => nodes } });
  h.context.sanitizeReloadedBioHtml('<fixture>');
  assert.equal(nodes[0].attrs.get('title'), 'Safe title'); assert.equal(nodes[0].attrs.has('onclick'), false);
  assert.equal(nodes[0].styles.get('color'), 'red'); assert.equal(nodes[0].styles.has('position'), false);
  assert.equal(nodes[1].attrs.has('href'), false); assert.equal(nodes[1].attrs.has('onmouseover'), false);
  assert.equal(nodes[2].attrs.get('href'), 'https://chaturbate.com/safe'); assert.equal(nodes[2].attrs.get('rel'), 'noopener noreferrer');
  assert.equal(nodes[3].attrs.get('src'), 'https://example.test/image.png'); assert.equal(nodes[3].attrs.has('onerror'), false);
  assert.equal(nodes[4].attrs.has('src'), false); assert.equal(nodes[5].removed, true); assert.equal(nodes[6].removed, true);
});
test('drag owns addEventListener handlers without changing native document properties', () => {
  const h = harness(['dragMouseDown', 'closeDragElement'], { elementDrag: () => {} });
  const nativeMove = () => {}, nativeUp = () => {}; h.document.onmousemove = nativeMove; h.document.onmouseup = nativeUp;
  h.context.dragMouseDown({ preventDefault() {}, pageX: 20, pageY: 20 });
  assert.equal(h.document.onmousemove, nativeMove); assert.equal(h.document.onmouseup, nativeUp);
  assert.equal(h.document.listeners.get('mousemove')?.size, 1); h.context.closeDragElement();
  assert.equal(h.document.listeners.get('mousemove')?.size, 0); assert.equal(h.document.onmouseup, nativeUp);
});

let failures = 0;
const filter = process.argv.find(arg => arg.startsWith('--filter='))?.slice('--filter='.length);
const selectedTests = filter ? tests.filter(({ name }) => new RegExp(filter).test(name)) : tests;
for (const { name, run } of selectedTests) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.log(`FAIL ${name}: ${error.message}`); }
}
console.log(`${selectedTests.length - failures}/${selectedTests.length} legacy behavioral tests passed${ref ? ` against ${ref}` : ''}.`);
if (process.argv.includes('--expect-failures')) assert.ok(failures > 0, 'Baseline unexpectedly contains none of the reproduced defects');
else if (failures) process.exitCode = 1;
