"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import type { Service } from "@/lib/types";
import { serviceIcon } from "@/lib/service-icons";

export const PICK_SERVICE_EVENT = "yuri:pick-service";

export default function Services({ services }: { services: Service[] }) {
    if (services.length === 0) return null;

    return (
        <section id="services" className="py-24 lg:py-36 bg-[#F0F3FF] dark:bg-[#0f1124]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-2xl mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-10 bg-[#F5C518]" />
                        <span className="text-xs tracking-[0.3em] uppercase font-semibold text-[#181B34]/60 dark:text-[#F5C518]">What We Do</span>
                    </div>
                    <h2 className="font-bold text-4xl lg:text-5xl leading-tight text-[#181B34] dark:text-white">Our Design Services</h2>
                    <p className="mt-4 text-base font-light leading-relaxed text-slate-500 dark:text-white/55">
                        Complete renovation and finishing solutions for residential and commercial properties — from concept to flawless completion.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                    {services.map((s, i) => {
                        const Icon = serviceIcon(s.icon);
                        return (
                            <motion.article
                                key={s.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ delay: (i % 3) * 0.09, duration: 0.6 }}
                                className="group relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 bg-white dark:bg-[#181B34]"
                            >
                                <div className="relative h-52 overflow-hidden bg-neutral-200 dark:bg-white/5">
                                    {s.image_url && (
                                        <Image
                                            src={s.image_url}
                                            alt={s.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            quality={85}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                    <div className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-[#F5C518]">
                                        <Icon size={17} className="text-[#181B34]" />
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-semibold text-base mb-3 text-[#181B34] dark:text-white">{s.title}</h3>
                                    <p className="text-sm leading-relaxed font-light text-slate-500 dark:text-white/55">{s.description}</p>
                                    <a
                                        href="#contact"
                                        // Contact.tsx listens and selects this service in the form.
                                        onClick={() => window.dispatchEvent(new CustomEvent(PICK_SERVICE_EVENT, { detail: s.title }))}
                                        className="mt-5 inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold transition-colors text-[#181B34]/50 group-hover:text-[#181B34] dark:text-[#F5C518]/70 dark:group-hover:text-[#F5C518]"
                                    >
                                        Ask about this
                                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                                    </a>
                                </div>

                                <div className="absolute bottom-0 left-0 w-0 h-0.75 transition-all duration-500 group-hover:w-full bg-[#F5C518]" />
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
