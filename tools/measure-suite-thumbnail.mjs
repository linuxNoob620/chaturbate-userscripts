// Reversible live-DOM append fixture in the existing Chrome/Tampermonkey tab.
// No settings/account writes, private text, identities, or network URLs in output.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = targets.find(t => t.type === 'page' && /^https:\/\/chaturbate\.com\//.test(t.url));
assert.ok(target, 'Existing Chrome testing tab required');
const socket = new WebSocket(target.webSocketDebuggerUrl), pending = new Map(), scripts = [];
let sequence = 0;
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Debugger.scriptParsed') scripts.push(message.params);
  const job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id); clearTimeout(job.timer);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
};
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(Error(`Timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const metrics = async () => Object.fromEntries((await call('Performance.getMetrics')).metrics.map(item => [item.name, item.value]));
try {
  await call('Debugger.enable');
  const candidateScripts = scripts.filter(s => /userscript|Ziggy|Tampermonkey/i.test(s.url));
  let installed = null;
  for (const script of candidateScripts) {
    const { scriptSource } = await call('Debugger.getScriptSource', { scriptId: script.scriptId });
    if (scriptSource.includes('function createSettingsSyncController(deps)') && scriptSource.includes('function addevent2a(')) {
      installed = { version: scriptSource.match(/@version\s+(\S+)/)?.[1],
        runtimeSha256: createHash('sha256').update(scriptSource).digest('hex'), bytes: scriptSource.length };
      break;
    }
  }
  await call('Debugger.disable');
  await call('Performance.enable'); await call('Profiler.enable');
  const conditions = await evaluate(`(() => { const data=JSON.parse(localStorage.getItem('ryujo_multicam_v8')||'null'); return {hidden:document.hidden,viewport:[innerWidth,innerHeight],cards:document.querySelectorAll('[data-testid="room-card"]').length,library:data?.rooms?.length,quality:data?.settings?.maxStreamHeight,version:[...document.querySelectorAll('meta[data-suite-version]')].map(n=>n.getAttribute('data-suite-version'))};})()`);
  assert.equal(conditions.hidden, false, 'Foreground the real tab without visibility emulation');
  assert.ok(conditions.cards, 'Use a native listing page');
  const samples = [];
  for (let sample = 0; sample < 3; sample++) {
    await call('Profiler.startPreciseCoverage', { callCount: true, detailed: false });
    const before = await metrics();
    const observed = await evaluate(`new Promise(resolve => {
      const source=document.querySelector('[data-testid="room-card"]'), card=source.cloneNode(true);
      card.querySelectorAll('[title="User notes"]').forEach(n=>n.remove());
      const began=performance.now(); let blockedMs=0, previous=began, firstNote=null;
      source.parentElement.appendChild(card);
      function sample(now){
        const blocker=document.querySelector('#holdpage');
        if(blocker && getComputedStyle(blocker).display!=='none')blockedMs+=now-previous;
        if(firstNote===null&&card.querySelector('[title="User notes"]'))firstNote=now-began;
        previous=now;
        if(now-began<1100)requestAnimationFrame(sample);
        else { card.remove(); resolve({decorationMs:firstNote===null?null:Math.round(firstNote),blockedMs:Math.round(blockedMs)}); }
      }
      requestAnimationFrame(sample);
    })`);
    const after = await metrics();
    const coverage = await call('Profiler.takePreciseCoverage');
    const calls = {};
    for (const script of coverage.result) for (const fn of script.functions) {
      if (['addevent2','addevent2a','showhidden','showhidden2'].includes(fn.functionName)) calls[fn.functionName] = (calls[fn.functionName] || 0) + fn.ranges[0].count;
    }
    await call('Profiler.stopPreciseCoverage');
    samples.push({ ...observed, calls, ...Object.fromEntries(['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration'].map(name=>[name+'Ms', Math.round((after[name]-before[name])*1000)])) });
  }
  console.log(JSON.stringify({ installed, conditions, samples, caveat:'Three controlled same-card appends in the installed runtime; precise coverage adds overhead. Includes native work, not whole-browser CPU or real user input latency.' }, null, 2));
} finally {
  await call('Profiler.stopPreciseCoverage').catch(()=>{}); await call('Profiler.disable').catch(()=>{});
  await call('Performance.disable').catch(()=>{}); await call('Debugger.disable').catch(()=>{}); socket.close();
}
