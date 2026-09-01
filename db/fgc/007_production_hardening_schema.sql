-- Production hardening schema for the FGC Evidence Validation Platform.
-- Applies after 001-006. This migration adds durable app workflows around auth,
-- submissions, evidence files, reports, notifications and append-only audit.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE fgc.account_state AS ENUM (
  'EMAIL_UNVERIFIED',
  'EMAIL_VERIFIED',
  'AFFILIATION_PENDING',
  'AFFILIATION_APPROVED',
  'AFFILIATION_REJECTED',
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED'
);

CREATE TYPE fgc.token_purpose AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'SESSION_REVOCATION');

CREATE TYPE fgc.submission_lifecycle_status AS ENUM (
  'DRAFT',
  'READY_FOR_LECTURER_REVIEW',
  'SUBMITTED_BY_LECTURER',
  'COLLEGE_REVIEW_PENDING',
  'JEF_REVIEW_PENDING',
  'CLARIFICATION_REQUESTED',
  'RESUBMITTED',
  'ASSESSOR_REVIEWED',
  'MODERATION_PENDING',
  'MODERATED',
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'REJECTED_WITH_REASON',
  'SUPERSEDED',
  'ARCHIVED'
);

CREATE TYPE fgc.evidence_source_kind AS ENUM (
  'SELF_REPORTED',
  'DOCUMENT_SUPPORTED',
  'SYSTEM_DERIVED',
  'REVIEWED',
  'MODERATED',
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'UNVERIFIED',
  'CONTRADICTORY',
  'NOT_ASSESSED',
  'NOT_APPLICABLE'
);

CREATE TYPE fgc.file_review_status AS ENUM (
  'UPLOADED',
  'VALIDATION_FAILED',
  'QUARANTINED',
  'PENDING_REVIEW',
  'ACCEPTED',
  'PARTIALLY_ACCEPTED',
  'REJECTED',
  'REPLACED',
  'ARCHIVED'
);

CREATE TYPE fgc.report_status AS ENUM ('REQUESTED', 'GENERATING', 'READY', 'FAILED', 'SUPERSEDED', 'ARCHIVED');
CREATE TYPE fgc.notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ', 'ARCHIVED');

CREATE TABLE fgc.production_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  surname text NOT NULL,
  mobile_number text,
  job_title text,
  employee_identifier text,
  account_state fgc.account_state NOT NULL DEFAULT 'EMAIL_UNVERIFIED',
  email_verified_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE fgc.production_auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE CASCADE,
  purpose fgc.token_purpose NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.production_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE CASCADE,
  session_hash text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.production_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES fgc.roles(id),
  organisation_id uuid REFERENCES fgc.organisations(id),
  tvet_college_id uuid REFERENCES fgc.tvet_colleges(id),
  campus_id uuid REFERENCES fgc.campus_sites(id),
  status text NOT NULL CHECK (status IN ('REQUESTED', 'APPROVED', 'RETURNED', 'REJECTED', 'EXPIRED', 'REVOKED')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES fgc.production_users(id),
  approved_at timestamptz,
  revoked_by uuid REFERENCES fgc.production_users(id),
  revoked_at timestamptz,
  decision_reason text
);

CREATE TABLE fgc.campus_addition_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid REFERENCES fgc.production_users(id),
  college_id uuid REFERENCES fgc.tvet_colleges(id),
  proposed_campus_name text NOT NULL,
  physical_location text,
  town_or_municipality text,
  province_id uuid REFERENCES fgc.provinces(id),
  supporting_information text,
  request_reason text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING_DIRECTORY_VERIFICATION' CHECK (status IN ('PENDING_DIRECTORY_VERIFICATION', 'MERGED', 'APPROVED', 'REJECTED', 'MORE_INFORMATION_REQUIRED')),
  duplicate_of_campus_id uuid REFERENCES fgc.campus_sites(id),
  decided_by uuid REFERENCES fgc.production_users(id),
  decided_at timestamptz,
  decision_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  description text,
  active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.form_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES fgc.form_templates(id),
  assigned_to uuid NOT NULL REFERENCES fgc.production_users(id),
  assigned_by uuid REFERENCES fgc.production_users(id),
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id),
  college_id uuid REFERENCES fgc.tvet_colleges(id),
  campus_id uuid REFERENCES fgc.campus_sites(id),
  due_at timestamptz,
  status text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'RETURNED', 'COMPLETE', 'CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.production_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES fgc.form_assignments(id),
  submitted_by uuid NOT NULL REFERENCES fgc.production_users(id),
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id),
  college_id uuid REFERENCES fgc.tvet_colleges(id),
  campus_id uuid REFERENCES fgc.campus_sites(id),
  programme_id uuid REFERENCES fgc.curriculum_programmes(id),
  programme_level_id uuid REFERENCES fgc.programme_levels(id),
  status fgc.submission_lifecycle_status NOT NULL DEFAULT 'DRAFT',
  current_version integer NOT NULL DEFAULT 1,
  locked_at timestamptz,
  locked_by uuid REFERENCES fgc.production_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE TABLE fgc.production_submission_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fgc.production_submissions(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status_at_snapshot fgc.submission_lifecycle_status NOT NULL,
  snapshot jsonb NOT NULL,
  snapshot_checksum text NOT NULL,
  created_by uuid REFERENCES fgc.production_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, version)
);

