# Product and Design Decisions

## D-001 — Tampermonkey is the primary runtime

Status: Active

Decision: The userscript/Tampermonkey build is the primary deployment target. Browser-extension versions are not automatically synchronized, rebuilt, packaged, or published after userscript changes.

## D-002 — Preserve native normal-room behavior

Status: Active

Decision: Normal Chaturbate room fullscreen, controls, exit, portrait, and orientation behavior must remain native unless a requested feature explicitly requires modification. Workshop should adapt toward corresponding native behavior rather than changing normal rooms to behave like Workshop.

## D-003 — Mobile verification uses the real phone

Status: Active

Decision: When the phone is available, final mobile verification uses the real connected phone, Quetta, the live mobile site, and the actual userscript. Desktop emulation is only a debugging aid.

## D-004 — Future requests require explicit edit authorization

Status: Active

Decision: Future requests default to inspection, diagnosis, and a concrete plan. Editing begins only after explicit authorization such as `implement`, `edit`, `change`, `fix`, `apply`, `modify`, or `proceed`.

## D-005 — Following previews stay outside Workshop

Status: Active

Decision: Workshop does not expose or synchronize an Online Following group. Animated followed-room previews belong only to Chaturbate's native desktop Following dropdown, and its native Show All destination remains unchanged.

Authorized exception: the virtual **Recently Followed · 24h** category contains only newly observed successful follows, with no historical backfill or complete Following-list scan. It is separate from saved-room membership and does not restore Online Following polling in Workshop.

## D-006 — Recu.me replaces the native Share tab

Status: Active

Decision: On supported desktop model-room pages, the Suite replaces Chaturbate's native Share tab label and panel contents with a lazy, sanitized Recu.me performer preview. Mobile exposes direct native-style Rooms and Recu.me tabs while preserving native Private/Tokens entries; Recu.me and the retained three-dot menu entry share one renderer and an explicit return control. It does not embed a CSP-blocked iframe and leaves full Recu.me interaction on the external site. Small tab-session caching, explicit refresh and on-demand pagination are allowed; hover previews use Recu.me's available sampled-frame sheets, not full-video extraction or account/access-control replication.

Entry policy: Recu.me is never the initial selected tab on room entry, including remembered Share state. It requires deliberate selection. Newly opened rooms/previews start muted, without preventing a subsequent deliberate unmute.

## D-007 — Manual imports and visible automatic exports

Status: Active

Decision: Remove automatic cloud settings imports. Keep explicit manual cloud/local import and normal same-browser state propagation. Queue automatic exports only after successful Workshop membership persistence; coalesce rapid changes and show nonblocking, truthful upload/failure/setup feedback. Do not label a failed or missing-credentials export as successful.

## D-008 — Remove Suite recording without deleting user media

Status: Active

Decision: Remove the Suite's recording engine, Recorder Hub/Center, capture/conversion controls, shortcuts and userscript-only conversion resource. Preserve saved media and retained recovery sources. Keep Recu.me/external archive browsing, playback previews, screenshots and Picture-in-Picture; archive records are not Suite recording jobs. Frozen extension builds and their dependencies remain untouched unless extension work is separately authorized.

## D-009 — Workshop follows native listing presentation

Status: Active

Decision: Replace the dashboard-style Workshop presentation with a native-style listing: reuse the live desktop header where available, category pills, responsive preview cards, an outside-dismissible Groups drawer, visible refresh progress and one organized menu. As authorized on September 13, desktop and mobile Grid columns adapt to available width; density is a card-size preference, not a fixed column count. Mobile retains two columns at the tested portrait width and gains columns in wider views. Retain existing saved data, groups, filters, Grid/Phone modes, previews, split view and explicit room navigation. Keep GitHub import/export discoverable in the same menu on desktop and mobile; do not recreate native account controls or redesign fullscreen as part of the presentation change.
