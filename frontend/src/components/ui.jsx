import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { round, titleCase } from "../lib/format";

export function Button({ children, variant = "primary", size, loading, ...props }) {
    return (
        <button className={`btn btn-${variant} ${size === "sm" ? "btn-sm" : ""}`} {...props} disabled={props.disabled || loading}>
            {loading && <span className="spinner sm" aria-hidden="true" />}
            {children}
        </button>
    );
}

export function Card({ children, className = "", ...rest }) {
    return <section className={`card ${className}`} {...rest}>{children}</section>;
}

export function Field({ label, hint, ...props }) {
    return <label className="field"><span>{label}</span><input {...props} />{hint && <span className="field-hint">{hint}</span>}</label>;
}

export function TextArea({ label, ...props }) {
    return <label className="field"><span>{label}</span><textarea {...props} /></label>;
}

export function SelectField({ label, options, children, ...props }) {
    return (
        <label className="field">
            <span>{label}</span>
            <select {...props}>
                {options ? options.map((o) => {
                    const [value, text] = Array.isArray(o) ? o : [o, titleCase(o)];
                    return <option key={value} value={value}>{text}</option>;
                }) : children}
            </select>
        </label>
    );
}

export function ProgressBar({ value, target }) {
    const ratio = target > 0 ? Number(value || 0) / Number(target) : 0;
    return (
        <div className={`progress ${ratio > 1.1 ? "over" : ""}`} role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
        </div>
    );
}

export function Stat({ label, value, target, unit = "", digits = 0 }) {
    const shown = typeof value === "number" ? round(value, digits) : value;
    return (
        <Card className="stat-card">
            <span className="stat-label">{label}</span>
            <div className="stat-value">{shown ?? "—"}{shown != null && unit && <small>{unit}</small>}</div>
            {target != null && <><ProgressBar value={value} target={target} /><small>of {round(target, digits)}{unit}</small></>}
        </Card>
    );
}

export function EmptyState({ title, action }) {
    return <div className="empty"><span>{title}</span>{action}</div>;
}

export function Loading({ text = "Loading…" }) {
    return <div className="loading" role="status"><div className="spinner" /><p>{text}</p></div>;
}

export function ErrorBanner({ message, onClose }) {
    if (!message) return null;
    return (
        <div className="alert error" role="alert">
            <span>{message}</span>
            {onClose && <button onClick={onClose} aria-label="Dismiss">×</button>}
        </div>
    );
}

export function PageIntro({ title, text, right }) {
    return (
        <div className="page-intro">
            <div><p className="eyebrow">Personal AI Fitness</p><h1>{title}</h1>{text && <p className="muted">{text}</p>}</div>
            {right && <div className="page-actions">{right}</div>}
        </div>
    );
}

export function Modal({ title, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
                <div className="card-head"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
                {children}
            </div>
        </div>
    );
}

export function WeightChart({ data }) {
    return (
        <div className="chart">
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" strokeOpacity={0.4} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="currentColor" strokeOpacity={0.4} />
                    <Tooltip formatter={(v) => [`${v} kg`, "Weight"]} />
                    <Line type="monotone" dataKey="weight" stroke="currentColor" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function CalorieRing({ value = 0, target }) {
    const r = 62, c = 2 * Math.PI * r;
    const ratio = target > 0 ? Math.min(value / target, 1) : 0;
    return (
        <div className="ring" role="img" aria-label={`${round(value)} of ${round(target)} calories`}>
            <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
                <circle cx="75" cy="75" r={r} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - ratio)} style={{ transition: "stroke-dashoffset .5s ease" }} />
            </svg>
            <div className="ring-center"><strong>{round(value)}</strong><span>of {target != null ? round(target) : "—"} kcal</span></div>
        </div>
    );
}

export function MacroRow({ label, value, target, unit = "g" }) {
    return (
        <div className="macro-row">
            <div><span>{label}</span><span><b>{round(value)}</b>{target != null ? ` / ${round(target)}` : ""} {unit}</span></div>
            <ProgressBar value={value} target={target} />
        </div>
    );
}

/** Renders a flat AI JSON object (strings or string arrays) as labelled sections. */
export function InfoList({ data, skip = ["summary"] }) {
    if (!data) return <p className="muted">Nothing generated yet.</p>;
    const entries = Object.entries(data).filter(([k, v]) => !skip.includes(k) && v != null && v !== "");
    return (
        <div className="info-list">
            {entries.map(([k, v]) => (
                <div key={k}>
                    <strong>{titleCase(k)}</strong>
                    {Array.isArray(v) ? <ul>{v.map((x, i) => <li key={i}>{typeof x === "string" ? x : JSON.stringify(x)}</li>)}</ul> : <p>{String(v)}</p>}
                </div>
            ))}
        </div>
    );
}

/* ---- toasts ---- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const id = useRef(0);
    const push = useCallback((message, type = "ok") => {
        const key = ++id.current;
        setToasts((t) => [...t, { key, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 3200);
    }, []);
    return (
        <ToastCtx.Provider value={push}>
            {children}
            <div className="toast-region" aria-live="polite">
                {toasts.map((t) => <div key={t.key} className={`toast ${t.type === "error" ? "error" : ""}`}>{t.message}</div>)}
            </div>
        </ToastCtx.Provider>
    );
}

/** Small hook: run an async action with loading + error state. */
export function useAction() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const run = useCallback(async (fn) => {
        setLoading(true); setError("");
        try { return await fn(); }
        catch (e) { setError(e.message); return undefined; }
        finally { setLoading(false); }
    }, []);
    return { run, loading, error, setError };
}

/* ---- nav icons (24x24, stroke) ---- */
const ICONS = {
    dashboard: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10",
    nutrition: "M7 3v8a3 3 0 006 0V3M10 3v18M17 3c-2 2-3 5-3 8h3v10",
    workouts: "M6 8v8M2 10v4M18 8v8M22 10v4M6 12h12",
    activity: "M3 12h4l3-8 4 16 3-8h4",
    recovery: "M20 14A8 8 0 019.5 4 8 8 0 1020 14z",
    progress: "M3 20h18M6 16l4-5 4 3 5-7",
    ai: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z",
    reports: "M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6",
    notifications: "M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 004 0",
    profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1a7 7 0 00-2-1l-.5-2h-4L9.5 7a7 7 0 00-2 1L5.5 7l-2 4 2 1a7 7 0 000 2l-2 1 2 4 2-1a7 7 0 002 1l.5 2h4l.5-2a7 7 0 002-1l2 1 2-4-2-1a7 7 0 000-2z",
};
export function Icon({ name }) {
    return (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[name] || ICONS.dashboard} />
        </svg>
    );
}
