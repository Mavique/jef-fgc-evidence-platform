# merSETA FGC for EKM Access Architecture

This frontend sprint adds the access layer requested in the master development prompt without claiming that production authentication is complete.

## Implemented Frontend Contract

- Public FGC access routes now exist under `/fgc-ekm/...` for sign-up, sign-in, email confirmation, password recovery, access pending, privacy, accessibility and help.
- Secure-route placeholders now resolve for role-aware home, account, affiliations, tasks, data capture, college views, workshop operations, assessment queues, national observatory and administration.
- The model separates identity creation, email verification, affiliation approval and role activation.
- Pending users are routed to `/fgc-ekm/access-pending` and do not receive protected dashboard access in the demo logic.
- Active users resolve to role-appropriate home routes based on approved role assignments.
- The public website menu exposes only FGC sign-in and account creation; the protected FGC App link is intentionally hidden from public navigation.
- `/fgc-ekm` now checks the frontend demo session before rendering the operational dashboard. Direct protected sub-routes show a sign-in prompt when no session is present.
- Demo profiles and route definitions live in `src/content/merseta-fgc.ts`; UI consumes them through `mockFgcServices`.

## Prototype Master Credentials

Use these only for local frontend review before production authentication is connected:

- Email: `master@jef-fgc.local`
- Password: `JEF-FGC-MASTER-2026!`
- Role: `JEF Administrator`

The credential is stored in source only as a prototype unlock for this local mock app. It must be removed or replaced by server-side authentication before any live deployment.

## Production Boundary

The current implementation is frontend-first and uses deterministic mock services. Production must replace this with:

- an approved identity provider;
- server-side email verification, invitation and reset-token handling;
- PostgreSQL-backed users, affiliations, role assignments and audit events;
- server-side permission checks for every protected query and mutation;
- MFA or step-up authentication for privileged national/admin actions;
- scoped access that intersects role, organisation, campus, reporting period and workshop assignment.

## Database Implication

The existing FGC schema should be extended with `users`, `user_identities`, `invitations`, `email_verifications`, `authentication_sessions`, `mfa_factors`, `organisation_affiliations`, `affiliation_requests` and `role_assignments` before live protected data is connected to the UI.
