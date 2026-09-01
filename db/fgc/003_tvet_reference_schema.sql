-- FGC National TVET Master Reference Registry
-- Additive migration. It preserves the existing FGC evidence workflow schema and adds
-- normalized reference-data foundations for South African public TVET institutions,
-- programmes, curricula, offerings, lecturer assignments and imports.

CREATE SCHEMA IF NOT EXISTS fgc;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE fgc.reference_verification_status AS ENUM (
  'OFFICIAL_VERIFIED',
  'COLLEGE_VERIFIED',
  'SECONDARY_VERIFIED',
  'PENDING_VERIFICATION',
  'HISTORICAL',
  'UNKNOWN'
);

CREATE TYPE fgc.offering_status AS ENUM (
  'VERIFIED',
  'REPORTED',
  'PENDING_VERIFICATION',
  'HISTORICAL',
  'TEACH_OUT',
  'INACTIVE'
);

CREATE TYPE fgc.site_type AS ENUM (
  'CAMPUS',
  'SATELLITE_CAMPUS',
  'SKILLS_CENTRE',
  'CENTRE_OF_SPECIALISATION',
  'TRADE_TEST_CENTRE',
  'ARTISAN_DEVELOPMENT_CENTRE',
  'TRAINING_CENTRE',
  'HEAD_OFFICE',
  'OTHER_DELIVERY_SITE'
);

CREATE TYPE fgc.delivery_mode AS ENUM (
  'CONTACT',
  'BLENDED',
  'ONLINE',
  'DISTANCE',
  'WORKPLACE_BASED',
  'PRACTICAL_WORKSHOP',
  'DUAL_SYSTEM',
  'APPRENTICESHIP',
  'OTHER'
);

CREATE TYPE fgc.academic_cycle_type AS ENUM (
  'ANNUAL',
  'SEMESTER',
  'TRIMESTER',
  'BLOCK',
  'ROLLING',
  'OTHER'
);

CREATE TYPE fgc.curriculum_version_status AS ENUM (
  'ACTIVE',
  'SUPERSEDED',
  'TEACH_OUT',
  'HISTORICAL',
  'DRAFT',
  'INACTIVE'
);

CREATE TYPE fgc.import_batch_status AS ENUM (
  'STAGED',
  'VALIDATED',
  'REQUIRES_REVIEW',
  'APPLIED',
  'REJECTED',
  'ROLLED_BACK'
);

CREATE TABLE fgc.reference_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_authority TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_version TEXT,
  publication_date DATE,
  url TEXT,
  retrieved_date DATE,
  effective_date DATE,
  notes TEXT,
  checksum TEXT,
  source_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.reference_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  previous_value JSONB,
  new_value JSONB,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 CHAR(2) NOT NULL UNIQUE,
  iso3 CHAR(3) NOT NULL UNIQUE,
  official_name TEXT NOT NULL UNIQUE,
  common_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES fgc.countries(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  short_name TEXT,
  province_code TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (country_id, official_name)
);

CREATE TABLE fgc.district_municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES fgc.provinces(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  municipality_code TEXT,
  is_metro BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'UNKNOWN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (province_id, official_name)
);

CREATE TABLE fgc.local_municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_municipality_id UUID REFERENCES fgc.district_municipalities(id) ON DELETE RESTRICT,
  province_id UUID NOT NULL REFERENCES fgc.provinces(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  municipality_code TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'UNKNOWN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (province_id, official_name)
);

CREATE TABLE fgc.tvet_colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  acronym TEXT,
  dhet_code TEXT UNIQUE,
  former_name TEXT,
  institution_type TEXT NOT NULL DEFAULT 'PUBLIC_TVET_COLLEGE',
  province_id UUID NOT NULL REFERENCES fgc.provinces(id) ON DELETE RESTRICT,
  district_municipality_id UUID REFERENCES fgc.district_municipalities(id) ON DELETE SET NULL,
  local_municipality_id UUID REFERENCES fgc.local_municipalities(id) ON DELETE SET NULL,
  head_office_address TEXT,
  postal_address TEXT,
  official_telephone TEXT,
  official_email TEXT,
  official_website TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  established_on DATE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
  source_publication_date DATE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.campus_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES fgc.tvet_colleges(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  campus_code TEXT,
  site_type fgc.site_type NOT NULL DEFAULT 'CAMPUS',
  district_municipality_id UUID REFERENCES fgc.district_municipalities(id) ON DELETE SET NULL,
  local_municipality_id UUID REFERENCES fgc.local_municipalities(id) ON DELETE SET NULL,
  physical_address TEXT,
  postal_code TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  telephone TEXT,
  email TEXT,
  webpage TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  teaching_site BOOLEAN NOT NULL DEFAULT TRUE,
  centre_of_specialisation BOOLEAN NOT NULL DEFAULT FALSE,
  trade_test_centre BOOLEAN NOT NULL DEFAULT FALSE,
  facilities_notes TEXT,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  source_date DATE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (college_id, official_name)
);

