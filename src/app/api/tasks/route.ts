import { prisma } from "@/lib/prisma";
import { TaskPriority } from "@/types/task";
import { NextResponse } from "next/server";

const TASK_PRIORITIES: TaskPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
];

function isTaskPriority(value: unknown): value is TaskPriority{
    return (
        typeof value === "string" && TASK_PRIORITIES.includes(value as TaskPriority)
    );
}

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            orderBy: [
                {
                    isCompleted: "asc",
                },
                {
                    dueDate: "asc",
                },
                {
                    createdAt: "asc",
                },
            ],
        });
        return NextResponse.json({data: tasks});
    } catch (error) {
        console.error("GET /api/tasks error : ", error);
        return NextResponse.json(
            {
                message: "Task belum dapat dimuat",
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
        if(typeof body !== "object" || body === null) {
            return NextResponse.json(
                {
                    message: "Data task tidak valid",
                },
                {
                    status: 400,
                },  
            );
        }
        const input = body as Record<string, unknown>;
        const title = typeof input.title === "string"
                        ? input.title.trim()
                        : "";

        if(!title) {
            return NextResponse.json(
                {
                    message: "Judul task wajib diisi",
                },
                {
                    status: 400,
                },
            );
        }
        const description = typeof input.description === "string"
                            ? input.description.trim()
                            : "";

        const priority = isTaskPriority(input.priority)
                            ? input.priority
                            : "MEDIUM";

        let dueDate: Date | null = null;

        if(typeof input.dueDate === "string" && input.dueDate.trim()) {
            dueDate = new Date(input.dueDate);

            if(Number.isNaN(dueDate.getTime())) {
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
        const task = await prisma.task.create({
            data: {
                title,
                description,
                dueDate,
                priority,
            },
        });

        return NextResponse.json(
            {
                data: task,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/tasks error : ", error);

        return NextResponse.json(
            {
                message: "Task gagal dibuat.",
            },
            {
                status: 500,
            },
        );
    }
}