// Row shapes of the Supabase tables (supabase/migrations). One place, used by the site and
// the dashboard. Fixed values are string unions mirrored from the table check constraints.

export type Status = "active" | "inactive";
export const STATUSES: Status[] = ["active", "inactive"];

export type Role = "super_admin" | "admin";
export const ROLE_LABELS: Record<Role, string> = { super_admin: "Super admin", admin: "Admin" };

export type MessageStatus = "new" | "read" | "archived";
export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
    new: "New",
    read: "Read",
    archived: "Archived",
};

export type HeroSlide = {
    id: number;
    image_url: string;
    alt_text: string;
    order: number;
    status: Status;
    created_at: string;
};

export type Service = {
    id: number;
    icon: string;
    title: string;
    description: string;
    image_url: string;
    order: number;
    status: Status;
    created_at: string;
};

export type Testimonial = {
    id: number;
    name: string;
    role: string;
    quote: string;
    avatar_url: string;
    rating: number;
    order: number;
    status: Status;
    created_at: string;
};

export type ProjectCategory = {
    id: number;
    name: string;
    tagline: string;
    order: number;
    created_at: string;
};

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
    featured: boolean;
    completed_on: string | null;
    order: number;
    status: Status;
    created_at: string;
    updated_at: string;
};

/** A project as a card in a list, with its number of before/after pairs. */
export type ProjectCard = Pick<
    Project,
    "id" | "slug" | "title" | "style" | "category" | "location" | "description" | "cover_before" | "cover_after" | "featured" | "completed_on"
> & { pair_count: number };

export type ProjectWithImages = Project & { project_images: ProjectImage[] };

export type ContactMessage = {
    id: number;
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    status: MessageStatus;
    notes: string;
    read_at: string | null;
    created_at: string;
};

export type Stat = { value: string; label: string };

export type SiteSettings = {
    id: number;
    business_name: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    area: string;
    maps_url: string;
    opening_hours: string;
    facebook_url: string;
    instagram_url: string;
    tiktok_url: string;
    linkedin_url: string;
    x_url: string;
    youtube_url: string;
    hero_text: string;
    about_title: string;
    about_title_accent: string;
    about_body: string;
    about_highlights: string[];
    about_stats: Stat[];
    about_years: string;
    about_image_main: string;
    about_image_accent: string;
    updated_at: string;
};

export type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
