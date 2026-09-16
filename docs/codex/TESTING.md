# Testing Playbook

## Real-phone Quetta pass

Before every distinct pass:

1. Enter `chrome://flags` in Quetta's address bar (Quetta displays its own scheme), search `rooted`, and visually check the value. On the tested build, typing `quetta://flags` directly can become a web search.
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

Quetta's HTTP `/json` list can expose numeric tab IDs that are not interchangeable with browser-level CDP target IDs. Enumerate `Target.getTargets` on the browser WebSocket and use its actual target ID for `Target.attachToTarget` with flattened sessions. Do not infer a connection failure by attaching a numeric HTTP tab ID as a CDP target. Earlier builds needed the HTTP `/json/activate/<tab-id>` route to foreground a page when `Page.bringToFront` stalled; use the ID belonging to that interface. Bound read-only warm-ups and re-enumerate after restart.

Re-enumerate targets after session restoration settles; IDs/URLs observed immediately after restart can change. If initialization is waiting for debugger attachment, `Runtime.runIfWaitingForDebugger` releases it before the read-only warm-up. Native `chrome-native://newtab/` surfaces have no normal page runtime: navigate their address bar rather than waiting indefinitely for `Runtime.evaluate` or `Page.navigate`.

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

For visibility/network-lifecycle tests, verify that the active tab reports `document.hidden === false` and the inactive tab reports `true` before interpreting request counts. The installed Playwright CDP client enables focus emulation by default, which kept inactive pages visible during the September 16 pass. Disconnect that transport and use unmodified raw CDP, or a supported `noDefaults: true` connection, then recheck the actual visibility states. A false visible state is a test artifact, not proof that the userscript ignored a hidden event. Do not replace the native visibility property and call the result live acceptance.

Workshop dropdown checks: closed idle, category changes, visible-only media, close/cancel and stale-response cleanup, native-room media isolation, full-Workshop link, 16:9/name geometry, and scoped scrollbar styling. Full Workshop additionally needs genuine background/return, interrupted refresh, offscreen scroll, cold autoplay versus explicit Pause, and separate nearby fullscreen regression. `tools/test-workshop-dropdown.mjs` and `tools/test-workshop-visibility.mjs` cover deterministic ownership/race/layout mechanisms; actual site interaction and request observation remain separate evidence.

For the editable dropdown, additionally verify page scrolling past its anchor retains the same frame, an unfinished input survives background/return, Groups and card menus receive actual pointer input, and close waits for persistence rather than destroying an unsaved Store. Test group create/rename/remove with an empty disposable group only; confirm the original group list and room memberships/notes afterward. GitHub operation waiting and export-notice relay can be tested with controlled promises/messages without live cloud writes. Check actual parent and child document visibility; iframe layout is not phone acceptance. Frame-scoped fullscreen entry/exit is separate from normal-room playback.

## Repository checks

After userscript source edits, run the focused regression check first, then the required project gates appropriate to the userscript-only scope. `npm run build:userscript` validates and regenerates userscript metadata without rebuilding extension outputs. Run `npm test` only with awareness that its current parity checks may require existing extension artifacts to match the userscript; do not silently rebuild extensions when extension work was not authorized.

For Recu.me changes run `npm run test:recu`, then actual desktop and phone interactions. Verify idle/selected loading, helper closure, native tab/menu switching, cancelled-load re-entry, cache/reload, refresh retention, pagination deduplication, lazy/error images and hover exit. Wait for the new document after reload before asserting state; checking the old document immediately after `Page.reload` can falsely pass a wait condition.

## Verification standard

### Local engineering regression fixtures

The Stage 2 tests extract implementation sections from the current userscript; they are not separate production implementations. Run from `outputs`:

```powershell
node tools/test-stage2-persistence.mjs
node tools/test-stage2-legacy.mjs
node tools/test-stage2-ui.mjs
node tools/test-stage3-followups.mjs
```

These use mocks/fault injection for storage, requests, timers and media. The UI suite deliberately preserves one passing reproduction of still-unoptimized pan writes; do not count it as a performance improvement. Suite source regression checks now reject the removed recording engine/UI/resource and protect the retained native-style navigation paths.

`test-stage2-recorder.mjs`, `test-stage2-recorder-center.mjs` and the mixed recording `test-stage3-acceptance.mjs` are retained locally as historical fixtures for the pre-removal candidate, not current distributed validation gates. Do not resurrect recording code merely to satisfy them. Existing user recordings/recovery data must not be deleted during ordinary tests or settings import.

For a userscript-only release, run `npm run build:userscript` and `npm run test:userscript`. CI uses that scope plus the existing adapter unit tests; it does not automatically build or package extensions. A version-only release change can reuse the preceding live behavioral evidence after verifying the source differs only in its version labels.

### Focused redesign acceptance

Use a small dependency-based test set rather than restarting the entire historical acceptance matrix after each cosmetic correction. For Workshop presentation, check the real hydrated desktop header, category/drawer/menu access, unchanged card identity during refresh, visible progress, and mobile two-column/no-page-overflow layout. Verify explicit GitHub actions without executing account writes unless separately safe/authorized.

For mobile tabs, test actual taps through Rooms, Recu.me and Bio: native Private/Tokens remain available; the selected Suite tab has one underline; private composer content is hidden only while Rooms owns its panel; Recu.me headings remain below the player; entry stays muted and Recu.me is not selected by default. Check the three-dot menu/Back fallback as a related path.

Preview layout changes require separate nearby Workshop fullscreen entry/exit and normal-room regressions. Limited double-tap/Android Back checks do not close the documented native-control/gesture parity gaps. Repeat a failed path and its affected neighbors after correction, not unrelated note/sync/media tests whose implementation did not change.

`node tools/test-stage2-browser.mjs` requires the already-running established Chrome CDP endpoint on port 9223. It creates and foregrounds one isolated `about:blank` fixture, checks actual DOM/CSS behavior, closes only that fixture, and reactivates the previously enumerated browser page. It does not install/update the userscript, make account requests, or modify phone settings. Confirm the endpoint/profile before running it. These fixtures do not replace actual Tampermonkey/site acceptance.

Run the existing Suite, Workshop refresh, Recu.me and GitHub-sync checks as well. `node tools/validate-userscripts.mjs` without `--write-meta` is a read-only validation gate suitable for a no-build/no-deployment stage.

Real observed browser/device interaction is the standard for UI behavior when reasonably possible. Report separately what was directly observed, what was verified by automation, and what remains inferred or unverified.
