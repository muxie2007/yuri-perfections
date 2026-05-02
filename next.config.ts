import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // // Remove all console logs
    // removeConsole: true

    // // Remove all console logs, excluding error logs
    // removeConsole: { exclude: ["error"] },

    // Remove console logs only in production
    removeConsole: process.env.NODE_ENV === "production"

    // // Remove console logs only in production, excluding error logs
    // removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false
  },
  images: {
    qualities: [75, 85, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // bloodykheeng account hostname
      // {
      //   protocol: 'https',
      //   hostname: 'iykrvxusnnudoskkwish.supabase.co',
      // },
      //muhsin account hostname
      {
        protocol: 'https',
        hostname: 'qqydaukcelbwezeltpit.supabase.co',
      },
    ],
    // Skip server-side image optimization in dev — avoids timeout fetching large remote images.
    // In production the pipeline runs normally and results are cached.
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
