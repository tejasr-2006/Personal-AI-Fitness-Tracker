import { useEffect, useState } from "react";
import { api } from "./api";

const Bar = ({ label, v, max, unit }) => (
  <div><div className="row" style={{ justifyContent: "space-between", margin: 0 }}><span>{label}</span><span className="mute">{Math.round(v * 10) / 10} / {max} {unit}</span></div>
    <div className="bar"><i style={{ width: Math.min(100, (v / max) * 100) + "%" }} /></div></div>
);

const Line = ({ pts, h = 60 }) => {
  if (pts.length < 2) return <div className="mute">Log two or more days to see a trend.</div>;
  const lo = Math.min(...pts), hi = Math.max(...pts), s = hi - lo || 1;
  const d = pts.map((y, i) => `${(i / (pts.length - 1)) * 300},${h - ((y - lo) / s) * (h - 8) - 4}`).join(" ");
  return <svg viewBox={`0 0 300 ${h}`} width="100%" role="img" aria-label="trend"><polyline points={d} fill="none" stroke="var(--go)" strokeWidth="2.5" /></svg>;
};

function Auth({ onDone }) {
  const [email, setEmail] = useState(""), [password, setPw] = useState(""), [reg, setReg] = useState(false), [err, setErr] = useState("");
  const go = async e => { e.preventDefault(); try { const { token } = await api(reg ? "/auth/register" : "/auth/login", "POST", { email, password }); localStorage.setItem("token", token); onDone(); } catch (x) { setErr(x.message); } };
  return <div className="wrap" style={{ maxWidth: 380 }}><div className="card"><h1>{reg ? "Create your account" : "Sign in"}</h1>
    <form onSubmit={go}><div className="row"><input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="row"><input type="password" required minLength={8} placeholder="Password (8+ characters)" value={password} onChange={e => setPw(e.target.value)} /></div>
      {err && <p className="err">{err}</p>}<div className="row"><button>{reg ? "Create account" : "Sign in"}</button><button type="button" className="ghost" onClick={() => setReg(!reg)}>{reg ? "I have an account" : "New here?"}</button></div></form></div></div>;
}

function Dashboard() {
  const [d, setD] = useState(null), [kg, setKg] = useState(""), [sup, setSup] = useState(""), [txt, setTxt] = useState(""), [prop, setProp] = useState(null), [err, setErr] = useState("");
  const load = () => api("/dashboard").then(setD);
  useEffect(() => { load(); }, []);
  if (!d) return <p>Loading…</p>;
  const { targets: t, today: n } = d;
  const water = ml => api("/water", "POST", { ml }).then(load);
  const parse = async () => { setErr(""); try { setProp(await api("/ai/food-analysis", "POST", { text: txt })); } catch (x) { setErr(x.message); } };
  const save = async () => { for (const it of prop.items) await api("/meals", "POST", { ...it, estimated: true }); setProp(null); setTxt(""); load(); };
  const edit = (i, k, v) => setProp({ ...prop, items: prop.items.map((it, j) => j === i ? { ...it, [k]: k === "name" ? v : +v } : it) });
  return <div className="grid">
    <div className="card" style={{ gridColumn: "1/-1" }}><div className="mute">{d.profile.goal} goal · {d.profile.weight_kg} kg → {d.profile.goal_weight_kg} kg</div>
      <div className="big">{Math.max(d.remaining.calories, 0)} kcal left</div><div className="mute">{Math.max(d.remaining.protein, 0)} g protein still to go · targets are estimates{t.overridden ? " (some set by you)" : ""}</div></div>
    <div className="card"><h3>Today</h3><Bar label="Calories" v={n.calories} max={t.calories} unit="kcal" /><Bar label="Protein" v={n.protein} max={t.protein} unit="g" />
      <Bar label="Carbs" v={n.carbs} max={t.carbs} unit="g" /><Bar label="Fat" v={n.fat} max={t.fat} unit="g" /><Bar label="Water" v={n.water_l} max={t.water_l} unit="L" />
      <div className="row"><button onClick={() => water(250)}>+250 ml</button><button onClick={() => water(500)}>+500 ml</button><button onClick={() => water(1000)}>+1 L</button></div></div>
    <div className="card"><h3>Log food with AI</h3><textarea rows={3} style={{ width: "100%" }} placeholder="I ate 3 eggs, 2 rotis and a banana" value={txt} onChange={e => setTxt(e.target.value)} />
      <div className="row"><button disabled={!txt} onClick={parse}>Estimate nutrition</button></div>{err && <p className="err">{err}</p>}
      {prop && <>{prop.clarification && <p>{prop.clarification}</p>}<div className="mute">AI estimates — edit before saving</div>
        {prop.items.map((it, i) => <div className="row" key={i}><input value={it.name} onChange={e => edit(i, "name", e.target.value)} /><input type="number" value={it.calories} onChange={e => edit(i, "calories", e.target.value)} style={{ maxWidth: 90 }} aria-label="kcal" /><input type="number" value={it.protein} onChange={e => edit(i, "protein", e.target.value)} style={{ maxWidth: 80 }} aria-label="protein g" /></div>)}
        <div className="row"><button onClick={save}>Save to today</button></div></>}</div>
    <div className="card"><h3>Weight</h3><Line pts={d.weight.points.map(p => p.kg)} /><div className="mute">7-day average: {d.weight.avg_7 ?? "—"} kg</div>
      <div className="row"><input type="number" step="0.1" placeholder="Today's weight (kg)" value={kg} onChange={e => setKg(e.target.value)} /><button onClick={() => api("/weight", "POST", { weight_kg: +kg }).then(() => { setKg(""); load(); })}>Save weight</button></div></div>
    <div className="card"><h3>Calories, last 14 days</h3><Line pts={d.history.map(h => h.calories)} /></div>
    <div className="card"><h3>Supplements ({d.supplements.filter(s => s.done).length}/{d.supplements.length})</h3>
      {d.supplements.map(s => <label key={s.id} className="row"><input type="checkbox" checked={s.done} onChange={() => api(`/supplements/${s.id}/complete`, "POST").then(load)} /> {s.name} <span className="mute">{s.dosage} {s.time}</span></label>)}
      <div className="row"><input placeholder="Add a supplement" value={sup} onChange={e => setSup(e.target.value)} /><button disabled={!sup} onClick={() => api("/supplements", "POST", { name: sup }).then(() => { setSup(""); load(); })}>Add</button></div></div>
  </div>;
}

