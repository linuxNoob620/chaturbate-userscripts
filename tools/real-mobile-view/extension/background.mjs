import { getDeviceProfile } from './profiles.mjs';

const MESSAGE_TYPE = 'ziggy-real-mobile-view-command';
const SESSION_PREFIX = 'ziggy-real-mobile-view-tab-';

const debuggee = tabId => ({ tabId });
const sessionKey = tabId => `${SESSION_PREFIX}${tabId}`;

function assertChaturbateUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || (parsed.hostname !== 'chaturbate.com' && !parsed.hostname.endsWith('.chaturbate.com'))) {
    throw new Error('Real mobile view is restricted to Chaturbate tabs.');
  }
}

function chromeVersion() {
  return self.navigator.userAgent.match(/Chrome\/(\d+(?:\.\d+){0,3})/)?.[1] || '152.0.0.0';
}

function fullVersion(version) {
  const parts = version.split('.');
  while (parts.length < 4) parts.push('0');
  return parts.slice(0, 4).join('.');
}

function mobileUserAgent(profile) {
  const version = fullVersion(chromeVersion());
  return `Mozilla/5.0 (Linux; Android 13; ${profile.model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Mobile Safari/537.36`;
}

function mobileUserAgentMetadata(profile) {
  const version = fullVersion(chromeVersion());
  const major = version.split('.')[0];
  return {
    brands: [
      { brand: 'Not_A Brand', version: '99' },
      { brand: 'Chromium', version: major },
      { brand: 'Google Chrome', version: major },
    ],
    fullVersionList: [
      { brand: 'Not_A Brand', version: '99.0.0.0' },
      { brand: 'Chromium', version },
      { brand: 'Google Chrome', version },
    ],
    platform: profile.platform,
    platformVersion: profile.platformVersion,
    architecture: '',
    model: profile.model,
    mobile: true,
    bitness: '',
    wow64: false,
  };
}

function desktopUserAgentOverride() {
  return {
    userAgent: self.navigator.userAgent,
    platform: self.navigator.platform || 'Win32',
  };
}

async function send(tabId, method, params = {}) {
  return chrome.debugger.sendCommand(debuggee(tabId), method, params);
}

async function storedSession(tabId) {
  const key = sessionKey(tabId);
  return (await chrome.storage.session.get(key))[key] || null;
}

async function storeSession(tabId, value) {
  await chrome.storage.session.set({ [sessionKey(tabId)]: value });
}

async function clearSession(tabId) {
  await chrome.storage.session.remove(sessionKey(tabId));
}

async function ensureAttached(tabId) {
  const session = await storedSession(tabId);
  if (session) {
    try {
      await send(tabId, 'Runtime.evaluate', { expression: 'void 0' });
      return false;
    } catch {
      await clearSession(tabId);
    }
  }
  try {
    await chrome.debugger.attach(debuggee(tabId), '1.3');
    return true;
  } catch (error) {
    throw new Error(`Chrome refused the mobile-emulation debugger attachment: ${error?.message || error}`);
  }
}

async function clearOverrides(tabId) {
  await send(tabId, 'Emulation.clearDeviceMetricsOverride');
  await send(tabId, 'Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  await send(tabId, 'Emulation.setEmitTouchEventsForMouse', { enabled: false, configuration: 'desktop' });
  await send(tabId, 'Emulation.setUserAgentOverride', desktopUserAgentOverride());
}

async function enableMobile(tabId, profileId) {
  const profile = getDeviceProfile(profileId);
  const attachedNow = await ensureAttached(tabId);
  try {
    await send(tabId, 'Emulation.setDeviceMetricsOverride', {
      width: profile.width,
      height: profile.height,
      deviceScaleFactor: profile.deviceScaleFactor,
      mobile: profile.mobile,
      screenWidth: profile.width,
      screenHeight: profile.height,
      positionX: 0,
      positionY: 0,
      scale: 1,
      screenOrientation: profile.screenOrientation,
    });
    await send(tabId, 'Emulation.setTouchEmulationEnabled', {
      enabled: profile.touch,
      maxTouchPoints: profile.maxTouchPoints,
    });
    await send(tabId, 'Emulation.setEmitTouchEventsForMouse', {
      enabled: profile.touch,
      configuration: 'mobile',
    });
    await send(tabId, 'Emulation.setUserAgentOverride', {
      userAgent: mobileUserAgent(profile),
      platform: profile.platform,
      userAgentMetadata: mobileUserAgentMetadata(profile),
    });
    await storeSession(tabId, { profileId: profile.id, enabledAt: Date.now() });
    return { active: true, profile };
  } catch (error) {
    if (attachedNow) {
      try { await chrome.debugger.detach(debuggee(tabId)); } catch { /* best effort rollback */ }
    }
    await clearSession(tabId);
    throw error;
  }
}

async function disableMobile(tabId) {
  const session = await storedSession(tabId);
  if (!session) return { active: false };
  try {
    await clearOverrides(tabId);
  } finally {
    await clearSession(tabId);
    try { await chrome.debugger.detach(debuggee(tabId)); } catch { /* already detached */ }
  }
  return { active: false };
}

async function status(tabId) {
  const session = await storedSession(tabId);
  return { active: Boolean(session), profileId: session?.profileId || null };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== MESSAGE_TYPE) return undefined;
  const tabId = sender.tab?.id;
  const url = sender.tab?.url || '';
  (async () => {
    if (!Number.isInteger(tabId)) throw new Error('The mobile-view command did not originate from a browser tab.');
    assertChaturbateUrl(url);
    if (message.action === 'enable') return enableMobile(tabId, message.profileId);
    if (message.action === 'disable') return disableMobile(tabId);
    if (message.action === 'status') return status(tabId);
    throw new Error(`Unknown mobile-view action: ${message.action}`);
  })().then(
    result => sendResponse({ ok: true, ...result }),
    error => sendResponse({ ok: false, error: error?.message || String(error) }),
  );
  return true;
});

chrome.debugger.onDetach.addListener(source => {
  if (Number.isInteger(source.tabId)) clearSession(source.tabId).catch(() => {});
});
