"use client";

import { useQuery } from "@tanstack/react-query";
import { getProject } from "@/services/admin";
import { qk } from "@/lib/query-keys";
import { ErrorState, Skeleton } from "@/components/admin/ui";
import ProjectEditor from "../ProjectEditor";

export default function EditProject({ id }: { id: number }) {
    const project = useQuery({ queryKey: qk.project(id), queryFn: () => getProject(id), enabled: Number.isFinite(id) });

    if (project.isError) return <ErrorState error={project.error} onRetry={() => project.refetch()} />;
    if (project.isPending) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <Skeleton className="h-96 xl:col-span-2" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }
    // Keyed by save time so the form starts over from the saved record after a save.
    return <ProjectEditor key={project.data.updated_at} project={project.data} />;
}
