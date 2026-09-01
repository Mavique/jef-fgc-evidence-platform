import { describe, expect, it } from "vitest";
import { impactRecords, programmeSchema, programmes } from "@/content/site";

describe("JEF content model", () => {
  it("keeps programme content valid and slugged", () => {
    for (const programme of programmes) {
      expect(() => programmeSchema.parse(programme)).not.toThrow();
      expect(programme.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("does not publish fabricated numeric impact values in impact records", () => {
    const serialized = JSON.stringify(impactRecords.map((record) => record.value));
    expect(serialized).not.toMatch(/\b\d{2,}\b/);
  });
});
