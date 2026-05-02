/**
 * Supabase storage URLs with spaces in folder names are encoded as %20.
 * Next.js /_next/image then double-encodes them to %2520, causing 400 errors.
 * Decoding once lets Next.js re-encode them correctly (single %20).
 */
export function decodeImageUrl(url: string): string {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
}
