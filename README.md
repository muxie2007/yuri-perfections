# Yuri Perfections — website and dashboard

The public site for Yuri Perfections (interior and exterior finishing, Kampala), at
[yuriperfections.com](https://yuriperfections.com), and the staff dashboard at `/dashboard` where the team
edits everything on the site and reads enquiries from the contact form.

Next.js 16 on Vercel, Supabase (Postgres, Auth, Storage), Tailwind 4, TanStack Query, Playwright.

## Run it locally

```bash
npm install
cp .env.example .env.local      # fill in the Supabase URL and keys
npm run dev                     # http://localhost:3000, dashboard at /dashboard
```

Checks:

```bash
npm run typecheck
npm run lint
npm run e2e:guest               # Playwright, public site (see docs/e2e-testing.md)
npm run build
```

## Where to read next

- [docs/architecture.md](docs/architecture.md): how it fits together
- [docs/database.md](docs/database.md): tables, access rules, migrations, the first super admin
- [docs/deployment.md](docs/deployment.md): Vercel and Supabase settings
- [docs/admin-guide.md](docs/admin-guide.md): the dashboard for the business owner
- [AGENTS.md](AGENTS.md): conventions for whoever (or whatever) changes the code next
