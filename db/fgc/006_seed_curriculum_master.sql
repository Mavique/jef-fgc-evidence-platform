-- Initial curriculum-master seed for FGC.
-- This is an import-ready catalogue scaffold plus conservative records already used by the prototype.
-- It is not a claim that the national curriculum import is complete.

INSERT INTO fgc.programme_categories (code, name, description, sort_order)
VALUES
  ('NCV', 'National Certificate (Vocational)', 'NC(V) programmes with Level 2, Level 3 and Level 4 curriculum relationships.', 10),
  ('REPORT_191_NATED_ENGINEERING', 'Report 191 / NATED Engineering Studies', 'N1-N6 engineering studies programmes and subjects.', 20),
  ('REPORT_191_NATED_BUSINESS', 'Report 191 / NATED Business Studies', 'N4-N6 business studies programmes and subjects.', 30),
  ('REPORT_191_NATED_SERVICES', 'Report 191 / NATED Services and General Studies', 'N4-N6 services/general programmes and subjects.', 40),
  ('OCCUPATIONAL_QUALIFICATION', 'Occupational Qualifications', 'QCTO occupational qualifications delivered through TVET pathways.', 50),
  ('OCCUPATIONAL_PART_QUALIFICATION', 'Occupational Part-Qualifications', 'Registered part-qualifications linked to parent occupational qualifications.', 60),
  ('OCCUPATIONAL_SKILLS_PROGRAMME', 'Occupational Skills Programmes', 'Formally approved occupational skills programmes.', 70),
  ('LEARNERSHIP_LINKED', 'Learnership-linked Programmes', 'Programmes delivered through learnership arrangements where applicable.', 80),
  ('APPRENTICESHIP_TRADE', 'Apprenticeships / Trades', 'Recognised trades, apprenticeships and trade-test pathways.', 90),
  ('PLP', 'Pre-Vocational Learning Programme', 'PLP curriculum and assessment components.', 100),
  ('LEVEL_5', 'Level 5 Qualifications', 'Officially approved NQF Level 5 TVET qualifications where applicable.', 110),
  ('LEVEL_6', 'Level 6 Qualifications', 'Officially approved NQF Level 6 TVET qualifications where applicable.', 120),
  ('OTHER_APPROVED_TVET', 'Other Approved TVET Programmes', 'Other officially approved TVET programmes that do not fit the standard groups.', 130),
  ('HISTORICAL_TEACH_OUT', 'Historical / Teach-Out Programmes', 'Retired, replaced or teach-out programmes retained for historical evidence.', 140)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO fgc.curriculum_source_documents (authority, document_title, document_url, document_version, source_type, import_priority, notes)
VALUES
  ('DHET', 'NC(V) Subject Matrix and Subject Guidelines', 'https://www.dhet.gov.za/SitePages/DocCurriculum.aspx', 'Current official source page', 'OFFICIAL_CURRICULUM_DOCUMENTS', 10, 'Authoritative NC(V) programme, level and subject source. Full matrix import remains pending.'),
  ('DHET', 'Report 191 NATED Curriculum Documents and Revised Syllabi', 'https://www.dhet.gov.za/SitePages/DocCurriculum.aspx', 'Current official source page', 'OFFICIAL_CURRICULUM_DOCUMENTS', 20, 'Authoritative Report 191 / NATED programme and subject source. Full Part 1 and Part 2 import remains pending.'),
  ('QCTO', 'Occupational Qualifications and Occupational Skills Programmes', 'https://www.qcto.org.za', 'Current official source', 'OFFICIAL_QUALIFICATION_REGISTRY', 30, 'Authoritative QCTO source family for occupational qualifications, part-qualifications and occupational skills programmes.'),
  ('SAQA', 'National Qualifications Framework registered qualifications', 'https://www.saqa.org.za', 'Current official source', 'OFFICIAL_QUALIFICATION_REGISTRY', 40, 'Authoritative SAQA source for qualification IDs, NQF levels, credits and registration status.'),
  ('FGC', 'FGC Curriculum Master Catalogue Gap Register', NULL, 'Internal', 'DATA_GAP_REGISTER', 900, 'Tracks official data still requiring import or administrator verification.')
