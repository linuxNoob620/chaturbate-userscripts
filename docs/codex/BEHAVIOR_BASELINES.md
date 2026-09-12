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
- That initial pass did not establish successful fullscreen; the comparison below supersedes that limitation. It did not prove a debugging-related browser restriction.

## Successful native fullscreen comparison — 2026-09-05

- Same OPPO CPH2791 / Quetta 2.0.2 / Chromium 148.0.7778.217, live mobile site. Suite disabled in Tampermonkey, other Chaturbate scripts disabled, and absence of the Suite runtime checked after reload.
- Native fullscreen uses `#basePlayer`. When its overlay is hidden, the first tap reveals controls; a subsequent tap on the now-visible fullscreen control performs the action.
- At a portrait CSS viewport of approximately 427 x 931, a 16:9 source fills the height and is horizontally cropped: approximately 1655 x 931, centered at x=-614 before panning.
- Horizontal dragging pans the enlarged video without changing its dimensions.
- A centered 15-move pinch from 140 to 60 CSS pixels reduced the source to approximately 1062 x 597, top-aligned. Vertical dragging also changes the video size.
- Rotation retained fullscreen; landscape used the approximately 932 x 428 viewport with source aspect preserved and native controls/chat present.
- Three native-control exit/re-entry cycles succeeded. Android Back can leave the site's expanded-player state active after exiting browser fullscreen; it is not equivalent to the site's own exit control.
- Audio-control behavior and every zoom boundary were not exhaustively tested. These observations do not establish userscript parity.

## Native zoom / rotation refinement — 2026-09-09

- Actual OPPO CPH2791 / Quetta, live `danamily` room, Suite disabled in Tampermonkey and runtime absence confirmed after reload. Measurements concern a 16:9 live source; adaptive resolution varied without changing aspect ratio.
- At about 427 x 931 CSS pixels, native portrait fullscreen again enlarged the source to approximately 1655 x 931 and cropped it horizontally. Room entry remained inline without automatic fullscreen.
- The compared inward pinch reduced the source to approximately 1326 x 746, top-aligned. A horizontal drag changed pan without changing zoom.
- Rotating the real phone's OS display to landscape contained the image in the approximately 931 x 427 viewport. Returning to portrait **retained the reduced zoom but recentered horizontal pan**. Rotation was driven by ADB display-rotation control; physical sensor rotation was not independently tested.
- Three exits through the site's native control and re-entries retained the session zoom and usable controls. Bio navigation and content scrolling worked afterward; URL/tab count did not unexpectedly change.
- Native inline source sizing was about 507 x 285 within a roughly 428-pixel player, cropped horizontally. Do not assume a Suite contain/fit inline layout is an exact match.
- This refines the native acceptance target, not a blanket claim about the userscript or every control/gesture boundary.
