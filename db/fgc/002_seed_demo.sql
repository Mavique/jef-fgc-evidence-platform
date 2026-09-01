-- Demo seed data for merSETA FGC for EKM.
-- Values are synthetic and must not be represented as verified production outcomes.

WITH orgs AS (
  INSERT INTO fgc.organisations (name, organisation_type, notes)
  VALUES
    ('Jengrac Education Foundation', 'IMPLEMENTER', 'JEF platform administrator and evidence workflow owner.'),
    ('merSETA', 'OVERSIGHT', 'Oversight and reporting stakeholder.'),
    ('EON Reality', 'TECHNOLOGY_PARTNER', 'EON-XR analytics/source stakeholder.'),
    ('Demonstration College 01', 'TVET_COLLEGE', 'Synthetic demo college.'),
    ('Demonstration College 02', 'TVET_COLLEGE', 'Synthetic demo college.'),
    ('Demonstration College 03', 'TVET_COLLEGE', 'Synthetic demo college.'),
    ('Demonstration College 04', 'TVET_COLLEGE', 'Synthetic demo college.')
  ON CONFLICT (name) DO NOTHING
  RETURNING id, name
),
period AS (
  INSERT INTO fgc.reporting_periods (name, starts_on, ends_on, workshop_name, scope_statement, status)
  VALUES (
    'September 2026 FGC evidence-validation workshop',
    DATE '2026-09-08',
    DATE '2026-09-10',
    'merSETA EON FGC Evidence Validation Workshop',
    'Demonstration national scope for validating learner use and lecturer independence using supplied workshop artefacts.',
    'DEMO'
  )
  ON CONFLICT (name) DO UPDATE SET scope_statement = EXCLUDED.scope_statement
  RETURNING id
),
roles AS (
  INSERT INTO fgc.roles (code, name, description)
  VALUES
    ('COLLEGE_EVIDENCE_OWNER', 'College Evidence Owner', 'Uploads college records, validates proposed learner-use findings and submits action plans.'),
    ('LECTURER', 'Lecturer', 'Submits EON experience references and views moderated feedback.'),
    ('XR_AMBASSADOR', 'XR Ambassador', 'Coordinates reinforcement and intervention evidence.'),
    ('ASSESSOR', 'Assessor', 'Observes build challenges and scores rubric evidence.'),
    ('MODERATOR', 'Moderator', 'Reviews borderline cases and locks moderated results.'),
    ('WORKSHOP_LEAD', 'Workshop Lead', 'Controls session gates, scope and sign-off.'),
    ('EVIDENCE_LEAD', 'Evidence Lead', 'Indexes sources, quality-checks evidence and controls version history.'),
    ('JEF_ADMINISTRATOR', 'JEF Administrator', 'Administers workflow, data quality and reporting.'),
    ('MERSETA_OVERSIGHT', 'merSETA Oversight', 'Reviews approved summaries, limitations and evidence-backed actions.'),
    ('EON_ANALYTICS_LEAD', 'EON Analytics Lead', 'Supplies analytics exports and documents limitations.'),
    ('EXECUTIVE_VIEWER', 'Executive Viewer', 'Views approved summaries and governed reports.')
  ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description
  RETURNING id, code
)
INSERT INTO fgc.role_permissions (role_id, permission)
SELECT r.id, p.permission
FROM roles r
JOIN (
  VALUES
    ('COLLEGE_EVIDENCE_OWNER', 'Upload college records'),
    ('COLLEGE_EVIDENCE_OWNER', 'Submit corrective-action plans'),
    ('LECTURER', 'Submit EON URL or ID'),
    ('ASSESSOR', 'Score lecturer capability rubric'),
    ('MODERATOR', 'Lock moderated assessment results'),
    ('WORKSHOP_LEAD', 'Freeze FGC findings'),
    ('EVIDENCE_LEAD', 'Quality-check sources'),
    ('JEF_ADMINISTRATOR', 'Administer workflow'),
    ('MERSETA_OVERSIGHT', 'Review national findings'),
    ('EON_ANALYTICS_LEAD', 'Supply analytics exports'),
    ('EXECUTIVE_VIEWER', 'View approved summaries')
) AS p(role_code, permission) ON p.role_code = r.code
ON CONFLICT (role_id, permission) DO NOTHING;

