import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { programmeExplorerItems } from "@/components/home/ProgrammeExplorer";
import { programmes } from "@/content/site";

const repoRoot = process.cwd();

function routeExists(href: string) {
  if (href === "/programmes") return true;
  const parts = href.split("/").filter(Boolean);
  return existsSync(join(repoRoot, "src/app", ...parts, "page.tsx"));
}

describe("Programme Explorer", () => {
  it("uses unique, confirmed programme content from the repository", () => {
    expect(programmeExplorerItems).toHaveLength(8);
    expect(new Set(programmeExplorerItems.map((item) => item.name)).size).toBe(programmeExplorerItems.length);

    for (const item of programmeExplorerItems) {
      expect(programmes.some((programme) => programme.name === item.name && programme.image === item.image)).toBe(true);
      expect(item.href).not.toBe("#");
      expect(routeExists(item.href)).toBe(true);
      expect(item.imageAlt.length).toBeGreaterThan(20);
      expect(item.description).not.toMatch(/placeholder|concept|requires verification|the website presents/i);
    }
  });

  it("features the expected homepage programme ecosystem", () => {
    expect(programmeExplorerItems.map((item) => item.name)).toEqual([
      "Digital Transformation Hubs",
      "WORKGRID LABS",
      "VOCLE XR",
      "XR Labs for TVET Colleges",
      "Prolific Edge",
      "JEF iCampus",
      "Spatial Enterprise Solutions",
      "JEF AI Services"
    ]);
  });
});
