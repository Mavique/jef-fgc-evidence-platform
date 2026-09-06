import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, productionConfigError, routeError } from "@/lib/fgc/api";
import { fgcQuery } from "@/lib/fgc/db";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { createSessionToken, setFgcSessionCookie } from "@/lib/fgc/session";
import { verifyPassword } from "@/lib/fgc/security";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  surname: string;
  account_state: string;
  locked_until: string | null;
};

const requiredLoginConfig = ["DATABASE_URL", "FGC_SESSION_SECRET"];

export async function POST(request: Request) {
  const config = getFgcRuntimeConfig();
  const missingConfig = requiredLoginConfig.filter((key) => (key === "DATABASE_URL" ? !config.databaseUrl : !config.sessionSecret));
  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_LOGIN", "Email and password are required.", parsed.error.flatten());
  }

  try {
    const user = await fgcQuery<UserRow>(
      `
        SELECT
          id::text,
          email::text,
          password_hash,
          first_name,
          surname,
          account_state::text,
          locked_until::text
        FROM fgc.production_users
        WHERE email = $1 AND deleted_at IS NULL
      `,
      [parsed.data.email.toLowerCase()]
    );

    const row = user.rows[0];
    if (!row) {
      return jsonError(401, "FGC_AUTH_FAILED", "Invalid email or password.");
    }

    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
      return jsonError(423, "FGC_ACCOUNT_LOCKED", "This account is temporarily locked.");
    }

    const passwordOk = await verifyPassword(parsed.data.password, row.password_hash);
    if (!passwordOk) {
      await fgcQuery(
        `
          UPDATE fgc.production_users
          SET
            failed_login_count = failed_login_count + 1,
            locked_until = CASE WHEN failed_login_count + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END,
            updated_at = now()
          WHERE id = $1
        `,
        [row.id]
      );
      return jsonError(401, "FGC_AUTH_FAILED", "Invalid email or password.");
    }

    if (["EMAIL_UNVERIFIED", "SUSPENDED", "DEACTIVATED"].includes(row.account_state)) {
      return jsonError(403, "FGC_ACCOUNT_NOT_ACTIVE", "Your account is not active yet. Complete email verification and role approval first.", {
        accountState: row.account_state
      });
    }

    const session = createSessionToken();
    const sessionTtlSeconds = config.sessionTtlSeconds;
    await fgcQuery(
      `
        INSERT INTO fgc.production_sessions (user_id, session_hash, expires_at)
        VALUES ($1, $2, now() + ($3 * interval '1 second'))
      `,
      [row.id, session.sessionHash, sessionTtlSeconds]
    );

    await fgcQuery(
      `
        UPDATE fgc.production_users
        SET failed_login_count = 0, locked_until = NULL, last_login_at = now(), updated_at = now()
        WHERE id = $1
      `,
      [row.id]
    );

    await setFgcSessionCookie(session.token);

    return NextResponse.json({
      ok: true,
      user: {
        id: row.id,
        email: row.email,
        name: `${row.first_name} ${row.surname}`,
        accountState: row.account_state
      }
    });
  } catch (error) {
    return routeError(error);
  }
}
