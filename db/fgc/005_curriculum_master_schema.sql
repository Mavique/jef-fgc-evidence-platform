-- FGC National TVET Curriculum Master Catalogue.
-- This layer is independent from college/campus programme offering intelligence.

CREATE TYPE fgc.curriculum_framework AS ENUM (
  'NCV',
  'REPORT_191_NATED_ENGINEERING',
  'REPORT_191_NATED_BUSINESS',
  'REPORT_191_NATED_SERVICES',
  'OCCUPATIONAL_QUALIFICATION',
  'OCCUPATIONAL_PART_QUALIFICATION',
  'OCCUPATIONAL_SKILLS_PROGRAMME',
  'LEARNERSHIP_LINKED',
  'APPRENTICESHIP_TRADE',
  'PLP',
  'LEVEL_5',
  'LEVEL_6',
  'OTHER_APPROVED_TVET',
  'HISTORICAL_TEACH_OUT'
);

CREATE TYPE fgc.curriculum_record_status AS ENUM (
  'CURRENT',
  'FUTURE',
  'ACTIVE',
  'PHASING_OUT',
  'TEACH_OUT',
  'HISTORICAL',
  'REPLACED',
  'WITHDRAWN',
  'PENDING_VERIFICATION'
);

CREATE TYPE fgc.curriculum_component_type AS ENUM (
  'SUBJECT',
  'MODULE',
  'KNOWLEDGE',
  'PRACTICAL_SKILLS',
  'WORK_EXPERIENCE',
  'FUNDAMENTAL',
  'CORE',
  'VOCATIONAL',
  'COMPULSORY',
  'ELECTIVE',
  'SPECIALISATION',
  'OTHER'
);

CREATE TYPE fgc.reference_request_status AS ENUM (
  'PENDING_REVIEW',
  'MAPPED_TO_EXISTING',
  'APPROVED_CREATED',
  'REJECTED',
  'CLARIFICATION_REQUESTED'
);

CREATE TABLE fgc.curriculum_source_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES fgc.reference_sources(id),
  authority text NOT NULL,
  document_title text NOT NULL,
  document_url text,
  document_version text,
  publication_date date,
  effective_from date,
  retrieved_date date NOT NULL DEFAULT CURRENT_DATE,
  checksum text,
  source_type text NOT NULL,
  import_priority integer NOT NULL DEFAULT 100,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.curriculum_versions_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework fgc.curriculum_framework NOT NULL,
  version_name text NOT NULL,
  academic_year integer,
  publication_date date,
  effective_from date,
  effective_to date,
  status fgc.curriculum_record_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  supersedes_id uuid REFERENCES fgc.curriculum_versions_master(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_curriculum_versions_master_unique
  ON fgc.curriculum_versions_master (framework, version_name, COALESCE(academic_year, 0));

CREATE TABLE fgc.programme_disciplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_id uuid REFERENCES fgc.programme_disciplines(id),
  sort_order integer NOT NULL DEFAULT 100
);

CREATE TABLE fgc.subject_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  discipline_id uuid REFERENCES fgc.programme_disciplines(id),
  description text
);

CREATE TABLE fgc.curriculum_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_title text NOT NULL,
  qualification_code text,
  saqa_qualification_id text,
  qcto_code text,
  nqf_level integer,
  credits integer,
  qualification_type text NOT NULL,
  framework fgc.curriculum_framework NOT NULL,
  parent_qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  occupational_title text,
  ofo_code text,
  trade_status text,
  quality_authority_id uuid REFERENCES fgc.quality_authorities(id),
  registration_status fgc.curriculum_record_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  registration_start_date date,
  registration_end_date date,
  teach_out_date date,
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_curriculum_qualifications_unique
  ON fgc.curriculum_qualifications (
    framework,
    official_title,
    COALESCE(saqa_qualification_id, ''),
    COALESCE(qcto_code, ''),
    COALESCE(qualification_code, '')
  );

CREATE TABLE fgc.curriculum_programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES fgc.programme_categories(id),
  qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  official_title text NOT NULL,
  programme_code text,
  abbreviation text,
  framework fgc.curriculum_framework NOT NULL,
  primary_discipline_id uuid REFERENCES fgc.programme_disciplines(id),
  status fgc.curriculum_record_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_curriculum_programmes_unique
  ON fgc.curriculum_programmes (framework, official_title, COALESCE(programme_code, ''));

