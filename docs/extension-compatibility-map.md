# Extension compatibility map

This document records the compatibility audit for `Chaturbate MultiCam Pro + Cam ARNA.user.js` version 16.6.2. The userscript remains the reference implementation. Extension builds copy its complete post-metadata body verbatim between explicit parity markers.

## Userscript metadata

| Userscript contract | Extension mapping |
| --- | --- |
| `@match https://chaturbate.com/*` | Generated content-script match, unchanged |
| `@match https://*.chaturbate.com/*` | Generated content-script match, unchanged |
| `@run-at document-end` | `content_scripts[].run_at: document_end` |
| no `@noframes` | `content_scripts[].all_frames: true` |
| `@require hls.js@1.6.16` | Exact pinned `hls.js` 1.6.16 file packaged locally and loaded immediately before the Suite |
| `@resource mediabunny@1.55.5` + `GM_getResourceText` | Tampermonkey loads the pinned converter only during finalization so a converter CDN failure cannot block Suite startup; extension builds package the exact same pinned bundle locally and load it immediately before the Suite |
| each `@connect` domain | Generated HTTPS host permission for the same domain |
| userscript name, description and version | Generated manifest name, description and version |
| `@downloadURL` / `@updateURL` | Continue to govern Tampermonkey only; extension packages use browser extension update/signing mechanisms |

The build fails if the HLS URL/version changes without an explicit audit, or if metadata and generated manifests diverge.

## GM/Tampermonkey APIs actually used

| API | Actual use | Extension adapter |
| --- | --- | --- |
| `GM_info` | Script name/version in Suite UI | Frozen object generated from authoritative metadata |
| `GM_getValue` | GitHub sync configuration, Archive Search settings and mobile-view settings | Synchronous in-memory view preloaded from `storage.local` before the userscript body starts |
| `GM_setValue` | Same settings domains | Updates the synchronous cache immediately and persists the unchanged value/type to `storage.local` |
| `GM_xmlhttpRequest` | GitHub Contents API, Archive Search checks, translation, CamSoda, Stripchat, Streamate, BongaCams, CAM4 and MyFreeCams lookups | Narrow message bridge to an extension background fetch; preserves method, URL, headers, body, timeout, anonymous/credential mode, response status/text/headers/final URL and load/error/timeout/abort callbacks used by the script |
| `GM_download` | Suite snapshot JPEG supplied as a `Blob` | Hidden same-document download anchor backed by an object URL, preserving the filename and load/error callbacks used by the script |
| `GM_openInTab` | Model pages and Recorder Hub, including background-tab behavior | Background `tabs.create`; preserves `active`, `insert` and `setParent` options used by the script and exposes a close handle |
| `window.focus` | Existing userscript behavior | Native content-script `window.focus`; no adapter |

Not present and therefore not emulated: `GM_deleteValue`, `GM_listValues`, value-change listeners, resources, menu commands, notifications, clipboard helpers, `GM_addStyle`, `unsafeWindow`, modern `GM.*` calls, or legacy APIs beyond those listed above.

## Execution world and CSP

- The source does not use `unsafeWindow`, page-owned JavaScript globals, `eval`, `new Function`, string timers, or remotely executed code.
- Suite globals are created and consumed inside the same integrated script. HLS is loaded in the same extension isolated world immediately before the Suite.
- Direct DOM access, event listeners, observers and media elements work from the extension content-script isolated world in the same way as the granted Tampermonkey sandbox.
- A page-world injection bridge is therefore neither needed nor desirable. Adding one would expose more surface and create new ordering differences.
- HLS is bundled locally because Manifest V3 does not permit remotely hosted executable code.

## Browser facilities intentionally left in the authoritative body

These require no adapter and remain byte-for-byte unchanged:

- DOM creation, selectors, style injection through created `<style>` elements and native Chaturbate modifications
- `MutationObserver`, `ResizeObserver` and `IntersectionObserver`
- timers, animation frames and transition timing
- click, keyboard, mouse, touch and pointer listeners
- history interception, URL/navigation detection and reload behavior
- page-origin `localStorage`, `sessionStorage`, cookies and IndexedDB/OPFS access
- `fetch`, media playlists and Chaturbate-origin requests
- `BroadcastChannel` recorder coordination and persistence
- `MediaRecorder`, `Blob`, object URLs and automatic downloads
- fullscreen and Picture-in-Picture APIs
- video/audio state, canvas snapshots and Web Audio behavior
- responsive desktop/mobile detection and the integrated mobile view
- iframes and dynamically created elements

