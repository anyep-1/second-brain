import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const notes = await prisma.note.findMany({
        include: {
            folder: true,
            tags: {
                include: {
                    tag: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return NextResponse.json({
        data: notes,
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";

    if(!title) {
        return NextResponse.json(
            {
                message: "Judul Catatan wajib diisi",
            },
            {
                status: 400,
            },
        );
    }

    const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const note = await prisma.note.create({
        data: {
            title,
            content,
            slug: `${baseSlug || "note"}-${Date.now()}`,
        },
    });

    return NextResponse.json(
        {
            data: note, 
        },
        {
            status: 201,
        },
    );
}

