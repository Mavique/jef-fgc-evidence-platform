// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { EvidenceOfTransformation } from "@/components/home/EvidenceOfTransformation";
import { evidenceOfTransformation } from "@/content/home-evidence";
import { impactRecords, pathways, programmes } from "@/content/site";

beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  }

  globalThis.IntersectionObserver = MockIntersectionObserver;
});

describe("EvidenceOfTransformation", () => {
  it("uses verified structured content for public proof points", () => {
    expect(evidenceOfTransformation.sourceSummary.programmeTotal).toBe(programmes.length);
    expect(evidenceOfTransformation.sourceSummary.pathwayTotal).toBe(pathways.length);
    expect(evidenceOfTransformation.proofPoints).toHaveLength(5);
    expect(evidenceOfTransformation.proofPoints[0].value).toBe(`${programmes.length} public programme records`);
    expect(evidenceOfTransformation.proofPoints[1].value).toBe(`${pathways.length} public pathway audiences`);
    expect(evidenceOfTransformation.proofPoints[2].value).toBe(impactRecords.find((record) => record.title === "Evidence practice")?.value);

    for (const point of evidenceOfTransformation.proofPoints) {
      expect(point.body).not.toMatch(/placeholder|concept|requires verification|the website presents|this section showcases|platform concept/i);
      expect(point.source).toMatch(/^src\/content\/site\.ts/);
    }
  });

  it("renders the editorial evidence section without reviving removed homepage copy", () => {
    render(<EvidenceOfTransformation />);

    expect(screen.getByRole("heading", { name: evidenceOfTransformation.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: evidenceOfTransformation.cta.label })).toHaveAttribute("href", "/programmes");
    expect(screen.getAllByRole("listitem")).toHaveLength(evidenceOfTransformation.proofPoints.length);
    expect(screen.queryByText(/JEF in Action/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Transformation becomes real through implementation/i)).not.toBeInTheDocument();
  });
});
