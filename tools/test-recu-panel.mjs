import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';

// Execute the shipped implementation, with a deliberately small fixture DOM.
// These are behavioral unit tests, not evidence of browser interaction/CSP parity.
const source = await readFile(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
function sourceBlock(beginMarker, endMarker) {
  const begin = source.indexOf(beginMarker);
  const end = source.indexOf(endMarker, begin);
  assert.ok(begin >= 0 && end > begin, `Implementation block missing: ${beginMarker}`);
  return source.slice(begin, end);
}
const extractor = sourceBlock('  function extractRecuPerformerPayload(', '  // Recu.me rejects background HTTP requests');
const bridgeConstants = sourceBlock("  const RECU_BRIDGE_PARAM = 'ziggy_suite_bridge';", '  function extractRecuPerformerPayload(');
const helperImplementation = sourceBlock("  const RECU_BRIDGE_PARAM = 'ziggy_suite_bridge';", '  // Own the complete bundled runtime, not just its first component.');
const panelImplementation = sourceBlock("    const RECU_TAB_LABEL = 'Recu.me';", '    // ---- Suite room dock ----');

class Element {
  constructor(tag = 'div', props = {}, children = []) {
    this.tagName = tag.toUpperCase();
    this.attributes = {};
    this.dataset = {};
    this.style = {};
    this.children = [];
    this.listeners = new Map();
    this.attributeObservers = new Map();
    this.isConnected = true;
    this.parentElement = null;
    for (const [name, value] of Object.entries(props)) {
      if (name === 'dataset') Object.assign(this.dataset, value);
      else if (name === 'textContent') this.textContent = value;
      else this.setAttribute(name, value);
    }
    this.append(...(Array.isArray(children) ? children : [children]));
  }
  get textContent() { return this.children.map(child => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(value) { this.children = [String(value)]; }
  get className() { return this.attributes.class || ''; }
  set className(value) { this.setAttribute('class', value); }
  get classList() {
    return {
      contains: value => this.className.split(/\s+/).includes(value),
      add: value => { if (!this.classList.contains(value)) this.className += ` ${value}`; },
      remove: value => { this.className = this.className.split(/\s+/).filter(x => x !== value).join(' '); },
      toggle: (value, force) => {
        const added = force ?? !this.classList.contains(value);
        this.classList[added ? 'add' : 'remove'](value);
        return added;
      },
    };
  }
  getAttribute(name) {
    if (name.startsWith('data-')) return this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] ?? null;
    return this.attributes[name] ?? null;
  }
  setAttribute(name, value) {
    const before = this.getAttribute(name);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    else this.attributes[name] = String(value);
    if (before !== String(value)) for (const [observer, options] of this.attributeObservers) {
      if (options.attributes && (!options.attributeFilter || options.attributeFilter.includes(name))) {
        queueMicrotask(() => observer.callback([{ type: 'attributes', target: this, attributeName: name }], observer));
      }
    }
  }
  removeAttribute(name) { delete this.attributes[name]; }
  append(...children) { for (const child of children) this.appendChild(child); }
  prepend(...children) {
    for (const child of children) if (child instanceof Element) child.parentElement = this;
    this.children.unshift(...children);
  }
  appendChild(child) {
    if (child instanceof Element) child.parentElement = this;
    this.children.push(child);
    return child;
  }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
    this.isConnected = false;
  }
  addEventListener(name, fn) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(fn);
  }
  removeEventListener(name, fn) { this.listeners.set(name, (this.listeners.get(name) || []).filter(x => x !== fn)); }
  contains(node) { return node === this || this.children.some(child => child instanceof Element && child.contains(node)); }
  matches(selector) {
    const tag = selector.match(/^[a-z][a-z0-9-]*/i)?.[0];
    if (tag && tag.toUpperCase() !== this.tagName) return false;
    for (const match of selector.matchAll(/\.([\w-]+)/g)) if (!this.classList.contains(match[1])) return false;
    for (const match of selector.matchAll(/#([\w-]+)/g)) if (this.getAttribute('id') !== match[1]) return false;
    for (const match of selector.matchAll(/\[([\w-]+)(?:([~^$*]?=)["']?([^\]"']*)["']?)?\]/g)) {
      const value = this.getAttribute(match[1]);
      if (value === null) return false;
      if (match[2] === '=' && value !== match[3]) return false;
      if (match[2] === '~=' && !value.split(/\s+/).includes(match[3])) return false;
      if (match[2] === '^=' && !value.startsWith(match[3])) return false;
    }
    return true;
  }
  querySelectorAll(selectors) {
    const descendants = [];
    const visit = node => { for (const child of node.children) if (child instanceof Element) { descendants.push(child); visit(child); } };
    visit(this);
    return descendants.filter(node => selectors.split(',').some(selector => {
      const parts = selector.trim().replace(/^:scope\s*>?\s*/, '').split(/\s+/).filter(part => part !== '>');
      if (!node.matches(parts.pop())) return false;
      let ancestor = node.parentElement;
      while (parts.length) {
        const part = parts.pop();
        while (ancestor && !ancestor.matches(part)) ancestor = ancestor.parentElement;
        if (!ancestor) return false;
        ancestor = ancestor.parentElement;
      }
      return true;
    }));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node; return null; }
}
const el = (tag, props, children) => new Element(tag, props, children);
const textNode = (className, text) => el('span', { class: className }, text);
const plain = value => JSON.parse(JSON.stringify(value));
const settle = () => new Promise(resolve => setImmediate(resolve));
async function assertSettles(promise, message) {
  let timer;
  try {
    assert.equal(await Promise.race([
      promise.then(() => true, () => true),
      new Promise(resolve => { timer = setTimeout(() => resolve(false), 200); }),
    ]), true, message);
  } finally { clearTimeout(timer); }
}

function fixture({ storage = new Map(), intersection = false } = {}) {
  const requests = [];
  const gmStored = new Map(), intervals = new Map(), documents = new Map(), helperTabs = [];
  const observers = [];
  let intervalId = 0;
  let now = 1_800_000_000_000;
  const document = new Element('document');
  document.head = new Element('head');
  document.hidden = false;
  const context = vm.createContext({
    console, URL, URLSearchParams, Blob, Uint32Array, AbortController, crypto: webcrypto,
    Date: class extends Date { static now() { return now; } },
    document, window: { addEventListener() {}, matchMedia: () => ({ matches: false }) },
    sessionStorage: {
      getItem: name => storage.get(name) ?? null,
      setItem: (name, value) => storage.set(name, String(value)),
      removeItem: name => storage.delete(name),
    },
    setTimeout, clearTimeout,
    setInterval(fn) { intervals.set(++intervalId, fn); return intervalId; },
    clearInterval(id) { intervals.delete(id); },
    requestAnimationFrame: fn => setTimeout(fn, 0), cancelAnimationFrame: clearTimeout,
    $: el, trustedHtml: x => x, contextOnly: true, nativeMobilePage: false,
    isWorkshopRoute: () => false, isRecorderHubRoute: () => false,
    recuProfileUrl: room => `https://recu.me/performer/${encodeURIComponent(room)}`,
    currentRoom: 'alpha',
    MutationObserver: class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); }
      observe(target, options) { target.attributeObservers.set(this, options); this.targets.add(target); }
      disconnect() { for (const target of this.targets) target.attributeObservers.delete(this); this.targets.clear(); }
    },
    DOMParser: class { parseFromString(html) { return documents.get(html) || performerDocument({ identity: html || 'alpha' }); } },
    GM_getValue: (name, fallback) => gmStored.get(name) ?? fallback,
    GM_setValue: (name, value) => gmStored.set(name, value),
    GM_deleteValue: name => gmStored.delete(name),
    GM_openInTab(url, options) {
      const helper = { url, options, closed: false, close() { this.closed = true; } };
      helperTabs.push(helper);
      return helper;
    },
    GM_xmlhttpRequest(options) {
      const request = { options, aborted: false, abort() { this.aborted = true; options.onabort?.(); } };
      requests.push(request);
      return request;
    },
  });
  if (intersection) context.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(node) { this.observed.add(node); }
    unobserve(node) { this.observed.delete(node); }
    disconnect() { this.observed.clear(); }
  };
  vm.runInContext(`${bridgeConstants}\n${extractor}\n${panelImplementation}\n;globalThis.api = {
    extractRecuPerformerPayload, safeRecuLink, safeRecuImage, safeRecuPageUrl,
    sanitizeRecuProfilePayload, readRecuCache, writeRecuCache,
    requestRecuProfile, cancelRecuRequests, loadRecuRoomPanel, loadMoreRecuRecordings, observeRecuThumbnails,
    ensureRecuRoomTab, ensureRecuMobileMenu, setRecuMobileOpen,
    setRoom(room) { currentRoom = room; },
    generation() { return recuRequestGeneration; }
  };`, context, { filename: 'recu-panel-extracted.js' });
  return {
    api: context.api, context, requests, document, storage, documents, gmStored, helperTabs, intervals,
    now: () => now, advance: ms => { now += ms; }, tickIntervals: () => { for (const fn of [...intervals.values()]) fn(); },
    intersect: () => { for (const observer of observers) observer.callback([...observer.observed].map(target => ({ target, isIntersecting: true }))); },
  };
}

