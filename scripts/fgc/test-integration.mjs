import { createHash, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, migrationFiles } from "./config.mjs";

const container = `fgc-pg-integration-${process.pid}-${Date.now()}`;
const suite = process.argv[2] === "workflow"
  ? "tests/integration/fgc-workflow.integration.test.ts"
  : process.argv[2] === "evidence"
    ? "tests/integration/fgc-evidence.integration.test.ts"
    : "tests/integration/fgc-db.integration.test.ts";
let port;

function run(args, options = {}) {
  const result = spawnSync("docker", args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`docker command failed with status ${result.status}`);
  }
  return result.stdout.trim();
}

function cleanup() {
  spawnSync("docker", ["rm", "-f", container], { stdio: "ignore" });
}

try {
  const password = randomBytes(24).toString("base64url");
  run([
    "run", "--name", container, "--tmpfs", "/var/lib/postgresql/data",
    "-e", `POSTGRES_PASSWORD=${password}`, "-p", "127.0.0.1::5432", "-d", "postgres:16-alpine"
  ]);
  port = run(["port", container, "5432/tcp"]).split(":").pop();

  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = spawnSync("docker", ["exec", container, "pg_isready", "-U", "postgres"], { stdio: "ignore" });
    if (result.status === 0) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error("PostgreSQL readiness timeout");

  run(["exec", container, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", "CREATE DATABASE fgc_integration_test;"]);
  run([
    "exec", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1", "-c",
    "CREATE SCHEMA IF NOT EXISTS fgc; CREATE TABLE fgc.schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());"
  ]);
  for (const file of migrationFiles) {
    const startedAt = Date.now();
    const sql = readFileSync(join(projectRoot, "db", "fgc", file), "utf8");
    run(
      ["exec", "-i", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1"],
      { input: sql },
    );
    const checksum = createHash("sha256").update(sql).digest("hex");
    run(["exec", container, "psql", "-U", "postgres", "-d", "fgc_integration_test", "-v", "ON_ERROR_STOP=1", "-c", `INSERT INTO fgc.schema_migrations (version, checksum) VALUES ('${file}', '${checksum}');`]);
    console.log(`migration=${file} result=passed duration_ms=${Date.now() - startedAt}`);
  }

  const databaseUrl = new URL("postgresql://127.0.0.1");
  databaseUrl.username = "postgres";
  databaseUrl.password = password;
  databaseUrl.hostname = "127.0.0.1";
  databaseUrl.port = port;
  databaseUrl.pathname = "/fgc_integration_test";
  const test = spawnSync(process.execPath, [join(projectRoot, "node_modules", "vitest", "vitest.mjs"), "run", "--config", "vitest.integration.config.ts", suite], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: "test",
      FGC_INTEGRATION_TEST: "1",
      FGC_TEST_DATABASE_URL: databaseUrl.toString(),
      FGC_SESSION_SECRET: password
    },
    stdio: "inherit"
  });
  if (test.status !== 0) process.exitCode = test.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : "FGC database integration failed.");
  process.exitCode = 1;
} finally {
  cleanup();
}