CREATE TABLE fgc.curriculum_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name text NOT NULL,
  subject_code text,
  alternate_name text,
  abbreviation text,
  subject_family_id uuid REFERENCES fgc.subject_families(id),
  subject_type fgc.curriculum_component_type NOT NULL DEFAULT 'SUBJECT',
  framework fgc.curriculum_framework NOT NULL,
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  nqf_level integer,
  credits integer,
  active boolean NOT NULL DEFAULT TRUE,
  effective_from date,
  effective_to date,
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_curriculum_subjects_unique
  ON fgc.curriculum_subjects (framework, official_name, COALESCE(subject_code, ''), COALESCE(nqf_level, 0));

CREATE TABLE fgc.curriculum_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code text,
  official_name text NOT NULL,
  module_type fgc.curriculum_component_type NOT NULL,
  credits integer,
  nqf_level integer,
  parent_qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  effective_from date,
  effective_to date,
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_curriculum_modules_unique
  ON fgc.curriculum_modules (COALESCE(parent_qualification_id, '00000000-0000-0000-0000-000000000000'::uuid), official_name, COALESCE(module_code, ''), module_type);

CREATE TABLE fgc.curriculum_programme_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES fgc.curriculum_programmes(id) ON DELETE CASCADE,
  programme_level_id uuid NOT NULL REFERENCES fgc.programme_levels(id),
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  nqf_level integer,
  status fgc.curriculum_record_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  display_order integer NOT NULL DEFAULT 100,
  UNIQUE (programme_id, programme_level_id, curriculum_version_id)
);

CREATE TABLE fgc.curriculum_programme_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid NOT NULL REFERENCES fgc.curriculum_programmes(id) ON DELETE CASCADE,
  programme_level_id uuid NOT NULL REFERENCES fgc.programme_levels(id),
  subject_id uuid NOT NULL REFERENCES fgc.curriculum_subjects(id),
  curriculum_version_id uuid REFERENCES fgc.curriculum_versions_master(id),
  subject_role fgc.curriculum_component_type NOT NULL,
  compulsory boolean NOT NULL DEFAULT TRUE,
  elective_group text,
  minimum_required_from_group integer,
  effective_from date,
  effective_to date,
  display_order integer NOT NULL DEFAULT 100,
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  UNIQUE (programme_id, programme_level_id, subject_id, curriculum_version_id)
);

CREATE TABLE fgc.curriculum_programme_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_id uuid NOT NULL REFERENCES fgc.curriculum_qualifications(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES fgc.curriculum_modules(id),
  module_type fgc.curriculum_component_type NOT NULL,
  sequence integer NOT NULL DEFAULT 100,
  credits integer,
  compulsory boolean NOT NULL DEFAULT TRUE,
  prerequisite_module_id uuid REFERENCES fgc.curriculum_modules(id),
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  UNIQUE (qualification_id, module_id)
);

CREATE TABLE fgc.trades_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_name text NOT NULL,
  trade_code text,
  ofo_code text,
  qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  artisan_status text,
  trade_test_required boolean NOT NULL DEFAULT TRUE,
  qcto_relationship text,
  seta_id uuid REFERENCES fgc.setas(id),
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_fgc_trades_registry_unique
  ON fgc.trades_registry (trade_name, COALESCE(trade_code, ''), COALESCE(ofo_code, ''));

