"use client";

import { ReactNode, useState } from "react";
import { Sidebar, SidebarView } from "./Sidebar";
import { Brain, Menu, X } from "lucide-react";

type AppShellProps = {
    children: ReactNode;
    notesCount: number;
    activeView: SidebarView;
    onViewChange: (view: SidebarView) => void;
}

export function AppShell({children, notesCount, activeView, onViewChange,}: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function closeSidebar() {
        setIsSidebarOpen(false)
    }

    return (
        <div className = "min-h-screen bg-page md:p-5 lg:p-8">
            <div className = "mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-panel md:min-h-[calc(100vh-2.5rem)] md:rounded-3xl md:border md:border-line md:shadow-[0_20px_60px_rgba(84,48,36,0.10)] lg:min-h-[calc(100vh-4rem)]">
                <Sidebar
                    notesCount = {notesCount}
                    className = "hidden-w-64 shrink-0 border-r border-line md:flex"
                    activeView = {activeView}
                    onViewChange = {onViewChange}
                />
                <div className = "min-w-0 flex-1">
                    <header className = "flex items-center justify-between border-b border-line bg-panel px-5 py-4 md:hidden">
                        <div className = "flex items-center gap-3">
                            <div className = "flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                                <Brain
                                    aria-hidden = "true"
                                    className = "size-5"
                                />
                            </div>
                            <p className = "font=bold text-ink">Second Brain</p>
                        </div>
                        <button
                            type = "button"
                            onClick = {() => setIsSidebarOpen(true)}
                            aria-label = "Buka-navigasi"
                            className = "rounded-xl p-2 text-muted transition hover:bg-soft hover:text-ink"
                        >
                            <Menu
                                aria-hidden = "true"
                                className = "size-5"
                            />
                        </button>
                    </header>
                    <main className = "min-w-0">
                        {children}
                    </main>
                </div>
            </div>
            {isSidebarOpen && (
                <div className = "fixed inset-0 z-50 md:hidden">
                    <button
                        type = "button"
                        onClick = {closeSidebar}
                        aria-label = "Tutup navigasi"
                        className = "absolute inset-0 bg-ink/30 backdrop-blur-sm"
                    />
                    <div className = "absolute inset-y-0 left-0 w-[min(82w,280px)] border-r border-line bg-panel shadow-2xl">
                        <button
                            type  = "button"
                            onClick = {closeSidebar}
                            aria-label = "Tutup navigasi"
                            className = "absolute top-5 right-4 z-10 rounded-xl p-2 text-muted transition hover:bg-soft hover:text-ink" 
                        >
                            <X
                                aria-hidden = "true"
                                className = "size-5"
                            />
                        </button>
                        <Sidebar
                            notesCount = {notesCount}
                            activeView = {activeView}
                            onViewChange = {onViewChange}
                            className = "w-full"
                            onNavigate = {closeSidebar}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}