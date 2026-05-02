"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getActiveHeroSlides,
    subscribeToHeroSlides,
    HERO_SLIDES_QUERY_KEY,
} from "@/services/hero-slides-service";

// ── Fallback slides shown while loading or if DB is empty ────────────────────
const FALLBACK_SLIDES = [
    {
        id: -1,
        image_url:
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=90",
        alt_text: "Yuri Perfections project 1",
    },
    {
        id: -2,
        image_url:
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90",
        alt_text: "Yuri Perfections project 2",
    },
    {
        id: -3,
        image_url:
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=90",
        alt_text: "Yuri Perfections project 3",
    },
];

// ── Skeleton shown while the first fetch is in-flight ───────────────────────
function SliderSkeleton() {
    return (
        <div className="relative w-[85%] h-[80%] z-20 shadow-2xl lg:absolute lg:w-[165%] lg:h-[130%] lg:bottom-[20%] lg:right-[40%] bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    );
}

export default function Hero() {
    const [current, setCurrent] = useState(0);
    const queryClient = useQueryClient();

    // ── Fetch slides via TanStack Query ──────────────────────────────────────
    const { data: dbSlides, isPending, isError } = useQuery({
        queryKey: HERO_SLIDES_QUERY_KEY,
        queryFn: getActiveHeroSlides,
    });


    // ── Wire up Supabase realtime (defined in service file) ──────────────────
    useEffect(() => {
        const unsubscribe = subscribeToHeroSlides(queryClient);
        return () => unsubscribe();
    }, [queryClient]);

    // Use DB slides when available; fall back to hardcoded set
    const slides =
        !isPending && !isError && dbSlides && dbSlides.length > 0
            ? dbSlides
            : FALLBACK_SLIDES;

    const nextIndex = (current + 1) % slides.length;

    // ── Auto-advance ─────────────────────────────────────────────────────────
    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    // Reset index if slides array shrinks (e.g. a slide deactivated via realtime)
    useEffect(() => {
        if (current >= slides.length) setCurrent(0);
    }, [slides.length, current]);

    return (
        <section id="home" className="relative w-full overflow-hidden">

            {/* SPLIT BACKGROUND */}
            <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-white dark:bg-neutral-950" />
                <div className="w-1/2 bg-neutral-100 dark:bg-neutral-900" />
            </div>

            <div className="relative z-10 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-20">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-16">

                    {/* ── SLIDER ── */}
                    <div className="relative w-full lg:w-1/2 h-[250px] md:h-[420px] lg:h-[650px] flex items-center justify-center order-1 lg:order-2 lg:mt-15">
                        <div className="relative w-full h-full lg:ml-auto lg:w-[70%] lg:h-[55%] flex justify-center items-center">

                            {/* Main (large) slide */}
                            {isPending ? (
                                <SliderSkeleton />
                            ) : (
                                // <div className="relative w-[85%] h-[80%] z-20 shadow-2xl lg:absolute lg:w-[170%] lg:h-[130%] lg:bottom-[20%] lg:right-[40%]">
                                <div className="relative w-[85%] h-[80%] z-20 shadow-2xl lg:absolute lg:w-[165%] lg:h-[130%] lg:bottom-[20%] lg:right-[40%]">
                                    {slides.map((slide, index) => (
                                        <Image
                                            key={slide.id}
                                            src={slide.image_url}
                                            alt={slide.alt_text}
                                            fill
                                            className={`object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"
                                                }`}
                                            sizes="(max-width: 1024px) 85vw, 80vw"
                                            quality={90}
                                            priority={index === 0}
                                        />
                                    ))}

                                    {/* Dot indicators */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                                        {slides.map((slide, index) => (
                                            <button
                                                key={slide.id}
                                                onClick={() => setCurrent(index)}
                                                aria-label={`Go to slide ${index + 1}`}
                                                className={`transition-all duration-300 rounded-none ${index === current
                                                    ? "w-6 h-2 bg-[#F5C518]"
                                                    : "w-2 h-2 bg-white/60"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview (small) slide — bottom-right peek */}
                            <div className="absolute bottom-3 right-3 w-[40%] h-[30%] z-10 lg:relative lg:w-full lg:h-full lg:bottom-0 lg:right-0">
                                {!isPending && (
                                    <Image
                                        src={slides[nextIndex].image_url}
                                        alt={`Preview: ${slides[nextIndex].alt_text}`}
                                        fill
                                        className="object-cover shadow-xl"
                                        sizes="(max-width: 1024px) 40vw, 50vw"
                                        quality={90}
                                    />
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ── TEXT ── */}
                    <div className="relative z-30 w-full lg:w-1/2 order-2 lg:order-1 flex justify-center px-4 sm:px-6 lg:px-0">
                        <div className="w-full max-w-md lg:max-w-none bg-white/90 dark:bg-black/70 backdrop-blur-md shadow-xl px-6 py-6 text-center lg:text-left lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:px-0 lg:py-0">

                            {/*
                Headline — each word/phrase gets its own tight inline bg block.
                Reduced font size so "Precision Craftsmanship." fits on one row
                and "Exceptional Finishes." fits on another row.
              */}
                            <h1 className="font-['Poppins'] font-bold uppercase leading-[1.6] tracking-[0.04em] text-[28px] sm:text-[34px] lg:text-[38px] xl:text-[44px]">

                                {/* Row 1: Precision */}
                                <span className="block">
                                    <span className="inline bg-white dark:bg-neutral-950 text-[#181B34] dark:text-white px-2 py-0.5 box-decoration-clone">
                                        Precision
                                    </span>
                                </span>

                                {/* Row 2: Craftsmanship. */}
                                <span className="block">
                                    <span className="inline bg-[#181B34] text-[#F5C518] px-2 py-0.5 box-decoration-clone">
                                        Craftsmanship.
                                    </span>
                                </span>

                                {/* Row 3: Exceptional Finishes. */}
                                <div className="mt-1 flex flex-wrap justify-center lg:justify-start">
                                    <span className="bg-white dark:bg-neutral-950 text-[#181B34] dark:text-white px-2 py-0.5 box-decoration-clone">
                                        Exceptional
                                    </span>
                                    <span className="bg-white dark:bg-neutral-950 text-[#181B34] dark:text-white px-2 py-0.5 box-decoration-clone">
                                        Finishes.
                                    </span>
                                </div>

                            </h1>

                            <div className="mt-6 text-[14px] lg:text-[15px] text-gray-600 dark:text-gray-400 max-w-full [@media(min-width:700px)]:max-w-[22rem] lg:max-w-md mx-auto lg:mx-0 leading-7 font-['Poppins'] font-light min-h-[10px]">
                                At Yuri Perfections, we deliver high-quality interior and exterior finishing solutions for both residential and commercial spaces. With a strong focus on precision, craftsmanship, and detail, we transform environments into refined, functional spaces built to last.
                            </div>

                            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
                                <a
                                    href="#contact"
                                    className="inline-flex items-center bg-[#F5C518] text-[#181B34] px-6 py-3 text-[11px] tracking-[0.18em] uppercase font-bold font-['Poppins'] hover:bg-[#e6b800] transition-colors whitespace-nowrap"
                                >
                                    Schedule A Consultation
                                </a>
                                <a
                                    href="#projects"
                                    className="inline-flex items-center border-2 border-[#181B34] dark:border-white text-[#181B34] dark:text-white px-6 py-3 text-[11px] tracking-[0.18em] uppercase font-bold font-['Poppins'] hover:bg-[#181B34] hover:text-white dark:hover:bg-white dark:hover:text-[#181B34] transition-colors whitespace-nowrap"
                                >
                                    View Portfolio
                                </a>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}