# Dry-running a migration locally

When the live project cannot be reached (or before touching it), run the migrations on a throwaway
database on a local Postgres (Laragon ships Postgres 17):

```bash
psql -h 127.0.0.1 -U postgres -c "create database yuri_migration_check"
psql -h 127.0.0.1 -U postgres -d yuri_migration_check -v ON_ERROR_STOP=1 -f supabase/dry-run/stub-supabase.sql
for f in supabase/migrations/*.sql; do psql -h 127.0.0.1 -U postgres -d yuri_migration_check -v ON_ERROR_STOP=1 -f "$f"; done
# run the newest migration a second time: it must be safe to re-run
psql -h 127.0.0.1 -U postgres -d yuri_migration_check -f supabase/dry-run/rls-checks.sql
psql -h 127.0.0.1 -U postgres -c "drop database yuri_migration_check"
```

`stub-supabase.sql` fakes only what the migrations touch: the `anon`/`authenticated` roles, `auth.users`,
`auth.uid()` (read from `request.jwt.claim.sub`), and `storage.buckets`/`storage.objects`. It is not Supabase:
the final check is still the real project after applying.

The first dry run caught a real bug: `null in (...)` is null, so a user created without a role failed the
profile trigger and blocked the insert (fixed with `coalesce(..., false)`).
