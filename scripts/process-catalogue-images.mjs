#!/usr/bin/env node
/**
 * Processes raw product images from tmp/xr-images-raw/ into uniform catalogue WebPs.
 *
 * - Matches each product to a raw image by keyword score against the filename.
 * - Trims white margins, pads to the card aspect ratio (1.28:1), resizes to 1200px wide.
 * - Writes public/images/xr-catalogue/products/<slug>.webp.
 * - Falls back to the legacy PDF-crop image when no raw match exists, so the site never breaks.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, copyFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const RAW_DIR = join(ROOT, "tmp/xr-images-raw");
const CONTENT_FILE = join(ROOT, "src/content/xr-catalogue.ts");
const LEGACY_DIR = join(ROOT, "public/images/xr-catalogue");
const OUT_DIR = join(ROOT, "public/images/xr-catalogue/products");

const TARGET_WIDTH = 1200;
const TARGET_ASPECT = 1.28; // width / height, matches the card aspect-[1.28]
const TARGET_HEIGHT = Math.round(TARGET_WIDTH / TARGET_ASPECT); // 938
const WEBP_QUALITY = 80;

/** slug -> legacy PDF-crop filename used as fallback source. */
const LEGACY_FALLBACK = {
  "meta-quest-3-vr-headset-128gb": "meta-quest-3-128gb-panel.webp",
  "meta-quest-3-vr-mr-headset-512gb-advanced": "meta-quest-3-512gb-panel.webp",
  "oculus-link-usb-c-cable-5m": "oculus-link-usb-c-cable-panel.webp",
  "vr-headset-hygiene-silicone-covers": "vr-headset-hygiene-covers-panel.webp",
  "vr-floor-safety-markers": "vr-floor-safety-markers-panel.webp",
  "apple-imac-24-m4-student-workstation": "imac-24-m4-student-panel.webp",
  "apple-imac-24-m4-instructor-workstation": "imac-24-m4-instructor-panel.webp",
  "high-performance-desktop-pc-all-in-one-alternative": "high-performance-desktop-pc-panel.webp",
  "laptop-for-education-and-training": "education-training-laptop-panel.webp",
  "student-workstation-desk": "student-workstation-desk-panel.webp",
  "round-collaboration-table-5-person": "round-collaboration-table-panel.webp",
  "apple-ipad-pro-11-lidar-ar-content-creation-tablet": "ipad-pro-11-lidar-panel.webp",
  "ipad-air-11-inch-256gb-ar-learning-tablet": "ipad-air-11-256gb-panel.webp",
  "android-tablet-samsung-tab-a11": "android-tablet-a11-panel.webp",
  "skye-hd-platinum-series-interactive-panel-86": "skye-hd-platinum-panel-86-panel.webp",
  "full-hd-3d-dlp-projector-acer-x1528ki": "acer-x1528ki-projector-panel.webp",
  "100-inch-motorised-projection-screen": "motorised-projection-screen-100-panel.webp",
  "multi-port-usb-c-charging-station-16-port": "multi-port-usb-c-charging-station-panel.webp",
  "ups-10-kva-workstation-protection": "ups-10kva-workstation-panel.webp",
  "ups-3-kva-rack-mount-network": "ups-3kva-rack-panel.webp",
  "secure-xr-charging-storage-cabinet-linkbasic-42u": "secure-xr-charging-storage-cabinet-panel.webp",
  "arborxr-device-management-system": "arborxr-device-management-panel.webp"
};

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".avif"]);

function extractSlugs() {
  const source = readFileSync(CONTENT_FILE, "utf8");
  const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
  if (slugs.length === 0) throw new Error(`No slugs found in ${CONTENT_FILE}`);
  return slugs;
}