INSERT INTO fgc.campuses (organisation_id, name, location)
SELECT o.id, c.campus, c.location
FROM fgc.organisations o
JOIN (
  VALUES
    ('Demonstration College 01', 'Engineering Campus', 'Synthetic'),
    ('Demonstration College 02', 'Central Campus', 'Synthetic'),
    ('Demonstration College 03', 'Skills Centre', 'Synthetic'),
    ('Demonstration College 04', 'Main Campus', 'Synthetic')
) AS c(org_name, campus, location) ON c.org_name = o.name
ON CONFLICT (organisation_id, name) DO NOTHING;

INSERT INTO fgc.users (organisation_id, display_name, email, external_reference)
SELECT o.id, u.display_name, u.email, u.external_reference
FROM (
  VALUES
    ('Jengrac Education Foundation', 'JEF Administrator', 'jef.admin@example.invalid', 'DEMO-JEF-ADMIN'),
    ('merSETA', 'merSETA Oversight', 'merseta.oversight@example.invalid', 'DEMO-MERSETA'),
    ('EON Reality', 'EON Analytics Lead', 'eon.analytics@example.invalid', 'DEMO-EON'),
    ('Demonstration College 01', 'College Evidence Owner A', 'college01.evidence@example.invalid', 'DEMO-CEO-01'),
    ('Demonstration College 01', 'Lecturer A', 'lecturer.a@example.invalid', 'DEMO-LECT-A'),
    ('Demonstration College 02', 'Lecturer B', 'lecturer.b@example.invalid', 'DEMO-LECT-B'),
    ('Demonstration College 03', 'Lecturer C', 'lecturer.c@example.invalid', 'DEMO-LECT-C'),
    ('Demonstration College 04', 'Lecturer D', 'lecturer.d@example.invalid', 'DEMO-LECT-D')
) AS u(org_name, display_name, email, external_reference)
JOIN fgc.organisations o ON o.name = u.org_name
ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO fgc.source_documents (reporting_period_id, title, document_type, source_path, source_date, notes)
SELECT rp.id, d.title, d.document_type, d.source_path, DATE '2026-09-01', 'Source-of-truth workshop artefact supplied by user.'
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('EON Workshop Agenda SEPT 2026 - FGC Evidence Validation.pdf', 'AGENDA', 'C:\Users\victo\OneDrive\Documents\merset 2026 Workshop\EON Workshop Agenda SEPT 2026 - FGC Evidence Validation.pdf'),
    ('merSETA EON FGC Evidence Tracker - September 2026.xlsx', 'WORKBOOK', 'C:\Users\victo\OneDrive\Documents\merset 2026 Workshop\merSETA EON FGC Evidence Tracker - September 2026.xlsx'),
    ('merSETA EON FGC Evidence Validation Toolkit - September 2026.pdf', 'TOOLKIT', 'C:\Users\victo\OneDrive\Documents\merset 2026 Workshop\merSETA EON FGC Evidence Validation Toolkit - September 2026.pdf'),
    ('merSETA EON FGC Evidence Validation Workshop Facilitator Guide - September 2026.pdf', 'FACILITATOR_GUIDE', 'C:\Users\victo\OneDrive\Documents\merset 2026 Workshop\merSETA EON FGC Evidence Validation Workshop Facilitator Guide - September 2026.pdf')
) AS d(title, document_type, source_path)
WHERE rp.name = 'September 2026 FGC evidence-validation workshop'
ON CONFLICT (title, source_hash) DO NOTHING;

INSERT INTO fgc.programmes (organisation_id, name, programme_code, nqf_or_level)
SELECT o.id, p.name, p.programme_code, p.level
FROM fgc.organisations o
JOIN (
  VALUES
    ('Demonstration College 01', 'Engineering Studies', 'ENG-DEMO', 'N3'),
    ('Demonstration College 02', 'Automotive', 'AUTO-DEMO', 'Level 2'),
    ('Demonstration College 03', 'Electrical', 'ELEC-DEMO', 'N2'),
    ('Demonstration College 04', 'Mechatronics', 'MECH-DEMO', 'Pilot')
) AS p(org_name, name, programme_code, level) ON p.org_name = o.name
ON CONFLICT (organisation_id, name) DO NOTHING;

