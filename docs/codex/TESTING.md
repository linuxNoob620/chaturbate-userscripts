# Testing Playbook

## Real-phone Quetta pass

Before every distinct pass:

1. Open `quetta://flags/#enable-command-line-on-non-rooted-devices` and visually check the value.
2. Set it to `Enabled`.
3. Write the tested command line from `ENVIRONMENT.md` to `/data/local/tmp/chrome-command-line`.
4. Use Quetta's `Restart` button.
5. Forward `tcp:9332` to `localabstract:chrome_devtools_remote` and verify `/json/version` identifies `net.quetta.browser`.
6. Perform only the required mobile tests.

Immediately afterward:

1. Set `CommandLineOnNonRooted` to `Default`.
2. Remove `/data/local/tmp/chrome-command-line`.
3. Use Quetta's `Restart` button.
4. Remove the ADB forward and restore any changed orientation settings.
5. Search for `rooted` and visually confirm the flag reads `Default`.
6. Verify the file is absent, the forwarding list is clean, and the unsupported-feature warning is absent.

Never merge multiple separated test periods into one indefinitely enabled session.

## Native mobile baseline

1. Start a real-phone pass using the lifecycle above.
2. Disable the userscript in Tampermonkey.
3. Test the live Chaturbate behavior through real interactions.
4. Record reusable verified native behavior in `BEHAVIOR_BASELINES.md` with date, device/browser, and userscript-disabled state.
5. End the phone pass and verify the flag is OFF.

Do not update a native baseline from userscript behavior or source-code inference.

Reveal the native control overlay before tapping fullscreen and remeasure the control after each state change. Test the native exit control separately from Android Back. A successful native baseline must have the Suite runtime absent after reload, not merely a recently clicked disable toggle.

## Updating the actual phone userscript

Edit the existing Suite entry in Tampermonkey. Target the visible CodeMirror editor and that entry's specific Save button; hidden new-script editors can coexist in the page. Do not use a generic first editor or generic save command. Confirm one Suite entry, its version, enabled state, and runtime after reload. Preserve the original entry and its settings.

After restarting Quetta, a sleeping target may time out on its first DevTools initialization. Activate it and perform a read-only warm-up before sending changes; do not blindly retry a mutating operation whose execution is uncertain.

## Userscript mobile test

1. Start a fresh real-phone pass.
2. Enable the actual userscript in Tampermonkey.
3. Reproduce the requested behavior through real interactions.
4. Perform adaptive nearby regression tests for touch, navigation, SPA/DOM replacement, video lifecycle, fullscreen, orientation, native controls, and async behavior as relevant.
5. End the pass and verify the flag is OFF.

## Desktop Tampermonkey test

- Use the established Chrome testing profile, live Chaturbate, Tampermonkey, and the actual installed userscript.
- Keep the current test tab visible; use extra tabs only when the behavior requires them.
- Do not call an extension or manually injected build equivalent to a final Tampermonkey test.

## Repository checks

After userscript source edits, run the focused regression check first, then the required project gates appropriate to the userscript-only scope. `npm run build:userscript` validates and regenerates userscript metadata without rebuilding extension outputs. Run `npm test` only with awareness that its current parity checks may require existing extension artifacts to match the userscript; do not silently rebuild extensions when extension work was not authorized.

## Verification standard

Real observed browser/device interaction is the standard for UI behavior when reasonably possible. Report separately what was directly observed, what was verified by automation, and what remains inferred or unverified.
