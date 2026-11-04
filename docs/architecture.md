# Architecture

Yuri Perfections' website (yuriperfections.com) and its staff dashboard: one Next.js 16 app on Vercel, with
Supabase for the database, sign-in and photo storage. No separate API: the browser and the server talk to
Supabase directly, and **row level security (RLS) in the database is the security boundary**.

## Stack

| Piece | What | Where |
| --- | --- | --- |
| Next.js 16 (App Router, Turbopack) | Pages, server actions, image optimisation | `app/` |
| Supabase Postgres | All content and enquiries | `supabase/migrations/` |
| Supabase Auth | Staff sign-in (email + password) | `proxy.ts`, `lib/auth.ts` |
| Supabase Storage | Uploaded photos (bucket `media`) | `lib/images.ts` |
| TanStack Query | Dashboard data and the portfolio's "Load more" | `providers/TanstackProvider.tsx` |
| react-hook-form + zod | Forms (contact, project editor, settings) | `lib/enquiry.ts`, dashboard forms |
| Tailwind 4, framer-motion | Look and motion; dark mode with the `dark:` variant | `app/globals.css` |
| Playwright | Browser tests | `e2e/`, [e2e-testing.md](e2e-testing.md) |

## Folders

```
app/
  (site)/              public website: layout (navbar, footer, JSON-LD), home, projects, project/[slug]
  dashboard/           staff dashboard: one folder per screen (messages, projects, hero-slides, …)
  login/  auth/callback/   sign-in, password reset landing
  actions/             server actions: contact (send an enquiry), revalidate (refresh public pages)
components/            public sections (Hero, About, Services, Projects, Contact, …), BeforeAfter, ProjectCard
components/admin/      dashboard UI kit (ui.tsx), shell, ImageField, RowActions
services/content.ts    every public read (works with any Supabase client)
services/admin.ts      every dashboard read and write (browser client, RLS)
lib/                   types, site constants, auth, images, export, formatting, query keys
hooks/                 useSave (mutation + toast + refresh), useUrlState, useOrderedList
utils/supabase/        clients: browser, server (cookies), public (no cookies), admin (secret key), proxy
supabase/migrations/   the database, in order
e2e/                   Playwright specs
```

## Caching (why the public site is fast)

- Public pages read Supabase with `utils/supabase/public.ts`: the publishable key and **no cookies**, so Next
  can render them once and serve them from Vercel's cache (ISR).
- `/` and `/projects/[slug]` have `revalidate = 3600`: rebuilt at most hourly by themselves.
- **Every dashboard save calls `revalidateSite()`** (`app/actions/revalidate.ts`, through `hooks/useSave.ts`),
  which purges all public pages at once. Visitors see a change on their next page load.
- `/projects` renders per request (it reads `?category=&q=` so shared links show the right list); its "Load
  more" pages come straight from the browser.
- A failed read **throws** rather than returning nothing: during a background rebuild Next then keeps the last
  good page instead of caching an empty one, and a Vercel build fails instead of shipping a broken site.
- The theme is applied by a tiny script in `<head>` (`THEME_INIT_SCRIPT`), not by reading the cookie on the
  server, because reading cookies would make every page dynamic. Components style dark mode with Tailwind's
  `dark:` variant so the server HTML is the same for both themes.
- The old version subscribed every visitor to Supabase Realtime; that is gone (it opened a socket per visitor
  and did nothing a cached page needs).

## Auth and roles

- `proxy.ts` (Next 16's middleware) runs **only** on `/dashboard/*`, `/login` and `/auth/*`. It refreshes the
  Supabase session cookie and routes: not signed in on the dashboard → `/login?next=…`; signed in on
  `/login` → `/dashboard`. It never decides what someone may see.
- `app/dashboard/layout.tsx` loads the person's `profiles` row. No row, or `is_active = false` → "No dashboard
  access". Otherwise the shell renders with their role.
- Two roles (`profiles.role`): **admin** manages all website content and enquiries; **super_admin** also manages
  staff accounts (Dashboard → Users). The database enforces both (`private.is_admin()`,
  `private.is_super_admin()`), so a hidden menu item is a convenience, not the guard.
- Sign-in and sign-out load the next page afresh (`window.location.replace`), never `router.push`, so the client
  router cache can never show one person's page to the next (coding-notes playbook §6); `replace` also drops
  the page from the Back history.
- Creating, deleting and setting passwords for users needs the secret key, used only in
  `app/dashboard/users/actions.ts` after proving the caller is a super admin.

## Enquiries (the contact form)

`components/Contact.tsx` → server action `submitEnquiry` (`app/actions/contact.ts`) → validates with the same
zod schema as the form (`lib/enquiry.ts`) → inserts into `contact_messages` → optional email through Resend.
Spam guards: a hidden field bots fill and a minimum time on the form; a bot is told "sent" and nothing is saved.
Staff read them in **Dashboard → Inbox** (`app/dashboard/messages`), with Excel and CSV export.

Before this change the form only showed "Message sent!" and **saved nothing**: no enquiry sent through the site
before Nov 2026 was kept anywhere.

## Photos

Uploaded in the browser straight to the `media` bucket (`lib/images.ts`): resized to at most 2400 px and
re-encoded as WebP first (phone photos are 4–12 MB). Paths are `folder/year/uuid.webp`, so no spaces (the old
bucket's spaces needed `cleanImageUrl`). When a record is deleted or a photo replaced, the old file is removed
(best effort). Files outside `media` (the older `yuri perfection images` bucket, Unsplash, `/public`) are never
deleted by the app. A photo uploaded into a form that is then abandoned stays in storage (small cost; tidy
from the Supabase dashboard if it ever matters).

`next/image` serves every photo resized for the screen; `next.config.ts` allows the Supabase host from
`NEXT_PUBLIC_SUPABASE_URL`.
