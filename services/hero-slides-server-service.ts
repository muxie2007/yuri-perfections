"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { HeroSlide } from "./hero-slides-service";
import { decodeImageUrl } from "@/utils/decode-url";

export async function getActiveHeroSlidesServer(): Promise<HeroSlide[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("status", "active")
        .order("order", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((s) => ({ ...s, image_url: decodeImageUrl(s.image_url) }));
}