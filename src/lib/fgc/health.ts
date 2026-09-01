import { fgcQuery } from "@/lib/fgc/db";
import { getFgcRuntimeConfig, getMissingProductionConfig } from "@/lib/fgc/env";

export type FgcHealthMode = "live" | "ready";

export async function getFgcHealthStatus(mode: FgcHealthMode) {
  const config = getFgcRuntimeConfig();
  const missingConfig = getMissingProductionConfig(config);
  const base = {
    ok: false,
    service: "jef-fgc-platform",
    mode,
    environment: process.env.FGC_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    version: process.env.CF_VERSION_METADATA || process.env.GITHUB_SHA || "local",
    checks: {
      application: true,
      database: false,
      migrations: false,
      storageConfiguration: Boolean(config.evidenceStorageProvider && config.evidenceStorageBucket),
      emailConfiguration: Boolean(config.emailProvider && config.emailFrom && config.emailApiKey),
      requiredConfiguration: missingConfig.length === 0
    },
    missingConfig
  };

  if (mode === "live") return { ...base, ok: true };
  if (!config.databaseUrl) return base;

  try {
    const result = await fgcQuery<{ migration_count: number }>(`
      SELECT count(*)::int AS migration_count
      FROM information_schema.tables
      WHERE table_schema = 'fgc' AND table_name = 'schema_migrations'
    `);
    const migrationsTableExists = Number(result.rows[0]?.migration_count ?? 0) === 1;
    return {
      ...base,
      ok: missingConfig.length === 0 && migrationsTableExists,
      checks: {
        ...base.checks,
        database: true,
        migrations: migrationsTableExists
      }
    };
  } catch {
    return base;
  }
}
