import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

/**
 * Next 16's proxy (formerly middleware). It runs only for the dashboard and the sign-in
 * routes, so the public pages never touch the session and stay cached (ISR).
 * See docs/architecture.md "Auth".
 */
export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/auth/:path*"],
};
