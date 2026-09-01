import { NextResponse } from "next/server";
import { getCurrentFgcUserFromCookies } from "@/lib/fgc/current-user";
import { FgcConfigurationError } from "@/lib/fgc/db";
import { getFgcProductionMetricsSummary } from "@/lib/fgc/metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const access = await getCurrentFgcUserFromCookies();

    if (!access.ok) {
      return NextResponse.json({ ok: false, message: access.message }, { status: 401 });
    }

    if (!access.access.canOpenProtectedWorkspace) {
      return NextResponse.json(
        { ok: false, accessState: access.access.accessState, message: "FGC production metrics require an approved role." },
        { status: 403 }
      );
    }

    const summary = await getFgcProductionMetricsSummary(access);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    if (error instanceof FgcConfigurationError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }

    console.error("FGC metrics summary failed", error);
    return NextResponse.json({ ok: false, message: "FGC production metrics are unavailable." }, { status: 500 });
  }
}
