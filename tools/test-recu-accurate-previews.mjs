import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Recu.me Accurate Timeline Previews.user.js', import.meta.url), 'utf8');
const implementation = source.slice(source.indexOf('  function accurateFrame'), source.indexOf('  const style ='));
const timers = new Map();
let timerID = 0;
class Node extends EventTarget {
  constructor(tag) {
    super(); this.tag = tag; this.style = {}; this.dataset = {}; this.isConnected = true;
    this.children = []; this.classList = { add() {}, remove() {} };
    this.frames = new Map(); this.frameID = 0; this.readyState = 1; this.duration = 100;
    this.videoWidth = 640; this.videoHeight = 360; this.seeking = false; this.currentTime = 0;
  }
  setAttribute() {}
  removeAttribute() {}
  attachShadow() { return new Node('shadow'); }
  append(...nodes) { this.children.push(...nodes); }
  remove() { this.isConnected = false; }
  pause() { this.paused = true; }
  load() {}
  getContext() { return { drawImage() {} }; }
  querySelector() { return { src: 'https://example.invalid/stream.m3u8' }; }
  getBoundingClientRect() { return { left: 0, width: 100 }; }
  requestVideoFrameCallback(fn) { this.frames.set(++this.frameID, fn); return this.frameID; }
  cancelVideoFrameCallback(id) { this.frames.delete(id); }
  present(time) { const jobs = [...this.frames.values()]; this.frames.clear(); for (const job of jobs) job(0, { mediaTime: time }); }
}
class Hls {
  static Events = { MANIFEST_PARSED: 'manifest', ERROR: 'error' };
  static isSupported() { return true; }
  constructor() { this.events = new Map(); this.levels = [{ height: 240 }, { height: 360 }, { height: 1080 }]; this.starts = []; }
  on(type, fn) { this.events.set(type, fn); }
  emit(type, data) { this.events.get(type)?.(type, data); }
  attachMedia(video) { this.video = video; }
  loadSource() {}
  startLoad(time) { this.starts.push(time); }
  stopLoad() { this.stopped = true; }
  destroy() { this.destroyed = true; }
}
const document = { hidden: false, body: new Node('body'), createElement: tag => new Node(tag) };
const context = vm.createContext({ document, location: { href: 'https://recu.me/' }, window: { Hls },
  URL, AbortController, DOMException, TIMEOUT_MS: 10000, DELAY_MS: 220, CACHE_LIMIT: 32,
  setTimeout(fn) { timers.set(++timerID, fn); return timerID; }, clearTimeout(id) { timers.delete(id); },
});
vm.runInContext(`${implementation}\nglobalThis.api = { accurateFrame, targetSecond, chooseLevel, sourceOf, Decoder, Preview };`, context);
const { accurateFrame, targetSecond, chooseLevel, sourceOf, Decoder, Preview } = context.api;
let checks = 0;
function check(label, run) { run(); checks++; console.log(`PASS ${label}`); }

