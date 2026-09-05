import { afterAll, describe, expect, it } from "vitest";
import { closeFgcIntegrationPool, fgcQuery, withFgcTransaction } from "@/lib/fgc/db";

describe("FGC application database adapter against disposable PostgreSQL", () => {
  it("reads the canonical migration chain and assignment safeguards", async () => {
    const tables = await fgcQuery<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'fgc'
        AND table_name IN ('production_submissions', 'production_submission_versions', 'review_assignments', 'assessor_reviews', 'moderation_records')
      ORDER BY table_name
    `);
    expect(tables.rows.map((row) => row.table_name)).toEqual([
      "assessor_reviews",
      "moderation_records",
      "production_submission_versions",
      "production_submissions",
      "review_assignments"
    ]);

    const ledger = await fgcQuery<{ version: string }>("SELECT version FROM fgc.schema_migrations ORDER BY applied_at, version");
    expect(ledger.rows.map((row) => row.version)).toEqual([
      "001_schema.sql",
      "003_tvet_reference_schema.sql",
      "005_curriculum_master_schema.sql",
      "007_production_hardening_schema.sql",
      "008_evidence_upload_lifecycle.sql",
      "009_review_assignment_workflows.sql"
    ]);

    const trigger = await fgcQuery<{ trigger_name: string; event_manipulation: string }>(`
      SELECT trigger_name, event_manipulation
      FROM information_schema.triggers
      WHERE event_object_schema = 'fgc'
        AND event_object_table = 'review_assignments'
        AND trigger_name = 'trg_fgc_review_assignment_version'
    `);
    expect(new Set(trigger.rows.map((row) => row.trigger_name))).toEqual(new Set(["trg_fgc_review_assignment_version"]));
    expect(trigger.rows.map((row) => row.event_manipulation).sort()).toEqual(["INSERT", "UPDATE"]);

    const searchPath = await fgcQuery<{ proconfig: string[] | null }>(`
      SELECT proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'fgc' AND p.proname = 'validate_review_assignment_version'
    `);
    expect(searchPath.rows[0]?.proconfig).toContain("search_path=fgc, pg_catalog");
  });

  it("executes a real transaction and rolls back a failed multi-step write", async () => {
    await fgcQuery("CREATE TABLE fgc.integration_transaction_probe (id integer PRIMARY KEY, marker text NOT NULL)");
    await expect(
      withFgcTransaction(async (query) => {
        await query("INSERT INTO fgc.integration_transaction_probe (id, marker) VALUES ($1, $2)", [1, "rolled-back"]);
        throw new Error("intentional integration rollback");
      }),
    ).rejects.toThrow("intentional integration rollback");

    const result = await fgcQuery<{ count: string }>("SELECT count(*)::text AS count FROM fgc.integration_transaction_probe");
    expect(result.rows[0]?.count).toBe("0");
    await fgcQuery("DROP TABLE fgc.integration_transaction_probe");
  });
});

afterAll(async () => {
  await closeFgcIntegrationPool();
});
