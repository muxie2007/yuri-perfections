# Handoff — dynamic site, admin dashboard, enquiries inbox, visitor stats, Next 16.4 (on a branch, ready for a preview)
_Date: 2026-11-04 04:10 · Author: Claude_

## Goal
Turn the Yuri Perfections website (yuriperfections.com) from hard-coded pages into a site the owner edits from a
staff dashboard with two roles (super admin, admin); rebuild the projects flow (filterable list with Load more →
project page with every before/after); make contact-form enquiries visible in the dashboard with export; add
visitor statistics; Playwright tests, docs, plan and handoff; upgrade Next.js to the latest stable.
Plan: [.claude/plans/2026-11-03-dynamic-site-and-dashboard.md](../plans/2026-11-03-dynamic-site-and-dashboard.md).

## Status
**Done and verified; committed on `feature/admin-dashboard` and pushed. Not merged, not live.** The live Supabase
database already has every migration applied. Next: a Vercel preview of the branch, three settings (below), merge.

## The most important fact for the business
Before this work the contact form **saved nothing** (it only showed "Message sent!"). Every enquiry sent through
the old site is lost. Enquiries now save to `contact_messages` and appear in Dashboard → Inbox.

## Where things stand

| Area | State |
| --- | --- |
| Code | Branch `feature/admin-dashboard` on `origin` (github.com/muxie2007/yuri-perfections), commits listed below |
| Live site | Still the old code on `main` (Vercel). Reads the same Supabase tables and keeps working |
| Database | Live project `qqydaukcelbwezeltpit` (East US Ohio, client's org "Panzookie"). Migrations 20261103190000, 20261103191000, 20261104001517 applied by the user with `supabase db push`, recorded in history |
| Staff accounts | Muhsin Nsubuga (`nsubuga.muhsin@gmail.com`) and Farouk Kimera (`kimerafarouk8@gmail.com`): super admin. `admin@yuriperfections.com`: admin, the Playwright test login (credentials only in git-ignored `.env.local`) |
| Next.js | 16.4.5, React 19.3.1 |
| Checks | tsc and eslint clean; `next build` passes; Playwright admin + guest + mobile **29 passed, 3 skipped** against a production build |

## What changed (by area; detail in `docs/`)

**Database** (`supabase/migrations/`, [docs/database.md](../../docs/database.md))
- Baseline of the 4 hand-made tables (no-op on live). Admin migration: `profiles` (role `super_admin`/`admin`,
  `is_active`), `private.is_admin()` / `is_super_admin()`, trigger giving new auth users a profile from
  `app_metadata.role` (none = inactive), `project_categories` (FK from `projects.category`, update cascade,
  delete restrict), `projects.featured/completed_on/updated_at`, `testimonials`, `contact_messages`,
  `site_settings` (seeded with the old hard-coded text), RLS on every table (old hand-made policies replaced),
  `media` storage bucket (public read, staff write).
- Visitor analytics: `page_views` (insert-only for visitors, staff read), `public.visitor_stats(days)`.
- Dry-run harness for a local Postgres: [supabase/dry-run/](../../supabase/dry-run/) (it caught a real
  `null in (...)` trigger bug before it reached production).

**Public site** (`app/(site)/`, `components/`)
- Reads Supabase with a cookie-less client (`utils/supabase/public.ts`, retries 5xx/timeouts) so pages are static
  (ISR, 1 h) and every dashboard save purges them (`revalidateSite()`). Theme set by a `<head>` script
  (`lib/theme.ts`) + `dark:` classes. Realtime subscriptions removed.
- Home: hero, about, services from the DB; portfolio restored to **the layout the client chose** (category buttons,
  featured box with sliding before/after, sliding thumbnails that show in the box); contact form saves via
  `app/actions/contact.ts` (honeypot + time guard, optional Resend email). Testimonials hidden (as before).
- `/projects`: calm "Our Projects" header, category chips, search, URL state, infinite Load more. `/projects/[slug]`:
  cover pair first, all pairs equal size two per row, full-screen viewer, related projects, WhatsApp CTA.
- `BeforeAfter` rewritten (clip-path so photos align, drag anywhere, keyboard, next/image). Footer restored to the
  original design (socials from settings). Navbar solid off the home page. 404 and friendly error pages.
- SEO: canonical address is `https://www.yuriperfections.com` (`SITE_URL`; Vercel redirects the bare domain).

**Dashboard** (`app/dashboard/`, `components/admin/`, `services/admin.ts`, [docs/admin-guide.md](../../docs/admin-guide.md))
- Overview, **Inbox** (tabs with counts, search, dates, 5/page, detail with reply/call/WhatsApp, notes, archive,
  delete, Excel/CSV export of all filtered rows), **Visitors** (visits, sources, countries with flags, pages,
  devices), Projects (list + editor: pairs upload/reorder, first pair is the cover, Live/Featured), Categories, Hero
  slides, Services, Site settings (sticky section tabs), Users (super admin; needs `SUPABASE_SECRET_KEY`), My account.
- Every list: 5 rows per page, search/page in the URL. Every final action: confirm dialog. Every form: validation
  and a Show on website switch. Password eyes, pointer cursors, top loading bar (`nextjs-toploader`).
- Sign-in with forgot-password (`/auth/callback`), `proxy.ts` guards `/dashboard`, sign-in/out do a full load with
  `location.replace` (playbook §6).

**Tests and docs**: `playwright.config.ts`, `e2e/` (guest desktop + Pixel 7, admin incl. the full enquiry journey and
project create/publish/delete, teardown). `docs/` (architecture, database, deployment, analytics, e2e-testing,
admin-guide), `AGENTS.md`, `CLAUDE.md`, `README.md`, `.env.example`.

## Commits on `feature/admin-dashboard` (base `main` @ 5572dd6)
1. `f5d204f` build(deps): upgrade to Next.js 16.4.5 and React 19.3.1, add form, toast, export and test tooling
2. `606e8d9` feat(db): staff roles, editable content, enquiries and visitor analytics schema
3. `7401a25` feat(site): read content from Supabase with cached pages and a working contact form
4. `7193618` feat(site): rebuild the projects portfolio and project pages
5. `28d9aa0` feat(dashboard): staff dashboard with inbox, content editors, users and visitors
6. `45d8a06` test(e2e): Playwright specs for the public site and the dashboard
7. docs: architecture, database, deployment, analytics and owner guides; handoff (this note)

## Uncommitted / in-flight
None: everything is committed and pushed on the branch. Not merged to `main`.

## Next steps
1. In Vercel, open the preview deployment of `feature/admin-dashboard` (Vercel builds every pushed branch).
2. Vercel → Settings → Environment Variables: add `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API Keys →
   Secret keys) for Production and Preview. Optional: `RESEND_API_KEY`, `ENQUIRY_NOTIFY_EMAIL`, `ENQUIRY_FROM_EMAIL`.
3. Supabase → Authentication: Site URL `https://www.yuriperfections.com`; Redirect URLs
   `https://www.yuriperfections.com/**`, `https://yuriperfections.com/**`, `http://localhost:3000/**` (+ the preview
   pattern if testing resets there); turn **off** "Allow new users to sign up".
4. On the preview: sign in, change the shared starting password (everyone), send a test enquiry, check phone layout;
   optionally `E2E_BASE_URL=<preview url> npm run e2e:guest`.
5. Open a PR `feature/admin-dashboard` → `main`, review, merge: Vercel deploys production. Then check
   Dashboard → Visitors fills within a minute of visits.

## Decisions settled
- **Supabase directly from Next, RLS as the security boundary** (no API layer): a brochure site with one dashboard.
- **Roles in `profiles`, read by `private.is_admin()`**; role on creation only from `app_metadata` (user metadata is
  user-editable). Switching access off works on the next request.
- **Public pages static + revalidate on save**; Realtime removed (a socket per visitor, no benefit with caching).
- **Home portfolio keeps the client's original layout** (user: the client liked the slider and the featured box);
  rejected: a card grid. `/projects` is a calm list page; rejected: a big photo banner.
- **Projects newest first** (`completed_on`, `created_at`), `featured` for the home page; **first pair = cover**.
- **5 rows per page everywhere**, URL state; short lists page in the browser (they reorder across pages).
- **Confirm dialogs before anything final**, including saves to live content (user asked explicitly).
- **Testimonials off** on site and in the menu (they were commented out on the old site); code and table kept.
- **Canonical `www`**, both domains work (user: "allow both").
- **Analytics in-house** (`page_views`), anonymous, so figures show inside the dashboard; rejected: only Vercel
  Analytics (figures would live outside the dashboard).
- **Sign-in/out with `location.replace`** (Next 16.4 lint rule; still a full load, and Back cannot reopen the dashboard).
- **No AI attribution trailers in commits** (coding-notes playbook §1).

## Still open
| Question | Blocks | Recommendation |
| --- | --- | --- |
| Shared weak starting password on all three accounts | Safety of enquiries data | Each person changes it at first sign-in (My account); keep the test login only in `.env.local` |
| Contact email shows `hello@yuriperfections.ug` while the domain is `.com` | Replies may bounce | Client confirms the right address, edit in Site settings |
| Social media links are empty | Footer icons not clickable yet | Owner fills them in Site settings |
| Enquiry email alerts (Resend) | Nothing | Worth setting up with a verified yuriperfections.com sender |
| Photos uploaded in a form that is then cancelled stay in storage | Nothing (one 69 KB file now) | Optional: delete on Cancel |
| Real project photos: most `project_images` rows are still the old Unsplash seed photos | Portfolio credibility | Owner replaces them in Dashboard → Projects |

## Gotchas & context
- **This PC's network**: via Cloudflare Mombasa (MBA) the Supabase REST API returned 522 for hours (Cloudflare
  status: MBA/NBO degraded); a hotspot routed via Kampala (EBB) works. Local dev pages fail when that happens; the
  live site (Vercel) is unaffected. The CLI's `supabase db query --linked` (Management API) kept working.