CREATE TABLE fgc.production_submission_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fgc.production_submissions(id) ON DELETE CASCADE,
  previous_status fgc.submission_lifecycle_status,
  new_status fgc.submission_lifecycle_status NOT NULL,
  changed_by uuid REFERENCES fgc.production_users(id),
  changed_role text,
  reason text NOT NULL,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.production_response_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_version_id uuid NOT NULL REFERENCES fgc.production_submission_versions(id) ON DELETE CASCADE,
  section_code text NOT NULL,
  field_code text NOT NULL,
  value_json jsonb NOT NULL,
  evidence_kind fgc.evidence_source_kind NOT NULL DEFAULT 'SELF_REPORTED',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_version_id, section_code, field_code)
);

CREATE TABLE fgc.evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES fgc.production_submissions(id),
  uploaded_by uuid NOT NULL REFERENCES fgc.production_users(id),
  college_id uuid REFERENCES fgc.tvet_colleges(id),
  campus_id uuid REFERENCES fgc.campus_sites(id),
  evidence_category text NOT NULL,
  original_filename text NOT NULL,
  stored_filename text NOT NULL UNIQUE,
  storage_provider text NOT NULL,
  storage_bucket text NOT NULL,
  storage_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  checksum_sha256 text NOT NULL,
  document_date date,
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id),
  description text,
  confidentiality_classification text NOT NULL DEFAULT 'INTERNAL',
  review_status fgc.file_review_status NOT NULL DEFAULT 'UPLOADED',
  replaced_by_file_id uuid REFERENCES fgc.evidence_files(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE fgc.evidence_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_file_id uuid REFERENCES fgc.evidence_files(id),
  evidence_item_id uuid REFERENCES fgc.evidence_items(id),
  reviewed_by uuid NOT NULL REFERENCES fgc.production_users(id),
  decision fgc.file_review_status NOT NULL,
  decision_reason text NOT NULL,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.analytics_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system text NOT NULL,
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id),
  source_file_id uuid REFERENCES fgc.evidence_files(id),
  imported_by uuid REFERENCES fgc.production_users(id),
  validation_result text NOT NULL DEFAULT 'PENDING',
  duplicate_handling text,
  rejected_row_count integer NOT NULL DEFAULT 0,
  imported_row_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_identifier text NOT NULL UNIQUE,
  report_type text NOT NULL,
  scope text NOT NULL,
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id),
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_snapshot jsonb NOT NULL,
  snapshot_checksum text NOT NULL,
  status fgc.report_status NOT NULL DEFAULT 'REQUESTED',
  version integer NOT NULL DEFAULT 1,
  generated_by uuid REFERENCES fgc.production_users(id),
  storage_provider text,
  storage_bucket text,
  storage_key text,
  mime_type text,
  file_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  failure_reason text
);

CREATE TABLE fgc.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES fgc.production_users(id),
  channel text NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL')),
  notification_type text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status fgc.notification_status NOT NULL DEFAULT 'PENDING',
  related_object_type text,
  related_object_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  read_at timestamptz,
  failure_reason text
);

CREATE TABLE fgc.production_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  actor_role text,
  action text NOT NULL,
  object_type text NOT NULL,
  object_id uuid,
  previous_value jsonb,
  new_value jsonb,
  reason text,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fgc_production_users_account_state ON fgc.production_users(account_state);
CREATE INDEX idx_fgc_auth_tokens_user_purpose ON fgc.production_auth_tokens(user_id, purpose, expires_at);
CREATE INDEX idx_fgc_sessions_user_active ON fgc.production_sessions(user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_fgc_role_assignments_scope ON fgc.production_role_assignments(tvet_college_id, campus_id, status);
CREATE UNIQUE INDEX idx_fgc_role_assignments_unique_scope
  ON fgc.production_role_assignments (
    user_id,
    role_id,
    COALESCE(tvet_college_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(campus_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
CREATE INDEX idx_fgc_submissions_scope_status ON fgc.production_submissions(college_id, campus_id, status);
CREATE INDEX idx_fgc_submission_history_submission ON fgc.production_submission_status_history(submission_id, created_at);
CREATE INDEX idx_fgc_evidence_files_submission ON fgc.evidence_files(submission_id, review_status);
CREATE INDEX idx_fgc_reports_scope ON fgc.generated_reports(report_type, scope, status);
CREATE INDEX idx_fgc_notifications_user_status ON fgc.notifications(user_id, status, created_at);
CREATE INDEX idx_fgc_audit_object ON fgc.production_audit_events(object_type, object_id, created_at);

CREATE OR REPLACE VIEW fgc.v_production_readiness AS
SELECT
  (SELECT count(*) FROM fgc.production_users) AS users,
  (SELECT count(*) FROM fgc.production_users WHERE account_state = 'ACTIVE') AS active_users,
  (SELECT count(*) FROM fgc.production_role_assignments WHERE status = 'APPROVED') AS approved_role_assignments,
  (SELECT count(*) FROM fgc.production_submissions) AS submissions,
  (SELECT count(*) FROM fgc.production_submissions WHERE status = 'DRAFT') AS draft_submissions,
  (SELECT count(*) FROM fgc.production_submissions WHERE status IN ('VERIFIED', 'PARTIALLY_VERIFIED')) AS verified_or_partially_verified_submissions,
  (SELECT count(*) FROM fgc.evidence_files) AS evidence_files,
  (SELECT count(*) FROM fgc.evidence_files WHERE review_status IN ('ACCEPTED', 'PARTIALLY_ACCEPTED')) AS accepted_evidence_files,
  (SELECT count(*) FROM fgc.generated_reports WHERE status = 'READY') AS ready_reports,
  (SELECT count(*) FROM fgc.notifications WHERE status = 'FAILED') AS failed_notifications,
  (SELECT count(*) FROM fgc.production_audit_events) AS audit_events;
