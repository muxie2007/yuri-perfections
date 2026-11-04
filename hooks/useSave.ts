"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { revalidateSite } from "@/app/actions/revalidate";

/**
 * A dashboard write: runs it, toasts the result, refreshes the lists it touched and, when
 * it changes what visitors see, refreshes the cached public pages at once.
 */
export function useSave<TArgs, TResult>(
    fn: (args: TArgs) => Promise<TResult>,
    options: {
        success?: string | ((result: TResult, args: TArgs) => string);
        invalidate?: QueryKey[];
        /** False for staff-only data (enquiries, users). */
        publicChange?: boolean;
        onSuccess?: (result: TResult, args: TArgs) => void;
    } = {},
) {
    const queryClient = useQueryClient();
    const { success, invalidate = [], publicChange = true, onSuccess } = options;

    return useMutation({
        mutationFn: fn,
        onSuccess: async (result, args) => {
            if (success) toast.success(typeof success === "function" ? success(result, args) : success);
            await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
            if (publicChange) {
                revalidateSite().catch(() => toast.warning("Saved. The public site will show it within the hour."));
            }
            onSuccess?.(result, args);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Something went wrong."),
    });
}
