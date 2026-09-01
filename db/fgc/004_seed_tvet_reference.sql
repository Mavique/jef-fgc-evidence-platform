-- Authoritative-safe seed data for the FGC National TVET Reference Registry.
-- This seed inserts national/provincial/college structures and controlled taxonomies.
-- Campus/programme offerings are only inserted where explicitly verified or marked
-- pending; no campus is assumed to offer a programme.

INSERT INTO fgc.reference_sources (
  source_authority,
  document_title,
  document_version,
  publication_date,
  url,
  retrieved_date,
  notes,
  source_type
)
VALUES
  (
    'DHET',
    'Department of Higher Education and Training provincial TVET college directory pages',
    'Web',
    NULL,
    'https://www.dhet.gov.za/SitePages/EC.aspx',
    DATE '2026-08-28',
    'Official DHET provincial pages used as an authoritative source pattern for public TVET college and campus directory records.',
    'OFFICIAL_WEB_DIRECTORY'
  ),
  (
    'National Government of South Africa',
    'TVET Colleges directory',
    'Web',
    NULL,
    'https://nationalgovernment.co.za/units/type/9/tvet-college',
    DATE '2026-08-28',
    'Public government directory used to cross-check the national list of 50 public TVET colleges.',
    'PUBLIC_GOVERNMENT_DIRECTORY'
  ),
  (
    'User supplied implementation prompt',
    'FGC Platform National TVET Master Reference Database Implementation',
    '2026-08-28',
    DATE '2026-08-28',
    NULL,
    DATE '2026-08-28',
    'Prompt supplied confirmed hierarchy, Sedibeng campuses and non-fabrication rules.',
    'IMPLEMENTATION_BRIEF'
  )
ON CONFLICT DO NOTHING;

INSERT INTO fgc.countries (iso2, iso3, official_name, common_name, source_id, verification_status, verified_at)
SELECT 'ZA', 'ZAF', 'Republic of South Africa', 'South Africa', rs.id, 'OFFICIAL_VERIFIED', now()
FROM fgc.reference_sources rs
WHERE rs.source_authority = 'DHET'
ON CONFLICT (iso2) DO UPDATE SET official_name = EXCLUDED.official_name;

INSERT INTO fgc.provinces (country_id, official_name, short_name, province_code, source_id, verification_status, verified_at)
SELECT c.id, p.official_name, p.short_name, p.province_code, rs.id, 'OFFICIAL_VERIFIED', now()
FROM fgc.countries c
JOIN fgc.reference_sources rs ON rs.source_authority = 'DHET'
JOIN (
  VALUES
    ('Eastern Cape', 'EC', 'EC'),
    ('Free State', 'FS', 'FS'),
    ('Gauteng', 'GP', 'GP'),
    ('KwaZulu-Natal', 'KZN', 'KZN'),
    ('Limpopo', 'LP', 'LP'),
    ('Mpumalanga', 'MP', 'MP'),
    ('Northern Cape', 'NC', 'NC'),
    ('North West', 'NW', 'NW'),
    ('Western Cape', 'WC', 'WC')
) AS p(official_name, short_name, province_code) ON TRUE
WHERE c.iso2 = 'ZA'
ON CONFLICT (country_id, official_name) DO UPDATE SET province_code = EXCLUDED.province_code;

