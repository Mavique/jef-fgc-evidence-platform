// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JefInAction, jefInActionImages } from "@/components/home/JefInAction";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src })
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, ...props }, children)
}));

const repoRoot = process.cwd();

function localImageExists(src: string) {
  return existsSync(join(repoRoot, "public", src.replace(/^\//, "")));
}

function routeExists(href: string) {
  const parts = href.split("/").filter(Boolean);
  return href === "/programmes" || existsSync(join(repoRoot, "src/app", ...parts, "page.tsx"));
}

describe("JEF in Action homepage mosaic", () => {
  it("renders once with approved distinct local images", () => {
    const { container } = render(<JefInAction />);

    expect(container.querySelectorAll('section[aria-labelledby="jef-in-action-title"]')).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Transformation becomes real through implementation" })).toBeInTheDocument();
    expect(jefInActionImages).toHaveLength(5);
    expect(new Set(jefInActionImages.map((image) => image.src)).size).toBe(jefInActionImages.length);

    for (const image of jefInActionImages) {
      expect(image.src).toMatch(/^\/images\//);
      expect(image.src).not.toMatch(/^https?:\/\//);
      expect(image.src).not.toMatch(/placeholder|stock|unsplash|pexels|picsum/i);
      expect(localImageExists(image.src)).toBe(true);
    }
  });

  it("uses meaningful alt text and semantic captions", () => {
    const { container } = render(<JefInAction />);
    const renderedImages = screen.getAllByRole("img");

    expect(renderedImages).toHaveLength(jefInActionImages.length);
    for (const image of renderedImages) {
      expect(image).toHaveAccessibleName();
      expect(image.getAttribute("alt")).not.toMatch(/^$|placeholder|filename|\.jpg|\.webp/i);
    }

    expect(container.querySelectorAll("figure")).toHaveLength(jefInActionImages.length);
    expect(container.querySelectorAll("figure figcaption")).toHaveLength(jefInActionImages.length);
    for (const image of jefInActionImages) {
      expect(screen.getByText(image.caption)).toBeInTheDocument();
    }
  });

  it("uses only verified non-placeholder links", () => {
    render(<JefInAction />);

    for (const image of jefInActionImages) {
      if (!image.href) continue;
      expect(image.href).not.toBe("#");
      expect(routeExists(image.href)).toBe(true);
    }

    expect(screen.getByRole("link", { name: "View programmes" })).toHaveAttribute("href", "/programmes");
  });
});