ON CONFLICT DO NOTHING;

INSERT INTO fgc.programme_disciplines (code, name, sort_order)
VALUES
  ('ENGINEERING', 'Engineering', 10),
  ('BUSINESS_MANAGEMENT', 'Business and Management', 20),
  ('FINANCE', 'Finance', 30),
  ('ICT', 'Information and Communication Technology', 40),
  ('AGRICULTURE', 'Agriculture', 50),
  ('HOSPITALITY', 'Hospitality', 60),
  ('TOURISM', 'Tourism', 70),
  ('EDUCATION', 'Education', 80),
  ('SAFETY_SECURITY', 'Safety and Security', 90),
  ('CONSTRUCTION', 'Construction', 100),
  ('AUTOMOTIVE', 'Automotive', 110),
  ('MANUFACTURING', 'Manufacturing', 120),
  ('TRANSPORT_LOGISTICS', 'Transport and Logistics', 130),
  ('ART_DESIGN', 'Art and Design', 140),
  ('MEDIA', 'Media', 150),
  ('HAIR_BEAUTY', 'Hair and Beauty', 160),
  ('PUBLIC_ADMINISTRATION', 'Public Administration', 170),
  ('SERVICES', 'Services', 180)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO fgc.subject_families (code, name, discipline_id, description)
SELECT family.code, family.name, d.id, family.description
FROM (
  VALUES
    ('ELECTRICAL_ENGINEERING', 'Electrical Engineering Subjects', 'ENGINEERING', 'Electrical engineering subjects across NC(V), NATED and occupational pathways.'),
    ('MECHANICAL_ENGINEERING', 'Mechanical Engineering Subjects', 'ENGINEERING', 'Mechanical engineering, fitting, machining and fabrication-related subjects.'),
    ('BUSINESS_MANAGEMENT', 'Business Management Subjects', 'BUSINESS_MANAGEMENT', 'Business management, entrepreneurship and operations subjects.'),
    ('FUNDAMENTALS', 'Fundamental Subjects', 'EDUCATION', 'Language, mathematics and life-orientation fundamentals.')
) AS family(code, name, discipline_code, description)
JOIN fgc.programme_disciplines d ON d.code = family.discipline_code
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, discipline_id = EXCLUDED.discipline_id;

INSERT INTO fgc.curriculum_versions_master (framework, version_name, academic_year, status, source_document_id, notes)
SELECT version.framework::fgc.curriculum_framework, version.version_name, 2026, 'PENDING_VERIFICATION', sd.id, version.notes
FROM (
  VALUES
    ('NCV', 'NC(V) official matrix import pending', 'Created to preserve NC(V) programme-level-subject versioning before full import.'),
    ('REPORT_191_NATED_ENGINEERING', 'Report 191 Engineering official import pending', 'Created to preserve Report 191 engineering versioning before full import.'),
    ('REPORT_191_NATED_BUSINESS', 'Report 191 Business official import pending', 'Created to preserve Report 191 business versioning before full import.'),
    ('OCCUPATIONAL_QUALIFICATION', 'QCTO occupational import pending', 'Created to preserve QCTO occupational versioning before full import.'),
    ('OCCUPATIONAL_SKILLS_PROGRAMME', 'QCTO skills programme import pending', 'Created to preserve occupational skills programme versioning before full import.'),
    ('APPRENTICESHIP_TRADE', 'Trades registry import pending', 'Created to preserve trade/apprenticeship import provenance before full import.'),
    ('PLP', 'PLP official import pending', 'Created to preserve PLP curriculum versioning before full import.')
) AS version(framework, version_name, notes)
JOIN fgc.curriculum_source_documents sd ON (
  (version.framework IN ('NCV', 'REPORT_191_NATED_ENGINEERING', 'REPORT_191_NATED_BUSINESS', 'PLP') AND sd.authority = 'DHET') OR
  (version.framework IN ('OCCUPATIONAL_QUALIFICATION', 'OCCUPATIONAL_SKILLS_PROGRAMME', 'APPRENTICESHIP_TRADE') AND sd.authority = 'QCTO')
)
ON CONFLICT DO NOTHING;

