import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-[70dvh] flex items-center justify-center px-6 pt-24 bg-white dark:bg-[#181B34]">
            <div className="text-center">
                <p className="text-[#F5C518] text-xs font-semibold tracking-[0.3em] uppercase mb-3">Not found</p>
                <h1 className="font-bold text-3xl md:text-4xl text-[#181B34] dark:text-white mb-4">We could not find that page</h1>
                <p className="text-sm text-slate-500 dark:text-white/60 mb-8">It may have moved, or the project is no longer listed.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Link href="/projects" className="px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold bg-[#F5C518] text-[#181B34]">
                        See our projects
                    </Link>
                    <Link href="/" className="px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold border border-[#181B34]/20 text-[#181B34] dark:border-white/20 dark:text-white">
                        Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