## Persistent data

- Chaturbate-origin `localStorage`, cookies, IndexedDB and OPFS remain on the same site origin and retain their original keys, types, defaults and update behavior.
- GM-backed values retain their original keys, types and synchronous read semantics after the adapter preload. They are stored in the extension's private `storage.local`, rather than Tampermonkey's private extension storage.
- Browsers do not expose Tampermonkey's private GM storage to another extension. Existing GitHub/local backup flows remain the supported way to transfer data; the normal userscript format is unchanged.
- No automatic export or new migration behavior was added.

## Shared and browser-specific code

- Shared application code: the entire authoritative userscript body.
- Shared content adapter: `extension/shared/content-preamble.js` and `content-postamble.js`.
- Shared background adapter: `extension/shared/background.js`.
- Chrome-only definition: `extension/chrome/manifest.template.json`, selecting a Manifest V3 service worker.
- Firefox/Zen-only definition: `extension/firefox/manifest.template.json`, selecting a Manifest V3 background script and declaring the Gecko extension identity/data-collection metadata.

No Suite UI, CSS, wording, selectors, timing constants, defaults or application feature logic is forked by browser. The extension-only native browser context menu is implemented in the shared extension adapters and delegates to the existing Rooms/Workshop event paths.

### Native browser context menu

- Chrome and Firefox/Zen expose one static native submenu on Chaturbate: `Ziggy Chaturbate Suite` with `Rooms` and `Open Workshop`.
- The content adapter captures only strict contextual model metadata. Detection priority is the closest recognized model/Workshop card, then a directly targeted canonical model link, then the current top-level room URL, then no model.
- Captured context is held only in the background process's in-memory map. It is never written to Suite settings, Rooms storage, `storage.local`, or page storage.
- A capture is rejected after eight seconds, after navigation, or when its tab closes, and is always deleted after a menu action.
- `Rooms` sends a narrow command to the top Chaturbate frame. The authoritative Suite body opens its existing Rooms surface; Workshop and Recorder pages initialize only a hidden context host, with no normal visible UI changes.
- `Open Workshop` dispatches the existing Suite Workshop action. A direct background tab open is used only if the top-frame content script is unavailable.

## Permissions

Chrome and Firefox/Zen request the same capabilities:

- `storage`: required only for values that the userscript stores with GM storage.
- `contextMenus`: required only for the two extension-native Chaturbate context-menu commands.
- Content-script matches on Chaturbate: required to run on exactly the userscript's two `@match` patterns.
- HTTPS host access for the exact `@connect` domains: required only for the GM cross-origin request bridge.

The extensions do not request `tabs`, `downloads`, `clipboardWrite`, `notifications`, `webRequest`, `<all_urls>`, or a page-world scripting permission. Opening and closing tabs does not require access to sensitive tab properties.

## Build-time regression protection

`tools/verify-extension-parity.mjs` checks:

- exact byte equality of the copied userscript body
- SHA-256 of that body for both targets
- metadata/manifest version, name, description and URL-match equality
- exact `@connect`/host-permission equality
- injection timing and frame behavior
- only the expected extension API permission
- Chrome/Firefox background definitions
- byte equality of shared background code and pinned HLS
- JavaScript syntax and package presence

`tools/test-extension-adapters.mjs` exercises GM metadata, synchronous storage reads, value persistence, cross-origin request messaging, background request options, background tabs, tab closing, Blob snapshot downloads, static context-menu creation, model-context priority, reserved-route rejection, top-frame dispatch and transient-context clearing with mocked browser APIs.

## Known platform boundary

An unpacked Chrome extension can be installed locally. Firefox/Zen release builds require Mozilla signing for permanent installation; the generated XPI is directly usable as a temporary debugging add-on and is ready for signing without source changes. Signing is a browser distribution requirement, not an application behavior difference.

Native extension context menus are not available to Tampermonkey. A cross-origin child frame whose own document URL is outside the existing Chaturbate match/host scope may not display the extension menu; no unrelated cross-origin permission is requested. Chaturbate's top-level room URL remains the fallback whenever the menu action originates in an eligible Chaturbate document.
