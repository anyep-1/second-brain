export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
    id: string;
    title: string;
    description: string;
    dueDate: string | null;
    priority: TaskPriority;
    isCompleted: boolean;
    isHighlighted: boolean;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateTaskInput = {
    title: string;
    description?: string;
    dueDate?: string | null;
    priority?: TaskPriority;
}

export type UpdateTaskInput = {
    title?: string;
    description?: string;
    dueDate?: string | null;
    priority?: TaskPriority;
    isCompleted?: boolean;
    isHighlighted?: boolean;
}