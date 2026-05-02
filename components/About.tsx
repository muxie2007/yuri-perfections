"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const highlights = [
    "Experienced renovation professionals",
    "High-quality materials and workmanship",
    "Reliable project timelines",
    "Customized solutions tailored to your space",
    "Interior and exterior expertise",
];

export default function About() {
    return (
        <section id="about" className="py-24 lg:py-36 overflow-hidden bg-white dark:bg-[#181B34]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* ── Images ── */}
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative">
                        <div className="relative h-120">
                            <Image
                                // src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80"
                                src="/yuri/about/untitled-20.jpg"
                                alt="Yuri Perfections renovation" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" quality={90} priority />
                            {/* <img src="/yuri/about/open-door.jpg" alt="Yuri Perfections renovation" className="w-full h-[480px] object-cover" /> */}
                            {/* Floating accent image */}
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0.3 }} transition={{ delay: 0.4, duration: 0.7 }} className="absolute -bottom-10 -right-6 lg:-right-12 w-48 h-52 lg:w-56 lg:h-60 border-4 shadow-2xl border-white dark:border-[#181B34]">
                                <div className="relative w-full h-full">
                                    <Image
                                        // src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"
                                        src="/yuri/about/untitled.jpg"
                                        alt="Interior detail" fill className="object-cover" sizes="224px" quality={85} />
                                </div>
                                {/* <img src="/yuri/about/close-in.jpg" alt="Interior detail" className="w-full h-full object-cover" /> */}
                            </motion.div>
                            {/* Years badge — gold accent */}
                            <div className="absolute top-6 -left-4 lg:-left-8 w-22 h-22 p-5 flex flex-col items-center justify-center bg-[#F5C518]">
                                <span className="text-[#181B34] font-['Poppins'] font-bold text-2xl leading-none">10+</span>
                                <span className="text-[#181B34]/70 text-[9px] tracking-widest uppercase mt-1 font-['Poppins'] font-semibold">Years</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Text ── */}
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="lg:pl-8 mt-12 lg:mt-0">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-10 bg-[#F5C518]" />
                            <span className="text-xs tracking-[0.3em] uppercase font-semibold font-['Poppins'] text-[#181B34]/60 dark:text-[#F5C518]">
                                About Us
                            </span>
                        </div>

                        <h2 className="font-['Poppins'] font-bold text-4xl lg:text-5xl leading-tight mb-4 text-[#181B34] dark:text-white">
                            Where Craftsmanship
                            <br />
                            <span className="text-[#F5C518]">Meets Distinction</span>
                        </h2>

                        <p className="text-base leading-relaxed mb-5 font-['Poppins'] font-light text-slate-500 dark:text-white/60">
                            At Yuri Perfections, we create refined interior and exterior spaces
                            defined by precision, elegance, and enduring quality. Specializing
                            in ceiling installations, bespoke wall remodeling, custom cabinetry,
                            and aluminum architectural solutions, we deliver tailored renovation
                            experiences for discerning homeowners and forward-thinking businesses.
                        </p>
                        <p className="text-base leading-relaxed mb-8 font-['Poppins'] font-light text-slate-500 dark:text-white/60">
                            Every detail is carefully considered. Every finish is flawlessly
                            executed. Our commitment to superior craftsmanship ensures each
                            project reflects sophistication and lasting value.
                        </p>

                        {/* Highlights checklist */}
                        <ul className="space-y-3 mb-10">
                            {highlights.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <FiCheckCircle size={16} className="mt-0.5 flex-shrink-0 text-[#181B34] dark:text-[#F5C518]" />
                                    <span className="text-sm font-['Poppins'] font-light text-slate-600 dark:text-white/65">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            {[
                                { num: "200+", label: "Projects" },
                                { num: "100+", label: "Happy Clients" },
                                { num: "10+", label: "Years Active" },
                                { num: "7", label: "Service Types" },
                            ].map((s) => (
                                <div key={s.label} className="pb-4 border-b border-slate-100 dark:border-white/10">
                                    <p className="font-['Poppins'] text-2xl font-bold text-[#F5C518]">
                                        {s.num}
                                    </p>
                                    <p className="text-xs tracking-[0.2em] uppercase mt-1 font-['Poppins'] text-slate-400 dark:text-white/40">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <motion.a href="#services" whileHover={{ scale: 1.03, backgroundColor: "#e6b800" }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-3 px-7 py-4 text-sm tracking-[0.15em] uppercase font-bold font-['Poppins'] transition-all duration-300 bg-[#F5C518] text-[#181B34]">
                            Discover Our Story
                            <FiArrowRight size={16} />
                        </motion.a>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}