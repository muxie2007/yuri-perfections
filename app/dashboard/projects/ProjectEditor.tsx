"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiExternalLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { deleteProject, listOrdered, saveProject } from "@/services/admin";
import { removeImages } from "@/lib/images";
import { revalidateSite } from "@/app/actions/revalidate";
import { qk } from "@/lib/query-keys";
import { slugify } from "@/lib/format";
import type { ProjectWithImages } from "@/lib/types";
import { ImageField } from "@/components/admin/ImageField";
import { Button, Card, ConfirmButton, Field, Input, PageHeader, Select, Switch, Textarea, useConfirm } from "@/components/admin/ui";

const schema = z.object({
    title: z.string().trim().min(3, "Give the project a title.").max(120),
    slug: z
        .string()
        .trim()
        .min(3, "At least 3 characters.")
        .max(80)
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only."),
    category: z.string().min(1, "Pick a category."),
    style: z.string().trim().max(80),
    location: z.string().trim().max(80),
    completed_on: z.string(),
    description: z.string().trim().max(5000),
    featured: z.boolean(),
    status: z.enum(["active", "inactive"]),
    pairs: z
        .array(
            z.object({
                id: z.number().optional(),
                label: z.string().trim().max(80),
                before: z.string().min(1, "Add the before photo."),
                after: z.string().min(1, "Add the after photo."),
            }),
        )
        .min(1, "Add at least one before and after pair."),
});
type FormValues = z.infer<typeof schema>;

