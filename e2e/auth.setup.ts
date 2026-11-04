import { test as setup, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { ADMIN_EMAIL, ADMIN_PASSWORD, HAS_ADMIN } from "./helpers";

const STATE = "e2e/.auth/admin.json";

/** Signs the test admin in through the real login page once and saves the session cookies. */
setup("sign in as the test admin", async ({ page }) => {
    mkdirSync("e2e/.auth", { recursive: true });
    if (!HAS_ADMIN) {
        // Admin specs skip themselves; leave an empty session so the project can start.
        writeFileSync(STATE, JSON.stringify({ cookies: [], origins: [] }));
        setup.skip(true, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin specs.");
        return;
    }

    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
    await page.context().storageState({ path: STATE });
});
