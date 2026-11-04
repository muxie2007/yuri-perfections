# Visitor statistics

Dashboard → **Visitors** shows who opens the public website: visitors, visits, page views, pages per visit, a
day-by-day chart, where visits came from (Instagram, Google, WhatsApp, Facebook, Direct…), countries with flags,
the most viewed pages and devices. Periods: 7 days, 30 days, 90 days, 12 months (`?days=` in the URL).

## How a view is counted

1. `components/VisitTracker.tsx` (in the public layout only, never the dashboard) sends one small POST to
   `/api/track` per page, with `navigator.sendBeacon`. Production builds only; automated browsers
   (`navigator.webdriver`, the Playwright specs) are skipped.
2. `app/api/track/route.ts` drops bots by user agent, works out:
   - **source**: `?utm_source=` if the link had one, else the referrer's site mapped to a name
     (instagram.com → Instagram, google.* → Google, …), else **Direct**. Only the first page of a browser
     session (`is_entry`) carries a source; later pages are "Internal".
   - **country**: Vercel's `x-vercel-ip-country` header (empty locally, shown as Unknown).
   - **device**: mobile, tablet or desktop from the user agent.
3. It inserts a row into `page_views` with the publishable key; RLS lets anyone insert (no backdating) and only
   staff read.
4. The screen calls `public.visitor_stats(days)` (one SQL function, security invoker so RLS applies) which
   returns every figure in one JSON. Days are Kampala days.

## Privacy

No IP address and no cookies. A random id in the visitor's own browser storage (`yp_visitor` in localStorage,
`yp_session` in sessionStorage) tells visits and visitors apart. Nothing identifies a person.

## Tips for the owner

- WhatsApp and Instagram apps often hide where a click came from, so some of those visits count as Direct.
  Add `?utm_source=instagram` (or `whatsapp`, `facebook`, `tiktok`) to links you post, e.g.
  `https://www.yuriperfections.com/?utm_source=instagram`, and they are counted under that name.
- Each view is a small row; at this site's size the free Supabase plan holds years of it. If it ever grows
  large, delete rows older than 13 months (`delete from page_views where created_at < now() - interval '13 months'`).

Migration: `supabase/migrations/20261104001517_visitor_analytics.sql`.
