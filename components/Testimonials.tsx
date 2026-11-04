"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Testimonial } from "@/lib/types";

/** Client stories from the dashboard; the section hides itself when there are none. */
export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
    const [current, setCurrent] = useState(0);
    const count = testimonials.length;

    useEffect(() => {
        if (count < 2) return;
        const interval = setInterval(() => setCurrent((p) => (p + 1) % count), 6000);
        return () => clearInterval(interval);
    }, [count]);

    if (count === 0) return null;
    const t = testimonials[Math.min(current, count - 1)];

    const prev = () => setCurrent((p) => (p - 1 + count) % count);
    const next = () => setCurrent((p) => (p + 1) % count);
    const initials = t.name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <section className="py-24 lg:py-36 relative overflow-hidden bg-neutral-100 dark:bg-[#0f1124]" aria-label="What our clients say">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#f5c518]/5 blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-14"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-10 bg-[#181b34] dark:bg-[#f5c518]" />
                        <span className="text-xs tracking-[0.3em] uppercase font-medium text-[#181b34] dark:text-[#f5c518]">Client Stories</span>
                        <div className="h-px w-10 bg-[#181b34] dark:bg-[#f5c518]" />
                    </div>
                    <h2 className="font-bold text-4xl lg:text-5xl text-[#181b34] dark:text-white">What Our Clients Say</h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.figure
                        key={t.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center"
                    >
                        <div className="flex justify-center gap-1 mb-8" aria-label={`${t.rating} out of 5 stars`}>
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <FiStar key={i} className="text-[#f5c518] fill-[#f5c518]" size={16} />
                            ))}
                        </div>
                        <blockquote className="text-lg lg:text-xl font-light leading-relaxed mb-10 italic text-[#181b34]/80 dark:text-white/85">
                            &ldquo;{t.quote}&rdquo;
                        </blockquote>
                        <figcaption className="flex items-center justify-center gap-4">
                            {t.avatar_url ? (
                                <Image src={t.avatar_url} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-[#f5c518]" />
                            ) : (
                                <span className="w-12 h-12 rounded-full bg-[#181b34] text-[#f5c518] flex items-center justify-center font-semibold border-2 border-[#f5c518]">
                                    {initials}
                                </span>
                            )}
                            <div className="text-left">
                                <p className="font-semibold text-sm text-[#181b34] dark:text-white">{t.name}</p>
                                {t.role && <p className="text-xs tracking-wide text-[#181b34]/50 dark:text-white/50">{t.role}</p>}
                            </div>
                        </figcaption>
                    </motion.figure>
                </AnimatePresence>

                {count > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-12">
                        <button
                            onClick={prev}
                            aria-label="Previous testimonial"
                            className="w-10 h-10 rounded-full border transition-colors flex items-center justify-center border-[#181b34]/30 text-[#181b34] hover:bg-[#181b34]/10 dark:border-[#f5c518]/30 dark:text-white dark:hover:bg-[#f5c518]/10"
                        >
                            <FiChevronLeft size={16} />
                        </button>
                        <div className="flex gap-2">
                            {testimonials.map((item, i) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrent(i)}
                                    aria-label={`Show testimonial ${i + 1}`}
                                    className={`transition-all duration-300 rounded-full h-2 ${i === current ? "bg-[#f5c518] w-6" : "w-2 bg-[#181b34]/40 dark:bg-white/30"}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            aria-label="Next testimonial"
                            className="w-10 h-10 rounded-full border transition-colors flex items-center justify-center border-[#181b34]/30 text-[#181b34] hover:bg-[#181b34]/10 dark:border-[#f5c518]/30 dark:text-white dark:hover:bg-[#f5c518]/10"
                        >
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
