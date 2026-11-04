"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiArchive, FiDownload, FiFilter, FiInbox, FiMail, FiPhone, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
    allMessages,
    deleteMessage,
    listMessages,
    messageCounts,
    updateMessage,
    type MessageFilters,
} from "@/services/admin";
import { useSave } from "@/hooks/useSave";
import { useUrlState } from "@/hooks/useUrlState";
import { qk } from "@/lib/query-keys";
import { exportCsv, exportExcel, type ExportColumn } from "@/lib/export";
import { formatDateTime, timeAgo } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { MESSAGE_STATUS_LABELS, type ContactMessage, type MessageStatus } from "@/lib/types";
import { Badge, Button, ConfirmButton, EmptyState, ErrorState, Field, Input, Modal, PAGE_SIZES, PageHeader, Pagination, Skeleton, Textarea, cx, useConfirm } from "@/components/admin/ui";

const DEFAULTS = { status: "all", q: "", from: "", to: "", page: "0", size: "5", open: "" };
const TABS: (MessageStatus | "all")[] = ["all", "new", "read", "archived"];

const EXPORT_COLUMNS: ExportColumn<ContactMessage>[] = [
    { header: "Received", value: (m) => new Date(m.created_at), width: 20 },
    { header: "Name", value: (m) => m.name, width: 24 },
    { header: "Email", value: (m) => m.email, width: 30 },
    { header: "Phone", value: (m) => m.phone || null, width: 18 },
    { header: "Service", value: (m) => m.service || null, width: 28 },
    { header: "Message", value: (m) => m.message, width: 60 },
    { header: "Status", value: (m) => MESSAGE_STATUS_LABELS[m.status], width: 10 },
    { header: "Notes", value: (m) => m.notes || null, width: 40 },
    { header: "Read at", value: (m) => (m.read_at ? new Date(m.read_at) : null), width: 20 },
];

