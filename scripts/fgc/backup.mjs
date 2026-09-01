import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, redactedDatabaseTarget } from "./config.mjs";
import { withClient } from "./db.mjs";

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(projectRoot, "db", "fgc", "backups");
mkdirSync(backupDir, { recursive: true });

await withClient(async (client) => {
  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'fgc' and table_type = 'BASE TABLE'
    order by table_name
  `);
  const views = await client.query(`
    select table_name, view_definition
    from information_schema.views
    where table_schema = 'fgc'
    order by table_name
  `);
  const columns = await client.query(`
    select table_name, column_name, data_type, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'fgc'
    order by table_name, ordinal_position
  `);
  const constraints = await client.query(`
    select conname, contype, pg_get_constraintdef(c.oid) as definition
    from pg_constraint c
    join pg_namespace n on n.oid = c.connamespace
    where n.nspname = 'fgc'
    order by conname
  `);
  const indexes = await client.query(`
    select indexname, indexdef
    from pg_indexes
    where schemaname = 'fgc'
    order by indexname
  `);

  const rowCounts = [];
  const tableRows = {};
  for (const row of tables.rows) {
    const tableName = row.table_name;
    const count = await client.query(`select count(*)::int as count from fgc.${quoteIdentifier(tableName)}`);
    rowCounts.push({ table: tableName, count: count.rows[0].count });
    if (count.rows[0].count > 0 && count.rows[0].count <= 5000) {
      const rows = await client.query(`select * from fgc.${quoteIdentifier(tableName)}`);
      tableRows[tableName] = rows.rows;
    }
  }

  const backup = {
    createdAt: new Date().toISOString(),
    target: redactedDatabaseTarget(),
    note: "FGC schema-only metadata plus table rows for small existing FGC tables. Secrets are not included.",
    tables: tables.rows,
    views: views.rows,
    columns: columns.rows,
    constraints: constraints.rows,
    indexes: indexes.rows,
    rowCounts,
    tableRows
  };

  const path = join(backupDir, `fgc-backup-${timestamp}.json`);
  writeFileSync(path, JSON.stringify(backup, null, 2));
  console.log(JSON.stringify({ backupPath: path, tableCount: tables.rowCount, rowCounts }, null, 2));
});
