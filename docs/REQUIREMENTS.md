# Acceptance requirements

R01–R14 are P0 from the official Drive dossier; R15 is deferred P1. “Automated” below means deterministic checks, **not** a passed real Firebase acceptance test. See the [RC1 report](RELEASE-RC1-REPORT.md) for live-service evidence and the [historical engineering status](PROJECT-STATUS.md) for design sources.

| ID | Implemented behavior and associated test | Remaining acceptance evidence |
|---|---|---|
| R01 | A1/A2/A3 buttons, free English input, empty/size validation without truncation. `relay.test.ts`, `App.test.tsx`, `workflow.spec.ts`. | Human walkthrough of full size limits. |
| R02 | Real SDK `ONLY_ON_DEVICE`, user-initiated initialization; no hybrid model created on this path. `ai.test.ts` SDK doubles. | Passed live in Chrome 158, online then offline with the open tab and zero remote inference calls. |
| R03 | Manual preparation/output during a pending model request, offline, and after error. Component and browser tests. | Actual unsupported/context/download failures on target browser. |
| R04 | Unicode email, credential, IPv4/IPv6, phone and private marker detections; explicit exclusions, line navigation with emoji/CRLF; in-place removal preserves facts. Rule/component tests. | Structured source-linked AI claim citations and full marker review remain incomplete. Detector does not prove absence of sensitive data. |
| R05 | Explicit exact-copy capability, revocation and revalidation after attestation; only approved string serialized as variable incident payload. Session and SDK-double tests. | Passed for A1–A3 synthetic requests. Cloud request bodies carried the exact approved copy, and private analysis made no cloud inference calls. |
| R06 | Unique request identity, no duplicate request per revision, edits/case change/clear invalidate; old success/failure/finally cannot overwrite current work or busy state. Session/component race tests. | Target-device race walkthrough. |
| R07 | Four strict fields, conservative timestamp/certainty/missing-next-step checks; A1 chronology and A2/A3 source facts preserved by preparation. Rule/response tests. | Actual A1–A3 cloud output passed timestamp, excluded marker and forbidden-claim checks. Source citations and general semantic correctness still require human review. |
| R08 | Per-response SDK source mapping incl. unknown label. SDK-double tests. | Both inference sources verified on one hosted build. |
| R09 | Genuine App Check token required, strict malformed response rejection, editable draft retained on failure; generic UI errors do not echo SDK diagnostics. SDK/component tests. | Real App Check success with HTTP 200 and rejection without attestation with HTTP 401. Quota and network failures are covered with deterministic tests. |
| R10 | Four nonempty fields + review before copy or selectable fallback; actual clipboard and denial tested. Component/browser tests. | Target-device clipboard walkthrough. |
| R11 | Memory-only incident data, clear/reload empties state; manual workflow sends no external requests and stores no data. Browser tests. | Cloud tests verified that synthetic incident markers did not appear in URLs, storage or console output. |
| R12 | Lockfile, `npm ci`, build artifact, documented configuration and manual route without Firebase. CI and essential-file check. | Verified public HTTPS preview, real App Check and no linked billing. Preview expires after judging. |
| R13 | English labels, live status, focus navigation, keyboard activation, 320px reflow, automated axe scan. Browser tests. | Full keyboard and screen-reader walkthrough, 200% zoom and all states. |
| R14 | Public repository, Apache-2.0, SDK calls, reproducible build and CI. | Live service verified. Recording, public English video and final Devpost entry remain publication steps. |
| R15 | Deferred P1 Spanish UI and equivalent local/cloud fidelity. | Not implemented. |

The expected A1 handoff in `examples/a1.json` is a rubric, not a real inference result and is not imported by the production AI adapter.
