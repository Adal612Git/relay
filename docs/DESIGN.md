# Design direction

The latest Codex design guide selects **Jade editorial** as the working direction: graphite-blue background, flat elevated surfaces, calm reading rhythm, jade for the primary action, violet for source/focus, amber for pending review, and terracotta/red for errors.

The design guide records this direction as awaiting the product owner's complete walkthrough. Treat the tokens as the current implementation reference, not final visual acceptance.

## Responsive behavior

- Maximum content width is 1264 px.
- The original and sharing editors align in two columns with a 16 px gap. The handoff fields form a two-by-two grid on desktop.
- One column below 960 px, preserving DOM and keyboard order.
- At 320 px: 16 px outer margin, 13 px panel padding, full-width fields, vertical scrolling, no horizontal overflow.
- Primary controls are at least 44 px high.
- Text remains readable without relying on color alone.

## Accessibility verification

The implemented workspace passed automated keyboard and focus checks plus axe sweeps at 320, 768 and 1440 CSS px. A full screen-reader and 200% zoom walkthrough remains useful for a broader accessibility evaluation. [RC1 evidence](RELEASE-RC1-REPORT.md)

## Editorial foundation (visual campaign)

Preserve the RC1 dark Jade editorial palette; do not introduce a second theme during integration. Use flat surfaces and a single functional accent hierarchy. The brand mark is flat, panels have 8 px corners, controls and status labels 6 px corners. Avoid gradients, decorative shadows and pill-shaped status labels. Use local system UI and monospace fonts; no external font requests.

Foundation owns root variables, brand treatment and shared radius tokens. Workspace owns layout and spacing; controls owns interaction-specific styling. Keep selectors, DOM order and functional state labels unchanged. Use jade for primary actions and local/approved states, violet for cloud/source and focus, amber for pending review, red for errors. Do not communicate state by color alone.

Static WCAG contrast calculations for selected token pairs (not a browser audit):

| Pair | Ratio |
| --- | ---: |
| text / surface | 13.62:1 |
| muted / surface | 8.21:1 |
| ink / jade | 9.76:1 |
| violet / violetSurface | 8.18:1 |
| amber / amberSurface | 8.48:1 |
| danger / dangerSurface | 7.77:1 |
| border / input | 3.63:1 |
| focus / surface | 8.50:1 |

Acceptance: preserve 44 px primary targets, visible keyboard focus, no horizontal overflow at 320 px, readable 200% zoom, offline fonts, unchanged privacy and approval behavior. Require fresh CI and browser review before visual acceptance.
