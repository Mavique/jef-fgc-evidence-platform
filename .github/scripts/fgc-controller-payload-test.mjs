import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { join, resolve, relative } from "node:path";
import { tmpdir } from "node:os";

const safeMessage = (value) => String(value).replace(/token|secret|password|Bearer|postgres(?:ql)?:\/\/[^\s]+/gi, "[redacted]");
const inside = (root, candidate) => {
  const rootPath = realpathSync(root);
  const candidatePath = resolve(candidate);
  return candidatePath === rootPath || candidatePath.startsWith(`${rootPath}/`);
};

export function controllerPayloadContract({ controller, payload, expectedPayloadCommit, worker }) {
  if (!inside(controller, controller)) throw new Error("controller root escaped");
  if (!inside(payload, payload)) throw new Error("payload root escaped");
  if (controller === payload) throw new Error("controller and payload roots must differ");
  if (worker !== "jef-fgc-staging") throw new Error("unexpected Worker");
  if (expectedPayloadCommit !== "f5c413c9854ed88604eb1457a48abb85e6355a40") throw new Error("payload commit mismatch");
  return { controller, payload, worker, expectedPayloadCommit };
}

export async function runControllerPayloadFixtures() {
  const root = mkdtempSync(join(tmpdir(), "fgc-controller-payload-"));
  const controller = join(root, "_control");
  const payload = join(root, "payload");
  mkdirSync(join(controller, "scripts/fgc"), { recursive: true });
  mkdirSync(join(payload, "scripts/fgc"), { recursive: true });
  writeFileSync(join(controller, "scripts/fgc/cloudflare-credential-preflight.mjs"), "trusted-controller");
  writeFileSync(join(payload, "manifest.json"), JSON.stringify({ sourceCommit: "f5c413c9854ed88604eb1457a48abb85e6355a40" }));
  writeFileSync(join(payload, "scripts/fgc/cloudflare-credential-preflight.mjs"), "payload-shadow");
  assert.equal(readFileSync(join(payload, "scripts/fgc/cloudflare-credential-preflight.mjs"), "utf8"), "payload-shadow");
  assert.equal(readFileSync(join(controller, "scripts/fgc/cloudflare-credential-preflight.mjs"), "utf8"), "trusted-controller");
  const contract = controllerPayloadContract({ controller, payload, expectedPayloadCommit: JSON.parse(readFileSync(join(payload, "manifest.json"))).sourceCommit, worker: "jef-fgc-staging" });
  let downstream = 0;
  const blocked = (code) => { if (code !== "PREFLIGHT_OK") return; downstream += 1; };
  blocked("TOKEN_AUTH_FAILED");
  assert.equal(downstream, 0);
  blocked("PREFLIGHT_OK");
  assert.equal(downstream, 1);
  assert.notEqual(contract.controller, contract.payload);
  assert.equal(relative(root, controller), "_control");
  assert.equal(relative(root, payload), "payload");
  assert(!safeMessage("token-value Bearer secret-value postgresql://user:password@example.invalid/db").includes("secret-value"));
  rmSync(root, { recursive: true, force: true });
  return true;
}

if (process.argv.includes("--test")) await runControllerPayloadFixtures();
