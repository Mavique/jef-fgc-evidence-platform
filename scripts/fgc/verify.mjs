import { redactedDatabaseTarget } from "./config.mjs";
import { withClient } from "./db.mjs";

const requiredTables = [
  "roles",
  "role_permissions",
  "production_users",
  "production_auth_tokens",
  "production_sessions",
  "production_role_assignments",
  "tvet_colleges",
  "campus_sites",
  "campus_addition_requests",
  "form_templates",
  "form_assignments",
  "production_submissions",
  "production_submission_versions",
  "production_response_values",
  "evidence_files",
  "evidence_reviews",
  "generated_reports",
  "notifications",
  "production_audit_events",
  "schema_migrations",
  "reference_seed_runs"
];

const requiredViews = [
  "v_dashboard_summary",
  "v_evidence_status_summary",
  "v_reference_data_quality",
  "v_curriculum_catalogue_quality",
  "v_production_readiness"
];

const requiredRoles = [
  "LECTURER",
  "COLLEGE_EVIDENCE_OWNER",
  "COLLEGE_LEAD_ADMIN",
  "ASSESSOR",
  "MODERATOR",
  "JEF_ADMINISTRATOR",
  "MERSETA_VIEWER",
  "MERSETA_ADMINISTRATOR",
  "PLATFORM_SUPER_ADMINISTRATOR"
];

await withClient(async (client) => {
  const failures = [];

  const tables = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'fgc' and table_type = 'BASE TABLE'
  `);
  const tableNames = new Set(tables.rows.map((row) => row.table_name));
  for (const table of requiredTables) {
    if (!tableNames.has(table)) failures.push(`Missing table fgc.${table}`);
  }

  const views = await client.query(`
    select table_name from information_schema.views
    where table_schema = 'fgc'
  `);
  const viewNames = new Set(views.rows.map((row) => row.table_name));
  for (const view of requiredViews) {
    if (!viewNames.has(view)) failures.push(`Missing view fgc.${view}`);
  }

  const roles = await client.query("select code from fgc.roles order by code");
  const roleCodes = new Set(roles.rows.map((row) => row.code));
  for (const role of requiredRoles) {
    if (!roleCodes.has(role)) failures.push(`Missing role ${role}`);
  }

  const colleges = await client.query("select count(*)::int as count from fgc.tvet_colleges where active = true and institution_type = 'PUBLIC_TVET_COLLEGE'");
  if (colleges.rows[0].count !== 50) failures.push(`Expected 50 active public TVET colleges, found ${colleges.rows[0].count}`);

  const demoRecords = await client.query(`
    select
      (select count(*)::int from fgc.production_users where email::text like '%example.invalid') as production_demo_users,
      (select count(*)::int from fgc.tvet_colleges where official_name like 'Demonstration%') as demo_colleges,
      (select count(*)::int from fgc.evidence_items where evidence_code like '%DEMO%') as demo_evidence
  `);
  const demo = demoRecords.rows[0];
  if (demo.production_demo_users > 0 || demo.demo_colleges > 0 || demo.demo_evidence > 0) {
    failures.push(`Demo records detected: ${JSON.stringify(demo)}`);
  }

  const fkProblems = await client.query(`
    select conname
    from pg_constraint c
    join pg_namespace n on n.oid = c.connamespace
    where n.nspname = 'fgc' and c.contype = 'f' and not c.convalidated
  `);
  if (fkProblems.rowCount > 0) failures.push(`Unvalidated foreign keys: ${fkProblems.rows.map((row) => row.conname).join(", ")}`);

  const result = {
    target: redactedDatabaseTarget(),
    ok: failures.length === 0,
    failures,
    activePublicTvetColleges: colleges.rows[0].count,
    roles: roles.rows.map((row) => row.code),
    tableCount: tables.rowCount,
    viewCount: views.rowCount
  };

  console.log(JSON.stringify(result, null, 2));
  if (failures.length > 0) process.exitCode = 1;
});