check('only actual timestamps strictly within one second qualify', () => {
  for (const [target, actual, expected] of [[40,40,true],[40,39.95,true],[40,40.999,true],[40,41,false],[40,39,false],[40,NaN,false],[NaN,40,false]]) {
    assert.equal(accurateFrame(target, actual), expected);
  }
});
check('hover seconds are clamped using current geometry and duration', () => {
  assert.equal(targetSecond(35,10,100,100),25);
  assert.equal(targetSecond(-100,10,100,100),0);
  assert.equal(targetSecond(500,10,100,100),99);
  assert.equal(targetSecond(10,10,0,100),null);
  assert.equal(targetSecond(10,10,100,Infinity),null);
});
check('match the actual video rendition and reject unsafe sources', () => {
  assert.equal(chooseLevel([{height:1080},{height:240},{height:360}],1080),0);
  assert.equal(chooseLevel([{height:1080},{height:240},{height:360}],360),2);
  assert.equal(chooseLevel([{height:240},{height:360}],1080),-1);
  assert.equal(chooseLevel([{}],1080),0);
  assert.equal(sourceOf({querySelector:()=>({src:'javascript:alert(1)'})}), '');
  assert.equal(sourceOf({querySelector:()=>({src:'https://example.invalid/stream.m3u8?token=ephemeral'})}), 'https://example.invalid/stream.m3u8?token=ephemeral');
});
{
  const decoder = new Decoder('test',360), abort = new AbortController();
  const pending = decoder.captureFrame(43, abort.signal);
  decoder.hls.emit('manifest');
  decoder.video.present(10);
  check('a stale presented frame does not complete the request', () => assert.equal(decoder.video.frames.size,1));
  decoder.video.present(43.04);
  const result = await pending;
  check('validated frame is captured at bounded dimensions and loading stops', () => {
    assert.equal(result.mediaTime,43.04); assert.equal(result.canvas.width,320); assert.equal(result.canvas.height,180);
    assert.equal(decoder.hls.stopped,true); assert.equal(decoder.video.muted,true);
    assert.equal(decoder.video.frames.size,0); assert.equal(timers.size,0);
  });
  decoder.destroy();
}
for (const mode of ['abort before manifest', 'abort after start', 'timeout', 'fatal']) {
  const decoder = new Decoder('test',360), abort = new AbortController();
  const pending = decoder.captureFrame(43,abort.signal);
  if (mode !== 'abort before manifest') decoder.hls.emit('manifest');
  if (mode.startsWith('abort')) abort.abort();
  if (mode === 'timeout') [...timers.values()][0]();
  if (mode === 'fatal') decoder.hls.emit('error',{fatal:true});
  await assert.rejects(pending);
  check(`${mode}: callbacks and timer cleared; streaming stopped`, () => {
    assert.equal(decoder.video.frames.size,0); assert.equal(timers.size,0); assert.equal(decoder.hls.stopped,true);
  });
  decoder.destroy();
}
function makePreview() {
  const media = new Node('video');
  media.plyr = { elements: { progress: new Node('progress') }, previewThumbnails: {
    elements: { thumb: { container: new Node('thumb'), imageContainer: new Node('image') } },
  } };
  return new Preview(media, sourceOf(media));
}
{
  const decoder = new Decoder('test',360), abort = new AbortController();
  const pending = decoder.captureFrame(200,abort.signal);
  decoder.hls.emit('manifest');
  await assert.rejects(pending);
  check('out-of-range rejection cannot restart network loading after cleanup',()=>{
    assert.equal(decoder.hls.starts.length,0);assert.equal(timers.size,0);
  });
  decoder.destroy();
}
{
  const decoder = new Decoder('test',1080), abort = new AbortController();
  decoder.hls.levels=[{height:240},{height:360}];
  const pending=decoder.capture(20,abort.signal);
  decoder.hls.emit('manifest');
  await assert.rejects(pending);
  check('missing matching rendition fails without silently substituting quality',()=>assert.equal(decoder.hls.starts.length,0));
  decoder.destroy();
}
{
  const decoder = new Decoder('test',1080), abort = new AbortController();
  const pending = decoder.capture(43,abort.signal);
  decoder.hls.emit('manifest');
  check('first decode always establishes the timestamp origin at zero',()=>assert.deepEqual(decoder.hls.starts,[0]));
  decoder.video.seeking = true;
  decoder.video.present(0);
  await Promise.resolve();
  check('presented zero frame before seeked is valid and allows the target decode',()=>assert.deepEqual(decoder.hls.starts,[0,43]));
  decoder.video.present(43.02);
  await pending;
  decoder.destroy();
}
{
  const decoder = new Decoder('test',1080), abort = new AbortController();
  const pending=decoder.capture(43,abort.signal);
  decoder.hls.emit('manifest');
  decoder.video.present(0);
  abort.abort();
  await assert.rejects(pending);
  check('cancel during origin preparation must never resume the target seek',()=>assert.deepEqual(decoder.hls.starts,[0]));
  decoder.destroy();
}
{
  const preview=makePreview();
  preview.move({clientX:20,buttons:0});
  const stale=preview.generation;
  preview.move({clientX:30,buttons:0});
  preview.show({mediaTime:20,canvas:new Node('canvas')},stale);
  check('stale results cannot display after pointer moves',()=>assert.equal(preview.view.hidden,true));
  preview.media.querySelector=()=>({src:'https://example.invalid/new.m3u8'});
  check('source changes invalidate in-flight work before next discovery tick',()=>assert.equal(preview.current(preview.generation),false));
  preview.dispose();
  check('panel disposal removes its nodes and timers',()=>{
    assert.equal(preview.view.isConnected,false); assert.equal(preview.status.isConnected,false); assert.equal(timers.size,0);
  });
}
{
  const preview=makePreview();
  preview.decoder = new Decoder('test',360);
  const old=preview.decoder;
  preview.cancel();
  check('cancelled startup is destroyed, not reused as permanently unready',()=>{
    assert.equal(old.destroyed,true);assert.equal(preview.decoder,null);
  });
  preview.cache.set(20,{canvas:Object.assign(new Node('canvas'),{width:320,height:180}),mediaTime:20,target:20});
  preview.move({clientX:20,buttons:0});
  check('cache hits show a timestamp-validated frame without creating a decoder',()=>{
    assert.equal(preview.thumb.container.dataset.rapState,'ready'); assert.equal(preview.decoder,null); assert.equal(timers.size,0);
  });
  preview.dispose();
}
check('no Suite hooks, privileged grants, playback seeks or autoplay',()=>{
  assert.ok(source.includes('// @grant        none'));
  assert.ok(!/this\.media\.(?:currentTime|volume|muted)\s*=/.test(source));
  assert.ok(!/\.play\(/.test(source));
  assert.ok(!/GM_|chaturbate\.com|localStorage/.test(source));
});
console.log(`${checks} standalone preview checks passed.`);
