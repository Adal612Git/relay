# Security policy

## Scope

Relay is an early-stage browser application for preparing incident handoffs. The MVP is designed to keep original incident notes in transient browser memory and to send only a human-approved sharing copy through the hybrid AI path.

## Do not submit

- Customer or employee personal information.
- Production incident notes or real support tickets.
- API secrets, service-account keys, debug tokens, passwords, or private credentials.
- Screenshots or logs containing personal or confidential data.

Use only the fictional fixtures in `examples/` when reporting issues or demonstrating the app.

## Reporting

Do not publish sensitive details in a public issue. Contact the repository maintainer privately through the GitHub profile associated with this repository and include a minimal, synthetic reproduction.

## Current limitations

The current scaffold is not a security certification. Pattern checks can miss sensitive information. Human review remains mandatory, and the Firebase request boundary must be verified with browser/network evidence before relying on it for real incidents.
