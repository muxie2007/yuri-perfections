"use client";

import { createClient } from "@/utils/supabase/client";
import { searchTerm } from "@/lib/format";
import type {
    ContactMessage,
    HeroSlide,
    MessageStatus,
    Profile,
    Project,
    ProjectCategory,
    ProjectImage,
    ProjectWithImages,
    Service,
    SiteSettings,
    Testimonial,
} from "@/lib/types";

/**
 * The dashboard's reads and writes, through the signed-in person's browser client. RLS is
 * the security boundary (supabase/migrations): these only work for active staff.
 */
const sb = () => createClient();

/** Turns a Supabase error into a sentence for a person. */
export function friendlyError(error: { message: string; code?: string } | null | undefined, what = "save"): Error {
    const message = error?.message ?? "";
    if (error?.code === "23505" || /duplicate key/i.test(message)) {
        if (/slug/i.test(message)) return new Error("Another project already uses that web address (slug). Change the slug.");
        if (/name/i.test(message)) return new Error("That name is already used. Pick another.");
        return new Error("That already exists.");
    }
    if (error?.code === "23503" || /foreign key/i.test(message)) {
        return new Error("It is still in use (for example, projects are in this category). Move them first.");
    }
    if (/row-level security|permission denied/i.test(message)) {
        return new Error("You do not have permission to do that. Ask the super admin to check your account.");
    }
    if (/fetch|network/i.test(message)) return new Error("No connection. Check the internet and try again.");
    return new Error(`Could not ${what}: ${message || "unknown error"}`);
}

function must<T>(result: { data: T | null; error: { message: string; code?: string } | null }, what?: string): T {
    if (result.error) throw friendlyError(result.error, what);
    return result.data as T;
}

// ── Enquiries ───────────────────────────────────────────────────────────────

export type MessageFilters = {
    status: MessageStatus | "all";
    q: string;
    from: string; // yyyy-mm-dd, inclusive (viewer's day)
    to: string;
};

function messageQuery(filters: MessageFilters, options?: { count?: "exact" }) {
    let query = sb().from("contact_messages").select("*", options);
    if (filters.status !== "all") query = query.eq("status", filters.status);
    const q = searchTerm(filters.q);
    if (q) {
        const like = `%${q}%`;
        query = query.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like},message.ilike.${like},service.ilike.${like}`);
    }
    // Day boundaries in the viewer's own clock, sent as UTC instants.
    if (filters.from) query = query.gte("created_at", new Date(`${filters.from}T00:00:00`).toISOString());
    if (filters.to) {
        const end = new Date(`${filters.to}T00:00:00`);
        end.setDate(end.getDate() + 1);
        query = query.lt("created_at", end.toISOString());
    }
    return query.order("created_at", { ascending: false }).order("id", { ascending: false });
}

export async function listMessages(filters: MessageFilters, page: number, pageSize: number) {
    const from = page * pageSize;
    const result = await messageQuery(filters, { count: "exact" }).range(from, from + pageSize - 1);
    return { rows: must(result, "load enquiries") as ContactMessage[], total: result.count ?? 0 };
}

/** Every enquiry matching the filters, a page of 500 at a time (for export). */
export async function allMessages(filters: MessageFilters): Promise<ContactMessage[]> {
    const rows: ContactMessage[] = [];
    for (let from = 0; ; from += 500) {
        const chunk = must(await messageQuery(filters).range(from, from + 499), "export") as ContactMessage[];
        rows.push(...chunk);
        if (chunk.length < 500) return rows;
    }
}

export async function messageCounts(): Promise<Record<MessageStatus | "all", number>> {
    const count = async (status?: MessageStatus) => {
        let query = sb().from("contact_messages").select("id", { count: "exact", head: true });
        if (status) query = query.eq("status", status);
        const { count: n, error } = await query;
        if (error) throw friendlyError(error, "count enquiries");
        return n ?? 0;
    };
    const [all, fresh, read, archived] = await Promise.all([count(), count("new"), count("read"), count("archived")]);
    return { all, new: fresh, read, archived };
}

export async function updateMessage(id: number, patch: Partial<Pick<ContactMessage, "status" | "notes" | "read_at">>) {
    return must(await sb().from("contact_messages").update(patch).eq("id", id).select().single(), "update the enquiry") as ContactMessage;
}

export async function deleteMessage(id: number) {
    must(await sb().from("contact_messages").delete().eq("id", id), "delete the enquiry");
}

// ── Projects ────────────────────────────────────────────────────────────────

export type ProjectListFilters = { q: string; category: string; status: "" | "active" | "inactive" };
export type ProjectRow = Project & { project_images: { count: number }[] };

export async function listProjects(filters: ProjectListFilters, page: number, pageSize: number) {
    let query = sb().from("projects").select("*, project_images(count)", { count: "exact" });
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.status) query = query.eq("status", filters.status);
    const q = searchTerm(filters.q);
    if (q) query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%,style.ilike.%${q}%,slug.ilike.%${q}%`);
    const from = page * pageSize;
    const result = await query
        .order("completed_on", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + pageSize - 1);
    return { rows: must(result, "load projects") as ProjectRow[], total: result.count ?? 0 };
}

