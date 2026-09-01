import { NextResponse, type NextRequest } from "next/server";
import { routeError } from "@/lib/fgc/api";
import { resolveFgcCurrentUserFromToken } from "@/lib/fgc/current-user";
import { fgcSessionCookieName } from "@/lib/fgc/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await resolveFgcCurrentUserFromToken(request.cookies.get(fgcSessionCookieName)?.value);

    if (!result.ok) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return routeError(error);
  }
}