export default function MessagesInbox() {
    const [url, setUrl] = useUrlState(DEFAULTS);
    const page = Number(url.page) || 0;
    const size = Number(url.size) || 5;
    const filters: MessageFilters = { status: url.status as MessageFilters["status"], q: url.q, from: url.from, to: url.to };

    const [search, setSearch] = useState(url.q);
    const typing = useRef<ReturnType<typeof setTimeout>>(undefined);
    const [showFilters, setShowFilters] = useState(!!(url.from || url.to));
    const [exporting, setExporting] = useState(false);

    const list = useQuery({
        queryKey: [...qk.messages, "list", filters, page, size],
        queryFn: () => listMessages(filters, page, size),
    });
    const counts = useQuery({ queryKey: qk.messageCounts, queryFn: messageCounts });

    // The open enquiry (?open=<id>), kept while the dialog fades out.
    const [openMessage, setOpenMessage] = useState<ContactMessage | null>(null);
    const openId = Number(url.open) || null;
    useEffect(() => {
        if (!openId) return;
        const found = list.data?.rows.find((m) => m.id === openId);
        if (found) setOpenMessage(found);
    }, [openId, list.data]);

    const onSearch = (value: string) => {
        setSearch(value);
        clearTimeout(typing.current);
        typing.current = setTimeout(() => setUrl({ q: value.trim(), page: "0" }), 350);
    };

    const runExport = async (kind: "xlsx" | "csv") => {
        setExporting(true);
        try {
            const rows = await allMessages(filters);
            if (rows.length === 0) {
                toast.info("Nothing to export with these filters.");
                return;
            }
            if (kind === "xlsx") await exportExcel(rows, EXPORT_COLUMNS, "enquiries");
            else exportCsv(rows, EXPORT_COLUMNS, "enquiries");
            toast.success(`Exported ${rows.length} enquir${rows.length === 1 ? "y" : "ies"}.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Export failed.");
        } finally {
            setExporting(false);
        }
    };

    const activeFilters = [
        url.q && { key: "q", label: `“${url.q}”` },
        url.from && { key: "from", label: `From ${url.from}` },
        url.to && { key: "to", label: `To ${url.to}` },
    ].filter(Boolean) as { key: keyof typeof DEFAULTS; label: string }[];

    return (
        <div>
            <PageHeader
                title="Inbox"
                description="Enquiries sent from the website's contact form, newest first."
                actions={
                    <>
                        <Button icon={<FiDownload />} onClick={() => runExport("xlsx")} loading={exporting}>
                            Excel
                        </Button>
                        <Button icon={<FiDownload />} onClick={() => runExport("csv")} disabled={exporting}>
                            CSV
                        </Button>
                    </>
                }
            />

            {/* Status tabs with counts */}
            <div role="tablist" aria-label="Status" className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10 mb-4">
                {TABS.map((tab) => {
                    const active = url.status === tab;
                    const n = counts.data?.[tab];
                    return (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setUrl({ status: tab, page: "0" })}
                            className={cx(
                                "px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
                                active ? "border-[#F5C518] text-[#181B34] font-semibold dark:text-white" : "border-transparent text-slate-500 hover:text-[#181B34] dark:text-white/50 dark:hover:text-white",
                            )}
                        >
                            {tab === "all" ? "All" : MESSAGE_STATUS_LABELS[tab]}
                            {n !== undefined && (
                                <span className={cx("ml-2 rounded-full px-1.5 py-0.5 text-[11px]", tab === "new" && n > 0 ? "bg-[#F5C518] text-[#181B34] font-bold" : "bg-slate-100 dark:bg-white/10")}>
                                    {n}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <label className="relative flex-1">
                    <span className="sr-only">Search enquiries</span>
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search name, email, phone or message" className="pl-9" type="search" />
                </label>
                <Button icon={<FiFilter />} onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
                    Filters
                </Button>
            </div>
            {showFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 p-4 rounded-lg bg-white border border-slate-200 dark:bg-[#181B34] dark:border-white/10">
                    <Field label="From" id="f-from">
                        <Input id="f-from" type="date" value={url.from} max={url.to || undefined} onChange={(e) => setUrl({ from: e.target.value, page: "0" })} />
                    </Field>
                    <Field label="To" id="f-to">
                        <Input id="f-to" type="date" value={url.to} min={url.from || undefined} onChange={(e) => setUrl({ to: e.target.value, page: "0" })} />
                    </Field>
                </div>
            )}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {activeFilters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => {
                                if (f.key === "q") setSearch("");
                                setUrl({ [f.key]: "", page: "0" });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-xs text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white/70"
                        >
                            {f.label} <FiX />
                        </button>
                    ))}
                </div>
            )}

            {/* List */}
            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </div>
            ) : list.data.rows.length === 0 ? (
                <EmptyState
                    title={filters.status === "new" ? "No new enquiries" : "No enquiries here"}
                    body={activeFilters.length ? "Try clearing the search or dates." : "When someone sends the contact form, it appears here."}
                />
            ) : (
                <>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181B34] overflow-hidden" data-testid="messages-list">
                        {list.data.rows.map((m) => (
                            <li key={m.id}>
                                <button
                                    type="button"
                                    onClick={() => setUrl({ open: String(m.id) })}
                                    className="w-full text-left px-4 py-3.5 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <span className={cx("mt-1.5 w-2 h-2 rounded-full shrink-0", m.status === "new" ? "bg-[#F5C518]" : "bg-transparent")} aria-hidden />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-3">
                                            <span className={cx("truncate text-sm", m.status === "new" ? "font-semibold text-[#181B34] dark:text-white" : "text-slate-700 dark:text-white/80")}>
                                                {m.name}
                                                <span className="font-normal text-slate-400 dark:text-white/40"> · {m.email}</span>
                                            </span>
                                            <span className="shrink-0 text-xs text-slate-500 dark:text-white/40" title={formatDateTime(m.created_at)}>
                                                {timeAgo(m.created_at)}
                                            </span>
                                        </span>
                                        <span className="mt-0.5 flex items-center gap-2">
                                            {m.service && <Badge tone="blue">{m.service}</Badge>}
                                            {m.status === "archived" && <Badge>Archived</Badge>}
                                            <span className="truncate text-sm text-slate-500 dark:text-white/50">{m.message}</span>
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <Pagination
                        page={page}
                        pageSize={size}
                        total={list.data.total}
                        onPage={(p) => setUrl({ page: String(p) })}
                        onPageSize={(s) => setUrl({ size: String(s), page: "0" })}
                        sizes={PAGE_SIZES}
                    />
                </>
            )}

            <MessageDialog message={openMessage} open={!!openId && !!openMessage} onClose={() => setUrl({ open: "" })} />
        </div>
    );
}

function MessageDialog({ message, open, onClose }: { message: ContactMessage | null; open: boolean; onClose: () => void }) {
    const [notes, setNotes] = useState("");
    const confirm = useConfirm();
    const invalidate = [qk.messages, qk.overview];

    const update = useSave((patch: Parameters<typeof updateMessage>[1]) => updateMessage(message!.id, patch), {
        invalidate,
        publicChange: false,
    });
    const remove = useSave(() => deleteMessage(message!.id), {
        success: "Enquiry deleted.",
        invalidate,
        publicChange: false,
        onSuccess: onClose,
    });

    // Opening a new enquiry marks it read; its notes load into the box.
    const markRead = update.mutate;
    useEffect(() => {
        if (!open || !message) return;
        setNotes(message.notes);
        if (message.status === "new") markRead({ status: "read", read_at: new Date().toISOString() });
    }, [open, message, markRead]);

    if (!message) return null;
    const phoneDigits = message.phone.replace(/\D/g, "");

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={message.name}
            description={`Received ${formatDateTime(message.created_at)}`}
            size="lg"
            footer={
                <>
                    <ConfirmButton
                        onConfirm={() => remove.mutate(undefined)}
                        loading={remove.isPending}
                        icon={<FiTrash2 />}
                        question="Delete this enquiry for good?"
                        body="It is removed from the inbox and exports. To keep it out of the way instead, archive it."
                    >
                        Delete
                    </ConfirmButton>
                    <span className="flex-1" />
                    {message.status === "archived" ? (
                        <Button icon={<FiInbox />} onClick={() => update.mutate({ status: "read" }, { onSuccess: () => toast.success("Moved back to the inbox.") })}>
                            Unarchive
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => update.mutate({ status: "new", read_at: null }, { onSuccess: () => { toast.success("Marked as unread."); onClose(); } })}
                            >
                                Mark unread
                            </Button>
                            <Button
                                icon={<FiArchive />}
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: "Archive this enquiry?",
                                        body: "It moves to the Archived tab. You can bring it back any time.",
                                        confirmLabel: "Archive",
                                        tone: "primary",
                                    });
                                    if (ok) update.mutate({ status: "archived" }, { onSuccess: () => { toast.success("Archived."); onClose(); } });
                                }}
                            >
                                Archive
                            </Button>
                        </>
                    )}
                </>
            }
        >
            <dl className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-x-4 gap-y-3 text-sm mb-5">
                <dt className="text-slate-500 dark:text-white/50">Email</dt>
                <dd className="break-all text-[#181B34] dark:text-white">{message.email}</dd>
                <dt className="text-slate-500 dark:text-white/50">Phone</dt>
                <dd className="text-[#181B34] dark:text-white">{message.phone || "N/A"}</dd>
                <dt className="text-slate-500 dark:text-white/50">Service</dt>
                <dd className="text-[#181B34] dark:text-white">{message.service || "N/A"}</dd>
                <dt className="text-slate-500 dark:text-white/50">Status</dt>
                <dd>{MESSAGE_STATUS_LABELS[message.status]}{message.read_at ? ` · read ${formatDateTime(message.read_at)}` : ""}</dd>
            </dl>

            <div className="rounded-md bg-slate-50 dark:bg-white/5 p-4 text-sm leading-relaxed whitespace-pre-wrap text-[#181B34] dark:text-white/90 mb-5">{message.message}</div>

            <div className="flex flex-wrap gap-2 mb-6">
                <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your enquiry to Yuri Perfections")}&body=${encodeURIComponent(`Hello ${message.name},\n\n`)}`}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800]"
                >
                    <FiMail /> Reply by email
                </a>
                {phoneDigits && (
                    <>
                        <a href={`tel:${message.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-slate-300 dark:border-white/15">
                            <FiPhone /> Call
                        </a>
                        <a
                            href={whatsappLink(phoneDigits.startsWith("0") ? `256${phoneDigits.slice(1)}` : phoneDigits, `Hello ${message.name}, thank you for contacting Yuri Perfections.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-slate-300 dark:border-white/15"
                        >
                            <FaWhatsapp /> WhatsApp
                        </a>
                    </>
                )}
            </div>

            <Field label="Notes (staff only)" id="m-notes" hint="For example: called back on Monday, quote sent.">
                <Textarea id="m-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} />
            </Field>
            <div className="mt-2 flex justify-end">
                <Button
                    size="sm"
                    disabled={notes === message.notes}
                    loading={update.isPending}
                    onClick={() => update.mutate({ notes }, { onSuccess: () => toast.success("Notes saved.") })}
                >
                    Save notes
                </Button>
            </div>
        </Modal>
    );
}
