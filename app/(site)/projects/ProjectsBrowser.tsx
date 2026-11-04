"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FiArrowRight, FiSearch, FiX } from "react-icons/fi";
import { ProjectCard, ProjectCardSkeleton } from "@/components/ProjectCard";
import { createClient } from "@/utils/supabase/client";
import { getProjectsPage, PROJECTS_PAGE_SIZE, type ProjectsPage } from "@/services/content";
import type { ProjectCategory } from "@/lib/types";

type Props = {
    categories: ProjectCategory[];
    /** What the server rendered: the filters it used and their first page. */
    initial: { category: string; q: string; page: ProjectsPage };
};

/**
 * Category chips, a search box and the project grid, with "Load more" (also triggered when
 * the end of the grid scrolls into view). Filters live in the URL (?category=&q=) so a
 * refresh, Back, or a shared link shows the same list; they change without a server round
 * trip (history.replaceState, which Next keeps in step with useSearchParams).
 */
export default function ProjectsBrowser({ categories, initial }: Props) {
    const pathname = usePathname();
    const params = useSearchParams();
    const category = params.get("category") ?? "";
    const q = params.get("q") ?? "";

    const [search, setSearch] = useState(q);
    const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const setFilters = (next: { category?: string; q?: string }) => {
        const sp = new URLSearchParams(params.toString());
        for (const [key, value] of Object.entries(next)) {
            if (value) sp.set(key, value);
            else sp.delete(key);
        }
        const qs = sp.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    };

    // Typing updates the URL once the person pauses.
    const onSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setFilters({ q: value.trim() }), 350);
    };

    const usesServerPage = category === initial.category && q === initial.q;

    const query = useInfiniteQuery({
        queryKey: ["public-projects", { category, q }],
        // The browser client is a singleton (@supabase/ssr caches it).
        queryFn: ({ pageParam }) => getProjectsPage(createClient(), { category, q }, pageParam),
        initialPageParam: 0,
        getNextPageParam: (last) => ((last.page + 1) * PROJECTS_PAGE_SIZE < last.total ? last.page + 1 : undefined),
        initialData: usesServerPage ? { pages: [initial.page], pageParams: [0] } : undefined,
        staleTime: 60_000,
    });

    const projects = query.data?.pages.flatMap((p) => p.projects) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;

    // Load the next page when the end of the grid is near.
    const sentinel = useRef<HTMLDivElement>(null);
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
    useEffect(() => {
        const el = sentinel.current;
        if (!el || !hasNextPage) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
            },
            { rootMargin: "600px 0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const chips = [{ name: "", label: "All" }, ...categories.map((c) => ({ name: c.name, label: c.name }))];
    const activeTagline = categories.find((c) => c.name === category)?.tagline;
    const filtered = !!category || !!q;

    return (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 mb-4">
                <div
                    role="toolbar"
                    aria-label="Filter by category"
                    className="flex gap-2 overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0 pb-1 lg:flex-wrap [scrollbar-width:none]"
                >
                    {chips.map((chip) => {
                        const active = chip.name === category;
                        return (
                            <button
                                key={chip.label}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setFilters({ category: chip.name })}
                                className={`shrink-0 whitespace-nowrap px-4 py-2 text-xs tracking-[0.15em] uppercase font-semibold transition-colors ${
                                    active
                                        ? "bg-[#F5C518] text-[#181B34]"
                                        : "border border-slate-200 text-slate-500 hover:border-[#181B34]/40 hover:text-[#181B34] dark:border-white/15 dark:text-white/60 dark:hover:border-[#F5C518]/60 dark:hover:text-[#F5C518]"
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                <label className="relative lg:ml-auto lg:w-80 shrink-0">
                    <span className="sr-only">Search projects</span>
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" size={15} />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name, place or style"
                        className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F0F3FF] border border-transparent focus:border-[#F5C518] focus:outline-none text-[#181B34] placeholder-slate-400 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#181B34] dark:text-white/40 dark:hover:text-white"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </label>
            </div>

            <p className="text-xs text-slate-500 dark:text-white/50 mb-8 min-h-4" aria-live="polite">
                {query.isPending
                    ? "Loading projects…"
                    : `${total} project${total === 1 ? "" : "s"}${category ? ` in ${category}` : ""}${q ? ` matching “${q}”` : ""}`}
                {activeTagline && !query.isPending ? ` · ${activeTagline}` : ""}
            </p>

            {/* Grid */}
            {query.isPending ? (
                <Grid>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </Grid>
            ) : query.isError ? (
                <Empty title="We could not load the projects." body="Please check your connection and try again.">
                    <button type="button" onClick={() => query.refetch()} className={buttonClass}>
                        Try again
                    </button>
                </Empty>
            ) : projects.length === 0 ? (
                <Empty
                    title="No projects match."
                    body={filtered ? "Try another category or a different word." : "New projects are on their way."}
                >
                    {filtered && (
                        <button
                            type="button"
                            onClick={() => {
                                clearTimeout(typingTimer.current);
                                setSearch("");
                                setFilters({ category: "", q: "" });
                            }}
                            className={buttonClass}
                        >
                            Show all projects
                        </button>
                    )}
                </Empty>
            ) : (
                <>
                    <Grid>
                        {projects.map((p, i) => (
                            <ProjectCard key={p.id} project={p} priority={i < 3} />
                        ))}
                        {isFetchingNextPage &&
                            Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={`more-${i}`} />)}
                    </Grid>

                    <div ref={sentinel} className="mt-12 flex flex-col items-center gap-3">
                        {hasNextPage ? (
                            <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className={buttonClass}>
                                {isFetchingNextPage ? "Loading…" : "Load more projects"}
                            </button>
                        ) : (
                            <p className="text-xs tracking-[0.2em] uppercase text-slate-400 dark:text-white/30">
                                You have seen all {total} project{total === 1 ? "" : "s"}
                            </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-white/30">
                            Showing {projects.length} of {total}
                        </p>
                    </div>
                </>
            )}

            {/* Call to action */}
            <div className="mt-20 p-8 sm:p-12 text-center bg-[#F0F3FF] dark:bg-[#0f1124]">
                <h2 className="font-bold text-2xl sm:text-3xl mb-3 text-[#181B34] dark:text-white">Your transformation starts here</h2>
                <p className="text-sm font-light mb-8 max-w-lg mx-auto text-slate-500 dark:text-white/60">
                    Tell us about your space and we will come back with ideas and a free quote.
                </p>
                <Link href="/#contact" className="inline-flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800] transition-colors">
                    Get a free quote
                    <FiArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
}

const buttonClass =
    "inline-flex items-center gap-2 px-7 py-3.5 text-xs tracking-[0.18em] uppercase font-bold border-2 border-[#181B34] text-[#181B34] hover:bg-[#181B34] hover:text-white transition-colors disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#181B34]";

function Grid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">{children}</div>;
}

function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
    return (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-white/10">
            <p className="font-semibold text-lg text-[#181B34] dark:text-white">{title}</p>
            <p className="text-sm mt-2 mb-6 text-slate-500 dark:text-white/50">{body}</p>
            {children}
        </div>
    );
}
