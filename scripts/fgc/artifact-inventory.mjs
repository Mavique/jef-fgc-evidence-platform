import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export function normalizeArtifactPath(value) {
  const path = String(value).replaceAll("\\", "/");
  if (!path || path.startsWith("/") || /^[A-Za-z]:\//.test(path) || path.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new Error("Artifact paths must be relative, normalized and contained by the artifact root.");
  }
  return path;
}

export function compareCanonicalPaths(left, right) {
  const a = normalizeArtifactPath(left);
  const b = normalizeArtifactPath(right);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function inventory(root, label) {
  const rootPath = resolve(root);
  if (!existsSync(rootPath)) throw new Error(`Required ${label} artifact directory is missing.`);
  const records = [];
  const seen = new Set();
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error("Generated staging artifacts must not contain symbolic links.");
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name !== ".dev.vars") {
        const path = normalizeArtifactPath(relative(rootPath, full));
        if (seen.has(path)) throw new Error("Artifact contains duplicate normalized paths.");
        seen.add(path);
        records.push({ path, sha256: createHash("sha256").update(readFileSync(full)).digest("hex") });
      }
    }
  }
  visit(rootPath);
  records.sort((left, right) => compareCanonicalPaths(left.path, right.path));
  return { label, count: records.length, sha256: createHash("sha256").update(JSON.stringify(records)).digest("hex"), records };
}