CREATE TABLE fgc.academic_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES fgc.tvet_colleges(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  division_type TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (college_id, official_name)
);

CREATE TABLE fgc.academic_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_division_id UUID NOT NULL REFERENCES fgc.academic_divisions(id) ON DELETE RESTRICT,
  official_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_division_id, official_name)
);

CREATE TABLE fgc.programme_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE fgc.programme_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_category_id UUID REFERENCES fgc.programme_categories(id) ON DELETE RESTRICT,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  programme_level TEXT NOT NULL,
  nqf_level INTEGER CHECK (nqf_level IS NULL OR nqf_level BETWEEN 1 AND 10),
  sort_order INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fgc.quality_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  official_name TEXT NOT NULL,
  authority_type TEXT NOT NULL,
  website TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL
);

CREATE TABLE fgc.setas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acronym TEXT NOT NULL UNIQUE,
  official_name TEXT NOT NULL,
  sector TEXT,
  website TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.occupations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ofo_code TEXT,
  occupational_title TEXT NOT NULL,
  occupational_group TEXT,
  trade_indicator BOOLEAN NOT NULL DEFAULT FALSE,
  artisan_indicator BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION'
);

CREATE TABLE fgc.economic_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fgc.qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qualification_code TEXT,
  official_title TEXT NOT NULL,
  short_title TEXT,
  programme_category_id UUID NOT NULL REFERENCES fgc.programme_categories(id) ON DELETE RESTRICT,
  qualification_type TEXT,
  qualification_subtype TEXT,
  saqa_id TEXT,
  qcto_id TEXT,
  dhet_code TEXT,
  curriculum_code TEXT,
  ofo_code TEXT,
  nqf_level INTEGER CHECK (nqf_level IS NULL OR nqf_level BETWEEN 1 AND 10),
  total_credits INTEGER CHECK (total_credits IS NULL OR total_credits >= 0),
  minimum_duration TEXT,
  maximum_duration TEXT,
  qualification_purpose TEXT,
  admission_requirements TEXT,
  progression_pathway TEXT,
  articulation_information TEXT,
  certification_body TEXT,
  quality_council_id UUID REFERENCES fgc.quality_authorities(id) ON DELETE SET NULL,
  examination_body TEXT,
  registration_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  registration_start_date DATE,
  registration_end_date DATE,
  teach_out_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.programme_catalogue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_code TEXT,
  official_title TEXT NOT NULL,
  short_title TEXT,
  programme_category_id UUID NOT NULL REFERENCES fgc.programme_categories(id) ON DELETE RESTRICT,
  qualification_id UUID REFERENCES fgc.qualifications(id) ON DELETE SET NULL,
  qualification_type TEXT,
  qualification_subtype TEXT,
  saqa_id TEXT,
  qcto_id TEXT,
  dhet_code TEXT,
  curriculum_code TEXT,
  ofo_code TEXT,
  nqf_level INTEGER CHECK (nqf_level IS NULL OR nqf_level BETWEEN 1 AND 10),
  total_credits INTEGER CHECK (total_credits IS NULL OR total_credits >= 0),
  minimum_duration TEXT,
  maximum_duration TEXT,
  programme_description TEXT,
  qualification_purpose TEXT,
  admission_requirements TEXT,
  progression_pathway TEXT,
  articulation_information TEXT,
  certification_body TEXT,
  quality_council_id UUID REFERENCES fgc.quality_authorities(id) ON DELETE SET NULL,
  relevant_seta_id UUID REFERENCES fgc.setas(id) ON DELETE SET NULL,
  examination_body TEXT,
  registration_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  registration_start_date DATE,
  registration_end_date DATE,
  teach_out_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE RESTRICT,
  curriculum_version TEXT NOT NULL,
  effective_from DATE,
  effective_to DATE,
  academic_year INTEGER,
  supersedes_version_id UUID REFERENCES fgc.curriculum_versions(id) ON DELETE SET NULL,
  status fgc.curriculum_version_status NOT NULL DEFAULT 'ACTIVE',
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.subject_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name TEXT NOT NULL,
  official_code TEXT,
  alternative_name TEXT,
  programme_category_id UUID REFERENCES fgc.programme_categories(id) ON DELETE SET NULL,
  subject_type TEXT,
  nqf_level INTEGER CHECK (nqf_level IS NULL OR nqf_level BETWEEN 1 AND 10),
  programme_level_id UUID REFERENCES fgc.programme_levels(id) ON DELETE SET NULL,
  credits INTEGER CHECK (credits IS NULL OR credits >= 0),
  theory_practical_classification TEXT,
  ncv_classification TEXT CHECK (ncv_classification IS NULL OR ncv_classification IN ('FUNDAMENTAL', 'VOCATIONAL')),
  assessment_information TEXT,
  curriculum_version_id UUID REFERENCES fgc.curriculum_versions(id) ON DELETE SET NULL,
  effective_date DATE,
  expiry_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.programme_level_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE RESTRICT,
  programme_level_id UUID NOT NULL REFERENCES fgc.programme_levels(id) ON DELETE RESTRICT,
  subject_id UUID NOT NULL REFERENCES fgc.subject_modules(id) ON DELETE RESTRICT,
  curriculum_version_id UUID REFERENCES fgc.curriculum_versions(id) ON DELETE SET NULL,
  subject_requirement TEXT NOT NULL CHECK (subject_requirement IN ('COMPULSORY', 'ELECTIVE', 'FUNDAMENTAL', 'VOCATIONAL')),
  subject_group TEXT,
  electives_required INTEGER CHECK (electives_required IS NULL OR electives_required >= 0),
  prerequisite_subject_id UUID REFERENCES fgc.subject_modules(id) ON DELETE SET NULL,
  corequisite_subject_id UUID REFERENCES fgc.subject_modules(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (programme_id, programme_level_id, subject_id)
);

