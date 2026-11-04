"use client";

import { useEffect, useState } from "react";
import { cx } from "./ui";

/**
 * A sticky bar of tabs for a long form: each jumps to its section, and the one in view is
 * highlighted as you scroll. Sections are elements with the given ids.
 */
export function SectionTabs({ sections }: { sections: { id: string; label: string }[] }) {
    const [active, setActive] = useState(sections[0]?.id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            // The band just under the sticky header and this bar.
            { rootMargin: "-130px 0px -60% 0px" },
        );
        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    return (
        <nav
            aria-label="Sections"
            className="sticky top-16 z-10 -mx-4 sm:-mx-6 lg:-mx-8 mb-4 px-4 sm:px-6 lg:px-8 bg-slate-50/95 dark:bg-[#0f1124]/95 backdrop-blur border-b border-slate-200 dark:border-white/10"
        >
            <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
                {sections.map((s) => (
                    <li key={s.id}>
                        <a
                            href={`#${s.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                setActive(s.id);
                            }}
                            aria-current={active === s.id ? "true" : undefined}
                            className={cx(
                                "block whitespace-nowrap px-3 py-3 text-sm border-b-2 -mb-px transition-colors",
                                active === s.id
                                    ? "border-[#F5C518] text-[#181B34] font-semibold dark:text-white"
                                    : "border-transparent text-slate-500 hover:text-[#181B34] dark:text-white/50 dark:hover:text-white",
                            )}
                        >
                            {s.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
