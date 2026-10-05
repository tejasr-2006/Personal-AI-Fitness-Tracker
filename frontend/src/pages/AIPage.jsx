import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { aiCache } from "../lib/cache";
import { localDate, formatDate } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, InfoList, PageIntro, useAction } from "../components/ui";

const SUGGESTIONS = ["What should I eat for dinner?", "Am I on track this week?", "Suggest a 30-minute workout for today", "How can I sleep better?"];

/** An AI advice card that only calls the (slow, billed) endpoint when asked, and remembers the result. */
function AdviceCard({ eyebrow, cacheKey, fetcher, emptyTitle }) {
    const [data, setData] = useState(() => aiCache.get(cacheKey) || null);
    const { run, loading, error, setError } = useAction();
    async function generate() {
        const result = await run(fetcher);
        if (result) { aiCache.set(cacheKey, result); setData(result); }
    }
    return (
        <Card>
            <div className="card-head">
                <div><p className="eyebrow">{eyebrow}</p><h3>{data?.summary || emptyTitle}</h3></div>
                <Button size="sm" variant={data ? "secondary" : "primary"} onClick={generate} loading={loading}>{data ? "Refresh" : "Generate"}</Button>
            </div>
            <ErrorBanner message={error} onClose={() => setError("")} />
            {data && <InfoList data={data} />}
        </Card>
    );
}

export default function AIPage() {
    const today = localDate();
    const [recs, setRecs] = useState([]);
    const [messages, setMessages] = useState(() => aiCache.get("chat") || []);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const recAction = useAction();
    const chatEnd = useRef(null);

    useEffect(() => { api.recommendations.list().then((r) => setRecs(r || [])).catch((e) => setError(e.message)); }, []);
    useEffect(() => { aiCache.set("chat", messages); chatEnd.current?.scrollIntoView({ block: "nearest" }); }, [messages]);

    async function send(text) {
        const q = (text ?? input).trim();
        if (!q || sending) return;
        setInput(""); setError("");
        setMessages((m) => [...m, { role: "user", content: q }]);
        setSending(true);
        try {
            const r = await api.ai.coach(q);
            setMessages((m) => [...m, { role: "assistant", content: r.response }]);
        } catch (e) { setError(e.message); }
        finally { setSending(false); }
    }

    async function generateRecs() {
        const r = await recAction.run(() => api.recommendations.generate());
        if (r) setRecs((old) => [...(r.recommendations || []), ...old]);
    }

    return <>
        <PageIntro title="AI Coach" text="Personalised guidance based on your profile, logs and targets." />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="two-col">
            <AdviceCard eyebrow="AI dietitian" cacheKey={`diet:${today}`} emptyTitle="Get nutrition guidance for today" fetcher={() => api.ai.dietAdvice(today)} />
            <AdviceCard eyebrow="AI trainer" cacheKey={`trainer:${today}`} emptyTitle="Get training guidance" fetcher={() => api.ai.trainerAdvice()} />
        </div>

        <Card>
            <p className="eyebrow">Ask your coach</p>
            <h3>Questions about training, nutrition or recovery</h3>
            <div className="chat" aria-live="polite">
                {messages.length ? messages.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.content}</div>) : (
                    <div><p className="muted">Ask anything, or start with one of these:</p>
                        <div className="chips">{SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}</div></div>
                )}
                {sending && <div className="bubble assistant"><span className="spinner sm" /> Thinking…</div>}
                <div ref={chatEnd} />
            </div>
            <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What should I focus on today?" aria-label="Message your coach" maxLength={1000} />
                <Button loading={sending} disabled={!input.trim()}>Send</Button>
            </form>
            <p className="muted" style={{ fontSize: ".74rem", margin: "10px 0 0" }}>AI guidance is general fitness information, not medical advice.</p>
        </Card>

        <Card>
            <div className="card-head"><h3>Recommendations</h3><Button size="sm" variant="secondary" onClick={generateRecs} loading={recAction.loading}>Generate new</Button></div>
            <ErrorBanner message={recAction.error} onClose={() => recAction.setError("")} />
            {recs.length ? <div className="list">{recs.map((r, i) => (
                <div className="list-row" key={r.id ?? i}>
                    <div><strong style={{ textTransform: "capitalize" }}>{r.category || "General"}</strong><small>{r.recommendation}{r.date ? ` · ${formatDate(r.date)}` : ""}</small></div>
                    <span className={`badge ${r.priority || ""}`}>{r.priority || "medium"}</span>
                </div>))}</div> : <EmptyState title="No recommendations yet — generate your first set." />}
        </Card>
    </>;
}
