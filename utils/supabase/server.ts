import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * The signed-in person's Supabase client for server components, route handlers and server
 * actions (dashboard only: it reads cookies, which makes a page dynamic). RLS applies.
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        // Called from a Server Component, which cannot set cookies. proxy.ts
                        // refreshes the session on every dashboard request, so this is safe.
                    }
                },
            },
        },
    );
}
