import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie and routes by whether someone is signed in:
 *   - not signed in on /dashboard → /login?next=<where they were going>
 *   - signed in on /login → /dashboard
 * Whether the person is active staff, and with which role, is the dashboard layout's
 * question (lib/auth.ts); what data comes back is RLS's. The cookie only routes.
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                },
            },
        },
    );

    // Nothing may run between creating the client and getClaims(): it is what refreshes the
    // session, and a gap here signs people out at random (Supabase SSR guide).
    const { data } = await supabase.auth.getClaims();
    const signedIn = !!data?.claims?.sub;
    const { pathname, search } = request.nextUrl;

    const redirectTo = (path: string, params?: Record<string, string>) => {
        const url = request.nextUrl.clone();
        url.pathname = path;
        url.search = params ? `?${new URLSearchParams(params)}` : "";
        const redirect = NextResponse.redirect(url);
        // Keep any refreshed session cookies on the redirect.
        response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
        return redirect;
    };

    if (!signedIn && pathname.startsWith("/dashboard")) {
        return redirectTo("/login", { next: pathname + search });
    }

    if (signedIn && pathname === "/login") {
        return redirectTo("/dashboard");
    }

    return response;
}
