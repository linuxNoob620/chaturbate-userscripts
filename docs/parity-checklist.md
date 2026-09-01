# Tampermonkey / Chrome / Firefox-Zen parity checklist

Use the same account, target page, viewport and stored settings for each comparison. Never run the userscript and extension together:

1. Tampermonkey pass: enable the userscript and disable the extension.
2. Extension pass: disable the userscript and enable only the extension being tested.
3. Reload the target page after every implementation switch.

Record **Pass**, **Fail** or **Blocked**, plus a screenshot/console/network note for each observable item.

## Installation and startup

- [ ] Version/name shown as 16.5.33 / Ziggy Chaturbate Suite
- [ ] Executes at document end on `chaturbate.com` and subdomains
- [ ] Executes in frames exactly where the userscript does
- [ ] Does not inject twice
- [ ] Loads the pinned HLS 1.6.16 dependency before Suite startup
- [ ] No startup exceptions or CSP violations
- [ ] Existing default values and first-run behavior match

## Site shell and navigation

- [ ] Native WORKSHOP navigation placement, wording, selected state, font, spacing and hover behavior
- [ ] Native Suite/skull menu placement, opening, closing, scrolling and hover persistence
- [ ] Menu sections, rows, switches, buttons, status text and version are identical
- [ ] Desktop room page defaults to theater mode under the same conditions
- [ ] Workshop tab title remains `Ziggy Room Suite`; room tab naming matches
- [ ] Main page room-card additions and ban action match
- [ ] Banning updates the same ignored-room data and triggers only the existing configured backup behavior
- [ ] Navigation, refresh, history changes and Chaturbate dynamic page updates remount exactly once

## Rooms dock/menu

- [ ] Rooms button appears only in the same desktop/mobile page locations
- [ ] Extension native menu is exactly `Ziggy Chaturbate Suite` → `Rooms` / `Open Workshop` on Chaturbate only
- [ ] Context detection priority is card → direct model link → current room URL → no model
- [ ] Card/link context overrides the surrounding room; reserved routes are never treated as models
- [ ] Context data expires after eight seconds and is cleared after action, navigation and tab close
- [ ] Context Rooms opens the existing dock on main, room, Workshop and Recorder pages without duplicating Suite UI logic
- [ ] No-model context opens general Rooms mode with Workshop, Recorder Hub and saved-list access only
- [ ] Normal and theater layouts preserve the same placement and size
- [ ] Menu follows/anchors to the page and stays open while hovered
- [ ] Auto-collapse delay and interaction match
- [ ] Current model detection and text match
- [ ] Open Workshop, Recu.me profile, add room, favorite, recording, screenshot, PiP, mute and send-tip actions match where present
- [ ] Removed/redundant actions remain absent
- [ ] Active recording changes the same controls to pause/stop after refresh or page reopen
- [ ] Model-name links open background tabs without stealing focus

## Workshop shell and groups

- [ ] Header, toolbar, sidebar, cards, fonts, colors, borders, sizes and responsive layout match pixel-for-pixel
- [ ] Group drawer opens/closes and scrolls independently from the document
- [ ] Last-used startup group persists and displays identically
- [ ] Default, Favorites, Online now, All saved and custom groups contain the same rooms/counts
- [ ] Online Following is isolated from saved/custom groups and never silently saves rooms
- [ ] Online Following initial alphabetical order matches; newly online rooms append without reshuffling visible cards
- [ ] Online Following pagination shows nine cards per desktop page, four cards in a mobile 2x2 page, and stable card positions
- [ ] Centered numbered pagination, ellipses, counts and page boundaries match
- [ ] Online Following previews use the same lazy 480p behavior
- [ ] Online Following cache, refresh cadence, request staggering and retry behavior match
- [ ] Online Favorites and saved-room monitoring match
- [ ] Add room, add favorite, delete room, group membership and custom-group operations persist identically
- [ ] Search, visible-count selection, layout selection and refresh-all match
- [ ] Grid, Phone, Focus and Split View behavior match
- [ ] Double-clicking a Workshop card enters fullscreen once and remains fullscreen
- [ ] Online Following rooms can enter Split View without being added to saved/custom groups
- [ ] Card overflow menu flips above/below to remain visible and scrollable
- [ ] Desktop and mobile card overflow contain the same intended reduced action set
- [ ] Favorite star, quick copy-link, Recu.me and More buttons match every applicable card state
- [ ] Model name opens the room in a background tab
- [ ] Right-click offers the same copy room link and Recu.me actions
- [ ] Unfollow removes the model from the actual Chaturbate account without confirmation and updates Online Following
- [ ] Offline/private/hidden/error/loading/retry card states match
- [ ] Pausing, resuming, refreshing and muting cards match
- [ ] Room video quality, source selection and HLS recovery match
- [ ] Snapshot, recording and copy-username actions match
- [ ] Settings/More drawers, scrolling and document scroll lock match

## Recording service and Recorder Hub

