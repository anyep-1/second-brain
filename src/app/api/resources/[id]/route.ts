import { prisma } from "@/lib/prisma";
import { ResourceStatus, ResourceType } from "@/types/resource";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{id: string;}>;
};

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
    "TO_REVIEW",
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

export async function GET(request: Request, context: RouteContext) {
    void request;

    try {
        const { id } = await context.params;
        const resource = await prisma.resource.findUnique({
            where: {
                id,
            },
            include: {
                area: areaSelect,
            },
        });

        if(!resource) {
            return NextResponse.json(
                {
                    message: "Resource tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }
        
        return NextResponse.json({
            data: resource,
        });
    } catch (error) {
        console.error("GET /api/resources/[id] error: ", error);

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

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const existingResource = await prisma.resource.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if(!existingResource) {
            return NextResponse.json(
                {
                    message: "Resource tidak ditemukan.",
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
                    message: "Data resource tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        const input = body as Record<string, unknown>;
        const updatedData: {
            title?: string;
            description?: string;
            url?: string;
            type?: ResourceType;
            status?: ResourceStatus;
            isFavorite?: boolean;
            isArchived?: boolean;
            areaId?: string | null;
        } = {};

        if("title" in input) {
            if(typeof input.title !== "string") {
                return NextResponse.json(
                    {
                        message: "Judul resource tidak valid.",
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
            updatedData.title = title;
        }

        if("description" in input) {
            if(typeof input.description !== "string") {
                return NextResponse.json(
                    {
                        message: "Deskripsi resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.description = input.description.trim();
        }

        if("url" in input) {
            if(typeof input.url !== "string") {
                return NextResponse.json(
                    {
                        message: "URL resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }

            try {
                updatedData.url = normalizeUrl(input.url);
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
        }

        if("status" in input) {
            if(!isResourceStatus(input.status)) {
                return NextResponse.json(
                    {
                        message: "Status resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.status = input.status;
        }

        if("type" in input) {
            if(!isResourceType(input.type)) {
                return NextResponse.json(
                    {
                        message: "Jenis resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.type = input.type;
        }

        if("isFavorite" in input) {
            if(typeof input.isFavorite !== "boolean") {
                return NextResponse.json(
                    {
                        message: "Status favorit tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.isFavorite = input.isFavorite;
        }

        if("isArchived" in input) {
            if(typeof input.isArchived !== "boolean") {
                return NextResponse.json(
                    {
                        message: "Status arsip tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            }
            updatedData.isArchived = input.isArchived;
        }

        if("areaId" in input) {
            if(input.areaId === null || input.areaId === "") {
                updatedData.areaId = null;
            } else if(typeof input.areaId !== "string") {
                return NextResponse.json(
                    {
                        message: "Area resource tidak valid.",
                    },
                    {
                        status: 400,
                    },
                );
            } else {
                const normalizedAreaId = input.areaId.trim();

                if(!normalizedAreaId) {
                    updatedData.areaId = null;
                } else {
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
                                messagea: "Resource tidak dapat dipindahkan ke area yang diarsipkan.",
                            },
                            {
                                status: 400,
                            },
                        );
                    }
                    updatedData.areaId = selectedArea.id;
                }
            }
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

        const resource = await prisma.resource.update({
            where: {
                id,
            },
            data: updatedData,
            include: {
                area: areaSelect,
            },
        });

        return NextResponse.json({
            data: resource,
        });

    } catch (error) {
        console.error("PATCH /api/resources/[id] error: ", error);

        return NextResponse.json(
            {
                message: "Resource gagal diperbarui.",
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
        const existingResource = await prisma.resource.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if(!existingResource) {
            return NextResponse.json(
                {
                    message: "Resource tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.resource.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Resource berhasil dihapus.",
        });

    } catch (error) {
        console.error("DELETE /api/resources/[id] error: ", error);

        return NextResponse.json(
            {
                message: "Resource gagal dihapus.",
            },
            {
                status: 500,
            },
        );
    }
}