INSERT INTO fgc.tvet_colleges (official_name, short_name, acronym, institution_type, province_id, source_id, verification_status, last_verified_at)
SELECT college.official_name, college.short_name, college.acronym, 'PUBLIC_TVET_COLLEGE', p.id, rs.id, 'OFFICIAL_VERIFIED', now()
FROM (
  VALUES
    ('Eastern Cape', 'Buffalo City TVET College', 'Buffalo City', 'BCC'),
    ('Eastern Cape', 'Eastcape Midlands TVET College', 'Eastcape Midlands', 'EMC'),
    ('Eastern Cape', 'Ikhala TVET College', 'Ikhala', NULL),
    ('Eastern Cape', 'Ingwe TVET College', 'Ingwe', NULL),
    ('Eastern Cape', 'King Hintsa TVET College', 'King Hintsa', NULL),
    ('Eastern Cape', 'King Sabata Dalindyebo TVET College', 'King Sabata Dalindyebo', 'KSD'),
    ('Eastern Cape', 'Lovedale TVET College', 'Lovedale', NULL),
    ('Eastern Cape', 'Port Elizabeth TVET College', 'Port Elizabeth', 'PE TVET'),
    ('Free State', 'Flavius Mareka TVET College', 'Flavius Mareka', NULL),
    ('Free State', 'Goldfields TVET College', 'Goldfields', NULL),
    ('Free State', 'Maluti TVET College', 'Maluti', NULL),
    ('Free State', 'Motheo TVET College', 'Motheo', NULL),
    ('Gauteng', 'Central Johannesburg TVET College', 'Central Johannesburg', 'CJC'),
    ('Gauteng', 'Ekurhuleni East TVET College', 'Ekurhuleni East', 'EEC'),
    ('Gauteng', 'Ekurhuleni West TVET College', 'Ekurhuleni West', 'EWC'),
    ('Gauteng', 'Sedibeng TVET College', 'Sedibeng', NULL),
    ('Gauteng', 'South West Gauteng TVET College', 'South West Gauteng', 'SWGC'),
    ('Gauteng', 'Tshwane North TVET College', 'Tshwane North', 'TNC'),
    ('Gauteng', 'Tshwane South TVET College', 'Tshwane South', 'TSC'),
    ('Gauteng', 'Western TVET College', 'Western', 'Westcol'),
    ('KwaZulu-Natal', 'Coastal KZN TVET College', 'Coastal KZN', NULL),
    ('KwaZulu-Natal', 'Elangeni TVET College', 'Elangeni', NULL),
    ('KwaZulu-Natal', 'Esayidi TVET College', 'Esayidi', NULL),
    ('KwaZulu-Natal', 'Majuba TVET College', 'Majuba', NULL),
    ('KwaZulu-Natal', 'Mnambithi TVET College', 'Mnambithi', NULL),
    ('KwaZulu-Natal', 'Mthashana TVET College', 'Mthashana', NULL),
    ('KwaZulu-Natal', 'Thekwini TVET College', 'Thekwini', NULL),
    ('KwaZulu-Natal', 'Umfolozi TVET College', 'Umfolozi', NULL),
    ('KwaZulu-Natal', 'Umgungundlovu TVET College', 'Umgungundlovu', NULL),
    ('Limpopo', 'Capricorn TVET College', 'Capricorn', NULL),
    ('Limpopo', 'Lephalale TVET College', 'Lephalale', NULL),
    ('Limpopo', 'Letaba TVET College', 'Letaba', NULL),
    ('Limpopo', 'Mopani South East TVET College', 'Mopani South East', NULL),
    ('Limpopo', 'Sekhukhune TVET College', 'Sekhukhune', NULL),
    ('Limpopo', 'Vhembe TVET College', 'Vhembe', NULL),
    ('Limpopo', 'Waterberg TVET College', 'Waterberg', NULL),
    ('Mpumalanga', 'Ehlanzeni TVET College', 'Ehlanzeni', NULL),
    ('Mpumalanga', 'Gert Sibande TVET College', 'Gert Sibande', NULL),
    ('Mpumalanga', 'Nkangala TVET College', 'Nkangala', NULL),
    ('Northern Cape', 'Northern Cape Rural TVET College', 'Northern Cape Rural', 'NCR TVET'),
    ('Northern Cape', 'Northern Cape Urban TVET College', 'Northern Cape Urban', 'NCU TVET'),
    ('North West', 'Orbit TVET College', 'Orbit', NULL),
    ('North West', 'Taletso TVET College', 'Taletso', NULL),
    ('North West', 'Vuselela TVET College', 'Vuselela', NULL),
    ('Western Cape', 'Boland TVET College', 'Boland', NULL),
    ('Western Cape', 'College of Cape Town for TVET', 'College of Cape Town', 'CCT'),
    ('Western Cape', 'False Bay TVET College', 'False Bay', NULL),
    ('Western Cape', 'Northlink TVET College', 'Northlink', NULL),
    ('Western Cape', 'South Cape TVET College', 'South Cape', NULL),
    ('Western Cape', 'West Coast TVET College', 'West Coast', NULL)
) AS college(province_name, official_name, short_name, acronym)
JOIN fgc.provinces p ON p.official_name = college.province_name
JOIN fgc.reference_sources rs ON rs.source_authority = 'National Government of South Africa'
ON CONFLICT (official_name) DO UPDATE SET province_id = EXCLUDED.province_id, short_name = EXCLUDED.short_name;

