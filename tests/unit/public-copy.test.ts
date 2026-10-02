import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import nextConfig from "../../next.config";
import { describe, expect, it } from "vitest";
import { findProhibitedPublicCopyIssues, publicCopyProhibitedPhrases } from "@/lib/public-copy-guard";
import { publicRoutes } from "@/content/public-routes";

const repoRoot = process.cwd();
const sourceRoots = ["src/app", "src/components", "src/content"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".json"]);
const excludedFragments = [
  ["src", "app", "api"].join(sep),
  ["src", "components", "merseta-fgc"].join(sep),
  ["src", "content", "fgc-reference-data.ts"].join(sep),
  ["src", "content", "merseta-fgc.ts"].join(sep)
];

function extensionOf(filePath: string) {
  const index = filePath.lastIndexOf(".");
  return index >= 0 ? filePath.slice(index) : "";
}

function collectPublicSourceFiles(directory: string, files: Record<string, string> = {}) {
  if (!existsSync(directory)) return files;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    const repoPath = relative(repoRoot, absolutePath);
    if (excludedFragments.some((fragment) => repoPath.startsWith(fragment))) continue;

    if (entry.isDirectory()) {
      collectPublicSourceFiles(absolutePath, files);
    } else if (sourceExtensions.has(extensionOf(entry.name))) {
      files[repoPath] = readFileSync(absolutePath, "utf8");
    }
  }

  return files;
}

describe("public copy quality guard", () => {
  it("detects prohibited development commentary in public source text", () => {
    const issues = findProhibitedPublicCopyIssues({
      "src/content/example.ts": `export const copy = "${publicCopyProhibitedPhrases[0]}";`
    });

    expect(issues).toEqual([{ filePath: "src/content/example.ts", phrase: publicCopyProhibitedPhrases[0] }]);
  });

  it("keeps public app, component and content sources free of prohibited commentary", () => {
    const publicFiles = sourceRoots.reduce<Record<string, string>>(
      (files, root) => collectPublicSourceFiles(join(repoRoot, root), files),
      {}
    );

    expect(findProhibitedPublicCopyIssues(publicFiles)).toEqual([]);
  });
});

describe("public navigation, footer and typography contract", () => {
  it("keeps the footer FGC Gateway link and removes the old public Impact link", () => {
    const footerSource = readFileSync(join(repoRoot, "src/components/Footer.tsx"), "utf8");

    expect(footerSource).toContain('["FGC Gateway", "/programmes/merseta-fgc-ekm"]');
    expect(footerSource).not.toContain("www.jengrac.tech");
    expect(footerSource).not.toContain('["Impact", "/impact"]');
  });

  it("keeps Impact out of header navigation while preserving FGC access navigation", () => {
    const navSource = readFileSync(join(repoRoot, "src/components/SiteNav.tsx"), "utf8");

    expect(navSource).not.toContain('{ label: "Impact", href: "/impact" }');
    expect(navSource).toContain("FGC Portal");
    expect(navSource).toContain("/fgc-ekm/sign-in");
  });

  it("redirects legacy Impact requests to Projects", async () => {
    const redirects = nextConfig.redirects ? await nextConfig.redirects() : [];

    expect(redirects).toContainEqual({
      source: "/impact",
      destination: "/projects",
      permanent: true
    });
  });

  it("uses an Apple-style body font stack while preserving the heading token", () => {
    const globalsSource = readFileSync(join(repoRoot, "src/styles/globals.css"), "utf8");

    expect(globalsSource).toContain('--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display"');
    expect(globalsSource).toContain('--font-display: "Arial", "Helvetica Neue", sans-serif;');
  });

  it("surfaces the approved product catalogue on the public documents route", () => {
    const cataloguePath = join(repoRoot, "public/documents/jef-product-catalogue.pdf");
    const documentsRoute = publicRoutes.documents;

    expect(existsSync(cataloguePath)).toBe(true);
    expect(documentsRoute.status).toBe("Public product catalogue available");
    expect(documentsRoute.highlights[0]).toMatchObject({
      title: "JEF Product Catalogue",
      href: "/documents/jef-xr-lab-product-catalogue.pdf",
      actionLabel: "Open catalogue"
    });
    expect(documentsRoute.evidence.map((item) => item.title)).toContain("Private FGC protected");
  });
});
