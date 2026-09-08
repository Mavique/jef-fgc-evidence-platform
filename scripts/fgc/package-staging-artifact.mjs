import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { composeStagingConfig, parseJsonc } from "./compose-staging-worker.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const generatedServerPath = resolve(projectRoot, "dist/server");
const generatedClientPath = resolve(projectRoot, "dist/client");
const stagingMetadataPath = resolve(projectRoot, ".wrangler/staging/wrangler.jsonc");

function filesUnder(root) {
  if (!existsSync(root)) throw new Error(`Required generated artifact directory is missing: ${relative(projectRoot, root)}.`);
  const files = [];
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name !== ".dev.vars") files.push(full);
      else if (entry.isSymbolicLink()) throw new Error("Generated staging artifacts must not contain symbolic links.");
    }
  }
  visit(root);
  return files.sort();
}

function inventory(root, label) {
  const records = filesUnder(root).map((file) => {
    const digest = createHash("sha256").update(readFileSync(file)).digest("hex");
    return { path: relative(root, file).replaceAll("\\", "/"), sha256: digest };
  });
  const digest = createHash("sha256").update(JSON.stringify(records)).digest("hex");
  return { label, count: records.length, sha256: digest, records };
}

function assertNoSecrets(config) {
  const text = JSON.stringify(config);
  if (/postgres(?:ql)?:\/\/|BEGIN .*PRIVATE KEY|service[_-]?role|password\s*[:=]|api[_-]?key|session[_-]?secret|bootstrap[_-]?token/i.test(text)) {
    throw new Error("The staging artifact contains forbidden credential material.");
  }
}

export function packageStagingArtifact({ outputRoot, generatedServer = generatedServerPath, generatedClient = generatedClientPath, stagingMetadata = stagingMetadataPath } = {}) {
  const metadata = parseJsonc(readFileSync(stagingMetadata, "utf8"), "staging metadata");
  const hyperdriveId = metadata.hyperdrive?.[0]?.id;
  const kvId = metadata.kv_namespaces?.[0]?.id;
  if (!hyperdriveId || !kvId) throw new Error("Staging binding metadata must include both approved resource identifiers.");
  const output = outputRoot ?? process.env.FGC_STAGING_ARTIFACT_ROOT ?? mkdtempSync(join(tmpdir(), "fgc-staging-artifact-"));
  const server = join(output, "server");
  const client = join(output, "client");
  if (existsSync(output) && readdirSync(output).length > 0) throw new Error("Artifact output directory must be new and empty.");
  cpSync(generatedServer, server, { recursive: true, force: false, filter: (source) => !source.endsWith("\\.dev.vars") && !source.endsWith("/.dev.vars") });
  cpSync(generatedClient, client, { recursive: true, force: false });
  const composedPath = join(server, "wrangler.staging.json");
  composeStagingConfig({ generatedPath: join(generatedServer, "wrangler.json"), stagingPath: stagingMetadata, approvedBindings: { hyperdriveId, kvId }, outputPath: composedPath });
  const config = JSON.parse(readFileSync(composedPath, "utf8"));
  assertNoSecrets(config);
  writeFileSync(join(server, "wrangler.staging.json"), JSON.stringify(config, null, 2) + "\n", "utf8");
  const serverInventory = inventory(server, "server");
  const clientInventory = inventory(client, "client");
  const manifest = {
    format: 1,
    sourceCommit: process.env.FGC_SOURCE_COMMIT ?? "unknown",
    workerName: config.name,
    config: "server/wrangler.staging.json",
    server: serverInventory,
    client: clientInventory,
    artifactSha256: createHash("sha256").update(JSON.stringify({ server: serverInventory.sha256, client: clientInventory.sha256, config: createHash("sha256").update(readFileSync(join(server, "wrangler.staging.json"))).digest("hex") })).digest("hex")
  };
  writeFileSync(join(output, "manifest.json"), JSON.stringify({ ...manifest, server: { label: "server", count: serverInventory.count, sha256: serverInventory.sha256 }, client: { label: "client", count: clientInventory.count, sha256: clientInventory.sha256 } }, null, 2) + "\n", "utf8");
  return { output, configPath: join(server, "wrangler.staging.json"), manifest };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = packageStagingArtifact();
    console.log(JSON.stringify({ ok: true, output: result.output, config: "server/wrangler.staging.json", workerName: result.manifest.workerName, artifactSha256: result.manifest.artifactSha256 }));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "staging artifact packaging failed" }));
    process.exitCode = 2;
  }
}
