"use client";

import { FiArrowDown, FiArrowUp, FiEdit2, FiSearch, FiTrash2 } from "react-icons/fi";
import { Button, ConfirmButton, Input, PAGE_SIZES, Pagination, Switch, useConfirm } from "./ui";

/**
 * Move up / down, live switch, edit, delete: the actions on a row of a hand-ordered list.
 * Showing, hiding and deleting ask first.
 */
export function RowActions({
    index,
    count,
    onMove,
    live,
    onLive,
    onEdit,
    onDelete,
    label,
    busy,
    canMove = true,
}: {
    index: number;
    count: number;
    onMove: (delta: -1 | 1) => void;
    live?: boolean;
    onLive?: (on: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
    label: string;
    busy?: boolean;
    /** False while the list is filtered by a search (the order is the whole list's). */
    canMove?: boolean;
}) {
    const confirm = useConfirm();
    return (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end">
            {canMove && (
                <>
                    <Button size="sm" variant="ghost" icon={<FiArrowUp />} onClick={() => onMove(-1)} disabled={index === 0 || busy} aria-label={`Move ${label} up`} title="Move up" />
                    <Button size="sm" variant="ghost" icon={<FiArrowDown />} onClick={() => onMove(1)} disabled={index === count - 1 || busy} aria-label={`Move ${label} down`} title="Move down" />
                </>
            )}
            {onLive && (
                <span className="flex items-center gap-2 px-1" title={live ? "Live on the website" : "Hidden from the website"}>
                    <Switch
                        checked={!!live}
                        label={`${label} live`}
                        onChange={async (on) => {
                            const ok = await confirm({
                                title: on ? `Show "${label}" on the website?` : `Hide "${label}" from the website?`,
                                body: on ? "Visitors will see it straight away." : "It stays here; visitors will not see it until you switch it back on.",
                                confirmLabel: on ? "Show it" : "Hide it",
                                tone: on ? "primary" : "danger",
                            });
                            if (ok) onLive(on);
                        }}
                    />
                </span>
            )}
            <Button size="sm" variant="ghost" icon={<FiEdit2 />} onClick={onEdit} aria-label={`Edit ${label}`}>
                <span className="hidden sm:inline">Edit</span>
            </Button>
            <ConfirmButton onConfirm={onDelete} icon={<FiTrash2 />} question={`Delete "${label}"?`} body="It is removed for good. To take it off the website for now, switch it off instead.">
                <span className="hidden sm:inline">Delete</span>
            </ConfirmButton>
        </div>
    );
}

/** The search box above a short list. */
export function ListSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <label className="relative block mb-3 sm:max-w-sm">
            <span className="sr-only">{placeholder}</span>
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
        </label>
    );
}

/** The pager under a short list. */
export function ListPager({ page, size, total, setPage, setSize }: { page: number; size: number; total: number; setPage: (p: number) => void; setSize: (s: number) => void }) {
    return <Pagination page={page} pageSize={size} total={total} onPage={setPage} onPageSize={setSize} sizes={PAGE_SIZES} />;
}
