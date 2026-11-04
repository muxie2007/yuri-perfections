import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import { E2E_TAG } from "./helpers";

/**
 * Removes what a run left behind (a failed spec skips its own clean-up): enquiries whose
 * message carries the E2E tag and projects titled "E2E-…", with their uploaded photos.
 * Signs in as the test admin, so RLS applies exactly as in the dashboard.
 */
export default async function globalTeardown() {
    loadEnvConfig(process.cwd());
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    if (!email || !password) return;

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!, {
        auth: { persistSession: false },
    });
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
        console.warn("e2e teardown: could not sign in:", error.message);
        return;
    }

    await sb.from("contact_messages").delete().ilike("message", `%${E2E_TAG}%`);

    const { data: projects } = await sb.from("projects").select("id, cover_before, cover_after, project_images(before, after)").ilike("title", `${E2E_TAG}%`);
    if (projects?.length) {
        const marker = "/storage/v1/object/public/media/";
        const paths = projects
            .flatMap((p) => [p.cover_before, p.cover_after, ...(p.project_images ?? []).flatMap((i) => [i.before, i.after])])
            .map((url) => (url?.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null))
            .filter((p): p is string => !!p);
        await sb.from("projects").delete().in("id", projects.map((p) => p.id));
        if (paths.length) await sb.storage.from("media").remove([...new Set(paths)]);
    }
    await sb.auth.signOut();
}
