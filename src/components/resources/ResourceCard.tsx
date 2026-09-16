import { Area } from "@/types/area";
import { Resource, ResourceStatus, ResourceType } from "@/types/resource"
import { Archive, BookOpen, ExternalLink, FileText, GraduationCap, Link2, LucideIcon, PlaySquare, RotateCcw, Star, Trash2, Wrench } from "lucide-react";

type ResourceCardProps = {
    resource: Resource;
    areas: Area[];
    isBusy: boolean;
    onStatusChange: (resource: Resource, status: ResourceStatus) => Promise<void>;
    onAreaChange: (resource: Resource, areaId: string) => Promise<void>;
    onToggleFavorite: (resource: Resource) => Promise<void>;
    onToggleArchived: (resource: Resource) => Promise<void>;
    onDelete: (resource: Resource) => Promise<void>;
};

const typeConfiguration: Record<ResourceType, {label: string; icon: LucideIcon}> = {
    ARTICLE: {
        label: "Artikel",
        icon: FileText,
    },
    BOOK: {
        label: "Buku",
        icon: BookOpen,
    },
    COURSE: {
        label: "Kursus",
        icon: GraduationCap,
    },
    OTHER: {
        label: "Lainnya",
        icon: Link2,
    },
    TOOL: {
        label: "Tool",
        icon: Wrench,
    },
    VIDEO: {
        label: "Video",
        icon: PlaySquare,
    },
};

export function ResourceCard({resource, areas, isBusy, onStatusChange, onAreaChange, onToggleFavorite, onToggleArchived, onDelete}: ResourceCardProps) {
    const configuration = typeConfiguration[resource.type];
    const TypeIcon = configuration.icon;

    return (
        <article className = {`flex h-full flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm ${
                resource.isArchived ? "opacity-70" : ""
            }`}
        >
            <div className = "flex items-start justify-between gap-3">
                <div className = "flex min-w-0 items-start gap-3">
                    <div className = "flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                        <TypeIcon
                            aria-hidden = "true"
                            className = "size-5"
                        />
                    </div>
                    <div className = "min-w-0">
                        <p className = "text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{configuration.label}</p>
                        <h3 className = "mt-1 line-clamp-2 font-bold text-ink">{resource.title}</h3>
                    </div>
                </div>
                <button
                    type = "button"
                    disabled = {isBusy}
                    onClick={() => void onToggleFavorite(resource)}
                    aria-label = {resource.isFavorite ? `Hapus ${resource.title} dari favorit` : `Tambahkan ${resource.title} ke favorit`}
                    title = {resource.isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                    className = {`shrink-0 rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        resource.isFavorite ? "bg-amber-50 text-amber-500" : "text-muted hover:bg-soft hover:text-primary"
                    }`}
                > 
                    <Star
                        aria-hidden = "true"
                        className = "size-4"
                        fill = {resource.isFavorite ? "currentColor" : "none"}
                    />
                </button>
            </div>
            
            {resource.area && (
                <span
                    className = "mt-4 inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style = {{
                        color: resource.area.color,
                        borderColor: `${resource.area.color}40`,
                        backgroundColor: `${resource.area.color}12`,
                    }}
                    title = {`Area: ${resource.area.name}`}
                >
                    <span
                        aria-hidden = "true"
                        className = "size-1.5 shrink-0 rounded-full"
                        style = {{
                            backgroundColor: resource.area.color,
                        }}
                    />
                    <span className = "truncate">{resource.area.name}</span>
                </span>
            )}

            <p className = "mt-4 line-clamp-3 min-h-18 text-sm leading-6 text-muted">{resource.description || "Belum ada deskripsi resource."}</p>

            {resource.url && (
                <a
                    href = {resource.url}
                    target = "_blank"
                    rel = "noreferrer"
                    className = "mt-3 inline-flex w-fit max-w-full items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
                >
                    <ExternalLink
                        aria-hidden = "true"
                        className = "size-3.5 shrink-0"
                    />
                    <span className = "truncate">Buka resource</span>
                </a>
            )}

            <div className = "mt-auto pt-5">
                <div className = "grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className = "text-xs font-semibold text-muted">Status</label>
                        <select
                            value = {resource.status}
                            disabled = {isBusy}
                            onChange={(event) => void onStatusChange(resource, event.target.value as ResourceStatus)}
                            className = "mt-2 w-full rounded-xl border border-line bg-page/50 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value = "TO_REVIEW">Akan ditinjau</option>
                            <option value = "IN_PROGRESS">Sedang dipelajari</option>
                            <option value = "COMPLETED">Selesai</option>
                        </select>
                    </div>
                    <div>
                        <label className = "text-xs font-semibold text-muted">Area</label>
                        <select
                            value = {resource.areaId ?? ""}
                            disabled = {isBusy}
                            onChange={(event) => void onAreaChange(resource, event.target.value)}
                            className = "mt-2 w-full rounded-xl border border-line bg-page/50 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value = "">Tanpa area</option>
                            {areas.filter((area) => 
                                !area.isArchived || area.id === resource.areaId
                            ).map((area) => (
                                <option
                                    key = {area.id}
                                    value = {area.id}
                                >
                                    {area.name}
                                    {area.isArchived ? " (Diarsipkan)" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className = "mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
                    <button
                        type = "button"
                        disabled = {isBusy}
                        onClick={() => void onToggleArchived(resource)}
                        aria-label = {resource.isArchived ? `Kembalikan ${resource.title} dari arsip` : `Arsipkan ${resource.title}`}
                        title = {resource.isArchived ? "Kembalikan ke arsip" : "Arsipkan"}
                        className = "rounded-lg p-2 text-muted transition hover:bg-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resource.isArchived ? (
                            <RotateCcw
                                aria-hidden = "true"
                                className = "size-4"
                            />
                        ) : (
                            <Archive
                                aria-hidden = "true"
                                className = "size-4"
                            />
                        )}
                    </button>
                    <button
                        type = "button"
                        disabled = {isBusy}
                        onClick = {() => void onDelete(resource)}
                        aria-label = {`Hapus ${resource.title}`}
                        title = "Hapus resource"
                        className = "rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2
                            aria-hidden = "true"
                            className = "size-4"
                        />
                    </button>
                </div>
            </div>
        </article>
    )
}