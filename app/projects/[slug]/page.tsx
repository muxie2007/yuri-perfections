import React from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProjectDetailClient from "./ProjectDetailClient";
import { getActiveProjectsServer } from "@/services/projects-server-service";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const allProjects = await getActiveProjectsServer();
    const project = allProjects.find((p) => p.slug === slug);
    if (!project) return {};
    return {
        title: `${project.title} | Before & After | Yuri Perfections`,
        description: project.description,
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const { slug } = await params;

    // Single DB call — filter for the project and its siblings
    const allProjects = await getActiveProjectsServer();
    const project = allProjects.find((p) => p.slug === slug);

    if (!project) notFound();

    const siblings = allProjects.filter((p) => p.slug !== slug).slice(0, 3);

    return (
        <>
            <Navbar />
            <main className="min-h-dvh">
                <ProjectDetailClient project={project} siblings={siblings} />
            </main>
            <Footer />
            <ScrollToTop />
        </>
    );
}
