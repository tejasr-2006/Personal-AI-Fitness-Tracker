// Local calendar date as YYYY-MM-DD.
// (new Date().toISOString() is UTC, which gives the wrong day for anyone ahead of/behind UTC.)
export function localDate(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const num = (v) => (v === "" || v == null ? null : Number(v));

export function round(v, digits = 0) {
    if (v == null || Number.isNaN(Number(v))) return "—";
    const f = 10 ** digits;
    return Math.round(Number(v) * f) / f;
}

export function titleCase(s) {
    return String(s ?? "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso, opts = { month: "short", day: "numeric" }) {
    if (!iso) return "";
    // Parse date-only strings as local dates (avoids off-by-one in negative-UTC zones).
    const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
    return d.toLocaleDateString(undefined, opts);
}

export function formatDateTime(iso) {
    if (!iso) return "";
    // Backend stores naive UTC timestamps; mark them as UTC so they render in local time.
    const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
