import { createClient } from "@/utils/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { decodeImageUrl } from "@/utils/decode-url";

export type ProjectImage = {
    id: number;
    project_id: number;
    before: string;
    after: string;
    label: string;
    order: number;
    created_at: string;
};

export type Project = {
    id: number;
    slug: string;
    title: string;
    style: string;
    category: string;
    location: string;
    description: string;
    cover_before: string;
    cover_after: string;
    project_images: ProjectImage[];
    order: number;
    status: "active" | "inactive";
    created_at: string;
};

export const PROJECTS_QUERY_KEY = ["projects", "active"];

// ── Client-side fetch ─────────────────────────────────────────────────────────
export async function getActiveProjects(): Promise<Project[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*, project_images(*)")
        .eq("status", "active")
        .order("order", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((p) => ({
        ...p,
        cover_before: decodeImageUrl(p.cover_before),
        cover_after: decodeImageUrl(p.cover_after),
        project_images: [...(p.project_images ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((img) => ({ ...img, before: decodeImageUrl(img.before), after: decodeImageUrl(img.after) })),
    }));
}

// ── Realtime subscription ─────────────────────────────────────────────────────
export function subscribeToProjects(queryClient: QueryClient): () => void {
    const supabase = createClient();

    const channel = supabase
        .channel("projects_realtime")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "projects" },
            () => {
                queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
            }
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "project_images" },
            () => {
                queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
