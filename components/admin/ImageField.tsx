"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FiImage, FiLoader, FiUploadCloud, FiX } from "react-icons/fi";
import { uploadImage } from "@/lib/images";
import { cx } from "./ui";

/**
 * Pick a photo, see it, replace it. The file uploads at once (resized in the browser) and
 * the field holds its URL; the record saves with the rest of its form. Drop a file on the
 * box too. Replaced files are removed after the record saves (lib/images.ts).
 */
export function ImageField({
    value,
    onChange,
    folder,
    label,
    aspect = "aspect-[4/3]",
    removable = false,
    disabled,
}: {
    value: string;
    onChange: (url: string) => void;
    folder: string;
    label: string;
    aspect?: string;
    removable?: boolean;
    disabled?: boolean;
}) {
    const id = useId();
    const [busy, setBusy] = useState(false);
    const [over, setOver] = useState(false);

    const take = async (file: File | undefined) => {
        if (!file) return;
        setBusy(true);
        try {
            onChange(await uploadImage(file, folder));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <span className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-1.5">{label}</span>
            <label
                htmlFor={id}
                onDragOver={(e) => {
                    e.preventDefault();
                    setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setOver(false);
                    if (!disabled) take(e.dataTransfer.files?.[0]);
                }}
                className={cx(
                    "group relative block overflow-hidden rounded-md border-2 border-dashed cursor-pointer transition-colors",
                    aspect,
                    over ? "border-[#F5C518] bg-[#F5C518]/10" : "border-slate-300 hover:border-[#181B34] dark:border-white/15 dark:hover:border-white/40",
                    disabled && "pointer-events-none opacity-60",
                )}
            >
                {value ? (
                    <>
                        <Image src={value} alt={label} fill sizes="400px" className="object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiUploadCloud /> Replace
                        </span>
                    </>
                ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-500 dark:text-white/40 text-xs px-3 text-center">
                        <FiImage size={22} />
                        Click or drop a photo
                    </span>
                )}
                {busy && (
                    <span className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 dark:bg-black/60 text-sm text-[#181B34] dark:text-white">
                        <FiLoader className="animate-spin" /> Uploading…
                    </span>
                )}
                <input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="sr-only"
                    disabled={disabled || busy}
                    onChange={(e) => {
                        take(e.target.files?.[0]);
                        e.target.value = "";
                    }}
                />
            </label>
            {removable && value && !busy && (
                <button type="button" onClick={() => onChange("")} className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 dark:text-white/50">
                    <FiX /> Remove photo
                </button>
            )}
        </div>
    );
}
