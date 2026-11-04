import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS } from "@/lib/site";
import { searchTerm } from "@/lib/format";
import type {
    HeroSlide,
    ProjectCard,
    ProjectCategory,
    ProjectWithImages,
    Service,
    SiteSettings,
    Testimonial,
} from "@/lib/types";

/**
 * Everything the public site reads. Each function takes a Supabase client, so the same
 * query runs on the server (utils/supabase/public.ts) and in the browser (the projects
 * page's "Load more"). RLS returns only active rows to visitors.
 *
 * Errors throw: during ISR a throw keeps the last good page instead of caching a broken one.
 */

/**
 * Storage URLs with spaces arrive encoded (%20); next/image would encode them again (%2520)
 * and get a 400. Decoding once lets it encode them correctly.
 */
export function cleanImageUrl(url: string): string {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
}

function fail(what: string, error: { message: string }): never {
    throw new Error(`Could not load ${what}: ${error.message}`);
}

export async function getSiteSettings(sb: SupabaseClient): Promise<SiteSettings> {
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) {
        if (error) console.error("site_settings:", error.message);
        return DEFAULT_SETTINGS;
    }
    return {
        ...DEFAULT_SETTINGS,
        ...data,
        about_image_main: cleanImageUrl(data.about_image_main || DEFAULT_SETTINGS.about_image_main),
        about_image_accent: cleanImageUrl(data.about_image_accent || DEFAULT_SETTINGS.about_image_accent),
    };
}

export async function getHeroSlides(sb: SupabaseClient): Promise<HeroSlide[]> {
    const { data, error } = await sb.from("hero_slides").select("*").eq("status", "active").order("order");
    if (error) fail("hero slides", error);
    return (data ?? []).map((s) => ({ ...s, image_url: cleanImageUrl(s.image_url) }));
}

export async function getServices(sb: SupabaseClient): Promise<Service[]> {
    const { data, error } = await sb.from("services").select("*").eq("status", "active").order("order");
    if (error) fail("services", error);
    return (data ?? []).map((s) => ({ ...s, image_url: cleanImageUrl(s.image_url) }));
}

export async function getTestimonials(sb: SupabaseClient): Promise<Testimonial[]> {
    const { data, error } = await sb.from("testimonials").select("*").eq("status", "active").order("order");
    if (error) fail("testimonials", error);
    return (data ?? []).map((t) => ({ ...t, avatar_url: t.avatar_url ? cleanImageUrl(t.avatar_url) : "" }));
}

export async function getCategories(sb: SupabaseClient): Promise<ProjectCategory[]> {
    const { data, error } = await sb.from("project_categories").select("*").order("order").order("name");
    if (error) fail("categories", error);
    return data ?? [];
}

// ── Projects ────────────────────────────────────────────────────────────────

const CARD_COLUMNS =
    "id, slug, title, style, category, location, description, cover_before, cover_after, featured, completed_on, project_images(count)";

type CardRow = Omit<ProjectCard, "pair_count"> & { project_images: { count: number }[] };

function toCard(row: CardRow): ProjectCard {
    const { project_images, ...rest } = row;
    return {
        ...rest,
        cover_before: cleanImageUrl(rest.cover_before),
        cover_after: cleanImageUrl(rest.cover_after),
        pair_count: project_images?.[0]?.count ?? 0,
    };
}

/** Newest work first: by completion date, then when it was added. */
function newestFirst<T extends { order: (column: string, options?: object) => T }>(query: T): T {
    return query
        .order("completed_on", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
}

export const PROJECTS_PAGE_SIZE = 9;

export type ProjectFilters = { category?: string | null; q?: string | null };
export type ProjectsPage = { projects: ProjectCard[]; total: number; page: number };

export async function getProjectsPage(
    sb: SupabaseClient,
    filters: ProjectFilters,
    page = 0,
    pageSize = PROJECTS_PAGE_SIZE,
): Promise<ProjectsPage> {
    let query = sb.from("projects").select(CARD_COLUMNS, { count: "exact" }).eq("status", "active");

    if (filters.category) query = query.eq("category", filters.category);
    const q = searchTerm(filters.q);
    if (q) {
        const like = `%${q}%`;
        query = query.or(`title.ilike.${like},location.ilike.${like},style.ilike.${like},description.ilike.${like}`);
    }

    const from = page * pageSize;
    const { data, error, count } = await newestFirst(query).range(from, from + pageSize - 1);
    if (error) fail("projects", error);

    return { projects: ((data ?? []) as unknown as CardRow[]).map(toCard), total: count ?? 0, page };
}

/** The home page's projects: the featured ones, topped up with the newest. */
export async function getFeaturedProjects(sb: SupabaseClient, limit = 6): Promise<ProjectCard[]> {
    const { data, error } = await newestFirst(
        sb.from("projects").select(CARD_COLUMNS).eq("status", "active").order("featured", { ascending: false }),
    ).limit(limit);
    if (error) fail("featured projects", error);
    return ((data ?? []) as unknown as CardRow[]).map(toCard);
}

export async function getProjectBySlug(sb: SupabaseClient, slug: string): Promise<ProjectWithImages | null> {
    const { data, error } = await sb
        .from("projects")
        .select("*, project_images(*)")
        .eq("slug", slug)
        .eq("status", "active")
        .order("order", { referencedTable: "project_images" })
        .maybeSingle();
    if (error) fail("the project", error);
    if (!data) return null;

    return {
        ...data,
        cover_before: cleanImageUrl(data.cover_before),
        cover_after: cleanImageUrl(data.cover_after),
        project_images: (data.project_images ?? []).map((img: ProjectWithImages["project_images"][number]) => ({
            ...img,
            before: cleanImageUrl(img.before),
            after: cleanImageUrl(img.after),
        })),
    };
}

/** Up to `limit` other projects, same category first. */
export async function getRelatedProjects(
    sb: SupabaseClient,
    project: { id: number; category: string },
    limit = 3,
): Promise<ProjectCard[]> {
    const same = await newestFirst(
        sb.from("projects").select(CARD_COLUMNS).eq("status", "active").eq("category", project.category).neq("id", project.id),
    ).limit(limit);
    if (same.error) fail("related projects", same.error);
    const cards = ((same.data ?? []) as unknown as CardRow[]).map(toCard);
    if (cards.length >= limit) return cards;

    const others = await newestFirst(
        sb
            .from("projects")
            .select(CARD_COLUMNS)
            .eq("status", "active")
            .neq("category", project.category)
            .neq("id", project.id),
    ).limit(limit - cards.length);
    if (others.error) fail("related projects", others.error);
    return [...cards, ...((others.data ?? []) as unknown as CardRow[]).map(toCard)];
}

export async function getActiveProjectSlugs(sb: SupabaseClient): Promise<{ slug: string; updated_at: string }[]> {
    const { data, error } = await sb.from("projects").select("slug, updated_at").eq("status", "active");
    if (error) fail("project slugs", error);
    return data ?? [];
}
