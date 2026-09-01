import { describe, expect, it } from "vitest";
import { programmeCatalogue, programmeLevels, campusSites, tvetColleges } from "@/content/fgc-reference-data";
import { evidenceItems, learnerUseRecords, lecturerAssessments, correctiveActions, decisionRegister } from "@/content/merseta-fgc";
import { createCaptureSubmission, exportWorkspace, hydrateWorkspace, updateActionStatus, type CaptureDraft } from "@/services/fgc-workspace";

const base = hydrateWorkspace({
  scope: {
    reportingPeriod: "September 2026",
    collegeScope: "Test scope",
    role: "JEF Administrator"
  },
  evidence: evidenceItems,
  learnerUse: learnerUseRecords,
  assessments: lecturerAssessments,
  actions: correctiveActions,
  decisions: decisionRegister,
  permissions: []
});

const draft: CaptureDraft = {
  reportingPeriod: "September 2026",
  owner: "College Evidence Owner",
  useDate: "2026-09-10",
  startTime: "09:00",
  endTime: "11:00",
  activeLearners: "21",
  enrolledLearners: "25",
  useContext: "Scheduled class",
  sourceName: "EON export row 12",
  evidenceType: "Platform analytics export",
  supportsQuestion: "Q1 learner utilisation",
  qualityStatus: "Verified",
  evidenceReference: "EON-EXPORT-12",
  reviewerNotes: "Matched against timetable.",
  lecturer: "Lecturer Product",
  experienceTitle: "Electrical Safety XR",
  eonId: "EON-PROD-001",
  assistance: "None",
  facilitatorExecuted: "No",
  environmentFault: "No environment fault",
  signoffOwner: "Evidence Lead",
  findingSummary: "Q1 and Q2 captured separately.",
  limitations: "None recorded."
};

describe("FGC product workspace service", () => {
  it("hydrates a workspace with product-grade empty workflow collections", () => {
    expect(base.referenceRequests).toEqual([]);
    expect(base.auditEvents).toEqual([]);
    expect(base.lastUpdatedAt).toBeTruthy();
  });

  it("turns a signed-off capture draft into evidence, learner, assessment and audit records", () => {
    const next = createCaptureSubmission(base, draft, {
      selectedCollege: tvetColleges.find((college) => college.id === "sedibeng-tvet-college"),
      selectedCampus: campusSites.find((campus) => campus.id === "sedibeng-sebokeng-campus"),
      selectedProgramme: programmeCatalogue.find((programme) => programme.id === "programme-engineering-and-related-design"),
      selectedLevel: programmeLevels.find((level) => level.id === "level-ncv-l2"),
      selectedSubjects: []
    }, "Unit Test User");

    expect(next.evidence).toHaveLength(base.evidence.length + 1);
    expect(next.learnerUse).toHaveLength(base.learnerUse.length + 1);
    expect(next.assessments).toHaveLength(base.assessments.length + 1);
    expect(next.auditEvents[0].action).toBe("CAPTURE_PACKAGE_SUBMITTED");
    expect(next.learnerUse[0].college).toBe("Sedibeng TVET College");
  });

  it("creates a pending reference request without creating official curriculum records", () => {
    const next = createCaptureSubmission(base, {
      ...draft,
      requestedProgramme: "New official course pending",
      requestedSubject: "New module pending",
      requestedQualificationType: "Occupational",
      requestedLevel: "NQF 4",
      requestedEvidence: "Official document pending review"
    }, {
      selectedCollege: tvetColleges.find((college) => college.id === "sedibeng-tvet-college"),
      selectedCampus: campusSites.find((campus) => campus.id === "sedibeng-sebokeng-campus"),
      selectedProgramme: programmeCatalogue[0],
      selectedLevel: programmeLevels[0],
      selectedSubjects: []
    });

    expect(next.referenceRequests).toHaveLength(1);
    expect(next.referenceRequests[0].status).toBe("PENDING_REVIEW");
  });

  it("updates corrective action status with an audit event", () => {
    const next = updateActionStatus(base, base.actions[0].id, "Complete", "Moderator");

    expect(next.actions[0].status).toBe("Complete");
    expect(next.auditEvents[0].action).toBe("CORRECTIVE_ACTION_STATUS_UPDATED");
  });

  it("exports a portable JSON workspace package", () => {
    const payload = JSON.parse(exportWorkspace(base));

    expect(payload.counts.evidence).toBe(base.evidence.length);
    expect(payload.state.scope.reportingPeriod).toBe("September 2026");
  });
});
