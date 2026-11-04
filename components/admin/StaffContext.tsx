"use client";

import { createContext, useContext } from "react";
import type { Profile } from "@/lib/types";

const StaffContext = createContext<Profile | null>(null);

export function StaffProvider({ profile, children }: { profile: Profile; children: React.ReactNode }) {
    return <StaffContext.Provider value={profile}>{children}</StaffContext.Provider>;
}

/** The signed-in staff member (the dashboard layout guarantees one). */
export function useStaff(): Profile {
    const profile = useContext(StaffContext);
    if (!profile) throw new Error("useStaff must be used inside the dashboard");
    return profile;
}
