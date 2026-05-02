"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/ThemeProvider";
import { FiMapPin, FiPhone, FiMail, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "256394837953"; // ← update this
const WHATSAPP_DEFAULT_MSG = encodeURIComponent("Hello! I'd like to enquire about your services.");
const EMAIL_ADDRESS = "hello@yuriperfections.ug"; // ← update this
const EMAIL_PREFILL_SUBJECT = encodeURIComponent("Project Enquiry – Yuri Perfections");
const EMAIL_PREFILL_BODY = encodeURIComponent(
    "Hello Yuri Perfections,\n\nI would like to discuss a project with you.\n\nPlease let me know your availability.\n\nBest regards,"
);
const PHONE_NUMBER = "+256394837953"; // ← update this
const MAPS_ADDRESS = encodeURIComponent("Bukenya Mall, Ntinda, Plot 2 Kimera Road, Kampala, Uganda");

export default function Contact() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    const inputClass = `w-full px-4 py-3.5 text-sm border transition-colors focus:outline-none rounded-none ${isDark
        ? "bg-[#1e2240] border-white/10 text-white placeholder-white/30 focus:border-[#f5c518]"
        : "bg-[#f0f3ff] border-[#181b34]/10 text-[#181b34] placeholder-[#181b34]/30 focus:border-[#f5c518]"
        }`;

    const contactItems = [
        {
            icon: FiMapPin,
            label: "Address",
            val: "Bukenya Mall RM16, Ntinda — Plot 2 Kimera Road",
            href: `https://www.google.com/maps/search/?api=1&query=${MAPS_ADDRESS}`,
            external: true,
        },
        {
            icon: FiPhone,
            label: "Phone",
            val: PHONE_NUMBER,
            href: `tel:${PHONE_NUMBER}`,
            external: false,
        },
        {
            icon: FiMail,
            label: "Email",
            val: EMAIL_ADDRESS,
            href: `mailto:${EMAIL_ADDRESS}?subject=${EMAIL_PREFILL_SUBJECT}&body=${EMAIL_PREFILL_BODY}`,
            external: false,
        },
        {
            icon: FaWhatsapp,
            label: "WhatsApp",
            val: "Chat with us on WhatsApp",
            href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_DEFAULT_MSG}`,
            external: true,
        },
    ];

    return (
        <section
            id="contact"
            className={`py-24 lg:py-36 ${isDark ? "bg-[#181b34]" : "bg-[#f0f3ff]"}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-10 bg-[#f5c518]" />
                        <span className="text-[#f5c518] text-xs tracking-[0.3em] uppercase font-medium">
                            Get In Touch
                        </span>
                        <div className="h-px w-10 bg-[#f5c518]" />
                    </div>
                    <h2 className={`font-bold text-4xl lg:text-5xl ${isDark ? "text-white" : "text-[#181b34]"}`}>
                        Start Your Project
                    </h2>
                    <p className={`mt-4 text-base font-light max-w-lg mx-auto ${isDark ? "text-white/50" : "text-[#181b34]/60"}`}>
                        Ready to transform your space? Fill in the form or reach us directly — we&apos;re based right here in Kampala.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Map image */}
                        <div className="relative h-52 overflow-hidden">
                            <Image
                                src="/yuri/contact/untitled-15.jpg"
                                alt="Kampala"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 560px"
                                quality={90}
                                priority
                            />
                            <div className={`absolute inset-0 flex items-center justify-center ${isDark ? "bg-[#181b34]/70" : "bg-[#181b34]/50"}`}>
                                <div className="text-center">
                                    <FiMapPin className="text-[#f5c518] mx-auto mb-2" size={28} />
                                    <p className="text-white font-semibold">Ntinda, Kampala</p>
                                    <p className="text-white/70 text-xs mt-1">Bukenya Mall RM16 — Plot 2 Kimera Road</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {contactItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className="flex items-start gap-4 group cursor-pointer"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors ${isDark
                                        ? "bg-[#f5c518]/10 group-hover:bg-[#f5c518]/20"
                                        : "bg-[#181b34]/10 group-hover:bg-[#f5c518]/20"
                                        }`}>
                                        <item.icon
                                            size={16}
                                            className={`transition-colors ${isDark
                                                ? "text-[#f5c518] group-hover:text-[#f5c518]"
                                                : "text-[#181b34] group-hover:text-[#f5c518]"
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <p className={`text-xs tracking-widest uppercase font-medium mb-1 ${isDark ? "text-white/40" : "text-[#181b34]/40"}`}>
                                            {item.label}
                                        </p>
                                        <p className={`text-sm transition-colors ${isDark
                                            ? "text-white/80 group-hover:text-[#f5c518]"
                                            : "text-[#181b34]/80 group-hover:text-[#f5c518]"
                                            }`}>
                                            {item.val}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="lg:col-span-3"
                    >
                        {sent ? (
                            <div className={`flex flex-col items-center justify-center h-full min-h-80 text-center p-12 ${isDark ? "bg-[#1e2240]" : "bg-white"}`}>
                                <div className="w-16 h-16 flex items-center justify-center mb-6 bg-[#f5c518]/10">
                                    <FiSend size={24} className="text-[#f5c518]" />
                                </div>
                                <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-[#181b34]"}`}>
                                    Message Sent!
                                </h3>
                                <p className={`text-sm font-light ${isDark ? "text-white/50" : "text-[#181b34]/50"}`}>
                                    Thank you for reaching out. Our team will get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={`p-8 lg:p-10 ${isDark ? "bg-[#1e2240]" : "bg-white"}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className={`block text-xs tracking-[0.15em] uppercase font-medium mb-2 ${isDark ? "text-white/40" : "text-[#181b34]/40"}`}>
                                            Full Name
                                        </label>
                                        <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={`block text-xs tracking-[0.15em] uppercase font-medium mb-2 ${isDark ? "text-white/40" : "text-[#181b34]/40"}`}>
                                            Email Address
                                        </label>
                                        <input name="email" type="email" placeholder="john@email.com" value={form.email} onChange={handleChange} required className={inputClass} />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className={`block text-xs tracking-[0.15em] uppercase font-medium mb-2 ${isDark ? "text-white/40" : "text-[#181b34]/40"}`}>
                                        Service Interested In
                                    </label>
                                    <select name="service" value={form.service} onChange={handleChange} className={inputClass}>
                                        <option value="">Select a service</option>
                                        <option>Interior Finishing</option>
                                        <option>Exterior Finishing</option>
                                        <option>Residential Projects</option>
                                        <option>Commercial Spaces</option>
                                        <option>Renovation & Refurbishment</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <label className={`block text-xs tracking-[0.15em] uppercase font-medium mb-2 ${isDark ? "text-white/40" : "text-[#181b34]/40"}`}>
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        rows={5}
                                        placeholder="Tell us about your space and vision..."
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-[0.2em] uppercase font-semibold transition-colors bg-[#f5c518] text-[#181b34] hover:bg-[#e6b800]"
                                >
                                    Send Message
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