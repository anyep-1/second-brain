"use client";

import { resourceService } from "@/services/resource-service";
import { Area } from "@/types/area";
import { Resource, ResourceStatus, ResourceType } from "@/types/resource";
import { Library } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../Button";
import { ResourceCard } from "./ResourceCard";

type ResourcesPanelProps = {
    areas: Area[];
    onResourcesChange?: (resources: Resource[]) => void;
};

type ResourceView = | "ALL" | "TO_REVIEW" | "FAVORITES" | "ARCHIVED";

const typeLabels: Record<ResourceType, string> = {
    ARTICLE: "Artikel",
    BOOK: "Buku",
    COURSE: "Kursus",
    OTHER: "Lainnya",
    TOOL: "Tool",
    VIDEO: "Video",
};

export function ResourcesPanel({areas, onResourcesChange}: ResourcesPanelProps) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [type,setType] = useState<ResourceType>("ARTICLE");
    const [areaId, setAreaId] = useState("");
    const [view, setView] = useState<ResourceView>("ALL");
    const [typeFilter, setTypeFilter] = useState<ResourceType | "ALL">("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [busyResourceId, setBusyResourceId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadResources() {
            try {
                const resourceData = await resourceService.getAll();

                setResources(resourceData);
            } catch (requestError) {
                setError(requestError instanceof Error
                    ? requestError.message
                    : "Resource belum dapat dimuat.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadResources();
    }, []);

    useEffect(() => {
        onResourcesChange?.(resources);
    }, [resources, onResourcesChange]);

    async function handleCreateResource(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!title.trim()) {
            setError("Judul resource wajib diisi.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const resource = await resourceService.create({
                title: title.trim(),
                description: description.trim(),
                url: url.trim(),
                type,
                status: "TO_REVIEW",
                areaId: areaId || null,
            });

            setResources((current) => [resource, ...current]);
            setTitle("");
            setDescription("");
            setUrl("");
            setType("ARTICLE");
            setAreaId("");
            setView("ALL");
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Resource gagal disimpan.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleStatusChange(resource: Resource, status: ResourceStatus) {
        setBusyResourceId(resource.id);
        setError("");

        try {
            const updatedResource = await resourceService.update(resource.id, {
                status,
            });

            setResources((current) => current.map((item) =>
                item.id === updatedResource.id ? updatedResource : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Status resource gagal diperbarui.",
            );
        } finally {
            setBusyResourceId(null);
        }
    }

    async function handleAreaChange(resource: Resource, selectedAreaId: string) {
        setBusyResourceId(resource.id);
        setError("");

        try {
            const updatedResource = await resourceService.update(resource.id, {
                areaId: selectedAreaId || null,
            });

            setResources((current) => current.map((item) =>
                item.id === updatedResource.id ? updatedResource : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Area resource gagal diperbarui.",
            );
        } finally {
            setBusyResourceId(null);
        }
    }

    async function handleToggleFavorite(resource: Resource) {
        setBusyResourceId(resource.id);
        setError("");

        try {
            const updatedResource = await resourceService.update(resource.id, {
                isFavorite: !resource.isFavorite,
            });

            setResources((current) => current.map((item) =>
                item.id === updatedResource.id ? updatedResource : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Favorit resource gagal diperbarui.",
            );
        } finally {
            setBusyResourceId(null);
        }
    }

    async function handleToggleArchived(resource: Resource) {
        setBusyResourceId(resource.id);
        setError("");

        try {
            const updatedResource = await resourceService.update(resource.id, {
                isArchived: !resource.isArchived,
            });

            setResources((current) => current.map((item) => 
                item.id === updatedResource.id ? updatedResource : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Arsip resource gagal diperbarui.",
            );
        } finally {
            setBusyResourceId(null);
        }
    }

    async function handleDelete(resource: Resource) {
        const confirmed = window.confirm(`Hapus resource "${resource.title}"?`);

        if(!confirmed) {
            return;
        }

        setBusyResourceId(resource.id);
        setError("");

        try {
            await resourceService.delete(resource.id);

            setResources((current) => current.filter((item) => 
                item.id !== resource.id,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Resource gagal dihapus.",
            );
        } finally {
            setBusyResourceId(null);
        }
    }

    const visibleResources = resources.filter((resource) => {
        const matchesView = view === "ARCHIVED" ? resource.isArchived
                                                : view === "FAVORITES" ? resource.isFavorite && !resource.isArchived
                                                                       : view === "TO_REVIEW" ? resource.status === "TO_REVIEW" && !resource.isArchived
                                                                                              : !resource.isArchived;

        const matchesType = typeFilter === "ALL" || resource.type === typeFilter;

        return matchesView && matchesType;
    });

    const activeCount = resources.filter((resource) => !resource.isArchived).length;
    const reviewCount = resources.filter((resource) => resource.status === "TO_REVIEW" && !resource.isArchived).length;
    const favoriteCount = resources.filter((resource) => resource.isFavorite && !resource.isArchived).length;
    const archivedCount = resources.filter((resource) => resource.isArchived).length;

    return (
        <section
            id = "resources"
            aria-labelledby = "resources-heading"
            className = "mb-10"
        >
            <div className = "mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className = "text-xs font-bold uppercase tracking-[0.14em] text-primary">Knowledge</p>
                    <h2
                        id = "resources-heading"
                        className = "mt-1 flex items-center gap-2 text-xl font-bold text-ink"
                    >
                        <Library
                            aria-hidden = "true"
                            className = "size-5 text-primary"
                        />
                        Resources
                    </h2>
                </div>
                <select
                    value = {typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as | ResourceType | "ALL")}
                    aria-label = "Filter jenis resource"
                    className = "rounded-xl border border-line bg-panel px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                >
                    <option value = "ALL">Semua jenis</option>
                    {Object.entries(typeLabels).map(([value, label]) => (
                        <option
                            key = {value}
                            value = {value}
                        >
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            <form
                onSubmit = {handleCreateResource}
                className = "mb-4 rounded-2xl border border-line bg-panel p-5 shadow-sm"
            >
                <div className = "grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                    <input
                        value = {title}
                        onChange = {(event) => setTitle(event.target.value)}
                        placeholder = "Judul resource..."
                        className = "min-w-0 rounded-xl border border-line bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                    />
                    <input
                        type = "text"
                        value = {url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder = "URL resource..."
                        className = "min-w-0 rounded-xl border border-line bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                    />
                    <select
                        value = {type}
                        onChange = {(event) => setType(event.target.value as ResourceType)}
                        className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                    >
                        {Object.entries(typeLabels).map(([value, label]) => (
                            <option
                                key = {value}
                                value = {value}
                            >
                                {label}
                            </option>
                        ))}
                    </select>
                    <select
                        value = {areaId}
                        onChange = {(event) => setAreaId(event.target.value)}
                        className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                    >
                        <option value = "">Tanpa area</option>
                        {areas.filter((area) => !area.isArchived).map((area) => (
                            <option
                                key = {area.id}
                                value = {area.id}
                            >
                                {area.name}
                            </option>
                        ))}
                    </select>
                </div>
                <textarea
                    value = {description}
                    onChange = {(event) => setDescription(event.target.value)}
                    placeholder = "Deskripsi resource..."
                    rows = {2}
                    className = "mt-3 w-full resize-none rounded-xl border border-line bg-page/50 px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                />
                <div className = "mt-4 flex justify-end">
                    <Button
                        type = "submit"
                        disabled = {isSaving}
                    >
                        {isSaving ? "Menyimpan..." : "Tambah Resource"}
                    </Button>
                </div>
            </form>
            <div className = "mb-4 flex flex-wrap gap-2">
                <button
                    type = "button"
                    onClick = {() => setView("ALL")}
                    className = {`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        view === "ALL" ? "bg-primary text-white" : "bg-soft text-muted hover:text-primary"
                    }`}
                >
                    Semua ({activeCount})
                </button>
                <button
                    type = "button"
                    onClick = {() => setView("TO_REVIEW")}
                    className = {`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        view === "TO_REVIEW" ? "bg-primary text-white" : "bg-soft text-muted hover:text-primary"
                    }`}
                >
                    Akan ditinjau ({reviewCount})
                </button>
                <button
                    type = "button"
                    onClick = {() => setView("FAVORITES")}
                    className = {`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        view === "FAVORITES" ? "bg-primary text-white" : "bg-soft text-muted hover:text-primary"
                    }`}
                >
                    Favorit ({favoriteCount})
                </button>
                <button
                    type = "button"
                    onClick = {() => setView("ARCHIVED")}
                    className = {`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        view === "ARCHIVED" ? "bg-primary text-white" : "bg-soft text-muted hover:text-primary"
                    }`}
                >
                    Arsip ({archivedCount})
                </button>
            </div>

            {error && (
                <div
                    role = "alert"
                    className = "mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {isLoading ? (
                <p className = "text-sm text-muted">Memuat resource...</p>
            ) : visibleResources.length === 0 ? (
                <div className = "rounded-2xl border border-dashed border-line bg-panel p-8 text-center">
                    <h3 className = "font-semibold text-ink">Belum ada resource</h3>
                    <p className = "mt-2 text-sm text-muted">Tambahkan artikel, video, kursus, buku, atau referensi lainnya.</p>
                </div>
            ) : (
                <div className = "grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleResources.map((resource) => (
                        <ResourceCard
                            key = {resource.id}
                            resource = {resource}
                            areas = {areas}
                            isBusy = {busyResourceId === resource.id}
                            onStatusChange = {handleStatusChange}
                            onAreaChange = {handleAreaChange}
                            onToggleFavorite = {handleToggleFavorite}
                            onToggleArchived = {handleToggleArchived}
                            onDelete = {handleDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    )

}