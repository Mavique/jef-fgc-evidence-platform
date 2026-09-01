import { spawnSync } from "node:child_process";
import { projectRoot } from "./config.mjs";
import { withClient } from "./db.mjs";

function runScript(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Creating pre-rebuild FGC backup...");
runScript("scripts/fgc/backup.mjs");

await withClient(async (client) => {
  await client.query("DROP SCHEMA IF EXISTS fgc CASCADE");
  console.log("Dropped schema fgc only.");
});

runScript("scripts/fgc/migrate.mjs");
runScript("scripts/fgc/seed-reference.mjs");
runScript("scripts/fgc/verify.mjs");
