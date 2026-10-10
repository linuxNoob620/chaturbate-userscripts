// Existing actual Chrome/Tampermonkey Workshop only; one ordinary Refresh click.
// Aggregate counts only: never log room IDs, request URLs, settings or credentials.
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:9223';
const targets = await (await fetch(`${base}/json/list`)).json();
const target = targets.find(t => t.type === 'page' && /^https:\/\/chaturbate\.com\/\?multicam_mode=1/.test(t.url));
assert.ok(target, 'Open the established Chrome testing Workshop first');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let sequence = 0, collecting = false, requests = [];
const pending = new Map();
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (collecting && message.method === 'Network.requestWillBeSent' && /\/api\/chatvideocontext\//.test(message.params.request.url)) requests.push(message.params.request.url);
  const job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id); clearTimeout(job.timer);
  message.error ? job.reject(new Error(message.error.message)) : job.resolve(message.result);
};
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
  pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const metrics = async () => Object.fromEntries((await call('Performance.getMetrics')).metrics.map(item => [item.name, item.value]));
const key = `__workshopMeasure_${Date.now()}`;
const begin = async () => {
  requests = []; collecting = true;
  await evaluate(`(() => {
    const cards = [...document.querySelectorAll('.cam-card')];
    const grid = cards[0]?.parentElement;
    if (!grid) throw new Error('No visible Workshop cards');
    const state = { cards, videos: cards.flatMap(card => [...card.querySelectorAll('video')]).filter(video => !video.paused), mutations: 0, childList: 0, longTasks: 0, longestTask: 0 };
    state.times = state.videos.map(video => video.currentTime); state.sources = state.videos.map(video => video.currentSrc);
    state.observer = new MutationObserver(records => { state.mutations += records.length; state.childList += records.filter(record => record.type === 'childList').length; });
    state.observer.observe(grid, { attributes: true, subtree: true, childList: true, characterData: true });
    state.performance = new PerformanceObserver(list => { for (const entry of list.getEntries()) { state.longTasks++; state.longestTask = Math.max(state.longestTask, entry.duration); } });
    state.performance.observe({ type: 'longtask' }); window[${JSON.stringify(key)}] = state;
  })()`);
  return metrics();
};
const finish = async initial => {
  const final = await metrics(); collecting = false;
  const dom = await evaluate(`(() => {
    const state = window[${JSON.stringify(key)}]; state.observer.disconnect(); state.performance.disconnect();
    const result = { cards: state.cards.length, cardsRetained: state.cards.filter(card => card.isConnected).length, playingBefore: state.videos.length,
      videosRetained: state.videos.filter(video => video.isConnected).length,
      sourcesRetained: state.videos.filter((video,i) => video.isConnected && video.currentSrc === state.sources[i]).length,
      advancing: state.videos.filter((video,i) => video.isConnected && !video.paused && video.currentTime > state.times[i]).length,
      mutations: state.mutations, childListMutations: state.childList, longTasks: state.longTasks, longestTaskMs: Math.round(state.longestTask), hidden: document.hidden,
      status: document.querySelector('.workshop-refresh-status')?.textContent || '' };
    delete window[${JSON.stringify(key)}]; return result;
  })()`);
  return { ...dom, contextRequests: requests.length, uniqueContextRequests: new Set(requests).size,
    ...Object.fromEntries(['ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'TaskDuration'].map(name => [name + 'Ms', Math.round((final[name] - initial[name]) * 1000)])) };
};
try {
  assert.equal(await evaluate('document.hidden'), false, 'Keep the actual test tab foregrounded; do not emulate visibility');
  assert.equal(await evaluate("!!document.querySelector('.rg-control-backdrop,.roomgrid-modal-backdrop')"), false, 'Close temporary dialogs before measuring');
  await call('Network.enable'); await call('Performance.enable');
  const idleMetrics = await begin(); await pause(8000);
  const idle = await finish(idleMetrics);
  const refreshMetrics = await begin();
  const point = await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(node => /Refresh Workshop|Refresh all/.test(node.title || node.getAttribute('aria-label') || '')); if (!button || button.disabled) throw new Error('Refresh unavailable'); const r = button.getBoundingClientRect(); return { x: r.x+r.width/2, y: r.y+r.height/2 }; })()`);
  const started = Date.now();
  await call('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  let completed = false;
  do {
    await pause(100);
    completed = await evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(n => /Refresh Workshop|Refresh all/.test(n.title || n.getAttribute('aria-label') || '')); return !!b && !b.disabled; })()`);
  } while (!completed && Date.now() - started < 35000);
  const elapsedMs = Date.now() - started;
  await pause(250);
  const refresh = await finish(refreshMetrics);
  assert.equal(refresh.hidden, false, 'Foreground changed during sample');
  console.log(JSON.stringify({ idle, refresh: { ...refresh, elapsedMs, completed }, caveat: 'One live sample, not an average; periodic/native/media work may overlap. No account/settings mutations.' }, null, 2));
} finally {
  collecting = false;
  await evaluate(`(() => { const s=window[${JSON.stringify(key)}]; s?.observer.disconnect(); s?.performance.disconnect(); delete window[${JSON.stringify(key)}]; })()`).catch(() => {});
  await call('Network.disable').catch(() => {}); await call('Performance.disable').catch(() => {});
  ws.close();
}
