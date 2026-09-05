# FGC Deployment Runbook

This runbook is a release boundary for the existing JEF Website and FGC App. It does not authorize a production deployment, migration, seed, DNS change or provider write.

## A. Local Validation

Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npm run test:db:integration`, `npm run build`, `npm run cf:check`, `npm run build:vinext` and `npx tsc -p tsconfig.worker.json --noEmit`. The integration command creates a local PostgreSQL container, applies only migrations 001, 003, 005, 007, 008 and 009, excludes all seeds, and removes the container on exit.

Run `npm run deploy:check` only from a clean reviewed branch after staging verification. The gate refuses production mode and requires `FGC_STAGING_VERIFIED_AT` without accepting or printing its value.

## B. GitHub Push and CI

Review the complete diff and secret scan locally. Push only after explicit authorization for the exact repository and branch. Pull requests and the protected production branch run lockfile installation, lint, typecheck, unit tests, schema tests, disposable PostgreSQL integration, Next build, Vinext compatibility/build checks and Worker typecheck. CI never runs production migrations or seeds.

## C. Supabase Staging Preparation

Use a separately identified staging project and private evidence bucket. Confirm the target by provider project metadata without copying credentials into chat, source, logs or Wrangler configuration. Record a staging verification timestamp externally. Apply migrations only through the protected migration job, in canonical order, after backup and rollback review. Never apply `002_seed_demo.sql` or reference/demo seeds.

The storage contract test must create one uniquely marked staging object, verify authenticated upload and signed retrieval behavior, test expiry and cross-scope denial, then delete only that exact object. Do not delete or enumerate unrelated objects.

## D. Cloudflare Staging Deployment

Build from the reviewed commit with the configured compatibility date and `nodejs_compat`. Configure Hyperdrive, `VINEXT_KV_CACHE` and `IMAGES` bindings as available, and provide only the documented non-secret variables and Worker secrets. Keep staging `FGC_APP_URL` and `NEXT_PUBLIC_APP_URL` distinct from production. Do not use production database or storage credentials in preview.

## E. Staging Smoke Tests

Check `/health` and `/health/ready` for safe status only. Verify login, session expiry/revocation, active-role switching, lecturer draft/submission, evidence upload/download, JEF assignment, assigned and unassigned assessor/moderator access, moderation provenance, scoped merSETA read-only access, notification deep links and report Pending/Processing/Completed/Failed states. Confirm no public evidence URL, raw database error or cross-scope record is returned.

## F. Production Backup

Before any production change, obtain an encrypted verified database backup and record the applied migration ledger. Confirm private storage inventory and an incident owner. This repository does not perform that backup automatically.

## G. Controlled Forward Migration

A protected migration operator reviews checksums, applies only the registered forward migrations, records the result and stops on failure. No migration is run from a Worker request, pull request, build, startup hook or demo seed path.

## H. Production Deployment

Require an approved release commit, successful CI, staging sign-off, configured secrets/bindings and the backup record. The local gate intentionally refuses `--production`; use the separately approved release process.

## I. IONOS DNS Cutover

DNS remains untouched until staging acceptance and production deployment verification. Change only the named record, preserve the previous target and TTL, and record the exact rollback target.

## J. Post-Deployment Verification

Verify deployment version, health/readiness, authentication, evidence privacy, submission immutability, role queues, moderation provenance, email failure handling and report state transitions. Do not treat a healthy response as proof that external integrations are configured.

## K. Rollback

Roll back traffic to the previous Worker version if application checks fail. Keep the previous version available. For database defects, prefer a forward corrective migration; restore the verified backup only through an approved incident procedure. Never delete users, submissions, evidence, audit records or assignment history to repair a release.

## Required Configuration Names

Browser-safe: `NEXT_PUBLIC_APP_URL`.

Non-secret Worker variables: `FGC_APP_URL`, `FGC_ENVIRONMENT`, `FGC_EMAIL_PROVIDER`, `FGC_EMAIL_FROM`, `FGC_EVIDENCE_STORAGE_PROVIDER`, `FGC_EVIDENCE_STORAGE_BUCKET`, `FGC_MAX_UPLOAD_BYTES`, `FGC_SESSION_TTL_SECONDS`, `FGC_VERIFICATION_TOKEN_TTL_SECONDS`, `FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS`, `FGC_SUPABASE_URL`.

Worker secrets: `FGC_SESSION_SECRET`, `FGC_EMAIL_API_KEY`, `FGC_SUPABASE_SERVICE_ROLE_KEY`, `FGC_REPORT_SIGNING_SECRET`, `FGC_INTERNAL_WEBHOOK_SECRET`, `FGC_ADMIN_BOOTSTRAP_TOKEN`.

Migration-only: `DATABASE_URL`. It must never be exposed to browser code or configured as a Worker public variable.
