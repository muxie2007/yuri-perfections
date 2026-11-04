"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMapPin, FiPhone, FiMail, FiSend, FiCheck, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry";
import { submitEnquiry } from "@/app/actions/contact";
import { whatsappLink } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";
import { PICK_SERVICE_EVENT } from "./Services";

type Props = {
    settings: Pick<SiteSettings, "business_name" | "phone" | "whatsapp" | "email" | "address" | "area" | "maps_url" | "opening_hours">;
    services: string[];
};

const inputClass =
    "w-full px-4 py-3.5 text-sm border transition-colors focus:outline-none focus:border-[#f5c518] rounded-none bg-[#f0f3ff] border-[#181b34]/10 text-[#181b34] placeholder-[#181b34]/30 dark:bg-[#1e2240] dark:border-white/10 dark:text-white dark:placeholder-white/30 aria-[invalid=true]:border-red-500";
const labelClass = "block text-xs tracking-[0.15em] uppercase font-medium mb-2 text-[#181b34]/50 dark:text-white/40";

export default function Contact({ settings, services }: Props) {
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState("");
    const [startedAt, setStartedAt] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EnquiryInput>({
        resolver: zodResolver(enquirySchema),
        defaultValues: { name: "", email: "", phone: "", service: "", message: "" },
    });

    useEffect(() => {
        setStartedAt(Date.now());
        const pick = (e: Event) => setValue("service", (e as CustomEvent<string>).detail);
        window.addEventListener(PICK_SERVICE_EVENT, pick);
        return () => window.removeEventListener(PICK_SERVICE_EVENT, pick);
    }, [setValue]);

    const onSubmit = async (values: EnquiryInput, event?: React.BaseSyntheticEvent) => {
        setServerError("");
        const form = event?.target as HTMLFormElement | undefined;
        const website = (form?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
        const result = await submitEnquiry({ ...values, website, startedAt });
        if (result.ok) {
            setSent(true);
            reset();
            return;
        }
        setServerError(result.error);
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
            setError(field as keyof EnquiryInput, { message });
        }
    };

    const contactItems = [
        { icon: FiMapPin, label: "Address", val: [settings.address, settings.area].filter(Boolean).join(", "), href: settings.maps_url, external: true },
        { icon: FiPhone, label: "Phone", val: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, external: false },
        {
            icon: FiMail,
            label: "Email",
            val: settings.email,
            href: `mailto:${settings.email}?subject=${encodeURIComponent(`Project enquiry – ${settings.business_name}`)}`,
            external: false,
        },
        {
            icon: FaWhatsapp,
            label: "WhatsApp",
            val: "Chat with us on WhatsApp",
            href: whatsappLink(settings.whatsapp || settings.phone, "Hello! I'd like to enquire about your services."),
            external: true,
        },
        ...(settings.opening_hours ? [{ icon: FiClock, label: "Hours", val: settings.opening_hours, href: "", external: false }] : []),
    ].filter((item) => item.val);

    return (
        <section id="contact" className="py-24 lg:py-36 bg-[#f0f3ff] dark:bg-[#181b34]">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-10 bg-[#f5c518]" />
                        <span className="text-[#f5c518] text-xs tracking-[0.3em] uppercase font-medium">Get In Touch</span>
                        <div className="h-px w-10 bg-[#f5c518]" />
                    </div>
                    <h2 className="font-bold text-4xl lg:text-5xl text-[#181b34] dark:text-white">Start Your Project</h2>
                    <p className="mt-4 text-base font-light max-w-lg mx-auto text-[#181b34]/60 dark:text-white/50">
                        Ready to transform your space? Fill in the form or reach us directly — we&apos;re based right here in Kampala.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="relative h-52 overflow-hidden">
                            <Image src="/yuri/contact/untitled-15.jpg" alt="Our office in Ntinda" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 560px" quality={85} />
                            <div className="absolute inset-0 flex items-center justify-center bg-[#181b34]/50 dark:bg-[#181b34]/70">
                                <div className="text-center px-4">
                                    <FiMapPin className="text-[#f5c518] mx-auto mb-2" size={28} />
                                    <p className="text-white font-semibold">{settings.area}</p>
                                    <p className="text-white/70 text-xs mt-1">{settings.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {contactItems.map((item) => {
                                const body = (
                                    <>
                                        <div className="w-10 h-10 flex items-center justify-center shrink-0 transition-colors bg-[#181b34]/10 group-hover:bg-[#f5c518]/20 dark:bg-[#f5c518]/10">
                                            <item.icon size={16} className="text-[#181b34] group-hover:text-[#f5c518] dark:text-[#f5c518]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs tracking-widest uppercase font-medium mb-1 text-[#181b34]/40 dark:text-white/40">{item.label}</p>
                                            <p className="text-sm break-words text-[#181b34]/80 group-hover:text-[#c9a000] dark:text-white/80 dark:group-hover:text-[#f5c518]">
                                                {item.val}
                                            </p>
                                        </div>
                                    </>
                                );
                                return item.href ? (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        rel={item.external ? "noopener noreferrer" : undefined}
                                        className="flex items-start gap-4 group"
                                    >
                                        {body}
                                    </a>
                                ) : (
                                    <div key={item.label} className="flex items-start gap-4 group">
                                        {body}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {sent ? (
                            <div
                                role="status"
                                className="flex flex-col items-center justify-center h-full min-h-80 text-center p-12 bg-white dark:bg-[#1e2240]"
                            >
                                <div className="w-16 h-16 flex items-center justify-center mb-6 bg-[#f5c518]/15">
                                    <FiCheck size={26} className="text-[#c9a000] dark:text-[#f5c518]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-[#181b34] dark:text-white">Message sent</h3>
                                <p className="text-sm font-light max-w-sm text-[#181b34]/60 dark:text-white/50">
                                    Thank you for reaching out. Our team will get back to you within 24 hours.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="mt-6 text-xs tracking-[0.15em] uppercase font-semibold text-[#181b34]/60 hover:text-[#181b34] dark:text-white/50 dark:hover:text-white"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 sm:p-8 lg:p-10 bg-white dark:bg-[#1e2240]" aria-label="Contact form">
                                {/* Hidden from people; bots fill it. */}
                                <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden>
                                    <label>
                                        Website
                                        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <Field label="Full name" id="c-name" error={errors.name?.message}>
                                        <input id="c-name" type="text" autoComplete="name" placeholder="John Doe" aria-invalid={!!errors.name} className={inputClass} {...register("name")} />
                                    </Field>
                                    <Field label="Email address" id="c-email" error={errors.email?.message}>
                                        <input id="c-email" type="email" autoComplete="email" placeholder="john@email.com" aria-invalid={!!errors.email} className={inputClass} {...register("email")} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <Field label="Phone / WhatsApp (optional)" id="c-phone" error={errors.phone?.message}>
                                        <input id="c-phone" type="tel" autoComplete="tel" placeholder="+256 7xx xxx xxx" aria-invalid={!!errors.phone} className={inputClass} {...register("phone")} />
                                    </Field>
                                    <Field label="Service interested in" id="c-service" error={errors.service?.message}>
                                        <select id="c-service" className={inputClass} {...register("service")}>
                                            <option value="">Select a service</option>
                                            {services.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                            <option value="Something else">Something else</option>
                                        </select>
                                    </Field>
                                </div>

                                <div className="mb-6">
                                    <Field label="Message" id="c-message" error={errors.message?.message}>
                                        <textarea
                                            id="c-message"
                                            rows={5}
                                            placeholder="Tell us about your space and vision..."
                                            aria-invalid={!!errors.message}
                                            className={`${inputClass} resize-y`}
                                            {...register("message")}
                                        />
                                    </Field>
                                </div>

                                {serverError && (
                                    <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">
                                        {serverError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-3 py-4 text-sm tracking-[0.2em] uppercase font-semibold transition-colors bg-[#f5c518] text-[#181b34] hover:bg-[#e6b800] disabled:opacity-60 disabled:cursor-wait"
                                >
                                    {isSubmitting ? "Sending…" : "Send Message"}
                                    <FiSend size={14} />
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            {children}
            {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
    );
}
