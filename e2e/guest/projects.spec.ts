import { test, expect } from "@playwright/test";
import { expectNoHorizontalScroll } from "../helpers";

test.describe("projects portfolio", () => {
    test("lists projects and filters by category through the URL", async ({ page }) => {
        await page.goto("/projects");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our Projects");
        const cards = page.getByTestId("project-card");
        await expect(cards.first()).toBeVisible();
        await expectNoHorizontalScroll(page);

        const chips = page.getByRole("toolbar", { name: "Filter by category" }).getByRole("button");
        test.skip((await chips.count()) < 2, "Needs at least one category.");
        const chip = chips.nth(1);
        const category = (await chip.textContent())!.trim();
        await chip.click();
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        await expect(page).toHaveURL(new RegExp(`category=${encodeURIComponent(category).replace(/%20/g, "(\\+|%20)")}`));

        // Every card shown carries that category (the label on the photo).
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i).locator("span").first()).toHaveText(category, { ignoreCase: true });
        }

        // The filtered link survives a reload.
        await page.reload();
        await expect(page.getByRole("toolbar", { name: "Filter by category" }).getByRole("button", { name: category })).toHaveAttribute("aria-pressed", "true");
    });

    test("a search with no match says so and can be cleared", async ({ page }) => {
        await page.goto("/projects");
        await page.getByPlaceholder("Search by name, place or style").fill("zzqq-no-such-project");
        await expect(page.getByText("No projects match.")).toBeVisible();
        await expect(page).toHaveURL(/q=zzqq-no-such-project/);
        await page.getByRole("button", { name: "Show all projects" }).click();
        await expect(page.getByTestId("project-card").first()).toBeVisible();
    });

    test("loads more projects when there are more than a page", async ({ page }) => {
        await page.goto("/projects");
        const summary = page.getByText(/^Showing \d+ of \d+$/);
        await expect(summary).toBeVisible();
        const [, shown, total] = (await summary.textContent())!.match(/Showing (\d+) of (\d+)/)!.map(Number);
        test.skip(total <= shown, "Fewer projects than one page.");
        await page.getByRole("button", { name: "Load more projects" }).click();
        await expect(page.getByTestId("project-card")).toHaveCount(Math.min(total, shown * 2));
    });

    test("a project page compares before and after and opens full screen", async ({ page }) => {
        await page.goto("/projects");
        await page.getByTestId("project-card").first().click();
        await page.waitForURL(/\/projects\/[a-z0-9-]+$/);
        await expectNoHorizontalScroll(page);

        const slider = page.getByRole("slider").first();
        await expect(slider).toHaveAttribute("aria-valuenow", "50");
        await slider.focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await expect(slider).toHaveAttribute("aria-valuenow", "54");
        await page.keyboard.press("Home");
        await expect(slider).toHaveAttribute("aria-valuenow", "0");

        await page.getByRole("button", { name: "Full screen" }).first().click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
    });

    test("an unknown project shows the not found page", async ({ page }) => {
        const response = await page.goto("/projects/this-project-does-not-exist");
        expect(response?.status()).toBe(404);
        await expect(page.getByText("We could not find that page")).toBeVisible();
    });
});
