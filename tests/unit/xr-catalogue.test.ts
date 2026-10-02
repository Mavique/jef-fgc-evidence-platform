import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogueCategories, xrCataloguePdf, xrCatalogueProducts } from "@/content/xr-catalogue";

const repoRoot = process.cwd();

describe("XR catalogue product data", () => {
  it("keeps stable unique identifiers and slugs", () => {
    const ids = new Set(xrCatalogueProducts.map((product) => product.id));
    const slugs = new Set(xrCatalogueProducts.map((product) => product.slug));

    expect(ids.size).toBe(xrCatalogueProducts.length);
    expect(slugs.size).toBe(xrCatalogueProducts.length);
    expect(xrCatalogueProducts.length).toBeGreaterThanOrEqual(20);
  });

  it("keeps every product in a valid category with accessible image metadata", () => {
    for (const product of xrCatalogueProducts) {
      expect(catalogueCategories).toContain(product.category);
      expect(product.image).toMatch(/^\/images\/xr-catalogue\/.+\.webp$/);
      expect(product.imageAlt.length).toBeGreaterThan(12);
      expect(product.sourcePage).toBeGreaterThanOrEqual(3);
      expect(product.sourcePage).toBeLessThanOrEqual(7);
      expect(product.specifications.length).toBeGreaterThan(0);
      expect(product.specifications.map((spec) => spec.value.toLowerCase()).join(" ")).not.toContain("placeholder");
    }
  });

  it("represents fixed and quote-only pricing honestly", () => {
    const fixed = xrCatalogueProducts.filter((product) => product.pricingMode === "FIXED");
    const quoteOnly = xrCatalogueProducts.filter((product) => product.pricingMode === "REQUEST_QUOTE");

    expect(fixed.length).toBeGreaterThan(10);
    expect(quoteOnly.length).toBeGreaterThan(3);
    for (const product of fixed) {
      expect(product.displayedPrice).toMatch(/^R[\d,]+\.\d{2}$/);
    }
    for (const product of quoteOnly) {
      expect(product.displayedPrice).toBeUndefined();
    }
  });

  it("has public downloadable PDF and product image assets", () => {
    expect(xrCataloguePdf.href).toBe("/documents/jef-xr-lab-product-catalogue.pdf");
    expect(xrCataloguePdf.bytes).toBe(13433260);
    expect(existsSync(join(repoRoot, "public/documents/jef-xr-lab-product-catalogue.pdf"))).toBe(true);

    for (const product of xrCatalogueProducts) {
      expect(existsSync(join(repoRoot, "public", product.image.slice(1)))).toBe(true);
    }
  });
});

describe("XR catalogue public navigation contract", () => {
  it("adds XR Catalogue to the public navigation and footer", () => {
    const navSource = join(repoRoot, "src/components/SiteNav.tsx");
    const footerSource = join(repoRoot, "src/components/Footer.tsx");

    expect(readFileSync(navSource, "utf8")).toContain('label: "XR Catalogue"');
    expect(readFileSync(navSource, "utf8")).toContain('href: "/xr-catalogue"');
    expect(readFileSync(footerSource, "utf8")).toContain('["XR Catalogue", "/xr-catalogue"]');
  });
});
