import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { migrationFiles, projectRoot, redactedDatabaseTarget } from "./config.mjs";
import { inTransaction, withClient } from "./db.mjs";

await withClient(async (client) => {
  console.log(JSON.stringify({ target: redactedDatabaseTarget(), migrationFiles }, null, 2));

  await client.query("CREATE SCHEMA IF NOT EXISTS fgc");
  await client.query(`
    CREATE TABLE IF NOT EXISTS fgc.schema_migrations (
      version text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of migrationFiles) {
    const sqlPath = join(projectRoot, "db", "fgc", file);
    const sql = readFileSync(sqlPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query("select checksum from fgc.schema_migrations where version = $1", [file]);

    if (existing.rows[0]) {
      if (existing.rows[0].checksum !== checksum) {
        throw new Error(`Migration ${file} was already applied with a different checksum.`);
      }
      console.log(`skip ${file}`);
      continue;
    }

    await inTransaction(client, async () => {
      await client.query(sql);
      await client.query("insert into fgc.schema_migrations (version, checksum) values ($1, $2)", [file, checksum]);
    });
    console.log(`applied ${file}`);
  }
});
