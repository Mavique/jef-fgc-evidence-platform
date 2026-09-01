import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function loadEnv() {
  const envPath = join(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(`Missing .env.local at ${envPath}`);
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

export function databaseUrl() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing from .env.local");
  return url;
}

export function redactedDatabaseTarget() {
  const url = new URL(databaseUrl());
  return {
    scheme: url.protocol.replace(":", ""),
    host: url.hostname,
    port: url.port || "(default)",
    database: url.pathname.replace(/^\//, ""),
    supabaseLike: /supabase/i.test(url.hostname)
  };
}

export const migrationFiles = [
  "001_schema.sql",
  "003_tvet_reference_schema.sql",
  "005_curriculum_master_schema.sql",
  "007_production_hardening_schema.sql"
];

export const referenceSeedFiles = [
  "seeds/001_production_reference.sql",
  "004_seed_tvet_reference.sql",
  "006_seed_curriculum_master.sql"
];
