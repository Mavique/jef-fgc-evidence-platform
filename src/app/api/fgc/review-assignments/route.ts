import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { assignReviewCase, FgcReviewWorkflowError, listAssignmentHistory, listEligibleReviewers, listReviewQueue } from "@/lib/fgc/review-workflow";

export const dynamic = "force-dynamic";

const typeSchema = z.enum(["ASSESSOR", "MODERATOR"]);
const assignSchema = z.object({ type: typeSchema, submissionId: z.string().uuid(), assigneeId: z.string().uuid(), reason: z.string().min(8), dueAt: z.string().datetime().nullable().optional(), replaceAssignmentId: z.string().uuid().optional(), expectedConcurrencyVersion: z.number().int().positive().optional() });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

function handleError(error: unknown) {
  if (error instanceof FgcReviewWorkflowError) return jsonError(error.status, error.code, error.message);
  return routeError(error);
}

export async function GET(request: Request) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const type = typeSchema.safeParse(params.get("type"));
  const view = params.get("view") ?? "queue";
  if (!type.success) return jsonError(400, "FGC_REVIEW_ASSIGNMENT_TYPE_INVALID", "A valid review assignment type is required.");
  try {
    if (view === "eligible") {
      const parsedSubmissionId = z.string().uuid().safeParse(params.get("submissionId"));
      if (!parsedSubmissionId.success) return jsonError(400, "FGC_INVALID_SUBMISSION_ID", "A valid production submission id is required.");
      const submissionId = parsedSubmissionId.data;
      return NextResponse.json({ ok: true, reviewers: await listEligibleReviewers(access, type.data, submissionId) });
    }
    if (view === "history") {
      const parsedSubmissionId = z.string().uuid().safeParse(params.get("submissionId"));
      if (!parsedSubmissionId.success) return jsonError(400, "FGC_INVALID_SUBMISSION_ID", "A valid production submission id is required.");
      const submissionId = parsedSubmissionId.data;
      return NextResponse.json({ ok: true, assignments: await listAssignmentHistory(access, submissionId, type.data) });
    }
    return NextResponse.json({ ok: true, assignments: await listReviewQueue(access, type.data) });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });
  if (!sameOrigin(request)) return jsonError(403, "FGC_ORIGIN_FORBIDDEN", "The authenticated write origin is not allowed.");
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 128 * 1024) return jsonError(413, "FGC_REVIEW_ASSIGNMENT_TOO_LARGE", "The review assignment is too large.");
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > 128 * 1024) return jsonError(413, "FGC_REVIEW_ASSIGNMENT_TOO_LARGE", "The review assignment is too large.");
  let body: unknown = null;
  try { body = rawBody ? JSON.parse(rawBody) : null; } catch { return jsonError(400, "FGC_INVALID_REVIEW_ASSIGNMENT", "A valid review assignment is required."); }
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "FGC_INVALID_REVIEW_ASSIGNMENT", "A valid review assignment is required.", parsed.error.flatten());
  try { return NextResponse.json({ ok: true, result: await assignReviewCase(access, parsed.data) }); }
  catch (error) { return handleError(error); }
}
