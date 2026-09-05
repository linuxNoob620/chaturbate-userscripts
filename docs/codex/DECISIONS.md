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
