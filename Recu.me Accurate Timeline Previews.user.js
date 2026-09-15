// ==UserScript==
// @name         Recu.me Accurate Timeline Previews
// @namespace    https://github.com/linuxNoob620/chaturbate-userscripts
// @version      1.0.0
// @description  Decode seek-bar previews at the displayed second without seeking the main video.
// @author       Ziggy
// @license      MIT
// @match        https://recu.me/*
// @run-at       document-idle
// @grant        none
// @sandbox      raw
// @noframes
// @updateURL    https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Accurate%20Timeline%20Previews.meta.js
// @downloadURL  https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Accurate%20Timeline%20Previews.user.js
// ==/UserScript==

(() => {
  'use strict';
  const VERSION = '1.0.0';
  const MARKER = 'recu-accurate-previews';
  const DELAY_MS = 220;
  const TIMEOUT_MS = 10000;
  const CACHE_LIMIT = 32;
  if (document.getElementById(MARKER)) return;

  // A presented frame timestamp, not currentTime or a sprite cue, is the proof.
  function accurateFrame(target, mediaTime) {
    return Number.isFinite(target) && Number.isFinite(mediaTime) && Math.abs(target - mediaTime) < 1;
  }
  function targetSecond(clientX, left, width, duration) {
    if (!(width > 0) || !Number.isFinite(duration) || duration <= 0) return null;
    return Math.floor(Math.max(0, Math.min(duration - 1, duration * (clientX - left) / width)));
  }
  function chooseLevel(levels, height) {
    const index = levels.findIndex(level => level.height === height);
    // A single unspecified rendition is the source itself. With multiple
    // qualities, never silently substitute a different content timeline.
    return index >= 0 ? index : levels.length === 1 && !levels[0].height ? 0 : -1;
  }
  function sourceOf(media) {
    const raw = media.querySelector('source')?.src || media.currentSrc;
    try {
      const url = new URL(raw, location.href);
      return url.protocol === 'https:' && /\.m3u8$/i.test(url.pathname) ? url.href : '';
    } catch { return ''; }
  }
  function abortError() { return new DOMException('Preview cancelled', 'AbortError'); }

  class Decoder {
    constructor(source, height) {
      this.destroyed = false;
      this.host = document.createElement('div');
      this.host.setAttribute('aria-hidden', 'true');
      this.host.style.cssText = 'position:fixed;left:-10000px;top:0;width:320px;height:180px;pointer-events:none;';
      const shadow = this.host.attachShadow({ mode: 'closed' });
      this.video = document.createElement('video');
      this.video.muted = true;
      this.video.defaultMuted = true;
      this.video.volume = 0;
      this.video.playsInline = true;
      this.video.preload = 'none';
      this.video.tabIndex = -1;
      this.video.style.cssText = 'width:320px;height:180px;';
      shadow.append(this.video);
      const Hls = window.Hls;
      this.hls = new Hls({
        autoStartLoad: false, maxBufferLength: 2, maxMaxBufferLength: 4,
        maxBufferSize: 2 * 1024 * 1024, backBufferLength: 0,
        fragLoadingMaxRetry: 0, manifestLoadingMaxRetry: 0, levelLoadingMaxRetry: 0,
      });
      this.ready = false;
      this.fatal = false;
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (this.destroyed) return;
        // Match the active rendition; do not assume differently encoded
        // qualities have exactly interchangeable content timelines.
        const index = chooseLevel(this.hls.levels, height);
        if (index < 0) {
          this.fatal = true;
          this.onError?.(new Error('Matching video quality unavailable'));
          return;
        }
        this.hls.loadLevel = index;
        this.hls.startLevel = index;
        this.ready = true;
        this.onReady?.();
      });
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.fatal = true;
          this.onError?.(new Error('Preview stream unavailable'));
        }
      });
      try {
        document.body.append(this.host);
        this.hls.attachMedia(this.video);
        this.hls.loadSource(source);
      } catch {
        this.destroy();
        throw new Error('Preview initialization failed');
      }
    }

    async capture(target, signal) {
      // HLS derives its PTS origin from the first fragment it decodes. Starting
      // directly in the middle can produce plausible timestamps for the WRONG
      // frames. Anchor at the beginning, just as the native player does.
      if (!this.primed) {
        const first = await this.captureFrame(0, signal);
        if (signal.aborted || this.destroyed) throw abortError();
        this.primed = true;
        if (target === 0) return first;
      }
      if (signal.aborted || this.destroyed) throw abortError();
      return this.captureFrame(target, signal);
    }

    captureFrame(target, signal) {
      if (this.destroyed || signal.aborted) return Promise.reject(abortError());
      if (this.fatal) return Promise.reject(new Error('Preview stream unavailable'));
      return new Promise((resolve, reject) => {
        const video = this.video;
        let frameId = null;
        let finished = false;
        let seekSet = false;
        const finish = (error, result) => {
          if (finished) return;
          finished = true;
          clearTimeout(timeout);
          if (frameId !== null) video.cancelVideoFrameCallback(frameId);
          video.removeEventListener('loadedmetadata', seek);
          video.removeEventListener('durationchange', seek);
          video.removeEventListener('error', failed);
          signal.removeEventListener('abort', cancelled);
          this.onReady = null;
          this.onError = null;
          this.stop();
          if (error) reject(error); else resolve(result);
        };
        const cancelled = () => finish(abortError());
        const failed = () => finish(new Error('Preview decoding unavailable'));
        const seek = () => {
          if (finished || seekSet || video.readyState < 1 || !Number.isFinite(video.duration)) return;
          if (target >= video.duration) { finish(new Error('Preview time outside source')); return; }
          seekSet = true;
          try { video.currentTime = target; } catch { failed(); }
        };
        const frame = (_now, metadata) => {
          if (finished) return;
          frameId = null;
          // Chrome can deliver the presented frame BEFORE its seeked event.
          // Rejecting it based on video.seeking can wait forever on a paused
          // decoder. The presented timestamp itself is the accuracy gate.
          if (seekSet && accurateFrame(target, metadata.mediaTime)) {
            try {
              const canvas = document.createElement('canvas');
              const scale = Math.min(320 / video.videoWidth, 180 / video.videoHeight);
              canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
              canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
              finish(null, { canvas, mediaTime: metadata.mediaTime, target });
            } catch { failed(); }
          } else {
            frameId = video.requestVideoFrameCallback(frame);
          }
        };
        const start = () => {
          if (finished) return;
          seek();
          if (!finished) {
            try { this.hls.startLoad(target); } catch { failed(); }
          }
        };
        const timeout = setTimeout(() => finish(new Error('Accurate preview timed out')), TIMEOUT_MS);
        signal.addEventListener('abort', cancelled, { once: true });
        video.addEventListener('loadedmetadata', seek);
        video.addEventListener('durationchange', seek);
        video.addEventListener('error', failed, { once: true });
        frameId = video.requestVideoFrameCallback(frame);
        this.onReady = start;
        this.onError = error => finish(error);
        if (this.ready) start();
      });
    }

    stop() {
      if (this.destroyed) return;
      this.video.pause();
      this.hls.stopLoad();
    }
    destroy() {
      if (this.destroyed) return;
      this.stop();
      this.destroyed = true;
      this.onReady = null;
      this.onError = null;
      this.hls.destroy();
      this.video.removeAttribute('src');
      this.video.load();
      this.host.remove();
    }
  }

  class Preview {
    constructor(media, source) {
      this.media = media;
      this.source = source;
      this.height = media.videoHeight;
      this.player = media.plyr;
      this.progress = this.player.elements.progress;
      this.thumb = this.player.previewThumbnails.elements.thumb;
      this.container = this.thumb.imageContainer;
      this.cache = new Map();
      this.generation = 0;
      this.disposed = false;
      this.hovering = false;
      this.target = null;
      this.decoder = null;
      this.view = document.createElement('canvas');
      this.view.className = 'rap-frame';
      this.view.setAttribute('aria-hidden', 'true');
      this.status = document.createElement('span');
      this.status.className = 'rap-status';
      this.container.append(this.view, this.status);
      this.handlers = [
        [this.progress, 'mousemove', event => this.move(event)],
        [this.progress, 'mouseleave', () => this.leave()],
        [this.progress, 'mousedown', () => this.leave()],
        [this.progress, 'touchstart', () => this.leave()],
        [media, 'emptied', () => this.dispose()],
      ];
      for (const [node, type, handler] of this.handlers) node.addEventListener(type, handler, { passive: true });
    }

    move(event) {
      if (this.disposed || event.buttons || document.hidden || !this.media.isConnected) return;
      const rect = this.progress.getBoundingClientRect();
      const target = targetSecond(event.clientX, rect.left, rect.width, this.media.duration);
      if (target === null || (this.hovering && this.target === target)) return;
      this.hovering = true;
      this.target = target;
      const generation = ++this.generation;
      this.cancel();
      clearTimeout(this.idleTimer);
      this.container.classList.add('rap-active');
      this.view.hidden = true;
      this.status.textContent = 'Loading accurate preview…';
      this.status.hidden = false;
      this.thumb.container.dataset.rapState = 'loading';
      this.thumb.container.dataset.rapTarget = String(target);
      delete this.thumb.container.dataset.rapFrameTime;
      const cached = this.cache.get(target);
      if (cached) {
        this.cache.delete(target);
        this.cache.set(target, cached);
        this.show(cached, generation);
        return;
      }
      this.timer = setTimeout(() => this.load(target, generation), DELAY_MS);
    }

    async load(target, generation) {
      if (!this.current(generation)) return;
      const controller = new AbortController();
      this.controller = controller;
      try {
        if (!window.Hls?.isSupported() || !this.media.requestVideoFrameCallback) throw new Error('Accurate decoding unsupported');
        this.decoder ||= new Decoder(this.source, this.height);
        const result = await this.decoder.capture(target, controller.signal);
        if (!this.current(generation)) return;
        this.cache.set(target, result);
        if (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value);
        this.show(result, generation);
      } catch (error) {
        if (!this.current(generation) || error.name === 'AbortError') return;
        this.status.textContent = 'Accurate preview unavailable';
        this.thumb.container.dataset.rapState = 'unavailable';
        this.decoder?.destroy();
        this.decoder = null;
      } finally {
        if (this.controller === controller) this.controller = null;
      }
    }
    current(generation) {
      return !this.disposed && this.hovering && generation === this.generation &&
        !document.hidden && this.media.isConnected && sourceOf(this.media) === this.source &&
        this.media.videoHeight === this.height;
    }
    show(result, generation) {
      if (!this.current(generation) || !accurateFrame(this.target, result.mediaTime)) return;
      this.view.width = result.canvas.width;
      this.view.height = result.canvas.height;
      this.view.getContext('2d').drawImage(result.canvas, 0, 0);
      this.view.hidden = false;
      this.status.hidden = true;
      this.thumb.container.dataset.rapState = 'ready';
      this.thumb.container.dataset.rapFrameTime = String(result.mediaTime);
    }
    cancel() {
      clearTimeout(this.timer);
      this.controller?.abort();
      this.controller = null;
      this.decoder?.stop();
      // Aborting initial manifest loading otherwise leaves a decoder that can
      // never become ready on the next hover.
      if (this.decoder && !this.decoder.ready) { this.decoder.destroy(); this.decoder = null; }
    }
    leave() {
      this.hovering = false;
      ++this.generation;
      this.cancel();
      this.target = null;
      this.container.classList.remove('rap-active');
      for (const key of ['rapState', 'rapTarget', 'rapFrameTime']) delete this.thumb.container.dataset[key];
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => { this.decoder?.destroy(); this.decoder = null; }, 12000);
    }
    dispose() {
      if (this.disposed) return;
      this.leave();
      this.disposed = true;
      clearTimeout(this.idleTimer);
      for (const [node, type, handler] of this.handlers) node.removeEventListener(type, handler);
      this.decoder?.destroy();
      this.decoder = null;
      this.cache.clear();
      this.view.remove();
      this.status.remove();
    }
  }

  const style = document.createElement('style');
  style.id = MARKER;
  style.dataset.version = VERSION;
  style.textContent = `
    .plyr__preview-thumb__image-container.rap-active > img { visibility:hidden !important; }
    .rap-frame,.rap-status { display:none; }
    .rap-active > .rap-frame:not([hidden]) { display:block; position:absolute; inset:0; width:100%; height:100%; object-fit:contain; background:#000; z-index:1; pointer-events:none; }
    .rap-active > .rap-status:not([hidden]) { display:flex; position:absolute; inset:0; align-items:center; justify-content:center; box-sizing:border-box; padding:10px 10px 28px; text-align:center; background:#111; color:#fff; font:12px/1.4 sans-serif; z-index:1; pointer-events:none; }
    .rap-active > .plyr__preview-thumb__time-container { z-index:2; }
  `;
  document.documentElement.append(style);
  let active = null;
  // One bounded discovery pass per second also handles the site's playlist SPA.
  // It does not observe the video frames/images that this feature generates.
  function reconcile() {
    const media = document.querySelector('video.video-player');
    const source = media && sourceOf(media);
    if (active && (active.disposed || media !== active.media || source !== active.source ||
        !active.container.isConnected || media?.plyr !== active.player || media.videoHeight !== active.height)) {
      active.dispose();
      active = null;
    }
    if (document.hidden || active || !source || !media?.videoHeight || !media?.plyr?.previewThumbnails?.loaded) return;
    active = new Preview(media, source);
  }
  const interval = setInterval(reconcile, 1000);
  const visibility = () => { if (document.hidden) { active?.dispose(); active = null; } else reconcile(); };
  document.addEventListener('visibilitychange', visibility);
  // pagehide clears media resources; pageshow revives BFCache-restored documents.
  const suspend = () => { active?.dispose(); active = null; };
  window.addEventListener('pagehide', suspend);
  window.addEventListener('pageshow', reconcile);
  reconcile();
})();
