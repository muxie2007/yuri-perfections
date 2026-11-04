"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import { FiEye, FiMonitor, FiRepeat, FiSmartphone, FiTablet, FiUsers } from "react-icons/fi";
import { visitorStats, type VisitorStats } from "@/services/admin";
import { useUrlState } from "@/hooks/useUrlState";
import { qk } from "@/lib/query-keys";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, cx } from "@/components/admin/ui";

const DEFAULTS = { days: "30" };
const RANGES = [
    { days: "7", label: "7 days" },
    { days: "30", label: "30 days" },
    { days: "90", label: "90 days" },
    { days: "365", label: "12 months" },
];

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (code: string) => (code ? (regionNames?.of(code) ?? code) : "Unknown");
const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

const PAGE_NAMES: Record<string, string> = { "/": "Home", "/projects": "Projects" };
const pageName = (path: string) => PAGE_NAMES[path] ?? (path.startsWith("/projects/") ? `Project: ${path.slice(10).replace(/-/g, " ")}` : path);

/**
 * Who visits the website: views, visitors, where they came from (Instagram, Google,
 * WhatsApp…), which pages, which countries, which devices. Anonymous counts only
 * (docs/analytics.md). Days are Kampala days.
 */
export default function VisitorsReport() {
    const [url, setUrl] = useUrlState(DEFAULTS);
    const days = Number(url.days) || 30;
    const stats = useQuery({ queryKey: qk.visitors(days), queryFn: () => visitorStats(days) });

    return (
        <div>
            <PageHeader
                title="Visitors"
                description="People who opened the website: how many, from where, and what they looked at."
                actions={
                    <div role="tablist" aria-label="Period" className="inline-flex rounded-md border border-slate-300 dark:border-white/15 overflow-hidden">
                        {RANGES.map((r) => (
                            <button
                                key={r.days}
                                role="tab"
                                aria-selected={url.days === r.days}
                                onClick={() => setUrl({ days: r.days })}
                                className={cx(
                                    "px-3 h-9 text-sm whitespace-nowrap transition-colors",
                                    url.days === r.days ? "bg-[#181B34] text-white dark:bg-[#F5C518] dark:text-[#181B34]" : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-white/5 dark:text-white/70",
                                )}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {stats.isError ? (
                <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
            ) : stats.isPending ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
                    <Skeleton className="h-56" />
                </div>
            ) : stats.data.views === 0 ? (
                <EmptyState
                    title="No visits recorded yet"
                    body="Counting starts once the new website is live. Visits from the live site appear here within a minute."
                />
            ) : (
                <Report data={stats.data} />
            )}
        </div>
    );
}

function Report({ data }: { data: VisitorStats }) {
    const tiles: { label: string; value: string; hint: string; icon: IconType }[] = [
        { label: "Visitors", value: data.visitors.toLocaleString(), hint: "different people (by browser)", icon: FiUsers },
        { label: "Visits", value: data.visits.toLocaleString(), hint: "times someone came to the site", icon: FiRepeat },
        { label: "Page views", value: data.views.toLocaleString(), hint: "pages opened in total", icon: FiEye },
        { label: "Pages per visit", value: data.visits ? (data.views / data.visits).toFixed(1) : "0", hint: "how far people look", icon: FiMonitor },
    ];
    const peak = Math.max(1, ...data.daily.map((d) => d.views));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#181B34]">
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-white/50">
                            {t.label}
                            <t.icon />
                        </div>
                        <p className="mt-2 text-2xl font-semibold tabular-nums text-[#181B34] dark:text-white">{t.value}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{t.hint}</p>
                    </div>
                ))}
            </div>

            <Card title="Page views per day" description="Hover a bar for the day's figures.">
                <div className="flex items-end gap-[3px] h-44" role="img" aria-label="Page views per day">
                    {data.daily.map((d) => (
                        <div key={d.day} className="group relative flex-1 h-full flex items-end">
                            <div className="w-full rounded-t bg-[#F5C518]/80 group-hover:bg-[#F5C518] transition-colors" style={{ height: `${Math.max(d.views ? 3 : 0, (d.views / peak) * 100)}%` }} />
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-[#181B34] px-2 py-1 text-[11px] text-white z-10">
                                {dayLabel.format(new Date(d.day))}: {d.views} views, {d.visitors} visitors
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-white/40">
                    {/* The series always covers every day of the period, so both ends exist. */}
                    <span>{data.daily[0] && dayLabel.format(new Date(data.daily[0].day))}</span>
                    <span>{data.daily.at(-1) && dayLabel.format(new Date(data.daily.at(-1)!.day))}</span>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Where visits come from" description="The site or app that sent them. Direct: typed the address or opened a saved link.">
                    <Bars rows={data.sources.map((s) => ({ key: s.source, label: s.source, value: s.visits }))} unit="visits" />
                </Card>
                <Card title="Countries" description="Visitors by country.">
                    <Bars
                        rows={data.countries.map((c) => ({
                            key: c.country || "unknown",
                            value: c.visitors,
                            label: (
                                <span className="flex items-center gap-2 min-w-0">
                                    {c.country ? (
                                        <Image
                                            src={`https://flagcdn.com/w40/${c.country.toLowerCase()}.png`}
                                            alt=""
                                            width={20}
                                            height={15}
                                            unoptimized
                                            className="rounded-sm shrink-0 border border-slate-200 dark:border-white/10"
                                        />
                                    ) : (
                                        <span className="w-5 h-[15px] rounded-sm bg-slate-200 dark:bg-white/10 shrink-0" />
                                    )}
                                    <span className="truncate">{countryName(c.country)}</span>
                                </span>
                            ),
                        }))}
                        unit="visitors"
                    />
                </Card>
                <Card title="Most viewed pages">
                    <Bars rows={data.pages.map((p) => ({ key: p.path, label: <span className="truncate">{pageName(p.path)}</span>, value: p.views }))} unit="views" />
                </Card>
            </div>

            <Card title="Devices" description="What visitors used to open the site.">
                <div className="grid grid-cols-3 gap-3">
                    {(["mobile", "desktop", "tablet"] as const).map((d) => {
                        const n = data.devices.find((x) => x.device === d)?.visitors ?? 0;
                        const total = Math.max(1, data.devices.reduce((a, x) => a + x.visitors, 0));
                        const Icon = d === "mobile" ? FiSmartphone : d === "tablet" ? FiTablet : FiMonitor;
                        return (
                            <div key={d} className="rounded-md bg-slate-50 dark:bg-white/5 p-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60 capitalize">
                                    <Icon /> {d}
                                </div>
                                <p className="mt-1 text-xl font-semibold tabular-nums text-[#181B34] dark:text-white">{Math.round((n / total) * 100)}%</p>
                                <p className="text-xs text-slate-500 dark:text-white/40">{n} visitors</p>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

function Bars({ rows, unit }: { rows: { key: string; label: React.ReactNode; value: number }[]; unit: string }) {
    if (rows.length === 0) return <p className="text-sm text-slate-500 dark:text-white/50">Nothing yet.</p>;
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <ul className="space-y-2.5">
            {rows.map((r) => (
                <li key={r.key} title={`${r.value} ${unit}`}>
                    <div className="flex items-center justify-between gap-3 text-sm text-[#181B34] dark:text-white/85">
                        {r.label}
                        <span className="tabular-nums text-slate-500 dark:text-white/50">{r.value}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-[#F5C518]" style={{ width: `${(r.value / max) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}