CREATE TABLE fgc.college_programme_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES fgc.tvet_colleges(id) ON DELETE RESTRICT,
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE RESTRICT,
  status fgc.offering_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  academic_year INTEGER,
  start_date DATE,
  end_date DATE,
  accredited BOOLEAN,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.campus_programme_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID NOT NULL REFERENCES fgc.campus_sites(id) ON DELETE RESTRICT,
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE RESTRICT,
  programme_level_id UUID REFERENCES fgc.programme_levels(id) ON DELETE RESTRICT,
  academic_year INTEGER,
  delivery_mode fgc.delivery_mode,
  intake_cycle fgc.academic_cycle_type,
  status fgc.offering_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  accreditation_status TEXT,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  effective_from DATE,
  effective_to DATE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
);

CREATE TABLE fgc.academic_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year INTEGER NOT NULL,
  cycle_type fgc.academic_cycle_type NOT NULL,
  period_label TEXT NOT NULL,
  starts_on DATE,
  ends_on DATE,
  assessment_starts_on DATE,
  assessment_ends_on DATE,
  examination_starts_on DATE,
  examination_ends_on DATE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (academic_year, cycle_type, period_label)
);

CREATE TABLE fgc.programme_occupations (
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE CASCADE,
  occupation_id UUID NOT NULL REFERENCES fgc.occupations(id) ON DELETE CASCADE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  PRIMARY KEY (programme_id, occupation_id)
);

CREATE TABLE fgc.programme_sectors (
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES fgc.economic_sectors(id) ON DELETE CASCADE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  PRIMARY KEY (programme_id, sector_id)
);

CREATE TABLE fgc.programme_setas (
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE CASCADE,
  seta_id UUID NOT NULL REFERENCES fgc.setas(id) ON DELETE CASCADE,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  PRIMARY KEY (programme_id, seta_id)
);

