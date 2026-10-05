import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDateTime } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, PageIntro, useAction, useToast } from "../components/ui";

export default function NotificationsPage({ onChange }) {
    const toast = useToast();
    const [items, setItems] = useState(null);
    const [error, setError] = useState("");
    const gen = useAction();

    const load = useCallback(() => api.notifications.list().then((n) => { setItems(n || []); onChange?.(); }).catch((e) => setError(e.message)), [onChange]);
    useEffect(() => { load(); }, [load]);

    async function generate() {
        const r = await gen.run(() => api.notifications.generate());
        if (r) { toast(r.count ? `${r.count} new reminder(s)` : "You're all caught up — nothing new to flag"); load(); }
    }
    async function read(id) {
        try { await api.notifications.read(id); load(); } catch (e) { setError(e.message); }
    }
    async function readAll() {
        try { await Promise.all(items.filter((n) => !n.is_read).map((n) => api.notifications.read(n.id))); load(); } catch (e) { setError(e.message); }
    }
    const unread = (items || []).filter((n) => !n.is_read);

    return <>
        <PageIntro title="Notifications" text="Reminders based on today's intake and hydration."
            right={<>{unread.length > 1 && <Button variant="secondary" onClick={readAll}>Mark all read</Button>}<Button onClick={generate} loading={gen.loading}>Check today</Button></>} />
        <ErrorBanner message={error || gen.error} onClose={() => { setError(""); gen.setError(""); }} />
        <Card>
            {items == null ? <p className="muted">Loading…</p> : items.length ? <div className="list">{items.map((n) => (
                <div className={`notification ${n.is_read ? "read" : ""}`} key={n.id}>
                    <div>
                        <strong>{!n.is_read && <span className="unread-dot" />}{n.title}</strong>
                        <p>{n.message}</p><small>{formatDateTime(n.created_at)}</small>
                    </div>
                    {!n.is_read && <Button variant="secondary" size="sm" onClick={() => read(n.id)}>Mark read</Button>}
                </div>))}</div> : <EmptyState title="No notifications yet." action={<Button variant="secondary" size="sm" onClick={generate}>Check today</Button>} />}
        </Card>
    </>;
}
