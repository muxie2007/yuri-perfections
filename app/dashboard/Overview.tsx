"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import { FiArrowRight, FiFolder, FiImage, FiInbox, FiPlus, FiSettings, FiTool } from "react-icons/fi";
import { listMessages, overviewCounts } from "@/services/admin";
import { qk } from "@/lib/query-keys";
import { timeAgo } from "@/lib/format";
import { useStaff } from "@/components/admin/StaffContext";
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, cx } from "@/components/admin/ui";

export default function Overview() {
    const staff = useStaff();
    const counts = useQuery({ queryKey: qk.overview, queryFn: overviewCounts });
    const recent = useQuery({
        queryKey: [...qk.messages, "recent"],
        queryFn: () => listMessages({ status: "all", q: "", from: "", to: "" }, 0, 6),
    });

    const firstName = (staff.full_name || "").split(" ")[0];
    const tiles: { label: string; value?: number; hint: string; href: string; icon: IconType; highlight?: boolean }[] = [
        { label: "New enquiries", value: counts.data?.newMessages, hint: "waiting to be read", href: "/dashboard/messages?status=new", icon: FiInbox, highlight: !!counts.data?.newMessages },
        { label: "Enquiries", value: counts.data?.monthMessages, hint: "in the last 30 days", href: "/dashboard/messages", icon: FiInbox },
        { label: "Live projects", value: counts.data?.activeProjects, hint: `of ${counts.data?.allProjects ?? "…"} in total`, href: "/dashboard/projects", icon: FiFolder },
        { label: "Live services", value: counts.data?.services, hint: `${counts.data?.slides ?? "…"} hero slides live`, href: "/dashboard/services", icon: FiTool },
    ];

    return (
        <div>
            <PageHeader title={firstName ? `Welcome back, ${firstName}` : "Welcome back"} description="What is happening on the website." />

            {counts.isError && <ErrorState error={counts.error} onRetry={() => counts.refetch()} />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {tiles.map((t) => (
                    <Link
                        key={t.label}
                        href={t.href}
                        className={cx(
                            "rounded-lg border p-4 sm:p-5 transition-colors",
                            t.highlight
                                ? "border-[#F5C518] bg-[#F5C518]/10 hover:bg-[#F5C518]/20"
                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#181B34] dark:hover:border-white/20",
                        )}
                    >
                        <div className="flex items-center justify-between text-slate-500 dark:text-white/50">
                            <span className="text-xs sm:text-sm">{t.label}</span>
                            <t.icon />
                        </div>
                        {counts.isPending ? (
                            <Skeleton className="h-8 w-14 mt-2" />
                        ) : (
                            <p className="mt-2 text-2xl sm:text-3xl font-semibold tabular-nums text-[#181B34] dark:text-white">{t.value ?? "–"}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{t.hint}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card
                    className="lg:col-span-2"
                    title="Latest enquiries"
                    actions={
                        <Link href="/dashboard/messages" className="text-sm text-slate-600 hover:text-[#181B34] dark:text-white/60 dark:hover:text-white flex items-center gap-1">
                            Open inbox <FiArrowRight />
                        </Link>
                    }
                >
                    {recent.isPending ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-12" />
                            ))}
                        </div>
                    ) : recent.isError ? (
                        <ErrorState error={recent.error} onRetry={() => recent.refetch()} />
                    ) : recent.data.rows.length === 0 ? (
                        <EmptyState title="No enquiries yet" body="Messages from the contact form will show here." />
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-white/10 -my-2">
                            {recent.data.rows.map((m) => (
                                <li key={m.id}>
                                    <Link href={`/dashboard/messages?open=${m.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                                        <span className={cx("w-2 h-2 rounded-full shrink-0", m.status === "new" ? "bg-[#F5C518]" : "bg-slate-200 dark:bg-white/15")} />
                                        <span className="min-w-0 flex-1">
                                            <span className={cx("block truncate text-sm", m.status === "new" ? "font-semibold text-[#181B34] dark:text-white" : "text-slate-700 dark:text-white/80")}>
                                                {m.name}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500 dark:text-white/50">{m.message}</span>
                                        </span>
                                        {m.service && (
                                            <span className="hidden sm:block">
                                                <Badge tone="blue">{m.service}</Badge>
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 dark:text-white/40 whitespace-nowrap">{timeAgo(m.created_at)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Quick actions">
                    <div className="grid gap-2">
                        {[
                            { href: "/dashboard/projects/new", label: "Add a project", icon: FiPlus },
                            { href: "/dashboard/hero-slides", label: "Change hero photos", icon: FiImage },
                            { href: "/dashboard/services", label: "Edit services", icon: FiTool },
                            { href: "/dashboard/settings", label: "Phone, email and socials", icon: FiSettings },
                        ].map((a) => (
                            <Link
                                key={a.href}
                                href={a.href}
                                className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5 text-sm text-[#181B34] hover:border-[#F5C518] hover:bg-[#F5C518]/5 dark:border-white/10 dark:text-white"
                            >
                                <a.icon className="text-slate-500 dark:text-white/50" /> {a.label}
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
