import { Area } from "@/types/area";
import { Project, ProjectStatus } from "@/types/project"
import { Archive, CalendarDays, FolderKanban, RotateCcw, Trash2 } from "lucide-react";

type ProjectCardProps = {
    project: Project;
    areas: Area[];
    isBusy: boolean;
    onStatusChange: (project: Project, status: ProjectStatus) => Promise<void>;
    onAreaChange: (project: Project, areaId: string) => Promise<void>;
    onToggleArchive: (project: Project) => Promise<void>;
    onDelete: (project: Project) => Promise<void>;
};

const statusLabels: Record<ProjectStatus, string> = {
    PLANNED: "Direncanakan",
    ACTIVE: "Berjalan",
    ON_HOLD: "Ditunda",
    COMPLETED: "Selesai",
};

const priorityClasses: Record<Project["priority"], string> = {
    LOW: "bg-emerald-50 text-emerald-700",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
};

const priorityLabels: Record<Project["priority"], string> = {
    LOW: "Rendah",
    MEDIUM: "Sedang",
    HIGH: "Tinggi"
};

function formatDeadline(deadline: string | null) {
    if(!deadline) {
        return "Tanpa deadline";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(deadline));
}

export function ProjectCard({project, areas, isBusy, onStatusChange, onAreaChange, onToggleArchive, onDelete}: ProjectCardProps) {
    const isOverdue = Boolean(project.deadline) && new Date(project.deadline as string) < new Date() && project.status !== "COMPLETED";
    const progress = Math.min(100, Math.max(0, project.progress));

    return (
        <article className = {`rounded-2xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            project.isArchived ? "opacity-70" : ""
        }`}>
            <div className = "flex items-start justify-between gap-4">
                <div className = "flex min-w-0 items-start gap-3">
                    <div className = "flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                        <FolderKanban
                            aria-hidden = "true"
                            className = "size-5"
                        />
                    </div>
                    <div className = "min-w-0">
                        <h3 className = "truncate font-bold text-ink">{project.name}</h3>
                        <p
                            className = {`mt-1 flex items-center gap-1.5 text-xs ${
                                isOverdue ? "font-semibold text-red-600" : "text-muted"
                            }`}
                        >
                            <CalendarDays
                                aria-hidden = "true"
                                className = "size-3.5"
                            />
                            {formatDeadline(project.deadline)}
                        </p>
                        {project.area && (
                            <span
                                className = "mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                style = {{
                                    color: project.area.color,
                                    borderColor: `${project.area.color}40`,
                                    backgroundColor: `${project.area.color}12`,
                                }}
                                title = {`Area: ${project.area.name}`}
                            >
                                <span
                                    aria-hidden = "true"
                                    className = "size-1.5 shrink-0 rounded-full"
                                    style = {{backgroundColor: project.area.color}}
                                />
                                <span className = "truncate">{project.area.name}</span>
                            </span>
                        )}
                    </div>
                </div>
                <span
                    className = {`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        priorityClasses[project.priority]
                    }`}
                >
                    {priorityLabels[project.priority]}
                </span>
            </div>
            <p className = "mt-4 line-clamp-3 min-h-12 text-sm leading-6 text-muted">
                {project.description || "Belum ada deskripsi project."}
            </p>
            <div className = "mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className = "text-xs font-medium text-muted">
                    {project.totalTasks === 0 ? "Belum ada task" : `${project.completedTasks} dari ${project.totalTasks} task selesai`}
                </p>
                <div className = "flex shrink-0 items-center gap-2">
                    <div
                        role = "progressbar"
                        aria-label = {`Progres project ${project.name}`}
                        aria-valuemin = {0}
                        aria-valuemax = {100}
                        aria-valuenow = {progress}
                        className = "h-2 w-28 overflow-hidden rounded-full bg-soft ring-1 ring-line sm:w-36"
                    >
                        <div
                            className = {`h-full rounded-full transition-[width] duration-500 ${
                                progress === 100 ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style = {{width: `${progress}%`}}
                        />
                    </div>
                    <span className = "w-10 text-right text-xs font-bold text-primary">{progress}%</span>
                </div>
                
            </div>
            <div className = "mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <div>
                    <label className = "text-xs font-semibold text-muted">Status</label>
                    <select
                        value = {project.status}
                        disabled = {isBusy}
                        onChange = {(event) => void onStatusChange(project, event.target.value as ProjectStatus)}
                        className = "mt-2 w-full rounded-xl border border-line bg-page/50 px-3 py-2 text-sm text-ink outline-none focus:ring-focus focus:border-accent focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value = "PLANNED">Direncanakan</option>
                        <option value = "ACTIVE">Berjalan</option>
                        <option value = "ON_HOLD">Ditunda</option>
                        <option value = "COMPLETED">Selesai</option>
                    </select>
                </div>
                <div>
                    <label className = "text-xs font-semibold text-muted">Area</label>
                    <select
                        value = {project.areaId ?? ""}
                        disabled = {isBusy}
                        onChange = {(event) => void onAreaChange(project, event.target.value)}
                        className = "mt-2 w-full rounded-xl border border-line bg-page/50 px-3 py-2 text-sm text-ink outline-none focus:ring-focus focus:border-accent focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value = "">Tanpa area</option>
                        {areas.filter((area) => !area.isArchived || area.id === project.areaId).map((area) => (
                            <option
                                key = {area.id}
                                value = {area.id}
                            >
                                {area.name}
                                {area.isArchived ? " (Diarsipkan" : ""}
                            </option>   
                        ))}
                    </select>
                </div>
            </div>
            <div className = "mt-4 flex items-center justify-between">
                <span className = "text-xs text-muted">{statusLabels[project.status]}</span>
                <div className = "flex items-center gap-1">
                    <button
                        type = "button"
                        disabled = {isBusy}
                        onClick={() => void onToggleArchive(project)}
                        aria-label= {project.isArchived ? `Kembalikan ${project.name} dari arsip` : `Arsipkan ${project.name}`}
                        title = {project.isArchived ? "Kembali dari arsip" : "Arsipkan"}
                        className = "rounded-lg p-2 text-muted transition hover:bg-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {project.isArchived ? (
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
                        onClick={() => void onDelete(project)}
                        aria-label= {`Hapus ${project.name}`}
                        title = "Hapus project"
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
    );
}