INSERT INTO fgc.campus_sites (college_id, official_name, site_type, teaching_site, source_id, verification_status, source_date, last_verified_at)
SELECT c.id, site.official_name, site.site_type::fgc.site_type, site.teaching_site, rs.id, site.verification_status::fgc.reference_verification_status, DATE '2026-08-28', now()
FROM (
  VALUES
    ('Sedibeng TVET College', 'Heidelberg Campus', 'CAMPUS', TRUE, 'COLLEGE_VERIFIED'),
    ('Sedibeng TVET College', 'Sebokeng Campus', 'CAMPUS', TRUE, 'COLLEGE_VERIFIED'),
    ('Sedibeng TVET College', 'Vanderbijlpark Campus', 'CAMPUS', TRUE, 'COLLEGE_VERIFIED'),
    ('Sedibeng TVET College', 'Vereeniging Campus', 'CAMPUS', TRUE, 'COLLEGE_VERIFIED'),
    ('Buffalo City TVET College', 'East London Campus', 'CAMPUS', TRUE, 'OFFICIAL_VERIFIED'),
    ('Buffalo City TVET College', 'John Knox Bokwe Campus', 'CAMPUS', TRUE, 'OFFICIAL_VERIFIED'),
    ('Buffalo City TVET College', 'St Marks Campus', 'CAMPUS', TRUE, 'OFFICIAL_VERIFIED')
) AS site(college_name, official_name, site_type, teaching_site, verification_status)
JOIN fgc.tvet_colleges c ON c.official_name = site.college_name
JOIN fgc.reference_sources rs ON rs.source_authority IN ('DHET', 'User supplied implementation prompt')
WHERE (site.college_name = 'Buffalo City TVET College' AND rs.source_authority = 'DHET')
   OR (site.college_name = 'Sedibeng TVET College' AND rs.source_authority = 'User supplied implementation prompt')
ON CONFLICT (college_id, official_name) DO UPDATE SET verification_status = EXCLUDED.verification_status;

INSERT INTO fgc.programme_categories (code, name, description, sort_order)
VALUES
  ('NCV', 'National Certificate (Vocational)', 'NC(V) programmes and levels 2 to 4.', 10),
  ('REPORT_191_NATED', 'Report 191 / NATED', 'N1-N6 engineering and business/general studies programmes.', 20),
  ('OCCUPATIONAL', 'Occupational Qualifications', 'QCTO occupational certificates, part-qualifications, apprenticeships, trades and skills programmes.', 30),
  ('PLP', 'Pre-Vocational Learning Programme', 'Pre-vocational programme category without assumed NQF qualification level.', 40),
  ('SKILLS_SHORT', 'Skills and Short Programmes', 'Accredited skills, short learning and industry-partnered programmes.', 50),
  ('LEVEL_5_6', 'Level 5 and Level 6 Programmes', 'Higher Certificate and level 5/6 arrangements where authorised.', 60)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO fgc.programme_levels (programme_category_id, code, label, programme_level, nqf_level, sort_order)
SELECT pc.id, l.code, l.label, l.programme_level, l.nqf_level, l.sort_order
FROM (
  VALUES
    ('NCV', 'NCV_L2', 'NC(V) Level 2', 'Level 2', 2, 10),
    ('NCV', 'NCV_L3', 'NC(V) Level 3', 'Level 3', 3, 20),
    ('NCV', 'NCV_L4', 'NC(V) Level 4', 'Level 4', 4, 30),
    ('REPORT_191_NATED', 'N1', 'N1', 'N1', NULL, 10),
    ('REPORT_191_NATED', 'N2', 'N2', 'N2', NULL, 20),
    ('REPORT_191_NATED', 'N3', 'N3', 'N3', NULL, 30),
    ('REPORT_191_NATED', 'N4', 'N4', 'N4', NULL, 40),
    ('REPORT_191_NATED', 'N5', 'N5', 'N5', NULL, 50),
    ('REPORT_191_NATED', 'N6', 'N6', 'N6', NULL, 60),
    ('OCCUPATIONAL', 'OCCUPATIONAL_STAGE', 'Occupational Stage / Component', 'Occupational', NULL, 70),
    ('PLP', 'PLP', 'PLP', 'PLP', NULL, 80)
) AS l(category_code, code, label, programme_level, nqf_level, sort_order)
JOIN fgc.programme_categories pc ON pc.code = l.category_code
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO fgc.quality_authorities (code, official_name, authority_type, website)
VALUES
  ('DHET', 'Department of Higher Education and Training', 'GOVERNMENT_DEPARTMENT', 'https://www.dhet.gov.za'),
  ('QCTO', 'Quality Council for Trades and Occupations', 'QUALITY_COUNCIL', 'https://www.qcto.org.za'),
  ('SAQA', 'South African Qualifications Authority', 'QUALIFICATIONS_AUTHORITY', 'https://www.saqa.org.za'),
  ('UMALUSI', 'Umalusi Council for Quality Assurance in General and Further Education and Training', 'QUALITY_COUNCIL', 'https://www.umalusi.org.za')
