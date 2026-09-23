import {
  Client,
  Pool,
  type ClientConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { getFgcRuntimeConfig } from "@/lib/fgc/env";

let integrationPool: Pool | null = null;

const CONNECTION_TIMEOUT_MS = 5_000;
const QUERY_TIMEOUT_MS = 15_000;
const STATEMENT_TIMEOUT_MS = 12_000;
const IDLE_TRANSACTION_TIMEOUT_MS = 15_000;

function isIntegrationTestRuntime() {
  return (
    process.env.NODE_ENV === "test" &&
    process.env.FGC_INTEGRATION_TEST === "1"
  );
}

function connectionStringForRuntime() {
  const integrationUrl = process.env.FGC_TEST_DATABASE_URL;

  if (integrationUrl) {
    if (!isIntegrationTestRuntime()) {
      throw new FgcConfigurationError(
        "FGC_TEST_DATABASE_URL is restricted to disposable integration tests.",
      );
    }

    const url = new URL(integrationUrl);

    if (
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
      !url.port
    ) {
      throw new FgcConfigurationError(
        "FGC_TEST_DATABASE_URL must target a local database with an explicit port.",
      );
    }

    return integrationUrl;
  }

  return getFgcRuntimeConfig().databaseUrl;
}

function getFgcClientConfig(): ClientConfig {
  const databaseUrl = connectionStringForRuntime();

  if (!databaseUrl) {
    throw new FgcConfigurationError(
      "DATABASE_URL is not configured. FGC production persistence is unavailable.",
    );
  }

  const url = new URL(databaseUrl);
  const sslRequired =
    /supabase/i.test(url.hostname) ||
    url.searchParams.get("sslmode") === "require" ||
    process.env.PGSSLMODE === "require";

  return {
    connectionString: databaseUrl,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    query_timeout: QUERY_TIMEOUT_MS,
    statement_timeout: STATEMENT_TIMEOUT_MS,
    idle_in_transaction_session_timeout: IDLE_TRANSACTION_TIMEOUT_MS,
    application_name: "jef-fgc-platform",
  };
}

export class FgcConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FgcConfigurationError";
  }
}

/**
 * The pool is retained only for disposable local integration tests.
 *
 * Cloudflare request handling uses a fresh PostgreSQL client for each
 * operation. Hyperdrive performs the underlying connection pooling and a
 * module-level pg Pool must not retain sockets between Worker requests.
 */
export function getFgcPool() {
  if (!isIntegrationTestRuntime()) {
    throw new FgcConfigurationError(
      "The FGC connection pool is restricted to disposable integration tests.",
    );
  }

  integrationPool ??= new Pool({
    ...getFgcClientConfig(),
    max: 5,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });

  return integrationPool;
}

async function withFgcClient<T>(
  callback: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client(getFgcClientConfig());
  let connected = false;

  try {
    await client.connect();
    connected = true;
    return await callback(client);
  } finally {
    if (connected) {
      await client.end().catch(() => undefined);
    }
  }
}

export async function closeFgcIntegrationPool() {
  if (!isIntegrationTestRuntime()) {
    throw new FgcConfigurationError(
      "The FGC integration pool can only be closed by disposable integration tests.",
    );
  }

  if (integrationPool) {
    await integrationPool.end();
    integrationPool = null;
  }
}

export async function fgcQuery<
  T extends QueryResultRow = QueryResultRow,
>(
  sql: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  if (isIntegrationTestRuntime()) {
    return getFgcPool().query<T>(sql, values);
  }

  return withFgcClient(client => client.query<T>(sql, values));
}

export async function withFgcTransaction<T>(
  callback: (query: typeof fgcQuery) => Promise<T>,
) {
  if (isIntegrationTestRuntime()) {
    const client = await getFgcPool().connect();

    const query = <R extends QueryResultRow = QueryResultRow>(
      sql: string,
      values: unknown[] = [],
    ) => client.query<R>(sql, values);

    try {
      await client.query("BEGIN");
      const result = await callback(query);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  return withFgcClient(async client => {
    const query = <R extends QueryResultRow = QueryResultRow>(
      sql: string,
      values: unknown[] = [],
    ) => client.query<R>(sql, values);

    try {
      await client.query("BEGIN");
      const result = await callback(query);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
  });
}