import type { Metadata } from "next";
import { Suspense } from "react";
import AccountForm from "./AccountForm";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
    return (
        <Suspense>
            <AccountForm />
        </Suspense>
    );
}
