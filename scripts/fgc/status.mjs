import { redactedDatabaseTarget } from "./config.mjs";
import { withClient } from "./db.mjs";

const valuableTables = [
  "production_users",
  "production_submissions",
  "production_submission_versions",
  "production_response_values",
  "evidence_files",
  "evidence_reviews",
  "lecturer_assessments",
  "learner_use_records",
  "generated_reports",
  "notifications"
];

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

await withClient(async (client) => {
  const target = redactedDatabaseTarget();
  const connection = await client.query("select current_database() as database, current_user as user_name, version() as version");
  const schemas = await client.query("select schema_name from information_schema.schemata where schema_name = 'fgc'");
  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'fgc' and table_type = 'BASE TABLE'
    order by table_name
  `);

  const counts = [];
  for (const row of tables.rows) {
    const tableName = row.table_name;
    const result = await client.query(`select count(*)::int as count from fgc.${quoteIdentifier(tableName)}`);
    counts.push({ table: tableName, count: result.rows[0].count });
  }

  const valuableRecordCounts = counts.filter((row) => valuableTables.includes(row.table) && row.count > 0);
  const migrationRows = tables.rows.some((row) => row.table_name === "schema_migrations")
    ? (await client.query("select version, applied_at from fgc.schema_migrations order by version")).rows
    : [];

  console.log(JSON.stringify({
    target,
    connected: true,
    currentDatabase: connection.rows[0].database,
    currentUser: connection.rows[0].user_name,
    fgcSchemaExists: schemas.rowCount === 1,
    fgcTableCount: tables.rowCount,
    tableCounts: counts,
    valuableRecordCounts,
    appliedMigrations: migrationRows
  }, null, 2));
});
