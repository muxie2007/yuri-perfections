import type { Metadata } from "next";
import { createPublicClient } from "@/utils/supabase/public";
import { getCategories, getProjectsPage } from "@/services/content";
import { SITE_URL } from "@/lib/site";
import ProjectsBrowser from "./ProjectsBrowser";

export const metadata: Metadata = {
    title: "Project Portfolio | Before & After Transformations",
    description:
        "Browse before and after interior transformations from Yuri Perfections — ceiling systems, custom cabinetry, wall partitioning, renovations, and more in Kampala, Uganda.",
    alternates: { canonical: `${SITE_URL}/projects` },
    openGraph: {
        url: `${SITE_URL}/projects`,
        title: "Project Portfolio | Before & After | Yuri Perfections",
        description:
            "Browse before and after interior transformations from Yuri Perfections — ceiling systems, custom cabinetry, renovations, and more.",
    },
};

type PageProps = { searchParams: Promise<{ category?: string; q?: string }> };

/**
 * The portfolio. The first page is rendered on the server for the filters in the URL (so
 * a shared link and search engines see real projects); "Load more" and later filter
 * changes run in the browser (ProjectsBrowser).
 */
export default async function ProjectsPage({ searchParams }: PageProps) {
    const { category = "", q = "" } = await searchParams;
    const sb = createPublicClient();
    const [categories, firstPage] = await Promise.all([getCategories(sb), getProjectsPage(sb, { category, q })]);

    return (
        <main className="min-h-dvh bg-white dark:bg-[#181B34]">
            <header className="pt-32 pb-10 lg:pt-36 bg-[#F0F3FF] dark:bg-[#0f1124]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-10 bg-[#F5C518]" />
                        <span className="text-xs tracking-[0.3em] uppercase font-semibold text-[#181B34]/60 dark:text-[#F5C518]">Portfolio</span>
                    </div>
                    <h1 className="font-bold text-4xl lg:text-5xl text-[#181B34] dark:text-white">Our Projects</h1>
                    <p className="mt-3 text-sm font-light max-w-xl leading-relaxed text-slate-500 dark:text-white/60">
                        Homes, offices and renovations we have finished across Kampala. Open a project to see every before and after.
                    </p>
                </div>
            </header>

            <ProjectsBrowser categories={categories} initial={{ category, q, page: firstPage }} />
        </main>
    );
}
