# Current Project State

## Deployment

- Primary runtime: Tampermonkey userscript `Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Current userscript release: 16.6.15 (`main`, tag `v16.6.15`). The documented native-fullscreen limitations are unchanged and were accepted by the user; this update does not claim to resolve them.
- Extension builds remain at 16.6.7. They were not modified, rebuilt, packaged, or published for this userscript-only change.
- Local rollback point: Git tag `backup/pre-16.6.8-workshop-doubletap-20260905` at the 16.6.7 baseline.
- Version 16.6.15 is installed in the existing Chrome testing-profile and Quetta Tampermonkey entries. Both editor readbacks matched the source after reload, and both live runtimes reported 16.6.15. No reinstall or settings reset was performed. The earlier fullscreen/native-behavior verdict remains **NOT FIXED** against the complete acceptance checklist.
- Recu.me release rollback point: local tag `backup/pre-recu-16.6.13-20260909` at 16.6.12.
- Candidate rollback point: `backup/pre-native-portrait-20260905`. Extension outputs are unchanged.

## GitHub import and export feedback — 16.6.15

- Rollback: local tag `backup/pre-github-import-toast-16.6.14-20260912` at `9296e6306a7b29e501a511b48e59e33c70b47aa5`.
- Import/synchronization guards compare actual settings content, including custom per-group card sizes, rather than counting every Store write. Pending and persisted room-status updates no longer invalidate an import or its completion reload; genuine edits during asynchronous work still reject stale replacement/acknowledgement.
- All manual import entry points flush pre-existing pending edits before reading the backup. Failed persistence aborts. Explicit import can still repair unchanged damaged storage while retaining its recoverable original; export remains strict about readable persisted settings.
- Model-added and automatic-export messages now use one toast renderer, retaining the existing normal-page/mobile and Workshop styles. Export has its own keyed, dismissible message, persistent progress/error feedback, a five-second result, and precise timer/empty-host cleanup. No automatic import was added.
- Local extracted-source checks pass: persistence 44, UI/request 22, existing legacy 53, Suite/Workshop/Recu.me/GitHub sync and Stage 3 follow-ups. Regression coverage includes pending/saved status races, real edits/card sizes, persistence failure, corrupt-store repair, shared toast styling and timer ownership.
- Actual persistent Chrome/Tampermonkey and OPPO/Quetta/Tampermonkey checks reached a decrypted-backup replacement confirmation, cancelled without applying it. Chrome's content guard was also exercised before confirmation. The shipped renderer displayed separately labelled notification previews; real mouse/touch dismissal passed, as did phone viewport fit. These previews made no upload. Full live replacement and account cloud writes remain untested; controlled fixtures cover application and automatic-upload outcomes.
- Scope: userscript only. No recording, fullscreen, extension, account follow/unfollow, or saved-library changes were made by these tests.

## Stage 2 engineering changes incorporated in 16.6.14

- Release 16.6.14 contains the Stage 2 correctness, persistence, lifecycle and bounded performance changes plus the narrow Stage 3 acceptance corrections and the authorized recording removal/native-style redesign below. These were previously tested under the unreleased 16.6.13 candidate label, distinct from published 16.6.13.
- Rollback tag: `backup/pre-stage2-16.6.13-20260909`, commit `2d438020564307c49f8bb7e4ed3e043e17958c20`.
- Local writes/imports now propagate failure, preserve the last configuration backup, reject stale upload/import acknowledgement, and replace Workshop's in-memory state after an authoritative same-page import. Cross-component imports remain non-atomic and can report partial failure.
- Suite recording was subsequently removed at the user's request. The earlier recorder implementation/results in Stage 2/3 reports are historical, not current functionality. Existing media and recovery sources were not deleted.
- Notes use request generations and exact submitted-text acknowledgement. Empty/no-progress pagination terminates. Cleared shortcuts stay disabled. Panel disposal, stable Workshop card ordering, HLS handler ownership and idempotent mobile Rooms labels have regression coverage.
- Successful bulk Unfollow retains its existing note-cleanup policy, but cleanup follows successful unfollow; already-unfollowed cards never trigger Follow or Ban. Ban-dependent cleanup follows successful ban, with truthful partial-failure reporting. These paths were tested only with mocks, never on the account.
- No new normal-room or Workshop fullscreen-parity fix is claimed. Native fullscreen/viewport rewrites, incremental chat processing and transient-only Workshop pan optimization are deferred. The existing failing/incomplete fullscreen acceptance findings below still apply.
- Verification is limited to extracted-source deterministic tests, the existing read-only project checks, and isolated Chrome DOM fixtures. No candidate install, live account action, phone setting change, extension build, commit or publication occurred in Stage 2.
- Detailed implementation, evidence, limitations and Stage 3 checklist: `docs/STAGE2_IMPLEMENTATION_REPORT.md`.

## Stage 3 acceptance state

- Complete native-behavior acceptance remains **NEEDS FURTHER WORK**, independently of the focused redesign checks below. Stage 3 itself made no release; subsequent explicit user authorization publishes the current implementation as 16.6.14 without changing that verdict. Historical acceptance results and remaining native-behavior gates: `docs/STAGE3_ACCEPTANCE_REPORT.md`. Recording-specific gates are retired because that feature was removed, not because every earlier failure was resolved. Extensions are unchanged.
- The pre-redesign candidate SHA-256 was `3970e6a003b031edd0af0bede84cd3d0cd7275d06390ef7c8a401ffe9f039dc7`. Its recoverable copy is `C:\Users\Ziggy\AppData\Local\ZiggySuiteBackups\remove-recording-20260912\Chaturbate MultiCam Pro + Cam ARNA.user.js`. The following recorder observations describe that earlier candidate only.
- MP4 conversion probes AVC constant-bitrate support at the actual source dimensions and uses variable bitrate when necessary. A valid container with discarded audio/video tracks is rejected instead of being reported as a complete conversion. A short post-change phone MP4 contained H.264/AAC, played on the phone and decoded successfully; audible source matching remains incomplete.
- The historical Recorder Hub header correction and recovered-job metadata logic are no longer shipped. The underlying broad native-header CSS quirk still matters for other panels.
- Workshop portrait geometry follows final fullscreen viewport growth, retains user zoom through landscape and recenters pan on portrait return. Repeated real-phone sequence passed, but Workshop native browser fullscreen/exit control remains unresolved. Android Back exit is not equivalent to that control.
- Generic transient cleanup now calls the Workshop drawer's owned close handler. Three actual desktop Menu/Escape cycles passed; this final correction has not been phone-tested.
- An intermittent background Recorder Hub start stopped with zero capture in an unexpected second Hub. Ownership/background-expiry is a hypothesis, not a proven cause or completed fix. A later single-owner recording and offline Stop passed.
- Phone and desktop Workshop refreshes retained the inspected card/video nodes. Full dynamic remounting, live notes/shortcut matrix, multi-device sync, long-session profiling and several native-control paths remain incomplete. Short desktop viewports can clip the sidebar footer; no layout rewrite was made.
- Eight Stage 3 extracted-source regressions pass alongside Stage 2 and existing project checks. These do not replace the uncompleted live acceptance gates.

## Fullscreen implementation and remaining gaps

- Normal-room mobile sizing overrides are excluded from actual/native expanded fullscreen; chat hiding is suspended there, and the Suite action delegates to the site's native fullscreen control.
- Workshop uses the existing fullscreen element with session-only portrait sizing and gesture adaptation, preserves preview double-tap, and defers grid reparenting until exit. No single-tap room opener or separate fullscreen UI was added.
- Stage 3 real-phone normal-room comparison passed the tested native-control portrait sizing, pinch/pan, landscape/portrait rotation, exit/re-entry and scrolling sequence. Inline fit differs from the native crop; the Suite's separate fullscreen action and exhaustive controls/gesture coverage are not accepted. Focused desktop checks do not complete those gaps.
- Real-phone Workshop checks passed single-tap non-navigation, double-tap entry, unchanged tab count/URL, visible browser controls/pause-resume, compared portrait sizing/pinch/pan/rotation and three Android Back exit/re-entry cycles.
- **Failing criterion:** the browser fullscreen button is disabled under `nofullscreen`; removing the token experimentally entered video-only landscape fullscreen rather than exiting the ancestor. The experiment was reverted. Native browser-control exit is not fixed. Workshop also starts a fresh zoom session on re-entry unlike the compared native room.
- Focused source and runtime checks do not substitute for the outstanding behavior checks. Earlier release publication was separately authorized; Stage 3 publication was expressly prohibited and did not occur.

## Workshop

### Native-style redesign released in 16.6.14

- Release source SHA-256: `77b27b808856a1367de0283ae4510361121671b50c0e8558a7aa308001fc40ea`, 18,725 lines. The live-tested candidate hash was `5d2f423d16f1097db0519c5a4cff5d7f30443cc0acff8cc470456fe47de50df9`; only four version-label occurrences changed for release. The existing Chrome and Quetta Tampermonkey entries were updated to that candidate without reinstalling or resetting settings; final Chrome editor readback matched it after reload. Extension artifacts remain untouched.
- Suite capture, Recorder Hub/Center, recording controls/shortcuts, command/ownership workers and MP4 conversion were removed. The userscript no longer loads Mediabunny. Saved media/recovery files and archive-browsing features remain; frozen extension dependencies and historical recorder tests were not deleted.
- Desktop Workshop adopts the actual hydrated native header, keeping its search/account controls, with bounded recovery when Chaturbate replaces that header. Category pills, native-style cards, a Groups drawer and one unified menu replace the old dashboard/sidebar presentation. The fallback/mobile header reuses the site's logo. This is a native-style presentation, not a claim that every native homepage data field is duplicated.
- Mobile Grid displays two columns. Existing Grid/Phone modes, density, filters, saved groups, split view, screenshots, explicit room links and double-tap preview fullscreen remain. Inline card aspect-ratio changes exclude fullscreen elements.
- Refresh progress is visible above the grid even with Groups closed. The menu exposes explicit GitHub export, GitHub import, cloud configuration and local data actions. Refresh scope/concurrency and stable card identity are preserved.
- Direct native-style **Rooms** and **Recu.me** tabs are visible at the front of the mobile room strip. Native Private/Tokens tabs remain available. Rooms temporarily owns the native Private carousel slot without displaying its composer; Recu.me reuses the existing menu panel/renderer and Back control. Native host underline suppression is scoped to Suite ownership and removed when that ownership ends.
- Recu.me uses a `div` heading so native global mobile `header` rules cannot pin it over the video. Deliberate selection is still required; normal room entry stays muted with Recu.me hidden.
- Focused Chrome and actual OPPO/Quetta interactions passed for the redesigned Workshop, Groups/outside dismissal, menu entries, mobile room-tab access and the corrected panel positioning. Desktop preview fullscreen entry/Escape and phone double-tap/same-URL/same-tab-count/Android Back passed. These limited checks do **not** resolve the outstanding complete fullscreen acceptance criteria below.
- Current local checks: syntax/userscript metadata validation; Suite, Workshop refresh, Recu.me, GitHub sync and Stage 3 follow-ups; Stage 2 UI (20 checks), persistence (37 checks) and legacy (53 checks). No destructive account actions or live GitHub writes were performed. See `docs/NATIVE_WORKSHOP_IMPLEMENTATION.md` for the scoped handoff.

### Included authorized follow-ups

- Cloud settings import is manual-only. Startup/timed import, its lease and fingerprint polling were removed. Manual cloud/local imports and same-browser Workshop state propagation remain available.
- Successful Workshop membership persistence queues a coalesced settings export. Status-only changes and authoritative imports do not trigger it. A dismissible in-page notice reports exporting, confirmed upload, newer changes excluded, missing setup/unlocked passphrase, or failure; failed local writes never queue an export. Live cloud writes have not been tested with account configuration.
- **Recently Followed · 24h** is a virtual Workshop category, not a saved group or the removed Online Following integration. It records successful observed follow requests from installation onward, per account and browser, orders by follow time, and includes offline/private entries subject to explicit filters. There is no historical backfill or cross-device history synchronization.
- Recent preview status/playback uses the existing room service. Unsaved recent entries do not enter the library or ordinary full refresh; when this category is active a full refresh includes its entries. Expiry or leaving the category releases unsaved preview services. Its More menu can explicitly save a room to Workshop.
- Newly entered normal rooms and Workshop previews start muted. Deliberate unmute remains available. Desktop Recu.me opens only after deliberate selection; remembered Share/Recu.me selection falls back to Bio on room entry.
- Actual Chrome/Tampermonkey checks passed for muted room entry with previously unmuted preferences, Bio fallback, deliberate Recu.me loading, Workshop startup and local-only temporary recent-history ordering/render/disposal. Test history was restored, not kept as real follows. Successful account Follow/Unfollow capture is fixture-verified, not live account-action verified.
- Historical recorder tests are retained in the Stage 3 report. They do not imply recording is still available; recovery data remains untouched after removal.
- The September 12 real OPPO/Quetta comparison passed the current candidate's normal-room native-control portrait enlargement, inward pinch, horizontal pan, OS-driven landscape/portrait rotation and three native-control exit/re-entry cycles against the same script-disabled room. Muted entry and Recu.me initially hidden also passed. Inline contain versus native crop remains a difference; physical sensor rotation, the separate Suite fullscreen action, Workshop fullscreen and recorder follow-ups remain incomplete. Phone use interrupted the pass after Workshop opened. Debugging was restored OFF and checked after restart; no publication or extension update occurred. The release verdict remains **NEEDS FURTHER WORK**.

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
- In the current candidate, deliberate selection loads the tab without repeated label writes; remembered Share/Recu.me selection instead falls back to Bio on room entry. After deliberate selection, attribute-only return can resume a cancelled load. Page hiding and navigation still cancel pending work and hover animations.
- On native mobile room pages, a direct **Recu.me** tab and the existing three-dot menu entry call the same renderer. A stable **Back to Room Menu** control returns to the original menu. Suite tab ownership is visual/panel-scoped; the native player/fullscreen path is not replaced.
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

Latest verification, September 12 after the 16.6.15 import/toast pass: flag visibly `Default` after restart, command-line file absent, ADB forward/reverse lists empty, no unsupported-feature warning. It began OFF and was enabled only for the phone pass. No orientation or unrelated phone setting was changed. Existing tabs and saved media/recovery data were preserved; no temporary test tab remains, and the temporary UI dump was removed. The Suite remains enabled at 16.6.15. Phone testing is finished and the user was told they may disconnect.

Final verified state after the real-phone passes on 2026-09-09:

- Quetta flag visibly reads `Default` after restart.
- `/data/local/tmp/chrome-command-line` is absent.
- ADB forward and reverse lists contain no test routes.
- Orientation settings were not changed during the earlier Recu.me passes. Stage 3 temporarily controlled OS rotation, then restored free rotation, `accelerometer_rotation=1` and `user_rotation=0`.
- Stage 3 phone cleanup verified OFF before telling the user to disconnect. No recording remained active; retained recording sources were preserved. A temporary flags tab remains open; no further phone access is required until a follow-up pass.
