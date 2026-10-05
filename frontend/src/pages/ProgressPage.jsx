import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatDate, localDate, num, round, titleCase } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, PageIntro, SelectField, WeightChart, useAction, useToast } from "../components/ui";

const SITES = ["waist", "chest", "hips", "neck", "left_arm", "right_arm", "left_thigh", "right_thigh"];

export default function ProgressPage() {
    const toast = useToast();
    const [weights, setWeights] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState("");
    const [weight, setWeight] = useState("");
    const [m, setM] = useState({ date: localDate(), ...Object.fromEntries(SITES.map((k) => [k, ""])) });
    const [photo, setPhoto] = useState({ date: localDate(), photo_url: "", photo_type: "front", notes: "" });
    const wAction = useAction(), mAction = useAction(), pAction = useAction();

    const load = useCallback(() => (
        Promise.all([api.weight.list(), api.measurements.list(), api.photos.list()])
            .then(([w, ms, p]) => { setWeights(w || []); setMeasurements(ms || []); setPhotos(p || []); })
            .catch((e) => setError(e.message))
    ), []);
    useEffect(() => { load(); }, [load]);

    async function addWeight(e) {
        e.preventDefault();
        const ok = await wAction.run(async () => { await api.weight.add({ date: localDate(), weight: num(weight) }); return true; });
        if (ok) { setWeight(""); toast("Weight logged"); load(); }
    }
    async function addMeasurement(e) {
        e.preventDefault();
        if (!SITES.some((k) => m[k] !== "")) { mAction.setError("Enter at least one measurement."); return; }
        const ok = await mAction.run(async () => {
            await api.measurements.add({ date: m.date, ...Object.fromEntries(SITES.map((k) => [k, num(m[k])])) });
            return true;
        });
        if (ok) { setM({ ...m, ...Object.fromEntries(SITES.map((k) => [k, ""])) }); toast("Measurements saved"); load(); }
    }
    async function addPhoto(e) {
        e.preventDefault();
        const ok = await pAction.run(async () => { await api.photos.add({ ...photo, photo_url: photo.photo_url.trim(), notes: photo.notes.trim() || null }); return true; });
        if (ok) { setPhoto({ ...photo, photo_url: "", notes: "" }); toast("Photo saved"); load(); }
    }
    async function removePhoto(id) {
        try { await api.photos.remove(id); toast("Photo removed"); load(); } catch (err) { setError(err.message); }
    }

    const chart = weights.slice(-90).map((x) => ({ date: formatDate(x.date), weight: x.weight }));
    const latest = measurements[0];
    const first = weights[0], last = weights[weights.length - 1];

    return <>
        <PageIntro title="Progress" text="Your weight history, body measurements and photo references." />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="two-col">
            <Card>
                <div className="card-head"><h3>Weight trend</h3>{first && last && weights.length > 1 && <span className="badge">{last.weight - first.weight > 0 ? "+" : ""}{round(last.weight - first.weight, 1)} kg overall</span>}</div>
                {chart.length > 1 ? <WeightChart data={chart} /> : <EmptyState title="Log at least two weigh-ins to see a trend." />}
                <form className="inline-form" onSubmit={addWeight}>
                    <Field label="Today's weight (kg)" type="number" min="20" max="499" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                    <Button loading={wAction.loading}>Log weight</Button>
                </form>
                <div style={{ marginTop: 12 }}><ErrorBanner message={wAction.error} /></div>
            </Card>
            <Card>
                <div className="card-head"><h3>Measurements</h3>{latest && <span className="muted">Latest: {formatDate(latest.date)}</span>}</div>
                {latest ? <div className="measurement-grid" style={{ marginBottom: 16 }}>{SITES.filter((k) => latest[k] != null).map((k) => <div key={k}><span>{titleCase(k)}</span><strong>{latest[k]} cm</strong></div>)}</div> : <EmptyState title="No measurements yet." />}
                <form onSubmit={addMeasurement} className="form-grid compact">
                    <div className="full"><Field label="Date" type="date" max={localDate()} value={m.date} onChange={(e) => setM({ ...m, date: e.target.value })} required /></div>
                    {SITES.map((k) => <Field key={k} label={`${titleCase(k)} (cm)`} type="number" min="0" step="0.1" value={m[k]} onChange={(e) => setM({ ...m, [k]: e.target.value })} />)}
                    <div className="full"><ErrorBanner message={mAction.error} /><Button loading={mAction.loading}>Save measurements</Button></div>
                </form>
            </Card>
        </div>
        <Card>
            <h3>Progress photos</h3>
            <p className="muted">Photos are stored as links to images you host yourself (no uploads).</p>
            <form onSubmit={addPhoto} className="form-grid">
                <Field label="Photo URL" type="url" placeholder="https://…" value={photo.photo_url} onChange={(e) => setPhoto({ ...photo, photo_url: e.target.value })} required />
                <SelectField label="View" value={photo.photo_type} onChange={(e) => setPhoto({ ...photo, photo_type: e.target.value })} options={["front", "side", "back"]} />
                <Field label="Date" type="date" max={localDate()} value={photo.date} onChange={(e) => setPhoto({ ...photo, date: e.target.value })} required />
                <Field label="Notes" value={photo.notes} onChange={(e) => setPhoto({ ...photo, notes: e.target.value })} />
                <div className="full"><ErrorBanner message={pAction.error} /><Button loading={pAction.loading}>Save photo reference</Button></div>
            </form>
            {photos.length ? <div className="photo-grid">{photos.map((p) => (
                <div className="photo-card" key={p.id}>
                    <img src={p.photo_url} alt={`${p.photo_type || "Progress"} photo from ${p.date}`} loading="lazy" referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.opacity = 0.25; e.currentTarget.alt = "Image could not be loaded"; }} />
                    <div><strong>{titleCase(p.photo_type) || "Photo"}</strong><small>{formatDate(p.date, { year: "numeric", month: "short", day: "numeric" })}{p.notes ? ` · ${p.notes}` : ""}</small>
                        <button className="danger-link" onClick={() => removePhoto(p.id)}>Delete</button></div>
                </div>
            ))}</div> : <div style={{ marginTop: 16 }}><EmptyState title="No progress photos yet." /></div>}
        </Card>
    </>;
}
