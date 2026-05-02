import React from "react";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProjectsHubClient from "./ProjectsHubClient";
import { getActiveProjectsServer } from "@/services/projects-server-service";
import { PROJECTS_QUERY_KEY } from "@/services/projects-service";

export const metadata = {
    title: "Project Portfolio | Before & Afters | Yuri Perfections",
    description:
        "Browse stunning before and after photos from Yuri Perfections projects — ceiling systems, custom cabinetry, renovations, and more.",
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