/** Create or edit a project with its before/after pairs. The first pair is the cover. */
export default function ProjectEditor({ project }: { project?: ProjectWithImages }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const categories = useQuery({ queryKey: qk.ordered("project_categories"), queryFn: () => listOrdered("project_categories") });
    const [slugTouched, setSlugTouched] = useState(!!project);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const confirm = useConfirm();

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: project
            ? {
                  title: project.title,
                  slug: project.slug,
                  category: project.category,
                  style: project.style,
                  location: project.location,
                  completed_on: project.completed_on ?? "",
                  description: project.description,
                  featured: project.featured,
                  status: project.status,
                  pairs: project.project_images.length
                      ? project.project_images.map((i) => ({ id: i.id, label: i.label, before: i.before, after: i.after }))
                      : project.cover_before
                        ? [{ label: "", before: project.cover_before, after: project.cover_after }]
                        : [],
              }
            : {
                  title: "",
                  slug: "",
                  category: "",
                  style: "",
                  location: "",
                  completed_on: "",
                  description: "",
                  featured: false,
                  status: "active",
                  pairs: [{ label: "", before: "", after: "" }],
              },
    });
    const pairs = useFieldArray({ control, name: "pairs" });
    const values = useWatch({ control }) as FormValues;

    const onSubmit = async (v: FormValues) => {
        const live = v.status === "active";
        const ok = await confirm({
            title: project ? `Save changes to "${v.title}"?` : `Create "${v.title}"?`,
            body: live
                ? "It is set to Live, so visitors will see it on the website straight away."
                : "It is set to Hidden: it is saved here but visitors will not see it until you switch Live on.",
            confirmLabel: project ? "Save changes" : "Create project",
            tone: "primary",
        });
        if (!ok) return;
        setSaving(true);
        try {
            const { pairs: pairList, ...input } = v;
            const { id, unused } = await saveProject(project?.id ?? null, { ...input, completed_on: input.completed_on || null }, pairList, project);
            await removeImages(unused);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: qk.projects }),
                queryClient.invalidateQueries({ queryKey: qk.overview }),
            ]);
            revalidateSite().catch(() => undefined);
            toast.success(project ? "Project saved." : "Project created.");
            router.replace(`/dashboard/projects/${id}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save.");
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!project) return;
        setDeleting(true);
        try {
            const files = await deleteProject(project);
            await removeImages(files);
            await queryClient.invalidateQueries({ queryKey: qk.projects });
            revalidateSite().catch(() => undefined);
            toast.success("Project deleted.");
            router.replace("/dashboard/projects");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete.");
            setDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please check the highlighted fields."))} noValidate>
            <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#181B34] dark:text-white/50 dark:hover:text-white mb-3">
                <FiArrowLeft /> All projects
            </Link>
            <PageHeader
                title={project ? project.title : "New project"}
                description={project ? "Edit the details and photos, then save." : "Fill in the details, add before and after photos, then save."}
                actions={
                    <>
                        {project?.status === "active" && (
                            <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                                <Button icon={<FiExternalLink />}>View on website</Button>
                            </a>
                        )}
                        <Button type="submit" variant="primary" loading={saving} disabled={!!project && !isDirty}>
                            {project ? "Save changes" : "Create project"}
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                    <Card title="1. Details">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Title" id="p-title" required error={errors.title?.message} className="sm:col-span-2">
                                <Input
                                    id="p-title"
                                    aria-invalid={!!errors.title}
                                    {...register("title", {
                                        onChange: (e) => {
                                            if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldValidate: false });
                                        },
                                    })}
                                    placeholder="e.g. Kololo Executive Villa"
                                />
                            </Field>
                            <Field
                                label="Web address"
                                id="p-slug"
                                required
                                error={errors.slug?.message}
                                hint={`yuriperfections.com/projects/${values.slug || "…"}`}
                                className="sm:col-span-2"
                            >
                                <Input id="p-slug" aria-invalid={!!errors.slug} {...register("slug", { onChange: () => setSlugTouched(true) })} />
                            </Field>
                            <Field label="Category" id="p-category" required error={errors.category?.message}>
                                <Select id="p-category" aria-invalid={!!errors.category} {...register("category")}>
                                    <option value="">Choose a category</option>
                                    {categories.data?.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Completed on" id="p-completed" hint="Newest work shows first on the website.">
                                <Input id="p-completed" type="date" {...register("completed_on")} />
                            </Field>
                            <Field label="Style" id="p-style" error={errors.style?.message} hint="e.g. Contemporary luxury">
                                <Input id="p-style" {...register("style")} />
                            </Field>
                            <Field label="Location" id="p-location" error={errors.location?.message} hint="e.g. Kololo">
                                <Input id="p-location" {...register("location")} />
                            </Field>
                            <Field label="Description" id="p-description" error={errors.description?.message} hint="What was done. Leave a blank line between paragraphs." className="sm:col-span-2">
                                <Textarea id="p-description" rows={6} {...register("description")} />
                            </Field>
                        </div>
                    </Card>

                    <Card title="2. Before and after photos" description="The first pair is the cover. Use the arrows to change the order.">
                        {errors.pairs?.root?.message || errors.pairs?.message ? (
                            <p role="alert" className="mb-3 text-sm text-red-600">
                                {errors.pairs?.root?.message ?? errors.pairs?.message}
                            </p>
                        ) : null}
                        <ol className="space-y-5">
                            {pairs.fields.map((field, i) => (
                                <li key={field.id} className="rounded-lg border border-slate-200 dark:border-white/10 p-4" data-testid="pair">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-semibold text-[#181B34] dark:text-white">
                                            {i === 0 ? "Cover pair" : `Pair ${i + 1}`}
                                        </span>
                                        <span className="flex-1" />
                                        <Button size="sm" variant="ghost" icon={<FiArrowUp />} onClick={() => pairs.move(i, i - 1)} disabled={i === 0} aria-label="Move up" />
                                        <Button size="sm" variant="ghost" icon={<FiArrowDown />} onClick={() => pairs.move(i, i + 1)} disabled={i === pairs.fields.length - 1} aria-label="Move down" />
                                        <Button size="sm" variant="ghost" icon={<FiTrash2 />} onClick={() => pairs.remove(i)} aria-label="Remove pair" className="text-red-600!" />
                                    </div>
                                    <Field label="Room or area" id={`pair-${i}-label`} hint="e.g. Living room, Kitchen ceiling" className="mb-3">
                                        <Input id={`pair-${i}-label`} {...register(`pairs.${i}.label`)} />
                                    </Field>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <ImageField
                                                label="Before"
                                                folder="projects"
                                                value={values.pairs?.[i]?.before ?? ""}
                                                onChange={(url) => setValue(`pairs.${i}.before`, url, { shouldDirty: true, shouldValidate: true })}
                                            />
                                            {errors.pairs?.[i]?.before && <p className="mt-1 text-xs text-red-600">{errors.pairs[i]?.before?.message}</p>}
                                        </div>
                                        <div>
                                            <ImageField
                                                label="After"
                                                folder="projects"
                                                value={values.pairs?.[i]?.after ?? ""}
                                                onChange={(url) => setValue(`pairs.${i}.after`, url, { shouldDirty: true, shouldValidate: true })}
                                            />
                                            {errors.pairs?.[i]?.after && <p className="mt-1 text-xs text-red-600">{errors.pairs[i]?.after?.message}</p>}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <Button className="mt-4" icon={<FiPlus />} onClick={() => pairs.append({ label: "", before: "", after: "" })}>
                            Add another pair
                        </Button>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card title="3. On the website">
                        <div className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-[#181B34] dark:text-white">Live</p>
                                    <p className="text-xs text-slate-500 dark:text-white/50">Off hides it from visitors; it stays here.</p>
                                </div>
                                <Switch checked={values.status === "active"} label="Live" onChange={(on) => setValue("status", on ? "active" : "inactive", { shouldDirty: true })} />
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-[#181B34] dark:text-white">Featured</p>
                                    <p className="text-xs text-slate-500 dark:text-white/50">Shown first in the home page portfolio.</p>
                                </div>
                                <Switch checked={values.featured} label="Featured" onChange={(on) => setValue("featured", on, { shouldDirty: true })} />
                            </div>
                        </div>
                    </Card>

                    {project && (
                        <Card title="Delete project" description="Removes it and its photos for good.">
                            <ConfirmButton
                                onConfirm={onDelete}
                                loading={deleting}
                                icon={<FiTrash2 />}
                                question={`Delete "${project.title}"?`}
                                body="The project and all its photos are removed from the website and the dashboard for good. To take it off the website for now, switch Live off instead."
                            >
                                Delete project
                            </ConfirmButton>
                        </Card>
                    )}

                    <div className="xl:sticky xl:top-20">
                        <Button type="submit" variant="primary" loading={saving} disabled={!!project && !isDirty} className="w-full">
                            {project ? "Save changes" : "Create project"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
