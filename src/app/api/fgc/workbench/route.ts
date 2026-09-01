import { NextResponse } from "next/server";
import { jsonError, routeError } from "@/lib/fgc/api";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcWorkbenchAccessError, getFgcRoleWorkbench } from "@/lib/fgc/workbench";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await getCurrentFgcUserFromCookies();
  if (!access.ok) return NextResponse.json({ ok: false, message: access.message }, { status: 401 });

  try {
    const workbench = await getFgcRoleWorkbench(access);
    return NextResponse.json({ ok: true, workbench });
  } catch (error) {
    if (error instanceof FgcWorkbenchAccessError) return jsonError(error.status, error.code, error.message);
    return routeError(error);
  }
}
