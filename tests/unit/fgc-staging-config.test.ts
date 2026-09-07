import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { composeStagingConfig } from "../../scripts/fgc/compose-staging-worker.mjs";

const base = {
  name: "generated-app",
  main: "worker.generated.js",
  assets: { directory: "client", binding: "ASSETS" },
  compatibility_date: "2026-09-01",
  compatibility_flags: ["nodejs_compat"],
  vars: { FGC_ENVIRONMENT: "development" }
};
const overlay = {
  name: "jef-fgc-staging",
  vars: { FGC_ENVIRONMENT: "staging", FGC_EMAIL_PROVIDER: "resend", FGC_CF_IMAGES_CONFIGURED: "false" },
  kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }],
  hyperdrive: [{ binding: "HYPERDRIVE", id: "b".repeat(32) }]
};

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "fgc-staging-config-"));
  const generatedPath = join(dir, "wrangler.json");
  const stagingPath = join(dir, "wrangler.jsonc");
  const outputPath = join(dir, "wrangler.staging.json");
  writeFileSync(generatedPath, JSON.stringify(base));
  writeFileSync(stagingPath, JSON.stringify(overlay));
  return { dir, generatedPath, stagingPath, outputPath };
}

describe("staging Worker configuration composition", () => {
  it("merges only approved bindings and preserves generated Worker fields", () => {
    const f = fixture();
    try {
      composeStagingConfig({ ...f, approvedBindings: { hyperdriveId: "b".repeat(32), kvId: "a".repeat(32) } });
      const result = JSON.parse(readFileSync(f.outputPath, "utf8"));
      expect(result.name).toBe("jef-fgc-staging");
      expect(result.main).toBe(base.main);
      expect(result.assets).toEqual(base.assets);
      expect(result.compatibility_flags).toEqual(base.compatibility_flags);
      expect(result.hyperdrive).toEqual([{ binding: "HYPERDRIVE", id: "b".repeat(32) }]);
      expect(result.kv_namespaces).toEqual([{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }]);
      expect(result.vars.FGC_CF_IMAGES_CONFIGURED).toBe("false");
      expect(JSON.stringify(result)).not.toMatch(/password|secret|token|connectionString|postgres:\/\//i);
    } finally { rmSync(f.dir, { recursive: true, force: true }); }
  });

  it.each([
    ["production Hyperdrive", { hyperdrive: [{ binding: "HYPERDRIVE", id: "c".repeat(32) }] }],
    ["production KV", { kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: "c".repeat(32) }] }],
    ["unknown binding", { kv_namespaces: [{ binding: "OTHER", id: "a".repeat(32) }] }],
    ["duplicate KV bindings", { kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }, { binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }] }],
    ["missing Hyperdrive", { hyperdrive: [] }],
    ["production URL", { vars: { ...overlay.vars, FGC_APP_URL: "https://production.example.invalid" } }],
    ["secret-like value", { vars: { ...overlay.vars, FGC_EMAIL_API_KEY: "placeholder" } }]
  ])("rejects %s", (_label, change) => {
    const f = fixture();
    try {
      writeFileSync(f.stagingPath, JSON.stringify({ ...overlay, ...change }));
      expect(() => composeStagingConfig({ ...f, approvedBindings: { hyperdriveId: "b".repeat(32), kvId: "a".repeat(32) } })).toThrow();
    } finally { rmSync(f.dir, { recursive: true, force: true }); }
  });

  it("rejects malformed JSONC and produces deterministic output", () => {
    const first = fixture();
    const second = fixture();
    try {
      writeFileSync(first.stagingPath, "{ broken");
      expect(() => composeStagingConfig({ ...first })).toThrow("not valid JSONC");
      composeStagingConfig({ ...second, approvedBindings: { hyperdriveId: "b".repeat(32), kvId: "a".repeat(32) } });
      const firstOutput = readFileSync(second.outputPath, "utf8");
      composeStagingConfig({ ...second, approvedBindings: { hyperdriveId: "b".repeat(32), kvId: "a".repeat(32) } });
      expect(readFileSync(second.outputPath, "utf8")).toBe(firstOutput);
    } finally { rmSync(first.dir, { recursive: true, force: true }); rmSync(second.dir, { recursive: true, force: true }); }
  });
});