function recording(id, { href = `/alpha/video/${id}/play`, image = 'https://img.mediafront.net/poster.jpg', previewImage = 'https://img.mediafront.net/sprite.jpg' } = {}) {
  return el('div', { class: 'video-thumb', dataset: { id } }, [
    el('a', href === null ? {} : { href }, 'Open recording'),
    el('div', { class: 'video-splash animate-on-hover', dataset: { bg: image, src: previewImage } }),
    textNode('video-time', ' 01:23 '),
    textNode('video-date', ' 2026-09-09 '),
    textNode('video-views', ' 1,234 views '),
  ]);
}
function performerDocument({ identity = 'alpha', heading = identity, cards = [recording('101')], next = '/performer/alpha/latest', latest = false } = {}) {
  return el('document', {}, [
    el('h1', { class: 'page-h1' }, [el('a', { class: 'performer-link', href: `/performer/${identity}` }, heading)]),
    el('div', { class: 'performer-attrs' }, [textNode('performer-attr', ' Country:   Germany '), textNode('performer-attr', ' Recordings: 10 See statistics ')]),
    el('div', { class: latest ? 'performer-page-videos' : 'performer-overview' }, [
      ...cards,
      ...(next && !latest ? [el('a', { href: next }, 'Show all')] : []),
    ]),
    ...(next && latest ? [el('nav', { class: 'pagination' }, [el('a', { 'aria-label': 'Next', href: next }, 'Next')])] : []),
  ]);
}

