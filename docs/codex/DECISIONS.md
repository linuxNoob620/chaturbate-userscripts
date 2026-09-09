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

## D-006 — Recu.me replaces the native Share tab

Status: Active

Decision: On supported desktop model-room pages, the Suite replaces Chaturbate's native Share tab label and panel contents with a lazy, sanitized Recu.me performer preview. Mobile uses the native three-dot room menu with the same panel renderer and an explicit return control. It does not embed a CSP-blocked iframe and leaves full Recu.me interaction on the external site. Small tab-session caching, explicit refresh and on-demand pagination are allowed; hover previews use Recu.me's available sampled-frame sheets, not full-video extraction or account/access-control replication.
