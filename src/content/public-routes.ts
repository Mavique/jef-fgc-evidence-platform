import { programmes } from "@/content/site";
import { xrMedia } from "@/content/xr-media";

export type PublicRouteCard = {
  title: string;
  body: string;
  meta?: string;
  href?: string;
  actionLabel?: string;
};

export type PublicRouteAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type PublicRouteDefinition = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  image: string;
  imageAlt: string;
  status: string;
  primaryAction?: PublicRouteAction;
  secondaryAction?: PublicRouteAction;
  highlights: PublicRouteCard[];
  pathwayTitle: string;
  pathwayIntro: string;
  pathway: PublicRouteCard[];
  evidenceTitle: string;
  evidenceIntro: string;
  evidence: PublicRouteCard[];
  finalTitle: string;
  finalBody: string;
};

const programmeHighlights = programmes.slice(0, 6).map((programme) => ({
  title: programme.name,
  meta: programme.status,
  body: programme.purpose
}));

export const publicRoutes: Record<string, PublicRouteDefinition> = {
  "about/leadership": {
    slug: "about/leadership",
    title: "Leadership",
    eyebrow: "Institutional stewardship",
    intro:
      "JEF leadership is grounded in the operating responsibilities needed to deliver responsible AI, Extended Reality and institutional transformation work with discipline and public trust.",
    image: xrMedia.mersetaCptWorkshopFacilitator,
    imageAlt: "JEF team members and partners in a briefing environment",
    status: "Public profile being structured",
    primaryAction: { label: "Discuss partnership", href: "/contact", variant: "primary" },
    secondaryAction: { label: "View governance", href: "/about/governance", variant: "secondary" },
    highlights: [
      {
        title: "Strategic direction",
        body: "Defines how JEF connects AI, XR, spatial intelligence and education transformation into one coherent institutional agenda."
      },
      {
        title: "Implementation discipline",
        body: "Keeps programmes focused on adoption, capability, governance and evidence rather than isolated technology demonstrations."
      },
      {
        title: "Partner alignment",
        body: "Shapes relationships with public institutions, learning providers, employers, technology partners and funders."
      }
    ],
    pathwayTitle: "Leadership operating model",
    pathwayIntro: "Leadership responsibilities are organised around strategy, governance, delivery and evidence so partners can understand how JEF stewards complex technology work.",
    pathway: [
      { title: "Vision", body: "Set the institutional direction for technology-enabled education, skills and work transformation." },
      { title: "Governance", body: "Translate strategy into accountable programme structures, safeguards and review practices." },
      { title: "Delivery", body: "Coordinate programme teams, partners and technical implementation around practical outcomes." },
      { title: "Evidence", body: "Maintain a careful public record that distinguishes active work, developing initiatives and longer-term ambitions." }
    ],
    evidenceTitle: "Public leadership record",
    evidenceIntro: "JEF publishes leadership information through approved public material and clear responsibility areas.",
    evidence: [
      { title: "Approved profiles", body: "Names, titles, biographies and photographs once supplied and cleared for publication." },
      { title: "Governance roles", body: "Board, advisory, programme or executive structures when formally approved." },
      { title: "Speaking and publications", body: "Public records that can be linked to a source or document." }
    ],
    finalTitle: "Leadership built for trust",
    finalBody: "Leadership responsibility is communicated through roles, stewardship and accountable programme practice."
  },
  "about/governance": {
    slug: "about/governance",
    title: "Governance",
    eyebrow: "Responsible technology adoption",
    intro:
      "JEF governance explains how ambitious technology work should remain accountable: clear scope, privacy awareness, evidence discipline, human oversight and careful communication of public claims.",
    image: xrMedia.jefTransformingEducationBanner,
    imageAlt: "JEF transforming education banner in an institutional setting",
    status: "Governance framework summary",
    primaryAction: { label: "Contact JEF", href: "/contact", variant: "primary" },
    secondaryAction: { label: "Read privacy", href: "/privacy", variant: "secondary" },
    highlights: [
      { title: "Evidence before claims", body: "Public statements should be supported by traceable documents, approved data or clearly qualified programme status." },
      { title: "Human-centred adoption", body: "Technology is positioned as support for people, institutions and capability, not as a replacement for accountability." },
      { title: "Role clarity", body: "Programmes require defined owners, implementers, learners, reviewers and escalation paths." }
    ],
    pathwayTitle: "Governance rhythm",
    pathwayIntro: "This model gives public audiences a clear view of how work should move from idea to evidence.",
    pathway: [
      { title: "Scope", body: "Define the institutional problem, audience, risks and intended outputs." },
      { title: "Safeguard", body: "Confirm privacy, access, content, evidence and human oversight requirements." },
      { title: "Implement", body: "Run the programme or service with documented decisions and accountable roles." },
      { title: "Review", body: "Separate confirmed outcomes from lessons, open questions and future ambitions." }
    ],
    evidenceTitle: "Governance artefacts",
    evidenceIntro: "JEF publishes policies, frameworks and reports when they are approved for public use.",
    evidence: [
      { title: "Policy summaries", body: "Plain-language explanations of privacy, accessibility and responsible technology principles." },
      { title: "Programme gates", body: "Status labels that distinguish active work, pilots, developing initiatives and proposed concepts." },
      { title: "Public documentation", body: "Documents should be listed only when they are intended for public use." }
    ],
    finalTitle: "A practical governance frame",
    finalBody: "The governance route supports institutional trust without exposing private operational systems."
  },
  programmes: {
    slug: "programmes",
    title: "Programmes",
    eyebrow: "Connected transformation pathways",
    intro:
      "JEF programmes connect education, work, enterprise and place-based transformation through AI, XR, spatial intelligence and capability development. Each programme is labelled by status so visitors can distinguish active work from developing initiatives.",
    image: xrMedia.mixedRealityDeviceCollage,
    imageAlt: "A mixed reality device collage representing JEF programme pathways",
    status: "Programme catalogue",
    primaryAction: { label: "Explore services", href: "/services", variant: "primary" },
    secondaryAction: { label: "Partner with JEF", href: "/partnerships", variant: "secondary" },
    highlights: programmeHighlights,
    pathwayTitle: "How the programme system fits together",
    pathwayIntro: "The catalogue is organised around capability systems rather than isolated course pages.",
    pathway: [
      { title: "Education", body: "XR, iCampus and lecturer-led learning systems for curriculum-linked practice." },
      { title: "Workforce", body: "Workplace 4.0, Workgrid Labs and WorxStream connect evidence to practical progression." },
      { title: "Enterprise", body: "AI Services, Prolific Edge and Spatial Enterprise support institutional and operational modernisation." },
      { title: "Civic systems", body: "Digital hubs and Spatial AI City focus on place-based transformation and public value." }
    ],
    evidenceTitle: "Programme status discipline",
    evidenceIntro: "Status language helps visitors understand whether a programme is active, developing or proposed without overstating delivery.",
    evidence: [
      { title: "Active", body: "Available for public positioning where JEF has confirmed current delivery or service readiness." },
      { title: "Pilot or in development", body: "A structured initiative moving through preparation, testing or implementation readiness." },
      { title: "Proposed", body: "A model or pathway that is being shaped for future institutional engagement." }
    ],
    finalTitle: "A catalogue with a working logic",
    finalBody: "Visitors can now move from the programme overview into the specific solution that matches their institution."
  },
  projects: {
    slug: "projects",
    title: "Projects",
    eyebrow: "Implementation portfolio",
    intro:
      "JEF projects are framed as scoped initiatives with accountable partners, defined outputs, evidence practices and documented learning.",
    image: xrMedia.jefSpatialAiConstructionTraining,
    imageAlt: "A spatial AI construction training demonstration with digital overlays",
    status: "Portfolio framework",
    primaryAction: { label: "Discuss a project", href: "/contact", variant: "primary" },
    secondaryAction: { label: "See programmes", href: "/programmes", variant: "secondary" },
    highlights: [
      { title: "Scoping", body: "Each project should define the problem, audience, delivery context, risks and expected outputs." },
      { title: "Implementation", body: "Work should show how technology, people, curriculum and operations are brought together." },
      { title: "Evidence", body: "The public portfolio should distinguish work completed, work in progress and concepts under development." }
    ],
    pathwayTitle: "Project lifecycle",
    pathwayIntro: "This lifecycle keeps project communication grounded in implementation practice and responsible evidence.",
    pathway: [
      { title: "Frame", body: "Clarify the institutional need and the JEF programme or service that fits." },
      { title: "Prepare", body: "Align stakeholders, data, content, technology access and facilitation readiness." },
      { title: "Deliver", body: "Run the project with practical support, workflow documentation and decision records." },
      { title: "Learn", body: "Capture outputs, constraints, adoption signals and recommendations for the next cycle." }
    ],
    evidenceTitle: "Project evidence chain",
    evidenceIntro: "A credible project record connects activity, outputs, adoption and outcomes without skipping proof.",
    evidence: [
      { title: "Activity", body: "Workshops, labs, services, cohorts or deployments are described with appropriate dates and scope." },
      { title: "Output", body: "Reports, learning artefacts, implementation plans, portfolios or validated submissions explain what was produced." },
      { title: "Adoption", body: "Evidence distinguishes technology availability from meaningful use, governance and workflow integration." }
    ],
    finalTitle: "From idea to accountable delivery",
    finalBody: "Projects connect implementation stories to the records, outputs and lessons that make them useful."
  },
  partnerships: {
    slug: "partnerships",
    title: "Partnerships",
    eyebrow: "Co-build institutional capability",
    intro:
      "JEF partnerships should be structured around shared implementation responsibility: public value, learner and worker capability, responsible technology adoption and evidence that can be reviewed.",
    image: xrMedia.jefXrExpoHeadsetDemo,
    imageAlt: "A JEF XR exhibition demonstration with headset-based learning",
    status: "Partnership pathways",
    primaryAction: { label: "Start a conversation", href: "/contact", variant: "primary" },
    secondaryAction: { label: "View services", href: "/services", variant: "secondary" },
    highlights: [
      { title: "Institutions", body: "Colleges, schools, municipalities and public bodies seeking structured adoption pathways." },
      { title: "Industry", body: "Employers and enterprises connecting learning, simulation, workplace systems and capability evidence." },
      { title: "Funders and technology partners", body: "Partners who support access, infrastructure, implementation and responsible scale." }
    ],
    pathwayTitle: "Partnership pathway",
    pathwayIntro: "A useful partnership begins with the operating problem, not the technology catalogue.",
    pathway: [
      { title: "Intent", body: "Clarify the public or institutional outcome the partnership is trying to support." },
      { title: "Fit", body: "Select the service, programme or platform model that matches the problem." },
      { title: "Activation", body: "Define roles, timelines, support needs, safeguards and evidence requirements." },
      { title: "Review", body: "Use agreed outputs to assess adoption, learning and future opportunity." }
    ],
    evidenceTitle: "Healthy partnership signals",
    evidenceIntro: "The route gives partners a practical standard before formal engagement.",
    evidence: [
      { title: "Clear problem ownership", body: "A named institutional need and decision path." },
      { title: "Implementation capacity", body: "People, time, infrastructure and governance to support the work." },
      { title: "Evidence readiness", body: "Agreement on what may be measured, shared and published." }
    ],
    finalTitle: "Partnerships with implementation weight",
    finalBody: "Partners are directed toward a scoped conversation grounded in implementation responsibility."
  },
  insights: {
    slug: "insights",
    title: "Insights",
    eyebrow: "Thinking in public",
    intro:
      "JEF insights should help readers understand responsible AI, immersive learning, spatial systems and capability development. Articles and papers should be published only when approved for public use.",
    image: xrMedia.xrManufacturingDashboard,
    imageAlt: "An XR manufacturing dashboard used as a visual metaphor for insight and analysis",
    status: "Editorial library in preparation",
    primaryAction: { label: "Explore AI Services", href: "/programmes/ai-services", variant: "primary" },
    secondaryAction: { label: "Contact JEF", href: "/contact", variant: "secondary" },
    highlights: [
      { title: "Responsible AI", body: "Practical guidance on using AI in work, learning and institutional systems." },
      { title: "XR learning", body: "How embodied simulation can support cognition, practice and confidence." },
      { title: "Evidence culture", body: "Why adoption, capability and outcomes need careful proof." }
    ],
    pathwayTitle: "Editorial structure",
    pathwayIntro: "The insights route is organised to host useful public thinking when JEF-approved content is ready.",
    pathway: [
      { title: "Perspective", body: "Short, readable viewpoints on technology and education transformation." },
      { title: "Framework", body: "Models that explain how JEF thinks about systems, governance and capability." },
      { title: "Practice note", body: "Implementation lessons from public, approved delivery contexts." },
      { title: "Resource", body: "Templates, briefs or guides intended for public use." }
    ],
    evidenceTitle: "Publication standard",
    evidenceIntro: "Insights should inform without overstating JEF activity.",
    evidence: [
      { title: "No hidden source claims", body: "Each article should distinguish opinion, framework and verified record." },
      { title: "Useful to practitioners", body: "Content should help leaders, educators and partners make better decisions." },
      { title: "Accessible language", body: "Technical topics should be explained without diluting substance." }
    ],
    finalTitle: "A credible knowledge route",
    finalBody: "The insights library gives JEF a credible home for approved public thinking."
  },
  opportunities: {
    slug: "opportunities",
    title: "Opportunities",
    eyebrow: "Pathways into work with JEF",
    intro:
      "Opportunities may include partnerships, projects, facilitator roles, technology collaborations, research participation or programme engagement. Open calls should be shown only when confirmed.",
    image: xrMedia.childrenRoboticsLearning,
    imageAlt: "Learners engaging with robotics in a practical learning environment",
    status: "No public open calls listed",
    primaryAction: { label: "Register interest", href: "/contact", variant: "primary" },
    secondaryAction: { label: "View programmes", href: "/programmes", variant: "secondary" },
    highlights: [
      { title: "Institutions", body: "Explore transformation pathways, XR labs, AI services or work-readiness systems." },
      { title: "Practitioners", body: "Express interest in facilitation, curriculum, evidence or implementation support roles." },
      { title: "Partners", body: "Discuss technology, funding, research, workplace or civic collaboration." }
    ],
    pathwayTitle: "Opportunity readiness",
    pathwayIntro: "When opportunities open, they should be specific enough for people to act.",
    pathway: [
      { title: "Who it is for", body: "Audience, eligibility and location or delivery mode." },
      { title: "What is involved", body: "Activities, time, tools, responsibilities and expected outputs." },
      { title: "How selection works", body: "A transparent route for expression of interest and review." },
      { title: "What happens next", body: "A clear follow-up path without promising outcomes prematurely." }
    ],
    evidenceTitle: "Current empty state",
    evidenceIntro: "The opportunity route gives visitors a clear status and a contact path when no open call is listed.",
    evidence: [
      { title: "No active public calls", body: "No confirmed public opportunities are listed in the repository at this time." },
      { title: "Contact route available", body: "Interested institutions and partners can still contact JEF for a scoped discussion." },
      { title: "Future-ready layout", body: "The page can accept verified calls without redesigning the route." }
    ],
    finalTitle: "Clear next steps without false urgency",
    finalBody: "Visitors have a meaningful path even when no public call is open."
  },
  documents: {
    slug: "documents",
    title: "Documents",
    eyebrow: "Public resources",
    intro:
      "This library hosts public JEF resources for technology-enabled education, training and skills development. Private FGC records and restricted operational documents are not exposed here.",
    image: xrMedia.jefVulabookArTextbookDemo,
    imageAlt: "A medical XR learning scene used as a visual cue for structured resources",
    status: "Public product catalogue available",
    primaryAction: { label: "Request information", href: "/contact", variant: "primary" },
    secondaryAction: { label: "Read insights", href: "/insights", variant: "secondary" },
    highlights: [
      {
        title: "JEF Product Catalogue",
        meta: "PDF catalogue",
        body: "Technology solutions for education, training and skills development, including XR learning, mobile AR, interactive teaching, workstations and lab infrastructure.",
        href: "/documents/jef-xr-lab-product-catalogue.pdf",
        actionLabel: "Open catalogue"
      },
      { title: "Programme briefs", body: "Public summaries of JEF programmes and service pathways when approved for publication." },
      { title: "Frameworks", body: "Responsible AI, XR learning, spatial intelligence and adoption models for public use." }
    ],
    pathwayTitle: "Resource publication standard",
    pathwayIntro: "Document previews should help people understand the file before they open it.",
    pathway: [
      { title: "Title", body: "Plain document name, not a storage filename." },
      { title: "Context", body: "Document type, audience, date if known and a short description." },
      { title: "Access", body: "Clear open/download action only for public assets." },
      { title: "Restriction", body: "Private evidence, personal information and internal operational records remain excluded." }
    ],
    evidenceTitle: "Current public documents",
    evidenceIntro: "The available public catalogue is separated from private operational evidence and protected platform records.",
    evidence: [
      { title: "Product catalogue", body: "The catalogue covers selected technology equipment and infrastructure categories for learning environments.", href: "/documents/jef-xr-lab-product-catalogue.pdf", actionLabel: "Open PDF" },
      { title: "Private FGC protected", body: "FGC evidence files remain outside this public resource route." },
      { title: "Ready for more resources", body: "The structure can display additional approved documents without exposing restricted material." }
    ],
    finalTitle: "A clean public resource shelf",
    finalBody: "Visitors can open approved public material while restricted platform records remain protected."
  },
  contact: {
    slug: "contact",
    title: "Contact",
    eyebrow: "Start with the operating need",
    intro:
      "Use this route to begin a conversation about JEF programmes, AI services, XR learning, spatial intelligence, partnerships or institutional transformation support.",
    image: xrMedia.mersetaCptWorkshopFacilitator,
    imageAlt: "A JEF facilitator presenting XR skills content during a workshop",
    status: "Public contact route",
    primaryAction: { label: "Email admin@jengrac.tech", href: "mailto:admin@jengrac.tech", variant: "primary" },
    secondaryAction: { label: "Explore services first", href: "/services", variant: "secondary" },
    highlights: [
      { title: "Institutional enquiry", body: "Describe your organisation, challenge, audience and the type of support required." },
      { title: "Programme enquiry", body: "Reference the specific programme route if you already know the best fit." },
      { title: "Partnership enquiry", body: "Explain what you can contribute and what public or institutional value you want to create." }
    ],
    pathwayTitle: "A useful first message",
    pathwayIntro: "Clear context helps JEF route the conversation to the right programme or service.",
    pathway: [
      { title: "Context", body: "Who you are, your institution and where the work would happen." },
      { title: "Problem", body: "The learning, work, technology or institutional challenge you want to address." },
      { title: "Audience", body: "Learners, lecturers, workers, managers, communities or partners involved." },
      { title: "Timing", body: "Any deadline, funding window, event or implementation timeline." }
    ],
    evidenceTitle: "Communication safeguards",
    evidenceIntro: "Do not send private learner records or restricted FGC evidence through public contact routes.",
    evidence: [
      { title: "Use public information", body: "Keep the first message high-level and non-sensitive." },
      { title: "Request secure channels", body: "JEF can advise on the right channel if restricted material is required." },
      { title: "FGC users", body: "Authenticated FGC users should use the appropriate portal route for platform tasks." }
    ],
    finalTitle: "A contact page that helps the next step",
    finalBody: "The route makes the first conversation easier and safer."
  },
  privacy: {
    slug: "privacy",
    title: "Privacy",
    eyebrow: "Personal information and public trust",
    intro:
      "This public privacy route gives a plain-language summary of how JEF should approach personal information in public-facing engagements. A formal legal policy should be added when approved.",
    image: xrMedia.industrialMrTechnician,
    imageAlt: "An industrial mixed reality technician using a headset",
    status: "Plain-language privacy summary",
    primaryAction: { label: "Contact JEF", href: "/contact", variant: "primary" },
    secondaryAction: { label: "Accessibility", href: "/accessibility", variant: "secondary" },
    highlights: [
      { title: "Purpose limitation", body: "Personal information should be collected for clear, legitimate and explained purposes." },
      { title: "Restricted evidence", body: "Private FGC records, learner data and operational evidence must not be exposed on public pages." },
      { title: "Human oversight", body: "AI-enabled services should retain accountable human review where decisions affect people." }
    ],
    pathwayTitle: "Privacy principles",
    pathwayIntro: "The public route should help visitors understand the posture before formal policy detail is published.",
    pathway: [
      { title: "Collect carefully", body: "Ask only for information needed to respond, deliver or govern a service." },
      { title: "Protect access", body: "Keep restricted platform, evidence and personal data behind appropriate authentication." },
      { title: "Use responsibly", body: "Apply information in line with the stated purpose and applicable obligations." },
      { title: "Review and correct", body: "Provide contact routes for privacy questions or corrections." }
    ],
    evidenceTitle: "Policy status",
    evidenceIntro: "This page is deliberately cautious and does not pretend to be a full legal instrument.",
    evidence: [
      { title: "Formal policy required", body: "JEF should add an approved privacy policy before relying on this page for legal terms." },
      { title: "Public summary available", body: "Visitors still get a readable explanation of the privacy posture." },
      { title: "FGC boundary preserved", body: "Protected platform data remains outside public pages." }
    ],
    finalTitle: "Privacy stated plainly",
    finalBody: "Visitors get a usable privacy summary without exposing internal systems."
  },
  accessibility: {
    slug: "accessibility",
    title: "Accessibility",
    eyebrow: "Inclusive digital access",
    intro:
      "JEF public digital experiences should be readable, keyboard accessible, responsive, respectful of reduced-motion preferences and useful to people using assistive technologies.",
    image: xrMedia.girlRoboticsLab,
    imageAlt: "A learner working carefully with robotics equipment in a lab environment",
    status: "Accessibility commitment",
    primaryAction: { label: "Report an access issue", href: "/contact", variant: "primary" },
    secondaryAction: { label: "Read privacy", href: "/privacy", variant: "secondary" },
    highlights: [
      { title: "Readable structure", body: "Pages should use clear headings, useful labels and direct routes to important actions." },
      { title: "Keyboard operation", body: "Navigation menus, links and interactive elements should work without a mouse." },
      { title: "Motion respect", body: "Animation should be reduced or disabled for visitors who prefer less motion." }
    ],
    pathwayTitle: "Accessibility practices",
    pathwayIntro: "Accessibility practices guide the public experience across JEF routes.",
    pathway: [
      { title: "Contrast", body: "Text and controls should remain legible across dark and light sections." },
      { title: "Focus", body: "Keyboard focus should be visible and not hidden beneath the fixed navigation." },
      { title: "Responsive layout", body: "Public routes should adapt from mobile to wide desktop without horizontal overflow." },
      { title: "Meaningful media", body: "Images should have useful alternative text or be hidden when decorative." }
    ],
    evidenceTitle: "Feedback route",
    evidenceIntro: "Accessibility improves through continued testing and user feedback.",
    evidence: [
      { title: "Issue reporting", body: "Visitors can contact JEF if they cannot access information or complete a task." },
      { title: "Ongoing review", body: "New programme pages and resources should be checked before publication." },
      { title: "Practical standard", body: "The goal is not decorative compliance, but usable public information." }
    ],
    finalTitle: "Access built into the public site",
    finalBody: "JEF states a practical accessibility posture for public digital access."
  }
};

export const publicRouteSlugs = Object.keys(publicRoutes);
