"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Plus,
  Save,
  Search,
  ShieldCheck,
  UploadCloud,
  Users,
  UserCog
} from "lucide-react";
import {
  classifyAssessment,
  evidenceStatuses,
  fgcDemoSessionKey,
  fgcProduct,
  rolePermissions,
  rubricAreas,
  totalRubricScore,
  type EvidenceItem,
  type EvidenceStatus,
  type CorrectiveAction,
  type DemoAuthSession,
  type LearnerUseRecord,
  type LecturerAssessment,
  type UserRole
} from "@/content/merseta-fgc";
import {
  fgcReferenceService,
  type ReferenceDataQualitySnapshot
} from "@/services/fgc-reference";
import type {
  CampusReference,
  CollegeReference,
  ProgrammeCategoryReference,
  ProgrammeLevelReference,
  ProgrammeReference,
  ProvinceReference,
  SubjectReference,
  CurriculumSearchResult
} from "@/content/fgc-reference-data";
import { campusProgrammeOfferings } from "@/content/fgc-reference-data";
import {
  createCaptureSubmission,
  exportWorkspace,
  fgcCaptureDraftStorageKey,
  fgcWorkspaceStorageKey,
  hydrateWorkspace,
  updateActionStatus,
  type CaptureContext,
  type CaptureDraft,
  type FgcWorkspaceState
} from "@/services/fgc-workspace";
import { mockFgcServices, type ObservatorySnapshot } from "@/services/merseta-fgc";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import type { FgcProductionMetricsSummary } from "@/lib/fgc/metrics";

const tabs = [
  "Observatory",
  "Evidence Spine",
  "Triangulation",
  "Lecturer Capability",
  "Data Capture",
  "Curriculum Catalogue",
  "Corrective Actions",
  "Reports & Decisions"
] as const;

type Tab = (typeof tabs)[number];
type ResolvedProductionAccess = Extract<FgcCurrentUserResult, { ok: true }>;

const iconMap = {
  Observatory: Gauge,
  "Evidence Spine": Database,
  Triangulation: Layers3,
  "Lecturer Capability": ClipboardCheck,
  "Data Capture": Plus,
  "Curriculum Catalogue": Search,
  "Corrective Actions": AlertTriangle,
  "Reports & Decisions": FileText
};

function statusClass(status: EvidenceStatus) {
  return evidenceStatuses[status].tone;
}

function productionAccessRole(accessState: ResolvedProductionAccess["access"]["accessState"]): UserRole {
  if (accessState === "JEF_ADMIN_ACTIVE" || accessState === "PLATFORM_SUPER_ACTIVE") return "JEF Administrator";
  if (accessState === "MERSETA_ACTIVE") return "merSETA Oversight";
  if (accessState === "ASSESSOR_ACTIVE") return "Assessor";
  if (accessState === "MODERATOR_ACTIVE") return "Moderator";
  if (accessState === "COLLEGE_ACTIVE") return "College Evidence Owner";
  if (accessState === "LECTURER_ACTIVE") return "Lecturer";
  return "Lecturer";
}