function helperFixture({ pending = true, token = true, recognized = true, room = 'alpha', latest = false } = {}) {
  const id = '11111111-2222-4333-8444-555555555555';
  const key = `ziggy_recu_bridge_v1_${id}`;
  const stored = new Map();
  const writes = [], timers = [];
  let closes = 0;
  const document = recognized ? performerDocument({ identity: room, latest, cards: [], next: '' }) : el('document', {}, []);
  document.readyState = 'complete';
  if (pending) stored.set(key, JSON.stringify({ token: id, room, pending: true, at: Date.now() }));
  vm.runInNewContext(`(function() { ${helperImplementation} })();`, {
    URL, URLSearchParams, document,
    location: new URL(`https://recu.me/performer/${room}${latest ? '/latest' : ''}${token ? `?ziggy_suite_bridge=${id}` : ''}`),
    GM_getValue: (name, fallback) => stored.get(name) ?? fallback,
    GM_setValue(name, value) { writes.push({ name, value }); stored.set(name, value); },
    window: { close() { closes++; } },
    setTimeout(fn, ms) { timers.push({ fn, ms }); },
  });
  return { key, stored, writes, timers, closes: () => closes };
}

{
  const normal = helperFixture({ token: false, pending: false });
  assert.equal(normal.writes.length, 0, 'ordinary Recu.me visits must not write relay data');
  assert.equal(normal.timers.length, 0, 'ordinary Recu.me visits must not start helper polling');
  assert.equal(normal.closes(), 0, 'ordinary Recu.me visits must stay open');
  const success = helperFixture();
  assert.equal(success.writes.length, 1);
  assert.equal(JSON.parse(success.writes[0].value).payload.room, 'alpha');
  success.timers[0].fn();
  assert.equal(success.closes(), 1, 'a successful helper closes itself');
  const revoked = helperFixture({ pending: false });
  assert.equal(revoked.writes.length, 0);
  assert.equal(revoked.closes(), 1, 'a helper without a pending owner must immediately close');
  const cancelled = helperFixture({ recognized: false });
  assert.equal(cancelled.timers.length, 1);
  cancelled.stored.delete(cancelled.key);
  cancelled.timers[0].fn();
  assert.equal(cancelled.writes.length, 0, 'a cancelled helper must not recreate its storage key');
  assert.equal(cancelled.closes(), 1);
  for (const room of ['latest_model', 'latest']) {
    const profile = helperFixture({ room });
    assert.equal(profile.writes.length, 1, `a profile username beginning with latest is not a listing route: ${room}`);
    assert.equal(JSON.parse(profile.writes[0].value).payload.room, room);
    const listing = helperFixture({ room, latest: true });
    assert.equal(listing.writes.length, 1, `the same username still supports the actual latest listing route: ${room}`);
  }
}

