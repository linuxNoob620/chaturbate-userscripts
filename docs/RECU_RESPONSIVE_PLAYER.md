# Recu.me Responsive Player

Version **0.2.1 — experimental desktop player**. Separate from Ziggy Chaturbate Suite and the paused Accurate Timeline Previews development. No Suite source, settings or extension build is changed.

## Install and use

[Install in Tampermonkey](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Responsive%20Player.user.js).

1. Disable **Recu.me Accurate Timeline Previews** to avoid overlapping player modifications.
2. Reload the recording's normal Recu.me playback page and start the original player. Existing site login/access requirements still apply.
3. The responsive player now starts automatically once the site's authorized recording/player is ready. Its fixed initial quality is **1080p**, or the highest offered resolution below it. Explicit manual quality and **Auto** choices remain available afterward. If native readiness takes more than twenty seconds after the supported source appears, use **Use responsive player** to retry; it does not run an endless takeover loop or bypass the site's Play/access gate.
4. Hover the replacement timeline for sampled thumbnails. Play/pause, mute/volume, speed, quality, fullscreen and video Picture-in-Picture use the replacement controls.
5. **Use original player** disposes the replacement and reloads the same recording with the site's `t` timestamp parameter, rounded down to a whole second. The URL also contains `rrp_player=original`, preventing automatic takeover on that URL, including reload. Explicit **Use responsive player** removes that marker. Ordinary new recording URLs default to the replacement. Native autoplay, audio preferences and speed initialization apply again; this is not preservation of the replacement's paused/volume/rate state.

Disable the new script and reload to remove it. This does not erase Suite or site settings.

Volume remains expanded whenever the control overlay is visible. With the video/timeline focused, Left/Right seek five seconds and Up/Down adjust volume by 5%. Up/Down also adjust a focused volume slider; mute remains a separate choice. Other inputs and menu keys are not remapped. Idle hiding still applies to the entire overlay, including volume.

## Architecture and limits

- Shaka Player **5.2.10** and its UI CSS are bundled, hash-pinned, and isolated in a private namespace. The page's `window.shaka` is not replaced. Upstream license and third-party notices are retained in both source distribution and generated userscript.
- `storyboards.js` validates native thumbnail cues, loads/decode-prepares at most two sheets concurrently and retains at most sixteen sheets. A 16,777,216-pixel retention budget is approximately 64 MiB at four bytes per pixel; it is not a hard browser-process memory cap. All sheets, callbacks and timers are released on disposal.
- `transport.js` delegates matching TS segments to the site's existing HLS loader. The current site adds required request authorization there; a plain replacement fetch returned HTTP 422 in the observed session. No authorization logic is reconstructed, no credentials are exported, and no access restriction is bypassed. Other requests use Shaka's fetch transport. Abort, timeout and cleanup ownership are explicit.
- `player.js` owns only its Shadow DOM player, scoped keyboard listeners and playback engine. The native player's existing cleanup is called before replacement media loads. Unknown/inaccessible native ownership is rejected rather than running two playback engines. Native display/keyboard configuration is restored during disposal; playback restoration uses the native timestamp route.
- Automatic startup waits for native readiness, briefly allows storyboard metadata to arrive, does not steal keyboard focus, and defers while native fullscreen/Picture-in-Picture is active. Route/element changes and page exit cancel its bounded timer. Handoff preserves the native playback snapshot rather than forcing play or unmute.
- Idle controls retain their pointer hit surface while transparent; hiding no longer generates its own pointer-exit/re-entry wakeup. Buffer/seek recovery rearms hiding without revealing idle controls. Pointer interaction, pause, menus, timeline hover and keyboard focus retain their existing visibility behavior.
- The tested Recu.me TS playlists round segment durations. Shaka now retains embedded segment timestamps (`ignoreManifestTimestampsInSegmentsMode`) rather than realigning each segment to those rounded boundaries. Gap/stall recovery remains enabled. This corrects the measured repeated buffer holes; it is not a guarantee for every timestamp/discontinuity layout or network stall.
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

Historical **0.1.0** acceptance; the current automatic-start and playback corrections are covered below.

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

## Desktop acceptance — 0.2.0, 2026-09-16

The actual existing Chrome-for-Testing/Tampermonkey entry was updated without reinstalling or resetting settings. Final saved editor bytes matched the generated 0.2.0 source; live build `5abb0248b147`. Three authorized recordings offered maximum renditions of 540p, 720p and 1080p respectively. No account actions, media downloads, phone changes or Suite/extension edits were performed.

