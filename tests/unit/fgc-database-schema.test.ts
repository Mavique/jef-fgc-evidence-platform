import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const schema = readFileSync(join(root, "db", "fgc", "001_schema.sql"), "utf8");
const referenceSchema = readFileSync(join(root, "db", "fgc", "003_tvet_reference_schema.sql"), "utf8");
const referenceSeed = readFileSync(join(root, "db", "fgc", "004_seed_tvet_reference.sql"), "utf8");
const curriculumSchema = readFileSync(join(root, "db", "fgc", "005_curriculum_master_schema.sql"), "utf8");
const curriculumSeed = readFileSync(join(root, "db", "fgc", "006_seed_curriculum_master.sql"), "utf8");
const productionSchema = readFileSync(join(root, "db", "fgc", "007_production_hardening_schema.sql"), "utf8");
const evidenceUploadLifecycleMigration = readFileSync(join(root, "db", "fgc", "008_evidence_upload_lifecycle.sql"), "utf8");
const reviewAssignmentMigration = readFileSync(join(root, "db", "fgc", "009_review_assignment_workflows.sql"), "utf8");
const migrationConfig = readFileSync(join(root, "scripts", "fgc", "config.mjs"), "utf8");

describe("FGC PostgreSQL schema", () => {
  it("keeps the core evidence domains represented as tables", () => {
    [
      "fgc.evidence_items",
      "fgc.learner_use_records",
      "fgc.lecturer_assessments",
      "fgc.lecturer_rubric_scores",
      "fgc.contradictions",
      "fgc.corrective_actions",
      "fgc.capture_sessions",
      "fgc.sign_offs"
    ].forEach((tableName) => {
      expect(schema).toContain(`CREATE TABLE ${tableName}`);
    });
  });

  it("models source-truth statuses and the full lecturer capability rubric", () => {
    ["VERIFIED", "PARTIALLY_VERIFIED", "NOT_VERIFIED", "CONTRADICTED"].forEach((status) => {
      expect(schema).toContain(`'${status}'`);
    });

    [
      "CURRICULUM_RELEVANCE",
      "EXPERIENCE_CREATION",
      "PLATFORM_ORGANISATION",
      "PUBLISHING_AND_DEPLOYMENT",
      "TEACHING_APPLICATION",
      "LEARNER_EVIDENCE_AND_ANALYTICS",
      "TROUBLESHOOTING_AND_REPEATABILITY"
    ].forEach((area) => {
      expect(schema).toContain(`'${area}'`);
    });
  });

  it("provides dashboard views for the frontend observatory", () => {
    [
      "fgc.v_dashboard_summary",
      "fgc.v_evidence_status_summary",
      "fgc.v_college_learner_use_comparison",
      "fgc.v_lecturer_assessment_scoring"
    ].forEach((viewName) => {
      expect(schema).toContain(`VIEW ${viewName}`);
    });
  });
});

describe("FGC evidence upload lifecycle migration", () => {
  it("extends the existing canonical evidence_files table without creating a parallel table", () => {
    expect(productionSchema).toContain("CREATE TABLE fgc.evidence_files");
    expect(evidenceUploadLifecycleMigration).toContain("ALTER TABLE fgc.evidence_files");
    expect(evidenceUploadLifecycleMigration).not.toContain("CREATE TABLE fgc.evidence_uploads");
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS upload_status text NOT NULL DEFAULT 'COMPLETED'");
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS scanner_status text NOT NULL DEFAULT 'UNAVAILABLE'");
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS evidence_version integer NOT NULL DEFAULT 1");
  });

  it("links evidence to canonical submissions, response values and replacement versions", () => {
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS replaced_file_id uuid REFERENCES fgc.evidence_files(id)");
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS submission_version_id uuid REFERENCES fgc.production_submission_versions(id) ON DELETE SET NULL");
    expect(evidenceUploadLifecycleMigration).toContain("ADD COLUMN IF NOT EXISTS response_value_id uuid REFERENCES fgc.production_response_values(id) ON DELETE SET NULL");
    expect(evidenceUploadLifecycleMigration).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_evidence_files_single_replacement");
    expect(evidenceUploadLifecycleMigration).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_evidence_files_submission_checksum_category");
    expect(evidenceUploadLifecycleMigration).toContain("upload_completed_at IS NOT NULL");
  });

  it("is discoverable by the normal migration runner and separate from seed execution", () => {
    const migrationList = migrationConfig.slice(migrationConfig.indexOf("export const migrationFiles"), migrationConfig.indexOf("export const referenceSeedFiles"));
    expect(migrationList).toContain('"008_evidence_upload_lifecycle.sql"');
    expect(migrationList).not.toContain("seeds/");
    expect(migrationList).not.toContain("004_seed_tvet_reference.sql");
    expect(migrationList).not.toContain("006_seed_curriculum_master.sql");
  });
});

