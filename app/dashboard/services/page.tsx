"use client";

import { useState } from "react";
import Image from "next/image";
import { FiPlus } from "react-icons/fi";
import { useOrderedList } from "@/hooks/useOrderedList";
import { usePagedList } from "@/hooks/usePagedList";
import { SERVICE_ICONS, serviceIcon } from "@/lib/service-icons";
import type { Service, Status } from "@/lib/types";
import { ImageField } from "@/components/admin/ImageField";
import { LiveSwitch } from "@/components/admin/LiveSwitch";
import { ListPager, ListSearch, RowActions } from "@/components/admin/RowActions";
import { Badge, Button, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea, cx } from "@/components/admin/ui";

type Draft = { id?: number; icon: string; title: string; description: string; image_url: string; status: Status; original?: string };
const EMPTY: Draft = { icon: "FiBox", title: "", description: "", image_url: "", status: "active" };

export default function ServicesPage() {
    const { list, rows, add, update, remove, move } = useOrderedList("services", "Service", ["image_url"]);
    const services = rows as Service[];
    const paged = usePagedList(services, (s) => `${s.title} ${s.description}`);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [open, setOpen] = useState(false);
    const [tried, setTried] = useState(false);

    const edit = (d: Draft) => {
        setDraft(d);
        setTried(false);
        setOpen(true);
    };

    const titleError = tried && draft && draft.title.trim().length < 3 ? "Give the service a title." : undefined;

    const save = () => {
        setTried(true);
        if (!draft || draft.title.trim().length < 3) return;
        const row = { icon: draft.icon, title: draft.title.trim(), description: draft.description.trim(), image_url: draft.image_url, status: draft.status };
        const done = { onSuccess: () => setOpen(false) };
        if (draft.id) update.mutate({ id: draft.id, patch: row, replaced: draft.original && draft.original !== draft.image_url ? [draft.original] : [] }, done);
        else add.mutate(row, done);
    };

    return (
        <div>
            <PageHeader
                title="Services"
                description="The services on the home page, in this order. Their titles also fill the contact form's list."
                actions={
                    <Button variant="primary" icon={<FiPlus />} onClick={() => edit(EMPTY)}>
                        Add service
                    </Button>
                }
            />

            <ListSearch value={paged.search} onChange={paged.onSearch} placeholder="Search services" />

            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="grid gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : paged.total === 0 ? (
                <EmptyState
                    title={paged.filtering ? "No services match" : "No services yet"}
                    body={paged.filtering ? "Try another word." : "Add what you offer; the section is hidden until there is one."}
                />
            ) : (
                <>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#181B34]">
                        {paged.pageRows.map((s) => {
                            const i = paged.indexOf(s);
                            const Icon = serviceIcon(s.icon);
                            return (
                                <li key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-2.5">
                                    <div className="relative w-full sm:w-24 aspect-[4/3] shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-white/5">
                                        {s.image_url && <Image src={s.image_url} alt="" fill sizes="96px" className="object-cover" />}
                                        <span className="absolute top-1.5 left-1.5 w-6 h-6 bg-[#F5C518] text-[#181B34] flex items-center justify-center">
                                            <Icon size={12} />
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#181B34] dark:text-white">{s.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-white/50 line-clamp-1">{s.description}</p>
                                        <div className="mt-1">{s.status === "active" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}</div>
                                    </div>
                                    <RowActions
                                        index={i}
                                        count={services.length}
                                        label={s.title}
                                        busy={move.isPending}
                                        canMove={!paged.filtering}
                                        onMove={(delta) => move.mutate({ index: i, delta })}
                                        live={s.status === "active"}
                                        onLive={(on) => update.mutate({ id: s.id, patch: { status: on ? "active" : "inactive" } })}
                                        onEdit={() =>
                                            edit({ id: s.id, icon: s.icon, title: s.title, description: s.description, image_url: s.image_url, status: s.status, original: s.image_url })
                                        }
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
                title={draft?.id ? "Edit service" : "Add service"}
                size="lg"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <Field label="Title" id="svc-title" required error={titleError}>
                                <Input id="svc-title" value={draft.title} maxLength={120} aria-invalid={!!titleError} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                            </Field>
                            <Field label="Description" id="svc-desc" hint="One or two sentences.">
                                <Textarea id="svc-desc" rows={4} maxLength={600} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                            </Field>
                            <fieldset>
                                <legend className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-1.5">Icon</legend>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.entries(SERVICE_ICONS).map(([name, Icon]) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => setDraft({ ...draft, icon: name })}
                                            aria-pressed={draft.icon === name}
                                            aria-label={name.replace(/^Fi/, "")}
                                            className={cx(
                                                "aspect-square rounded-md flex items-center justify-center border transition-colors",
                                                draft.icon === name ? "bg-[#F5C518] border-[#F5C518] text-[#181B34]" : "border-slate-200 text-slate-600 hover:border-slate-400 dark:border-white/15 dark:text-white/70",
                                            )}
                                        >
                                            <Icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                        <div className="space-y-4">
                            <ImageField label="Photo" folder="services" value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} removable />
                            <LiveSwitch status={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
