-- merSETA FGC for EKM PostgreSQL schema
-- Source basis: September 2026 FGC agenda, tracker workbook, validation toolkit and facilitator guide.
-- This schema keeps FGC Question 1 learner utilisation separate from FGC Question 2 lecturer capability.

CREATE SCHEMA IF NOT EXISTS fgc;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE fgc.fgc_question AS ENUM (
  'Q1_LEARNER_UTILISATION',
  'Q2_LECTURER_CAPABILITY',
  'SHARED'
);

CREATE TYPE fgc.evidence_status AS ENUM (
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'NOT_VERIFIED',
  'CONTRADICTED'
);

CREATE TYPE fgc.capability_classification AS ENUM (
  'INDEPENDENT',
  'PARTIALLY_INDEPENDENT_SUPPORT_REQUIRED',
  'NOT_YET_DEMONSTRATED',
  'NOT_ASSESSED'
);

CREATE TYPE fgc.assistance_type AS ENUM (
  'NONE',
  'CLARIFICATION',
  'PROMPTING',
  'TECHNICAL_INTERVENTION',
  'FACILITATOR_EXECUTION'
);

CREATE TYPE fgc.action_priority AS ENUM (
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW'
);

CREATE TYPE fgc.action_status AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETE',
  'OVERDUE',
  'CANCELLED'
);

CREATE TYPE fgc.moderation_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CHANGED',
  'REASSESSMENT_REQUESTED'
);

CREATE TYPE fgc.capture_step AS ENUM (
  'SCOPE_SOURCE',
  'Q1_LEARNER_USE',
  'Q2_LECTURER_CAPABILITY',
  'EVIDENCE_QUALITY',
  'CONTRADICTIONS_ACTIONS',
  'SIGN_OFF'
);

CREATE TYPE fgc.decision_status AS ENUM (
  'REQUIRES_CONFIRMATION',
  'CONFIGURED_FOR_DEMO',
  'APPROVED',
  'BLOCKED'
);

CREATE TYPE fgc.rubric_area AS ENUM (
  'CURRICULUM_RELEVANCE',
  'EXPERIENCE_CREATION',
  'PLATFORM_ORGANISATION',
  'PUBLISHING_AND_DEPLOYMENT',
  'TEACHING_APPLICATION',
  'LEARNER_EVIDENCE_AND_ANALYTICS',
  'TROUBLESHOOTING_AND_REPEATABILITY'
);

CREATE OR REPLACE FUNCTION fgc.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE fgc.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  organisation_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES fgc.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, name)
);

CREATE TABLE fgc.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  external_reference TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE fgc.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES fgc.roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  UNIQUE (role_id, permission)
);

CREATE TABLE fgc.user_roles (
  user_id UUID NOT NULL REFERENCES fgc.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES fgc.roles(id) ON DELETE CASCADE,
  reporting_period_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE fgc.reporting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  starts_on DATE,
  ends_on DATE,
  workshop_name TEXT,
  scope_statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE fgc.user_roles
  ADD CONSTRAINT fk_user_roles_reporting_period
  FOREIGN KEY (reporting_period_id) REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE;

CREATE TABLE fgc.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  programme_code TEXT,
  nqf_or_level TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organisation_id, name)
);

CREATE TABLE fgc.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES fgc.programmes(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES fgc.campuses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  enrolled_learners INTEGER CHECK (enrolled_learners IS NULL OR enrolled_learners >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (programme_id, campus_id, name)
);

CREATE TABLE fgc.source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID REFERENCES fgc.reporting_periods(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  source_path TEXT,
  source_hash TEXT,
  source_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (title, source_hash)
);

CREATE TABLE fgc.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  evidence_code TEXT NOT NULL,
  question fgc.fgc_question NOT NULL,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES fgc.campuses(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_document_id UUID REFERENCES fgc.source_documents(id) ON DELETE SET NULL,
  source_date DATE,
  source_location TEXT,
  owner_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  quality_status fgc.evidence_status NOT NULL DEFAULT 'NOT_VERIFIED',
  reviewer_notes TEXT,
  limitations TEXT,
  reviewed_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporting_period_id, evidence_code)
);

