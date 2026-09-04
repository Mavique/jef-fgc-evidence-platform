"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Database, FileText, Gauge, Layers3, LockKeyhole, Search, ShieldCheck, UserCog } from "lucide-react";
import { evidenceStatuses, fgcProduct, rolePermissions, type EvidenceStatus, type UserRole } from "@/content/merseta-fgc";
import type { FgcCurrentUserResult } from "@/lib/fgc/current-user";
import type { FgcRoleWorkbench } from "@/lib/fgc/workbench";

const tabs = ["Observatory", "Evidence Spine", "Triangulation", "Lecturer Capability", "Data Capture", "Curriculum Catalogue", "Corrective Actions", "Reports & Decisions"] as const;

type Tab = (typeof tabs)[number];
type ResolvedProductionAccess = Extract<FgcCurrentUserResult, { ok: true }>;

const iconMap = {
  Observatory: Gauge,
  "Evidence Spine": Database,
  Triangulation: Layers3,
  "Lecturer Capability": ClipboardCheck,
  "Data Capture": ClipboardCheck,
  "Curriculum Catalogue": Search,
  "Corrective Actions": AlertTriangle,
  "Reports & Decisions": FileText
};

function productionAccessRole(accessState: ResolvedProductionAccess["access"]["accessState"]): UserRole {
  if (accessState === "JEF_ADMIN_ACTIVE" || accessState === "PLATFORM_SUPER_ACTIVE") return "JEF Administrator";
  if (accessState === "MERSETA_ACTIVE") return "merSETA Oversight";
  if (accessState === "ASSESSOR_ACTIVE") return "Assessor";
  if (accessState === "MODERATOR_ACTIVE") return "Moderator";
  if (accessState === "COLLEGE_ACTIVE") return "College Evidence Owner";
  if (accessState === "LECTURER_ACTIVE") return "Lecturer";
  return "Lecturer";
}

function metricToneClass(tone: FgcRoleWorkbench["metrics"]["metrics"][number]["tone"] = "cyan") {
  if (tone === "lime") return "text-lime";
  if (tone === "amber") return "text-amber";
  if (tone === "rose") return "text-rose-300";
  return "text-cyan";
}

