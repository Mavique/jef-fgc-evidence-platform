export type FgcLecturerFieldType = "text" | "textarea" | "number" | "date" | "select";

export type FgcLecturerField = {
  code: string;
  label: string;
  helper: string;
  type: FgcLecturerFieldType;
  required: boolean;
  options?: string[];
  evidenceKind: "SELF_REPORTED" | "DOCUMENT_SUPPORTED" | "SYSTEM_DERIVED";
};

export type FgcLecturerModule = {
  code: string;
  title: string;
  purpose: string;
  fields: FgcLecturerField[];
};

export type FgcLecturerDraftValues = Record<string, string>;

const yesNo = ["Yes", "No", "Partially", "Not applicable"];
const evidenceStatus = ["Self-Reported", "Document-Supported", "System-Derived"];
const capability = ["Independent", "Support Required", "Not Yet Demonstrated", "Not Assessed"];

export const fgcLecturerModules: FgcLecturerModule[] = [
  {
    code: "lecturer_profile",
    title: "Lecturer and Institutional Profile",
    purpose: "Confirm who is submitting and the approved college/campus scope.",
    fields: [
      { code: "lecturer_full_name", label: "Lecturer full name", helper: "Use the name attached to the approved FGC identity.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "employee_identifier", label: "Employee or staff identifier", helper: "Use the college staff number if available.", type: "text", required: false, evidenceKind: "SELF_REPORTED" },
      { code: "department", label: "Department or school", helper: "Name the department responsible for the programme.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "campus_confirmation", label: "Campus confirmation status", helper: "Indicate whether the displayed campus is correct.", type: "select", required: true, options: yesNo, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "learner_cohort",
    title: "Learner and Cohort Information",
    purpose: "Capture the learner group linked to the reported EON/XR activity.",
    fields: [
      { code: "programme_name", label: "Programme name", helper: "Use the official or closest known programme name.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "subject_or_module", label: "Subject or module", helper: "Name the curriculum subject, module or unit.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "cohort_label", label: "Cohort label", helper: "Example: NC(V) L3 electrical group A.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "enrolled_learners", label: "Enrolled learners", helper: "Total enrolled learners in the group.", type: "number", required: true, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "learner_utilisation",
    title: "Learner Platform Utilisation",
    purpose: "Answer FGC Question 1 with reported learner-use evidence.",
    fields: [
      { code: "use_date", label: "Use date", helper: "Date of the learning session or activity.", type: "date", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "active_learners", label: "Active learners", helper: "Learners who actively participated in the EON/XR activity.", type: "number", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "session_type", label: "Session type", helper: "Distinguish scheduled curriculum use from ad hoc use.", type: "select", required: true, options: ["Scheduled curriculum use", "Ad hoc support", "Demonstration", "Assessment preparation"], evidenceKind: "SELF_REPORTED" },
      { code: "usage_evidence_reference", label: "Usage evidence reference", helper: "Reference attendance, analytics export, timetable or screenshot evidence.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" }
    ]
  },
  {
    code: "curriculum_integration",
    title: "Curriculum Integration",
    purpose: "Show how the activity connects to curriculum delivery.",
    fields: [
      { code: "curriculum_outcome", label: "Curriculum outcome", helper: "State the topic, outcome or practical skill addressed.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "lesson_plan_reference", label: "Lesson or timetable reference", helper: "Reference the source that supports scheduled use.", type: "text", required: true, evidenceKind: "DOCUMENT_SUPPORTED" },
      { code: "integration_depth", label: "Integration depth", helper: "Describe whether this was demonstration, practice, assessment support or embedded teaching.", type: "select", required: true, options: ["Demonstration", "Guided practice", "Independent learner practice", "Assessment support", "Embedded curriculum delivery"], evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "content_creation",
    title: "Lecturer Content-Creation Self-Assessment",
    purpose: "Answer FGC Question 2 with lecturer capability evidence.",
    fields: [
      { code: "experience_created", label: "EON experience created or adapted", helper: "Name the experience or content object.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "creation_capability", label: "Creation capability status", helper: "Use the rubric-aligned capability status.", type: "select", required: true, options: capability, evidenceKind: "SELF_REPORTED" },
      { code: "assistance_received", label: "Assistance received", helper: "Record prompting, technical intervention or facilitator execution honestly.", type: "select", required: true, options: ["None", "Clarification", "Prompting", "Technical Intervention", "Facilitator Execution"], evidenceKind: "SELF_REPORTED" },
      { code: "capability_evidence", label: "Capability evidence", helper: "Reference links, screenshots or observed build challenge evidence.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" }
    ]
  },
  {
    code: "experience_register",
    title: "EON Experience Register",
    purpose: "List EON experiences used, published or assigned to learners.",
    fields: [
      { code: "experience_url", label: "Experience URL or identifier", helper: "Paste the EON link or stable identifier.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "experience_status", label: "Experience status", helper: "Report the current lifecycle state.", type: "select", required: true, options: ["Created", "Published", "Assigned", "Used in class", "Needs correction"], evidenceKind: "SELF_REPORTED" },
      { code: "learner_assignment_notes", label: "Learner assignment notes", helper: "Describe how learners accessed or used the experience.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "evidence_uploads",
    title: "Evidence Uploads",
    purpose: "Attach or describe evidence that supports this submission.",
    fields: [
      { code: "evidence_manifest", label: "Evidence manifest", helper: "List filenames, links or storage references included with this evidence pack.", type: "textarea", required: true, evidenceKind: "DOCUMENT_SUPPORTED" },
      { code: "evidence_status", label: "Evidence source status", helper: "State whether the evidence is self-reported, document-supported or system-derived.", type: "select", required: true, options: evidenceStatus, evidenceKind: "DOCUMENT_SUPPORTED" },
      { code: "evidence_limitations", label: "Evidence limitations", helper: "Record gaps, missing analytics, timing issues or contradictions.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "barriers",
    title: "Barriers and Root Causes",
    purpose: "Identify what blocks reliable adoption or evidence validation.",
    fields: [
      { code: "primary_barrier", label: "Primary barrier", helper: "Example: login access, devices, timetable, connectivity, confidence or content gap.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "root_cause", label: "Root cause", helper: "Describe why the barrier exists.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "support_required", label: "Support required", helper: "Describe support required from college, JEF, EON or merSETA.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "commitments",
    title: "College Utilisation Commitments",
    purpose: "Record realistic commitments that can be reviewed by college and JEF users.",
    fields: [
      { code: "thirty_day_commitment", label: "30-day commitment", helper: "State what will happen within 30 days.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "sixty_day_commitment", label: "60-day commitment", helper: "State what will happen within 60 days.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" },
      { code: "ninety_day_commitment", label: "90-day commitment", helper: "State what will happen within 90 days.", type: "textarea", required: false, evidenceKind: "SELF_REPORTED" }
    ]
  },
  {
    code: "corrective_plan",
    title: "Corrective and Reinforcement Plan",
    purpose: "Create a practical action plan that can be followed up.",
    fields: [
      { code: "corrective_action", label: "Corrective action", helper: "Describe the action needed to close the gap or reinforce use.", type: "textarea", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "action_owner", label: "Action owner", helper: "Name the responsible person or role.", type: "text", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "target_date", label: "Target date", helper: "Choose a realistic completion date.", type: "date", required: true, evidenceKind: "SELF_REPORTED" },
      { code: "submission_declaration", label: "Submission declaration", helper: "Confirm that this submission is accurate to the best of your knowledge.", type: "select", required: true, options: ["I confirm", "I need to review before submission"], evidenceKind: "SELF_REPORTED" }
    ]
  }
];

export function fieldKey(sectionCode: string, fieldCode: string) {
  return `${sectionCode}.${fieldCode}`;
}

export function evaluateFgcLecturerDraft(values: FgcLecturerDraftValues) {
  const modules = fgcLecturerModules.map((module) => {
    const required = module.fields.filter((field) => field.required);
    const completed = required.filter((field) => values[fieldKey(module.code, field.code)]?.trim()).length;
    return {
      code: module.code,
      title: module.title,
      required: required.length,
      completed,
      complete: completed === required.length
    };
  });
  const required = modules.reduce((total, module) => total + module.required, 0);
  const completed = modules.reduce((total, module) => total + module.completed, 0);
  return {
    required,
    completed,
    completionPercent: required ? Math.round((completed / required) * 100) : 0,
    complete: required > 0 && completed === required,
    modules
  };
}
