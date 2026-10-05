import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDate, localDate, num } from "../lib/format";
import { Button, Card, ErrorBanner, Field, PageIntro, SelectField, Stat, useAction, useToast } from "../components/ui";

const QUALITY = [["", "Not specified"], ["poor", "Poor"], ["fair", "Fair"], ["good", "Good"], ["excellent", "Excellent"]];

export default function RecoveryPage() {
    const toast = useToast();
    const [date, setDate] = useState(localDate());
    const [sleep, setSleep] = useState(null);
    const [form, setForm] = useState({ duration_hours: "", sleep_quality: "", bedtime: "", wake_time: "", notes: "" });
    const [error, setError] = useState("");
    const action = useAction();

    const load = useCallback(() => api.sleep.daily(date).then((s) => { setSleep(s); setError(""); }).catch((e) => setError(e.message)), [date]);
    useEffect(() => { load(); }, [load]);

    async function add(e) {
        e.preventDefault();
        const ok = await action.run(async () => {
            await api.sleep.add({ date, duration_hours: num(form.duration_hours), sleep_quality: form.sleep_quality || null, bedtime: form.bedtime || null, wake_time: form.wake_time || null, notes: form.notes.trim() || null });
            return true;
        });
        if (ok) { toast(`Sleep saved for ${formatDate(date)}`); setForm({ duration_hours: "", sleep_quality: "", bedtime: "", wake_time: "", notes: "" }); load(); }
    }
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const logged = sleep && sleep.duration_hours > 0;

    return <>
        <PageIntro title="Recovery" text="Sleep is the recovery signal tracked today."
            right={<input className="date-input" type="date" aria-label="Date" max={localDate()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />} />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="stats-grid">
            <Stat label="Sleep duration" value={logged ? sleep.duration_hours : null} unit=" h" digits={1} />
            <Stat label="Quality" value={sleep?.sleep_quality ? sleep.sleep_quality[0].toUpperCase() + sleep.sleep_quality.slice(1) : "Not logged"} />
            <Stat label="Bedtime" value={sleep?.bedtime || "—"} />
            <Stat label="Wake time" value={sleep?.wake_time || "—"} />
        </div>
        <Card style={{ marginTop: 18 }}>
            <h3>Log sleep for {formatDate(date)}</h3>
            <form onSubmit={add} className="form-grid">
                <Field label="Duration (hours)" type="number" min="0" max="24" step="0.1" value={form.duration_hours} onChange={set("duration_hours")} required />
                <SelectField label="Quality" value={form.sleep_quality} onChange={set("sleep_quality")} options={QUALITY} />
                <Field label="Bedtime" type="time" value={form.bedtime} onChange={set("bedtime")} />
                <Field label="Wake time" type="time" value={form.wake_time} onChange={set("wake_time")} />
                <div className="full"><Field label="Notes" value={form.notes} onChange={set("notes")} /></div>
                <div className="full"><ErrorBanner message={action.error} /><Button loading={action.loading}>Save sleep</Button></div>
            </form>
        </Card>
    </>;
}
