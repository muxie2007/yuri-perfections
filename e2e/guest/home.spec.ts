import { test, expect } from "@playwright/test";
import { expectNoHorizontalScroll, isMobile } from "../helpers";

test.describe("home page", () => {
    test("shows every section with content from the database", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toContainText("Precision");
        await expect(page.locator("#about h2")).toBeVisible();
        await expect(page.locator("#services article").first()).toBeVisible();
        await expect(page.locator("#projects")).toBeVisible();
        await expect(page.getByRole("form", { name: "Contact form" })).toBeVisible();
        await expectNoHorizontalScroll(page);
    });

    test("picking a thumbnail shows it in the featured box, which opens its page", async ({ page }) => {
        await page.goto("/");
        const featured = page.getByTestId("featured-project");
        const thumbs = page.locator("#projects").getByTestId("project-thumb");
        test.skip((await thumbs.count()) < 2, "Needs at least two live projects.");

        const second = thumbs.nth(1);
        const title = (await second.getAttribute("aria-label"))!.replace(/^Show /, "");
        await second.click();
        await expect(second).toHaveAttribute("aria-pressed", "true");
        await expect(featured.locator("h3")).toHaveText(title);

        await featured.getByRole("link", { name: /view before & afters/i }).click();
        await page.waitForURL(/\/projects\/[a-z0-9-]+$/);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    });

    test("the category buttons narrow the portfolio", async ({ page }) => {
        await page.goto("/");
        const buttons = page.getByRole("toolbar", { name: "Filter projects by category" }).getByRole("button");
        test.skip((await buttons.count()) < 3, "Needs two or more categories.");
        await buttons.nth(1).click();
        await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
        await expect(page.getByTestId("featured-project")).toBeVisible();
    });

    test("the theme toggle switches to dark and survives a reload", async ({ page }) => {
        await page.goto("/");
        const toggle = page.getByRole("button", { name: "Toggle theme" }).locator("visible=true").first();
        await toggle.click();
        await expect(page.locator("html")).toHaveClass(/dark/);
        await page.reload();
        await expect(page.locator("html")).toHaveClass(/dark/);
        await page.getByRole("button", { name: "Toggle theme" }).locator("visible=true").first().click();
        await expect(page.locator("html")).not.toHaveClass(/dark/);
    });

    test("the menu works on a phone", async ({ page }) => {
        test.skip(!isMobile(page), "Phone layout only.");
        await page.goto("/");
        await page.getByRole("button", { name: "Open menu" }).click();
        const menu = page.getByRole("dialog", { name: "Menu" });
        await menu.getByRole("link", { name: "Services", exact: true }).click();
        await expect(menu).toBeHidden();
        await expect(page).toHaveURL(/#services$/);
    });
});
