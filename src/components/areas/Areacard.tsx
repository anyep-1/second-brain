import { Area, AreaIcon } from "@/types/area"
import { LucideIcon, Layers, Briefcase, HeartPulse, House, WalletCards, GraduationCap, Code2, BookOpen, Dumbbell, Palette, Trash2, RotateCcw, Archive } from "lucide-react";

type AreaCardProps = {
    area: Area;
    isBusy: boolean;
    onToggleArchive: (area: Area) => Promise<void>;
    onDelete: (area: Area) => Promise<void>;
};

const areaIcons: Record<AreaIcon, LucideIcon> = {
    Layers, Briefcase, HeartPulse, House, WalletCards, GraduationCap, Code2, BookOpen, Dumbbell, Palette,
}; 

export function AreaCard({area, isBusy, onToggleArchive, onDelete}: AreaCardProps) {
    const Icon = areaIcons[area.icon] ?? Layers;

    return (
        <article
            className = {`group rounded-2xl border border-line bg-panel p-5 shadow-sm transition hover:translate-y-0.5 hover:shadow-md ${
                area.isArchived ? "opacity-70" : ""
            }`}
        >
            <div className = "flex items-start justify-between gap-4">
                <div
                    className = "flex size-12 shrink-0 items-center justify-center rounded-2xl"
                    style = {{
                        color: area.color,
                        backgroundColor: `${area.color}18`,
                    }}
                >
                    <Icon
                        aria-hidden = "true"
                        className = "size-6"
                    />
                </div>
                <div className = "flex items-center gap-1">
                    <button
                        type = "button"
                        disabled = {isBusy}
                        onClick = {() => void onToggleArchive(area)}
                        aria-label = {area.isArchived ? `Kembalikan ${area.name} dari arsip` : `Arsipkan ${area.name}`}
                        title = {area.isArchived ? "Kembalikan dari arsip" : "Arsipkan"}
                        className = "rounded-lg p-2 text-muted transition hover:bg-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {area.isArchived ? (
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
                        onClick = {() => void onDelete(area)}
                        aria-label = {`Hapus ${area.name}`}
                        title = "Hapus area"
                        className = "rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 />
                    </button>
                </div>
            </div>
            <h3 className = "mt-4 font-bold text-ink">{area.name}</h3>
            <p className = "mt-2 line-clamp-2 min-h-0 text-sm leading-5 text-muted">{area.description || "Belum ada deskripsi area."}</p>
            <div className = "mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
                <div>
                    <p className = "text-lg font-bold text-ink">{area.totalProjects}</p>
                    <p className = "text-[11px] text-muted">Project</p>
                </div>
                <div>
                    <p className = "text-lg font-bold text-primary">{area.activeProjects}</p>
                    <p className = "text-[11px] text-muted">Berjalan</p>
                </div>
                <div>
                    <p className = "text-lg font-bold text-emerald-600">{area.completedProjects}</p>
                    <p className = "text-[11px] text-muted">Selesai</p>
                </div>
            </div>
        </article>
    );
}