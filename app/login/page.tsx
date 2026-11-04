import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
    return (
        <>
        {/* Outside the grid: the toaster renders an element, which would take the first cell. */}
        <Toaster richColors position="top-center" />
        <main className="min-h-dvh grid lg:grid-cols-2 bg-white dark:bg-[#0f1124]">
            <div
                className="hidden lg:block relative bg-[#181B34] bg-cover bg-center"
                style={{ backgroundImage: "linear-gradient(to top, rgba(24,27,52,.9), rgba(24,27,52,.3)), url(/yuri/about/untitled-20.jpg)" }}
            >
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <p className="text-[#F5C518] text-xs font-semibold tracking-[0.3em] uppercase mb-3">Yuri Perfections</p>
                    <p className="text-3xl font-semibold leading-snug">Manage your projects, photos and enquiries in one place.</p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6">
                <Suspense>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
        </>
    );
}
