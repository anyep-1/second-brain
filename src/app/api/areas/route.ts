import { prisma } from "@/lib/prisma";
import { AreaIcon } from "@/types/area";
import { NextResponse } from "next/server";

const AREA_ICONS: AreaIcon[] = [
    "Layers",
    "Briefcase",
    "BookOpen",
    "Code2",
    "Dumbbell",
    "GraduationCap",
    "HeartPulse",
    "House",
    "Palette",
    "WalletCards"
];

function isAreaIcon(value: unknown): value is AreaIcon {
    return(typeof value === "string" && AREA_ICONS.includes(value as AreaIcon));
}

function isHexColor(value: unknown): value is string {
    return(typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value));
}

function addAreaSummary<T extends{projects: {status: string;}[]}>(area: T) {
    const { projects, ...areaData} = area;
    const totalProjects = projects.length;
    const activeProjects = projects.filter((project) => project.status === "ACTIVE").length;
    const completedProjects = projects.filter((project) => project.status === "COMPLETED").length;

    return {
        ...areaData,
        totalProjects,
        activeProjects,
        completedProjects,
    };
}

export async function GET() {
    try {
        const areas = await prisma.area.findMany({
            include: {
                projects: {
                    where: {
                        isArchived: false,
                    },
                    select: {
                        status: true,
                    },
                },
            },
            orderBy: [
                {
                    isArchived: "asc",
                },
                {
                    name: "asc",
                },
            ],
        });

        return NextResponse.json({
            data: areas.map(addAreaSummary),
        });
    } catch (error) {
        console.error("GET /api/areas error: ", error);

        return NextResponse.json(
            {
                message: "Area belum dapat dimuat.",
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
                    message: "Data area tidak valid.",
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
                    message: "Nama area wajib diisi.",
                },
                {
                    status: 400,
                },
            );
        }
        const description = typeof input.description === "string" ? input.description.trim() : "";
        const icon = isAreaIcon(input.icon) ? input.icon : "Layers";
        const color = isHexColor(input.color) ? input.color.toUpperCase() : "#A84F37";
        const area = await prisma.area.create({
            data: {
                name,
                description,
                icon,
                color,
            },
        });

        return NextResponse.json(
            {
                data: {
                    ...area,
                    totalProjects: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/areas error: ", error);

        return NextResponse.json(
            {
                message: "Area gagal dibuat.",
            },
            {
                status: 500,
            },
        );
    }
}