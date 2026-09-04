import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { finalizeModeration, FgcReviewWorkflowError, getReviewCase, revokeOrSupersedeAssignment, saveAssessorDraft, saveModerationDraft, startReview, submitAssessorReview } from "@/lib/fgc/review-workflow";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ assignmentId: z.string().uuid() });
const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("START"), type: z.enum(["ASSESSOR", "MODERATOR"]), expectedConcurrencyVersion: z.number().int().positive() }),
  z.object({ action: z.literal("SAVE_ASSESSOR_DRAFT"), expectedConcurrencyVersion: z.number().int().positive(), decisions: z.record(z.string(), z.unknown()), rationale: z.string().min(1) }),
  z.object({ action: z.literal("SUBMIT_ASSESSOR"), expectedConcurrencyVersion: z.number().int().positive(), decisions: z.record(z.string(), z.unknown()), rationale: z.string().min(1) }),
  z.object({ action: z.literal("SAVE_MODERATION_DRAFT"), expectedConcurrencyVersion: z.number().int().positive(), outcome: z.record(z.string(), z.unknown()), reason: z.string().min(1) }),
  z.object({ action: z.literal("FINALIZE_MODERATION"), expectedConcurrencyVersion: z.number().int().positive(), outcomeStatus: z.enum(["CONFIRMED", "CHANGED", "FURTHER_EVIDENCE_REQUESTED", "REASSESSMENT_REQUESTED"]), outcome: z.record(z.string(), z.unknown()), reason: z.string() }),
  z.object({ action: z.enum(["REVOKE", "SUPERSEDE"]), expectedConcurrencyVersion: z.number().int().positive(), reason: z.string().min(1) })
]);

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

function handleError(error: unknown) {
  if (error instanceof FgcReviewWorkflowError) return jsonError(error.status, error.code, error.message);
  return routeError(error);
}

export async function GET(_request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return jsonError(400, "FGC_INVALID_REVIEW_ASSIGNMENT_ID", "A valid review assignment id is required.");
  try {
    const type = access.access.accessState === "ASSESSOR_ACTIVE" ? "ASSESSOR" : access.access.accessState === "MODERATOR_ACTIVE" ? "MODERATOR" : null;
    if (!type) return jsonError(403, "FGC_REVIEW_ROLE_REQUIRED", "An assigned reviewer role is required to open a review case.");
    return NextResponse.json({ ok: true, reviewCase: await getReviewCase(access, parsed.data.assignmentId, type) });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });
  if (!sameOrigin(request)) return jsonError(403, "FGC_ORIGIN_FORBIDDEN", "The authenticated write origin is not allowed.");
  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) return jsonError(400, "FGC_INVALID_REVIEW_ASSIGNMENT_ID", "A valid review assignment id is required.");
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 128 * 1024) return jsonError(413, "FGC_REVIEW_OPERATION_TOO_LARGE", "The review operation is too large.");
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > 128 * 1024) return jsonError(413, "FGC_REVIEW_OPERATION_TOO_LARGE", "The review operation is too large.");
  let body: unknown = null;
  try { body = rawBody ? JSON.parse(rawBody) : null; } catch { return jsonError(400, "FGC_INVALID_REVIEW_OPERATION", "A valid review operation is required."); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "FGC_INVALID_REVIEW_OPERATION", "A valid review operation is required.", parsed.error.flatten());
  try {
    const id = params.data.assignmentId;
    const body = parsed.data;
    if (body.action === "START") return NextResponse.json({ ok: true, result: await startReview(access, id, body.type, body.expectedConcurrencyVersion) });
    if (body.action === "SAVE_ASSESSOR_DRAFT") return NextResponse.json({ ok: true, result: await saveAssessorDraft(access, id, body.expectedConcurrencyVersion, body.decisions, body.rationale) });
    if (body.action === "SUBMIT_ASSESSOR") return NextResponse.json({ ok: true, result: await submitAssessorReview(access, id, body.expectedConcurrencyVersion, body.decisions, body.rationale) });
    if (body.action === "SAVE_MODERATION_DRAFT") return NextResponse.json({ ok: true, result: await saveModerationDraft(access, id, body.expectedConcurrencyVersion, body.outcome, body.reason) });
    if (body.action === "FINALIZE_MODERATION") return NextResponse.json({ ok: true, result: await finalizeModeration(access, id, body.expectedConcurrencyVersion, body.outcomeStatus, body.outcome, body.reason) });
    return NextResponse.json({ ok: true, result: await revokeOrSupersedeAssignment(access, id, body.expectedConcurrencyVersion, body.reason, body.action) });
  } catch (error) { return handleError(error); }
}
