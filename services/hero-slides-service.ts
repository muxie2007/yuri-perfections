import { createClient } from "@/utils/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { decodeImageUrl } from "@/utils/decode-url";

export type HeroSlide = {
    id: number;
    image_url: string;
    alt_text: string;
    order: number;
    status: "active" | "inactive";
    created_at: string;
};

export const HERO_SLIDES_QUERY_KEY = ["hero_slides", "active"];

// ── Client-side fetch ─────────────────────────────────────────────────────────
export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("status", "active")
        .order("order", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((s) => ({ ...s, image_url: decodeImageUrl(s.image_url) }));
}

// ── Realtime subscription ─────────────────────────────────────────────────────
export function subscribeToHeroSlides(queryClient: QueryClient): () => void {
    const supabase = createClient();

    const channel = supabase
        .channel("hero_slides_realtime")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "hero_slides",
            },
            () => {
                queryClient.invalidateQueries({ queryKey: HERO_SLIDES_QUERY_KEY });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}