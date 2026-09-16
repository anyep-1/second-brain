import { Task } from "@/types/task";
import { ArrowRight, FolderKanban, LayoutGrid, Library, LucideIcon, Sparkles, StickyNote } from "lucide-react";

type DashboardOverviewProps = {
    totalNotes: number;
    activeProjects: number;
    activeAreas: number;
    totalResources: number;
    highlightedTask: Task | null;
};

type SummaryItemProps = {
    label: string;
    value: number;
    icon: LucideIcon;
};

function SummaryItem({label, value, icon: Icon}: SummaryItemProps) {
    return (
        <div className = "flex items-center gap-3 rounded-2xl border border-line bg-panel p-4">
            <div className = "flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                <Icon
                    aria-hidden = "true"
                    className = "size-5"
                />
            </div>
            <div>
                <p className = "text-xl font-bold text-ink">{value}</p>
                <p className = "text-xs text-muted">{label}</p>
            </div>
        </div>
    );
}

function formatTaskDate(dueDate: string | null) {
    if(!dueDate) {
        return "Tanpa tenggat waktu";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dueDate));
}

export function DashboardOverview({totalNotes, activeAreas, activeProjects, totalResources,  highlightedTask}: DashboardOverviewProps) {
    return (
        <section className = "mb-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <article className = "relative overflow-hidden rounded-3xl border border-line bg-soft p-6 lg:p-8">
                <div
                    aria-hidden = "true"
                    className = "absolute -top-16 -right-12 size-44 rounded-full bg-accent/10"
                />
                <div className = "relative">
                    <div className = "flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles
                            aria-hidden = "true"
                            className = "size-4"
                        />
                        Daily Highlight
                    </div>
                    {highlightedTask ? (
                        <>
                            <p className = "mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Fokus utama hari ini</p>
                            <h2 className = "mt-2 max-w-lg text-2xl font-bold tracking-tight text-ink">{highlightedTask.title}</h2>
                            {highlightedTask.description ? (
                                <p className = "mx-3 max-w-xl text-sm leading-6 text-muted">{highlightedTask.description}</p>
                            ) : (
                                <p className = "mx-3 max-w-xl text-sm leading-6 text-muted">Task ini telah dipilih menjadi fokus utama.</p>
                            )}
                            <p className = "mt-4 text-xs font-semibold text-primary">{formatTaskDate(highlightedTask.dueDate)}</p>
                        </>
                    ) : (
                        <>
                            <h2 className = "mt-4 max-w-lg text-2xl font-bold tracking-tight text-ink">Belum ada fokus utama hari ini</h2>
                            <p className = "mt-3 max-w-xl text-sm leading-6 text-muted">
                                Klik ikon bintang pada salah satu task untuk menjadikannya Daily Highlight.
                            </p>
                        </>
                    )}
                    <a
                        href = "#tasks"
                        className = "mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus"
                    >
                        {highlightedTask ? "Lihat daftar task" : "Pilih task utama"}
                        <ArrowRight
                            aria-hidden = "true"
                            className = "size-4"
                        />
                    </a>
                </div>
            </article>
            <div className = "grid grid-cols-2 gap-3">
                <SummaryItem
                    label = "Total Catatan"
                    value = {totalNotes}
                    icon = {StickyNote}
                />
                <SummaryItem
                    label = "Project Aktif"
                    value = {activeProjects}
                    icon = {FolderKanban}
                />
                <SummaryItem
                    label = "Area Aktif"
                    value = {activeAreas}
                    icon = {LayoutGrid}
                />
                <SummaryItem
                    label = "Resource"
                    value = {totalResources}
                    icon = {Library}
                />
            </div>
        </section>
    );
}