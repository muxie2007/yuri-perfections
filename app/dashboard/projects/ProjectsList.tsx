"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiExternalLink, FiPlus, FiSearch, FiStar } from "react-icons/fi";
import { listOrdered, listProjects, patchProject, type ProjectListFilters } from "@/services/admin";
import { useSave } from "@/hooks/useSave";
import { useUrlState } from "@/hooks/useUrlState";
import { qk } from "@/lib/query-keys";
import { formatDate } from "@/lib/format";
import { Badge, Button, EmptyState, ErrorState, Input, PAGE_SIZES, PageHeader, Pagination, Select, Skeleton, Switch, cx, useConfirm } from "@/components/admin/ui";

const DEFAULTS = { q: "", category: "", status: "", page: "0", size: "5" };

export default function ProjectsList() {
    const [url, setUrl] = useUrlState(DEFAULTS);
    const page = Number(url.page) || 0;
    const size = Number(url.size) || 5;
    const filters: ProjectListFilters = { q: url.q, category: url.category, status: url.status as ProjectListFilters["status"] };

    const [search, setSearch] = useState(url.q);
    const confirm = useConfirm();
    const typing = useRef<ReturnType<typeof setTimeout>>(undefined);

    const list = useQuery({ queryKey: [...qk.projects, "list", filters, page, size], queryFn: () => listProjects(filters, page, size) });
    const categories = useQuery({ queryKey: qk.ordered("project_categories"), queryFn: () => listOrdered("project_categories") });

    const patch = useSave(({ id, ...change }: { id: number; featured?: boolean; status?: "active" | "inactive" }) => patchProject(id, change), {
        success: (_, args) =>
            args.status ? (args.status === "active" ? "Project is live." : "Project hidden from the website.") : args.featured ? "Featured on the home page." : "No longer featured.",
        invalidate: [qk.projects, qk.overview],
    });

    return (
        <div>
            <PageHeader
                title="Projects"
                description="Your portfolio. Each project has before and after photos; featured ones show on the home page."
                actions={
                    <Link href="/dashboard/projects/new">
                        <Button variant="primary" icon={<FiPlus />}>
                            New project
                        </Button>
                    </Link>
                }
            />

            <div className="flex flex-col md:flex-row gap-2 mb-4">
                <label className="relative flex-1">
                    <span className="sr-only">Search projects</span>
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="search"
                        value={search}
                        placeholder="Search title, place or style"
                        className="pl-9"
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            clearTimeout(typing.current);
                            typing.current = setTimeout(() => setUrl({ q: value.trim(), page: "0" }), 350);
                        }}
                    />
                </label>
                <Select value={url.category} onChange={(e) => setUrl({ category: e.target.value, page: "0" })} className="md:w-48" aria-label="Category">
                    <option value="">All categories</option>
                    {categories.data?.map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </Select>
                <Select value={url.status} onChange={(e) => setUrl({ status: e.target.value, page: "0" })} className="md:w-40" aria-label="Visibility">
                    <option value="">Live and hidden</option>
                    <option value="active">Live only</option>
                    <option value="inactive">Hidden only</option>
                </Select>
            </div>

            {list.isError ? (
                <ErrorState error={list.error} onRetry={() => list.refetch()} />
            ) : list.isPending ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20" />
                    ))}
                </div>
            ) : list.data.rows.length === 0 ? (
                <EmptyState
                    title="No projects found"
                    body={url.q || url.category || url.status ? "Try clearing the search or filters." : "Add your first project to show it on the website."}
                    action={
                        <Link href="/dashboard/projects/new">
                            <Button variant="primary" icon={<FiPlus />}>
                                New project
                            </Button>
                        </Link>
                    }
                />
            ) : (
                <>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181B34]" data-testid="admin-projects">
                        {list.data.rows.map((p) => {
                            const pairs = p.project_images?.[0]?.count ?? 0;
                            return (
                                <li key={p.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                                    <Link href={`/dashboard/projects/${p.id}`} className="relative w-20 h-16 sm:w-28 sm:h-20 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-white/5">
                                        {p.cover_after && <Image src={p.cover_after} alt="" fill sizes="112px" className="object-cover" />}
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/dashboard/projects/${p.id}`} className="font-medium text-[#181B34] dark:text-white hover:underline truncate block">
                                            {p.title}
                                        </Link>
                                        <p className="text-xs text-slate-500 dark:text-white/50 truncate">
                                            {[p.category, p.location, p.completed_on && formatDate(p.completed_on)].filter(Boolean).join(" · ")}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {p.status === "active" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}
                                            {p.featured && <Badge tone="gold">Featured</Badge>}
                                            <Badge tone={pairs ? "slate" : "red"}>
                                                {pairs} photo pair{pairs === 1 ? "" : "s"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const ok = await confirm({
                                                    title: p.featured ? `Stop featuring "${p.title}"?` : `Feature "${p.title}" on the home page?`,
                                                    body: p.featured ? "It stays on the website, just not first in the home page portfolio." : "Featured projects show first in the home page portfolio.",
                                                    confirmLabel: p.featured ? "Stop featuring" : "Feature it",
                                                    tone: "primary",
                                                });
                                                if (ok) patch.mutate({ id: p.id, featured: !p.featured });
                                            }}
                                            className={cx("p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/10", p.featured ? "text-[#d4a800]" : "text-slate-400")}
                                            aria-label={p.featured ? "Remove from home page" : "Feature on home page"}
                                            title={p.featured ? "Featured on the home page" : "Feature on the home page"}
                                        >
                                            <FiStar className={p.featured ? "fill-current" : ""} />
                                        </button>
                                        <Switch
                                            checked={p.status === "active"}
                                            label={`${p.title} live on website`}
                                            onChange={async (on) => {
                                                const ok = await confirm({
                                                    title: on ? `Show "${p.title}" on the website?` : `Hide "${p.title}" from the website?`,
                                                    body: on ? "Visitors will see it straight away." : "It stays here in the dashboard; visitors will not see it.",
                                                    confirmLabel: on ? "Show it" : "Hide it",
                                                    tone: on ? "primary" : "danger",
                                                });
                                                if (ok) patch.mutate({ id: p.id, status: on ? "active" : "inactive" });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {p.status === "active" && (
                                            <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="View on website" title="View on website">
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        <Link href={`/dashboard/projects/${p.id}`} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label={`Edit ${p.title}`} title="Edit">
                                            <FiEdit2 />
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <Pagination
                        page={page}
                        pageSize={size}
                        total={list.data.total}
                        onPage={(n) => setUrl({ page: String(n) })}
                        onPageSize={(s) => setUrl({ size: String(s), page: "0" })}
                        sizes={PAGE_SIZES}
                    />
                </>
            )}
        </div>
    );
}
