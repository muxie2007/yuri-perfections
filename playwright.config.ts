import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Read .env.local the way Next does (Supabase keys, E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD).
loadEnvConfig(process.cwd());

/**
 * End-to-end checks in a real browser against the running app. See docs/e2e-testing.md.
 *
 * - guest:   the public site and sign-in, on a desktop browser
 * - mobile:  the same public specs on a phone (layout, menu, no sideways scroll)
 * - admin:   the dashboard, signed in as E2E_ADMIN_EMAIL (skipped when it is not set)
 *
 * It starts `npm run dev` unless something already answers on E2E_BASE_URL.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
    testDir: "./e2e",
    globalTeardown: "./e2e/global-teardown.ts",
    // A route's first visit in `next dev` compiles it.
    timeout: 120_000,
    expect: { timeout: 20_000 },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [["list"]],
    use: {
        baseURL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : { command: "npm run dev", url: baseURL, reuseExistingServer: true, timeout: 180_000 },
    projects: [
        { name: "setup", testMatch: /auth\.setup\.ts/ },
        { name: "guest", testMatch: /guest\/.*\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", testMatch: /guest\/.*\.spec\.ts/, use: { ...devices["Pixel 7"] } },
        {
            name: "admin",
            testMatch: /admin\/.*\.spec\.ts/,
            dependencies: ["setup"],
            use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/admin.json" },
        },
    ],
});
