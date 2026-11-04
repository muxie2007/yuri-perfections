# Deployment (Vercel + Supabase)

The site deploys from git to Vercel. Supabase is not deployed by Vercel: database changes are applied by hand,
**first** ([database.md](database.md#applying-a-migration-to-the-live-project)).

## Releasing a change that has a migration

1. Apply the migration to the live Supabase project (SQL editor or `supabase db push`).
2. Check the site still loads (the old code ignores the new tables and columns).
3. Push the code; Vercel builds and deploys. A build that cannot read the database fails and leaves the
   previous deployment live.
4. Sign in at `/dashboard` and look at the screen you changed.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Where to find it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase → Project Settings → API Keys → Publishable | Public |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys | **Server only. Never prefix with `NEXT_PUBLIC_`.** Needed by Dashboard → Users. `SUPABASE_SERVICE_ROLE_KEY` (legacy) also works. |
| `RESEND_API_KEY` | resend.com → API Keys | Optional: email each new enquiry |
| `ENQUIRY_NOTIFY_EMAIL` | the business's inbox | Optional; comma-separate several |
| `ENQUIRY_FROM_EMAIL` | a sender on a domain verified in Resend | Optional; without it Resend's test sender is used, which only delivers to the Resend account's own email |

`.env.example` lists them. Locally they go in `.env.local` (git-ignored).

## Supabase Auth settings (once)

Authentication → URL Configuration:

- **Site URL**: `https://www.yuriperfections.com`
- **Redirect URLs**: `https://www.yuriperfections.com/**`, `https://yuriperfections.com/**`,
  `http://localhost:3000/**` (and the Vercel preview
  domain pattern if you test resets on previews, e.g. `https://*-<team>.vercel.app/**`)

Password reset emails link to `/auth/callback?next=/dashboard/account?reset=1`, which signs the person in and
opens My account to set a new password. Supabase's built-in email sender is rate limited (a few per hour); for
real volume set a custom SMTP under Authentication → Emails.

Authentication → Sign In / Providers → Email: **disable "Allow new users to sign up"**.

## Images on Vercel

Every photo goes through `next/image` (Vercel Image Optimization). Each size of each photo counts once toward
the plan's monthly transformations; a site this size stays well inside the Hobby allowance. The Supabase
host comes from `NEXT_PUBLIC_SUPABASE_URL` (`next.config.ts`), so moving to another Supabase project needs
no code change.

## The domain

Both `yuriperfections.com` and `www.yuriperfections.com` work; Vercel redirects the bare domain to `www`.
The site declares `www` as its official address (`SITE_URL` in `lib/site.ts`: canonical tags, sitemap,
social previews, structured data), so search engines index one address. If the primary domain in Vercel →
Domains is ever switched to the bare domain, change `SITE_URL` to match.
