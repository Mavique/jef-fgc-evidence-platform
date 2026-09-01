# FGC Dashboard Recovery Inventory

## Purpose

This inventory records the restored FGC dashboard surface so product hardening can enhance the existing working areas instead of replacing them with disconnected dashboards.

## Existing Dashboard Recovered

Primary component:

- `src/components/merseta-fgc/FgcEkmApp.tsx`

Primary route:

- `/fgc-ekm`

The route now recognises the production database session cookie as well as the older local demo session. Approved production users are mapped into the closest existing role view:

- `JEF_ADMIN_ACTIVE` -> `JEF Administrator`
- `MERSETA_ACTIVE` -> `merSETA Oversight`
- `COLLEGE_ACTIVE` -> `College Evidence Owner`
- `LECTURER_ACTIVE` -> `Lecturer`

## Restored Functional Areas

- Observatory KPIs and evidence-quality status explanations.
- Comparative infographic cards for learner-use coverage and lecturer independence.
- Evidence spine table for source, owner, status and review notes.
- Triangulation view comparing learner-use records against evidence quality.
- Lecturer capability rubric and moderation status.
- Data Capture portal with lecturer-use, evidence, rubric, issue and reference-request sections.
- Curriculum Catalogue lookup against the national TVET reference data.
- Corrective action tracking.
- Reports and Decisions workspace.
- JSON export and local workspace reset for the current prototype persistence layer.

## Production Integration Added

- `/fgc-ekm` no longer depends only on `jef-fgc-demo-session` in localStorage.
- Production users authenticated through `fgc_session` can open the restored dashboard when `resolveFgcAccessPolicy` grants protected workspace access.
- Pending production users see a governed pending-access state rather than a blank or silently redirected page.
- Authenticated portal cards now include an explicit `FGC Intelligence Dashboard` entry linking to `/fgc-ekm`.
- `/api/fgc/metrics/summary` provides the first shared production metric layer for role dashboards.

## Data Source Status

Production-backed now:

- User identity and account state.
- Approved and pending role assignments.
- Form assignments.
- Production audit-event totals.
- User, affiliation and role-status counts.

Prototype/local workspace still to harden:

- Lecturer capture draft persistence.
- Submitted evidence package persistence.
- Evidence spine rows.
- Learner utilisation rows.
- Lecturer rubric assessments.
- Corrective actions.
- Report decisions.
- Curriculum-reference change requests.

## Next Product-Grade Steps

1. Replace localStorage capture submissions with database-backed draft, autosave and final-submit APIs.
2. Create shared query services for evidence, learner utilisation, rubric assessments and corrective actions.
3. Point Observatory, Evidence Spine, Triangulation, Lecturer Capability and Reports tabs at those shared services.
4. Add role-scoped workbenches for lecturer, college evidence owner, assessor, moderator, JEF administrator and merSETA oversight without duplicating metric logic.
5. Add Playwright coverage for JEF Admin, Lecturer, College Evidence Owner pending role and shared dashboard routing.
