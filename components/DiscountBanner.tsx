"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { FiSend } from "react-icons/fi";

export default function DiscountBanner() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSent(true);
            setEmail("");
        }
    };

    return (
        <section className={`py-16 ${isDark ? "bg-[#c8a97e]" : "bg-[#c8a97e]"}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                    >
                        <p className="text-[#0e0e0e]/60 text-xs tracking-[0.3em] uppercase font-medium mb-2">
                            Limited Offer
                        </p>
                        <h2 className="font-['Playfair_Display'] font-bold text-3xl lg:text-4xl text-[#0e0e0e] mb-3">
                            Get a Voucher Discount
                            <br />
                            <span className="italic">up to 30%</span>
                        </h2>
                        <p className="text-[#0e0e0e]/70 text-sm font-light">
                            Subscribe with your email and receive an exclusive discount voucher for your next project consultation.
                        </p>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                    >
                        {sent ? (
                            <div className="text-center py-4">
                                <p className="text-[#0e0e0e] font-['Playfair_Display'] text-xl font-bold mb-1">Thank you! 🎉</p>
                                <p className="text-[#0e0e0e]/70 text-sm">Your voucher is on its way to your inbox.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                    className="flex-1 px-5 py-3.5 bg-white/30 placeholder-[#0e0e0e]/50 text-[#0e0e0e] text-sm border border-[#0e0e0e]/20 focus:outline-none focus:border-[#0e0e0e]/50 transition-colors"
                                />
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 px-7 py-3.5 bg-[#0e0e0e] text-white text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#1a2e26] transition-colors whitespace-nowrap"
                                >
                                    Get Voucher
                                    <FiSend size={14} />
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}