INSERT INTO fgc.cohorts (programme_id, campus_id, name, enrolled_learners)
SELECT p.id, c.id, cohort.name, cohort.enrolled
FROM (
  VALUES
    ('Demonstration College 01', 'Engineering Campus', 'Engineering Studies', 'Fitting N3', 42),
    ('Demonstration College 02', 'Central Campus', 'Automotive', 'Level 2', 31),
    ('Demonstration College 03', 'Skills Centre', 'Electrical', 'N2', 35),
    ('Demonstration College 04', 'Main Campus', 'Mechatronics', 'Pilot group', 28)
) AS cohort(org_name, campus_name, programme_name, name, enrolled)
JOIN fgc.organisations o ON o.name = cohort.org_name
JOIN fgc.campuses c ON c.organisation_id = o.id AND c.name = cohort.campus_name
JOIN fgc.programmes p ON p.organisation_id = o.id AND p.name = cohort.programme_name
ON CONFLICT (programme_id, campus_id, name) DO NOTHING;

INSERT INTO fgc.evidence_items (
  reporting_period_id,
  evidence_code,
  question,
  organisation_id,
  campus_id,
  evidence_type,
  source_name,
  source_date,
  source_location,
  owner_user_id,
  quality_status,
  reviewer_notes
)
SELECT rp.id, e.evidence_code, e.question::fgc.fgc_question, o.id, c.id, e.evidence_type, e.source_name, e.source_date::date, e.source_location, u.id, e.quality_status::fgc.evidence_status, e.reviewer_notes
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('EVI-Q1-001', 'Q1_LEARNER_UTILISATION', 'Demonstration College 01', 'Engineering Campus', 'Platform analytics export', 'EON active users by session export v1', '2026-09-08', 'EON-DEMO-EXPORT-Q1-001', 'eon.analytics@example.invalid', 'VERIFIED', 'Matched against timetable and learner register for engineering cohort.'),
    ('EVI-Q1-002', 'Q1_LEARNER_UTILISATION', 'Demonstration College 02', 'Central Campus', 'College timetable', 'Workshop timetable and lesson plan pack', '2026-09-08', 'COLLEGE02-TIMETABLE-DEMO', 'college01.evidence@example.invalid', 'CONTRADICTED', 'Planned activity not present in analytics export for the same time band.'),
    ('EVI-Q2-001', 'Q2_LECTURER_CAPABILITY', 'Demonstration College 01', 'Engineering Campus', 'Moderated rubric', 'Independent build challenge rubric A12', '2026-09-09', 'RUBRIC-A12-DEMO', 'jef.admin@example.invalid', 'VERIFIED', 'Author, publish, assignment and teach-back evidence all linked.'),
    ('EVI-Q2-002', 'Q2_LECTURER_CAPABILITY', 'Demonstration College 03', 'Skills Centre', 'Assistance log', 'Build challenge observation log B07', '2026-09-09', 'OBS-B07-DEMO', 'jef.admin@example.invalid', 'PARTIALLY_VERIFIED', 'Technical intervention separated from participant capability.'),
    ('EVI-ACT-001', 'SHARED', 'Demonstration College 02', 'Central Campus', 'Corrective-action register', '30/60/90 activation plan v1', '2026-09-10', 'ACTION-PLAN-DEMO', 'college01.evidence@example.invalid', 'PARTIALLY_VERIFIED', '60-day closure evidence still due.')
) AS e(evidence_code, question, org_name, campus_name, evidence_type, source_name, source_date, source_location, owner_email, quality_status, reviewer_notes)
JOIN fgc.organisations o ON o.name = e.org_name
JOIN fgc.campuses c ON c.organisation_id = o.id AND c.name = e.campus_name
LEFT JOIN fgc.users u ON u.email = e.owner_email
WHERE rp.name = 'September 2026 FGC evidence-validation workshop'
ON CONFLICT (reporting_period_id, evidence_code) DO UPDATE SET quality_status = EXCLUDED.quality_status, reviewer_notes = EXCLUDED.reviewer_notes;

INSERT INTO fgc.eon_import_batches (reporting_period_id, source_name, imported_by, field_definition_notes, source_location, row_count, quality_status)
SELECT rp.id, 'EON active users by session export v1', u.id, 'Synthetic export. Production fields require EON confirmation.', 'EON-DEMO-EXPORT-Q1-001', 4, 'PARTIALLY_VERIFIED'
FROM fgc.reporting_periods rp
LEFT JOIN fgc.users u ON u.email = 'eon.analytics@example.invalid'
WHERE rp.name = 'September 2026 FGC evidence-validation workshop';

