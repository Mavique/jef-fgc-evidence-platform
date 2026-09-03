-- Adds lifecycle, validation and response-link metadata for real private evidence uploads.
-- Forward-only and idempotent; preserves existing fgc.evidence_files records.

ALTER TABLE fgc.evidence_files
  ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'COMPLETED',
  ADD COLUMN IF NOT EXISTS upload_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS upload_failure_reason text,
  ADD COLUMN IF NOT EXISTS validation_failure_reason text,
  ADD COLUMN IF NOT EXISTS scanner_status text NOT NULL DEFAULT 'UNAVAILABLE',
  ADD COLUMN IF NOT EXISTS scanner_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS scanner_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS replaced_file_id uuid REFERENCES fgc.evidence_files(id),
  ADD COLUMN IF NOT EXISTS submission_version_id uuid REFERENCES fgc.production_submission_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS response_value_id uuid REFERENCES fgc.production_response_values(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section_code text,
  ADD COLUMN IF NOT EXISTS field_code text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evidence_files_upload_status_check'
      AND conrelid = 'fgc.evidence_files'::regclass
  ) THEN
    ALTER TABLE fgc.evidence_files
      ADD CONSTRAINT evidence_files_upload_status_check
      CHECK (upload_status IN ('INITIATED', 'UPLOADING', 'COMPLETED', 'FAILED', 'ABANDONED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evidence_files_scanner_status_check'
      AND conrelid = 'fgc.evidence_files'::regclass
  ) THEN
    ALTER TABLE fgc.evidence_files
      ADD CONSTRAINT evidence_files_scanner_status_check
      CHECK (scanner_status IN ('UNAVAILABLE', 'PENDING', 'PASSED', 'FAILED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'evidence_files_version_positive_check'
      AND conrelid = 'fgc.evidence_files'::regclass
  ) THEN
    ALTER TABLE fgc.evidence_files
      ADD CONSTRAINT evidence_files_version_positive_check
      CHECK (evidence_version > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fgc_evidence_files_upload_status
  ON fgc.evidence_files(upload_status, review_status);

CREATE INDEX IF NOT EXISTS idx_fgc_evidence_files_response_link
  ON fgc.evidence_files(submission_id, section_code, field_code)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_evidence_files_single_replacement
  ON fgc.evidence_files(replaced_file_id)
  WHERE replaced_file_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_evidence_files_submission_checksum_category
  ON fgc.evidence_files(submission_id, uploaded_by, evidence_category, checksum_sha256)
  WHERE deleted_at IS NULL
    AND upload_status = 'COMPLETED'
    AND upload_completed_at IS NOT NULL
    AND review_status <> 'REPLACED';
