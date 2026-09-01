# Ziggy Real Mobile View Helper

This helper gives Codex a deterministic way to switch the connected Chrome Chaturbate tab into actual DevTools mobile emulation without asking the user to press F12.

It is separate from the Ziggy Chaturbate Suite so it does not alter userscript/extension parity or add the powerful `debugger` permission to the normal Suite.

## One-time Chrome installation

Chrome requires the user to approve every extension that requests the `debugger` permission. This one security step cannot be automated or bypassed.

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `extension` folder beside this README.

After that one-time installation, Codex can enable and reset mobile emulation without user interaction.

## Codex use

Import `mobile-view.mjs` into the connected Chrome-control session and pass its active Chaturbate tab:

```js
const mobileView = await import('file:///C:/Users/Ziggy/Documents/Codex/2026-08-15/merege/outputs/tools/real-mobile-view/mobile-view.mjs');
await mobileView.enableRealMobileView(tab);
// Test the mobile site.
await mobileView.disableRealMobileView(tab);
```

The default device is Samsung Galaxy S20 Ultra:

- viewport: 412 × 915 CSS pixels
- device pixel ratio: 3.5
- Android mobile user agent and client hints
- five touch points
- mobile/coarse pointer behavior
- portrait orientation
- automatic reload followed by runtime verification

The helper is deliberately restricted to `https://chaturbate.com/*` and its HTTPS subdomains.

## Permission

`debugger` is required because Chrome exposes DPR, touch, mobile user-agent/client-hint, orientation, and device-metric emulation through Chrome DevTools Protocol commands. A viewport-only resize cannot reproduce those behaviors.

`storage` is used only for transient per-tab emulation state in `chrome.storage.session`; it is cleared when emulation ends or the debugger detaches.

## Verification

Run:

```powershell
node .\tools\real-mobile-view\verify.mjs
```

The verifier checks the manifest permission boundary, required CDP commands, enable/reset flows, failure detection, and ten consecutive deterministic command cycles.
