import { NextResponse, type NextRequest } from "next/server";
import { fgcQuery } from "@/lib/fgc/db";
import { hashToken } from "@/lib/fgc/security";
import { clearFgcSessionCookie, fgcSessionCookieName, requireSessionSecret } from "@/lib/fgc/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(fgcSessionCookieName)?.value;
  if (token) {
    const sessionHash = hashToken(`${token}:${requireSessionSecret()}`);
    await fgcQuery(
      `
        UPDATE fgc.production_sessions
        SET revoked_at = now()
        WHERE session_hash = $1
          AND revoked_at IS NULL
      `,
      [sessionHash]
    );
  }
  await clearFgcSessionCookie();
  return NextResponse.json({ ok: true });
}
