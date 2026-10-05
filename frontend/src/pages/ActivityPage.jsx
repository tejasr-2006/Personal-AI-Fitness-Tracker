import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDate, localDate, num, titleCase } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, PageIntro, SelectField, Stat, useAction, useToast } from "../components/ui";

const BLANK = { activity_type: "walking", duration_minutes: "", calories_burned: "", steps: "", notes: "" };

export default function ActivityPage() {
    const toast = useToast();
    const [date, setDate] = useState(localDate());
    const [items, setItems] = useState([]);
    const [daily, setDaily] = useState(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState(BLANK);
    const action = useAction();

    const load = useCallback(() => (
        Promise.all([api.activities.list(date), api.activities.daily(date)])
            .then(([a, d]) => { setItems(a || []); setDaily(d); setError(""); })
            .catch((e) => setError(e.message))
    ), [date]);
    useEffect(() => { load(); }, [load]);

    async function add(e) {
        e.preventDefault();
        const ok = await action.run(async () => {
            await api.activities.add({ date, activity_type: form.activity_type, duration_minutes: num(form.duration_minutes), calories_burned: num(form.calories_burned), steps: num(form.steps), notes: form.notes.trim() || null });
            return true;
        });
        if (ok) { setForm({ ...BLANK, activity_type: form.activity_type }); toast("Activity added"); load(); }
    }
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const isToday = date === localDate();

    return <>
        <PageIntro title="Activity" text="Track movement and review daily totals."
            right={<input className="date-input" type="date" aria-label="Date" max={localDate()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />} />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="stats-grid three">
            <Stat label="Steps" value={daily?.steps} />
            <Stat label="Calories burned" value={daily?.calories_burned} unit=" kcal" />
            <Stat label="Active time" value={daily?.duration_minutes} unit=" min" />
        </div>
        <div className="two-col" style={{ marginTop: 18 }}>
            <Card>
                <h3>Add activity</h3>
                <form onSubmit={add} className="form-grid compact">
                    <SelectField label="Type" value={form.activity_type} onChange={set("activity_type")} options={["walking", "running", "cycling", "swimming", "hiking", "yoga", "other"]} />
                    <Field label="Duration (min)" type="number" min="1" value={form.duration_minutes} onChange={set("duration_minutes")} />
                    <Field label="Calories burned" type="number" min="0" value={form.calories_burned} onChange={set("calories_burned")} />
                    <Field label="Steps" type="number" min="0" value={form.steps} onChange={set("steps")} />
                    <div className="full"><Field label="Notes" value={form.notes} onChange={set("notes")} /></div>
                    <div className="full"><ErrorBanner message={action.error} /><Button loading={action.loading}>Add activity</Button></div>
                </form>
            </Card>
            <Card>
                <h3>{isToday ? "Today's activity" : `Activity on ${formatDate(date)}`}</h3>
                {items.length ? <div className="list">{items.map((x) => (
                    <div className="list-row" key={x.id}><div><strong>{titleCase(x.activity_type)}</strong>
                        <small>{x.duration_minutes || 0} min · {x.steps || 0} steps · {x.calories_burned || 0} kcal{x.notes ? ` · ${x.notes}` : ""}</small></div></div>
                ))}</div> : <EmptyState title="No activities logged for this day." />}
            </Card>
        </div>
    </>;
}
