import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../standalone/recu-responsive/storyboards.js', import.meta.url), 'utf8');
const frame = (start = 0, end = start + 10, text = 'sheet.jpg', extra = {}) =>
  ({ startTime: start, endTime: end, text, x: 0, y: 0, w: 256, h: 144, ...extra });
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };
let checks = 0;
async function check(label, run) { await run(); checks++; console.log(`PASS ${label}`); }

function harness({ decode = true, throwImage = false, throwSource = false } = {}) {
  const images = [], timers = new Map(), starts = [], changes = [];
  let timerID = 0;
  class FakeImage {
    constructor() {
      if (throwImage) throw new Error('Image construction unavailable');
      this.naturalWidth = 0; this.naturalHeight = 0; this._src = ''; this.decodeCalls = 0;
      this.removed = 0;
      if (!decode) this.decode = undefined;
      images.push(this);
    }
    set src(value) {
      if (throwSource) throw new Error('Source assignment unavailable');
      this._src = value; starts.push(value);
    }
    get src() { return this._src; }
    removeAttribute(name) { assert.equal(name, 'src'); this._src = ''; this.removed++; }
    load(width = 32768, height = 144) { this.naturalWidth = width; this.naturalHeight = height; this.onload?.(); }
    fail() { this.onerror?.(); }
    decode() {
      this.decodeCalls++;
      return new Promise((resolve, reject) => { this.resolveDecode = resolve; this.rejectDecode = reject; });
    }
  }
  const context = vm.createContext({ URL, Image: FakeImage,
    setTimeout(fn) { const id = ++timerID; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(`${source}\nglobalThis.RRPTest = RRPStoryboards;`, context);
  const create = (frames, extra = {}) => new context.RRPTest({ frames, baseUrl: 'https://example.invalid/vtt/sample.vtt',
    onChange: state => changes.push({ ...state }), ...extra });
  const status = subject => ({ ...subject.status() });
  return { images, timers, starts, changes, create, status };
}

await check('construction is network-idle and resolves relative URLs without a fragment', async () => {
  const h = harness();
  const subject = h.create([frame()]);
  assert.equal(h.images.length, 0);
  assert.deepEqual(h.status(subject), { ready: 0, total: 1, failed: 0 });
  assert.equal(subject.get(4), null);
  subject.prepare(4);
  assert.deepEqual(h.starts, ['https://example.invalid/vtt/sheet.jpg']);
  h.images[0].load();
  assert.equal(h.images[0].decodeCalls, 1);
  assert.equal(subject.get(4), null, 'load alone is not decode readiness');
  h.images[0].resolveDecode(); await settle();
  assert.equal(subject.get(4).image, h.images[0]);
  assert.deepEqual(h.status(subject), { ready: 1, total: 1, failed: 0 });
  assert.equal(h.timers.size, 0);
  subject.dispose();
});

await check('sorted sampled cues use binary-search coverage, boundaries, and no stale gaps', async () => {
  const h = harness();
  const subject = h.create([frame(30, 40, 'a.jpg', { x: 512 }), frame(0, 10, 'a.jpg'), frame(10, 20, 'a.jpg', { x: 256 })]);
  subject.prepare(0); h.images[0].load(); h.images[0].resolveDecode(); await settle();
  assert.equal(subject.get(0).x, 0);
  assert.equal(subject.get(9.999).x, 0);
  assert.equal(subject.get(10).x, 256);
  for (const time of [20, 25, 29.999, -1, NaN, Infinity, '5', 40.001]) assert.equal(subject.get(time), null);
  assert.equal(subject.get(30).x, 512);
  assert.equal(subject.get(40).x, 512);
  const sample = subject.get(13.4);
  assert.equal(sample.start, 10); assert.equal(sample.end, 20);
  assert.equal(h.starts.length, 1, 'many samples share one sprite request');
  subject.dispose();
});

await check('xywh parsing supports relative and absolute sources and explicit coordinate precedence', async () => {
  const h = harness();
  const subject = h.create([
    { startTime: 0, endTime: 10, text: '../sheet.jpg#xywh=256,144,256,144' },
    { startTime: 10, endTime: 20, text: 'https://example.invalid/sheet.jpg#xywh=pixel:512,0,256,144' },
    frame(20, 30, 'https://example.invalid/sheet.jpg#xywh=999,999,1,1', { x: '768' }),
  ]);
  subject.prepare(0); assert.equal(h.images.length, 1);
  assert.equal(h.starts[0], 'https://example.invalid/sheet.jpg');
  h.images[0].load(32768, 288); h.images[0].resolveDecode(); await settle();
  assert.equal(subject.get(5).x, 256); assert.equal(subject.get(5).y, 144);
  assert.equal(subject.get(15).x, 512); assert.equal(subject.get(25).x, 768);
  subject.dispose();
});

await check('invalid URLs, nonfinite times, malformed dimensions and overlapping cues are excluded', async () => {
  const h = harness();
  const invalid = [null, {}, frame(0, 0), frame(-1, 1), frame(NaN), frame(0, Infinity),
    frame(0, 10, ''), frame(0, 10, '  '),
    frame(0, 10, 'javascript:alert(1)'), frame(0, 10, 'data:image/png;base64,AA=='),
    frame(0, 10, 'https://user:password@example.invalid/a.jpg'), frame(0, 10, 'blob:https://example.invalid/id'),
    frame(0, 10, 'file:///c:/photo.jpg'), frame(0, 10, 'a.jpg', { w: 0 }),
    frame(0, 10, 'a.jpg', { h: -1 }), frame(0, 10, 'a.jpg', { x: -1 }),
    frame(0, 10, 'a.jpg', { x: 0.5 }), frame(0, 10, 'a.jpg', { w: 4097 }),
    frame(0, 10, 'a.jpg', { x: 65536 }), frame(0, 10, 'a.jpg', { y: Infinity }),
    frame(0, 10, 'a.jpg', { startTime: null }), frame(0, 10, 'a.jpg', { x: '' }),
    { startTime: 0, endTime: 10, text: 'a.jpg#xywh=0,0,0,1' },
    frame(0, 10, `https://example.invalid/${'a'.repeat(8192)}`),
  ];
  const subject = h.create([...invalid, frame(), frame(5, 15, 'overlap.jpg'), frame(20, 30)]);
  assert.deepEqual(h.status(subject), { ready: 0, total: 1, failed: 0 });
  subject.prepare(0); h.images[0].load(); h.images[0].resolveDecode(); await settle();
  assert.equal(subject.get(12), null);
  assert.equal(subject.get(22).start, 20);
  assert.equal(h.starts.length, 1);
  subject.dispose();
});

await check('owning sprite and immediate neighbor load first with maximum concurrency two', async () => {
  const h = harness();
  const subject = h.create(Array.from({ length: 6 }, (_, i) => frame(i * 10, i * 10 + 10, `${i}.jpg`)));
  subject.prepare(35);
  assert.deepEqual(h.starts.map(url => url.split('/').pop()), ['3.jpg', '4.jpg']);
  h.images[0].load(); assert.equal(h.images.length, 2, 'decoding keeps its concurrency slot');
  h.images[0].resolveDecode(); await settle();
  assert.equal(h.starts[2].split('/').pop(), '2.jpg');
  subject.prepare(55);
  h.images[1].fail();
  assert.equal(h.starts[3].split('/').pop(), '5.jpg', 'queued work follows newest hover');
  assert.equal(subject.active.size, 2);
  while (subject.active.size) {
    for (const image of h.images.filter(image => image.onload)) image.fail();
  }
  assert.equal(h.starts.length, 6);
  assert.deepEqual(h.status(subject), { ready: 1, total: 6, failed: 5 });
  subject.prepare(0); assert.equal(h.starts.length, 6, 'failed sheets do not retry indefinitely');
  subject.dispose();
});

await check('caps distinct sprites at sixteen and input examination at ten thousand cues', () => {
  const h = harness({ decode: false });
  const cues = Array.from({ length: 10001 }, (_, i) => frame(i, i + 1, `${Math.floor(i / 600)}.jpg`));
  Object.defineProperty(cues, 10000, { get() { throw new Error('Must not read beyond cue budget'); } });
  const subject = h.create(cues);
  assert.equal(subject.frames.length, 9600); assert.equal(h.status(subject).total, 16);
  subject.prepare(7000);
  while (subject.active.size) for (const image of h.images.filter(image => image.onload)) image.load(256, 144);
  assert.equal(h.images.length, 16);
  subject.dispose();
});

await check('wide native strip remains usable and crops outside the loaded sheet stay unavailable', async () => {
  const h = harness();
  const subject = h.create([frame(0, 10, 'wide.jpg', { x: 32512 }), frame(10, 20, 'wide.jpg', { x: 32768 })]);
  subject.prepare(0); h.images[0].load(32768, 144); h.images[0].resolveDecode(); await settle();
  assert.equal(subject.get(5).x, 32512);
  assert.equal(subject.get(15), null);
  subject.dispose();
});

await check('retained decoded pixel budget includes in-flight decodes and rejects oversize images', async () => {
  const h = harness();
  const subject = h.create([frame(0, 10, 'a.jpg'), frame(10, 20, 'b.jpg'), frame(20, 30, 'c.jpg')]);
  subject.prepare(0);
  h.images[0].load(4096, 4096);
  h.images[1].load(256, 144);
  assert.equal(h.images[1].decodeCalls, 0);
  h.images[2].load(65537, 1);
  assert.equal(h.images[2].decodeCalls, 0);
  h.images[0].resolveDecode(); await settle();
  assert.deepEqual(h.status(subject), { ready: 1, total: 3, failed: 2 });
  assert.equal(subject.pixels, 16777216);
  subject.dispose(); assert.equal(subject.pixels, 0);
});

await check('error, rejected decode and timeout clear their slots, image sources and timers', async () => {
  for (const mode of ['error', 'decode rejection', 'timeout', 'decode throw']) {
    const h = harness(); const subject = h.create([frame()]); subject.prepare(5);
    const image = h.images[0];
    if (mode === 'error') image.fail();
    if (mode === 'decode rejection') { image.load(); image.rejectDecode(new Error('Corrupt image')); await settle(); }
    if (mode === 'timeout') [...h.timers.values()][0]();
    if (mode === 'decode throw') { image.decode = () => { throw new Error('Unsupported decode'); }; image.load(); }
    assert.deepEqual(h.status(subject), { ready: 0, total: 1, failed: 1 }, mode);
    assert.equal(subject.get(5), null); assert.equal(subject.active.size, 0); assert.equal(subject.pixels, 0);
    assert.equal(h.timers.size, 0); assert.equal(image.src, ''); assert.equal(image.onload, null);
    subject.dispose();
  }
});

await check('disposal cancels pending loads/decodes and makes late callbacks and timers inert', async () => {
  const h = harness();
  const subject = h.create([frame(0, 10, 'a.jpg'), frame(10, 20, 'b.jpg'), frame(20, 30, 'c.jpg')]);
  subject.prepare(0);
  const staleLoad = h.images[1].onload, staleError = h.images[1].onerror, staleTimer = [...h.timers.values()][0];
  h.images[0].load();
  const tickets = [...subject.active], sprites = [...subject.sprites];
  subject.dispose(); subject.dispose();
  h.images[0].resolveDecode(); staleLoad(); staleError(); staleTimer(); await settle();
  subject.prepare(25);
  assert.equal(h.images.length, 2); assert.equal(h.changes.length, 0); assert.equal(h.timers.size, 0);
  assert.equal(subject.get(5), null); assert.equal(subject.active.size, 0); assert.equal(subject.queue.length, 0);
  assert.deepEqual(h.status(subject), { ready: 0, total: 0, failed: 0 });
  for (const image of h.images) { assert.equal(image.src, ''); assert.equal(image.onload, null); assert.equal(image.onerror, null); }
  for (const ticket of tickets) { assert.equal(ticket.owner, null); assert.equal(ticket.image, null); assert.equal(ticket.sprite, null); }
  for (const sprite of sprites) { assert.equal(sprite.url, ''); assert.equal(sprite.image, null); }
});

await check('late decode rejection after timeout neither double-counts failures nor notifies twice', async () => {
  const h = harness(); const subject = h.create([frame()]); subject.prepare(0); h.images[0].load();
  [...h.timers.values()][0]();
  h.images[0].rejectDecode(new Error('Cancelled')); await settle();
  assert.deepEqual(h.status(subject), { ready: 0, total: 1, failed: 1 });
  assert.equal(h.changes.length, 1); assert.equal(subject.pixels, 0); subject.dispose();
});

await check('callback failure cannot stall remaining work and callback disposal cannot restart work', () => {
  for (const dispose of [false, true]) {
    const h = harness({ decode: false }); let calls = 0, subject;
    subject = h.create([frame(0, 10, 'a.jpg'), frame(10, 20, 'b.jpg'), frame(20, 30, 'c.jpg')], {
      onChange() { calls++; if (dispose) subject.dispose(); else throw new Error('UI callback failed'); },
    });
    subject.prepare(0); h.images[0].load();
    assert.equal(calls, 1); assert.equal(h.images.length, dispose ? 2 : 3);
    subject.dispose();
  }
});

await check('empty input, malformed base and Image/source construction failures are contained', () => {
  const h = harness();
  for (const frames of [undefined, null, {}, []]) {
    const subject = h.create(frames); subject.prepare(NaN); assert.equal(subject.get(0), null);
    assert.deepEqual(h.status(subject), { ready: 0, total: 0, failed: 0 }); subject.dispose();
  }
  const absolute = h.create([frame(0, 10, 'https://example.invalid/a.jpg')], { baseUrl: 'invalid' });
  absolute.prepare(0); assert.equal(h.images.length, 1); absolute.dispose();
  for (const options of [{ throwImage: true }, { throwSource: true }]) {
    const failing = harness(options); const subject = failing.create([frame()]);
    subject.prepare(0); assert.deepEqual(failing.status(subject), { ready: 0, total: 1, failed: 1 });
    assert.equal(failing.timers.size, 0); assert.equal(subject.active.size, 0); subject.dispose();
  }
});

console.log(`Storyboard module: ${checks} checks passed.`);
