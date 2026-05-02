import { createClient } from "@/utils/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { decodeImageUrl } from "@/utils/decode-url";

export type Service = {
    id: number;
    icon: string;
    title: string;
    description: string;
    image_url: string;
    order: number;
    status: "active" | "inactive";
    created_at: string;
};

export const SERVICES_QUERY_KEY = ["services", "active"];

// ── Client-side fetch ─────────────────────────────────────────────────────────
export async function getActiveServices(): Promise<Service[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("order", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((s) => ({ ...s, image_url: decodeImageUrl(s.image_url) }));
}

// ── Realtime subscription ─────────────────────────────────────────────────────
export function subscribeToServices(queryClient: QueryClient): () => void {
    const supabase = createClient();

    const channel = supabase
        .channel("services_realtime")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "services" },
            () => {
                queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
