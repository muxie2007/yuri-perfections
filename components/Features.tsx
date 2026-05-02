"use client";

import { motion } from "framer-motion";
import { FiDollarSign, FiAward, FiClock, FiShield } from "react-icons/fi";

const features = [
    {
        icon: FiDollarSign,
        title: "Friendly Price",
        desc: "We renovate your interior and exterior at an affordable price without ever compromising on quality or finish.",
    },
    {
        icon: FiAward,
        title: "Great Quality",
        desc: "Every material we use is of the highest standard — built to last and engineered to impress for years to come.",
    },
    {
        icon: FiClock,
        title: "Best Time",
        desc: "We deliver your renovation project efficiently and on schedule, keeping you informed at every stage.",
    },
    {
        icon: FiShield,
        title: "Warranty",
        desc: "We provide a 1-month warranty after project completion, giving you total peace of mind.",
    },
];

export default function Features() {
    return (
        <section className="relative py-0 bg-[#181B34]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            className="group px-8 py-10 hover:bg-[#F5C518]/5 transition-colors duration-300 text-center"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#F5C518]/15 flex items-center justify-center group-hover:bg-[#F5C518]/25 transition-colors">
                                    <f.icon size={20} className="text-[#F5C518]" />
                                </div>
                            </div>
                            <h3 className="text-white font-['Poppins'] font-semibold text-sm tracking-widest uppercase mb-3">
                                {f.title}
                            </h3>
                            <p className="text-white/55 text-xs leading-relaxed font-light font-['Poppins']">
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}