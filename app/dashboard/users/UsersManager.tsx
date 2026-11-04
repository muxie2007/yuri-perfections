"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiAlertTriangle, FiKey, FiPlus, FiTrash2 } from "react-icons/fi";
import { listProfiles } from "@/services/admin";
import { useSave } from "@/hooks/useSave";
import { qk } from "@/lib/query-keys";
import { formatDate } from "@/lib/format";
import { ROLE_LABELS, type Profile, type Role } from "@/lib/types";
import { Badge, Button, ConfirmButton, ErrorState, Field, Input, Modal, PageHeader, Select, Skeleton, Switch, useConfirm } from "@/components/admin/ui";
import { createStaffUser, deleteStaffUser, setStaffPassword, updateStaffUser } from "./actions";

/** Turns a server action's { ok, error } into a throw, so useSave toasts it. */
async function run(promise: Promise<{ ok: true } | { ok: false; error: string }>) {
    const result = await promise;
    if (!result.ok) throw new Error(result.error);
}

function suggestPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export default function UsersManager({ meId, hasKey }: { meId: string; hasKey: boolean }) {
    const users = useQuery({ queryKey: qk.profiles, queryFn: listProfiles });
    const confirm = useConfirm();
    const invalidate = [qk.profiles];
    const opts = { invalidate, publicChange: false };

    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ email: "", full_name: "", role: "admin" as Role, password: "" });
    const [pwFor, setPwFor] = useState<Profile | null>(null);
    const [pwOpen, setPwOpen] = useState(false);
    const [newPw, setNewPw] = useState("");

    const create = useSave((v: typeof form) => run(createStaffUser(v)), {
        ...opts,
        success: (_, v) => `Account created for ${v.email}. Share the password with them privately.`,
        onSuccess: () => setAdding(false),
    });
    const update = useSave((v: Parameters<typeof updateStaffUser>[0]) => run(updateStaffUser(v)), { ...opts, success: "User updated." });
    const remove = useSave((id: string) => run(deleteStaffUser(id)), { ...opts, success: "User deleted." });
    const setPassword = useSave((v: { id: string; password: string }) => run(setStaffPassword(v)), {
        ...opts,
        success: "Password changed. Share it with them privately.",
        onSuccess: () => setPwOpen(false),
    });

    return (
        <div>
            <PageHeader
                title="Users"
                description="Who can sign in to this dashboard. Admins manage the website and enquiries; super admins also manage users."
                actions={
                    <Button
                        variant="primary"
                        icon={<FiPlus />}
                        disabled={!hasKey}
                        onClick={() => {
                            setForm({ email: "", full_name: "", role: "admin", password: suggestPassword() });
                            setAdding(true);
                        }}
                    >
                        Add user
                    </Button>
                }
            />

            {!hasKey && (
                <div className="mb-4 flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <FiAlertTriangle className="mt-0.5 shrink-0" />
                    <p>
                        Adding and deleting users needs the <code>SUPABASE_SECRET_KEY</code> environment variable on the server (see docs/deployment.md).
                        You can still change roles and switch accounts on or off.
                    </p>
                </div>
            )}

            {users.isError ? (
                <ErrorState error={users.error} onRetry={() => users.refetch()} />
            ) : users.isPending ? (
                <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : (
                <ul className="divide-y divide-slate-200 dark:divide-white/10 rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#181B34]">
                    {users.data.map((u) => {
                        const me = u.id === meId;
                        return (
                            <li key={u.id} className="flex flex-col md:flex-row md:items-center gap-3 p-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[#181B34] dark:text-white truncate">
                                        {u.full_name || "No name"} {me && <span className="text-xs font-normal text-slate-500">(you)</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-white/50 truncate">
                                        {u.email} · added {formatDate(u.created_at)}
                                    </p>
                                    <div className="mt-1.5 flex gap-1.5">
                                        <Badge tone={u.role === "super_admin" ? "gold" : "blue"}>{ROLE_LABELS[u.role]}</Badge>
                                        {u.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="red">No access</Badge>}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        aria-label={`Role of ${u.email}`}
                                        value={u.role}
                                        disabled={me}
                                        onChange={async (e) => {
                                            const role = e.target.value as Role;
                                            const ok = await confirm({
                                                title: `Make ${u.full_name || u.email} ${role === "super_admin" ? "a super admin" : "an admin"}?`,
                                                body: role === "super_admin" ? "They will also be able to add, remove and change users." : "They will no longer manage users.",
                                                confirmLabel: "Change role",
                                                tone: "primary",
                                            });
                                            if (ok) update.mutate({ id: u.id, role });
                                        }}
                                        className="w-40 h-8! py-0!"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super admin</option>
                                    </Select>
                                    <span className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                                        <Switch
                                            checked={u.is_active}
                                            disabled={me}
                                            label={`Access for ${u.email}`}
                                            onChange={async (on) => {
                                                const ok = await confirm({
                                                    title: on ? `Give ${u.full_name || u.email} access?` : `Remove access for ${u.full_name || u.email}?`,
                                                    body: on ? "They can sign in to the dashboard again." : "They can no longer use the dashboard. Their account is kept and can be switched back on.",
                                                    confirmLabel: on ? "Give access" : "Remove access",
                                                    tone: on ? "primary" : "danger",
                                                });
                                                if (ok) update.mutate({ id: u.id, is_active: on });
                                            }}
                                        />
                                        Access
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        icon={<FiKey />}
                                        disabled={!hasKey}
                                        onClick={() => {
                                            setPwFor(u);
                                            setNewPw(suggestPassword());
                                            setPwOpen(true);
                                        }}
                                    >
                                        Password
                                    </Button>
                                    {!me && hasKey && (
                                        <ConfirmButton
                                            onConfirm={() => remove.mutate(u.id)}
                                            icon={<FiTrash2 />}
                                            question={`Delete ${u.full_name || u.email}?`}
                                            body="Their sign-in is removed for good. To pause someone instead, switch Access off."
                                        >
                                            Delete
                                        </ConfirmButton>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Modal
                open={adding}
                onClose={() => setAdding(false)}
                title="Add user"
                description="They sign in at /login with this email and password, and can change the password under My account."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setAdding(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" loading={create.isPending} onClick={() => create.mutate(form)}>
                            Create account
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Field label="Full name" id="u-name">
                        <Input id="u-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                    </Field>
                    <Field label="Email" id="u-email">
                        <Input id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </Field>
                    <Field label="Role" id="u-role" hint="Super admins can also add and remove users.">
                        <Select id="u-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super admin</option>
                        </Select>
                    </Field>
                    <Field label="Starting password" id="u-pw" hint="Suggested for you. Copy it and send it to them privately.">
                        <Input id="u-pw" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="font-mono" />
                    </Field>
                </div>
            </Modal>

            <Modal
                open={pwOpen}
                onClose={() => setPwOpen(false)}
                title="Set a new password"
                description={pwFor ? `For ${pwFor.email}` : undefined}
                size="sm"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setPwOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" loading={setPassword.isPending} onClick={() => pwFor && setPassword.mutate({ id: pwFor.id, password: newPw })}>
                            Set password
                        </Button>
                    </>
                }
            >
                <Field label="New password" id="u-newpw" hint="At least 8 characters.">
                    <Input id="u-newpw" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="font-mono" />
                </Field>
            </Modal>
        </div>
    );
}
