# Security Considerations (Testing Phase)

The current dashboard runs with **frontend-only authentication**, meaning:

- **No server-side checks**: Any non-empty email/password is accepted and stored only in local storage (`interoplens.auth`).
- **No tokens or sessions**: Requests to the Control or Telemetry APIs are unauthenticated, and no Authorization headers are added.
- **Local persistence only**: The mock user profile (email, name, role) is stored in the browser without encryption or expiry.

## Risks to be aware of during testing
- Anyone who can access the running UI can sign in with any credentials and gain full dashboard access because there is no backend validation.
- Local storage entries are readable and modifiable by any script running in the page context; avoid loading untrusted third-party scripts while testing.
- There is no logout invalidation on the server (none exists), so clearing local storage or using the in-app logout is the only way to remove access.
- No rate limiting, brute-force protection, or password policies are enforced because authentication is mocked client-side.

## Operational safeguards
- Keep this build scoped to controlled testing environments only; do not expose it to the public Internet without restoring real authentication.
- When transitioning to production, replace the mock flow with real backend auth (TODO in `AuthContext`) and reintroduce token-based protections end-to-end.