ON CONFLICT (code) DO UPDATE SET official_name = EXCLUDED.official_name;

INSERT INTO fgc.programme_catalogue (official_title, short_title, programme_category_id, qualification_type, quality_council_id, examination_body, registration_status, source_id, verification_status, verified_at)
SELECT p.official_title, p.short_title, pc.id, p.qualification_type, qa.id, p.examination_body, p.registration_status, rs.id, p.verification_status::fgc.reference_verification_status, now()
FROM (
  VALUES
    ('Civil Engineering and Building Construction', 'Civil Engineering and Building Construction', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Drawing Office Practice', 'Drawing Office Practice', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Education and Development', 'Education and Development', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Electrical Infrastructure Construction', 'Electrical Infrastructure Construction', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Engineering and Related Design', 'Engineering and Related Design', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Finance, Economics and Accounting', 'Finance, Economics and Accounting', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Hospitality', 'Hospitality', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Information Technology and Computer Science', 'Information Technology and Computer Science', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Management', 'Management', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Marketing', 'Marketing', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Mechatronics', 'Mechatronics', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Office Administration', 'Office Administration', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Primary Agriculture', 'Primary Agriculture', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Process Instrumentation', 'Process Instrumentation', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Process Plant Operations', 'Process Plant Operations', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Safety in Society', 'Safety in Society', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Tourism', 'Tourism', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Transport and Logistics', 'Transport and Logistics', 'NCV', 'NC(V)', 'UMALUSI', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Engineering Studies', 'Engineering Studies', 'REPORT_191_NATED', 'Report 191 / NATED', 'DHET', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Business Studies', 'Business Studies', 'REPORT_191_NATED', 'Report 191 / NATED', 'DHET', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION'),
    ('Pre-Vocational Learning Programme', 'PLP', 'PLP', 'Pre-Vocational Learning Programme', 'DHET', 'DHET', 'ACTIVE', 'PENDING_VERIFICATION')
) AS p(official_title, short_title, category_code, qualification_type, authority_code, examination_body, registration_status, verification_status)
JOIN fgc.programme_categories pc ON pc.code = p.category_code
LEFT JOIN fgc.quality_authorities qa ON qa.code = p.authority_code
JOIN fgc.reference_sources rs ON rs.source_authority = 'DHET'
ON CONFLICT DO NOTHING;

INSERT INTO fgc.curriculum_versions (programme_id, curriculum_version, status, source_id)
SELECT pr.id, 'National catalogue baseline - source verification pending', 'DRAFT', rs.id
FROM fgc.programme_catalogue pr
JOIN fgc.reference_sources rs ON rs.source_authority = 'DHET'
ON CONFLICT DO NOTHING;

