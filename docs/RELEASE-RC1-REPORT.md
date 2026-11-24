# Relay by Lotos · Release Candidate 1

**GO for the technical release and demo recording.** The hosted preview runs Firebase AI Logic on the no-cost Spark plan. Record the English demo and attach the public YouTube link before submitting the Devpost entry.

| Item | Evidence |
| --- | --- |
| Release branch and exact head | [release/relay-rc1](https://github.com/Adal612Git/relay/tree/release/relay-rc1) · [PR #7 commits](https://github.com/Adal612Git/relay/pull/7/commits) |
| CI on release head | [PR #7 checks](https://github.com/Adal612Git/relay/pull/7/checks) |
| Free evaluator preview | [Relay RC1 on Firebase Hosting](https://relay-by-lotos--rc1-2uvff4zh.web.app/) · Hosting version `2d3e9ae95b5d8e4a` · expires December 24, 2026 at 05:24 Guadalajara time. |
| Local preview | [http://localhost:4174/](http://localhost:4174/) |
| Repository and license | [Public GitHub repository](https://github.com/Adal612Git/relay) · [Apache 2.0](../LICENSE) |

## Integration and files

- [PR #1](https://github.com/Adal612Git/relay/pull/1) supplies the base at `12926af`, including the lockfile, four-job CI, revocable approval and request isolation.
- [PR #3](https://github.com/Adal612Git/relay/pull/3) supplies boundary tests. RC1 preserves incident facts on lines with redacted identifiers.
- [PR #4](https://github.com/Adal612Git/relay/pull/4) supplies adversarial privacy tests. RC1 adds credential, IPv6, Unicode and exclusion coverage.
- [PR #5](https://github.com/Adal612Git/relay/pull/5) supplies the A2/A3 fixtures and integrity tests. The canonical fixtures now drive the product, tests and demo. The live suite checks forbidden claims against model responses.
- [PR #6](https://github.com/Adal612Git/relay/pull/6) supplies review and narrow-viewport improvements, adapted to preserve request isolation.
- `41a0d10` integrates the fixes and `dee1224` adds the first RC1 report and test gates. `f122efe` pins the stable Gemini fallback, configures Hosting, and records the verified Firebase release. The current interface refresh clarifies the original, sharing copy and handoff, including the review state and the actual inference source. [Full file diff](https://github.com/Adal612Git/relay/pull/7/files) · [Commit history](https://github.com/Adal612Git/relay/pull/7/commits)
- The original local checkout retained its six tracked edits and five untracked files. Work took place in the separate `C:\Users\Rick\Documents\LotosTechnologies\RelayByLotos-rc1` worktree.

## Results

| Check | Result |
| --- | --- |
| Clean install, formatting, essential files, TypeScript and production build | **PASS.** The hosted build was compiled in staging mode. The local build was compiled with the localhost app registration. |
| Unit and component tests, including SDK adapter doubles | **PASS.** 79 passed, 0 failed, across 7 files. Covers limits, concurrency, revocation, invalid JSON, privacy and recovery. |
| Chromium workflow | **PASS.** 3 passed, 0 failed. Includes keyboard, axe at 320 px, real clipboard, clipboard denial and the offline manual workflow. |
| Firebase AI Logic private analysis | **PASS.** Chrome 158 on Windows initialized Gemini Nano, analyzed A1 online, then performed a second analysis with the open tab offline. Zero cloud inference requests and zero requests containing the synthetic private markers. |
| Hybrid inference on device | **PASS.** Chrome generated the approved A1 handoff with `PREFER_ON_DEVICE`. The SDK reported `ON_DEVICE` and the browser made zero cloud inference calls during the tested workflow. |
| Hybrid cloud fallback and A1–A3 fidelity | **PASS.** All three canonical cases generated live responses with Gemini 3.5 Flash-Lite and SDK metadata `IN_CLOUD`. Assertions verified four fields, the recorded timestamps and the absence of each fixture's forbidden claims and excluded markers. Operators still review factual meaning. |
| App Check | **PASS.** The hosted app uses a score-based Enterprise key restricted to the preview domain and server enforcement is active. The approved synthetic request succeeded with HTTP 200, and the same request without attestation received HTTP 401. |
| Live privacy | **PASS for tested synthetic inputs.** Only the exact approved copy appeared as the variable incident payload. The approved requests contained no excluded markers or original-note block. The suite checked the browser URL, Web Storage, IndexedDB and console for incident content. |
| Real integration | **PASS.** 4 passed, 0 failed in the final live suite. An earlier A1 attempt stopped at authorization before a generation request. An independent real run then confirmed HTTP 200 with App Check and HTTP 401 without it. |
| Secrets and dependencies | Public configuration is in ignored local env files. No App Check debug token is used. GitHub secret-scanning returned zero alerts after the authenticated rollout, and the dependency audit reported zero known vulnerabilities. |
| Evaluator access | **PASS.** The preview works in a fresh browser without an account and expires after Devpost judging ends on December 16. Firebase billing is disabled. [Official Devpost dates](https://firebasehybridaihackathon.devpost.com/details/dates) |

Pattern-based detection can miss context-sensitive identifiers. Human approval is required at the sharing boundary, and separate final review is required before copying. The deployed or local page must be open for offline analysis. The browser may need to download its model before the first inference. Spark usage remains subject to the service quota. [Firebase pricing](https://firebase.google.com/docs/ai-logic/pricing?api=dev)

## Reproduce and record

```powershell
npm ci
npm run format:check
npm run check:files
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
$env:RELAY_INTEGRATION_BASE_URL = 'https://relay-by-lotos--rc1-2uvff4zh.web.app'
$env:RELAY_CHROME_TEST_PROFILE = Join-Path $env:TEMP 'relay-rc1-chrome-profile'
npm run test:integration
```

For a local production preview with the localhost registration, run `npm run build` and `npm run preview -- --host localhost --port 4174 --strictPort`. The hosted build uses `.env.staging.local`, prepared from its separate Firebase web app. To redeploy the same channel after validation, run `npm run build -- --mode staging` and `npx firebase-tools hosting:channel:deploy rc1 --expires 30d --project relay-by-lotos`.

Open the QA URL in desktop Chrome, preload the device model, clear the rehearsal incident, and follow the [English 2:40 script](DEMO-SCRIPT.md). Record the badge that appears during generation. Obtain a cloud clip with a browser without a local model if desired. A public YouTube demo and final submission approval remain the publication steps. [Devpost rules](https://firebasehybridaihackathon.devpost.com/rules)
