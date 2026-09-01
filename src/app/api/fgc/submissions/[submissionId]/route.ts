import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcWorkbenchAccessError, getFgcSubmissionDetail } from "@/lib/fgc/workbench";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ submissionId: z.string().uuid() });

export async function GET(_request: Request, context: { params: Promise<{ submissionId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return jsonError(400, "FGC_INVALID_SUBMISSION_ID", "A valid production submission id is required.", parsed.error.flatten());

  try {
    const submission = await getFgcSubmissionDetail(access, parsed.data.submissionId);
    return NextResponse.json({ ok: true, submission });
  } catch (error) {
    if (error instanceof FgcWorkbenchAccessError) return jsonError(error.status, error.code, error.message);
    return routeError(error);
  }
}
