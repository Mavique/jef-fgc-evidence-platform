// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { PartnerWithJef } from "@/components/home/PartnerWithJef";
import { ContactPartnershipContext } from "@/components/public-routes/ContactPartnershipContext";
import {
  isPartnershipPathwayId,
  partnershipPathways
} from "@/content/partnership-pathways";

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

describe("partnership pathways content", () => {
  it("defines the four approved audience-specific partnership routes", () => {
    expect(partnershipPathways.map((pathway) => pathway.id)).toEqual([
      "tvet-education",
      "government-municipalities",
      "industry-employers",
      "funders-strategic"
    ]);

    for (const pathway of partnershipPathways) {
      expect(pathway.contactHref).toBe(`/contact?partnership=${pathway.id}`);
      expect(pathway.possibilities.length).toBe(4);
      expect(pathway.summary).not.toMatch(/existing partner|trusted by|unlock synergies|world-class|revolutionary/i);
      expect(isPartnershipPathwayId(pathway.id)).toBe(true);
    }

    expect(isPartnershipPathwayId("unsupported")).toBe(false);
  });
});

describe("PartnerWithJef", () => {
  it("renders an interactive navigator with contextual contact actions", () => {
    render(<PartnerWithJef />);

    expect(screen.getByRole("heading", { name: "Partner With JEF" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /TVET Colleges and Education Institutions/i })[0]).toHaveAttribute("aria-current");

    fireEvent.click(screen.getAllByRole("button", { name: /Industry and Employers/i })[0]);

    expect(screen.getByRole("heading", { name: "Industry and Employers" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Build an industry pathway/i })[0]).toHaveAttribute(
      "href",
      "/contact?partnership=industry-employers"
    );
    expect(screen.queryByText(/testimonial/i)).not.toBeInTheDocument();
  });
});

describe("ContactPartnershipContext", () => {
  it("uses a valid query context and lets visitors change enquiry type", () => {
    window.history.replaceState(null, "", "/contact?partnership=government-municipalities");
    render(<ContactPartnershipContext initialPartnership="government-municipalities" />);

    const select = screen.getByLabelText("Enquiry type");
    expect(select).toHaveValue("government-municipalities");
    expect(screen.getByText("Government and municipality partnership")).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "funders-strategic" } });

    expect(select).toHaveValue("funders-strategic");
    expect(window.location.search).toBe("?partnership=funders-strategic");
    expect(screen.getByRole("link", { name: /Email admin@jengrac.tech/i })).toHaveAttribute(
      "href",
      expect.stringContaining("Funder%20and%20strategic%20partner%20conversation")
    );
  });

  it("falls back safely when the query category is invalid", () => {
    render(<ContactPartnershipContext initialPartnership="unsupported" />);

    expect(screen.getByRole("status")).toHaveTextContent(/not recognised/i);
    expect(screen.getByLabelText("Enquiry type")).toHaveValue("tvet-education");
  });
});
