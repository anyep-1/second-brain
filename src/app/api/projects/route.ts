import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/types/project";
import type { TaskPriority } from "@/types/task";
import { NextResponse } from "next/server";

const PROJECT_STATUSES: ProjectStatus[] = [
    "PLANNED",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
];

const PROJECT_PRIORITIES: TaskPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
];

function isProjectStatus(value: unknown): value is ProjectStatus {
    return (
        typeof value === "string" && PROJECT_STATUSES.includes(
            value as ProjectStatus,
        )
    );
}

function isTaskPriority(value: unknown): value is TaskPriority {
    return (
        typeof value === "string" && PROJECT_PRIORITIES.includes(
            value as TaskPriority,
        )
    );
}

function addProjectProgress<T extends {tasks: {isCompleted: boolean;}[];}>(project: T) {
    const { tasks, ...projectData } = project;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.isCompleted).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks/totalTasks)*100);

    return {
        ...projectData,
        totalTasks,
        completedTasks,
        progress,
    };
}

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            include: {
                tasks: {
                    select: {
                        isCompleted: true,
                    },
                },
            },
            orderBy: [
                {
                    isArchived: "asc",
                },
                {
                    deadline: "asc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });
        const projectWithProgress = projects.map(addProjectProgress);

        return NextResponse.json({
            data: projectWithProgress,
        });
    } catch (error) {
        console.error("GET /api/projects error: ", error);
        return NextResponse.json(
            {
                message: "Project belum dapat dimuat.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();

        if(typeof body !== "object" || body === null){
            return NextResponse.json(
                {
                    message: "Data project tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const input = body as Record<string, unknown>;
        const name = typeof input.name === "string" ? input.name.trim() : "";

        if(!name) {
            return NextResponse.json(
                {
                    message: "Nama project wajib diisi.",
                },
                {
                    status: 400,
                },
            );
        }
        const description = typeof input.description === "string" ? input.description.trim() : "";
        const status = isProjectStatus(input.status) ? input.status : "ACTIVE";
        const priority = isTaskPriority(input.priority) ? input.priority : "MEDIUM";
        let deadline: Date | null = null;

        if(typeof input.deadline === "string" && input.deadline.trim()) {
            deadline = new Date(input.deadline);

            if(Number.isNaN(deadline.getTime())) {
                return NextResponse.json(
                    {
                        message: "Tanggal deadline project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }
        const project = await prisma.project.create({
            data: {
                name,
                description,
                status,
                priority,
                deadline,
                completedAt: status === "COMPLETED" ? new Date() : null,
            },
        });

        return NextResponse.json(
            {
                data: {
                    ...project,
                    totalTasks: 0,
                    completedTasks: 0,
                    progress: 0,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/projects error: ", error);

        return NextResponse.json(
            {
                message: "Project gagal dibuat.",
            },
            {
                status: 500,
            },
        );
    }
}

