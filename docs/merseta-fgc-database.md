# merSETA FGC for EKM Database Architecture

The database is designed as a governed evidence system, not a generic form store.

## Architecture Principles

1. Q1 learner-use evidence and Q2 lecturer-capability evidence must remain separate.
2. Every claim should trace back to an evidence item, source document, reviewer note or corrective action.
3. Missing evidence remains `NOT_VERIFIED`.
4. Conflicting evidence is represented as a contradiction, not silently reconciled.
5. Lecturer independence is scored across the seven facilitator-guide rubric areas.
6. Facilitator execution invalidates independence even when other rubric scores look strong.
7. The capture wizard can store partial sessions before sign-off.
8. Dashboard metrics should read from views, not from fabricated frontend totals.

## Entity Groups

### Governance

- `reporting_periods`
- `source_documents`
- `decision_register`
- `sign_offs`
- `audit_log`

### Identity and Access

- `organisations`
- `campuses`
- `users`
- `roles`
- `role_permissions`
- `user_roles`

### Scope

- `programmes`
- `cohorts`

### Q1 Learner Utilisation

- `learner_use_records`
- `learner_use_evidence`
- `timetable_records`
- `attendance_records`
- `eon_import_batches`

### Q2 Lecturer Capability

- `experience_register`
- `lecturer_assessments`
- `lecturer_rubric_scores`
- `lecturer_assessment_evidence`

### Evidence Quality and Follow-Through

- `evidence_items`
- `contradictions`
- `corrective_actions`
- `corrective_action_updates`

### Data Capture Portal

- `capture_sessions`
- `capture_step_entries`

These two tables make it possible to persist the multi-step wizard before the user is ready to submit a final evidence package.

## Dashboard Queries

Use:

```sql
SELECT * FROM fgc.v_dashboard_summary;
SELECT * FROM fgc.v_evidence_status_summary;
SELECT * FROM fgc.v_college_learner_use_comparison;
SELECT * FROM fgc.v_lecturer_assessment_scoring;
```

## Production Notes

- Real learner-level personal data should be minimised or de-identified before national reporting views.
- File storage should keep actual files in object storage and store only metadata/location/hash in PostgreSQL.
- Add row-level security before exposing the database to authenticated users.
- Add a backend API layer before writing from the frontend.
- Confirm EON export fields before treating analytics data as production-ready.