{
  const { api } = fixture();
  for (const value of [undefined, null, '', '   ']) assert.equal(api.safeRecuLink(value), '', 'missing links must not resolve to the home page');
  assert.equal(api.safeRecuLink('', '/performer/alpha'), 'https://recu.me/performer/alpha');
  assert.equal(api.safeRecuLink('/video/101/alpha'), 'https://recu.me/video/101/alpha');
  for (const value of ['http://recu.me/video/101', 'javascript:alert(1)', 'https://recu.me.evil.example/video/101', 'https://evil.example/recu.me/video/101', 'https://user:pass@recu.me/video/101']) {
    assert.equal(api.safeRecuLink(value), '', `unsafe recording URL: ${value}`);
  }
  assert.equal(api.safeRecuImage('https://img.mediafront.net/poster.jpg'), 'https://img.mediafront.net/poster.jpg');
  for (const value of ['', 'http://mediafront.net/x.jpg', 'https://mediafront.net.evil.example/x.jpg', 'https://recu.me/x.jpg', 'data:image/png;base64,AAAA']) assert.equal(api.safeRecuImage(value), '');
  for (const suffix of ['', '/latest', '/latest/page/2']) {
    const url = `https://recu.me/performer/alpha${suffix}`;
    assert.equal(api.safeRecuPageUrl(url, 'alpha'), url);
  }
  for (const value of ['', '/performer/alphabeta', '/performer/beta/latest', '/performer/alpha/follow', '/performer/alpha/latest/page/0', '/performer/alpha/latest/page/2/follow', 'https://evil.example/performer/alpha/latest']) {
    assert.equal(api.safeRecuPageUrl(value, 'alpha'), '', `unsafe pagination URL: ${value}`);
  }
}