CREATE TABLE fgc.reference_option_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  administrator_configurable BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fgc.reference_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_set_id UUID NOT NULL REFERENCES fgc.reference_option_sets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (option_set_id, code)
);

CREATE TABLE fgc.evidence_type_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  administrator_configurable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.campus_facility_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fgc.campus_facilities (
  campus_id UUID NOT NULL REFERENCES fgc.campus_sites(id) ON DELETE CASCADE,
  facility_type_id UUID NOT NULL REFERENCES fgc.campus_facility_types(id) ON DELETE RESTRICT,
  quantity INTEGER CHECK (quantity IS NULL OR quantity >= 0),
  condition_status TEXT,
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  PRIMARY KEY (campus_id, facility_type_id)
);

CREATE TABLE fgc.technology_readiness_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fgc.lecturer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  title_option_id UUID REFERENCES fgc.reference_options(id) ON DELETE SET NULL,
  employment_type_option_id UUID REFERENCES fgc.reference_options(id) ON DELETE SET NULL,
  lecturer_role_option_id UUID REFERENCES fgc.reference_options(id) ON DELETE SET NULL,
  primary_college_id UUID REFERENCES fgc.tvet_colleges(id) ON DELETE SET NULL,
  primary_campus_id UUID REFERENCES fgc.campus_sites(id) ON DELETE SET NULL,
  primary_department_id UUID REFERENCES fgc.academic_departments(id) ON DELETE SET NULL,
  professional_registration_reference TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fgc.lecturer_teaching_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_profile_id UUID NOT NULL REFERENCES fgc.lecturer_profiles(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES fgc.campus_sites(id) ON DELETE RESTRICT,
  programme_id UUID NOT NULL REFERENCES fgc.programme_catalogue(id) ON DELETE RESTRICT,
  programme_level_id UUID REFERENCES fgc.programme_levels(id) ON DELETE RESTRICT,
  subject_id UUID REFERENCES fgc.subject_modules(id) ON DELETE RESTRICT,
  academic_department_id UUID REFERENCES fgc.academic_departments(id) ON DELETE SET NULL,
  academic_year INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verification_status fgc.reference_verification_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lecturer_profile_id, campus_id, programme_id, subject_id, academic_year)
);

CREATE TABLE fgc.reference_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES fgc.reference_sources(id) ON DELETE SET NULL,
  import_name TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  file_name TEXT,
  file_hash TEXT,
  imported_by UUID REFERENCES fgc.users(id) ON DELETE SET NULL,
  status fgc.import_batch_status NOT NULL DEFAULT 'STAGED',
  inserted_count INTEGER NOT NULL DEFAULT 0 CHECK (inserted_count >= 0),
  updated_count INTEGER NOT NULL DEFAULT 0 CHECK (updated_count >= 0),
  unchanged_count INTEGER NOT NULL DEFAULT 0 CHECK (unchanged_count >= 0),
  rejected_count INTEGER NOT NULL DEFAULT 0 CHECK (rejected_count >= 0),
  duplicate_count INTEGER NOT NULL DEFAULT 0 CHECK (duplicate_count >= 0),
  unresolved_relationship_count INTEGER NOT NULL DEFAULT 0 CHECK (unresolved_relationship_count >= 0),
  validation_report JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ
);

CREATE TABLE fgc.reference_import_staging_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id UUID NOT NULL REFERENCES fgc.reference_import_batches(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_payload JSONB NOT NULL,
  canonical_payload JSONB,
  row_status TEXT NOT NULL DEFAULT 'STAGED',
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  duplicate_of_row_id UUID REFERENCES fgc.reference_import_staging_rows(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (import_batch_id, row_number)
);

CREATE OR REPLACE FUNCTION fgc.assert_campus_offering_has_college_offering()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  parent_college_id UUID;
BEGIN
  SELECT college_id INTO parent_college_id
  FROM fgc.campus_sites
  WHERE id = NEW.campus_id;

  IF NOT EXISTS (
    SELECT 1
    FROM fgc.college_programme_offerings cpo
    WHERE cpo.college_id = parent_college_id
      AND cpo.programme_id = NEW.programme_id
      AND cpo.status IN ('VERIFIED', 'REPORTED', 'PENDING_VERIFICATION', 'TEACH_OUT')
  ) THEN
    RAISE EXCEPTION 'Campus programme offering requires a matching college programme offering';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fgc.assert_programme_level_subject_valid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.subject_id IS NOT NULL AND NEW.programme_level_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM fgc.programme_level_subjects pls
      WHERE pls.programme_id = NEW.programme_id
        AND pls.programme_level_id = NEW.programme_level_id
        AND pls.subject_id = NEW.subject_id
        AND pls.active = TRUE
    ) THEN
      RAISE EXCEPTION 'Subject is not valid for the selected programme and level';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fgc.assert_lecturer_primary_campus_matches_college()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.primary_college_id IS NOT NULL AND NEW.primary_campus_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM fgc.campus_sites cs
      WHERE cs.id = NEW.primary_campus_id
        AND cs.college_id = NEW.primary_college_id
    ) THEN
      RAISE EXCEPTION 'Lecturer primary campus must belong to the selected college';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campus_offering_parent_college
