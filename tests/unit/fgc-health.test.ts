import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as liveHealth } from "@/app/health/route";
import { GET as readiness } from "@/app/health/ready/route";
import { GET as apiHealth } from "@/app/api/fgc/health/route";
import { fgcQuery } from "@/lib/fgc/db";

vi.mock("@/lib/fgc/db", () => ({
  fgcQuery: vi.fn()
}));

const sensitiveNames = [
  "FGC_SESSION_SECRET",
  "FGC_ADMIN_BOOTSTRAP_TOKEN",
  "FGC_EMAIL_API_KEY",
  "FGC_SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL"
];

const originalEnvironment = process.env.FGC_ENVIRONMENT;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalEnvironment === undefined) delete process.env.FGC_ENVIRONMENT;
  else process.env.FGC_ENVIRONMENT = originalEnvironment;
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
  vi.mocked(fgcQuery).mockReset();
});

function responseText(response: Response) {
  return response.text();
}

describe("public FGC health responses", () => {
  it("keeps live health public and does not enumerate missing configuration", async () => {
    process.env.FGC_ENVIRONMENT = "staging";

    const response = await liveHealth();
    const body = await responseText(response);

    expect(response.status).toBe(200);
    expect(body).toContain('"status":"ok"');
    expect(body).toContain('"service":"jef-fgc-platform"');
    expect(body).not.toContain("missingConfig");
    expect(sensitiveNames.every((name) => !body.includes(name))).toBe(true);
  });

  it("returns only generic readiness states when required configuration is absent", async () => {
    process.env.FGC_ENVIRONMENT = "staging";

    const response = await readiness();
    const body = await responseText(response);
    const json = JSON.parse(body) as { ok: boolean; status: string; checks: Record<string, string> };

    expect(response.status).toBe(503);
    expect(json.ok).toBe(false);
    expect(json.status).toBe("not_ready");
    expect(Object.keys(json.checks).sort()).toEqual(["application", "configuration", "database", "email", "migrations", "storage"]);
    expect(Object.values(json.checks).every((state) => ["ready", "not_ready", "not_configured", "unavailable", "unknown"].includes(state))).toBe(true);
    expect(sensitiveNames.every((name) => !body.includes(name))).toBe(true);
    expect(/postgres(?:ql)?:\/\/|storageKey|stack|node_modules|provider error/i.test(body)).toBe(false);
  });

  it("uses the same sanitized readiness contract for the public API health route", async () => {
    process.env.FGC_ENVIRONMENT = "staging";

    const response = await apiHealth();
    const body = await responseText(response);
    const json = JSON.parse(body) as { ok: boolean; status: string; checks: Record<string, string> };

    expect(response.status).toBe(503);
    expect(json.status).toBe("not_ready");
    expect(Object.keys(json.checks).sort()).toEqual(["application", "configuration", "database", "email", "migrations", "storage"]);
    expect(body).not.toContain("missingConfig");
    expect(body).not.toContain("appUrl");
    expect(sensitiveNames.every((name) => !body.includes(name))).toBe(true);
    expect(/https?:\/\/|postgres(?:ql)?:\/\/|storageKey|stack|provider error/i.test(body)).toBe(false);
  });

  it("keeps the API health route sanitized when the dependency check fails", async () => {
    process.env.FGC_ENVIRONMENT = "staging";
    process.env.DATABASE_URL = "postgresql://synthetic.invalid/fgc";
    vi.mocked(fgcQuery).mockRejectedValueOnce(new Error("raw provider credentials and stack trace"));

    const response = await apiHealth();
    const body = await responseText(response);

    expect(response.status).toBe(503);
    expect(body).not.toContain("raw provider credentials");
    expect(body).not.toContain("missingConfig");
    expect(body).not.toContain("appUrl");
    expect(/https?:\/\/|postgres(?:ql)?:\/\/|stack trace|credentials/i.test(body)).toBe(false);
  });

  it("sanitizes unexpected readiness failures", async () => {
    process.env.FGC_ENVIRONMENT = "staging";
    process.env.DATABASE_URL = "postgresql://synthetic.invalid/fgc";
    vi.mocked(fgcQuery).mockRejectedValueOnce(new Error("provider password and connection details"));

    const response = await readiness();
    const body = await responseText(response);

    expect(response.status).toBe(503);
    expect(body).not.toContain("provider password");
    expect(body).not.toContain("connection details");
    expect(sensitiveNames.every((name) => !body.includes(name))).toBe(true);
    expect(/postgres(?:ql)?:\/\/|stack|node_modules/i.test(body)).toBe(false);
  });

  it("uses the same sanitized shape when configuration is available", async () => {
    process.env.FGC_ENVIRONMENT = "staging";
    process.env.DATABASE_URL = "postgresql://synthetic.invalid/fgc";
    vi.mocked(fgcQuery).mockResolvedValueOnce({ rows: [{ migration_count: 1 }] } as never);

    const response = await readiness();
    const json = await response.json() as { checks: Record<string, string>; databaseTime?: string };

    expect(response.status).toBe(503);
    expect(json.checks.database).toBe("ready");
    expect(json.checks.migrations).toBe("ready");
    expect(json).not.toHaveProperty("databaseTime");
  });
});