{
  const { api } = fixture();
  const profile = api.extractRecuPerformerPayload(performerDocument(), 'alpha', 'https://recu.me/performer/alpha');
  assert.equal(profile.room, 'alpha');
  assert.deepEqual(plain(profile.details), ['Country: Germany', 'Recordings: 10']);
  assert.equal(profile.recordings[0].url, 'https://recu.me/alpha/video/101/play');
  assert.equal(profile.recordings[0].image, 'https://img.mediafront.net/poster.jpg');
  assert.equal(profile.recordings[0].previewImage, 'https://img.mediafront.net/sprite.jpg');
  assert.equal(profile.recordings[0].duration, '01:23');
  assert.equal(profile.nextUrl, 'https://recu.me/performer/alpha/latest');
  assert.equal(api.extractRecuPerformerPayload(performerDocument({ identity: 'anna' }), 'ann', 'https://recu.me/performer/ann'), null, 'substring model matches must not expose another profile');
  assert.equal(api.extractRecuPerformerPayload(performerDocument({ identity: 'beta', heading: 'alpha' }), 'alpha', 'https://recu.me/performer/alpha'), null, 'heading text must not override identity links');
  assert.ok(api.extractRecuPerformerPayload(performerDocument({ identity: 'ALPHA' }), 'alpha', 'https://recu.me/performer/alpha'));
  const mixed = performerDocument({ cards: [recording('101', { href: null }), recording('102', { href: '' }), recording('103', { href: 'https://evil.example/video/103' }), recording('104'), recording('104'), recording('105', { href: '   ' })] });
  const filtered = api.extractRecuPerformerPayload(mixed, 'alpha', 'https://recu.me/performer/alpha');
  assert.deepEqual(plain(filtered.recordings.map(item => item.id)), ['104'], 'missing, unsafe and duplicate links must be skipped');
  const latest = api.extractRecuPerformerPayload(performerDocument({ latest: true, next: '/performer/alpha/latest/page/2' }), 'alpha', 'https://recu.me/performer/alpha/latest');
  assert.equal(latest.recordings.length, 1);
  assert.equal(latest.nextUrl, 'https://recu.me/performer/alpha/latest/page/2');
  const unrelated = api.extractRecuPerformerPayload(performerDocument({ latest: true, next: '/performer/beta/latest/page/2' }), 'alpha', 'https://recu.me/performer/alpha/latest');
  assert.equal(unrelated.nextUrl, '', 'pagination must not switch models');
  const zeroPage = api.extractRecuPerformerPayload(performerDocument({ latest: true, next: '/performer/alpha/latest/page/0' }), 'alpha', 'https://recu.me/performer/alpha/latest');
  assert.equal(zeroPage.nextUrl, '', 'pagination requires a positive page number');
  const bounded = api.extractRecuPerformerPayload(performerDocument({ cards: Array.from({ length: 80 }, (_, i) => recording(String(1000 + i))) }), 'alpha', 'https://recu.me/performer/alpha');
  assert.equal(bounded.recordings.length, 72, 'a single page payload has a bounded card count');
  const spriteOnly = api.extractRecuPerformerPayload(performerDocument({ cards: [recording('101', { image: '' })] }), 'alpha', 'https://recu.me/performer/alpha');
  assert.equal(spriteOnly.recordings[0].image, '', 'a sprite must not be displayed as a full static poster');
  assert.equal(spriteOnly.recordings[0].previewImage, 'https://img.mediafront.net/sprite.jpg');
}

{
  const { api } = fixture();
  assert.throws(() => api.sanitizeRecuProfilePayload({ room: 'alphabeta' }, 'alpha'), /different model/i);
  const profile = api.sanitizeRecuProfilePayload({
    room: 'alpha', details: ['  Country:  Germany  ', ''], nextUrl: '/performer/beta/latest',
    recordings: [
      { id: '101', url: '/alpha/video/101/play', image: 'https://img.mediafront.net/poster.jpg', previewImage: 'https://evil.example/sprite.jpg' },
      { id: '102', url: '' },
      { id: '103', url: 'javascript:alert(1)' },
      { id: '104', url: '/beta/video/104/play' },
      { id: '105', url: '/alpha/video/999/play' },
      { id: 'x106', url: '/alpha/video/106/play' },
    ],
  }, 'alpha');
  assert.equal(profile.recordings.length, 1);
  assert.equal(profile.recordings[0].previewImage, '');
  assert.equal(profile.nextUrl, '');
  assert.deepEqual(plain(profile.details), ['Country: Germany']);
}

