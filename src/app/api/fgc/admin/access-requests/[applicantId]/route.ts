import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, routeError } from "@/lib/fgc/api";
import { requireFgcAdministrator } from "@/lib/fgc/admin-auth";
import { applyAccessDecision } from "@/lib/fgc/access-management";

export const dynamic = "force-dynamic";

const decisionSchema = z.object({
  action: z.enum([
    "APPROVE_AFFILIATION",
    "REJECT_AFFILIATION",
    "REQUEST_CLARIFICATION",
    "CORRECT_SCOPE",
    "SUSPEND_AFFILIATION",
    "ADD_ROLE_REQUEST",
    "DECIDE_ROLE"
  ]),
  reason: z.string().min(8),
  roleAssignmentId: z.string().uuid().optional(),
  roleDecision: z.enum(["APPROVED", "REJECTED", "RETURNED", "REVOKED"]).optional(),
  roleCode: z.enum(["LECTURER", "COLLEGE_EVIDENCE_OWNER"]).optional(),
  collegeId: z.string().uuid().optional(),
  campusId: z.string().uuid().nullable().optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ applicantId: string }> }) {
  try {
    const actor = await requireFgcAdministrator(request);
    const { applicantId } = await params;
    const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return jsonError(400, "FGC_INVALID_ACCESS_DECISION", "The access-management decision is incomplete or invalid.", parsed.error.flatten());
    }

    const result = await applyAccessDecision(actor, { applicantId, ...parsed.data });
    return NextResponse.json(result);
  } catch (error) {
    return routeError(error);
  }
}
