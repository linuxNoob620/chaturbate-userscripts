# Current Project State

## Deployment

- Primary runtime: Tampermonkey userscript `Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Current published userscript version: 16.6.8 (`main`, tag `v16.6.8`).
- Extension builds remain at 16.6.7. They were not modified, rebuilt, packaged, or published for this userscript-only change.
- Local rollback point: Git tag `backup/pre-16.6.8-workshop-doubletap-20260905` at the 16.6.7 baseline.

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
