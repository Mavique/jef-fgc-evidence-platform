# merSETA FGC for EKM Database

This folder contains the PostgreSQL database foundation for the FGC Evidence Validation & Adoption Intelligence Platform.

The schema is source-aligned to the supplied September 2026 workshop artefacts and keeps the two FGC questions separate:

- Q1: when learners are using the EON-XR platform.
- Q2: whether college lecturers can independently create, publish, assign and demonstrate curriculum-relevant EON-XR experiences.

## Files

- `001_schema.sql` creates the `fgc` schema, enums, tables, indexes, triggers and dashboard views.
- `002_seed_demo.sql` inserts synthetic demonstration data matching the current frontend mock records. These records are not production outcomes and must not be run against production.
- `003_tvet_reference_schema.sql` adds the National TVET Master Reference Registry for provinces, colleges, campuses, programmes, levels, subjects, offerings, source provenance, imports and reference-data audit trails.
- `004_seed_tvet_reference.sql` seeds the conservative national reference backbone: South Africa's provinces, the 50 public TVET colleges, a small campus subset, programme categories, NC(V)/Report 191 catalogue entries, controlled options and evidence-type lists. It does not seed unverifiable campus programme offerings.
- `005_curriculum_master_schema.sql` adds the independent National TVET Curriculum Master Catalogue for qualifications, programmes, subjects, modules, curriculum versions, aliases, trades, reference requests and curriculum import staging.
- `006_seed_curriculum_master.sql` seeds source provenance, category expansion, disciplines, aliases and a conservative starter curriculum sample. Full authoritative NC(V), Report 191, QCTO and SAQA imports remain pending.
- `007_production_hardening_schema.sql` adds production application tables for hashed-password accounts, email verification tokens, sessions, role approval, campus directory requests, form assignments, submission lifecycle versioning, evidence file metadata, reviews, reports, notifications and append-only audit events.
- `008_evidence_upload_lifecycle.sql` extends the canonical evidence file table with upload lifecycle, scanner-boundary state, replacement versioning and field-level response links for private binary uploads.
- `009_review_assignment_workflows.sql` adds canonical assessor/moderator assignments, immutable assignment history, exact-version review binding and governed review handoff records. Assessor and moderator queues must use these assignments; `evidence_reviews` is not an assignment source.

## Apply Locally

Create a PostgreSQL database, configure `.env.local`, then run the governed migration commands:

```bash
npm run db:status
npm run db:backup
npm run db:migrate
npm run db:seed:reference
npm run db:verify
```

Example local database URL:

Use a local disposable PostgreSQL connection configured through your local environment only; do not place credentials or remote connection strings in this repository.

## Production Commands

- `npm run db:status`: connects through `DATABASE_URL`, prints only redacted target details and counts existing `fgc` records.
- `npm run db:backup`: writes an FGC-only JSON backup under `db/fgc/backups/`.
- `npm run db:migrate`: applies production schema migrations in deterministic order and records checksums in `fgc.schema_migrations`.
- `npm run db:seed:reference`: applies repeat-safe production reference seeds and records checksums in `fgc.reference_seed_runs`.
- `npm run db:verify`: checks required tables, views, canonical roles, 50 active public TVET colleges and absence of demo records.
- `npm run db:rebuild:fgc`: backs up and drops only the `fgc` schema, then runs migrations, production reference seeds and verification.

Production migration order:

1. `001_schema.sql`
2. `003_tvet_reference_schema.sql`
3. `005_curriculum_master_schema.sql`
4. `007_production_hardening_schema.sql`
5. `008_evidence_upload_lifecycle.sql`

Production reference seed order:

1. `seeds/001_production_reference.sql`
2. `004_seed_tvet_reference.sql`
3. `006_seed_curriculum_master.sql`

`002_seed_demo.sql` is intentionally excluded from all production commands.

## Core Tables

- `fgc.reporting_periods`: workshop/reporting scope.
- `fgc.source_documents`: agenda, tracker, toolkit and facilitator guide references.
- `fgc.organisations`, `fgc.campuses`, `fgc.programmes`, `fgc.cohorts`: TVET scope model.
- `fgc.users`, `fgc.roles`, `fgc.role_permissions`, `fgc.user_roles`: permission-ready identity model.
- `fgc.evidence_items`: evidence index with Q1/Q2/shared classification and quality status.
- `fgc.learner_use_records`: Q1 learner utilisation evidence.
- `fgc.lecturer_assessments`, `fgc.lecturer_rubric_scores`: Q2 lecturer capability evidence.
- `fgc.experience_register`: EON experience IDs/URLs and curriculum linkage.
- `fgc.contradictions`: unresolved conflicts between evidence sources.
- `fgc.corrective_actions`, `fgc.corrective_action_updates`: 30/60/90 follow-through model.
- `fgc.decision_register`: production decisions requiring confirmation.
- `fgc.sign_offs`: final finding readiness, limitations and sign-off.
- `fgc.capture_sessions`, `fgc.capture_step_entries`: frontend capture wizard persistence.
- `fgc.audit_log`: future audit trail for regulated evidence changes.

## Production Hardening Layer

Migration `007_production_hardening_schema.sql` is the first product-grade application layer on top of the source-aligned data model. It does not remove the earlier evidence model; it adds the durable workflow structures needed to replace prototype-only auth and browser storage.

