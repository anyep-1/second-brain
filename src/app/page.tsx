"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type note = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  isFavorite: boolean;
  isArchived: boolean;
  updatedAt: string;
  folder: {
    id: string;
    name: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
};

export default function Home() {
  const [notes, setNotes] = useState<note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotes() {
      try {
        const response = await fetch("/api/notes", {
          cache: "no-store",
        }); 

        if(!response.ok) {
          throw new Error("Gagal mengambil catatan.");
        }

        const result = await response.json();
        setNotes(result.data);
      } catch (error) {
        console.error(error);
        setError("Catatan belum dapat dimuat.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)
    );
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(!title.trim()) {
      setError("Judul Catatan wajib diisi");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const result = await response.json();

      if(!response.ok) {
        throw new Error(result.message);
      }

      const newNote: note = {
        ...result.data,
        folder: null,
        tags: [],
      };

      setNotes((currentNotes) => [newNote, ...currentNotes]);
      setTitle("");
      setContent("");

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

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }
  
  return(
    <div className = "min-h-screen bg-slate-50 text-slate-900">
      <div className = "mx-auto flex min-h-screen max-w-7xl">
        <aside className = "hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className = "mb-10">
            <p className = "text-xs font-semibold uppercase tracking-[0.25cm] text-indigo-600">
              Personal space
            </p>
            <h1 className = "mt-2 text-2xl font-bold">Second Brain</h1>
          </div>
          <nav className = "space-y-2 text-sm" >
            <button className = "w-full rounded-xl px-4 py-2 text-left font-semibold text-indigo-700">
              Semua catatan
            </button>
            <button className = "w-full rounded-xl px-4 py-2 text-left text-slate-600 hover:bg-slate-100">
              Favorit
            </button>
            <button className = "w-full rounded-xl px-4 py-2 text-left text-slate-600 hover:bg-slate-100">
              Arsip
            </button>
          </nav>
          <div className = "mt-10 border-t border-slate-200 pt-6">
            <p className = "text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ringkasan
            </p>
            <p className = "mt-3 text-sm text-slate-600">
              {notes.length} catatan tersimpan
            </p>
          </div>
        </aside>
        <main className = "flex-1 p-5 md:p-10">
          <header className = "mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className = "text-sm font-medium text-indigo-600">
                Knowledge Workspace
              </p>
              <h2 className = "mt-1 text-3xl font-bold tracking-tight">
                Semua Catatan
              </h2>
              <p className = "mt-2 text-sm text-slate-500">
                Tangkap ide dan pengetahuan sebelum terlupakan.
              </p>
            </div>
            <input
              type ="search"
              value = {search}
              onChange = {(event) => setSearch(event.target.value)}
              placeholder = "Cari catatan..."
              className = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-indigo-100 lg:max-w-sm"
            />
          </header>
          <form 
            onSubmit={handleSubmit}
            className = "mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <input
              value = {title}
              onChange = {(event) => setTitle(event.target.value)}
              placeholder = "Judul catatan"
              className = "w-full border-none text-lg font-semibold outline-none placeholder:text-slate-400"
            />
            <textarea
              value = {content}
              onChange = {(event) => setContent(event.target.value)}
              placeholder = "Tuliskan ide atau pengetahuanmu..."
              rows = {4}
              className = "mt-4 w-full resize-none border-none text-sm leading-6 outline-none placeholder:text-slate-400"
            />
            <div className = "mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className = "text-xs text-slate-500">
                Tersimpan
              </p>
              <button 
                type = "submit" disabled = {isSaving}
                className = "rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Menyimpan..." : "Simpan Catatan"}
              </button>
            </div>
          </form>
          {error && (
            <div className = "mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className = "text-sm text-slate-500">
              Memuat catatan...
            </p>
          ) : filteredNotes.length === 0 ? (
            <div className = "rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className = "font-semibold">Belum ada catatan</h3>
              <p className = "mt-2 textg-sm text-slate-500">
                Buat catatan pertama menggunakan form di atas.
              </p>
            </div>
          ) : (
            <section className = "grid gap-4 sm:grid-cols2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <Link
                  key = {note.id}
                  href = {`/notes/${note.id}`}
                  className = "block cursor-pointer"
                >
                    <article className = "w-full h-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className = "flex items-start justify-between gap-3">
                        <h3 className = "font-semibold leading-6">{note.title}</h3>
                        {note.isFavorite && (
                          <span className = "text-amber-500">⭐</span>
                        )}
                      </div>
                      <p className = "mt-3 max-h-20 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {note.content || "Catatan ini belum memiliki isi."}
                      </p>
                      <div className = "mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
                        Diperbarui pada {formatDate(note.updatedAt)}
                      </div>
                    </article>
                </Link>
                
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
