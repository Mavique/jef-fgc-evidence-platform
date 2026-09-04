"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  FileWarning,
  Database,
  KeyRound,
  LockKeyhole,
  MailQuestion,
  Printer,
  Route,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  UploadCloud,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  fgcRouteDefinitions,
  type FgcRouteDefinition
} from "@/content/merseta-fgc";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import { evaluateFgcLecturerDraft, fieldKey } from "@/lib/fgc/lecturer-form";
import type { FgcLecturerDraftValues } from "@/lib/fgc/lecturer-form";
import type { LecturerFormState } from "@/lib/fgc/lecturer-submissions";
import type { FgcRoleWorkbench, FgcSubmissionDetail, FgcWorkbenchSubmission } from "@/lib/fgc/workbench";
import { FgcEkmApp } from "@/components/merseta-fgc/FgcEkmApp";

const requestedRoles = [
  { code: "LECTURER", label: "Lecturer" },
  { code: "COLLEGE_EVIDENCE_OWNER", label: "College Evidence Owner" },
  { code: "JEF_ADMINISTRATOR", label: "JEF Administrator" },
  { code: "MERSETA_OVERSIGHT", label: "merSETA Oversight" }
];

type ProductionHealth = {
  ok: boolean;
  productionConfigured: boolean;
  databaseReachable: boolean;
  missingConfig: string[];
  message?: string;
};

type CollegeOption = {
  id: string;
  official_name: string;
  short_name: string | null;
  acronym: string | null;
  province_name: string | null;
};

type CampusOption = {
  id: string;
  official_name: string;
  site_type: string;
  verification_status: string;
};

type ProductionAccessResult = FgcCurrentUserResult | null;
type ResolvedProductionAccess = Extract<FgcCurrentUserResult, { ok: true }>;
type AdminApplicant = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  accountState: string;
  emailVerified: boolean;
  verifiedAt: string | null;
  registrationDate: string;
  selectedOrganisation: string;
  tvetCollege: string | null;
  campus: string | null;
  roles: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    approvedAt: string | null;
    collegeId: string | null;
    collegeName: string | null;
    campusId: string | null;
    campusName: string | null;
  }>;
  formAssignments: Array<{ id: string; templateName: string; status: string; createdAt: string }>;
};

function routeTitle(routePath: string, routeDefinitions: FgcRouteDefinition[]) {
  if (routePath.startsWith("/fgc-ekm/invitation/")) return "Invitation acceptance";
  if (routePath === "/fgc-ekm/admin") return "JEF Administration Workspace";
  return routeDefinitions.find((route) => route.route === routePath)?.title ?? "FGC access workspace";
}

function routeGroup(routePath: string, routeDefinitions: FgcRouteDefinition[]) {
  if (routePath.startsWith("/fgc-ekm/invitation/")) return "Public";
  if (routePath === "/fgc-ekm/admin") return "Administration";
  return routeDefinitions.find((route) => route.route === routePath)?.group ?? "Secure common";
}

function AccessShell({
  routePath,
  title,
  eyebrow,
  children,
  signedInWorkspaceHref
}: {
  routePath: string;
  title: string;
  eyebrow: string;
  children: ReactNode;
  signedInWorkspaceHref?: string | null;
}) {
  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#061018] px-4 pb-16 pt-28 text-paper md:px-6">
      <section className="mx-auto grid min-w-0 max-w-[1440px] gap-4 lg:grid-cols-[minmax(280px,330px)_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-[1.25rem] border border-white/[0.12] bg-white/[0.055] p-5 shadow-[0_28px_110px_rgba(0,0,0,0.34)]">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-cyan ring-1 ring-white/[0.12]" href="/programmes/merseta-fgc-ekm">
            <ArrowRight aria-hidden="true" className="rotate-180" size={16} />
            Gateway
          </Link>
          <div className="mt-8">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-lime">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[0.94] tracking-[-0.055em]">merSETA FGC for EKM</h1>
            <p className="mt-4 text-sm leading-6 text-paper/60">Evidence Validation & Adoption Intelligence Platform</p>
          </div>
          <div className="mt-8 grid gap-3">
            {[
              ["Identity created", "Registration exists, but no protected access yet."],
              ["Email verified", "Confirms address control only."],
              ["Affiliation approved", "Confirms institution and campus relationship."],
              ["Role activated", "Only this grants scoped data access."]
            ].map(([label, note], index) => (
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-[0.95rem] bg-ink/58 p-4 ring-1 ring-white/[0.08]" key={label}>
                <span className="grid size-8 place-items-center rounded-full bg-cyan/12 font-mono text-xs font-bold text-cyan">{index + 1}</span>
                <div className="min-w-0">
                  <p className="min-w-0 [overflow-wrap:anywhere] font-semibold">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-paper/48">{note}</p>
                </div>
              </div>
            ))}
          </div>
          <ProductionReadinessCard compact />
        </aside>

        <section className="min-w-0 rounded-[1.25rem] border border-white/[0.12] bg-[#071522] p-5 shadow-[0_28px_110px_rgba(0,0,0,0.28)] md:p-7">
          <header className="flex flex-col gap-5 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="min-w-0 [overflow-wrap:anywhere] font-mono text-[0.72rem] uppercase tracking-[0.18em] text-cyan">{routePath}</p>
              <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.25rem,4.2vw,5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">{title}</h2>
            </div>
            {signedInWorkspaceHref ? (
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex min-h-11 items-center rounded-full bg-cyan px-4 text-sm font-bold text-ink" href={signedInWorkspaceHref}>My workspace</Link>
                <Link className="inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12]" href="/fgc-ekm/my-account">My account</Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12]" href="/fgc-ekm/sign-in">Sign in</Link>
                <Link className="inline-flex min-h-11 items-center rounded-full bg-cyan px-4 text-sm font-bold text-ink" href="/fgc-ekm/sign-up">Create account</Link>
              </div>
            )}
          </header>
          <div className="mt-6 min-w-0">{children}</div>
        </section>
      </section>
    </main>
  );
}

