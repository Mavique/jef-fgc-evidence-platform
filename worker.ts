import handler from "vinext/server/fetch-handler";

export default {
  async fetch(
    request: Request,
    env: Cloudflare.Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const hyperdriveConnectionString =
      env.HYPERDRIVE?.connectionString;

    if (hyperdriveConnectionString) {
      process.env.DATABASE_URL = hyperdriveConnectionString;
    }

    return handler.fetch(request, env, ctx);
  }
} satisfies ExportedHandler<Cloudflare.Env>;