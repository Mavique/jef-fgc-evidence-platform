// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { KnowledgeResources } from "@/components/home/KnowledgeResources";
import {
  featuredKnowledgeResource,
  homepageKnowledgeResourceIds,
  knowledgeResourcesIntro,
  supportingKnowledgeResources
} from "@/content/home-resources";

const repoRoot = process.cwd();

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

describe("KnowledgeResources", () => {
  it("selects only approved public resources with working local targets", () => {
    expect(homepageKnowledgeResourceIds).toEqual([
      "jef-product-catalogue",
      "digital-xr-catalogue",
      "responsible-technology-governance"
    ]);
    expect(featuredKnowledgeResource.href).toBe("/documents/jef-xr-lab-product-catalogue.pdf");
    expect(featuredKnowledgeResource.download).toBe(true);
    expect(existsSync(join(repoRoot, "public", featuredKnowledgeResource.href.slice(1)))).toBe(true);
    expect(existsSync(join(repoRoot, "public", featuredKnowledgeResource.image.slice(1)))).toBe(true);

    for (const resource of supportingKnowledgeResources) {
      expect(resource.href).not.toMatch(/fgc|private|internal|draft/i);
      expect(resource.title).not.toMatch(/Private FGC protected/i);
      expect(resource.description).not.toMatch(/placeholder/i);
    }
  });

  it("renders the homepage shelf without exposing restricted FGC records", () => {
    render(<KnowledgeResources />);

    expect(screen.getByRole("heading", { name: knowledgeResourcesIntro.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View all resources/i })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /Download PDF/i })).toHaveAttribute(
      "href",
      "/documents/jef-xr-lab-product-catalogue.pdf"
    );
    expect(screen.getByRole("link", { name: /Explore catalogue/i })).toHaveAttribute("href", "/xr-catalogue");
    expect(screen.getByRole("link", { name: /Read framework/i })).toHaveAttribute("href", "/about/governance");
    expect(screen.queryByText("Private FGC protected")).not.toBeInTheDocument();
    expect(screen.queryByText(/JEF in Action/i)).not.toBeInTheDocument();
  });
});
