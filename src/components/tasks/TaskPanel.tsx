"use client";

import { Task, TaskPriority } from "@/types/task";
import { ChevronDown, ListTodo } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { TaskItem } from "./TaskItem";
import { taskService } from "@/services/task-service";
import { Button } from "../Button";

type TaskGroupProps = {
    title: string;
    tasks: Task[];
    busyTaskId: string | null;
    onToggleCompletion: (task: Task) => Promise<void>;
    onToggleHighlight: (task: Task) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
};

type TaskPanelProps = {
    onHighlightedTaskChange: (task: Task | null) => void;
}

function TaskGroup({title, tasks, busyTaskId, onToggleCompletion, onToggleHighlight, onDelete}: TaskGroupProps) {
    const [isOpen, setIsOpen] = useState(true);
    
    return(
        <div className = "border-b border-line last:border-b-0">
            <button
                type = "button"
                onClick = {() => setIsOpen((current) => !current)}
                aria-expanded = {isOpen}
                className = "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-page/60"
            >
                <ChevronDown
                    aria-hidden = "true"
                    className = {`size-4 text-muted transition ${isOpen ? "" : "-rotate-90"}`}
                />
                <span className = "flex-1 text-sm font-semibold text-ink">{title}</span>
                <span className = "rounded-full bg-soft px-2 py-1 text-xs font-semibold text-primary">{tasks.length}</span>
            </button>
            {isOpen && (
                <div>
                    {tasks.length === 0 ? (
                        <p className = "px-11 py-4 text-xs text-muted">Tidak ada task pada bagian ini.</p>
                    ) : (
                        tasks.map((task) => (
                            <TaskItem
                                key = {task.id}
                                task = {task}
                                isBusy = {busyTaskId === task.id}
                                onToggleCompletion = {onToggleCompletion}
                                onToggleHighlight = {onToggleHighlight}
                                onDelete = {onDelete}
                            />
                        ))
                    )}
                </div> 
            )}
        </div>
    );
}

function startOfDay(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, amount: number) {
    const result = new Date(value);
    result.setDate(result.getDate() + amount);
    return result;
}

function getTodayInputValue() {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60_000;

    return new Date(today.getTime() - timezoneOffset).toISOString().slice(0,10);
}

function groupTasks(tasks: Task[]) {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const afterTomorrow = addDays(today, 2);
    const endOfNextSevenDays = addDays(today, 8);
    const overdue: Task[] = [];
    const todayTask: Task[] = [];
    const tomorrowTask: Task[] = [];
    const nextSevenDays: Task[] = [];
    const otherTasks: Task[] = [];

    tasks.forEach((task) => {
        if(!task.dueDate) {
            otherTasks.push(task);
            return;
        }
        const taskDate = startOfDay(new Date(task.dueDate));
        
        if(taskDate < today) {
            overdue.push(task);
        } else if(taskDate.getTime() === today.getTime()) {
            todayTask.push(task);
        } else if(taskDate.getTime() === tomorrow.getTime()) {
            tomorrowTask.push(task);
        } else if(taskDate >= afterTomorrow && taskDate < endOfNextSevenDays) {
            nextSevenDays.push(task);
        } else {
            otherTasks.push(task);
        }     
    });

    return {overdue, todayTask, tomorrowTask, nextSevenDays, otherTasks};
}

