"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * Photo uploads for the dashboard: resized in the browser (phone photos are 4–12 MB), then
 * stored in the public `media` bucket. Only staff can write there (storage RLS).
 * See docs/database.md "Storage".
 */
export const MEDIA_BUCKET = "media";
const MAX_SIDE = 2400;
const QUALITY = 0.85;

/** Shrinks a photo to at most MAX_SIDE px on its long side and re-encodes it as WebP. */
async function shrink(file: File): Promise<Blob> {
    if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
        // Keep the original if the browser cannot encode WebP or it came out bigger.
        return blob && blob.size < file.size ? blob : file;
    } catch {
        return file;
    }
}

/** Uploads a photo under `folder/` and returns its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPG, PNG or WebP).");
    const body = await shrink(file);
    const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;

    const sb = createClient();
    const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, body, {
        contentType: body.type || file.type,
        cacheControl: "31536000",
        upsert: false,
    });
    if (error) {
        if (/maximum allowed size/i.test(error.message)) throw new Error("That photo is larger than 10 MB, even after resizing.");
        throw new Error(`Upload failed: ${error.message}`);
    }
    return sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The storage path of a URL in our bucket, or null for anything else (old bucket, Unsplash, /public). */
export function mediaPath(url: string): string | null {
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const at = url.indexOf(marker);
    return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}

/**
 * Deletes files we uploaded that are no longer used. Best effort: a leftover file costs a
 * little storage, never a broken page, so a failure is only logged. Files outside the
 * `media` bucket are never touched.
 */
export async function removeImages(urls: (string | null | undefined)[]) {
    const paths = urls.map((u) => (u ? mediaPath(u) : null)).filter((p): p is string => !!p);
    if (paths.length === 0) return;
    const { error } = await createClient().storage.from(MEDIA_BUCKET).remove(paths);
    if (error) console.error("Could not remove old images:", error.message);
}
