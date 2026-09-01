import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcFormAccessError, submitLecturerForm } from "@/lib/fgc/lecturer-submissions";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  values: z.record(z.string(), z.string())
});

function accessError(error: unknown) {
  if (error instanceof FgcFormAccessError) {
    return jsonError(error.status, error.code, error.message);
  }
  return routeError(error);
}

export async function POST(request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_SUBMISSION", "Submission values are required.", parsed.error.flatten());
  }

  try {
    const { assignmentId } = await context.params;
    const result = await submitLecturerForm(access, assignmentId, parsed.data.values);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return accessError(error);
  }
}
