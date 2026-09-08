import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, resolve } from "node:path";

const confirmation = "I_UNDERSTAND_STAGING_DEPLOY";
const artifactRoot = process.env.FGC_STAGING_ARTIFACT_DIR;
if (process.env.FGC_ENVIRONMENT !== "staging" || process.env.FGC_STAGING_DEPLOY_CONFIRM !== confirmation) {
  console.error(JSON.stringify({ ok: false, error: "Staging deployment requires FGC_ENVIRONMENT=staging and explicit confirmation." }));
  process.exit(2);
}
if (!artifactRoot || !existsSync(artifactRoot)) {
  console.error(JSON.stringify({ ok: false, error: "FGC_STAGING_ARTIFACT_DIR must point to a validated staging artifact." }));
  process.exit(2);
}
const configPath = resolve(artifactRoot, "server/wrangler.staging.json");
const manifestPath = resolve(artifactRoot, "manifest.json");
if (!existsSync(configPath) || !existsSync(manifestPath)) {
  console.error(JSON.stringify({ ok: false, error: "Validated staging artifact manifest/configuration is missing." }));
  process.exit(2);
}
const config = JSON.parse(readFileSync(configPath, "utf8"));
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (config.name !== "jef-fgc-staging") {
  console.error(JSON.stringify({ ok: false, error: "Only the jef-fgc-staging Worker is permitted." }));
  process.exit(2);
}
const configDigest = createHash("sha256").update(readFileSync(configPath)).digest("hex");
function inventoryDigest(root) {
  const records = [];
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name !== ".dev.vars") records.push({ path: relative(root, full).replaceAll("\\", "/"), sha256: createHash("sha256").update(readFileSync(full)).digest("hex") });
      else if (entry.isSymbolicLink()) throw new Error("Staging artifact contains a symbolic link.");
    }
  }
  visit(root);
  return createHash("sha256").update(JSON.stringify(records.sort((a, b) => a.path.localeCompare(b.path)))).digest("hex");
}
if (inventoryDigest(resolve(artifactRoot, "server")) !== manifest.server.sha256 || inventoryDigest(resolve(artifactRoot, "client")) !== manifest.client.sha256) {
  console.error(JSON.stringify({ ok: false, error: "Staging artifact files do not match its manifest." }));
  process.exit(2);
}
const expected = createHash("sha256").update(JSON.stringify({ server: manifest.server.sha256, client: manifest.client.sha256, config: configDigest })).digest("hex");
if (expected !== manifest.artifactSha256) {
  console.error(JSON.stringify({ ok: false, error: "Staging artifact hashes do not match its manifest." }));
  process.exit(2);
}
const result = spawnSync("npx.cmd", ["wrangler", "deploy", "--config", configPath], { stdio: "inherit" });
process.exit(result.status ?? 1);
