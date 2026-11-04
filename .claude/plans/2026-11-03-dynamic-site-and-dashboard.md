# Plan — dynamic site, admin dashboard, simpler projects

_Started 2026-11-03 · status at the bottom_

## Goal (the user's words, tidied)

Make the site dynamic so the owner edits and uploads everything from an admin dashboard. Two roles (super
admin, admin), nothing more complicated. Rebuild the projects flow: a list with filters and infinite "load
more", then a project page with its before and afters. Enquiries from the contact form must be visible in the
dashboard, with export. Supabase, hosted on Vercel, mobile first. Playwright tests, docs, plans and handoffs.

## Decisions

| Decision | Why | Rejected |
| --- | --- | --- |
| Supabase direct from Next (no API layer); **RLS is the boundary** | Already on Supabase; a brochure site with one dashboard does not need a separate API | A Laravel API like other projects (too much for this site) |
| Roles in `profiles.role` checked by `private.is_admin()` / `is_super_admin()` | One source of truth read by every policy; turning someone off is instant | JWT custom claims (stale until token refresh, needs a hook) |
| Role on creation from `app_metadata` via trigger; no role = inactive | Only the secret key can set app_metadata; stray sign-ups get nothing | `user_metadata` (user-editable) |
| Public pages static (ISR) + `revalidatePath` on every save | Fast and cheap on Vercel; changes still show at once | Realtime subscriptions per visitor (removed) |
| Theme via `<head>` script + `dark:` classes | Reading the cookie on the server made every page dynamic | Keep `cookies()` in the root layout |
| `/projects` renders per request from `?category=&q=`, then Load more in the browser | Shared links and search engines see real projects | A static shell with client-only grid (empty HTML) |
| Projects sorted newest first (`completed_on`, `created_at`); `featured` picks the home page | The owner never reorders a long list | Manual `order` with arrows on a paged list |
| First pair = cover (set on save) | One less thing to manage; no mismatched cover | Separate cover upload |
| Categories table with FK on `name` (update cascade, delete restrict) | Filters and the editor's dropdown share one list; rename is safe | Free-text category |
| Contact form → server action → `contact_messages`; optional Resend email | The form saved nothing before; email is opt-in with no new service required | Email only (no record, no export) |
| Photos resized in the browser to WebP ≤2400 px, bucket `media` | Phone photos are huge; keeps storage and bandwidth small | Server-side processing (no server here) |
| Small lists not paged, growing lists paged | Reordering across pages is confusing; enquiries and projects grow | Paginate everything |
| Users screen needs `SUPABASE_SECRET_KEY` | Creating auth users needs it; everything else works without | Invite emails (rate limited SMTP) |

## Steps

1. ✅ Read the site, the live schema (REST), the playbook, letshego's `proxy.ts`.
2. ✅ Migrations: baseline of the 4 hand-made tables + admin migration; dry-run on local Postgres twice, RLS
   checked per role (caught the `null in (...)` trigger bug).
3. ✅ Supabase clients (browser, server, public, admin), `proxy.ts`, `lib/auth.ts`.
4. ✅ Public site from the database: hero, about, services, projects, testimonials, contact, footer; ISR.
5. ✅ Projects list (chips, search, URL state, infinite Load more) and project page (slider, full screen,
   related, WhatsApp).
6. ✅ Dashboard: shell, overview, inbox (+export), projects (list, editor), slides, services, testimonials,
   categories, settings, users, account; login, reset.
7. ✅ Playwright (guest desktop + phone, admin); sign-in specs pass against the dev server.
8. ✅ Docs, AGENTS.md, README, handoff.
9. ✅ Migrations applied to the live project (user, `supabase db push`, 4 Nov).
10. ✅ Super admins created (Muhsin, Farouk) and a test admin; ⏳ Vercel env vars and Supabase auth settings
    (`docs/deployment.md`).
11. ✅ Client review rounds: home portfolio restored to the original layout, footer restored, project page sizes,
    navbar, dashboard polish (confirm dialogs, 5/page, URL state, password eyes, cursor, top loader, settings tabs),
    visitor statistics; Next.js 16.4.5. Playwright 29 passed, 3 skipped on a production build.
12. ✅ Committed and pushed on `feature/admin-dashboard`; ⏳ Vercel preview, merge to `main`.

## Later (not in this round)

- Email notifications through Resend need a verified sending domain.
- Rate limiting of the contact form beyond the honeypot (e.g. Cloudflare Turnstile) if spam appears.
- Project videos; SEO fields per project.
