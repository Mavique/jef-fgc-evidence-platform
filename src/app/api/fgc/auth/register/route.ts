import { NextResponse } from "next/server";
import { z } from "zod";
import { FgcValidationError, jsonError, productionConfigError, routeError } from "@/lib/fgc/api";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";
import { sendFgcMail } from "@/lib/fgc/mailer";
import { createSecureToken, hashPassword, hashToken, passwordMeetsPolicy } from "@/lib/fgc/security";
import { withFgcTransaction } from "@/lib/fgc/db";

export const dynamic = "force-dynamic";

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string().min(2),
  surname: z.string().min(2),
  mobileNumber: z.string().optional(),
  jobTitle: z.string().min(2),
  employeeIdentifier: z.string().optional(),
  roleCode: z.string().min(2),
  tvetCollegeId: z.string().uuid(),
  campusId: z.string().uuid().optional()
});

const requiredRegistrationConfig = ["DATABASE_URL", "FGC_EMAIL_PROVIDER", "FGC_EMAIL_FROM", "FGC_EMAIL_API_KEY"];
const selfServiceRoleCodes = new Set(["LECTURER", "COLLEGE_EVIDENCE_OWNER"]);

export async function POST(request: Request) {
  const config = getFgcRuntimeConfig();
  const missingConfig = requiredRegistrationConfig.filter((key) => {
    if (key === "DATABASE_URL") return !config.databaseUrl;
    if (key === "FGC_EMAIL_PROVIDER") return !config.emailProvider;
    if (key === "FGC_EMAIL_FROM") return !config.emailFrom;
    return !config.emailApiKey;
  });

  if (missingConfig.length > 0) return productionConfigError(missingConfig);

  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "FGC_INVALID_REGISTRATION", "The registration request is incomplete or invalid.", parsed.error.flatten());
  }

  if (!passwordMeetsPolicy(parsed.data.password)) {
    return jsonError(400, "FGC_WEAK_PASSWORD", "Password must be at least 12 characters and include uppercase, lowercase, number and symbol characters.");
  }

  if (!selfServiceRoleCodes.has(parsed.data.roleCode)) {
    return jsonError(403, "FGC_ROLE_NOT_SELF_SERVICE", "This role cannot be requested through public signup.");
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const verificationToken = createSecureToken();
    const verificationHash = hashToken(verificationToken);
    const verificationUrl = `${config.appUrl.replace(/\/$/, "")}/api/fgc/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;

    const result = await withFgcTransaction(async (query) => {
      const role = await query<{ id: string }>("SELECT id::text FROM fgc.roles WHERE code = $1", [parsed.data.roleCode]);
      if (!role.rows[0]) {
        throw new FgcValidationError(400, "FGC_UNKNOWN_ROLE", `FGC role "${parsed.data.roleCode}" does not exist in the role catalogue.`);
      }

      const college = await query<{ id: string }>(
        "SELECT id::text FROM fgc.tvet_colleges WHERE id = $1 AND active = TRUE AND institution_type = 'PUBLIC_TVET_COLLEGE'",
        [parsed.data.tvetCollegeId]
      );
      if (!college.rows[0]) {
        throw new FgcValidationError(400, "FGC_UNKNOWN_TVET_COLLEGE", "Select a valid active Public TVET College from the reference directory.");
      }

      if (parsed.data.campusId) {
        const campus = await query<{ id: string }>(
          "SELECT id::text FROM fgc.campus_sites WHERE id = $1 AND college_id = $2 AND active = TRUE",
          [parsed.data.campusId, parsed.data.tvetCollegeId]
        );
        if (!campus.rows[0]) {
          throw new FgcValidationError(400, "FGC_INVALID_CAMPUS_SCOPE", "The selected campus does not belong to the selected TVET College.");
        }
      }

      const user = await query<{ id: string }>(
        `
          INSERT INTO fgc.production_users (
            email,
            password_hash,
            first_name,
            surname,
            mobile_number,
            job_title,
            employee_identifier,
            account_state
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'EMAIL_UNVERIFIED')
          RETURNING id::text
        `,
        [
          parsed.data.email.toLowerCase(),
          passwordHash,
          parsed.data.firstName,
          parsed.data.surname,
          parsed.data.mobileNumber ?? null,
          parsed.data.jobTitle,
          parsed.data.employeeIdentifier ?? null
        ]
      );

      const userId = user.rows[0]?.id;
      if (!userId) throw new Error("FGC user registration did not return a user id.");

      const roleStatus = parsed.data.roleCode === "LECTURER" ? "APPROVED" : "REQUESTED";
      await query(
        `
          INSERT INTO fgc.production_role_assignments (
            user_id,
            role_id,
            tvet_college_id,
            campus_id,
            status
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [userId, role.rows[0].id, parsed.data.tvetCollegeId, parsed.data.campusId ?? null, roleStatus]
      );

      await query(
        `
          INSERT INTO fgc.production_auth_tokens (user_id, purpose, token_hash, expires_at)
          VALUES ($1, 'EMAIL_VERIFICATION', $2, now() + ($3 * interval '1 second'))
        `,
        [userId, verificationHash, config.verificationTokenTtlSeconds]
      );

      await sendFgcMail({
        to: parsed.data.email,
        subject: "Verify your FGC Evidence Validation Platform account",
        text: `Welcome to the FGC Evidence Validation Platform.\n\nVerify your email address here: ${verificationUrl}\n\nThis link expires in ${Math.round(config.verificationTokenTtlSeconds / 3600)} hours.`
      });

      return { userId };
    });

    return NextResponse.json(
      {
        ok: true,
        userId: result.userId,
        accountState: "EMAIL_UNVERIFIED",
        message: "Registration created. Email verification has been sent."
      },
      { status: 201 }
    );
  } catch (error) {
    return routeError(error);
  }
}
