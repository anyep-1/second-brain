import { Note } from "@/types/note";
import { Archive, Star } from "lucide-react";
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
            className = "group block h-full"
            aria-label = {`Buka catatan ${note.title}`}
        >
            <article className = "flex h-full flex-col rounded-2xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
                <div className = "flex items-start justify-between gap-3">
                    <h3 className = "text-ink font-semibold leading-6">
                        {note.title}
                    </h3>
                    {note.isFavorite && (
                        <span
                            title = "Favorit"
                            className = "shrink-0 text-amber-500"
                            aria-label = "Catatan Favorit"
                        >
                            <Star
                                aria-hidden = "true"
                                className = "size-4 fill-current"
                            />
                        </span>
                    )}
                </div>
                <p className = "mt-3 grow text-sm leading-6 whitespace-pre-wrap text-muted">
                    {note.content || "Catatan belum dimiliki."}
                </p>
                <div className = "mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className = "text-xs text-muted">
                        Diperbarui {formatDate(note.updatedAt)}
                    </span>
                    {note.isArchived && (
                        <span className = "inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-primary">
                            <Archive
                                aria-hidden = "true"
                                className = "size-3.5"
                            />
                            Arsip
                        </span>
                    )}
                </div>
            </article>        
        </Link>
    );
}