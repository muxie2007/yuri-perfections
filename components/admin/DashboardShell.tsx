"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
    FiExternalLink,
    FiFolder,
    FiGrid,
    FiHome,
    FiImage,
    FiInbox,
    FiLogOut,
    FiMenu,
    FiBarChart2,
    FiMoon,
    FiSettings,
    FiSun,
    FiTag,
    FiTool,
    FiUser,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { useTheme } from "@/providers/ThemeProvider";
import { messageCounts } from "@/services/admin";
import { qk } from "@/lib/query-keys";
import { signOut } from "@/lib/sign-out";
import { ROLE_LABELS, type Profile } from "@/lib/types";
import { ConfirmProvider, cx } from "./ui";

type NavItem = { href: string; label: string; icon: IconType; superOnly?: boolean; badge?: "messages" };

/** The menu. `superOnly` entries are hidden from admins (and the pages refuse them too). */
export const NAV: { section: string; items: NavItem[] }[] = [
    {
        section: "",
        items: [
            { href: "/dashboard", label: "Overview", icon: FiGrid },
            { href: "/dashboard/messages", label: "Inbox", icon: FiInbox, badge: "messages" },
            { href: "/dashboard/visitors", label: "Visitors", icon: FiBarChart2 },
        ],
    },
    {
        section: "Website",
        items: [
            { href: "/dashboard/projects", label: "Projects", icon: FiFolder },
            { href: "/dashboard/categories", label: "Categories", icon: FiTag },
            { href: "/dashboard/hero-slides", label: "Hero slides", icon: FiImage },
            { href: "/dashboard/services", label: "Services", icon: FiTool },
            { href: "/dashboard/settings", label: "Site settings", icon: FiSettings },
        ],
    },
    {
        section: "Account",
        items: [
            { href: "/dashboard/users", label: "Users", icon: FiUsers, superOnly: true },
            { href: "/dashboard/account", label: "My account", icon: FiUser },
        ],
    },
];

export default function DashboardShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const { theme, setTheme } = useTheme();

    // Unread enquiries, for the menu badge; checked every minute and on returning to the tab.
    const counts = useQuery({
        queryKey: qk.messageCounts,
        queryFn: messageCounts,
        refetchInterval: 60_000,
        refetchOnWindowFocus: true,
    });
    const unread = counts.data?.new ?? 0;

    useEffect(() => setOpen(false), [pathname]);

    const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

    const nav = (
        <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {NAV.map((group) => {
                const items = group.items.filter((i) => !i.superOnly || profile.role === "super_admin");
                if (items.length === 0) return null;
                return (
                    <div key={group.section || "main"}>
                        {group.section && <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/35">{group.section}</p>}
                        <ul className="space-y-0.5">
                            {items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive(item.href) ? "page" : undefined}
                                        className={cx(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                            isActive(item.href) ? "bg-[#F5C518] text-[#181B34] font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white",
                                        )}
                                    >
                                        <item.icon size={16} className="shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge === "messages" && unread > 0 && (
                                            <span
                                                className={cx(
                                                    "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center",
                                                    isActive(item.href) ? "bg-[#181B34] text-[#F5C518]" : "bg-[#F5C518] text-[#181B34]",
                                                )}
                                                aria-label={`${unread} new`}
                                            >
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </nav>
    );

    const footer = (
        <div className="border-t border-white/10 p-3 space-y-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                <FiExternalLink size={16} /> View website
            </a>
            <div className="flex items-center gap-3 px-3 py-2">
                <span className="w-8 h-8 rounded-full bg-[#F5C518] text-[#181B34] text-xs font-bold flex items-center justify-center shrink-0">
                    {(profile.full_name || profile.email).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{profile.full_name || profile.email}</p>
                    <p className="text-[11px] text-white/50">{ROLE_LABELS[profile.role]}</p>
                </div>
                <button
                    type="button"
                    onClick={() => signOut(queryClient)}
                    className="p-2 rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                    aria-label="Sign out"
                    title="Sign out"
                >
                    <FiLogOut size={16} />
                </button>
            </div>
        </div>
    );

    const brand = (
        <Link href="/dashboard" className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
            <Image src="/logos/yuri-dark-logo-removebg.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="leading-tight">
                <span className="block text-sm font-semibold text-white">Yuri Perfections</span>
                <span className="block text-[11px] text-white/50">Dashboard</span>
            </span>
        </Link>
    );

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-[#0f1124]">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-[#181B34] z-30">
                {brand}
                {nav}
                {footer}
            </aside>

            {/* Mobile drawer */}
            <div className={cx("lg:hidden fixed inset-0 z-50 transition", open ? "visible" : "invisible")} aria-hidden={!open}>
                <div className={cx("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
                <aside className={cx("absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-[#181B34] transition-transform", open ? "translate-x-0" : "-translate-x-full")}>
                    <div className="flex items-center justify-between pr-3">
                        {brand}
                        <button type="button" onClick={() => setOpen(false)} className="p-2 text-white/70" aria-label="Close menu">
                            <FiX size={20} />
                        </button>
                    </div>
                    {nav}
                    {footer}
                </aside>
            </div>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/85 dark:bg-[#181B34]/85 backdrop-blur border-b border-slate-200 dark:border-white/10">
                    <button type="button" onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-[#181B34] dark:text-white" aria-label="Open menu">
                        <FiMenu size={20} />
                    </button>
                    <Link href="/" className="lg:hidden text-sm font-semibold text-[#181B34] dark:text-white flex items-center gap-2">
                        <FiHome /> Yuri Perfections
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        {unread > 0 && (
                            <Link
                                href="/dashboard/messages?status=new"
                                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#F5C518]/20 px-3 py-1.5 text-xs font-medium text-[#7a6200] dark:text-[#F5C518]"
                            >
                                <FiInbox /> {unread} new enquir{unread === 1 ? "y" : "ies"}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10"
                            aria-label="Toggle dark mode"
                        >
                            <FiSun className="hidden dark:block" />
                            <FiMoon className="dark:hidden" />
                        </button>
                    </div>
                </header>
                <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px]">
                    <ConfirmProvider>{children}</ConfirmProvider>
                </main>
            </div>
        </div>
    );
}