CREATE TABLE fgc.reference_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text NOT NULL,
  canonical_type text NOT NULL CHECK (canonical_type IN ('PROGRAMME', 'QUALIFICATION', 'SUBJECT', 'MODULE', 'TRADE', 'FRAMEWORK')),
  programme_id uuid REFERENCES fgc.curriculum_programmes(id),
  qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  subject_id uuid REFERENCES fgc.curriculum_subjects(id),
  module_id uuid REFERENCES fgc.curriculum_modules(id),
  trade_id uuid REFERENCES fgc.trades_registry(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (canonical_type = 'PROGRAMME' AND programme_id IS NOT NULL AND qualification_id IS NULL AND subject_id IS NULL AND module_id IS NULL AND trade_id IS NULL) OR
    (canonical_type = 'QUALIFICATION' AND qualification_id IS NOT NULL AND programme_id IS NULL AND subject_id IS NULL AND module_id IS NULL AND trade_id IS NULL) OR
    (canonical_type = 'SUBJECT' AND subject_id IS NOT NULL AND programme_id IS NULL AND qualification_id IS NULL AND module_id IS NULL AND trade_id IS NULL) OR
    (canonical_type = 'MODULE' AND module_id IS NOT NULL AND programme_id IS NULL AND qualification_id IS NULL AND subject_id IS NULL AND trade_id IS NULL) OR
    (canonical_type = 'TRADE' AND trade_id IS NOT NULL AND programme_id IS NULL AND qualification_id IS NULL AND subject_id IS NULL AND module_id IS NULL) OR
    (canonical_type = 'FRAMEWORK' AND programme_id IS NULL AND qualification_id IS NULL AND subject_id IS NULL AND module_id IS NULL AND trade_id IS NULL)
  )
);

CREATE UNIQUE INDEX idx_fgc_reference_aliases_unique
  ON fgc.reference_aliases (lower(alias), canonical_type, COALESCE(programme_id, qualification_id, subject_id, module_id, trade_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE TABLE fgc.reference_data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('PROGRAMME', 'SUBJECT', 'MODULE', 'QUALIFICATION', 'TRADE', 'CAMPUS_MAPPING')),
  submitted_by uuid REFERENCES fgc.users(id),
  college_id uuid REFERENCES fgc.tvet_colleges(id),
  campus_id uuid REFERENCES fgc.campus_sites(id),
  programme_name text,
  subject_or_module_name text,
  qualification_type text,
  level_label text,
  evidence_location text,
  status fgc.reference_request_status NOT NULL DEFAULT 'PENDING_REVIEW',
  mapped_programme_id uuid REFERENCES fgc.curriculum_programmes(id),
  mapped_subject_id uuid REFERENCES fgc.curriculum_subjects(id),
  mapped_module_id uuid REFERENCES fgc.curriculum_modules(id),
  mapped_qualification_id uuid REFERENCES fgc.curriculum_qualifications(id),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fgc.possible_campus_programme_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES fgc.tvet_colleges(id),
  campus_id uuid NOT NULL REFERENCES fgc.campus_sites(id),
  programme_id uuid NOT NULL REFERENCES fgc.curriculum_programmes(id),
  programme_level_id uuid REFERENCES fgc.programme_levels(id),
  subject_id uuid REFERENCES fgc.curriculum_subjects(id),
  source_reference_request_id uuid REFERENCES fgc.reference_data_requests(id),
  signal_count integer NOT NULL DEFAULT 1 CHECK (signal_count > 0),
  latest_signal_at timestamptz NOT NULL DEFAULT now(),
  admin_review_status fgc.reference_request_status NOT NULL DEFAULT 'PENDING_REVIEW',
  notes text,
  UNIQUE (campus_id, programme_id, programme_level_id, subject_id)
);

CREATE TABLE fgc.curriculum_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_document_id uuid REFERENCES fgc.curriculum_source_documents(id),
  framework fgc.curriculum_framework,
  import_name text NOT NULL,
  source_location text,
  checksum text,
  status fgc.import_batch_status NOT NULL DEFAULT 'STAGED',
  imported_by uuid REFERENCES fgc.users(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  records_seen integer NOT NULL DEFAULT 0,
  records_inserted integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_flagged integer NOT NULL DEFAULT 0,
  audit_summary jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE fgc.curriculum_import_staging_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES fgc.curriculum_import_batches(id) ON DELETE CASCADE,
  row_number integer NOT NULL,
  raw_payload jsonb NOT NULL,
  normalized_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_record_type text,
  match_confidence numeric(5,2),
  validation_status text NOT NULL DEFAULT 'PENDING',
  validation_messages text[] NOT NULL DEFAULT '{}',
  matched_record_id uuid,
  imported_record_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, row_number)
);

