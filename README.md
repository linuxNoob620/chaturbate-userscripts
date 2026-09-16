# Ziggy Chaturbate Suite

This repository publishes one maintained Tampermonkey userscript for both desktop and mobile Chaturbate. The current release is **16.6.16**, with the known limitations below:

- **Ziggy Chaturbate Suite** — one native-style Workshop and Rooms tool with Archive Search, playback and chat controls, room-tab naming, split view, encrypted settings backup, and desktop/mobile integration. Suite recording and Recorder Hub have been removed; existing saved media/recovery files are not deleted.
- On Chaturbate's **native mobile site only**, the Suite exposes direct Rooms/Recu.me tabs, an adaptive Workshop Grid, chat-hiding settings and Picture-in-Picture. Existing fullscreen adaptations remain, but complete native fullscreen parity is not established.
- Desktop behavior stays desktop-only; the mobile view is not activated by merely resizing a desktop page.

## Install

- [Install Ziggy Chaturbate Suite](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/refs/heads/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.user.js)

Install the Suite from the same link on every device. Tampermonkey will use its embedded `@updateURL` and `@downloadURL` values for later update checks.

### 16.6.16 — Adaptive Workshop grid

- Columns automatically fit the available width, using the homepage's CSS `auto-fill` approach. Desktop density choices set preferred card widths instead of fixed column counts; the current normal-window density counts are preserved.
- Mobile no longer locks every orientation to two columns. Actual Quetta testing showed two in portrait and four in landscape, matching the tested native homepage counts.
- Live Chrome resizing retained card order/identity and visible playback. Desktop preview fullscreen/Escape and phone double-tap/Android Back passed focused regression checks. Split View sizing and the existing fullscreen limitations are unchanged.

### 16.6.15 — GitHub import and export feedback

- Manual imports distinguish real settings edits from background room-status updates. Pending edits are persisted before download; failed saves or edits made during download still prevent replacement.
- Automatic export uses the same toast renderer/style as adding a model, on desktop and mobile. Progress and failures remain dismissible; a confirmed upload result stays visible for five seconds. The export notice does not replace the model-added message.
- Focused Chrome/Tampermonkey and real Quetta/Tampermonkey checks passed for download/decryption through the replacement confirmation and notification display/dismissal. Replacement was cancelled to preserve existing data. Import application, races and upload outcomes were tested with controlled storage/network fixtures, not destructive live cloud tests.

### Included 16.6.14 features and limitations

- Native-style Workshop categories/cards, outside-dismissible Groups drawer, refresh progress and one organized menu.
- Recently Followed · 24h tracks newly observed successful follows, without restoring the removed Online Following scan.
- Rooms/previews start muted; Recu.me requires deliberate selection.
- GitHub import/export actions are visible in Workshop. Imports are manual-only; automatic membership-change exports show success/setup/failure feedback.
- Persistence, notes, request lifetime, pagination, HLS ownership and panel lifecycle safeguards from the engineering candidate are included.

**Known limitations:** Workshop's native browser fullscreen control still does not provide equivalent ancestor-fullscreen exit; Android Back is an alternative, not a parity fix. Normal-room exhaustive control/gesture acceptance and multi-device cloud conflict testing remain incomplete. Imports are not atomic across settings components. See [implementation/testing notes](docs/NATIVE_WORKSHOP_IMPLEMENTATION.md) and [current state](docs/codex/CURRENT_STATE.md). Publication was explicitly authorized with these limitations; it does not change the earlier acceptance verdict.

`Chaturbate Desktop Mobile Comfort.user.js` remains in the repository only as a legacy fallback. Do not install it alongside the Suite because its runtime is already embedded and duplicate instances are intentionally blocked.

The former standalone room-tab naming behavior is also integrated into the Suite, and Workshop always uses the unique `Ziggy Chaturbate Suite · Workshop` title.

## Separate Recu.me replacement player — experimental

[Install Recu.me Responsive Player](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Responsive%20Player.user.js) — **0.2.0**, an optional experimental desktop player, independent of the Suite and extension builds.

Disable **Accurate Timeline Previews**, reload a Recu.me recording and start playback normally. The replacement now starts automatically when the authorized source is ready, at fixed **1080p or the highest offered lower resolution**. It uses Shaka Player, the site's existing authorized media transport, and preloaded sampled storyboard thumbnails, without decoding a new video frame for each hover. **Use original player** returns through the site's timestamp link and keeps that URL on the original player, even after reload. Manual quality/Auto selection remains available.

