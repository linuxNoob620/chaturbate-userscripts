// This is a separate player. It never edits Suite settings or the old
// Accurate Timeline Previews script. Shaka owns media; Recu.me owns authorization.
const RRP_VERSION = '0.2.1';
const RRP_ID = 'recu-responsive-player';

function rrpRoute(path = location.pathname) {
  return /^\/[A-Za-z0-9_-]+\/video\/\d+\/play\/?$/.test(path);
}
function rrpTime(time) {
  const seconds = Math.max(0, Math.floor(Number(time) || 0));
  const h = Math.floor(seconds / 3600), m = Math.floor(seconds / 60) % 60;
  return `${h ? `${h}:` : ''}${h ? String(m).padStart(2, '0') : m}:${String(seconds % 60).padStart(2, '0')}`;
}
function rrpSource(video) {
  try {
    const url = new URL(video.querySelector('source')?.src || video.currentSrc, location.href);
    return url.protocol === 'https:' && !url.username && !url.password && /\.m3u8$/i.test(url.pathname) ? url.href : '';
  } catch { return ''; }
}
function rrpNativeCleanup() {
  if (typeof activeStreamCleanup === 'function') return activeStreamCleanup;
  return null;
}
function rrpSnapshot(video, route = location.pathname) {
  return { route, expires: Date.now() + 300000, time: Math.max(0, video.currentTime || 0),
    paused: video.paused, muted: video.muted, volume: video.volume, rate: video.playbackRate };
}
function rrpOriginalURL(time, href = location.href) {
  const url = new URL(href);
  if (url.origin !== location.origin || url.username || url.password || !rrpRoute(url.pathname) || url.pathname !== location.pathname) {
    throw new Error('Original recording route changed.');
  }
  if (!Number.isFinite(time) || time < 0) throw new Error('Invalid return timestamp.');
  url.searchParams.set('t', String(Math.floor(time)));
  url.searchParams.set('rrp_player', 'original');
  return url.href;
}
function rrpNode(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text != null) node.textContent = text;
  return node;
}

const RRP_CSS = `
  :host { display:block; color:#fff; font:14px/1.4 Arial,sans-serif; text-align:left; color-scheme:dark; }
  *,*::before,*::after { box-sizing:border-box; }
  [hidden] { display:none !important; }
  .rrp-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; padding:8px 0; }
  .rrp-toolbar strong { font-size:13px; font-weight:600; }
  .rrp-toolbar button { border:1px solid #555; background:#232323; color:#fff; border-radius:5px; padding:7px 12px; cursor:pointer; font:inherit; }
  .rrp-toolbar button:hover { border-color:#ff9d00; }
  .rrp-toolbar button:disabled { cursor:wait; opacity:.65; }
  .rrp-message { flex:1; color:#ccc; font-size:12px; }
  .rrp-stage { position:relative; width:100%; aspect-ratio:16/9; max-height:calc(100dvh - 80px); min-height:180px; background:#000; overflow:hidden; }
  .rrp-stage video { display:block; width:100%; height:100%; object-fit:contain; }
  .rrp-stage:fullscreen { width:100vw; height:100dvh; max-height:none; aspect-ratio:auto; }
  :host(:fullscreen) .rrp-toolbar { display:none; }
  :host(:fullscreen) .rrp-stage { width:100vw; height:100dvh; max-height:none; aspect-ratio:auto; }
  .rrp-stage .shaka-controls-container { transition:opacity 120ms; }
  .rrp-stage.rrp-idle .shaka-controls-container { opacity:0 !important; }
  .rrp-stage.rrp-idle { cursor:none; }
  .rrp-stage .shaka-controls-button-panel button { min-width:36px; min-height:36px; }
  .rrp-stage .shaka-seek-bar-container { position:relative; }
  .rrp-preview { position:absolute; bottom:22px; width:224px; max-width:calc(100vw - 40px); border:2px solid #fff; border-radius:7px; overflow:hidden; background:#161616; box-shadow:0 3px 12px #0009; pointer-events:none; z-index:3; }
  .rrp-preview canvas { display:block; width:100%; aspect-ratio:16/9; background:#161616; }
  .rrp-preview-label { display:block; padding:3px 7px; color:white; text-align:center; font:12px/1.4 Arial,sans-serif; background:#111; }
  .rrp-preview-wait { position:absolute; inset:0 0 23px; display:flex; align-items:center; justify-content:center; text-align:center; padding:10px; color:#ddd; font-size:12px; }
  :focus-visible { outline:2px solid #ffae35; outline-offset:3px; }
  @media(max-width:550px) { .rrp-stage { min-height:150px; } .rrp-preview { width:168px; } .rrp-toolbar { font-size:12px; } }
  @media(prefers-reduced-motion:reduce) { .rrp-stage .shaka-controls-container { transition:none; } }
`;

