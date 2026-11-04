import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import TanstackProvider from "@/providers/TanstackProvider";
import NextTopLoader from "nextjs-toploader";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
});

const OG_IMAGE = "/logos/yuri-white-bg.jpg";
const DESCRIPTION =
    "Yuri Perfections delivers high-quality interior and exterior finishing solutions — ceiling systems, custom cabinetry, wall partitioning, and painting — for residential and commercial spaces in Kampala, Uganda.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${SITE_NAME} | Precision Craftsmanship. Exceptional Finishes.`,
        template: `%s | ${SITE_NAME}`,
    },
    description: DESCRIPTION,
    keywords: [
        "Yuri Perfections",
        "Yuri",
        "Perfections",
        "yuriperfections",
        "interior design Kampala",
        "interior finishing Uganda",
        "ceiling installation Kampala",
        "custom cabinetry Uganda",
        "wall partitioning Kampala",
        "interior painting Uganda",
        "exterior painting Kampala",
        "residential renovation Uganda",
        "commercial renovation Kampala",
        "before and after interior design",
        "Ntinda interior design",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_UG",
        url: SITE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} | Precision Craftsmanship. Exceptional Finishes.`,
        description:
            "High-quality interior and exterior finishing solutions — ceiling systems, custom cabinetry, wall partitioning, and painting — in Kampala, Uganda.",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — Interior Design & Finishing, Kampala` }],
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE_NAME} | Precision Craftsmanship`,
        description: "High-quality interior & exterior finishing solutions in Kampala, Uganda.",
        images: [OG_IMAGE],
    },
    alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#181b34" },
    ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // The init script sets the theme class on <html> before React hydrates.
        // data-scroll-behavior: smooth scrolling (globals.css) for in-page links like #services,
        // but page-to-page navigation jumps straight to the top (Next 16 opt-in).
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body className={`${poppins.variable} antialiased`}>
                {/* A thin gold bar at the top while a page loads. */}
                <NextTopLoader color="#F5C518" height={3} showSpinner={false} shadow="0 0 8px #F5C518" />
                <TanstackProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </TanstackProvider>
            </body>
        </html>
    );
}
