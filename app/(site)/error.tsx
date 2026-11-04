"use client";

import { useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";

/**
 * Shown if a public page cannot load its content (for example Supabase does not answer).
 * On Vercel a cached page is served instead whenever there is one; this is the last resort.
 */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-[70dvh] flex items-center justify-center px-6 pt-24 bg-white dark:bg-[#181B34]">
            <div className="text-center max-w-md">
                <p className="text-[#F5C518] text-xs font-semibold tracking-[0.3em] uppercase mb-3">Something went wrong</p>
                <h1 className="font-bold text-3xl text-[#181B34] dark:text-white mb-4">We could not load this page</h1>
                <p className="text-sm text-slate-500 dark:text-white/60 mb-8">
                    Please try again in a moment. If it keeps happening, call or WhatsApp us; our details are at the bottom of the page.
                </p>
                <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800]"
                >
                    <FiRefreshCw /> Try again
                </button>
            </div>
        </main>
    );
}
