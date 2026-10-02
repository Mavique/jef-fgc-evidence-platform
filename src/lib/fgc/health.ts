import { fgcQuery } from "@/lib/fgc/db";
import { getFgcRuntimeConfig, getMissingProductionConfig } from "@/lib/fgc/env";

export type FgcHealthMode = "live" | "ready";
export type FgcHealthState = "ready" | "not_ready" | "not_configured" | "unavailable" | "unknown";

function safeEnvironment(environment: string) {
  return ["development", "test", "staging", "production"].includes(environment) ? environment : "unknown";
}

function safeBase(mode: FgcHealthMode, config: ReturnType<typeof getFgcRuntimeConfig>) {
  return {
    ok: false,
    status: mode === "live" ? "ok" : "not_ready",
    service: "jef-fgc-platform",
    mode,
    environment: safeEnvironment(config.environment),
    version: process.env.CF_VERSION_METADATA || process.env.GITHUB_SHA || "local",
    timestamp: new Date().toISOString()
  };
}

export async function getFgcHealthStatus(mode: FgcHealthMode) {
  const config = getFgcRuntimeConfig();
  const missingConfig = getMissingProductionConfig(config);
  const base = safeBase(mode, config);

  if (mode === "live") return { ...base, ok: true };

  const checks: Record<string, FgcHealthState> = {
    application: "ready",
    configuration: missingConfig.length === 0 ? "ready" : "not_configured",
    database: config.databaseUrl ? "unknown" : "not_configured",
    migrations: config.databaseUrl ? "unknown" : "not_configured",
    storage: config.evidenceStorageProvider && config.evidenceStorageBucket && config.supabaseUrl && config.supabaseServiceRoleKey ? "ready" : "not_configured",
    email: config.emailProvider && config.emailFrom && config.emailApiKey ? "ready" : "not_configured"
  };

  if (!config.databaseUrl) return { ...base, checks };

  try {
    const result = await fgcQuery<{ migration_count: number }>(`
      SELECT count(*)::int AS migration_count
      FROM information_schema.tables
      WHERE table_schema = 'fgc' AND table_name = 'schema_migrations'
    `);
    const migrationsTableExists = Number(result.rows[0]?.migration_count ?? 0) === 1;
    checks.database = "ready";
    checks.migrations = migrationsTableExists ? "ready" : "not_ready";
    const ready = missingConfig.length === 0 && migrationsTableExists;
    return { ...base, ok: ready, status: ready ? "ready" : "not_ready", checks };
  } catch {
    checks.database = "unavailable";
    checks.migrations = "unknown";
    return { ...base, checks };
  }
}
