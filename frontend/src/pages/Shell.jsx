import { useState } from "react";
import { Button, Icon } from "../components/ui";
import { formatDate } from "../lib/format";

export const NAV = [
    ["dashboard", "Dashboard"], ["nutrition", "Nutrition"], ["workouts", "Workouts"], ["activity", "Activity"],
    ["recovery", "Recovery"], ["progress", "Progress"], ["ai", "AI Coach"], ["reports", "Reports"],
    ["notifications", "Notifications"], ["profile", "Profile"], ["settings", "Settings"],
];

export default function Shell({ user, page, setPage, onLogout, unread, children }) {
    const [open, setOpen] = useState(false);
    const name = user?.account?.name || "User";
    const go = (id) => { setPage(id); setOpen(false); window.scrollTo({ top: 0 }); };
    return (
        <div className="app-shell">
            <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Main navigation">
                <div className="sidebar-brand"><span className="brand-mark small">AI</span><div><strong>Personal AI</strong><small>Fitness Assistant</small></div></div>
                <nav>
                    {NAV.map(([id, label]) => (
                        <button key={id} className={page === id ? "nav-active" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}>
                            <Icon name={id} />{label}
                            {id === "notifications" && unread > 0 && <span className="nav-badge" aria-label={`${unread} unread`}>{unread}</span>}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-chip"><div className="avatar">{name.slice(0, 1).toUpperCase()}</div><div><strong>{name}</strong><small>{user?.profile?.goal || "Fitness"}</small></div></div>
                    <Button variant="ghost" onClick={onLogout}>Log out</Button>
                </div>
            </aside>
            {open && <button className="backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}
            <main className="main">
                <header className="topbar">
                    <button className="menu-button" onClick={() => setOpen(true)} aria-label="Open menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                    </button>
                    <div className="topbar-title"><h2>{NAV.find((n) => n[0] === page)?.[1] || "Dashboard"}</h2></div>
                    <span className="date-pill">{formatDate(new Date().toISOString(), { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                </header>
                <div className="content">{children}</div>
            </main>
        </div>
    );
}
