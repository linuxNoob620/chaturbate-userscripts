// Isolated Chrome DOM fixtures only. No installed userscript, account or phone changes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../Chaturbate MultiCam Pro + Cam ARNA.user.js', import.meta.url), 'utf8');
const port = Number(process.argv.find(x => x.startsWith('--port='))?.slice(7) || 9223);
const base = `http://127.0.0.1:${port}`;
function block(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, `Missing ${start}`); return source.slice(a, b);
}
const previous = (await (await fetch(`${base}/json/list`)).json()).find(t => t.type === 'page');
const target = await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let seq = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data), p = pending.get(m.id); if (!p) return; pending.delete(m.id); clearTimeout(p.timer); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); };
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
  pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
});
try {
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  await call('Page.bringToFront');
  const expression = `(async () => {
    document.title = 'Suite Stage 2 — isolated DOM fixtures';
    const results = [];
    const check = (condition, label) => { if (!condition) throw new Error(label); results.push(label); };
    const domain = 'https://example.invalid/';
    ${block('    function escapeReloadedProfileText(', '    function wprof(')}
    const unsafe = '<p style="color:red;position:fixed;background-image:url(https://example.invalid/x)">hello <b>bold</b></p><script>evil()</script><svg><a href="javascript:evil()">bad</a></svg><img src="data:text/html,bad" onerror="evil()"><a href="java&#x73;cript:evil()">bad link</a><a href="https://example.invalid/ok" target="_blank">good</a>';
    const template = document.createElement('template'); template.innerHTML = sanitizeReloadedBioHtml(unsafe);
    check(!template.content.querySelector('script,svg,iframe,[onerror],[onclick]'), 'rich biography rejects active markup and foreign namespaces');
    check(![...template.content.querySelectorAll('[href],[src]')].some(n => /^(javascript|data):/i.test(n.getAttribute('href') || n.getAttribute('src'))), 'encoded dangerous link/image schemes rejected');
    check(template.content.querySelector('b')?.textContent === 'bold' && template.content.querySelector('p').style.color === 'red', 'intentional rich text and color retained');
    check(!template.content.querySelector('p').style.position && !template.content.querySelector('p').style.backgroundImage, 'overlay and network CSS not retained');
    check(template.content.querySelector('a[href]')?.rel.includes('noopener'), 'external link isolation retained');
    check(safeReloadedProfileUrl('mailto:test@example.invalid', false).startsWith('mailto:') && !safeReloadedProfileUrl('https://user:pass@example.invalid/', false), 'mailto compatibility and embedded credential rejection');
    const hiddenNodes = new Set(), hiddenState = new WeakMap();
    ${block('  function hideNode(', '  function exactChatTabs(')}
    const hidden = document.createElement('section'); document.body.append(hidden); hidden.setAttribute('aria-hidden','false');
    hideNode(hidden); restoreNode(hidden); hidden.setAttribute('aria-hidden','true'); hideNode(hidden); restoreNode(hidden);
    check(hidden.getAttribute('aria-hidden') === 'true' && hiddenNodes.size === 0, 'hidden element ownership recaptures current native attributes');
    const closeTransientUi = () => {};
    ${block('  const $ = (tag,', '  const ICONS = {')}
    ${block('    function openToolPanel(', '    function handleAddRoomToSplit(')}
    const trigger = document.createElement('button'); trigger.textContent = 'Fixture opener'; document.body.append(trigger); trigger.focus();
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
    let disposed = 0;
    for (let i = 0; i < 100; i++) {
      const p = openToolPanel('Fixture dialog', body => { body.append(document.createElement('input')); return () => disposed++; });
      await frame();
      check(p.body.closest('[role="dialog"]').contains(document.activeElement), 'dialog initial focus ' + i);
      if (i % 2) p.close(); else document.querySelector('.roomgrid-modal-backdrop').remove();
      await Promise.resolve();
      check(document.activeElement === trigger, 'dialog restores focus ' + i);
    }
    check(disposed === 100 && !document.querySelector('.roomgrid-modal-backdrop'), '100 close/remove cycles each dispose once');
    const p = openToolPanel('Keyboard dialog', body => { body.append(document.createElement('input')); return () => disposed++; });
    await frame(); const panel = p.body.closest('[role="dialog"]'); const first = panel.querySelector('button'), last = panel.querySelector('input');
    last.focus(); document.dispatchEvent(new KeyboardEvent('keydown', { key:'Tab', bubbles:true, cancelable:true }));
    check(document.activeElement === first, 'Tab wraps within dialog');
    first.focus(); document.dispatchEvent(new KeyboardEvent('keydown', { key:'Tab', shiftKey:true, bubbles:true, cancelable:true }));
    check(document.activeElement === last, 'Shift Tab wraps within dialog');
    document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', isComposing:true, bubbles:true, cancelable:true }));
    check(panel.isConnected, 'IME composition Escape leaves dialog open');
    document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true, cancelable:true }));
    check(disposed === 101 && document.activeElement === trigger, 'Escape disposes and returns focus');
    let saveAllowed = false, qualityRefreshes = 0;
    const store = { state: { settings: { maxStreamHeight: 0, freeZoom: true } }, patchSettings(value) { Object.assign(this.state.settings, value); }, flush: () => saveAllowed };
    const service = { refreshQuality: () => qualityRefreshes++ }, t = key => key;
    ${block('    function openPlaybackSettingsPanel(', '    function openBackupPanel(')}
    openPlaybackSettingsPanel(); await frame();
    const save = [...document.querySelectorAll('button')].find(n => n.textContent === 'saveSettings');
    save.click(); check(save.isConnected && qualityRefreshes === 0, 'failed settings persistence keeps the editor open');
    saveAllowed = true; save.click(); check(!save.isConnected && qualityRefreshes === 1, 'successful settings retry closes the editor');
    const statusStyle = document.createElement('style');
    statusStyle.textContent = ${JSON.stringify(source.match(/\.status-layer \{ background:#f8f6ee[^}]+\}/)?.[0] || '')};
    document.head.append(statusStyle);
    const status = document.createElement('div'); status.className = 'status-layer'; status.textContent = 'Offline'; document.body.append(status);
    const luminance = color => {
      const values = color.match(/\\d+/g).slice(0,3).map(n => { const v=Number(n)/255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4; });
      return .2126*values[0]+.7152*values[1]+.0722*values[2];
    };
    const statusComputed = getComputedStyle(status);
    const contrast = (luminance(statusComputed.backgroundColor)+.05)/(luminance(statusComputed.color)+.05);
    check(contrast >= 4.5, 'offline text computed contrast meets 4.5:1');
    return { assertions: results.length, checks: results.filter(x => !/focus \\d+$/.test(x)), offlineContrast: contrast, userAccountRequests: 0, installedRuntimeChanged: false };
  })()`;
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  console.log(JSON.stringify(result.result.value, null, 2));
} finally {
  ws.close();
  await fetch(`${base}/json/close/${target.id}`).catch(() => {});
  if (previous) await fetch(`${base}/json/activate/${previous.id}`).catch(() => {});
}
