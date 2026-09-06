import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("FGC deployment gate", () => {
  it("refuses an unverified or incompletely configured deployment without inspecting secrets", () => {
    const result = spawnSync(process.execPath, [join(process.cwd(), "scripts", "fgc", "deployment-gate.mjs")], {
      encoding: "utf8",
      env: {
        NODE_ENV: "test",
        PATH: process.env.PATH
      }
    });

    expect(result.status).toBe(2);
    const output = `${result.stdout}${result.stderr}`;
    expect(output).toContain('"ok": false');
    expect(output).toContain("FGC_STAGING_VERIFIED_AT");
    expect(output).not.toContain("DATABASE_URL");
  });

  it("refuses production mode even when staging configuration markers exist", () => {
    const configured = "configured";
    const result = spawnSync(process.execPath, [join(process.cwd(), "scripts", "fgc", "deployment-gate.mjs"), "--production"], {
      encoding: "utf8",
      env: {
        NODE_ENV: "test",
        PATH: process.env.PATH,
        FGC_STAGING_VERIFIED_AT: "test-only",
        FGC_APP_URL: "https://staging.example.invalid",
        FGC_ENVIRONMENT: "staging",
        FGC_EMAIL_PROVIDER: "resend",
        FGC_EMAIL_FROM: "test@example.invalid",
        FGC_EVIDENCE_STORAGE_PROVIDER: "supabase",
        FGC_EVIDENCE_STORAGE_BUCKET: "fgc-test-only",
        FGC_SESSION_SECRET: configured,
        FGC_EMAIL_API_KEY: configured,
        FGC_SUPABASE_SERVICE_ROLE_KEY: configured,
        FGC_SESSION_TTL_SECONDS: "3600"
      }
    });

    expect(result.status).toBe(2);
    expect(`${result.stdout}${result.stderr}`).toContain("production deployment is intentionally refused");
  });

  it("refuses a deployment with missing or placeholder Cloudflare bindings", () => {
    const result = spawnSync(process.execPath, [join(process.cwd(), "scripts", "fgc", "deployment-gate.mjs")], {
      encoding: "utf8",
      env: {
        NODE_ENV: "test",
        PATH: process.env.PATH,
        FGC_STAGING_VERIFIED_AT: "test-only",
        FGC_ENVIRONMENT: "staging",
        FGC_APP_URL: "https://staging.example.invalid",
        FGC_EMAIL_PROVIDER: "resend",
        FGC_EMAIL_FROM: "staging@example.invalid",
        FGC_EVIDENCE_STORAGE_PROVIDER: "supabase",
        FGC_EVIDENCE_STORAGE_BUCKET: "staging-evidence",
        FGC_SUPABASE_URL: "https://staging.example.invalid",
        FGC_SESSION_SECRET: "test-only-session-secret",
        FGC_EMAIL_API_KEY: "test-only-email-key",
        FGC_SUPABASE_SERVICE_ROLE_KEY: "test-only-storage-key",
        FGC_SESSION_TTL_SECONDS: "1800",
        FGC_VERIFICATION_TOKEN_TTL_SECONDS: "7200",
        FGC_CF_KV_NAMESPACE_ID: "REPLACE_WITH_STAGING_KV_NAMESPACE_ID",
        FGC_CF_HYPERDRIVE_ID: "REPLACE_WITH_STAGING_HYPERDRIVE_ID",
        FGC_CF_IMAGES_CONFIGURED: "true"
      }
    });

    expect(result.status).toBe(2);
    expect(`${result.stdout}${result.stderr}`).toContain("must be a real target binding identifier");
  });
});