class RRPPlayer {
  constructor(nativeVideo, host, message, returnButton) {
    this.nativeVideo = nativeVideo;
    this.nativePlayer = nativeVideo.plyr;
    this.nativeHost = document.getElementById('plyr_container');
    this.route = location.pathname;
    this.host = host;
    this.shadow = host.shadowRoot;
    this.message = message;
    this.returnButton = returnButton;
    this.alive = true;
    this.life = new AbortController();
    this.previewTime = null;
    this.hoverControls = false;
    this.pointerDown = false;
    this.keyboardFocus = false;
    this.seekToken = 0;
    this.metrics = { seeks: [], previews: [], originalStopped: false };
  }
  on(target, event, handler, options = {}) {
    target.addEventListener(event, handler, { ...options, signal: this.life.signal });
  }
  setMessage(text) { if (this.alive) this.message.textContent = text; }
  async start({ focus = true } = {}) {
    const source = rrpSource(this.nativeVideo), initial = rrpSnapshot(this.nativeVideo);
    this.initial = initial;
    if (!source || !RRP_SK || !RRP_SK.Player.isBrowserSupported()) throw new Error('Unsupported player/source.');
    // Refuse unknown native ownership rather than leaving a second HLS engine alive.
    const nativeEngine = window.timeline?.hls;
    const cleanupNative = rrpNativeCleanup();
    if (!nativeEngine) throw new Error('Native playback engine is not ready. Start the original video, then retry.');
    if (nativeEngine.media !== this.nativeVideo) throw new Error('Native player ownership is not ready. Retry after playback starts.');
    if (typeof cleanupNative !== 'function') throw new Error('Native playback cleanup is inaccessible. Original playback was not changed.');
    if (document.getElementById('recu-accurate-previews')) {
      throw new Error('Disable Accurate Timeline Previews in Tampermonkey, then reload this page.');
    }
    const frames = this.nativePlayer.previewThumbnails?.thumbnails?.[0]?.frames || [];
    const css = RRP_SH_CSS;
    if (!css || css.length < 1000) throw new Error('Player stylesheet is unavailable. Reload or reinstall this script.');
    // Shaka's root custom properties must belong to this shadow host, not the page.
    this.playerStyle = rrpNode('style', {}, css.replace(/:root\b/g, ':host'));
    this.shadow.prepend(this.playerStyle);
    this.stage = rrpNode('div', { class:'rrp-stage shaka-video-container', tabindex:'0', 'aria-label':'Recu.me responsive video player' });
    this.video = rrpNode('video', { playsinline:'', preload:'metadata' });
    this.video.muted = initial.muted;
    this.video.volume = initial.volume;
    this.video.playbackRate = initial.rate;
    this.stage.append(this.video);
    this.shadow.append(this.stage);
    this.engine = new RRP_SK.Player();
    this.transport = new RRPSegmentTransport({ shaka:RRP_SK, Hls:window.Hls, sourceUrl:source });
    this.transport.install();
    await this.engine.attach(this.video);
    if (!this.alive) return;
    const heights = (nativeEngine.levels || []).map(level => level.height)
      .filter(height => Number.isFinite(height) && height > 0 && height <= 1080);
    const initialHeight = heights.length ? Math.max(...heights) : 0;
    this.engine.configure({
      streaming:{ bufferingGoal:30, rebufferingGoal:1, bufferBehind:90,
        retryParameters:{ maxAttempts:2, timeout:20000, connectionTimeout:10000, stallTimeout:10000 } },
      // These VOD playlists round segment durations. Re-aligning every TS to
      // EXTINF creates holes/overlaps; retain the recording's embedded clock.
      manifest:{ retryParameters:{ maxAttempts:2, timeout:15000 },
        hls:{ ignoreManifestTimestampsInSegmentsMode:true } },
      abr:{ enabled:false, useNetworkInformation:false, defaultBandwidthEstimate:1000000,
        restrictions:{ minHeight:initialHeight, maxHeight:initialHeight || 1080 } },
    });
    this.ui = new RRP_SK.ui.Overlay(this.engine, this.stage, this.video);
    this.ui.configure({
      controlPanelElements:['play_pause','time_and_duration','spacer','mute','volume','overflow_menu','fullscreen'],
      overflowMenuButtons:['quality','playback_rate','picture_in_picture','captions'],
      showUIAlways:true,
      alwaysShowVolumeBar:true,
      fullScreenElement:this.host,
      documentPictureInPicture:{enabled:false},
      seekBarColors:{ base:'rgba(255,255,255,.25)', buffered:'rgba(255,255,255,.5)', played:'#ff9800', adBreaks:'#ffcc00' },
      enableKeyboardPlaybackControls:false,
    });
    this.bindControls(frames);
    this.nativePlayer.pause();
    // Call the site's cleanup, which owns its retry timers and HLS instance.
    cleanupNative();
    if (nativeEngine.media) throw new Error('The original player did not stop.');
    this.metrics.originalStopped = true;
    window.timeline?.destroy();
    window.autoplay?.clearPrefetch?.();
    window.autoplay?.pause?.();
    this.oldKeyboard = this.nativePlayer.config.keyboard;
    this.nativePlayer.config.keyboard = { global:false, focused:false };
    this.oldDisplay = this.nativeHost.style.getPropertyValue('display');
    this.oldDisplayPriority = this.nativeHost.style.getPropertyPriority('display');
    this.nativeHost.style.setProperty('display', 'none', 'important');
    this.returnButton.hidden = false;
    this.on(this.engine, 'error', event => {
      if (event.detail?.severity === 2) {
        this.failed = true;
        this.stage.classList.remove('rrp-idle');
        this.setMessage(`Playback failed (code ${Number(event.detail.code) || 'unknown'}). Use original player to reload safely.`);
      }
    });
    this.setMessage('Loading replacement player…');
    await this.engine.load(source, initial.time, 'application/x-mpegurl');
    if (!this.alive) return;
    const preferred = this.engine.getVideoTracks()
      .filter(track => Number.isFinite(track.height) && track.height > 0 && track.height <= 1080)
      .sort((a, b) => b.height - a.height || b.bandwidth - a.bandwidth)[0];
    if (preferred && !preferred.active) this.engine.selectVideoTrack(preferred, true);
    // The default is fixed, not Auto. Later explicit quality/Auto choices remain
    // owned by Shaka's menu rather than a recurring preference enforcer.
    this.engine.configure({ abr:{ restrictions:{ minHeight:0, maxHeight:Infinity } } });
    this.video.playbackRate = initial.rate;
    this.loaded = true;
    if (focus) this.stage.focus({preventScroll:true});
    this.board.prepare(initial.time);
    this.updateStatus();
    if (!initial.paused) {
      try { await this.video.play(); }
      catch { if (!this.failed) this.setMessage('Ready — press Play.'); }
    }
    this.activity();
  }
  bindControls(frames) {
    this.controls = this.stage.querySelector('.shaka-controls-container');
    this.seek = this.stage.querySelector('input.shaka-seek-bar');
    this.seekHost = this.stage.querySelector('.shaka-seek-bar-container');
    if (!this.seek || !this.seekHost || !this.controls) throw new Error('Unsupported player-controls layout.');
    this.preview = rrpNode('div', { class:'rrp-preview', hidden:'' });
    this.canvas = rrpNode('canvas', { width:'256', height:'144' });
    this.previewLabel = rrpNode('span', { class:'rrp-preview-label' });
    this.previewWait = rrpNode('span', { class:'rrp-preview-wait' }, 'Loading preview…');
    this.preview.append(this.canvas, this.previewLabel, this.previewWait);
    this.seekHost.append(this.preview);
    this.board = new RRPStoryboards({ frames, baseUrl:location.href, onChange:()=>{
      if (!this.alive) return;
      this.paintPreview();
      this.updateStatus();
    } });
    this.board.prepare(this.nativeVideo.currentTime);
    this.on(this.seekHost, 'pointermove', event => this.movePreview(event));
    this.on(this.seekHost, 'pointerleave', () => { if (!this.pointerDown) this.hidePreview(); });
    this.on(this.seek, 'input', () => { this.previewTime = Number(this.seek.value); this.paintPreview(); this.activity(); });
    this.on(this.seek, 'pointerdown', () => { this.pointerDown = true; this.keyboardFocus = false; this.activity(); });
    this.on(window, 'pointerup', () => { this.pointerDown = false; if (!this.seekHost.matches(':hover')) this.hidePreview(); this.activity(); });
    this.on(window, 'pointercancel', () => { this.pointerDown = false; this.hidePreview(); });
    this.on(this.stage, 'pointermove', () => this.activity());
    this.on(this.stage, 'pointerdown', () => { this.keyboardFocus = false; this.activity(); });
    this.on(this.stage, 'pointerleave', () => this.activity());
    this.on(this.controls, 'pointerover', event => {
      this.hoverControls = !!event.target.closest('button,input,.shaka-overflow-menu,.shaka-sub-menu,.shaka-context-menu,.shaka-seek-bar-container');
      this.activity();
    });
    this.on(this.controls, 'pointerout', event => {
      this.hoverControls = !!event.relatedTarget?.closest?.('button,input,.shaka-overflow-menu,.shaka-sub-menu,.shaka-context-menu,.shaka-seek-bar-container');
      this.activity();
    });
    this.on(this.stage, 'focusin', event => { this.keyboardFocus = event.target.matches(':focus-visible'); this.activity(); });
    this.on(this.stage, 'focusout', () => {
      this.keyboardFocus = false;
      if (!this.pointerDown && !this.seekHost.matches(':hover')) this.hidePreview();
      else this.activity();
    });
    // Buffering/recovery is not user input: it must not wake an idle overlay.
    for (const type of ['play','pause','ended']) this.on(this.video, type, () => this.activity());
    for (const type of ['playing','seeked']) this.on(this.video, type, () => this.activity(false));
    this.on(this.video, 'seeking', () => this.measureSeek());
    this.on(document, 'fullscreenchange', () => { this.hidePreview(); this.activity(); });
    // Stock Shaka reads document.activeElement, which retargets shadow controls
    // to the outer host. Own timeline arrows and volume Up/Down; other range
    // keys, buttons and menu navigation keep their ordinary behavior.
    // The site intercepts Space/F at document capture even for shadow inputs.
    // Run one level earlier, only for events inside our host. Buttons keep
    // their browser-default activation; hidden native playback gets no action.
    this.on(window, 'keydown', event => this.ownedKeyboard(event), {capture:true});
    this.on(window, 'keyup', event => this.ownedKeyboard(event), {capture:true});
    this.on(this.stage, 'keydown', event => { if (event.key === 'Tab') this.keyboardFocus = true; this.activity(); });
  }
  ownedKeyboard(event) {
    if (!event.composedPath?.().includes(this.host)) return;
    if (event.type === 'keydown') this.keyboard(event);
    const key = event.key.toLowerCase();
    if ([' ','f','t','s'].includes(key) || ((event.ctrlKey || event.metaKey) && ['arrowleft','arrowright'].includes(key))) {
      event.stopPropagation();
    }
  }
  keyboard(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const target = event.composedPath?.()[0] || event.target;
    const key = event.key.toLowerCase();
    if (target === this.seek) { if (![' ','arrowleft','arrowright','arrowup','arrowdown'].includes(key)) return; }
    else if (target?.matches?.('input.shaka-volume-bar')) { if (!['arrowup','arrowdown'].includes(key)) return; }
    else if (target?.closest?.('button,input,textarea,select,[contenteditable=""],[contenteditable="true"],[role="textbox"]')) return;
    let action;
    if (key === ' ' || key === 'k') action = () => this.video.paused ? this.video.play().catch(() => {}) : this.video.pause();
    else if (['arrowleft','arrowright','j','l'].includes(key) && Number.isFinite(this.video.duration)) {
      action = () => { this.video.currentTime = Math.max(0, Math.min(this.video.duration - .1,
        this.video.currentTime + ({arrowleft:-5,arrowright:5,j:-10,l:10}[key]))); };
    } else if (key === 'm') action = () => { this.video.muted = !this.video.muted; };
    else if (key === 'arrowup' || key === 'arrowdown') action = () => {
      this.video.volume = Math.max(0, Math.min(1, this.video.volume + (key === 'arrowup' ? .05 : -.05)));
    };
    else if (key === 'f' && document.fullscreenEnabled) action = () => {
      const operation = document.fullscreenElement === this.host ? document.exitFullscreen() : this.host.requestFullscreen();
      operation.catch(() => this.setMessage('Fullscreen unavailable — try the fullscreen button.'));
    };
    if (!action) return;
    event.preventDefault(); event.stopPropagation();
    action(); this.activity();
  }
  updateStatus() {
    if (!this.loaded || this.failed) return;
    const status = this.board.status();
    this.setMessage(!status.total ? 'Ready · no storyboard supplied by this recording' :
      status.ready === status.total ? 'Ready · sampled previews' :
      status.failed ? 'Ready · some preview images unavailable' : 'Ready · preparing sampled previews…');
  }
  menuOpen() {
    return [...this.stage.querySelectorAll('.shaka-overflow-menu,.shaka-sub-menu,.shaka-context-menu')]
      .some(menu => !menu.classList.contains('shaka-hidden'));
  }
  activity(reveal = true) {
    if (!this.alive || !this.stage) return;
    clearTimeout(this.hideTimer);
    if (reveal) this.stage.classList.remove('rrp-idle');
    this.hideTimer = setTimeout(() => {
      if (!this.alive) return;
      if (this.video.paused || this.video.seeking || this.video.readyState < 3 || this.pointerDown ||
          this.hoverControls || this.keyboardFocus || this.previewTime != null || this.menuOpen()) return;
      this.stage.classList.add('rrp-idle');
    }, 2500);
  }
  movePreview(event) {
    const duration = this.video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    const rect = this.seek.getBoundingClientRect();
    if (!rect.width) return;
    this.previewTime = Math.max(0, Math.min(duration, (event.clientX - rect.left) / rect.width * duration));
    const hostRect = this.seekHost.getBoundingClientRect(), width = Math.min(224, hostRect.width);
    this.preview.style.left = `${Math.max(0, Math.min(hostRect.width - width, event.clientX - hostRect.left - width / 2))}px`;
    this.preview.style.width = `${width}px`;
    this.preview.hidden = false;
    this.board.prepare(this.previewTime);
    this.paintPreview();
    this.activity();
  }
  paintPreview() {
    if (!this.alive || this.previewTime == null) return;
    const start = performance.now(), frame = this.board.get(this.previewTime);
    this.previewLabel.textContent = rrpTime(this.previewTime);
    const context = this.canvas.getContext('2d');
    if (frame) {
      if (this.lastFrame !== frame.start) {
        this.canvas.width = frame.w;
        this.canvas.height = frame.h;
        context.drawImage(frame.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
        this.lastFrame = frame.start;
      }
      this.previewWait.hidden = true;
      this.preview.dataset.sampleStart = String(frame.start);
      this.preview.dataset.sampleEnd = String(frame.end);
      this.metrics.previews.push(performance.now() - start);
      if (this.metrics.previews.length > 100) this.metrics.previews.shift();
    } else {
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.lastFrame = null;
      this.previewWait.hidden = false;
      const status = this.board.status();
      this.previewWait.textContent = !status.total || status.failed ? 'Preview unavailable' : 'Loading preview…';
      delete this.preview.dataset.sampleStart;
      delete this.preview.dataset.sampleEnd;
    }
  }
  hidePreview() {
    this.previewTime = null;
    if (this.preview) this.preview.hidden = true;
    this.activity();
  }
  measureSeek() {
    const token = ++this.seekToken, start = performance.now();
    if (!this.video.requestVideoFrameCallback) return;
    if (this.frameRequest) this.video.cancelVideoFrameCallback(this.frameRequest);
    this.frameRequest = this.video.requestVideoFrameCallback((_, frame) => {
      this.frameRequest = null;
      if (!this.alive || token !== this.seekToken) return;
      this.metrics.seeks.push({ time:Math.round(frame.mediaTime), frameMs:Math.round(performance.now() - start) });
      if (this.metrics.seeks.length > 20) this.metrics.seeks.shift();
    });
  }
  async returnOriginal() {
    if (this.route !== location.pathname) throw new Error('Original recording route changed.');
    const snapshot = this.loaded && this.video ? rrpSnapshot(this.video, this.route) : this.initial || rrpSnapshot(this.nativeVideo, this.route);
    // Use the site's actual timestamp-link contract. The original player then
    // owns autoplay, sound preferences and resume initialization again.
    const url = rrpOriginalURL(snapshot.time);
    this.returnButton.disabled = true;
    await this.dispose();
    location.assign(url);
  }
  async dispose() {
    if (!this.alive) return;
    this.alive = false;
    this.life.abort();
    clearTimeout(this.hideTimer);
    this.board?.dispose();
    if (this.frameRequest) this.video?.cancelVideoFrameCallback(this.frameRequest);
    this.video?.pause();
    try { if (this.ui) await this.ui.destroy(); else if (this.engine) await this.engine.destroy(); }
    finally {
      await this.transport?.dispose();
      this.stage?.remove();
      this.playerStyle?.remove();
      if (this.oldKeyboard) this.nativePlayer.config.keyboard = this.oldKeyboard;
      if (this.nativeHost && this.oldDisplay != null) {
        if (this.oldDisplay) this.nativeHost.style.setProperty('display', this.oldDisplay, this.oldDisplayPriority);
        else this.nativeHost.style.removeProperty('display');
      }
    }
  }
}

function rrpBoot() {
  if (window.top !== window.self || !rrpRoute() || document.getElementById(RRP_ID)) return;
  let host = null, candidate = null, nativeVideo = null, timer = null, autoTimer = null, paused = false, mountLife = null;
  let mountedRoute = location.pathname;
  const life = new AbortController();
  function reconcile() {
    timer = null;
    if (paused) return;
    if (!rrpRoute()) { cleanup(); return; }
    const video = document.querySelector('#plyr_container video.video-player');
    if (host && (!host.isConnected || mountedRoute !== location.pathname || video !== nativeVideo)) {
      clearTimeout(autoTimer); autoTimer = null;
      mountLife?.abort();
      candidate?.dispose().catch(() => {}); candidate = null;
      host?.remove(); host = null;
    }
    if (!video?.plyr || !rrpSource(video)) return;
    if (host?.isConnected) return;
    nativeVideo = video;
    mountedRoute = location.pathname;
    mountLife = new AbortController();
    host = rrpNode('div', { id:RRP_ID, 'data-version':RRP_VERSION, 'data-build':RRP_BUILD });
    const shadow = host.attachShadow({mode:'open'});
    const toolbar = rrpNode('div', {class:'rrp-toolbar'});
    const launch = rrpNode('button', {type:'button'}, 'Use responsive player');
    const back = rrpNode('button', {type:'button',hidden:'',title:'Reload the original player at the current timestamp'}, 'Use original player');
    const originalRequested = new URL(location.href).searchParams.get('rrp_player') === 'original';
    const message = rrpNode('span', {class:'rrp-message', role:'status'}, originalRequested
      ? 'Original player selected · responsive player available'
      : 'Waiting for the recording… · responsive player starts automatically');
    toolbar.append(rrpNode('strong', {}, 'Recu.me Responsive Player'), launch, back, message);
    shadow.append(rrpNode('style', {}, RRP_CSS), toolbar);
    document.getElementById('plyr_container').before(host);
    const start = async (automatic = false) => {
      if (candidate) return;
      clearTimeout(autoTimer); autoTimer = null;
      if (!automatic && originalRequested) {
        const url = new URL(location.href);
        url.searchParams.delete('rrp_player');
        history.replaceState(history.state, '', url.href);
      }
      launch.disabled = true;
      const job = new RRPPlayer(video, host, message, back);
      candidate = job;
      try { await job.start({focus:!automatic}); if (candidate === job && job.alive) launch.hidden = true; }
      catch (error) {
        if (candidate !== job || !job.alive) return;
        job.failed = true;
        message.textContent = error instanceof Error ? error.message : `Player failed (code ${Number(error?.code) || 'unknown'}).`;
        if (job.metrics.originalStopped) { launch.hidden = true; back.hidden = false; }
        else {
          await job.dispose().catch(() => {});
          if (candidate === job) { candidate = null; launch.disabled = false; }
        }
      }
    };
    launch.addEventListener('click', () => start(), {signal:mountLife.signal});
    back.addEventListener('click', () => candidate?.returnOriginal().catch(() => {
      // Even a failed disposal must offer an original-only reload, not an
      // automatic takeover loop on the same broken source.
      location.assign(rrpOriginalURL(0));
    }), {signal:mountLife.signal});
    const autoDeadline = Date.now() + 20000;
    const autoHost = host, autoLife = mountLife;
    let readySince = null;
    const tryAutomatic = () => {
      autoTimer = null;
      if (paused || autoLife.signal.aborted || candidate || originalRequested || !autoHost.isConnected ||
          location.pathname !== mountedRoute || document.querySelector('#plyr_container video.video-player') !== video) return;
      const ready = !document.fullscreenElement && !document.pictureInPictureElement &&
        video.readyState >= 2 && window.timeline?.hls?.media === video &&
        typeof rrpNativeCleanup() === 'function';
      if (ready && readySince == null) readySince = Date.now();
      if (!ready) readySince = null;
      const frames = video.plyr?.previewThumbnails?.thumbnails?.[0]?.frames;
      if (ready && (frames?.length || Date.now() - readySince >= 1500)) { start(true); return; }
      if (Date.now() < autoDeadline) autoTimer = setTimeout(tryAutomatic, 200);
      else message.textContent = 'Original player is still available — press Use responsive player to retry.';
    };
    if (!originalRequested) autoTimer = setTimeout(tryAutomatic, 200);
    // Diagnostics expose numbers/state only, never source URLs, tokens or media data.
    host.rrpDiagnostics = () => ({ version:RRP_VERSION, build:RRP_BUILD, active:!!candidate?.alive, loaded:!!candidate?.loaded,
      originalStopped:!!candidate?.metrics.originalStopped, board:candidate?.board?.status(),
      seeks:candidate?.metrics.seeks.slice(), previews:candidate?.metrics.previews.slice() });
  }
  function schedule() { if (!timer && !paused) timer = setTimeout(reconcile, 200); }
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {childList:true,subtree:true});
  function cleanup() {
    paused = true;
    clearTimeout(timer); timer = null;
    clearTimeout(autoTimer); autoTimer = null;
    observer.disconnect();
    life.abort();
    mountLife?.abort();
    candidate?.dispose().catch(() => {});
    host?.remove();
  }
  window.addEventListener('pagehide', cleanup, {once:true});
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  reconcile();
}
rrpBoot();
