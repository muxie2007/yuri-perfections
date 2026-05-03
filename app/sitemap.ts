import type { MetadataRoute } from "next";
import { getActiveProjectsServer } from "@/services/projects-server-service";

const BASE = "https://yuriperfections.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ];

    try {
        const projects = await getActiveProjectsServer();
        const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
            url: `${BASE}/projects/${p.slug}`,
            lastModified: p.created_at ? new Date(p.created_at) : new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        }));
        return [...staticRoutes, ...projectRoutes];
    } catch {
        return staticRoutes;
    }
}
