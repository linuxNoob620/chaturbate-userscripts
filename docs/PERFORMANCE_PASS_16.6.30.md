# Staged desktop performance pass — 16.6.30

Date: 2026-10-12. Primary target: the actual Tampermonkey Suite, not the frozen extensions. The user explicitly deferred mobile changes and real-phone acceptance.

## Scope and rollback

Baseline commit: `a649b14a008dcfd755fc73d563e12c3621564893`, release 16.6.29. Baseline Suite Git blob: `fc554fd6aae27467ee98522c8538aa250a86bf19`. Recoverable local tag: `backup/pre-staged-performance-20261012`.

Baseline source SHA-256: `DAAFCCC35434534168C436DD3099538CFCF7C444C7A259BB416D1BF2F425FC60`.

Candidate source SHA-256: `0AFD893F44BBA8AD067845021DAB706E10A1ACF9832572358D300ACB102EBC51`. Candidate metadata SHA-256: `F4D233574B3F664B2A3429F40E2036798127620C219CF0F50BE10B03D56AE06F`.

Before source edits, the baseline was tagged, syntax checked and the relevant mechanisms reproduced. The brief was checked against current 16.6.29 source and the installed testing-profile runtime; its desktop decoration, general settings notifications, split rebuilding, hover lifetime and direct bulk-start findings still applied. Existing 16.6.28 freshness, stable cards, frame-coalesced pan and persistence/sync safeguards were retained.

Rollback means restoring the Suite source and matching metadata from that tag, then updating the existing Tampermonkey entry and reloading. Do not reset preferences or restore an entire old settings snapshot. Preserve unrelated working-tree changes. Existing saved data has no new format or migration.

## Changes and regression risks

| Area / source anchors | Previous repeated work | Implemented behavior | Risk / boundary |
|---|---|---|---|
| `addevent2`, `flushThumbnailDecoration`, `addevent2a`, `thumbnailWork` | A routine mutation scheduled a full-list pass behind a 500-ms page blocker | Target relevant added/changed cards, deduplicate a route-owned queue, snapshot preferences once, process at most 32 cards per yielded batch; keep native UI usable | Late hydration and recycled nodes require invalidation. The 8-ms gathering check is not a hard time limit for decorating the batch |
| `startthumbobserver`, `decorateHiddenLabel`, `showhidden3/4` | Own decoration could feed observations; routine decoration called hidden-list loading again | Ignore owned note mutations, avoid retained-list descendant traversal on container append, idempotently patch hidden labels; targeted work does not refetch hidden lists | Full/explicit route work still refreshes hidden status. No new account cache or promise of instant hidden-status changes |
| Workshop Store subscriber | Transform-only updates synchronized unrelated controls and derived room lists | Key-specific invalidation; transform, quality and volume updates retain their intended owners | Generic/all, membership, search and layout updates retain broad reconciliation; no blanket debounce of shared writes |
| `renderSplitLayout`, `syncSplitLayoutState`, `cleanupSplitLayout` | Audio, divider ratio and toolbar position rebuilt split panes/controls | Retain attached keyed panes, controls and media; patch relevant properties; structural changes still rebuild | Detached panes/roots/toolbar reject the fast path. Fullscreen/user-activation paths remain synchronous |
| `moveimg`, `moveimgstop`, `regetimg` | A pending timer could request another snapshot after leaving | One owned image job with timer/listener cleanup, identity/source/route/visibility guards | Already-in-flight image transport cancellation is browser-dependent. Cadence and enabled preference remain unchanged |
| `createCamArnaDock`, `activate`, `deactivate`, `suspendSearch`, `showView`, `selectUsername` | Hidden desktop automatic searches could continue queued checks | Abort owned work on dock/tab/subview/page inactivity; preserve results/query and resume only unfinished sites with three workers | This intentionally changes hidden automatic-work policy, not explicit saves/downloads. Native-mobile lifecycle is opted out pending separate acceptance |
| `store.addRooms`, `importUsernameList`, paste/manual import callers | Repeated per-room mutation, sanitization/persistence and direct starts | One indexed coherent mutation and successful flush before acknowledgement; serialize bulk batches through existing four-worker refresh admission | Four is the bulk lane's bound, not a new global/cross-tab cap. Existing visible-media/polling work can overlap |

Bulk additions preserve the repeated single-add result for Default, virtual and custom groups, including mixed existing/new entries and order. Duplicate successful no-ops do not write. Failed/pending same-list retries must successfully flush before returning success; retained local drafts are not misreported as durable. Existing journal, conflict, recovery and rebase mechanisms remain authoritative. No real bulk import was performed on the user's library.

## Comparable measurements

### Installed Chrome/Tampermonkey decoration

