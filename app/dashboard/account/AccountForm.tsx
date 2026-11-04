"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useStaff } from "@/components/admin/StaffContext";
import { Button, Card, Field, PageHeader, PasswordInput, cx, useConfirm } from "@/components/admin/ui";
import { ROLE_LABELS } from "@/lib/types";

export default function AccountForm() {
    const staff = useStaff();
    const router = useRouter();
    const confirm = useConfirm();
    const resetting = useSearchParams().get("reset") === "1";
    const [password, setPassword] = useState("");
    const [repeat, setRepeat] = useState("");
    const [busy, setBusy] = useState(false);
    const [tried, setTried] = useState(false);

    const tooShort = password.length < 8;
    const mismatch = password !== repeat;

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setTried(true);
        if (tooShort || mismatch) return;
        if (!(await confirm({ title: "Change your password?", body: "Use the new password next time you sign in.", confirmLabel: "Change password", tone: "primary" }))) return;

        setBusy(true);
        const { error } = await createClient().auth.updateUser({ password });
        setBusy(false);
        if (error) {
            toast.error(/different from the old/i.test(error.message) ? "Choose a password different from your current one." : error.message);
            return;
        }
        setPassword("");
        setRepeat("");
        setTried(false);
        if (resetting) {
            // Done with the reset link: on to the dashboard.
            toast.success("Password changed. Welcome back.");
            router.replace("/dashboard");
        } else {
            toast.success("Password changed.");
        }
    };

    return (
        <div className="max-w-2xl">
            <PageHeader title="My account" />

            <Card title="You" className="mb-4">
                <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
                    <dt className="text-slate-500 dark:text-white/50">Name</dt>
                    <dd className="text-[#181B34] dark:text-white">{staff.full_name || "N/A"}</dd>
                    <dt className="text-slate-500 dark:text-white/50">Email</dt>
                    <dd className="text-[#181B34] dark:text-white break-all">{staff.email}</dd>
                    <dt className="text-slate-500 dark:text-white/50">Role</dt>
                    <dd className="text-[#181B34] dark:text-white">{ROLE_LABELS[staff.role]}</dd>
                </dl>
                <p className="mt-3 text-xs text-slate-500 dark:text-white/40">To change your name, email or role, ask a super admin.</p>
            </Card>

            <Card
                title={resetting ? "Set your new password" : "Change password"}
                className={cx(resetting && "ring-2 ring-[#F5C518]")}
                description={resetting ? "You opened a reset link. Choose a new password now." : "At least 8 characters."}
            >
                <form onSubmit={save} className="space-y-4" noValidate>
                    <Field label="New password" id="a-pw" error={tried && tooShort ? "At least 8 characters." : undefined}>
                        <PasswordInput id="a-pw" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={tried && tooShort} />
                    </Field>
                    <Field label="Repeat it" id="a-pw2" error={tried && !tooShort && mismatch ? "The two passwords are different." : undefined}>
                        <PasswordInput id="a-pw2" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} aria-invalid={tried && !tooShort && mismatch} />
                    </Field>
                    <Button type="submit" variant="primary" loading={busy}>
                        Save password
                    </Button>
                </form>
            </Card>
        </div>
    );
}
