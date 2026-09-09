import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{id: string;}>;
};

export async function GET(
    _request: Request,
    context: RouteContext,
) {
    const { id } = await context.params;
    const note = await prisma.note.findUnique({
        where: {
            id,
        },
        include: {
            folder: true,
            tags: {
                include: {
                    tag: true,
                },
            },
            incomingLinks: true,
            outgoingLinks: true,
        },
    });

    if(!note) {
        return NextResponse.json(
            {
                message: "Catatan tidak tersedia",
            },
            {
                status: 404,
            },
        );
    }

    return NextResponse.json({
        data: note,
    });
}

export async function PATCH(
    request: Request,
    context: RouteContext,
) {
    const { id } = await context.params;
    const body = await  request.json();
    const existingNote = await prisma.note.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
        },
    });

    if(!existingNote) {
        return NextResponse.json(
            {
                message: "Catatan tidak ditemukan",
            },
            {
                status: 404,
            },
        );
    }

    const data: {
        title?: string;
        content?: string;
        isFavorite?: boolean;
        isArchived?: boolean;
    } = {};

    if("title" in body) {
        if(typeof body.title !== "string" || !body.title.trim()) {
            return NextResponse.json(
                {
                    message: "Judul catatan wajib diisi.",
                },
                {
                    status: 400,
                },
            );
        }
        data.title = body.title.trim();
    }

    if("content" in body) {
        if(typeof body.content !== "string" || !body.content.trim()) {
            return NextResponse.json(
                {
                    message: "Isi catatan harus berupa teks.",
                },
                {
                    status: 400,
                },
            );
        }
        data.content = body.content.trim();
    }

    if("isFavorite" in body){
        if(typeof body.isFavorite !== "boolean") {
            return NextResponse.json(
                {
                    message: "Nilai favorite tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        data.isFavorite = body.isFavorite;
    }

    if("isArchived" in body) {
        if(typeof body.isArchived !== "boolean") {
            return NextResponse.json(
                {
                    message: "Nilai archive tidak valid.",
                },
                {
                    status: 400,
                },
            );
        }
        data.isArchived = body.isArchived;
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

    const note = await prisma.note.update({
        where: {
            id,
        },
        data,
        include: {
            folder: true,
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    return NextResponse.json({
        data: note,
    });
}

export async function DELETE(
        _request: Request,
        context: RouteContext,
    ) {
        const { id } = await context.params;
        const existingNote = await prisma.note.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if(!existingNote) {
            return NextResponse.json(
                {
                    message: "Catatan tidak ditemukan.",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.note.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(
            {
                message: "Data berhasil dihapus.",
            }
        );
    }