export async function getProject(id: number): Promise<ProjectWithImages> {
    return must(
        await sb().from("projects").select("*, project_images(*)").eq("id", id).order("order", { referencedTable: "project_images" }).single(),
        "load the project",
    ) as ProjectWithImages;
}

export type ProjectInput = Pick<
    Project,
    "title" | "slug" | "category" | "style" | "location" | "description" | "completed_on" | "featured" | "status"
>;
export type PairInput = { id?: number; label: string; before: string; after: string };

/**
 * Saves a project and its before/after pairs as the form shows them: pairs keep the form's
 * order, missing ones are deleted, and the first pair becomes the cover. Returns the project
 * id and the image URLs no longer used (the caller removes those files).
 */
export async function saveProject(id: number | null, input: ProjectInput, pairs: PairInput[], previous?: ProjectWithImages) {
    const cover = pairs[0] ?? { before: "", after: "" };
    const row = { ...input, completed_on: input.completed_on || null, cover_before: cover.before, cover_after: cover.after };

    const saved = id
        ? (must(await sb().from("projects").update(row).eq("id", id).select("id").single(), "save the project") as { id: number })
        : (must(await sb().from("projects").insert(row).select("id").single(), "create the project") as { id: number });

    const keep = pairs.filter((p) => p.id).map((p) => p.id as number);
    const removed = (previous?.project_images ?? []).filter((img) => !keep.includes(img.id));
    if (removed.length) {
        must(await sb().from("project_images").delete().in("id", removed.map((r) => r.id)), "remove pairs");
    }

    const updates = pairs
        .map((p, i) => ({ ...p, order: i + 1 }))
        .filter((p) => p.id)
        .map((p) => sb().from("project_images").update({ label: p.label, before: p.before, after: p.after, order: p.order }).eq("id", p.id!));
    for (const result of await Promise.all(updates)) must(result, "save pairs");

    const inserts = pairs.flatMap((p, i) =>
        p.id ? [] : [{ project_id: saved.id, label: p.label, before: p.before, after: p.after, order: i + 1 }],
    );
    if (inserts.length) must(await sb().from("project_images").insert(inserts), "add pairs");

    // Files of removed pairs, and files replaced inside kept pairs.
    const nowUsed = new Set(pairs.flatMap((p) => [p.before, p.after]));
    const before = previous ? [previous.cover_before, previous.cover_after, ...previous.project_images.flatMap((i) => [i.before, i.after])] : [];
    const unused = before.filter((url) => url && !nowUsed.has(url));

    return { id: saved.id, unused };
}

