import type { MetadataRoute } from "next";
import { createPublicClient } from "@/utils/supabase/public";
import { getActiveProjectSlugs } from "@/services/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    ];

    try {
        const projects = await getActiveProjectSlugs(createPublicClient());
        return [
            ...staticRoutes,
            ...projects.map((p) => ({
                url: `${SITE_URL}/projects/${p.slug}`,
                lastModified: new Date(p.updated_at),
                changeFrequency: "monthly" as const,
                priority: 0.8,
            })),
        ];
    } catch {
        return staticRoutes;
    }
}
