import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/providers/ThemeProvider";
import TanstackProvider from "@/providers/TanstackProvider";
import { cookies } from "next/headers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = "https://yuriperfections.com";
const SITE_NAME = "Yuri Perfections";
const OG_IMAGE = "/logos/yuri-white-bg.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Precision Craftsmanship. Exceptional Finishes.`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Yuri Perfections delivers high-quality interior and exterior finishing solutions — ceiling systems, custom cabinetry, wall partitioning, and painting — for residential and commercial spaces in Kampala, Uganda.",
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
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Interior Design & Finishing, Kampala`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Precision Craftsmanship`,
    description:
      "High-quality interior & exterior finishing solutions in Kampala, Uganda.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description:
    "Yuri Perfections delivers high-quality interior and exterior finishing solutions — ceiling systems, custom cabinetry, wall partitioning, and painting — for residential and commercial spaces in Kampala, Uganda.",
  url: SITE_URL,
  logo: `${SITE_URL}/logos/yuri-dark-logo.jpg`,
  image: `${SITE_URL}/logos/yuri-dark-logo.jpg`,
  telephone: "+256394837953",
  email: "hello@yuriperfections.ug",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bukenya Mall RM16, Plot 2 Kimera Road",
    addressLocality: "Ntinda, Kampala",
    addressCountry: "UG",
  },
  priceRange: "$$",
  areaServed: { "@type": "Country", name: "Uganda" },
  sameAs: [],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const getCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("theme");
  };

  const defaultTheme = await getCookie();

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <TanstackProvider>
          <ThemeProvider defaultTheme={defaultTheme?.value}>
            {children}
          </ThemeProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}