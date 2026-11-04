import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/utils/supabase/public";
import { getActiveProjectSlugs, getProjectBySlug, getRelatedProjects } from "@/services/content";
import { loadSettings } from "@/services/site-data";
import { SITE_URL } from "@/lib/site";
import ProjectDetail from "./ProjectDetail";

type PageProps = { params: Promise<{ slug: string }> };

/** Static per project, refreshed hourly and on every dashboard save. New slugs render on first visit. */
export const revalidate = 3600;

export async function generateStaticParams() {
    try {
        const slugs = await getActiveProjectSlugs(createPublicClient());
        return slugs.map(({ slug }) => ({ slug }));
    } catch (error) {
        // Build without pre-rendering rather than fail; each page renders on first visit.
        console.error(error);
        return [];
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const project = await getProjectBySlug(createPublicClient(), slug);
    if (!project) return {};
    const description =
        project.description.slice(0, 160) || `${project.title}: a ${project.category.toLowerCase()} transformation by Yuri Perfections.`;
    return {
        title: `${project.title} | Before & After`,
        description,
        alternates: { canonical: `${SITE_URL}/projects/${slug}` },
        openGraph: {
            url: `${SITE_URL}/projects/${slug}`,
            title: `${project.title} | Before & After | Yuri Perfections`,
            description,
            ...(project.cover_after && { images: [{ url: project.cover_after, alt: project.title }] }),
        },
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const { slug } = await params;
    const sb = createPublicClient();
    const project = await getProjectBySlug(sb, slug);
    if (!project) notFound();

    const [related, settings] = await Promise.all([getRelatedProjects(sb, project), loadSettings()]);

    return (
        <main className="min-h-dvh">
            <ProjectDetail project={project} related={related} whatsapp={settings.whatsapp || settings.phone} />
        </main>
    );
}
