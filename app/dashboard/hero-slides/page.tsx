"use client";

import { useState } from "react";
import Image from "next/image";
import { FiPlus } from "react-icons/fi";
import { useOrderedList } from "@/hooks/useOrderedList";
import { usePagedList } from "@/hooks/usePagedList";
import type { HeroSlide, Status } from "@/lib/types";
import { ImageField } from "@/components/admin/ImageField";
import { ListPager, ListSearch, RowActions } from "@/components/admin/RowActions";
import { Badge, Button, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton } from "@/components/admin/ui";
import { LiveSwitch } from "@/components/admin/LiveSwitch";

type Draft = { id?: number; image_url: string; alt_text: string; status: Status; original?: string };

export default function HeroSlidesPage() {
    const { list, rows, add, update, remove, move } = useOrderedList("hero_slides", "Slide", ["image_url"]);
    const slides = rows as HeroSlide[];
    const paged = usePagedList(slides, (s) => s.alt_text);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [open, setOpen] = useState(false);
    const [tried, setTried] = useState(false);

    const edit = (d: Draft) => {
        setDraft(d);
        setTried(false);
        setOpen(true);
    };

    const save = () => {
        setTried(true);
        if (!draft?.image_url) return;
        const row = { image_url: draft.image_url, alt_text: draft.alt_text.trim(), status: draft.status };
        const done = { onSuccess: () => setOpen(false) };
        if (draft.id) {
            update.mutate({ id: draft.id, patch: row, replaced: draft.original && draft.original !== draft.image_url ? [draft.original] : [] }, done);
        } else {
            add.mutate(row, done);
        }
    };

    return (
        <div>
            <PageHeader
                title="Hero slides"
                description="The photos that rotate at the top of the home page, in this order. Wide (landscape) photos look best."
                actions={
                    <Button variant="primary" icon={<FiPlus />} onClick={() => edit({ image_url: "", alt_text: "", status: "active" })}>
                        Add slide
                    </Button>
                }
            />

            <ListSearch value={paged.search} onChange={paged.onSearch} placeholder="Search slides by description" />

            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="grid gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : paged.total === 0 ? (
                <EmptyState
                    title={paged.filtering ? "No slides match" : "No slides yet"}
                    body={paged.filtering ? "Try another word." : "Until you add one, the home page shows a default photo."}
                />
            ) : (
                <>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#181B34]">
                        {paged.pageRows.map((s) => {
                            const i = paged.indexOf(s);
                            return (
                                <li key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-2.5">
                                    <div className="relative w-full sm:w-28 aspect-video shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-white/5">
                                        <Image src={s.image_url} alt={s.alt_text} fill sizes="112px" className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#181B34] dark:text-white truncate">{s.alt_text || "No description"}</p>
                                        <div className="mt-1 flex gap-1.5">
                                            <Badge>#{i + 1}</Badge>
                                            {s.status === "active" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
                                        </div>
                                    </div>
                                    <RowActions
                                        index={i}
                                        count={slides.length}
                                        label={s.alt_text || `slide ${i + 1}`}
                                        busy={move.isPending}
                                        canMove={!paged.filtering}
                                        onMove={(delta) => move.mutate({ index: i, delta })}
                                        live={s.status === "active"}
                                        onLive={(on) => update.mutate({ id: s.id, patch: { status: on ? "active" : "inactive" } })}
                                        onEdit={() => edit({ id: s.id, image_url: s.image_url, alt_text: s.alt_text, status: s.status, original: s.image_url })}
                                        onDelete={() => remove.mutate(s)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                    <ListPager page={paged.page} size={paged.size} total={paged.total} setPage={paged.setPage} setSize={paged.setSize} />
                </>
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={draft?.id ? "Edit slide" : "Add slide"}
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
                        <ImageField label="Photo" folder="hero" aspect="aspect-[16/9]" value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} />
                        {tried && !draft.image_url && (
                            <p role="alert" className="-mt-2 text-xs text-red-600">
                                Add a photo.
                            </p>
                        )}
                        <Field label="Short description" id="slide-alt" hint="Read by screen readers and search engines, e.g. Living room with a gypsum ceiling.">
                            <Input id="slide-alt" value={draft.alt_text} maxLength={160} onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })} />
                        </Field>
                        <LiveSwitch status={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
                    </div>
                )}
            </Modal>
        </div>
    );
}

