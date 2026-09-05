# FGC GitHub and Cloudflare Workers Readiness

Date: 2026-08-31

## Decision

Ready after listed fixes. Do not deploy to Cloudflare Workers yet.

The Next.js application surface is compatible with vinext with a documented image-optimizer limitation. Request-time persistence uses `pg.Pool` through the configured Cloudflare Hyperdrive path and is covered by a disposable PostgreSQL application-adapter integration test; Cloudflare runtime behavior still requires staging verification. Evidence binary storage uses private Supabase Storage with governed upload metadata and signed downloads; provider bucket policy and staging retrieval tests remain external gates.

## Detected Framework

- Next.js: `^16.3.2`
- React: `^19.0.0`
- App Router: `src/app`
- Route handlers: `src/app/api/fgc/**`
- Styling: Tailwind CSS
- Database driver: `pg`
- Email provider adapter: Resend over HTTPS `fetch`
- Current runtime target: Node.js/Next.js server
- Proposed runtime target: Cloudflare Workers through vinext, after blockers are resolved

## Baseline Commands

| Command | Result | Notes |
| --- | --- | --- |
| `node --version` | Passed | Node `v22.18.0` |
| `npm --version` | Passed | npm `11.4.2` |
| `git status --short` | Passed | Parent repository currently sees this project tree as untracked. |
| `npm ci` | Failed | Windows could not unlink the locked Next SWC native binary in `node_modules`. Likely caused by the local server or another process holding the file. |
| `npm install` | Passed | Repaired dependencies; npm reported zero vulnerabilities. Cleanup warning remained for a locked temporary Next SWC folder. |
| `npm run lint` | Passed | ESLint completed with zero warnings. |
| `npm run typecheck` | Passed | TypeScript completed successfully. |
| `npm test -- --run` | Passed | 7 test files, 45 tests passed. |
| `npm run build` | Passed | Production build completed; `/health` and `/health/ready` compiled as dynamic routes. |
| `npx vinext check` | Passed with partial support | 96% compatible; partial: `images` config. |
| `npm run test:db:integration` | Passed | Fresh local PostgreSQL container; canonical migrations through 009, application adapter queries and rollback; container removed afterward. |
| `npm run db:verify` | Passed | Read-only schema/reference verification passed; no demo records reported by the verifier. |

## `vinext check` Summary

- Imports: 5/6 fully supported.
- No `next/font/google` import remains; typography uses deterministic system stacks for network-independent builds.
- Config: `images` is partial; remote patterns are validated, but on-the-fly optimization requires Cloudflare Images or passthrough.
- Libraries flagged by vinext as compatible: Tailwind CSS, lucide-react, zod, react-hook-form.
- Structure: App Router, 21 pages, 20 route handlers.
- Overall: 93% compatible, 0 vinext-reported hard issues.

Manual audit still finds runtime risks that `vinext check` did not classify as deployment blockers.

## Compatibility Matrix

| Area | Current State | Cloudflare Workers Classification | Required Action |
| --- | --- | --- | --- |
| Next.js App Router | Uses `src/app`, route handlers and client components. | Compatible through vinext. | Keep Next local workflow; initialize vinext only after runtime blockers are resolved. |
| Typography | Local system font stacks; no build-time font download. | Compatible. | None for deployment; exact external typefaces are intentionally not bundled. |
| `next/image` remote patterns | Present. | Partial support. | Configure Cloudflare Images or use passthrough image behavior. |
| Database | `src/lib/fgc/db.ts` uses `pg.Pool`; Worker receives the Hyperdrive connection string. | Compatible with `nodejs_compat`, pending staging proof. | Verify Hyperdrive/Supabase transaction behavior in a non-production Worker environment. |
| Transactions | Submission/versioning/decisions use database transactions; application adapter rollback is proven against disposable PostgreSQL. | Local integration proven; Worker runtime pending. | Exercise concurrent workflow transactions in staging. |
| Migrations | Node scripts read SQL from disk and connect through `pg`. | Compatible as migration-only, not Worker runtime. | Run locally or in controlled CI, never inside request handlers. |
| Auth sessions | Server-side DB sessions plus HttpOnly cookies. | Compatible after DB path is fixed. | Confirm cookie behavior on Cloudflare preview and canonical production origin. |
| Password hashing | Node `crypto.scrypt`. | Compatible only if Node crypto support is verified. | Test under Workers `nodejs_compat`; otherwise use a Workers-compatible password hashing strategy. |
| Email | Resend via HTTPS `fetch`. | Compatible unchanged. | Store API key as Worker secret; test delivery in staging. |
| Evidence files | Binary upload, checksum, versioned metadata and signed private download are implemented. | Compatible over HTTPS; provider policy pending. | Configure and verify private bucket policies and staging object lifecycle. |
| Reports | Current report generation stores JSON snapshots, not binary PDF/DOCX. | Compatible for snapshot records. | For future PDFs/DOCX, use Worker-compatible generation or async external job boundary. |
| Background jobs | No permanent server loops found in app runtime. | Compatible unchanged. | Use Cloudflare Cron/Workflows only for future scheduled tasks. |
| Browser localStorage | Still used for legacy/demo dashboard state. | Client-only; compatible. | Keep production sessions on server data; do not use localStorage for governed evidence. |

## Environment Variables

### Public Build-Time

- `NEXT_PUBLIC_APP_URL`

### Cloudflare Worker Secrets

Configure with `wrangler secret put`; never commit values.

- `FGC_SESSION_SECRET`
- `FGC_EMAIL_API_KEY`
- `FGC_SUPABASE_SERVICE_ROLE_KEY`
- `FGC_REPORT_SIGNING_SECRET`
- `FGC_INTERNAL_WEBHOOK_SECRET`
- `FGC_ADMIN_BOOTSTRAP_TOKEN`

