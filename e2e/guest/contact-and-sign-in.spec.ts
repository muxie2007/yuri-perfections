import { test, expect } from "@playwright/test";

test.describe("contact form", () => {
    test("refuses an empty or invalid enquiry, field by field", async ({ page }) => {
        let posted = false;
        page.on("request", (r) => {
            if (r.method() === "POST" && r.url().endsWith("/")) posted = true;
        });
        await page.goto("/#contact");
        const form = page.getByRole("form", { name: "Contact form" });
        await form.getByRole("button", { name: /send message/i }).click();
        await expect(form.getByText("Please enter your name.")).toBeVisible();
        await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
        await expect(form.getByText(/Tell us a little more/)).toBeVisible();

        await form.getByLabel("Email address").fill("not-an-email");
        await form.getByLabel("Phone / WhatsApp (optional)").fill("call me maybe");
        await form.getByRole("button", { name: /send message/i }).click();
        await expect(form.getByText("Use digits, spaces and + only.")).toBeVisible();
        expect(posted, "nothing is sent while the form is invalid").toBe(false);
    });

    test("“Ask about this” on a service picks it in the form", async ({ page }) => {
        await page.goto("/");
        const service = page.locator("#services article").first();
        const title = (await service.locator("h3").textContent())!.trim();
        await service.getByRole("link", { name: /ask about this/i }).click();
        await expect(page.getByLabel("Service interested in")).toHaveValue(title);
    });
});

test.describe("sign in", () => {
    test("the dashboard sends strangers to sign in, keeping where they were going", async ({ page }) => {
        await page.goto("/dashboard/messages");
        await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fmessages/);
        await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    });

    test("a wrong password is refused with a plain message", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("nobody@example.com");
        await page.locator("#password").fill("wrong-password-123");
        await page.getByRole("button", { name: "Sign in", exact: true }).click();
        await expect(page.getByText("Wrong email or password.")).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });
});
