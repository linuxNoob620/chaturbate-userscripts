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

## Native-behavior acceptance criteria

Before editing for any behavior-restoration or parity task:

1. Capture the live site behavior with the userscript disabled in the relevant browser/device.
2. Record the observable behavior and define explicit acceptance criteria from that baseline, not from assumptions or the current implementation.
3. Enable the actual userscript and repeat the same interaction sequence to identify differences before implementation.
4. After authorized implementation, repeat that same sequence and compare each acceptance criterion against the baseline.

Do not change the acceptance criteria after editing merely to accommodate different implementation behavior. A plausible cause, successful API call, fullscreen entry, or one passing interaction is not proof of native parity.

For mobile fullscreen/video work, use the real phone, Quetta, and the actual userscript. Check, where applicable: room entry and automatic fullscreen behavior; fullscreen entry; portrait and landscape layout; sizing and aspect ratio; zoom, pan, pinch and other touch gestures; rotation; controls visibility and behavior; exit and return to page state; re-entry and repeated cycles; and whether script CSS/JS still interferes with fullscreen. Record any genuinely inapplicable item and why.

Changes to fullscreen, video sizing, object-fit, dimensions, transforms, orientation, viewport units, gesture handlers, or mobile-player/fullscreen CSS require targeted normal-room regression testing and separate Workshop-preview testing when shared or related code is affected. Passing one does not establish parity for the other.

If a criterion fails, report `not fixed`. If an important criterion remains untested, report `partially verified` and identify the gap. Do not describe the requested behavior as `fixed`, `restored`, `native parity`, or `verified` unless the relevant baseline comparison is complete and all acceptance criteria pass.

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
