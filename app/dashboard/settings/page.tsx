"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/services/admin";
import { qk } from "@/lib/query-keys";
import { ErrorState, PageHeader, Skeleton } from "@/components/admin/ui";
import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
    const settings = useQuery({ queryKey: qk.settings, queryFn: getSettings });

    return (
        <div>
            <PageHeader title="Site settings" description="Contact details, social links and the text on the home page." />
            {settings.isError ? (
                <ErrorState error={settings.error} onRetry={() => settings.refetch()} />
            ) : settings.isPending ? (
                <div className="space-y-4">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                </div>
            ) : (
                <SettingsForm key={settings.data.updated_at} settings={settings.data} />
            )}
        </div>
    );
}
