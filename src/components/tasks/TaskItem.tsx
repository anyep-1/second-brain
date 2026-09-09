"use client";

import { Task, TaskPriority } from "@/types/task";
import { CalendarDays, Check, Star, Trash2 } from "lucide-react";

type TaskItemProps = {
    task: Task;
    isBusy: boolean;
    onToggleCompletion: (task: Task) => Promise<void>;
    onToggleHighlight: (task: Task) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
};

const priorityLabels: Record<TaskPriority, string> = {
    LOW: "Rendah",
    MEDIUM: "Sedang",
    HIGH: "Tinggi",
};

const priorityClasses: Record<TaskPriority, string> = {
    LOW: "bg-emerald-50 text-emerald-700",
    MEDIUM: "bg-amber-50 text-amber-700",
    HIGH: "bg-red-50 text-red-700",
};

function formatDate(value: string | null) {
    if(!value) {
        return "Tanpa tanggal";
    }
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value)); 
}

export function TaskItem({task, isBusy, onToggleCompletion, onToggleHighlight, onDelete}: TaskItemProps) {
    return (
        <article 
            className = {`flex items-start gap-3 border-b border-line px-4 py-4 transition last:border-b-0 hover:bg-page/60 
                ${task.isCompleted ? "opacity-60" : ""}`}
        >
            <button
                type  = "button"
                disabled = {isBusy}
                onClick={() => void onToggleCompletion(task)}
                aria-label = {task.isCompleted ? `Batalkan penyelesaian ${task.title}` : `Selesaikan ${task.title}`}
                className = {`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed
                    ${task.isCompleted ? "border-primary bg-primary text-white" : "border-line bg-panel hover:border-primary"}`} 
            >
                {task.isCompleted && (
                    <Check
                        aria-hidden = "true"
                        className = "size-3.5"
                    />
                )}
            </button>
            <div className = "min-w-0 flex-1">
                <p className = {`text-sm font-semibold text-ink ${task.isCompleted ? "line-through" : ""}`}>
                    {task.title}
                </p>
                {task.description && (
                    <p className = "mt-1 text-xs leading-5 text-muted">{task.description}</p>
                )}
                <div className = "mt-2 flex flex-wrap items-center gap-2">
                    <span className = "inline-flex items-center gap-1 text-xs text-muted">
                        <CalendarDays
                            aria-hidden = "true"
                            className = "size-3.5"
                        />
                        {formatDate(task.dueDate)}
                    </span>
                    <span className = {`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityClasses[task.priority]}`}>
                        {priorityLabels[task.priority]}
                    </span>
                    {task.isHighlighted && (
                        <span className = "rounded-full bg-soft px-2 py-1 text-[10px] font-semibold text-primary">
                            Daily HIghlight
                        </span>
                    )}
                </div>
            </div>
            <div className = "flex shrink-0 items-center gap-1">
                <button
                    type = "button"
                    disabled = {isBusy || task.isCompleted}
                    onClick = {() => void onToggleHighlight(task)}
                    aria-label = {task.isHighlighted ? "Hapus dari Daily Highlight" : "Jadikan Daily Highlight"}
                    className = {`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${task.isHighlighted ? "bg-amber-50 text-amber-50" : "text-muted hover:bg-soft hover:text-primary"}`}
                >
                    <Star
                        aria-hidden = "true"
                        className = {`size-4 ${task.isHighlighted ? "fill-current" : ""}`}
                    />
                </button>
                <button
                    type  = "button"
                    disabled = {isBusy}
                    onClick = {() => void onDelete(task)}
                    aria-label = {`Hapus ${task.title}`}
                    className = "rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40" 
                >
                    <Trash2
                        aria-hidden = "true"
                        className = "size-4"
                    />
                </button>
            </div>
        </article>
    );
}


