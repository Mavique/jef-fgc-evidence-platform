import pg from "pg";
import { databaseUrl } from "./config.mjs";

const { Pool } = pg;

export function createPool() {
  const connectionString = databaseUrl();
  const url = new URL(connectionString);
  const sslRequired = /supabase/i.test(url.hostname) || url.searchParams.get("sslmode") === "require" || process.env.PGSSLMODE === "require";

  return new Pool({
    connectionString,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined
  });
}

export async function withClient(callback) {
  const pool = createPool();
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
    await pool.end();
  }
}

export async function inTransaction(client, callback) {
  await client.query("BEGIN");
  try {
    const result = await callback();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
