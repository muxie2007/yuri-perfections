"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { Service } from "./services-service";
import { decodeImageUrl } from "@/utils/decode-url";

export async function getActiveServicesServer(): Promise<Service[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("order", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((s) => ({ ...s, image_url: decodeImageUrl(s.image_url) }));
}