CREATE TABLE fgc.eon_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  imported_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  field_definition_notes TEXT,
  source_location TEXT,
  row_count INTEGER CHECK (row_count IS NULL OR row_count >= 0),
  quality_status fgc.evidence_status NOT NULL DEFAULT 'NOT_VERIFIED'
);

CREATE TABLE fgc.timetable_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES fgc.cohorts(id) ON DELETE SET NULL,
  planned_use_date DATE NOT NULL,
  planned_start_time TIME,
  planned_end_time TIME,
  planned_context TEXT NOT NULL,
  source_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES fgc.cohorts(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  learners_present INTEGER CHECK (learners_present IS NULL OR learners_present >= 0),
  source_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.learner_use_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES fgc.campuses(id) ON DELETE SET NULL,
  programme_id UUID REFERENCES fgc.programmes(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES fgc.cohorts(id) ON DELETE SET NULL,
  use_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  use_context TEXT NOT NULL,
  active_learners INTEGER CHECK (active_learners IS NULL OR active_learners >= 0),
  enrolled_learners INTEGER CHECK (enrolled_learners IS NULL OR enrolled_learners >= 0),
  analytics_batch_id UUID REFERENCES fgc.eon_import_batches(id) ON DELETE SET NULL,
  timetable_record_id UUID REFERENCES fgc.timetable_records(id) ON DELETE SET NULL,
  attendance_record_id UUID REFERENCES fgc.attendance_records(id) ON DELETE SET NULL,
  evidence_status fgc.evidence_status NOT NULL DEFAULT 'NOT_VERIFIED',
  contradiction_summary TEXT,
  reviewer_notes TEXT,
  created_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (active_learners IS NULL OR enrolled_learners IS NULL OR active_learners <= enrolled_learners)
);

CREATE TABLE fgc.learner_use_evidence (
  learner_use_record_id UUID NOT NULL REFERENCES fgc.learner_use_records(id) ON DELETE CASCADE,
  evidence_item_id UUID NOT NULL REFERENCES fgc.evidence_items(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'SUPPORTS',
  PRIMARY KEY (learner_use_record_id, evidence_item_id)
);

CREATE TABLE fgc.experience_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES fgc.campuses(id) ON DELETE SET NULL,
  programme_id UUID REFERENCES fgc.programmes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  eon_id_or_url TEXT NOT NULL,
  author_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  curriculum_reference TEXT,
  published_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  source_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporting_period_id, eon_id_or_url)
);

CREATE TABLE fgc.lecturer_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES fgc.campuses(id) ON DELETE SET NULL,
  lecturer_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  lecturer_reference TEXT NOT NULL,
  programme_id UUID REFERENCES fgc.programmes(id) ON DELETE SET NULL,
  assessment_date DATE NOT NULL,
  experience_id UUID REFERENCES fgc.experience_register(id) ON DELETE SET NULL,
  assistance_type fgc.assistance_type NOT NULL DEFAULT 'NONE',
  facilitator_executed BOOLEAN NOT NULL DEFAULT FALSE,
  environment_fault BOOLEAN NOT NULL DEFAULT FALSE,
  environment_fault_notes TEXT,
  moderation_status fgc.moderation_status NOT NULL DEFAULT 'PENDING',
  moderator_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  assessor_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  assessor_notes TEXT,
  classification fgc.capability_classification NOT NULL DEFAULT 'NOT_ASSESSED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    NOT facilitator_executed
    OR assistance_type = 'FACILITATOR_EXECUTION'
    OR classification = 'NOT_YET_DEMONSTRATED'
  )
);

CREATE TABLE fgc.lecturer_rubric_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES fgc.lecturer_assessments(id) ON DELETE CASCADE,
  rubric_area fgc.rubric_area NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 2),
  evidence_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, rubric_area)
);

