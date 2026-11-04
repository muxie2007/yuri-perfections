import { test, expect } from "@playwright/test";
import { HAS_ADMIN, PNG, uniqueTag } from "../helpers";

test.skip(!HAS_ADMIN, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");

test("a project made in the dashboard shows on the website, then is deleted", async ({ page, browser }) => {
    const title = `${uniqueTag()} Project`;

    // 1. An empty save names what is missing.
    await page.goto("/dashboard/projects/new");
    await page.getByRole("button", { name: "Create project" }).first().click();
    await expect(page.getByText("Give the project a title.")).toBeVisible();
    await expect(page.getByText("Pick a category.")).toBeVisible();
    await expect(page.getByText("Add the before photo.")).toBeVisible();

    // 2. Fill it in; the web address follows the title.
    await page.getByLabel("Title").fill(title);
    await expect(page.getByLabel("Web address")).toHaveValue(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""));
    const category = page.getByLabel("Category");
    const firstCategory = await category.locator("option").nth(1).getAttribute("value");
    await category.selectOption(firstCategory!);
    await page.getByLabel("Location").fill("Ntinda");
    await page.getByLabel("Description").fill("Made by the end-to-end tests.");
    await page.getByLabel("Room or area").fill("Living room");

    const pair = page.getByTestId("pair").first();
    await pair.locator('input[type="file"]').nth(0).setInputFiles({ name: "before.png", mimeType: "image/png", buffer: PNG });
    await expect(pair.getByRole("img", { name: "Before" })).toBeVisible();
    await pair.locator('input[type="file"]').nth(1).setInputFiles({ name: "after.png", mimeType: "image/png", buffer: PNG });
    await expect(pair.getByRole("img", { name: "After" })).toBeVisible();

    await page.getByRole("button", { name: "Create project" }).first().click();
    // Saving asks first, and says whether visitors will see it.
    const confirmCreate = page.getByRole("dialog", { name: /^Create "/ });
    await expect(confirmCreate.getByText(/visitors will see it/)).toBeVisible();
    await confirmCreate.getByRole("button", { name: "Create project" }).click();
    await expect(page.getByText("Project created.")).toBeVisible();
    await page.waitForURL(/\/dashboard\/projects\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);

    // 3. A visitor finds it on the portfolio (the save refreshed the cached pages).
    const visitor = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const site = await visitor.newPage();
    await site.goto(`/projects?q=${encodeURIComponent(title)}`);
    await site.getByTestId("project-card").filter({ hasText: title }).click();
    await expect(site.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(site.getByText("Living room")).toBeVisible();
    await visitor.close();

    // 4. Delete it.
    await page.getByRole("button", { name: "Delete project" }).click();
    await page.getByRole("dialog", { name: /^Delete "/ }).getByRole("button", { name: "Yes, delete" }).click();
    await page.waitForURL(/\/dashboard\/projects$/);
    await expect(page.getByText("Project deleted.")).toBeVisible();
});

test("an admin sees the dashboard menu; only a super admin sees Users", async ({ page }) => {
    await page.goto("/dashboard");
    const nav = page.getByRole("navigation", { name: "Dashboard" }).locator("visible=true");
    for (const item of ["Overview", "Inbox", "Projects", "Hero slides", "Services", "Site settings"]) {
        await expect(nav.getByRole("link", { name: new RegExp(`^${item}`) })).toBeVisible();
    }
    const usersLink = nav.getByRole("link", { name: "Users" });
    if (await usersLink.count()) {
        await usersLink.click();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Users");
    } else {
        await page.goto("/dashboard/users");
        await expect(page).toHaveURL(/\/dashboard$/);
    }
});
