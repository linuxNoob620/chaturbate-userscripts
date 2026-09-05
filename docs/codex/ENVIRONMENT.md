# Environment

Only verified, reusable setup details belong here.

## Mobile

- Device: real connected OPPO CPH2791 Android phone.
- Browser: Quetta Browser (`net.quetta.browser`).
- Target: actual Chaturbate mobile site with the actual Tampermonkey userscript.
- PC access: Android Debug Bridge from `C:\Users\Ziggy\AppData\Local\Android\Sdk\platform-tools\adb.exe`.
- Quetta's active Android activity may be reported as `org.chromium.chrome.browser.ChromeTabbedActivity`; inspect the live package/activity rather than hard-coding a launcher activity assumption.
- Native-baseline tests require the userscript to be disabled in Tampermonkey. Userscript tests require it to be enabled.

Do not persist account cookies, login data, tokens, current tabs, current battery state, or other transient/private session data.

## CommandLineOnNonRooted

Normal/resting state: **OFF**.

Required lifecycle for every distinct phone test:

1. Check the effective state.
2. Turn it ON immediately before the pass, if needed.
3. Verify phone inspection/control works.
4. Perform the test.
5. Turn it OFF immediately after the pass.
6. Verify the effective state is OFF.

Verified procedure on OPPO CPH2791 with Quetta 2.0.2 / Chromium 148.0.7778.217:

1. Open `quetta://flags/#enable-command-line-on-non-rooted-devices`.
2. Search for `rooted` and visually confirm the `Enable command line on non-rooted devices` value.
3. To enable a pass, set it to `Enabled`, write `/data/local/tmp/chrome-command-line`, and use Quetta's `Restart` button.
4. Forward the DevTools socket only for the active pass:

   ```powershell
   & $adb forward tcp:9332 localabstract:chrome_devtools_remote
   ```

5. Verify the endpoint identifies Quetta (`net.quetta.browser`) before testing.
6. To end the pass, set the flag to `Default`, remove `/data/local/tmp/chrome-command-line`, use Quetta's `Restart` button, remove the ADB forward, and restore any orientation settings changed for testing.
7. Final OFF verification requires all of the following:
   - the flag visibly reads `Default` after restart;
   - `adb shell ls /data/local/tmp/chrome-command-line` reports no such file;
   - `adb forward --list` contains no pass-specific forward;
   - Quetta no longer shows the command-line warning.

The tested command-line contents for local inspection were:

```text
_ --remote-debugging-port=9222 --remote-allow-origins=*
```

Do not leave this file or the flag enabled outside a bounded phone pass.

## Desktop

- Browser: persistent Chrome-for-Testing profile at `C:\Users\Ziggy\AppData\Local\ZiggyChromePuppeteer\User Data`.
- Remote-debugging port used by the established profile: `9223` when the profile is launched for automated inspection.
- Runtime under test: Tampermonkey with `Chaturbate MultiCam Pro + Cam ARNA.user.js` installed.
- Target: actual Chaturbate site.
- Reuse this profile; do not clear or recreate it.
- Keep the active test tab foregrounded and use the minimum number of tabs needed.
- If Tampermonkey is unavailable and cannot be configured safely, report the exact manual action required. Do not silently substitute a different injection mechanism as final Tampermonkey evidence.
