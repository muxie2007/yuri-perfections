import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Reads retry a brief network hiccup or a 5xx (Supabase sits behind Cloudflare, which
 * answers 522 when a connection times out): up to 3 tries, 0.5 s then 1.5 s apart. One
 * blip must not fail a Vercel build or a page refresh. Writes are never retried.
 */
const RETRY_DELAYS = [500, 1500];
/** Per attempt: a Cloudflare 522 otherwise takes ~21 s to arrive. */
const ATTEMPT_TIMEOUT_MS = 10_000;

async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const method = (init?.method ?? "GET").toUpperCase();
    const retriable = method === "GET" || method === "HEAD";
    for (let attempt = 0; ; attempt++) {
        try {
            const timeout = AbortSignal.timeout(ATTEMPT_TIMEOUT_MS);
            const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
            const response = await fetch(input, { ...init, signal });
            if (!retriable || response.status < 500 || attempt >= RETRY_DELAYS.length) return response;
        } catch (error) {
            if (!retriable || attempt >= RETRY_DELAYS.length) throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
}

/**
 * A Supabase client for the public site's server code: the publishable key and no cookies.
 * Reading no cookies keeps the public pages static (ISR) so Vercel serves them from cache;
 * admin saves refresh them on demand (app/actions/revalidate.ts). RLS shows it only
 * active content, exactly what a visitor sees.
 */
export function createPublicClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
            global: { fetch: fetchWithRetry },
        },
    );
}