INSERT INTO fgc.subject_modules (official_name, official_code, programme_category_id, subject_type, ncv_classification, source_id, verification_status)
SELECT s.official_name, s.official_code, pc.id, s.subject_type, s.ncv_classification, rs.id, s.verification_status::fgc.reference_verification_status
FROM (
  VALUES
    ('English First Additional Language', 'NCV-FUND-ENG', 'NCV', 'LANGUAGE', 'FUNDAMENTAL', 'PENDING_VERIFICATION'),
    ('Mathematics', 'NCV-FUND-MATH', 'NCV', 'MATHEMATICS', 'FUNDAMENTAL', 'PENDING_VERIFICATION'),
    ('Mathematical Literacy', 'NCV-FUND-MATLIT', 'NCV', 'MATHEMATICS', 'FUNDAMENTAL', 'PENDING_VERIFICATION'),
    ('Life Orientation', 'NCV-FUND-LO', 'NCV', 'LIFE_ORIENTATION', 'FUNDAMENTAL', 'PENDING_VERIFICATION'),
    ('Engineering Fundamentals', 'NCV-ERD-FUND', 'NCV', 'VOCATIONAL', 'VOCATIONAL', 'PENDING_VERIFICATION'),
    ('Engineering Technology', 'NCV-ERD-TECH', 'NCV', 'VOCATIONAL', 'VOCATIONAL', 'PENDING_VERIFICATION'),
    ('Engineering Systems', 'NCV-ERD-SYS', 'NCV', 'VOCATIONAL', 'VOCATIONAL', 'PENDING_VERIFICATION'),
    ('Professional Engineering Practice', 'NCV-ERD-PEP', 'NCV', 'VOCATIONAL', 'VOCATIONAL', 'PENDING_VERIFICATION'),
    ('Engineering Science', 'NATED-ENG-SCI', 'REPORT_191_NATED', 'ENGINEERING', NULL, 'PENDING_VERIFICATION'),
    ('Engineering Drawing', 'NATED-ENG-DRW', 'REPORT_191_NATED', 'ENGINEERING', NULL, 'PENDING_VERIFICATION'),
    ('Mathematics Nated', 'NATED-MATH', 'REPORT_191_NATED', 'ENGINEERING', NULL, 'PENDING_VERIFICATION')
) AS s(official_name, official_code, category_code, subject_type, ncv_classification, verification_status)
JOIN fgc.programme_categories pc ON pc.code = s.category_code
JOIN fgc.reference_sources rs ON rs.source_authority = 'DHET'
ON CONFLICT DO NOTHING;

INSERT INTO fgc.programme_level_subjects (programme_id, programme_level_id, subject_id, subject_requirement, subject_group, source_id, verification_status)
SELECT pr.id, pl.id, sm.id, rel.requirement, rel.subject_group, rs.id, 'PENDING_VERIFICATION'
FROM (
  VALUES
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-ENG', 'FUNDAMENTAL', 'Fundamental'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-MATH', 'FUNDAMENTAL', 'Fundamental'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-FUND-LO', 'FUNDAMENTAL', 'Fundamental'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-FUND', 'VOCATIONAL', 'Vocational'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-TECH', 'VOCATIONAL', 'Vocational'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-SYS', 'VOCATIONAL', 'Vocational'),
    ('Engineering and Related Design', 'NCV_L2', 'NCV-ERD-PEP', 'VOCATIONAL', 'Vocational'),
    ('Engineering Studies', 'N3', 'NATED-ENG-SCI', 'COMPULSORY', 'Engineering'),
    ('Engineering Studies', 'N3', 'NATED-ENG-DRW', 'COMPULSORY', 'Engineering'),
    ('Engineering Studies', 'N3', 'NATED-MATH', 'COMPULSORY', 'Engineering')
) AS rel(programme_title, level_code, subject_code, requirement, subject_group)
JOIN fgc.programme_catalogue pr ON pr.official_title = rel.programme_title
JOIN fgc.programme_levels pl ON pl.code = rel.level_code
JOIN fgc.subject_modules sm ON sm.official_code = rel.subject_code
JOIN fgc.reference_sources rs ON rs.source_authority = 'DHET'
ON CONFLICT (programme_id, programme_level_id, subject_id) DO NOTHING;

INSERT INTO fgc.college_programme_offerings (college_id, programme_id, status, verification_status, source_id)
SELECT c.id, pr.id, 'PENDING_VERIFICATION', 'PENDING_VERIFICATION', rs.id
FROM fgc.tvet_colleges c
CROSS JOIN fgc.programme_catalogue pr
JOIN fgc.reference_sources rs ON rs.source_authority = 'User supplied implementation prompt'
WHERE FALSE;

