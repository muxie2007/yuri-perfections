import type { Metadata } from "next";
import { Suspense } from "react";
import MessagesInbox from "./MessagesInbox";

export const metadata: Metadata = { title: "Inbox" };

export default function MessagesPage() {
    return (
        <Suspense>
            <MessagesInbox />
        </Suspense>
    );
}
