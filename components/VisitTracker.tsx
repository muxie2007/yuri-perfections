"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** A random id kept in the browser (not a cookie, nothing personal). */
function storedId(storage: Storage, key: string): string {
    try {
        let id = storage.getItem(key);
        if (!id) {
            id = crypto.randomUUID();
            storage.setItem(key, id);
        }
        return id;
    } catch {
        return crypto.randomUUID();
    }
}

/**
 * Sends one anonymous page view per public page to /api/track (docs/analytics.md). Only in
 * production builds, never for automated browsers (tests), never for the dashboard (this
 * lives in the public site's layout). The first view of a browser session carries the
 * referrer and ?utm_source, which is how the dashboard knows a visit came from Instagram.
 */
export default function VisitTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || navigator.webdriver) return;

        let isEntry = false;
        try {
            isEntry = !sessionStorage.getItem("yp_session");
        } catch {
            isEntry = true;
        }
        const payload = JSON.stringify({
            path: pathname,
            referrer: isEntry ? document.referrer : "",
            utmSource: isEntry ? new URLSearchParams(window.location.search).get("utm_source") ?? "" : "",
            visitorId: storedId(localStorage, "yp_visitor"),
            sessionId: storedId(sessionStorage, "yp_session"),
            isEntry,
        });

        const blob = new Blob([payload], { type: "application/json" });
        if (!navigator.sendBeacon?.("/api/track", blob)) {
            fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
        }
    }, [pathname]);

    return null;
}
