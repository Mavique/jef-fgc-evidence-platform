import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcWorkbenchAccessError, generateFgcWorkbenchReport, recordFgcWorkbenchDecision } from "@/lib/fgc/workbench";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("DECISION"),
    submissionId: z.string().uuid(),
    action: z.enum(["COLLEGE_ENRICH", "ASSESSOR_REVIEW", "REQUEST_CLARIFICATION", "MODERATOR_FINALISE", "JEF_REOPEN"]),
    decision: z.string().min(3),
    notes: z.string().min(3)
  }),
  z.object({
    type: z.literal("GENERATE_REPORT"),
    reportType: z.string().min(3)
  })
]);

export async function POST(request: Request) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "FGC_INVALID_WORKBENCH_ACTION", "A valid workbench action is required.", parsed.error.flatten());

  try {
    const result = parsed.data.type === "DECISION"
      ? await recordFgcWorkbenchDecision(access, parsed.data)
      : await generateFgcWorkbenchReport(access, parsed.data.reportType);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof FgcWorkbenchAccessError) return jsonError(error.status, error.code, error.message);
    return routeError(error);
  }
}