INSERT INTO fgc.learner_use_records (
  reporting_period_id,
  organisation_id,
  campus_id,
  programme_id,
  cohort_id,
  use_date,
  start_time,
  end_time,
  use_context,
  active_learners,
  enrolled_learners,
  evidence_status,
  contradiction_summary,
  reviewer_notes
)
SELECT rp.id, o.id, c.id, p.id, co.id, lu.use_date::date, lu.start_time::time, lu.end_time::time, lu.context, lu.active, lu.enrolled, lu.status::fgc.evidence_status, lu.contradiction, lu.notes
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('Demonstration College 01', 'Engineering Campus', 'Engineering Studies', 'Fitting N3', '2026-09-08', '09:00', '11:00', 'Scheduled class', 38, 42, 'VERIFIED', NULL, 'Matched to analytics and register.'),
    ('Demonstration College 02', 'Central Campus', 'Automotive', 'Level 2', '2026-09-08', '11:00', '13:00', 'Scheduled class', NULL, 31, 'CONTRADICTED', 'Timetable indicates use, but analytics export contains no matching learner activity.', 'Requires reconciliation.'),
    ('Demonstration College 03', 'Skills Centre', 'Electrical', 'N2', '2026-09-09', NULL, NULL, 'Independent study', 11, 35, 'PARTIALLY_VERIFIED', NULL, 'After-hours use needs stronger attendance link.'),
    ('Demonstration College 04', 'Main Campus', 'Mechatronics', 'Pilot group', '2026-09-09', NULL, NULL, 'No meaningful use', NULL, 28, 'NOT_VERIFIED', NULL, 'No active learner evidence available.')
) AS lu(org_name, campus_name, programme_name, cohort_name, use_date, start_time, end_time, context, active, enrolled, status, contradiction, notes)
JOIN fgc.organisations o ON o.name = lu.org_name
JOIN fgc.campuses c ON c.organisation_id = o.id AND c.name = lu.campus_name
JOIN fgc.programmes p ON p.organisation_id = o.id AND p.name = lu.programme_name
JOIN fgc.cohorts co ON co.programme_id = p.id AND co.campus_id = c.id AND co.name = lu.cohort_name
WHERE rp.name = 'September 2026 FGC evidence-validation workshop';

INSERT INTO fgc.experience_register (reporting_period_id, organisation_id, campus_id, programme_id, title, eon_id_or_url, author_user_id, curriculum_reference)
SELECT rp.id, o.id, c.id, p.id, exp.title, exp.eon_id, u.id, exp.curriculum
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('Demonstration College 01', 'Engineering Campus', 'Engineering Studies', 'Hydraulic Safety Procedure', 'EON-DEMO-001', 'lecturer.a@example.invalid', 'Engineering Studies'),
    ('Demonstration College 02', 'Central Campus', 'Automotive', 'Engine Component Identification', 'EON-DEMO-002', 'lecturer.b@example.invalid', 'Automotive'),
    ('Demonstration College 03', 'Skills Centre', 'Electrical', 'Circuit Fault Finding', 'EON-DEMO-003', 'lecturer.c@example.invalid', 'Electrical'),
    ('Demonstration College 04', 'Main Campus', 'Mechatronics', 'PLC Sequence Simulation', 'EON-PENDING', 'lecturer.d@example.invalid', 'Mechatronics')
) AS exp(org_name, campus_name, programme_name, title, eon_id, lecturer_email, curriculum)
JOIN fgc.organisations o ON o.name = exp.org_name
JOIN fgc.campuses c ON c.organisation_id = o.id AND c.name = exp.campus_name
JOIN fgc.programmes p ON p.organisation_id = o.id AND p.name = exp.programme_name
LEFT JOIN fgc.users u ON u.email = exp.lecturer_email
WHERE rp.name = 'September 2026 FGC evidence-validation workshop'
ON CONFLICT (reporting_period_id, eon_id_or_url) DO NOTHING;

