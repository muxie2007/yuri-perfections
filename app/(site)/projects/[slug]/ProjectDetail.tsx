"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiChevronLeft, FiChevronRight, FiMaximize2, FiX, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { BeforeAfter } from "@/components/BeforeAfter";
import { ProjectCard } from "@/components/ProjectCard";
import { whatsappLink } from "@/lib/site";
import type { ProjectCard as Card, ProjectImage, ProjectWithImages } from "@/lib/types";

type Props = { project: ProjectWithImages; related: Card[]; whatsapp: string };

export default function ProjectDetail({ project, related, whatsapp }: Props) {
    // Every before/after to show: the cover pair first when it is not one of the project's
    // own pairs (older projects kept the cover separately), then the pairs in order.
    const own = project.project_images;
    const coverIsOwn = own.some((p) => p.before === project.cover_before && p.after === project.cover_after);
    const pairs: Pick<ProjectImage, "id" | "before" | "after" | "label">[] = [
        ...(project.cover_before && project.cover_after && !coverIsOwn
            ? [{ id: 0, before: project.cover_before, after: project.cover_after, label: "" }]
            : []),
        ...own,
    ];
    const [open, setOpen] = useState<number | null>(null);
    const year = project.completed_on ? new Date(project.completed_on).getFullYear() : null;

    const facts = [
        { label: "Category", value: project.category },
        { label: "Style", value: project.style },
        { label: "Location", value: project.location },
        { label: "Completed", value: year ? String(year) : "" },
        { label: "Before & afters", value: String(pairs.length) },
    ].filter((f) => f.value);

    return (
        <div className="bg-white dark:bg-[#181B34]">
            {open !== null && <Lightbox pairs={pairs} index={open} onChange={setOpen} onClose={() => setOpen(null)} title={project.title} />}

            {/* Hero */}
            <section className="relative h-[50vh] min-h-80 overflow-hidden flex items-end">
                <Image src={project.cover_after} alt={`${project.title}, after`} fill priority sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-12 w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-4 text-xs font-semibold tracking-widest uppercase">
                            <Link href="/projects" className="text-white/60 hover:text-[#F5C518] transition-colors flex items-center gap-1">
                                <FiArrowLeft size={12} /> Portfolio
                            </Link>
                            <span className="text-white/30">/</span>
                            <Link href={`/projects?category=${encodeURIComponent(project.category)}`} className="text-[#F5C518] hover:underline">
                                {project.category}
                            </Link>
                        </nav>
                        <h1 className="text-white font-bold text-4xl md:text-6xl leading-tight">{project.title}</h1>
                        <p className="text-white/70 text-sm mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {project.location && (
                                <span className="flex items-center gap-1.5">
                                    <FiMapPin size={13} /> {project.location}
                                </span>
                            )}
                            {project.style && <span>{project.style}</span>}
                            {year && <span>{year}</span>}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Overview */}
            <section className="py-14 border-b border-slate-100 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <SectionLabel>Project overview</SectionLabel>
                        <div className="space-y-4">
                            {(project.description || "").split(/\n\s*\n/).filter(Boolean).map((p, i) => (
                                <p key={i} className="text-base leading-relaxed font-light text-slate-600 dark:text-white/70">
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>
                    <dl className="p-6 bg-[#F0F3FF] dark:bg-[#0f1124] self-start">
                        {facts.map(({ label, value }) => (
                            <div key={label} className="flex justify-between gap-4 text-sm py-3 border-b last:border-0 border-slate-200 dark:border-white/10">
                                <dt className="text-slate-500 dark:text-white/40">{label}</dt>
                                <dd className="font-semibold text-right text-[#181B34] dark:text-white">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Before & afters */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <SectionLabel>Before &amp; after</SectionLabel>
                    <h2 className="font-bold text-3xl mb-2 text-[#181B34] dark:text-white">The transformation</h2>
                    <p className="text-sm font-light mb-10 text-slate-500 dark:text-white/55">
                        Drag the handle, or tap anywhere on a photo, to compare. Open full screen for detail.
                    </p>

                    {/* All the same size, two per row on a laptop, each fitting the screen; Full screen for detail. */}
                    <div className={pairs.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10" : "max-w-3xl"}>
                        {pairs.map((pair, i) => (
                            <motion.figure
                                key={pair.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                            >
                                <div className="relative group">
                                    <BeforeAfter
                                        before={pair.before}
                                        after={pair.after}
                                        alt={pair.label || project.title}
                                        priority={i === 0}
                                        sizes="(max-width: 768px) 100vw, 640px"
                                        className="aspect-[4/3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setOpen(i)}
                                        className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 bg-black/60 text-white text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm hover:bg-[#F5C518] hover:text-[#181B34] transition-colors"
                                    >
                                        <FiMaximize2 size={12} /> Full screen
                                    </button>
                                </div>
                                {pair.label && (
                                    <figcaption className="mt-3 flex items-center gap-3 text-xs tracking-[0.25em] uppercase font-semibold text-slate-500 dark:text-white/50">
                                        <span className="h-px w-5 bg-[#F5C518]" />
                                        {pair.label}
                                    </figcaption>
                                )}
                            </motion.figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to action */}
            <section className="py-16 bg-[#F0F3FF] dark:bg-[#0f1124]">
                <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
                    <h2 className="font-bold text-2xl lg:text-3xl mb-3 text-[#181B34] dark:text-white">Want a result like this?</h2>
                    <p className="text-sm leading-relaxed font-light mb-8 text-slate-500 dark:text-white/60">
                        Tell us about your space and we will come back with ideas and a free quote.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-3 px-7 py-3.5 text-xs tracking-[0.15em] uppercase font-bold bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800] transition-colors"
                        >
                            Get a free quote <FiArrowRight size={14} />
                        </Link>
                        {whatsapp && (
                            <a
                                href={whatsappLink(whatsapp, `Hello! I saw the "${project.title}" project on your website and would like something similar.`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-7 py-3.5 text-xs tracking-[0.15em] uppercase font-bold border transition-colors border-[#181B34]/20 text-[#181B34] hover:border-[#181B34] dark:border-white/20 dark:text-white dark:hover:border-[#F5C518] dark:hover:text-[#F5C518]"
                            >
                                <FaWhatsapp size={15} /> Ask on WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex items-end justify-between gap-4 mb-8">
                            <div>
                                <SectionLabel>More projects</SectionLabel>
                                <h2 className="font-bold text-2xl text-[#181B34] dark:text-white">You might also like</h2>
                            </div>
                            <Link href="/projects" className="text-xs tracking-[0.15em] uppercase font-semibold text-slate-500 hover:text-[#181B34] dark:text-white/50 dark:hover:text-[#F5C518] flex items-center gap-2">
                                All projects <FiArrowRight />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                            {related.map((p) => (
                                <ProjectCard key={p.id} project={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#F5C518]" />
            <span className="text-xs tracking-[0.3em] uppercase font-semibold text-[#181B34]/50 dark:text-[#F5C518]">{children}</span>
        </div>
    );
}

/** Full-screen viewer: Esc closes, ← → move between pairs, the slider works inside. */
function Lightbox({
    pairs,
    index,
    onChange,
    onClose,
    title,
}: {
    pairs: Pick<ProjectImage, "id" | "before" | "after" | "label">[];
    index: number;
    onChange: (i: number) => void;
    onClose: () => void;
    title: string;
}) {
    const go = useCallback((delta: number) => onChange((index + delta + pairs.length) % pairs.length), [index, onChange, pairs.length]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            // Arrow keys on the slider handle move the slider, not the pair.
            if ((e.target as HTMLElement)?.getAttribute("role") === "slider") return;
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        document.addEventListener("keydown", onKey);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
        };
    }, [go, onClose]);

    const pair = pairs[index];

    return (
        <AnimatePresence>
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${title}: ${pair.label || `before and after ${index + 1}`}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
                onClick={onClose}
            >
                <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs tracking-widest uppercase text-white/60 truncate">
                        {pair.label || title} · {index + 1} / {pairs.length}
                    </p>
                    <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                        <FiX size={18} />
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center px-2 sm:px-16 pb-6 relative" onClick={(e) => e.stopPropagation()}>
                    <BeforeAfter
                        key={pair.id}
                        before={pair.before}
                        after={pair.after}
                        alt={pair.label || title}
                        sizes="100vw"
                        className="w-full max-w-6xl aspect-[4/3] md:aspect-[16/10] max-h-[80vh]"
                    />
                    {pairs.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => go(-1)}
                                aria-label="Previous"
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25"
                            >
                                <FiChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => go(1)}
                                aria-label="Next"
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