- `fgc.production_users`, `fgc.production_auth_tokens`, `fgc.production_sessions`: server-side identity, email verification, password reset and session persistence.
- `fgc.production_role_assignments`: scoped access requests and approvals by role, organisation, TVET college and campus.
- `fgc.campus_addition_requests`: governed workflow for missing campus records instead of free-text campus creation.
- `fgc.form_templates`, `fgc.form_assignments`, `fgc.production_submissions`, `fgc.production_submission_versions`, `fgc.production_response_values`: assigned data-capture workflows with versioned submissions and field-level evidence-source classification.
- `fgc.evidence_files`, `fgc.evidence_reviews`: private-storage file metadata, checksums, lifecycle status and review decisions.
- `fgc.evidence_files` is extended by `008_evidence_upload_lifecycle.sql` so completed rows can be distinguished from failed/interrupted uploads, linked to the current toolkit response, versioned on replacement and marked with an honest scanner state when malware scanning is not configured.
- `fgc.analytics_import_batches`, `fgc.generated_reports`, `fgc.notifications`: integration, reporting and communication queues.
- `fgc.production_audit_events`: append-only audit events for regulated workflow actions.
- `fgc.v_production_readiness`: operational readiness counters for administrators.

## Dashboard Views

- `fgc.v_dashboard_summary`
- `fgc.v_evidence_status_summary`
- `fgc.v_college_learner_use_comparison`
- `fgc.v_lecturer_assessment_scoring`
- `fgc.v_reference_data_quality`
- `fgc.v_reference_lecturer_onboarding_options`
- `fgc.v_curriculum_catalogue_quality`
- `fgc.v_curriculum_search_index`

## National TVET Reference Registry

- `fgc.countries`, `fgc.provinces`, `fgc.district_municipalities`, `fgc.local_municipalities`: geography backbone.
- `fgc.tvet_colleges`, `fgc.campus_sites`: institution and delivery-site backbone.
- `fgc.programme_categories`, `fgc.programme_levels`, `fgc.programme_catalogue`, `fgc.curriculum_versions`, `fgc.subject_modules`, `fgc.programme_level_subjects`: academic reference catalogue.
- `fgc.quality_authorities`, `fgc.setas`, `fgc.occupations`, `fgc.economic_sectors`: external alignment dimensions.
- `fgc.college_programme_offerings`, `fgc.campus_programme_offerings`: offer/teach relationships. These must be imported from verified college, DHET or official source records before being shown as confirmed.
- `fgc.lecturer_profiles`, `fgc.lecturer_teaching_assignments`: lecturer onboarding and teaching-scope reference data.
- `fgc.reference_import_batches`, `fgc.reference_import_staging_rows`: controlled import pipeline for spreadsheets, DHET exports or verified institutional lists.
- `fgc.reference_sources`, `fgc.reference_audit_events`: provenance and audit trail.

## National TVET Curriculum Master Catalogue

The curriculum catalogue is intentionally separate from campus offerings:

- National catalogue: what qualifications, programmes, levels, subjects and modules officially exist.
- Institutional structure: where the lecturer works.
- Campus programme intelligence: which programmes have been verified as offered at a campus.

Core curriculum tables:

- `fgc.curriculum_source_documents`: DHET, QCTO, SAQA, Umalusi, SETA and college source provenance.
- `fgc.curriculum_versions_master`: versioning for current, future, teach-out, historical, withdrawn and pending curricula.
- `fgc.curriculum_qualifications`: SAQA/QCTO qualification and part-qualification records.
- `fgc.curriculum_programmes`: canonical national programme catalogue.
- `fgc.curriculum_subjects`: canonical subject records.
- `fgc.curriculum_modules`: occupational knowledge, practical skills and work experience modules.
- `fgc.curriculum_programme_subjects`: programme + level + subject mapping.
- `fgc.curriculum_programme_modules`: occupational qualification/module mapping.
- `fgc.trades_registry`: trade and apprenticeship reference data.
- `fgc.reference_aliases`: search aliases such as ERD, EIC, NCV, NC(V), NATED and N Courses.
- `fgc.reference_data_requests`: "Can't find my programme/subject" workflow.
- `fgc.possible_campus_programme_mappings`: soft signals for administrator review when a lecturer selects a national programme not yet mapped to their campus.
- `fgc.curriculum_import_batches`, `fgc.curriculum_import_staging_rows`: ETL staging for official curriculum imports.

## Important Rules Embedded in the Model

- Q1 and Q2 evidence are stored separately.
- Lecturer independence is recalculated in `fgc.v_lecturer_assessment_scoring`.
- Facilitator execution prevents an independent classification.
- Learner active count cannot exceed enrolled count without changing the source data design.
- Evidence quality uses the source statuses: Verified, Partially Verified, Not Verified and Contradicted.
- Capture wizard state can be persisted before final sign-off.
- Province, college, campus, programme, level and subject fields should be saved as relational IDs from the reference registry.
- Campus programme offerings are not inferred from national programme names; they require explicit verified source data.

## Runtime Integration

The Next.js FGC workspace uses the direct `pg` service layer under `src/lib/fgc/*` for authenticated, role-scoped runtime queries. The legacy `src/services/merseta-fgc.ts` module is type-only and must not become a production operational data source.

Assessor and moderator work queues intentionally return empty until a canonical assignment relationship is added. Historical review rows are not treated as assignment authority.

Migration `009_review_assignment_workflows.sql` provides that canonical relationship. Assignment scope is copied from, and database-checked against, the assigned production submission. Reassignment supersedes the prior assignment and requires a reason; no assignment history is deleted.
