"use server";

import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

/**
 * Staff accounts. Every action proves the caller is an active super admin first; creating,
 * deleting and setting passwords then need the secret key (SUPABASE_SECRET_KEY, server
 * only). Role and on/off changes go through RLS as the super admin.
 */

type Result = { ok: true } | { ok: false; error: string };

const NO_KEY =
    "The server is missing SUPABASE_SECRET_KEY, so accounts cannot be created or deleted here. Add it in Vercel (docs/deployment.md), or manage users in the Supabase dashboard.";

const password = z.string().min(8, "At least 8 characters.").max(72);

const createSchema = z.object({
    email: z.string().trim().toLowerCase().email("Not a valid email."),
    full_name: z.string().trim().min(2, "Enter their name.").max(120),
    role: z.enum(["admin", "super_admin"]),
    password,
});

export async function createStaffUser(input: z.infer<typeof createSchema>): Promise<Result> {
    const guard = await requireStaff("super_admin");
    if (!guard.ok) return guard;
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const admin = createAdminClient();
    if (!admin) return { ok: false, error: NO_KEY };

    // The role travels in app_metadata (only the secret key can set it); the database
    // trigger turns it into an active profile (supabase/migrations, handle_new_user).
    const { error } = await admin.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        app_metadata: { role: parsed.data.role },
        user_metadata: { full_name: parsed.data.full_name },
    });
    if (error) {
        return { ok: false, error: /already been registered|already exists/i.test(error.message) ? "An account with that email already exists." : error.message };
    }
    return { ok: true };
}

const updateSchema = z.object({
    id: z.string().uuid(),
    full_name: z.string().trim().min(2).max(120).optional(),
    role: z.enum(["admin", "super_admin"]).optional(),
    is_active: z.boolean().optional(),
});

export async function updateStaffUser(input: z.infer<typeof updateSchema>): Promise<Result> {
    const guard = await requireStaff("super_admin");
    if (!guard.ok) return guard;
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    const { id, ...patch } = parsed.data;

    // Never lock the house: you cannot demote or switch off yourself.
    if (id === guard.staff.userId && (patch.role === "admin" || patch.is_active === false)) {
        return { ok: false, error: "You cannot remove your own super admin access. Ask another super admin." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", id).select("id");
    if (error) return { ok: false, error: error.message };
    if (!data?.length) return { ok: false, error: "That user was not found." };
    return { ok: true };
}

export async function setStaffPassword(input: { id: string; password: string }): Promise<Result> {
    const guard = await requireStaff("super_admin");
    if (!guard.ok) return guard;
    const parsed = z.object({ id: z.string().uuid(), password }).safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const admin = createAdminClient();
    if (!admin) return { ok: false, error: NO_KEY };
    const { error } = await admin.auth.admin.updateUserById(parsed.data.id, { password: parsed.data.password });
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteStaffUser(id: string): Promise<Result> {
    const guard = await requireStaff("super_admin");
    if (!guard.ok) return guard;
    if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid user." };
    if (id === guard.staff.userId) return { ok: false, error: "You cannot delete your own account." };

    const admin = createAdminClient();
    if (!admin) return { ok: false, error: NO_KEY };
    // Deleting the auth user cascades to the profile.
    const { error } = await admin.auth.admin.deleteUser(id);
    return error ? { ok: false, error: error.message } : { ok: true };
}
