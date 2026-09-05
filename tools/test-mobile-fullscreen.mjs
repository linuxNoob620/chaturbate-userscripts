import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const start = source.indexOf('    function prepareWorkshopTouchFullscreen(');
const end = source.indexOf('    async function toggleWorkshopNativeFullscreen(', start);
assert(start >= 0 && end > start);
class Surface extends EventTarget {
  constructor() {
    super();
    this.properties = new Map();
    this.classes = new Set();
    this.style = { setProperty: (k,v) => this.properties.set(k,v), removeProperty: k => this.properties.delete(k) };
    this.classList = { add: k => this.classes.add(k), remove: k => this.classes.delete(k) };
    this.clientWidth = 427;
    this.clientHeight = 931;
  }
  getBoundingClientRect() { return { left: 0, top: 0 }; }
}
const media = new Surface(), video = new Surface(), document = new Surface(), window = new Surface();
video.videoWidth = 1920; video.videoHeight = 1080; video.controls = false;
const context = vm.createContext({ document, window, AbortController, MutationObserver: class { observe() {} disconnect() {} }, innerWidth: 427, innerHeight: 931 });
const prepare = vm.runInContext(`${source.slice(start,end)}; prepareWorkshopTouchFullscreen`, context);
const cleanup = prepare(media, video);
document.fullscreenElement = media;
document.dispatchEvent(new Event('fullscreenchange'));
assert.equal(media.properties.get('--rg-fullscreen-height'), '931px');
assert.equal(video.controls, true);
function touch(type, distance) {
  const event = new Event(type, { cancelable: true });
  event.touches = distance == null ? [] : [{clientX:213-distance,clientY:350},{clientX:213+distance,clientY:350}];
  media.dispatchEvent(event);
}
touch('touchstart',140);
for(let i=1;i<=15;i++) touch('touchmove',140-80*i/15);
touch('touchend');
assert.equal(media.properties.get('--rg-fullscreen-height'), '597px', 'same native pinch sequence must match measured native height');
context.innerWidth = 931; context.innerHeight = 427;
window.dispatchEvent(new Event('resize'));
assert.equal(media.properties.get('--rg-fullscreen-fit'),'contain');
document.fullscreenElement = null;
document.dispatchEvent(new Event('fullscreenchange'));
assert.equal(video.controls,false);
assert.equal(media.properties.size,0);
assert.equal(media.classes.size,0);
cleanup(); // idempotent cleanup, including request rejection
assert(source.includes('body.zmc-room:not(.zmc-fullscreen) .zmc-video-target'));
assert(source.includes('if (room && !anyFullscreen) hideChat();'));
assert(source.includes('if (fullscreen && grid.contains(fullscreen))'));
assert(!source.includes("media.addEventListener('click', event => {"));
console.log('Mobile fullscreen geometry, cleanup and routing regressions passed (not a live parity test).');
