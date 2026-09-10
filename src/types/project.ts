import { TaskPriority } from "./task";

export type ProjectStatus = | "PLANNED" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

export type Project = {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    priority: TaskPriority;
    deadline: string | null;
    completedAt: string | null;
    isArchived: boolean;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateProjectInput = {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: TaskPriority;
    deadline?: string | null;
};

export type UpdateProjectInput = {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: TaskPriority;
    deadline?: string | null;
    isArchived?: boolean;
};

