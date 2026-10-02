import fs from "node:fs";
import path from "node:path";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstitutionLogoRibbon } from "@/components/home/InstitutionLogoRibbon";
import { institutionLogos, validateInstitutionLogoInventory } from "@/content/institution-logos";

const projectRoot = process.cwd();

function mockReducedMotion(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn()
    }))
  });
}

describe("institutionLogos", () => {
  it("keeps the canonical inventory unique and locally backed by files with dimensions", () => {
    const result = validateInstitutionLogoInventory(institutionLogos, (src) => {
      return fs.existsSync(path.join(projectRoot, "public", src.replace(/^\//, "")));
    });

    expect(result).toEqual({
      duplicateSlugs: [],
      missingAssets: [],
      missingDimensions: [],
      valid: true
    });
  });

  it("fails validation when a referenced logo file is missing", () => {
    const [firstLogo, ...rest] = institutionLogos;
    const result = validateInstitutionLogoInventory([{ ...firstLogo, src: "/images/institutions/missing-logo.png" }, ...rest], (src) => {
      return fs.existsSync(path.join(projectRoot, "public", src.replace(/^\//, "")));
    });

    expect(result.valid).toBe(false);
    expect(result.missingAssets).toContain("/images/institutions/missing-logo.png");
  });
});

describe("InstitutionLogoRibbon", () => {
  beforeEach(() => {
    mockReducedMotion(false);
    sessionStorage.clear();
  });

  it("renders logos only, without public captions or explanatory text", () => {
    const { container } = render(<InstitutionLogoRibbon />);

    for (const forbidden of ["Our Partners", "Trusted by", "Partner institutions", "Clients", "Supported by", "In collaboration with"]) {
      expect(screen.queryByText(forbidden)).not.toBeInTheDocument();
    }

    expect(container.querySelectorAll('ul[data-logo-copy="canonical"] img')).toHaveLength(institutionLogos.length);
    expect(container.querySelectorAll('ul[data-logo-copy="duplicate"][aria-hidden="true"]')).toHaveLength(2);
  });

  it("provides an accessible pause control and stores the visitor preference for the session", () => {
    const { container } = render(<InstitutionLogoRibbon />);
    const pauseButton = screen.getByRole("button", { name: /pause institution logo ribbon/i });

    expect(pauseButton).toHaveAttribute("aria-pressed", "false");
    expect(container.firstElementChild).toHaveAttribute("data-paused", "false");

    fireEvent.click(pauseButton);

    expect(screen.getByRole("button", { name: /resume institution logo ribbon/i })).toHaveAttribute("aria-pressed", "true");
    expect(container.firstElementChild).toHaveAttribute("data-paused", "true");
    expect(sessionStorage.getItem("jef-institution-logo-ribbon-paused")).toBe("true");
  });

  it("pauses motion when keyboard focus enters the logo region", () => {
    const { container } = render(<InstitutionLogoRibbon />);
    const pauseButton = screen.getByRole("button", { name: /pause institution logo ribbon/i });

    fireEvent.focus(pauseButton);

    expect(container.firstElementChild).toHaveAttribute("data-paused", "true");
  });

  it("marks reduced-motion visitors as paused", () => {
    mockReducedMotion(true);
    const { container } = render(<InstitutionLogoRibbon />);

    expect(container.firstElementChild).toHaveAttribute("data-reduced-motion", "true");
    expect(container.firstElementChild).toHaveAttribute("data-paused", "true");
  });
});
