# Current Project State

## Deployment

- Primary runtime: Tampermonkey userscript `Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Current userscript release: 16.6.12 (`main`, tag `v16.6.12`).
- Extension builds remain at 16.6.7. They were not modified, rebuilt, packaged, or published for this userscript-only change.
- Local rollback point: Git tag `backup/pre-16.6.8-workshop-doubletap-20260905` at the 16.6.7 baseline.
- Version 16.6.9 is installed in the original Quetta Tampermonkey entry. Its fullscreen/native-behavior verdict remains **NOT FIXED** against the complete acceptance checklist; publication is not a parity certification.
- Candidate rollback point: `backup/pre-native-portrait-20260905`. Extension outputs are unchanged.

## Fullscreen implementation and remaining gaps

- Normal-room mobile sizing overrides are excluded from actual/native expanded fullscreen; chat hiding is suspended there, and the Suite action delegates to the site's native fullscreen control.
- Workshop uses the existing fullscreen element with session-only portrait sizing and gesture adaptation, preserves preview double-tap, and defers grid reparenting until exit. No single-tap room opener or separate fullscreen UI was added.
- Real-phone normal-room checks passed for portrait sizing, the compared pinch/pan sequence, and three native-control exit/re-entry cycles. Full control/gesture coverage and desktop Tampermonkey regression remain incomplete.
- Real-phone Workshop checks passed for single-tap non-navigation, double-tap entry, unchanged tab count/URL, compared portrait pinch sizing, pan, rotation, and three exit/re-entry cycles.
- **Failing criterion:** Workshop's browser video controls do not reliably become visible on tap, even with `controls` enabled. The cause of this remaining failure is not confirmed.
- Focused source/build tests pass; they do not substitute for the outstanding behavior checks. Publication was explicitly authorized after the user was informed of the failing criterion and incomplete desktop regression.

## Workshop

- Refresh uses four concurrent status probes without a fixed delay, per-room in-flight sharing, visible-card priority, and the existing shared throttle cooldown with reduced batch concurrency after throttling.
- Startup refresh coordinates preview probes; progress and counts update directly with frame-coalesced count work instead of rebuilding the sidebar for every result.
- Healthy stream playback is preserved when a status response changes only the stream URL token; a changed stream path or failed playback still follows reconnection logic.
- The card More menu resolves the current room locally and no longer references the removed Following source.
- Grid and Phone viewing modes are implemented; Focus mode has been removed.
- Online Following has been removed from Workshop, including its cache, fallback parser/iframe, paging and sorting state, split-view source, mount refresh, and five-minute refresh timer.
- Chaturbate's native desktop Following dropdown provides the animated followed-room previews, ordered by latest broadcast start; its native Show All destination is preserved.
- A playing Workshop preview no longer opens a room from a single tap.
- Double-tapping the playing preview uses the shared Workshop native-fullscreen path.
- Explicit model-name links remain the navigation action; preview taps themselves do not navigate or create tabs.

## Normal rooms

- Normal-room behavior remains on Chaturbate's native player/fullscreen path.
- The 16.6.8 Workshop fix did not change normal-room handlers.
- The verified userscript-disabled phone baseline is recorded in `BEHAVIOR_BASELINES.md`.

## Recu.me model-room tab

- On desktop model-room pages, the Suite renames Chaturbate's native **Share** tab to **Recu.me** and reuses the native `#shareTab` content panel.
- Profile data and recent recording cards load only after the Recu.me tab is selected. Rendered text and URLs are sanitized, external hosts are allowlisted, and recording thumbnails are converted to CSP-compatible data URLs.
- Recu.me currently rejects direct background userscript requests with HTTP 403. The Suite then opens the performer page in an inactive helper tab, extracts only the sanitized performer payload through the same Tampermonkey script, and closes the helper tab. Ordinary Recu.me visits are inert and do not mount the Suite.
- The full-profile and recording actions remain normal external Recu.me links. The Suite does not embed an iframe, weaken Chaturbate's CSP, or reproduce Recu.me account/navigation behavior.

## Verification — 2026-09-05

- Real OPPO CPH2791 / Quetta / Tampermonkey pass: single-tapping a live Workshop preview kept the Workshop URL foregrounded and kept the page count at three.
- Real OPPO CPH2791 / Quetta / Tampermonkey pass: rapid double-tap entered native fullscreen, kept the Workshop URL, and kept the page count at three.
- Android Back exited fullscreen.
- Focused userscript build, syntax, and source-regression checks pass for 16.6.8.
- Desktop Chrome-for-Testing/Tampermonkey verification on 2026-09-06 confirmed the installed 16.6.10 runtime, the reduced Workshop group list, preserved saved-room library, and no Workshop Following requests, parser iframe, or pager on a fresh load.
- Desktop Chrome-for-Testing/Tampermonkey verification on 2026-09-08 confirmed the installed 16.6.11 Recu.me tab on multiple live rooms, lazy idle state, room-to-room reset, eight sanitized recording cards with loaded thumbnails, repeated native-tab switching, automatic helper-tab closure, the full-profile link, inert ordinary Recu.me visits, and absence from Workshop. A live current performer without a Recu.me profile was not found, so the unavailable-profile branch remains source-verified rather than live-confirmed.

## Workshop performance verification — 2026-09-09

- Persistent Chrome-for-Testing / actual Tampermonkey: 65-room baseline 20.501 seconds; three candidate passes 5.271, 5.522, and 5.206 seconds (mean 5.333 seconds, approximately 74% less elapsed time). All 195 candidate status requests returned HTTP 200.
- Fresh startup made 65 requests for 65 rooms with no duplicates. Measured card positions remained stable, video elements were retained, and progress advanced monotonically to 100%.
- Main-thread work was 2.06–2.26 seconds with eight previews playing, compared with 4.18 seconds in the baseline. This did not reach the preferred 1.5-second target; live stream content/load varied between passes.
- Group switching, saved-room preservation, Online/Online Favorites counts, the More menu, active recording across refresh, stop/finalization, normal-room playback, and Rooms dock opening passed desktop checks.
- Scheduler behavior tests cover request sharing, fresh subsequent checks, forced replacement, stop/restart, concurrency, cooldown, progress totals, and token-only versus actual stream changes.
- No phone was connected. Quetta was not tested or modified during this release; earlier fullscreen limitations remain as documented above.

## CommandLineOnNonRooted

Expected idle state: **OFF**.

Final verified state after the real-phone pass on 2026-09-05:

- Quetta flag visibly reads `Default` after restart.
- `/data/local/tmp/chrome-command-line` is absent.
- ADB forward and reverse lists contain no test routes.
- Auto-rotation is restored (`accelerometer_rotation=1`, `user_rotation=0`).
