# Recu.me Responsive Player

Version **0.1.0 — experimental desktop prototype**. Separate from Ziggy Chaturbate Suite and the paused Accurate Timeline Previews development. No Suite source, settings or extension build is changed.

## Install and use

[Install in Tampermonkey](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Responsive%20Player.user.js).

1. Disable **Recu.me Accurate Timeline Previews** to avoid overlapping player modifications.
2. Reload the recording's normal Recu.me playback page and start the original player. Existing site login/access requirements still apply.
3. Click **Use responsive player** above it. Replacement is opt-in on each page; the original player is not automatically taken over.
4. Hover the replacement timeline for sampled thumbnails. Play/pause, mute/volume, speed, quality, fullscreen and video Picture-in-Picture use the replacement controls.
5. **Use original player** disposes the replacement and reloads the same recording with the site's `t` timestamp parameter, rounded down to a whole second. Native autoplay, audio preferences and speed initialization apply again; this is not preservation of the replacement's paused/volume/rate state.

Disable the new script and reload to remove it. This does not erase Suite or site settings.

## Architecture and limits

- Shaka Player **5.2.10** and its UI CSS are bundled, hash-pinned, and isolated in a private namespace. The page's `window.shaka` is not replaced. Upstream license and third-party notices are retained in both source distribution and generated userscript.
- `storyboards.js` validates native thumbnail cues, loads/decode-prepares at most two sheets concurrently and retains at most sixteen sheets. A 16,777,216-pixel retention budget is approximately 64 MiB at four bytes per pixel; it is not a hard browser-process memory cap. All sheets, callbacks and timers are released on disposal.
- `transport.js` delegates matching TS segments to the site's existing HLS loader. The current site adds required request authorization there; a plain replacement fetch returned HTTP 422 in the observed session. No authorization logic is reconstructed, no credentials are exported, and no access restriction is bypassed. Other requests use Shaka's fetch transport. Abort, timeout and cleanup ownership are explicit.
- `player.js` owns only its Shadow DOM player, scoped keyboard listeners and playback engine. The native player's existing cleanup is called before replacement media loads. Unknown/inaccessible native ownership is rejected rather than running two playback engines. Native display/keyboard configuration is restored during disposal; playback restoration uses the native timestamp route.
- `@grant none` with bundled dependencies is intentional. In the tested Tampermonkey environment, a resource grant isolated the window from the native player/loader even with `@sandbox raw`. Actual installed-script tests, not manual page injection, established the working mode.
- The script is restricted to top-level HTTPS Recu.me recording playback routes. No persistent storage, recording/file download, account modification or phone setting change is added. Media is buffered for ordinary playback; previews download the site's existing storyboard images.

### What this prototype does not promise

- **Not second-accurate thumbnails.** It displays the site's existing sampled image covering the hovered interval, with the requested hover timestamp. The tested 2h41m57s recording supplied 128 samples, roughly 75–76 seconds apart. Sample density depends on the source. No hidden video decoder or per-hover segment fetch is used for previews.
- **Not YouTube's encoding/CDN performance.** A different UI cannot remove remote delivery, segment, codec/keyframe or browser decoding latency. Cold seeking was not proven faster in these tests.
- **Not complete native-site integration.** External site controls such as clips, bookmarks, timecode actions, next-recording/autoplay, casting and download controls may still target the original player. Use **Use original player** for them. These workflows have not been accepted against the replacement.
- **Desktop Chrome only tested.** Firefox, Quetta/mobile, touch/portrait gesture parity, alternate stream layouts and a broad recording/account matrix remain untested. Responsive CSS alone is not mobile acceptance.
- The source handoff depends on the current site's exposed HLS loader/cleanup and TS layout. A site change can make the prototype unavailable; the original-player fallback remains the supported recovery.
- First storyboard preparation still requires an image request and decode. Missing/failed sheets show loading/unavailable instead of a stale unrelated picture.

## Actual desktop acceptance — 2026-09-15

