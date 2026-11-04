import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";
import type { ProjectCard as Card } from "@/lib/types";

/**
 * A project in a grid: the after photo, crossfading to the before photo on hover (on touch
 * screens the "Before & after" chip says there is more inside). The whole card is the link.
 */
export function ProjectCard({ project, priority = false }: { project: Card; priority?: boolean }) {
    const year = project.completed_on ? new Date(project.completed_on).getFullYear() : null;

    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group block outline-none focus-visible:ring-4 focus-visible:ring-[#F5C518]"
            data-testid="project-card"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <Image
                    src={project.cover_after}
                    alt={`${project.title}, after`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={priority}
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                />
                {project.cover_before && (
                    <Image
                        src={project.cover_before}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover opacity-0 transition duration-700 ease-out group-hover:opacity-100 group-hover:scale-105 hidden md:block"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />

                <span className="absolute top-3 left-3 bg-[#F5C518] text-[#181B34] text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1">
                    {project.category}
                </span>
                <span className="absolute top-3 right-3 hidden md:block bg-black/55 text-white text-[10px] font-semibold tracking-[0.18em] uppercase px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    Before
                </span>

                <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg leading-snug truncate">{project.title}</h3>
                        <p className="text-white/70 text-xs mt-1 flex items-center gap-1.5 truncate">
                            {project.location && (
                                <>
                                    <FiMapPin size={11} className="shrink-0" />
                                    {project.location}
                                </>
                            )}
                            {project.location && year ? " · " : ""}
                            {year}
                        </p>
                    </div>
                    <span className="shrink-0 w-9 h-9 bg-white/15 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#F5C518] group-hover:text-[#181B34]">
                        <FiArrowUpRight size={16} />
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-white/50">
                <span className="truncate">{project.style}</span>
                {project.pair_count > 0 && (
                    <span className="shrink-0 whitespace-nowrap">
                        {project.pair_count} before &amp; after{project.pair_count === 1 ? "" : "s"}
                    </span>
                )}
            </div>
        </Link>
    );
}

export function ProjectCardSkeleton() {
    return (
        <div aria-hidden>
            <div className="aspect-[4/3] bg-neutral-200 dark:bg-white/5 animate-pulse" />
            <div className="mt-3 h-3 w-1/2 bg-neutral-200 dark:bg-white/5 animate-pulse" />
        </div>
    );
}