CREATE TABLE fgc.lecturer_assessment_evidence (
  assessment_id UUID NOT NULL REFERENCES fgc.lecturer_assessments(id) ON DELETE CASCADE,
  evidence_item_id UUID NOT NULL REFERENCES fgc.evidence_items(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'SUPPORTS',
  PRIMARY KEY (assessment_id, evidence_item_id)
);

CREATE TABLE fgc.contradictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  question fgc.fgc_question NOT NULL,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  learner_use_record_id UUID REFERENCES fgc.learner_use_records(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES fgc.lecturer_assessments(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  source_a_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  source_b_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  resolution_status TEXT NOT NULL DEFAULT 'OPEN',
  resolution_notes TEXT,
  created_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  contradiction_id UUID REFERENCES fgc.contradictions(id) ON DELETE SET NULL,
  issue TEXT NOT NULL,
  category TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  action TEXT NOT NULL,
  owner_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  owner_reference TEXT,
  priority fgc.action_priority NOT NULL DEFAULT 'MEDIUM',
  due_date DATE,
  status fgc.action_status NOT NULL DEFAULT 'NOT_STARTED',
  closure_evidence_required TEXT NOT NULL,
  closure_evidence_id UUID REFERENCES fgc.evidence_items(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.corrective_action_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corrective_action_id UUID NOT NULL REFERENCES fgc.corrective_actions(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  status_after_update fgc.action_status,
  updated_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.decision_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  decision_code TEXT NOT NULL,
  decision TEXT NOT NULL,
  current_default TEXT NOT NULL,
  production_owner TEXT NOT NULL,
  status fgc.decision_status NOT NULL DEFAULT 'REQUIRES_CONFIRMATION',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reporting_period_id, decision_code)
);

CREATE TABLE fgc.sign_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  signoff_stage TEXT NOT NULL,
  signed_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  signed_by_reference TEXT,
  finding_readiness TEXT NOT NULL,
  q1_finding_summary TEXT,
  q2_finding_summary TEXT,
  limitations TEXT NOT NULL,
  unresolved_items TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.capture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporting_period_id UUID NOT NULL REFERENCES fgc.reporting_periods(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES fgc.organisations(id) ON DELETE SET NULL,
  created_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  current_step fgc.capture_step NOT NULL DEFAULT 'SCOPE_SOURCE',
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.capture_step_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_session_id UUID NOT NULL REFERENCES fgc.capture_sessions(id) ON DELETE CASCADE,
  step fgc.capture_step NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (capture_session_id, step)
);

CREATE TABLE fgc.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fgc_evidence_reporting_question ON fgc.evidence_items (reporting_period_id, question, quality_status);
CREATE INDEX idx_fgc_learner_use_reporting_status ON fgc.learner_use_records (reporting_period_id, evidence_status);
CREATE INDEX idx_fgc_learner_use_college_date ON fgc.learner_use_records (organisation_id, use_date);
CREATE INDEX idx_fgc_assessments_reporting_classification ON fgc.lecturer_assessments (reporting_period_id, classification);
CREATE INDEX idx_fgc_actions_reporting_status ON fgc.corrective_actions (reporting_period_id, status, priority);
CREATE INDEX idx_fgc_contradictions_reporting_status ON fgc.contradictions (reporting_period_id, resolution_status);
CREATE INDEX idx_fgc_capture_payload_gin ON fgc.capture_step_entries USING GIN (payload);

CREATE TRIGGER trg_organisations_updated_at BEFORE UPDATE ON fgc.organisations FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_campuses_updated_at BEFORE UPDATE ON fgc.campuses FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON fgc.users FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_reporting_periods_updated_at BEFORE UPDATE ON fgc.reporting_periods FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_programmes_updated_at BEFORE UPDATE ON fgc.programmes FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_cohorts_updated_at BEFORE UPDATE ON fgc.cohorts FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_evidence_items_updated_at BEFORE UPDATE ON fgc.evidence_items FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_learner_use_updated_at BEFORE UPDATE ON fgc.learner_use_records FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_experience_register_updated_at BEFORE UPDATE ON fgc.experience_register FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_lecturer_assessments_updated_at BEFORE UPDATE ON fgc.lecturer_assessments FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_contradictions_updated_at BEFORE UPDATE ON fgc.contradictions FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_corrective_actions_updated_at BEFORE UPDATE ON fgc.corrective_actions FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_decision_register_updated_at BEFORE UPDATE ON fgc.decision_register FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_capture_sessions_updated_at BEFORE UPDATE ON fgc.capture_sessions FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();
CREATE TRIGGER trg_capture_step_entries_updated_at BEFORE UPDATE ON fgc.capture_step_entries FOR EACH ROW EXECUTE FUNCTION fgc.set_updated_at();

CREATE OR REPLACE VIEW fgc.v_lecturer_assessment_scoring AS
SELECT
  a.id AS assessment_id,
  a.reporting_period_id,
  a.organisation_id,
  a.lecturer_reference,
  COUNT(s.id) AS scored_areas,
  COALESCE(SUM(s.score), 0) AS total_score,
  bool_or(s.score = 0) AS has_failed_area,
  bool_and(s.score = 2) FILTER (WHERE s.id IS NOT NULL) AS all_areas_independent,
  a.facilitator_executed,
  a.assistance_type,
  CASE
    WHEN COUNT(s.id) = 0 THEN 'NOT_ASSESSED'::fgc.capability_classification
    WHEN a.facilitator_executed THEN 'NOT_YET_DEMONSTRATED'::fgc.capability_classification
    WHEN COUNT(s.id) = 7 AND bool_and(s.score = 2) THEN 'INDEPENDENT'::fgc.capability_classification
    WHEN bool_or(s.score = 0) THEN 'NOT_YET_DEMONSTRATED'::fgc.capability_classification
    ELSE 'PARTIALLY_INDEPENDENT_SUPPORT_REQUIRED'::fgc.capability_classification
  END AS calculated_classification
FROM fgc.lecturer_assessments a
LEFT JOIN fgc.lecturer_rubric_scores s ON s.assessment_id = a.id
GROUP BY a.id;

CREATE OR REPLACE VIEW fgc.v_dashboard_summary AS
SELECT
  rp.id AS reporting_period_id,
  rp.name AS reporting_period,
  COUNT(DISTINCT lu.id) FILTER (WHERE lu.evidence_status = 'VERIFIED') AS verified_learner_use_records,
  COALESCE(SUM(lu.active_learners) FILTER (WHERE lu.evidence_status = 'VERIFIED'), 0) AS verified_active_learners,
  COUNT(DISTINCT lu.id) FILTER (WHERE lu.evidence_status = 'CONTRADICTED') AS contradicted_learner_use_records,
  COUNT(DISTINCT las.assessment_id) FILTER (WHERE las.calculated_classification = 'INDEPENDENT') AS independent_lecturers,
  COUNT(DISTINCT las.assessment_id) FILTER (WHERE las.calculated_classification = 'PARTIALLY_INDEPENDENT_SUPPORT_REQUIRED') AS support_required_lecturers,
  COUNT(DISTINCT ei.id) FILTER (WHERE ei.quality_status <> 'VERIFIED') AS non_verified_evidence_items,
  COUNT(DISTINCT ca.id) FILTER (WHERE ca.status <> 'COMPLETE') AS open_corrective_actions
FROM fgc.reporting_periods rp
LEFT JOIN fgc.learner_use_records lu ON lu.reporting_period_id = rp.id
LEFT JOIN fgc.v_lecturer_assessment_scoring las ON las.reporting_period_id = rp.id
LEFT JOIN fgc.evidence_items ei ON ei.reporting_period_id = rp.id
LEFT JOIN fgc.corrective_actions ca ON ca.reporting_period_id = rp.id
GROUP BY rp.id, rp.name;

CREATE OR REPLACE VIEW fgc.v_evidence_status_summary AS
SELECT
  reporting_period_id,
  question,
  quality_status,
  COUNT(*) AS evidence_count
FROM fgc.evidence_items
GROUP BY reporting_period_id, question, quality_status;

CREATE OR REPLACE VIEW fgc.v_college_learner_use_comparison AS
SELECT
  rp.id AS reporting_period_id,
  o.id AS organisation_id,
  o.name AS college,
  COUNT(lu.id) AS learner_use_records,
  COALESCE(SUM(lu.active_learners), 0) AS active_learners_recorded,
  COALESCE(SUM(lu.enrolled_learners), 0) AS enrolled_learners_recorded,
  COUNT(lu.id) FILTER (WHERE lu.evidence_status = 'VERIFIED') AS verified_records,
  COUNT(lu.id) FILTER (WHERE lu.evidence_status = 'CONTRADICTED') AS contradicted_records
FROM fgc.reporting_periods rp
JOIN fgc.learner_use_records lu ON lu.reporting_period_id = rp.id
LEFT JOIN fgc.organisations o ON o.id = lu.organisation_id
GROUP BY rp.id, o.id, o.name;