INSERT INTO fgc.curriculum_programmes (category_id, official_title, abbreviation, framework, primary_discipline_id, status, curriculum_version_id, source_document_id, verification_status)
SELECT pc.id, p.title, p.abbreviation, p.framework::fgc.curriculum_framework, d.id, 'PENDING_VERIFICATION', cv.id, sd.id, 'PENDING_VERIFICATION'
FROM (
  VALUES
    ('NCV', 'Civil Engineering and Building Construction', 'CEBC', 'NCV', 'CONSTRUCTION'),
    ('NCV', 'Drawing Office Practice', 'DOP', 'NCV', 'ART_DESIGN'),
    ('NCV', 'Education and Development', 'ED', 'NCV', 'EDUCATION'),
    ('NCV', 'Electrical Infrastructure Construction', 'EIC', 'NCV', 'ENGINEERING'),
    ('NCV', 'Engineering and Related Design', 'ERD', 'NCV', 'ENGINEERING'),
    ('NCV', 'Finance, Economics and Accounting', 'FEA', 'NCV', 'FINANCE'),
    ('NCV', 'Hospitality', NULL, 'NCV', 'HOSPITALITY'),
    ('NCV', 'Information Technology and Computer Science', 'ITCS', 'NCV', 'ICT'),
    ('NCV', 'Management', NULL, 'NCV', 'BUSINESS_MANAGEMENT'),
    ('NCV', 'Marketing', NULL, 'NCV', 'BUSINESS_MANAGEMENT'),
    ('NCV', 'Mechatronics', NULL, 'NCV', 'ENGINEERING'),
    ('NCV', 'Office Administration', NULL, 'NCV', 'BUSINESS_MANAGEMENT'),
    ('NCV', 'Primary Agriculture', NULL, 'NCV', 'AGRICULTURE'),
    ('NCV', 'Process Instrumentation', NULL, 'NCV', 'ENGINEERING'),
    ('NCV', 'Process Plant Operations', NULL, 'NCV', 'MANUFACTURING'),
    ('NCV', 'Safety in Society', NULL, 'NCV', 'SAFETY_SECURITY'),
    ('NCV', 'Tourism', NULL, 'NCV', 'TOURISM'),
    ('NCV', 'Transport and Logistics', NULL, 'NCV', 'TRANSPORT_LOGISTICS'),
    ('REPORT_191_NATED_ENGINEERING', 'Electrical Engineering', NULL, 'REPORT_191_NATED_ENGINEERING', 'ENGINEERING'),
    ('REPORT_191_NATED_ENGINEERING', 'Mechanical Engineering', NULL, 'REPORT_191_NATED_ENGINEERING', 'ENGINEERING'),
    ('REPORT_191_NATED_ENGINEERING', 'Civil Engineering', NULL, 'REPORT_191_NATED_ENGINEERING', 'CONSTRUCTION'),
    ('REPORT_191_NATED_BUSINESS', 'Business Management', NULL, 'REPORT_191_NATED_BUSINESS', 'BUSINESS_MANAGEMENT'),
    ('REPORT_191_NATED_BUSINESS', 'Financial Management', NULL, 'REPORT_191_NATED_BUSINESS', 'FINANCE'),
    ('PLP', 'Pre-Vocational Learning Programme', 'PLP', 'PLP', 'EDUCATION')
) AS p(category_code, title, abbreviation, framework, discipline_code)
JOIN fgc.programme_categories pc ON pc.code = p.category_code
JOIN fgc.programme_disciplines d ON d.code = p.discipline_code
JOIN fgc.curriculum_versions_master cv ON cv.framework = p.framework::fgc.curriculum_framework
JOIN fgc.curriculum_source_documents sd ON sd.id = cv.source_document_id
ON CONFLICT DO NOTHING;

