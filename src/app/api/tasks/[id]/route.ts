import { prisma } from "@/lib/prisma";
import { TaskPriority } from "@/types/task";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{id: string;}>;
};

const TASK_PRIORITIES: TaskPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
];

const projectSelection = {
    select: {
        id: true,
        name: true,
    },
};

function isTaskPriority(value: unknown,): value is TaskPriority {
    return (
        typeof value === "string" && TASK_PRIORITIES.includes(value as TaskPriority)
    );
}

function badRequest(message: string) {
    return NextResponse.json(
        {
            message,
        },
        {
            status: 400,
        },
    );
}

export async function GET(request: Request, context: RouteContext) {
    void request;
    try {
        const { id } = await context.params;
        const task = await prisma.task.findUnique({
            where: {
                id,
            },
            include: {
                project: projectSelection,
            },
        });

        if(!task) {
            return NextResponse.json(
                {
                    message: "Task tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({data: task});
    } catch (error) {
        console.error("GET /api/tasks/[id] error : ", error);

        return NextResponse.json(
            {
                message: "Task belum dapat dimuat.",
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
        const existingTask = await prisma.task.findUnique({
            where: {
                id,
            },
        });

        if(!existingTask) {
            return NextResponse.json(
                {
                    message: "Task tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        const body: unknown = await request.json();

        if(typeof body !== "object" || body ===null) {
            return badRequest("Data task tidak valid.");
        }

        const input = body as Record<string, unknown>;
        const updatedData: {
            title?: string;
            description?: string;
            dueDate?: Date | null;
            priority?: TaskPriority;
            isCompleted?: boolean;
            completedAt?: Date | null;
            isHighlighted?: boolean;
            projectId?: string | null;
        } = {};

        if("title" in input) {
            if(typeof input.title !== "string" || !input.title.trim()) {
                return badRequest("Judul task tidak valid.");
            }
            const title = input.title.trim();

            if(!title) {
                return badRequest("Judul task wajib diisi.");
            }

            updatedData.title = title;
        }

        if("description" in input) {
            if(typeof input.description !== "string") {
                return badRequest("Deskripsi task tidak valid.")
            }
            updatedData.description = input.description.trim();
        }

        if("priority" in input) {
            if(!isTaskPriority(input.priority)) {
                return badRequest("Prioritas task tidak valid.");
            }
            updatedData.priority = input.priority;
        }

        if("dueDate" in input) {
            if(input.dueDate === null || input.dueDate === ""){
                updatedData.dueDate = null;
            } else if (typeof input.dueDate === "string") {
                const dueDate = new Date(input.dueDate);

                if(Number.isNaN(dueDate.getTime())) {
                    return badRequest("Tanggal task tidak valid.");
                }
                updatedData.dueDate = dueDate;
            } else {
                return badRequest("Tanggal task tidak valid.");
            }
        }

        if("projectId" in input) {
            if(input.projectId === null || input.projectId === ""){
                updatedData.projectId = null;
            } else if(typeof input.projectId === "string") {
                const projectId = input.projectId.trim();
                const project = await prisma.project.findUnique({
                    where: {
                        id: projectId,
                    },
                    select: {
                        id: true,
                        isArchived: true,
                    },
                });

                if(!project) {
                    return badRequest("Project tidak ditemukan.");
                }

                if(project.isArchived) {
                    return badRequest("Task tidak dapat dipindahkan ke project yang diarsipkan.");
                }
                updatedData.projectId = projectId;
            } else {
                return badRequest("Project task tidak valid.");
            }
        }

        if("isCompleted" in input) {
            if(typeof input.isCompleted !== "boolean") {
                return badRequest("Status task tidak valid.");
            }
            updatedData.isCompleted = input.isCompleted;
            updatedData.completedAt = input.isCompleted ? existingTask.completedAt ?? new Date() : null;

            if(input.isCompleted) {
                updatedData.isHighlighted = false;
            }
        }

        if("isHighlighted" in input) {
            if(typeof input.isHighlighted !== "boolean") {
                return badRequest("Status highlight tidak valid.");
            }
            const willBeCompleted = updatedData.isCompleted ?? existingTask.isCompleted;

            if(input.isHighlighted && willBeCompleted) {
                return badRequest("Task yang selesai tidak dapat dijadikan Daily Highlight.");
            }
            updatedData.isHighlighted = input.isHighlighted;
        }

        if(Object.keys(updatedData).length === 0) {
            return badRequest("Tidak ada perubahan yang diberikan.");
        }

        if(updatedData.isHighlighted === true) {
            await prisma.task.updateMany({
                where: {
                    id: {
                        not: id,
                    },
                    isHighlighted: true,
                },
                data: {
                    isHighlighted: false,
                },
            });
        }
        
        const task = await prisma.task.update({
            where: {
                id,
            },
            data: updatedData,
            include: {
                project: projectSelection,
            },
        });

        return NextResponse.json({data: task});
    } catch (error) {
        console.error("PATCH /api/tasks/[id] error : ", error);
        return NextResponse.json(
            {
                message: "Task gagal diperbarui.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const existingTask = await prisma.task.findUnique({
            where: {
                id,
            },
        });

        if(!existingTask) {
            return NextResponse.json(
                {
                    message: "Task tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.task.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(
            {
                message: "Task berhasil dihapus.",
            },
        );
    } catch (error) {
        console.error("DELETE /api/tasks/[id] error : ", error);
        return NextResponse.json(
            {
                message: "Task gagal dihapus.",
            },
            {
                status: 500,
            },
        );
    }
}