INSERT INTO fgc.academic_calendars (academic_year, cycle_type, period_label, source_id)
SELECT 2026, cycle::fgc.academic_cycle_type, label, rs.id
FROM (
  VALUES
    ('ANNUAL', 'Academic Year'),
    ('SEMESTER', 'Semester 1'),
    ('SEMESTER', 'Semester 2'),
    ('TRIMESTER', 'Trimester 1'),
    ('TRIMESTER', 'Trimester 2'),
    ('TRIMESTER', 'Trimester 3'),
    ('BLOCK', 'Block'),
    ('ROLLING', 'Rolling intake')
) AS c(cycle, label)
JOIN fgc.reference_sources rs ON rs.source_authority = 'User supplied implementation prompt'
ON CONFLICT (academic_year, cycle_type, period_label) DO NOTHING;

INSERT INTO fgc.economic_sectors (code, name)
VALUES
  ('AUTOMOTIVE', 'Automotive'),
  ('MANUFACTURING', 'Manufacturing'),
  ('ENGINEERING', 'Engineering'),
  ('CONSTRUCTION', 'Construction'),
  ('ICT', 'Information and Communication Technology'),
  ('AGRICULTURE', 'Agriculture'),
  ('TOURISM', 'Tourism'),
  ('HOSPITALITY', 'Hospitality'),
  ('WHOLESALE_RETAIL', 'Wholesale and Retail'),
  ('TRANSPORT', 'Transport'),
  ('ENERGY', 'Energy'),
  ('MINING', 'Mining'),
  ('FINANCIAL_SERVICES', 'Financial Services'),
  ('PUBLIC_SERVICES', 'Public Services')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO fgc.setas (acronym, official_name, sector, website, source_id, verification_status)
SELECT s.acronym, s.official_name, s.sector, s.website, rs.id, 'PENDING_VERIFICATION'
FROM (
  VALUES
    ('AGRISETA', 'Agricultural Sector Education and Training Authority', 'Agriculture', 'https://www.agriseta.co.za'),
    ('BANKSETA', 'Banking Sector Education and Training Authority', 'Banking', 'https://www.bankseta.org.za'),
    ('CATHSSETA', 'Culture, Arts, Tourism, Hospitality and Sport Sector Education and Training Authority', 'Culture, Arts, Tourism, Hospitality and Sport', 'https://www.cathsseta.org.za'),
    ('CETA', 'Construction Education and Training Authority', 'Construction', 'https://www.ceta.org.za'),
    ('CHIETA', 'Chemical Industries Education and Training Authority', 'Chemical Industries', 'https://www.chieta.org.za'),
    ('EWSETA', 'Energy and Water Sector Education and Training Authority', 'Energy and Water', 'https://www.ewseta.org.za'),
    ('ETDP SETA', 'Education, Training and Development Practices Sector Education and Training Authority', 'Education and Training', 'https://www.etdpseta.org.za'),
    ('FASSET', 'Finance and Accounting Services Sector Education and Training Authority', 'Finance and Accounting', 'https://www.fasset.org.za'),
    ('FOODBEV SETA', 'Food and Beverages Manufacturing Sector Education and Training Authority', 'Food and Beverages Manufacturing', 'https://www.foodbev.co.za'),
    ('FP&M SETA', 'Fibre Processing and Manufacturing Sector Education and Training Authority', 'Fibre Processing and Manufacturing', 'https://www.fpmseta.org.za'),
    ('HWSETA', 'Health and Welfare Sector Education and Training Authority', 'Health and Welfare', 'https://www.hwseta.org.za'),
    ('INSETA', 'Insurance Sector Education and Training Authority', 'Insurance', 'https://www.inseta.org.za'),
    ('LGSETA', 'Local Government Sector Education and Training Authority', 'Local Government', 'https://www.lgseta.org.za'),
    ('MERSETA', 'Manufacturing, Engineering and Related Services Sector Education and Training Authority', 'Manufacturing, Engineering and Related Services', 'https://www.merseta.org.za'),
    ('MICT SETA', 'Media, Information and Communication Technologies Sector Education and Training Authority', 'Media, ICT', 'https://www.mict.org.za'),
    ('MQA', 'Mining Qualifications Authority', 'Mining', 'https://www.mqa.org.za'),
    ('PSETA', 'Public Service Sector Education and Training Authority', 'Public Service', 'https://www.pseta.org.za'),
    ('SASSETA', 'Safety and Security Sector Education and Training Authority', 'Safety and Security', 'https://www.sasseta.org.za'),
    ('SERVICES SETA', 'Services Sector Education and Training Authority', 'Services', 'https://www.serviceseta.org.za'),
    ('TETA', 'Transport Education and Training Authority', 'Transport', 'https://www.teta.org.za'),
    ('W&RSETA', 'Wholesale and Retail Sector Education and Training Authority', 'Wholesale and Retail', 'https://www.wrseta.org.za')
) AS s(acronym, official_name, sector, website)
JOIN fgc.reference_sources rs ON rs.source_authority = 'User supplied implementation prompt'
ON CONFLICT (acronym) DO UPDATE SET official_name = EXCLUDED.official_name;

