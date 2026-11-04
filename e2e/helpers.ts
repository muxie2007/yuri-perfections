import { expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";
export const HAS_ADMIN = !!(ADMIN_EMAIL && ADMIN_PASSWORD);

/** Everything the specs create is named with this, so teardown can find and remove it. */
export const E2E_TAG = "E2E-";
export const uniqueTag = () => `${E2E_TAG}${Date.now().toString(36)}`;

/** A real 4×3 PNG (the dashboard re-encodes photos, so it must decode). */
export const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAEElEQVR4nGM4sUADjhhwcgB1VhLBnaruCAAAAABJRU5ErkJggg==",
    "base64",
);

/** No sideways scrolling: the page is never wider than the screen. */
export async function expectNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "page is wider than the viewport").toBeLessThanOrEqual(1);
}

export function isMobile(page: Page) {
    return (page.viewportSize()?.width ?? 1280) < 768;
}