CREATE INDEX idx_fgc_curriculum_programmes_search ON fgc.curriculum_programmes USING gin (to_tsvector('english', official_title || ' ' || COALESCE(programme_code, '') || ' ' || COALESCE(abbreviation, '')));
CREATE INDEX idx_fgc_curriculum_subjects_search ON fgc.curriculum_subjects USING gin (to_tsvector('english', official_name || ' ' || COALESCE(subject_code, '') || ' ' || COALESCE(abbreviation, '')));
CREATE INDEX idx_fgc_curriculum_modules_search ON fgc.curriculum_modules USING gin (to_tsvector('english', official_name || ' ' || COALESCE(module_code, '')));
CREATE INDEX idx_fgc_reference_aliases_search ON fgc.reference_aliases USING gin (to_tsvector('english', alias));

CREATE OR REPLACE VIEW fgc.v_curriculum_catalogue_quality AS
SELECT
  (SELECT count(*) FROM fgc.curriculum_programmes) AS total_programmes,
  (SELECT count(*) FROM fgc.curriculum_qualifications) AS total_qualifications,
  (SELECT count(*) FROM fgc.curriculum_subjects) AS total_subjects,
  (SELECT count(*) FROM fgc.curriculum_modules) AS total_modules,
  (SELECT count(*) FROM fgc.curriculum_programmes WHERE framework = 'NCV') AS total_ncv_programmes,
  (SELECT count(*) FROM fgc.curriculum_programmes WHERE framework IN ('REPORT_191_NATED_ENGINEERING', 'REPORT_191_NATED_BUSINESS', 'REPORT_191_NATED_SERVICES')) AS total_nated_programmes,
  (SELECT count(*) FROM fgc.curriculum_qualifications WHERE framework = 'OCCUPATIONAL_QUALIFICATION') AS total_occupational_qualifications,
  (SELECT count(*) FROM fgc.curriculum_qualifications WHERE framework = 'OCCUPATIONAL_SKILLS_PROGRAMME') AS total_occupational_skills_programmes,
  (SELECT count(*) FROM fgc.trades_registry) AS total_trades,
  (SELECT count(*) FROM fgc.curriculum_qualifications WHERE saqa_qualification_id IS NOT NULL) AS records_with_saqa_ids,
  (SELECT count(*) FROM fgc.curriculum_qualifications WHERE qcto_code IS NOT NULL) AS records_with_qcto_codes,
  (SELECT count(*) FROM fgc.curriculum_versions_master WHERE status IN ('CURRENT', 'ACTIVE')) AS active_curricula,
  (SELECT count(*) FROM fgc.curriculum_versions_master WHERE status = 'TEACH_OUT') AS teach_out_curricula,
  (SELECT count(*) FROM fgc.curriculum_versions_master WHERE status = 'HISTORICAL') AS historical_curricula,
  (SELECT count(*) FROM fgc.curriculum_programmes WHERE source_document_id IS NULL) +
  (SELECT count(*) FROM fgc.curriculum_subjects WHERE source_document_id IS NULL) +
  (SELECT count(*) FROM fgc.curriculum_modules WHERE source_document_id IS NULL) AS records_missing_source_provenance,
  (SELECT count(*) FROM fgc.reference_data_requests WHERE status = 'PENDING_REVIEW') AS pending_curriculum_requests,
  (SELECT max(completed_at) FROM fgc.curriculum_import_batches WHERE status = 'APPLIED') AS latest_official_import_at;

CREATE OR REPLACE VIEW fgc.v_curriculum_search_index AS
SELECT 'PROGRAMME' AS record_type, id AS record_id, official_title AS title, programme_code AS code, framework::text AS framework, verification_status::text AS status
FROM fgc.curriculum_programmes
UNION ALL
SELECT 'QUALIFICATION', id, official_title, COALESCE(saqa_qualification_id, qcto_code, qualification_code), framework::text, verification_status::text
FROM fgc.curriculum_qualifications
UNION ALL
SELECT 'SUBJECT', id, official_name, subject_code, framework::text, verification_status::text
FROM fgc.curriculum_subjects
UNION ALL
SELECT 'MODULE', id, official_name, module_code, module_type::text, verification_status::text
FROM fgc.curriculum_modules
UNION ALL
SELECT 'TRADE', id, trade_name, COALESCE(trade_code, ofo_code), 'APPRENTICESHIP_TRADE', verification_status::text
FROM fgc.trades_registry;
