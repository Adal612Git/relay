# Architecture and data boundary

## Product flow

1. The operator pastes incident notes or loads a synthetic example.
2. `ONLY_ON_DEVICE` analyzes the original notes. It must never fall back to cloud.
3. Pattern checks and local suggestions prepare an editable sharing copy.
4. The operator reviews the complete copy and explicitly approves that exact version.
5. `PREFER_ON_DEVICE` receives only the approved snapshot. If the local model is unavailable, Firebase AI Logic may use its cloud fallback.
6. The response source is displayed only when the SDK reports it. The operator reviews four editable fields before copying.

## Trust boundary

- Original notes, local findings, exclusion matches, source-line references, and revision identifiers remain in browser memory.
- The hybrid adapter accepts one string: the immutable, human-approved sharing copy.
- The hybrid adapter must not import or read the original-notes store, DOM, local citations, or browser persistence.
- Editing the original or sharing copy invalidates downstream analysis and approval.
- A late response must be discarded if its request or revision is no longer current.
- No incident content is written to URLs, local storage, analytics, or application logs.
- Clearing the incident removes the current in-memory state. Reloading the page also clears it.

## Firebase integration

The web client uses the Firebase JavaScript SDK and the Gemini Developer API backend:

- `ONLY_ON_DEVICE` for analysis of original notes.
- `PREFER_ON_DEVICE` for the approved-copy handoff request.
- Firebase App Check with a web attestation provider is required before enabling a request that may reach the cloud.
- `inferenceSource` is used to label the source when present. Missing source metadata is shown as `Source unavailable`.

The implementation is a starter. A real browser test must verify the SDK version, model availability, App Check enforcement, and actual request body before any privacy claim is considered proven.

## State and retention

All incident state is held in React component state only. There is no database, server, account system, or persistence layer in this MVP. The operating system clipboard has its own retention behavior after the operator explicitly copies the final handoff.


## Approval and request lifecycle (MVP increment)

`IncidentSession` issues immutable approval objects registered in a module-private WeakMap. The hybrid adapter rejects plain strings/forged objects, revoked objects and known excluded markers. It checks validity both before SDK setup and after genuine App Check token retrieval. The only variable incident payload is the approved string. App Check client initialization alone is not proof of attestation; `getToken` must succeed before the hybrid model is created. Server enforcement remains an integration acceptance task.

Each request has a unique identity. Invalidation detaches the old request. Only the current identity can write results/errors/progress or clear busy state; manual preparation, case changes and clearing remain possible during initialization. A sent network request cannot be recalled, but its obsolete result cannot be applied.

Local findings remain advisory. The editable review copy is derived deterministically from original lines, with identifiers replaced in place and explicit exclusion lines omitted. This preserves incident facts that share a line with a contact or IP. Sensitive detection is heuristic, never proof of anonymization. Generated output receives structural and conservative fidelity checks; these cannot establish factual correctness or replace human verification. Structured claim citations remain pending.

Production code has no test-mode model or sample-handoff injection. SDK doubles exist only under Vitest. Playwright E2E uses the actual unconfigured manual product. A separate, explicit real-integration command contains no mocked responses and requires owner configuration.

## RC1 verification boundaries

The device-only model produces local review findings. Deterministic redaction prepares the editable copy from the original, preserving adjacent facts. Local model output cannot replace the source timeline. An invalid result leaves the operator with a rule-based draft and manual review.

The hybrid adapter warms the device model, obtains App Check attestation, and revalidates the revocable approval capability immediately before building the approved-only inference payload. The clipboard gate requires all four fields and a separate final human review. Firebase SDK request verification and browser storage assertions are described in the [release report](RELEASE-RC1-REPORT.md).

The [three JSON fixtures](../examples/) supply the UI samples, deterministic tests, live evaluation inputs and demonstration. Live tests compare actual output against recorded timestamps and fixture-specific forbidden claims.
