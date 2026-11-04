# Database (Supabase)

Project ref `qqydaukcelbwezeltpit` (the client's account). Everything is in `supabase/migrations/`, in order.

| Migration | What |
| --- | --- |
| `20261103190000_baseline_existing_tables.sql` | The four tables first made by hand in the dashboard (`hero_slides`, `services`, `projects`, `project_images`). `create table if not exists`: a no-op on the live project, rebuilds them on a new one. |
| `20261103191000_admin_dashboard.sql` | Staff profiles and roles, categories, testimonials, enquiries, site settings, RLS for everything, the `media` bucket. Additive: drops no table or row. Safe to run twice. |

## Applying a migration to the live project

Forward only (the site is live). Either:

1. **SQL editor** (simplest): Supabase dashboard → SQL Editor → paste the file → Run. Then record it so the
   CLI knows: `supabase migration repair --status applied 20261103191000` (and `…190000`) with the project
   linked, or skip if you never use the CLI against this project.
2. **CLI**: `supabase link --project-ref qqydaukcelbwezeltpit` then `supabase db push`.

**Order matters:** apply the migration **before** deploying code that uses it. If the code goes first, the
Vercel build fails (the home page cannot read `projects.featured`) and the old deployment stays up, so nothing
breaks for visitors, but the deploy does not happen.

The admin migration was dry-run on a local Postgres 17 with stand-ins for Supabase's `auth` and `storage`
schemas, twice, and its access rules checked as a visitor, an inactive user, an admin and a super admin.

## Tables

| Table | Rows | Who reads | Who writes |
| --- | --- | --- | --- |
| `profiles` | one per staff account (`id` = `auth.users.id`), `role` (`super_admin`/`admin`), `is_active` | the person themself; the super admin all | super admin (role, active, name) |
| `hero_slides` | home page slider photos, `order`, `status` | visitors: active; staff: all | staff |
| `services` | `icon` (a key of `lib/service-icons.ts`), title, text, photo, `order`, `status` | visitors: active | staff |
| `project_categories` | `name` (unique), `tagline`, `order` | everyone | staff |
| `projects` | `slug` (unique), title, `category` → `project_categories.name`, style, location, description, `cover_before/after` (= first pair, set on save), `featured`, `completed_on`, `status` | visitors: active | staff |
| `project_images` | before/after pairs: `project_id`, `before`, `after`, `label`, `order` | visitors: pairs of active projects | staff |
| `testimonials` | name, role, quote, rating 1–5, optional avatar, `order`, `status` | visitors: active | staff |
| `contact_messages` | enquiries: name, email, phone, service, message, `status` (`new`/`read`/`archived`), staff `notes`, `read_at` | staff only | anyone may **insert** (status `new`, no notes); staff update and delete |
| `site_settings` | one row (`id = 1`): contact details, social links, hero text, About section | everyone | staff (update only) |

- `projects.category` has a foreign key to `project_categories(name)` **on update cascade, on delete restrict**:
  renaming a category renames it on its projects; a category in use cannot be deleted (the dashboard says so).
- `status` is `active` (live) or `inactive` (hidden). Hidden rows stay for staff.
- `updated_at` columns are kept by a trigger (`private.set_updated_at`).
- Projects are listed newest first: `completed_on desc nulls last, created_at desc`. Their `order` column is no
  longer used for sorting (the owner never has to reorder a long list); featured ones lead the home page.

## Row level security

RLS is on for every table. Helpers live in the unexposed `private` schema (security definer functions must
not sit in an exposed schema):

- `private.is_admin()`: the caller has an active profile with either role.
- `private.is_super_admin()`: the caller has an active `super_admin` profile.

Policies call them as `(select private.is_admin())` so Postgres evaluates them once per query.

The migration **drops the hand-made policies** on the four original tables first (whatever they were) and
recreates the full set, so the migration is the whole truth. To see what is live:

```sql
select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by 1, 2;
```

## Staff accounts

- A new `auth.users` row gets a profile through the trigger `on_auth_user_created` →
  `private.handle_new_user()`. The role comes from **`app_metadata.role`** (only settable with the secret key;
  `user_metadata` is user-editable and never trusted). Without it the profile is **inactive**: a stray sign-up
  gets nothing.
- Accounts that existed before the migration got inactive profiles.
- Turning `is_active` off takes effect on the person's next request (RLS reads the table every time); their
  session cookie still exists until it expires, but it opens nothing.

### The first super admin (once)

1. Supabase dashboard → Authentication → Users → **Add user** → email + password, tick *Auto confirm*.
2. SQL Editor:

```sql
update public.profiles set role = 'super_admin', is_active = true, full_name = 'Your Name'
where email = 'you@example.com';
```

3. Sign in at `/login`. From then on, add people in **Dashboard → Users** (needs `SUPABASE_SECRET_KEY`).

Also in Authentication → Sign In / Providers: **turn off "Allow new users to sign up"** (staff are invited, not
self-registered; RLS would refuse them anyway).

## Storage

- Bucket **`media`**: public (anyone can view a photo by its URL), 10 MB per file, images only. Only staff can
  upload, replace or delete (`storage.objects` policies with `private.is_admin()`). Folders: `projects/`,
  `hero/`, `services/`, `testimonials/`, `about/`, each by year.
- Bucket `yuri perfection images` (older, made by hand): still referenced by existing rows; untouched.
