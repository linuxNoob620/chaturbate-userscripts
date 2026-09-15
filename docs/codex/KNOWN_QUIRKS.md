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

## Native Share tab retains child ownership and shares selection styling with hover

Chaturbate's native Share controller retains `shareRows` references and calls `removeChild` on later selection. Replacing all `#shareTab` children breaks that cleanup before the native active-tab state updates. The visible panel can then disagree with the selected tab; `tabOpen` also appears on mouse hover and is not by itself a selection signal.

Keep original native children attached and render into a separate Suite-owned child, hiding native siblings only within that host. Use the native host display for selection. Record deliberate Suite selection during click capture: a native display mutation can deliver an observer callback before a later bubbling listener, otherwise the entry-time Bio fallback can undo the user's click. Confirmed against disabled/enabled actual Chrome/Tampermonkey behavior on 2026-09-15; extracted-source regressions preserve both node ownership and callback ordering.

## Room-status responses renew live-stream tokens

Chaturbate can return the same HLS origin and path with a changed `token` query parameter on successive status probes. Comparing the entire URL caused a healthy Workshop stream to be reattached during refresh. For a healthy loaded video, compare URLs with only `token` removed; preserve all other URL differences and the existing explicit-refresh/error recovery paths. Confirmed through live debugger inspection and video-element retention checks on 2026-09-09.

## Room-status persistence is not a settings edit

The Workshop Store's debounced writer handles both configuration edits and runtime status/last-seen updates. Counting every write or treating every pending writer as an edit can falsely reject a manual import and suppress its completion reload. The 16.6.15 guard compares saved/pending semantic settings instead, including custom card sizes but excluding status fields. Confirmed by extracted-source pending/saved-status reproductions; real settings changes must still block stale replacement.

## Historical recorder quirk: valid MP4 conversion can discard an unsupported video track

The current userscript no longer records or converts media. Retain this observation for interpreting older recordings/recovery data and frozen extension builds, not as a current userscript execution path.

On the OPPO/Quetta recorder pass of 2026-09-09, AVC constant-bitrate encoding was unsupported for the tested dimensions while variable bitrate was supported. Pinned Mediabunny 1.55.5 could return `isValid: true` with audio usable and video in `discardedTracks` (`no_encodable_target_codec`). The resulting MP4 was audio-only despite a good VP9/Opus WebM source.

Check codec capability using the source dimensions and intended quality; preserve supported constant bitrate, otherwise try variable bitrate. Also reject discarded expected audio/video tracks independently of container validity. A subsequent real-device H.264/AAC file played and decoded. Keep recoverable source data; this does not prove every device/codec combination.

## Quetta fullscreen viewport grows after the initial event

Quetta can retract its browser chrome after `fullscreenchange`, increasing the portrait viewport from roughly 804 to 931 CSS pixels. Freezing preview geometry at the first event leaves an incorrectly short image. Fill subsequent viewport growth until the user actually changes zoom; afterward preserve user zoom across the tested rotation sequence. Confirmed on the actual phone, 2026-09-09.

## Native browser video fullscreen is not an ancestor-fullscreen exit button

In Workshop, the existing `nofullscreen` controls policy disabled the browser fullscreen control. Temporarily removing it allowed the native video control to replace `.cam-media` fullscreen with video-only fullscreen and force a landscape presentation; it did not exit the ancestor. Reverted after the actual Quetta experiment on 2026-09-09. Do not describe token removal alone as a native-exit fix.

## Native mobile header CSS can affect Suite semantic headers

Chaturbate's mobile `header` selectors apply fixed positioning/dimensions to unrelated Suite headings. This affected the former Recorder Hub on 2026-09-09 and the Recu.me panel on the actual OPPO/Quetta pass on 2026-09-12. Recu.me now uses `div.ziggy-recu-head`; its heading stays in the panel below the video. Avoid adding semantic `header` elements to native mobile room panels without checking the site's competing selectors. The Recorder Hub has since been removed.

## Mobile carousel active underline belongs to a pseudo-element

On the tested native mobile room strip, the active underline is rendered with `::after`, not only `border-bottom`. Suite tabs can temporarily use a native carousel slot while showing their own label; changing the host's border alone leaves a second active underline. Scope pseudo-element suppression to the owned host marker and remove that marker when returning to native content. Confirmed through actual OPPO/Quetta Rooms/Recu.me/Bio interactions, 2026-09-12.
