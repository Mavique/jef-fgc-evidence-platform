-- Explicit merSETA scope and immutable report lineage.
-- Forward-only and idempotent. No existing user receives scope automatically.

CREATE TABLE IF NOT EXISTS fgc.merseta_access_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  tvet_college_id uuid NOT NULL REFERENCES fgc.tvet_colleges(id) ON DELETE RESTRICT,
  campus_id uuid REFERENCES fgc.campus_sites(id) ON DELETE RESTRICT,
  programme_id uuid REFERENCES fgc.curriculum_programmes(id) ON DELETE RESTRICT,
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id) ON DELETE RESTRICT,
  evidence_detail_permission text NOT NULL DEFAULT 'METADATA' CHECK (evidence_detail_permission IN ('NONE', 'METADATA', 'DETAIL')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVOKED')),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  granted_by uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (valid_until IS NULL OR valid_until > valid_from),
  UNIQUE (user_id, tvet_college_id, campus_id, programme_id, reporting_period_id)
);

CREATE INDEX IF NOT EXISTS idx_fgc_merseta_scope_lookup
  ON fgc.merseta_access_scopes(user_id, status, tvet_college_id, campus_id, programme_id, reporting_period_id, valid_until);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_merseta_scope_active_unique
  ON fgc.merseta_access_scopes(
    user_id,
    tvet_college_id,
    COALESCE(campus_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(programme_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(reporting_period_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  WHERE status = 'ACTIVE';

ALTER TABLE fgc.form_assignments ADD COLUMN IF NOT EXISTS programme_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fgc_form_assignment_programme') THEN
    ALTER TABLE fgc.form_assignments
      ADD CONSTRAINT fk_fgc_form_assignment_programme
      FOREIGN KEY (programme_id) REFERENCES fgc.curriculum_programmes(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fgc_form_assignments_scope
  ON fgc.form_assignments(college_id, campus_id, programme_id, reporting_period_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_campus_id_college_key
  ON fgc.campus_sites(id, college_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fgc_merseta_scope_campus_college') THEN
    ALTER TABLE fgc.merseta_access_scopes
      ADD CONSTRAINT fk_fgc_merseta_scope_campus_college
      FOREIGN KEY (campus_id, tvet_college_id) REFERENCES fgc.campus_sites(id, college_id);
  END IF;
END $$;

ALTER TABLE fgc.generated_reports ADD COLUMN IF NOT EXISTS submission_id uuid;
ALTER TABLE fgc.generated_reports ADD COLUMN IF NOT EXISTS submission_version_id uuid;
ALTER TABLE fgc.generated_reports ADD COLUMN IF NOT EXISTS report_version_of uuid;
ALTER TABLE fgc.generated_reports ADD COLUMN IF NOT EXISTS output_format text NOT NULL DEFAULT 'JSON_SNAPSHOT';
ALTER TABLE fgc.generated_reports ADD COLUMN IF NOT EXISTS source_record_refs jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fgc_report_submission') THEN
    ALTER TABLE fgc.generated_reports ADD CONSTRAINT fk_fgc_report_submission
      FOREIGN KEY (submission_id) REFERENCES fgc.production_submissions(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fgc_report_submission_version') THEN
    ALTER TABLE fgc.generated_reports ADD CONSTRAINT fk_fgc_report_submission_version
      FOREIGN KEY (submission_version_id) REFERENCES fgc.production_submission_versions(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_fgc_report_version_of') THEN
    ALTER TABLE fgc.generated_reports ADD CONSTRAINT fk_fgc_report_version_of
      FOREIGN KEY (report_version_of) REFERENCES fgc.generated_reports(id) ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fgc_reports_submission_version
  ON fgc.generated_reports(submission_id, submission_version_id, report_type, version);
