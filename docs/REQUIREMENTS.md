# Acceptance requirements

The product dossier defines R01–R14 as the P0 submission requirements and R15 as a P1 Spanish-language extension. The rows below are a concise implementation checklist, not evidence that the requirements have passed.

| ID | Acceptance target | Current evidence |
|---|---|---|
| R01 | Load a synthetic case or paste valid English notes; reject empty or oversized input without truncating it. | Starter validation only |
| R02 | Analyze original notes with `ONLY_ON_DEVICE`; verify a new response while the browser tab is offline. | SDK adapter present; real test pending |
| R03 | Manual review remains available when the local model is unavailable, downloading, or over context. | Manual draft path present; browser test pending |
| R04 | Show candidate exclusions and keep source notes available for human review. | Basic pattern checks present; coverage incomplete |
| R05 | Only an explicit approval of the exact visible copy enables hybrid generation. | Basic approval snapshot present; request inspection pending |
| R06 | Editing notes or the sharing copy invalidates approval and stale results. | Basic invalidation present; race-condition tests pending |
| R07 | Produce four fields while preserving chronology, uncertainty, and conflicting reports. | Prompt and A1 fixture present; fidelity tests pending |
| R08 | Display `ON_DEVICE`, `IN_CLOUD`, or `Source unavailable` from response metadata. | Source mapping present; real model tests pending |
| R09 | App Check, network, quota, format, and service errors preserve editable work. | Basic error handling present; failure tests pending |
| R10 | Copy only after all four fields are reviewed; provide selectable text if clipboard access fails. | Basic review and fallback present |
| R11 | Do not persist incident content or log it; clear it from the current session. | No persistence code; audit pending |
| R12 | Evaluator can open the app without an account and follow free, reproducible instructions. | Documentation scaffold only |
| R13 | English UI, keyboard order, visible focus, responsive 320 px layout, and announced state changes. | Initial UI only; accessibility audit pending |
| R14 | Public repository, recognized open-source license, reproducible instructions, fictitious examples, Firebase AI Logic call, public video, and completed Devpost form. | Repository scaffold; submission evidence pending |
| R15 | Spanish UI and equivalent fidelity across both inference paths. | Deferred P1 |

## Core synthetic case A1

- 10:02: search timed out.
- 10:05: worker restarted.
- 10:10: first successful search.
- 10:18: search timed out again.
- A morning configuration change is suspected but not checked.
- The recovery is temporary, not a resolution.
- The next shift compares worker errors at 10:02 and 10:18 with the change record.

The expected handoff is in [`../examples/a1.json`](../examples/a1.json). The sample contact and scratch marker are fictional test values.
