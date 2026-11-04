import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";
import type { SiteSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/site";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/#contact" },
];

const iconClass =
    "w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-white/10 text-neutral-500 dark:text-white/40 transition-all duration-200";

/**
 * The footer in the design the client chose: logo and social icons on the left, Quick Links
 * on the right, the copyright bar below. Social links come from Dashboard → Site settings;
 * an icon without a link still shows (the look stays the same) but is not clickable.
 */
export default function Footer({ settings }: { settings: SiteSettings }) {
    const socials: { icon: IconType; href: string; label: string; always: boolean }[] = [
        { icon: FiInstagram, href: settings.instagram_url, label: "Instagram", always: true },
        { icon: FiFacebook, href: settings.facebook_url, label: "Facebook", always: true },
        { icon: FiTwitter, href: settings.x_url, label: "X (Twitter)", always: true },
        { icon: FiLinkedin, href: settings.linkedin_url, label: "LinkedIn", always: true },
        { icon: FiYoutube, href: settings.youtube_url, label: "YouTube", always: true },
        { icon: FaTiktok, href: settings.tiktok_url, label: "TikTok", always: false },
        { icon: FaWhatsapp, href: settings.whatsapp ? whatsappLink(settings.whatsapp) : "", label: "WhatsApp", always: false },
    ].filter((s) => s.always || s.href);

    return (
        <footer className="bg-neutral-100 dark:bg-[#181B34] text-[#181B34] dark:text-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    {/* Brand */}
                    <div className="shrink-0">
                        <Link href="/" className="flex items-center justify-center lg:justify-start mb-4" aria-label={`${settings.business_name} home`}>
                            <Image src="/logos/yuri-white-bg-removebg.png" alt={settings.business_name} width={224} height={224} className="h-20 w-20 object-contain dark:hidden" quality={100} />
                            <Image src="/logos/yuri-dark-logo-removebg.png" alt={settings.business_name} width={224} height={224} className="h-20 w-20 object-contain hidden dark:block" quality={100} />
                        </Link>

                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                            {socials.map((s) =>
                                s.href ? (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className={`${iconClass} hover:-translate-y-0.5 hover:scale-110 hover:border-[#F5C518] hover:text-[#F5C518] dark:hover:border-[#F5C518] dark:hover:text-[#F5C518]`}
                                    >
                                        <s.icon size={14} />
                                    </a>
                                ) : (
                                    <span key={s.label} className={iconClass} title={s.label} aria-hidden>
                                        <s.icon size={14} />
                                    </span>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-center md:justify-end flex-wrap gap-10">
                        <div>
                            <h4 className="text-xs tracking-[0.25em] uppercase font-medium mb-4 text-neutral-700 dark:text-white/80 text-center md:text-left">Quick Links</h4>
                            {/* Horizontal on large screens, stacked on smaller ones */}
                            <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-8 space-y-2 lg:space-y-0 text-center md:text-left">
                                {quickLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm font-light text-neutral-500 dark:text-white/40 hover:text-[#F5C518] dark:hover:text-[#F5C518] transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-6 border-t border-neutral-300 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <p className="text-xs text-neutral-500 dark:text-white/25">
                        © {new Date().getFullYear()} {settings.business_name}. All rights reserved. Kampala, Uganda.
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-white/20">Precision Craftsmanship.</p>
                </div>
            </div>
        </footer>
    );
}
