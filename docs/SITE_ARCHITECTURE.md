# Site Architecture

The website uses Next.js App Router under `src/app` so it can coexist with the existing Python `app/` package.

Primary routes:

- `/`
- `/about`
- `/about/leadership`
- `/about/governance`
- `/programmes`
- `/programmes/[slug]`
- `/impact`
- `/projects`
- `/projects/[slug]`
- `/partnerships`
- `/insights`
- `/insights/[slug]`
- `/opportunities`
- `/documents`
- `/contact`
- `/privacy`
- `/accessibility`

Shared UI lives in `src/components`. Structured local content lives in `src/content` and is validated with Zod where appropriate. This keeps the site ready for a future CMS without making the first build CMS-dependent.
