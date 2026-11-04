"use client";

import { useQuery } from "@tanstack/react-query";
import { deleteOrdered, insertOrdered, listOrdered, saveOrder, updateOrdered, type OrderedTable } from "@/services/admin";
import { removeImages } from "@/lib/images";
import { qk } from "@/lib/query-keys";
import { useSave } from "./useSave";

/**
 * A short list the owner orders by hand (hero slides, services, testimonials, categories).
 * Shown whole, not paged: these stay small, and moving rows up and down across pages would
 * be confusing. `imageKeys` are the columns holding uploaded photos, removed with the row.
 */
export function useOrderedList<T extends OrderedTable>(table: T, noun: string, imageKeys: string[] = []) {
    const key = qk.ordered(table);
    const list = useQuery({ queryKey: key, queryFn: () => listOrdered(table) });
    const rows = list.data ?? [];
    const invalidate = [key, qk.overview];

    const add = useSave((row: Record<string, unknown>) => insertOrdered(table, row as never, (rows.at(-1)?.order ?? 0) + 1), {
        success: `${noun} added.`,
        invalidate,
    });

    const update = useSave(
        async ({ id, patch, replaced }: { id: number; patch: Record<string, unknown>; replaced?: string[] }) => {
            const saved = await updateOrdered(table, id, patch as never);
            if (replaced?.length) await removeImages(replaced);
            return saved;
        },
        { success: `${noun} saved.`, invalidate },
    );

    const remove = useSave(
        async (row: { id: number } & Record<string, unknown>) => {
            await deleteOrdered(table, row.id);
            await removeImages(imageKeys.map((k) => row[k] as string));
        },
        { success: `${noun} deleted.`, invalidate },
    );

    const move = useSave(
        (args: { index: number; delta: -1 | 1 }) => {
            const ids = rows.map((r) => r.id);
            const target = args.index + args.delta;
            [ids[args.index], ids[target]] = [ids[target], ids[args.index]];
            return saveOrder(table, ids);
        },
        { invalidate },
    );

    return { list, rows, add, update, remove, move };
}
