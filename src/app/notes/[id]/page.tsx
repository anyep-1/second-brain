"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type Note = {
    id: string;
    title: string;
    content: string;
    isFavorite: boolean;
    isArchived: boolean;
    updatedAt: string;
};

export default function NoteEditorPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const noteId = params.id;

    useEffect(() => {
        async function loadNote() {
            try {
                const response = await fetch(`/api/notes/${noteId}`, {
                    cache: "no-store",
                });
                const result = await response.json();

                if(!response.ok) {
                    throw new Error(result.message);
                }
                const note: Note = result.data;

                setTitle(note.title);
                setContent(note.content);
                setIsFavorite(note.isFavorite);
                setIsArchived(note.isArchived);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                    ? requestError.message
                    : "Catatan gagal dimuat.",
                );
            } finally {
                setIsLoading(false);
            }
        }
        if(noteId) {
            void loadNote();
        }
    }, [noteId]);

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    isFavorite,
                    isArchived,
                }),
            });

            const result = await response.json();

            if(!response.ok) {
                throw new Error(result.message);
            }

            setMessage("Catatan berhasil disimpan.");
        } catch (requestError) {
            setError(
                requestError instanceof Error
                ? requestError.message
                : "Catatan gagal disimpan.",
            );
        } finally {
            setIsSaving(false);
        }
    }
    
    async function handleDelete() {
        const confirmed = window.confirm(
            "Hapus catatan ini secara permanen?",
        );

        if(!confirmed) {
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if(!response.ok) {
                throw new Error(result.message);
            }

            router.push("/");
            router.refresh();
        } catch (requestError) {
            setError(
                requestError instanceof Error
                ? requestError.message
                : "Catatan gagal dihapus.",
            );
        } finally {
            setIsDeleting(false);
        }
    }


    if(isLoading) {
        return (
            <main className = "min-h-screen bg-slate-50 p-10">
                <p className = "text-sm text-slate-500">Memuat catatan...</p>
            </main>
        );
    }

    return (
        <main className = "min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
            <div className = "mx-auto max-w-4xl">
                <header className = "mb-6 flex items-center justify-between">
                    <Link
                        href = {"/"}
                        className = "text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        ← Kembali ke semua catatan
                    </Link>
                    <button
                        type = "submit"
                        onClick = {handleDelete}
                        disabled = {isDeleting}
                        className = "rounded-xl px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50" 
                    >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                </header>
                <form
                    onSubmit = {handleSave}
                    className = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"
                >
                    <input
                        value = {title}
                        onChange = {(event) => setTitle(event.target.value)}
                        placeholder = "Judul catatan"
                        className = "w-full border-none text-3xl font-bold tracking-tight outline-none placeholder:text-slate-300"
                    />
                    <div className = "mt-6 flex flex-wrap gap-3 border-y border-slate-100 py-4">
                        <button
                            type = "button"
                            onClick = {() => setIsFavorite((current) => !current)}
                            className = {`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                               isFavorite
                               ? "bg-amber-100 text-amber-700"
                               : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {isFavorite ? "★ Favorit" : "☆ Jadikan Favorit"}
                        </button>
                        <button
                            type = "button"
                            onClick = {() => setIsArchived((current) => !current)}
                            className = {`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                               isArchived
                               ? "bg-slate-800 text-white"
                               : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {isArchived ? "Diarsipkan" : "Arsipkan"}
                        </button>
                    </div>
                    <textarea
                        value = {content}
                        onChange = {(event) => setContent(event.target.value)}
                        placeholder = "Mulai menulis..."
                        className = "mt-6 min-h-105 w-full resize-y border-none text-base leading-8 outline-none placeholder:text-slate-300"
                    />
                    {error && (
                        <div className = "mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className = "mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {message}
                        </div>
                    )}
                    <div className = "mt-6 flex justify-end border-t border-slate-100 pt-6">
                        <button
                            type = "submit"
                            disabled = {isSaving}
                            className = "rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}