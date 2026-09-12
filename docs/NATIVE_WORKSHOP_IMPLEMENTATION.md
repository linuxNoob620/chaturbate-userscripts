# Native-style Workshop and recording removal

Status: published as **16.6.14** after explicit user authorization. The functionally identical pre-release candidate is installed in the existing Chrome and Quetta Tampermonkey entries. The complete historical fullscreen release gate is not passed; publication does not certify it.

## Source and rollback

- Source: `Chaturbate MultiCam Pro + Cam ARNA.user.js`, release 16.6.14, 18,725 lines.
- Release SHA-256: `77b27b808856a1367de0283ae4510361121671b50c0e8558a7aa308001fc40ea`.
- Live-tested pre-release SHA-256: `5d2f423d16f1097db0519c5a4cff5d7f30443cc0acff8cc470456fe47de50df9`. The release changes only its four version labels from 16.6.13 to 16.6.14, not runtime behavior.
- Exact pre-change backup: `C:\Users\Ziggy\AppData\Local\ZiggySuiteBackups\remove-recording-20260912\Chaturbate MultiCam Pro + Cam ARNA.user.js`.
- Existing Stage 2/3 working changes were preserved and included in this userscript release. Extension builds/dependencies were not updated. CI now runs the userscript-only build and regression command rather than implicitly building extensions.

## Implemented scope

1. Removed Suite recording, Recorder Hub/Center, capture/conversion workers, related controls/shortcuts and the userscript's Mediabunny resource. No saved media or recovery sources were deleted. Recu.me/external archive browsing, screenshots, playback previews and PiP remain.
2. Workshop adopts the actual desktop site header and native-style listing presentation: category pills, cards, Groups drawer, refresh progress above the grid and one organized menu. Mobile Grid is two columns. Existing data, groups, filters, density, Grid/Phone modes, split view and explicit room links remain.
3. Added explicit GitHub import/export and cloud configuration entries to the shared Workshop menu. Automatic import stays removed. Automatic export remains queued only after successful membership persistence, with truthful nonblocking feedback.
4. Mobile Rooms and Recu.me are directly accessible native-style tabs. Native Private/Tokens entries remain. Both use existing panel implementations rather than separate mobile action logic.
5. Corrected live-discovered integration collisions: Recu.me's semantic header inherited fixed site-header positioning; the native carousel host left an extra pseudo-element underline; Private composer content leaked into the Suite-owned Rooms slot. Corrections are scoped to those owned panels/states.

## Focused verification

| Surface | Evidence |
| --- | --- |
| Source/build | JavaScript syntax and userscript metadata build passed; no extension build run. |
| Regression fixtures | Suite, Workshop refresh, Recu.me, GitHub sync, Stage 3 follow-ups passed. Stage 2 UI: 20 checks; persistence: 37; legacy: 53. |
| Chrome installation | Existing entry saved, reloaded and read back exactly equal to the source after line-ending normalization. |
| Chrome Workshop | Native header adoption, category/menu/drawer access, outside dismissal, refresh progress, room links, and preview fullscreen entry/Escape exercised. Inspected card roots stayed intact during refresh; one private stream reconnected, so no blanket all-media-retention claim. |
| Chrome normal room | Muted entry, Recu.me initially hidden, and retained non-recording Rooms actions checked. |
| Actual OPPO/Quetta Workshop | Two columns, no horizontal page overflow, visible refresh outcome, shared GitHub menu entries, Groups outside-tap dismissal. Preview double-tap kept URL/tab count and Android Back returned to Workshop. |
| Actual OPPO/Quetta room | Muted/Bio entry, direct Rooms/Recu.me taps, native Private/Tokens preservation, composer scoping, one selected underline, Recu.me heading below video, and Bio return checked. |
| Settings/cloud | Source/fixture verification only for export success/failure/coalescing and manual-only import. No live cloud writes or destructive account actions. |

Testing was dependency-based: after a reproduced UI failure, rerun the affected interaction and nearby paths; do not repeat the full unrelated historical matrix. Screenshots were inspected inline, not saved as new local image files.

## Limits and safety

- This is native-style UI, not a claim of pixel-identical homepage behavior or fabricated native metadata.
- The prior normal-room/fullscreen exhaustive acceptance gaps and Workshop native fullscreen-control exit limitation remain. Android Back success does not resolve that limitation. No separate fullscreen redesign was performed here.
- Cloud multi-device conflict handling, incremental chat work and other historical deferred findings remain deferred.
- CommandLineOnNonRooted was reset to Default/OFF and verified after every separated phone pass. Final restart showed Default with no unsupported flag warning; the command-line file and ADB forwarding were removed. No unrelated phone settings changed.
- Temporary desktop room tabs were closed; existing browser tabs/settings and all user media/recovery data were preserved. Phone testing is complete; the phone can be disconnected.
