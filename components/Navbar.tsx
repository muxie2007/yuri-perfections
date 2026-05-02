"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import Image from "next/image";

import { usePathname } from "next/navigation";

const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

    const pathname = usePathname();

    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ─── Track active section via IntersectionObserver ───
    useEffect(() => {
        const sectionIds = navLinks.map((l) => l.href.replace("#", ""));

        const observers: IntersectionObserver[] = [];

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(id);
                },
                {
                    rootMargin: "-40% 0px -55% 0px", // fires when section is roughly centred
                    threshold: 0,
                }
            );

            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach((obs) => obs.disconnect());
    }, []);

    // ─── Determine if we are on the homepage ───
    const isHomePage = pathname === "/" || pathname === "/#home";
    const isProjectPage = pathname === "/projects" || pathname.startsWith("/projects/");

    return (
        <>
            {/* ─── Navbar
              The nav sits on top of the two-tone hero background.
              Left half is transparent (shows white hero bg).
              Right half is transparent (shows grey hero bg strip).
              So the nav itself is just fully transparent.
              On desktop scroll: glassmorphism kicks in so text stays readable.
          ─── */}
            <nav
                className={`fixed overflow-hidden top-0 left-0 right-0 z-50 transition-all duration-300
                    ${scrolled || menuOpen
                        ? "backdrop-blur-md bg-white/70 dark:bg-[#181B34]/70 shadow-sm pt-3 md:pt-0"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-[72px]">

                    {/* Logo — sits on the white left side */}
                    <a href="#home" className="flex items-center">
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

                    {/* Desktop links — sit on the grey right side */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const id = link.href.replace("#", "");
                            const isActive = isProjectPage
                                ? link.href === "#projects"  // highlight "Projects" on project detail pages
                                : activeSection === id;

                            // ─── Fix links to scroll to homepage sections if not on homepage ───
                            const href = isHomePage ? link.href : `/${link.href}`;

                            return (
                                <a
                                    key={link.label}
                                    href={href}
                                    className={`text-[11px] font-semibold tracking-[0.18em] uppercase font-['Poppins'] transition-colors duration-200 relative group
                                        ${isActive
                                            ? "text-[#181B34] dark:text-[#F5C518]"
                                            : "text-[#181B34]/55 hover:text-[#181B34] dark:text-white/55 dark:hover:text-[#F5C518]"
                                        }`}
                                >
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-[2px] transition-all duration-300 bg-[#181B34] dark:bg-[#F5C518]
                                            ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                                    />
                                </a>
                            );
                        })}

                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            aria-label="Toggle theme"
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors border border-[#181B34]/20 text-[#181B34] hover:bg-[#181B34]/8 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                        >
                            {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
                        </button>
                    </div>

                    {/* Mobile controls */}
                    <div className="flex md:hidden items-center gap-3">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            aria-label="Toggle theme"
                            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#181B34]/20 text-[#181B34] dark:border-white/15 dark:text-white"
                        >
                            {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
                        </button>

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-[#181B34] dark:text-white"
                        >
                            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Mobile full-screen menu ─── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.28 }}
                        className="fixed inset-0 z-40 pt-[72px] bg-white dark:bg-[#181B34]"
                    >
                        {/* Logo */}
                        {/* Intentionally removed to prevent flicker & layout jump */}

                        <div className="flex flex-col items-center px-6 pt-6">
                            {navLinks.map((link, i) => {
                                const id = link.href.replace("#", "");
                                const isActive = isProjectPage
                                    ? link.href === "#projects"
                                    : activeSection === id;

                                // ─── Fix links for mobile too ───
                                const href = isHomePage ? link.href : `/${link.href}`;

                                return (
                                    <motion.a
                                        key={link.label}
                                        href={href}
                                        initial={{ opacity: 0, x: 18 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.055 }}
                                        onClick={() => setMenuOpen(false)}
                                        className={`w-full text-center text-2xl font-bold font-['Poppins'] py-4 border-b transition-colors border-[#181B34]/10 dark:border-white/10
                                            ${isActive
                                                ? "text-[#F5C518]"
                                                : "text-[#181B34] hover:text-[#181B34]/50 dark:text-white dark:hover:text-[#F5C518]"
                                            }`}
                                    >
                                        {link.label}
                                    </motion.a>
                                );
                            })}

                            <motion.a
                                href="#contact"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.32 }}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center w-full py-4 mt-6 bg-[#F5C518] text-[#181B34] font-bold font-['Poppins'] text-sm tracking-[0.15em] uppercase"
                            >
                                Get a Free Quote
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}