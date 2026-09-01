import { DEFAULT_PROFILE_ID, getDeviceProfile } from './extension/profiles.mjs';

const CHANNEL = 'ziggy-codex-real-mobile-view-v1';
const RESPONSE_TIMEOUT_MS = 7000;

async function bridgeCommand(tab, action, profileId = null) {
  if (!tab?.playwright?.evaluate) throw new Error('A connected Chrome tab is required.');
  return tab.playwright.evaluate(({ channel, actionName, requestedProfile, timeoutMs }) => new Promise((resolve, reject) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('The Ziggy Real Mobile View Bridge did not respond. Install or enable its unpacked Chrome extension.'));
    }, timeoutMs);
    function onMessage(event) {
      const response = event.data;
      if (event.source !== window || response?.channel !== channel || response?.direction !== 'response' || response.id !== id) return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      resolve(response.result);
    }
    window.addEventListener('message', onMessage);
    window.postMessage({
      channel,
      direction: 'request',
      id,
      action: actionName,
      profileId: requestedProfile,
    }, '*');
  }), {
    channel: CHANNEL,
    actionName: action,
    requestedProfile: profileId,
    timeoutMs: RESPONSE_TIMEOUT_MS,
  });
}

function assertCommand(result, action) {
  if (!result?.ok) throw new Error(`Unable to ${action} real mobile view: ${result?.error || 'unknown bridge error'}`);
  return result;
}

export function verifyMobileMetrics(metrics, profileId = DEFAULT_PROFILE_ID) {
  const profile = getDeviceProfile(profileId);
  const failures = [];
  if (Math.abs(metrics.width - profile.width) > 2) failures.push(`viewport width ${metrics.width}, expected ${profile.width}`);
  if (Math.abs(metrics.height - profile.height) > 2) failures.push(`viewport height ${metrics.height}, expected ${profile.height}`);
  if (Math.abs(metrics.deviceScaleFactor - profile.deviceScaleFactor) > 0.1) failures.push(`DPR ${metrics.deviceScaleFactor}, expected ${profile.deviceScaleFactor}`);
  if (!/Android|Mobile/i.test(metrics.userAgent || '')) failures.push('mobile Android user agent is missing');
  if (metrics.userAgentDataMobile === false) failures.push('UA client hints still identify a desktop browser');
  if ((metrics.maxTouchPoints || 0) < 1 || !metrics.touchEvents) failures.push('touch emulation is missing');
  if (!metrics.coarsePointer || !metrics.hoverNone) failures.push('mobile pointer media queries are missing');
  if (failures.length) throw new Error(`Mobile emulation verification failed: ${failures.join('; ')}`);
  return { profile, metrics };
}

export async function enableRealMobileView(tab, { profileId = DEFAULT_PROFILE_ID, reload = true } = {}) {
  assertCommand(await bridgeCommand(tab, 'enable', profileId), 'enable');
  if (reload) await tab.reload();
  const status = assertCommand(await bridgeCommand(tab, 'status'), 'verify');
  if (!status.active || status.profileId !== profileId) throw new Error('The mobile bridge did not retain the requested profile after reload.');
  return verifyMobileMetrics(status.metrics, profileId);
}

export async function disableRealMobileView(tab, { reload = true } = {}) {
  assertCommand(await bridgeCommand(tab, 'disable'), 'disable');
  if (reload) await tab.reload();
  const status = assertCommand(await bridgeCommand(tab, 'status'), 'verify reset');
  if (status.active) throw new Error('The mobile bridge still reports an active device profile after reset.');
  return status.metrics;
}

export async function realMobileViewStatus(tab) {
  return assertCommand(await bridgeCommand(tab, 'status'), 'read status');
}

export { DEFAULT_PROFILE_ID, getDeviceProfile };
