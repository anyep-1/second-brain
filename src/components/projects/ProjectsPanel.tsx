"use client";

import { projectService } from "@/services/project-service";
import { Project, ProjectStatus } from "@/types/project";
import { TaskPriority } from "@/types/task";
import { FolderKanban } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../Button";
import { ProjectCard } from "./ProjectCard";

type ProjectsPanelProps = {
    refreshKey: number;
    onProjectsChange: (project: Project[]) => void;
}; 

export function ProjectsPanel({refreshKey, onProjectsChange}: ProjectsPanelProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [showArchived, setShowArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [busyProjectId, setBusyProjectId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProject() {
            try {
                const projectData = await projectService.getAll();

                setProjects(projectData);
            } catch (requestError) {
                setError(requestError instanceof Error
                    ? requestError.message
                    : "Project belum dapat dimuat.",
                );
            } finally {
                setIsLoading(false);
            }
        }
        void loadProject();
    }, [refreshKey]);

    useEffect(() => {
        onProjectsChange(projects);
    }, [projects, onProjectsChange]);

    async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!name.trim()) {
            setError("Nama project wajib diisi.");
            return;
        }
        setIsSaving(true);
        setError("");

        try {
            const project = await projectService.create({
                name: name.trim(),
                description: description.trim(),
                priority,
                status: "ACTIVE",
                deadline: deadline ? new Date(`${deadline}T12:00:00`).toISOString() : null,
            });

            setProjects((current) => [
                project,
                ...current,
            ]);

            setName("");
            setDescription("");
            setPriority("MEDIUM");
            setDeadline("");
            setShowArchived(false);
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Project gagal dibuat.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleStatusChange(project: Project, status: ProjectStatus) {
        setBusyProjectId(project.id);
        setError("");

        try {
            const updatedProject = await projectService.update(project.id, {status});

            setProjects((current) => current.map((item) =>
                item.id === updatedProject.id ? updatedProject : item,
            ));
        } catch (requestError) {
            setError( requestError instanceof Error
                ? requestError.message
                : "Status project gagal diperbarui.",
            );
        } finally {
            setBusyProjectId(null);
        }
    }

    async function handleToggleArchive(project: Project) {
        setBusyProjectId(project.id);
        setError("");

        try {
            const updatedProject = await projectService.update(project.id, {isArchived: !project.isArchived});

            setProjects((current) => current.map((item) => 
                item.id === updatedProject.id ? updatedProject : item,
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Arsip project gagal diperbarui.",
            );
        } finally {
            setBusyProjectId(null);
        }
    }

    async function handleDelete(project: Project) {
        const confirmed = window.confirm(`Hapus project "${project.name}"`);

        if(!confirmed) {
            return;
        }

        setBusyProjectId(project.id);
        setError("");

        try {
            await projectService.delete(project.id);

            setProjects((current) => current.filter((item) =>
                item.id !== project.id
            ));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Project gagal dihapus.",
            );
        } finally {
            setBusyProjectId(null);
        }
    }
    const visibleProject = projects.filter((project) => project.isArchived === showArchived);
    const activeCount = projects.filter((project) => !project.isArchived).length;
    const archivedCount = projects.filter((project) => project.isArchived).length;

    return (
        <section
            id = "projects"
            aria-labelledby = "projects-heading"
            className = "mb-10"
        >
            <div className = "mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className = "text-xs font-bold uppercase tracking-[0.14em] text-primary">Planning</p>
                    <h2
                        id = "projects-heading"
                        className = "mt-1 flex items-center gap-2 text-xl font-bold text-ink"
                    >
                        <FolderKanban 
                            aria-hidden = "true"
                            className = "size-5 text-primary"
                        />
                        Projects
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
                onSubmit = {handleCreateProject}
                className = "mb-4 rounded-2xl border border-line bg-panel p-5 shadow-sm"
            >
                <div className = "grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                        value = {name}
                        onChange = {(event) => setName(event.target.value)}
                        placeholder = "Nama project..."
                        className = "min-w-0 rounded-xl border border-line bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                    />
                    <input
                        type = "date"
                        value = {deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                        className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                    />
                    <select
                        value = {priority}
                        onChange={(event) => setPriority(event.target.value as TaskPriority)}
                        className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"

                    >
                        <option value = "LOW">Prioritas rendah</option>
                        <option value = "MEDIUM">Prioritas sedang</option>
                        <option value = "HIGH">Prioritas tinggi</option>
                    </select>
                </div>
                <textarea
                    value = {description}
                    onChange = {(event) => setDescription(event.target.value)}
                    placeholder = "Deskripsi project..."
                    rows = {3}
                    className = "mt-3 w-full resize-none rounded-xl border border-line bg-panel/50 px-4 py-3 text-sm leading-6 text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                />
                <div className = "mt-4 flex justify-end">
                    <Button
                        type = "submit"
                        disabled = {isSaving}
                    >
                        {isSaving ? "Menambahkan..." : "Tambah Project"}
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
                <p className = "text-sm text-muted">Memuat project...</p>

            ) : visibleProject.length === 0 ? (
                <div className = "rounded-2xl border border-dashed border-line bg-panel p-8 text-center">
                    <h3 className = "font-semibold text-ink">{showArchived ? "Belum ada project diarsipkan" : "Belum ada project aktif"}</h3>
                    <p className = "mt-2 text-sm text-muted">{showArchived ? "Project yang diarsipkan akan muncul di sini." : "Buat project pertama menggunakan form di atas"}</p>
                </div>
            ) : (
                <div>
                    {visibleProject.map((project) =>(
                        <ProjectCard
                            key = {project.id}
                            project = {project}
                            isBusy = {busyProjectId === project.id}
                            onStatusChange = {handleStatusChange}
                            onToggleArchive = {handleToggleArchive}
                            onDelete = {handleDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}