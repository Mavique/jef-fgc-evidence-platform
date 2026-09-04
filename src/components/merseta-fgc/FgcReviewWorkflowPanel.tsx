"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FgcWorkbenchSubmission } from "@/lib/fgc/workbench";

type Props = { accessState: string; selectedSubmissionId: string; submissions: FgcWorkbenchSubmission[]; onChanged: () => Promise<void> };
type Assignment = { id: string; submissionId: string; type: "ASSESSOR" | "MODERATOR"; assigneeUserId: string; status: string; concurrencyVersion: number; submissionReference: string; lecturerName: string; collegeName: string | null; campusName: string | null; programmeName: string | null; reportingPeriodName: string | null; submissionVersionId: string; submissionStatus: string; evidenceCount: number; evidencePendingCount: number; assignedAt: string; dueAt: string | null };

function errorText(payload: { message?: string }) { return payload.message ?? "The review operation could not be completed."; }

export function FgcReviewWorkflowPanel({ accessState, selectedSubmissionId, submissions, onChanged }: Props) {
  const isJef = accessState === "JEF_ADMIN_ACTIVE";
  const type = accessState === "MODERATOR_ACTIVE" ? "MODERATOR" : "ASSESSOR";
  const selectedSubmission = submissions.find((submission) => submission.id === selectedSubmissionId) ?? submissions[0];
  const [reviewers, setReviewers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [handoffType, setHandoffType] = useState<"ASSESSOR" | "MODERATOR">("ASSESSOR");
  const [queue, setQueue] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState<Assignment[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [reason, setReason] = useState("");
  const [decisions, setDecisions] = useState('{"outcome":""}');
  const [outcomeStatus, setOutcomeStatus] = useState<"CONFIRMED" | "CHANGED" | "FURTHER_EVIDENCE_REQUESTED" | "REASSESSMENT_REQUESTED">("CONFIRMED");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const requestGeneration = useRef(0);

  const selectedAssignment = useMemo(() => queue.find((item) => item.id === selectedAssignmentId) ?? queue[0], [queue, selectedAssignmentId]);
  function parseDecisions() {
    try { return JSON.parse(decisions) as Record<string, unknown>; }
    catch { setMessage("Enter valid JSON for the review outcome."); return null; }
  }

  async function loadJefData() {
    if (!selectedSubmissionId) return;
    const generation = ++requestGeneration.current;
    const [eligibleResponse, historyResponse] = await Promise.all([
      fetch(`/api/fgc/review-assignments?view=eligible&type=${handoffType}&submissionId=${selectedSubmissionId}`, { cache: "no-store" }),
      fetch(`/api/fgc/review-assignments?view=history&type=${handoffType}&submissionId=${selectedSubmissionId}`, { cache: "no-store" })
    ]);
    const eligible = await eligibleResponse.json() as { reviewers?: Array<{ id: string; name: string; email: string }>; message?: string };
    const history = await historyResponse.json() as { assignments?: Assignment[]; message?: string };
    if (generation !== requestGeneration.current) return;
    if (!eligibleResponse.ok) throw new Error(errorText(eligible));
    if (!historyResponse.ok) throw new Error(errorText(history));
    setReviewers(eligible.reviewers ?? []);
    setAssignmentHistory(history.assignments ?? []);
  }

  async function loadQueue() {
    const generation = ++requestGeneration.current;
    const response = await fetch(`/api/fgc/review-assignments?view=queue&type=${type}`, { cache: "no-store" });
    const payload = await response.json() as { assignments?: Assignment[]; message?: string };
    if (generation !== requestGeneration.current) return;
    if (!response.ok) throw new Error(errorText(payload));
    setQueue(payload.assignments ?? []);
    setSelectedAssignmentId((current) => current || payload.assignments?.[0]?.id || "");
  }

  useEffect(() => {
    const generation = ++requestGeneration.current;
    setMessage("");
    if (isJef) loadJefData().catch((error: Error) => setMessage(error.message));
    else loadQueue().catch((error: Error) => setMessage(error.message));
    return () => { requestGeneration.current = generation + 1; };
  }, [handoffType, isJef, selectedSubmissionId, type]);

  async function send(url: string, body: unknown) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as { message?: string; result?: { status?: string } };
      if (!response.ok) throw new Error(errorText(payload));
      setMessage(`Saved: ${payload.result?.status ?? "completed"}.`);
      await onChanged();
      if (isJef) await loadJefData(); else await loadQueue();
    } catch (error) { setMessage(error instanceof Error ? error.message : "The review operation could not be completed."); }
    finally { setBusy(false); }
  }

  if (isJef) {
    const active = assignmentHistory.find((item) => item.status === "ASSIGNED" || item.status === "IN_PROGRESS");
    return <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan">Governed handoff</p>
      <h4 className="mt-2 text-xl font-semibold">Assessor and moderator responsibility</h4>
      <p className="mt-2 text-sm leading-6 text-paper/56">Assignments bind an exact immutable submission version. Reassignment preserves the prior record.</p>
      {selectedSubmission ? <div className="mt-4 grid gap-3">
        <label className="text-sm font-semibold" htmlFor="handoff-type">Handoff type</label>
        <select id="handoff-type" className="rounded-[0.8rem] bg-ink/60 p-3 text-sm" value={handoffType} onChange={(event) => { setHandoffType(event.target.value as "ASSESSOR" | "MODERATOR"); setAssigneeId(""); }}><option value="ASSESSOR">Assessor</option><option value="MODERATOR">Moderator</option></select>
        <label className="text-sm font-semibold" htmlFor="review-assignee">{handoffType === "ASSESSOR" ? "Assessor" : "Moderator"}</label>
        <select id="review-assignee" className="rounded-[0.8rem] bg-ink/60 p-3 text-sm" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="">Select an approved assessor</option>{reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name} ({reviewer.email})</option>)}</select>
        <label className="text-sm font-semibold" htmlFor="review-reason">Assignment reason</label>
        <textarea id="review-reason" className="min-h-20 rounded-[0.8rem] bg-ink/60 p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} />
        <button className="min-h-11 rounded-full bg-cyan px-4 text-sm font-bold text-ink disabled:opacity-50" type="button" disabled={busy || !assigneeId || reason.trim().length < 8} onClick={() => send("/api/fgc/review-assignments", { type: handoffType, submissionId: selectedSubmission.id, assigneeId, reason, replaceAssignmentId: active?.id, expectedConcurrencyVersion: active?.concurrencyVersion })}>{busy ? "Saving..." : active ? `Reassign ${handoffType.toLowerCase()}` : `Assign ${handoffType.toLowerCase()}`}</button>
        {active ? <><p className="text-xs text-amber">Active assignment: version {active.submissionVersionId.slice(0, 8)}. A reason is required to replace it.</p><button className="min-h-10 rounded-full border border-amber/40 px-4 text-sm font-semibold text-amber disabled:opacity-50" type="button" disabled={busy || reason.trim().length < 8} onClick={() => send(`/api/fgc/review-assignments/${active.id}`, { action: "REVOKE", expectedConcurrencyVersion: active.concurrencyVersion, reason })}>Revoke active assignment</button></> : null}
      </div> : <p className="mt-4 text-sm text-paper/56">Select a persisted submission before assigning responsibility.</p>}
      {message ? <p className="mt-4 text-sm font-semibold" role="status">{message}</p> : null}
    </article>;
  }

  const assignment = selectedAssignment;
  return <article className="rounded-[1.1rem] bg-white/[0.055] p-5 ring-1 ring-white/[0.1]">
    <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan">{type === "ASSESSOR" ? "Assessor queue" : "Moderator queue"}</p>
    <h4 className="mt-2 text-xl font-semibold">Assigned cases only</h4>
    <div className="mt-4 grid gap-2">{queue.length ? queue.map((item) => <button className={`rounded-[0.8rem] p-3 text-left ring-1 ${assignment?.id === item.id ? "bg-cyan/12 ring-cyan/40" : "bg-ink/52 ring-white/[0.08]"}`} key={item.id} type="button" onClick={() => setSelectedAssignmentId(item.id)}><span className="font-semibold">{item.submissionReference} · {item.lecturerName}</span><span className="mt-1 block text-xs text-paper/54">Version {item.submissionVersionId.slice(0, 8)} · {item.status} · {item.evidenceCount} evidence files</span></button>) : <p className="text-sm text-paper/56">No active assigned cases are available.</p>}</div>
    {assignment ? <div className="mt-4 grid gap-3"><p className="text-sm text-paper/62">{assignment.collegeName ?? "College unavailable"}{assignment.campusName ? ` · ${assignment.campusName}` : ""} · {assignment.programmeName ?? "Programme unavailable"}</p><button className="min-h-11 rounded-full bg-cyan px-4 text-sm font-bold text-ink disabled:opacity-50" type="button" disabled={busy || assignment.status !== "ASSIGNED"} onClick={() => send(`/api/fgc/review-assignments/${assignment.id}`, { action: "START", type, expectedConcurrencyVersion: assignment.concurrencyVersion })}>{assignment.status === "ASSIGNED" ? "Start review" : `Review ${assignment.status.toLowerCase()}`}</button><label className="text-sm font-semibold" htmlFor="review-decisions">{type === "ASSESSOR" ? "Assessor structured decision draft (JSON)" : "Moderation structured outcome draft (JSON)"}</label><p className="text-xs text-paper/54">This slice stores bounded structured drafts; the full Tool 5, 6 and 7 rubric editor is not implemented here.</p><textarea id="review-decisions" className="min-h-24 rounded-[0.8rem] bg-ink/60 p-3 font-mono text-xs" value={decisions} onChange={(event) => setDecisions(event.target.value)} /><label className="text-sm font-semibold" htmlFor="review-rationale">Rationale</label><textarea id="review-rationale" className="min-h-20 rounded-[0.8rem] bg-ink/60 p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} />{type === "ASSESSOR" ? <><button className="min-h-11 rounded-full border border-cyan/40 px-4 text-sm font-bold text-cyan disabled:opacity-50" type="button" disabled={busy || !reason.trim()} onClick={() => { const parsed = parseDecisions(); if (parsed) void send(`/api/fgc/review-assignments/${assignment.id}`, { action: "SAVE_ASSESSOR_DRAFT", expectedConcurrencyVersion: assignment.concurrencyVersion, decisions: parsed, rationale: reason }); }}>Save assessor draft</button><button className="min-h-11 rounded-full bg-lime px-4 text-sm font-bold text-ink disabled:opacity-50" type="button" disabled={busy || reason.trim().length < 8} onClick={() => { const parsed = parseDecisions(); if (parsed) void send(`/api/fgc/review-assignments/${assignment.id}`, { action: "SUBMIT_ASSESSOR", expectedConcurrencyVersion: assignment.concurrencyVersion, decisions: parsed, rationale: reason }); }}>Submit to moderation</button></> : <><label className="text-sm font-semibold" htmlFor="moderation-status">Moderation outcome</label><select id="moderation-status" className="rounded-[0.8rem] bg-ink/60 p-3 text-sm" value={outcomeStatus} onChange={(event) => setOutcomeStatus(event.target.value as typeof outcomeStatus)}><option value="CONFIRMED">Confirm assessor result</option><option value="CHANGED">Amend assessor result</option><option value="FURTHER_EVIDENCE_REQUESTED">Request further evidence</option><option value="REASSESSMENT_REQUESTED">Require reassessment</option></select><button className="min-h-11 rounded-full border border-cyan/40 px-4 text-sm font-bold text-cyan disabled:opacity-50" type="button" disabled={busy || !reason.trim()} onClick={() => { const parsed = parseDecisions(); if (parsed) void send(`/api/fgc/review-assignments/${assignment.id}`, { action: "SAVE_MODERATION_DRAFT", expectedConcurrencyVersion: assignment.concurrencyVersion, outcome: parsed, reason }); }}>Save moderation draft</button><button className="min-h-11 rounded-full bg-lime px-4 text-sm font-bold text-ink disabled:opacity-50" type="button" disabled={busy || (outcomeStatus !== "CONFIRMED" && reason.trim().length < 8)} onClick={() => { const parsed = parseDecisions(); if (parsed) void send(`/api/fgc/review-assignments/${assignment.id}`, { action: "FINALIZE_MODERATION", expectedConcurrencyVersion: assignment.concurrencyVersion, outcomeStatus, outcome: parsed, reason }); }}>Finalize moderation</button></>}</div> : null}
    {message ? <p className="mt-4 text-sm font-semibold" role="status">{message}</p> : null}
  </article>;
}