{
  const f = fixture();
  const cached = { details: ['Cached profile'], recordings: [], nextUrl: '' };
  assert.ok(!f.api.readRecuCache('alpha'), 'an unseen room must miss the cache');
  f.api.writeRecuCache('alpha', cached);
  assert.ok(f.api.readRecuCache('alpha'), 'a newly loaded room must be reusable');
  assert.equal(f.api.readRecuCache('alpha').stale, false);
  for (let i = 0; i < 13; i++) f.api.writeRecuCache(`room_${i}`, cached);
  assert.ok(!f.api.readRecuCache('alpha'), 'the room cache must evict its oldest entry');
  assert.ok(!f.api.readRecuCache('room_0'), 'no more than twelve rooms may remain cached');
  for (let i = 1; i < 13; i++) assert.ok(f.api.readRecuCache(`room_${i}`));
}

{
  const f = fixture();
  f.api.writeRecuCache('alpha', { details: ['Cached profile'], recordings: [], nextUrl: '' });
  f.advance(5 * 60 * 1000 + 1);
  assert.equal(f.api.readRecuCache('alpha').stale, true, 'the five-minute freshness window must expire');
  const panel = el('section');
  await f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(panel.dataset.ziggyRecuState, 'loaded', 'stale data should remain immediately usable');
  assert.match(panel.textContent, /Cached profile/);
  assert.equal(f.requests.length, 0, 'restoring stale data must not silently start a background request');
}

{
  const first = fixture();
  first.api.writeRecuCache('alpha', { details: ['Cached across reload'], recordings: [], nextUrl: '' });
  const reloaded = fixture({ storage: first.storage });
  assert.deepEqual(plain(reloaded.api.readRecuCache('alpha').profile.details), ['Cached across reload'], 'session cache survives a userscript reload');
  reloaded.advance(30 * 60 * 1000 + 1);
  assert.ok(!reloaded.api.readRecuCache('alpha'), 'expired retention must not reuse old profile data indefinitely');
}

{
  const f = fixture(), panel = el('section');
  const first = f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(f.requests.length, 1);
  assert.equal(panel.dataset.ziggyRecuState, 'loading');
  f.api.cancelRecuRequests();
  assert.equal(f.requests[0].aborted, true);
  await assertSettles(first, 'a cancelled load must settle rather than leak a pending promise');
  const second = f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(f.requests.length, 2, 'revisiting a cancelled panel must start a new load');
  f.requests[0].options.onload({ status: 200, responseText: 'alpha' });
  assert.equal(panel.dataset.ziggyRecuState, 'loading', 'late cancelled responses must not replace the new load');
  f.requests[1].options.onload({ status: 200, responseText: 'alpha' });
  await second;
  assert.equal(panel.dataset.ziggyRecuState, 'loaded');
  f.api.cancelRecuRequests();
}

{
  const f = fixture(), panel = el('section');
  const first = f.api.loadRecuRoomPanel(panel, 'alpha');
  const replacement = f.api.loadRecuRoomPanel(panel, 'alpha', true);
  assert.equal(f.requests.length, 2);
  f.requests[0].options.onerror();
  f.api.cancelRecuRequests();
  assert.equal(f.requests[1].aborted, true, 'an old error callback must not remove the replacement request handle');
  await assertSettles(Promise.all([first, replacement]), 'all replaced/cancelled loads must settle');
}

{
  const f = fixture(), panel = el('section');
  const loading = f.api.loadRecuRoomPanel(panel, 'alpha');
  f.requests[0].options.onload({ status: 403 });
  assert.equal(f.helperTabs.length, 1, 'HTTP 403 starts exactly one helper');
  assert.equal(f.helperTabs[0].options.active, false);
  const [key, raw] = [...f.gmStored][0], pending = JSON.parse(raw);
  assert.equal(pending.pending, true);
  const response = { token: pending.token, room: 'alpha', at: f.now(), payload: { room: 'alpha', details: ['From helper'], recordings: [], nextUrl: '' } };
  f.gmStored.set(key, JSON.stringify({ ...response, room: 'beta' }));
  f.tickIntervals();
  assert.equal(f.helperTabs[0].closed, false, 'another room cannot complete this helper request');
  f.gmStored.set(key, JSON.stringify({ ...response, at: f.now() - 1 }));
  f.tickIntervals();
  assert.equal(f.helperTabs[0].closed, false, 'data predating this request cannot complete it');
  f.gmStored.set(key, JSON.stringify(response));
  f.tickIntervals();
  await loading;
  assert.equal(panel.dataset.ziggyRecuState, 'loaded');
  assert.match(panel.textContent, /From helper/);
  assert.equal(f.helperTabs[0].closed, true);
  assert.equal(f.gmStored.has(key), false, 'completed relay storage must be removed');
  assert.equal(f.intervals.size, 0, 'completed relay polling must stop');
}

