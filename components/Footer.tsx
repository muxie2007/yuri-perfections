"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";

const footerLinks = {
    // Only sections/links we actually have on the site so far
    "Quick Links": ["Home", "About", "Services", "Projects", "Contact"],
    // Help: ["Help Center", "Documentation", "Support"],
};

const socials = [
    { icon: FiInstagram, href: "#", label: "Instagram" },
    { icon: FiFacebook, href: "#", label: "Facebook" },
    { icon: FiTwitter, href: "#", label: "Twitter" },
    { icon: FiLinkedin, href: "#", label: "LinkedIn" },
    { icon: FiYoutube, href: "#", label: "YouTube" },
];

export default function Footer() {
    return (
        <footer className="bg-neutral-100 dark:bg-[#181B34] text-[#181B34] dark:text-white">
            {/* Top section */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    {/* Brand */}
                    <div className="flex-shrink-0">
                        {/* Logo */}
                        <a href="#home" className="flex items-center justify-center lg:justify-start mb-4">
                            {/* Light mode logo */}
                            <Image
                                src="/logos/yuri-white-bg-removebg.png"
                                alt="Yuri Perfections"
                                width={224}
                                height={224}
                                className="h-20 w-20 object-contain dark:hidden"
                                priority
                                quality={100}
                            />
                            {/* Dark mode logo */}
                            <Image
                                src="/logos/yuri-dark-logo-removebg.png"
                                alt="Yuri Perfections"
                                width={224}
                                height={224}
                                className="h-20 w-20 object-contain hidden dark:block"
                                priority
                                quality={100}
                            />
                        </a>

                        {/* Socials */}
                        <div className="flex gap-3 justify-center lg:justify-start">
                            {socials.map((s) => (
                                <motion.a
                                    key={s.label}
                                    href={s.href}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    aria-label={s.label}
                                    className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-white/10 text-neutral-500 dark:text-white/40 transition-colors hover:border-[#F5C518] hover:text-[#F5C518] dark:hover:border-[#F5C518] dark:hover:text-[#F5C518]"
                                >
                                    <s.icon size={14} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-center md:justify-end flex-wrap gap-10">
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div key={heading}>
                                <h4 className="text-xs tracking-[0.25em] uppercase font-medium mb-4 text-neutral-700 dark:text-white/80 text-center md:text-left">
                                    {heading}
                                </h4>
                                {/* Horizontal on lg, vertical on smaller screens */}
                                <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-8 space-y-2 lg:space-y-0 text-center md:text-left">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href={`#${link.toLowerCase()}`}
                                                className="text-sm font-light text-neutral-500 dark:text-white/40 hover:text-[#F5C518] dark:hover:text-[#F5C518] transition-colors"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 pt-6 border-t border-neutral-300 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <p className="text-xs text-neutral-500 dark:text-white/25">
                        © {new Date().getFullYear()} Yuri Perfections. All rights reserved. Kampala, Uganda.
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-white/20">
                        Precision Craftsmanship.
                    </p>
                </div>
            </div>
        </footer >
    );
}