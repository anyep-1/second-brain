import { Note } from "@/types/note";
import Link from "next/link";

type NoteCardProps = {
    note: Note;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function NoteCard({ note }: NoteCardProps) {
    return(
        <Link
            href = {`/notes/${note.id}`}
            className = "block cursor-pointer"
            aria-label = {`Buka catatan ${note.title}`}
        >
            <article className = "h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className = "flex items-start justify-between gap-3">
                    <h3 className = "font-semibold leading-6">
                        {note.title}
                    </h3>
                    {note.isFavorite && (
                        <span
                            className = "text-amber-500"
                            aria-label = "Catatan Favorit"
                        >
                            ★
                        </span>
                    )}
                </div>
                <p className = "mt-3 max-h-20 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {note.content || "Catatan belum dimiliki."}
                </p>
                <div className = "mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                    <span>Diperbarui {formatDate(note.updatedAt)}</span>
                    {note.isArchived && (
                        <span className = "rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                            Arsip
                        </span>
                    )}
                </div>
            </article>        
        </Link>
    );
}