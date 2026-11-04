"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowUpRight, FiMapPin } from "react-icons/fi";
import { BeforeAfter } from "@/components/BeforeAfter";
import type { ProjectCard as Card } from "@/lib/types";

/**
 * The home page's portfolio, in the layout the client chose: category buttons, a featured
 * box (details on the left, a sliding before/after on the right) and a row of sliding
 * thumbnails below. Picking a thumbnail shows that project in the featured box; its page
 * has every before/after, and /projects lists them all.
 */
export default function Projects({ projects }: { projects: Card[] }) {
    const [category, setCategory] = useState("All");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const featuredBox = useRef<HTMLDivElement>(null);

    if (projects.length === 0) return null;

    const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
    const filtered = category === "All" ? projects : projects.filter((p) => p.category === category);
    const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0];

    const select = (id: number) => {
        setSelectedId(id);
        // On a phone the featured box is above the thumbnails: bring it into view.
        if (window.innerWidth < 1024) featuredBox.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section id="projects" className="py-24 lg:py-36 bg-white dark:bg-[#181B34]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Header and category buttons */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-10 bg-[#F5C518]" />
                            <span className="text-xs tracking-[0.3em] uppercase font-semibold text-[#181B34]/60 dark:text-[#F5C518]">Portfolio</span>
                        </div>
                        <h2 className="font-bold text-4xl lg:text-5xl text-[#181B34] dark:text-white">Our Latest Projects</h2>
                    </motion.div>

                    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter projects by category">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                aria-pressed={category === cat}
                                onClick={() => {
                                    setCategory(cat);
                                    setSelectedId(null);
                                }}
                                className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-semibold transition-colors ${
                                    category === cat
                                        ? "bg-[#F5C518] text-[#181B34]"
                                        : "border border-slate-200 text-slate-500 hover:border-[#181B34]/40 hover:text-[#181B34] dark:border-white/20 dark:text-white/50 dark:hover:border-[#F5C518]/50 dark:hover:text-[#F5C518]"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured box */}
                <div ref={featuredBox} className="scroll-mt-24">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-1 lg:grid-cols-2 mb-10 overflow-hidden"
                            data-testid="featured-project"
                        >
                            <div className="flex flex-col justify-center p-8 lg:p-12 bg-[#F0F3FF] dark:bg-[#0f1124] order-2 lg:order-1">
                                {selected.style && (
                                    <span className="text-xs tracking-[0.25em] uppercase font-semibold mb-3 flex items-center gap-3 text-[#181B34]/60 dark:text-[#F5C518]">
                                        {selected.style}
                                        <span className="inline-block w-8 h-px bg-[#F5C518]" />
                                    </span>
                                )}
                                <h3 className="font-bold text-3xl mb-2 text-[#181B34] dark:text-white">{selected.title}</h3>
                                {selected.location && (
                                    <p className="text-xs tracking-widest uppercase mb-6 flex items-center gap-1.5 text-slate-400 dark:text-white/40">
                                        <FiMapPin size={12} /> {selected.location}
                                    </p>
                                )}
                                {selected.description && (
                                    <p className="text-sm leading-relaxed font-light mb-8 line-clamp-4 text-slate-500 dark:text-white/60">{selected.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={`/projects/${selected.slug}`}
                                        className="inline-flex items-center gap-3 px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800] transition-colors"
                                    >
                                        View Before &amp; Afters
                                        <FiArrowRight size={14} />
                                    </Link>
                                    <Link
                                        href="/projects"
                                        className="inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.15em] uppercase font-bold border transition-colors border-[#181B34]/20 text-[#181B34]/70 hover:border-[#181B34] hover:text-[#181B34] dark:border-white/20 dark:text-white/70 dark:hover:border-[#F5C518] dark:hover:text-[#F5C518]"
                                    >
                                        All Projects
                                        <FiArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>
                            <BeforeAfter
                                before={selected.cover_before}
                                after={selected.cover_after}
                                alt={selected.title}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="aspect-[4/3] lg:aspect-auto lg:min-h-[460px] order-1 lg:order-2"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Thumbnails: each slides, and a tap shows it in the featured box */}
                {filtered.length > 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filtered.map((p) => {
                            const isSelected = p.id === selected.id;
                            return (
                                <div
                                    key={p.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isSelected}
                                    aria-label={`Show ${p.title}`}
                                    onClick={() => select(p.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            select(p.id);
                                        }
                                    }}
                                    className={`group relative cursor-pointer overflow-hidden outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-[#F5C518]/60 ${
                                        isSelected ? "ring-[3px] ring-[#F5C518]" : ""
                                    }`}
                                    data-testid="project-thumb"
                                >
                                    <BeforeAfter before={p.cover_before} after={p.cover_after} alt={p.title} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="h-52" compact />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                                    <div className="absolute bottom-0 inset-x-0 p-4 pointer-events-none">
                                        {p.style && <p className="text-[#F5C518] text-[9px] tracking-widest uppercase mb-1 font-semibold">{p.style}</p>}
                                        <p className="text-white text-sm font-semibold leading-tight">{p.title}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.15em] uppercase transition-colors text-slate-400 hover:text-[#181B34] dark:text-white/50 dark:hover:text-[#F5C518]"
                    >
                        Browse All Projects
                        <FiArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
