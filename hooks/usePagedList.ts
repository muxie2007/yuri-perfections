"use client";

import { useRef, useState } from "react";
import { useUrlState } from "./useUrlState";
import { DEFAULT_PAGE_SIZE } from "@/components/admin/ui";

const DEFAULTS = { q: "", page: "0", size: String(DEFAULT_PAGE_SIZE) };

/**
 * Search and pages for a short list that is loaded whole (hero slides, services,
 * categories): the rows are few, so they are filtered and paged in the browser, with the
 * search, page and size in the URL like every other list. Moving a row up or down still
 * works across pages because it uses the row's place in the whole list.
 */
export function usePagedList<T>(rows: T[], text: (row: T) => string) {
    const [url, setUrl] = useUrlState(DEFAULTS);
    const [search, setSearch] = useState(url.q);
    const typing = useRef<ReturnType<typeof setTimeout>>(undefined);

    const q = url.q.trim().toLowerCase();
    const filtered = q ? rows.filter((r) => text(r).toLowerCase().includes(q)) : rows;
    const size = Number(url.size) || DEFAULT_PAGE_SIZE;
    const lastPage = Math.max(0, Math.ceil(filtered.length / size) - 1);
    const page = Math.min(Number(url.page) || 0, lastPage);

    return {
        pageRows: filtered.slice(page * size, (page + 1) * size),
        total: filtered.length,
        page,
        size,
        search,
        onSearch: (value: string) => {
            setSearch(value);
            clearTimeout(typing.current);
            typing.current = setTimeout(() => setUrl({ q: value.trim(), page: "0" }), 300);
        },
        setPage: (p: number) => setUrl({ page: String(p) }),
        setSize: (s: number) => setUrl({ size: String(s), page: "0" }),
        /** Where a row sits in the whole list (for moving it up or down). */
        indexOf: (row: T) => rows.indexOf(row),
        filtering: !!q,
    };
}
