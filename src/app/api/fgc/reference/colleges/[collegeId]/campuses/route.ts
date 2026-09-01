import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { fgcQuery } from "@/lib/fgc/db";
import { getMissingProductionConfig } from "@/lib/fgc/env";
import { jsonError, productionConfigError, routeError } from "@/lib/fgc/api";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  collegeId: z.string().uuid()
});

type CampusRow = {
  id: string;
  official_name: string;
  campus_code: string | null;
  site_type: string;
  physical_address: string | null;
  verification_status: string;
  active: boolean;
};

export async function GET(_request: NextRequest, context: { params: Promise<{ collegeId: string }> }) {
  const missingConfig = getMissingProductionConfig().filter((key) => key === "DATABASE_URL");
  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_COLLEGE_ID", "A valid TVET college id is required.");
  }

  try {
    const result = await fgcQuery<CampusRow>(
      `
        SELECT
          id::text,
          official_name,
          campus_code,
          site_type::text,
          physical_address,
          verification_status::text,
          active
        FROM fgc.campus_sites
        WHERE college_id = $1 AND active = TRUE
        ORDER BY official_name
      `,
      [parsed.data.collegeId]
    );

    return NextResponse.json({ ok: true, campuses: result.rows });
  } catch (error) {
    return routeError(error);
  }
}
