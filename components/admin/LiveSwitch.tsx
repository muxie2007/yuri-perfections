"use client";

import type { Status } from "@/lib/types";
import { Switch } from "./ui";

/** The "Show on website" switch inside a form. */
export function LiveSwitch({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 dark:border-white/10 p-3">
            <div>
                <p className="text-sm font-medium text-[#181B34] dark:text-white">Show on website</p>
                <p className="text-xs text-slate-500 dark:text-white/50">Off keeps it here, hidden from visitors.</p>
            </div>
            <Switch checked={status === "active"} label="Show on website" onChange={(on) => onChange(on ? "active" : "inactive")} />
        </div>
    );
}
