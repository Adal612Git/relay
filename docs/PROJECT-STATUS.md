# Project status snapshot

## Confirmed from the project dossier

- Product: Relay, an incident-handoff workspace for support and operations teams.
- Target: Web / Chrome.
- Planned stack: React, TypeScript, Vite, Firebase AI Logic, Gemini Developer API, and App Check.
- Required boundary: original notes stay on-device; only the exact human-approved sharing copy may enter the hybrid request.
- Output: Observed impact, Actions and results, Open questions, and Next step.
- Examples: three fictional incidents are planned; A1 is the only fixture included in this starter.

## Reported but not independently verified here

The dossier records a direct Chrome Prompt API test on the owner's Lenovo device. That report is not evidence that the Relay app is integrated, that Firebase local inference works in the deployed build, or that cloud fallback and App Check are correctly configured.

## Not yet verified

- Firebase project and web-app configuration.
- App Check provider registration and enforcement.
- Fresh `ONLY_ON_DEVICE` response from the Relay build while offline.
- Fresh `PREFER_ON_DEVICE` response from an approved copy with local inference unavailable.
- Actual request body and absence of original notes/private markers.
- `inferenceSource` values in both routes.
- A1–A3 fidelity, stale-response rejection, 320 px behavior, keyboard and screen-reader checks.
- Clean checkout, dependency lockfile, public demo, and Devpost receipt.
