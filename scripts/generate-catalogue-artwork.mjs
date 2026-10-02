#!/usr/bin/env node
/**
 * Generates clean, text-free product artwork for the XR catalogue.
 *
 * The catalogue PDF only ships raster panels with titles, bullets and price chips
 * baked into the pixels, so no crop can isolate a product cleanly. This script
 * renders a deliberate studio-style illustration per product instead: a soft
 * plinth backdrop with the product's glyph, on the same white stage the cards use.
 * Specs and pricing are rendered as real UI by the product card.
 *
 * Output: public/images/xr-catalogue/products/<slug>.webp (1200x938, 1.28:1)
 *
 * Supplying AI-generated studio photographs in tmp/xr-images-raw/ and running
 * `npm run images:catalogue` replaces any of these with real imagery.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public/images/xr-catalogue/products");
const LUCIDE_DIR = join(ROOT, "node_modules/lucide-react/dist/esm/icons");

const W = 1200;
const H = 938;
const GLYPH_BOX = 330; // rendered glyph size in px
const INK = "#123f31";
const ACCENT = "#b7ee7e";

/** slug -> glyph name from lucide-react */
const GLYPHS = {
  "meta-quest-3-vr-headset-128gb": "glasses",
  "meta-quest-3-vr-mr-headset-512gb-advanced": "glasses",
  "oculus-link-usb-c-cable-5m": "cable",
  "vr-headset-hygiene-silicone-covers": "sparkles",
  "vr-floor-safety-markers": "shield",
  "apple-imac-24-m4-student-workstation": "monitor",
  "apple-imac-24-m4-instructor-workstation": "monitor-smartphone",
  "high-performance-desktop-pc-all-in-one-alternative": "pc-case",
  "laptop-for-education-and-training": "laptop",
  "student-workstation-desk": "lamp-desk",
  "round-collaboration-table-5-person": "table-2",
  "apple-ipad-pro-11-lidar-ar-content-creation-tablet": "tablet",
  "ipad-air-11-inch-256gb-ar-learning-tablet": "tablet",
  "android-tablet-samsung-tab-a11": "smartphone",
  "skye-hd-platinum-series-interactive-panel-86": "presentation",
  "full-hd-3d-dlp-projector-acer-x1528ki": "projector",
  "100-inch-motorised-projection-screen": "panel-top",
  "multi-port-usb-c-charging-station-16-port": "usb",
  "ups-10-kva-workstation-protection": "battery-charging",
  "ups-3-kva-rack-mount-network": "server",
  "secure-xr-charging-storage-cabinet-linkbasic-42u": "lock",
  "arborxr-device-management-system": "layout-dashboard"
};

/** Read a lucide icon's node array straight from the installed package. */
function loadIcon(name) {
  const source = readFileSync(join(LUCIDE_DIR, `${name}.js`), "utf8");
  const start = source.indexOf("[", source.indexOf("createLucideIcon("));
  const end = source.lastIndexOf("]);");
  if (start < 0 || end < 0) throw new Error(`Cannot parse icon: ${name}`);
  // `end` points at the array's own closing bracket inside `]);`
  const nodes = new Function(`return ${source.slice(start, end + 1)}`)();
  return nodes;
}

const ATTR = {
  key: null,
  fill: "none",
  stroke: INK,
  "stroke-width": "1.35",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};

function nodeToSvg([tag, attrs]) {
  const merged = { ...ATTR, ...attrs };
  delete merged.key;
  const parts = Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<${tag} ${parts}/>`;
}

function stageSvg(nodes) {
  const scale = GLYPH_BOX / 24;
  const glyph = nodes.map(nodeToSvg).join("");
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plinth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7fbf8"/>
        <stop offset="1" stop-color="#e9f2ec"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="42%" r="60%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="252" y="150" width="696" height="638" rx="150" fill="url(#plinth)"/>
    <rect x="252.5" y="150.5" width="695" height="637" rx="149.5" fill="none" stroke="#e0eae3"/>
    <rect x="252" y="150" width="696" height="638" rx="150" fill="url(#glow)"/>
    <ellipse cx="600" cy="742" rx="250" ry="30" fill="#dce8df" opacity="0.55"/>
    <g transform="translate(${W / 2} ${H / 2 - 24}) scale(${scale}) translate(-12 -12)">${glyph}</g>
    <circle cx="878" cy="214" r="16" fill="${ACCENT}"/>
    <circle cx="878" cy="214" r="26" fill="none" stroke="${ACCENT}" stroke-opacity="0.45" stroke-width="3"/>
  </svg>`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const onlyArg = process.argv.indexOf("--only");
  const only = onlyArg >= 0 ? new Set(process.argv[onlyArg + 1].split(",")) : null;

  let count = 0;
  for (const [slug, glyphName] of Object.entries(GLYPHS)) {
    if (only && !only.has(slug)) continue;
    const nodes = loadIcon(glyphName);
    const svg = stageSvg(nodes);
    const webp = await sharp(Buffer.from(svg))
      .resize(W, H)
      .webp({ quality: 88 })
      .toBuffer();
    writeFileSync(join(OUT_DIR, `${slug}.webp`), webp);
    count += 1;
  }
  console.log(`Generated ${count} catalogue artwork files in public/images/xr-catalogue/products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
