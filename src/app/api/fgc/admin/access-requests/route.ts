import { NextResponse, type NextRequest } from "next/server";
import { routeError } from "@/lib/fgc/api";
import { requireFgcAdministrator } from "@/lib/fgc/admin-auth";
import { listAccessApplicants } from "@/lib/fgc/access-management";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireFgcAdministrator(request);
    const applicants = await listAccessApplicants();
    return NextResponse.json({ ok: true, applicants });
  } catch (error) {
    return routeError(error);
  }
}
