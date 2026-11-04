import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/utils/supabase/public";

/**
 * Records one public page view (components/VisitTracker.tsx sends it). Anonymous: no IP is
 * stored; the country comes from Vercel's edge header, the source from ?utm_source or the
 * referrer. Bots are ignored. Always answers 204 so a failure never shows to a visitor.
 * See docs/analytics.md.
 */
const body = z.object({
    path: z.string().min(1).max(300).startsWith("/"),
    referrer: z.string().max(500).optional().default(""),
    utmSource: z.string().max(60).optional().default(""),
    visitorId: z.string().uuid(),
    sessionId: z.string().uuid(),
    isEntry: z.boolean(),
});

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse|playwright/i;

/** Where a visit came from, in words the owner knows. */
const SOURCES: [RegExp, string][] = [
    [/(^|\.)instagram\.com$/, "Instagram"],
    [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
    [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
    [/(^|\.)tiktok\.com$/, "TikTok"],
    [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
    [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
    [/(^|\.)google\./, "Google"],
    [/(^|\.)bing\.com$/, "Bing"],
    [/(^|\.)(yahoo\.com|duckduckgo\.com)$/, "Other search"],
];

function sourceOf(utm: string, referrerHost: string): string {
    const u = utm.trim().toLowerCase();
    if (u) {
        const known: Record<string, string> = { ig: "Instagram", instagram: "Instagram", fb: "Facebook", facebook: "Facebook", whatsapp: "WhatsApp", wa: "WhatsApp", tiktok: "TikTok", google: "Google", linkedin: "LinkedIn", x: "X (Twitter)", twitter: "X (Twitter)", youtube: "YouTube" };
        return known[u] ?? u.slice(0, 40);
    }
    if (!referrerHost) return "Direct";
    for (const [pattern, name] of SOURCES) if (pattern.test(referrerHost)) return name;
    return referrerHost.replace(/^www\./, "").slice(0, 40);
}

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
    if (/mobi|iphone|android/i.test(ua)) return "mobile";
    return "desktop";
}

export async function POST(request: NextRequest) {
    const ua = request.headers.get("user-agent") ?? "";
    if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

    let parsed;
    try {
        parsed = body.safeParse(await request.json());
    } catch {
        return new NextResponse(null, { status: 204 });
    }
    if (!parsed.success) return new NextResponse(null, { status: 204 });
    const v = parsed.data;
    if (v.path.startsWith("/dashboard") || v.path.startsWith("/login")) return new NextResponse(null, { status: 204 });

    let referrerHost = "";
    try {
        referrerHost = v.referrer ? new URL(v.referrer).hostname.toLowerCase() : "";
    } catch {
        referrerHost = "";
    }
    // Moving between our own pages is not a source.
    const ownHost = request.nextUrl.hostname.replace(/^www\./, "");
    if (referrerHost.replace(/^www\./, "") === ownHost) referrerHost = "";

    const { error } = await createPublicClient()
        .from("page_views")
        .insert({
            path: v.path.split("?")[0].slice(0, 300),
            referrer_host: referrerHost.slice(0, 200),
            source: v.isEntry ? sourceOf(v.utmSource, referrerHost) : "Internal",
            country: (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase(),
            device: deviceOf(ua),
            visitor_id: v.visitorId,
            session_id: v.sessionId,
            is_entry: v.isEntry,
        });
    if (error) console.error("page_views:", error.message);

    return new NextResponse(null, { status: 204 });
}