BEFORE INSERT OR UPDATE ON fgc.campus_programme_offerings
FOR EACH ROW EXECUTE FUNCTION fgc.assert_campus_offering_has_college_offering();

CREATE TRIGGER trg_lecturer_assignment_subject_valid
BEFORE INSERT OR UPDATE ON fgc.lecturer_teaching_assignments
FOR EACH ROW EXECUTE FUNCTION fgc.assert_programme_level_subject_valid();

CREATE TRIGGER trg_lecturer_primary_campus_matches_college
BEFORE INSERT OR UPDATE ON fgc.lecturer_profiles
FOR EACH ROW EXECUTE FUNCTION fgc.assert_lecturer_primary_campus_matches_college();

CREATE INDEX idx_fgc_tvet_colleges_province ON fgc.tvet_colleges (province_id, active);
CREATE INDEX idx_fgc_campus_sites_college ON fgc.campus_sites (college_id, active, verification_status);
CREATE UNIQUE INDEX idx_fgc_reference_sources_unique ON fgc.reference_sources (source_authority, document_title, COALESCE(document_version, ''), COALESCE(url, ''));
CREATE UNIQUE INDEX idx_fgc_occupations_unique ON fgc.occupations (COALESCE(ofo_code, ''), occupational_title);
CREATE UNIQUE INDEX idx_fgc_qualifications_unique ON fgc.qualifications (programme_category_id, official_title, COALESCE(qualification_code, ''));
CREATE INDEX idx_fgc_programmes_category ON fgc.programme_catalogue (programme_category_id, active);
CREATE UNIQUE INDEX idx_fgc_programmes_unique ON fgc.programme_catalogue (programme_category_id, official_title, COALESCE(programme_code, ''));
CREATE INDEX idx_fgc_programmes_codes ON fgc.programme_catalogue (programme_code, saqa_id, qcto_id, ofo_code);
CREATE UNIQUE INDEX idx_fgc_curriculum_versions_unique ON fgc.curriculum_versions (programme_id, curriculum_version, COALESCE(academic_year, 0));
CREATE UNIQUE INDEX idx_fgc_subject_modules_unique ON fgc.subject_modules (COALESCE(official_code, ''), official_name);
CREATE INDEX idx_fgc_subject_search ON fgc.subject_modules (official_code, official_name);
CREATE INDEX idx_fgc_programme_level_subject_lookup ON fgc.programme_level_subjects (programme_id, programme_level_id, active);
CREATE UNIQUE INDEX idx_fgc_college_offerings_unique ON fgc.college_programme_offerings (college_id, programme_id, COALESCE(academic_year, 0));
CREATE INDEX idx_fgc_college_offerings_lookup ON fgc.college_programme_offerings (college_id, programme_id, status, academic_year);
CREATE UNIQUE INDEX idx_fgc_campus_offerings_unique ON fgc.campus_programme_offerings (campus_id, programme_id, COALESCE(programme_level_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(academic_year, 0));
CREATE INDEX idx_fgc_campus_offerings_lookup ON fgc.campus_programme_offerings (campus_id, programme_id, programme_level_id, status, academic_year);
CREATE UNIQUE INDEX idx_fgc_lecturer_assignments_unique ON fgc.lecturer_teaching_assignments (lecturer_profile_id, campus_id, programme_id, COALESCE(programme_level_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(academic_year, 0));
CREATE INDEX idx_fgc_lecturer_assignments_scope ON fgc.lecturer_teaching_assignments (lecturer_profile_id, campus_id, programme_id, programme_level_id);
CREATE INDEX idx_fgc_import_staging_payload_gin ON fgc.reference_import_staging_rows USING GIN (raw_payload);

CREATE OR REPLACE VIEW fgc.v_reference_data_quality AS
SELECT
  (SELECT COUNT(*) FROM fgc.tvet_colleges WHERE active = TRUE) AS total_active_colleges,
  (SELECT COUNT(*) FROM fgc.campus_sites WHERE active = TRUE) AS total_active_campuses,
  (SELECT COUNT(*) FROM fgc.qualifications WHERE active = TRUE) AS total_qualifications,
  (SELECT COUNT(*) FROM fgc.programme_catalogue WHERE active = TRUE) AS total_programmes,
  (SELECT COUNT(*) FROM fgc.subject_modules WHERE active = TRUE) AS total_subjects,
  (SELECT COUNT(*) FROM fgc.college_programme_offerings WHERE status = 'VERIFIED') AS verified_college_offerings,
  (SELECT COUNT(*) FROM fgc.campus_programme_offerings WHERE status = 'VERIFIED') AS verified_campus_offerings,
  (SELECT COUNT(*) FROM fgc.college_programme_offerings WHERE status IN ('REPORTED', 'PENDING_VERIFICATION')) AS unverified_college_offerings,
  (SELECT COUNT(*) FROM fgc.campus_programme_offerings WHERE status IN ('REPORTED', 'PENDING_VERIFICATION')) AS unverified_campus_offerings,
  (SELECT COUNT(*) FROM fgc.campus_sites WHERE physical_address IS NULL AND active = TRUE) AS missing_campus_addresses,
  (SELECT COUNT(*) FROM fgc.tvet_colleges WHERE dhet_code IS NULL AND active = TRUE) AS missing_college_codes,
  (SELECT COUNT(*) FROM fgc.reference_import_staging_rows WHERE row_status = 'DUPLICATE') AS duplicate_candidates,
  (SELECT COUNT(*) FROM fgc.tvet_colleges WHERE last_verified_at IS NULL OR last_verified_at < now() - INTERVAL '18 months') AS stale_college_records,
  (SELECT COUNT(*) FROM fgc.campus_sites WHERE verification_status IN ('PENDING_VERIFICATION', 'UNKNOWN')) AS records_requiring_review,
  (SELECT max(retrieved_date) FROM fgc.reference_sources) AS last_source_update,
  (SELECT max(applied_at) FROM fgc.reference_import_batches WHERE status = 'APPLIED') AS last_successful_import;

CREATE OR REPLACE VIEW fgc.v_reference_lecturer_onboarding_options AS
SELECT
  p.id AS province_id,
  p.official_name AS province_name,
  c.id AS college_id,
  c.official_name AS college_name,
  cs.id AS campus_id,
  cs.official_name AS campus_name,
  pc.id AS programme_category_id,
  pc.name AS programme_category,
  pr.id AS programme_id,
  pr.official_title AS programme_title,
  pl.id AS programme_level_id,
  pl.label AS programme_level,
  sm.id AS subject_id,
  sm.official_name AS subject_name
FROM fgc.provinces p
JOIN fgc.tvet_colleges c ON c.province_id = p.id AND c.active = TRUE
JOIN fgc.campus_sites cs ON cs.college_id = c.id AND cs.active = TRUE
LEFT JOIN fgc.campus_programme_offerings cpo ON cpo.campus_id = cs.id AND cpo.status IN ('VERIFIED', 'REPORTED')
LEFT JOIN fgc.programme_catalogue pr ON pr.id = cpo.programme_id
LEFT JOIN fgc.programme_categories pc ON pc.id = pr.programme_category_id
LEFT JOIN fgc.programme_levels pl ON pl.id = cpo.programme_level_id
LEFT JOIN fgc.programme_level_subjects pls ON pls.programme_id = pr.id AND pls.programme_level_id = pl.id AND pls.active = TRUE
LEFT JOIN fgc.subject_modules sm ON sm.id = pls.subject_id;
