# Engineering status — 2026-11-22

> Historical MVP snapshot. For the verified hosted release and current Firebase results, see the [RC1 release report](RELEASE-RC1-REPORT.md).

This branch implements an independently testable MVP increment. It is **not** a completed hackathon submission or evidence of real Gemini inference.

## Implemented

- Reproducible exact dependency versions and npm lockfile; compatible Vite/Vitest types.
- Session approval capabilities checked at the adapter boundary, before SDK initialization and again after asynchronous App Check token retrieval.
- Explicit approval is revoked by editing input, sharing copy, handoff, switching cases, preparing manually or clearing. A stale response cannot finish a newer request, overwrite fields, restore cleared content or unlock copy.
- Manual path available during model initialization and offline; four editable output fields, confirmation, clipboard and selectable fallback.
- Synthetic A1–A3; line-based exclusions, explicit A3 exclusions, in-place redaction that retains facts sharing a line with an identifier, navigation back to original lines.
- Independent local/hybrid model initialization; strict four-field response parsing, bounded response size, timestamp preservation and conservative certainty checks. Local findings are advisory; the review copy is derived from the original to avoid silently accepting a rewritten timeline.
- Real App Check `getToken` prerequisite. No debug-token path, original-note cloud fallback, testing switch or fake production model.
- Four-job CI: quality, unit/component/SDK doubles, production build and Chromium manual E2E. Reports/build artifacts retained seven days. PR updates and pushes to main run CI; branch pushes do not duplicate the PR run.

## GitHub Actions evidence

First run: [45060135078](https://github.com/Adal612Git/relay/actions/runs/45060135078), head `0b2cfae0918a3c997e2cfc201980c8f0aea87ec6`.

Quality, Unit Tests and Build passed. Browser Tests failed **before running tests** because `ubuntu-latest` selected Ubuntu 26.04, unsupported by pinned Playwright 1.56.1. The workflow now pins Ubuntu 24.04 for a supported, repeatable runner. This failure is retained as evidence; final verification must use the subsequent run on the latest PR head.

## Observed local results

TypeScript, production build, essential-file checks, 47 unit/component tests and 3 Chromium E2E tests passed. A fresh `npm ci` followed by production build and browser tests also passed. The final exact test count and GitHub-hosted result are recorded in the Pull Request checks and execution evidence comment; local success does not imply remote CI success.

The browser suite verifies an actual clipboard write, denied-clipboard fallback, offline manual work, empty state after reload, no external requests during manual work, empty browser storage, keyboard activation, no horizontal overflow at 320 CSS px and an automated axe scan. These are targeted checks, not full WCAG certification.

## Dependency review

The first GitHub clean install reported seven dependency advisories. Vitest was updated to 4.1.12 (compatible with Vite 6 and Node 20); the transitive `@grpc/grpc-js` dependency was pinned to 1.14.7 via npm override rather than downgrading Firebase and losing the hybrid API. The Playwright core override keeps axe and the browser runner on the same tested types. A subsequent `npm audit --json` reported **0 vulnerabilities**. All 47 unit/component tests, three browser tests, TypeScript and build passed after these dependency changes. This is a point-in-time package audit, not a security certification.

## Real integration — BLOCKED

`npm run test:integration` exited **2 / BLOCKED** because the four required Firebase public configuration variables are absent. It sent no request. Integration is an explicitly opt-in real-service Playwright test; it is excluded from deterministic CI, never replaced with a successful dummy test, and fails if the actual generation or response-source assertion fails.

The owner must supply public web app identifiers and the public Enterprise site key, register the test/deployment domain, enable Firebase AI Logic and enforce App Check in Firebase. Values belong in local environment configuration, never private credentials in the repository. See `.env.example` and `tests/integration/firebase.spec.ts`.

Separately pending: local-only fresh generation offline on the Lenovo/compatible Chrome, real ON_DEVICE and IN_CLOUD evidence from the same build, real request-body inspection, server enforcement/invalid-attestation evidence, quotas and domain access from a clean evaluator profile. A GitHub runner's Chromium UI test does not establish any of these.

## Documentary sources and discrepancy

Read through the Drive connector on 2026-11-22:

- [Official dossier](https://drive.google.com/file/d/1VqvbjNgs6967ul1RSKzlusITPtwVwjh3/view): R01–R14, T01–T14, synthetic A1–A3, local/hybrid boundary and acceptance criteria.
- [Specified approved design folder](https://drive.google.com/drive/folders/13ZjUqqwf1UvBilmqqXsptxd8H0of6d-6): contains **Relay · Atlas de interfaz · Blanco e índigo.pdf** (white/indigo).
- The repository's `docs/DESIGN.md` and current CSS specify **Jade editorial**. The dossier folder also contains a Jade final-art folder. This is an unresolved design-source conflict. This increment retains the existing CSS colors/layout and makes no claim of final visual acceptance.
- The dossier's A1 begins with the 10:18 recurrence before describing earlier events; the starter fixture is chronologically ordered. Both are synthetic variants with the same facts. No claim of verbatim fixture identity is made. Source-order fidelity with actual inference remains pending.

## Next priority

Configure Firebase and a compatible Chrome profile, then collect T02/T08/T09 evidence with synthetic data. Complete source-linked factual citations and human review of A1–A3 before treating R04/R07 as closed. Deployment, video, Devpost form and receipt remain owner-facing acceptance tasks. `main` must not be merged without approval.