INSERT INTO fgc.lecturer_assessments (
  reporting_period_id,
  organisation_id,
  campus_id,
  lecturer_user_id,
  lecturer_reference,
  programme_id,
  assessment_date,
  experience_id,
  assistance_type,
  facilitator_executed,
  environment_fault,
  moderation_status,
  classification,
  assessor_notes
)
SELECT rp.id, o.id, c.id, u.id, a.lecturer_reference, p.id, DATE '2026-09-09', exp.id, a.assistance::fgc.assistance_type, a.facilitator_executed, a.environment_fault, a.moderation::fgc.moderation_status, a.classification::fgc.capability_classification, a.notes
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('Demonstration College 01', 'Engineering Campus', 'Engineering Studies', 'lecturer.a@example.invalid', 'Lecturer A', 'EON-DEMO-001', 'NONE', FALSE, FALSE, 'CONFIRMED', 'INDEPENDENT', 'Observed independently under own author account.'),
    ('Demonstration College 02', 'Central Campus', 'Automotive', 'lecturer.b@example.invalid', 'Lecturer B', 'EON-DEMO-002', 'PROMPTING', FALSE, FALSE, 'PENDING', 'PARTIALLY_INDEPENDENT_SUPPORT_REQUIRED', 'Prompting recorded; no facilitator execution.'),
    ('Demonstration College 03', 'Skills Centre', 'Electrical', 'lecturer.c@example.invalid', 'Lecturer C', 'EON-DEMO-003', 'FACILITATOR_EXECUTION', TRUE, FALSE, 'CHANGED', 'NOT_YET_DEMONSTRATED', 'Facilitator executed publish step; independence invalidated.'),
    ('Demonstration College 04', 'Main Campus', 'Mechatronics', 'lecturer.d@example.invalid', 'Lecturer D', 'EON-PENDING', 'TECHNICAL_INTERVENTION', FALSE, TRUE, 'REASSESSMENT_REQUESTED', 'NOT_ASSESSED', 'Environment fault prevented assessment.')
) AS a(org_name, campus_name, programme_name, lecturer_email, lecturer_reference, eon_id, assistance, facilitator_executed, environment_fault, moderation, classification, notes)
JOIN fgc.organisations o ON o.name = a.org_name
JOIN fgc.campuses c ON c.organisation_id = o.id AND c.name = a.campus_name
JOIN fgc.programmes p ON p.organisation_id = o.id AND p.name = a.programme_name
LEFT JOIN fgc.users u ON u.email = a.lecturer_email
LEFT JOIN fgc.experience_register exp ON exp.reporting_period_id = rp.id AND exp.eon_id_or_url = a.eon_id
WHERE rp.name = 'September 2026 FGC evidence-validation workshop';

INSERT INTO fgc.lecturer_rubric_scores (assessment_id, rubric_area, score, evidence_note)
SELECT a.id, r.area::fgc.rubric_area, r.score, r.note
FROM fgc.lecturer_assessments a
JOIN (
  VALUES
    ('Lecturer A', 'CURRICULUM_RELEVANCE', 2, 'Observed independently.'),
    ('Lecturer A', 'EXPERIENCE_CREATION', 2, 'Observed independently.'),
    ('Lecturer A', 'PLATFORM_ORGANISATION', 2, 'Observed independently.'),
    ('Lecturer A', 'PUBLISHING_AND_DEPLOYMENT', 2, 'Observed independently.'),
    ('Lecturer A', 'TEACHING_APPLICATION', 2, 'Observed independently.'),
    ('Lecturer A', 'LEARNER_EVIDENCE_AND_ANALYTICS', 2, 'Observed independently.'),
    ('Lecturer A', 'TROUBLESHOOTING_AND_REPEATABILITY', 2, 'Observed independently.'),
    ('Lecturer B', 'CURRICULUM_RELEVANCE', 2, 'Completed independently.'),
    ('Lecturer B', 'EXPERIENCE_CREATION', 2, 'Completed independently.'),
    ('Lecturer B', 'PLATFORM_ORGANISATION', 2, 'Completed independently.'),
    ('Lecturer B', 'PUBLISHING_AND_DEPLOYMENT', 1, 'Prompting recorded.'),
    ('Lecturer B', 'TEACHING_APPLICATION', 2, 'Completed independently.'),
    ('Lecturer B', 'LEARNER_EVIDENCE_AND_ANALYTICS', 1, 'Prompting recorded.'),
    ('Lecturer B', 'TROUBLESHOOTING_AND_REPEATABILITY', 2, 'Completed independently.'),
    ('Lecturer C', 'CURRICULUM_RELEVANCE', 2, 'Evidence captured.'),
    ('Lecturer C', 'EXPERIENCE_CREATION', 2, 'Evidence captured.'),
    ('Lecturer C', 'PLATFORM_ORGANISATION', 2, 'Evidence captured.'),
    ('Lecturer C', 'PUBLISHING_AND_DEPLOYMENT', 0, 'Facilitator executed publish step.'),
    ('Lecturer C', 'TEACHING_APPLICATION', 2, 'Evidence captured.'),
    ('Lecturer C', 'LEARNER_EVIDENCE_AND_ANALYTICS', 1, 'Partial evidence.'),
    ('Lecturer C', 'TROUBLESHOOTING_AND_REPEATABILITY', 2, 'Evidence captured.')
) AS r(lecturer_reference, area, score, note) ON r.lecturer_reference = a.lecturer_reference
ON CONFLICT (assessment_id, rubric_area) DO UPDATE SET score = EXCLUDED.score, evidence_note = EXCLUDED.evidence_note;

