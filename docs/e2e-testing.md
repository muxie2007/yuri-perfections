# Browser tests (Playwright)

Type checks and lint prove the code compiles, not that a visitor can filter projects or that an enquiry
reaches the inbox. Those run in a real Chromium with Playwright.

## Run

```bash
npx playwright install chromium     # once
npm run e2e:guest                   # public site + sign-in, desktop and phone (no account needed)
npm run e2e                         # everything, including the dashboard specs
npm run e2e:ui                      # Playwright's UI
npx playwright test e2e/admin/inbox.spec.ts
npx playwright show-trace test-results/<test>/trace.zip
```

It starts `npm run dev` itself unless something already answers on `http://localhost:3000`. To test a running
server or a deployment instead: `E2E_BASE_URL=https://<preview>.vercel.app npm run e2e:guest`.

**The specs run against the Supabase project in `.env.local`, which is the live one.** Guest specs only read.
Admin specs create an enquiry and a project named `E2E-…`, then delete them; `e2e/global-teardown.ts` removes
any left by a failed run (and their photos).

## Admin specs

Need a real staff account: set `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` in `.env.local` (or the shell); the
Playwright config loads `.env.local` like Next does. The dedicated test login is `admin@yuriperfections.com`
(role **admin**, so the specs also prove an admin cannot reach Users). Without them the admin specs skip. `e2e/auth.setup.ts` signs in through the login page once and saves the session to
`e2e/.auth/admin.json` (git-ignored).

## What is covered

| Spec | Rules |
| --- | --- |
| `guest/home.spec.ts` | Every section renders from the database; no sideways scroll; picking a portfolio thumbnail shows it in the featured box, which opens its page; the category buttons filter; dark mode survives a reload; the phone menu works |
| `guest/projects.spec.ts` | Cards list; a category chip filters, sets `?category=`, and survives a reload; a search with no match says so and resets; Load more; the before/after slider moves with the keyboard; full screen opens and Esc closes; an unknown slug is a 404 |
| `guest/contact-and-sign-in.spec.ts` | The contact form refuses empty or invalid input per field and sends nothing; "Ask about this" picks the service; `/dashboard/*` sends strangers to `/login?next=…`; a wrong password gets a plain message |
| `admin/inbox.spec.ts` | A visitor's enquiry reaches the inbox as New, opening marks it Read, notes save, the CSV export contains it, delete removes it |
| `admin/projects.spec.ts` | An empty project save names what is missing; a project with an uploaded pair is created, appears on `/projects` for a visitor, and is deleted; the menu shows Users only to a super admin |

Guest specs also run as the `mobile` project (Pixel 7 viewport).

## Locators

- Prefer roles and labels (`getByRole`, `getByLabel`); a password input has no role, so it is found by id
  (`#password`).
- The navbar renders a theme button for desktop and one for phones: pick the visible one
  (`locator("visible=true")`).
- The contact form refuses a send within 2.5 s of loading (spam guard): a spec that submits waits first.

## Last full run

2026-11-04, against the live project from the developer PC: guest + mobile **25 passed, 3 skipped** (Load more
needs more than 9 projects; two specs are layout-specific), admin **4 passed**; the teardown left no `E2E-` rows
or photos.
