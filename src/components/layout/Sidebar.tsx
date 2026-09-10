import { cn } from "@/lib/cn";
import { Archive, Brain, CheckSquare, FolderKanban, LayoutDashboard, Library, LucideIcon, Plus, Shapes, Star, StickyNote } from "lucide-react";
import Link from "next/link";

export type SidebarView =
    | "dashboard"
    | "all"
    | "favorites"
    | "archived";

type SidebarProps = {
    notesCount: number;
    activeView: SidebarView;
    className?: string;
    onNavigate?: () => void;
    onViewChange: (view: SidebarView) => void;
}

type SidebarItemProps = {
    label: string;
    icon: LucideIcon;
    href?: string;
    active?: boolean;
    comingSoon?: boolean;
    onNavigate?: () => void;
    onClick?: () => void;
}

function SidebarItem({label, icon: Icon, href, active = false, comingSoon = false, onNavigate, onClick,}: SidebarItemProps) {
    const className = cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
        "text-sm transition",
        active
            ? "bg-soft font-semibold text-primary"
            : "text-muted hover:bg-soft hover:text-ink",
        comingSoon && "cursor-not-allowed  opacity-60",
    );

    const content = (
        <>
            <Icon
                aria-hidden = "true"
                className = "size-4 shrink-0"
            />
            <span className = "flex-1 text-left">{label}</span>
            {comingSoon && (
                <span className = "rounded-full bg-page px-2 py-0.5 text-[10px] font-semibold text-muted">Soon</span>
            )}
        </>
    );

    if(href) {
        return (
            <Link
                href = {href}
                onClick = {onNavigate}
                className = {className}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type = "button"
            disabled = {comingSoon}
            onClick = {onClick}
            aria-pressed = {active}
            className= {className}
        >
            {content}
        </button>
    );
}

export function Sidebar({notesCount, activeView, className, onNavigate, onViewChange,}: SidebarProps) {
    function selectView(view: SidebarView) {
        onViewChange(view);
        onNavigate?.();
    }
    return (
        <aside
            className = {cn(
                "flex h-full flex-col bg-panel px-4 py-6", className
            )}
        >
            <div className = "flex items-center gap-3 px-2">
                <div className = "flex size-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                    <Brain
                        aria-hidden = "true"
                        className = "size-6"
                    />
                </div>
                <div className = "text-base font-bold text-ink">
                    <p className = "text-base font-bold text-ink">Second Brain</p>
                    <p className = "text-xs text-muted">Personal Workspace</p>
                </div>
            </div>
            <div className = "mt-8">
                <p className = "px-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Quick Capture</p>
                <Link
                    href = "#quick-capture"
                    onClick = {onNavigate}
                    className = "mt-2 flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
                >
                    <Plus
                        aria-hidden = "true"
                        className = "size-4"
                    />
                    Catatan Baru
                </Link>
            </div>
            <nav className = "mt-8 space-y-7">
                <div>
                    <p className = "mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Workspace</p>
                    <div className = "space-y-1">
                        <SidebarItem
                            label = "Dashboard"
                            icon = {LayoutDashboard}
                            active = {activeView === "dashboard"}
                            onClick = {() => selectView("dashboard")}
                        />
                        <SidebarItem
                            label = "Semua Catatan"
                            icon = {StickyNote}
                            active = {activeView === "all"}
                            onClick = {() => selectView("all")}
                        />
                        <SidebarItem
                            label = "Favorit"
                            icon = {Star}
                            active = {activeView === "favorites"}
                            onClick = {() => selectView("favorites")}
                        />
                        <SidebarItem
                            label = "Arsip"
                            icon = {Archive}
                            active = {activeView === "archived"}
                            onClick = {() => selectView("archived")}
                        />
                    </div>
                </div>
                <div>
                    <p className = "mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Productivity</p>
                    <div className = "space-y-1">
                        <SidebarItem
                            label = "Tasks"
                            icon = {CheckSquare}
                            href = "#tasks"
                            onNavigate = {onNavigate}
                        />
                        <SidebarItem
                            label = "Projects"
                            icon = {FolderKanban}
                            href = "#projects"
                            onNavigate = {onNavigate}
                        />
                        <SidebarItem
                            label = "Areas"
                            icon = {Shapes}
                            comingSoon
                        />
                    </div>
                </div>
                <div>
                    <p className = "mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Knowledge</p>
                    <div className = "space-y-1">
                        <SidebarItem
                            label = "Resources"
                            icon = {Library}
                            comingSoon
                        />
                    </div>
                </div>
            </nav>
            <div className = "mt-auto border-t border-line px-3 pt-5">
                <p className = "text-xs text-muted">Total catatan</p>
                <p className = "mt-1 text-2xl font-bold text-ink">{notesCount}</p>
            </div>
        </aside>
    )
}