import type { Metadata } from "next";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import { createPublicClient } from "@/utils/supabase/public";
import { getFeaturedProjects, getHeroSlides, getServices } from "@/services/content";
import { loadSettings } from "@/services/site-data";
import { SITE_URL } from "@/lib/site";

/**
 * Static and cached; rebuilt at most hourly, and at once when a dashboard save calls
 * revalidateSite(). See docs/architecture.md "Caching".
 */
export const revalidate = 3600;

export const metadata: Metadata = {
    title: "Yuri Perfections | Interior & Exterior Finishing, Kampala Uganda",
    description:
        "Yuri Perfections transforms spaces in Kampala with precision craftsmanship — ceiling installations, custom cabinetry, wall partitioning, interior and exterior painting. Request a free quote today.",
    alternates: { canonical: SITE_URL },
    openGraph: {
        url: SITE_URL,
        title: "Yuri Perfections | Interior & Exterior Finishing, Kampala Uganda",
        description:
            "Transforming residential and commercial spaces across Uganda with precision craftsmanship. Ceiling systems, custom cabinetry, wall partitioning, painting.",
    },
};

export default async function Home() {
    const sb = createPublicClient();
    const [settings, slides, services, projects] = await Promise.all([
        loadSettings(),
        getHeroSlides(sb),
        getServices(sb),
        getFeaturedProjects(sb, 12),
    ]);

    return (
        <main className="relative min-h-dvh">
            <Hero slides={slides} text={settings.hero_text} />
            <About {...settings} />
            <Services services={services} />
            <Projects projects={projects} />
            {/* Testimonials stay off until the client has real ones (as on the old site). */}
            <Contact settings={settings} services={services.map((s) => s.title)} />
        </main>
    );
}
