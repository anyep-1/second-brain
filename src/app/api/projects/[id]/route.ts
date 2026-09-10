import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@/types/project";
import { TaskPriority } from "@/types/task";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{id: string}>;
};

const PROJECT_STATUSES: ProjectStatus[] = [
    "PLANNED",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
];

const PROJECT_PRIORITIES:  TaskPriority[] = [
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

export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const project = await prisma.project.findUnique({
            where: {
                id,
            },
            include: {
                tasks: {
                    select:{
                        isCompleted: true,
                    },
                },
            },
        });

        if(!project) {
            return NextResponse.json(
                {
                    message: "Project tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            data: addProjectProgress(project),
        });
    } catch (error) {
        console.error("GET /api/projects/[id] error: ", error);
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

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const existingProject = await prisma.project.findUnique({
            where: {
                id,
            },
        });

        if(!existingProject) {
            return NextResponse.json(
                {
                    message: "Project tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }
        const body: unknown = await request.json();

        if(typeof body !== "object" || body === null) {
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
        const updatedData: {
            name?: string;
            description?: string;
            status?: ProjectStatus;
            priority?: TaskPriority;
            deadline?: Date | null;
            completedAt?: Date | null;
            isArchived?: boolean;
        } = {};

        if("name" in input) {
            if(typeof input.name !== "string") {
                return NextResponse.json(
                    {
                        message: "Nama project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            const name = input.name.trim();

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
            updatedData.name = name;
        }

        if("description" in input) {
            if(typeof input.description !== "string") {
                return NextResponse.json(
                    {
                        message: "Deskripsi project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.description = input.description.trim();
        }

        if("status" in input) {
            if(!isProjectStatus(input.status)) {
                return NextResponse.json(
                    {
                        message: "Status project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.status = input.status;
            updatedData.completedAt = input.status === "COMPLETED" ? new Date() : null;
        }

        if("priority" in input) {
            if(!isTaskPriority(input.priority)) {
                return NextResponse.json(
                    {
                        message: "Prioritas project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.priority = input.priority;
        }

        if("deadline" in input) {
            if(input.deadline === null || input.deadline === "") {
                updatedData.deadline = null;
            } else if(typeof input.deadline === "string") {
                const deadline = new Date(input.deadline);

                if(Number.isNaN(deadline.getTime())) {
                    return NextResponse.json(
                        {
                            message: "Deadline project tidak valid.",
                        },
                        {
                            status: 400,
                        },
                    );
                }
                updatedData.deadline = deadline;
            } else {
                return NextResponse.json(
                    {
                        message: "Deadline project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if("isArchived" in input) {
            if(typeof input.isArchived !== "boolean") {
                return NextResponse.json(
                    {
                        message: "Status arsip project tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.isArchived = input.isArchived;
        }
        
        if(Object.keys(updatedData).length === 0) {
            return NextResponse.json(
                {
                    message: "Tidak ada perubahan yang diberikan.",
                },
                {
                    status: 400,
                },
            );
        }
        const project = await prisma.project.update({
            where: {
                id,
            },
            data: updatedData,
            include: {
                tasks: {
                    select:{
                        isCompleted: true,
                    },
                },
            },
        });

        return NextResponse.json({
            data: addProjectProgress(project),
        });

    } catch (error) {
        console.error("PATCH /api/projects/[id] error: ", error);

        return NextResponse.json(
            {
                message: "Project gagal diperbarui.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const existingProject = await prisma.project.findUnique({
            where: {
                id,
            },
        });

        if(!existingProject) {
            return NextResponse.json(
                {
                    message: "Project tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.project.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Project berhasil di hapus.",
        });
    } catch (error) {
        console.error("DELETE /api/projects/[id] error: ", error);

        return NextResponse.json(
            {
                message: "Project gagal dihapus.",
            },
            {
                status: 500,
            },
        );
    }
}