"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

/**
 * Signs out and loads the sign-in page afresh. A full page load, never router.push: the
 * client router cache could otherwise show the next person a page the last one left
 * (coding-notes playbook §6). `replace`, not `assign`: the dashboard page leaves the
 * history too, so Back after signing out cannot reopen it. Queries are cancelled and
 * cleared first.
 */
export async function signOut(queryClient?: QueryClient) {
    await queryClient?.cancelQueries();
    queryClient?.clear();
    await createClient().auth.signOut();
    window.location.replace("/login");
}
