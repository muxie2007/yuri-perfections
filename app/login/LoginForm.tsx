"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";
import { Button, Field, Input } from "@/components/admin/ui";

/** Only same-site paths, so ?next= can never send someone to another website. */
function safeNext(next: string | null) {
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default function LoginForm() {
    const params = useSearchParams();
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<"signin" | "forgot">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(params.get("error") ? "That link has expired or was already used. Try again." : "");
    const [sent, setSent] = useState(false);

    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        const { error: authError } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
        if (authError) {
            setBusy(false);
            setError(
                /invalid login credentials/i.test(authError.message)
                    ? "Wrong email or password."
                    : /email not confirmed/i.test(authError.message)
                      ? "This email is not confirmed yet. Ask the super admin."
                      : authError.message,
            );
            return;
        }
        // A full load, not router.push: the server picks what to show from the new cookie
        // (playbook §6). `replace` keeps the sign-in page out of the Back history.
        queryClient.clear();
        window.location.replace(safeNext(params.get("next")));
    };

    const sendReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard/account?reset=1")}`;
        const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo });
        setBusy(false);
        if (resetError) {
            setError(/rate limit/i.test(resetError.message) ? "Too many emails sent. Wait a few minutes and try again." : resetError.message);
            return;
        }
        setSent(true);
        toast.success("If that email has an account, a reset link is on its way.");
    };

    return (
        <div className="w-full max-w-sm">
            <Image src="/logos/yuri-white-bg-removebg.png" alt="Yuri Perfections" width={96} height={96} className="h-20 w-20 object-contain dark:hidden mb-6" priority />
            <Image src="/logos/yuri-dark-logo-removebg.png" alt="Yuri Perfections" width={96} height={96} className="h-20 w-20 object-contain hidden dark:block mb-6" priority />

            {mode === "signin" ? (
                <form onSubmit={signIn} className="space-y-4" aria-label="Sign in">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#181B34] dark:text-white">Sign in</h1>
                        <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Staff dashboard</p>
                    </div>
                    <Field label="Email" id="email">
                        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field label="Password" id="password">
                        <div className="relative">
                            <Input
                                id="password"
                                type={show ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 dark:text-white/50"
                                aria-label={show ? "Hide password" : "Show password"}
                            >
                                {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                            </button>
                        </div>
                    </Field>
                    {error && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    <Button type="submit" variant="primary" loading={busy} className="w-full">
                        Sign in
                    </Button>
                    <div className="flex justify-between text-sm">
                        <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-slate-600 hover:text-[#181B34] dark:text-white/60 dark:hover:text-white">
                            Forgot password?
                        </button>
                        <Link href="/" className="text-slate-600 hover:text-[#181B34] dark:text-white/60 dark:hover:text-white">
                            Back to website
                        </Link>
                    </div>
                </form>
            ) : (
                <form onSubmit={sendReset} className="space-y-4" aria-label="Reset password">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#181B34] dark:text-white">Reset your password</h1>
                        <p className="text-sm text-slate-500 dark:text-white/50 mt-1">We will email you a link to set a new one.</p>
                    </div>
                    <Field label="Email" id="reset-email">
                        <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    {error && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    {sent && <p className="text-sm text-emerald-700 dark:text-emerald-300">Check your inbox (and spam) for the link. Open it on this device.</p>}
                    <Button type="submit" variant="primary" loading={busy} className="w-full">
                        Send reset link
                    </Button>
                    <button type="button" onClick={() => { setMode("signin"); setError(""); setSent(false); }} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-white/60">
                        <FiArrowLeft /> Back to sign in
                    </button>
                </form>
            )}
        </div>
    );
}
