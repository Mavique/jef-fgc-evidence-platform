import { NextResponse, type NextRequest } from "next/server";
import { jsonError, productionConfigError, routeError } from "@/lib/fgc/api";
import { withFgcTransaction } from "@/lib/fgc/db";
import { getMissingProductionConfig } from "@/lib/fgc/env";
import { hashToken } from "@/lib/fgc/security";

export const dynamic = "force-dynamic";

type TokenRow = {
  id: string;
  user_id: string;
};

export async function GET(request: NextRequest) {
  const missingConfig = getMissingProductionConfig().filter((key) => key === "DATABASE_URL");
  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return jsonError(400, "FGC_VERIFICATION_TOKEN_REQUIRED", "Email verification token is required.");
  }

  try {
    const result = await withFgcTransaction(async (query) => {
      const tokenResult = await query<TokenRow>(
        `
          SELECT id::text, user_id::text
          FROM fgc.production_auth_tokens
          WHERE purpose = 'EMAIL_VERIFICATION'
            AND token_hash = $1
            AND used_at IS NULL
            AND expires_at > now()
          FOR UPDATE
        `,
        [hashToken(token)]
      );

      const tokenRow = tokenResult.rows[0];
      if (!tokenRow) return null;

      await query("UPDATE fgc.production_auth_tokens SET used_at = now() WHERE id = $1", [tokenRow.id]);
      await query(
        `
          UPDATE fgc.production_role_assignments pra
          SET status = 'APPROVED', approved_at = COALESCE(approved_at, now())
          FROM fgc.roles r
          WHERE pra.role_id = r.id
            AND pra.user_id = $1
            AND pra.status = 'REQUESTED'
            AND r.code = 'LECTURER'
        `,
        [tokenRow.user_id]
      );
      const approvedRoleResult = await query<{ has_approved_role: boolean }>(
        `
          SELECT EXISTS (
            SELECT 1
            FROM fgc.production_role_assignments pra
            JOIN fgc.roles r ON r.id = pra.role_id
            WHERE pra.user_id = $1
              AND pra.status = 'APPROVED'
              AND r.code = 'LECTURER'
          ) AS has_approved_role
        `,
        [tokenRow.user_id]
      );
      const nextAccountState = approvedRoleResult.rows[0]?.has_approved_role ? "ACTIVE" : "AFFILIATION_PENDING";
      await query(
        `
          UPDATE fgc.production_users
          SET account_state = $2::fgc.account_state, email_verified_at = now(), updated_at = now()
          WHERE id = $1
        `,
        [tokenRow.user_id, nextAccountState]
      );

      return { userId: tokenRow.user_id, accountState: nextAccountState };
    });

    if (!result) {
      return jsonError(400, "FGC_INVALID_VERIFICATION_TOKEN", "The verification token is invalid, expired or already used.");
    }

    return NextResponse.json({
      ok: true,
      userId: result.userId,
      accountState: result.accountState,
      message: result.accountState === "ACTIVE"
        ? "Email verified. Your lecturer workspace is active."
        : "Email verified. Institutional affiliation approval is now required."
    });
  } catch (error) {
    return routeError(error);
  }
}
