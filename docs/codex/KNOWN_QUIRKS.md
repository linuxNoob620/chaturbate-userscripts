# Known Quirks

## Quetta command-line flag state is independent of the command-line file

Symptom: Quetta can display an unsupported-feature warning naming `CommandLineOnNonRooted` even when `/data/local/tmp/chrome-command-line` is absent.

Cause: The `Enable command line on non-rooted devices` flag is a persisted Quetta/Chromium preference. Removing `/data/local/tmp/chrome-command-line` does not reset that preference, and the visible browser state is not refreshed until Quetta restarts.

Reliable workaround: Set the flag to `Default`, remove the file, use Quetta's `Restart` button, remove ADB forwarding, and then visually confirm `Default` plus the absence of the warning. See `ENVIRONMENT.md` for the verified lifecycle.

Last verified: 2026-09-05 on the connected OPPO phone.

## Quetta native fullscreen is not a reliable debugging-pass oracle

Symptom: Chaturbate's native fullscreen control can remain a no-op while Quetta is running with the temporary non-root command-line/debugging setup, even though the same live player exposes its normal resize and fullscreen overlay.

Cause: Not proven. Treat this as a harness/browser-state limitation, not as evidence that Chaturbate's production fullscreen behavior changed.

Reliable workaround: Use the pass to compare entry, inline controls, orientation, navigation, and Suite event routing. Do not claim successful native fullscreen or zoom/pan parity unless it is directly observed in a clean, non-debug phone state.

Last observed: 2026-09-05 on Quetta 2.0.2 / Chromium 148.0.7778.217.

## Chaturbate replaces live page and video DOM

Symptom: Controls or handlers may disappear or attach to stale video elements after navigation, reload, or player transitions.

Cause: Chaturbate uses dynamic page/player lifecycle behavior.

Reliable workaround: Treat navigation, DOM replacement, and video replacement as explicit regression dimensions for relevant changes. Do not assume a handler attached once remains attached.

Last verified: Existing Suite behavior and regression tooling as of 16.6.7; re-verify for changed paths.
