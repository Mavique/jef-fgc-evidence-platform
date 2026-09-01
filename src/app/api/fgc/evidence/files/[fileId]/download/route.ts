import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { FgcConfigurationError } from "@/lib/fgc/db";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { createFgcEvidenceFileViewUrl, FgcWorkbenchAccessError } from "@/lib/fgc/workbench";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ fileId: z.string().uuid() });

export async function GET(_request: Request, context: { params: Promise<{ fileId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return jsonError(400, "FGC_INVALID_EVIDENCE_FILE_ID", "A valid evidence file id is required.", parsed.error.flatten());

  try {
    const result = await createFgcEvidenceFileViewUrl(access, parsed.data.fileId);
    return NextResponse.redirect(result.url);
  } catch (error) {
    if (error instanceof FgcWorkbenchAccessError) return jsonError(error.status, error.code, error.message);
    if (error instanceof FgcConfigurationError) return jsonError(503, "FGC_EVIDENCE_VIEW_NOT_CONFIGURED", error.message);
    return routeError(error);
  }
}