- **Writes to production from Claude** were blocked by the auto-mode classifier; the user runs `supabase db push`
  themselves (it works with their CLI login, no DB password needed). The DB password in the workspace notes file
  belongs to the old Paris project (`iykrvxusnnudoskkwish`), not this one.
- The user is a **Developer** in the client's Supabase org: MCP OAuth fails ("only owners and administrators can
  approve"); the CLI is enough.
- `npx next@canary upgrade --agent=latest` prints nothing in a non-interactive shell; upgrade by hand with the guides
  in `node_modules/next/dist/docs/01-app/02-guides/upgrading/`.
- A dev server started before the upgrade keeps the old Next in memory: restart `npm run dev`.
- Playwright reuses a server on :3000 (`E2E_BASE_URL`); a second `next dev` cannot start (`.next/dev/lock`). Test a
  production build with `next build && next start -p 3100` and `E2E_BASE_URL=http://localhost:3100`.
- The visitor tracker only runs in production builds and skips automated browsers, so tests never count as visits.
- A browser service worker from another local project (alpha-afc60) logs `firebase-messaging-sw.js 404`: harmless.
- Memories: [[yuri-migration-pending]] (live Supabase state), [[user-build-conventions]].

## Where the record lives
- Docs: `docs/README.md` (index), the plan above, `supabase/dry-run/README.md`, `AGENTS.md`.
- Earlier note of this session (superseded by this one, removed): `2026-11-04-0047-…migration-not-applied.md`.
- Session transcript: `~/.claude/projects/d--coding-bloodykheeng-projects-websites-muhsin-muhsin-interior-muhsin-interior-nextjs/e3f635ec-7277-4e21-bd01-11edda86134f.jsonl`.
  **Grep it, never read it whole.**

## How to verify
- `npm run typecheck` · `npx eslint .` · `npm run build`
- `npm run e2e:guest` (no account) · `npm run e2e` (needs `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` in `.env.local`;
  writes `E2E-…` rows to the live DB and removes them)
- Database read-only: `supabase db query --linked "select email, role, is_active from public.profiles"`
- Manually: send the contact form → Dashboard → Inbox; `/projects` filters and Load more on a phone; Visitors after deploy.
