# Deployment Guide

The project supports the standard Next.js build and a Cloudflare Workers build through Vinext. Production deployment remains gated on the external bindings and runtime checks documented in `docs/fgc-cloudflare-workers-readiness.md`.

1. Install dependencies with `npm ci`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db` and `npm run test:db:integration`.
3. Run `npm run build`, `npm run cf:check`, `npm run build:vinext` and `npx tsc -p tsconfig.worker.json --noEmit`.
4. Configure the required Cloudflare bindings and secrets only in the target environment.
5. Apply migrations only through the protected migration process. Never run demo seeds or migrations from a pull request or Worker request handler.
6. Publish only after staging authentication, evidence privacy, database transactions and external integrations have passed.

Do not use Codex Site Skills for deployment, preview generation or hosting decisions in this project.