INSERT INTO fgc.curriculum_programme_levels (programme_id, programme_level_id, curriculum_version_id, nqf_level, status, display_order)
SELECT cp.id, pl.id, cp.curriculum_version_id, pl.nqf_level, 'PENDING_VERIFICATION', pl.sort_order
FROM fgc.curriculum_programmes cp
JOIN fgc.programme_levels pl ON (
  (cp.framework = 'NCV' AND pl.code IN ('NCV_L2', 'NCV_L3', 'NCV_L4')) OR
  (cp.framework = 'REPORT_191_NATED_ENGINEERING' AND pl.code IN ('N1', 'N2', 'N3', 'N4', 'N5', 'N6')) OR
  (cp.framework IN ('REPORT_191_NATED_BUSINESS', 'REPORT_191_NATED_SERVICES') AND pl.code IN ('N4', 'N5', 'N6')) OR
  (cp.framework = 'PLP' AND pl.code = 'PLP')
)
ON CONFLICT DO NOTHING;

INSERT INTO fgc.curriculum_subjects (official_name, subject_code, abbreviation, subject_family_id, subject_type, framework, curriculum_version_id, nqf_level, source_document_id, verification_status)
SELECT s.name, s.code, s.abbreviation, sf.id, s.subject_type::fgc.curriculum_component_type, s.framework::fgc.curriculum_framework, cv.id, s.nqf_level, sd.id, 'PENDING_VERIFICATION'
FROM (
  VALUES
    ('English First Additional Language', 'NCV-FUND-ENG', 'English FAL', 'FUNDAMENTALS', 'FUNDAMENTAL', 'NCV', 2),
    ('Mathematics', 'NCV-FUND-MATH', 'Maths', 'FUNDAMENTALS', 'FUNDAMENTAL', 'NCV', 2),
    ('Mathematical Literacy', 'NCV-FUND-MATLIT', 'Math Lit', 'FUNDAMENTALS', 'FUNDAMENTAL', 'NCV', 2),
    ('Life Orientation', 'NCV-FUND-LO', 'LO', 'FUNDAMENTALS', 'FUNDAMENTAL', 'NCV', 2),
    ('Engineering Fundamentals', 'NCV-ERD-FUND-L2', NULL, 'MECHANICAL_ENGINEERING', 'VOCATIONAL', 'NCV', 2),
    ('Engineering Technology', 'NCV-ERD-TECH-L2', NULL, 'MECHANICAL_ENGINEERING', 'VOCATIONAL', 'NCV', 2),
    ('Engineering Systems', 'NCV-ERD-SYS-L2', NULL, 'MECHANICAL_ENGINEERING', 'VOCATIONAL', 'NCV', 2),
    ('Professional Engineering Practice', 'NCV-ERD-PEP-L2', NULL, 'MECHANICAL_ENGINEERING', 'VOCATIONAL', 'NCV', 2),
    ('Electrotechnics N4', 'NATED-ELEC-TECH-N4', NULL, 'ELECTRICAL_ENGINEERING', 'COMPULSORY', 'REPORT_191_NATED_ENGINEERING', NULL),
    ('Engineering Science N4', 'NATED-ENG-SCI-N4', NULL, 'ELECTRICAL_ENGINEERING', 'COMPULSORY', 'REPORT_191_NATED_ENGINEERING', NULL),
    ('Mathematics N4', 'NATED-MATH-N4', NULL, 'FUNDAMENTALS', 'COMPULSORY', 'REPORT_191_NATED_ENGINEERING', NULL),
    ('Industrial Electronics N4', 'NATED-IND-ELEC-N4', NULL, 'ELECTRICAL_ENGINEERING', 'COMPULSORY', 'REPORT_191_NATED_ENGINEERING', NULL),
    ('Management Communication N4', 'NATED-MAN-COM-N4', NULL, 'BUSINESS_MANAGEMENT', 'COMPULSORY', 'REPORT_191_NATED_BUSINESS', NULL),
    ('Entrepreneurship and Business Management N4', 'NATED-EBM-N4', 'EBM N4', 'BUSINESS_MANAGEMENT', 'COMPULSORY', 'REPORT_191_NATED_BUSINESS', NULL)
) AS s(name, code, abbreviation, family_code, subject_type, framework, nqf_level)
JOIN fgc.subject_families sf ON sf.code = s.family_code
JOIN fgc.curriculum_versions_master cv ON cv.framework = s.framework::fgc.curriculum_framework
JOIN fgc.curriculum_source_documents sd ON sd.id = cv.source_document_id
ON CONFLICT DO NOTHING;