export async function patchProject(id: number, patch: Partial<Pick<Project, "featured" | "status">>) {
    must(await sb().from("projects").update(patch).eq("id", id), "update the project");
}

export async function deleteProject(project: ProjectWithImages) {
    must(await sb().from("projects").delete().eq("id", project.id), "delete the project");
    return [project.cover_before, project.cover_after, ...project.project_images.flatMap((i) => [i.before, i.after])];
}

// ── Ordered lists: hero slides, services, testimonials, categories ──────────

export type OrderedTable = "hero_slides" | "services" | "testimonials" | "project_categories";
type RowOf<T extends OrderedTable> = T extends "hero_slides"
    ? HeroSlide
    : T extends "services"
      ? Service
      : T extends "testimonials"
        ? Testimonial
        : ProjectCategory;

export async function listOrdered<T extends OrderedTable>(table: T): Promise<RowOf<T>[]> {
    return must(await sb().from(table).select("*").order("order").order("id"), "load the list") as RowOf<T>[];
}

export async function insertOrdered<T extends OrderedTable>(table: T, row: Partial<RowOf<T>>, nextOrder: number) {
    return must(await sb().from(table).insert({ ...row, order: nextOrder }).select().single(), "add it") as RowOf<T>;
}

export async function updateOrdered<T extends OrderedTable>(table: T, id: number, patch: Partial<RowOf<T>>) {
    return must(await sb().from(table).update(patch).eq("id", id).select().single(), "save it") as RowOf<T>;
}

export async function deleteOrdered(table: OrderedTable, id: number) {
    must(await sb().from(table).delete().eq("id", id), "delete it");
}

/** Writes positions 1..n in the given order (after a move up or down). */
export async function saveOrder(table: OrderedTable, ids: number[]) {
    const results = await Promise.all(ids.map((id, i) => sb().from(table).update({ order: i + 1 }).eq("id", id)));
    for (const result of results) must(result, "save the order");
}

// ── Settings, profiles, overview ────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings> {
    return must(await sb().from("site_settings").select("*").eq("id", 1).single(), "load settings") as SiteSettings;
}

export async function updateSettings(patch: Partial<SiteSettings>) {
    return must(await sb().from("site_settings").update(patch).eq("id", 1).select().single(), "save settings") as SiteSettings;
}

export async function listProfiles(): Promise<Profile[]> {
    return must(await sb().from("profiles").select("*").order("created_at"), "load users") as Profile[];
}

export async function overviewCounts() {
    const head = (table: string, apply?: (q: any) => any) => {
        let query = sb().from(table).select("id", { count: "exact", head: true });
        if (apply) query = apply(query);
        return query.then(({ count, error }: { count: number | null; error: { message: string } | null }) => {
            if (error) throw friendlyError(error, "load figures");
            return count ?? 0;
        });
    };
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [newMessages, monthMessages, activeProjects, allProjects, services, slides] = await Promise.all([
        head("contact_messages", (q) => q.eq("status", "new")),
        head("contact_messages", (q) => q.gte("created_at", monthAgo)),
        head("projects", (q) => q.eq("status", "active")),
        head("projects"),
        head("services", (q) => q.eq("status", "active")),
        head("hero_slides", (q) => q.eq("status", "active")),
    ]);
    return { newMessages, monthMessages, activeProjects, allProjects, services, slides };
}

export type { ProjectImage };

// ── Visitors (docs/analytics.md) ────────────────────────────────────────────

export type VisitorStats = {
    views: number;
    visitors: number;
    visits: number;
    daily: { day: string; views: number; visitors: number }[];
    pages: { path: string; views: number }[];
    sources: { source: string; visits: number }[];
    countries: { country: string; visitors: number }[];
    devices: { device: "mobile" | "tablet" | "desktop"; visitors: number }[];
};

export async function visitorStats(days: number): Promise<VisitorStats> {
    return must(await sb().rpc("visitor_stats", { days }), "load visitor figures") as VisitorStats;
}
