import { useEffect, useState } from "react";
import { api } from "../api";
import { aiCache } from "../lib/cache";
import { formatDate, round } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, InfoList, Loading, PageIntro, Stat, useAction } from "../components/ui";

export default function ReportsPage() {
    const [period, setPeriod] = useState("weekly");
    const days = period === "weekly" ? 7 : 30;
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState("");
    const [report, setReport] = useState(() => aiCache.get("report:weekly") || null);
    const { run, loading, error: reportError, setError: setReportError } = useAction();

    useEffect(() => {
        setAnalytics(null);
        api.analytics(days).then(setAnalytics).catch((e) => setError(e.message));
        setReport(aiCache.get(`report:${period}`) || null);
        setReportError("");
    }, [period, days, setReportError]);

    async function generate() {
        const r = await run(() => api.reports[period]());
        if (r) { aiCache.set(`report:${period}`, r); setReport(r); }
    }

    return <>
        <PageIntro title="Reports" text="Your numbers for the period, plus an AI-written review."
            right={<div className="segmented" role="tablist">
                {["weekly", "monthly"].map((p) => <button key={p} role="tab" aria-selected={period === p} className={period === p ? "on" : ""} onClick={() => setPeriod(p)}>{p === "weekly" ? "Last 7 days" : "Last 30 days"}</button>)}
            </div>} />
        <ErrorBanner message={error} onClose={() => setError("")} />

        {!analytics && !error ? <Loading text="Crunching your numbers…" /> : analytics && <>
            <p className="muted" style={{ marginTop: -8 }}>{formatDate(analytics.period?.start)} – {formatDate(analytics.period?.end)}</p>
            <div className="stats-grid">
                <Stat label="Weight change" value={analytics.weight?.change != null ? `${analytics.weight.change > 0 ? "+" : ""}${analytics.weight.change}` : null} unit=" kg" />
                <Stat label="Calories eaten" value={analytics.nutrition?.calories} unit=" kcal" />
                <Stat label="Workouts" value={analytics.workouts?.count} />
                <Stat label="Avg sleep" value={analytics.sleep?.average_hours} unit=" h" digits={1} />
                <Stat label="Steps" value={analytics.activity?.steps} />
                <Stat label="Calories burned" value={analytics.activity?.calories_burned} unit=" kcal" />
                <Stat label="Protein" value={analytics.nutrition?.protein} unit=" g" />
                <Stat label="Water" value={analytics.water?.total_ml != null ? round(analytics.water.total_ml / 1000, 1) : null} unit=" L" digits={1} />
            </div>
        </>}

        <Card style={{ marginTop: 18 }}>
            <div className="card-head">
                <div><p className="eyebrow">AI {period} report</p><h3>{report?.overview ? "Overview" : "Generate an AI review of this period"}</h3></div>
                <Button size="sm" variant={report ? "secondary" : "primary"} onClick={generate} loading={loading}>{report ? "Regenerate" : "Generate report"}</Button>
            </div>
            <ErrorBanner message={reportError} onClose={() => setReportError("")} />
            {report ? <><p className="muted">{report.overview}</p><InfoList data={report} skip={["overview"]} /></> : !loading && <EmptyState title="Reports use your logged data, so the more you log the better they get." />}
        </Card>
    </>;
}
