import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/utils/supabase/public";
import { getSiteSettings } from "./content";

/** Site settings once per render (the layout, the page and metadata all ask). */
export const loadSettings = cache(() => getSiteSettings(createPublicClient()));
