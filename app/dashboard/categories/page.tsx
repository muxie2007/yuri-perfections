"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useOrderedList } from "@/hooks/useOrderedList";
import { usePagedList } from "@/hooks/usePagedList";
import type { ProjectCategory } from "@/lib/types";
import { ListPager, ListSearch, RowActions } from "@/components/admin/RowActions";
import { Button, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton } from "@/components/admin/ui";

type Draft = { id?: number; name: string; tagline: string };

/**
 * Project categories: the filter chips on /projects, in this order. Renaming one renames it
 * on its projects (database cascade); one in use cannot be deleted.
 */
export default function CategoriesPage() {
    const { list, rows, add, update, remove, move } = useOrderedList("project_categories", "Category");
    const categories = rows as ProjectCategory[];
    const paged = usePagedList(categories, (c) => `${c.name} ${c.tagline}`);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [open, setOpen] = useState(false);
    const [tried, setTried] = useState(false);

    const edit = (d: Draft) => {
        setDraft(d);
        setTried(false);
        setOpen(true);
    };
    const nameError = tried && draft && !draft.name.trim() ? "Give it a name." : undefined;

    const save = () => {
        setTried(true);
        if (!draft || !draft.name.trim()) return;
        const row = { name: draft.name.trim(), tagline: draft.tagline.trim() };
        const done = { onSuccess: () => setOpen(false) };
        if (draft.id) update.mutate({ id: draft.id, patch: row }, done);
        else add.mutate(row, done);
    };

    return (
        <div>
            <PageHeader
                title="Categories"
                description="Groups for your projects, shown as filters on the portfolio page in this order."
                actions={
                    <Button variant="primary" icon={<FiPlus />} onClick={() => edit({ name: "", tagline: "" })}>
                        Add category
                    </Button>
                }
            />

            <ListSearch value={paged.search} onChange={paged.onSearch} placeholder="Search categories" />

            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="grid gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-14" />
                    ))}
                </div>
            ) : paged.total === 0 ? (
                <EmptyState
                    title={paged.filtering ? "No categories match" : "No categories yet"}
                    body={paged.filtering ? "Try another word." : "Add one (for example Residential) before your first project."}
                />
            ) : (
                <>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#181B34]">
                        {paged.pageRows.map((c) => {
                            const i = paged.indexOf(c);
                            return (
                                <li key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-2.5">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#181B34] dark:text-white">{c.name}</p>
                                        {c.tagline && <p className="text-xs text-slate-500 dark:text-white/50 truncate">{c.tagline}</p>}
                                    </div>
                                    <RowActions
                                        index={i}
                                        count={categories.length}
                                        label={c.name}
                                        busy={move.isPending}
                                        canMove={!paged.filtering}
                                        onMove={(delta) => move.mutate({ index: i, delta })}
                                        onEdit={() => edit({ id: c.id, name: c.name, tagline: c.tagline })}
                                        onDelete={() => remove.mutate(c)}
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
                title={draft?.id ? "Edit category" : "Add category"}
                size="sm"
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
                        <Field label="Name" id="cat-name" required error={nameError} hint={draft.id ? "Renaming updates every project in it." : undefined}>
                            <Input id="cat-name" value={draft.name} maxLength={60} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                        </Field>
                        <Field label="Short line (optional)" id="cat-tagline" hint="Shown when a visitor picks this filter.">
                            <Input id="cat-tagline" value={draft.tagline} maxLength={200} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
                        </Field>
                    </div>
                )}
            </Modal>
        </div>
    );
}
