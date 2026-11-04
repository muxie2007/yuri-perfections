// Display helpers. Times are stored in UTC; shown in the viewer's clock.

const dateTime = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return "N/A";
    return dateTime.format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "N/A";
    return dateOnly.format(new Date(iso));
}

/** "5 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(iso: string): string {
    const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return formatDate(iso);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

/**
 * Text a visitor typed, made safe for a PostgREST `or=(...)` filter: the characters that
 * delimit that syntax are dropped, so a search can never become a different filter.
 */
export function searchTerm(raw: string | null | undefined): string {
    return (raw ?? "").replace(/[,()*%\\:"'.]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