INSERT INTO fgc.curriculum_programme_subjects (programme_id, programme_level_id, subject_id, curriculum_version_id, subject_role, compulsory, display_order, source_document_id, verification_status)
SELECT cp.id, pl.id, cs.id, cp.curriculum_version_id, map.subject_role::fgc.curriculum_component_type, TRUE, map.display_order, cp.source_document_id, 'PENDING_VERIFICATION'
FROM (
  VALUES
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-ENG', 'FUNDAMENTAL', 10),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-MATH', 'FUNDAMENTAL', 20),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-LO', 'FUNDAMENTAL', 30),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-FUND-L2', 'VOCATIONAL', 40),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-TECH-L2', 'VOCATIONAL', 50),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-SYS-L2', 'VOCATIONAL', 60),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-PEP-L2', 'VOCATIONAL', 70),
    ('Electrical Engineering', 'N4', 'NATED-ELEC-TECH-N4', 'COMPULSORY', 10),
    ('Electrical Engineering', 'N4', 'NATED-ENG-SCI-N4', 'COMPULSORY', 20),
    ('Electrical Engineering', 'N4', 'NATED-MATH-N4', 'COMPULSORY', 30),
    ('Electrical Engineering', 'N4', 'NATED-IND-ELEC-N4', 'COMPULSORY', 40),
    ('Business Management', 'N4', 'NATED-MAN-COM-N4', 'COMPULSORY', 10),
    ('Business Management', 'N4', 'NATED-EBM-N4', 'COMPULSORY', 20)
) AS map(programme_title, level_code, subject_code, subject_role, display_order)
JOIN fgc.curriculum_programmes cp ON cp.official_title = map.programme_title
JOIN fgc.programme_levels pl ON pl.code = map.level_code
JOIN fgc.curriculum_subjects cs ON cs.subject_code = map.subject_code
ON CONFLICT DO NOTHING;

INSERT INTO fgc.reference_aliases (alias, canonical_type, programme_id, notes)
SELECT alias.alias, 'PROGRAMME', cp.id, alias.notes
FROM (
  VALUES
    ('ERD', 'Engineering and Related Design', 'Common NC(V) abbreviation.'),
    ('EIC', 'Electrical Infrastructure Construction', 'Common NC(V) abbreviation.'),
    ('NATED Electrical', 'Electrical Engineering', 'Common lecturer search phrasing.'),
    ('N Courses Electrical', 'Electrical Engineering', 'Common Report 191 search phrasing.'),
    ('Business Studies', 'Business Management', 'Common Report 191 search phrasing.'),
    ('PLP', 'Pre-Vocational Learning Programme', 'Common PLP abbreviation.')
) AS alias(alias, programme_title, notes)
JOIN fgc.curriculum_programmes cp ON cp.official_title = alias.programme_title
ON CONFLICT DO NOTHING;

INSERT INTO fgc.reference_aliases (alias, canonical_type, notes)
VALUES
  ('NCV', 'FRAMEWORK', 'Alias for National Certificate (Vocational).'),
  ('NC(V)', 'FRAMEWORK', 'Alias for National Certificate (Vocational).'),
  ('Report 191', 'FRAMEWORK', 'Alias for NATED programmes.'),
  ('NATED', 'FRAMEWORK', 'Alias for Report 191 programmes.'),
  ('N Courses', 'FRAMEWORK', 'Alias for Report 191 / NATED programmes.')
ON CONFLICT DO NOTHING;