function ProductionReadinessCard({ compact = false }: { compact?: boolean }) {
  const [health, setHealth] = useState<ProductionHealth | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/fgc/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: ProductionHealth) => {
        if (live) setHealth(payload);
      })
      .catch((nextError: Error) => {
        if (live) setError(nextError.message);
      });

    return () => {
      live = false;
    };
  }, []);

  const ready = Boolean(health?.productionConfigured && health.databaseReachable);
  const checking = !health && !error;
  const tone = checking ? "border-cyan/20 bg-cyan/10 text-cyan" : ready ? "border-lime/25 bg-lime/10 text-lime" : "border-amber/20 bg-amber/10 text-amber";

  return (
    <article className={`${compact ? "mt-8" : ""} rounded-[0.95rem] border ${tone} p-4`}>
      <div className="flex items-start gap-3">
        <Database aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">{checking ? "Checking production backend" : ready ? "Production backend online" : "Production backend not ready"}</p>
          <p className="mt-2 text-sm font-semibold leading-6">
            {checking ? "Checking database, session and integration configuration..." : error || health?.message || (ready ? "Database, session and integration configuration are available." : "The UI is now wired to production APIs, but required environment variables are missing.")}
          </p>
          {health?.missingConfig?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {health.missingConfig.map((item) => (
                <span className="rounded-full bg-ink/46 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-paper/76" key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Field({
  id,
  label,
  children,
  helper
}: {
  id: string;
  label: string;
  children: ReactNode;
  helper?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-paper/76" htmlFor={id}>
      {label}
      {children}
      {helper ? <span className="text-xs font-normal leading-5 text-paper/46">{helper}</span> : null}
    </label>
  );
}

const controlClass = "min-h-12 w-full rounded-[0.85rem] border border-white/[0.12] bg-white/[0.075] px-4 text-base text-paper outline-none transition placeholder:text-paper/35 focus:border-cyan focus:ring-2 focus:ring-cyan/20";

function RegistrationStepper() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [serverState, setServerState] = useState<"idle" | "success" | "blocked" | "error">("idle");
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [referenceMessage, setReferenceMessage] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/fgc/reference/colleges", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { ok: boolean; colleges?: CollegeOption[]; message?: string }) => {
        if (!live) return;
        if (payload.ok && payload.colleges?.length) {
          setColleges(payload.colleges);
          setSelectedCollegeId(payload.colleges[0].id);
        } else {
          setReferenceMessage(payload.message ?? "The TVET college reference directory is not available.");
        }
      })
      .catch((error: Error) => {
        if (live) setReferenceMessage(error.message);
      });

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) return;
    let live = true;
    setCampuses([]);
    fetch(`/api/fgc/reference/colleges/${selectedCollegeId}/campuses`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { ok: boolean; campuses?: CampusOption[]; message?: string }) => {
        if (!live) return;
        if (payload.ok) {
          setCampuses(payload.campuses ?? []);
          setReferenceMessage("");
        } else {
          setReferenceMessage(payload.message ?? "Campus options are not available for the selected college.");
        }
      })
      .catch((error: Error) => {
        if (live) setReferenceMessage(error.message);
      });

    return () => {
      live = false;
    };
  }, [selectedCollegeId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    setServerMessage("");
    setServerState("idle");
    const form = new FormData(event.currentTarget);
    const requestedRole = String(form.get("requestedRole") ?? "LECTURER");
    const email = String(form.get("workEmail") ?? "");

    const payload = {
      email,
      password: String(form.get("password") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      surname: String(form.get("surname") ?? ""),
      mobileNumber: String(form.get("mobile") ?? ""),
      jobTitle: String(form.get("jobTitle") ?? "Lecturer"),
      employeeIdentifier: String(form.get("employeeIdentifier") ?? ""),
      roleCode: requestedRole,
      tvetCollegeId: String(form.get("college") ?? ""),
      campusId: String(form.get("campus") || "") || undefined
    };

    try {
      const response = await fetch("/api/fgc/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setServerState("success");
        setServerMessage(result.message ?? "Registration created. Check email verification.");
        window.setTimeout(() => router.push("/fgc-ekm/verification-pending"), 900);
        return;
      }

      setServerState(response.status === 503 ? "blocked" : "error");
      setServerMessage(result.message ?? "Registration could not be completed.");
    } catch (error) {
      setServerState("error");
      setServerMessage(error instanceof Error ? error.message : "Registration request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Before protected access</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Request access without pretending approval has happened.</h3>
        <p className="mt-4 leading-7 text-paper/62">
          This version now calls the production registration API. If PostgreSQL or email is not configured, the form displays that blocker instead of pretending the account was created.
        </p>
        <div className="mt-6">
          <ProductionReadinessCard />
        </div>
        <div className="mt-6 grid gap-3">
          {["Identity", "Organisation", "Role request", "Security and consent"].map((step, index) => (
            <div className="flex items-center gap-3 rounded-[0.9rem] bg-ink/52 p-4" key={step}>
              <span className="grid size-9 place-items-center rounded-full bg-cyan text-sm font-bold text-ink">{index + 1}</span>
              <span className="font-semibold">{step}</span>
            </div>
          ))}
        </div>
      </article>
      <form className="grid gap-5 rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="firstName" label="First name"><input className={controlClass} id="firstName" name="firstName" autoComplete="given-name" required /></Field>
          <Field id="surname" label="Surname"><input className={controlClass} id="surname" name="surname" autoComplete="family-name" required /></Field>
          <Field id="workEmail" label="Work email" helper="Email confirmation does not approve the role."><input className={controlClass} id="workEmail" name="workEmail" type="email" autoComplete="email" required /></Field>
          <Field id="mobile" label="Mobile number" helper="Optional until support or MFA policy is approved."><input className={controlClass} id="mobile" name="mobile" type="tel" autoComplete="tel" /></Field>
          <Field id="jobTitle" label="Job title"><input className={controlClass} id="jobTitle" name="jobTitle" placeholder="Lecturer / Evidence Lead" required /></Field>
          <Field id="employeeIdentifier" label="Employee identifier"><input className={controlClass} id="employeeIdentifier" name="employeeIdentifier" placeholder="Staff number if available" /></Field>
          <Field id="organisationType" label="Organisation type">
            <select className={controlClass} id="organisationType" name="organisationType">
              <option className="bg-ink">TVET College</option>
              <option className="bg-ink">merSETA</option>
              <option className="bg-ink">Jengrac Education Foundation</option>
            </select>
          </Field>
          <Field id="college" label="Approved organisation">
            <select className={controlClass} id="college" name="college" value={selectedCollegeId} onChange={(event) => setSelectedCollegeId(event.target.value)} required>
              {colleges.map((college) => (
                <option className="bg-ink" key={college.id} value={college.id}>
                  {college.official_name}{college.province_name ? ` - ${college.province_name}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field id="campus" label="Campus / scope" helper="If your campus is missing, submit the account request without a campus and use the missing-campus workflow.">
            <select className={controlClass} id="campus" name="campus">
              <option className="bg-ink" value="">Request or approve campus later</option>
              {campuses.map((campus) => (
                <option className="bg-ink" key={campus.id} value={campus.id}>
                  {campus.official_name} - {campus.verification_status}
                </option>
              ))}
            </select>
          </Field>
          <Field id="requestedRole" label="Requested role">
            <select className={controlClass} id="requestedRole" name="requestedRole">
              {requestedRoles.map((role) => <option className="bg-ink" key={role.code} value={role.code}>{role.label}</option>)}
            </select>
          </Field>
        </div>
        {referenceMessage ? (
          <p className="rounded-[0.95rem] border border-amber/25 bg-amber/10 p-4 text-sm font-semibold leading-6 text-amber" role="status">{referenceMessage}</p>
        ) : null}
        <Field id="password" label="Password" helper="Prototype field. Production password handling belongs to the approved identity provider.">
          <input className={controlClass} id="password" name="password" type="password" autoComplete="new-password" required />
        </Field>
        <label className="flex gap-3 rounded-[0.95rem] bg-ink/52 p-4 text-sm leading-6 text-paper/68">
          <input className="mt-1 size-4" type="checkbox" required />
          I accept the privacy notice and understand that role access requires email confirmation, affiliation approval and explicit role activation.
        </label>
        {serverMessage ? (
          <p className={`rounded-[0.95rem] border p-4 text-sm font-semibold leading-6 ${
            serverState === "success" ? "border-lime/25 bg-lime/10 text-lime" : serverState === "blocked" ? "border-amber/25 bg-amber/10 text-amber" : "border-rose-300/30 bg-rose-300/10 text-rose-100"
          }`} role={serverState === "success" ? "status" : "alert"}>
            {serverMessage}
          </p>
        ) : null}
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-bold text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-55" type="submit" disabled={submitting || submitted}>
          {submitting ? "Checking backend..." : submitted ? "Registration submitted" : "Create account request"}
          <ArrowRight aria-hidden="true" size={17} />
        </button>
      </form>
    </div>
  );
}

function SignInPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setServerMessage("");

    try {
      const response = await fetch("/api/fgc/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();

      if (response.ok) {
        const sessionResponse = await fetch("/api/fgc/auth/me", { cache: "no-store" });
        const sessionResult = await sessionResponse.json().catch(() => null) as ProductionAccessResult;
        if (!sessionResponse.ok || !sessionResult?.ok) {
          setServerMessage("Credentials were accepted, but the protected session could not be resolved. Check cookie origin and session configuration.");
          return;
        }
        router.push(sessionResult.access.expectedPortal || "/fgc-ekm/home");
        return;
      }

      if (response.status !== 503) {
        setError(result.message ?? "Production sign-in was not accepted.");
        return;
      }

      setServerMessage("Production sign-in is wired, but the backend is not configured yet. Ask a JEF platform administrator to complete backend configuration before using protected workspaces.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Production sign-in request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <article className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <LockKeyhole aria-hidden="true" className="text-cyan" size={28} />
        <h3 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Sign in to a scoped evidence workspace.</h3>
        <p className="mt-4 leading-7 text-paper/62">
          Access is resolved through production authentication, approved affiliation scope and explicit role activation. Prototype credential shortcuts are not exposed in the product interface.
        </p>
        <div className="mt-6">
          <ProductionReadinessCard />
        </div>
      </article>
      <form className="min-w-0 content-start rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]" onSubmit={handleSubmit}>
        <div className="grid gap-5">
        <Field id="email" label="Email">
          <input className={controlClass} id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field id="currentPassword" label="Password">
          <input className={controlClass} id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </Field>
        {serverMessage ? <p className="rounded-[0.95rem] border border-amber/25 bg-amber/10 p-4 text-sm font-semibold leading-6 text-amber" role="status">{serverMessage}</p> : null}
        {error ? <p className="rounded-[0.95rem] border border-rose-300/30 bg-rose-300/10 p-4 text-sm font-semibold leading-6 text-rose-100" role="alert">{error}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="text-sm font-bold text-cyan underline-offset-4 hover:underline" href="/fgc-ekm/forgot-password">Forgot password?</Link>
          <Link className="text-sm font-bold text-paper/68 underline-offset-4 hover:text-paper hover:underline" href="/fgc-ekm/sign-up">Create account</Link>
        </div>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan px-6 text-sm font-bold text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-55" type="submit" disabled={submitting}>
          {submitting ? "Checking production auth..." : "Continue securely"}
          <KeyRound aria-hidden="true" size={17} />
        </button>
        </div>
      </form>
    </div>
  );
}

function ProtectedAccessPrompt() {
  return (
    <article className="rounded-[1.1rem] border border-cyan/20 bg-cyan/10 p-6">
      <LockKeyhole aria-hidden="true" className="text-cyan" size={28} />
      <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Sign in before opening this FGC workspace.</h3>
      <p className="mt-4 max-w-2xl leading-7 text-paper/64">
        This route contains protected evidence workflow functionality. Use an approved role account before dashboard, data capture or administration views are shown.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/sign-in">
          Sign in
        </Link>
        <Link className="inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12]" href="/fgc-ekm/sign-up">
          Create account
        </Link>
      </div>
    </article>
  );
}

function ProductionAccessTimeline({ access }: { access: ResolvedProductionAccess }) {
  const hasApprovedRole = access.roles.some((role) => role.status === "APPROVED");
  const stages = [
    ["Session resolved", true],
    ["Email verified", access.user.emailVerified],
    ["Affiliation state", access.user.accountState === "ACTIVE" || access.user.accountState === "AFFILIATION_APPROVED"],
    ["Role active", hasApprovedRole]
  ] as const;

  return (
    <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production access chain</p>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {stages.map(([stage, complete], index) => (
          <div className={`rounded-[0.95rem] p-4 ring-1 ${complete ? "bg-lime/12 text-lime ring-lime/20" : "bg-amber/10 text-amber ring-amber/20"}`} key={stage}>
            {complete ? <CheckCircle2 aria-hidden="true" size={19} /> : <Clock3 aria-hidden="true" size={19} />}
            <p className="mt-3 font-semibold">{stage}</p>
            <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] opacity-70">Step {index + 1}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ProductionPendingAccess({ access }: { access: ResolvedProductionAccess }) {
  return (
    <div className="grid gap-6">
      <ProductionAccessTimeline access={access} />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.1rem] bg-amber/10 p-6 text-amber ring-1 ring-amber/20">
          <FileWarning aria-hidden="true" size={28} />
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">You are signed in. Access is still pending.</h3>
          <p className="mt-4 leading-7">
            The server resolved {access.user.name}&apos;s production session, so this workspace no longer sends the user back to sign-in.
            The remaining blocker is <b>{access.access.accessState.replaceAll("_", " ").toLowerCase()}</b>.
          </p>
        </article>
        <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Requested scope</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{access.user.name}</h3>
          <p className="mt-2 text-sm leading-6 text-paper/56">{access.user.email}</p>
          <div className="mt-5 grid gap-3">
            {access.roles.map((role) => (
              <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={role.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold">{role.name}</p>
                  <span className="rounded-full bg-amber/14 px-3 py-1 text-xs font-bold text-amber ring-1 ring-amber/20">{role.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-paper/58">{role.collegeName ?? role.organisationName ?? "Scope pending"}{role.campusName ? ` - ${role.campusName}` : ""}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function productionWorkspaces(access: ResolvedProductionAccess) {
  const state = access.access.accessState;
  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");
  const workspaces: Array<[string, string, string]> = [];
  const addWorkspace = (workspace: [string, string, string]) => {
    if (!workspaces.some((item) => item[1] === workspace[1])) workspaces.push(workspace);
  };

  if (hasApprovedLecturerRole) {
    addWorkspace(["Data-Capture Workspace", "/fgc-ekm/data-capturer", "Open the assigned lecturer FGC form, continue draft evidence capture and view locked review snapshots."]);
    addWorkspace(["My Lecturer Dashboard", "/fgc-ekm/my-dashboard", "Review personal submissions, feedback, moderation status and outstanding evidence actions."]);
  }

  if (state === "PLATFORM_SUPER_ACTIVE") {
    addWorkspace(["System Governance", "/fgc-ekm/admin/system", "Monitor platform-wide workflow, reports, audit events and production evidence health."]);
    addWorkspace(["User and Access Management", "/fgc-ekm/admin/users-roles", "Approve affiliations, correct scope, decide roles and review production access status."]);
    addWorkspace(["FGC Intelligence Dashboard", "/fgc-ekm", "Open the observatory, evidence spine, triangulation, capability and reporting workspace."]);
    addWorkspace(["Audit Log", "/fgc-ekm/admin/audit-log", "Review governed production actions and decision history."]);
    return workspaces;
  }
  if (state === "JEF_ADMIN_ACTIVE") {
    addWorkspace(["User and Access Management", "/fgc-ekm/admin/users-roles", "Approve affiliations, correct scope, decide roles and review production access status."]);
    addWorkspace(["Production Work Queue", "/fgc-ekm/tasks", "Act on submissions, clarification requests, reports and moderation-ready records."]);
    addWorkspace(["FGC Intelligence Dashboard", "/fgc-ekm", "Open the observatory, evidence spine, triangulation, capability and reporting workspace."]);
    addWorkspace(["Audit Log", "/fgc-ekm/admin/audit-log", "Review governed production actions and access-management decision history."]);
    return workspaces;
  }
  if (state === "COLLEGE_ACTIVE") {
    addWorkspace(["College Evidence Workspace", "/fgc-ekm/college/overview", "Review lecturer submissions scoped to your authorised college and campus."]);
    addWorkspace(["Evidence Work Queue", "/fgc-ekm/tasks", "Enrich institutional context, request clarifications and send complete records onward."]);
    addWorkspace(["FGC Intelligence Dashboard", "/fgc-ekm", "View scoped evidence trends and data-quality signals."]);
    addWorkspace(["Account Settings", "/fgc-ekm/my-account", "Check your active college/campus scope and pending role decisions."]);
    return workspaces;
  }
  if (state === "ASSESSOR_ACTIVE") {
    addWorkspace(["Assessment Workbench", "/fgc-ekm/assessments/challenges", "Review submitted lecturer evidence and send decisions to moderation."]);
    addWorkspace(["Evidence Work Queue", "/fgc-ekm/tasks", "Track submitted, contradicted and clarification-required evidence packs."]);
    addWorkspace(["Notifications", "/fgc-ekm/notifications", "Review in-app workflow messages and decision outcomes."]);
    addWorkspace(["Account Settings", "/fgc-ekm/my-account", "Check your assessor role and authorised scope."]);
    return workspaces;
  }
  if (state === "MODERATOR_ACTIVE") {
    addWorkspace(["Moderation Workbench", "/fgc-ekm/moderation", "Quality-assure assessor decisions and finalise moderated outcomes."]);
    addWorkspace(["Evidence Work Queue", "/fgc-ekm/tasks", "Monitor pending moderation, reassessment and clarification records."]);
    addWorkspace(["Reports", "/fgc-ekm/reports", "Generate governed moderation snapshots from current production evidence."]);
    addWorkspace(["Account Settings", "/fgc-ekm/my-account", "Check your moderator role and authorised scope."]);
    return workspaces;
  }
  if (state === "MERSETA_ACTIVE") {
    addWorkspace(["National Observatory", "/fgc-ekm/national/observatory", "View authorised national evidence status, limitations and trends."]);
    addWorkspace(["Reports", "/fgc-ekm/reports", "Generate read-only oversight snapshots from governed production records."]);
    addWorkspace(["Notifications", "/fgc-ekm/notifications", "Review report and workflow notifications for your account."]);
    addWorkspace(["Account Settings", "/fgc-ekm/my-account", "Check your oversight role and production access scope."]);
    return workspaces;
  }
  addWorkspace(["FGC Intelligence Dashboard", "/fgc-ekm", "Open the restored observatory, evidence spine, triangulation, capability and reporting workspace."]);
  addWorkspace(["Account Settings", "/fgc-ekm/my-account", "Check the canonical identity, college scope and active production role assignments."]);
  return workspaces;
}

function ProductionPortalHome({ access }: { access: ResolvedProductionAccess }) {
  const workspaces = productionWorkspaces(access);
  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");

  return (
    <div className="grid gap-6">
      <ProductionAccessTimeline access={access} />
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{access.access.accessState.replaceAll("_", " ")}</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Welcome, {access.user.firstName}.</h3>
            <p className="mt-3 leading-7 text-paper/62">
              Your production session is active. This portal is resolved from the database session cookie, not the local prototype profile.
            </p>
          </div>
          <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
            <p className="text-sm font-semibold text-paper">{access.user.email}</p>
            <p className="mt-2 text-sm leading-6 text-paper/56">Account state: <b>{access.user.accountState}</b></p>
            <p className="mt-1 text-sm leading-6 text-paper/56">Default workspace: <b>{access.access.expectedPortal}</b></p>
          </div>
        </div>
      </article>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production form assignment</p>
          <div className="mt-4 grid gap-3">
            {access.formAssignments.length ? access.formAssignments.map((assignment) => (
              <div className="rounded-[0.9rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={assignment.id}>
                <p className="font-semibold">{assignment.templateName}</p>
                <p className="mt-1 text-sm text-paper/56">{assignment.status}{assignment.dueAt ? ` - due ${new Date(assignment.dueAt).toLocaleDateString()}` : ""}</p>
                {hasApprovedLecturerRole ? (
                  <Link className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cyan px-4 text-sm font-bold text-ink transition hover:bg-lime" href={`/fgc-ekm/data-capturer/forms/${assignment.id}`}>
                    {assignment.status === "SUBMITTED" ? "View submitted form" : "Open capture form"}
                    <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                ) : null}
              </div>
            )) : <p className="rounded-[0.9rem] border border-dashed border-white/[0.14] p-4 text-sm text-paper/54">No assigned production form yet.</p>}
          </div>
        </article>
        <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Role status</p>
          <div className="mt-4 grid gap-3">
            {access.roles.map((role) => (
              <div className="rounded-[0.9rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={role.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{role.name}</p>
                  <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-bold ring-1 ${statusTone(role.status)}`}>{role.status}</span>
                </div>
                <p className="mt-1 text-sm text-paper/56">{role.collegeName ?? role.organisationName ?? "Scope pending"}{role.campusName ? ` - ${role.campusName}` : ""}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workspaces.map(([label, href, description]) => (
          <Link className="group min-h-[13rem] rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1] transition hover:bg-white/[0.085]" href={href} key={href}>
            <div className="flex min-h-full flex-col justify-between gap-5">
              <div>
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan">Available workspace</p>
                <h4 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{label}</h4>
                <p className="mt-3 text-sm leading-6 text-paper/58">{description}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-cyan">
                Open workspace <ArrowRight aria-hidden="true" size={16} className="transition group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProductionLecturerCaptureForm({ assignmentId }: { access: ResolvedProductionAccess; assignmentId: string }) {
  const [formState, setFormState] = useState<LecturerFormState | null>(null);
  const [values, setValues] = useState<FgcLecturerDraftValues>({});
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadState, setUploadState] = useState<{ busy: boolean; progress: number; message: string; error: string }>({ busy: false, progress: 0, message: "", error: "" });
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const completion = useMemo(() => evaluateFgcLecturerDraft(values), [values]);
  const activeModule = formState?.modules[activeModuleIndex];
  const editableSubmissionStatuses = ["DRAFT", "READY_FOR_LECTURER_REVIEW", "CLARIFICATION_REQUESTED", "RESUBMITTED"];
  const submissionStatus = formState?.submission.status ?? "DRAFT";
  const isLocked = Boolean(formState?.submission.status && !editableSubmissionStatuses.includes(formState.submission.status));
  const lockMessage = isLocked
    ? "This form has already entered the governed review workflow. Fields are locked to preserve the submitted evidence snapshot; use the clarification workflow if changes are required."
    : "";

  useEffect(() => {
    let live = true;
    fetch(`/api/fgc/lecturer/forms/${assignmentId}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Unable to load the assigned FGC form.");
        return payload as { ok: true; form: LecturerFormState };
      })
      .then((payload) => {
        if (!live) return;
        setFormState(payload.form);
        setValues(payload.form.values);
        setDirty(false);
        setMessage(payload.form.submission.id ? "Recovered the latest production draft." : "Ready to start a production draft.");
      })
      .catch((error: Error) => {
        if (live) setMessage(error.message);
      });
    return () => {
      live = false;
    };
  }, [assignmentId]);

  useEffect(() => {
    if (!dirty || isLocked) return;
    const timeout = window.setTimeout(() => {
      saveDraft("Autosaved lecturer draft").catch((error: Error) => setMessage(error.message));
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [dirty, values, isLocked]);

  function validateModule(index = activeModuleIndex) {
    const captureModule = formState?.modules[index];
    if (!captureModule) return {};
    const nextErrors: Record<string, string> = {};
    for (const field of captureModule.fields) {
      const key = fieldKey(captureModule.code, field.code);
      if (field.required && !values[key]?.trim()) {
        nextErrors[key] = `${field.label} is required.`;
      }
    }
    return nextErrors;
  }

  function validateAll() {
    const nextErrors: Record<string, string> = {};
    for (const captureModule of formState?.modules ?? []) {
      for (const field of captureModule.fields) {
        const key = fieldKey(captureModule.code, field.code);
        if (field.required && !values[key]?.trim()) {
          nextErrors[key] = `${field.label} is required.`;
        }
      }
    }
    return nextErrors;
  }

  async function saveDraft(reason = "Lecturer saved draft") {
    setSaving(true);
    const response = await fetch(`/api/fgc/lecturer/forms/${assignmentId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values, reason })
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) throw new Error(payload.message ?? "Draft save failed.");
    setDirty(false);
    setMessage(`Draft saved. Completion ${payload.result.completion.completionPercent}%.`);
  }

  async function refreshFormState() {
    const refreshed = await fetch(`/api/fgc/lecturer/forms/${assignmentId}`, { cache: "no-store" }).then((result) => result.json());
    if (refreshed.ok) {
      setFormState(refreshed.form);
      setValues(refreshed.form.values);
      setDirty(false);
    }
  }

  function handleValueChange(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage("");
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  function uploadedFilesManifestValues(files: Array<{ filename: string; sizeBytes: number; reviewStatus: string; checksumSha256: string }>) {
    if (!files.length) return values;
    const names = files.map((file) => `${file.filename} (${formatBytes(file.sizeBytes)}) - ${formatStatusLabel(file.reviewStatus)} - SHA-256 ${file.checksumSha256.slice(0, 12)}...`);
    const key = fieldKey("evidence_uploads", "evidence_manifest");
    const existing = values[key]?.trim();
    return { ...values, [key]: [existing, ...names].filter(Boolean).join("\n") };
  }

  function uploadEvidenceWithProgress(formData: FormData) {
    return new Promise<{ ok: boolean; evidenceFile?: { filename: string; sizeBytes: number; reviewStatus: string; checksumSha256: string }; message?: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/fgc/lecturer/forms/${assignmentId}/evidence`);
      xhr.responseType = "json";
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadState((current) => ({ ...current, progress: Math.max(1, Math.round((event.loaded / event.total) * 100)) }));
        }
      };
      xhr.onerror = () => reject(new Error("Evidence upload failed before the server could complete it."));
      xhr.onload = () => {
        const payload = (xhr.response || {}) as { ok?: boolean; evidenceFile?: { filename: string; sizeBytes: number; reviewStatus: string; checksumSha256: string }; message?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.ok) resolve({ ok: true, evidenceFile: payload.evidenceFile });
        else resolve({ ok: false, message: payload.message ?? "Evidence upload was rejected." });
      };
      xhr.send(formData);
    });
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files?.length || isLocked) return;
    setUploadState({ busy: true, progress: 0, message: "Preparing evidence upload...", error: "" });
    const uploaded: Array<{ filename: string; sizeBytes: number; reviewStatus: string; checksumSha256: string }> = [];
    try {
      if (dirty || !formState?.submission.id) await saveDraft("Lecturer saved draft before evidence upload");
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("evidenceCategory", "LECTURER_SUPPORTING_EVIDENCE");
        formData.set("sectionCode", "evidence_uploads");
        formData.set("fieldCode", "evidence_manifest");
        formData.set("confidentiality", "INTERNAL");
        setUploadState({ busy: true, progress: 1, message: `Uploading ${file.name}...`, error: "" });
        const result = await uploadEvidenceWithProgress(formData);
        if (!result.ok || !result.evidenceFile) {
          throw new Error(result.message ?? `${file.name} could not be uploaded.`);
        }
        uploaded.push(result.evidenceFile);
        setUploadState({ busy: true, progress: 100, message: `${file.name} uploaded and persisted pending review.`, error: "" });
      }
      const nextValues = uploadedFilesManifestValues(uploaded);
      setValues(nextValues);
      const response = await fetch(`/api/fgc/lecturer/forms/${assignmentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ values: nextValues, reason: "Lecturer evidence upload metadata added to manifest" })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message ?? "Evidence stored, but manifest metadata could not be saved.");
      }
      await refreshFormState();
      setUploadState({ busy: false, progress: 100, message: `${uploaded.length} evidence file${uploaded.length === 1 ? "" : "s"} stored pending review.`, error: "" });
    } catch (error) {
      setUploadState({
        busy: false,
        progress: 0,
        message: "",
        error: error instanceof Error ? error.message : "Evidence upload failed."
      });
    }
  }

  async function handleSaveAndContinue() {
    const nextErrors = validateModule();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("Complete the highlighted fields before moving to the next module.");
      errorSummaryRef.current?.focus();
      return;
    }
    await saveDraft("Lecturer saved module and continued");
    setActiveModuleIndex((index) => Math.min(index + 1, (formState?.modules.length ?? 1) - 1));
  }

  async function handleSubmit() {
    const nextErrors = validateAll();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("Final submission needs every required field across the ten modules.");
      errorSummaryRef.current?.focus();
      return;
    }
    setSubmitting(true);
    const response = await fetch(`/api/fgc/lecturer/forms/${assignmentId}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values })
    });
    const payload = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setMessage(payload.message ?? "Final submission failed.");
      return;
    }
    setDirty(false);
    setMessage("Submitted successfully. The form is now locked as an immutable lecturer snapshot.");
    await refreshFormState();
  }

  if (!formState) {
    return (
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Loading production form</p>
        <p className="mt-4 text-sm leading-6 text-paper/62">{message || "Recovering the assigned lecturer evidence form..."}</p>
      </article>
    );
  }

  if (isLocked) {
    return <SubmittedLecturerReport formState={formState} values={values} completion={completion} />;
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Lecturer production form</p>
            <h3 className="mt-3 min-w-0 [overflow-wrap:anywhere] text-3xl font-semibold tracking-[-0.045em]">{formState.assignment.templateName}</h3>
            <p className="mt-3 max-w-3xl [overflow-wrap:anywhere] leading-7 text-paper/62">
              {formState.assignment.reportingPeriod ?? "Current reporting period"} · {formState.assignment.collegeName ?? "College scope pending"}{formState.assignment.campusName ? ` · ${formState.assignment.campusName}` : ""}
            </p>
          </div>
          <div className="min-w-48 rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
            <p className="font-mono text-3xl font-semibold text-lime">{completion.completionPercent}%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-paper/52">Required completion</p>
            <p className="mt-2 text-sm text-paper/58">{completion.completed} of {completion.required} required fields</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          <span className={`rounded-full px-3 py-1 ring-1 ${statusTone(formState.submission.status)}`}>{formState.submission.status}</span>
          <span className="rounded-full bg-white/[0.07] px-3 py-1 text-paper/70 ring-1 ring-white/[0.1]">Version {formState.submission.currentVersion || 0}</span>
          <span className="rounded-full bg-white/[0.07] px-3 py-1 text-paper/70 ring-1 ring-white/[0.1]">{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
        </div>
      </article>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-4 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Ten capture modules</p>
          <div className="mt-4 grid gap-2">
            {formState.modules.map((captureModule, index) => {
              const moduleCompletion = completion.modules.find((item) => item.code === captureModule.code);
              const active = index === activeModuleIndex;
              return (
                <button
                  className={`min-h-12 rounded-[0.85rem] px-3 text-left transition ${active ? "bg-cyan text-ink" : "bg-ink/52 text-paper/70 ring-1 ring-white/[0.08] hover:bg-white/[0.08]"}`}
                  key={captureModule.code}
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => setActiveModuleIndex(index)}
                >
                  <span className="block min-w-0 [overflow-wrap:anywhere] text-sm font-semibold">{index + 1}. {captureModule.title}</span>
                  <span className="mt-1 block text-xs opacity-75">{moduleCompletion?.completed ?? 0}/{moduleCompletion?.required ?? 0} required</span>
                </button>
              );
            })}
          </div>
          <Link className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13]" href="/fgc-ekm/data-capturer">
            <ArrowRight aria-hidden="true" className="rotate-180" size={16} /> Back to assignments
          </Link>
        </aside>

        <form className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" aria-labelledby="active-module-title" onSubmit={(event) => {
          event.preventDefault();
          if (!isLocked && completion.complete) {
            handleSubmit().catch((error: Error) => setMessage(error.message));
          }
        }}>
          {message ? (
            <div className="mb-5 rounded-[0.95rem] border border-cyan/20 bg-cyan/10 p-4 text-sm font-semibold leading-6 text-paper" role="status" aria-live="polite">
              {message}
            </div>
          ) : null}
          {lockMessage ? (
            <div className="mb-5 rounded-[0.95rem] border border-amber/30 bg-amber/10 p-4 text-sm font-semibold leading-6 text-amber" role="status">
              {lockMessage}
            </div>
          ) : null}
          {Object.keys(errors).length ? (
            <div className="mb-5 rounded-[0.95rem] border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100" role="alert" tabIndex={-1} ref={errorSummaryRef}>
              <p className="font-bold">Please fix these fields:</p>
              <ul className="mt-2 grid gap-1">
                {Object.entries(errors).slice(0, 6).map(([key, error]) => (
                  <li key={key}><a className="underline underline-offset-4" href={`#${key.replace(".", "__")}`}>{error}</a></li>
                ))}
              </ul>
            </div>
          ) : null}

          {activeModule ? (
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Module {activeModuleIndex + 1} of {formState.modules.length}</p>
              <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]" id="active-module-title">{activeModule.title}</h4>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-paper/60">{activeModule.purpose}</p>
              {!isLocked ? (
                <p className="mt-3 rounded-[0.85rem] bg-lime/10 px-4 py-3 text-sm font-semibold leading-6 text-lime ring-1 ring-lime/20">
                  Editing is active for this {formatStatusLabel(submissionStatus)} form. Type into the fields below, then save the module or submit once all required fields are complete.
                </p>
              ) : null}
              <div className="mt-6 grid gap-5">
                {activeModule.fields.map((field) => {
                  const key = fieldKey(activeModule.code, field.code);
                  const id = key.replace(".", "__");
                  const describedBy = [`${id}-helper`, errors[key] ? `${id}-error` : ""].filter(Boolean).join(" ");
                  const common = {
                    id,
                    name: key,
                    value: values[key] ?? "",
                    disabled: isLocked,
                    "aria-describedby": describedBy || undefined,
                    "aria-invalid": Boolean(errors[key])
                  };
                  return (
                    <div className="grid gap-2" key={key}>
                      <label className="text-sm font-semibold text-paper" htmlFor={id}>
                        {field.label}{field.required ? <span className="text-amber"> *</span> : null}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea className={`${controlClass} min-h-28 py-3 disabled:cursor-not-allowed disabled:opacity-60`} {...common} autoComplete="off" onChange={(event) => handleValueChange(key, event.target.value)} />
                      ) : field.type === "select" ? (
                        <select className={`${controlClass} disabled:cursor-not-allowed disabled:opacity-60`} {...common} onChange={(event) => handleValueChange(key, event.target.value)}>
                          <option value="">Select an option</option>
                          {field.options?.map((option) => <option className="bg-ink text-paper" key={option} value={option}>{option}</option>)}
                        </select>
                      ) : (
                        <input className={`${controlClass} disabled:cursor-not-allowed disabled:opacity-60`} type={field.type} {...common} autoComplete="off" inputMode={field.type === "number" ? "numeric" : undefined} onChange={(event) => handleValueChange(key, event.target.value)} />
                      )}
                      <p className="text-xs leading-5 text-paper/50" id={`${id}-helper`}>{field.helper} Source status: {field.evidenceKind.replaceAll("_", " ")}.</p>
                      {errors[key] ? <p className="text-sm font-semibold text-rose-100" id={`${id}-error`}>{errors[key]}</p> : null}
                    </div>
                  );
                })}
                {activeModule.code === "evidence_uploads" ? (
                  <div className="rounded-[0.95rem] border border-dashed border-cyan/30 bg-cyan/[0.06] p-4">
                    <label className="flex min-h-14 cursor-pointer items-center gap-3 text-sm font-bold text-cyan">
                      <UploadCloud aria-hidden="true" size={20} />
                      Upload evidence files to private storage
                      <input
                        accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.txt,.json,.xml,.log,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,image/png,image/jpeg,text/plain,application/json,application/xml,text/xml"
                        className="sr-only"
                        type="file"
                        multiple
                        onChange={(event) => {
                          handleFileUpload(event.target.files);
                          event.currentTarget.value = "";
                        }}
                        disabled={isLocked || uploadState.busy}
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-paper/56">Supported: PDF, DOCX, XLSX, CSV, PNG, JPG/JPEG, TXT, JSON, XML and LOG exports. Uploaded files remain document-supported and pending review.</p>
                    <div className="mt-3" aria-live="polite">
                      {uploadState.busy ? (
                        <div className="grid gap-2 rounded-[0.85rem] bg-ink/52 p-3 ring-1 ring-white/[0.08]">
                          <div className="flex items-center justify-between gap-3 text-xs font-bold text-paper/70">
                            <span>{uploadState.message}</span>
                            <span>{uploadState.progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadState.progress}>
                            <div className="h-full rounded-full bg-cyan transition-[width]" style={{ width: `${uploadState.progress}%` }} />
                          </div>
                        </div>
                      ) : uploadState.error ? (
                        <p className="rounded-[0.85rem] bg-rose-300/12 p-3 text-sm font-semibold text-rose-100 ring-1 ring-rose-300/25" role="alert">{uploadState.error}</p>
                      ) : uploadState.message ? (
                        <p className="rounded-[0.85rem] bg-lime/10 p-3 text-sm font-semibold text-lime ring-1 ring-lime/20" role="status">{uploadState.message}</p>
                      ) : null}
                    </div>
                    <div className="mt-4 grid gap-2">
                      {formState.evidenceFiles.length ? formState.evidenceFiles.map((file) => (
                        <div className="rounded-[0.85rem] bg-ink/52 p-3 ring-1 ring-white/[0.08]" key={file.id}>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-paper">{file.filename}</p>
                              <p className="mt-1 text-xs leading-5 text-paper/52">{file.category} - {file.mimeType} - {formatBytes(file.sizeBytes)} - v{file.version}</p>
                              <p className="mt-1 text-xs font-bold text-cyan">{formatStatusLabel(file.reviewStatus)} - Scan {formatStatusLabel(file.scannerStatus)}</p>
                              <p className="mt-1 break-all font-mono text-[0.65rem] text-paper/42">SHA-256 {file.checksumSha256}</p>
                            </div>
                            <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12]" href={file.viewUrl} target="_blank" rel="noreferrer">
                              <FileText aria-hidden="true" size={15} /> View
                            </a>
                          </div>
                        </div>
                      )) : (
                        <p className="rounded-[0.85rem] border border-dashed border-white/[0.14] p-3 text-sm leading-6 text-paper/54">No private evidence files have been stored for this draft yet.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={activeModuleIndex === 0} onClick={() => setActiveModuleIndex((index) => Math.max(0, index - 1))}>
                <RotateCcw aria-hidden="true" size={16} /> Previous
              </button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12] transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={saving || isLocked} onClick={() => saveDraft("Lecturer explicitly saved draft").catch((error: Error) => setMessage(error.message))}>
                <Save aria-hidden="true" size={16} /> {saving ? "Saving..." : "Save draft"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={saving || isLocked} onClick={() => handleSaveAndContinue().catch((error: Error) => setMessage(error.message))}>
                Save and continue <ArrowRight aria-hidden="true" size={16} />
              </button>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-ink transition hover:bg-cyan disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={submitting || isLocked || !completion.complete}>
                <Send aria-hidden="true" size={16} /> {submitting ? "Submitting..." : "Submit final"}
              </button>
            </div>
          </div>

          <aside className="mt-6 rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-lime"><FileText aria-hidden="true" size={15} /> Version history</p>
            <div className="mt-3 grid gap-2 text-sm text-paper/60">
              {formState.versionHistory.length ? formState.versionHistory.map((version) => (
                <p key={version.version}>Version {version.version} saved {new Date(version.createdAt).toLocaleString()}</p>
              )) : <p>No saved production versions yet.</p>}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function ProductionDataCaptureWorkspace({ access, assignmentId }: { access: ResolvedProductionAccess; assignmentId?: string }) {
  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");
  if (!hasApprovedLecturerRole) {
    return <ProductionPortalHome access={access} />;
  }

  if (assignmentId) {
    return <ProductionLecturerCaptureForm access={access} assignmentId={assignmentId} />;
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Data-Capture Workspace</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Lecturer evidence capture</h3>
        <p className="mt-3 max-w-3xl leading-7 text-paper/62">
          Capture the FGC evidence package assigned to your verified lecturer profile. Your submissions remain scoped to your approved college and campus.
        </p>
      </article>
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Assigned production forms</p>
          <div className="mt-5 grid gap-3">
            {access.formAssignments.length ? access.formAssignments.map((assignment) => (
              <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={assignment.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xl font-semibold tracking-[-0.035em]">{assignment.templateName}</h4>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(assignment.status)}`}>{assignment.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-paper/58">{assignment.dueAt ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}` : "No due date set"}</p>
                <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href={`/fgc-ekm/data-capturer/forms/${assignment.id}`}>
                  Open capture form
                </Link>
              </div>
            )) : <p className="rounded-[0.9rem] border border-dashed border-white/[0.14] p-4 text-sm text-paper/54">No assigned production form yet.</p>}
          </div>
        </article>
        <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Capture checklist</p>
          <div className="mt-5 grid gap-3">
            {["EON experience reference", "Lecturer reflection", "Evidence notes", "Supporting upload metadata", "Submission declaration"].map((item) => (
              <div className="flex items-center gap-3 rounded-[0.9rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={item}>
                <ClipboardCheck aria-hidden="true" className="text-cyan" size={18} />
                <span className="text-sm font-semibold text-paper/78">{item}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function workbenchHeading(access: ResolvedProductionAccess) {
  const state = access.access.accessState;
  if (state === "COLLEGE_ACTIVE") return ["College Evidence Workspace", "Institutional enrichment and scoped lecturer evidence review"] as const;
  if (state === "ASSESSOR_ACTIVE") return ["Assessment Workbench", "Rubric review, evidence-quality decisions and moderation handover"] as const;
  if (state === "MODERATOR_ACTIVE") return ["Moderation Workbench", "Quality assurance, final decisions and reassessment control"] as const;
  if (state === "MERSETA_ACTIVE") return ["National Observatory", "Read-only evidence intelligence, reports and limitations"] as const;
  if (state === "PLATFORM_SUPER_ACTIVE") return ["System Governance", "Platform-wide evidence workflow, audit and reporting"] as const;
  if (state === "JEF_ADMIN_ACTIVE") return ["JEF Production Workbench", "Programme governance, escalation and decision audit"] as const;
  return ["Lecturer Dashboard", "Your assigned forms, workflow messages and evidence status"] as const;
}

function decisionActions(access: ResolvedProductionAccess) {
  const state = access.access.accessState;
  const actions: Array<{ action: "COLLEGE_ENRICH" | "ASSESSOR_REVIEW" | "REQUEST_CLARIFICATION" | "MODERATOR_FINALISE" | "JEF_REOPEN"; label: string; decision: string; tone: string }> = [];
  if (state === "COLLEGE_ACTIVE") {
    actions.push({ action: "COLLEGE_ENRICH", label: "Send to JEF review", decision: "College enrichment complete", tone: "bg-lime text-ink" });
    actions.push({ action: "REQUEST_CLARIFICATION", label: "Request clarification", decision: "College clarification requested", tone: "bg-amber text-ink" });
  }
  if (state === "ASSESSOR_ACTIVE") {
    actions.push({ action: "ASSESSOR_REVIEW", label: "Send to moderation", decision: "Assessor review complete", tone: "bg-lime text-ink" });
    actions.push({ action: "REQUEST_CLARIFICATION", label: "Return for evidence", decision: "Assessor clarification requested", tone: "bg-amber text-ink" });
  }
  if (state === "MODERATOR_ACTIVE") {
    actions.push({ action: "MODERATOR_FINALISE", label: "Finalise moderation", decision: "Moderator final decision recorded", tone: "bg-lime text-ink" });
    actions.push({ action: "REQUEST_CLARIFICATION", label: "Request reassessment", decision: "Moderator requested reassessment", tone: "bg-amber text-ink" });
  }
  if (state === "JEF_ADMIN_ACTIVE") {
    actions.push({ action: "ASSESSOR_REVIEW", label: "Escalate to moderation", decision: "JEF review accepted assessor handover", tone: "bg-lime text-ink" });
    actions.push({ action: "REQUEST_CLARIFICATION", label: "Request clarification", decision: "JEF clarification requested", tone: "bg-amber text-ink" });
    actions.push({ action: "JEF_REOPEN", label: "Reopen record", decision: "JEF reopened production record", tone: "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]" });
  }
  if (state === "PLATFORM_SUPER_ACTIVE") {
    actions.push({ action: "JEF_REOPEN", label: "Reopen record", decision: "Platform super administrator reopened record", tone: "bg-white/[0.08] text-paper ring-1 ring-white/[0.12]" });
  }
  return actions;
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function evidenceManifestEntries(values: FgcLecturerDraftValues) {
  return (values[fieldKey("evidence_uploads", "evidence_manifest")] ?? "")
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function SubmittedLecturerReport({ formState, values, completion }: { formState: LecturerFormState; values: FgcLecturerDraftValues; completion: ReturnType<typeof evaluateFgcLecturerDraft> }) {
  const reportMeta = [
    ["Submission status", formatStatusLabel(formState.submission.status)],
    ["Version", `Version ${formState.submission.currentVersion || 0}`],
    ["Completion", `${completion.completionPercent}%`],
    ["Submitted", formState.submission.submittedAt ? new Date(formState.submission.submittedAt).toLocaleString() : "Not submitted yet"],
    ["Updated", formState.submission.updatedAt ? new Date(formState.submission.updatedAt).toLocaleString() : "Not updated yet"],
    ["Reporting period", formState.assignment.reportingPeriod ?? "Current reporting period"]
  ];
  const scopeMeta = [
    ["Template", formState.assignment.templateName],
    ["College", formState.assignment.collegeName ?? "College scope pending"],
    ["Campus", formState.assignment.campusName ?? "Campus pending / college-wide"],
    ["Assignment", formState.assignment.status]
  ];
  const manifestEntries = evidenceManifestEntries(values);

  return (
    <div className="grid gap-6 print:bg-white print:text-black">
      <article className="overflow-hidden rounded-[1.1rem] bg-paper text-ink ring-1 ring-white/[0.1] print:rounded-none print:ring-0">
        <div className="border-b border-ink/10 bg-gradient-to-br from-white via-white to-cyan/10 p-6 print:bg-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan print:text-black">FGC lecturer evidence report</p>
              <h3 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-ink print:text-3xl">{formState.assignment.templateName}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/62">
                This is the locked lecturer submission snapshot. It is presented for review, moderation and audit; edits must use the governed clarification workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-paper transition hover:bg-cyan hover:text-ink" type="button" onClick={() => window.print()}>
                <Printer aria-hidden="true" size={16} /> Print report
              </button>
              <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink/5 px-4 text-sm font-bold text-ink ring-1 ring-ink/10 transition hover:bg-ink/10" href="/fgc-ekm/data-capturer">
                <ArrowRight aria-hidden="true" className="rotate-180" size={16} /> Back to assignments
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {scopeMeta.map(([label, value]) => (
              <div className="min-w-0 rounded-[0.8rem] bg-ink/[0.035] p-4 ring-1 ring-ink/10 print:bg-white" key={label}>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">{label}</p>
                <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm font-bold leading-5 text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <section aria-labelledby="submission-summary-title">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan print:text-black">Submission summary</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]" id="submission-summary-title">Review-ready evidence snapshot</h4>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(formState.submission.status)} print:border print:border-black print:bg-white print:text-black`}>
                {formatStatusLabel(formState.submission.status)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {reportMeta.map(([label, value]) => (
                <div className="rounded-[0.8rem] bg-ink/[0.035] p-4 ring-1 ring-ink/10 print:bg-white" key={label}>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-5 text-ink">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8" aria-labelledby="report-documents-title">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan print:text-black">Evidence document register</p>
                <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]" id="report-documents-title">Uploaded and declared documents</h4>
              </div>
              <span className="w-fit rounded-full bg-ink/[0.06] px-3 py-1 text-xs font-bold text-ink/68 ring-1 ring-ink/10">
                {formState.evidenceFiles.length} stored · {manifestEntries.length} declared
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[0.95rem] border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5 print:shadow-none">
                <h5 className="text-lg font-semibold tracking-[-0.025em] text-ink">Stored evidence files</h5>
                <div className="mt-4 grid gap-3">
                  {formState.evidenceFiles.length ? formState.evidenceFiles.map((file) => (
                    <div className="rounded-[0.8rem] bg-ink/[0.025] p-4 ring-1 ring-ink/5" key={file.id}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-ink">{file.filename}</p>
                          <p className="mt-1 text-xs leading-5 text-ink/52">{file.category} - {file.mimeType} - {formatBytes(file.sizeBytes)} - v{file.version}</p>
                          <p className="mt-1 text-xs font-bold text-ink/60">{formatStatusLabel(file.reviewStatus)} - Scan {formatStatusLabel(file.scannerStatus)}</p>
                          <p className="mt-1 break-all font-mono text-[0.62rem] text-ink/42">SHA-256 {file.checksumSha256}</p>
                        </div>
                        <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-paper print:hidden" href={file.viewUrl} target="_blank" rel="noreferrer">
                          <FileText aria-hidden="true" size={15} /> View document
                        </a>
                      </div>
                    </div>
                  )) : (
                    <p className="rounded-[0.8rem] border border-dashed border-ink/15 p-4 text-sm leading-6 text-ink/58">
                      No private evidence files are stored against this submission yet.
                    </p>
                  )}
                </div>
              </article>
              <article className="rounded-[0.95rem] border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5 print:shadow-none">
                <h5 className="text-lg font-semibold tracking-[-0.025em] text-ink">Manifest-only entries</h5>
                <div className="mt-4 grid gap-2">
                  {manifestEntries.length ? manifestEntries.map((entry, index) => (
                    <p className="rounded-[0.8rem] bg-amber/10 p-3 text-sm leading-6 text-ink ring-1 ring-amber/20" key={`${entry}-${index}`}>
                      {entry}<span className="mt-1 block text-xs font-bold uppercase tracking-[0.08em] text-ink/50">Listed in manifest; binary file not stored yet</span>
                    </p>
                  )) : (
                    <p className="rounded-[0.8rem] border border-dashed border-ink/15 p-4 text-sm leading-6 text-ink/58">
                      No document names were declared in the evidence manifest.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="report-responses-title">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan print:text-black">Toolkit response register</p>
            <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]" id="report-responses-title">Captured responses by module</h4>
            <div className="mt-5 grid gap-5">
              {formState.modules.map((captureModule, index) => {
                const moduleCompletion = completion.modules.find((item) => item.code === captureModule.code);
                return (
                  <article className="break-inside-avoid rounded-[0.95rem] border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5 print:shadow-none" key={captureModule.code}>
                    <div className="flex flex-col gap-2 border-b border-ink/10 pb-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/45">Module {index + 1}</p>
                        <h5 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-ink">{captureModule.title}</h5>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-ink/58">{captureModule.purpose}</p>
                      </div>
                      <span className="w-fit rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold text-ink ring-1 ring-cyan/20">
                        {moduleCompletion?.completed ?? 0}/{moduleCompletion?.required ?? 0} required
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-3">
                      {captureModule.fields.map((field) => {
                        const key = fieldKey(captureModule.code, field.code);
                        const value = values[key]?.trim();
                        return (
                          <div className="grid gap-2 rounded-[0.75rem] bg-ink/[0.025] p-4 ring-1 ring-ink/5 md:grid-cols-[minmax(180px,0.34fr)_minmax(0,0.66fr)] print:bg-white" key={key}>
                            <dt className="min-w-0">
                              <span className="block text-sm font-bold leading-5 text-ink">{field.label}</span>
                              <span className="mt-1 inline-flex rounded-full bg-ink/[0.06] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-ink/60">{field.evidenceKind.replaceAll("_", " ")}</span>
                            </dt>
                            <dd className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-ink/72">{value || "No value captured"}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2" aria-labelledby="report-history-title">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan print:text-black">Version history</p>
              <h4 className="mt-2 text-xl font-semibold tracking-[-0.035em]" id="report-history-title">Immutable snapshots</h4>
              <div className="mt-4 grid gap-2 text-sm text-ink/62">
                {formState.versionHistory.length ? formState.versionHistory.map((version) => (
                  <p className="rounded-[0.75rem] bg-ink/[0.035] p-3 ring-1 ring-ink/10 print:bg-white" key={version.version}>Version {version.version} saved {new Date(version.createdAt).toLocaleString()}</p>
                )) : <p>No saved production versions yet.</p>}
              </div>
            </div>
            <div className="rounded-[0.95rem] bg-ink/[0.035] p-5 ring-1 ring-ink/10 print:bg-white">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/45">Review note</p>
              <p className="mt-3 text-sm leading-6 text-ink/64">
                Self-reported responses, document-supported claims and system-derived evidence remain distinct until authorised reviewers complete verification.
              </p>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function ProductionRoleWorkbench({ access }: { access: ResolvedProductionAccess }) {
  const [workbench, setWorkbench] = useState<FgcRoleWorkbench | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [submissionDetail, setSubmissionDetail] = useState<FgcSubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState("");
  const [detailError, setDetailError] = useState("");
  const [notes, setNotes] = useState("Decision recorded against the current production evidence snapshot.");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [title, subtitle] = workbenchHeading(access);
  const actions = decisionActions(access);
  const selectedSubmission: FgcWorkbenchSubmission | null = workbench?.submissions.find((submission) => submission.id === selectedSubmissionId) ?? workbench?.submissions[0] ?? null;

  async function refreshWorkbench() {
    const response = await fetch("/api/fgc/workbench", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "The production workbench could not be loaded.");
    setWorkbench(payload.workbench);
    setSelectedSubmissionId((current) => current || payload.workbench?.submissions?.[0]?.id || "");
    setSubmissionDetail((current) => current && payload.workbench?.submissions?.some((submission: FgcWorkbenchSubmission) => submission.id === current.id) ? current : null);
  }

  useEffect(() => {
    refreshWorkbench().catch((error: Error) => setMessage(error.message));
  }, []);

  async function runDecision(action: ReturnType<typeof decisionActions>[number]) {
    if (!selectedSubmission) return;
    setBusy(action.action);
    const response = await fetch("/api/fgc/workbench/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "DECISION", submissionId: selectedSubmission.id, action: action.action, decision: action.decision, notes })
    });
    const payload = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(payload.message ?? "Decision could not be recorded.");
      return;
    }
    setMessage(`Decision recorded. New status: ${formatStatusLabel(payload.result.nextStatus)}.`);
    await refreshWorkbench();
  }

  async function openSubmissionDetail(submissionId: string) {
    setSelectedSubmissionId(submissionId);
    setDetailLoading(submissionId);
    setDetailError("");
    const response = await fetch(`/api/fgc/submissions/${submissionId}`, { cache: "no-store" });
    const payload = await response.json();
    setDetailLoading("");
    if (!response.ok) {
      setDetailError(payload.message ?? "The selected production submission could not be opened.");
      return;
    }
    setSubmissionDetail(payload.submission);
  }

  async function generateReport() {
    setBusy("GENERATE_REPORT");
    const response = await fetch("/api/fgc/workbench/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "GENERATE_REPORT", reportType: access.access.accessState.toLowerCase().replaceAll("_active", "") })
    });
    const payload = await response.json();
    setBusy("");
    if (!response.ok) {
      setMessage(payload.message ?? "Report could not be generated.");
      return;
    }
    setMessage(`Report generated: ${payload.result.identifier}.`);
    await refreshWorkbench();
  }

  if (!workbench) {
    return (
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{access.access.accessState.replaceAll("_", " ")}</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-paper/62">{message || "Loading scoped production records..."}</p>
      </article>
    );
  }

  const metricValue = (id: string) => workbench.metrics.metrics.find((metric) => metric.id === id)?.value ?? 0;
  const metricCards = [
    ["Users", metricValue("verified-users"), "Verified production identities"],
    ["Assignments", metricValue("assigned-forms"), "Active form assignments"],
    ["Submitted", metricValue("submitted-evidence-packs"), "Evidence packs beyond draft"],
    ["Audit", workbench.metrics.audit.totalEvents, "Recorded production decisions"]
  ] as const;

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{workbench.roleName ?? workbench.accessState.replaceAll("_", " ")}</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{title}</h3>
            <p className="mt-3 max-w-3xl leading-7 text-paper/62">{subtitle}. Scope: <b>{workbench.scope.label}</b>.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex min-h-11 items-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12]" type="button" onClick={() => refreshWorkbench().catch((error: Error) => setMessage(error.message))}>Refresh</button>
            <button className="inline-flex min-h-11 items-center rounded-full bg-cyan px-4 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={busy === "GENERATE_REPORT"} onClick={() => generateReport()}>{busy === "GENERATE_REPORT" ? "Generating..." : "Generate report"}</button>
          </div>
        </div>
        {message ? <p className="mt-4 rounded-[0.9rem] bg-cyan/10 p-3 text-sm font-semibold text-paper ring-1 ring-cyan/20" role="status">{message}</p> : null}
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value, helper]) => (
          <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" key={label}>
            <p className="font-mono text-4xl font-semibold text-lime">{value}</p>
            <h4 className="mt-2 text-sm font-bold text-paper">{label}</h4>
            <p className="mt-1 text-xs leading-5 text-paper/50">{helper}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {workbench.queues.map((queue) => (
          <article className="rounded-[1.1rem] bg-ink/52 p-5 ring-1 ring-white/[0.08]" key={queue.id}>
            <p className="font-mono text-3xl font-semibold text-cyan">{queue.count}</p>
            <h4 className="mt-2 font-semibold">{queue.label}</h4>
            <p className="mt-2 text-sm leading-6 text-paper/54">{queue.description}</p>
          </article>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" aria-labelledby="production-submissions-title">
          <h4 className="text-2xl font-semibold tracking-[-0.04em]" id="production-submissions-title">Production evidence records</h4>
          <div className="mt-5 grid gap-3">
            {workbench.submissions.length ? workbench.submissions.map((submission) => (
              <button
                className={`rounded-[0.95rem] p-4 text-left ring-1 transition ${selectedSubmission?.id === submission.id ? "bg-cyan/12 ring-cyan/35" : "bg-ink/52 ring-white/[0.08] hover:bg-white/[0.08]"}`}
                key={submission.id}
                type="button"
                onClick={() => setSelectedSubmissionId(submission.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-[-0.025em]">{submission.submitterName}</p>
                    <p className="mt-1 text-sm text-paper/52">{submission.collegeName ?? "College pending"}{submission.campusName ? ` - ${submission.campusName}` : ""}</p>
                  </div>
                  <span className={`max-w-full rounded-full px-3 py-1 text-xs font-bold leading-5 ring-1 ${statusTone(submission.status)}`}>{formatStatusLabel(submission.status)}</span>
                </div>
                <div className="mt-4 grid min-w-0 gap-2 text-sm text-paper/58 md:grid-cols-3">
                  <p><b className="text-paper/80">{submission.completionPercent}%</b> complete</p>
                  <p className="min-w-0 [overflow-wrap:anywhere]">{submission.programmeName || "Programme not captured"}</p>
                  <p className="min-w-0 [overflow-wrap:anywhere]">{submission.sourceStatus}</p>
                </div>
                <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan/80">{selectedSubmission?.id === submission.id ? "Selected record" : "Select to inspect"}</p>
              </button>
            )) : <p className="rounded-[0.95rem] border border-dashed border-white/[0.14] p-5 text-sm leading-6 text-paper/56">No production submissions are currently visible in this role scope.</p>}
          </div>
        </section>

        <aside className="grid min-w-0 content-start gap-4">
          <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Decision panel</p>
            {selectedSubmission ? (
              <div className="mt-4 grid gap-3">
                <p className="min-w-0 [overflow-wrap:anywhere] text-sm leading-6 text-paper/62">{selectedSubmission.submitterName} · {formatStatusLabel(selectedSubmission.status)}</p>
                <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-4 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={detailLoading === selectedSubmission.id} onClick={() => openSubmissionDetail(selectedSubmission.id)}>
                  {detailLoading === selectedSubmission.id ? "Opening..." : "Open full submission"}
                </button>
                {detailError ? <p className="rounded-[0.85rem] bg-rose-300/12 p-3 text-sm font-semibold text-rose-100 ring-1 ring-rose-300/25">{detailError}</p> : null}
                <textarea className={`${controlClass} min-h-24 py-3`} value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="Decision notes" />
                {actions.length ? actions.map((action) => (
                  <button className={`min-h-11 rounded-full px-4 text-sm font-bold leading-5 transition disabled:cursor-not-allowed disabled:opacity-50 ${action.tone}`} key={action.action} type="button" disabled={busy === action.action} onClick={() => runDecision(action)}>
                    {busy === action.action ? "Recording..." : action.label}
                  </button>
                )) : <p className="rounded-[0.9rem] bg-ink/52 p-4 text-sm leading-6 text-paper/56">This role has read-only access to the selected evidence record.</p>}
              </div>
            ) : <p className="mt-4 text-sm leading-6 text-paper/56">Select a production record to view decisions.</p>}
          </article>

          <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Notifications</p>
            <div className="mt-4 grid gap-3">
              {workbench.notifications.slice(0, 4).map((notification) => (
                <div className="rounded-[0.9rem] bg-ink/52 p-3 ring-1 ring-white/[0.08]" key={notification.id}>
                  <p className="text-sm font-semibold">{notification.subject}</p>
                  <p className="mt-1 text-xs leading-5 text-paper/52">{notification.body}</p>
                </div>
              ))}
              {!workbench.notifications.length ? <p className="text-sm text-paper/52">No notifications yet.</p> : null}
            </div>
          </article>
        </aside>
      </div>

      {submissionDetail ? <ProductionSubmissionDetailViewer detail={submissionDetail} onClose={() => setSubmissionDetail(null)} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Generated reports</p>
          <div className="mt-4 grid gap-2 text-sm">
            {workbench.reports.slice(0, 5).map((report) => (
              <p className="rounded-[0.85rem] bg-ink/52 p-3" key={report.id}>{report.identifier} · {report.status}</p>
            ))}
            {!workbench.reports.length ? <p className="text-paper/52">No governed reports generated yet.</p> : null}
          </div>
        </article>
        <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Recent audit events</p>
          <div className="mt-4 grid gap-2 text-sm">
            {workbench.auditEvents.slice(0, 5).map((event) => (
              <p className="rounded-[0.85rem] bg-ink/52 p-3" key={event.id}>{event.action} · {event.actorRole ?? "system"} · {new Date(event.createdAt).toLocaleString()}</p>
            ))}
            {!workbench.auditEvents.length ? <p className="text-paper/52">No production audit events recorded yet.</p> : null}
          </div>
        </article>
      </div>
    </div>
  );
}

function formatBytes(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function ProductionSubmissionDetailViewer({ detail, onClose }: { detail: FgcSubmissionDetail; onClose: () => void }) {
  const summaryItems = [
    ["Lecturer", detail.submitterName],
    ["Email", detail.submitterEmail],
    ["College", detail.collegeName ?? "College pending"],
    ["Campus", detail.campusName ?? "Campus pending / college-wide"],
    ["Template", detail.templateName ?? "Template pending"],
    ["Reporting period", detail.reportingPeriodName ?? "Period pending"],
    ["Version", `v${detail.currentVersion}`],
    ["Completion", `${detail.completionPercent}%`]
  ];

  return (
    <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-cyan/20" aria-labelledby="submission-detail-title">
      <div className="flex flex-col gap-4 border-b border-white/[0.1] pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Canonical submission viewer</p>
          <h4 className="mt-3 text-3xl font-semibold tracking-[-0.045em]" id="submission-detail-title">{detail.reference}</h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-paper/58">
            One governed submission record, visible according to role scope. Field values remain separated from verification decisions and evidence metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(detail.status)}`}>{formatStatusLabel(detail.status)}</span>
          <span className="rounded-full bg-lime/10 px-3 py-1 text-xs font-bold text-lime ring-1 ring-lime/25">{formatStatusLabel(detail.verificationStatus)}</span>
          <button className="inline-flex min-h-10 items-center rounded-full bg-white/[0.08] px-4 text-sm font-bold text-paper ring-1 ring-white/[0.12]" type="button" onClick={onClose}>Close detail</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map(([label, value]) => (
          <div className="min-w-0 rounded-[0.9rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={label}>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">{label}</p>
            <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-paper">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-cyan">Source status</p>
          <p className="mt-2 text-sm leading-6 text-paper/68">{detail.sourceStatus}</p>
        </div>
        <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-lime">Evidence completeness</p>
          <p className="mt-2 text-sm leading-6 text-paper/68">{formatStatusLabel(detail.evidenceCompletenessStatus)}</p>
        </div>
        <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-amber">Submitted</p>
          <p className="mt-2 text-sm leading-6 text-paper/68">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : "Not submitted yet"}</p>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="field-level-submission-title">
        <h5 className="text-2xl font-semibold tracking-[-0.04em]" id="field-level-submission-title">Field-level submission detail</h5>
        <div className="mt-4 grid gap-4">
          {detail.sections.length ? detail.sections.map((section) => (
            <div className="rounded-[1rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={section.code}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h6 className="text-lg font-semibold tracking-[-0.025em]">{section.title}</h6>
                  <p className="mt-1 text-sm leading-6 text-paper/52">{section.purpose}</p>
                </div>
                <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-paper/70 ring-1 ring-white/[0.1]">{section.fields.length} fields</span>
              </div>
              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                {section.fields.map((field) => (
                  <div className="min-w-0 rounded-[0.85rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={`${field.sectionCode}.${field.fieldCode}`}>
                    <p className="text-sm font-semibold leading-5 text-paper">{field.label}</p>
                    <p className="mt-2 min-h-10 whitespace-pre-wrap break-words text-sm leading-6 text-paper/68">{field.value || "No value captured"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-cyan ring-1 ring-cyan/20">{formatStatusLabel(field.evidenceKind)}</span>
                      <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-paper/64 ring-1 ring-white/[0.1]">{field.verificationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : <p className="rounded-[0.95rem] border border-dashed border-white/[0.14] p-5 text-sm leading-6 text-paper/56">No field values have been saved for the latest production version.</p>}
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-[1rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" aria-labelledby="evidence-files-title">
          <h5 className="text-xl font-semibold tracking-[-0.035em]" id="evidence-files-title">Evidence files</h5>
          <div className="mt-4 grid gap-3">
            {detail.evidenceFiles.length ? detail.evidenceFiles.map((file) => (
              <div className="rounded-[0.85rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={file.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{file.filename}</p>
                    <p className="mt-1 text-xs leading-5 text-paper/52">{file.category} - {file.mimeType} - {formatBytes(file.sizeBytes)} - v{file.version}</p>
                    <p className="mt-2 text-xs font-bold text-cyan">{formatStatusLabel(file.reviewStatus)} - {file.confidentiality} - Scan {formatStatusLabel(file.scannerStatus)}</p>
                    <p className="mt-1 break-all font-mono text-[0.62rem] text-paper/42">SHA-256 {file.checksumSha256}</p>
                  </div>
                  <a className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-cyan px-4 text-sm font-bold text-ink" href={file.viewUrl} target="_blank" rel="noreferrer">
                    <FileText aria-hidden="true" size={15} /> View document
                  </a>
                </div>
              </div>
            )) : <p className="text-sm leading-6 text-paper/56">No uploaded evidence files are attached yet. Evidence may still be declared in the manifest field.</p>}
          </div>
        </section>

        <section className="rounded-[1rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" aria-labelledby="version-history-title">
          <h5 className="text-xl font-semibold tracking-[-0.035em]" id="version-history-title">Version and audit trail</h5>
          <div className="mt-4 grid gap-3">
            {detail.versions.map((version) => (
              <div className="rounded-[0.85rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={version.id}>
                <p className="text-sm font-semibold">Version {version.version} · {formatStatusLabel(version.status)}</p>
                <p className="mt-1 text-xs leading-5 text-paper/52">{new Date(version.createdAt).toLocaleString()} · {version.createdBy ?? "System"}</p>
              </div>
            ))}
            {detail.statusHistory.slice(0, 4).map((event) => (
              <div className="rounded-[0.85rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={event.id}>
                <p className="text-sm font-semibold">{formatStatusLabel(event.previousStatus ?? "Created")} to {formatStatusLabel(event.newStatus)}</p>
                <p className="mt-1 text-xs leading-5 text-paper/52">{event.reason} · {new Date(event.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

function ProductionDashboard({ access }: { access: ResolvedProductionAccess }) {
  const approvedRoles = access.roles.filter((role) => role.status === "APPROVED").length;
  const pendingRoles = access.roles.filter((role) => role.status === "REQUESTED" || role.status === "RETURNED").length;
  const assignedForms = access.formAssignments.length;

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">My Dashboard</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Production access and evidence status</h3>
      </article>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Approved roles", approvedRoles, "text-lime"],
          ["Pending roles", pendingRoles, "text-amber"],
          ["Assigned forms", assignedForms, "text-cyan"]
        ].map(([label, value, tone]) => (
          <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]" key={label}>
            <p className={`font-mono text-4xl font-semibold ${tone}`}>{value}</p>
            <p className="mt-2 text-sm font-semibold text-paper/72">{label}</p>
          </article>
        ))}
      </div>
      <ProductionRoleWorkbench access={access} />
    </div>
  );
}

function ProductionAccountView({ access }: { access: ResolvedProductionAccess }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <UserCheck aria-hidden="true" className="text-lime" size={28} />
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{access.user.name}</h3>
        <p className="mt-2 text-paper/58">{access.user.email}</p>
        <div className="mt-5 grid gap-3 text-sm">
          <p className="rounded-[0.9rem] bg-ink/52 p-4">Email verified: <b>{access.user.emailVerified ? "Yes" : "No"}</b></p>
          <p className="rounded-[0.9rem] bg-ink/52 p-4">Account state: <b>{access.user.accountState}</b></p>
          <p className="rounded-[0.9rem] bg-ink/52 p-4">Default workspace: <b>{access.access.expectedPortal}</b></p>
        </div>
      </article>
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production role assignments</p>
        <div className="mt-5 grid gap-3">
          {access.roles.map((role) => (
            <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={role.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xl font-semibold tracking-[-0.035em]">{role.name}</h4>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusTone(role.status)}`}>{role.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-paper/62">{role.collegeName ?? role.organisationName ?? "Scope pending"}{role.campusName ? ` - ${role.campusName}` : ""}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

type OperationalSectionKey = "overview" | "intelligence" | "access" | "workbench" | "reports" | "audit" | "system";

function isOperationalCommandRole(access: ResolvedProductionAccess) {
  return ["JEF_ADMIN_ACTIVE", "MERSETA_ACTIVE", "ASSESSOR_ACTIVE", "MODERATOR_ACTIVE", "PLATFORM_SUPER_ACTIVE"].includes(access.access.accessState);
}

function initialOperationalSection(routePath: string): OperationalSectionKey {
  if (routePath.endsWith("/users-roles") || routePath.endsWith("/access-requests")) return "access";
  if (routePath.endsWith("/system")) return "system";
  if (routePath.endsWith("/audit-log")) return "audit";
  if (routePath.endsWith("/reports")) return "reports";
  if (routePath.endsWith("/tasks") || routePath.endsWith("/moderation") || routePath.endsWith("/assessments/challenges")) return "workbench";
  if (routePath.endsWith("/merseta") || routePath.endsWith("/national/observatory")) return "intelligence";
  return "overview";
}

function operationalWorkspaceProfile(access: ResolvedProductionAccess) {
  const activeCode = access.access.activeRole?.code ?? "";
  if (access.access.accessState === "PLATFORM_SUPER_ACTIVE") {
    return {
      eyebrow: "Platform Super Administrator",
      title: "Platform governance, security and audit command centre",
      subtitle: "System health, configuration, audit, reports and the shared FGC intelligence foundation in one governed workspace."
    };
  }
  if (access.access.accessState === "JEF_ADMIN_ACTIVE") {
    return {
      eyebrow: "JEF Administrator",
      title: "JEF Administration Workspace",
      subtitle: "The complete operational integration of access governance, evidence operations, intervention tracking, reports, audit and the restored FGC dashboard."
    };
  }
  if (access.access.accessState === "ASSESSOR_ACTIVE") {
    return {
      eyebrow: "Assessor / Evidence Officer",
      title: "Assessment intelligence and evidence review workspace",
      subtitle: "Aggregate dashboard insights connect directly to assigned submissions, evidence sufficiency, rubric scoring, contradictions and moderation handoff."
    };
  }
  if (access.access.accessState === "MODERATOR_ACTIVE") {
    return {
      eyebrow: "Moderator",
      title: "Moderation quality assurance workspace",
      subtitle: "Quality assurance, scoring variance, evidence completeness, reassessments and moderated outcome trends are available from one role console."
    };
  }
  if (activeCode === "MERSETA_ADMINISTRATOR") {
    return {
      eyebrow: "merSETA Administrator",
      title: "merSETA oversight and report administration workspace",
      subtitle: "Read-only national intelligence is paired with authorised report review, deliverable acknowledgement and export-ready programme evidence."
    };
  }
  return {
    eyebrow: "merSETA Viewer",
    title: "merSETA executive evidence viewer",
    subtitle: "Authorised findings, evidence strength, limitations, college commitments, interventions and generated reports are visible without operational clutter."
  };
}

function operationalSections(access: ResolvedProductionAccess): Array<{ key: OperationalSectionKey; label: string; description: string }> {
  const state = access.access.accessState;
  const sections: Array<{ key: OperationalSectionKey; label: string; description: string }> = [
    { key: "overview", label: "Overview", description: "Role scope, lineage and key operating modules." },
    { key: "intelligence", label: "FGC Intelligence Dashboard", description: "Restored observatory, FGC questions, charts, filters and drill-down foundation." },
    { key: "workbench", label: state === "MODERATOR_ACTIVE" ? "Moderation Workbench" : state === "ASSESSOR_ACTIVE" ? "Assessment Workbench" : "Work Queue", description: "Scoped evidence records, decisions, notifications and action queues." },
    { key: "reports", label: "Reports", description: "Governed report generation, acknowledgement and export-ready reporting snapshots." }
  ];
  if (state === "JEF_ADMIN_ACTIVE" || state === "PLATFORM_SUPER_ACTIVE") {
    sections.splice(2, 0, { key: "access", label: "User and Access Management", description: "Affiliations, role approvals, scope correction and pending access records." });
    sections.push({ key: "audit", label: "Audit Trail", description: "Recent governed decisions and production event lineage." });
  }
  if (state === "PLATFORM_SUPER_ACTIVE") {
    sections.push({ key: "system", label: "System Governance", description: "Database, sessions, integrations, configuration warnings and platform exceptions." });
  }
  return sections;
}

function OperationalOverview({ access, sections }: { access: ResolvedProductionAccess; sections: ReturnType<typeof operationalSections> }) {
  const profile = operationalWorkspaceProfile(access);
  const lineage = [
    "Lecturer capture",
    "College enrichment",
    "Assessment",
    "Moderation",
    "JEF operations",
    "merSETA oversight",
    "Platform governance"
  ];

  return (
    <div className="grid gap-5">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{profile.eyebrow}</p>
        <h3 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.045em]">{profile.title}</h3>
        <p className="mt-3 max-w-4xl leading-7 text-paper/62">{profile.subtitle}</p>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active role", access.access.activeRole?.name ?? formatStatusLabel(access.access.accessState)],
          ["Account", access.user.accountState],
          ["Forms", String(access.formAssignments.length)],
          ["Scope", access.access.activeRole?.collegeName ?? access.access.activeRole?.organisationName ?? "National / platform"]
        ].map(([label, value]) => (
          <article className="min-w-0 rounded-[1.1rem] bg-ink/52 p-5 ring-1 ring-white/[0.08]" key={label}>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-paper/42">{label}</p>
            <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-xl font-semibold tracking-[-0.035em] text-paper">{value}</p>
          </article>
        ))}
      </div>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <article className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Shared record lineage</p>
          <div className="mt-5 grid gap-2">
            {lineage.map((step, index) => (
              <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 rounded-[0.9rem] bg-ink/52 p-3 ring-1 ring-white/[0.08]" key={step}>
                <span className="grid size-9 place-items-center rounded-full bg-cyan/14 font-mono text-xs font-bold text-cyan ring-1 ring-cyan/20">{index + 1}</span>
                <span className="min-w-0 [overflow-wrap:anywhere] text-sm font-semibold text-paper/78">{step}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="min-w-0 rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Visible workspace modules</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <div className="min-w-0 rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={section.key}>
                <h4 className="min-w-0 [overflow-wrap:anywhere] text-lg font-semibold tracking-[-0.035em]">{section.label}</h4>
                <p className="mt-2 text-sm leading-6 text-paper/54">{section.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function OperationalReportsPanel({ access }: { access: ResolvedProductionAccess }) {
  const readOnly = access.access.activeRole?.code === "MERSETA_VIEWER";
  return (
    <div className="grid gap-5">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Reports</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{readOnly ? "Authorised report library and limitations" : "Governed report generation and review"}</h3>
        <p className="mt-3 max-w-3xl leading-7 text-paper/62">
          Reports are generated from the shared evidence lineage and audit trail. This panel keeps report actions visible beside the same scoped workbench data used by the role.
        </p>
      </article>
      <ProductionRoleWorkbench access={access} />
    </div>
  );
}

function OperationalSystemPanel({ access }: { access: ResolvedProductionAccess }) {
  return (
    <div className="grid gap-5">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">System Governance</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Platform health, security and configuration visibility.</h3>
        <p className="mt-3 max-w-3xl leading-7 text-paper/62">
          This view surfaces operational health without exposing secrets or silently changing evidence outcomes.
        </p>
      </article>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Application health", "Online"],
          ["Database health", "Reachable"],
          ["Session model", "Production cookie"],
          ["Audit capture", "Enabled"]
        ].map(([label, value]) => (
          <article className="min-w-0 rounded-[1.1rem] bg-ink/52 p-5 ring-1 ring-white/[0.08]" key={label}>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-paper/42">{label}</p>
            <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-xl font-semibold text-lime">{value}</p>
          </article>
        ))}
      </div>
      <ProductionRoleWorkbench access={access} />
    </div>
  );
}

function OperationalCommandWorkspace({ access, routePath }: { access: ResolvedProductionAccess; routePath: string }) {
  const sections = useMemo(() => operationalSections(access), [access]);
  const [activeSection, setActiveSection] = useState<OperationalSectionKey>(() => {
    const initial = initialOperationalSection(routePath);
    return sections.some((section) => section.key === initial) ? initial : "overview";
  });
  const profile = operationalWorkspaceProfile(access);

  useEffect(() => {
    const next = initialOperationalSection(routePath);
    if (sections.some((section) => section.key === next)) setActiveSection(next);
  }, [routePath, sections]);

  let content: ReactNode = <OperationalOverview access={access} sections={sections} />;
  if (activeSection === "intelligence") {
    content = (
      <section className="min-w-0 overflow-x-auto rounded-[1.1rem] bg-ink/42 ring-1 ring-white/[0.1] [&_.fgc-ekm-workspace-grid]:!grid-cols-1 [&>main]:min-h-0 [&>main]:min-w-0 [&>main]:bg-transparent [&>main]:pt-0 [&>main>section]:min-w-0 [&>main>section]:px-0 [&>main>section]:pb-0 [&>main>section>div]:max-w-none [&>main>section>div]:border-0 [&>main>section>div]:bg-transparent [&>main>section>div]:shadow-none">
        <FgcEkmApp />
      </section>
    );
  } else if (activeSection === "access") {
    content = <AdminAccessManagement access={access} />;
  } else if (activeSection === "workbench" || activeSection === "audit") {
    content = <ProductionRoleWorkbench access={access} />;
  } else if (activeSection === "reports") {
    content = <OperationalReportsPanel access={access} />;
  } else if (activeSection === "system") {
    content = <OperationalSystemPanel access={access} />;
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.25rem] border border-cyan/18 bg-cyan/[0.07] p-5 ring-1 ring-cyan/10">
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:items-end">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{profile.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{profile.title}</h2>
            <p className="mt-3 max-w-4xl leading-7 text-paper/64">{profile.subtitle}</p>
          </div>
          <div className="min-w-0 rounded-[1rem] bg-ink/54 p-4 text-sm ring-1 ring-white/[0.08]">
            <p className="min-w-0 [overflow-wrap:anywhere] font-semibold">{access.user.name}</p>
            <p className="mt-1 min-w-0 [overflow-wrap:anywhere] text-paper/54">{access.user.email}</p>
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-lime">{formatStatusLabel(access.access.accessState)}</p>
          </div>
        </div>
      </article>

      <nav className="grid min-w-0 grid-cols-1 gap-2 rounded-[1rem] bg-white/[0.055] p-2 ring-1 ring-white/[0.1] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" aria-label="Operational workspace sections">
        {sections.map((section) => {
          const active = activeSection === section.key;
          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 min-w-0 items-center justify-center rounded-full px-4 py-2 text-center text-sm font-bold leading-5 transition ${active ? "bg-cyan text-ink" : "bg-white/[0.06] text-paper/68 ring-1 ring-white/[0.08] hover:bg-white/[0.1] hover:text-paper"}`}
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {content}
    </div>
  );
}

function ProductionRouteView({ routePath, access }: { routePath: string; access: ResolvedProductionAccess }) {
  if (!access.access.canOpenProtectedWorkspace) return <ProductionPendingAccess access={access} />;
  if (isOperationalCommandRole(access) && (
    routePath.endsWith("/admin") ||
    routePath.endsWith("/admin/users-roles") ||
    routePath.endsWith("/admin/access-requests") ||
    routePath.endsWith("/admin/audit-log") ||
    routePath.endsWith("/admin/system") ||
    routePath.endsWith("/tasks") ||
    routePath.endsWith("/notifications") ||
    routePath.endsWith("/reports") ||
    routePath.endsWith("/merseta") ||
    routePath.endsWith("/moderation") ||
    routePath.endsWith("/assessments/challenges") ||
    routePath.endsWith("/national/observatory")
  )) return <OperationalCommandWorkspace access={access} routePath={routePath} />;
  const lecturerFormMatch = routePath.match(/\/data-capturer\/forms\/([^/]+)$/);
  if (lecturerFormMatch) return <ProductionDataCaptureWorkspace access={access} assignmentId={lecturerFormMatch[1]} />;
  if (routePath.endsWith("/data-capturer")) return <ProductionDataCaptureWorkspace access={access} />;
  if (routePath.endsWith("/my-dashboard")) return <ProductionDashboard access={access} />;
  if (routePath.endsWith("/my-account") || routePath.endsWith("/my-affiliations")) return <ProductionAccountView access={access} />;
  if (
    routePath.endsWith("/tasks") ||
    routePath.endsWith("/notifications") ||
    routePath.endsWith("/reports") ||
    routePath.endsWith("/merseta") ||
    routePath.endsWith("/moderation") ||
    routePath.endsWith("/assessments/challenges") ||
    routePath.endsWith("/national/observatory") ||
    routePath.includes("/fgc-ekm/college/") ||
    routePath.includes("/fgc-ekm/workshops/")
  ) return <ProductionRoleWorkbench access={access} />;
  return <ProductionPortalHome access={access} />;
}

function PublicPendingAccess() {
  const stages = [
    ["Identity created", "Created by the registration API."],
    ["Email confirmed", "Confirmed through the configured identity flow."],
    ["Affiliation reviewed", "Approved by an authorised college or programme administrator."],
    ["Role activated", "Only an approved active role opens protected data."]
  ] as const;

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Access status</p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {stages.map(([stage, note], index) => (
            <div className="rounded-[0.95rem] bg-white/[0.055] p-4 text-paper/68 ring-1 ring-white/[0.1]" key={stage}>
              <Clock3 aria-hidden="true" size={19} />
              <p className="mt-3 font-semibold text-paper">{stage}</p>
              <p className="mt-1 text-xs leading-5 text-paper/48">{note}</p>
              <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] opacity-70">Step {index + 1}</p>
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-[1.1rem] bg-amber/10 p-6 text-amber ring-1 ring-amber/20">
        <FileWarning aria-hidden="true" size={28} />
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Protected data remains blocked.</h3>
        <p className="mt-4 leading-7">
          Sign in to see your persisted account state. This page does not infer approval from a browser-side profile.
        </p>
      </article>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "APPROVED" || status === "ACTIVE") return "bg-lime/14 text-lime ring-lime/20";
  if (status === "REJECTED" || status === "AFFILIATION_REJECTED" || status === "SUSPENDED") return "bg-rose-300/14 text-rose-100 ring-rose-300/25";
  return "bg-amber/14 text-amber ring-amber/20";
}

function AdminAccessManagement({ access }: { access: ResolvedProductionAccess }) {
  const [applicants, setApplicants] = useState<AdminApplicant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [reason, setReason] = useState("Verified by JEF administrator through production access-management workflow.");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");

  const pendingApplicants = applicants.filter((applicant) => applicant.accountState === "AFFILIATION_PENDING" || applicant.roles.some((role) => role.status === "REQUESTED" || role.status === "RETURNED"));
  const activeApplicants = applicants.filter((applicant) => !pendingApplicants.some((pending) => pending.id === applicant.id));
  const selectedApplicant = applicants.find((applicant) => applicant.id === selectedId) ?? pendingApplicants[0] ?? activeApplicants[0] ?? null;
  const selectedApplicantIsPending = selectedApplicant ? pendingApplicants.some((applicant) => applicant.id === selectedApplicant.id) : false;
  const pendingCount = pendingApplicants.length;

  const refreshQueue = async () => {
    setLoading(true);
    const response = await fetch("/api/fgc/admin/access-requests", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? "Access queue could not be loaded.");
    const nextApplicants = (payload.applicants ?? []) as AdminApplicant[];
    const nextPending = nextApplicants.filter((applicant) => applicant.accountState === "AFFILIATION_PENDING" || applicant.roles.some((role) => role.status === "REQUESTED" || role.status === "RETURNED"));
    setApplicants(nextApplicants);
    setSelectedId((current) => {
      if (current && nextApplicants.some((applicant) => applicant.id === current) && (!nextPending.length || nextPending.some((applicant) => applicant.id === current))) return current;
      return nextPending[0]?.id ?? nextApplicants[0]?.id ?? "";
    });
    setLoading(false);
  };

  useEffect(() => {
    refreshQueue().catch((error: Error) => {
      setMessage(error.message);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/fgc/reference/colleges", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { ok: boolean; colleges?: CollegeOption[] }) => {
        if (payload.ok) setColleges(payload.colleges ?? []);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) {
      setCampuses([]);
      return;
    }
    fetch(`/api/fgc/reference/colleges/${selectedCollegeId}/campuses`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { ok: boolean; campuses?: CampusOption[] }) => {
        if (payload.ok) setCampuses(payload.campuses ?? []);
      })
      .catch(() => setCampuses([]));
  }, [selectedCollegeId]);

  useEffect(() => {
    if (!selectedApplicant) return;
    const primaryRole = selectedApplicant.roles[0];
    setSelectedCollegeId(primaryRole?.collegeId ?? "");
    setSelectedCampusId(primaryRole?.campusId ?? "");
  }, [selectedApplicant?.id]);

  const runDecision = async (label: string, payload: Record<string, unknown>) => {
    if (!selectedApplicant) return;
    setSubmitting(label);
    setMessage("");
    try {
      const response = await fetch(`/api/fgc/admin/access-requests/${selectedApplicant.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, ...payload })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Decision could not be recorded.");
      setMessage(result.message ?? "Decision recorded.");
      await refreshQueue();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Decision failed.");
    } finally {
      setSubmitting("");
    }
  };

  if (!access.access.canOpenProtectedWorkspace || !["JEF_ADMIN_ACTIVE", "PLATFORM_SUPER_ACTIVE"].includes(access.access.accessState)) {
    return <ProductionPendingAccess access={access} />;
  }

  return (
    <div className="grid gap-6">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] xl:items-end">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">User and Access Management</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Pending affiliations, role decisions and governed repairs.</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-paper/62">
              Signed in as {access.user.name}. Decisions are written to the production audit trail and trigger in-app plus email notifications.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
              <p className="font-mono text-2xl font-semibold text-cyan">{applicants.length}</p>
              <p className="mt-1 text-xs text-paper/52">Applicants</p>
            </div>
            <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
              <p className="font-mono text-2xl font-semibold text-amber">{pendingCount}</p>
              <p className="mt-1 text-xs text-paper/52">Pending</p>
            </div>
            <div className="rounded-[0.95rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]">
              <p className="font-mono text-2xl font-semibold text-lime">{applicants.reduce((total, applicant) => total + applicant.formAssignments.length, 0)}</p>
              <p className="mt-1 text-xs text-paper/52">Forms</p>
            </div>
          </div>
        </div>
      </article>

      {message ? <p className="rounded-[0.95rem] border border-cyan/20 bg-cyan/10 p-4 text-sm font-semibold leading-6 text-cyan" role="status">{message}</p> : null}

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <aside className="grid min-w-0 content-start gap-3">
          {loading ? (
            <div className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">Loading access queue...</div>
          ) : applicants.length ? (
            <>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-amber">Pending affiliations and roles</p>
              {pendingApplicants.length ? pendingApplicants.map((applicant) => (
                <ApplicantQueueButton applicant={applicant} isSelected={selectedApplicant?.id === applicant.id} key={applicant.id} onSelect={() => setSelectedId(applicant.id)} />
              )) : (
                <div className="rounded-[1.1rem] border border-dashed border-lime/20 bg-lime/8 p-5 text-sm leading-6 text-lime">No pending affiliation or role decisions are waiting right now.</div>
              )}
              <p className="pt-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">Active and closed access records</p>
              {activeApplicants.map((applicant) => (
                <ApplicantQueueButton applicant={applicant} isSelected={selectedApplicant?.id === applicant.id} key={applicant.id} onSelect={() => setSelectedId(applicant.id)} />
              ))}
            </>
          ) : (
            <div className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">No applicant records are waiting in the access queue.</div>
          )}
        </aside>

        {selectedApplicant ? (
          <section className="grid min-w-0 gap-5">
            <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
              <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">{selectedApplicantIsPending ? "Pending access record" : "Access record"}</p>
                  <h4 className="mt-3 min-w-0 [overflow-wrap:anywhere] text-3xl font-semibold tracking-[-0.045em]">{selectedApplicant.name}</h4>
                  <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm text-paper/58">{selectedApplicant.jobTitle ?? "Role title not supplied"}</p>
                </div>
                <div className="grid min-w-0 gap-2 text-sm">
                  {[
                    ["Verified email", selectedApplicant.email],
                    ["Selected organisation", selectedApplicant.selectedOrganisation],
                    ["TVET college", selectedApplicant.tvetCollege ?? "Not selected"],
                    ["Campus", selectedApplicant.campus ?? "Campus pending"],
                    ["Registered", new Date(selectedApplicant.registrationDate).toLocaleString()],
                    ["Verification", selectedApplicant.emailVerified ? `Verified${selectedApplicant.verifiedAt ? ` on ${new Date(selectedApplicant.verifiedAt).toLocaleString()}` : ""}` : "Not verified"]
                  ].map(([label, value]) => (
                    <div className="grid min-w-0 gap-2 rounded-[0.85rem] bg-ink/52 p-3 sm:grid-cols-[10rem_minmax(0,1fr)]" key={label}>
                      <span className="text-paper/44">{label}</span>
                      <span className="min-w-0 [overflow-wrap:anywhere] font-semibold text-paper/84">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
              <div className={`mb-5 rounded-[0.95rem] p-4 text-sm font-semibold leading-6 ring-1 ${
                selectedApplicant.accountState === "AFFILIATION_PENDING"
                  ? "bg-amber/10 text-amber ring-amber/20"
                  : selectedApplicant.accountState === "EMAIL_UNVERIFIED"
                    ? "bg-cyan/10 text-cyan ring-cyan/20"
                    : "bg-lime/10 text-lime ring-lime/20"
              }`}>
                {selectedApplicant.accountState === "AFFILIATION_PENDING"
                  ? "Affiliation approval is required before protected workspace access can be granted."
                  : selectedApplicant.accountState === "EMAIL_UNVERIFIED"
                    ? "Email verification is still outstanding. Role decisions can be prepared, but access will not activate until verification is complete."
                    : "Affiliation is already governed. Use the role controls below for any remaining role-specific decisions."}
              </div>
              <Field id="decisionReason" label="Decision reason">
                <textarea className={`${controlClass} min-h-24 py-3`} id="decisionReason" value={reason} onChange={(event) => setReason(event.target.value)} />
              </Field>
              <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                <button className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-lime px-4 py-2 text-center text-sm font-bold leading-5 text-ink disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={Boolean(submitting) || selectedApplicant.accountState !== "AFFILIATION_PENDING" || !selectedApplicant.emailVerified} onClick={() => runDecision("approve-affiliation", { action: "APPROVE_AFFILIATION" })}>
                  <ShieldCheck aria-hidden="true" size={16} /> Approve affiliation
                </button>
                <button className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-amber px-4 py-2 text-center text-sm font-bold leading-5 text-ink disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={Boolean(submitting)} onClick={() => runDecision("clarify", { action: "REQUEST_CLARIFICATION" })}>
                  <MailQuestion aria-hidden="true" size={16} /> Request clarification
                </button>
                <button className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-rose-300 px-4 py-2 text-center text-sm font-bold leading-5 text-ink disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={Boolean(submitting) || selectedApplicant.accountState === "ACTIVE"} onClick={() => runDecision("reject", { action: "REJECT_AFFILIATION" })}>
                  <Ban aria-hidden="true" size={16} /> Reject affiliation
                </button>
                <button className="inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 text-center text-sm font-bold leading-5 text-paper ring-1 ring-white/[0.12] disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={Boolean(submitting)} onClick={() => runDecision("suspend", { action: "SUSPEND_AFFILIATION" })}>
                  <Ban aria-hidden="true" size={16} /> Suspend
                </button>
              </div>
            </article>

            <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Correct college or campus</p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Scope correction</h4>
                </div>
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan px-5 text-sm font-bold text-ink disabled:opacity-50" type="button" disabled={Boolean(submitting) || !selectedCollegeId} onClick={() => runDecision("correct-scope", { action: "CORRECT_SCOPE", collegeId: selectedCollegeId, campusId: selectedCampusId || null })}>
                  <ClipboardCheck aria-hidden="true" size={16} /> Save corrected scope
                </button>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field id="correctCollege" label="TVET college">
                  <select className={controlClass} id="correctCollege" value={selectedCollegeId} onChange={(event) => setSelectedCollegeId(event.target.value)}>
                    <option className="bg-ink" value="">Select college</option>
                    {colleges.map((college) => <option className="bg-ink" key={college.id} value={college.id}>{college.official_name}</option>)}
                  </select>
                </Field>
                <Field id="correctCampus" label="Campus">
                  <select className={controlClass} id="correctCampus" value={selectedCampusId} onChange={(event) => setSelectedCampusId(event.target.value)}>
                    <option className="bg-ink" value="">Campus pending / college-wide</option>
                    {campuses.map((campus) => <option className="bg-ink" key={campus.id} value={campus.id}>{campus.official_name}</option>)}
                  </select>
                </Field>
              </div>
            </article>

            <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Separate role decisions</p>
                  <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Requested roles</h4>
                </div>
                {!selectedApplicant.roles.some((role) => role.code === "LECTURER") ? (
                  <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.08] px-5 text-sm font-bold text-paper ring-1 ring-white/[0.12] disabled:opacity-50" type="button" disabled={Boolean(submitting)} onClick={() => runDecision("add-lecturer", { action: "ADD_ROLE_REQUEST", roleCode: "LECTURER" })}>
                    <UserPlus aria-hidden="true" size={16} /> Add Lecturer request
                  </button>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3">
                {selectedApplicant.roles.map((role) => (
                  <div className="grid min-w-0 gap-4 rounded-[1rem] bg-ink/52 p-4 ring-1 ring-white/[0.08] 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,auto)] 2xl:items-center" key={role.id}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="min-w-0 [overflow-wrap:anywhere] text-xl font-semibold tracking-[-0.035em]">{role.name}</h5>
                        <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-bold leading-5 ring-1 ${statusTone(role.status)}`}>{role.status}</span>
                      </div>
                      <p className="mt-2 min-w-0 [overflow-wrap:anywhere] text-sm leading-6 text-paper/58">{role.collegeName ?? "Scope pending"}{role.campusName ? ` - ${role.campusName}` : ""}</p>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap 2xl:flex-nowrap 2xl:justify-end">
                      <button className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center rounded-full bg-lime px-4 py-2 text-sm font-bold leading-5 text-ink disabled:opacity-50 sm:flex-none 2xl:w-[8.5rem]" type="button" disabled={Boolean(submitting) || role.status === "APPROVED"} onClick={() => runDecision(`approve-${role.id}`, { action: "DECIDE_ROLE", roleAssignmentId: role.id, roleDecision: "APPROVED" })}>Approve role</button>
                      <button className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center rounded-full bg-amber px-4 py-2 text-sm font-bold leading-5 text-ink disabled:opacity-50 sm:flex-none 2xl:w-[8.5rem]" type="button" disabled={Boolean(submitting)} onClick={() => runDecision(`return-${role.id}`, { action: "DECIDE_ROLE", roleAssignmentId: role.id, roleDecision: "RETURNED" })}>Return</button>
                      <button className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center rounded-full bg-rose-300 px-4 py-2 text-sm font-bold leading-5 text-ink disabled:opacity-50 sm:flex-none 2xl:w-[8.5rem]" type="button" disabled={Boolean(submitting)} onClick={() => runDecision(`reject-${role.id}`, { action: "DECIDE_ROLE", roleAssignmentId: role.id, roleDecision: "REJECTED" })}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Assigned forms</p>
              <div className="mt-4 grid gap-3">
                {selectedApplicant.formAssignments.length ? selectedApplicant.formAssignments.map((assignment) => (
                  <div className="rounded-[0.9rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={assignment.id}>
                    <p className="font-semibold">{assignment.templateName}</p>
                    <p className="mt-1 text-sm text-paper/52">{assignment.status} - assigned {new Date(assignment.createdAt).toLocaleString()}</p>
                  </div>
                )) : <p className="rounded-[0.9rem] border border-dashed border-white/[0.14] p-4 text-sm text-paper/54">No form assignment yet. The lecturer form is assigned automatically after affiliation approval and Lecturer role approval.</p>}
              </div>
            </article>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ApplicantQueueButton({ applicant, isSelected, onSelect }: { applicant: AdminApplicant; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`min-h-24 min-w-0 rounded-[1rem] p-4 text-left ring-1 transition ${isSelected ? "bg-cyan/12 ring-cyan/30" : "bg-white/[0.055] ring-white/[0.1] hover:bg-white/[0.08]"}`}
      type="button"
      onClick={onSelect}
    >
      <span className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block min-w-0 [overflow-wrap:anywhere] font-semibold">{applicant.name}</span>
          <span className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-paper/52">{applicant.email}</span>
        </span>
        <span className={`max-w-full rounded-full px-2.5 py-1 text-[0.62rem] font-bold leading-5 ring-1 ${statusTone(applicant.accountState)}`}>{formatStatusLabel(applicant.accountState)}</span>
      </span>
      <span className="mt-3 block min-w-0 [overflow-wrap:anywhere] text-sm leading-5 text-paper/58">{applicant.roles.map((role) => `${role.name}: ${formatStatusLabel(role.status)}`).join(" / ")}</span>
    </button>
  );
}

function RouteMap({ routeDefinitions }: { routeDefinitions: FgcRouteDefinition[] }) {
  const groups = useMemo(() => Array.from(new Set(routeDefinitions.map((route) => route.group))), [routeDefinitions]);

  return (
    <div className="grid gap-5">
      {groups.map((group) => (
        <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]" key={group}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">{group}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {routeDefinitions.filter((route) => route.group === group).map((route) => (
              <Link className="flex min-h-12 items-center justify-between gap-3 rounded-[0.85rem] bg-ink/52 px-4 text-sm font-semibold text-paper/72 transition hover:bg-white/[0.1] hover:text-paper" href={route.route} key={route.route}>
                <span>{route.title}</span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-paper/38">{route.access}</span>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function GenericProtectedView({ routePath, routeDefinitions }: { routePath: string; routeDefinitions: FgcRouteDefinition[] }) {
  const definition = routeDefinitions.find((route) => route.route === routePath);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <Route aria-hidden="true" className="text-cyan" size={28} />
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{definition?.title ?? "Configured FGC route"}</h3>
        <p className="mt-4 leading-7 text-paper/62">
          This route is registered in the FGC product architecture. It opens only through authenticated production APIs and displays an empty state when no canonical records exist.
        </p>
        <Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-cyan px-5 text-sm font-bold text-ink" href="/fgc-ekm">
          Open current dashboard
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </article>
      <article className="rounded-[1.1rem] bg-white/[0.055] p-6 ring-1 ring-white/[0.1]">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime">Permission preview</p>
        <div className="mt-5 grid gap-3">
          {(definition?.primaryRole ? [definition.primaryRole] : ["JEF Administrator"]).map((role) => (
            <div className="rounded-[0.95rem] bg-ink/52 p-4" key={role}>
              <p className="font-semibold">{role}</p>
              <p className="mt-2 text-sm leading-6 text-paper/56">Access must be granted through an approved role assignment, institution scope, approver and audit event.</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export function FgcAccessExperience({ routePath, initialAccess = null }: { routePath: string; initialAccess?: ProductionAccessResult }) {
  const [routeDefinitions] = useState<FgcRouteDefinition[]>(fgcRouteDefinitions);
  const [productionAccess, setProductionAccess] = useState<ProductionAccessResult>(initialAccess);
  const [productionAccessReady, setProductionAccessReady] = useState(Boolean(initialAccess));

  useEffect(() => {
    let live = true;
    fetch("/api/fgc/auth/me", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null) as ProductionAccessResult;
        if (!live) return;
        setProductionAccess(response.ok ? payload : null);
        setProductionAccessReady(true);
      })
      .catch(() => {
        if (!live) return;
        setProductionAccess(null);
        setProductionAccessReady(true);
      });

    return () => {
      live = false;
    };
  }, []);

  const title = routeTitle(routePath, routeDefinitions);
  const group = routeGroup(routePath, routeDefinitions);
  const currentRoute = routeDefinitions.find((route) => route.route === routePath);
  const resolvedProductionAccess = productionAccess?.ok ? productionAccess : null;

  let content: ReactNode = (
    <div className="grid min-h-80 place-items-center rounded-[1.1rem] bg-white/[0.055] ring-1 ring-white/[0.1]">
      <p className="text-paper/62">Loading FGC access model...</p>
    </div>
  );

  if (routeDefinitions.length && (productionAccessReady || resolvedProductionAccess || routePath.endsWith("/sign-in") || routePath.endsWith("/sign-up") || routePath.includes("/invitation/") || routePath.endsWith("/privacy") || routePath.endsWith("/accessibility") || routePath.endsWith("/help"))) {
    if (resolvedProductionAccess && (routePath.endsWith("/sign-in") || routePath.endsWith("/sign-up") || routePath.endsWith("/home"))) {
      content = <ProductionRouteView routePath={routePath} access={resolvedProductionAccess} />;
    }
    else if (routePath.endsWith("/sign-up")) content = <RegistrationStepper />;
    else if (routePath.endsWith("/sign-in")) content = <SignInPanel />;
    else if (routePath.endsWith("/confirm-email") || routePath.endsWith("/verification-pending")) content = <PublicPendingAccess />;
    else if (routePath.endsWith("/access-pending")) content = resolvedProductionAccess ? <ProductionPendingAccess access={resolvedProductionAccess} /> : <PublicPendingAccess />;
    else if (routePath.includes("/invitation/")) content = <RegistrationStepper />;
    else if (routePath.endsWith("/privacy")) content = <RouteMap routeDefinitions={routeDefinitions.filter((route) => route.access !== "Protected")} />;
    else if (routePath.endsWith("/accessibility") || routePath.endsWith("/help")) content = <RouteMap routeDefinitions={routeDefinitions} />;
    else if (routePath.startsWith("/fgc-ekm/admin") && resolvedProductionAccess) {
      content = <ProductionRouteView routePath={routePath} access={resolvedProductionAccess} />;
    }
    else if (routePath.startsWith("/fgc-ekm/admin") && !productionAccessReady) {
      content = (
        <div className="grid min-h-80 place-items-center rounded-[1.1rem] bg-white/[0.055] ring-1 ring-white/[0.1]">
          <p className="text-paper/62">Resolving production session...</p>
        </div>
      );
    }
    else if (routePath.startsWith("/fgc-ekm/admin")) {
      content = <ProtectedAccessPrompt />;
    }
    else if (routePath.startsWith("/fgc-ekm/data-capturer/forms/") && resolvedProductionAccess) {
      content = <ProductionRouteView routePath={routePath} access={resolvedProductionAccess} />;
    }
    else if (routePath.startsWith("/fgc-ekm/data-capturer/forms/") && !productionAccessReady) {
      content = (
        <div className="grid min-h-80 place-items-center rounded-[1.1rem] bg-white/[0.055] ring-1 ring-white/[0.1]">
          <p className="text-paper/62">Resolving production session...</p>
        </div>
      );
    }
    else if (routePath.startsWith("/fgc-ekm/data-capturer/forms/")) {
      content = <ProtectedAccessPrompt />;
    }
    else if (currentRoute?.access === "Protected") {
      if (!productionAccessReady) {
        content = (
          <div className="grid min-h-80 place-items-center rounded-[1.1rem] bg-white/[0.055] ring-1 ring-white/[0.1]">
            <p className="text-paper/62">Resolving production session...</p>
          </div>
        );
      } else if (resolvedProductionAccess) {
        content = <ProductionRouteView routePath={routePath} access={resolvedProductionAccess} />;
      } else {
        content = <ProtectedAccessPrompt />;
      }
    }
    else content = <GenericProtectedView routePath={routePath} routeDefinitions={routeDefinitions} />;
  }

  return (
    <AccessShell
      routePath={routePath}
      title={title}
      eyebrow={group}
      signedInWorkspaceHref={resolvedProductionAccess?.access.expectedPortal ?? null}
    >
      {content}
    </AccessShell>
  );
}