INSERT INTO fgc.reference_option_sets (code, label, description)
VALUES
  ('LECTURER_TITLES', 'Lecturer Titles', 'Configurable personal titles for lecturer profiles.'),
  ('EMPLOYMENT_TYPES', 'Employment Types', 'Configurable employment relationship options.'),
  ('LECTURER_ROLES', 'Lecturer Roles', 'Configurable academic and delivery roles.'),
  ('ASSESSMENT_TYPES', 'Assessment Types', 'Reusable assessment/evidence activity types.')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO fgc.reference_options (option_set_id, code, label, sort_order)
SELECT os.id, opt.code, opt.label, opt.sort_order
FROM fgc.reference_option_sets os
JOIN (
  VALUES
    ('LECTURER_TITLES', 'MR', 'Mr', 10),
    ('LECTURER_TITLES', 'MRS', 'Mrs', 20),
    ('LECTURER_TITLES', 'MS', 'Ms', 30),
    ('LECTURER_TITLES', 'MISS', 'Miss', 40),
    ('LECTURER_TITLES', 'DR', 'Dr', 50),
    ('LECTURER_TITLES', 'PROF', 'Prof', 60),
    ('LECTURER_TITLES', 'OTHER', 'Other', 900),
    ('EMPLOYMENT_TYPES', 'PERMANENT', 'Permanent', 10),
    ('EMPLOYMENT_TYPES', 'FIXED_TERM', 'Fixed-term', 20),
    ('EMPLOYMENT_TYPES', 'PART_TIME', 'Part-time', 30),
    ('EMPLOYMENT_TYPES', 'CONTRACT', 'Contract', 40),
    ('EMPLOYMENT_TYPES', 'SESSIONAL', 'Sessional', 50),
    ('EMPLOYMENT_TYPES', 'OTHER', 'Other', 900),
    ('LECTURER_ROLES', 'LECTURER', 'Lecturer', 10),
    ('LECTURER_ROLES', 'SENIOR_LECTURER', 'Senior Lecturer', 20),
    ('LECTURER_ROLES', 'HOD', 'HOD', 30),
    ('LECTURER_ROLES', 'PROGRAMME_MANAGER', 'Programme Manager', 40),
    ('LECTURER_ROLES', 'ASSESSOR', 'Assessor', 80),
    ('LECTURER_ROLES', 'MODERATOR', 'Moderator', 90),
    ('LECTURER_ROLES', 'ARTISAN_INSTRUCTOR', 'Artisan Instructor', 100),
    ('ASSESSMENT_TYPES', 'FORMATIVE', 'Formative Assessment', 10),
    ('ASSESSMENT_TYPES', 'SUMMATIVE', 'Summative Assessment', 20),
    ('ASSESSMENT_TYPES', 'PRACTICAL', 'Practical Assessment', 30),
    ('ASSESSMENT_TYPES', 'ICASS', 'ICASS', 40),
    ('ASSESSMENT_TYPES', 'ISAT', 'ISAT', 50),
    ('ASSESSMENT_TYPES', 'EXAMINATION', 'Examination', 60),
    ('ASSESSMENT_TYPES', 'POE', 'Portfolio of Evidence', 70),
    ('ASSESSMENT_TYPES', 'TRADE_TEST', 'Trade Test', 120),
    ('ASSESSMENT_TYPES', 'EISA', 'External Integrated Summative Assessment', 130)
) AS opt(set_code, code, label, sort_order) ON opt.set_code = os.code
ON CONFLICT (option_set_id, code) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO fgc.evidence_type_registry (code, label, category)
VALUES
  ('ATTENDANCE_REGISTER', 'Attendance Register', 'Participation'),
  ('LESSON_PLAN', 'Lesson Plan', 'Teaching'),
  ('TEACHING_SCHEDULE', 'Teaching Schedule', 'Teaching'),
  ('ASSESSMENT', 'Assessment', 'Assessment'),
  ('MARK_SHEET', 'Mark Sheet', 'Assessment'),
  ('MODERATION_EVIDENCE', 'Moderation Evidence', 'Quality Assurance'),
  ('POE', 'Portfolio of Evidence', 'Evidence'),
  ('PRACTICAL_EVIDENCE', 'Practical Evidence', 'Evidence'),
  ('PHOTOGRAPH', 'Photograph', 'Media'),
  ('VIDEO', 'Video', 'Media'),
  ('STUDENT_WORK', 'Student Work', 'Evidence'),
  ('WORKSHOP_ACTIVITY', 'Workshop Activity', 'Workshop'),
  ('XR_ACTIVITY', 'XR Activity', 'XR'),
  ('TRAINING_CERTIFICATE', 'Training Certificate', 'Certification'),
  ('LECTURER_CERTIFICATE', 'Lecturer Certificate', 'Certification'),
  ('CURRICULUM_MATERIAL', 'Curriculum Material', 'Curriculum'),
  ('PROGRAMME_PLAN', 'Programme Plan', 'Planning'),
  ('TIMETABLE', 'Timetable', 'Planning'),
  ('REPORT', 'Report', 'Reporting'),
  ('EVALUATION', 'Evaluation', 'Evaluation'),
  ('SURVEY', 'Survey', 'Evaluation'),
  ('OTHER', 'Other', 'Other')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO fgc.campus_facility_types (code, label)
