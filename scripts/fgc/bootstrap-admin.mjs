import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { inTransaction, withClient } from "./db.mjs";

const scrypt = promisify(scryptCallback);

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function assertPasswordPolicy(password) {
  return password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

const email = argValue("--email");
const firstName = argValue("--first-name") ?? "JEF";
const surname = argValue("--surname") ?? "Administrator";
const password = argValue("--password") ?? `JEF-${randomBytes(18).toString("base64url")}!9a`;

if (!email) {
  throw new Error("Usage: node scripts/fgc/bootstrap-admin.mjs --email admin@example.org [--first-name Name] [--surname Surname] [--password StrongPassword]");
}

if (!assertPasswordPolicy(password)) {
  throw new Error("Bootstrap password must be at least 12 characters and include uppercase, lowercase, number and symbol characters.");
}

await withClient(async (client) => {
  const existing = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM fgc.production_role_assignments pra
      JOIN fgc.roles r ON r.id = pra.role_id
      WHERE pra.status = 'APPROVED'
        AND r.code IN ('JEF_ADMINISTRATOR', 'PLATFORM_SUPER_ADMINISTRATOR')
    ) AS exists
  `);

  if (existing.rows[0]?.exists) {
    console.log("Bootstrap skipped: an approved JEF administrator already exists.");
    return;
  }

  const userId = await inTransaction(client, async () => {
    const role = await client.query("SELECT id::text FROM fgc.roles WHERE code = 'JEF_ADMINISTRATOR'");
    if (!role.rows[0]) throw new Error("JEF_ADMINISTRATOR role is missing.");

    const user = await client.query(
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
      [email.toLowerCase(), await hashPassword(password), firstName, surname]
    );

    await client.query(
      `
        INSERT INTO fgc.production_role_assignments (user_id, role_id, status, approved_by, approved_at, decision_reason)
        VALUES ($1, $2, 'APPROVED', $1, now(), 'One-time administrator bootstrap')
      `,
      [user.rows[0].id, role.rows[0].id]
    );

    await client.query(
      `
        INSERT INTO fgc.production_audit_events (actor_user_id, actor_role, action, object_type, object_id, reason, metadata)
        VALUES ($1, 'SYSTEM_BOOTSTRAP', 'BOOTSTRAP_JEF_ADMINISTRATOR', 'production_user', $1, 'One-time administrator bootstrap', '{}'::jsonb)
      `,
      [user.rows[0].id]
    );

    return user.rows[0].id;
  });

  console.log(JSON.stringify({ ok: true, userId, email: email.toLowerCase(), temporaryPassword: password }, null, 2));
});
