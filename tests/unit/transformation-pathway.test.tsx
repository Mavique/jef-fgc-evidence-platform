// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { TransformationPathway } from "@/components/home/TransformationPathway";

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

describe("TransformationPathway", () => {
  it("renders the four-stage public transformation sequence", () => {
    render(<TransformationPathway />);

    expect(screen.getByRole("heading", { name: "From opportunity to measurable transformation" })).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);

    for (const stage of ["Discover the need", "Design the intervention", "Activate in context", "Measure and strengthen"]) {
      expect(screen.getByRole("heading", { name: stage })).toBeInTheDocument();
    }
  });

  it("keeps the programme action on a confirmed public route", () => {
    render(<TransformationPathway />);

    expect(screen.getByRole("link", { name: "Explore our programmes" })).toHaveAttribute("href", "/programmes");
  });
});
