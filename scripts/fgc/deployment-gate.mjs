import { spawnSync } from "node:child_process";
import { migrationFiles } from "./config.mjs";

const expectedBranch = process.env.FGC_EXPECTED_BRANCH ?? "fix/fgc-production-hardening";
const productionRequested = process.argv.includes("--production");
const postVerificationRequested = process.argv.includes("--post-verify");
const failures = [];
const deploymentEnvironment = process.env.FGC_ENVIRONMENT;
const requiredRuntimeVariables = [
  "FGC_APP_URL",
  "FGC_ENVIRONMENT",
  "FGC_EMAIL_PROVIDER",
  "FGC_EMAIL_FROM",
  "FGC_EVIDENCE_STORAGE_PROVIDER",
  "FGC_EVIDENCE_STORAGE_BUCKET",
  "FGC_SUPABASE_URL",
  "FGC_SESSION_SECRET",
  "FGC_EMAIL_API_KEY",
  "FGC_SUPABASE_SERVICE_ROLE_KEY",
  "FGC_SESSION_TTL_SECONDS",
  "FGC_VERIFICATION_TOKEN_TTL_SECONDS",
  "FGC_PASSWORD_RESET_TOKEN_TTL_SECONDS"
];

const resourceVariables = ["FGC_CF_KV_NAMESPACE_ID", "FGC_CF_HYPERDRIVE_ID"];

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
if (postVerificationRequested && !process.env.FGC_STAGING_VERIFIED_AT) failures.push("FGC_STAGING_VERIFIED_AT is required after non-production staging verification");
if (process.env.FGC_EVIDENCE_PUBLIC === "true") failures.push("public evidence storage is forbidden");
if (!["staging", "production"].includes(deploymentEnvironment)) failures.push("FGC_ENVIRONMENT must be staging or production for a deployment gate");
const missingRuntimeVariables = requiredRuntimeVariables.filter((name) => !process.env[name]);
if (missingRuntimeVariables.length) failures.push(`required runtime configuration is missing: ${missingRuntimeVariables.join(", ")}`);
const missingResourceVariables = resourceVariables.filter((name) => !process.env[name]);
if (missingResourceVariables.length) failures.push(`environment-specific Cloudflare bindings are missing: ${missingResourceVariables.join(", ")}`);
if (process.env.FGC_CF_IMAGES_CONFIGURED && !["true", "false"].includes(process.env.FGC_CF_IMAGES_CONFIGURED)) failures.push("FGC_CF_IMAGES_CONFIGURED must be explicitly true or false");
for (const name of ["FGC_CF_KV_NAMESPACE_ID", "FGC_CF_HYPERDRIVE_ID"]) {
  const value = process.env[name];
  if (value && (!/^[0-9a-f]{32}$/i.test(value) || /REPLACE|PLACEHOLDER|example/i.test(value))) failures.push(`${name} must be a real target binding identifier, not a placeholder`);
}
if (process.env.FGC_APP_URL) {
  try {
    const url = new URL(process.env.FGC_APP_URL);
    if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(url.hostname)) failures.push("FGC_APP_URL must be a public HTTPS URL for staging or production");
  } catch {
    failures.push("FGC_APP_URL must be a valid URL");
  }
}
if (process.env.FGC_CF_KV_NAMESPACE_ID && process.env.FGC_CF_KV_NAMESPACE_ID === process.env.FGC_CF_PRODUCTION_KV_NAMESPACE_ID && deploymentEnvironment === "staging") failures.push("staging and production KV namespace identifiers must differ");
if (process.env.FGC_CF_HYPERDRIVE_ID && process.env.FGC_CF_HYPERDRIVE_ID === process.env.FGC_CF_PRODUCTION_HYPERDRIVE_ID && deploymentEnvironment === "staging") failures.push("staging and production Hyperdrive identifiers must differ");
if (deploymentEnvironment === "staging" && process.env.FGC_PRODUCTION_APP_URL && process.env.FGC_APP_URL === process.env.FGC_PRODUCTION_APP_URL) failures.push("staging FGC_APP_URL must differ from the production URL");
if (deploymentEnvironment === "production" && process.env.FGC_STAGING_APP_URL && process.env.FGC_APP_URL === process.env.FGC_STAGING_APP_URL) failures.push("production FGC_APP_URL must differ from the staging URL");

if (productionRequested) {
  failures.push("production deployment is intentionally refused by this local gate; use the approved release process");
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exitCode = 2;
} else {
  console.log(JSON.stringify({ ok: true, branch, migrationCount: migrationFiles.length, stagingVerified: true }, null, 2));
}
