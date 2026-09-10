import { describe, expect, it } from "vitest";
import { createContainerName, POSTGRES_IMAGE, runDockerCommand, runIntegrationLifecycle, sanitizeDiagnostic } from "../../scripts/fgc/test-integration.mjs";

describe("PostgreSQL integration harness", () => {
  it("uses a pinned image and unique container names", () => {
    expect(POSTGRES_IMAGE).toBe("postgres:16.4-alpine");
    expect(createContainerName(10, 20)).toBe("fgc-pg-integration-10-20");
    expect(createContainerName(10, 21)).not.toBe(createContainerName(10, 20));
  });

  it("reports Docker stderr by stage without leaking secrets", () => {
    const runner = () => ({ status: 2, stdout: "", stderr: "password=hidden postgresql://user:secret@example.invalid/db FGC_SESSION_SECRET" });
    expect(() => runDockerCommand(["run"], { stage: "start container", runner })).toThrow(/start container: docker command failed \(exit 2\)/);
    const message = (() => { try { runDockerCommand(["run"], { stage: "start container", runner }); } catch (error) { return String(error); } return ""; })();
    expect(message).not.toContain("hidden");
    expect(message).not.toContain("postgresql://");
    expect(message).not.toContain("FGC_SESSION_SECRET");
  });

  it.each([
    ["start container", "start"],
    ["wait for readiness", "ready"],
    ["create/configure test database", "configure"],
    ["validate/apply migrations", "migrate"],
    ["run integration tests", "test"]
  ])("always cleans up after %s failure", async (stage, failedStage) => {
    const calls: string[] = [];
    const lifecycle = await runIntegrationLifecycle({
      start: async () => { calls.push("start"); if (failedStage === "start") throw new Error("docker status 2"); },
      waitForReady: async () => { calls.push("ready"); if (failedStage === "ready") throw new Error("readiness timeout"); },
      configure: async () => { calls.push("configure"); if (failedStage === "configure") throw new Error("create failed"); },
      migrate: async () => { calls.push("migrate"); if (failedStage === "migrate") throw new Error("migration failed"); },
      test: async () => { calls.push("test"); if (failedStage === "test") { const error = new Error("test failed"); Object.assign(error, { exitCode: 7 }); throw error; } },
      cleanup: async () => { calls.push("cleanup"); }
    });
    expect(lifecycle.exitCode).toBe(failedStage === "test" ? 7 : 1);
    expect(lifecycle.failure).toContain(stage);
    expect(calls.at(-1)).toBe("cleanup");
  });

  it("preserves a cleanup failure when no earlier stage failed", async () => {
    const result = await runIntegrationLifecycle({
      start: async () => {}, waitForReady: async () => {}, configure: async () => {}, migrate: async () => {}, test: async () => {},
      cleanup: async () => { throw new Error("cleanup failed"); }
    });
    expect(result.exitCode).toBe(1);
    expect(result.failure).toBe("cleanup: cleanup failed");
  });

  it("sanitizes sensitive diagnostic text", () => {
    const text = sanitizeDiagnostic("FGC_EMAIL_API_KEY=secret password=hunter2 postgresql://user:pw@example.invalid/db");
    expect(text).toContain("[redacted-config]");
    expect(text).not.toContain("secret");
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("postgresql://");
  });
});