function listRawImages() {
  if (!existsSync(RAW_DIR)) return [];
  return readdirSync(RAW_DIR)
    .filter((name) => !name.startsWith(".") && IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
    .map((name) => join(RAW_DIR, name));
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Score = count of slug tokens appearing in the filename. */
function scoreMatch(slug, filename) {
  const haystack = normalize(filename);
  const tokens = normalize(slug).split(" ").filter((token) => token.length > 1);
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

/** Greedy best-score assignment; a file can only be used once. */
function assignFiles(slugs, rawFiles) {
  const pairs = [];
  slugs.forEach((slug, slugIndex) => {
    for (const file of rawFiles) {
      const score = scoreMatch(slug, basename(file));
      if (score > 0) pairs.push({ slug, slugIndex, file, score });
    }
  });
  pairs.sort((a, b) => b.score - a.score || a.slugIndex - b.slugIndex);

  const assignment = new Map();
  const usedFiles = new Set();
  for (const pair of pairs) {
    if (assignment.has(pair.slug) || usedFiles.has(pair.file)) continue;
    assignment.set(pair.slug, pair.file);
    usedFiles.add(pair.file);
  }
  return assignment;
}

async function processImage(sourcePath, outputPath) {
  const trimmed = await sharp(sourcePath)
    .rotate()
    .trim({ threshold: 25 })
    .toBuffer();

  await sharp(trimmed)
    .resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: "contain",
      background: "#ffffff",
      withoutEnlargement: false
    })
    .flatten({ background: "#ffffff" })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

async function main() {
  const slugs = extractSlugs();
  const rawFiles = listRawImages();
  const assignment = assignFiles(slugs, rawFiles);

  mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  for (const slug of slugs) {
    const outputPath = join(OUT_DIR, `${slug}.webp`);
    const matched = assignment.get(slug) ?? null;
    const legacyName = LEGACY_FALLBACK[slug];
    const legacyPath = legacyName ? join(LEGACY_DIR, legacyName) : null;

    let sourcePath = null;
    let mode = "MISSING";

    if (matched) {
      sourcePath = matched;
      mode = "RAW";
    } else if (legacyPath && existsSync(legacyPath)) {
      sourcePath = legacyPath;
      mode = "FALLBACK";
    } else if (existsSync(outputPath)) {
      mode = "KEEP-EXISTING";
    }

    if (mode === "MISSING") {
      rows.push({ slug, mode, source: "-", output: `${slug}.webp`, dims: "-", error: true });
      continue;
    }
    if (mode === "KEEP-EXISTING") {
      rows.push({ slug, mode, source: "(already processed)", output: `${slug}.webp`, dims: "-" });
      continue;
    }

    try {
      await processImage(sourcePath, outputPath);
      const meta = await sharp(outputPath).metadata();
      const bytes = statSync(outputPath).size;
      rows.push({
        slug,
        mode,
        source: matched ? `tmp/xr-images-raw/${basename(matched)}` : `legacy/${legacyName}`,
        output: `products/${slug}.webp`,
        dims: `${meta.width}x${meta.height}`,
        bytes
      });
    } catch (error) {
      rows.push({ slug, mode, source: sourcePath, output: "-", error: true, message: error.message });
    }
  }

  const pad = (value, width) => String(value).padEnd(width);
  console.log("\nCatalogue image processing report");
  console.log("=".repeat(110));
  for (const row of rows) {
    const label = row.error ? "ERROR" : row.mode;
    console.log(
      [
        pad(label, 14),
        pad(row.slug, 52),
        pad(row.source, 58),
        pad(row.dims, 12),
        row.bytes ? `${(row.bytes / 1024).toFixed(0)} KB` : ""
      ]
        .filter(Boolean)
        .join(" ")
    );
    if (row.message) console.log(`    -> ${row.message}`);
  }
  console.log("=".repeat(110));

  const rawCount = rows.filter((row) => row.mode === "RAW").length;
  const fallbackCount = rows.filter((row) => row.mode === "FALLBACK").length;
  const errorCount = rows.filter((row) => row.error).length;
  console.log(
    `Total: ${rows.length} | generated from raw: ${rawCount} | fallback to legacy crop: ${fallbackCount} | errors: ${errorCount}\n`
  );

  const fallbackSlugs = rows.filter((row) => row.mode === "FALLBACK").map((row) => row.slug);
  if (fallbackSlugs.length > 0) {
    console.log("Products still using the legacy PDF crop (generate these and re-run):");
    for (const slug of fallbackSlugs) console.log(`  - ${slug}`);
    console.log("");
  }
  if (errorCount > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