Persistent Chrome-for-Testing, actual Tampermonkey entry, one existing authorized recording. Old Accurate Timeline Previews disabled; Suite left unchanged. The final editor readback matched the generated file after reload and the live build identifier was `e50f01a5a201`.

| Check | Observed result |
| --- | --- |
| Actual installation and opt-in handoff | Replacement played the authorized HLS source; native HLS media was detached and native video paused. No page `window.shaka` was introduced. |
| Loaded sampled hover | Four pointer locations showed ready previews on the next animation frame, measured 1.1–1.6 ms from the dispatched move; canvas crop work was 0.1–0.2 ms. These are browser instrumentation timings, not display/input-to-photon latency guarantees. |
| Hover request cost | Zero additional TS requests and zero image requests across those four hovers after the single storyboard sheet was loaded. |
| Controls while hovering | Preview remained ready and controls visible beyond the 2.5-second idle timer. |
| Open settings menu | A discovered selector mismatch was corrected to the actual Shaka overflow/sub/context-menu classes. Final live menu remained visible after three seconds with the pointer outside it; fixtures separately cover all menu classes. |
| Playback controls | Play/pause, Space on focused timeline, 5-second keyboard seek, 1.25x speed and selection of a playing 720p rendition passed. |
| Fullscreen | Button entry/exit and F entry/exit passed repeated cycles with the same replacement host. Automated Escape did not establish browser Escape acceptance; that remains unconfirmed. |
| Video Picture-in-Picture | Actual menu entry/exit passed. The ShadowRoot PiP element was the replacement video; the native video remained paused. |
| Return to original | Requested timestamp 2986 seconds; native resumed at 2986.010 seconds, with native HLS attached and replacement inactive. Opt-in replacement worked again afterward. |
| Final state | Replacement left ready and paused in the existing foreground recording tab. Old Accurate Timeline Previews remains disabled intentionally. |

### Seek measurements and interpretation

Same recording, three pointer seeks per player, at approximately 39%, 47%, 55%. Cache/server conditions were not identical, so this is diagnostic evidence, not a controlled performance benchmark.

| Player | Pointer action to `seeking` event | Action to first decoded frame |
| --- | --- | --- |
| Native baseline | 216 / 216 / 210 ms | 1239 / 2879 / 2142 ms |
| Replacement | 6 / 5 / 5 ms | 1260 / 2326 / 2594 ms |

The replacement responds to the seek command sooner, but **cold-seek completion is not proven faster**. Sampled hover avoids this media-seek path entirely. Instrumented first-frame timestamps do not guarantee the monitor displayed that frame at exactly that instant.

## Source, build and checks

Production modules: `standalone/recu-responsive/{storyboards,transport,player}.js`.
Pinned dependencies and license: `standalone/recu-responsive/vendor/`.
Generated independent outputs: `Recu.me Responsive Player.user.js` and `.meta.js`.

Run from the repository root with Node.js 22 or later:

```powershell
node tools/build-recu-responsive.mjs
node tools/build-recu-responsive.mjs --check
node --check "Recu.me Responsive Player.user.js"
node tools/test-recu-responsive-storyboards.mjs
node tools/test-recu-responsive-transport.mjs
node tools/test-recu-responsive-player.mjs
```

The build checks pinned hashes and refuses modified dependencies. Vendored bytes and explicit LF source rules make output reproducible. These commands do not rebuild the Suite or extensions.

Local tests execute the shipped modules with controlled boundaries: 13 storyboard checks, 14 transport checks and 41 player/lifecycle checks. Coverage includes cue validation/caps/abort, scoped request delegation/ranges/late callbacks, exact teardown, retry ownership, keyboard isolation, stale async jobs, persistent errors, original timestamp URLs, open-menu idle behavior and BFCache handling. Mocks are not evidence of live mobile or alternate-site compatibility.

## Follow-up gate

Before broadening from this opt-in desktop prototype: test multiple recordings/renditions, missing-storyboard and expired-session recovery, real browser Escape, external site workflows, and mobile/Firefox separately. Any further seek-speed claim needs matched-cache repeated measurement and transport/segment analysis, not just a new player skin.
