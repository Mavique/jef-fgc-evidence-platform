import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcFormAccessError, getLecturerFormState, saveLecturerDraft } from "@/lib/fgc/lecturer-submissions";

export const dynamic = "force-dynamic";

const draftSchema = z.object({
  values: z.record(z.string(), z.string()),
  reason: z.string().optional()
});

function accessError(error: unknown) {
  if (error instanceof FgcFormAccessError) {
    return jsonError(error.status, error.code, error.message);
  }
  return routeError(error);
}

export async function GET(_request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  try {
    const { assignmentId } = await context.params;
    const form = await getLecturerFormState(access, assignmentId);
    return NextResponse.json({ ok: true, form });
  } catch (error) {
    return accessError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsed = draftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_DRAFT", "Draft values are required.", parsed.error.flatten());
  }

  try {
    const { assignmentId } = await context.params;
    const result = await saveLecturerDraft(access, assignmentId, parsed.data.values, parsed.data.reason);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return accessError(error);
  }
}
