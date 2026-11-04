"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * List state in the URL (page, size, search, filters), so a refresh or a shared link
 * reopens the same view. Values equal to their default are left out of the URL.
 * Pass `defaults` as a module-level constant so its identity is stable.
 */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const state = Object.fromEntries(Object.entries(defaults).map(([k, d]) => [k, params.get(k) ?? d])) as T;

    const set = useCallback(
        (patch: Partial<T>) => {
            const sp = new URLSearchParams(params.toString());
            for (const [key, value] of Object.entries(patch)) {
                if (value === undefined || value === "" || value === defaults[key]) sp.delete(key);
                else sp.set(key, String(value));
            }
            const qs = sp.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [params, pathname, router, defaults],
    );

    return [state, set] as const;
}
