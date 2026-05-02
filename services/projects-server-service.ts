"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { Project } from "./projects-service";
import { decodeImageUrl } from "@/utils/decode-url";

async function buildClient() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

// ── All active projects (with images) ────────────────────────────────────────
export async function getActiveProjectsServer(): Promise<Project[]> {
    const supabase = await buildClient();

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

// ── Single project by slug (with images) ─────────────────────────────────────
export async function getProjectBySlugServer(slug: string): Promise<Project | null> {
    const supabase = await buildClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*, project_images(*)")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

    if (error) return null;

    return {
        ...data,
        cover_before: decodeImageUrl(data.cover_before),
        cover_after: decodeImageUrl(data.cover_after),
        project_images: [...(data.project_images ?? [])]
            .sort((a, b) => a.order - b.order)
            .map((img) => ({ ...img, before: decodeImageUrl(img.before), after: decodeImageUrl(img.after) })),
    };
}
