import type { Metadata } from "next";
import EditProject from "./EditProject";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditProject id={Number(id)} />;
}