### Non-Secret Worker Variables

- `FGC_APP_URL`
- `FGC_ENVIRONMENT`
- `FGC_EMAIL_PROVIDER`
- `FGC_EMAIL_FROM`
- `FGC_EVIDENCE_STORAGE_PROVIDER`
- `FGC_EVIDENCE_STORAGE_BUCKET`
- `FGC_MAX_UPLOAD_BYTES`
- `FGC_SESSION_TTL_SECONDS`
- `FGC_VERIFICATION_TOKEN_TTL_SECONDS`
- `FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS`
- `FGC_SUPABASE_URL`

### Migration-Only Secrets

- `DATABASE_URL`

If Hyperdrive is chosen, request-time database binding details belong in Cloudflare bindings/secrets, while migration scripts continue using `DATABASE_URL` only in local/protected CI migration contexts.

## Secrets Requiring Rotation

Secret-like values were found in the local untracked `.env.local`. Treat those local values as sensitive and rotate before any GitHub or Cloudflare deployment if there is any chance they were copied into logs, screenshots, chat, or commits.

The broader pattern scan also matched schema, seed, documentation and test files containing words such as `token`, `password_hash`, `storage_key`, `postgresql://` examples and placeholder keys. Those are not automatically credential leaks, but they should be reviewed before the first private GitHub push. Do not commit Python cache files under `tests/__pycache__`.

The source tree now includes `.gitignore` rules for `.env`, `.env.local`, `.env.production`, `.env.*.local`, `node_modules`, `.next`, `dist`, `coverage`, `.wrangler` and logs.

## Health Endpoints

Added:

- `/health`: safe liveness status.
- `/health/ready`: safe readiness status for required configuration, database reachability and migration table presence.

The endpoints do not expose credentials, database hostnames, database names, storage keys or stack traces.

## GitHub Readiness

Added `.github/workflows/fgc-validation.yml`.

The workflow runs:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- `npx vinext check`
- `npm run test:db`

Production migrations are not applied automatically from pull requests.

## Cloudflare Configuration

`vinext init` was not run because manual audit found unresolved runtime blockers. This is intentional. Initializing generated Cloudflare files before choosing and proving the database/evidence strategy would create a false sense of readiness.

Current official path, once blockers are resolved:

1. Stop local processes that lock Next SWC files.
2. Run `npm ci`.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
4. Run `npm run cf:check`.
5. Select and implement the database strategy.
6. Implement private evidence binary storage.
7. Run runtime tests against Cloudflare preview.
8. Run `npx vinext init`.
9. Review generated Vite/Wrangler files before committing.

## Database Strategy

Do not use the existing conventional Node `pg.Pool` blindly in Workers.

Recommended smallest safe option:

1. Keep migrations and backup scripts outside the Worker runtime.
2. Use Cloudflare Hyperdrive with `nodejs_compat` for request-time PostgreSQL access if transaction behavior is confirmed with Supabase.
3. Configure low connection concurrency and test concurrent lecturer submissions, version inserts, role decisions and moderation updates.
4. If Hyperdrive is not suitable for Supabase transaction/session pooler behavior, move request-time access to Supabase REST/RPC functions over HTTPS and keep multi-statement transactions inside Postgres functions.

## Evidence Strategy

Current state is not enough for production evidence files. Required before staging:

- Private Supabase Storage bucket policies.
- Server-authorised signed uploads.
- Signed, time-limited downloads.
- Server metadata validation.
- MIME and size limits.
- SHA-256 checksum capture.
- Evidence version/replacement tracking.
- Role-scoped file access.
- Audit events for upload, download, replacement, review and deletion.

Do not expose public evidence URLs or permanent storage keys.

## Report Strategy

Current generated reports are governed JSON snapshot records in the database. This is Worker-compatible after database access is solved.

Future PDF/DOCX/spreadsheet generation should not be assumed Worker-compatible. If binary reports are required, either use Worker-compatible libraries without filesystem writes or create an auditable async report job handled by a separate runtime.

## Background Jobs

No app-runtime long-running loops or cron processes were found. Existing migration, backup, seed and verification scripts are command-line Node jobs and must remain outside the Worker request runtime.

## Production Data Protection

Before staging:

1. Run a verified database backup outside the repository or into encrypted storage.
2. Inventory Supabase private storage buckets and object counts.
3. Record applied migration versions from `fgc.schema_migrations`.
4. Confirm rollback procedure for the application deployment and database migrations.
5. Use forward-only migrations.

Do not run demo seeds or database rebuild scripts against production.

## Rollback Procedure

Application rollback:

1. Keep the previous Cloudflare Worker version available.
2. Roll back traffic to the previous Worker version if readiness, auth, dashboard or submission tests fail.
3. Keep DNS changes reversible until staging is accepted.

Database rollback:

1. Prefer forward-only corrective migrations.
2. Restore from verified backup only after approving an incident procedure.
3. Never delete production users, submissions, evidence files or audit records to repair deployment code.

## Unresolved Blockers

- Request-time database access is not yet proven in Cloudflare Workers.
- Supabase private bucket policies and staging evidence retrieval are not yet verified.
- Full role-based end-to-end workflow suite is not yet automated.
- Cloudflare preview deployment has not been created or tested.
- `vinext init` has not been run by design.

## Final Staging-Readiness Decision

Ready after listed fixes.

The codebase can be prepared for GitHub now, but Cloudflare Workers staging should wait until database runtime access and private evidence storage are implemented and proven under Cloudflare preview.
