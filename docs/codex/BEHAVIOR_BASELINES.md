# Native Chaturbate Behavior Baselines

This file contains only behavior observed on Chaturbate with the Ziggy userscript disabled. Each entry must name the environment, device/browser, verification date, disabled-script state, and actual observation.

## Mobile live-room baseline — 2026-09-05

- Device: OPPO CPH2791.
- Browser: Quetta 2.0.2, Chromium 148.0.7778.217.
- Site: live Chaturbate mobile site in portrait.
- Userscript state: `Ziggy Chaturbate Suite 16.6.7` visibly disabled in Tampermonkey; the other installed Chaturbate userscripts were also disabled.
- Room entry: tapping a listing card opened the room inline. Chaturbate did not automatically request fullscreen.
- Player interaction: one tap on the video exposed Chaturbate's own player overlay, including `Drag to resize`, audio, and fullscreen controls.
- Orientation: rotating to landscape reflowed the native room/player into Chaturbate's landscape layout; Quetta's browser chrome remained visible because fullscreen had not been entered.
- Exit/navigation: Android Back returned from the room to the listing in one step and restored the portrait listing.
- Fullscreen limitation during this pass: repeated real ADB touchscreen taps on the visible native fullscreen control did not enter fullscreen while Quetta's temporary command-line debugging path was active. This pass therefore proves the native inline/orientation/navigation behavior above, but does not establish the successful native fullscreen state or native zoom/pan gestures.
