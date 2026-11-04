import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import UsersManager from "./UsersManager";

export const metadata: Metadata = { title: "Users" };

/** Super admin only: the menu hides it from admins, and this refuses them too. */
export default async function UsersPage() {
    const staff = await getStaff();
    if (staff?.profile?.role !== "super_admin") redirect("/dashboard");
    return <UsersManager meId={staff.userId} hasKey={!!createAdminClient()} />;
}
