export const xrEducationPositioning = {
  name: "XR in Basic Education",
  status: "proposed_pathway",
  line: "Make difficult concepts possible to explore.",
  description:
    "A proposed Basic Education and BEEI capability framework where teachers and Education Assistants turn curriculum-linked concepts into accessible immersive learning experiences.",
  caution:
    "MoU terms, funding, current status, participant numbers, deployed assets, platform activity and measured outcomes require documentary verification before publication."
};

export const transformationLayers = [
  {
    name: "Curriculum need",
    owner: "Teacher",
    body: "Begin with a learning objective, misconception or concept learners cannot easily see, access or mentally model."
  },
  {
    name: "Assistant build",
    owner: "Education Assistant",
    body: "Research, storyboard, source or create assets, then prepare the simplest immersive or digital mode that serves the learning purpose."
  },
  {
    name: "Quality review",
    owner: "Teacher and school",
    body: "Check curriculum fit, age appropriateness, safety, accessibility, accuracy, rights and device readiness before use."
  },
  {
    name: "Classroom facilitation",
    owner: "Teacher-led team",
    body: "Use headset, mobile AR, laptop 3D, projection or a non-XR fallback inside a lesson with questioning, explanation and assessment."
  },
  {
    name: "Evidence and revision",
    owner: "Programme team",
    body: "Capture teacher review, learner task evidence, usage context, issues and improvements without turning analytics into surveillance."
  }
];

export const roleLenses = [
  {
    role: "Learner",
    value: "Explore a difficult idea through safe, guided, age-appropriate interaction.",
    risk: "Immersion without questions can become aimless exploration."
  },
  {
    role: "Teacher",
    value: "Keep instructional authority while receiving content and facilitation support.",
    risk: "Technology must never replace teacher judgement, explanation or assessment."
  },
  {
    role: "Education Assistant",
    value: "Move from classroom support to storyboarding, AI-supported research, 3D creation, facilitation and portfolio evidence.",
    risk: "Do not reduce the role to operating devices or logging attendance."
  },
  {
    role: "School leader",
    value: "Coordinate readiness, scheduling, safeguarding, equipment care and adoption support.",
    risk: "Procurement is not the same as active educational use."
  },
  {
    role: "Programme leader",
    value: "Scale only when readiness, reinforcement, evidence and governance are visible.",
    risk: "National ambition must not be presented as national delivery."
  }
];

export const assistantJourney = [
  ["Orientation", "BEEI context, professional conduct, safeguarding, school roles and digital citizenship."],
  ["Immersive pedagogy", "When XR adds value, when it does not, and how cognitive load affects learning."],
  ["AI-supported work", "Research, storyboarding, question drafting, translation and quality checks with human validation."],
  ["3D and media creation", "Blender, visual storytelling, media production and progressive interactive content capability."],
  ["Facilitation and support", "Set up devices, guide learners, support teachers and follow safety and fallback procedures."],
  ["Portfolio evidence", "Problem statement, curriculum link, storyboard, build evidence, lesson record, teacher review and improved version."]
];

export const deviceModes = [
  ["Mobile AR", "Useful where phones or tablets can reveal a spatial model without requiring headsets."],
  ["Laptop 3D", "Accessible for learners who need keyboard, mouse, screen-reader-compatible support or low-motion interaction."],
  ["Projection", "Keeps the experience communal and teacher-led for whole-class discussion."],
  ["Headset VR", "Best reserved for high-value simulations where presence, scale or safe rehearsal genuinely matters."],
  ["Non-XR fallback", "Every concept needs an equivalent path for learners who cannot or should not use immersive modes."]
];

export const readinessDomains = [
  "Teacher ownership",
  "Assistant capability",
  "Curriculum priority",
  "Device and licence governance",
  "Connectivity and support",
  "Safeguarding and privacy",
  "Evidence collection",
  "30/60/90 day reinforcement"
];

export const evidenceLadder = [
  ["Planning assumption", "Used to design scope or cost. Not an outcome."],
  ["Registered", "Verified entry into a programme or pathway."],
  ["Completed", "A defined training or activity block finished."],
  ["Demonstrated capability", "Output assessed against clear criteria."],
  ["Classroom application", "Used in a verified teaching context."],
  ["Verified outcome", "Measured, attributable and approved for publication."]
];

export const qualityChecks = [
  "Curriculum accuracy and grade fit",
  "Teacher prompts and learner task",
  "Accessibility and non-XR alternative",
  "Physical, sensory and safeguarding safety",
  "Source provenance and content rights",
  "Device performance and support route"
];

export const ecosystemLinks = [
  ["VOCLE XR", "Broader immersive learning and simulation architecture."],
  ["iCampus", "Learning access, pathways, progress, assessment and portfolio support."],
  ["Digital Transformation Hubs", "Local access, training, demonstrations and cluster coordination."],
  ["Workgrid Labs", "Advanced studios for 3D, Unreal Engine, software development and portfolio production."],
  ["WorxStream", "Potential connection from verified portfolios to projects or opportunities without guaranteeing placement."]
];