Actual Chrome/Tampermonkey checks showed already-loaded hover previews on the next animation frame, without extra media requests. Version 0.2.0 corrects the controls hide/reappear loop and measured recurring segment-timing gaps; bounded playback checks passed at 540p, 720p and 1080p. Controls stay visible while hovering the timeline or using an open settings menu. Cold media seeks still take roughly 1–3 seconds; this player does **not** promise faster server delivery or second-accurate images. Mobile/Firefox and site controls outside the replacement player are not accepted integration surfaces yet. See [scope, measurements, limitations and build commands](docs/RECU_RESPONSIVE_PLAYER.md).

## Separate Recu.me timeline preview script

[Install Recu.me Accurate Timeline Previews](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Recu.me%20Accurate%20Timeline%20Previews.user.js) — version **1.0.0**. This is optional and independent of the Suite, runs only on `recu.me`, and requires the site's supported desktop HLS/Plyr player.

It replaces coarse seek-bar thumbnails with a decoded frame within one second of the displayed timestamp, while retaining the native preview bubble. It first establishes the stream's starting timestamp reference and matches the main video's rendition; simply seeking a fresh decoder into the middle can give misleading frame timestamps. A loading/unavailable message replaces uncertain images. Nothing is recorded or downloaded as a file, and the main video is not sought, unmuted, or played by the script.

Uncached previews use extra bandwidth and typically took 2–3 seconds in the tested session; cached previews were near-instant. Up to 32 recent frames are kept in memory. Loading stops on pointer exit, and the decoder is released after 12 seconds idle. Touch previews are not implemented. See [scope and test evidence](docs/RECU_ACCURATE_PREVIEWS.md). Run `npm run test:recu-previews` for its standalone regression tests.

## Browser extension builds

The Tampermonkey userscript remains the authoritative, maintained implementation. Chrome and Firefox/Zen packages are generated by wrapping its complete application body with small browser API adapters; the application body is not rewritten.

**Existing extension packages remain at 16.6.7.** This userscript-only release does not update or claim current parity for those frozen packages. Run extension builds only when intentionally preparing a separate extension update.

Requirements: Node.js 22 or later and `npm install` once.

```powershell
npm run build
npm run build:userscript
npm run build:chrome
npm run build:firefox
npm test
```

Outputs:

- Tampermonkey: `Chaturbate MultiCam Pro + Cam ARNA.user.js`
- Chrome unpacked extension: `dist/chrome`
- Chrome ZIP: `dist/packages/ziggy-chaturbate-suite-chrome-<version>.zip`
- Firefox/Zen unpacked extension: `dist/firefox`
- Firefox/Zen XPI: `dist/packages/ziggy-chaturbate-suite-firefox-<version>.xpi`

Load `dist/chrome` with Chrome's **Load unpacked** development action. Load `dist/firefox/manifest.json` as a temporary add-on from `about:debugging`; permanent Firefox/Zen installation requires Mozilla signing.

Do not enable the Tampermonkey and extension implementations simultaneously. For parity tests, enable exactly one implementation and reload the page.

The browser extensions also add a Chaturbate-only native context submenu with **Rooms** and **Open Workshop**. Rooms uses the model card/link under the pointer when available, falls back to the current room, and delegates to the Suite's existing Rooms UI. This native browser menu is extension-only; it does not alter the maintained Tampermonkey interface.

The userscript metadata and `package.json` versions match. An explicit extension build generates matching manifest versions and the parity checker verifies its copied userscript body; already-published frozen packages are not automatically synchronized. HLS remains pinned at 1.6.16.

See [the compatibility map](docs/extension-compatibility-map.md) and [the parity checklist](docs/parity-checklist.md).

## Encrypted settings backup

The Suite can upload one encrypted current backup to the private repository `linuxNoob620/chaturbate-userscript-settings`.

On each device:

1. Create or obtain a fine-grained GitHub token limited to that private repository.
2. Grant only **Contents: Read and write**.
3. Open **GitHub Cloud** from the Suite menu or Settings Center.
4. Enter the token, a device name, and the same encryption passphrase on every device.
5. Use **Export to GitHub** to replace the current cloud backup and **Import from GitHub** to restore it.

Tokens and passphrases are never committed to this repository or included in exported settings. Local-file export and import remain available as recovery options.

There is no automatic import. Successful local Workshop membership changes queue a coalesced automatic export and show a dismissible status notice. Missing setup, failed local persistence, upload errors and newer changes excluded from a snapshot are not reported as successful synchronization.

## Development validation

```powershell
npm install
npm run build:userscript
npm run test:userscript
```

These userscript-only checks cover syntax, metadata/update URLs, internal version consistency, obvious accidental credential patterns, encryption/conflict handling, persistence, notes, requests, lifecycle, Workshop refresh and Recu.me behavior without rebuilding extensions. CI uses this scope. The separate full `npm run build` / `npm test` workflow additionally builds/checks extension adapters and body parity; do not use it for a userscript-only release.
