# Relay by Lotos · Release Candidate 1

**NO-GO for hackathon submission. GO for local manual rehearsal.** The release candidate is integrated and the deterministic checks passed. Firebase inference, server-side App Check and live cloud privacy evidence require a configured Firebase web app.

| Item | Evidence |
| --- | --- |
| Branch | [release/relay-rc1](https://github.com/Adal612Git/relay/tree/release/relay-rc1) |
| Integrated application SHA | [41a0d104b078dd3d55e68c74e794e165c23c4b37](https://github.com/Adal612Git/relay/commit/41a0d104b078dd3d55e68c74e794e165c23c4b37) |
| Exact current RC1 head and CI | [PR #7 commits](https://github.com/Adal612Git/relay/pull/7/commits) · [final-head checks](https://github.com/Adal612Git/relay/pull/7/checks) |
| Integrated application CI | [Run 45379266246](https://github.com/Adal612Git/relay/actions/runs/45379266246). Quality, Unit Tests, Build and Browser Tests all passed on Ubuntu 24.04. |
| Local production preview | [http://localhost:4174](http://localhost:4174) |
| Public repository and license | [GitHub](https://github.com/Adal612Git/relay) · [Apache 2.0](../LICENSE) |

## Integration and files

- [PR #1](https://github.com/Adal612Git/relay/pull/1) supplies the RC1 base at `12926af`, including its reproducible lockfile, CI, revocable approval and request isolation.
- [PR #3](https://github.com/Adal612Git/relay/pull/3) supplies the boundary tests. RC1 corrects the mixed-line expectation to retain the incident event.
- [PR #4](https://github.com/Adal612Git/relay/pull/4) supplies the adversarial privacy tests. RC1 extends redaction and adds credential, IPv6, Unicode and exclusion regressions.
- [PR #5](https://github.com/Adal612Git/relay/pull/5) supplies the A2/A3 fixtures and integrity tests. RC1 uses one fixture source for all scenarios and checks forbidden claims against actual outputs in the real-service suite.
- [PR #6](https://github.com/Adal612Git/relay/pull/6) supplies the review and narrow-viewport improvements, adapted to preserve PR #1's request isolation.
- The complete [file and commit diff](https://github.com/Adal612Git/relay/pull/7/files) covers application and styling in `src/`, canonical scenarios in `examples/`, unit and Playwright tests in `src/` and `tests/`, Vite and Playwright configuration, the lockfile and workflow from PR #1, plus the README and release documents.
- Local changes were protected by creating a separate worktree at `C:\Users\Rick\Documents\LotosTechnologies\RelayByLotos-rc1`. The original checkout retained its six tracked edits and five untracked files.

## Acceptance evidence

| Check | Result |
| --- | --- |
| Clean dependencies, format, essential files, TypeScript and production build | **PASS.** `npm ci` installed 258 packages. Quality and Build completed on the integrated application SHA. |
| Unit, component and SDK adapter | **PASS.** 79 executed, 79 passed, 0 failed across 7 files. Includes revocation, races, invalid responses, recovery, boundaries and fixture integrity. [Unit artifacts](https://github.com/Adal612Git/relay/actions/runs/45379266246) |
| Chromium workflow | **PASS.** 3 executed, 3 passed, 0 failed in CI. Includes 320 px, keyboard and axe, real OS clipboard, denied clipboard recovery, manual operation offline and storage checks. [Browser artifacts](https://github.com/Adal612Git/relay/actions/runs/45379266246) |
| Regression cycle | Baseline recorded four targeted test failures. PR #3 expected discarded facts, and PR #4 reproduced three missing detections. The integrated tests pass. The Windows clipboard check now accepts native CRLF line breaks. |
| Secrets and dependencies | GitHub secret-scanning API returned zero alerts for the repository. `npm audit --audit-level=high` reported zero known vulnerabilities at verification time. |
| Real Firebase, including A1–A3 | **BLOCKED.** `npm run test:integration` exited 2 in preflight. No Firebase cases ran, so the live tally is 0 executed, 0 passed, 0 failed. |
| Real local model and offline inference | **BLOCKED.** Chrome desktop 158.0.8127.88 is installed. The integrated Firebase test needs the web app configuration before it can verify model initialization, metadata and offline inference. |
| Real hybrid and server App Check | **BLOCKED.** Need a working Firebase app and genuine reCAPTCHA Enterprise attestation. The integration tests require a successful cloud response with attestation and a server rejection without it. |
| Incident data in network and storage | **PASS** for the manual browser workflow and deterministic adapter boundary. **BLOCKED** for a real Firebase run. The opt-in suite tests the actual approved request, excluded markers and absence of inference traffic from private offline analysis. |
| Public judge access and submission | **BLOCKED.** A Firebase-enabled staging deployment and its testing URL are required. Publication and Devpost submission remain release steps. |

Pattern detection covers known representations and can miss context-sensitive identifiers. Mandatory review remains the release gate for sharing. Structured responses and timestamp checks reduce some factual errors. Operators still verify all four fields.

## Re-run and record

From the RC1 worktree:

```sh
npm ci
npm run format:check
npm run check:files
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:integration
npm run preview -- --host localhost --port 4174 --strictPort
```

The Relay Git history and repository configuration contained no usable web configuration, and the Firebase CLI reported that it had no authenticated session. The remaining setup is a Firebase web app with the Gemini Developer API enabled, public web configuration, and a reCAPTCHA Enterprise key for an authorized test origin with App Check enforced for Firebase AI Logic. Add the public values to the ignored `.env.local` and rebuild, or provide the approved staging URL for the live tests. [Firebase setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started) · [App Check setup](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider)

Open the local preview, choose **Try A1**, and follow the [English 2:40 demo script](DEMO-SCRIPT.md). For an immediate rehearsal use **Prepare manually**, review the exclusions and enter the A1 handoff. Record the AI scenes after confirming the actual source and validating the corresponding integration gate.
