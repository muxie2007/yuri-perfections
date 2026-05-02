"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const testimonials = [
    {
        name: "Sarah Namutebi",
        role: "Homeowner, Kololo",
        quote:
            "Yuri Perfections completely transformed our home. They listened, they understood, and they delivered beyond our expectations. Every corner feels intentional.",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80",
        rating: 5,
    },
    {
        name: "David Okello",
        role: "CEO, Kampala Hospitality Group",
        quote:
            "We hired them to refinish our hotel lobby and three suites. The attention to detail and project management were exceptional. Our guests constantly compliment the new look.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        rating: 5,
    },
    {
        name: "Amina Hassan",
        role: "Entrepreneur, Bugolobi",
        quote:
            "Our office has never felt more polished and professional. The team at Yuri Perfections brought ideas we had never imagined and stayed within budget.",
        avatar: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=100&q=80",
        rating: 5,
    },
    {
        name: "James Mugisha",
        role: "Property Developer",
        quote:
            "I've worked with finishing contractors across East Africa. Yuri Perfections stands out for their precision, reliability, and true understanding of quality craftsmanship.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        rating: 5,
    },
];

export default function Testimonials() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((p) => (p + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
    const next = () => setCurrent((p) => (p + 1) % testimonials.length);

    return (
        <section
            className={`py-24 lg:py-36 relative overflow-hidden ${isDark ? "bg-[#181b34]" : "bg-neutral-100"}`}
        >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-64 h-64 opacity-5">
                <div className="text-[20rem] font-bold text-white leading-none select-none">&quot;</div>
            </div>

            {/* Subtle gold glow top-right */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#f5c518]/5 blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className={`h-px w-10 ${isDark ? "bg-[#f5c518]" : "bg-[#181b34]"}`} />
                        <span className={`text-xs tracking-[0.3em] uppercase font-medium ${isDark ? "text-[#f5c518]" : "text-[#181b34]"}`}>
                            Client Stories
                        </span>
                        <div className={`h-px w-10 ${isDark ? "bg-[#f5c518]" : "bg-[#181b34]"}`} />
                    </div>
                    <h2 className={`font-bold text-4xl lg:text-5xl ${isDark ? "text-white" : "text-[#181b34]"}`}>
                        What Our Clients Say
                    </h2>
                </motion.div>

                {/* Testimonial */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center"
                    >
                        <div className="flex justify-center gap-1 mb-8">
                            {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                                <FiStar key={i} className={`${isDark ? "text-[#f5c518] fill-[#f5c518]" : "text-[#f5c518] fill-[#f5c518]"}`} size={16} />
                            ))}
                        </div>

                        <blockquote className={`text-lg lg:text-xl font-light leading-relaxed mb-10 italic ${isDark ? "text-white/85" : "text-[#181b34]/80"}`}>
                            &quot;{testimonials[current].quote}&quot;
                        </blockquote>

                        <div className="flex items-center justify-center gap-4">
                            <img
                                src={testimonials[current].avatar}
                                alt={testimonials[current].name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-[#f5c518]"
                            />
                            <div className="text-left">
                                <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-[#181b34]"}`}>{testimonials[current].name}</p>
                                <p className={`text-xs tracking-wide ${isDark ? "text-white/50" : "text-[#181b34]/50"}`}>{testimonials[current].role}</p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 mt-12">
                    <button
                        onClick={prev}
                        className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center ${isDark ? "border-[#f5c518]/30 text-white hover:bg-[#f5c518]/10 hover:border-[#f5c518]" : "border-[#181b34]/30 text-[#181b34] hover:bg-[#181b34]/10 hover:border-[#181b34]"}`}
                    >
                        <FiChevronLeft size={16} />
                    </button>

                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`transition-all duration-300 rounded-full ${i === current ? "bg-[#f5c518] w-6 h-2" : `w-2 h-2 ${isDark ? "bg-white/30" : "bg-[#181b34]/60"}`}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={next}
                        className={`w-10 h-10 rounded-full border transition-colors flex items-center justify-center ${isDark ? "border-[#f5c518]/30 text-white hover:bg-[#f5c518]/10 hover:border-[#f5c518]" : "border-[#181b34]/30 text-[#181b34] hover:bg-[#181b34]/10 hover:border-[#181b34]"}`}
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}