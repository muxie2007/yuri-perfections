"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type Props = {
    before: string;
    after: string;
    /** Alt text base, e.g. the room: "Living room" gives "Living room before" / "… after". */
    alt?: string;
    /** next/image `sizes` for both photos. */
    sizes?: string;
    /** Box classes; give it a height or an aspect ratio (default 4/3). */
    className?: string;
    priority?: boolean;
    /** Smaller labels and handle for cards. */
    compact?: boolean;
};

/**
 * Drag (or click, or use the arrow keys) to compare a before and an after photo.
 *
 * - The before photo is clipped, not resized, so both line up exactly.
 * - `touch-action: pan-y`: on a phone a vertical swipe still scrolls the page, a sideways
 *   drag moves the divider (the browser cancels our pointer when it takes the scroll).
 * - The divider starts in the middle so both states show at a glance.
 */
export function BeforeAfter({
    before,
    after,
    alt = "Project",
    sizes = "(max-width: 768px) 100vw, 60vw",
    className = "aspect-[4/3]",
    priority = false,
    compact = false,
}: Props) {
    const [position, setPosition] = useState(50);
    const boxRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const moveTo = useCallback((clientX: number) => {
        const box = boxRef.current;
        if (!box) return;
        const { left, width } = box.getBoundingClientRect();
        setPosition(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)));
    }, []);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragging.current) moveTo(e.clientX);
    };
    const stop = () => {
        dragging.current = false;
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const step = e.shiftKey ? 10 : 2;
        const keys: Record<string, number> = {
            ArrowLeft: position - step,
            ArrowDown: position - step,
            ArrowRight: position + step,
            ArrowUp: position + step,
            Home: 0,
            End: 100,
        };
        if (e.key in keys) {
            e.preventDefault();
            setPosition(Math.min(100, Math.max(0, keys[e.key])));
        }
    };

    const label = compact
        ? "px-1.5 py-0.5 text-[8px] tracking-[0.18em]"
        : "px-2.5 py-1 text-[10px] tracking-[0.22em]";

    return (
        <div
            ref={boxRef}
            className={`relative overflow-hidden select-none bg-neutral-200 dark:bg-neutral-800 cursor-ew-resize touch-pan-y ${className}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stop}
            onPointerCancel={stop}
            data-testid="before-after"
        >
            <Image src={after} alt={`${alt} after`} fill sizes={sizes} priority={priority} className="object-cover pointer-events-none" draggable={false} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
                <Image src={before} alt={`${alt} before`} fill sizes={sizes} priority={priority} className="object-cover pointer-events-none" draggable={false} />
            </div>

            <span className={`absolute top-3 left-3 z-10 bg-black/55 text-white font-bold uppercase backdrop-blur-sm pointer-events-none ${label}`}>
                Before
            </span>
            <span className={`absolute top-3 right-3 z-10 bg-[#F5C518] text-[#181B34] font-bold uppercase pointer-events-none ${label}`}>
                After
            </span>

            {/* Divider and handle; the handle is the keyboard control. */}
            <div className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow pointer-events-none" style={{ left: `${position}%` }} />
            <div
                role="slider"
                tabIndex={0}
                aria-label={`${alt}: compare before and after`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(position)}
                aria-valuetext={`${Math.round(position)}% before`}
                onKeyDown={onKeyDown}
                className={`absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center outline-none focus-visible:ring-4 focus-visible:ring-[#F5C518] ${compact ? "w-8 h-8" : "w-11 h-11"}`}
                style={{ left: `${position}%` }}
            >
                <svg aria-hidden width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="#181B34">
                    <path d="M24,12l-5.7-5.7V11c-3.7,0-9,0-12.6,0V6.3L0,12l5.8,5.7V13c3.6,0,8.9,0,12.5,0v4.7L24,12z" />
                </svg>
            </div>
        </div>
    );
}
