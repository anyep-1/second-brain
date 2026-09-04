import { Archive, ArrowRight, Sparkles, Star, StickyNote } from "lucide-react";

type DashboardOverviewProps = {
    totalNotes: number;
    favoriteNotes: number;
    archivedNotes: number;
};

type SummaryItemProps = {
    label: string;
    value: number;
    icon: typeof StickyNote;
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

export function DashboardOverview({totalNotes, favoriteNotes, archivedNotes}: DashboardOverviewProps) {
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
                    <h2 className = "mt-4 max-w-lg text-2xl font-bold tracking-tight text-ink">
                        Apa hal terpenting yang ingin kamu ingat hari ini?
                    </h2>
                    <p className = "mt-3 max-w-xl text-sm leading-6 text-muted">
                        Tangkap ide, pekerjaan, atau pengetahuan penting agar tidak hilang dan dapat ditemukan kembali.
                    </p>
                    <a 
                        href = '#quick-capture' 
                        className = "mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus"
                    >
                        Buat catatan
                        <ArrowRight
                            aria-hidden = "true"
                            className = "size-4"
                        />
                    </a>
                </div>
            </article>
            <div className = "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <SummaryItem
                    label = "Total Catatan"
                    value = {totalNotes}
                    icon = {StickyNote}
                />
                <SummaryItem
                    label = "Catatan Favorit"
                    value = {favoriteNotes}
                    icon = {Star}
                />
                <SummaryItem
                    label = "Catatan diarsipkan"
                    value = {archivedNotes}
                    icon = {Archive}
                />
            </div>
        </section>
    );
}