| Check | Observed result |
| --- | --- |
| Baseline idle failure | 0.1.0 hid the overlay, then revealed it about 28 ms later with a stationary pointer. Changing `pointer-events` changed the hit target and generated the wakeup. |
| Baseline stutter | Repeated approximately 0.4-second buffer holes and Shaka recovery seeks of about 0.7–0.8 seconds occurred even with the pointer outside. Recovery events also revealed controls. The same source's native player had continuous buffered ranges. |
| Corrected playback | A candidate with the final media/idle changes advanced 76.005 seconds during 76.006 seconds of elapsed time at 540p, without observed jumps/stalls. Final-build 720p advanced 23.697 seconds over 23.696 seconds. Final-build 1080p passed a 35-second steady interval and a 47-second post-seek interval with zero additional gap jumps/stalls. A small initial-buffer jump was present in the 1080p startup counter; it did not recur during those intervals. These are bounded observations, not an all-recordings guarantee. |
| Default player and quality | Automatic handoff worked without clicking the opt-in button; decoded sizes matched fixed 540p, 720p and 1920 × 1080 fallback/default selection. Native video was paused and native HLS detached. |
| Idle/reveal/hover | Controls stayed hidden until pointer interaction; subsequent reveal/hide cycles did not create playback seeks/stalls. A loaded thumbnail remained ready and visible while hovered beyond the idle timeout. Open menus stayed usable. |
| Manual quality | Explicit 360p remained selected in the lower-resolution source. Final-build explicit Auto enabled ABR; selecting 1080p again disabled it and selected the 1080 track. Defaults do not repeatedly overwrite manual choices. |
| Cold seek | Timeline pointer seeking resumed playback at a nonzero position; a final-build 1080p seek produced a decoded frame after approximately 1.47 seconds. No universal seek-speed improvement is claimed. |
| Original-player fallback | Returned to the native timestamp route; `rrp_player=original` survived reload without takeover. Explicit responsive selection removed only that marker and resumed the replacement. |
| Fullscreen / final state | Fullscreen button entry/exit passed; actual browser Escape remains unconfirmed. Final foreground recording was left paused at fixed 1080p. |

Native-fullscreen/PiP startup deferral, missing-readiness timeout, cancellation and failure fallback are additionally covered by controlled fixtures, not a complete live browser-state matrix. Audible A/V synchronization and sources with different initial timestamp offsets/discontinuities were not comprehensively validated. Mobile/Firefox and external site actions remain outside accepted coverage.

## Control corrections — 0.2.1, 2026-09-16

Shaka's supported `alwaysShowVolumeBar` option removes hover-dependent volume expansion without custom sizing/CSS. Timeline arrow keys now use the existing media shortcuts at window capture; vertical keys on the volume input do likewise. The live page's `En.handleKey` handler was observed cancelling volume-arrow defaults after the Shadow DOM retargeted the input to its host. Other input/menu keys, media transport, quality and idle lifecycle are unchanged.

Actual saved Tampermonkey build `f29ba1c58771` passed: timeline click at 2177 seconds, Left to 2172, Right to 2177; repeated keydowns advanced once each; Up/Down adjusted volume by 0.05 without moving the timestamp, both on timeline and volume input. The volume bar retained a 100-pixel width and stationary mute-button position through pointer-hover samples in inline and fullscreen layouts. Fullscreen button exit and whole-overlay idle hiding to opacity zero while playing also passed. The existing foreground recording was left paused/muted at fixed 1080p; no extra tabs or phone work were needed. Browser/mobile coverage limitations above remain unchanged. Rollback: `backup/pre-responsive-controls-20260916`.

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

Local tests execute the shipped modules with controlled boundaries: 13 storyboard checks, 14 transport checks and 62 player/lifecycle checks. Coverage includes cue validation/caps/abort, scoped request delegation/ranges/late callbacks, exact teardown, retry ownership, keyboard isolation, stale async jobs, persistent errors, original timestamp URLs, open-menu idle behavior and BFCache handling. Regressions cover bounded automatic startup/cancellation, original-only URLs, fixed-quality defaults/manual override, non-waking recovery, rearming the idle timer after buffering, expanded volume, focused timeline arrows and native volume-key cancellation. The player checks passed ten repeated runs; the 0.2.0 baseline fails all four new control checks and removing only the volume-arrow branch fails its dedicated check. Mocks are not evidence of live mobile or alternate-site compatibility.

## Follow-up gate

Before broadening desktop acceptance: test alternate timestamp/discontinuity layouts, missing-storyboard and expired-session recovery, real browser Escape, external site workflows, and mobile/Firefox separately. Any further seek-speed claim needs matched-cache repeated measurement and transport/segment analysis, not just a new player skin. Rollback is available at local tag `backup/pre-responsive-20260916`.
