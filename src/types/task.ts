export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskProject = {
    id: string;
    name: string;
};

export type Task = {
    id: string;
    title: string;
    description: string;
    dueDate: string | null;
    priority: TaskPriority;
    isCompleted: boolean;
    isHighlighted: boolean;
    completedAt: string | null;
    projectId: string | null;
    project: TaskProject | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateTaskInput = {
    title: string;
    description?: string;
    dueDate?: string | null;
    priority?: TaskPriority;
    projectId?: string | null;
};

export type UpdateTaskInput = {
    title?: string;
    description?: string;
    dueDate?: string | null;
    priority?: TaskPriority;
    isCompleted?: boolean;
    isHighlighted?: boolean;
    projectId?: string | null;
};