function productionMetricToneClass(tone: FgcProductionMetricsSummary["metrics"][number]["tone"]) {
  if (tone === "lime") return "text-lime";
  if (tone === "amber") return "text-amber";
  if (tone === "rose") return "text-rose-300";
  return "text-cyan";
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase leading-5 tracking-[0.13em] ring-1 ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function MetricCard({ label, value, note, tone = "cyan" }: { label: string; value: string; note: string; tone?: "cyan" | "lime" | "amber" | "rose" }) {
  const toneClass = tone === "lime" ? "text-lime" : tone === "amber" ? "text-amber" : tone === "rose" ? "text-rose-300" : "text-cyan";

  return (
    <article className="min-w-0 rounded-[1.05rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <p className="min-w-0 [overflow-wrap:anywhere] font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/50">{label}</p>
      <p className={`mt-5 text-4xl font-semibold tracking-[-0.06em] ${toneClass}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-paper/62">{note}</p>
    </article>
  );
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function RingInfographic({ label, value, total, note }: { label: string; value: number; total: number; note: string }) {
  const pct = percentage(value, total);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <div className="grid gap-5">
        <div className="relative mx-auto grid size-32 place-items-center">
          <svg aria-hidden="true" className="size-32 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgb(170,255,128)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <span className="absolute text-3xl font-semibold tracking-[-0.05em] text-lime">{pct}%</span>
        </div>
        <div className="text-center">
          <p className="mx-auto max-w-56 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/50">{label}</p>
          <p className="mx-auto mt-3 max-w-72 text-sm leading-6 text-paper/66">
            <b className="text-paper">{value}</b> of <b className="text-paper">{total}</b> records. {note}
          </p>
        </div>
      </div>
    </article>
  );
}

function BulletChart({ label, value, target, unit, caption }: { label: string; value: number; target: number; unit: string; caption: string }) {
  const pct = Math.min(100, percentage(value, target));
  const targetLeft = Math.min(100, percentage(target, Math.max(target, value)));

  return (
    <article className="rounded-[1.05rem] border border-white/[0.1] bg-white/[0.05] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/50">{label}</p>
          <p className="mt-2 text-sm text-paper/60">{caption}</p>
        </div>
        <p className="font-mono text-sm text-cyan">{value}{unit} / {target}{unit}</p>
      </div>
      <div className="relative mt-5 h-4 overflow-hidden rounded-full bg-white/[0.12]" aria-label={`${label}: ${value}${unit} against target ${target}${unit}`}>
        <div className="absolute inset-y-0 left-0 bg-rose-300/25" style={{ width: "34%" }} />
        <div className="absolute inset-y-0 left-[34%] bg-amber/25" style={{ width: "33%" }} />
        <div className="absolute inset-y-0 left-[67%] bg-lime/25" style={{ width: "33%" }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-cyan" style={{ width: `${pct}%` }} />
        <div className="absolute -top-1 h-6 w-1 rounded-full bg-paper" style={{ left: `${targetLeft}%` }} />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/42">
        <span>Gap</span>
        <span>Partial</span>
        <span>Ready</span>
      </div>
    </article>
  );
}

function ComparativeBars({ records }: { records: LearnerUseRecord[] }) {
  const max = Math.max(...records.map((record) => record.enrolledLearners ?? 0), 1);

  return (
    <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Comparative learner-use evidence</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Active learners against enrolled learners</h3>
        </div>
        <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-paper/66 ring-1 ring-white/[0.1]">Q1 only</span>
      </div>
      <div className="mt-6 grid gap-4">
        {records.map((record) => {
          const enrolled = record.enrolledLearners ?? 0;
          const active = record.activeLearners ?? 0;
          return (
            <div className="grid gap-2" key={record.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-semibold">{record.college}</span>
                <span className="font-mono text-paper/54">{active} active / {enrolled || "-"} enrolled</span>
              </div>
              <div className="relative h-5 overflow-hidden rounded-full bg-white/[0.1]">
                <div className="absolute inset-y-0 left-0 bg-white/[0.16]" style={{ width: `${percentage(enrolled, max)}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-lime" style={{ width: `${percentage(active, max)}%` }} />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={record.evidenceStatus} />
                <span className="text-xs text-paper/50">{record.context}</span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function StatusBreakdown({ evidence }: { evidence: EvidenceItem[] }) {
  const statuses = Object.keys(evidenceStatuses) as EvidenceStatus[];

  return (
    <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Source quality mix</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Evidence by validation status</h3>
      <div className="mt-6 grid gap-3">
        {statuses.map((status) => {
          const count = evidence.filter((item) => item.qualityStatus === status).length;
          return (
            <div className="grid grid-cols-[150px_1fr_auto] items-center gap-3 text-sm" key={status}>
              <span className="font-semibold text-paper/72">{status}</span>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.1]">
                <div className={`h-full ${status === "Verified" ? "bg-lime" : status === "Contradicted" ? "bg-rose-300" : status === "Partially Verified" ? "bg-amber" : "bg-paper/42"}`} style={{ width: `${percentage(count, evidence.length)}%` }} />
              </div>
              <span className="font-mono text-cyan">{count}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function RubricHeatmap({ assessments }: { assessments: LecturerAssessment[] }) {
  return (
    <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Q2 comparative rubric</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Lecturer capability heatmap</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-lime px-3 py-1 text-ink">2 Independent</span>
          <span className="rounded-full bg-amber px-3 py-1 text-ink">1 Prompted</span>
          <span className="rounded-full bg-rose-300 px-3 py-1 text-ink">0 Failed</span>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[170px_repeat(7,minmax(86px,1fr))] gap-2">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-paper/42">Lecturer</span>
            {rubricAreas.map((area) => (
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-paper/42" key={area}>{area}</span>
            ))}
            {assessments.map((assessment) => (
              <div className="contents" key={assessment.id}>
                <div className="rounded-[0.78rem] bg-ink/52 p-3">
                  <p className="font-semibold">{assessment.lecturer}</p>
                  <p className="mt-1 text-xs text-paper/48">{classifyAssessment(assessment)}</p>
                </div>
                {rubricAreas.map((area) => {
                  const score = assessment.scores.find((entry) => entry.area === area)?.score;
                  const tone = score === 2 ? "bg-lime text-ink" : score === 1 ? "bg-amber text-ink" : score === 0 ? "bg-rose-300 text-ink" : "bg-white/[0.08] text-paper/58";
                  return (
                    <div className={`grid min-h-16 place-items-center rounded-[0.78rem] p-2 text-center text-lg font-bold ${tone}`} key={`${assessment.id}-${area}`}>
                      {score ?? "-"}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function EvidenceInspector({ evidence }: { evidence: EvidenceItem[] }) {
  const [selected, setSelected] = useState(evidence[0]?.id ?? "");
  const item = evidence.find((entry) => entry.id === selected) ?? evidence[0];

  if (!item) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.48fr_0.52fr]">
      <div className="grid gap-2">
        {evidence.map((entry) => (
          <button
            className={`rounded-[0.95rem] p-4 text-left transition duration-500 ease-fluid ${
              entry.id === item.id ? "bg-cyan text-ink" : "bg-white/[0.055] text-paper ring-1 ring-white/[0.1] hover:bg-white/[0.09]"
            }`}
            key={entry.id}
            type="button"
            onClick={() => setSelected(entry.id)}
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] opacity-70">{entry.id}</span>
            <span className="mt-2 block font-semibold">{entry.sourceName}</span>
          </button>
        ))}
      </div>
      <article className="rounded-[1.15rem] bg-white/[0.06] p-6 ring-1 ring-white/[0.1]">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.qualityStatus} />
          <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-paper/66">{item.question}</span>
        </div>
        <h3 className="mt-6 text-3xl font-semibold tracking-[-0.045em]">{item.sourceName}</h3>
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          {[
            ["College", item.college],
            ["Evidence type", item.type],
            ["Owner", item.owner],
            ["Date", item.date]
          ].map(([label, value]) => (
            <div className="rounded-[0.85rem] bg-ink/52 p-4" key={label}>
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-paper/42">{label}</dt>
              <dd className="mt-2 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 rounded-[0.95rem] bg-paper p-4 text-sm leading-6 text-ink">{item.reviewerNotes}</p>
      </article>
    </div>
  );
}

function CapabilityCard({ assessment }: { assessment: LecturerAssessment }) {
  const classification = classifyAssessment(assessment);
  const total = totalRubricScore(assessment.scores);

  return (
    <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">{assessment.id}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">{assessment.lecturer}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${classification === "Independent" ? "bg-lime text-ink" : classification === "Not Yet Demonstrated" ? "bg-rose-300 text-ink" : "bg-amber text-ink"}`}>
          {classification}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-paper/62">{assessment.experienceTitle} · {assessment.programme}</p>
      <div className="mt-5 grid gap-2">
        {rubricAreas.map((area) => {
          const score = assessment.scores.find((entry) => entry.area === area)?.score;
          return (
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[0.78rem] bg-ink/50 px-3 py-2 text-sm" key={area}>
              <span className="text-paper/66">{area}</span>
              <span className="font-mono text-cyan">{score ?? "-"}/2</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <span className="rounded-[0.8rem] bg-white/[0.08] p-3 text-sm">Total: <b>{total}/14</b></span>
        <span className="rounded-[0.8rem] bg-white/[0.08] p-3 text-sm">Assistance: <b>{assessment.assistanceType}</b></span>
        <span className="rounded-[0.8rem] bg-white/[0.08] p-3 text-sm">Moderation: <b>{assessment.moderation}</b></span>
      </div>
    </article>
  );
}

function AppTable({ children, headings }: { children: React.ReactNode; headings: string[] }) {
  return (
    <div className="overflow-x-auto rounded-[1.05rem] border border-white/[0.1]">
      <table className="min-w-[860px] w-full border-collapse text-left text-sm">
        <thead className="bg-white/[0.08] text-paper/62">
          <tr>
            {headings.map((heading) => (
              <th className="px-4 py-3 font-mono text-[0.66rem] uppercase tracking-[0.15em]" key={heading} scope="col">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.08]">{children}</tbody>
      </table>
    </div>
  );
}

const captureSteps = [
  {
    id: "scope",
    label: "Scope & source",
    prompt: "Lock the reporting scope before evidence is interpreted."
  },
  {
    id: "q1",
    label: "Q1 learner use",
    prompt: "Prove when learners actually used EON-XR."
  },
  {
    id: "q2",
    label: "Q2 lecturer capability",
    prompt: "Score independent creation, publishing, assignment and demonstration."
  },
  {
    id: "evidence",
    label: "Evidence quality",
    prompt: "Index source quality, status, limitation and reviewer decision."
  },
  {
    id: "actions",
    label: "Contradictions & actions",
    prompt: "Resolve gaps through root cause, owner and closure evidence."
  },
  {
    id: "signoff",
    label: "Sign-off",
    prompt: "Confirm findings, limitations and production decisions."
  }
] as const;

type CaptureStepId = (typeof captureSteps)[number]["id"];

function FormField({
  id,
  label,
  helper,
  children,
  error
}: {
  id: string;
  label: string;
  helper?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-paper/76" htmlFor={id}>{label}</label>
      <div className="mt-2">{children}</div>
      {helper ? <p className="mt-2 text-xs leading-5 text-paper/48">{helper}</p> : null}
      {error ? <p className="mt-2 text-sm font-semibold text-rose-300" id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}

const inputClass = "min-h-11 w-full rounded-[0.82rem] border border-white/[0.12] bg-white/[0.075] px-3 py-2 text-sm text-paper outline-none transition placeholder:text-paper/35 focus:border-cyan focus:ring-2 focus:ring-cyan/20";

function formDataToDraft(data: FormData) {
  const draft: CaptureDraft = {};
  data.forEach((value, key) => {
    draft[key] = String(value);
  });
  return draft;
}

function CapturePortal({
  snapshot,
  onSubmitPackage
}: {
  snapshot: FgcWorkspaceState;
  onSubmitPackage: (draft: CaptureDraft, context: CaptureContext) => void;
}) {
  const [step, setStep] = useState<CaptureStepId>("scope");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<CaptureDraft>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(fgcCaptureDraftStorageKey) ?? "{}") as CaptureDraft;
    } catch {
      return {};
    }
  });
  const [provinces, setProvinces] = useState<ProvinceReference[]>([]);
  const [colleges, setColleges] = useState<CollegeReference[]>([]);
  const [campuses, setCampuses] = useState<CampusReference[]>([]);
  const [categories, setCategories] = useState<ProgrammeCategoryReference[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeReference[]>([]);
  const [levels, setLevels] = useState<ProgrammeLevelReference[]>([]);
  const [subjects, setSubjects] = useState<SubjectReference[]>([]);
  const [quality, setQuality] = useState<ReferenceDataQualitySnapshot | null>(null);
  const [showReferenceRequest, setShowReferenceRequest] = useState(false);
  const [referenceSelection, setReferenceSelection] = useState({
    provinceId: "province-gp",
    collegeId: "sedibeng-tvet-college",
    campusId: "sedibeng-sebokeng-campus",
    categoryId: "category-ncv",
    programmeId: "programme-engineering-and-related-design",
    levelId: "level-ncv-l2"
  });
  const stepIndex = captureSteps.findIndex((item) => item.id === step);
  const activeStep = captureSteps[stepIndex];

  useEffect(() => {
    localStorage.setItem(fgcCaptureDraftStorageKey, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    let live = true;
    Promise.all([
      fgcReferenceService.listProvinces(),
      fgcReferenceService.listProgrammeCategories(),
      fgcReferenceService.getQualitySnapshot()
    ]).then(([nextProvinces, nextCategories, nextQuality]) => {
      if (!live) return;
      setProvinces(nextProvinces);
      setCategories(nextCategories);
      setQuality(nextQuality);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    fgcReferenceService.listColleges(referenceSelection.provinceId).then((nextColleges) => {
      if (!live) return;
      setColleges(nextColleges);
      if (nextColleges.length && !nextColleges.some((college) => college.id === referenceSelection.collegeId)) {
        setReferenceSelection((current) => ({ ...current, collegeId: nextColleges[0].id, campusId: "", programmeId: "", levelId: "" }));
      }
    });
    return () => {
      live = false;
    };
  }, [referenceSelection.collegeId, referenceSelection.provinceId]);

  useEffect(() => {
    let live = true;
    fgcReferenceService.listCampuses(referenceSelection.collegeId).then((nextCampuses) => {
      if (!live) return;
      setCampuses(nextCampuses);
      if (nextCampuses.length && !nextCampuses.some((campus) => campus.id === referenceSelection.campusId)) {
        setReferenceSelection((current) => ({ ...current, campusId: nextCampuses[0].id, programmeId: "", levelId: "" }));
      }
    });
    return () => {
      live = false;
    };
  }, [referenceSelection.campusId, referenceSelection.collegeId]);

  useEffect(() => {
    let live = true;
    fgcReferenceService.listProgrammes({
      campusId: referenceSelection.campusId,
      programmeCategoryId: referenceSelection.categoryId
    }).then((nextProgrammes) => {
      if (!live) return;
      setProgrammes(nextProgrammes);
      if (nextProgrammes.length && !nextProgrammes.some((programme) => programme.id === referenceSelection.programmeId)) {
        setReferenceSelection((current) => ({ ...current, programmeId: nextProgrammes[0].id, levelId: "" }));
      }
    });
    return () => {
      live = false;
    };
  }, [referenceSelection.campusId, referenceSelection.categoryId, referenceSelection.programmeId]);

  useEffect(() => {
    let live = true;
    fgcReferenceService.listLevels(referenceSelection.programmeId).then((nextLevels) => {
      if (!live) return;
      setLevels(nextLevels);
      if (nextLevels.length && !nextLevels.some((level) => level.id === referenceSelection.levelId)) {
        setReferenceSelection((current) => ({ ...current, levelId: nextLevels[0].id }));
      }
    });
    return () => {
      live = false;
    };
  }, [referenceSelection.levelId, referenceSelection.programmeId]);

  useEffect(() => {
    let live = true;
    fgcReferenceService.listSubjects(referenceSelection.programmeId, referenceSelection.levelId).then((nextSubjects) => {
      if (live) setSubjects(nextSubjects);
    });
    return () => {
      live = false;
    };
  }, [referenceSelection.levelId, referenceSelection.programmeId]);

  const selectedCollege = colleges.find((college) => college.id === referenceSelection.collegeId);
  const selectedCampus = campuses.find((campus) => campus.id === referenceSelection.campusId);
  const selectedProgramme = programmes.find((programme) => programme.id === referenceSelection.programmeId);
  const selectedLevel = levels.find((level) => level.id === referenceSelection.levelId);
  const selectedSubjectIds = (draft.subjects ?? "").split(",").filter(Boolean);
  const selectedSubjects = subjects.filter((subject) => selectedSubjectIds.includes(subject.id));
  const verifiedCampusOfferingCount = campusProgrammeOfferings.filter((offering) => offering.campusId === referenceSelection.campusId && offering.status === "VERIFIED").length;

  const requiredByStep: Record<CaptureStepId, Array<[string, string]>> = {
    scope: [
      ["reportingPeriod", "Confirm the reporting period."],
      ["college", "Enter the college or campus scope."],
      ["owner", "Identify the accountable evidence owner."]
    ],
    q1: [
      ["programme", "Enter the programme or cohort."],
      ["useDate", "Enter the learner-use date."],
      ["startTime", "Enter the start time."],
      ["endTime", "Enter the end time."],
      ["activeLearners", "Enter active learners from usage evidence."],
      ["analyticsReference", "Reference the analytics export or platform evidence."]
    ],
    q2: [
      ["lecturer", "Enter the lecturer or governed participant reference."],
      ["experienceTitle", "Enter the experience title."],
      ["eonId", "Enter the EON ID or URL."],
      ["assistance", "Record the assistance level observed."]
    ],
    evidence: [
      ["sourceName", "Enter the document or export name."],
      ["evidenceReference", "Link the source location or evidence reference."],
      ["reviewerNotes", "Add reviewer notes or limitations."]
    ],
    actions: [
      ["issue", "Enter the issue or contradiction."],
      ["rootCause", "Enter the root cause."],
      ["action", "Enter the corrective action."],
      ["actionOwner", "Assign an action owner."],
      ["closureEvidence", "Define acceptable closure evidence."]
    ],
    signoff: [
      ["signoffOwner", "Enter the sign-off owner."],
      ["findingSummary", "Summarise the defensible FGC finding."],
      ["limitations", "State the remaining limitations or unresolved items."]
    ]
  };

  const validateStep = (data: FormData, targetStep = step) => {
    const nextErrors: Record<string, string> = {};

    requiredByStep[targetStep].forEach(([field, message]) => {
      if (!String(data.get(field) ?? "").trim()) nextErrors[field] = message;
    });

    if (targetStep === "q1") {
      const activeLearners = Number(data.get("activeLearners"));
      const enrolledLearners = Number(data.get("enrolledLearners"));
      if (Number.isFinite(activeLearners) && Number.isFinite(enrolledLearners) && enrolledLearners > 0 && activeLearners > enrolledLearners) {
        nextErrors.activeLearners = "Active learners cannot exceed enrolled learners without a reviewer note.";
      }
    }

    if (targetStep === "q2") {
      const facilitatorExecuted = data.get("facilitatorExecuted") === "Yes";
      const assistance = String(data.get("assistance") ?? "");
      if (facilitatorExecuted && assistance !== "Facilitator Execution") {
        nextErrors.assistance = "If the facilitator executed a step, assistance must be recorded as Facilitator Execution.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mergeCurrentForm = (form: HTMLFormElement) => {
    const nextDraft = { ...draft, ...formDataToDraft(new FormData(form)) };
    setDraft(nextDraft);
    return nextDraft;
  };

  const handleFormChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!target.name) return;

    if (target instanceof HTMLSelectElement && target.multiple) {
      setDraft((current) => ({ ...current, [target.name]: Array.from(target.selectedOptions).map((option) => option.value).join(",") }));
      return;
    }

    setDraft((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleStepChange = (event: React.MouseEvent<HTMLButtonElement>, targetStep: CaptureStepId) => {
    const form = event.currentTarget.form;
    if (!form || targetStep === step) return;
    mergeCurrentForm(form);
    const targetIndex = captureSteps.findIndex((item) => item.id === targetStep);
    if (targetIndex <= stepIndex || validateStep(new FormData(form))) {
      setStep(targetStep);
      setSubmitted(false);
      setErrors({});
    }
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form;
    if (!form || !validateStep(new FormData(form))) return;
    mergeCurrentForm(form);
    const next = captureSteps[Math.min(stepIndex + 1, captureSteps.length - 1)];
    setStep(next.id);
    setSubmitted(false);
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mergedDraft = mergeCurrentForm(event.currentTarget);
    const valid = validateStep(new FormData(event.currentTarget), "signoff");
    setSubmitted(valid);
    if (valid) {
      onSubmitPackage(mergedDraft, {
        selectedCollege,
        selectedCampus,
        selectedProgramme,
        selectedLevel,
        selectedSubjects
      });
      localStorage.removeItem(fgcCaptureDraftStorageKey);
      setDraft({});
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 2xl:grid-cols-[0.72fr_1.28fr]">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Data capture portal</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em]">Guided FGC evidence capture wizard.</h2>
          <p className="mt-4 leading-7 text-paper/64">
            This flow mirrors the workshop logic: scope first, Q1 learner use, Q2 lecturer independence, evidence quality, corrective actions and final sign-off. It is still frontend-only, ready for PostgreSQL once the questions feel right.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              [Users, "Learner-use records", `${snapshot.learnerUse.length} staged`],
              [GraduationCap, "Lecturer assessments", `${snapshot.assessments.length} staged`],
              [UploadCloud, "Evidence files indexed", `${snapshot.evidence.length} staged`],
              [AlertTriangle, "Corrective actions", `${snapshot.actions.length} staged`]
            ].map(([Icon, label, value]) => {
              const LucideIcon = Icon as typeof Users;
              return (
                <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={label as string}>
                  <LucideIcon aria-hidden="true" className="text-lime" size={20} />
                  <p className="mt-3 text-sm text-paper/54">{label as string}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{value as string}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-lime">Current step</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{activeStep.label}</h3>
            <p className="mt-2 text-sm leading-6 text-paper/58">{activeStep.prompt}</p>
          </div>
          <div className="mt-6 rounded-[0.95rem] bg-cyan/10 p-4 ring-1 ring-cyan/20">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan">Reference registry quality</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Public TVET colleges", quality?.activeColleges ?? 0],
                ["Verified campuses loaded", quality?.activeCampuses ?? 0],
                ["National programmes", quality?.nationalProgrammes ?? 0],
                ["Subjects mapped", quality?.subjects ?? 0]
              ].map(([label, value]) => (
                <div className="rounded-[0.75rem] bg-ink/48 p-3" key={label as string}>
                  <p className="text-xs text-paper/52">{label as string}</p>
                  <p className="mt-1 text-xl font-semibold text-paper">{value as number}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-paper/58">
              Campus programme offerings remain empty until official offering evidence is imported or administrator-verified.
            </p>
          </div>
        </article>

        <form className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5 md:p-6" noValidate onChange={handleFormChange} onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Step {stepIndex + 1} of {captureSteps.length}</p>
              <p className="text-sm font-semibold text-paper/58">{Math.round(((stepIndex + 1) / captureSteps.length) * 100)}% prepared</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.1]">
              <div className="h-full rounded-full bg-lime transition-all duration-500" style={{ width: `${((stepIndex + 1) / captureSteps.length) * 100}%` }} />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {captureSteps.map((item, index) => (
              <button
                aria-pressed={step === item.id}
                className={`min-h-12 rounded-[0.85rem] px-4 text-left text-sm font-bold transition duration-500 ${
                  step === item.id ? "bg-cyan text-ink" : index < stepIndex ? "bg-lime/16 text-lime ring-1 ring-lime/25" : "bg-white/[0.075] text-paper/68 ring-1 ring-white/[0.1] hover:bg-white/[0.12] hover:text-paper"
                }`}
                key={item.id}
                type="button"
                onClick={(event) => handleStepChange(event, item.id)}
              >
                <span className="mr-2 font-mono text-[0.65rem] opacity-70">{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </button>
            ))}
          </div>

          {Object.keys(errors).length > 0 ? (
            <div className="mt-5 rounded-[0.95rem] border border-rose-300/30 bg-rose-300/10 p-4" role="alert">
              <h3 className="font-semibold text-rose-200">Review required fields</h3>
              <ul className="mt-2 grid gap-1 text-sm text-paper/76">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}><a className="underline decoration-rose-300 underline-offset-4" href={`#${field}`}>{message}</a></li>
                ))}
              </ul>
            </div>
          ) : null}

          {submitted ? (
            <div className="mt-5 rounded-[0.95rem] border border-lime/30 bg-lime/12 p-4 text-sm font-semibold text-lime" role="status">
              Demo record passed sign-off validation and is ready to route into the evidence workflow.
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {step === "scope" ? (
              <>
                <FormField id="reportingPeriod" label="Reporting period" error={errors.reportingPeriod} helper="Match the approved workshop/reporting scope.">
                  <input aria-describedby={errors.reportingPeriod ? "reportingPeriod-error" : undefined} className={inputClass} defaultValue={draft.reportingPeriod ?? "September 2026 FGC evidence-validation workshop"} id="reportingPeriod" name="reportingPeriod" />
                </FormField>
                <FormField id="province" label="Province" helper="Country defaults to South Africa. Colleges are filtered by province.">
                  <select className={inputClass} id="province" name="province" value={referenceSelection.provinceId} onChange={(event) => setReferenceSelection((current) => ({ ...current, provinceId: event.target.value, collegeId: "", campusId: "", programmeId: "", levelId: "" }))}>
                    {provinces.map((province) => <option className="bg-ink" key={province.id} value={province.id}>{province.name}</option>)}
                  </select>
                </FormField>
                <FormField id="college" label="TVET College" error={errors.college} helper="Only colleges in the selected province appear.">
                  <select aria-describedby={errors.college ? "college-error" : undefined} className={inputClass} id="college" name="college" value={referenceSelection.collegeId} onChange={(event) => setReferenceSelection((current) => ({ ...current, collegeId: event.target.value, campusId: "", programmeId: "", levelId: "" }))}>
                    <option className="bg-ink" value="">Select college</option>
                    {colleges.map((college) => <option className="bg-ink" key={college.id} value={college.id}>{college.officialName}</option>)}
                  </select>
                </FormField>
                <FormField id="campus" label="Campus / delivery site" helper="Only verified or staged campuses for the selected college appear.">
                  <select className={inputClass} id="campus" name="campus" value={referenceSelection.campusId} onChange={(event) => setReferenceSelection((current) => ({ ...current, campusId: event.target.value, programmeId: "", levelId: "" }))}>
                    <option className="bg-ink" value="">Select campus</option>
                    {campuses.map((campus) => <option className="bg-ink" key={campus.id} value={campus.id}>{campus.officialName} · {campus.verificationStatus.replaceAll("_", " ")}</option>)}
                  </select>
                </FormField>
                <FormField id="owner" label="Evidence owner" error={errors.owner} helper="Person accountable for source quality and follow-up.">
                  <input aria-describedby={errors.owner ? "owner-error" : undefined} className={inputClass} defaultValue={draft.owner} id="owner" name="owner" placeholder="College Evidence Owner" />
                </FormField>
                <div className="md:col-span-2">
                  <div className="rounded-[0.9rem] border border-white/[0.1] bg-ink/42 p-4 text-sm leading-6 text-paper/62">
                    <p className="font-semibold text-paper">Derived institutional scope</p>
                    <p className="mt-2">{selectedCollege?.officialName ?? "No college selected"} → {selectedCampus?.officialName ?? "No campus selected"}</p>
                    <p className="mt-1 text-xs text-paper/46">Production records should save relational IDs, not repeated province, college or campus text.</p>
                  </div>
                </div>
                <FormField id="scopeStatus" label="Scope status">
                  <select className={inputClass} id="scopeStatus" name="scopeStatus">
                    <option className="bg-ink">Confirmed in workshop</option>
                    <option className="bg-ink">Requires confirmation</option>
                    <option className="bg-ink">Partially confirmed</option>
                  </select>
                </FormField>
              </>
            ) : null}

            {step === "q1" ? (
              <>
                <FormField id="programmeCategory" label="Programme category" helper="Categories are controlled reference data, not typed text.">
                  <select className={inputClass} id="programmeCategory" name="programmeCategory" value={referenceSelection.categoryId} onChange={(event) => setReferenceSelection((current) => ({ ...current, categoryId: event.target.value, programmeId: "", levelId: "" }))}>
                    {categories.map((category) => <option className="bg-ink" key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </FormField>
                <FormField id="programme" label="Programme" error={errors.programme} helper="Campus offerings are intentionally blank until verified; national programmes are shown for staging only.">
                  <select aria-describedby={errors.programme ? "programme-error" : undefined} className={inputClass} id="programme" name="programme" value={referenceSelection.programmeId} onChange={(event) => setReferenceSelection((current) => ({ ...current, programmeId: event.target.value, levelId: "" }))}>
                    <option className="bg-ink" value="">Select programme</option>
                    {programmes.map((programme) => <option className="bg-ink" key={programme.id} value={programme.id}>{programme.title}</option>)}
                  </select>
                  {verifiedCampusOfferingCount === 0 ? (
                    <p className="mt-2 rounded-[0.75rem] border border-amber/25 bg-amber/10 p-3 text-xs font-semibold leading-5 text-amber">
                      No verified campus programme offering has been loaded for {selectedCampus?.officialName ?? "this campus"} yet. This selection remains staged until verified.
                    </p>
                  ) : null}
                </FormField>
                <FormField id="programmeLevel" label="Programme level" helper="Programme level is kept separate from NQF level.">
                  <select className={inputClass} id="programmeLevel" name="programmeLevel" value={referenceSelection.levelId} onChange={(event) => setReferenceSelection((current) => ({ ...current, levelId: event.target.value }))}>
                    <option className="bg-ink" value="">Select level</option>
                    {levels.map((level) => <option className="bg-ink" key={level.id} value={level.id}>{level.label}</option>)}
                  </select>
                </FormField>
                <FormField id="subjects" label="Subject(s) / module(s)" helper="Subjects are valid only for the selected programme and level. Multiple selection is supported.">
                  <select className={`${inputClass} min-h-28`} id="subjects" name="subjects" multiple value={selectedSubjectIds} onChange={(event) => setDraft((current) => ({ ...current, subjects: Array.from(event.currentTarget.selectedOptions).map((option) => option.value).join(",") }))}>
                    {subjects.map((subject) => <option className="bg-ink" key={subject.id} value={subject.id}>{subject.name} · {subject.requirement}</option>)}
                  </select>
                </FormField>
                <div className="md:col-span-2">
                  <button
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.075] px-4 text-sm font-bold text-paper transition hover:border-cyan hover:text-cyan"
                    type="button"
                    onClick={() => setShowReferenceRequest((current) => !current)}
                  >
                    <Plus aria-hidden="true" size={16} />
                    Can't find my programme/subject
                  </button>
                </div>
                {showReferenceRequest ? (
                  <div className="md:col-span-2 grid gap-4 rounded-[0.95rem] border border-cyan/20 bg-cyan/10 p-4 md:grid-cols-2">
                    <FormField id="requestedProgramme" label="Requested programme / qualification">
                      <input className={inputClass} defaultValue={draft.requestedProgramme} id="requestedProgramme" name="requestedProgramme" placeholder="Programme name as shown in source document" />
                    </FormField>
                    <FormField id="requestedSubject" label="Requested subject / module">
                      <input className={inputClass} defaultValue={draft.requestedSubject} id="requestedSubject" name="requestedSubject" placeholder="Subject, module or component name" />
                    </FormField>
                    <FormField id="requestedQualificationType" label="Qualification type">
                      <input className={inputClass} defaultValue={draft.requestedQualificationType} id="requestedQualificationType" name="requestedQualificationType" placeholder="NC(V), NATED, occupational, PLP, trade..." />
                    </FormField>
                    <FormField id="requestedLevel" label="Level">
                      <input className={inputClass} defaultValue={draft.requestedLevel} id="requestedLevel" name="requestedLevel" placeholder="Level 3, N4, NQF level, component stage..." />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField id="requestedEvidence" label="Optional evidence / document reference" helper="This creates a pending reference-data request for administrator review. It does not create an official curriculum record.">
                        <textarea className={`${inputClass} min-h-24 resize-y`} defaultValue={draft.requestedEvidence} id="requestedEvidence" name="requestedEvidence" placeholder="Source document, timetable, college page, qualification ID or attachment location" />
                      </FormField>
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <div className="rounded-[0.9rem] border border-white/[0.1] bg-ink/42 p-4 text-sm leading-6 text-paper/62">
                    <p className="font-semibold text-paper">Derived academic scope</p>
                    <p className="mt-2">{selectedProgramme?.title ?? "No programme selected"} → {selectedLevel?.label ?? "No level selected"} → {subjects.length} valid subject options</p>
                    <p className="mt-1 text-xs text-paper/46">Production submissions should store programme_id, programme_level_id and subject_id values.</p>
                  </div>
                </div>
                <FormField id="useDate" label="Use date" error={errors.useDate}>
                  <input aria-describedby={errors.useDate ? "useDate-error" : undefined} className={inputClass} id="useDate" name="useDate" type="date" />
                </FormField>
                <FormField id="startTime" label="Start time" error={errors.startTime}>
                  <input aria-describedby={errors.startTime ? "startTime-error" : undefined} className={inputClass} id="startTime" name="startTime" type="time" />
                </FormField>
                <FormField id="endTime" label="End time" error={errors.endTime}>
                  <input aria-describedby={errors.endTime ? "endTime-error" : undefined} className={inputClass} id="endTime" name="endTime" type="time" />
                </FormField>
                <FormField id="activeLearners" label="Active learners" error={errors.activeLearners} helper="Count only learners evidenced as active in the platform/session artefacts.">
                  <input aria-describedby={errors.activeLearners ? "activeLearners-error" : undefined} className={inputClass} id="activeLearners" min="0" name="activeLearners" placeholder="38" type="number" />
                </FormField>
                <FormField id="enrolledLearners" label="Enrolled learners">
                  <input className={inputClass} id="enrolledLearners" min="0" name="enrolledLearners" placeholder="42" type="number" />
                </FormField>
                <FormField id="useContext" label="Use context">
                  <select className={inputClass} id="useContext" name="useContext">
                    <option className="bg-ink">Scheduled class</option>
                    <option className="bg-ink">Independent study</option>
                    <option className="bg-ink">Workshop</option>
                    <option className="bg-ink">No meaningful use</option>
                  </select>
                </FormField>
                <FormField id="timetableMatch" label="Timetable match">
                  <select className={inputClass} id="timetableMatch" name="timetableMatch">
                    <option className="bg-ink">Matches timetable</option>
                    <option className="bg-ink">No timetable evidence</option>
                    <option className="bg-ink">Contradicts timetable</option>
                  </select>
                </FormField>
                <FormField id="attendanceMatch" label="Attendance/register match">
                  <select className={inputClass} id="attendanceMatch" name="attendanceMatch">
                    <option className="bg-ink">Matched to register</option>
                    <option className="bg-ink">Register missing</option>
                    <option className="bg-ink">Register contradicts platform use</option>
                  </select>
                </FormField>
                <FormField id="analyticsReference" label="Analytics export reference" error={errors.analyticsReference} helper="Login alone is not enough; reference meaningful activity evidence.">
                  <textarea aria-describedby={errors.analyticsReference ? "analyticsReference-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="analyticsReference" name="analyticsReference" placeholder="Export name, row ID, timestamp range, field definitions" />
                </FormField>
              </>
            ) : null}

            {step === "q2" ? (
              <>
                <FormField id="lecturer" label="Lecturer reference" error={errors.lecturer} helper="Use a governed identifier where personal data must be minimised.">
                  <input aria-describedby={errors.lecturer ? "lecturer-error" : undefined} className={inputClass} id="lecturer" name="lecturer" placeholder="Lecturer A" />
                </FormField>
                <FormField id="experienceTitle" label="Experience title" error={errors.experienceTitle}>
                  <input aria-describedby={errors.experienceTitle ? "experienceTitle-error" : undefined} className={inputClass} id="experienceTitle" name="experienceTitle" placeholder="Hydraulic Safety Procedure" />
                </FormField>
                <FormField id="eonId" label="EON ID / URL" error={errors.eonId} helper="Required to distinguish participant-created content from facilitator content.">
                  <input aria-describedby={errors.eonId ? "eonId-error" : undefined} className={inputClass} id="eonId" name="eonId" placeholder="EON-DEMO-001 or URL" />
                </FormField>
                <FormField id="assistance" label="Assistance observed" error={errors.assistance}>
                  <select aria-describedby={errors.assistance ? "assistance-error" : undefined} className={inputClass} id="assistance" name="assistance">
                    <option className="bg-ink">None</option>
                    <option className="bg-ink">Clarification</option>
                    <option className="bg-ink">Prompting</option>
                    <option className="bg-ink">Technical Intervention</option>
                    <option className="bg-ink">Facilitator Execution</option>
                  </select>
                </FormField>
                <FormField id="facilitatorExecuted" label="Did a facilitator execute any critical step?">
                  <select className={inputClass} id="facilitatorExecuted" name="facilitatorExecuted">
                    <option className="bg-ink">No</option>
                    <option className="bg-ink">Yes</option>
                  </select>
                </FormField>
                <FormField id="environmentFault" label="Environment fault">
                  <select className={inputClass} id="environmentFault" name="environmentFault">
                    <option className="bg-ink">No environment fault</option>
                    <option className="bg-ink">Platform/access issue</option>
                    <option className="bg-ink">Connectivity/device issue</option>
                    <option className="bg-ink">Reassessment required</option>
                  </select>
                </FormField>
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-paper/76">Seven-area independence rubric</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {rubricAreas.map((area) => (
                      <label className="grid gap-2 rounded-[0.85rem] bg-ink/46 p-3 ring-1 ring-white/[0.08]" key={area}>
                        <span className="text-sm font-semibold text-paper/70">{area}</span>
                        <select className={inputClass} name={`rubric-${area}`}>
                          <option className="bg-ink">2 - Independent</option>
                          <option className="bg-ink">1 - Prompted / partial</option>
                          <option className="bg-ink">0 - Not demonstrated</option>
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <FormField id="assessorNotes" label="Assessor notes and moderation route" helper="Record what was observed, what was assisted and whether moderation changed the result.">
                    <textarea className={`${inputClass} min-h-24 resize-y`} id="assessorNotes" name="assessorNotes" placeholder="Observed independently except analytics view; moderation pending." />
                  </FormField>
                </div>
              </>
            ) : null}

            {step === "evidence" ? (
              <>
                <FormField id="sourceName" label="Document / export name" error={errors.sourceName}>
                  <input aria-describedby={errors.sourceName ? "sourceName-error" : undefined} className={inputClass} id="sourceName" name="sourceName" placeholder="EON active users by session export v1" />
                </FormField>
                <FormField id="evidenceType" label="Evidence type">
                  <select className={inputClass} id="evidenceType" name="evidenceType">
                    <option className="bg-ink">Platform analytics export</option>
                    <option className="bg-ink">Timetable</option>
                    <option className="bg-ink">Attendance/register</option>
                    <option className="bg-ink">Moderated rubric</option>
                    <option className="bg-ink">Observation log</option>
                    <option className="bg-ink">Corrective-action artefact</option>
                  </select>
                </FormField>
                <FormField id="sourceDate" label="Source date">
                  <input className={inputClass} id="sourceDate" name="sourceDate" type="date" />
                </FormField>
                <FormField id="supportsQuestion" label="Supports">
                  <select className={inputClass} id="supportsQuestion" name="supportsQuestion">
                    <option className="bg-ink">Q1 learner utilisation</option>
                    <option className="bg-ink">Q2 lecturer capability</option>
                    <option className="bg-ink">Shared evidence / corrective action</option>
                  </select>
                </FormField>
                <FormField id="qualityStatus" label="Quality status">
                  <select className={inputClass} id="qualityStatus" name="qualityStatus">
                    {Object.keys(evidenceStatuses).map((status) => <option className="bg-ink" key={status}>{status}</option>)}
                  </select>
                </FormField>
                <FormField id="evidenceReference" label="Evidence reference / source location" error={errors.evidenceReference} helper="Link the file, export, row ID, observation note or moderation artefact.">
                  <textarea aria-describedby={errors.evidenceReference ? "evidenceReference-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="evidenceReference" name="evidenceReference" placeholder="EVI-Q1-001, SharePoint path, EON export row, or moderation sheet reference" />
                </FormField>
                <div className="md:col-span-2">
                  <FormField id="reviewerNotes" label="Reviewer notes / limitation" error={errors.reviewerNotes} helper="If evidence is missing, partial or contradicted, state why.">
                    <textarea aria-describedby={errors.reviewerNotes ? "reviewerNotes-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="reviewerNotes" name="reviewerNotes" placeholder="Matched against timetable and learner register; no unresolved contradiction." />
                  </FormField>
                </div>
              </>
            ) : null}

            {step === "actions" ? (
              <>
                <FormField id="issue" label="Issue / contradiction" error={errors.issue}>
                  <input aria-describedby={errors.issue ? "issue-error" : undefined} className={inputClass} id="issue" name="issue" placeholder="Timetable activity contradicted by analytics" />
                </FormField>
                <FormField id="issueCategory" label="Issue category">
                  <select className={inputClass} id="issueCategory" name="issueCategory">
                    <option className="bg-ink">Analytics gap</option>
                    <option className="bg-ink">Timetable contradiction</option>
                    <option className="bg-ink">Lecturer capability</option>
                    <option className="bg-ink">Account/access</option>
                    <option className="bg-ink">Device/environment</option>
                  </select>
                </FormField>
                <FormField id="rootCause" label="Root cause" error={errors.rootCause}>
                  <textarea aria-describedby={errors.rootCause ? "rootCause-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="rootCause" name="rootCause" placeholder="Learner group was not mapped to active accounts." />
                </FormField>
                <FormField id="action" label="Corrective action" error={errors.action}>
                  <textarea aria-describedby={errors.action ? "action-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="action" name="action" placeholder="Reconcile learner group, assignment and licence activation records." />
                </FormField>
                <FormField id="actionOwner" label="Action owner" error={errors.actionOwner}>
                  <input aria-describedby={errors.actionOwner ? "actionOwner-error" : undefined} className={inputClass} id="actionOwner" name="actionOwner" placeholder="College Evidence Owner" />
                </FormField>
                <FormField id="priority" label="Priority">
                  <select className={inputClass} id="priority" name="priority">
                    <option className="bg-ink">Critical</option>
                    <option className="bg-ink">High</option>
                    <option className="bg-ink">Medium</option>
                    <option className="bg-ink">Low</option>
                  </select>
                </FormField>
                <FormField id="dueDate" label="Due date">
                  <input className={inputClass} id="dueDate" name="dueDate" type="date" />
                </FormField>
                <FormField id="closureEvidence" label="Closure evidence required" error={errors.closureEvidence}>
                  <textarea aria-describedby={errors.closureEvidence ? "closureEvidence-error" : undefined} className={`${inputClass} min-h-24 resize-y`} id="closureEvidence" name="closureEvidence" placeholder="Reconciled export, updated register and reviewer confirmation." />
                </FormField>
              </>
            ) : null}

            {step === "signoff" ? (
              <>
                <FormField id="signoffOwner" label="Sign-off owner" error={errors.signoffOwner}>
                  <input aria-describedby={errors.signoffOwner ? "signoffOwner-error" : undefined} className={inputClass} id="signoffOwner" name="signoffOwner" placeholder="Workshop Lead / Evidence Lead" />
                </FormField>
                <FormField id="readinessDecision" label="Finding readiness">
                  <select className={inputClass} id="readinessDecision" name="readinessDecision">
                    <option className="bg-ink">Ready for moderated report drafting</option>
                    <option className="bg-ink">Partially ready with limitations</option>
                    <option className="bg-ink">Not ready - evidence gaps remain</option>
                  </select>
                </FormField>
                <div className="md:col-span-2">
                  <FormField id="findingSummary" label="Defensible finding summary" error={errors.findingSummary} helper="Keep Q1 and Q2 findings separate. Do not infer one from the other.">
                    <textarea aria-describedby={errors.findingSummary ? "findingSummary-error" : undefined} className={`${inputClass} min-h-28 resize-y`} id="findingSummary" name="findingSummary" placeholder="Q1: verified learner use was evidenced for... Q2: lecturer independence was evidenced for..." />
                  </FormField>
                </div>
                <div className="md:col-span-2">
                  <FormField id="limitations" label="Limitations / unresolved items" error={errors.limitations}>
                    <textarea aria-describedby={errors.limitations ? "limitations-error" : undefined} className={`${inputClass} min-h-28 resize-y`} id="limitations" name="limitations" placeholder="Analytics export field definitions require confirmation; one timetable contradiction remains unresolved." />
                  </FormField>
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-paper/52">Production save will require authentication, versioning and audit trail.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={stepIndex === 0}
                type="button"
                onClick={() => {
                  const previous = captureSteps[Math.max(stepIndex - 1, 0)];
                  setStep(previous.id);
                  setSubmitted(false);
                  setErrors({});
                }}
              >
                Previous
              </button>
              {step === "signoff" ? (
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-ink transition hover:bg-cyan active:scale-[0.98]" type="submit">
                  <Save aria-hidden="true" size={17} />
                  Validate sign-off
                </button>
              ) : (
                <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-lime px-5 text-sm font-bold text-ink transition hover:bg-cyan active:scale-[0.98]" type="button" onClick={handleNext}>
                  Validate step
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Observatory({ snapshot }: { snapshot: ObservatorySnapshot }) {
  const verifiedLearners = snapshot.learnerUse.reduce((sum, record) => sum + (record.evidenceStatus === "Verified" ? record.activeLearners ?? 0 : 0), 0);
  const contradictedLearnerRecords = snapshot.learnerUse.filter((record) => record.evidenceStatus === "Contradicted").length;
  const independentLecturers = snapshot.assessments.filter((assessment) => classifyAssessment(assessment) === "Independent").length;
  const supportRequired = snapshot.assessments.filter((assessment) => classifyAssessment(assessment) === "Partially Independent / Support Required").length;
  const evidenceGaps = snapshot.evidence.filter((item) => item.qualityStatus !== "Verified").length + snapshot.actions.filter((action) => action.status !== "Complete").length;
  const verifiedLearnerRecords = snapshot.learnerUse.filter((record) => record.evidenceStatus === "Verified").length;
  const verifiedEvidence = snapshot.evidence.filter((item) => item.qualityStatus === "Verified").length;
  const completeActions = snapshot.actions.filter((action) => action.status === "Complete").length;

  return (
    <div className="grid gap-6">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        <MetricCard label="Verified learner-use records" value={String(verifiedLearners)} note="Learners counted only from verified use records." tone="lime" />
        <MetricCard label="Contradicted Q1 records" value={String(contradictedLearnerRecords)} note="Timetable and analytics disagreement remains visible." tone="rose" />
        <MetricCard label="Independent lecturers" value={String(independentLecturers)} note="All seven rubric areas scored 2/2 without facilitator execution." tone="lime" />
        <MetricCard label="Support required" value={String(supportRequired)} note="Observed capability exists, but at least one area needs reinforcement." tone="amber" />
        <MetricCard label="Open evidence gaps" value={String(evidenceGaps)} note="Evidence quality issues plus incomplete corrective actions." />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[0.72fr_1.28fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <RingInfographic label="Q1 learner-use coverage" value={verifiedLearnerRecords} total={snapshot.learnerUse.length} note="Only verified learner-use rows contribute to the defensible Q1 finding." />
          <RingInfographic label="Q2 independent capability" value={independentLecturers} total={snapshot.assessments.length} note="Independent means every rubric area is complete without facilitator execution." />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BulletChart label="Evidence quality target" value={verifiedEvidence} target={snapshot.evidence.length} unit="" caption="Verified evidence items against the current demo evidence spine." />
          <BulletChart label="Action closure target" value={completeActions} target={snapshot.actions.length} unit="" caption="Corrective actions closed with acceptable closure evidence." />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <ComparativeBars records={snapshot.learnerUse} />
        <StatusBreakdown evidence={snapshot.evidence} />
      </div>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
        <article className="min-w-0 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Demo mode</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em]">Synthetic records. Real source rules.</h2>
          <p className="mt-5 leading-7 text-paper/66">
            This frontend uses realistic synthetic data to exercise the workflow. Production wiring should replace the mock service with governed EON exports, college registers, rubrics and evidence files.
          </p>
        </article>
        <article className="min-w-0 rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Question firewall</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {fgcProduct.governingQuestions.map((question, index) => (
              <div className="rounded-[0.95rem] bg-ink/54 p-5" key={question}>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-lime">FGC Q{index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold leading-tight">{question}</h3>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ProductionIntelligencePanel({ metrics }: { metrics: FgcProductionMetricsSummary | null }) {
  return (
    <div className="grid gap-6">
      <article className="rounded-[1.15rem] border border-cyan/18 bg-cyan/[0.045] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production observatory</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Governed metrics only. No synthetic evidence loaded.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
          This production session is reading from the server-side FGC metric layer. Detailed learner-use, evidence-quality,
          assessment and moderation panels remain empty until authorised source imports, submissions and reviews exist in PostgreSQL.
        </p>
      </article>

      {metrics ? (
        <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
          {metrics.metrics.map((metric) => (
            <article className="min-w-0 rounded-[1.05rem] border border-white/[0.1] bg-white/[0.055] p-5" key={metric.id}>
              <p className="min-w-0 [overflow-wrap:anywhere] font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/50">{metric.label}</p>
              <p className={`mt-5 text-4xl font-semibold tracking-[-0.06em] ${productionMetricToneClass(metric.tone)}`}>{metric.value}</p>
              <p className="mt-3 text-sm leading-6 text-paper/62">{metric.note}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.05rem] border border-dashed border-amber/25 bg-amber/10 p-5 text-sm font-semibold leading-6 text-amber">
          Production metrics are not available yet. Check database connectivity, migration status and role permissions.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Learner utilisation", "Analytics Not Imported", "Verified learner use requires an authorised EON export or approved source import."],
          ["Evidence spine", "No Submission Yet", "Evidence files and response values will appear after assigned production forms are submitted."],
          ["Lecturer capability", "Not Assessed", "Capability must be scored by authorised assessors and moderated separately from lecturer self-reporting."],
          ["Reports", "No Reproducible Report Snapshot", "Reports must be generated server-side from versioned production data."]
        ].map(([label, state, note]) => (
          <article className="min-w-0 rounded-[1.05rem] bg-ink/54 p-5 ring-1 ring-white/[0.08]" key={label}>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">{label}</p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-amber">{state}</h3>
            <p className="mt-3 text-sm leading-6 text-paper/58">{note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductionTabPanel({ access, metrics, tab }: { access: ResolvedProductionAccess; metrics: FgcProductionMetricsSummary | null; tab: Tab }) {
  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");
  const canOperateWorkbench = ["JEF_ADMIN_ACTIVE", "PLATFORM_SUPER_ACTIVE", "COLLEGE_ACTIVE", "ASSESSOR_ACTIVE", "MODERATOR_ACTIVE"].includes(access.access.accessState);
  const metricById = (id: string) => metrics?.metrics.find((metric) => metric.id === id)?.value ?? 0;
  const dashboardCards = [
    ["Assigned forms", metricById("assigned-forms"), "Production form assignments issued by eligibility and role approval."],
    ["Draft packs", metricById("draft-submissions"), "Lecturer evidence forms that remain editable or returned for clarification."],
    ["Submitted packs", metricById("submitted-evidence-packs"), "Evidence packages already inside the governed review workflow."],
    ["Audit events", metrics?.audit.totalEvents ?? 0, "Recorded access, save, submit and workflow decisions."]
  ] as const;

  if (tab === "Observatory") return <ProductionIntelligencePanel metrics={metrics} />;

  if (tab === "Evidence Spine") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-cyan/18 bg-cyan/[0.045] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production evidence spine</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Submission lineage, not demo evidence.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            This view follows assignment, draft, submitted and audit states from PostgreSQL. Detailed evidence-file inspection opens from the role workbench once files and review records exist.
          </p>
        </article>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map(([label, value, note]) => (
            <MetricCard label={label} value={String(value)} note={note} key={label} />
          ))}
        </div>
        {canOperateWorkbench ? (
          <Link className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/tasks">
            Open production work queue
          </Link>
        ) : null}
      </div>
    );
  }

  if (tab === "Triangulation") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production triangulation</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Learner-use comparison awaits authorised source imports.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            The production dashboard does not invent timetable, attendance or EON analytics. Once source imports are approved, this tab should compare planned sessions, attendance evidence and platform-use evidence by role scope.
          </p>
        </article>
        <div className="grid gap-4 md:grid-cols-3">
          {["Timetable source", "Attendance source", "EON/XR analytics"].map((label) => (
            <article className="rounded-[1.05rem] bg-ink/54 p-5 ring-1 ring-white/[0.08]" key={label}>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">{label}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-amber">Pending import</h3>
              <p className="mt-3 text-sm leading-6 text-paper/58">No synthetic records are shown for this production role.</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "Lecturer Capability") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Production lecturer capability</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{metricById("approved-lecturers")} approved lecturer role(s).</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            Lecturer self-capture is separate from assessor scoring and moderation. Capability scoring becomes available after submitted evidence is reviewed by authorised assessors.
          </p>
        </article>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {metrics?.roleBreakdown.filter((row) => row.roleCode.includes("LECTURER") || row.roleCode.includes("ASSESSOR") || row.roleCode.includes("MODERATOR")).map((row) => (
            <article className="rounded-[1.05rem] bg-ink/54 p-5 ring-1 ring-white/[0.08]" key={`${row.roleCode}-${row.status}`}>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">{row.roleCode}</p>
              <p className="mt-3 text-3xl font-semibold text-cyan">{row.total}</p>
              <p className="mt-2 text-sm leading-6 text-paper/58">{row.status}</p>
            </article>
          )) ?? null}
        </div>
      </div>
    );
  }

  if (tab === "Data Capture") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-cyan/18 bg-cyan/[0.045] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production data capture</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{hasApprovedLecturerRole ? "Your assigned capture forms." : "Lecturer role required."}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            {hasApprovedLecturerRole
              ? "Open the assigned FGC lecturer form from here. Submitted or moderation-stage forms remain viewable but locked unless returned through clarification."
              : "This signed-in account can view production dashboard data according to its approved role, but data capture requires a separately approved Lecturer role."}
          </p>
        </article>
        <div className="grid gap-4">
          {hasApprovedLecturerRole && access.formAssignments.length ? access.formAssignments.map((assignment) => (
            <article className="rounded-[1.05rem] bg-ink/54 p-5 ring-1 ring-white/[0.08]" key={assignment.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{assignment.templateName}</p>
                  <p className="mt-1 text-sm text-paper/56">{assignment.status}{assignment.dueAt ? ` · due ${new Date(assignment.dueAt).toLocaleDateString()}` : ""}</p>
                </div>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href={`/fgc-ekm/data-capturer/forms/${assignment.id}`}>
                  Open form
                </Link>
              </div>
            </article>
          )) : (
            <p className="rounded-[1.05rem] border border-dashed border-white/[0.14] p-5 text-sm font-semibold leading-6 text-paper/58">
              {hasApprovedLecturerRole ? "No production form assignment is currently available for this lecturer profile." : "No Lecturer capture forms are available to this role."}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (tab === "Curriculum Catalogue") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production curriculum catalogue</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">National TVET curriculum remains the selection backbone.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            Curriculum selection is available inside the lecturer capture workflow. Campus offering intelligence remains conservative until formally verified.
          </p>
        </article>
        {hasApprovedLecturerRole ? (
          <Link className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/data-capturer">
            Open lecturer capture workspace
          </Link>
        ) : null}
      </div>
    );
  }

  if (tab === "Corrective Actions") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber">Production corrective actions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Actions come from governed review decisions.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
            Corrective actions become visible after college, assessor, moderator or JEF review records request clarification, reinforcement or remediation.
          </p>
        </article>
        {canOperateWorkbench ? (
          <Link className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/tasks">
            Open action queue
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Reports and decisions</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Production reports use server-side governed records.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">
          Report generation, audit acknowledgement and decision exports are handled through authorised role routes.
        </p>
      </article>
      <div className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/reports">
          Open reports
        </Link>
        {canOperateWorkbench ? (
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13]" href="/fgc-ekm/tasks">
            Open decisions
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function CurriculumCatalogueExplorer({ snapshot }: { snapshot: FgcWorkspaceState }) {
  const [categories, setCategories] = useState<ProgrammeCategoryReference[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeReference[]>([]);
  const [quality, setQuality] = useState<ReferenceDataQualitySnapshot | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CurriculumSearchResult[]>([]);

  useEffect(() => {
    let live = true;
    Promise.all([
      fgcReferenceService.listProgrammeCategories(),
      fgcReferenceService.listProgrammes(),
      fgcReferenceService.getQualitySnapshot()
    ]).then(([nextCategories, nextProgrammes, nextQuality]) => {
      if (!live) return;
      setCategories(nextCategories);
      setProgrammes(nextProgrammes);
      setQuality(nextQuality);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    fgcReferenceService.searchCurriculum(query).then((nextResults) => {
      if (live) setResults(nextResults);
    });
    return () => {
      live = false;
    };
  }, [query]);

  const frameworkCounts = programmes.reduce<Record<string, number>>((counts, programme) => {
    counts[programme.framework] = (counts[programme.framework] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
        <div className="grid gap-5 xl:grid-cols-[0.45fr_0.55fr]">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Administration / TVET Curriculum Catalogue</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">National curriculum first. Campus offerings second.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-paper/64">Lecturers can select from the national curriculum catalogue after choosing their institution. Campus programme intelligence remains a separate verification layer and does not block selection.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Programmes", quality?.nationalProgrammes ?? 0],
              ["Subjects", quality?.subjects ?? 0],
              ["Modules", quality?.modules ?? 0],
              ["Curriculum versions", quality?.curriculumVersions ?? 0],
              ["Qualifications", quality?.qualifications ?? 0],
              ["Trades", quality?.trades ?? 0],
              ["Verified campus offerings", quality?.verifiedCampusOfferings ?? 0],
              ["Pending requests", quality?.pendingReferenceRequests ?? 0]
            ].map(([label, value]) => (
              <div className="rounded-[0.9rem] border border-white/[0.1] bg-ink/48 p-4" key={label as string}>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/42">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-cyan">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Catalogue search</h3>
          <label className="mt-4 flex min-h-12 items-center gap-3 rounded-[0.85rem] border border-white/[0.12] bg-white/[0.075] px-4 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20" htmlFor="curriculumSearch">
            <Search aria-hidden="true" className="text-cyan" size={18} />
            <input
              className="min-h-11 flex-1 bg-transparent text-sm text-paper outline-none placeholder:text-paper/35"
              id="curriculumSearch"
              placeholder="Search programme, subject, code or alias"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
            {results.length > 0 ? results.map((result) => (
              <div className="rounded-[0.82rem] bg-ink/52 p-3 ring-1 ring-white/[0.08]" key={`${result.type}-${result.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan px-2 py-1 text-[0.62rem] font-bold text-ink">{result.type}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-paper/42">{result.framework.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 font-semibold">{result.title}</p>
                <p className="mt-1 text-xs leading-5 text-paper/52">{result.subtitle}</p>
              </div>
            )) : (
              <div className="rounded-[0.82rem] border border-dashed border-white/[0.14] p-4 text-sm leading-6 text-paper/54">
                Search returns grouped programme and subject records from the national catalogue. Missing items should use the reference request workflow, not free-text pollution.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Programme categories</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {categories.map((category) => {
              const count = programmes.filter((programme) => programme.categoryId === category.id).length;
              return (
                <div className="rounded-[0.86rem] bg-ink/48 p-4 ring-1 ring-white/[0.08]" key={category.id}>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">{category.code}</p>
                  <p className="mt-2 font-semibold">{category.name}</p>
                  <p className="mt-2 text-sm text-paper/52">{count} staged programme records</p>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
        <h3 className="text-2xl font-semibold tracking-[-0.04em]">Framework coverage</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(frameworkCounts).map(([framework, count]) => (
            <div className="rounded-[0.86rem] bg-ink/48 p-4 ring-1 ring-white/[0.08]" key={framework}>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-paper/42">{framework.replaceAll("_", " ")}</p>
              <p className="mt-2 text-2xl font-semibold text-lime">{count}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-[0.86rem] border border-amber/20 bg-amber/10 p-4 text-sm font-semibold leading-6 text-amber">
          {quality?.latestOfficialImport}
        </p>
      </article>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Pending reference requests</h3>
          <div className="mt-4 grid gap-3">
            {snapshot.referenceRequests.length ? snapshot.referenceRequests.map((request) => (
              <div className="rounded-[0.86rem] bg-ink/48 p-4 ring-1 ring-white/[0.08]" key={request.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-cyan">{request.id} · {request.requestType}</p>
                  <span className="rounded-full bg-amber px-3 py-1 text-xs font-bold text-ink">{request.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 font-semibold">{request.programmeName || request.subjectOrModuleName}</p>
                <p className="mt-1 text-sm leading-6 text-paper/54">{request.campus} · {request.qualificationType || "Type pending"} · {request.levelLabel || "Level pending"}</p>
              </div>
            )) : (
              <p className="rounded-[0.86rem] border border-dashed border-white/[0.14] p-4 text-sm leading-6 text-paper/54">No pending curriculum reference requests yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-5">
          <h3 className="text-2xl font-semibold tracking-[-0.04em]">Workspace audit trail</h3>
          <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
            {snapshot.auditEvents.length ? snapshot.auditEvents.slice(0, 8).map((event) => (
              <div className="rounded-[0.86rem] bg-ink/48 p-4 ring-1 ring-white/[0.08]" key={event.id}>
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-lime">{event.id} · {event.action}</p>
                <p className="mt-2 text-sm font-semibold">{event.actor}</p>
                <p className="mt-1 text-sm leading-6 text-paper/54">{event.detail}</p>
              </div>
            )) : (
              <p className="rounded-[0.86rem] border border-dashed border-white/[0.14] p-4 text-sm leading-6 text-paper/54">No workspace audit events yet.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function TabPanel({
  tab,
  snapshot,
  onSubmitPackage,
  onActionStatusChange
}: {
  tab: Tab;
  snapshot: FgcWorkspaceState;
  onSubmitPackage: (draft: CaptureDraft, context: CaptureContext) => void;
  onActionStatusChange: (actionId: string, status: CorrectiveAction["status"]) => void;
}) {
  if (tab === "Observatory") return <Observatory snapshot={snapshot} />;

  if (tab === "Evidence Spine") {
    return (
      <div className="grid gap-6">
        <EvidenceInspector evidence={snapshot.evidence} />
        <AppTable headings={["Evidence ID", "Question", "College", "Type", "Status", "Owner"]}>
          {snapshot.evidence.map((item) => (
            <tr className="bg-white/[0.025]" key={item.id}>
              <td className="px-4 py-4 font-mono text-cyan">{item.id}</td>
              <td className="px-4 py-4">{item.question}</td>
              <td className="px-4 py-4">{item.college}</td>
              <td className="px-4 py-4">{item.type}</td>
              <td className="px-4 py-4"><StatusBadge status={item.qualityStatus} /></td>
              <td className="px-4 py-4">{item.owner}</td>
            </tr>
          ))}
        </AppTable>
      </div>
    );
  }

  if (tab === "Triangulation") {
    return (
      <div className="grid gap-6">
        <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
          <h2 className="text-3xl font-semibold tracking-[-0.045em]">Learner-use triangulation workspace</h2>
          <p className="mt-3 max-w-3xl leading-7 text-paper/64">Timetable, attendance and platform analytics are compared here. A planned class remains unverified until actual learner activity is evidenced.</p>
        </article>
        <ComparativeBars records={snapshot.learnerUse} />
        <AppTable headings={["Record", "College", "Programme", "Time", "Context", "Active / Enrolled", "Status", "Issue"]}>
          {snapshot.learnerUse.map((record) => (
            <tr className="bg-white/[0.025]" key={record.id}>
              <td className="px-4 py-4 font-mono text-cyan">{record.id}</td>
              <td className="px-4 py-4">{record.college}</td>
              <td className="px-4 py-4">{record.programme}</td>
              <td className="px-4 py-4">{record.date} · {record.timeBand}</td>
              <td className="px-4 py-4">{record.context}</td>
              <td className="px-4 py-4">{record.activeLearners ?? "-"} / {record.enrolledLearners ?? "-"}</td>
              <td className="px-4 py-4"><StatusBadge status={record.evidenceStatus} /></td>
              <td className="px-4 py-4 text-paper/62">{record.contradiction ?? "No unresolved contradiction recorded."}</td>
            </tr>
          ))}
        </AppTable>
      </div>
    );
  }

  if (tab === "Lecturer Capability") {
    return (
      <div className="grid gap-6">
        <RubricHeatmap assessments={snapshot.assessments} />
        <div className="grid gap-4 xl:grid-cols-2">
          {snapshot.assessments.map((assessment) => <CapabilityCard assessment={assessment} key={assessment.id} />)}
        </div>
      </div>
    );
  }

  if (tab === "Data Capture") {
    return <CapturePortal snapshot={snapshot} onSubmitPackage={onSubmitPackage} />;
  }

  if (tab === "Curriculum Catalogue") {
    return <CurriculumCatalogueExplorer snapshot={snapshot} />;
  }

  if (tab === "Corrective Actions") {
    return (
      <AppTable headings={["Action", "College", "Issue", "Owner", "Priority", "Due", "Status", "Closure Evidence"]}>
        {snapshot.actions.map((action) => (
          <tr className="bg-white/[0.025]" key={action.id}>
            <td className="px-4 py-4 font-mono text-cyan">{action.id}</td>
            <td className="px-4 py-4">{action.college}</td>
            <td className="px-4 py-4">{action.issue}</td>
            <td className="px-4 py-4">{action.owner}</td>
            <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${action.priority === "Critical" ? "bg-rose-300 text-ink" : action.priority === "High" ? "bg-amber text-ink" : "bg-white/[0.1] text-paper"}`}>{action.priority}</span></td>
            <td className="px-4 py-4">{action.dueDate}</td>
            <td className="px-4 py-4">
              <select
                aria-label={`Update status for ${action.id}`}
                className="min-h-10 rounded-[0.72rem] border border-white/[0.12] bg-white/[0.075] px-3 text-sm font-semibold text-paper outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
                value={action.status}
                onChange={(event) => onActionStatusChange(action.id, event.target.value as CorrectiveAction["status"])}
              >
                {["Not Started", "In Progress", "Complete", "Overdue"].map((status) => <option className="bg-ink" key={status}>{status}</option>)}
              </select>
            </td>
            <td className="px-4 py-4 text-paper/62">{action.closureEvidence}</td>
          </tr>
        ))}
      </AppTable>
    );
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.15rem] border border-white/[0.1] bg-white/[0.055] p-6">
        <h2 className="text-3xl font-semibold tracking-[-0.045em]">Report drafting and production decisions</h2>
        <p className="mt-3 max-w-3xl leading-7 text-paper/64">These items must be confirmed before production data, integrations and final reporting workflows are treated as approved.</p>
      </article>
      <AppTable headings={["Decision", "Current default", "Owner", "Status"]}>
        {snapshot.decisions.map((decision) => (
          <tr className="bg-white/[0.025]" key={decision.id}>
            <td className="px-4 py-4 font-semibold">{decision.decision}</td>
            <td className="px-4 py-4 text-paper/64">{decision.currentDefault}</td>
            <td className="px-4 py-4">{decision.productionOwner}</td>
            <td className="px-4 py-4"><span className="rounded-full bg-amber px-3 py-1 text-xs font-bold text-ink">{decision.status}</span></td>
          </tr>
        ))}
      </AppTable>
    </div>
  );
}

export function FgcEkmApp() {
  const router = useRouter();
  const roles = Object.keys(rolePermissions) as UserRole[];
  const [role, setRole] = useState<UserRole>("JEF Administrator");
  const [tab, setTab] = useState<Tab>("Observatory");
  const [snapshot, setSnapshot] = useState<FgcWorkspaceState | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<DemoAuthSession | null>(null);
  const [productionAccess, setProductionAccess] = useState<ResolvedProductionAccess | null>(null);
  const [productionMetrics, setProductionMetrics] = useState<FgcProductionMetricsSummary | null>(null);

  useEffect(() => {
    let live = true;
    let demoSession: DemoAuthSession | null = null;
    const storedSession = localStorage.getItem(fgcDemoSessionKey);
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab === "data-capture") {
      setTab("Data Capture");
    }

    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession) as DemoAuthSession;
        if (!parsed?.role || !rolePermissions[parsed.role]) {
          throw new Error("Invalid FGC demo session");
        }
        demoSession = parsed;
        setSession(parsed);
        setRole(parsed.role);
      } catch {
        localStorage.removeItem(fgcDemoSessionKey);
      }
    }

    fetch("/api/fgc/auth/me", { cache: "no-store" })
      .then((response) => response.json() as Promise<FgcCurrentUserResult>)
      .then((result) => {
        if (!live) return;
        if (result.ok) {
          setProductionAccess(result);
          setRole(productionAccessRole(result.access.accessState));
        }
      })
      .catch(() => {
        if (!live && !demoSession) return;
      })
      .finally(() => {
        if (live) setAuthReady(true);
      });

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (authReady && !session && !productionAccess) router.replace("/fgc-ekm/sign-in");
  }, [authReady, router, session, productionAccess]);

  useEffect(() => {
    if (!authReady || (!session && !productionAccess)) return;
    if (productionAccess) {
      setSnapshot(null);
      return;
    }
    let live = true;
    setSnapshot(null);
    mockFgcServices.getSnapshot(role).then((nextSnapshot) => {
      if (!live) return;
      let stored: Partial<FgcWorkspaceState> | null = null;
      try {
        stored = JSON.parse(localStorage.getItem(fgcWorkspaceStorageKey) ?? "null") as Partial<FgcWorkspaceState> | null;
      } catch {
        localStorage.removeItem(fgcWorkspaceStorageKey);
      }
      setSnapshot(hydrateWorkspace(nextSnapshot, stored));
    });
    return () => {
      live = false;
    };
  }, [authReady, role, session, productionAccess]);

  const permissions = useMemo(() => snapshot?.permissions ?? rolePermissions[role], [role, snapshot]);
  const canPreviewRoles = Boolean(session?.isMaster && !productionAccess);
  const signedInName = productionAccess?.user.name ?? session?.name ?? role;
  const signedInEmail = productionAccess?.user.email ?? session?.email ?? "Production user";
  const signedInRole = productionAccess?.access.activeRole?.name ?? session?.role ?? role;
  const actorName = productionAccess?.user.name ?? session?.name ?? role;

  useEffect(() => {
    if (!productionAccess && snapshot) localStorage.setItem(fgcWorkspaceStorageKey, JSON.stringify(snapshot));
  }, [productionAccess, snapshot]);

  useEffect(() => {
    if (!productionAccess?.access.canOpenProtectedWorkspace) {
      setProductionMetrics(null);
      return;
    }

    let live = true;
    fetch("/api/fgc/metrics/summary", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { ok?: boolean; summary?: FgcProductionMetricsSummary } | null) => {
        if (live && payload?.ok && payload.summary) setProductionMetrics(payload.summary);
      })
      .catch(() => {
        if (live) setProductionMetrics(null);
      });

    return () => {
      live = false;
    };
  }, [productionAccess]);

  const handleSignOut = async () => {
    if (productionAccess) {
      await fetch("/api/fgc/auth/logout", { method: "POST" }).catch(() => undefined);
    }
    localStorage.removeItem(fgcDemoSessionKey);
    setSession(null);
    setProductionAccess(null);
    setProductionMetrics(null);
    router.push("/fgc-ekm/sign-in");
  };

  const handleSubmitPackage = (draft: CaptureDraft, context: CaptureContext) => {
    if (productionAccess) return;
    setSnapshot((current) => current ? createCaptureSubmission(current, draft, context, actorName) : current);
    setTab("Observatory");
  };

  const handleActionStatusChange = (actionId: string, status: CorrectiveAction["status"]) => {
    if (productionAccess) return;
    setSnapshot((current) => current ? updateActionStatus(current, actionId, status, actorName) : current);
  };

  const handleResetWorkspace = async () => {
    if (productionAccess) return;
    localStorage.removeItem(fgcWorkspaceStorageKey);
    localStorage.removeItem(fgcCaptureDraftStorageKey);
    const base = await mockFgcServices.getSnapshot(role);
    setSnapshot(hydrateWorkspace(base));
  };

  const handleExportWorkspace = () => {
    if (productionAccess) return;
    if (!snapshot) return;
    const blob = new Blob([exportWorkspace(snapshot)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fgc-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061018] px-4 pt-24 text-paper">
        <div className="rounded-[1.15rem] border border-white/[0.12] bg-white/[0.055] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <LockKeyhole aria-hidden="true" className="mx-auto text-cyan" size={30} />
          <p className="mt-4 font-semibold">Checking your FGC access...</p>
          <p className="mt-2 text-sm text-paper/56">The evidence workspace opens only after sign-in.</p>
        </div>
      </main>
    );
  }

  if (!session && !productionAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061018] px-4 pt-24 text-paper">
        <div className="max-w-md rounded-[1.15rem] border border-white/[0.12] bg-white/[0.055] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <LockKeyhole aria-hidden="true" className="mx-auto text-cyan" size={30} />
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Sign in required</h1>
          <p className="mt-3 text-sm leading-6 text-paper/62">FGC App is a protected role workspace. Sign in with an approved role before viewing evidence dashboards.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/sign-in">
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  if (productionAccess && !productionAccess.access.canOpenProtectedWorkspace) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061018] px-4 pt-24 text-paper">
        <div className="max-w-lg rounded-[1.15rem] border border-amber/25 bg-amber/10 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <LockKeyhole aria-hidden="true" className="mx-auto text-amber" size={30} />
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Access pending</h1>
          <p className="mt-3 text-sm leading-6 text-paper/68">
            Your production identity is signed in, but the governed FGC workspace opens only after affiliation and role approval.
          </p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href={productionAccess.access.expectedPortal}>
            View access status
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#061018] pt-28 text-paper">
      <section className="px-4 pb-8 md:px-6">
        <div className="mx-auto max-w-[1540px] rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-3 shadow-[0_30px_120px_rgba(0,0,0,0.36)]">
          <div className="fgc-ekm-workspace-grid grid min-w-0 gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="min-w-0 rounded-[1.05rem] bg-ink/78 p-4 ring-1 ring-white/[0.1]">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <span className="grid size-11 place-items-center rounded-[0.9rem] bg-cyan text-ink"><ShieldCheck size={22} /></span>
                <div>
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-paper/48">Secure workspace</p>
                  <h1 className="text-xl font-semibold tracking-[-0.04em]">FGC for EKM</h1>
                </div>
              </div>

              <label className="mt-5 block text-sm font-semibold text-paper/72" htmlFor="role">Role view</label>
              <select
                className="mt-2 w-full rounded-[0.85rem] border border-white/[0.12] bg-white/[0.08] px-3 py-3 text-sm text-paper outline-none transition focus:border-cyan disabled:cursor-not-allowed disabled:opacity-60"
                id="role"
                value={role}
                disabled={!canPreviewRoles}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                {roles.map((item) => <option className="bg-ink text-paper" key={item}>{item}</option>)}
              </select>
              <p className="mt-2 text-xs leading-5 text-paper/44">
                {canPreviewRoles ? "Master demo access can preview scoped role views." : "Your approved role controls this workspace view."}
              </p>

              <div className="mt-5 rounded-[0.95rem] bg-cyan p-4 text-ink">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em]">Signed in</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{signedInName}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-ink/72">{signedInEmail}</p>
                <p className="mt-3 rounded-[0.75rem] bg-ink/10 p-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/78">{signedInRole}</p>
                <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-4 text-sm font-bold text-paper transition hover:bg-surface" type="button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>

              <nav aria-label="FGC app sections" className="mt-6 grid gap-2">
                {tabs.map((item) => {
                  const Icon = iconMap[item];
                  const active = tab === item;
                  return (
                    <button
                      className={`flex min-h-11 items-center gap-3 rounded-[0.86rem] px-3 text-left text-sm font-semibold transition duration-500 ${
                        active ? "bg-paper text-ink" : "bg-white/[0.055] text-paper/66 hover:bg-white/[0.1] hover:text-paper"
                      }`}
                      key={item}
                      type="button"
                      onClick={() => setTab(item)}
                    >
                      <Icon size={17} />
                      {item}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-[0.95rem] bg-white/[0.06] p-4 ring-1 ring-white/[0.1]">
                <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan"><LockKeyhole size={14} /> Permissions</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-paper/62">
                  {permissions.slice(0, 3).map((permission) => <li key={permission}>- {permission}</li>)}
                </ul>
              </div>
            </aside>

            <div className="min-w-0 rounded-[1.05rem] bg-[#071522] p-4 ring-1 ring-white/[0.1] md:p-6">
              <header className="grid min-w-0 gap-5 border-b border-white/10 pb-6 2xl:grid-cols-[minmax(0,1fr)_minmax(18rem,auto)] 2xl:items-end">
                <div className="min-w-0">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-lime">Evidence Validation & Adoption Intelligence Platform</p>
                  <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.35rem,4.4vw,5.3rem)] font-semibold leading-[0.88] tracking-[-0.062em]">{fgcProduct.name}</h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-paper/62">
                    {productionAccess
                      ? "Production metric layer · governed PostgreSQL records only"
                      : `${snapshot?.scope.reportingPeriod ?? "Loading demo scope"} · ${snapshot?.scope.collegeScope ?? "Preparing records"}`}
                  </p>
                </div>
                <div className="grid min-w-0 gap-3 2xl:min-w-72">
                  <label className="sr-only" htmlFor="evidence-search">Search evidence</label>
                  <div className="flex items-center gap-3 rounded-full bg-white/[0.08] px-4 py-3 ring-1 ring-white/[0.1]">
                    <Search size={17} className="text-cyan" />
                    <input id="evidence-search" className="w-full bg-transparent text-sm outline-none placeholder:text-paper/38" placeholder={productionAccess ? "Search available production evidence" : "Search demo evidence, actions, rubrics"} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink"><CheckCircle2 size={14} /> {productionAccess ? "Production session online" : "Workspace service online"}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-paper/72 ring-1 ring-white/[0.1]"><UserCog size={14} /> {role}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="min-h-10 rounded-full bg-cyan px-4 text-xs font-bold text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={Boolean(productionAccess)} onClick={handleExportWorkspace}>
                      {productionAccess ? "Server exports required" : "Export JSON"}
                    </button>
                    <button className="min-h-10 rounded-full bg-white/[0.08] px-4 text-xs font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={Boolean(productionAccess)} onClick={handleResetWorkspace}>
                      {productionAccess ? "No local reset" : "Reset workspace"}
                    </button>
                  </div>
                </div>
              </header>

              <div className="mt-6 grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {Object.entries(evidenceStatuses).map(([status, meta]) => (
                  <div className="min-w-0 rounded-[0.95rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={status}>
                    <StatusBadge status={status as EvidenceStatus} />
                    <p className="mt-3 text-xs leading-5 text-paper/56">{meta.explanation}</p>
                  </div>
                ))}
              </div>

              {productionMetrics ? (
                <section className="mt-6 rounded-[1.05rem] border border-cyan/18 bg-cyan/[0.045] p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-cyan">Production metric layer</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Shared governed platform status</h3>
                    </div>
                    <p className="text-xs font-semibold text-paper/50">
                      Audit events: {productionMetrics.audit.totalEvents}
                    </p>
                  </div>
                  <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                    {productionMetrics.metrics.slice(0, 4).map((metric) => (
                      <article className="min-w-0 rounded-[0.9rem] bg-ink/54 p-4 ring-1 ring-white/[0.08]" key={metric.id}>
                        <p className="font-mono text-[0.66rem] uppercase tracking-[0.15em] text-paper/48">{metric.label}</p>
                        <p className={`mt-3 text-3xl font-semibold tracking-[-0.05em] ${productionMetricToneClass(metric.tone)}`}>{metric.value}</p>
                        <p className="mt-2 text-xs leading-5 text-paper/56">{metric.note}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="mt-6">
                {productionAccess ? (
                  <ProductionTabPanel access={productionAccess} metrics={productionMetrics} tab={tab} />
                ) : snapshot ? (
                  <TabPanel
                    snapshot={snapshot}
                    tab={tab}
                    onActionStatusChange={handleActionStatusChange}
                    onSubmitPackage={handleSubmitPackage}
                  />
                ) : (
                  <div className="grid min-h-80 place-items-center rounded-[1.15rem] bg-white/[0.045]">
                    <p className="flex items-center gap-3 text-paper/68"><BarChart3 className="animate-pulse text-cyan" /> Loading evidence workspace...</p>
                  </div>
                )}
              </div>

              <footer className="mt-8 rounded-[1rem] bg-amber p-4 text-sm font-semibold leading-6 text-ink">
                {productionAccess ? "Production access notice: this dashboard now refuses synthetic evidence. Empty panels mean source imports, submissions, reviews or report snapshots have not been created yet." : "Demo notice: records are synthetic and included to exercise the workflow. The source-of-truth rules come from the supplied agenda, tracker workbook, validation toolkit and facilitator guide."}
              </footer>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
