# Relay

**Turn on-call notes into clear incident handoffs with hybrid AI. Review exactly what may leave the device.**

Relay is a browser-based incident workspace for technical support and operations teams. It helps an outgoing operator preserve the timeline, distinguish facts from hypotheses, remove information from a sharing copy, and prepare a concise handoff for the next shift.

> **Project status: tested MVP increment.** Manual review and automated privacy/concurrency checks are implemented. Real Firebase inference, App Check enforcement and offline Chrome inference remain blocked pending owner configuration. See [engineering evidence and blockers](docs/PROJECT-STATUS.md).

## Why Relay

Support notes often mix observations, actions, hypotheses, identifiers, and temporary recoveries. The next shift can mistake a short-lived recovery for a fix. Relay keeps the original visible while the operator reviews a separate copy and approves the exact text that may enter the hybrid AI path.

## The workflow

1. **Original notes:** paste an incident or load the synthetic A1, A2 or A3 fixture. The original stays in the current browser session.
2. **On-device analysis:** use Firebase AI Logic with `ONLY_ON_DEVICE`. This path must not fall back to cloud.
3. **Human review:** inspect and edit a separate sharing copy. Pattern matches are suggestions, not proof that all sensitive data has been found.
4. **Explicit approval:** approve the exact visible copy. Any edit invalidates that approval.
5. **Hybrid handoff:** use `PREFER_ON_DEVICE` with the approved copy as the only incident payload. If the local model is unavailable, the SDK may use its cloud fallback.
6. **Final review:** inspect the four fields, preserve uncertainty, confirm review, and copy the handoff.

## Data boundary

```mermaid
flowchart LR
  A[Original notes] -->|ONLY_ON_DEVICE| B[Local analysis]
  B --> C[Editable sharing copy]
  C --> D{Human approval}
  D -->|Approved snapshot only| E[PREFER_ON_DEVICE]
  E -->|Local| F[Handoff]
  E -->|Cloud fallback| G[Firebase AI Logic]
  G --> F
```

The hybrid adapter accepts only a revocable approval capability containing the immutable reviewed string. It must never receive the original-notes store, private citations, or browser history. Relay does not intentionally persist incident content in local storage, URLs, analytics, or application logs. See [Architecture](docs/ARCHITECTURE.md) and [Requirements](docs/REQUIREMENTS.md).

## Tech stack

- React + TypeScript + Vite.
- Firebase JavaScript SDK (`firebase/ai`).
- Gemini Developer API backend through Firebase AI Logic.
- `ONLY_ON_DEVICE` for original-note analysis.
- `PREFER_ON_DEVICE` for the approved-copy handoff request.
- Firebase App Check with a web attestation provider before enabling cloud-capable generation.

## Run locally

Requirements: Node.js 20.19+ and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The sample and manual review flow can be explored without Firebase configuration. AI actions require a Firebase web app configuration. Hybrid generation additionally requires App Check configuration.

### Firebase configuration

1. Create or select a Firebase project and register a web app.
2. Enable Firebase AI Logic with the Gemini Developer API backend.
3. Configure a web App Check provider for the deployment domain (reCAPTCHA Enterprise is used by this starter).
4. Add the public web-app configuration and public reCAPTCHA site key to `.env.local` using `.env.example` as a guide.
5. Enforce App Check for Firebase AI Logic after verifying the app registration and provider.

The `VITE_*` values are browser-visible configuration, not a place for private secrets. Never commit service-account credentials, private keys, debug tokens, or `.env.local`.

## Commands

```bash
npm run dev       # local development server
npm run typecheck # TypeScript checks
npm test          # unit tests
npm run build     # production build
npm run preview   # preview the production build
npm run format:check # formatting (no separate lint rule set is configured)
npm run check:files # essential files, license, exact dependency pins
npm run test:e2e  # Chromium UI, manual path, clipboard and accessibility
npm run test:integration # opt-in real Firebase; exits 2 if configuration missing
```

The browser suite needs `npx playwright install --with-deps chromium` once. `npm test` runs deterministic rule, component and SDK-double tests. It never claims model inference. `npm run test:integration` reads the four required public values from the **process environment**, uses genuine App Check on registered localhost and reports the actual response source; it has no debug token or mocked result. Never commit private credentials.

GitHub Actions runs Quality, Unit Tests, Build and Browser Tests on PRs against main, pushes to main and manual dispatch. Reports and the production bundle are downloadable artifacts.

## Browser and model requirements

The on-device path depends on Chrome desktop support for the Prompt API and a compatible downloaded model. The Firebase hybrid web guide currently documents Chrome desktop 139+ with the required flags enabled. The first model download can take several minutes. Verify the actual browser version, model availability, device capability, and inference source during the real test; never infer them from a UI mockup.

## Example

`examples/a1.json` contains fictional incident notes with a temporary recovery:

- Search timed out at 10:02.
- Worker restarted at 10:05.
- Search first succeeded at 10:10.
- Search timed out again at 10:18.
- A morning configuration change is suspected but has not been checked.

The expected handoff keeps the recovery temporary and the cause unconfirmed. The email and scratch marker are fictional test values.

## Delivery checklist

- [ ] Verify local-only inference while the browser tab is offline.
- [ ] Verify cloud fallback from a fresh approved copy with App Check enforced.
- [ ] Inspect the real request body and prove that original notes and excluded markers are absent.
- [ ] Verify source labels from SDK response metadata.
- [ ] Complete A1–A3 fidelity and failure tests.
- [ ] Run a clean install and production build.
- [ ] Publish a short English demo video and complete the Devpost submission.

See [Roadmap](docs/ROADMAP.md) for workstreams and target dates.

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
