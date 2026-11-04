# Working on this repo

Yuri Perfections' website and staff dashboard. Next.js 16 + Supabase on Vercel. Read `docs/` (start with
`docs/architecture.md`) before changing an area, and the general playbook
`D:\coding\bloodykheeng projects\coding-notes\ai-agents\build-laravel-nextjs-app-with-an-ai-agent.md`
(its Laravel parts do not apply: here Supabase RLS is the API's security boundary).

## Rules that matter here

- **RLS is the security boundary.** Every table has policies (`supabase/migrations/`); the dashboard UI only
  mirrors them. A new table gets RLS, policies and grants in its migration.
- **Migrations are forward only and go live before the code** (`docs/database.md`). Create one with
  `supabase migration new <name>`; make it idempotent (`if not exists`, drop-then-create policies). Dry-run it on
  a local Postgres when you cannot reach Supabase (how: the 2026-11-04 handoff).
- **Public pages stay static.** Read with `utils/supabase/public.ts` (no cookies); never call `cookies()` or
  `headers()` in `app/(site)`. A dashboard save that changes what visitors see goes through `useSave`
  (which calls `revalidateSite()`).
- **Dark mode with `dark:` classes**, never `theme === "dark" ? … : …` in render (server HTML must not depend on
  the theme).
- **Public reads in `services/content.ts`, dashboard reads/writes in `services/admin.ts`.** Types in
  `lib/types.ts`, query keys in `lib/query-keys.ts`.
- **Lists:** 5 rows per page by default (`PAGE_SIZES`), state in the URL (`useUrlState`), skeletons while loading,
  no `placeholderData`. Growing lists (enquiries, projects) page on the server; short hand-ordered lists (slides,
  services, categories) load whole and page in the browser (`usePagedList`).
- **Anything final asks first** (`useConfirm` / `ConfirmButton`): deletes, show/hide, saves to live content, role
  and access changes.
- **Sign-in and sign-out reload the page** (`window.location.replace`, `lib/sign-out.ts`).
- **Photos** upload through `lib/images.ts` to the `media` bucket; remove replaced files with `removeImages`.
- **The secret key** (`utils/supabase/admin.ts`) is used only after `requireStaff("super_admin")`.
- Copy for people: plain words, no internal names.
- No broad lint/TS disables; fix the cause.

## Checks before committing

`npm run typecheck`, `npx eslint <changed files>`, `npm run e2e:guest` (and `npm run e2e` with an admin
account for dashboard changes), `npm run build`. Update `docs/` and, for anything the owner sees,
`docs/admin-guide.md`. Commit only when asked.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
