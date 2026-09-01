import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { disableRealMobileView, enableRealMobileView, verifyMobileMetrics } from './mobile-view.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'extension', 'manifest.json'), 'utf8'));
const background = await readFile(path.join(root, 'extension', 'background.mjs'), 'utf8');

assert.deepEqual(manifest.permissions.sort(), ['debugger', 'storage']);
assert.deepEqual(manifest.host_permissions.sort(), ['https://*.chaturbate.com/*', 'https://chaturbate.com/*']);
for (const command of [
  'Emulation.setDeviceMetricsOverride',
  'Emulation.setTouchEmulationEnabled',
  'Emulation.setEmitTouchEventsForMouse',
  'Emulation.setUserAgentOverride',
  'Emulation.clearDeviceMetricsOverride',
]) assert.match(background, new RegExp(command.replaceAll('.', '\\.')));

const mobileMetrics = {
  width: 412,
  height: 915,
  deviceScaleFactor: 3.5,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G988B) AppleWebKit/537.36 Chrome/152.0.0.0 Mobile Safari/537.36',
  userAgentDataMobile: true,
  maxTouchPoints: 5,
  touchEvents: true,
  coarsePointer: true,
  hoverNone: true,
};

for (let iteration = 0; iteration < 10; iteration += 1) {
  const actions = [];
  const tab = {
    reloadCount: 0,
    async reload() { this.reloadCount += 1; },
    playwright: {
      async evaluate(_callback, request) {
        actions.push(request.actionName);
        if (request.actionName === 'enable') return { ok: true, active: true, profileId: request.requestedProfile, metrics: mobileMetrics };
        if (request.actionName === 'disable') return { ok: true, active: false, metrics: mobileMetrics };
        return {
          ok: true,
          active: actions.includes('enable') && !actions.includes('disable'),
          profileId: actions.includes('disable') ? null : 'samsung-galaxy-s20-ultra',
          metrics: mobileMetrics,
        };
      },
    },
  };
  const enabled = await enableRealMobileView(tab);
  assert.equal(enabled.profile.id, 'samsung-galaxy-s20-ultra');
  assert.equal(tab.reloadCount, 1);
  assert.deepEqual(actions, ['enable', 'status']);
  const reset = await disableRealMobileView(tab);
  assert.equal(reset.width, 412);
  assert.equal(tab.reloadCount, 2);
  assert.deepEqual(actions, ['enable', 'status', 'disable', 'status']);
}

assert.throws(() => verifyMobileMetrics({ ...mobileMetrics, maxTouchPoints: 0 }), /touch emulation is missing/);

const sessionState = new Map();
const attachedTabs = new Set();
const debuggerCommands = [];
let messageListener = null;
let detachListener = null;
global.self = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0.7977.65 Safari/537.36',
    platform: 'Win32',
  },
};
global.chrome = {
  runtime: { onMessage: { addListener(listener) { messageListener = listener; } } },
  debugger: {
    async attach({ tabId }) { assert.equal(attachedTabs.has(tabId), false); attachedTabs.add(tabId); },
    async detach({ tabId }) { attachedTabs.delete(tabId); },
    async sendCommand({ tabId }, method, params) {
      assert.equal(attachedTabs.has(tabId), true, `${method} was sent before the debugger attached`);
      debuggerCommands.push({ tabId, method, params });
      return {};
    },
    onDetach: { addListener(listener) { detachListener = listener; } },
  },
  storage: {
    session: {
      async get(key) { return { [key]: sessionState.get(key) }; },
      async set(entries) { for (const [key, value] of Object.entries(entries)) sessionState.set(key, value); },
      async remove(key) { sessionState.delete(key); },
    },
  },
};

await import(`./extension/background.mjs?verify=${Date.now()}`);
assert.equal(typeof messageListener, 'function');
assert.equal(typeof detachListener, 'function');

async function sendWorkerMessage(action, profileId) {
  return new Promise((resolve, reject) => {
    const keepChannelOpen = messageListener(
      { type: 'ziggy-real-mobile-view-command', action, profileId },
      { tab: { id: 77, url: 'https://chaturbate.com/test-room/' } },
      resolve,
    );
    if (keepChannelOpen !== true) reject(new Error('Background worker did not keep the asynchronous response channel open.'));
  });
}

for (let iteration = 0; iteration < 10; iteration += 1) {
  debuggerCommands.length = 0;
  const enabled = await sendWorkerMessage('enable', 'samsung-galaxy-s20-ultra');
  assert.equal(enabled.ok, true);
  assert.equal(enabled.active, true);
  assert.equal(attachedTabs.has(77), true);
  for (const method of [
    'Emulation.setDeviceMetricsOverride',
    'Emulation.setTouchEmulationEnabled',
    'Emulation.setEmitTouchEventsForMouse',
    'Emulation.setUserAgentOverride',
  ]) assert.equal(debuggerCommands.some(command => command.method === method), true, `${method} was not sent`);
  const metrics = debuggerCommands.find(command => command.method === 'Emulation.setDeviceMetricsOverride')?.params;
  assert.deepEqual(
    { width: metrics.width, height: metrics.height, dpr: metrics.deviceScaleFactor, mobile: metrics.mobile },
    { width: 412, height: 915, dpr: 3.5, mobile: true },
  );
  const disabled = await sendWorkerMessage('disable');
  assert.equal(disabled.ok, true);
  assert.equal(disabled.active, false);
  assert.equal(debuggerCommands.some(command => command.method === 'Emulation.clearDeviceMetricsOverride'), true);
  assert.equal(attachedTabs.has(77), false);
  assert.equal(sessionState.size, 0);
}

delete global.chrome;
delete global.self;
console.log('Real mobile view helper passed manifest, client, worker, CDP, reset, and 10-repeat deterministic checks.');
