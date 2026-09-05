# Codex Workflow

## Default workflow

For every project request:

1. Read `AGENTS.md`, inspect Git state, and read the applicable Codex documentation.
2. Determine whether the request affects desktop, mobile, or both.
3. Inspect the relevant real environment.
4. Use Riqor appropriately, scaled to the risk and scope.
5. Investigate and diagnose the current behavior.
6. Create a concrete implementation plan.
7. Continue to editing only when the user explicitly authorizes implementation with wording such as `implement`, `edit`, `change`, `fix`, `apply`, `modify`, or `proceed`.
8. Make the smallest required change. Avoid unrelated refactors, renames, formatting sweeps, dependency updates, and fixes.
9. Test focused behavior, then perform adaptive nearby regression testing.
10. Publish a successfully tested userscript edit.
11. Update only durable documentation whose truth changed.
12. Perform final environment, Git, deployment, and phone-debug cleanup verification.

A request that merely describes desired behavior is not automatic authorization to edit. Without explicit authorization, stop after investigation and a plan.

## Evidence standard

- Inspect actual behavior before planning a UI or behavior change.
- Treat source inspection, logs, DOM inspection, DevTools, and synthetic input as investigation tools, not substitutes for real interaction testing.
- For failures, determine the root cause before editing.
- If prior behavior matters, inspect relevant Git history and recover the known-good implementation where practical without reverting unrelated work.
- Preserve unrelated user changes and keep credentials, cookies, tokens, and secrets out of logs, artifacts, prompts, and commits.

## Environment routing

- Desktop behavior: Chrome on the PC with Tampermonkey and the actual userscript.
- Mobile behavior: real connected Android phone with Quetta, the live mobile site, and the actual userscript.
- Both: inspect and test both environments where the changed code is shared or relevant.
- Desktop mobile emulation may help debugging but is not final evidence for mobile behavior when the real phone is available.

## Phone-test safety lifecycle

Every distinct real-phone Quetta testing pass must follow:

```text
CommandLineOnNonRooted ON
        -> test
CommandLineOnNonRooted OFF
        -> verify OFF
```

Do not leave the flag enabled while coding, while doing desktop testing, while waiting for user input, after a failure, or because another phone pass may happen later. If another pass is needed, repeat the full lifecycle.

## Deployment boundaries

- The Tampermonkey userscript is the primary deployment target.
- Publish a successfully tested authorized userscript edit.
- Browser-extension targets are changed only when the user explicitly requests extension work. Do not automatically synchronize, build, package, or publish them after a userscript-only change.

## Durable documentation classification

- Permanent operating rule: `WORKFLOW.md`
- Browser/device/tool/setup information: `ENVIRONMENT.md`
- Reusable testing method: `TESTING.md`
- Verified native Chaturbate behavior with the userscript disabled: `BEHAVIOR_BASELINES.md`
- Product/design decision: `DECISIONS.md`
- Reusable technical oddity/workaround: `KNOWN_QUIRKS.md`
- Current implemented/deployed truth: `CURRENT_STATE.md`
- Temporary logs, hypotheses, dead ends, and task chatter: do not persist

Do not update every file after every task. Never persist an assumption as verified fact.
