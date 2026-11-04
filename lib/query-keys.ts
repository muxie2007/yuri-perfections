/** Dashboard query keys, in one place so a save invalidates exactly what it changed. */
export const qk = {
    overview: ["admin", "overview"] as const,
    messages: ["admin", "messages"] as const,
    messageCounts: ["admin", "messages", "counts"] as const,
    projects: ["admin", "projects"] as const,
    project: (id: number) => ["admin", "projects", id] as const,
    ordered: (table: string) => ["admin", table] as const,
    settings: ["admin", "settings"] as const,
    profiles: ["admin", "profiles"] as const,
    visitors: (days: number) => ["admin", "visitors", days] as const,
};
