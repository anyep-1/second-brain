"use client";

import { areaService } from "@/services/area-service";
import { Area, AreaIcon } from "@/types/area";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../Button";
import { AreaCard } from "./Areacard";
import { LayoutGrid } from "lucide-react";

const iconOptions: {value:  AreaIcon; label: string;}[] = [
    {
        value: "Layers",
        label: "Umum",
    },
    {
        value: "Briefcase",
        label: "Karier",
    },
    {
        value: "HeartPulse",
        label: "Kesehatan",
    },
    {
        value: "WalletCards",
        label: "Keuangan",
    },
    {
        value: "GraduationCap",
        label: "Pendidikan",
    },
    {
        value: "Code2",
        label: "Teknologi",
    },
    {
        value: "House",
        label: "Rumah",
    },
    {
        value: "BookOpen",
        label: "Pengetahuan",
    },
    {
        value: "Dumbbell",
        label: "Kebugaran",
    },
    {
        value: "Palette",
        label: "Kreativitas",
    },
];

type AreasPanelProps = {
    onAreasChange?: (areas: Area[]) => void;
    refreshKey?: number;
}

export function AreasPanel({onAreasChange, refreshKey = 0}: AreasPanelProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState<AreaIcon>("Layers");
    const [color, setColor] = useState("#A84F37");
    const [showArchived, setShowArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [busyAreaId, setBusyAreaId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadAreas() {
            try {
                const areaData = await areaService.getAll();

                setAreas(areaData);
            } catch (requestError) {
                setError(requestError instanceof Error
                    ? requestError.message
                    : "Area belum dapat dimuat.",
                );
            } finally {
                setIsLoading(false);
            }
        }
        void loadAreas();
    },[refreshKey]);

    useEffect(() => {
        onAreasChange?.(areas);
    }, [areas, onAreasChange]);

    async function handleCreateArea(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!name.trim()) {
            setError("Nama area wajib diisi.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const area = await areaService.create({
                name: name.trim(),
                description: description.trim(),
                icon,
                color,
            });

            setAreas((current) => [
                area,
                ...current,
            ]);
            setName("");
            setDescription("");
            setIcon("Layers");
            setColor("#A84F37");
            setShowArchived(false);
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Area gagal dibuat.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleArchive(area: Area) {
        setBusyAreaId(area.id);
        setError("");

        try {
            const updatedData = await areaService.update(area.id, {
                isArchived: !area.isArchived,
            });

            setAreas((current) => current.map((item) => 
                item.id === updatedData.id ? updatedData : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Arsip area gagal diperbarui.",
            );
        } finally {
            setBusyAreaId(null);
        }
    }

    async function handleDelete(area: Area) {
        const confirmed = window.confirm(`Hapus area "${area.name}"? Project di dalamnya tidak akan ikut terhapus.`);

        if(!confirmed) {
            return;
        }

        setBusyAreaId(area.id);
        setError("");

        try {
            await areaService.delete(area.id);

            setAreas((current) => current.filter((item) =>
                item.id !== area.id,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Area gagal dihapus.",
            );
        } finally {
            setBusyAreaId(null);
        }
    }

    const visibleAreas = areas.filter((area) => area.isArchived === showArchived);
    const activeCount = areas.filter((area) => !area.isArchived).length;
    const archivedCount = areas.filter((area) => area.isArchived).length;

    return (
        <section
            id = "areas"
            aria-labelledby = "areas-heading"
            className = "mb-10"        
        >
            <div className = "mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className = "text-xs font-bold uppercase tracking-[0.14em] text-primary">Responsibilities</p>
                    <h2
                        id = "areas-heading"
                        className = "mt-1 flex items-center gap-2 text-xl font-bold text-ink"
                    >
                        <LayoutGrid
                            aria-hidden = "true"
                            className = "size-5 text-primary"
                        />
                        Areas
                    </h2>
                </div>
                <div className = "flex rounded-xl border border-line bg-panel p-1">
                    <button
                        type = "button"
                        onClick = {() => setShowArchived(false)}
                        className = {`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            !showArchived ? "bg-soft text-primary" : "text-muted hover:text-ink"
                        }`}
                    >
                        Aktif ({activeCount})
                    </button>
                    <button
                        type = "button"
                        onClick = {() => setShowArchived(true)}
                        className = {`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                            showArchived ? "bg-soft text-primary" : "text-muted hover:text-ink"
                        }`}
                    >
                        Arsip ({archivedCount})
                    </button>
                </div>
            </div>
            <form
                onSubmit = {handleCreateArea}
                className = "mb-4 rounded-2xl border border-line bg-panel p-5 shadow-sm"
            >
                <div className = "grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                        value = {name}
                        onChange = {(event) => setName(event.target.value)}
                        placeholder = "Nama area..."
                        className = "min-w-0 rounded-xl border border-line bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                    />
                    <select
                        value = {icon}
                        onChange = {(event) => setIcon(event.target.value as AreaIcon)}
                        className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                    >
                        {iconOptions.map((option) => (
                            <option
                                key = {option.value}
                                value = {option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <label className = "flex items-center gap-2 rounded-xl border border-line bg-page/50 px-3 py-2">
                        <span className = "text-xs font-medium text-muted">Warna</span>
                        <input
                            type = "color"
                            value = {color}
                            onChange = {(event) => setColor(event.target.value)}
                            aria-label = "Pilih warna area"
                            className = "size-7 cursor-pointer border-0 bg-transparent p-0"
                        />
                    </label>
                </div>
                <textarea
                    value = {description}
                    onChange = {(event) => setDescription(event.target.value)}
                    placeholder = "Deskripsi tanggung jawab area..."
                    rows = {2}
                    className = "mt-3 w-full resize-none rounded-xl border border-line bg-page/50 px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                />
                <div className = "mt-4 flex justify-end">
                    <Button
                        type = "submit"
                        disabled = {isSaving}
                    >
                        {isSaving ? "Menambahkan..." : "Tambah area"}
                    </Button>
                </div>
            </form>
            {error && (
                <div
                    role = "alert"
                    className = "mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}
            {isLoading ? (
                <p className = "text-sm text-muted">Memuat area...</p>
            ) : visibleAreas.length === 0 ? (
                <div className = "rounded-2xl border border-dashed border-line bg-panel p-8 text-center">
                    <h3 className = "font-semibold text-ink">{showArchived ? "Belum ada area diarsipkan" : "Belum ada area aktif"}</h3>
                    <p className = "mt-2 text-sm text-muted">{showArchived ? "Area yang diarsipkan akan muncul di sini." : "Buat area untuk mengelompokkan tanggung jawab jangka panjang."}</p>
                </div>
            ) : (
                <div className = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleAreas.map((area) =>  (
                        <AreaCard
                            key = {area.id}
                            area = {area}
                            isBusy = {busyAreaId === area.id}
                            onToggleArchive = {handleToggleArchive}
                            onDelete = {handleDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}