import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * The secret-key client: bypasses RLS and can manage auth users. Server only, and only
 * after the caller is proven a super admin (app/dashboard/users/actions.ts).
 * Returns null when the key is not configured, so the screen can say what to set.
 */
export function createAdminClient() {
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
}
