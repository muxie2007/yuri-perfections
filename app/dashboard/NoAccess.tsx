"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FiLock } from "react-icons/fi";
import { signOut } from "@/lib/sign-out";
import { Button } from "@/components/admin/ui";

export default function NoAccess({ email }: { email: string }) {
    const queryClient = useQueryClient();
    return (
        <main className="min-h-dvh flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0f1124]">
            <div className="max-w-md text-center">
                <FiLock className="mx-auto mb-4 text-[#F5C518]" size={32} />
                <h1 className="text-xl font-semibold text-[#181B34] dark:text-white mb-2">No dashboard access</h1>
                <p className="text-sm text-slate-600 dark:text-white/60 mb-6">
                    You are signed in as <strong>{email}</strong>, but this account is not active staff. Ask the super admin to turn it on.
                </p>
                <Button variant="primary" onClick={() => signOut(queryClient)}>
                    Sign out
                </Button>
            </div>
        </main>
    );
}
