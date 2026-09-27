import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  evaluateFgcLecturerDraft,
  fgcLecturerModules,
  fieldKey,
  sanitizeFgcLecturerDraft,
  type FgcLecturerDraftValues
} from "@/lib/fgc/lecturer-form";

const root = process.cwd();
const accessUiSource = readFileSync(join(root, "src", "components", "merseta-fgc", "FgcAccessExperience.tsx"), "utf8");
const assignmentRepairMigration = readFileSync(join(root, "db", "fgc", "011_lecturer_toolkit_assignment_repair.sql"), "utf8");
const migrationConfig = readFileSync(join(root, "scripts", "fgc", "config.mjs"), "utf8");

describe("FGC Lecturer Toolkit 1–13 contract", () => {
  it("defines every tool once and exposes explicit ownership", () => {
    expect(fgcLecturerModules).toHaveLength(13);
    expect(fgcLecturerModules.map((tool) => tool.toolNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(fgcLecturerModules.map((tool) => tool.code)).toEqual([
      "consent_profile",
      "teaching_context",
      "learner_utilisation",
      "curriculum_integration",
      "content_creation_self_assessment",
      "assessor_capability_assessment",
      "moderation_review",
      "experience_register",
      "evidence_uploads",
      "barriers_support",
      "institutional_commitments",
      "monitoring_reporting",
      "corrective_action_plan"
    ]);
    expect(fgcLecturerModules.every((tool) => tool.owner && tool.downstream)).toBe(true);
  });

  it("keeps assessor, moderator, college, system and JEF outputs read-only for lecturers", () => {
    const downstreamTools = fgcLecturerModules.filter((tool) => [6, 7, 11, 12, 13].includes(tool.toolNumber));
    expect(downstreamTools.every((tool) => tool.lecturerAccess === "VIEW" && tool.fields.length === 0)).toBe(true);
  });

  it("does not let a lecturer self-award the final capability classification", () => {
    const selfAssessment = fgcLecturerModules.find((tool) => tool.toolNumber === 5);
    const optionText = selfAssessment?.fields.flatMap((item) => item.options ?? []).join(" ") ?? "";
    expect(optionText).not.toContain("Independent");
    expect(optionText).not.toContain("Support Required");
    expect(selfAssessment?.downstream).toContain("authorised assessment");
  });

  it("counts only lecturer-owned required fields toward submission readiness", () => {
    const values: FgcLecturerDraftValues = {};
    for (const tool of fgcLecturerModules) {
      for (const item of tool.fields) {
        if (item.required) values[fieldKey(tool.code, item.code)] = "completed";
      }
    }
    const completion = evaluateFgcLecturerDraft(values);
    expect(completion.complete).toBe(true);
    expect(completion.completionPercent).toBe(100);
    expect(completion.modules.filter((tool) => tool.lecturerAccess === "VIEW").every((tool) => tool.required === 0)).toBe(true);
  });

  it("drops unknown and downstream-owned keys at the write boundary", () => {
    expect(sanitizeFgcLecturerDraft({
      "consent_profile.lecturer_full_name": "Lecturer One",
      "assessor_capability_assessment.final_capability": "Independent",
      "unknown.injected": "not allowed"
    })).toEqual({ "consent_profile.lecturer_full_name": "Lecturer One" });
  });

  it("uses the canonical dashboard route while preserving the former route alias", () => {
    expect(accessUiSource).toContain('["My Lecturer Dashboard", "/fgc-ekm/dashboard"');
    expect(accessUiSource).toContain('routePath.endsWith("/dashboard") || routePath.endsWith("/my-dashboard")');
    expect(accessUiSource).toContain('["FGC Data Capture", "/fgc-ekm/data-capturer"');
  });

  it("repairs missing active assignments only for eligible approved lecturers", () => {
    expect(migrationConfig).toContain('"011_lecturer_toolkit_assignment_repair.sql"');
    expect(assignmentRepairMigration).toContain("r.code = 'LECTURER'");
    expect(assignmentRepairMigration).toContain("pra.status = 'APPROVED'");
    expect(assignmentRepairMigration).toContain("u.account_state = 'ACTIVE'");
    expect(assignmentRepairMigration).toContain("u.email_verified_at IS NOT NULL");
    expect(assignmentRepairMigration).toContain("idx_fgc_active_lecturer_assignment");
    expect(assignmentRepairMigration).toContain("ON CONFLICT (template_id, assigned_to)");
    expect(assignmentRepairMigration).toContain("PROVISION_LECTURER_TOOLKIT_ASSIGNMENT");
  });
});
