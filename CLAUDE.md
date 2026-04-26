# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

No test suite configured.

## Stack

- **Next.js 16** (App Router) + **React 19** — read `node_modules/next/dist/docs/` before writing code
- **Clerk 7** — auth + GitHub OAuth; middleware in `src/proxy.ts` protects `/dashboard/**`
- **Tailwind CSS 4** — via `@tailwindcss/postcss` (not the v3 PostCSS plugin)
- **TypeScript 5** — strict mode; path aliases `@/*`, `@/components/*`, `@/lib/*`

## Architecture

**Clanker** — autonomous feedback-to-implementation loop. Users connect GitHub repos + client emails; feedback items flow through a pipeline (Not Started → Ongoing → Finished).

```
src/app/
  page.tsx                  # landing (sign-in/sign-up modal)
  dashboard/page.tsx        # projects grid (protected)
  projects/[id]/page.tsx    # feedback queue for one project
  api/github/repos/         # GET repos via Clerk OAuth token → GitHub API
  api/webhooks/tasks/       # POST task events from backend/MCP

src/components/
  ProjectDetailView.tsx     # feedback queue + detail panel + pipeline status
  Navbar.tsx                # auth buttons (Clerk UserButton)

src/lib/data.ts             # TypeScript types + mock data (no DB yet)
```

**Data flow**: Clerk auth → dashboard reads mock projects → project page shows feedback queue → `ProjectDetailView` renders pipeline stages and logs.

**GitHub integration**: `GET /api/github/repos` fetches repos using Clerk OAuth bearer token against `api.github.com/user/repos`.

## Planned (not yet wired up)

- MongoDB connection (env vars needed: `MONGODB_URI`)
- Backend REST/webhook API to receive Devin task completions and MCP server email registrations
- Replace mock data in `src/lib/data.ts` with real DB reads

## Env vars required

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
TASK_WEBHOOK_SECRET         # optional HMAC SHA-256 verification for /api/webhooks/tasks
```

GitHub OAuth is managed through Clerk (no separate GitHub env vars needed for repo fetching).

## Task webhook

`POST /api/webhooks/tasks`

- Accepts task payloads from backend/MCP and upserts into Mongo `tasks`.
- Uses `email_id`, `thread_id`, or `context.gmail_message_id` as a dedupe key.
- Requires `project_id` so tasks can be associated with a project.
- If `TASK_WEBHOOK_SECRET` is set, provide `x-clanker-signature` as HMAC SHA-256 over the raw request body (`sha256=<hex>` or `<hex>`).
