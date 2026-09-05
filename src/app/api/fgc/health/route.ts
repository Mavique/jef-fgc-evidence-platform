import { NextResponse, type NextRequest } from "next/server";
import { fgcQuery } from "@/lib/fgc/db";
import { getFgcRuntimeConfig, getMissingProductionConfig } from "@/lib/fgc/env";

export const dynamic = "force-dynamic";

function requestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const config = getFgcRuntimeConfig();
  const missingConfig = getMissingProductionConfig(config);
  const origin = requestOrigin(request);
  const configuredOrigin = config.appUrl.replace(/\/$/, "");
  const originMatchesConfig = configuredOrigin === origin;

  if (!config.databaseUrl) {
    return NextResponse.json({
      ok: false,
      productionConfigured: false,
      databaseReachable: false,
      missingConfig,
      appUrl: configuredOrigin,
      requestOrigin: origin,
      originMatchesConfig,
      message: "DATABASE_URL is not configured. The FGC production database cannot be checked."
    });
  }

  try {
    const result = await fgcQuery<{ database_time: string }>("SELECT now()::text AS database_time");
    return NextResponse.json({
      ok: missingConfig.length === 0,
      productionConfigured: missingConfig.length === 0,
      databaseReachable: true,
      missingConfig,
      appUrl: configuredOrigin,
      requestOrigin: origin,
      originMatchesConfig,
      originWarning: originMatchesConfig ? null : "FGC_APP_URL does not match the current request origin. Use one canonical local host for signup, verification, login and portal access.",
      databaseTime: result.rows[0]?.database_time
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        productionConfigured: false,
        databaseReachable: false,
        missingConfig,
        appUrl: configuredOrigin,
        requestOrigin: origin,
        originMatchesConfig,
        message: "FGC database health check failed."
      },
      { status: 503 }
    );
  }
}
