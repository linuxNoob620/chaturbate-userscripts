# Current Project State

## Deployment

- Primary runtime: Tampermonkey userscript `Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Current userscript release: 16.6.13 (`main`, tag `v16.6.13`).
- Extension builds remain at 16.6.7. They were not modified, rebuilt, packaged, or published for this userscript-only change.
- Local rollback point: Git tag `backup/pre-16.6.8-workshop-doubletap-20260905` at the 16.6.7 baseline.
- Version 16.6.13 is installed in the existing Chrome testing-profile and Quetta Tampermonkey entries. The earlier fullscreen/native-behavior verdict remains **NOT FIXED** against the complete acceptance checklist; this Recu.me release does not change fullscreen code or certify that separate feature.
- Recu.me release rollback point: local tag `backup/pre-recu-16.6.13-20260909` at 16.6.12.
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
- Selected/remembered tabs load automatically without repeated label writes; attribute-only tab switches, page hiding and navigation cancel pending work and hover animations. Cancelled loads can be entered again.
- On native mobile room pages, **Recu.me** is available inside the existing three-dot room menu. A stable **Back to Room Menu** control returns to the original menu; normal player/tabs/fullscreen are untouched.
- Profile data is cached separately from settings in tab-session storage: twelve performers maximum, five-minute freshness, thirty-minute retention. Stale entries are labelled and reused until explicit Refresh. Refresh keeps previous results visible and reports failures without discarding them.
- The panel emphasizes last/new broadcasts, collapsible profile details, recording date/duration and labelled views. It initially shows eight cards; **Load older recordings** reveals remaining fetched cards before requesting an observed native pagination URL. Duplicate recording IDs are excluded.
- Exact performer identity and recording/page URLs are checked. External hosts are allowlisted. Images are fetched near the visible area, at most three requests at once, then converted to CSP-compatible data URLs. Failure placeholders wait for explicit refresh instead of retrying indefinitely.
- Desktop mouse hover waits 300 ms, then cycles random nonrepeating samples from Recu.me's confirmed sixteen-frame sprite. Only one hover animation runs; touch does not trigger it, and reduced-motion disables cycling. These are sampled images, not continuous/full-video seeking. Asset caching is memory-only and bounded.
- Recu.me currently rejects direct background userscript requests with HTTP 403. The Suite then opens the performer page in an inactive helper tab, extracts only the sanitized performer payload through the same Tampermonkey script, and closes the helper tab. Ordinary Recu.me visits are inert and do not mount the Suite.
- Helper requests use expiring one-use pending tokens, reject mismatched/stale replies and delete their transient storage keys when finished or cancelled. Ordinary Recu.me visits remain inert.
- The full-profile and recording actions remain normal external Recu.me links. The Suite does not embed an iframe, weaken Chaturbate's CSP, or reproduce Recu.me account/navigation behavior.

## Recu.me verification — 2026-09-09

- Actual Chrome-for-Testing/Tampermonkey: zero repeated native-label mutations; selected-tab loading; cache reuse after reload; actual mouse hover changing sampled frames; hover removal on pointer exit; lazy thumbnail requests; eight initial cards, fifteen locally available cards, then twenty-three unique cards through native pagination; refresh retains old card nodes until replacement; Bio/Recu switching.
- Real OPPO/Quetta/Tampermonkey: native-menu entry, two-column layout without horizontal page overflow, collapsible details, lazy thumbnails, eight/fifteen/twenty-three-card progression, retained results during refresh, stable Back control, original native menu restoration and Bio/menu re-entry passed through touch input.
- The first cold Quetta helper load timed out with an unrecognized-layout error. Opening the normal Recu.me profile once and retrying succeeded; later pagination and refresh succeeded. Cold-load reliability is not established across all Recu.me sessions. Login/verification and unavailable-profile messages are covered by fixture tests, not a live account-state matrix.
- `npm run test:recu` exercises shipped parser/helper/panel code: exact identity, allowlists, stale/cancelled helper messages, terminal cleanup, cache bounds/expiry/reload, pagination/deduplication, cancellation races, lazy/error thumbnail states, attribute-only tab changes, route removal and stable mobile Back ownership. Existing Suite lifecycle, Workshop refresh and encrypted-sync tests pass.

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

Final verified state after the real-phone passes on 2026-09-09:

- Quetta flag visibly reads `Default` after restart.
- `/data/local/tmp/chrome-command-line` is absent.
- ADB forward and reverse lists contain no test routes.
- Orientation settings were not changed during the Recu.me passes.
