import { describe, expect, it } from "vitest";
import {
  classifyAssessment,
  fgcRouteDefinitions,
  rubricAreas,
  totalRubricScore,
  type LecturerAssessment,
  type RubricScore
} from "@/content/merseta-fgc";

const scores = (score: 0 | 1 | 2): RubricScore[] =>
  rubricAreas.map((area) => ({
    area,
    score,
    evidenceNote: "Unit test evidence note"
  }));

const assessment = (overrides: Partial<LecturerAssessment>): LecturerAssessment => ({
  id: "AS-TEST",
  college: "Test College",
  campus: "Test Campus",
  lecturer: "Test Lecturer",
  programme: "Test Programme",
  date: "2026-09-09",
  experienceTitle: "Test Experience",
  eonUrl: "EON-TEST",
  scores: scores(2),
  assistanceType: "None",
  facilitatorExecuted: false,
  environmentFault: false,
  moderation: "Pending",
  evidenceIds: [],
  ...overrides
});

describe("merSETA FGC evidence rules", () => {
  it("classifies a full independent demonstration only when all rubric areas score 2", () => {
    const item = assessment({});

    expect(totalRubricScore(item.scores)).toBe(14);
    expect(classifyAssessment(item)).toBe("Independent");
  });

  it("facilitator execution invalidates independence even with high scores", () => {
    expect(classifyAssessment(assessment({ facilitatorExecuted: true, assistanceType: "Facilitator Execution" }))).toBe("Not Yet Demonstrated");
  });

  it("classifies partial prompting as support required when no area is failed", () => {
    const mixed = scores(2);
    mixed[3] = { ...mixed[3], score: 1 };

    expect(classifyAssessment(assessment({ scores: mixed, assistanceType: "Prompting" }))).toBe("Partially Independent / Support Required");
  });

  it("keeps missing or failed assessment evidence out of independent counts", () => {
    expect(classifyAssessment(assessment({ scores: [] }))).toBe("Not Assessed");
    expect(classifyAssessment(assessment({ scores: scores(0) }))).toBe("Not Yet Demonstrated");
  });

  it("keeps FGC access routes explicit about public and protected entry points", () => {
    const signUp = fgcRouteDefinitions.find((route) => route.route === "/fgc-ekm/sign-up");
    const home = fgcRouteDefinitions.find((route) => route.route === "/fgc-ekm/home");
    const adminQueue = fgcRouteDefinitions.find((route) => route.route === "/fgc-ekm/admin/access-requests");

    expect(signUp?.access).toBe("Public");
    expect(home?.access).toBe("Protected");
    expect(adminQueue?.primaryRole).toBe("JEF Administrator");
  });
});