function statusClass(status: EvidenceStatus) {
  return evidenceStatuses[status].tone;
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  return <span className={`inline-flex max-w-full items-center rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase leading-5 tracking-[0.13em] ring-1 ${statusClass(status)}`}>{status}</span>;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MetricCard({ label, value, note, tone = "cyan" }: { label: string; value: string | number; note: string; tone?: "cyan" | "lime" | "amber" | "rose" }) {
  return (
    <article className="min-w-0 rounded-[1.05rem] border border-white/[0.1] bg-white/[0.055] p-5">
      <p className="min-w-0 [overflow-wrap:anywhere] font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/50">{label}</p>
      <p className={`mt-5 text-4xl font-semibold tracking-[-0.06em] ${metricToneClass(tone)}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-paper/62">{note}</p>
    </article>
  );
}

function EmptyState({ title, body, actionHref, actionLabel }: { title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return (
    <article className="rounded-[1.05rem] border border-dashed border-white/[0.16] bg-white/[0.035] p-6">
      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-paper">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-paper/58">{body}</p>
      {actionHref && actionLabel ? <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href={actionHref}>{actionLabel}</Link> : null}
    </article>
  );
}

function AppTable({ children, headings }: { children: React.ReactNode; headings: string[] }) {
  return (
    <div className="overflow-x-auto rounded-[1.05rem] border border-white/[0.1]">
      <table className="min-w-[860px] w-full border-collapse text-left text-sm">
        <thead className="bg-white/[0.08] text-paper/62">
          <tr>{headings.map((heading) => <th className="px-4 py-3 font-mono text-[0.66rem] uppercase tracking-[0.15em]" key={heading} scope="col">{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/[0.08]">{children}</tbody>
      </table>
    </div>
  );
}

function WorkbenchError({ message }: { message: string }) {
  return <div className="rounded-[1.05rem] border border-rose-300/25 bg-rose-300/10 p-5 text-sm font-semibold leading-6 text-rose-100" role="alert">{message}</div>;
}

function ObservatoryPanel({ workbench }: { workbench: FgcRoleWorkbench }) {
  const workflowRecords = workbench.submissions.length;
  const documentSupportedPending = workbench.submissions.filter((submission) => submission.sourceStatus.toLowerCase().includes("document")).length;

  return (
    <div className="grid gap-6">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        {workbench.metrics.metrics.map((metric) => <MetricCard key={metric.id} label={metric.label} note={metric.note} tone={metric.tone} value={metric.value} />)}
        <MetricCard label="Workflow records" note="Submission lifecycle count only; not a verification outcome." tone="amber" value={workflowRecords} />
        <MetricCard label="Verified outcomes" note="Unavailable until a role-scoped verification aggregate query is exposed." tone="lime" value="Unavailable" />
        <MetricCard label="Document-supported pending" note="Document support remains pending until an authorised review accepts it." value={documentSupportedPending} />
      </div>
      <article className="rounded-[1.15rem] border border-cyan/18 bg-cyan/[0.045] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan">Production observatory</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Governed persisted data only.</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-paper/64">Counts are derived from role-scoped PostgreSQL records. Self-reported learner use, typed publication dates and attendance are not treated as verified outcomes.</p>
      </article>
    </div>
  );
}

function SubmissionsPanel({ workbench }: { workbench: FgcRoleWorkbench }) {
  if (!workbench.submissions.length) return <EmptyState title="No scoped submissions available" body="No canonical production submissions are visible in this role scope. This is an empty state, not a zero-performance conclusion." />;

  return (
    <AppTable headings={["Reference", "Submitter", "Institution", "Programme", "Workflow", "Completion", "Updated", "Drill-down"]}>
      {workbench.submissions.map((submission) => (
        <tr className="bg-white/[0.025]" key={submission.id}>
          <td className="px-4 py-4 font-mono text-cyan">{submission.id.slice(0, 8)}</td>
          <td className="px-4 py-4"><span className="block font-semibold">{submission.submitterName}</span><span className="block text-xs text-paper/46">{submission.submitterEmail}</span></td>
          <td className="px-4 py-4">{[submission.collegeName, submission.campusName].filter(Boolean).join(" / ") || "Scope unavailable"}</td>
          <td className="px-4 py-4">{[submission.programmeName, submission.moduleName].filter(Boolean).join(" / ") || "Not captured"}</td>
          <td className="px-4 py-4">{formatStatus(submission.status)}</td>
          <td className="px-4 py-4 font-mono text-cyan">{submission.completionPercent}%</td>
          <td className="px-4 py-4">{new Date(submission.updatedAt).toLocaleString()}</td>
          <td className="px-4 py-4"><Link className="inline-flex min-h-10 items-center justify-center rounded-full bg-white/[0.08] px-4 text-xs font-bold text-paper ring-1 ring-white/[0.12]" href={`/fgc-ekm/tasks?submission=${submission.id}`}>Open record</Link></td>
        </tr>
      ))}
    </AppTable>
  );
}

function QueuesPanel({ workbench }: { workbench: FgcRoleWorkbench }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {workbench.queues.map((queue) => (
        <article className="rounded-[1.05rem] bg-ink/54 p-5 ring-1 ring-white/[0.08]" key={queue.id}>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-paper/42">{queue.label}</p>
          <p className="mt-3 text-4xl font-semibold text-cyan">{queue.count}</p>
          <p className="mt-3 text-sm leading-6 text-paper/58">{queue.description}</p>
        </article>
      ))}
    </div>
  );
}

function NotificationsAndAudit({ workbench }: { workbench: FgcRoleWorkbench }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <article className="rounded-[1.05rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
        <h3 className="text-2xl font-semibold tracking-[-0.04em]">Notifications</h3>
        <div className="mt-4 grid gap-3">
          {workbench.notifications.length ? workbench.notifications.slice(0, 6).map((notification) => (
            <div className="rounded-[0.86rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={notification.id}>
              <p className="font-semibold">{notification.subject}</p>
              <p className="mt-1 text-sm leading-6 text-paper/56">{notification.body}</p>
              <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-cyan">{formatStatus(notification.status)} / {new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="text-sm text-paper/52">No scoped notifications are available.</p>}
        </div>
      </article>
      <article className="rounded-[1.05rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
        <h3 className="text-2xl font-semibold tracking-[-0.04em]">Audit trail</h3>
        <div className="mt-4 grid gap-3">
          {workbench.auditEvents.length ? workbench.auditEvents.slice(0, 6).map((event) => (
            <div className="rounded-[0.86rem] bg-ink/52 p-4 ring-1 ring-white/[0.08]" key={event.id}>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-lime">{event.action}</p>
              <p className="mt-2 text-sm leading-6 text-paper/56">{event.reason ?? event.objectType}</p>
              <p className="mt-2 text-xs text-paper/40">{new Date(event.createdAt).toLocaleString()}</p>
            </div>
          )) : <p className="text-sm text-paper/52">No scoped audit events are available.</p>}
        </div>
      </article>
    </div>
  );
}

function ProductionTabPanel({ access, workbench, tab }: { access: ResolvedProductionAccess; workbench: FgcRoleWorkbench | null; tab: Tab }) {
  if (!workbench) return <WorkbenchError message="The production workbench is unavailable. No operational fallback data was loaded." />;

  const hasApprovedLecturerRole = access.roles.some((role) => role.code === "LECTURER" && role.status === "APPROVED");
  const canOperateWorkbench = ["JEF_ADMIN_ACTIVE", "PLATFORM_SUPER_ACTIVE", "COLLEGE_ACTIVE", "ASSESSOR_ACTIVE", "MODERATOR_ACTIVE"].includes(access.access.accessState);

  if (tab === "Observatory") return <ObservatoryPanel workbench={workbench} />;
  if (tab === "Evidence Spine") return <div className="grid gap-6"><QueuesPanel workbench={workbench} /><SubmissionsPanel workbench={workbench} /></div>;
  if (tab === "Triangulation") return <EmptyState title="Triangulation source imports unavailable" body="No authorised timetable, attendance or EON/XR analytics import query exists in this slice. Planned use and self-reported learner activity remain pending verification." />;
  if (tab === "Lecturer Capability") return <div className="grid gap-6"><EmptyState title="Capability assessments pending" body="Independent capability is not derived from self-assessment, attendance or publication text. It appears only after authorised assessor and moderator records exist." /><QueuesPanel workbench={workbench} /></div>;
  if (tab === "Data Capture") return hasApprovedLecturerRole ? <EmptyState title="Open assigned lecturer capture forms" body="Lecturer views are limited to persisted assignments returned by the authenticated session." actionHref="/fgc-ekm/data-capturer" actionLabel="Open lecturer workspace" /> : <EmptyState title="Lecturer role required" body="This role has no lecturer capture forms. Data entry requires a separately approved Lecturer role." />;
  if (tab === "Curriculum Catalogue") return <EmptyState title="Governed curriculum catalogue" body="The national TVET catalogue remains intentionally version-controlled reference data. Campus offering claims remain pending unless explicitly verified through canonical reference workflows." />;
  if (tab === "Corrective Actions") return canOperateWorkbench ? <div className="grid gap-6"><EmptyState title="Corrective actions derive from review decisions" body="No browser-side action register is displayed. Actions appear through scoped workbench records and notifications after governed review activity." actionHref="/fgc-ekm/tasks" actionLabel="Open work queue" /><NotificationsAndAudit workbench={workbench} /></div> : <EmptyState title="No corrective actions visible" body="No corrective actions are available to this role scope." />;
  return <NotificationsAndAudit workbench={workbench} />;
}

export function FgcEkmApp() {
  const router = useRouter();
  const roles = Object.keys(rolePermissions) as UserRole[];
  const [role, setRole] = useState<UserRole>("JEF Administrator");
  const [tab, setTab] = useState<Tab>("Observatory");
  const [authReady, setAuthReady] = useState(false);
  const [productionAccess, setProductionAccess] = useState<ResolvedProductionAccess | null>(null);
  const [workbench, setWorkbench] = useState<FgcRoleWorkbench | null>(null);
  const [workbenchError, setWorkbenchError] = useState("");

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (requestedTab === "data-capture") setTab("Data Capture");
    let live = true;
    fetch("/api/fgc/auth/me", { cache: "no-store" })
      .then((response) => response.json() as Promise<FgcCurrentUserResult>)
      .then((result) => {
        if (!live) return;
        if (result.ok) {
          setProductionAccess(result);
          setRole(productionAccessRole(result.access.accessState));
        }
      })
      .finally(() => {
        if (live) setAuthReady(true);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (authReady && !productionAccess) router.replace("/fgc-ekm/sign-in");
  }, [authReady, router, productionAccess]);

  useEffect(() => {
    if (!productionAccess?.access.canOpenProtectedWorkspace) {
      setWorkbench(null);
      return;
    }
    let live = true;
    setWorkbenchError("");
    fetch("/api/fgc/workbench", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null) as { ok?: boolean; message?: string; workbench?: FgcRoleWorkbench } | null;
        if (!response.ok || !payload?.ok || !payload.workbench) throw new Error(payload?.message ?? "FGC production workbench is unavailable.");
        if (live) setWorkbench(payload.workbench);
      })
      .catch((error) => {
        if (!live) return;
        setWorkbench(null);
        setWorkbenchError(error instanceof Error ? error.message : "FGC production workbench is unavailable.");
      });
    return () => {
      live = false;
    };
  }, [productionAccess]);

  const permissions = useMemo(() => rolePermissions[role], [role]);
  const signedInName = productionAccess?.user.name ?? role;
  const signedInEmail = productionAccess?.user.email ?? "Production user";
  const signedInRole = productionAccess?.access.activeRole?.name ?? role;

  const handleSignOut = async () => {
    await fetch("/api/fgc/auth/logout", { method: "POST" }).catch(() => undefined);
    setProductionAccess(null);
    setWorkbench(null);
    router.push("/fgc-ekm/sign-in");
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

  if (!productionAccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061018] px-4 pt-24 text-paper">
        <div className="max-w-md rounded-[1.15rem] border border-white/[0.12] bg-white/[0.055] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <LockKeyhole aria-hidden="true" className="mx-auto text-cyan" size={30} />
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Sign in required</h1>
          <p className="mt-3 text-sm leading-6 text-paper/62">FGC App is a protected role workspace. Sign in with an approved role before viewing evidence dashboards.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href="/fgc-ekm/sign-in">Go to sign in</Link>
        </div>
      </main>
    );
  }

  if (!productionAccess.access.canOpenProtectedWorkspace) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#061018] px-4 pt-24 text-paper">
        <div className="max-w-lg rounded-[1.15rem] border border-amber/25 bg-amber/10 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
          <LockKeyhole aria-hidden="true" className="mx-auto text-amber" size={30} />
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Access pending</h1>
          <p className="mt-3 text-sm leading-6 text-paper/68">Your production identity is signed in, but the governed FGC workspace opens only after affiliation and role approval.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-bold text-ink transition hover:bg-lime" href={productionAccess.access.expectedPortal}>View access status</Link>
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
                <div><p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-paper/48">Secure workspace</p><h1 className="text-xl font-semibold tracking-[-0.04em]">FGC for EKM</h1></div>
              </div>
              <label className="mt-5 block text-sm font-semibold text-paper/72" htmlFor="role">Role view</label>
              <select className="mt-2 w-full rounded-[0.85rem] border border-white/[0.12] bg-white/[0.08] px-3 py-3 text-sm text-paper outline-none transition focus:border-cyan disabled:cursor-not-allowed disabled:opacity-60" id="role" value={role} disabled>
                {roles.map((item) => <option className="bg-ink text-paper" key={item}>{item}</option>)}
              </select>
              <p className="mt-2 text-xs leading-5 text-paper/44">Your approved production role controls this workspace view.</p>
              <div className="mt-5 rounded-[0.95rem] bg-cyan p-4 text-ink">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em]">Signed in</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{signedInName}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-ink/72">{signedInEmail}</p>
                <p className="mt-3 rounded-[0.75rem] bg-ink/10 p-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/78">{signedInRole}</p>
                <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-4 text-sm font-bold text-paper transition hover:bg-surface" type="button" onClick={handleSignOut}>Sign out</button>
              </div>
              <nav aria-label="FGC app sections" className="mt-6 grid gap-2">
                {tabs.map((item) => {
                  const Icon = iconMap[item];
                  const active = tab === item;
                  return <button className={`flex min-h-11 items-center gap-3 rounded-[0.86rem] px-3 text-left text-sm font-semibold transition duration-500 ${active ? "bg-paper text-ink" : "bg-white/[0.055] text-paper/66 hover:bg-white/[0.1] hover:text-paper"}`} key={item} type="button" onClick={() => setTab(item)}><Icon size={17} />{item}</button>;
                })}
              </nav>
              <div className="mt-6 rounded-[0.95rem] bg-white/[0.06] p-4 ring-1 ring-white/[0.1]">
                <p className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-cyan"><LockKeyhole size={14} /> Permissions</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-paper/62">{permissions.slice(0, 3).map((permission) => <li key={permission}>- {permission}</li>)}</ul>
              </div>
            </aside>
            <div className="min-w-0 rounded-[1.05rem] bg-[#071522] p-4 ring-1 ring-white/[0.1] md:p-6">
              <header className="grid min-w-0 gap-5 border-b border-white/10 pb-6 2xl:grid-cols-[minmax(0,1fr)_minmax(18rem,auto)] 2xl:items-end">
                <div className="min-w-0">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-lime">Evidence Validation & Adoption Intelligence Platform</p>
                  <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.35rem,4.4vw,5.3rem)] font-semibold leading-[0.88] tracking-[-0.062em]">{fgcProduct.name}</h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-paper/62">Production metric layer / governed PostgreSQL records only / scope: {workbench?.scope.label ?? "resolving"}</p>
                </div>
                <div className="grid min-w-0 gap-3 2xl:min-w-72">
                  <label className="sr-only" htmlFor="evidence-search">Search scoped evidence</label>
                  <div className="flex items-center gap-3 rounded-full bg-white/[0.08] px-4 py-3 ring-1 ring-white/[0.1]"><Search size={17} className="text-cyan" /><input id="evidence-search" className="w-full bg-transparent text-sm outline-none placeholder:text-paper/38" placeholder="Search scoped production evidence" /></div>
                  <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink"><CheckCircle2 size={14} /> Production session online</span><span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-bold text-paper/72 ring-1 ring-white/[0.1]"><UserCog size={14} /> {role}</span></div>
                </div>
              </header>
              <div className="mt-6 grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {Object.entries(evidenceStatuses).map(([status, meta]) => <div className="min-w-0 rounded-[0.95rem] bg-white/[0.045] p-4 ring-1 ring-white/[0.08]" key={status}><StatusBadge status={status as EvidenceStatus} /><p className="mt-3 text-xs leading-5 text-paper/56">{meta.explanation}</p></div>)}
              </div>
              <div className="mt-6">{workbenchError ? <WorkbenchError message={workbenchError} /> : <ProductionTabPanel access={productionAccess} workbench={workbench} tab={tab} />}</div>
              <footer className="mt-8 rounded-[1rem] bg-amber p-4 text-sm font-semibold leading-6 text-ink">Production access notice: this dashboard refuses non-persisted evidence. Empty panels mean source imports, submissions, reviews or scoped records have not been created yet.</footer>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
