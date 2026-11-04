"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";

/**
 * Refreshes every cached public page after a dashboard save, so visitors see the change on
 * their next visit instead of within the hour (the pages' `revalidate`).
 */
export async function revalidateSite(): Promise<{ ok: boolean }> {
    const guard = await requireStaff();
    if (!guard.ok) return { ok: false };
    revalidatePath("/", "layout");
    return { ok: true };
}
