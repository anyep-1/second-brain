"use client";

import type { FormEvent } from "react";
import { NoteCard } from "@/components/notes/NoteCard";
import { noteService } from "@/services/note-service";
import { useEffect, useState } from "react";
import type { Note } from "@/types/note";
import { Button } from "@/components/Button";
import { AppShell } from "@/components/layout/AppShell";
import { Search } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { SidebarView } from "@/components/layout/Sidebar";
import { TasksPanel } from "@/components/tasks/TaskPanel";
import { Task } from "@/types/task";


export default function Home() {
  const [activeView, setActiveView] = useState<SidebarView>("dashboard");
  const [highlightedTask, setHighlightedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotes() {
      try {
        const notesData = await noteService.getAll();
        setNotes(notesData);
      } catch (requestError) {
        setError(
          requestError instanceof Error
          ? requestError.message
          : "Catatan belum dapat dimuat.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    void loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const keyword = search.toLowerCase().trim();
    const matchesView = activeView === "archived"
                        ? note.isArchived
                        : activeView === "favorites"
                          ? note.isFavorite && !note.isArchived
                          : !note.isArchived;

    const matchesSearch = !keyword || note.title.toLowerCase().includes(keyword) || note.content.toLowerCase().includes(keyword);

    return matchesView && matchesSearch;
  });

  const favoriteNotesCount = notes.filter((note) => note.isFavorite,).length;
  const archivedNotesCount = notes.filter((note) => note.isArchived,).length

  async function handleViewChange(view: SidebarView) {
    setActiveView(view);

    window.setTimeout(() => {
      const elementId = view === "dashboard" ? "dashboard-top" : "notes";
      document.getElementById(elementId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(!title.trim()) {
      setError("Judul Catatan wajib diisi");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const newNote = await noteService.create({
        title,
        content,
      });
      setNotes((currentNotes) => [
        newNote,
        ...currentNotes,
      ]);
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

  const noteSectionContent: Record<SidebarView, {title: string; emptyMessage: string;}> = {
    dashboard: {
      title: "Catatan terbaru",
      emptyMessage: "Belum ada catatan terbaru",
    },
    all: {
      title: "Semua catatan",
      emptyMessage: "Belum ada catatan yang tersimpan",
    },
    favorites: {
      title: "Catatan favorit",
      emptyMessage: "Belum ada catatan yang dijadikan favorit"
    },
    archived: {
      title: "Catatan diarsipkan",
      emptyMessage: "Belum ada catatan yang diarsipkan",
    },
  };

  const currentSection = noteSectionContent[activeView];

  
  return (
    <AppShell
      activeView = {activeView} 
      notesCount = {notes.length}
      onViewChange = {handleViewChange}
    >
      <div id = "dashboard-top" className = "p-5 md:p-8 lg:p-10">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                Workspace Overview
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Kelola ide dan pengetahuanmu dalam satu tempat.
              </p>
            </div>
            <div className = "relative w-full lg:max-w-sm">
              <Search
                aria-hidden = "true"
                className = "pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari catatan..."
                className="
                  w-full rounded-xl border border-line bg-panel
                  pr-4 py-3 pl-11 text-sm text-ink outline-none transition
                  placeholder:text-muted
                  focus:border-accent focus:ring-4 focus:ring-focus
                "
              />
            </div>
          </header>
          <DashboardOverview
            totalNotes = {notes.length}
            favoriteNotes = {favoriteNotesCount}
            archivedNotes = {archivedNotesCount}
            highlightedTask= {highlightedTask}
          />
          <TasksPanel 
            onHighlightedTaskChange = {setHighlightedTask}
          />
          <div className = "mb-4">
            <p className = "text-xs font-bold tracking-[0.14em] text-primary uppercase">Quick Capture</p>
            <h2 className = "mt-1 text-xl font-bold text-ink">Catatan baru</h2>
          </div>
          <form
            id = "quick-capture"
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border border-line bg-panel p-6 shadow-sm"
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Judul catatan"
              className="
                w-full border-none bg-transparent text-lg font-semibold
                text-ink outline-none placeholder:text-muted
              "
            />

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Tuliskan ide atau pengetahuanmu..."
              rows={4}
              className="
                mt-4 w-full resize-none border-none bg-transparent
                text-sm leading-6 text-ink outline-none
                placeholder:text-muted
              "
            />
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <p className="text-xs text-muted">
                Tersimpan di Second Brain
              </p>

              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </div>
          </form>
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <section 
            id = "notes"
            aria-label = "Daftar catatan"
          >
            <div className = "mb-4 flex items-end justify-between gap-4">
              <div>
                <p className = "text-xs font-bold tracking-[0.14em] text-primary uppercase">Knowledge</p>
                <h2
                  id = "notes-heading"
                  className = "mt-1 text-xl font-bold text-ink"
                >
                  {currentSection.title}
                </h2>
              </div>
              <p className = "text-xs text-muted">{filteredNotes.length} catatan ditampilkan</p>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted">
                Memuat catatan...
              </p>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-panel p-10 text-center">
                <h3 className="font-semibold text-ink">
                  Belum ada catatan
                </h3>

                <p className="mt-2 text-sm text-muted">
                  {currentSection.emptyMessage}
                </p>
              </div>
            ) : (
              <div className = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                  />
                ))}
              </div>
            )}
          </section>
      </div>
    </AppShell>
);
}
