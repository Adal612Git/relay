# Relay by Lotos demo · 2 minutes 40 seconds

## Before recording

Open the [free Relay preview](https://relay-by-lotos--rc1-2uvff4zh.web.app/) or [Relay locally](http://localhost:4174/) in desktop Chrome. Use **Try A1**, the synthetic search incident in [the canonical fixture](../examples/a1.json). Clear the incident before the take. Use a clean browser window and keep the workspace in frame.

Run the real Firebase integration checks from the README before recording the AI segments. Preload Chrome's model once, clear the rehearsal incident, and keep the browser open for the take. Only describe the source indicated by the actual handoff. The [release report](RELEASE-RC1-REPORT.md) tracks which scenes still need verification.

| Time | On screen and narration |
| --- | --- |
| 0:00–0:19 | Open Relay. “At shift change, the next operator needs the incident timeline and the next action. Raw notes mix facts with private identifiers, and a short recovery can look like a fix. Relay helps teams hand over the facts with a clear approval step.” |
| 0:19–0:40 | Click **Try A1**. “This is a fictional search incident. Search timed out at 10:02. A worker restart was followed by one success, then another timeout at 10:18. The morning configuration change is still a hypothesis.” |
| 0:40–1:03 | Click **Analyze on this device**. Wait for the genuine on-device completion status before speaking. “Firebase AI Logic analyzes the original with its device-only mode. The original is kept in this tab for the session. The sharing copy preserves the timeline and removes the synthetic contact and scratch tag.” |
| 1:03–1:29 | Point to **Excluded from sharing copy** and click a line reference. Review the editable copy. “I can trace a removal back to its original line and review the text myself. I’m keeping the second timeout and the uncertainty about the cause. Only this exact copy is authorized when I click Approve.” |
| 1:29–1:54 | Click **Approve this text**, then **Generate handoff**. Wait for the actual source badge. “Firebase AI Logic prefers the on-device model for the approved copy. It can use the cloud when the local model is unavailable. This run was generated [on this device / in the cloud].” Read only the displayed source. |
| 1:54–2:22 | Read the four fields. If needed, edit **Open questions** to keep the cause unconfirmed. “The incoming operator gets observed impact, actions and results, open questions, and a next step. Here, the recovery was temporary, and the next shift will compare both timeout windows with the change record.” |
| 2:22–2:40 | Click **Review complete**, **Copy handoff**, then **Clear incident**. “A human confirms the handoff before copying. Relay gives support teams a clear, actionable shift change while keeping control of which notes may leave the device.” |

## Recording gate

If an AI step is blocked, rehearse using **Prepare manually** and type the four fields from the A1 fixture. Identify that take as a manual workflow rehearsal. Return to the verified hosted preview for the AI segments after resolving the browser or network error.

For a cloud fallback insert, use the attested staging origin or isolated test app from the README in a Chromium session without a local model. Use the same A1 fixture and show the real cloud badge. Trim model wait time in editing while preserving the actual action and result. The public submission video should remain under three minutes. [Devpost rules](https://firebasehybridaihackathon.devpost.com/rules)
