# Delivery roadmap

This roadmap condenses the Relay engineering dossier. Dates are planning targets in Guadalajara time, not proof of completion.

| Workstream | Scope | Exit evidence | Status at scaffold creation |
|---|---|---|---|
| B01 / F1 | Firebase proof: local-only response, cloud fallback, App Check, Chrome profile and device readiness. | Two fresh responses from the same build; offline local proof; approved-copy cloud proof; request-body inspection. | Not verified |
| B02–B03 / F2 | Privacy boundary, approval capability, revision invalidation, stale-response rejection. | Unit tests and request-boundary tests. | Starter code only |
| B04–B06 / F3 | A1–A3 fixtures, responsive one-view UI, manual recovery, four-field output. | Fidelity review and keyboard/320 px walkthrough. | A1 fixture and initial UI only |
| B07–B09 / F4 | Integrated tests, privacy inspection, source labels, failure recovery, evaluator access. | Test report with environment, build SHA, and real browser evidence. | Not started |
| F5 | Compare three manual handoffs with Relay. Measure time, completeness, exclusions, and next-step accuracy. | Results with sample size and method. | Not started |
| B10 / F6 | Clean checkout, lockfile, public license, English README, reproducible build. | Fresh installation and successful build from a clean session. | Scaffold being prepared |
| B11 | Record a real demo of local inference, approval, cloud fallback, and output review. | Public video, up to three minutes, English audio or subtitles. | Not started |
| B12 / F7 | Verify links, complete Devpost, submit, and confirm receipt. | Devpost submission confirmation and retained commit SHA. | Not started |

## Internal target sequence

- 23 Nov: input and local extraction.
- 24 Nov: human review, redaction, and approval invalidation.
- 25 Nov: hybrid generation using approved text only.
- 26 Nov: measure and correct three cases.
- 27 Nov: reproducible release candidate.
- 28 Nov: public demo video.
- 29 Nov, 18:00: internal submission target.
- 30 Nov, 16:00: official deadline recorded in the project planning document. Reconfirm the live Devpost deadline before submission.

A privacy leak or an invented factual claim blocks acceptance of the affected flow.
