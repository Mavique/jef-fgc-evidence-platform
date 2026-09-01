# FGC Production Readiness Report

Date: 2026-08-30

## Current Verdict

**NO-GO — Release blockers remain**

The FGC platform has a substantial production foundation, but it is not production ready. Authentication, session resolution, role-aware routing, access-management decisions, production form persistence, production metrics, migrations and reference seeds exist. Release remains blocked by incomplete private evidence storage, email delivery verification, password reset/change flows, full Toolkit 1-13 production wiring, assessor/moderator depth, report reproducibility, staging deployment evidence, monitoring/alerting and backup-restore proof.

## Phase 0 Findings

- Framework: Next.js 16, React 19, TypeScript, Tailwind CSS.
- Database access: direct PostgreSQL through `pg`.
- Migration system: SQL files under `db/fgc` executed by `scripts/fgc/migrate.mjs`.
- Production seed workflow: `scripts/fgc/seed-reference.mjs`.
- Build process: `npm run build`.
- Test process: `npm run typecheck`, `npm run lint`, `npm test -- --run`, `npm run test:e2e`.
- Hosting target: standard Next.js runtime; no repository-specific production host is committed.
- Runtime configuration: `.env.local` for local execution; `.env.example` now lists required names only.
- Deployment commands already present: `db:status`, `db:migrate`, `db:seed:reference`, `db:verify`, `db:backup`, `db:bootstrap-admin`.

## Validation Baseline

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test -- --run`: passed, 39 unit tests.
- `npm run build`: passed, 63 app routes generated/validated.
- `npm run db:status`: connected to configured PostgreSQL target; FGC schema exists with 101 tables.
- `npm run db:verify`: passed; required roles present, 50 active public TVET colleges present, no verifier-detected demo records.
- Browser check: authenticated JEF Administrator can open the integrated FGC Intelligence Dashboard; production session shows the governed production panel and does not show the synthetic "Verified learner-use records" observatory metric.

## Mock-Data Inventory

| Location | Classification | Production Risk | Required Action |
| --- | --- | --- | --- |
| `db/fgc/002_seed_demo.sql` | Development fixture | High if run against production | Keep excluded from production migration and seed scripts. |
| `src/services/merseta-fgc.ts` | Development fixture service | High if loaded for production users | Production sessions must not hydrate dashboards from it. |
| `src/content/merseta-fgc.ts` demo profiles and synthetic records | Development fixture/test data | High if used as production evidence | Keep isolated from production-session rendering. |
| `localStorage` FGC workspace state | Prototype persistence | High if used by production users | Disabled for production sessions in the intelligence dashboard path. |
| Existing website public/demo language outside FGC | Website content placeholders | Medium | Keep clearly labelled until verified or replace with real content. |

## Production-Wiring Change Applied

Production-authenticated users no longer load the synthetic observatory snapshot from `mockFgcServices`. The restored FGC Intelligence Dashboard now shows:

- governed production metrics from `/api/fgc/metrics/summary`;
- honest empty operational states for learner utilisation, evidence spine, lecturer capability and reports;
- disabled local JSON export/reset controls for production sessions;
- no production-session writes to `localStorage` workspace state.

The access shell now loads static route definitions directly and imports demo user profiles only for non-production fallback screens.

## Feature Matrix

| Capability | Implemented | Production-wired | Mock-dependent | Tested | Deployment-ready | Required action |
| ---------- | ----------: | ---------------: | -------------: | -----: | ---------------: | --------------- |
| Registration | Yes | Partial | No | Unit/API baseline | No | Verify email provider and E2E journey. |
| Email verification | Yes | Partial | No | Unit/API baseline | No | Verify real email delivery and resend flow. |
| Login | Yes | Yes | No | Unit/browser baseline | Partial | Add brute-force/rate-limit tests. |
| Password reset | Partial | No | No | No | No | Implement request, token, reset and audit flow. |
| Sessions | Yes | Yes | No | Unit/browser baseline | Partial | Verify HTTPS cookie/reverse-proxy behaviour. |
| Affiliation | Yes | Yes | No | Unit/browser baseline | Partial | Add rejection/clarification/suspension E2E tests. |
| Roles | Yes | Yes | No | Unit/browser baseline | Partial | Add cross-role and revocation E2E tests. |
| Portal routing | Yes | Yes | No | Unit/browser baseline | Partial | Test every role with direct URL refresh. |
| Lecturer Dashboard | Partial | Partial | No for production form path | Unit/browser baseline | No | Complete onboarding, evidence upload and all Toolkit modules. |
| College Dashboard | Partial | Partial | Some placeholder workflow | Limited | No | Complete scoped college operations and reports. |
| Assessor Dashboard | Partial | Partial | Some placeholder workflow | Limited | No | Complete assigned queue, scoring and decisions. |
| Moderator Dashboard | Partial | Partial | Some placeholder workflow | Limited | No | Complete moderation queue and final decisions. |
| JEF Dashboard | Partial | Partial | No for metrics/access | Unit/browser baseline | No | Complete admin console, monitoring and allocations. |
| merSETA Dashboard | Partial | Partial | No for production metric layer | Limited | No | Complete read-only intelligence and reports. |
| Toolkit 1-13 | Partial | Partial | No for assigned lecturer form shell | Limited | No | Wire every tool to production persistence and ownership. |
| Evidence uploads | Schema only | No | No | No | No | Implement private storage and signed access. |
| Verification | Partial | Partial | No | Limited | No | Complete assessor evidence review workflow. |
| Moderation | Partial | Partial | No | Limited | No | Complete score confirmation/amendment and reasons. |
| Notifications | Schema/API inserts | Partial | No | Limited | No | Verify in-app and email delivery. |
| Reports | Partial | Partial | No | Limited | No | Make server-generated reproducible snapshots downloadable. |
| Exports | Demo only disabled for production dashboard | No | Yes for demo | Limited | No | Implement authorised server exports. |
| Audit trail | Yes | Partial | No | Unit/API baseline | Partial | Ensure every material action records an event. |
| Monitoring | Health endpoint | Partial | No | Limited | No | Add readiness, structured logs, alerts and failed-job tracking. |
| Backups | Script exists | Partial | No | Not restore-tested | No | Add restore-to-test workflow evidence. |
| Deployment | Scripts/docs partial | Partial | No | Build pending | No | Stage, smoke-test and document rollback. |

## Release Blockers

- Production private evidence upload/download is not implemented end to end.
- Password reset/change is not complete.
- Toolkit 1-13 is not fully wired to production tables and role ownership.
- Original dashboard detail panels have no production source data equivalent yet; production sessions now show honest empty states instead of synthetic records.
- Report generation is not yet a complete reproducible, downloadable, server-authorised report suite.
- Monitoring/alerting, backup restore tests and staging deployment evidence are missing.
- Full E2E journeys across Lecturer, College Evidence Owner, Assessor, Moderator, JEF, merSETA and Super Administrator remain incomplete.

## Next Safe Phases

1. Implement password reset/change and rate limiting.
2. Implement private evidence storage abstraction and upload/download APIs.
3. Wire Toolkit 1-13 fields into production response/evidence tables.
4. Build full role-specific E2E tests with isolated database records.
5. Implement reproducible server-side report snapshots and downloads.
6. Add readiness checks, structured logs and backup restore test command.
