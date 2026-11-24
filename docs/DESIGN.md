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
