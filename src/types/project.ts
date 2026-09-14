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
    areaId: string | null;
    area: ProjectArea | null;
    isArchived: boolean;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    createdAt: string;
    updatedAt: string;
};

export type ProjectArea = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export type CreateProjectInput = {
    name: string;
    description?: string;
    status?: ProjectStatus;
    priority?: TaskPriority;
    deadline?: string | null;
    areaId?: string | null;
};

export type UpdateProjectInput = {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: TaskPriority;
    deadline?: string | null;
    isArchived?: boolean;
    areaId?: string | null;
};

