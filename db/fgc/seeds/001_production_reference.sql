-- Production reference seed for FGC roles and permissions.
-- This file is safe to run repeatedly and contains no synthetic users,
-- submissions, evidence, analytics, assessments or reports.

INSERT INTO fgc.roles (code, name, description)
VALUES
  ('LECTURER', 'Lecturer', 'Submits lecturer evidence, EON experience references and data-capture responses for assigned scope.'),
  ('COLLEGE_EVIDENCE_OWNER', 'College Evidence Owner', 'Coordinates college evidence, validates campus submissions and manages college-level evidence readiness.'),
  ('COLLEGE_LEAD_ADMIN', 'College Lead Administrator', 'Administers college users, scope and evidence workflow for an approved TVET college.'),
  ('ASSESSOR', 'Assessor / Evidence Officer', 'Reviews evidence quality, evaluates submissions and records assessment decisions.'),
  ('MODERATOR', 'Moderator', 'Moderates assessment decisions and confirms or adjusts verified findings.'),
  ('JEF_ADMINISTRATOR', 'JEF Administrator', 'Administers FGC workflows, reference data quality, users, reports and audit readiness.'),
  ('MERSETA_VIEWER', 'merSETA Viewer', 'Views approved dashboards, reports, limitations and evidence-backed findings.'),
  ('MERSETA_ADMINISTRATOR', 'merSETA Administrator', 'Administers merSETA oversight users and approved reporting workflows.'),
  ('PLATFORM_SUPER_ADMINISTRATOR', 'Platform Super Administrator', 'Maintains platform configuration and emergency administrative controls.')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO fgc.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM fgc.roles r
JOIN (
  VALUES
    ('LECTURER', 'submission:create_own'),
    ('LECTURER', 'submission:read_own'),
    ('LECTURER', 'evidence:upload_own'),
    ('LECTURER', 'feedback:read_own'),
    ('COLLEGE_EVIDENCE_OWNER', 'college:evidence_read'),
    ('COLLEGE_EVIDENCE_OWNER', 'college:evidence_upload'),
    ('COLLEGE_EVIDENCE_OWNER', 'college:submission_review'),
    ('COLLEGE_EVIDENCE_OWNER', 'college:corrective_actions_manage'),
    ('COLLEGE_LEAD_ADMIN', 'college:users_manage'),
    ('COLLEGE_LEAD_ADMIN', 'college:roles_approve'),
    ('COLLEGE_LEAD_ADMIN', 'college:dashboard_read'),
    ('ASSESSOR', 'assessment:evidence_review'),
    ('ASSESSOR', 'assessment:decision_record'),
    ('MODERATOR', 'moderation:review'),
    ('MODERATOR', 'moderation:decision_record'),
    ('JEF_ADMINISTRATOR', 'fgc:workflow_admin'),
    ('JEF_ADMINISTRATOR', 'fgc:reference_data_manage'),
    ('JEF_ADMINISTRATOR', 'fgc:reports_generate'),
    ('JEF_ADMINISTRATOR', 'fgc:audit_read'),
    ('MERSETA_VIEWER', 'merseta:approved_reports_read'),
    ('MERSETA_VIEWER', 'merseta:dashboard_read'),
    ('MERSETA_ADMINISTRATOR', 'merseta:users_manage'),
    ('MERSETA_ADMINISTRATOR', 'merseta:reports_approve'),
    ('PLATFORM_SUPER_ADMINISTRATOR', 'platform:super_admin')
) AS p(role_code, permission) ON p.role_code = r.code
ON CONFLICT (role_id, permission) DO NOTHING;
