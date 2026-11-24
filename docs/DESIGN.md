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

## Accessibility checks still required

Keyboard-only walkthrough, visible and unobscured focus, screen-reader status announcements, 200% zoom, reflow at 320 CSS px, and computed contrast for interactive states must be tested in the implemented app. Design mockups and calculated token pairs are not a WCAG conformance claim.
