import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getStaff, isActiveStaff } from "@/lib/auth";
import DashboardShell from "@/components/admin/DashboardShell";
import { StaffProvider } from "@/components/admin/StaffContext";
import NoAccess from "./NoAccess";

export const metadata: Metadata = {
    title: { default: "Dashboard", template: "%s | Dashboard | Yuri Perfections" },
    robots: { index: false, follow: false },
};

/**
 * Every dashboard page: signed in (proxy.ts already sent strangers to /login) AND an active
 * staff profile. An account without one (a deactivated admin, a stray sign-up) sees
 * NoAccess. The data itself is guarded by RLS, not by this layout.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const staff = await getStaff();
    if (!staff) redirect("/login");

    return (
        <>
            <Toaster richColors position="top-right" closeButton />
            {isActiveStaff(staff) ? (
                <StaffProvider profile={staff.profile}>
                    <DashboardShell profile={staff.profile}>{children}</DashboardShell>
                </StaffProvider>
            ) : (
                <NoAccess email={staff.email} />
            )}
        </>
    );
}