Actual persistent Chrome-for-Testing, same viewport 1478 × 673 CSS pixels, 114 saved Workshop rooms, same preview-quality preference (480p), three controlled native-card clone appends per build. Native homepage content varied: 113 baseline cards versus 115 candidate cards. Each 1,100-ms sample used precise coverage and page metrics, which add overhead. No script-disabled homepage was treated as a feature-equivalent performance baseline.

| Metric | Baseline samples | Candidate samples |
|---|---|---|
| Append to completed decoration, ms | 503 / 442 / 444 | 31 / 7 / 200 |
| Automatic page-blocker duration, ms | 495 / 434 / 436 | 0 / 0 / 0 |
| Scripting during sample, ms | 15 / 15 / 15 | 17 / 15 / 24 |
| Layout during sample, ms | 1 / 1 / 1 | 1 / 1 / 1 |
| Style recalculation during sample, ms | 31 / 31 / 30 | 30 / 29 / 21 |
| Total browser task duration, ms | 89 / 70 / 76 | 71 / 69 / 96 |
| Hidden-list entry calls during append | 1 / 1 / 1 | 0 / 0 / 0 |

The candidate eliminates the artificial blocker and unnecessary hidden-list entry during targeted appends. These samples do **not** establish a consistent sub-100-ms result, total scripting reduction, GPU improvement, percentile SLA or whole-browser slowdown fix. Candidate append measurements preceded only the final Archive selection guard and version-label change; final 16.6.30 installed runtime was separately confirmed.

### Equal-workload deterministic comparisons

| Fixture | Baseline | Candidate | Evidence limit |
|---|---|---|---|
| 100 transform-only notifications | 100 unrelated layout/control sync calls | 0 unrelated layout/control sync calls; 100 intended transform applications | Extracted-source function counts, not live input latency |
| Add 100 synthetic rooms | 351 ms, 100 saves | 3 ms, 1 save | Single Node sample per size, synthetic storage |
| Add 500 synthetic rooms | 7,232 ms, 500 saves | 14 ms, 1 save | Same fixture/order semantics, not browser/cloud latency |
| Add 1,000 synthetic rooms | 28,804 ms, 1,000 saves | 31 ms, 1 save | Not proof of a browser long-task bound or live sync throughput |
| Overlapping bulk imports | Independent direct starts bypassed batch admission | Peak 4 active probes in the bulk lane | Actual extracted refresh worker, synthetic requests |
| Split property updates | Structural rebuilding path | 100 updates retain panes/video/focus, zero child-list mutations | Isolated actual Chromium DOM fixture |

Cancellation of hidden automatic work is a behavior-changing resource saving and is reported separately from equal-workload changes. No cap on desired simultaneously visible live previews was introduced. All-live remains available; saved quality and autoplay choices are preserved.

## Actual installed desktop acceptance

The existing Suite entry was updated without reinstalling/resetting it. Saved editor readback after reload matched the final source SHA-256. The reloaded live runtime reports 16.6.30.

- Native homepage: hover changes the image; three final 550-ms enter/leave cycles each produced three matching `/minifwap/` requests while hovered, zero new matching requests in the following 550 ms, and a stable image after leaving. This does not prove every already-in-flight transport was physically aborted.
- Notes icon: real pointer open/close passed without reading private content or saving/deleting a note. Recycled note/bio/link identities and filter restoration are covered by the isolated DOM fixture; live account filter preferences were not rewritten.
- Settings: real pointer/keyboard selected an unsaved 720p preview draft while persisted quality remained 480p. Collapse/reopen retained the same select node and draft; Escape closed and restored focus to Menu and settings. No settings save was pressed.
- Split: actual card-menu selection, four audio switches, three toolbar-position cycles and a divider drag from 50 to 65 and back to 50 retained both panes and advancing video elements with zero grid-child mutations. Exit worked. Exact original browser-local split/audio preferences were restored using current storage fields, without replacing the library/shared snapshot.
- Genuine Workshop background/return: nine card nodes retained, zero mounted card videos while hidden; after 3.2 seconds foregrounded, nine video nodes and eight ready/playing videos were observed. The remaining preview was not claimed ready within that interval.
- Workshop preview double-click fullscreen and Escape retained video, advancing playback and URL. This is nearby desktop regression only, not native/fullscreen parity acceptance.
- Normal room: actual native stream played muted at 1920 × 1080. Rooms/Archive dock switching and collapse preserved playback and mute. No native sizing, viewport, fullscreen or gesture implementation was changed.
- Archive: real Rooms switching invoked deactivation/suspension and retained stable result classes while inactive. History selection invoked suspension. Completed results/query remained available on reopening. Abort-handle counts, unfinished-only resume, late callbacks and A/B selection race are deterministic fixtures; physical network cancellation of all Tampermonkey-owned transports was not separately observed.

