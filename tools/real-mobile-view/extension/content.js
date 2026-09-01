(() => {
  'use strict';

  const CHANNEL = 'ziggy-codex-real-mobile-view-v1';
  const MESSAGE_TYPE = 'ziggy-real-mobile-view-command';

  function metrics() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      deviceScaleFactor: window.devicePixelRatio,
      userAgent: navigator.userAgent,
      userAgentDataMobile: navigator.userAgentData?.mobile ?? null,
      maxTouchPoints: navigator.maxTouchPoints,
      touchEvents: 'ontouchstart' in window,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      hoverNone: window.matchMedia('(hover: none)').matches,
    };
  }

  window.addEventListener('message', event => {
    const request = event.data;
    if (event.source !== window || request?.channel !== CHANNEL || request?.direction !== 'request' || typeof request.id !== 'string') return;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPE,
      action: request.action,
      profileId: request.profileId,
    }).then(
      result => window.postMessage({ channel: CHANNEL, direction: 'response', id: request.id, result: { ...result, metrics: metrics() } }, '*'),
      error => window.postMessage({ channel: CHANNEL, direction: 'response', id: request.id, result: { ok: false, error: error?.message || String(error), metrics: metrics() } }, '*'),
    );
  });
})();
