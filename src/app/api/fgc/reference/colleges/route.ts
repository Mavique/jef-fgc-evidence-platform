import { NextResponse } from "next/server";
import { fgcQuery } from "@/lib/fgc/db";
import { getMissingProductionConfig } from "@/lib/fgc/env";
import { productionConfigError, routeError } from "@/lib/fgc/api";

export const dynamic = "force-dynamic";

type CollegeRow = {
  id: string;
  official_name: string;
  short_name: string | null;
  acronym: string | null;
  province_name: string | null;
  verification_status: string;
  active: boolean;
};

export async function GET() {
  const missingConfig = getMissingProductionConfig().filter((key) => key === "DATABASE_URL");
  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  try {
    const result = await fgcQuery<CollegeRow>(`
      SELECT
        c.id::text,
        c.official_name,
        c.short_name,
        c.acronym,
        p.official_name AS province_name,
        c.verification_status::text,
        c.active
      FROM fgc.tvet_colleges c
      LEFT JOIN fgc.provinces p ON p.id = c.province_id
      WHERE c.active = TRUE
      ORDER BY c.official_name
    `);

    return NextResponse.json({ ok: true, colleges: result.rows });
  } catch (error) {
    return routeError(error);
  }
}
