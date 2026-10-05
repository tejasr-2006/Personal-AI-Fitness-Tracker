import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { aiCache } from "../lib/cache";
import { localDate, round, titleCase, formatDate } from "../lib/format";
import { Button, Card, CalorieRing, EmptyState, ErrorBanner, Loading, MacroRow, Stat, WeightChart, useToast } from "../components/ui";

export default function DashboardPage({ setPage }) {
    const today = localDate();
    const toast = useToast();
    const [data, setData] = useState(null);
    const [weights, setWeights] = useState([]);
    const [error, setError] = useState("");
    const [briefing, setBriefing] = useState(() => aiCache.get(`briefing:${today}`) || null);
    const [briefingError, setBriefingError] = useState("");
    const [briefingLoading, setBriefingLoading] = useState(false);
    const [water, setWater] = useState(false);

    const load = useCallback(() => (
        Promise.all([api.dashboard(today), api.weight.list()])
            .then(([d, w]) => { setData(d); setWeights(w || []); })
            .catch((e) => setError(e.message))
    ), [today]);

    useEffect(() => { load(); }, [load]);

    // The briefing is independent of the rest of the dashboard: if the AI is down
    // or unconfigured, everything else still renders.
    async function generateBriefing() {
        setBriefingLoading(true); setBriefingError("");
        try {
            const b = await api.ai.briefing(today);
            aiCache.set(`briefing:${today}`, b);
            setBriefing(b);
        } catch (e) { setBriefingError(e.message); }
        finally { setBriefingLoading(false); }
    }

    async function addWater(amount) {
        setWater(true);
        try { await api.water.add({ date: today, amount }); toast(`Added ${amount} ml of water`); await load(); }
        catch (e) { toast(e.message, "error"); }
        finally { setWater(false); }
    }

    if (error) return <ErrorBanner message={error} />;
    if (!data) return <Loading text="Loading your dashboard…" />;

    const n = data.nutrition || {};
    const t = data.targets || {};
    const chart = weights.slice(-30).map((x) => ({ date: formatDate(x.date), weight: x.weight }));
    const firstName = (data.profile?.name || "").split(" ")[0] || "there";

    return <>
        <div className="welcome-row">
            <div>
                <p className="eyebrow">Today · {formatDate(today, { weekday: "long", month: "long", day: "numeric" })}</p>
                <h1>Good to see you, {firstName}.</h1>
                <p className="muted">Here's where you stand against today's targets.</p>
            </div>
            <Button variant="secondary" onClick={() => setPage("nutrition")}>Log a meal</Button>
        </div>

        <Card className="briefing">
            <div className="card-head">
                <div><p className="eyebrow">AI daily briefing</p><h3>{briefing?.summary || "Get a personalised summary of your day"}</h3></div>
                {briefing?.priority && <span className="badge">{briefing.priority}</span>}
                {!briefing && <Button size="sm" onClick={generateBriefing} loading={briefingLoading}>Generate</Button>}
                {briefing && <Button size="sm" variant="secondary" onClick={generateBriefing} loading={briefingLoading}>Refresh</Button>}
            </div>
            <ErrorBanner message={briefingError} onClose={() => setBriefingError("")} />
            {briefing && <>
                <div className="briefing-grid">
                    {briefing.nutrition_status && <p>{briefing.nutrition_status}</p>}
                    {briefing.activity_status && <p>{briefing.activity_status}</p>}
                    {briefing.sleep_status && <p>{briefing.sleep_status}</p>}
                </div>
                {Array.isArray(briefing.recommendations) && <ul>{briefing.recommendations.map((x, i) => <li key={i}>{x}</li>)}</ul>}
            </>}
        </Card>

        <div className="two-col">
            <Card>
                <div className="card-head"><div><p className="eyebrow">Nutrition</p><h3>Calories & macros</h3></div><button className="text-button" onClick={() => setPage("nutrition")}>Details</button></div>
                <div className="ring-wrap">
                    <CalorieRing value={n.calories_consumed || 0} target={t.calories} />
                    <div className="macro-list">
                        <MacroRow label="Protein" value={n.protein_consumed} target={t.protein} />
                        <MacroRow label="Carbs" value={n.carbohydrates} target={t.carbohydrates} />
                        <MacroRow label="Fat" value={n.fat} target={t.fat} />
                    </div>
                </div>
            </Card>
            <Card>
                <div className="card-head"><div><p className="eyebrow">Hydration</p><h3>{round(data.water?.consumed_ml)} / {round(data.water?.target_ml)} ml</h3></div></div>
                <div className="progress" style={{ margin: "6px 0 14px" }}><div style={{ width: `${Math.min(((data.water?.consumed_ml || 0) / (data.water?.target_ml || 1)) * 100, 100)}%` }} /></div>
                <div className="chips">{[250, 500, 750].map((ml) => <button key={ml} className="chip" disabled={water} onClick={() => addWater(ml)}>+{ml} ml</button>)}</div>
                <p className="muted" style={{ marginBottom: 0 }}>{data.water?.remaining_ml > 0 ? `${round(data.water.remaining_ml)} ml to go today.` : "Hydration target reached 🎉"}</p>
            </Card>
        </div>

        <div className="stats-grid">
            <Stat label="Steps" value={data.activity?.steps} />
            <Stat label="Calories burned" value={data.activity?.calories_burned} unit=" kcal" />
            <Stat label="Workouts today" value={data.workouts?.count} />
            <Stat label="Sleep" value={data.sleep?.duration_hours} unit=" h" digits={1} />
        </div>

        <div className="two-col" style={{ marginTop: 18 }}>
            <Card>
                <div className="card-head"><div><p className="eyebrow">Progress</p><h3>Weight trend</h3></div><button className="text-button" onClick={() => setPage("progress")}>View all</button></div>
                {chart.length > 1 ? <WeightChart data={chart} /> : <EmptyState title="Log at least two weigh-ins to see a trend." action={<Button variant="secondary" size="sm" onClick={() => setPage("progress")}>Log weight</Button>} />}
            </Card>
            <Card>
                <p className="eyebrow">Goal</p>
                <h3>{titleCase(data.profile?.goal) || "Fitness"}</h3>
                <div className="goal-box">
                    <div><span>Current</span><strong>{round(data.weight?.current ?? data.profile?.weight, 1)} kg</strong></div>
                    <div><span>Target</span><strong>{data.profile?.goal_weight != null ? `${round(data.profile.goal_weight, 1)} kg` : "—"}</strong></div>
                </div>
                <p className="muted" style={{ marginBottom: 0 }}>Daily plan: {round(t.calories)} kcal · {round(t.protein)} g protein · {round(t.water)} ml water.</p>
            </Card>
        </div>
    </>;
}
