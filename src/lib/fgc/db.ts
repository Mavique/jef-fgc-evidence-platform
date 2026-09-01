import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";

let pool: Pool | null = null;

export class FgcConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FgcConfigurationError";
  }
}

export function getFgcPool() {
  const { databaseUrl } = getFgcRuntimeConfig();
  if (!databaseUrl) {
    throw new FgcConfigurationError("DATABASE_URL is not configured. FGC production persistence is unavailable.");
  }
  const url = new URL(databaseUrl);
  const sslRequired = /supabase/i.test(url.hostname) || url.searchParams.get("sslmode") === "require" || process.env.PGSSLMODE === "require";

  pool ??= new Pool({
    connectionString: databaseUrl,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined
  });

  return pool;
}

export async function fgcQuery<T extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<QueryResult<T>> {
  return getFgcPool().query<T>(sql, values);
}

export async function withFgcTransaction<T>(callback: (query: typeof fgcQuery) => Promise<T>) {
  const client = await getFgcPool().connect();
  const query = <R extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []) => client.query<R>(sql, values);
  try {
    await client.query("BEGIN");
    const result = await callback(query);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
