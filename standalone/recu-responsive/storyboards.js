// Concatenated inside the player's IIFE; this class does not publish page globals.
class RRPStoryboards {
  constructor({ frames = [], baseUrl, onChange } = {}) {
    this.alive = true;
    this.onChange = typeof onChange === 'function' ? onChange : null;
    this.frames = [];
    this.sprites = [];
    this.queue = [];
    this.active = new Set();
    this.pixels = 0;
    const normalized = [];
    let base;
    try {
      const url = new URL(baseUrl);
      if (/^https?:$/.test(url.protocol)) base = url.href;
    } catch { /* Absolute frame URLs can still be used without a base. */ }
    const number = value => (typeof value === 'number' ||
      (typeof value === 'string' && value.trim() !== '')) ? Number(value) : NaN;
    const count = Array.isArray(frames) ? Math.min(frames.length, 10000) : 0;
    for (let i = 0; i < count; i++) {
      try {
        const frame = frames[i];
        if (!frame || typeof frame.text !== 'string' || !frame.text.trim() || frame.text.length > 8192) continue;
        const start = number(frame.startTime), end = number(frame.endTime);
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) continue;
        const url = new URL(frame.text, base);
        if (!/^https?:$/.test(url.protocol) || url.username || url.password) continue;
        const fragment = /^#xywh=(?:pixel:)?(\d+),(\d+),(\d+),(\d+)$/.exec(url.hash);
        const coords = ['x', 'y', 'w', 'h'].map((key, index) =>
          number(frame[key] == null && fragment ? fragment[index + 1] : frame[key]));
        const [x, y, w, h] = coords;
        if (!coords.every(Number.isSafeInteger) || x < 0 || y < 0 || w <= 0 || h <= 0 ||
            w > 4096 || h > 4096 || x + w > 65536 || y + h > 65536) continue;
        url.hash = '';
        normalized.push({ start, end, x, y, w, h, url: url.href });
      } catch { /* Ignore malformed native cues without exposing signed URLs. */ }
    }
    normalized.sort((a, b) => a.start - b.start || a.end - b.end);
    const byUrl = new Map();
    for (const frame of normalized) {
      // Native cues do not overlap. For malformed overlap, retain the first cue.
      if (this.frames.length && frame.start < this.frames[this.frames.length - 1].end) continue;
      let sprite = byUrl.get(frame.url);
      if (!sprite) {
        if (this.sprites.length === 16) continue;
        sprite = { url: frame.url, state: 'idle', image: null, pixels: 0 };
        byUrl.set(frame.url, sprite);
        this.sprites.push(sprite);
      }
      const { start, end, x, y, w, h } = frame;
      this.frames.push({ start, end, x, y, w, h, sprite });
    }
  }

  status() {
    return {
      ready: this.sprites.filter(sprite => sprite.state === 'ready').length,
      total: this.sprites.length,
      failed: this.sprites.filter(sprite => sprite.state === 'failed').length,
    };
  }

  _indexAt(time) {
    if (!Number.isFinite(time) || time < 0 || !this.frames.length) return -1;
    let low = 0, high = this.frames.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.frames[mid].start <= time) low = mid + 1;
      else high = mid;
    }
    const index = low - 1, frame = this.frames[index];
    // Gaps never reuse the preceding frame. Only the final exact endpoint is inclusive.
    return frame && (time < frame.end || (index === this.frames.length - 1 && time === frame.end))
      ? index : -1;
  }

  get(time) {
    if (!this.alive) return null;
    const frame = this.frames[this._indexAt(time)];
    if (!frame || frame.sprite.state !== 'ready') return null;
    const image = frame.sprite.image;
    if (!image || frame.x + frame.w > image.naturalWidth || frame.y + frame.h > image.naturalHeight) return null;
    const { x, y, w, h, start, end } = frame;
    return { image, x, y, w, h, start, end };
  }

  prepare(time) {
    if (!this.alive) return;
    const frame = this.frames[this._indexAt(time)];
    const index = frame ? this.sprites.indexOf(frame.sprite) : 0;
    // Reprioritize only queued work; do not churn an already loading/decode image.
    const prioritized = [this.sprites[index], this.sprites[index + 1], this.sprites[index - 1], ...this.sprites];
    this.queue = [...new Set(prioritized)].filter(sprite => sprite?.state === 'idle');
    this._pump();
  }

  _pump() {
    while (this.alive && this.active.size < 2 && this.queue.length) {
      const sprite = this.queue.shift();
      if (sprite.state === 'idle') this._load(sprite);
    }
  }

  _load(sprite) {
    const ticket = { owner: this, sprite, image: null, timer: null, pixels: 0, decoding: false };
    this.active.add(ticket);
    sprite.state = 'loading';
    // Promise callbacks retain only a ticket, whose references disposal can clear.
    const finish = success => ticket.owner?._settle(ticket, success);
    try {
      const image = new Image();
      ticket.image = image;
      sprite.image = image;
      image.decoding = 'async';
      image.onload = () => {
        if (!ticket.owner || ticket.decoding) return;
        const width = image.naturalWidth, height = image.naturalHeight, pixels = width * height;
        if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 ||
            width > 65536 || height > 65536 || !Number.isSafeInteger(pixels) ||
            ticket.owner.pixels + pixels > 16777216) {
          finish(false);
          return;
        }
        ticket.decoding = true;
        ticket.pixels = pixels;
        ticket.owner.pixels += pixels;
        try {
          if (typeof image.decode === 'function') Promise.resolve(image.decode()).then(() => finish(true), () => finish(false));
          else finish(true); // Older engines expose only the successful load event.
        } catch { finish(false); }
      };
      image.onerror = () => finish(false);
      ticket.timer = setTimeout(() => finish(false), 12000);
      image.src = sprite.url;
    } catch { finish(false); }
  }

  _settle(ticket, success) {
    if (!this.alive || ticket.owner !== this || !this.active.delete(ticket)) return;
    clearTimeout(ticket.timer);
    const { image, sprite } = ticket;
    if (image) image.onload = image.onerror = null;
    sprite.state = success ? 'ready' : 'failed';
    if (success) sprite.pixels = ticket.pixels;
    else {
      this.pixels -= ticket.pixels;
      sprite.image = null;
      this._releaseImage(image);
    }
    ticket.owner = ticket.sprite = ticket.image = null;
    ticket.timer = null;
    if (this.onChange) {
      try { this.onChange(this.status()); } catch { /* UI feedback must not stall the queue. */ }
    }
    this._pump();
  }

  _releaseImage(image) {
    if (!image) return;
    image.onload = image.onerror = null;
    // Removing src cancels the request without assigning an empty URL/page request.
    try { image.removeAttribute('src'); } catch { /* Already detached/unavailable. */ }
  }

  dispose() {
    if (!this.alive) return;
    this.alive = false;
    this.onChange = null;
    this.queue.length = 0;
    for (const ticket of this.active) {
      clearTimeout(ticket.timer);
      this._releaseImage(ticket.image);
      ticket.owner = ticket.sprite = ticket.image = null;
      ticket.timer = null;
    }
    this.active.clear();
    for (const sprite of this.sprites) {
      this._releaseImage(sprite.image);
      sprite.image = null;
      sprite.url = '';
    }
    this.frames.length = this.sprites.length = 0;
    this.pixels = 0;
  }
}