{
  const f = fixture(), panel = el('section');
  const loading = f.api.loadRecuRoomPanel(panel, 'alpha');
  f.requests[0].options.onload({ status: 403 });
  f.api.cancelRecuRequests();
  await assertSettles(loading, 'cancelling a helper-backed request must settle the outer load');
  assert.equal(f.helperTabs[0].closed, true);
  assert.equal(f.gmStored.size, 0);
  assert.equal(f.intervals.size, 0);
  const restarted = f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(f.requests.length, 2, 'a cancelled helper-backed panel remains reusable');
  f.requests[1].options.onload({ status: 200, responseText: 'alpha' });
  await restarted;
  assert.equal(panel.dataset.ziggyRecuState, 'loaded');
}

{
  const f = fixture(), panel = el('section');
  const profile = f.api.extractRecuPerformerPayload(performerDocument({ cards: Array.from({ length: 10 }, (_, i) => recording(String(101 + i))) }), 'alpha');
  f.api.writeRecuCache('alpha', profile);
  await f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(panel.querySelectorAll('.ziggy-recu-recording').length, 8, 'initial rendering stays at eight cards');
  await f.api.loadMoreRecuRecordings(panel, 'alpha');
  assert.equal(panel.querySelectorAll('.ziggy-recu-recording').length, 10);
  assert.equal(f.requests.length, 0, 'already extracted cards need no extra page request');
  f.documents.set('older', performerDocument({ latest: true, cards: [recording('110'), recording('111')], next: '/performer/alpha/latest/page/2' }));
  const older = f.api.loadMoreRecuRecordings(panel, 'alpha');
  assert.equal(f.requests[0].options.url, 'https://recu.me/performer/alpha/latest');
  f.requests[0].options.onload({ status: 200, responseText: 'older' });
  await older;
  assert.equal(panel.querySelectorAll('.ziggy-recu-recording').length, 11, 'overlapping pages must not duplicate recording cards');
  assert.equal(panel.dataset.ziggyRecuState, 'loaded');
}

{
  const f = fixture({ intersection: true }), panel = el('section');
  f.document.appendChild(el('a', { class: 'tabLink tabOpen', 'data-testid': 'room-tab-Share' }));
  const profile = f.api.extractRecuPerformerPayload(performerDocument(), 'alpha');
  f.api.writeRecuCache('alpha', profile);
  await f.api.loadRecuRoomPanel(panel, 'alpha');
  assert.equal(f.requests.length, 0, 'offscreen thumbnails must not start background GM requests');
  f.intersect();
  assert.equal(f.requests.length, 1, 'a visible thumbnail may start its request');
  f.requests[0].options.onerror();
  await settle();
  assert.match(panel.querySelector('.ziggy-recu-placeholder').textContent, /unavailable/i);
  f.api.observeRecuThumbnails(panel); f.intersect();
  await settle();
  assert.equal(f.requests.length, 1, 'a failed thumbnail must not retry on every DOM/visibility rescan');
  f.api.cancelRecuRequests();
}

{
  const f = fixture({ intersection: true }), panel = el('section');
  f.document.appendChild(el('a', { class: 'tabLink tabOpen', 'data-testid': 'room-tab-Share' }));
  const profile = f.api.extractRecuPerformerPayload(performerDocument({ cards: [recording('101', { image: '' })] }), 'alpha');
  f.api.writeRecuCache('alpha', profile);
  await f.api.loadRecuRoomPanel(panel, 'alpha');
  f.intersect();
  await settle();
  assert.match(panel.querySelector('.ziggy-recu-placeholder').textContent, /unavailable/i, 'missing image URLs must not leave a permanent loading placeholder');
  assert.equal(f.requests.length, 0);
  f.api.cancelRecuRequests();
}

