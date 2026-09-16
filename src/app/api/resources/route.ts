import { prisma } from "@/lib/prisma";
import { ResourceStatus, ResourceType } from "@/types/resource";
import { NextResponse } from "next/server";

const RESOURCE_TYPES: ResourceType[] = [
    "ARTICLE",
    "BOOK",
    "COURSE",
    "OTHER",
    "TOOL",
    "VIDEO",
];

const RESOURCE_STATUSES: ResourceStatus[] = [
    "COMPLETED",
    "IN_PROGRESS",
    "TO_REVIEW"
];

const areaSelect = {
    select: {
        id: true,
        name: true,
        icon: true,
        color: true,
    },
} as const;

function isResourceType(value: unknown): value is ResourceType {
    return(typeof value === "string" && RESOURCE_TYPES.includes(value as ResourceType));
}

function isResourceStatus(value: unknown): value is ResourceStatus {
    return(typeof value === "string" && RESOURCE_STATUSES.includes(value as ResourceStatus));
}

function normalizeUrl(value: string) {
    const trimmedUrl = value.trim();

    if(!trimmedUrl) {
        return "";
    }
    const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    const parsedUrl = new URL(urlWithProtocol);

    if(parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Protocol URL tidak didukung");
    }
    
    return parsedUrl.toString();
}

export async function GET() {
    try {
        const resources = await prisma.resource.findMany({
            include: {
                area: areaSelect,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            data: resources,
        });
    } catch (error) {
        console.error("GET /api/resources error: ", error);

        return NextResponse.json(
            {
                message: "Resource belum dapat dimuat.",
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
                    message: "Data resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const input = body as Record<string, unknown>;

        if(typeof input.title !== "string") {
            return NextResponse.json(
                {
                    message: "Judul resource wajib diisi.",
                },
                {
                    status: 400,
                },
            );
        }
        const title = input.title.trim();

        if(!title) {
            return NextResponse.json(
                {
                    message: "Judul resource wajib diisi.",
                },
                {
                    status: 400,
                },
            );
        }

        if(input.description !== undefined && typeof input.description !== "string") {
            return NextResponse.json(
                {
                    message: "Deskripsi resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const description = typeof input.description === "string" ? input.description.trim() : "";

        if(input.url !== undefined && typeof input.url !== "string") {
            return NextResponse.json(
                {
                    message: "URL resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        let url = "";

        try {
            url = typeof input.url === "string" ? normalizeUrl(input.url) : "";
        } catch {
            return NextResponse.json(
                {
                    message: "URL resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const type = input.type  === undefined ? "ARTICLE" : input.type;
        
        if(!isResourceType(type)) {
            return NextResponse.json(
                {
                    message: "Jenis resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const status = input.status === undefined ? "TO_REVIEW" : input.status;

        if(!isResourceStatus(status)) {
            return NextResponse.json(
                {
                    message: "Status resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        let areaId: string | null = null;

        if(input.areaId !== undefined && input.areaId !== null && input.areaId !== "") {
            if(typeof input.areaId !== "string") {
                return NextResponse.json(
                    {
                        message: "Area resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            const normalizedAreaId = input.areaId.trim();

            if(!normalizedAreaId) {
                const selectedArea = await prisma.area.findUnique({
                    where: {
                        id: normalizedAreaId,
                    },
                    select: {
                        id: true,
                        isArchived: true,
                    },
                });

                if(!selectedArea) {
                    return NextResponse.json(
                        {
                            message: "Area tidak ditemukan.",
                        },
                        {
                            status: 400,
                        },
                    );
                }

                if(selectedArea.isArchived) {
                    return NextResponse.json(
                        {
                            message: "Resource tidak dapat dimasukkan ke area yang diarsipkan.",
                        },
                        {
                            status: 400,
                        },
                    );
                }
                areaId = selectedArea.id;
            }
        }
        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                url,
                type,
                status,
                areaId,
            },
            include: {
                area: areaSelect,
            },
        });

        return NextResponse.json(
            {
                data: resource,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error("POST /api/resources error: ", error);

        return NextResponse.json(
            {
                message: "Resource gagal disimpan.",
            },
            {
                status: 500,
            },
        );
    }
}