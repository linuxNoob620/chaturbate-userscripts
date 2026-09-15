# Recu.me Accurate Timeline Previews — 1.0.0

Standalone Tampermonkey script; not part of Ziggy Chaturbate Suite. No Suite source, extension build, recording feature, phone setting, saved library, or account action is changed.

## Accuracy contract

- Retain the native Plyr hover bubble and time label.
- Show only a decoded frame whose presented `mediaTime` differs from the displayed whole second by less than one second.
- Anchor the decoder at the stream beginning before the first target seek. HLS timestamp normalization based on an arbitrary initial fragment can otherwise report a plausible time for the wrong content.
- Select the main video's rendition and invalidate the cache/decoder when the source, player, or resolution changes.
- Do not present a coarse native sprite or stale frame as accurate. Display loading/unavailable instead.
- Do not seek, play, pause, or change the audio of the main video. Native timeline clicking/scrubbing remains the site's responsibility.

## Resource limits and permissions

The script uses the site's existing `Hls` implementation; no remote library dependency or GM privilege is added. It matches only HTTPS `recu.me` and does not run in frames. Only already-authorized HLS sources are used; no account/access-control handling is recreated.

One paused, muted shadow-DOM decoder serves one active player. Hover has a 220 ms debounce. Requests use abort/generation ownership, per-decode 10-second timeouts, small forward buffers, no deliberate retries, and exact event/frame-callback cleanup. Initial anchoring and target seeking are separate bounded decoding steps. Pointer exit stops media loading; 12 seconds idle releases the decoder. Up to 32 frames, each fitting within 320×180, remain in a per-player memory cache (about 7 MiB maximum raw pixel data). No persistent cache, downloaded recording, whole-video prefetch, or signed-URL logging is used.

## Verified desktop evidence — September 15, 2026

Environment: existing persistent Chrome-for-Testing profile, actual Tampermonkey installation. Saved script readback matched the file. Site player used HLS.js 1.5.8. The Suite stayed at 16.6.16 unchanged.

Native baseline: the example 9,717.568-second recording exposes 128 sprite cues, each spanning 75–76 seconds. Real mouse hovers at 45:53 and 46:29 reused the same native image.

Final installed candidate, actual mouse hovers:

| Displayed time | Presented frame time (seconds) | Absolute error | Loading |
|---|---:|---:|---:|
| 07:57 | 476.985 | 0.015 s | 2.867 s |
| 45:53 | 2752.985 | 0.015 s | 2.397 s |
| 1:37:02 | 5821.985 | 0.015 s | 2.392 s |
| 2:25:38 | 8737.985 | 0.015 s | 2.639 s |

The paused main video remained at 2205.703396 seconds across these hovers, with its audio state unchanged. Independent comparisons sought the main player to 45:53 and 2:25:38: both had identical presented timestamps and zero mean pixel difference after equal 64×36 downsampling. The original playback position was restored after each comparison. The native bubble's rendered image/time was visually inspected.

Twelve rapid pointer changes produced the latest target, not stale results. Four segment requests occurred during that sweep; zero new segment requests appeared in the measured 3.5-second window after leaving the bar. The overlay was removed and the decoder host was absent after its idle period. Inline preview loading and fullscreen preview loading were exercised. Normal playback state was restored after the native layout transitions; this is not a claim of an exhaustive site fullscreen/control regression pass.

The native reload/start button can resume playback asynchronously; the test paused the fully initialized player before taking isolation measurements. A real decoded frame may arrive before Chrome's `seeked` event. Waiting for that event in addition to the frame caused a reproduced timeout; the shipped gate uses the presented timestamp instead.

## Automated regression checks

`npm run test:recu-previews` extracts the shipped implementation into controlled media/HLS fixtures. It covers timestamp tolerance, geometry clamps, rendition selection, safe source schemes, stale-frame rejection, bounded capture size, abort before/after preparation, timeout/fatal cleanup, origin anchoring, the presented-before-seeked ordering, cancellation between initialization and target seek, source/generation invalidation, cache hits, disposal, and no main-media writes or autoplay.

## Limitations

- Accuracy is confirmed for the tested recording/desktop player, not every recording on the service. Broken timestamps, unavailable segments, unsupported sources and expired access can make accurate previews unavailable.
- Same-rendition decoding uses more bandwidth than a small sprite or a low-resolution alternative. No universal latency claim is made.
- A long timeline can represent multiple seconds per mouse pixel. The frame matches the displayed second; the script does not introduce a separate fine-scrubbing UI.
- Mobile touch, other domains, DRM, non-HLS players, quality changes and playlist transitions have not received a complete live acceptance matrix. Source/player/resolution invalidation is implemented; generation/source and cleanup paths have local regression coverage.
- Disable/remove this separate Tampermonkey entry and reload to restore the original native thumbnails. No migration or settings reset is needed.
