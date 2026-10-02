export type FgcLecturerFieldType = "text" | "textarea" | "number" | "date" | "select";
export type FgcToolkitOwner = "LECTURER" | "COLLEGE" | "ASSESSOR" | "MODERATOR" | "JEF" | "SYSTEM";

export type FgcLecturerField = {
  code: string;
  label: string;
  helper: string;
  type: FgcLecturerFieldType;
  required: boolean;
  options?: string[];
  evidenceKind: "SELF_REPORTED" | "DOCUMENT_SUPPORTED" | "SYSTEM_DERIVED";
  editableBy: "LECTURER";
};

export type FgcLecturerModule = {
  toolNumber: number;
  code: string;
  title: string;
  purpose: string;
  owner: FgcToolkitOwner;
  lecturerAccess: "EDIT" | "VIEW";
  downstream: string;
  fields: FgcLecturerField[];
};

export type FgcLecturerDraftValues = Record<string, string>;
const field = (input: Omit<FgcLecturerField, "editableBy">): FgcLecturerField => ({ ...input, editableBy: "LECTURER" });

/** The authoritative Tool 1–13 lecturer contract. Reviewer/system tools are
 * visible but have no lecturer-writable fields. */
export const fgcLecturerModules: FgcLecturerModule[] = [
  { toolNumber: 1, code: "consent_profile", title: "Consent & Lecturer Profile", purpose: "Confirm consent and the identity attached to the approved college and campus scope.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Establishes the accountable submitter and scope for every later tool.", fields: [
    field({ code: "consent_acknowledged", label: "Consent and participation acknowledgement", helper: "Confirm that you understand how submitted information and evidence will be used.", type: "select", required: true, options: ["I consent and confirm", "I need assistance before continuing"], evidenceKind: "SELF_REPORTED" }),
    field({ code: "lecturer_full_name", label: "Lecturer full name", helper: "Use the name attached to your approved FGC identity.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "employee_identifier", label: "Employee or staff identifier", helper: "Use the college staff number if available.", type: "text", required: false, evidenceKind: "SELF_REPORTED" }),
    field({ code: "department", label: "Department or school", helper: "Name the department responsible for the programme.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "campus_confirmation", label: "College and campus are correct", helper: "Confirm the approved scope shown above.", type: "select", required: true, options: ["Yes", "No — correction required"], evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 2, code: "teaching_context", title: "Teaching Context", purpose: "Capture the programme, subject, cohort and teaching conditions for this evidence cycle.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Provides the curriculum and cohort denominator used by Tools 3, 4, 8 and reporting.", fields: [
    field({ code: "programme_name", label: "Programme name", helper: "Use the official or closest known programme name.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "subject_or_module", label: "Subject or module", helper: "Name the curriculum subject, module or unit.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "cohort_label", label: "Cohort label", helper: "Example: NC(V) L3 electrical group A.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "enrolled_learners", label: "Enrolled learners", helper: "Total enrolled learners in this group.", type: "number", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "teaching_mode", label: "Primary teaching mode", helper: "Select the mode used for this evidence cycle.", type: "select", required: true, options: ["Classroom", "Workshop or lab", "Blended", "Remote", "Workplace-based"], evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 3, code: "learner_utilisation", title: "Learner Platform Utilisation", purpose: "Record learner use without treating self-reported activity as independently verified evidence.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Feeds utilisation evidence, assessor checks and the programme observatory.", fields: [
    field({ code: "use_date", label: "Use date", helper: "Date of the learning session or activity.", type: "date", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "active_learners", label: "Active learners", helper: "Learners who actively participated.", type: "number", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "session_type", label: "Session type", helper: "Distinguish scheduled curriculum use from ad hoc use.", type: "select", required: true, options: ["Scheduled curriculum use", "Ad hoc support", "Demonstration", "Assessment preparation"], evidenceKind: "SELF_REPORTED" }),
    field({ code: "usage_evidence_reference", label: "Usage evidence reference", helper: "Reference attendance, analytics, timetable or screenshot evidence. Upload the file in Tool 9.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" })
  ]},
  { toolNumber: 4, code: "curriculum_integration", title: "Curriculum Integration", purpose: "Describe how platform activity supports planned curriculum delivery.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Connects use evidence to programme outcomes and curriculum reporting.", fields: [
    field({ code: "curriculum_outcome", label: "Curriculum outcome", helper: "State the topic, outcome or practical skill addressed.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "lesson_plan_reference", label: "Lesson or timetable reference", helper: "Reference the source that supports scheduled use.", type: "text", required: true, evidenceKind: "DOCUMENT_SUPPORTED" }),
    field({ code: "integration_depth", label: "Integration depth", helper: "Choose the closest delivery pattern.", type: "select", required: true, options: ["Demonstration", "Guided practice", "Independent learner practice", "Assessment support", "Embedded curriculum delivery"], evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 5, code: "content_creation_self_assessment", title: "Lecturer Content-Creation Self-Assessment", purpose: "Record the lecturer’s own experience and confidence without assigning a final capability result.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Provides declared context to Tool 6; only authorised assessment and moderation determine final capability.", fields: [
    field({ code: "experience_created", label: "Experience created or adapted", helper: "Name the EON/XR experience or content object.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "confidence_level", label: "Self-reported confidence", helper: "This reflection is not a final capability classification.", type: "select", required: true, options: ["Not yet confident", "Confident with support", "Confident for familiar tasks", "Confident to attempt independently"], evidenceKind: "SELF_REPORTED" }),
    field({ code: "assistance_received", label: "Assistance received", helper: "Record prompting, technical intervention or facilitator execution honestly.", type: "select", required: true, options: ["None", "Clarification", "Prompting", "Technical intervention", "Facilitator execution"], evidenceKind: "SELF_REPORTED" }),
    field({ code: "capability_evidence", label: "Capability evidence reference", helper: "Reference links, screenshots or observed build evidence. Upload files in Tool 9.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" })
  ]},
  { toolNumber: 6, code: "assessor_capability_assessment", title: "Assessor Capability Assessment", purpose: "Authorised assessors evaluate capability against rubric criteria and evidence.", owner: "ASSESSOR", lecturerAccess: "VIEW", downstream: "Produces an assessment decision for Tool 7; lecturers cannot edit or self-award it.", fields: [] },
  { toolNumber: 7, code: "moderation_review", title: "Moderation Review", purpose: "An independent moderator confirms, varies or returns the assessor outcome with reasons.", owner: "MODERATOR", lecturerAccess: "VIEW", downstream: "Locks the moderated outcome and feeds verified reporting and interventions.", fields: [] },
  { toolNumber: 8, code: "experience_register", title: "EON Experience Register", purpose: "Register experiences created, published, assigned or used with learners.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Connects content to utilisation, evidence files and curriculum integration.", fields: [
    field({ code: "experience_url", label: "Experience URL or identifier", helper: "Paste the EON link or stable identifier.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "experience_status", label: "Experience status", helper: "Report the current lifecycle state.", type: "select", required: true, options: ["Created", "Published", "Assigned", "Used in class", "Needs correction"], evidenceKind: "SELF_REPORTED" }),
    field({ code: "learner_assignment_notes", label: "Learner assignment notes", helper: "Describe how learners accessed or used the experience.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 9, code: "evidence_uploads", title: "Evidence Uploads", purpose: "Upload private supporting evidence and maintain its manifest and limitations.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Creates versioned evidence metadata for assessor sufficiency and moderation checks.", fields: [
    field({ code: "evidence_manifest", label: "Evidence manifest", helper: "Uploaded filenames and references are recorded here; binary files remain private.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" }),
    field({ code: "evidence_limitations", label: "Evidence limitations", helper: "Record gaps, missing analytics, timing issues or contradictions.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 10, code: "barriers_support", title: "Barriers & Support Needs", purpose: "Identify barriers, root causes and support required to improve adoption or evidence quality.", owner: "LECTURER", lecturerAccess: "EDIT", downstream: "Informs institutional commitments, JEF intervention planning and corrective actions.", fields: [
    field({ code: "primary_barrier", label: "Primary barrier", helper: "Example: access, devices, timetable, connectivity, confidence or content gap.", type: "text", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "root_cause", label: "Root cause", helper: "Describe why the barrier exists.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" }),
    field({ code: "support_required", label: "Support required", helper: "Describe support required from the college, JEF, EON or merSETA.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" })
  ]},
  { toolNumber: 11, code: "institutional_commitments", title: "Institutional Commitments", purpose: "College-authorised users convert findings into owned, dated commitments.", owner: "COLLEGE", lecturerAccess: "VIEW", downstream: "Creates accountable institutional actions monitored through Tool 12.", fields: [] },
  { toolNumber: 12, code: "monitoring_reporting", title: "Monitoring & Reporting", purpose: "System and JEF reporting track submission state, evidence quality, commitments and outcomes.", owner: "SYSTEM", lecturerAccess: "VIEW", downstream: "Produces role-scoped dashboards and source-linked reports without changing source records.", fields: [] },
  { toolNumber: 13, code: "corrective_action_plan", title: "Corrective Action Plan", purpose: "JEF and institutional owners monitor corrective actions from governed findings.", owner: "JEF", lecturerAccess: "VIEW", downstream: "Closes the loop through assigned actions, due dates, progress evidence and reassessment.", fields: [] }
];

export function fieldKey(sectionCode: string, fieldCode: string) { return `${sectionCode}.${fieldCode}`; }

const editableLecturerKeys = new Set(fgcLecturerModules.flatMap((module) => module.fields.map((item) => fieldKey(module.code, item.code))));

export function sanitizeFgcLecturerDraft(values: FgcLecturerDraftValues) {
  return Object.fromEntries(Object.entries(values).filter(([key, value]) => editableLecturerKeys.has(key) && typeof value === "string"));
}

export function evaluateFgcLecturerDraft(values: FgcLecturerDraftValues) {
  const modules = fgcLecturerModules.map((module) => {
    const required = module.fields.filter((item) => item.required);
    const completed = required.filter((item) => values[fieldKey(module.code, item.code)]?.trim()).length;
    return { code: module.code, toolNumber: module.toolNumber, title: module.title, owner: module.owner, lecturerAccess: module.lecturerAccess, required: required.length, completed, complete: required.length === 0 || completed === required.length };
  });
  const lecturerModules = modules.filter((module) => module.lecturerAccess === "EDIT");
  const required = lecturerModules.reduce((total, module) => total + module.required, 0);
  const completed = lecturerModules.reduce((total, module) => total + module.completed, 0);
  return { required, completed, completionPercent: required ? Math.round((completed / required) * 100) : 0, complete: required > 0 && completed === required, modules };
}
