# Codex Project Instructions

## Mandatory startup

Before doing project work:

1. Read this file.
2. Inspect the current Git status and repository state.
3. Read `docs/codex/WORKFLOW.md` and `docs/codex/CURRENT_STATE.md`.
4. Read any additional task-relevant files under `docs/codex/`.
5. Only then investigate the current request.

## Context-compaction recovery

If context appears compacted, summarized, truncated, partially lost, or established rules are uncertain:

1. Stop before making more changes.
2. Re-read this file, `docs/codex/WORKFLOW.md`, and `docs/codex/CURRENT_STATE.md`.
3. Re-read other task-relevant files under `docs/codex/`.
4. Inspect Git status, Git diff, relevant recent history, and the current repository state.
5. Re-establish the current task and testing state before continuing.

Never reconstruct important workflow rules from guesses after context compaction.

## Documentation map

Always read:

- `docs/codex/WORKFLOW.md`
- `docs/codex/CURRENT_STATE.md`

For environment/browser/device work, read `docs/codex/ENVIRONMENT.md`.

For testing, read `docs/codex/TESTING.md`.

For UI/site behavior, read `docs/codex/BEHAVIOR_BASELINES.md`.

For product/design choices, read `docs/codex/DECISIONS.md`.

For browser/site/tool oddities, read `docs/codex/KNOWN_QUIRKS.md`.

## Core rules summary

- Use Riqor appropriately and inspect actual behavior before planning implementation.
- Mobile testing uses the real connected phone, Quetta, the live site, and the actual userscript.
- Desktop testing uses Chrome, Tampermonkey, the live site, and the actual userscript.
- Future requests default to inspect and plan unless implementation is explicitly authorized.
- `CommandLineOnNonRooted` may be enabled only during an active real-phone testing pass. Disable it immediately afterward and verify the final state is OFF.
- The Tampermonkey userscript is the primary target. Publish successfully tested userscript edits.
- Do not automatically modify, rebuild, synchronize, package, or publish extension versions.
- Preserve native Chaturbate behavior unless the requested feature requires otherwise.
- For parity/restoration work, define acceptance criteria from the live native baseline before editing, then verify the edited behavior against the same checklist.
- UI behavior is not verified by source inspection, logs, DOM inspection, or synthetic events alone when real interaction testing is reasonably possible.
