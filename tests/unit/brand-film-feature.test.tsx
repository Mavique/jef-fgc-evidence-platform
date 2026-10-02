// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrandFilmFeature } from "@/components/home/BrandFilmFeature";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src })
}));

describe("JEF brand film homepage feature", () => {
  it("renders the poster facade before visitor interaction", () => {
    render(<BrandFilmFeature />);

    expect(screen.getByRole("heading", { name: "See Transformation in Motion" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /JEF presentation showing integrated platforms/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play the Jengrac Education Foundation brand film" })).toBeInTheDocument();
    expect(screen.queryByTitle("Jengrac Education Foundation brand film")).not.toBeInTheDocument();
  });

  it("loads the privacy-enhanced YouTube iframe only after Play is activated", () => {
    render(<BrandFilmFeature />);

    fireEvent.click(screen.getByRole("button", { name: "Play the Jengrac Education Foundation brand film" }));

    const iframe = screen.getByTitle("Jengrac Education Foundation brand film");
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/zG0xqtNSCP8?autoplay=1&rel=0");
    expect(iframe).toHaveAttribute("allowfullscreen");
  });

  it("supports keyboard activation and preserves the public YouTube fallback link", () => {
    render(<BrandFilmFeature />);

    const button = screen.getByRole("button", { name: "Play the Jengrac Education Foundation brand film" });
    expect(button).toHaveAttribute("type", "button");
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);

    expect(screen.getByTitle("Jengrac Education Foundation brand film")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Watch on YouTube/i })).toHaveAttribute("href", "https://youtu.be/zG0xqtNSCP8");
    expect(screen.getByRole("link", { name: /Watch on YouTube/i })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /Watch on YouTube/i })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("reserves a 16:9 frame and includes reduced-motion-safe styling", () => {
    render(<BrandFilmFeature />);

    expect(screen.getByTestId("jef-brand-film-frame")).toHaveClass("aspect-video");
    expect(screen.getByRole("button", { name: "Play the Jengrac Education Foundation brand film" })).toHaveClass("motion-reduce:transition-none");
  });
});
