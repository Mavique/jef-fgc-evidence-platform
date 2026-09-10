import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { projectRoot, migrationFiles } from "./config.mjs";

export const POSTGRES_IMAGE = "postgres:16.4-alpine";

export function sanitizeDiagnostic(value) {
  return String(value ?? "")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[redacted-database-url]")
    .replace(/(password|token|secret|api[_-]?key)\s*[=:]\s*[^\s,;]+/gi, "$1=[redacted]")
    .replace(/FGC_[A-Z0-9_]+/g, "[redacted-config]")
    .slice(0, 2000);
}

export function runDockerCommand(args, { stage, runner = spawnSync, options = {} } = {}) {
  const result = runner("docker", args, { encoding: "utf8", ...options });
  if (result.error) throw new Error(`${stage}: docker unavailable (${sanitizeDiagnostic(result.error.message)})`);
  if (result.status !== 0) {
    const detail = sanitizeDiagnostic(result.stderr || result.stdout);
    throw new Error(`${stage}: docker command failed (exit ${result.status})${detail ? `: ${detail}` : ""}`);
  }
  return String(result.stdout ?? "").trim();
}

export async function runIntegrationLifecycle({ start, waitForReady, configure, migrate, test, cleanup }) {
  let stage = "start container";
  let exitCode = 0;
  let failure;
  try {
    await start();
    stage = "wait for readiness";
    await waitForReady();
    stage = "create/configure test database";
    await configure();
    stage = "validate/apply migrations";
    await migrate();
    stage = "run integration tests";
    await test();
  } catch (error) {
    exitCode = typeof error?.exitCode === "number" ? error.exitCode : 1;
    failure = `${stage}: ${sanitizeDiagnostic(error instanceof Error ? error.message : error)}`;
  } finally {
    try {
      await cleanup();
    } catch (error) {
      if (!failure) {
        exitCode = 1;
        failure = `cleanup: ${sanitizeDiagnostic(error instanceof Error ? error.message : error)}`;
      }
    }
  }
  return { exitCode, failure };
}

export function createContainerName(pid = process.pid, timestamp = Date.now()) {
  return `fgc-pg-integration-${pid}-${timestamp}`;
}

async function main() {
  const container = createContainerName();
  const suite = process.argv[2] === "workflow"
    ? "tests/integration/fgc-workflow.integration.test.ts"
    : process.argv[2] === "evidence"
      ? "tests/integration/fgc-evidence.integration.test.ts"
      : "tests/integration/fgc-db.integration.test.ts";
  let port;
  const docker = (args, options = {}) => runDockerCommand(args, options);

  const cleanupContainer = () => {
    const result = spawnSync("docker", ["rm", "-f", container], { encoding: "utf8" });
    if (result.error || (result.status !== 0 && !/No such container/i.test(result.stderr ?? ""))) {
      throw new Error("docker cleanup failed");
    }
  };

  const result = await runIntegrationLifecycle({
    start: async () => {
      const password = randomBytes(24).toString("base64url");
      process.env.FGC_TEST_INTEGRATION_PASSWORD = password;
      docker([
        "run", "--name", container, "--tmpfs", "/var/lib/postgresql/data",
        "--health-cmd", "pg_isready -U postgres -d postgres",
        "--health-interval", "1s", "--health-timeout", "2s", "--health-retries", "30",
        "--health-start-period", "2s", "-e", `POSTGRES_PASSWORD=${password}`,
        "-p", "127.0.0.1::5432", "-d", POSTGRES_IMAGE
      ], { stage: "start container" });
      port = docker(["port", container, "5432/tcp"], { stage: "start container" })
        .split(/\r?\n/).map((line) => line.match(/:(\d+)\s*$/)?.[1]).find(Boolean);
      if (!port) throw new Error("allocated port unavailable");
    },
    waitForReady: async () => {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const status = docker(["inspect", "--format", "{{.State.Health.Status}}", container], { stage: "wait for readiness" });
        if (status === "healthy") return;
        if (status === "unhealthy") throw new Error("PostgreSQL container reported unhealthy");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      throw new Error("PostgreSQL readiness timeout");
    },
    configure: async () => {
      docker(["exec", container, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", "CREATE DATABASE fgc_integration_test;"], { stage: "create/configure test database" });
      docker(["exec", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1", "-c", "CREATE SCHEMA IF NOT EXISTS fgc; CREATE TABLE fgc.schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());"], { stage: "create/configure test database" });
    },
    migrate: async () => {
      for (const file of migrationFiles) {
        const startedAt = Date.now();
        const sql = readFileSync(join(projectRoot, "db", "fgc", file), "utf8");
        docker(["exec", "-i", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1"], { stage: "validate/apply migrations", options: { input: sql } });
        const checksum = createHash("sha256").update(sql).digest("hex");
        docker(["exec", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1", "-c", `INSERT INTO fgc.schema_migrations (version, checksum) VALUES ('${file}', '${checksum}');`], { stage: "validate/apply migrations" });
        console.log(`migration=${file} result=passed duration_ms=${Date.now() - startedAt}`);
      }
    },
    test: async () => {
      const password = process.env.FGC_TEST_INTEGRATION_PASSWORD;
      const databaseUrl = new URL("postgresql://127.0.0.1");
      databaseUrl.username = "postgres";
      databaseUrl.password = password;
      databaseUrl.port = port;
      databaseUrl.pathname = "/fgc_integration_test";
      const test = spawnSync(process.execPath, [join(projectRoot, "node_modules", "vitest", "vitest.mjs"), "run", "--config", "vitest.integration.config.ts", suite], {
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: "test", FGC_INTEGRATION_TEST: "1", FGC_TEST_DATABASE_URL: databaseUrl.toString(), FGC_SESSION_SECRET: password },
        stdio: "inherit"
      });
      if (test.error) throw test.error;
      if (test.status !== 0) {
        const error = new Error("integration test command failed");
        error.exitCode = test.status ?? 1;
        throw error;
      }
    },
    cleanup: async () => {
      delete process.env.FGC_TEST_INTEGRATION_PASSWORD;
      cleanupContainer();
    }
  });

  if (result.failure) console.error(result.failure);
  process.exitCode = result.exitCode;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
