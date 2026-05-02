"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiInstagram, FiFacebook, FiTwitter, FiLinkedin, FiYoutube } from "react-icons/fi";

const footerLinks = {
    Agency: ["About Us", "Our Team", "Careers", "Press"],
    Services: ["Residential Finishing", "Commercial Projects", "Renovation", "Interior & Exterior Works"],
    "Quick Links": ["Projects", "Blog", "Contact", "Consultation"],
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
            <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-center lg:text-left">

                    {/* Brand */}
                    <div className="max-w-sm">

                        {/* Logo — sits on the white left side */}
                        <a href="#home" className="flex items-center justify-center lg:justify-start mb-6">
                            {/* Light mode logo */}
                            <Image
                                src="/logos/yuri-white-bg-removebg.png"
                                alt="Yuri Perfections"
                                width={224}
                                height={224}
                                className="h-28 w-28 object-contain dark:hidden"
                                priority
                                quality={100}
                            />
                            {/* Dark mode logo */}
                            <Image
                                src="/logos/yuri-dark-logo-removebg.png"
                                alt="Yuri Perfections"
                                width={224}
                                height={224}
                                className="h-28 w-28 object-contain hidden dark:block"
                                priority
                                quality={100}
                            />
                        </a>

                        <p className="text-sm font-light leading-relaxed mb-6 text-neutral-600 dark:text-white/60">
                            At Yuri Perfections, we specialize in high-quality interior and exterior finishing solutions for residential and commercial spaces across Uganda. We combine precision, craftsmanship, and attention to detail to deliver refined spaces built to last.
                        </p>

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

                    <div className="w-full flex items-center justify-center lg:justify-between flex-wrap gap-3 text-center lg:text-left">
                        {/* Links */}
                        {Object.entries(footerLinks).map(([heading, links]) => (
                            <div key={heading} className="min-w-[160px] mt-3">
                                <h4 className="text-xs tracking-[0.25em] uppercase font-medium mb-6 text-neutral-700 dark:text-white/80">
                                    {heading}
                                </h4>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
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
                <div className="mt-16 pt-8 border-t border-neutral-300 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <p className="text-xs text-neutral-500 dark:text-white/25">
                        © {new Date().getFullYear()} Yuri Perfections. All rights reserved. Kampala, Uganda.
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-white/20">
                        bloodykheeng
                    </p>
                </div>
            </div>
        </footer>
    );
}