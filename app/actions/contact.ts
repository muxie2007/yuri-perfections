"use server";

import { enquirySchema, type EnquiryInput } from "@/lib/enquiry";
import { createPublicClient } from "@/utils/supabase/public";
import { SITE_URL } from "@/lib/site";

export type EnquiryResult =
    | { ok: true }
    | { ok: false; error: string; fieldErrors?: Partial<Record<keyof EnquiryInput, string>> };

/**
 * Saves an enquiry from the contact form to `contact_messages`, where the dashboard's
 * Inbox shows it. Spam guards: a hidden field people never fill (`website`) and a minimum
 * time on the form. A bot that trips either is told "sent" and nothing is saved.
 */
export async function submitEnquiry(
    input: EnquiryInput & { website?: string; startedAt?: number },
): Promise<EnquiryResult> {
    const tooFast = typeof input.startedAt === "number" && Date.now() - input.startedAt < 2500;
    if (input.website || tooFast) return { ok: true };

    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof EnquiryInput, string>> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as keyof EnquiryInput;
            fieldErrors[key] ??= issue.message;
        }
        return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
    }

    const sb = createPublicClient();
    const { error } = await sb.from("contact_messages").insert(parsed.data);
    if (error) {
        console.error("contact_messages insert:", error.message);
        return {
            ok: false,
            error: "We could not send your message just now. Please try again, or reach us on WhatsApp or by phone.",
        };
    }

    await notifyByEmail(parsed.data);
    return { ok: true };
}

/**
 * Optional: an email to the business for each enquiry, through Resend, when
 * RESEND_API_KEY and ENQUIRY_NOTIFY_EMAIL are set (docs/deployment.md). Never blocks or
 * fails the visitor's send: the enquiry is already saved.
 */
async function notifyByEmail(e: EnquiryInput) {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.ENQUIRY_NOTIFY_EMAIL;
    if (!key || !to) return;

    const from = process.env.ENQUIRY_FROM_EMAIL || "Yuri Perfections website <onboarding@resend.dev>";
    const details = [
        `Name: ${e.name}`,
        `Email: ${e.email}`,
        e.phone ? `Phone: ${e.phone}` : null,
        e.service ? `Service: ${e.service}` : null,
    ].filter((l): l is string => l !== null);
    const lines = [...details, "", e.message, "", `Open the inbox: ${SITE_URL}/dashboard/messages`];

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                from,
                to: to.split(",").map((s) => s.trim()),
                reply_to: e.email,
                subject: `New enquiry from ${e.name}${e.service ? ` (${e.service})` : ""}`,
                text: lines.join("\n"),
            }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) console.error("Resend:", res.status, await res.text());
    } catch (err) {
        console.error("Resend:", err);
    }
}
