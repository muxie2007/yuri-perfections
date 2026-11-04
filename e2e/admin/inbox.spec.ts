import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { HAS_ADMIN, uniqueTag } from "../helpers";

test.skip(!HAS_ADMIN, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");

test("an enquiry from the website reaches the inbox, is read, exported and deleted", async ({ page, browser }) => {
    const tag = uniqueTag();

    // 1. A visitor (no session) sends the contact form.
    const visitor = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const site = await visitor.newPage();
    await site.goto("/#contact");
    const form = site.getByRole("form", { name: "Contact form" });
    await form.getByLabel("Full name").fill("Playwright Visitor");
    await form.getByLabel("Email address").fill("visitor@example.com");
    await form.getByLabel("Phone / WhatsApp (optional)").fill("+256 700 000000");
    await form.getByLabel("Message").fill(`Testing the contact form end to end. ${tag}`);
    // The form refuses sends faster than a person could type (spam guard).
    await site.waitForTimeout(3000);
    await form.getByRole("button", { name: /send message/i }).click();
    await expect(site.getByRole("status").getByText("Message sent")).toBeVisible();
    await visitor.close();

    // 2. Staff find it in the inbox, marked new.
    await page.goto(`/dashboard/messages?q=${tag}`);
    const row = page.getByTestId("messages-list").getByRole("button").filter({ hasText: tag });
    await expect(row).toBeVisible();
    await expect(row.getByText("Playwright Visitor")).toHaveClass(/font-semibold/);

    // 3. Opening it marks it read.
    await row.click();
    const dialog = page.getByRole("dialog", { name: "Playwright Visitor" });
    await expect(dialog.getByText(tag)).toBeVisible();
    await expect(dialog.getByRole("link", { name: /reply by email/i })).toHaveAttribute("href", /^mailto:visitor@example\.com/);
    await expect(dialog.getByText(/^Read · read /)).toBeVisible();

    // 4. Notes save.
    await dialog.getByLabel("Notes (staff only)").fill("Called back.");
    await dialog.getByRole("button", { name: "Save notes" }).click();
    await expect(page.getByText("Notes saved.")).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();

    // 5. Export (CSV) carries it.
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "CSV" }).click();
    const file = await (await download).path();
    const csv = readFileSync(file!, "utf8");
    expect(csv).toContain(tag);
    expect(csv).toContain("Called back.");

    // 6. Delete it.
    await row.click();
    await dialog.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog", { name: "Delete this enquiry for good?" }).getByRole("button", { name: "Yes, delete" }).click();
    await expect(page.getByText("Enquiry deleted.")).toBeVisible();
    await expect(page.getByTestId("messages-list").getByText(tag)).toHaveCount(0);
});
