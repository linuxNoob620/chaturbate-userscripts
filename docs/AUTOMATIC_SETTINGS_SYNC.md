# Automatic settings sync

## Setup and scope

Each browser needs the current Suite, the same signed-in Chaturbate account, the existing GitHub repository/token configuration, and its encryption passphrase saved locally. In **GitHub cloud settings**, choose **Enable automatic sync** once. Setup compares the existing encrypted backup and local settings, keeps a local enrollment backup, and never treats a new/empty device as an instruction to delete cloud rooms.

The encrypted revisioned document is `settings/sync-v2.enc.json`. The old `settings/latest.enc.json` snapshot remains a separate manual recovery/export format. Older Suite versions cannot write the new document. Close/reload old Suite tabs after updating. Do not copy the IndexedDB device identity into another browser profile.

Shared data:

- Saved rooms, custom groups, favorites, room ordering and library notes. Each room's shared metadata is one conflict unit; independent rooms merge, but simultaneous edits to the same room may require review.
- Global chat filters/language, ignored users, selected browse preferences, default preview/notification/polling preferences, shortcuts, and shared mobile clean-view preferences.

Local-only data includes credentials/passphrase, browser permissions, account-native follows/notification subscriptions, recent-follow observation history, current category/search/filter/page, theme, layout sizing, playback/mute/volume, preview transforms, fullscreen and transient stream status. The live Chaturbate account's personal notes are not the Workshop library note field.

## Triggers

- Startup and page restoration.
- Returning to the tab/browser, becoming visible, or regaining connectivity.
- Approximately three seconds after a shared edit, coalescing rapid changes.
- Approximately thirty seconds while active, or two minutes while backgrounded, subject to browser scheduling.

One same-origin worker per account is admitted through Web Locks. Redundant recent checks are skipped; GitHub throttling/failures back off. A closed/suspended browser cannot run this userscript: it catches up when reopened. This is polling, not instant server push.

Mutable GitHub reads request server revalidation and retain the rollback guard if an older revision is returned. The network option follows [Tampermonkey's documented request API](https://www.tampermonkey.net/documentation.php#api:GM_xmlhttpRequest); a stale response never authorizes replacing newer local state.

## Data safety and conflicts

Edits are synchronously written to a bounded local write-ahead journal before the legacy setting changes. IndexedDB transaction completion establishes the durable canonical queue; the old storage objects are replayable UI projections. A failed projection can be retried, but projections across separate storage components are **not atomic**.

Every operation has a device sequence, a captured field revision, and an exact acknowledgement. GitHub's Contents SHA guards the encrypted file replacement. A conflict retry pulls and merges the new document again; it does not reuse a stale whole-settings payload. Phone/PC clocks are not an authority for which setting wins.

Independent fields merge. Identical edits coalesce. Differing concurrent edits—including structural group/membership conflicts—retain the shared and incoming versions for review. Explicit deletions are retained as tombstones, so unchanged old devices do not resurrect deleted rooms. Review controls resolve only the named conflict against the displayed current revision; a newer remote edit can require review again.

Untracked changes from older tabs, wrong accounts, invalid schemas, lost history, unavailable safe locking, storage failures and capacity limits fail closed with retained data. They are not reported as successful synchronization. The implementation deliberately has hard queue/document/conflict/device limits; it does not silently prune history or drop edits.

**Pause** retains the queue. Local edits made while paused require explicit review before **Resume / review local changes** queues them; a local backup is made first. Ordinary snapshot replacement is blocked while automatic sync is enabled. Manual snapshot import after pausing is not an automatic conflict-resolution policy.

## Notifications and recovery

The existing Suite toast style reports syncing, confirmed upload, queued newer edits, conflicts and failures. “Saved locally” and “synced to GitHub” are different states. No success toast promises that another suspended device has already applied the change.

Keep the enrollment backup, original JSON export and old GitHub snapshot. Do not clear site storage to repair a queue: that can remove unsent edits and the device identity. A forgotten encryption passphrase cannot be recovered by the script. Saved passphrases remain local to the userscript manager; GitHub receives only the encrypted payload.

## Engineering checks

`npm run test:settings-sync` checks the actual bundled protocol, codec, client queue, transactional adapter, controller and extracted Store integration using deterministic synthetic data/fault injection. It covers stale devices, deletion, same-field conflicts, 409/lost responses, edits during upload, cross-tab ordering, queue saturation/draining, projection failure, reviewed resume, and structural conflicts. `tools/test-settings-sync-browser-fixture.js` is an isolated real-Chrome IndexedDB/Web Locks fixture which removes its own disposable database. Neither fixture substitutes for live cross-device acceptance.
