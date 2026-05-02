"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import {
    FiLayers,
    FiGrid,
    FiDroplet,
    FiMaximize,
    FiBox,
    FiSun,
    FiSquare,
} from "react-icons/fi";
import type { Service } from "@/services/services-service";
import {
    getActiveServices,
    subscribeToServices,
    SERVICES_QUERY_KEY,
} from "@/services/services-service";

// ── Icon string → component map (keys match what's stored in DB) ──────────────
const ICON_MAP: Record<string, React.ElementType> = {
    FiLayers,
    FiGrid,
    FiDroplet,
    FiMaximize,
    FiBox,
    FiSun,
    FiSquare,
};

// ── Fallback shown while loading or if DB is empty ───────────────────────────
const FALLBACK_SERVICES: Service[] = [
    {
        id: -1,
        icon: "FiLayers",
        title: "Ceiling Installation & Remodeling",
        description: "Professional ceiling installation, renovation, and remodeling — from plasterboard to decorative suspended ceilings, executed with precision.",
        // image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
        image_url: "/yuri/services/untitled-30.jpg",
        order: 1,
        status: "active",
        created_at: "",
    },
    {
        id: -2,
        icon: "FiGrid",
        title: "Wall Renovation & Partitioning",
        description: "Complete wall remodeling, renovation, and smart partitioning solutions that optimize space and deliver stunning aesthetics.",
        image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
        order: 2,
        status: "active",
        created_at: "",
    },
    {
        id: -3,
        icon: "FiDroplet",
        title: "Interior & Exterior Painting",
        description: "Expert painting services using premium paints, delivering flawless, durable finishes for both interior and exterior surfaces.",
        image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80",
        order: 3,
        status: "active",
        created_at: "",
    },
    {
        id: -4,
        icon: "FiMaximize",
        title: "Space Optimization & Partitioning",
        description: "Intelligent space planning that maximizes function and flow — transforming ordinary footprints into extraordinary environments.",
        image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
        order: 4,
        status: "active",
        created_at: "",
    },
    {
        id: -5,
        icon: "FiBox",
        title: "Custom Cabinetry & Millwork",
        description: "Bespoke cabinetry and millwork installations crafted to your exact specifications, seamlessly integrated into your space.",
        // image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
        image_url: "/yuri/services/IMG_6604.jpg",
        order: 5,
        status: "active",
        created_at: "",
    },
    {
        id: -6,
        icon: "FiSun",
        title: "Terrace & Balcony Perimeter Systems",
        description: "Elegant terrace and balcony perimeter solutions combining safety, refined style, and structural integrity.",
        image_url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
        order: 6,
        status: "active",
        created_at: "",
    },
    {
        id: -7,
        icon: "FiSquare",
        title: "Aluminum Framing & Entrance Solutions",
        description: "Modern aluminum framing and entrance systems — durable, architecturally sleek, and built to impress from the first impression.",
        image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
        order: 7,
        status: "active",
        created_at: "",
    },
];

export default function Services() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const queryClient = useQueryClient();

    // ── Fetch services via TanStack Query ─────────────────────────────────────
    const { data: dbServices, isPending, isError } = useQuery({
        queryKey: SERVICES_QUERY_KEY,
        queryFn: getActiveServices,
    });

    // ── Wire up Supabase realtime ─────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = subscribeToServices(queryClient);
        return () => unsubscribe();
    }, [queryClient]);

    // Use DB services when available; fall back to hardcoded set
    const services =
        !isPending && !isError && dbServices && dbServices.length > 0
            ? dbServices
            : FALLBACK_SERVICES;

    return (
        <section
            id="services"
            className={`py-24 lg:py-36 ${isDark ? "bg-[#0f1124]" : "bg-[#F0F3FF]"}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="max-w-2xl mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-10 bg-[#F5C518]" />
                        <span className={`text-xs tracking-[0.3em] uppercase font-semibold font-['Poppins'] ${isDark ? "text-[#F5C518]" : "text-[#181B34]/60"}`}>
                            What We Do
                        </span>
                    </div>
                    <h2 className={`font-['Poppins'] font-bold text-4xl lg:text-5xl leading-tight ${isDark ? "text-white" : "text-[#181B34]"}`}>
                        Our Design Services
                    </h2>
                    <p className={`mt-4 text-base font-light font-['Poppins'] leading-relaxed ${isDark ? "text-white/55" : "text-slate-500"}`}>
                        Complete renovation and finishing solutions for residential and
                        commercial properties — from concept to flawless completion.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                    {services.map((s, i) => {
                        const IconComp = ICON_MAP[s.icon] ?? FiBox;
                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: i * 0.09, duration: 0.6 }}
                                whileHover={{ y: -6 }}
                                className={`group relative overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${isDark ? "bg-[#181B34]" : "bg-white"
                                    }`}
                            >
                                {/* Image */}
                                <div className="relative h-52 overflow-hidden">
                                    <Image
                                        src={s.image_url}
                                        alt={s.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        quality={85}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                    {/* Icon badge — gold */}
                                    <div className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-[#F5C518]">
                                        <IconComp size={17} className="text-[#181B34]" />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="p-6">
                                    <h3 className={`font-['Poppins'] font-semibold text-base mb-3 ${isDark ? "text-white" : "text-[#181B34]"}`}>
                                        {s.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed font-light font-['Poppins'] ${isDark ? "text-white/55" : "text-slate-500"}`}>
                                        {s.description}
                                    </p>
                                    <div className={`mt-5 flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold font-['Poppins'] transition-colors ${isDark ? "text-[#F5C518]/70 group-hover:text-[#F5C518]" : "text-[#181B34]/50 group-hover:text-[#181B34]"}`}>
                                        Learn more
                                        <motion.span className="text-base" initial={{ x: 0 }} whileHover={{ x: 4 }}>
                                            →
                                        </motion.span>
                                    </div>
                                </div>

                                {/* Bottom accent line — gold */}
                                <div className="absolute bottom-0 left-0 w-0 h-0.75 transition-all duration-500 group-hover:w-full bg-[#F5C518]" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
