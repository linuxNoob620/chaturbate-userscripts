# Current Project State

## Deployment

- Primary runtime: Tampermonkey userscript `Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Current userscript release: 16.6.9 (`main`, tag `v16.6.9`), published at the user's explicit request despite the remaining acceptance failure below.
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

- Grid and Phone viewing modes are implemented; Focus mode has been removed.
- Online Following has independent pagination and mobile card-count behavior.
- A playing Workshop preview no longer opens a room from a single tap.
- Double-tapping the playing preview uses the shared Workshop native-fullscreen path.
- Explicit model-name links remain the navigation action; preview taps themselves do not navigate or create tabs.

## Normal rooms

- Normal-room behavior remains on Chaturbate's native player/fullscreen path.
- The 16.6.8 Workshop fix did not change normal-room handlers.
- The verified userscript-disabled phone baseline is recorded in `BEHAVIOR_BASELINES.md`.

## Verification — 2026-09-05

- Real OPPO CPH2791 / Quetta / Tampermonkey pass: single-tapping a live Workshop preview kept the Workshop URL foregrounded and kept the page count at three.
- Real OPPO CPH2791 / Quetta / Tampermonkey pass: rapid double-tap entered native fullscreen, kept the Workshop URL, and kept the page count at three.
- Android Back exited fullscreen.
- Focused userscript build, syntax, and source-regression checks pass for 16.6.8.
- Desktop Tampermonkey runtime verification is currently unavailable in the saved test profile: Chrome 152 can open the profile, but the Tampermonkey extension directory is absent and the userscript is therefore not injected. Do not treat a manually injected script as equivalent desktop evidence.

## CommandLineOnNonRooted

Expected idle state: **OFF**.

Final verified state after the real-phone pass on 2026-09-05:

- Quetta flag visibly reads `Default` after restart.
- `/data/local/tmp/chrome-command-line` is absent.
- ADB forward and reverse lists contain no test routes.
- Auto-rotation is restored (`accelerometer_rotation=1`, `user_rotation=0`).
