"use client";

import { useState } from "react";
import { FiPlus, FiStar } from "react-icons/fi";
import { useOrderedList } from "@/hooks/useOrderedList";
import type { Testimonial } from "@/lib/types";
import { ImageField } from "@/components/admin/ImageField";
import { RowActions } from "@/components/admin/RowActions";
import { Badge, Button, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea, cx } from "@/components/admin/ui";

type Draft = { id?: number; name: string; role: string; quote: string; rating: number; avatar_url: string; original?: string };
const EMPTY: Draft = { name: "", role: "", quote: "", rating: 5, avatar_url: "" };

export default function TestimonialsPage() {
    const { list, rows, add, update, remove, move } = useOrderedList("testimonials", "Testimonial", ["avatar_url"]);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [open, setOpen] = useState(false);
    const [tried, setTried] = useState(false);

    const edit = (d: Draft) => {
        setDraft(d);
        setTried(false);
        setOpen(true);
    };

    const errors = {
        name: tried && draft && !draft.name.trim() ? "Who said it?" : undefined,
        quote: tried && draft && draft.quote.trim().length < 10 ? "Add what they said (at least 10 characters)." : undefined,
    };

    const save = () => {
        setTried(true);
        if (!draft || !draft.name.trim() || draft.quote.trim().length < 10) return;
        const row = { name: draft.name.trim(), role: draft.role.trim(), quote: draft.quote.trim(), rating: draft.rating, avatar_url: draft.avatar_url };
        const done = { onSuccess: () => setOpen(false) };
        if (draft.id) update.mutate({ id: draft.id, patch: row, replaced: draft.original && draft.original !== draft.avatar_url ? [draft.original] : [] }, done);
        else add.mutate({ ...row, status: "active" }, done);
    };

    return (
        <div>
            <PageHeader
                title="Testimonials"
                description="What clients say, shown on the home page. The section stays hidden until one is live."
                actions={
                    <Button variant="primary" icon={<FiPlus />} onClick={() => edit(EMPTY)}>
                        Add testimonial
                    </Button>
                }
            />

            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
            ) : rows.length === 0 ? (
                <EmptyState title="No testimonials yet" body="Ask happy clients for a sentence or two and add it here." />
            ) : (
                <ul className="grid gap-3">
                    {(rows as Testimonial[]).map((t, i) => (
                        <li key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#181B34]">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm italic text-slate-700 dark:text-white/80 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                                <p className="mt-1.5 text-sm font-medium text-[#181B34] dark:text-white">
                                    {t.name}
                                    {t.role && <span className="font-normal text-slate-500 dark:text-white/50"> · {t.role}</span>}
                                </p>
                                <div className="mt-1.5 flex gap-1.5">
                                    <Badge tone="gold">{t.rating}★</Badge>
                                    {t.status === "active" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
                                </div>
                            </div>
                            <RowActions
                                index={i}
                                count={rows.length}
                                label={t.name}
                                busy={move.isPending}
                                onMove={(delta) => move.mutate({ index: i, delta })}
                                live={t.status === "active"}
                                onLive={(on) => update.mutate({ id: t.id, patch: { status: on ? "active" : "inactive" } })}
                                onEdit={() => edit({ id: t.id, name: t.name, role: t.role, quote: t.quote, rating: t.rating, avatar_url: t.avatar_url, original: t.avatar_url })}
                                onDelete={() => remove.mutate(t)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={draft?.id ? "Edit testimonial" : "Add testimonial"}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={save} loading={add.isPending || update.isPending}>
                            Save
                        </Button>
                    </>
                }
            >
                {draft && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Name" id="t-name" required error={errors.name}>
                                <Input id="t-name" value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                            </Field>
                            <Field label="Who they are" id="t-role" hint="e.g. Homeowner, Kololo">
                                <Input id="t-role" value={draft.role} maxLength={120} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
                            </Field>
                        </div>
                        <Field label="What they said" id="t-quote" required error={errors.quote}>
                            <Textarea id="t-quote" rows={4} maxLength={1000} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
                        </Field>
                        <fieldset>
                            <legend className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-1.5">Rating</legend>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" onClick={() => setDraft({ ...draft, rating: n })} aria-label={`${n} star${n === 1 ? "" : "s"}`} aria-pressed={draft.rating === n} className="p-1">
                                        <FiStar size={22} className={cx(n <= draft.rating ? "text-[#F5C518] fill-[#F5C518]" : "text-slate-300 dark:text-white/20")} />
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                        <div className="w-32">
                            <ImageField label="Photo (optional)" folder="testimonials" aspect="aspect-square" value={draft.avatar_url} onChange={(url) => setDraft({ ...draft, avatar_url: url })} removable />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
