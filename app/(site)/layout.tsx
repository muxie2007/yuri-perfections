import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import VisitTracker from "@/components/VisitTracker";
import { loadSettings } from "@/services/site-data";
import { SITE_URL } from "@/lib/site";

/** The public site's frame: navbar, footer and the business's structured data. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const settings = await loadSettings();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "HomeAndConstructionBusiness",
        name: settings.business_name,
        description:
            "High-quality interior and exterior finishing solutions — ceiling systems, custom cabinetry, wall partitioning, and painting — for residential and commercial spaces in Kampala, Uganda.",
        url: SITE_URL,
        logo: `${SITE_URL}/logos/yuri-dark-logo.jpg`,
        image: `${SITE_URL}/logos/yuri-dark-logo.jpg`,
        telephone: settings.phone,
        email: settings.email,
        address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressLocality: settings.area,
            addressCountry: "UG",
        },
        priceRange: "$$",
        areaServed: { "@type": "Country", name: "Uganda" },
        sameAs: [
            settings.facebook_url,
            settings.instagram_url,
            settings.tiktok_url,
            settings.linkedin_url,
            settings.x_url,
            settings.youtube_url,
        ].filter(Boolean),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
            <Navbar />
            {children}
            <Footer settings={settings} />
            <ScrollToTop />
            <VisitTracker />
        </>
    );
}
