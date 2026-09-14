import { prisma } from "@/lib/prisma";
import { AreaIcon } from "@/types/area";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{id: string}>;
};

const AREA_ICONS: AreaIcon[] = [
    "BookOpen",
    "Briefcase",
    "Code2",
    "Dumbbell",
    "GraduationCap",
    "HeartPulse",
    "House",
    "Layers",
    "Palette",
    "WalletCards",
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

const projectsSelection = {
    where: {
        isArchived: false,
    },
    select: {
        status: true,
    },
};

export async function GET(request: Request, context: RouteContext) {
    void request;

    try {
        const { id } = await context.params;
        const area = await prisma.area.findUnique({
            where: {
                id,
            },
            include: {
                projects: projectsSelection,
            },
        });

        if(!area) {
            return NextResponse.json(
                {
                    message: "Area tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            data: addAreaSummary(area),
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

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const existingArea = await prisma.area.findUnique({
            where: {
                id,
            },
        });

        if(!existingArea) {
            return NextResponse.json(
                {
                    message: "Area tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }
        const body: unknown = await request.json();

        if(typeof body !== "object" || body === null) {
            return badRequest("Data area tidak valid.");
        }
        const input = body as Record<string, unknown>;

        const updateData: {
            name?: string;
            description?: string;
            icon?: AreaIcon;
            color?: string;
            isArchived?: boolean;
        } = {};

        if("name" in input) {
            if(typeof input.name !== "string") {
                return badRequest("Nama area tidak valid.");
            }
            const name = input.name.trim();

            if(!name) {
                return badRequest("Nama area wajib diisi.");
            }
            updateData.name = name;
        }

        if("description" in input) {
            if(typeof input.description !== "string") {
                return badRequest("Deskripsi area tidak valid.");
            }
            updateData.description = input.description.trim();
        }

        if("icon" in input) {
            if(!isAreaIcon(input.icon)) {
                return badRequest("Ikon area tidak valid.");
            }
            updateData.icon = input.icon;
        }

        if("color" in input) {
            if(!isHexColor(input.color)) {
                return badRequest("Warna area tidak valid.");
            }
            updateData.color = input.color.toUpperCase();
        }

        if("isArchived" in input) {
            if(typeof input.isArchived !== "boolean") {
                return badRequest("Status arsip area tidak valid.");
            }
            updateData.isArchived = input.isArchived;
        }

        if(Object.keys(updateData).length === 0) {
            return badRequest("Tidak ada perubahan yang diberikan.");
        }

        const area = await prisma.area.update({
            where: {
                id,
            },
            data: updateData,
            include: {
                projects: projectsSelection,
            },    
        });

        return NextResponse.json({
            data: addAreaSummary(area),
        })
    } catch (error) {
        console.error("PATCH /api/areas error: ", error);

        return NextResponse.json(
            {
                message: "Area gagal diperbarui.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    void request;

    try {
        const { id } = await context.params;
        const existingArea = await prisma.area.findUnique({
            where: {
                id,
            },
        });

        if(!existingArea) {
            return NextResponse.json(
                {
                    message: "Area tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.area.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Data berhasil dihapus.",
        });
    } catch (error) {
        console.error("DELETE /api/areas error: ", error);

        return NextResponse.json(
            {
                message: "Area gagal dihapus.",
            },
            {
                status: 500,
            },
        );
    }
}