# FGC Production Hardening Audit

This audit responds to the production-hardening prompt and separates implemented product foundations from items that still require live infrastructure, institutional source data or integration credentials.

## Current Production-Grade Additions

- PostgreSQL access is now centralized in `src/lib/fgc/db.ts` with an explicit configuration error when `DATABASE_URL` is missing.
- Runtime readiness is centralized in `src/lib/fgc/env.ts` and reports missing database, session, email and private evidence-storage configuration.
- Passwords are hashed with Node crypto `scrypt`; verification uses constant-time comparison.
- Account verification and session tokens are generated securely and stored as SHA-256 hashes.
- Transactional email is isolated behind `src/lib/fgc/mailer.ts`; unsupported or missing providers fail explicitly.
- Server API boundaries now exist for health checks, registration, email verification, login, logout, TVET college lookup, campus lookup and campus addition requests.
- Migration `007_production_hardening_schema.sql` adds production tables for accounts, sessions, role approval, campus requests, assigned forms, submission lifecycle, evidence files, reviews, reports, notifications and audit events.

## Still Prototype or Not Yet Wired

- The visible FGC workspace still contains the localStorage-backed demo session and workspace store. This must be replaced by calls to the new server APIs before production release.
- Master credentials remain a local prototype convenience in the frontend and must be disabled for production builds.
- File uploads are not yet connected to private object storage, antivirus scanning, MIME validation, checksum enforcement or access-controlled download URLs.
- Reports are not yet generated from versioned production submissions.
- Dashboards still include synthetic demo records until the production views are populated from live PostgreSQL records.
- EON/XR analytics imports are not connected to a governed export/API agreement.
- Email verification, login and directory APIs require environment configuration before they can complete successfully.

## Required Runtime Configuration

- `DATABASE_URL`
- `FGC_SESSION_SECRET`
- `FGC_EMAIL_PROVIDER`
- `FGC_EMAIL_FROM`
- `FGC_EMAIL_API_KEY`
- `FGC_EVIDENCE_STORAGE_PROVIDER`
- `FGC_EVIDENCE_STORAGE_BUCKET`

The API health route at `/api/fgc/health` reports these gaps honestly.

## Next Implementation Sequence

1. Apply database migrations `001` through `007` to a real PostgreSQL database.
2. Configure transactional email and verify `/api/fgc/auth/register` plus `/api/fgc/auth/verify-email`.
3. Wire the sign-up and sign-in UI to the production auth endpoints.
4. Hide or disable prototype master credentials outside local development.
5. Replace localStorage workspace reads/writes with PostgreSQL-backed submission APIs.
6. Add private evidence upload storage, checksum validation, review workflow and audit logging.
7. Generate dashboard metrics and reports only from production submissions, evidence files, reviews and verified imports.

## Acceptance Boundary

The work in this phase is not a claim that the FGC App is fully production-ready. It is the first backend hardening layer needed to make the product real. Full production readiness requires live infrastructure, UI rewiring, storage integration, notification delivery, audit coverage on every workflow transition and end-to-end tests against a seeded PostgreSQL instance.