{
  const f = fixture(), tab = el('a', { class: 'tabLink tabOpen', 'data-testid': 'room-tab-Share' }), panel = el('div', { id: 'shareTab' });
  f.context.contextOnly = false;
  f.document.append(tab, el('div', { id: 'roomTabs' }, [panel]));
  f.api.ensureRecuRoomTab();
  assert.equal(f.requests.length, 1);
  tab.classList.remove('tabOpen');
  await settle();
  assert.equal(f.requests[0].aborted, true, 'an attributes-only native tab switch must cancel the active load');
  assert.equal(panel.dataset.ziggyRecuState, 'idle');
  tab.classList.add('tabOpen');
  await settle();
  assert.equal(f.requests.length, 2, 'attributes-only return to Recu.me must restart a cancelled load');
  panel.remove();
  f.api.ensureRecuRoomTab();
  assert.equal(f.requests[1].aborted, true, 'removing the native panel must cancel its request');
  await settle();
}

{
  const f = fixture(), panel = el('div');
  const loading = f.api.loadRecuRoomPanel(panel, 'alpha');
  f.context.contextOnly = false;
  f.context.isWorkshopRoute = () => true;
  f.api.ensureRecuRoomTab();
  assert.equal(f.requests[0].aborted, true, 'entering an unsupported route cancels an active Recu.me request');
  await assertSettles(loading, 'route-change cancellation must settle');
}

{
  const f = fixture();
  f.context.contextOnly = false; f.context.nativeMobilePage = true;
  const nativeItem = el('div', { class: 'native-menu-item' }, 'Native item');
  const host = el('div', { 'data-testid': 'additional-options-container' }, [nativeItem]);
  const menuTab = el('li', { class: 'roomMenu activeTab' });
  f.document.appendChild(el('div', { id: 'portrait-contents' }, [menuTab, host]));
  f.api.ensureRecuRoomTab();
  const container = host.querySelector('#ziggy-recu-mobile-panel');
  const back = container.querySelector('.ziggy-recu-mobile-back');
  const panel = container.children[1];
  f.api.setRecuMobileOpen(true);
  assert.equal(f.requests.length, 1);
  assert.equal(host.querySelector('.ziggy-recu-mobile-back'), back, 'loading must retain the exact Back button node');
  f.requests[0].options.onload({ status: 404 });
  await settle();
  assert.equal(panel.dataset.ziggyRecuState, 'error');
  assert.equal(host.querySelector('.ziggy-recu-mobile-back'), back, 'error rendering must retain Back');
  f.documents.set('empty-profile', performerDocument({ cards: [], next: '' }));
  const retry = f.api.loadRecuRoomPanel(panel, 'alpha', true);
  f.requests[1].options.onload({ status: 200, responseText: 'empty-profile' });
  await retry;
  assert.equal(host.querySelector('.ziggy-recu-mobile-back'), back, 'successful rendering must retain Back');
  const refresh = f.api.loadRecuRoomPanel(panel, 'alpha', true);
  menuTab.classList.remove('activeTab');
  await settle();
  assert.equal(f.requests[2].aborted, true, 'leaving the native mobile menu cancels a refresh');
  await assertSettles(refresh, 'mobile menu cancellation must settle');
  assert.equal(host.querySelector('.ziggy-recu-mobile-back'), back, 'cancelled refresh must retain Back');
  back.listeners.get('click')[0]();
  assert.equal(container.hidden, true);
  assert.equal(nativeItem.classList.contains('ziggy-recu-mobile-hidden'), false, 'Back restores native menu contents');
}

console.log('Recu.me behavior: helper ownership/protocol, URL allowlists, exact identity, missing links, lazy thumbnail failure states, preview assets, pagination/deduplication, payload sanitization, bounded caching, stale reuse, cancellation, native selection, and stable mobile Back passed.');
