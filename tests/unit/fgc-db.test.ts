import { afterEach, describe, expect, it } from "vitest";
import { closeFgcIntegrationPool, FgcConfigurationError, getFgcPool } from "@/lib/fgc/db";

const originalTestUrl = process.env.FGC_TEST_DATABASE_URL;
const originalIntegrationFlag = process.env.FGC_INTEGRATION_TEST;

afterEach(async () => {
  if (originalTestUrl === undefined) delete process.env.FGC_TEST_DATABASE_URL;
  else process.env.FGC_TEST_DATABASE_URL = originalTestUrl;
  if (originalIntegrationFlag === undefined) delete process.env.FGC_INTEGRATION_TEST;
  else process.env.FGC_INTEGRATION_TEST = originalIntegrationFlag;
  delete process.env.DATABASE_URL;
  if (process.env.FGC_INTEGRATION_TEST === "1") await closeFgcIntegrationPool();
});

describe("FGC database integration boundary", () => {
  it("rejects a test database URL unless the explicit integration flag is enabled", () => {
    process.env.FGC_TEST_DATABASE_URL = "postgresql://127.0.0.1:5432/fgc_test";
    delete process.env.FGC_INTEGRATION_TEST;

    expect(() => getFgcPool()).toThrowError(FgcConfigurationError);
  });

  it("rejects remote or ambiguous test database targets", () => {
    process.env.FGC_TEST_DATABASE_URL = "postgresql://db.example.invalid/fgc_test";
    process.env.FGC_INTEGRATION_TEST = "1";

    expect(() => getFgcPool()).toThrowError(
      "FGC_TEST_DATABASE_URL must target a local database with an explicit port.",
    );
  });

  it("accepts only an explicitly enabled localhost target without connecting during construction", async () => {
    process.env.FGC_TEST_DATABASE_URL = "postgresql://127.0.0.1:65432/fgc_test";
    process.env.FGC_INTEGRATION_TEST = "1";

    expect(getFgcPool()).toBeDefined();
    await closeFgcIntegrationPool();
  });
});
