"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiX, FiMaximize2 } from "react-icons/fi";
import { BeforeAfter } from "@/components/helpers/BeforeAfter";
import type { Project, ProjectImage } from "@/services/projects-service";

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
    pair,
    onClose,
}: {
    pair: ProjectImage;
    onClose: () => void;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 bg-black/92 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-5xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                    <BeforeAfter
                        beforeImage={pair.before}
                        afterImage={pair.after}
                        mode="drag"
                        style={{ width: "100%" }}
                        buttonStyle={{ width: 44, height: 44 }}
                    />
                    {pair.label && (
                        <p className="text-white/50 text-xs font-['Poppins'] tracking-widest uppercase mt-3 text-center">
                            {pair.label}
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailClient({
    project,
    siblings,
}: {
    project: Project;
    siblings: Project[];
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [lightboxPair, setLightboxPair] = useState<ProjectImage | null>(null);

    return (
        <div className={isDark ? "bg-[#181B34]" : "bg-white"}>

            {/* Lightbox */}
            {lightboxPair && (
                <Lightbox pair={lightboxPair} onClose={() => setLightboxPair(null)} />
            )}

            {/* ── Hero ── */}
            <section className="relative h-[55vh] min-h-[380px] overflow-hidden flex items-end">
                <img
                    src={project.cover_after}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/10" />
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-14 w-full">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-4">
                            <Link
                                href="/projects"
                                className="text-white/50 text-xs font-['Poppins'] font-semibold tracking-widest uppercase hover:text-[#F5C518] transition-colors flex items-center gap-1"
                            >
                                <FiArrowLeft size={12} /> Portfolio
                            </Link>
                            <span className="text-white/30 text-xs">/</span>
                            <span className="text-[#F5C518] text-xs font-['Poppins'] font-semibold tracking-widest uppercase">
                                {project.category}
                            </span>
                        </div>
                        <p className="text-[#F5C518] text-xs font-semibold tracking-[0.3em] uppercase font-['Poppins'] mb-3">
                            {project.style}
                        </p>
                        <h1 className="text-white font-['Poppins'] font-bold text-4xl md:text-6xl">
                            {project.title}
                        </h1>
                        <p className="text-white/50 font-['Poppins'] text-sm tracking-widest uppercase mt-2">
                            {project.location}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Description + details ── */}
            <section className={`py-14 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-8 bg-[#F5C518]" />
                            <span className={`text-xs tracking-[0.3em] uppercase font-semibold font-['Poppins'] ${isDark ? "text-[#F5C518]" : "text-[#181B34]/50"}`}>
                                Project Overview
                            </span>
                        </div>
                        <p className={`text-base leading-relaxed font-['Poppins'] font-light ${isDark ? "text-white/70" : "text-slate-600"}`}>
                            {project.description}
                        </p>
                    </div>
                    <div className={`p-6 ${isDark ? "bg-[#0f1124]" : "bg-[#F0F3FF]"}`}>
                        <p className={`text-[10px] tracking-widest uppercase font-semibold font-['Poppins'] mb-4 ${isDark ? "text-[#F5C518]" : "text-[#181B34]/50"}`}>
                            Project Details
                        </p>
                        <div className="space-y-3">
                            {[
                                { label: "Category",        value: project.category },
                                { label: "Style",           value: project.style },
                                { label: "Location",        value: project.location },
                                { label: "Transformations", value: `${project.project_images.length} space${project.project_images.length !== 1 ? "s" : ""}` },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className={`flex justify-between text-sm font-['Poppins'] pb-3 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}
                                >
                                    <span className={isDark ? "text-white/40" : "text-slate-400"}>{label}</span>
                                    <span className={`font-semibold ${isDark ? "text-white" : "text-[#181B34]"}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Before & After sliders ── */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-10"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px w-8 bg-[#F5C518]" />
                            <span className={`text-xs tracking-[0.3em] uppercase font-semibold font-['Poppins'] ${isDark ? "text-[#F5C518]" : "text-[#181B34]/50"}`}>
                                Before &amp; After
                            </span>
                        </div>
                        <h2 className={`font-['Poppins'] font-bold text-3xl ${isDark ? "text-white" : "text-[#181B34]"}`}>
                            The Transformation
                        </h2>
                    </motion.div>

                    <div className="space-y-10">
                        {project.project_images.map((pair, i) => (
                            <motion.div
                                key={pair.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                {/* Room label */}
                                {pair.label && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-px w-5 bg-[#F5C518]" />
                                        <p className={`text-xs tracking-[0.25em] uppercase font-semibold font-['Poppins'] ${isDark ? "text-white/50" : "text-slate-400"}`}>
                                            {pair.label}
                                        </p>
                                    </div>
                                )}

                                {/* Slider + expand button */}
                                <div className="relative group">
                                    <BeforeAfter
                                        beforeImage={pair.before}
                                        afterImage={pair.after}
                                        mode="drag"
                                        style={{ width: "100%" }}
                                        buttonStyle={{ width: 44, height: 44 }}
                                    />
                                    <button
                                        onClick={() => setLightboxPair(pair)}
                                        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 px-4 py-2 bg-black/60 text-white text-[10px] font-bold font-['Poppins'] tracking-widest uppercase backdrop-blur-sm hover:bg-[#F5C518] hover:text-[#181B34]"
                                    >
                                        <FiMaximize2 size={12} /> Fullscreen
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className={`py-16 ${isDark ? "bg-[#0f1124]" : "bg-[#F0F3FF]"}`}>
                <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
                    <h2 className={`font-['Poppins'] font-bold text-2xl lg:text-3xl mb-3 ${isDark ? "text-white" : "text-[#181B34]"}`}>
                        Ready for Your Own Transformation?
                    </h2>
                    <p className={`text-sm leading-relaxed font-['Poppins'] font-light mb-8 ${isDark ? "text-white/60" : "text-slate-500"}`}>
                        Contact our team today for a free consultation and let us craft something exceptional for your space.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-3 px-7 py-3.5 text-xs tracking-[0.15em] uppercase font-bold font-['Poppins'] bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800] transition-colors"
                        >
                            Get a Free Quote <FiArrowRight size={14} />
                        </Link>
                        <Link
                            href="/projects"
                            className={`inline-flex items-center gap-3 px-7 py-3.5 text-xs tracking-[0.15em] uppercase font-bold font-['Poppins'] border transition-colors ${isDark
                                ? "border-white/20 text-white/70 hover:border-[#F5C518] hover:text-[#F5C518]"
                                : "border-[#181B34]/20 text-[#181B34]/60 hover:border-[#181B34] hover:text-[#181B34]"
                                }`}
                        >
                            <FiArrowLeft size={14} /> All Projects
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── More projects ── */}
            {siblings.length > 0 && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-px w-8 bg-[#F5C518]" />
                            <span className={`text-xs tracking-[0.3em] uppercase font-semibold font-['Poppins'] ${isDark ? "text-[#F5C518]" : "text-[#181B34]/50"}`}>
                                More Projects
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {siblings.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link href={`/projects/${p.slug}`} className="group block relative overflow-hidden">
                                        <img
                                            src={p.cover_after}
                                            alt={p.title}
                                            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <p className="text-[#F5C518] text-[9px] tracking-widest uppercase mb-1 font-['Poppins'] font-semibold">
                                                {p.style}
                                            </p>
                                            <p className="text-white text-sm font-['Poppins'] font-semibold">
                                                {p.title}
                                            </p>
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiArrowRight className="text-white" size={18} />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