- [ ] One recording command path is shared by Rooms and Workshop
- [ ] Recorder owner election/heartbeat persists while another Chaturbate page remains open
- [ ] Recorder Hub shows all active sessions after refresh/reopen
- [ ] Start, pause, resume and stop commands update every UI surface consistently
- [ ] Public stream records source video and audio with the same quality-selection limits
- [ ] Private, secret, group and password modes pause rather than record
- [ ] Return to stable public video/audio resumes into the same logical output
- [ ] Brief connection failure reconnects without premature finalization
- [ ] Offline monitoring stops after the same ten-minute threshold
- [ ] Stop changes the Hub entry to stopped/finalizing with matching progress
- [ ] Automatic final save filename, model/date/time and WebM format match
- [ ] Closing Workshop does not stop recording while another Chaturbate page remains open
- [ ] Stop-all and per-session controls match
- [ ] OPFS/temporary-part cleanup and stale-session recovery match

## Cam ARNA and external room tools

- [ ] Cam ARNA opens from the same native Suite surface
- [ ] Search targets, model-name handling, result ordering and statuses match
- [ ] Archive/profile checks return the same found/not-found result for identical targets
- [ ] CamSoda, Stripchat, Streamate, BongaCams, CAM4 and MyFreeCams checks match
- [ ] Playlist copy/status behavior matches
- [ ] Anonymous requests omit credentials where the userscript does
- [ ] Timeouts and service errors render the same messages

## Reloaded tools

- [ ] Reloaded Tools appears on all the same eligible room states, including chat variations
- [ ] Info, Clean, Chat and Video sections and selected state match
- [ ] Room info reload and ban/ignored-room actions match
- [ ] Every preference toggle/default/persistence behavior matches
- [ ] Video filters, drag, reset, snapshot and recording controls match
- [ ] Chat filtering, highlighting, translation, autocomplete and sound behavior match
- [ ] Tip sounds remain muted under the same conditions
- [ ] Snapshot dimensions, watermark, JPEG quality, filename and download completion state match
- [ ] Native video controls, theater/fullscreen/PiP interactions and keyboard shortcuts match

## GitHub and local settings data

- [ ] GitHub connection configuration persists with unchanged GM key names and value types
- [ ] Connection test and GitHub GET/PUT behavior match
- [ ] 409 retry behavior and error wording match
- [ ] Encryption/decryption, size limits and wrong-passphrase errors match
- [ ] Manual GitHub export/import produces the same payload and side effects
- [ ] Workshop-only automatic import timing and freshness check match
- [ ] Automatic export triggers only for the same ban/add-room/settings events
- [ ] Local backup download and local import match
- [ ] Recorder, chat, banned-room, Reloaded, Workshop and Mobile Clean View settings are included identically
- [ ] No credentials/passphrases enter exported settings

## Mobile site and Mobile Clean View

- [ ] Mobile-only gate matches the native mobile site and remains inactive on desktop resizing alone
- [ ] Native mobile tab order is Bio, RoomGrid/Rooms and More Rooms, with Tokens in the three-dot menu
- [ ] Rooms replaces the intended native mobile tab without disturbing Chat/Bio behavior
- [ ] Mobile Rooms menu, internal scrolling and page scroll lock match
- [ ] Mobile Workshop top bar is always reachable and Window Focus/removed mode remains absent
- [ ] Mobile toolbar, group drawer, card sizing, menus and pagination match
- [ ] Chat hiding, clean video view, Fit/Fill and restoration match
- [ ] Double-click/touch fullscreen entry and exit match
- [ ] Pinch zoom, pan and pointer/touch ownership match on a real touch device
- [ ] Picture-in-Picture controls and failure handling match
- [ ] Orientation and viewport changes match
- [ ] No desktop-only resize/scroll behavior leaks into mobile

## Input, timing and lifecycle

- [ ] All keyboard shortcuts and modifier combinations match
- [ ] Mouse click, double-click, hover, wheel and context-menu behavior match
- [ ] Right-click on a card, link, room background and native video resolves the intended model in Chrome and Zen
- [ ] Same-origin frame behavior works; cross-origin player/frame limitations are recorded without broader permissions
- [ ] Touchstart/touchmove/touchend and pointer-type behavior match
- [ ] Trusted user-activation-dependent fullscreen/PiP/download flows match
- [ ] Mutation/resize/intersection observer timing and teardown match
- [ ] Timers, debounce/throttle intervals, reconnect delays and auto-collapse delays match
- [ ] No duplicate listeners, observers, cards, menus or styles after repeated SPA navigation

## Final regression evidence

| Area | Tampermonkey | Chrome extension | Firefox/Zen extension | Evidence/notes |
| --- | --- | --- | --- | --- |
| Static body/CSS/UI-string parity | Pending | Pending | Pending | Automated byte-parity verifier |
| Main desktop grid | Pending | Pending | Pending | |
| Desktop model room / theater | Pending | Pending | Pending | |
| Workshop saved groups | Pending | Pending | Pending | |
| Workshop Online Following | Pending | Pending | Pending | |
| Rooms dock/menu | Pending | Pending | Pending | |
| Recorder Hub | Pending | Pending | Pending | |
| Reloaded tools | Pending | Pending | Pending | |
| GitHub/local settings | Pending | Pending | Pending | Destructive cloud writes should use a controlled fixture or explicit user action |
| Native mobile emulation | Pending | Pending | Pending | Real-phone touch remains a separate final check |
| Console/network errors | Pending | Pending | Pending | |

Browser testing updates this table; a simple successful load is not a parity pass.
