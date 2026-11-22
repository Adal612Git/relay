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
