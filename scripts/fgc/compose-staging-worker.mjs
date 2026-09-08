import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const generatedConfigPath = resolve(projectRoot, "dist/server/wrangler.json");
const stagingConfigPath = resolve(projectRoot, ".wrangler/staging/wrangler.jsonc");
const outputConfigPath = resolve(projectRoot, "dist/server/wrangler.staging.json");
const allowedVariables = new Set([
  "FGC_ENVIRONMENT",
  "FGC_APP_URL",
  "NEXT_PUBLIC_APP_URL",
  "FGC_EMAIL_PROVIDER",
  "FGC_EMAIL_FROM",
  "FGC_EVIDENCE_STORAGE_PROVIDER",
  "FGC_EVIDENCE_STORAGE_BUCKET",
  "FGC_MAX_UPLOAD_BYTES",
  "FGC_CF_IMAGES_CONFIGURED"
]);
const allowedOverlayKeys = new Set(["$schema", "name", "compatibility_date", "compatibility_flags", "main", "vars", "assets", "cache", "images", "kv_namespaces", "hyperdrive"]);

export function parseJsonc(source, label) {
  source = source.replace(/^\uFEFF/, "");
  let output = "";
  let quote = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
        output += character;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      output += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quote = false;
      continue;
    }
    if (character === '"') {
      quote = true;
      output += character;
    } else if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
    } else if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else {
      output += character;
    }
  }
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`${label} is not valid JSONC.`);
  }
}

function assertSafeText(value, label) {
  if (typeof value !== "string") return;
  if (/postgres(?:ql)?:\/\/|pooler\.supabase\.com|service[_-]?role|password\s*[:=]|fgc-supabase-production|production/i.test(value)) {
    throw new Error(`${label} contains forbidden production or secret material.`);
  }
}

function inspectSafe(value, label = "configuration") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectSafe(item, `${label}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") {
    assertSafeText(value, label);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (/password|secret|token|api[_-]?key|service[_-]?role|connectionstring/i.test(key)) {
      throw new Error(`${label}.${key} is not allowed in a staging Wrangler configuration.`);
    }
    inspectSafe(child, `${label}.${key}`);
  }
}

function oneBinding(config, key, binding) {
  if (!Array.isArray(config[key]) || config[key].length !== 1) throw new Error(`${key} must contain exactly one staging binding.`);
  const entry = config[key][0];
  if (!entry || entry.binding !== binding) throw new Error(`${key} must use the ${binding} binding.`);
  if (typeof entry.id !== "string" || !/^[0-9a-f]{32}$/i.test(entry.id)) throw new Error(`${binding} must use a valid resource identifier.`);
  return entry;
}

function mergeVars(baseVars, overlayVars) {
  if (!overlayVars || typeof overlayVars !== "object" || Array.isArray(overlayVars)) throw new Error("staging vars must be an object.");
  for (const key of Object.keys(overlayVars)) {
    if (!allowedVariables.has(key)) throw new Error(`staging variable ${key} is not allowlisted.`);
  }
  if (overlayVars.FGC_ENVIRONMENT !== "staging") throw new Error("FGC_ENVIRONMENT must be staging.");
  const result = { ...baseVars };
  for (const [key, value] of Object.entries(overlayVars)) {
    if (typeof value !== "string") throw new Error(`staging variable ${key} must be a string.`);
    if (!/REPLACE[-_ ]WITH/i.test(value)) result[key] = value;
  }
  result.FGC_ENVIRONMENT = "staging";
  return result;
}

export function composeStagingConfig({ generatedPath = generatedConfigPath, stagingPath = stagingConfigPath, outputPath = outputConfigPath, approvedBindings = {} } = {}) {
  if (!existsSync(generatedPath)) throw new Error("Run npm run build:vinext before composing the staging Worker configuration.");
  if (!existsSync(stagingPath)) throw new Error("The ignored staging Wrangler configuration is missing.");
  const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
  const staging = parseJsonc(readFileSync(stagingPath, "utf8"), "staging Wrangler configuration");
  inspectSafe(staging, "staging configuration");
  for (const key of Object.keys(staging)) if (!allowedOverlayKeys.has(key)) throw new Error(`staging configuration key ${key} is not allowlisted.`);
  if (staging.name !== "jef-fgc-staging") throw new Error("staging Worker name must be jef-fgc-staging.");
  const hyperdrive = oneBinding(staging, "hyperdrive", "HYPERDRIVE");
  const kv = oneBinding(staging, "kv_namespaces", "VINEXT_KV_CACHE");
  const approvedHyperdriveId = approvedBindings.hyperdriveId ?? process.env.FGC_CF_HYPERDRIVE_ID;
  const approvedKvId = approvedBindings.kvId ?? process.env.FGC_CF_KV_NAMESPACE_ID;
  if (!approvedHyperdriveId || !approvedKvId) throw new Error("Approved staging binding metadata is required.");
  if (approvedHyperdriveId !== hyperdrive.id) throw new Error("Hyperdrive id does not match approved staging metadata.");
  if (approvedKvId !== kv.id) throw new Error("KV id does not match approved staging metadata.");
  if (process.env.FGC_CF_PRODUCTION_HYPERDRIVE_ID && process.env.FGC_CF_PRODUCTION_HYPERDRIVE_ID === hyperdrive.id) throw new Error("Hyperdrive id matches a known production binding.");
  if (process.env.FGC_CF_PRODUCTION_KV_NAMESPACE_ID && process.env.FGC_CF_PRODUCTION_KV_NAMESPACE_ID === kv.id) throw new Error("KV id matches a known production binding.");
  for (const entry of [...(generated.hyperdrive ?? []), ...(generated.kv_namespaces ?? [])]) {
    if (entry.binding === "HYPERDRIVE" && entry.id !== hyperdrive.id) throw new Error("Generated Hyperdrive binding conflicts with staging metadata.");
    if (entry.binding === "VINEXT_KV_CACHE" && entry.id !== kv.id) throw new Error("Generated KV binding conflicts with staging metadata.");
  }
  const result = {
    ...generated,
    name: "jef-fgc-staging",
    vars: mergeVars(generated.vars, staging.vars),
    kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: kv.id }],
    hyperdrive: [{ binding: "HYPERDRIVE", id: hyperdrive.id }]
  };
  delete result.env;
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  return { outputPath, workerName: result.name, hyperdriveBinding: "HYPERDRIVE", kvBinding: "VINEXT_KV_CACHE" };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = composeStagingConfig({
      approvedBindings: {
        hyperdriveId: process.env.FGC_CF_HYPERDRIVE_ID,
        kvId: process.env.FGC_CF_KV_NAMESPACE_ID
      }
    });
    console.log(JSON.stringify({ ok: true, workerName: result.workerName, hyperdriveBinding: result.hyperdriveBinding, kvBinding: result.kvBinding, output: "dist/server/wrangler.staging.json" }));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "staging configuration composition failed" }));
    process.exitCode = 2;
  }
}
