import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcEvidenceUploadError, recordEvidenceUploadRejection, uploadLecturerEvidenceFile } from "@/lib/fgc/evidence-upload";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ assignmentId: z.string().uuid() });
const metadataSchema = z.object({
  evidenceCategory: z.string().min(1).max(120),
  sectionCode: z.string().optional(),
  fieldCode: z.string().optional(),
  description: z.string().max(1000).optional(),
  documentDate: z.string().optional(),
  confidentiality: z.enum(["INTERNAL", "CONFIDENTIAL", "RESTRICTED"]).optional(),
  replacementForFileId: z.string().uuid().optional()
});

function assertSameOriginUploadRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request, context: { params: Promise<{ assignmentId: string }> }) {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return jsonError(400, "FGC_INVALID_ASSIGNMENT_ID", "A valid form assignment id is required.", parsedParams.error.flatten());
  if (!assertSameOriginUploadRequest(request)) {
    await recordEvidenceUploadRejection(access, {
      assignmentId: parsedParams.data.assignmentId,
      code: "FGC_EVIDENCE_UPLOAD_ORIGIN_FORBIDDEN",
      message: "Evidence upload origin is not allowed.",
      status: 403
    });
    return jsonError(403, "FGC_EVIDENCE_UPLOAD_ORIGIN_FORBIDDEN", "Evidence upload origin is not allowed.");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    await recordEvidenceUploadRejection(access, {
      assignmentId: parsedParams.data.assignmentId,
      code: "FGC_INVALID_EVIDENCE_UPLOAD_BODY",
      message: "Evidence upload must be submitted as multipart form data.",
      status: 400
    });
    return jsonError(400, "FGC_INVALID_EVIDENCE_UPLOAD_BODY", "Evidence upload must be submitted as multipart form data.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    await recordEvidenceUploadRejection(access, {
      assignmentId: parsedParams.data.assignmentId,
      code: "FGC_EVIDENCE_FILE_REQUIRED",
      message: "An evidence file is required.",
      status: 400
    });
    return jsonError(400, "FGC_EVIDENCE_FILE_REQUIRED", "An evidence file is required.");
  }

  const parsedMetadata = metadataSchema.safeParse({
    evidenceCategory: formData.get("evidenceCategory"),
    sectionCode: formData.get("sectionCode") || undefined,
    fieldCode: formData.get("fieldCode") || undefined,
    description: formData.get("description") || undefined,
    documentDate: formData.get("documentDate") || undefined,
    confidentiality: formData.get("confidentiality") || undefined,
    replacementForFileId: formData.get("replacementForFileId") || undefined
  });
  if (!parsedMetadata.success) {
    await recordEvidenceUploadRejection(access, {
      assignmentId: parsedParams.data.assignmentId,
      code: "FGC_INVALID_EVIDENCE_METADATA",
      message: "Evidence upload metadata is invalid.",
      filename: file.name,
      status: 400
    });
    return jsonError(400, "FGC_INVALID_EVIDENCE_METADATA", "Evidence upload metadata is invalid.", parsedMetadata.error.flatten());
  }

  try {
    const evidenceFile = await uploadLecturerEvidenceFile(access, {
      assignmentId: parsedParams.data.assignmentId,
      file,
      ...parsedMetadata.data
    });
    return NextResponse.json({ ok: true, evidenceFile });
  } catch (error) {
    if (error instanceof FgcEvidenceUploadError) return jsonError(error.status, error.code, error.message, error.details);
    return routeError(error);
  }
}
