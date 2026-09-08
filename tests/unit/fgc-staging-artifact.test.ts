import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { packageStagingArtifact } from "../../scripts/fgc/package-staging-artifact.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "fgc-staging-test-"));
  const generatedServer = join(root, "generated-server");
  const generatedClient = join(root, "generated-client");
  const staging = join(root, "staging.jsonc");
  mkdirSync(generatedServer, { recursive: true });
  mkdirSync(generatedClient, { recursive: true });
  writeFileSync(join(generatedServer, "index.js"), "export default { fetch() { return new Response('ok'); } };\n");
  writeFileSync(join(generatedClient, "asset.js"), "console.log('asset');\n");
  writeFileSync(join(generatedServer, "wrangler.json"), JSON.stringify({
    name: "generated",
    main: "index.js",
    assets: { directory: "../client", binding: "ASSETS" },
    compatibility_flags: ["nodejs_compat"]
  }));
  writeFileSync(staging, JSON.stringify({
    name: "jef-fgc-staging",
    vars: { FGC_ENVIRONMENT: "staging", FGC_CF_IMAGES_CONFIGURED: "false" },
    kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }],
    hyperdrive: [{ binding: "HYPERDRIVE", id: "b".repeat(32) }]
  }));
  return { root, generatedServer, generatedClient, staging };
}

describe("staging artifact packaging", () => {
  it("preserves the generated entry/assets and composes approved bindings", () => {
    const f = fixture();
    const output = join(f.root, "artifact");
    const result = packageStagingArtifact({ generatedServer: f.generatedServer, generatedClient: f.generatedClient, stagingMetadata: f.staging, outputRoot: output });
    const config = JSON.parse(readFileSync(result.configPath, "utf8"));

    expect(config.name).toBe("jef-fgc-staging");
    expect(config.main).toBe("index.js");
    expect(config.assets.directory).toBe("../client");
    expect(config.compatibility_flags).toEqual(["nodejs_compat"]);
    expect(config.hyperdrive).toEqual([{ binding: "HYPERDRIVE", id: "b".repeat(32) }]);
    expect(config.kv_namespaces).toEqual([{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }]);
    expect(result.manifest.sourceCommit).toBe(process.env.FGC_SOURCE_COMMIT ?? "unknown");
    expect(readFileSync(join(output, "server/index.js"), "utf8")).toContain("Response");
    expect(existsSync(join(output, "server/wrangler.staging.json"))).toBe(true);
    expect(result.manifest.server.count).toBe(3);
    expect(result.manifest.client.count).toBe(1);
  });

  it("rejects credential-like configuration material", () => {
    const f = fixture();
    writeFileSync(f.staging, JSON.stringify({ name: "jef-fgc-staging", vars: { FGC_ENVIRONMENT: "staging", DATABASE_URL: "postgresql://x" }, kv_namespaces: [{ binding: "VINEXT_KV_CACHE", id: "a".repeat(32) }], hyperdrive: [{ binding: "HYPERDRIVE", id: "b".repeat(32) }] }));
    expect(() => packageStagingArtifact({ generatedServer: f.generatedServer, generatedClient: f.generatedClient, stagingMetadata: f.staging, outputRoot: join(f.root, "artifact") })).toThrow();
  });

  it("refuses deployment without the explicit staging confirmation", () => {
    const result = spawnSync(process.execPath, ["scripts/fgc/deploy-staging.mjs"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, FGC_ENVIRONMENT: "staging", FGC_STAGING_ARTIFACT_DIR: "C:/missing-staging-artifact" }
    });
    expect(result.status).toBe(2);
    expect(result.stdout + result.stderr).not.toContain("secret");
  });
});
