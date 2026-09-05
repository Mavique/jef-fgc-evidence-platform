-- Canonical assessor and moderator responsibility with immutable assignment history.
-- Forward-only and idempotent. Historical evidence-review rows are not assignments.

CREATE TABLE IF NOT EXISTS fgc.review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fgc.production_submissions(id) ON DELETE RESTRICT,
  submission_version_id uuid NOT NULL REFERENCES fgc.production_submission_versions(id) ON DELETE RESTRICT,
  assignment_type text NOT NULL CHECK (assignment_type IN ('ASSESSOR', 'MODERATOR')),
  assignee_user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  assigned_by uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  reporting_period_id uuid REFERENCES fgc.reporting_periods(id) ON DELETE RESTRICT,
  college_id uuid REFERENCES fgc.tvet_colleges(id) ON DELETE RESTRICT,
  campus_id uuid REFERENCES fgc.campus_sites(id) ON DELETE RESTRICT,
  programme_id uuid REFERENCES fgc.curriculum_programmes(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVOKED', 'SUPERSEDED')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  revoked_at timestamptz,
  superseded_at timestamptz,
  reassignment_of uuid REFERENCES fgc.review_assignments(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  closed_reason text,
  concurrency_version integer NOT NULL DEFAULT 1 CHECK (concurrency_version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fgc.assessor_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES fgc.review_assignments(id) ON DELETE RESTRICT,
  submission_id uuid NOT NULL REFERENCES fgc.production_submissions(id) ON DELETE RESTRICT,
  submission_version_id uuid NOT NULL REFERENCES fgc.production_submission_versions(id) ON DELETE RESTRICT,
  assessor_user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED')),
  decisions jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);

CREATE TABLE IF NOT EXISTS fgc.moderation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL UNIQUE REFERENCES fgc.review_assignments(id) ON DELETE RESTRICT,
  submission_id uuid NOT NULL REFERENCES fgc.production_submissions(id) ON DELETE RESTRICT,
  submission_version_id uuid NOT NULL REFERENCES fgc.production_submission_versions(id) ON DELETE RESTRICT,
  moderator_user_id uuid NOT NULL REFERENCES fgc.production_users(id) ON DELETE RESTRICT,
  assessor_review_id uuid NOT NULL REFERENCES fgc.assessor_reviews(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CHANGED', 'FURTHER_EVIDENCE_REQUESTED', 'REASSESSMENT_REQUESTED')),
  outcome jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finalized_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_review_assignments_one_active_stage
  ON fgc.review_assignments(submission_id, assignment_type)
  WHERE status IN ('ASSIGNED', 'IN_PROGRESS');

CREATE INDEX IF NOT EXISTS idx_fgc_review_assignments_assignee_queue
  ON fgc.review_assignments(assignee_user_id, assignment_type, status, due_at);

CREATE INDEX IF NOT EXISTS idx_fgc_review_assignments_scope
  ON fgc.review_assignments(college_id, campus_id, programme_id, reporting_period_id, assignment_type);

CREATE INDEX IF NOT EXISTS idx_fgc_review_assignments_submission_history
  ON fgc.review_assignments(submission_id, assigned_at DESC);

CREATE OR REPLACE FUNCTION fgc.validate_review_assignment_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = fgc, pg_catalog
AS $$
DECLARE
  version_submission uuid;
  submission_reporting_period uuid;
  submission_college uuid;
  submission_campus uuid;
  submission_programme uuid;
  assignee_role_code text;
  assignee_state fgc.account_state;
BEGIN
  SELECT submission_id INTO version_submission
  FROM fgc.production_submission_versions
  WHERE id = NEW.submission_version_id;
  IF version_submission IS NULL OR version_submission <> NEW.submission_id THEN
    RAISE EXCEPTION 'review assignment version does not belong to submission';
  END IF;

  SELECT reporting_period_id, college_id, campus_id, programme_id
  INTO submission_reporting_period, submission_college, submission_campus, submission_programme
  FROM fgc.production_submissions
  WHERE id = NEW.submission_id;
  IF submission_reporting_period IS DISTINCT FROM NEW.reporting_period_id
    OR submission_college IS DISTINCT FROM NEW.college_id
    OR submission_campus IS DISTINCT FROM NEW.campus_id
    OR submission_programme IS DISTINCT FROM NEW.programme_id THEN
    RAISE EXCEPTION 'review assignment scope must match submission scope';
  END IF;

  IF EXISTS (
    SELECT 1 FROM fgc.production_submissions
    WHERE id = NEW.submission_id AND submitted_by = NEW.assignee_user_id
  ) THEN
    RAISE EXCEPTION 'the submitting lecturer cannot be assigned as a reviewer';
  END IF;

  SELECT u.account_state, r.code
  INTO assignee_state, assignee_role_code
  FROM fgc.production_users u
  JOIN fgc.production_role_assignments pra ON pra.user_id = u.id AND pra.status = 'APPROVED'
  JOIN fgc.roles r ON r.id = pra.role_id
  WHERE u.id = NEW.assignee_user_id
    AND u.deleted_at IS NULL
    AND pra.tvet_college_id IS NOT DISTINCT FROM NEW.college_id
    AND (NEW.campus_id IS NULL OR pra.campus_id IS NULL OR pra.campus_id = NEW.campus_id)
    AND (NEW.assignment_type = 'ASSESSOR' AND r.code = 'ASSESSOR'
      OR NEW.assignment_type = 'MODERATOR' AND r.code = 'MODERATOR')
  LIMIT 1;
  IF assignee_state IS DISTINCT FROM 'ACTIVE'::fgc.account_state OR assignee_role_code IS NULL THEN
    RAISE EXCEPTION 'review assignment assignee is not an active approved reviewer';
  END IF;

  IF NEW.reassignment_of IS NOT NULL THEN
    PERFORM 1
    FROM fgc.review_assignments previous
    WHERE previous.id = NEW.reassignment_of
      AND previous.submission_id = NEW.submission_id
      AND previous.assignment_type = NEW.assignment_type
      AND previous.status = 'SUPERSEDED';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'review assignment reassignment chain is invalid';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fgc_review_assignment_version ON fgc.review_assignments;
CREATE TRIGGER trg_fgc_review_assignment_version
BEFORE INSERT OR UPDATE OF submission_id, submission_version_id, assignment_type, assignee_user_id, reporting_period_id, college_id, campus_id, programme_id, reassignment_of
ON fgc.review_assignments
FOR EACH ROW EXECUTE FUNCTION fgc.validate_review_assignment_version();

CREATE OR REPLACE FUNCTION fgc.validate_review_record_assignment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = fgc, pg_catalog
AS $$
DECLARE
  assignment_type_value text;
  assigned_user uuid;
  assignment_submission uuid;
  assignment_version uuid;
  assessor_status text;
BEGIN
  SELECT assignment_type, assignee_user_id, submission_id, submission_version_id
  INTO assignment_type_value, assigned_user, assignment_submission, assignment_version
  FROM fgc.review_assignments
  WHERE id = NEW.assignment_id;

  IF TG_TABLE_NAME = 'assessor_reviews' THEN
    IF assignment_type_value IS DISTINCT FROM 'ASSESSOR'
      OR assigned_user IS DISTINCT FROM NEW.assessor_user_id
      OR assignment_submission IS DISTINCT FROM NEW.submission_id
      OR assignment_version IS DISTINCT FROM NEW.submission_version_id THEN
      RAISE EXCEPTION 'assessor review does not match its assessor assignment';
    END IF;
  ELSE
    IF assignment_type_value IS DISTINCT FROM 'MODERATOR'
      OR assigned_user IS DISTINCT FROM NEW.moderator_user_id
      OR assignment_submission IS DISTINCT FROM NEW.submission_id
      OR assignment_version IS DISTINCT FROM NEW.submission_version_id THEN
      RAISE EXCEPTION 'moderation record does not match its moderator assignment';
    END IF;
    SELECT status INTO assessor_status FROM fgc.assessor_reviews WHERE id = NEW.assessor_review_id;
    IF assessor_status IS DISTINCT FROM 'SUBMITTED' THEN
      RAISE EXCEPTION 'moderation record requires a submitted assessor review';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fgc_assessor_review_assignment ON fgc.assessor_reviews;
CREATE TRIGGER trg_fgc_assessor_review_assignment
BEFORE INSERT OR UPDATE OF assignment_id, submission_id, submission_version_id, assessor_user_id
ON fgc.assessor_reviews
FOR EACH ROW EXECUTE FUNCTION fgc.validate_review_record_assignment();

DROP TRIGGER IF EXISTS trg_fgc_moderation_record_assignment ON fgc.moderation_records;
CREATE TRIGGER trg_fgc_moderation_record_assignment
BEFORE INSERT OR UPDATE OF assignment_id, submission_id, submission_version_id, moderator_user_id, assessor_review_id
ON fgc.moderation_records
FOR EACH ROW EXECUTE FUNCTION fgc.validate_review_record_assignment();
