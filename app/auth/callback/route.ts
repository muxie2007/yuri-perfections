import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Where emailed links land (password reset). Trades the one-time code for a session cookie,
 * then goes to `next` (same-site paths only). The code verifier lives in a cookie of the
 * browser that asked, so the link must be opened on that device.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get("code");
    const nextParam = searchParams.get("next") ?? "/dashboard";
    const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(`${origin}${next}`);
        console.error("auth callback:", error.message);
    }

    return NextResponse.redirect(`${origin}/login?error=link`);
}
