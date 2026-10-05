import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDate, localDate, num } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, Modal, PageIntro, SelectField, useAction, useToast } from "../components/ui";

const BLANK_LOG = { exercise_id: "", sets: "", reps: "", weight: "", duration_minutes: "" };

function WorkoutRow({ workout, exercises, onAdd, refreshKey }) {
    const [logs, setLogs] = useState(null);
    const [open, setOpen] = useState(false);
    useEffect(() => { if (open) api.workouts.logs(workout.id).then(setLogs).catch(() => setLogs([])); }, [open, workout.id, refreshKey]);
    return (
        <div className="list-row" style={{ alignItems: "start" }}>
            <div style={{ flex: 1 }}>
                <strong>{workout.name}</strong>
                <small>{formatDate(workout.date, { weekday: "short", month: "short", day: "numeric" })} · {workout.duration_minutes ? `${workout.duration_minutes} min` : "no duration"}{workout.notes ? ` · ${workout.notes}` : ""}</small>
                <button className="text-button" style={{ marginTop: 6, fontSize: ".78rem" }} onClick={() => setOpen(!open)}>{open ? "Hide exercises" : "Show exercises"}</button>
                {open && (logs == null ? <div className="sublist">Loading…</div> : logs.length
                    ? <div className="sublist">{logs.map((l) => <div key={l.id}><b>{l.name}</b> — {[l.sets && l.reps ? `${l.sets}×${l.reps}` : null, l.weight ? `${l.weight} kg` : null, l.duration_minutes ? `${l.duration_minutes} min` : null].filter(Boolean).join(" · ") || "logged"}</div>)}</div>
                    : <div className="sublist">No exercises logged yet.</div>)}
            </div>
            <Button variant="secondary" size="sm" onClick={() => onAdd(workout)} disabled={!exercises.length}>Add exercise</Button>
        </div>
    );
}

export default function WorkoutsPage() {
    const toast = useToast();
    const [workouts, setWorkouts] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", date: localDate(), duration_minutes: "", notes: "" });
    const [selected, setSelected] = useState(null);
    const [log, setLog] = useState(BLANK_LOG);
    const [refreshKey, setRefreshKey] = useState(0);
    const [newEx, setNewEx] = useState({ name: "", muscle_group: "", equipment: "" });
    const create = useAction();
    const logAction = useAction();
    const exAction = useAction();

    const load = useCallback(() => (
        Promise.all([api.workouts.list(), api.workouts.exercises()])
            .then(([w, e]) => { setWorkouts(w || []); setExercises(e || []); })
            .catch((e) => setError(e.message))
    ), []);
    useEffect(() => { load(); }, [load]);

    async function createWorkout(e) {
        e.preventDefault();
        const ok = await create.run(async () => { await api.workouts.create({ ...form, name: form.name.trim(), duration_minutes: num(form.duration_minutes), notes: form.notes.trim() || null }); return true; });
        if (ok) { setForm({ ...form, name: "", duration_minutes: "", notes: "" }); toast("Workout created"); load(); }
    }

    async function addExercise(e) {
        e.preventDefault();
        const ok = await logAction.run(async () => {
            await api.workouts.addExercise(selected.id, { exercise_id: Number(log.exercise_id), sets: num(log.sets), reps: num(log.reps), weight: num(log.weight), duration_minutes: num(log.duration_minutes) });
            return true;
        });
        if (ok) { toast(`Added to ${selected.name}`); setLog(BLANK_LOG); setSelected(null); setRefreshKey((k) => k + 1); }
    }

    async function addToLibrary(e) {
        e.preventDefault();
        const ok = await exAction.run(async () => { await api.workouts.createExercise({ name: newEx.name.trim(), muscle_group: newEx.muscle_group.trim() || null, equipment: newEx.equipment.trim() || null }); return true; });
        if (ok) { setNewEx({ name: "", muscle_group: "", equipment: "" }); toast("Exercise added to library"); load(); }
    }

    return <>
        <PageIntro title="Workouts" text="Plan sessions, log sets and reps, and review your history." />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="two-col">
            <Card>
                <h3>Create workout</h3>
                <form onSubmit={createWorkout} className="form-grid compact">
                    <Field label="Workout name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Push day" required />
                    <Field label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    <Field label="Duration (min)" type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
                    <Field label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    <div className="full"><ErrorBanner message={create.error} /><Button loading={create.loading}>Create workout</Button></div>
                </form>
            </Card>
            <Card>
                <div className="card-head"><h3>Exercise library</h3><span className="muted">{exercises.length} exercises</span></div>
                <form onSubmit={addToLibrary} className="inline-form" style={{ marginTop: 0, flexWrap: "wrap" }}>
                    <Field label="New exercise" value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} required />
                    <Field label="Muscle group" value={newEx.muscle_group} onChange={(e) => setNewEx({ ...newEx, muscle_group: e.target.value })} />
                    <Button variant="secondary" loading={exAction.loading}>Add</Button>
                </form>
                <ErrorBanner message={exAction.error} />
                <div className="chips" style={{ maxHeight: 150, overflow: "auto" }}>{exercises.map((x) => <span key={x.id} className="chip" title={`${x.muscle_group || "General"} · ${x.equipment || "—"}`}>{x.name}</span>)}</div>
            </Card>
        </div>
        <Card>
            <div className="card-head"><h3>Workout history</h3><span className="muted">{workouts.length} sessions</span></div>
            {workouts.length ? <div className="list">{workouts.map((w) => <WorkoutRow key={w.id} workout={w} exercises={exercises} refreshKey={refreshKey} onAdd={setSelected} />)}</div> : <EmptyState title="No workouts yet — create your first one above." />}
        </Card>
        {selected && (
            <Modal title={`Add exercise to ${selected.name}`} onClose={() => setSelected(null)}>
                <form onSubmit={addExercise} className="form-grid">
                    <div className="full"><SelectField label="Exercise" value={log.exercise_id} onChange={(e) => setLog({ ...log, exercise_id: e.target.value })} required>
                        <option value="">Select an exercise…</option>{exercises.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</SelectField></div>
                    <Field label="Sets" type="number" min="1" value={log.sets} onChange={(e) => setLog({ ...log, sets: e.target.value })} />
                    <Field label="Reps" type="number" min="1" value={log.reps} onChange={(e) => setLog({ ...log, reps: e.target.value })} />
                    <Field label="Weight (kg)" type="number" min="0" step="0.5" value={log.weight} onChange={(e) => setLog({ ...log, weight: e.target.value })} />
                    <Field label="Duration (min)" type="number" min="1" value={log.duration_minutes} onChange={(e) => setLog({ ...log, duration_minutes: e.target.value })} />
                    <div className="full"><ErrorBanner message={logAction.error} /><Button loading={logAction.loading}>Add exercise</Button></div>
                </form>
            </Modal>
        )}
    </>;
}
