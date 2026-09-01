import { NextResponse } from "next/server";
import { getFgcHealthStatus } from "@/lib/fgc/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getFgcHealthStatus("live");
  return NextResponse.json(health, { status: health.ok ? 200 : 503 });
}
