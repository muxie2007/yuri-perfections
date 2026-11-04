"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import type { SiteSettings } from "@/lib/types";

type Props = Pick<
    SiteSettings,
    | "about_title"
    | "about_title_accent"
    | "about_body"
    | "about_highlights"
    | "about_stats"
    | "about_years"
    | "about_image_main"
    | "about_image_accent"
>;

export default function About(props: Props) {
    const paragraphs = props.about_body.split(/\n\s*\n/).filter((p) => p.trim());

    return (
        <section id="about" className="py-24 lg:py-36 overflow-hidden bg-white dark:bg-[#181B34]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* ── Images ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                    >
                        <div className="relative h-96 sm:h-120">
                            <Image
                                src={props.about_image_main}
                                alt="Yuri Perfections renovation"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                quality={90}
                            />
                            {props.about_image_accent && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ delay: 0.4, duration: 0.7 }}
                                    className="absolute -bottom-10 -right-2 sm:-right-6 lg:-right-12 w-40 h-44 sm:w-48 sm:h-52 lg:w-56 lg:h-60 border-4 shadow-2xl border-white dark:border-[#181B34]"
                                >
                                    <div className="relative w-full h-full">
                                        <Image src={props.about_image_accent} alt="Interior detail" fill className="object-cover" sizes="224px" quality={85} />
                                    </div>
                                </motion.div>
                            )}
                            {props.about_years && (
                                <div className="absolute top-6 -left-2 sm:-left-4 lg:-left-8 w-22 h-22 p-5 flex flex-col items-center justify-center bg-[#F5C518]">
                                    <span className="text-[#181B34] font-bold text-2xl leading-none">{props.about_years}</span>
                                    <span className="text-[#181B34]/70 text-[9px] tracking-widest uppercase mt-1 font-semibold">Years</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ── Text ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="lg:pl-8 mt-12 lg:mt-0"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-10 bg-[#F5C518]" />
                            <span className="text-xs tracking-[0.3em] uppercase font-semibold text-[#181B34]/60 dark:text-[#F5C518]">About Us</span>
                        </div>

                        <h2 className="font-bold text-4xl lg:text-5xl leading-tight mb-4 text-[#181B34] dark:text-white">
                            {props.about_title}
                            {props.about_title_accent && (
                                <>
                                    <br />
                                    <span className="text-[#F5C518]">{props.about_title_accent}</span>
                                </>
                            )}
                        </h2>

                        {paragraphs.map((p, i) => (
                            <p key={i} className="text-base leading-relaxed mb-5 font-light text-slate-500 dark:text-white/60">
                                {p}
                            </p>
                        ))}

                        {props.about_highlights.length > 0 && (
                            <ul className="space-y-3 mb-10 mt-8">
                                {props.about_highlights.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <FiCheckCircle size={16} className="mt-0.5 shrink-0 text-[#181B34] dark:text-[#F5C518]" />
                                        <span className="text-sm font-light text-slate-600 dark:text-white/65">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {props.about_stats.length > 0 && (
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                {props.about_stats.map((s) => (
                                    <div key={s.label} className="pb-4 border-b border-slate-100 dark:border-white/10">
                                        <p className="text-2xl font-bold text-[#F5C518]">{s.value}</p>
                                        <p className="text-xs tracking-[0.2em] uppercase mt-1 text-slate-400 dark:text-white/40">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <a
                            href="#services"
                            className="inline-flex items-center gap-3 px-7 py-4 text-sm tracking-[0.15em] uppercase font-bold transition-colors bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800]"
                        >
                            Our Services
                            <FiArrowRight size={16} />
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
