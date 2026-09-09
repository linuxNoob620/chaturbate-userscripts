# Known Quirks

## Quetta command-line flag state is independent of the command-line file

Symptom: Quetta can display an unsupported-feature warning naming `CommandLineOnNonRooted` even when `/data/local/tmp/chrome-command-line` is absent.

Cause: The `Enable command line on non-rooted devices` flag is a persisted Quetta/Chromium preference. Removing `/data/local/tmp/chrome-command-line` does not reset that preference, and the visible browser state is not refreshed until Quetta restarts.

Reliable workaround: Set the flag to `Default`, remove the file, use Quetta's `Restart` button, remove ADB forwarding, and then visually confirm `Default` plus the absence of the warning. See `ENVIRONMENT.md` for the verified lifecycle.

Last verified: 2026-09-05 on the connected OPPO phone.

## Hidden native fullscreen controls require a reveal tap

Symptom: A tap aimed at the native fullscreen control can reveal the overlay without entering fullscreen.

Cause: Native Chaturbate handles hidden controls differently from visible controls. Successful script-disabled fullscreen was observed with debugging active; the earlier no-op did not prove a debug-mode limitation.

Reliable workaround: Reveal controls, measure their current position, then tap the visible control. Its position changes between inline, expanded, and browser-fullscreen states. Compare the resulting screen and player state, not only the API result.

Last observed: 2026-09-05 on Quetta 2.0.2 / Chromium 148.0.7778.217.

## Reparenting Workshop cards interrupts fullscreen

Moving the fullscreen card into a detached `DocumentFragment` during grid rendering exits fullscreen. Defer card-layout rendering while the grid contains the fullscreen element and apply the pending render on exit. Status updates need not be stopped. Observed on the real Quetta phone, 2026-09-05.

## Chaturbate replaces live page and video DOM

Symptom: Controls or handlers may disappear or attach to stale video elements after navigation, reload, or player transitions.

Cause: Chaturbate uses dynamic page/player lifecycle behavior.

Reliable workaround: Treat navigation, DOM replacement, and video replacement as explicit regression dimensions for relevant changes. Do not assume a handler attached once remains attached.

Last verified: Existing Suite behavior and regression tooling as of 16.6.7; re-verify for changed paths.

## Recu.me rejects background userscript requests

Symptom: A direct `GM_xmlhttpRequest` for a Recu.me performer page returns HTTP 403 even though the same performer URL loads normally as a top-level browser page.

Cause: Recu.me's Cloudflare handling distinguishes the background userscript request from a normal browser navigation. Chaturbate separately blocks a direct Recu.me iframe through its enforced `frame-src` Content Security Policy.

Reliable workaround: Attempt the direct lazy request first. On HTTP 403, open the performer URL in an inactive Tampermonkey helper tab carrying a random one-use bridge token. The Recu.me-matched portion of the same script extracts only allowlisted performer fields and recording URLs, writes the sanitized payload through script storage, and closes. Revalidate the payload on the Chaturbate side and clear the transient bridge key. Do not weaken Chaturbate's CSP.

Last verified: 2026-09-08 in the persistent Chrome-for-Testing profile with Tampermonkey and Suite 16.6.11.

## Room-status responses renew live-stream tokens

Chaturbate can return the same HLS origin and path with a changed `token` query parameter on successive status probes. Comparing the entire URL caused a healthy Workshop stream to be reattached during refresh. For a healthy loaded video, compare URLs with only `token` removed; preserve all other URL differences and the existing explicit-refresh/error recovery paths. Confirmed through live debugger inspection and video-element retention checks on 2026-09-09.
