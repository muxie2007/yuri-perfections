import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import type { Profile } from "./types";

export type Staff = { userId: string; email: string; profile: Profile | null };

/**
 * Who is signed in, with their profile (once per request). `profile` is null when the
 * account has none, and an inactive profile has no access: callers check `isActiveStaff`.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!claims?.sub) return null;

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", claims.sub).maybeSingle();

    return { userId: claims.sub, email: (claims.email as string) ?? "", profile: (profile as Profile) ?? null };
});

export function isActiveStaff(staff: Staff | null): staff is Staff & { profile: Profile } {
    return !!staff?.profile?.is_active;
}

type Guard = { ok: true; staff: Staff & { profile: Profile } } | { ok: false; error: string };

/** For server actions: the active staff member, or an error to return. */
export async function requireStaff(role?: "super_admin"): Promise<Guard> {
    const staff = await getStaff();
    if (!isActiveStaff(staff)) return { ok: false, error: "You are not signed in as active staff." };
    if (role && staff.profile.role !== role) return { ok: false, error: "Only the super admin can do this." };
    return { ok: true, staff };
}
