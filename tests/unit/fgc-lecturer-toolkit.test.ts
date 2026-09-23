import { describe, expect, it } from "vitest";
import {
  evaluateFgcLecturerDraft,
  fgcLecturerModules,
  fieldKey,
  sanitizeFgcLecturerDraft,
  type FgcLecturerDraftValues
} from "@/lib/fgc/lecturer-form";

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
});