export function TasksPanel({onHighlightedTaskChange}:TaskPanelProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState(getTodayInputValue);
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTask() {
            try {
                const taskData = await taskService.getAll();
                setTasks(taskData);
            } catch (requestError) {
                setError(requestError instanceof Error
                    ? requestError.message
                    : "Task belum dapat dimuat.",
                );
            } finally {
                setIsLoading(false);
            }
        }
        void loadTask();
    }, []);

    useEffect(() => {
        const highlightedTask = tasks.find((task) =>
            !task.isCompleted && task.isHighlighted
        ) ?? null;
        onHighlightedTaskChange(highlightedTask);
    }, [tasks, onHighlightedTaskChange]);

    async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!title.trim()) {
            setError("Judul task wajib diisi.");
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const task = await taskService.create({
                title: title.trim(), 
                description: "",  
                dueDate: dueDate, 
                priority,
            });
            setTasks((current) => [task, ...current]);
            setTitle("");
            setDueDate(getTodayInputValue());
            setPriority("MEDIUM");
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Task gagal dibuat.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleCompletion(task: Task) {
        setBusyTaskId(task.id);
        setError("");

        try {
            const isCompleted = !task.isCompleted;
            const updatedTask = await taskService.update(task.id, isCompleted ? {
                isCompleted: true,
                isHighlighted: false,
            } : {
                isCompleted: false,
            });
            setTasks((current) => 
                current.map((item) => 
                    item.id === updatedTask.id ? updatedTask : item,));
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Status task gagal diperbarui.",
            );
        } finally {
            setBusyTaskId(null);
        }
    }

    async function handleToggleHighlight(task: Task) {
        setBusyTaskId(task.id);
        setError("");

        try {
            const updatedTask = await taskService.update(task.id, {
                isHighlighted: !task.isHighlighted,
            });

            setTasks((current) => 
                current.map((item) => {
                    if(item.id === updatedTask.id) {
                        return updatedTask;
                    }
                    if(updatedTask.isHighlighted) {
                        return {...item, isHighlighted: false}
                    }
                    return item;
                }),
            );
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Daily Highlight gagal diperbarui.",
            );
        } finally {
            setBusyTaskId(null);
        }
    }

    async function handleDelete(task: Task) {
        const confirmed = window.confirm(`Hapus task "${task.title}"?`);
        
        if(!confirmed) {
            return;
        }

        setBusyTaskId(task.id);
        setError("");

        try {
            await taskService.delete(task.id);
            setTasks((current) => 
                current.filter((item) => item.id !== task.id),
            );
        } catch (requestError) {
            setError(requestError instanceof Error
                ? requestError.message
                : "Task gagal dihapus.",
            );
        } finally {
            setBusyTaskId(null);
        }
    }

    const groupedTasks = groupTasks(tasks);

    return (
        <section
            id = "tasks"
            aria-labelledby = "tasks-heading"
            className = "mb-10"
        >
            <div className = "mb-4">
                <p className = "text-xs font-bold tracking-[0.14em] text-primary uppercase">Productivity</p>
                <h2
                    id = "tasks-heading"
                    className = "mt-1 flex items-center gap-2 text-xl font-bold text-ink"
                >
                    <ListTodo
                        aria-hidden = "true"
                        className = "size-5 text-primary"
                    />
                    Tasks
                </h2>
            </div>
            <form
                onSubmit = {handleCreateTask}
                className = "mb-4 grid gap-3 rounded-2xl border border-line bg-panel p-4 shadow-sm md:grid-cols-[1fr_auto_auto_auto]"
            >
                <input
                    value = {title}
                    onChange = {(event) => setTitle(event.target.value)}
                    placeholder = "Tambahkan task..."
                    className = "min-w-0 rounded-xl border border-line bg-page/50 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent focus:ring-4 focus:ring-focus"
                />
                <input
                    type = "date"
                    value = {dueDate}
                    onChange = {(event) => setDueDate(event.target.value)}
                    className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                />
                <select
                    value = {priority}
                    onChange = {(event) => setPriority(event.target.value as TaskPriority)}
                    className = "rounded-xl border border-line bg-page/50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-focus"
                >
                    <option value = "LOW">Rendah</option>
                    <option value = "MEDIUM">Sedang</option>
                    <option value = "HIGH">Tinggi</option>
                </select>
                <Button
                    type = "submit"
                    disabled = {isSaving}
                >
                    {isSaving ? "Menambahkan..." : "Tambah"}
                </Button>
            </form>
            {error && (
                <div
                    role = "alert"
                    className = "mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}
            <div className = "overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
                {isLoading ? (
                    <p className = "p-5 text-sm text-muted">Memuat task...</p>
                ) : (
                    <>
                        {groupedTasks.overdue.length > 0 && (
                            <TaskGroup
                                title = "Terlambat"
                                tasks = {groupedTasks.overdue}
                                busyTaskId = {busyTaskId}
                                onToggleCompletion = {handleToggleCompletion}
                                onToggleHighlight = {handleToggleHighlight}
                                onDelete = {handleDelete}
                            />
                        )}
                        <TaskGroup
                            title = "Hari ini"
                            tasks = {groupedTasks.todayTask}
                            busyTaskId = {busyTaskId}
                            onToggleCompletion = {handleToggleCompletion}
                            onToggleHighlight = {handleToggleHighlight}
                            onDelete = {handleDelete}
                        />
                        <TaskGroup
                            title = "Besok"
                            tasks = {groupedTasks.tomorrowTask}
                            busyTaskId = {busyTaskId}
                            onToggleCompletion = {handleToggleCompletion}
                            onToggleHighlight = {handleToggleHighlight}
                            onDelete = {handleDelete}
                        />
                        <TaskGroup
                            title = "7 hari ke depan"
                            tasks = {groupedTasks.nextSevenDays}
                            busyTaskId = {busyTaskId}
                            onToggleCompletion = {handleToggleCompletion}
                            onToggleHighlight = {handleToggleHighlight}
                            onDelete = {handleDelete}
                        />
                        {groupedTasks.otherTasks.length > 0 && (
                            <TaskGroup
                                title = "Lainnya"
                                tasks = {groupedTasks.otherTasks}
                                busyTaskId = {busyTaskId}
                                onToggleCompletion = {handleToggleCompletion}
                                onToggleHighlight = {handleToggleHighlight}
                                onDelete = {handleDelete}
                            />
                        )}
                    </>
                )}
            </div>
        </section>
    )
}