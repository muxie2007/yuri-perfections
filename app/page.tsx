import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getActiveHeroSlidesServer } from "@/services/hero-slides-server-service";
import { HERO_SLIDES_QUERY_KEY } from "@/services/hero-slides-service";
import { getActiveServicesServer } from "@/services/services-server-service";
import { SERVICES_QUERY_KEY } from "@/services/services-service";
import { getActiveProjectsServer } from "@/services/projects-server-service";
import { PROJECTS_QUERY_KEY } from "@/services/projects-service";

export default async function Home() {
  // ── Prefetch all dynamic sections on the server ───────────────────────────
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HERO_SLIDES_QUERY_KEY,
      queryFn: getActiveHeroSlidesServer,
    }),
    queryClient.prefetchQuery({
      queryKey: SERVICES_QUERY_KEY,
      queryFn: getActiveServicesServer,
    }),
    queryClient.prefetchQuery({
      queryKey: PROJECTS_QUERY_KEY,
      queryFn: getActiveProjectsServer,
    }),
  ]);

  return (
    // ── Dehydrate cache and pass it to the client ─────────────────────────────
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="relative min-h-dvh">
        <Navbar />
        <Hero />
        {/* <Features /> */}
        <About />
        <Services />
        <Projects />
        {/* <Testimonials /> */}
        {/* <DiscountBanner /> */}
        <Contact />
        <Footer />
        <ScrollToTop />
      </main>
    </HydrationBoundary>
  );
}
