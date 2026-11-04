import type { Metadata } from "next";
import { Suspense } from "react";
import VisitorsReport from "./VisitorsReport";

export const metadata: Metadata = { title: "Visitors" };

export default function VisitorsPage() {
    return (
        <Suspense>
            <VisitorsReport />
        </Suspense>
    );
}
