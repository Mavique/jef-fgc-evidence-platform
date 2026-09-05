import { spawnSync } from "node:child_process";
import { migrationFiles } from "./config.mjs";

const expectedBranch = process.env.FGC_EXPECTED_BRANCH ?? "fix/fgc-production-hardening";
const productionRequested = process.argv.includes("--production");
const failures = [];
const requiredRuntimeVariables = [
  "FGC_APP_URL",
  "FGC_ENVIRONMENT",
  "FGC_EMAIL_PROVIDER",
  "FGC_EMAIL_FROM",
  "FGC_EVIDENCE_STORAGE_PROVIDER",
  "FGC_EVIDENCE_STORAGE_BUCKET",
  "FGC_SESSION_SECRET",
  "FGC_EMAIL_API_KEY",
  "FGC_SUPABASE_SERVICE_ROLE_KEY",
  "FGC_SESSION_TTL_SECONDS"
];

function commandOutput(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

const branch = commandOutput("git", ["branch", "--show-current"]);
const status = commandOutput("git", ["status", "--porcelain"]);
if (branch !== expectedBranch) failures.push("the current branch does not match the expected deployment branch");
if (status === null) failures.push("Git status could not be verified");
else if (status) failures.push("the working tree must be clean before a deployment gate can pass");

if (migrationFiles.some((file) => /seed|demo/i.test(file))) failures.push("the production migration list contains a seed or demo file");
if (!process.env.FGC_STAGING_VERIFIED_AT) failures.push("FGC_STAGING_VERIFIED_AT is required after non-production staging verification");
if (process.env.FGC_EVIDENCE_PUBLIC === "true") failures.push("public evidence storage is forbidden");
const missingRuntimeVariables = requiredRuntimeVariables.filter((name) => !process.env[name]);
if (missingRuntimeVariables.length) failures.push(`required runtime configuration is missing: ${missingRuntimeVariables.join(", ")}`);

if (productionRequested) {
  failures.push("production deployment is intentionally refused by this local gate; use the approved release process");
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exitCode = 2;
} else {
  console.log(JSON.stringify({ ok: true, branch, migrationCount: migrationFiles.length, stagingVerified: true }, null, 2));
}