function Coach() {
  const [msgs, setMsgs] = useState([]), [q, setQ] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { api("/ai/chat").then(setMsgs); }, []);
  const send = async () => { const text = q; setQ(""); setBusy(true); setMsgs(m => [...m, { role: "user", content: text }]);
    try { const { reply } = await api("/ai/chat", "POST", { text }); setMsgs(m => [...m, { role: "assistant", content: reply }]); } catch (x) { setMsgs(m => [...m, { role: "assistant", content: x.message }]); } setBusy(false); };
  return <div className="card"><h2>AI coach</h2><div className="mute">Answers use your logged data. Not medical advice.</div>
    <div style={{ minHeight: 240 }}>{msgs.map((m, i) => <div key={i} className={"msg " + m.role}>{m.content}</div>)}{busy && <div className="mute">Checking your data…</div>}</div>
    <div className="row"><input placeholder="What should I eat now?" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && q && send()} /><button disabled={!q || busy} onClick={send}>Send</button></div></div>;
}

const FIELDS = [["name", "Name"], ["age", "Age", "number"], ["height_cm", "Height (cm)", "number"], ["weight_kg", "Weight (kg)", "number"], ["goal_weight_kg", "Goal weight (kg)", "number"], ["diet", "Dietary preference"], ["allergies", "Allergies"], ["dislikes", "Foods you dislike"], ["budget", "Food budget"], ["calorie_override", "Calorie target override (optional)", "number"], ["protein_override", "Protein override g (optional)", "number"], ["water_override_l", "Water override L (optional)", "number"]];
function Profile() {
  const [p, setP] = useState(null), [msg, setMsg] = useState("");
  useEffect(() => { api("/profile").then(r => setP(r.profile)); }, []);
  if (!p) return null;
  const save = async () => { try { const r = await api("/profile", "PUT", Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v === "" ? (k.endsWith("override") || k.endsWith("_l") ? null : "") : v]))); setP(r.profile); setMsg(`Saved. Estimated target: ${r.targets.calories} kcal, ${r.targets.protein} g protein.`); } catch (x) { setMsg(x.message); } };
  const sel = (k, opts) => <select value={p[k]} onChange={e => setP({ ...p, [k]: e.target.value })}>{opts.map(o => <option key={o}>{o}</option>)}</select>;
  return <div className="card"><h2>Profile</h2><div className="grid">{FIELDS.map(([k, l, t]) => <label key={k}>{l}<br /><input style={{ width: "100%" }} type={t || "text"} value={p[k] ?? ""} onChange={e => setP({ ...p, [k]: t ? (e.target.value === "" ? "" : +e.target.value) : e.target.value })} /></label>)}
    <label>Sex<br />{sel("sex", ["male", "female"])}</label><label>Activity<br />{sel("activity", ["sedentary", "light", "moderate", "active", "very_active"])}</label><label>Goal<br />{sel("goal", ["lose", "gain", "maintain", "muscle", "fitness"])}</label></div>
    <div className="row"><button onClick={save}>Save profile</button><span className="mute">{msg}</span></div></div>;
}

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token")), [tab, setTab] = useState("Dashboard");
  if (!authed) return <Auth onDone={() => setAuthed(true)} />;
  const V = { Dashboard, "AI coach": Coach, Profile }[tab];
  return <div className="wrap"><div className="nav">{["Dashboard", "AI coach", "Profile"].map(t => <button key={t} className={t === tab ? "on" : "ghost"} onClick={() => setTab(t)}>{t}</button>)}
    <button className="ghost" style={{ marginLeft: "auto" }} onClick={() => { localStorage.removeItem("token"); setAuthed(false); }}>Log out</button></div><V /></div>;
}
