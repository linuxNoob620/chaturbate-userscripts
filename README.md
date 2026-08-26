# Ziggy's Chaturbate userscripts

This repository publishes one stable Tampermonkey userscript for both desktop and mobile Chaturbate:

- **Ziggy Chaturbate Suite** — RoomGrid MultiCam workstation, Cam ARNA, Reloaded tools, recording, split view, encrypted settings sync, and native desktop/mobile integration.
- On Chaturbate's **native mobile site only**, the Suite also enables Mobile Clean View: chat hiding, video-only fullscreen with Fit/Fill, pinch zoom and pan, Picture-in-Picture, a compact room grid, and Suite controls in the hamburger menu.
- Desktop behavior stays desktop-only; Mobile Clean View is not activated by merely resizing a desktop page.

## Install

- [Install Ziggy Chaturbate Suite](https://raw.githubusercontent.com/linuxNoob620/chaturbate-userscripts/main/Chaturbate%20MultiCam%20Pro%20%2B%20Cam%20ARNA.user.js)

Install the Suite from the same link on every device. Tampermonkey will use its embedded `@updateURL` and `@downloadURL` values for later update checks.

`Chaturbate Desktop Mobile Comfort.user.js` remains in the repository only as a legacy fallback. Do not install it alongside the Suite because its runtime is already embedded and duplicate instances are intentionally blocked.

## Encrypted settings backup

The MultiCam script can upload one encrypted current backup to the private repository `linuxNoob620/chaturbate-userscript-settings`.

On each device:

1. Create or obtain a fine-grained GitHub token limited to that private repository.
2. Grant only **Contents: Read and write**.
3. Open **GitHub Cloud** from the skull menu or MultiCam Settings Center.
4. Enter the token, a device name, and the same encryption passphrase on every device.
5. Use **Export to GitHub** to replace the current cloud backup and **Import from GitHub** to restore it.

Tokens and passphrases are never committed to this repository or included in exported settings. Local-file export and import remain available as recovery options.

## Development validation

```powershell
node .\tools\validate-userscripts.mjs --write-meta
node .\tools\validate-userscripts.mjs
node .\tools\test-github-sync.mjs
```

The checks cover JavaScript syntax, metadata/update URLs, internal version consistency, generated metadata files, obvious accidental credential patterns, encrypted round-trips, wrong-passphrase rejection, GitHub overwrite behavior, and download/decryption.
