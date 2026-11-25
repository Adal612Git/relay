# Devpost submission package

**Relay by Lotos** is a Web / Chrome entry. The final local build completed real inference with the Chrome v4 Gemma 4 component and with Firebase cloud fallback. The public YouTube link, final evaluator preview and submission approval remain open. [Final release evidence](FINAL-RELEASE-REPORT.md)

[Evaluator preview](https://relay-by-lotos--rc1-2uvff4zh.web.app/) · [Public source on release/relay-rc1](https://github.com/Adal612Git/relay/tree/release/relay-rc1) · [English demo script](DEMO-SCRIPT.md) · [RC1 evidence](RELEASE-RC1-REPORT.md)

## Description for Devpost

### What it does

Relay by Lotos helps technical support and operations teams turn incident notes into a handoff that the next shift can act on. It separates the operator’s original notes from an editable sharing copy, flags sensitive identifiers, and requires explicit approval before that copy can be used for hybrid generation.

The handoff organizes four fields: observed impact, actions and results, open questions, and next step. Operators can edit and review the output before copying it. Relay preserves uncertainty so a temporary recovery or an untested hypothesis remains visible to the incoming shift.

### How we use Firebase AI Logic

Relay uses Firebase AI Logic in `ONLY_ON_DEVICE` mode for the private review in desktop Chrome. This step can run with an offline tab once the browser model is ready. The handoff uses `PREFER_ON_DEVICE` with the exact approved copy and falls back to Gemini 3.5 Flash-Lite when supported. Firebase App Check protects the cloud request, and the source badge reports the origin returned by the Firebase SDK.

### What we built during the submission period

We built the browser workspace, the human approval and redaction workflow, the hybrid Firebase integration, the editable four-field handoff, and the public evaluator build. We tested on-device and cloud inference with three synthetic incident scenarios and verified the approved payload and App Check enforcement.

## Evaluator instructions

1. Open the hosted preview in desktop Chrome. No sign-in is required. [Open Relay](https://relay-by-lotos--rc1-2uvff4zh.web.app/)
2. Select **Try A1** and **Analyze on this device**. The initial model download can take several minutes. Use **Prepare manually** if local analysis is unavailable.
3. Compare the original with **Sharing copy**, inspect the exclusions, and select **Approve this text**. Select **Generate handoff** and read the source badge.
4. Check all four fields, select **Review complete**, copy the handoff, and select **Clear incident**. Use **Try A2** to test conflicting observations and **Try A3** to test uncertain webhook delivery.
5. To reproduce the cloud fallback, use a browser without an available local model, prepare and approve the sharing copy, then generate the handoff. App Check remains active.

The hosted preview expires on December 24, 2026, after the judging period ends. Access is free within the Spark quota. Local installation, Firebase setup and the reproducible test commands are documented in the repository. [README](../README.md) · [Official judging dates](https://firebasehybridaihackathon.devpost.com/details/dates)

## Submission checklist

- [x] Public GitHub source, Apache 2.0 license, working hosted preview and evaluator instructions. [License](../LICENSE)
- [x] English description with the product workflow, Firebase AI Logic integration, value proposition and work completed during the submission period.
- [x] Technical evidence for device-only offline analysis, both hybrid sources, App Check, exact approved payloads and A1–A3. [Technical CI](https://github.com/Adal612Git/relay/actions/runs/45384128619) · [RC1 evidence](RELEASE-RC1-REPORT.md)
- [x] Confirm the v4 model generation in the recording browser. Chrome 158 reported `gemma4_component` version `2026.11.3.1140` in On-Device Internals. The same profile completed the final build’s offline Firebase analysis and generated a handoff with SDK metadata `ON_DEVICE`. [Final release evidence](FINAL-RELEASE-REPORT.md) · [Official rules, §6](https://firebasehybridaihackathon.devpost.com/rules)
- [ ] Verify cloud generation from a fresh evaluator browser at the public URL. The existing URL serves RC1. The final Hosting artifact is prepared for an authorized deployment. [Final release evidence](FINAL-RELEASE-REPORT.md)
- [ ] Record the real workflow in English or add English subtitles, keep the cut at or below three minutes, and paste its public YouTube link into Devpost. Check the video from a signed-out browser. [2:40 demo script](DEMO-SCRIPT.md)
- [ ] Confirm the entrant or team representation and disclose applicable pre-existing assets and third-party materials. Check the final form, video and screenshots for customer data, credentials and unpublished material.
- [ ] Obtain the owner’s submission approval, submit before November 30 at 14:00 PST / 16:00 Guadalajara, and save the confirmation with the final source link. [Official rules](https://firebasehybridaihackathon.devpost.com/rules) · [Official deadline](https://firebasehybridaihackathon.devpost.com/details/dates)