VALUES
  ('COMPUTER_LAB', 'Computer Laboratory'),
  ('ENGINEERING_WORKSHOP', 'Engineering Workshop'),
  ('ELECTRICAL_WORKSHOP', 'Electrical Workshop'),
  ('MECHANICAL_WORKSHOP', 'Mechanical Workshop'),
  ('AUTOMOTIVE_WORKSHOP', 'Automotive Workshop'),
  ('WELDING_WORKSHOP', 'Welding Workshop'),
  ('FABRICATION_WORKSHOP', 'Fabrication Workshop'),
  ('CNC_LAB', 'CNC Laboratory'),
  ('ROBOTICS_LAB', 'Robotics Laboratory'),
  ('MECHATRONICS_LAB', 'Mechatronics Laboratory'),
  ('PLC_LAB', 'PLC Laboratory'),
  ('XR_LAB', 'XR Laboratory'),
  ('SIMULATION_LAB', 'Simulation Laboratory'),
  ('MAKERSPACE', 'Makerspace'),
  ('LIBRARY', 'Library'),
  ('TRADE_TEST_CENTRE', 'Trade Test Centre'),
  ('CENTRE_OF_SPECIALISATION', 'Centre of Specialisation')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO fgc.technology_readiness_types (code, label, category)
VALUES
  ('DESKTOP_COMPUTERS', 'Desktop Computers', 'Hardware'),
  ('LAPTOPS', 'Laptops', 'Hardware'),
  ('TABLETS', 'Tablets', 'Hardware'),
  ('SMARTPHONES', 'Smartphones', 'Hardware'),
  ('INTERACTIVE_BOARDS', 'Interactive Boards', 'Classroom Technology'),
  ('PROJECTORS', 'Projectors', 'Classroom Technology'),
  ('VR_HEADSETS', 'VR Headsets', 'XR'),
  ('AR_DEVICES', 'AR Devices', 'XR'),
  ('XR_LAB', 'XR Lab', 'XR'),
  ('ROBOTICS_KITS', 'Robotics Kits', 'STEM'),
  ('IOT_EQUIPMENT', 'IoT Equipment', 'STEM'),
  ('CNC_EQUIPMENT', 'CNC Equipment', 'Workshop'),
  ('THREE_D_PRINTERS', '3D Printers', 'Workshop'),
  ('INTERNET_CONNECTIVITY', 'Internet Connectivity', 'Connectivity'),
  ('WIFI', 'Wi-Fi', 'Connectivity'),
  ('LMS', 'Learning Management System', 'Software'),
  ('DIGITAL_CONTENT_PLATFORM', 'Digital Content Platform', 'Software'),
  ('SIMULATION_SOFTWARE', 'Simulation Software', 'Software'),
  ('CAD_SOFTWARE', 'CAD Software', 'Software'),
  ('AI_TOOLS', 'AI Tools', 'Software')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;