### Final cold Workshop refresh sanity sample

One foreground ordinary Refresh completed in 12,605 ms, with 109 context requests/109 unique URLs. Nine initially playing previews were reported kept by the refresh; eight sampled video/source identities remained connected and advancing at the end. The live Online list changed and two checks failed, so continuity of every initial video is not claimed. Idle eight-second sample: zero grid mutations, zero context requests, zero long tasks. Refresh: six mutations, two child-list mutations, five long tasks, longest 117 ms. Periodic/native/media work can overlap these metrics; no attribution to a particular changed function or cold-refresh speed gain is established.

No comparable new warm-refresh measurement is claimed. Existing 16.6.28 freshness behavior remains fixture-covered. No repeated cold refresh was used to hammer the site.

## Checks and independent review

Fresh complete gates ran in a clean baseline export plus only scoped candidate overlays. This avoids the unrelated pre-existing standalone Recu.me source/metadata mismatch without changing that work. Source and Suite metadata hashes match that tested build.

| Check | Outcome |
|---|---|
| `node --check "Chaturbate MultiCam Pro + Cam ARNA.user.js"` | Exit 0 |
| `npm run build:userscript` | Exit 0; embedded sync bundle matches; metadata valid |
| `npm run test:userscript` | Exit 0, complete userscript scope |
| `npm run test:settings-sync` | Exit 0; Store integration 24/24 |
| `node tools/test-extension-adapters.mjs` | Exit 0; adapters only, no extension build |
| `npm run test:performance` | 30/30: queue 7, hover 9, settings 4, Archive 6, bulk admission 4 |
| `node tools/test-performance-browser.mjs` | 14 isolated actual Chromium DOM checks passed; not installed-site acceptance |
| Nearby extracted checks | Stage 2 UI 22, Workshop incremental 24, settings 20, visibility 21, legacy 53 passed |
| `git diff --check` | Exit 0; line-ending conversion warnings only |

Riqor core, performance benchmarker, minimal-change and reviewer workflows were used. Independent read-only review covered lifecycle, media ownership, Store/rebase callers and the complete scoped source diff. Review findings were fixed and regression checked, including observer feedback, stale hover/source identity, detached split fast path, mixed Default ordering, pending-save retry, BFCache resume and stale Archive A/B dispatch. Independent review does not substitute for runtime evidence.

## Deferred / not verified

- All mobile-specific synchronization changes and actual Quetta acceptance: explicitly deferred by the user. Shared Workshop/bulk improvements are locally covered, not phone-accepted. No phone settings/debug flags were accessed or modified; their current state was not newly verified.
- Preview budgets and large-list virtualization: not justified by this bounded desktop evidence; no functionality/quality reduction implemented. A full large-library connected-DOM/scroll trace is needed before taking on focus, ordering and fullscreen recycling risk.
- 20–30-minute representative soak, sustained memory/detached-node growth, CPU/GPU trends, percentile interaction latency, audible audio isolation, real PiP behavior and exhaustive fullscreen: not performed in this focused pass.
- Real bulk import, cross-device sync conflicts, live storage-failure injection and destructive account actions: not performed. Synthetic persistence/rebase/error tests passed; this is not multi-device acceptance.
- Every native Following/Spy/offline layout, live preference-filter matrix, browser back/forward media reuse, middle-click/new-tab matrix and Archive transport cancellation: not exhaustively live-tested; relevant extracted/DOM mechanisms are covered.
- Wheel zoom persistence policy, temporary HLS buffering/quality policy, incremental chat/translation cancellation, broad CSS and iframe host redesign: unchanged. Existing native-fullscreen limitations remain accepted and unresolved, not newly fixed.

## Changed files

- `Chaturbate MultiCam Pro + Cam ARNA.user.js` and matching `.meta.js`: scoped implementation/version.
- `package.json`, `package-lock.json`: version and focused performance test command; no dependency update.
- `tools/test-stage2-ui.mjs`: additional fixture context for extracted disposal behavior.
- `tools/test-settings-sync-integration.mjs`: bulk durability/order/rebase/no-op/retry checks and optional scaling measurement.
- New `tools/measure-suite-thumbnail.mjs`, `tools/test-desktop-decoration.mjs`, `tools/test-thumbnail-hover.mjs`, `tools/test-performance-settings.mjs`, `tools/test-performance-browser.mjs`, `tools/test-archive-lifetime.mjs`, `tools/test-bulk-admission.mjs`.
- This report, `docs/codex/CURRENT_STATE.md` and `docs/codex/TESTING.md`: durable scope, evidence and reusable checks.

Unrelated Android documents, historical recorder fixtures, standalone Recu.me edits and extension targets were preserved, not staged with this pass.
