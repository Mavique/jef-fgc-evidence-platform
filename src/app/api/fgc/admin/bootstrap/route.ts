import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { FgcValidationError, jsonError, productionConfigError, routeError } from "@/lib/fgc/api";
import { fgcQuery, withFgcTransaction } from "@/lib/fgc/db";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { constantTimeEqual, hashPassword, passwordMeetsPolicy } from "@/lib/fgc/security";

export const dynamic = "force-dynamic";

const bootstrapSchema = z.object({
  bootstrapToken: z.string().min(32),
  email: z.string().email(),
  password: z.string(),
  firstName: z.string().min(2),
  surname: z.string().min(2)
});

export async function POST(request: NextRequest) {
  const config = getFgcRuntimeConfig();
  if (!config.databaseUrl) return productionConfigError(["DATABASE_URL"]);

  const configuredBootstrapToken = process.env.FGC_ADMIN_BOOTSTRAP_TOKEN;
  if (!configuredBootstrapToken || configuredBootstrapToken.length < 32) {
    return productionConfigError(["FGC_ADMIN_BOOTSTRAP_TOKEN"]);
  }

  const parsed = bootstrapSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_ADMIN_BOOTSTRAP", "Administrator bootstrap details are incomplete or invalid.", parsed.error.flatten());
  }

  if (!constantTimeEqual(parsed.data.bootstrapToken, configuredBootstrapToken)) {
    return jsonError(403, "FGC_ADMIN_BOOTSTRAP_DENIED", "The one-time administrator bootstrap token was not accepted.");
  }

  if (!passwordMeetsPolicy(parsed.data.password)) {
    return jsonError(400, "FGC_WEAK_PASSWORD", "Password must be at least 12 characters and include uppercase, lowercase, number and symbol characters.");
  }

  try {
    const existingAdmin = await fgcQuery<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM fgc.production_role_assignments pra
          JOIN fgc.roles r ON r.id = pra.role_id
          WHERE pra.status = 'APPROVED'
            AND r.code IN ('JEF_ADMINISTRATOR', 'PLATFORM_SUPER_ADMINISTRATOR')
        ) AS exists
      `
    );

    if (existingAdmin.rows[0]?.exists) {
      throw new FgcValidationError(409, "FGC_ADMIN_ALREADY_BOOTSTRAPPED", "A production administrator already exists. Bootstrap is closed.");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const result = await withFgcTransaction(async (query) => {
      const role = await query<{ id: string }>("SELECT id::text FROM fgc.roles WHERE code = 'JEF_ADMINISTRATOR'");
      if (!role.rows[0]) throw new FgcValidationError(500, "FGC_ADMIN_ROLE_MISSING", "JEF Administrator role is missing from the role catalogue.");

      const user = await query<{ id: string }>(
        `
          INSERT INTO fgc.production_users (
            email,
            password_hash,
            first_name,
            surname,
            job_title,
            account_state,
            email_verified_at
          )
          VALUES ($1, $2, $3, $4, 'JEF Platform Administrator', 'ACTIVE', now())
          RETURNING id::text
        `,
        [parsed.data.email.toLowerCase(), passwordHash, parsed.data.firstName, parsed.data.surname]
      );

      await query(
        `
          INSERT INTO fgc.production_role_assignments (user_id, role_id, status, approved_by, approved_at, decision_reason)
          VALUES ($1, $2, 'APPROVED', $1, now(), 'One-time administrator bootstrap')
        `,
        [user.rows[0].id, role.rows[0].id]
      );

      await query(
        `
          INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
          VALUES ($1, 'SYSTEM_BOOTSTRAP', 'BOOTSTRAP_JEF_ADMINISTRATOR', 'production_user', $1, 'One-time administrator bootstrap', '{}'::jsonb)
        `,
        [user.rows[0].id]
      );

      return user.rows[0].id;
    });

    return NextResponse.json({ ok: true, userId: result, message: "JEF Administrator bootstrap completed. Bootstrap is now closed because an approved administrator exists." }, { status: 201 });
  } catch (error) {
    return routeError(error);
  }
}
