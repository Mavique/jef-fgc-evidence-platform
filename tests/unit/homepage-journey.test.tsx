// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LandingHomeExperience } from "@/components/home/LandingHomeExperience";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src })
}));

vi.mock("@/components/SpatialField", () => ({
  SpatialField: () => React.createElement("div", { "aria-hidden": true, "data-testid": "spatial-field" })
}));

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

describe("homepage visitor journey", () => {
  it("preserves the approved homepage sections and one logical h1", () => {
    render(<LandingHomeExperience />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: /We build intelligent systems/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "See Transformation in Motion" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From opportunity to measurable transformation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platforms and programmes for transformation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proof is built into the way transformation moves." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ideas, tools and evidence for education transformation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Partner With JEF" })).toBeInTheDocument();
    expect(screen.queryByText(/JEF in Action/i)).not.toBeInTheDocument();
  });

  it("keeps major homepage actions on public destinations", () => {
    render(<LandingHomeExperience />);

    expect(screen.getAllByRole("link", { name: /Explore programmes/i })[0]).toHaveAttribute("href", "/programmes");
    expect(screen.getByRole("link", { name: /Watch the JEF film/i })).toHaveAttribute("href", "#jef-brand-film-title");
    expect(screen.getByRole("link", { name: /Choose partnership pathway/i })).toHaveAttribute("href", "#partner-with-jef");
    expect(screen.getAllByRole("link", { name: /Discuss institutional transformation/i })[0]).toHaveAttribute(
      "href",
      "/contact?partnership=tvet-education"
    );
  });
});
