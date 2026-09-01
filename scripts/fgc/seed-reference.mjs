import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { projectRoot, redactedDatabaseTarget, referenceSeedFiles } from "./config.mjs";
import { inTransaction, withClient } from "./db.mjs";

await withClient(async (client) => {
  console.log(JSON.stringify({ target: redactedDatabaseTarget(), referenceSeedFiles }, null, 2));

  await client.query(`
    CREATE TABLE IF NOT EXISTS fgc.reference_seed_runs (
      seed_name text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of referenceSeedFiles) {
    const sqlPath = join(projectRoot, "db", "fgc", file);
    const sql = readFileSync(sqlPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("select checksum from fgc.reference_seed_runs where seed_name = $1", [file]);

    if (existing.rows[0]?.checksum === checksum) {
      console.log(`skip ${file}`);
      continue;
    }

    await inTransaction(client, async () => {
      await client.query(sql);
      await client.query(
        `
          insert into fgc.reference_seed_runs (seed_name, checksum, applied_at)
          values ($1, $2, now())
          on conflict (seed_name) do update set checksum = excluded.checksum, applied_at = now()
        `,
        [file, checksum]
      );
    });
    console.log(`seeded ${file}`);
  }
});
