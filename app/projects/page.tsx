import React from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProjectsHubClient from "./ProjectsHubClient";
import { getActiveProjectsServer } from "@/services/projects-server-service";
import { PROJECTS_QUERY_KEY } from "@/services/projects-service";

export const metadata: Metadata = {
    title: "Project Portfolio | Before & After Transformations",
    description:
        "Browse stunning before and after interior transformations from Yuri Perfections — ceiling systems, custom cabinetry, wall partitioning, renovations, and more in Kampala, Uganda.",
    alternates: { canonical: "https://yuriperfections.com/projects" },
    openGraph: {
        url: "https://yuriperfections.com/projects",
        title: "Project Portfolio | Before & After | Yuri Perfections",
        description:
            "Browse stunning before and after interior transformations from Yuri Perfections — ceiling systems, custom cabinetry, renovations, and more.",
    },
};

export default async function ProjectsPage() {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: PROJECTS_QUERY_KEY,
        queryFn: getActiveProjectsServer,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Navbar />
            <main className="min-h-dvh">
                <ProjectsHubClient />
            </main>
            <Footer />
            <ScrollToTop />
        </HydrationBoundary>
    );
}
