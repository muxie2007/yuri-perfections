"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { updateSettings } from "@/services/admin";
import { removeImages } from "@/lib/images";
import { useSave } from "@/hooks/useSave";
import { qk } from "@/lib/query-keys";
import type { SiteSettings } from "@/lib/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button, Card, Field, Input, Textarea, useConfirm } from "@/components/admin/ui";
import { SectionTabs } from "@/components/admin/SectionTabs";

const url = z.union([z.literal(""), z.string().trim().url("Paste the full link, starting with https://")]);

const SECTIONS = [
    { id: "contact", label: "Business and contact" },
    { id: "social", label: "Social media" },
    { id: "hero", label: "Home: top section" },
    { id: "about", label: "Home: About us" },
];

const schema = z.object({
    business_name: z.string().trim().min(2).max(120),
    phone: z.string().trim().max(40),
    whatsapp: z.string().trim().max(40).regex(/^[+\d\s()-]*$/, "Digits only, with the country code (256…)."),
    email: z.union([z.literal(""), z.string().trim().email("Not a valid email.")]),
    address: z.string().trim().max(200),
    area: z.string().trim().max(120),
    maps_url: url,
    opening_hours: z.string().trim().max(200),
    facebook_url: url,
    instagram_url: url,
    tiktok_url: url,
    linkedin_url: url,
    x_url: url,
    youtube_url: url,
    hero_text: z.string().trim().max(600),
    about_title: z.string().trim().max(120),
    about_title_accent: z.string().trim().max(120),
    about_body: z.string().trim().max(4000),
    highlights: z.string().max(2000),
    about_stats: z.array(z.object({ value: z.string().trim().min(1, "Required").max(20), label: z.string().trim().min(1, "Required").max(40) })).max(8),
    about_years: z.string().trim().max(10),
    about_image_main: z.string(),
    about_image_accent: z.string(),
});
type Values = z.infer<typeof schema>;

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isDirty },
    } = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { ...settings, highlights: settings.about_highlights.join("\n") },
    });
    const stats = useFieldArray({ control, name: "about_stats" });
    const confirm = useConfirm();
    const [imageMain, imageAccent] = useWatch({ control, name: ["about_image_main", "about_image_accent"] });

    const save = useSave(
        async (v: Values) => {
            const { highlights, ...rest } = v;
            const saved = await updateSettings({
                ...rest,
                about_highlights: highlights.split("\n").map((s) => s.trim()).filter(Boolean),
            });
            await removeImages(
                [settings.about_image_main, settings.about_image_accent].filter((u) => u !== v.about_image_main && u !== v.about_image_accent),
            );
            return saved;
        },
        { success: "Settings saved. The website is updated.", invalidate: [qk.settings] },
    );

    const err = (k: keyof Values) => (errors[k] as { message?: string } | undefined)?.message;

    return (
        <form
            onSubmit={handleSubmit(
                async (v) => {
                    const ok = await confirm({
                        title: "Save the site settings?",
                        body: "The changes show on the website straight away.",
                        confirmLabel: "Save settings",
                        tone: "primary",
                    });
                    if (ok) save.mutate(v);
                },
                () => toast.error("Please check the highlighted fields."),
            )}
            noValidate
            className="space-y-4 pb-20"
        >
            <SectionTabs sections={SECTIONS} />
            <Card id="contact" className="scroll-mt-32" title="Business and contact" description="Shown in the contact section, the footer and to search engines.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Business name" id="s-name" error={err("business_name")}>
                        <Input id="s-name" {...register("business_name")} />
                    </Field>
                    <Field label="Email" id="s-email" error={err("email")}>
                        <Input id="s-email" type="email" {...register("email")} />
                    </Field>
                    <Field label="Phone" id="s-phone" error={err("phone")} hint="As people should dial it, e.g. +256 394 837953">
                        <Input id="s-phone" {...register("phone")} />
                    </Field>
                    <Field label="WhatsApp number" id="s-wa" error={err("whatsapp")} hint="With country code, e.g. 256394837953">
                        <Input id="s-wa" {...register("whatsapp")} />
                    </Field>
                    <Field label="Address" id="s-address" error={err("address")}>
                        <Input id="s-address" {...register("address")} />
                    </Field>
                    <Field label="Area" id="s-area" error={err("area")} hint="e.g. Ntinda, Kampala">
                        <Input id="s-area" {...register("area")} />
                    </Field>
                    <Field label="Google Maps link" id="s-maps" error={err("maps_url")} className="sm:col-span-2">
                        <Input id="s-maps" {...register("maps_url")} />
                    </Field>
                    <Field label="Opening hours (optional)" id="s-hours" error={err("opening_hours")} hint="e.g. Mon–Sat, 8am–6pm" className="sm:col-span-2">
                        <Input id="s-hours" {...register("opening_hours")} />
                    </Field>
                </div>
            </Card>

            <Card id="social" className="scroll-mt-32" title="Social media" description="Only the ones filled in show as icons in the footer.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                        [
                            ["instagram_url", "Instagram"],
                            ["facebook_url", "Facebook"],
                            ["tiktok_url", "TikTok"],
                            ["x_url", "X (Twitter)"],
                            ["linkedin_url", "LinkedIn"],
                            ["youtube_url", "YouTube"],
                        ] as const
                    ).map(([key, label]) => (
                        <Field key={key} label={label} id={`s-${key}`} error={err(key)}>
                            <Input id={`s-${key}`} placeholder="https://" {...register(key)} />
                        </Field>
                    ))}
                </div>
            </Card>

            <Card id="hero" className="scroll-mt-32" title="Home page: top section" description="The paragraph under the big headline.">
                <Field label="Intro text" id="s-hero" error={err("hero_text")}>
                    <Textarea id="s-hero" rows={4} {...register("hero_text")} />
                </Field>
            </Card>

            <Card id="about" className="scroll-mt-32" title="Home page: About us">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Heading" id="s-about-title" error={err("about_title")}>
                        <Input id="s-about-title" {...register("about_title")} />
                    </Field>
                    <Field label="Heading, gold part" id="s-about-accent" error={err("about_title_accent")}>
                        <Input id="s-about-accent" {...register("about_title_accent")} />
                    </Field>
                    <Field label="Text" id="s-about-body" error={err("about_body")} hint="Leave a blank line between paragraphs." className="sm:col-span-2">
                        <Textarea id="s-about-body" rows={6} {...register("about_body")} />
                    </Field>
                    <Field label="Highlights" id="s-highlights" hint="One per line; each gets a tick." className="sm:col-span-2">
                        <Textarea id="s-highlights" rows={5} {...register("highlights")} />
                    </Field>
                    <Field label="Years badge" id="s-years" error={err("about_years")} hint="e.g. 10+ (leave empty to hide)">
                        <Input id="s-years" {...register("about_years")} />
                    </Field>
                </div>

                <div className="mt-6">
                    <p className="text-sm font-medium text-slate-700 dark:text-white/80">Figures</p>
                    <p className="text-xs text-slate-500 dark:text-white/40 mb-2">The numbers under the About text, e.g. 200+ Projects.</p>
                    <div className="max-w-xl">
                        {stats.fields.length > 0 && (
                            <div className="grid grid-cols-[7rem_1fr_2.5rem] gap-2 mb-1 text-xs text-slate-500 dark:text-white/40">
                                <span>Number</span>
                                <span>Label</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            {stats.fields.map((f, i) => (
                                <div key={f.id} className="grid grid-cols-[7rem_1fr_2.5rem] gap-2 items-start">
                                    <Input aria-label={`Figure ${i + 1} number`} placeholder="200+" {...register(`about_stats.${i}.value`)} />
                                    <Input aria-label={`Figure ${i + 1} label`} placeholder="Projects" {...register(`about_stats.${i}.label`)} />
                                    <Button variant="ghost" icon={<FiTrash2 />} onClick={() => stats.remove(i)} aria-label={`Remove figure ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {stats.fields.length < 8 && (
                        <Button size="sm" className="mt-2" icon={<FiPlus />} onClick={() => stats.append({ value: "", label: "" })}>
                            Add figure
                        </Button>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 max-w-lg">
                    <ImageField label="Main photo" folder="about" value={imageMain} onChange={(u) => setValue("about_image_main", u, { shouldDirty: true })} />
                    <ImageField label="Small photo" folder="about" value={imageAccent} onChange={(u) => setValue("about_image_accent", u, { shouldDirty: true })} removable />
                </div>
            </Card>

            <div className="fixed bottom-0 inset-x-0 lg:left-64 z-10 flex justify-end gap-2 px-4 sm:px-8 py-3 bg-white/90 dark:bg-[#181B34]/90 backdrop-blur border-t border-slate-200 dark:border-white/10">
                <span className="mr-auto self-center text-xs text-slate-500 dark:text-white/50">{isDirty ? "You have unsaved changes." : "All changes saved."}</span>
                <Button type="submit" variant="primary" loading={save.isPending} disabled={!isDirty}>
                    Save settings
                </Button>
            </div>
        </form>
    );
}
