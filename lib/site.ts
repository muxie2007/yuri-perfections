import type { SiteSettings } from "./types";

/**
 * The site's one official address (canonical tags, sitemap, social previews, structured data).
 * Both yuriperfections.com and www work; Vercel redirects the bare domain to www, so www is
 * the address search engines should index.
 */
export const SITE_URL = "https://www.yuriperfections.com";
export const SITE_NAME = "Yuri Perfections";

/** Shown if the settings row cannot be read (the values the site had when hard coded). */
export const DEFAULT_SETTINGS: SiteSettings = {
    id: 1,
    business_name: SITE_NAME,
    phone: "+256394837953",
    whatsapp: "256394837953",
    email: "hello@yuriperfections.ug",
    address: "Bukenya Mall RM16, Plot 2 Kimera Road",
    area: "Ntinda, Kampala",
    maps_url:
        "https://www.google.com/maps/search/?api=1&query=Bukenya%20Mall%2C%20Ntinda%2C%20Plot%202%20Kimera%20Road%2C%20Kampala%2C%20Uganda",
    opening_hours: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    linkedin_url: "",
    x_url: "",
    youtube_url: "",
    hero_text:
        "At Yuri Perfections, we deliver high-quality interior and exterior finishing solutions for both residential and commercial spaces. With a strong focus on precision, craftsmanship, and detail, we transform environments into refined, functional spaces built to last.",
    about_title: "Where Craftsmanship",
    about_title_accent: "Meets Distinction",
    about_body:
        "At Yuri Perfections, we create refined interior and exterior spaces defined by precision, elegance, and enduring quality.\n\nEvery detail is carefully considered. Every finish is flawlessly executed.",
    about_highlights: [],
    about_stats: [],
    about_years: "10+",
    about_image_main: "/yuri/about/untitled-20.jpg",
    about_image_accent: "/yuri/about/untitled.jpg",
    updated_at: "",
};

/** wa.me link with an optional prefilled message. */
export function whatsappLink(number: string, text?: string): string {
    const digits = number.replace(/\D/g, "");
    return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
