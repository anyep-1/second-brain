import { prisma } from "@/lib/prisma";
import { TaskPriority } from "@/types/task";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{id: string;}>;
};

type TaskUpdateData = {
    title?: string;
    description?: string;
    dueDate?: Date | null;
    priority?: TaskPriority;
    isCompleted?: boolean;
    completedAt?: Date | null;
    isHighlighted?: boolean;
};

const TASK_PRIORITIES: TaskPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
];

function isTaskPriority(value: unknown,): value is TaskPriority {
    return (
        typeof value === "string" && TASK_PRIORITIES.includes(value as TaskPriority)
    );
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const task = await prisma.task.findUnique({
            where: {
                id,
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
        console.error("GET /api/tasks error : ", error);

        return NextResponse.json(
            {
                message: "Task gagal dimuat.",
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
        const body: unknown = await request.json();

        if(typeof body !== "object" || body ===null) {
            return NextResponse.json(
                {
                    message: "Data task tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }

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

        const input = body as Record<string, unknown>;
        const data: TaskUpdateData = {};

        if("title" in input) {
            if(typeof input.title !== "string" || !input.title.trim()) {
                return NextResponse.json(
                    {
                        message: "Judul task wajib diisi.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            data.title = input.title.trim();
        }

        if("description" in input) {
            if(typeof input.description !== "string") {
                return NextResponse.json(
                    {
                        message: "Deskripsi task tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            data.description = input.description.trim();
        }

        if("priority" in input) {
            if(!isTaskPriority(input.priority)) {
                return NextResponse.json(
                    {
                        message: "Prioritas task tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            data.priority = input.priority;
        }

        if("dueDate" in input) {
            if(input.dueDate === null || input.dueDate === ""){
                data.dueDate = null;
            } else if (typeof input.dueDate === "string") {
                const dueDate = new Date(input.dueDate);

                if(Number.isNaN(dueDate.getTime())) {
                    return NextResponse.json(
                        {
                            message: "Tanggal task tidak valid.",
                        },
                        {
                            status: 400.
                        },
                    );
                }
                data.dueDate = dueDate;
            } else {
                return NextResponse.json(
                    {
                        message: "Tanggal task tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
        }

        if("isCompleted" in input) {
            if(typeof input.isCompleted !== "boolean") {
                return NextResponse.json(
                    {
                        message: "Status task tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            data.isCompleted = input.isCompleted;
            data.completedAt = input.isCompleted ? new Date() : null;
        }

        if("isHighlighted" in input) {
            if(typeof input.isHighlighted !== "boolean") {
                return NextResponse.json(
                    {
                        message: "Status highlight tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            data.isHighlighted = input.isHighlighted;
        }

        if(Object.keys(data).length === 0) {
            return NextResponse.json(
                {
                    message: "Tidak ada perubahan yang dikirim.",
                },
                {
                    status: 400,
                },
            );
        }

        const task = await prisma.$transaction(
            async (transaction) => {
                if(data.isHighlighted === true) {
                    await transaction.task.updateMany({
                        where: {
                            id: {
                                not: id,
                            },
                        },
                        data: {
                            isHighlighted: false,
                        },
                    });
                }
                return transaction.task.update({
                    where: {
                        id,
                    },
                    data,
                });
            },
        );

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