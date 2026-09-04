"use client";

import { noteService } from "@/services/note-service";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Archive, ArrowLeft, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";


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
                const note = await noteService.getById(noteId);

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

        if(!title.trim()) {
            setError("Judul catatan wajib diisi.");
            return;
        }

        setIsSaving(true);
        setError("");
        setMessage("");

        try {
           const updatedNote = await noteService.update(noteId, {
            title: title.trim(),
            content,
            isFavorite,
            isArchived,
           },
        );
            setTitle(updatedNote.title);
            setContent(updatedNote.content);
            setIsFavorite(updatedNote.isFavorite);
            setIsArchived(updatedNote.isArchived);

            setMessage("Catatan berhasil disimpan.");
            router.refresh();
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
            await noteService.delete(noteId);

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
            <main className = "min-h-screen bg-page px-5 py-10 text-ink">
                <div className = "mx-auto max-w-4xl">
                    <p className = "text-sm text-muted">Memuat catatan...</p>
                </div>
            </main>
        );
    }

    if(error && !title) {
        return (
            <main className = "min-h-screen bg-page px-5 py-10 text-ink">
                <div className = "mx-auto max-w-4xl">
                    <div className = "rounded-2xl border border-red-200 bg-red-50 p-6">
                        <p className = "text-sm text-red-700">{error}</p>
                        <Link
                            href = "/"
                            className = "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                        >
                            <ArrowLeft
                                aria-hidden = "true"
                                className = "size-4"
                            />
                            Kembali ke dashboard
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className = "min-h-screen bg-page px-5 py-6 text-ink md:px-8 md:py-10">
            <div className = "mx-auto max-w-4xl">
                <header className = "mb-6 flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href = "/"
                        className = "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-soft hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus"
                    >
                        <ArrowLeft
                            aria-hidden = "true"
                            className = "size-4"
                        />
                        Kembali ke semua catatan
                    </Link>
                    <Button
                        variant = "danger"
                        onClick = {handleDelete}
                        disabled = {isDeleting || isSaving} 
                    >
                        <Trash2
                            aria-hidden = "true"
                            className = "size-4"
                        />
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </Button>
                </header>
                <form
                    onSubmit = {handleSave}
                    className = "overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_20px_60px_rgba(84,48,36,0.08)]"
                >
                    <div className = "border-b border-line px-6 py-6 md:px-10 md:py-8">
                        <p className = "text-xs font-bold tracking-[0.14em] text-primary uppercase">Note Editor</p>
                        <input
                            value = {title}
                            onChange = {(event) => {setTitle(event.target.value); setMessage("")}}
                            placeholder = "Judul catatan"
                            className = "mt-3 w-full border-none bg-transparent text-3xl font-bold tracking-tight text-ink outline-none placeholder:text-muted/50 md:text-4xl"
                        />
                    </div>
                    <div className = "flex flex-wrap gap-3 border-b border-line bg-page/50 px-6 py-4 md:px-10">
                        <Button
                            variant = "secondary"
                            size = "sm"
                            onClick = {() => {setIsFavorite((current) => !current); setMessage("");}}
                            className = {isFavorite
                               ? "border-amber-300 bg-amber-50 text-amber-700"
                               : undefined
                            }
                        >
                            <Star
                                aria-hidden = "true"
                                className = {`size-4 ${isFavorite ? "fill-current" : "" }`}
                            />
                            {isFavorite ? "Favorit" : "Jadikan Favorit"}
                        </Button>
                        <Button
                            variant = "secondary"
                            size = "sm"
                            onClick = {() => {setIsArchived((current) => !current); setMessage("");}}
                            className = {isArchived
                               ? "border-primary bg-soft text-primary"
                               : undefined
                            }
                        >
                            <Archive
                                aria-hidden = "true"
                                className = "size-4"
                            />
                            {isArchived ? "Diarsipkan" : "Arsipkan"}
                        </Button>
                    </div>
                    <div className = "px-6 py-6 md:px-10 md:py-10">
                        <textarea
                            value = {content}
                            onChange = {(event) => {setContent(event.target.value); setMessage("");}}
                            placeholder = "Mulai menulis..."
                            className = "block min-h-105 w-full resize-y rounded-2xl border border-line bg-page/40 px-4 py-3 text-base leading-8 text-ink outline-none transition placeholder:text-muted/50 focus:border-accent focus:bg-panel focus:ring-4 focus:ring-focus"
                        />
                        {error && (
                            <div
                                role = "alert"
                                className = "mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}
                        {message && (
                            <div
                                role = "status" 
                                className = "mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                            >
                                {message}
                            </div>
                        )}
                        <footer className = "flex flex-col gap-4 border-t border-line bg-page/50 px-6 py-5 sm:flex-row  sm:items-center sm:justify-between md:py-10">
                            <p className = "text-xs text-muted">Perubahan disimpan setelah tombol ditekan</p>
                            <Button
                                type = "submit"
                                disabled = {isSaving || isDeleting}
                            >
                                {isSaving ? "Menyimpan..." : "Simpan perubahan"}
                            </Button>
                        </footer>
                    </div>
                </form>
            </div>
        </main>
    );
}