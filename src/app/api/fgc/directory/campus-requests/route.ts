import { NextResponse } from "next/server";
import { z } from "zod";
import { fgcQuery } from "@/lib/fgc/db";
import { getMissingProductionConfig } from "@/lib/fgc/env";
import { jsonError, productionConfigError, routeError } from "@/lib/fgc/api";

export const dynamic = "force-dynamic";

const campusRequestSchema = z.object({
  requestedByUserId: z.string().uuid().optional(),
  collegeId: z.string().uuid(),
  proposedCampusName: z.string().min(2),
  physicalLocation: z.string().optional(),
  townOrMunicipality: z.string().optional(),
  provinceId: z.string().uuid().optional(),
  supportingInformation: z.string().optional(),
  requestReason: z.string().min(10)
});

export async function POST(request: Request) {
  const missingConfig = getMissingProductionConfig().filter((key) => key === "DATABASE_URL");
  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  const parsed = campusRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_CAMPUS_REQUEST", "The campus request is incomplete or invalid.", parsed.error.flatten());
  }

  try {
    const result = await fgcQuery<{ id: string }>(
      `
        INSERT INTO fgc.campus_addition_requests (
          requested_by,
          college_id,
          proposed_campus_name,
          physical_location,
          town_or_municipality,
          province_id,
          supporting_information,
          request_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id::text
      `,
      [
        parsed.data.requestedByUserId ?? null,
        parsed.data.collegeId,
        parsed.data.proposedCampusName,
        parsed.data.physicalLocation ?? null,
        parsed.data.townOrMunicipality ?? null,
        parsed.data.provinceId ?? null,
        parsed.data.supportingInformation ?? null,
        parsed.data.requestReason
      ]
    );

    return NextResponse.json({ ok: true, campusRequestId: result.rows[0]?.id }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