INSERT INTO fgc.contradictions (reporting_period_id, question, organisation_id, summary, source_a_evidence_id, source_b_evidence_id, resolution_status)
SELECT rp.id, 'Q1_LEARNER_UTILISATION', o.id, 'Timetable indicates learner use, but analytics export contains no matching activity.', ea.id, eb.id, 'OPEN'
FROM fgc.reporting_periods rp
JOIN fgc.organisations o ON o.name = 'Demonstration College 02'
LEFT JOIN fgc.evidence_items ea ON ea.reporting_period_id = rp.id AND ea.evidence_code = 'EVI-Q1-002'
LEFT JOIN fgc.evidence_items eb ON eb.reporting_period_id = rp.id AND eb.evidence_code = 'EVI-Q1-001'
WHERE rp.name = 'September 2026 FGC evidence-validation workshop';

INSERT INTO fgc.corrective_actions (reporting_period_id, organisation_id, issue, category, root_cause, action, owner_reference, priority, due_date, status, closure_evidence_required)
SELECT rp.id, o.id, ca.issue, ca.category, ca.root_cause, ca.action, ca.owner_reference, ca.priority::fgc.action_priority, ca.due_date::date, ca.status::fgc.action_status, ca.closure
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('Demonstration College 02', 'Timetable activity contradicted by analytics', 'Timetable', 'Scheduled lab period was not mapped to active learner accounts.', 'Evidence owner and EON Analytics Lead reconcile learner group, assignment and licence activation records.', 'College Evidence Owner', 'HIGH', '2026-10-09', 'IN_PROGRESS', 'Reconciled export and updated learner register'),
    ('Demonstration College 03', 'Publishing workflow required facilitator execution', 'Capability', 'Lecturer could not independently publish and assign the experience.', 'Targeted reinforcement clinic followed by moderated reassessment within 30 days.', 'XR Ambassador', 'CRITICAL', '2026-10-10', 'NOT_STARTED', 'Reassessment rubric and publish proof'),
    ('Demonstration College 04', 'Missing analytics access', 'Account', 'Analytics export permission not available during workshop.', 'Confirm official export scope, extraction date and field definitions.', 'EON Analytics Lead', 'MEDIUM', '2026-11-08', 'OVERDUE', 'Versioned analytics export')
) AS ca(org_name, issue, category, root_cause, action, owner_reference, priority, due_date, status, closure)
JOIN fgc.organisations o ON o.name = ca.org_name
WHERE rp.name = 'September 2026 FGC evidence-validation workshop';

INSERT INTO fgc.decision_register (reporting_period_id, decision_code, decision, current_default, production_owner, status)
SELECT rp.id, d.code, d.decision, d.default_value, d.owner, 'REQUIRES_CONFIRMATION'
FROM fgc.reporting_periods rp
JOIN (
  VALUES
    ('DEC-001', 'Approved route or subdomain', '/programmes/merseta-fgc-ekm and /fgc-ekm', 'JEF Administrator / merSETA Oversight'),
    ('DEC-002', 'EON API availability, fields and definitions', 'CSV/XLSX export adapter in mock mode', 'EON Analytics Lead'),
    ('DEC-003', 'Critical rubric steps and Support Required threshold', 'Facilitator execution always overrides aggregate score', 'Workshop Lead / Moderator'),
    ('DEC-004', 'POPIA retention and de-identification rules', 'Learners de-identified in national views', 'merSETA Oversight')
) AS d(code, decision, default_value, owner)
WHERE rp.name = 'September 2026 FGC evidence-validation workshop'
ON CONFLICT (reporting_period_id, decision_code) DO UPDATE SET current_default = EXCLUDED.current_default;