describe("FGC review assignment workflow migration", () => {
  it("uses canonical assignment records and preserves history", () => {
    expect(reviewAssignmentMigration).toContain("CREATE TABLE IF NOT EXISTS fgc.review_assignments");
    expect(reviewAssignmentMigration).toContain("submission_version_id uuid NOT NULL REFERENCES fgc.production_submission_versions(id)");
    expect(reviewAssignmentMigration).toContain("assignment_type text NOT NULL CHECK (assignment_type IN ('ASSESSOR', 'MODERATOR'))");
    expect(reviewAssignmentMigration).toContain("reassignment_of uuid REFERENCES fgc.review_assignments(id)");
    expect(reviewAssignmentMigration).toContain("status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVOKED', 'SUPERSEDED')");
    expect(reviewAssignmentMigration).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_fgc_review_assignments_one_active_stage");
    expect(reviewAssignmentMigration).toContain("CREATE TABLE IF NOT EXISTS fgc.assessor_reviews");
    expect(reviewAssignmentMigration).toContain("CREATE TABLE IF NOT EXISTS fgc.moderation_records");
    expect(reviewAssignmentMigration).toContain("validate_review_assignment_version");
    expect(reviewAssignmentMigration).toContain("validate_review_record_assignment");
    expect(reviewAssignmentMigration).toContain("assessor review does not match its assessor assignment");
    expect(reviewAssignmentMigration).toContain("moderation record requires a submitted assessor review");
    expect(reviewAssignmentMigration).not.toContain("evidence_reviews");
  });

  it("enforces lecturer self-review rejection in the assignment trigger", () => {
    const triggerStart = reviewAssignmentMigration.indexOf(
      "CREATE OR REPLACE FUNCTION fgc.validate_review_assignment_version",
    );
    const triggerEnd = reviewAssignmentMigration.indexOf(
      "$$;\n\nDROP TRIGGER IF EXISTS trg_fgc_review_assignment_version",
    );
    const triggerBody = reviewAssignmentMigration.slice(triggerStart, triggerEnd);
    const selfReviewCheck = triggerBody.match(
      /IF EXISTS \([\s\S]*?submitted_by = NEW\.assignee_user_id[\s\S]*?END IF;/,
    )?.[0];

    expect(triggerStart).toBeGreaterThanOrEqual(0);
    expect(triggerEnd).toBeGreaterThan(triggerStart);
    expect(selfReviewCheck).toBeDefined();
    expect(selfReviewCheck).toContain("FROM fgc.production_submissions");
    expect(selfReviewCheck).toContain("id = NEW.submission_id");
    expect(selfReviewCheck).toContain("RAISE EXCEPTION");
    expect(selfReviewCheck).toContain(
      "the submitting lecturer cannot be assigned as a reviewer",
    );
    expect(selfReviewCheck).not.toContain("assignment_type");
    expect(reviewAssignmentMigration).toContain(
      "CREATE TRIGGER trg_fgc_review_assignment_version",
    );
    expect(reviewAssignmentMigration).toContain("BEFORE INSERT OR UPDATE");
    expect(reviewAssignmentMigration).toContain(
      "EXECUTE FUNCTION fgc.validate_review_assignment_version()",
    );
  });

  it("is registered after evidence lifecycle without registering demo seeds", () => {
    const migrationList = migrationConfig.slice(migrationConfig.indexOf("export const migrationFiles"), migrationConfig.indexOf("export const referenceSeedFiles"));
    expect(migrationList).toContain('"009_review_assignment_workflows.sql"');
    expect(migrationList.indexOf("008_evidence_upload_lifecycle.sql")).toBeLessThan(migrationList.indexOf("009_review_assignment_workflows.sql"));
    expect(migrationList).not.toContain("002_seed_demo.sql");
  });
});

describe("FGC national curriculum master catalogue", () => {
  it("separates curriculum records from campus offering intelligence", () => {
    [
      "fgc.curriculum_source_documents",
      "fgc.curriculum_versions_master",
      "fgc.programme_disciplines",
      "fgc.subject_families",
      "fgc.curriculum_qualifications",
      "fgc.curriculum_programmes",
      "fgc.curriculum_subjects",
      "fgc.curriculum_modules",
      "fgc.curriculum_programme_levels",
      "fgc.curriculum_programme_subjects",
      "fgc.curriculum_programme_modules",
      "fgc.trades_registry",
      "fgc.reference_aliases",
      "fgc.reference_data_requests",
      "fgc.possible_campus_programme_mappings"
    ].forEach((tableName) => {
      expect(curriculumSchema).toContain(`CREATE TABLE ${tableName}`);
    });

    expect(curriculumSchema).toContain("fgc.v_curriculum_catalogue_quality");
    expect(curriculumSchema).toContain("fgc.v_curriculum_search_index");
  });

  it("supports the required TVET curriculum frameworks and not-found workflow", () => {
    [
      "REPORT_191_NATED_ENGINEERING",
      "REPORT_191_NATED_BUSINESS",
      "OCCUPATIONAL_PART_QUALIFICATION",
      "OCCUPATIONAL_SKILLS_PROGRAMME",
      "APPRENTICESHIP_TRADE",
      "HISTORICAL_TEACH_OUT",
      "PENDING_REVIEW",
      "APPROVED_CREATED"
    ].forEach((value) => {
      expect(curriculumSchema).toContain(value);
    });
  });

  it("seeds source provenance and catalogue aliases without claiming completion", () => {
    expect(curriculumSeed).toContain("NC(V) Subject Matrix and Subject Guidelines");
    expect(curriculumSeed).toContain("Report 191 NATED Curriculum Documents and Revised Syllabi");
    expect(curriculumSeed).toContain("Full matrix import remains pending");
    expect(curriculumSeed).toContain("('ERD'");
    expect(curriculumSeed).toContain("('NATED'");
  });
});

describe("FGC TVET reference registry schema", () => {
  it("keeps the national TVET reference domains normalized", () => {
    [
      "fgc.reference_sources",
      "fgc.provinces",
      "fgc.tvet_colleges",
      "fgc.campus_sites",
      "fgc.programme_categories",
      "fgc.programme_levels",
      "fgc.programme_catalogue",
      "fgc.curriculum_versions",
      "fgc.subject_modules",
      "fgc.college_programme_offerings",
      "fgc.campus_programme_offerings",
      "fgc.lecturer_teaching_assignments",
      "fgc.reference_import_batches",
      "fgc.reference_import_staging_rows"
    ].forEach((tableName) => {
      expect(referenceSchema).toContain(`CREATE TABLE ${tableName}`);
    });
  });

  it("enforces reference integrity with views, functions and triggers", () => {
    [
      "assert_campus_offering_has_college_offering",
      "assert_programme_level_subject_valid",
      "assert_lecturer_primary_campus_matches_college",
      "fgc.v_reference_data_quality",
      "fgc.v_reference_lecturer_onboarding_options"
    ].forEach((objectName) => {
      expect(referenceSchema).toContain(objectName);
    });
  });

  it("seeds the national public TVET college list without campus offering claims", () => {
    const collegeSeedBlock = referenceSeed.slice(
      referenceSeed.indexOf("INSERT INTO fgc.tvet_colleges"),
      referenceSeed.indexOf(") AS college(province_name, official_name, short_name, acronym)")
    );

    expect(collegeSeedBlock.match(/^\s+\('/gm)).toHaveLength(50);
    expect(referenceSeed).toContain("Sedibeng TVET College");
    expect(referenceSeed).toContain("Mopani South East TVET College");
    expect(referenceSeed).toContain("College of Cape Town for TVET");
    expect(referenceSeed).toContain("no campus is assumed to offer a programme");
  });
});
