import type { NextConfig } from "next";

// The Supabase project's host, for next/image (storage URLs). Read from the env so a
// different project (staging, a new account) needs no code change.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "qqydaukcelbwezeltpit.supabase.co";

const nextConfig: NextConfig = {
    compiler: {
        // Remove console logs in production, but keep errors (they reach Vercel's logs).
        removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
    },
    images: {
        qualities: [75, 85, 90, 100],
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
        ],
        // Skip server-side image optimization in dev: avoids timeouts fetching large remote images.
        unoptimized: process.env.NODE_ENV === "development",
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                ],
            },
            { source: "/dashboard/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
        ];
    },
};

export default nextConfig;
