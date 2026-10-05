import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { localDate, num, round, titleCase } from "../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, PageIntro, SelectField, Stat, TextArea, useAction, useToast } from "../components/ui";

const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"];
const BLANK = { meal_type: "breakfast", food_name: "", quantity: "1", unit: "serving", calories: "", protein: "", carbohydrates: "", fat: "", fiber: "" };

function guessMealType() {
    const h = new Date().getHours();
    return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 18 ? "snack" : "dinner";
}

export default function NutritionPage() {
    const toast = useToast();
    const [date, setDate] = useState(localDate());
    const [meals, setMeals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [water, setWater] = useState(null);
    const [meal, setMeal] = useState({ ...BLANK, meal_type: guessMealType() });
    const [foodText, setFoodText] = useState("");
    const [foodType, setFoodType] = useState(guessMealType());
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const ai = useAction();
    const manual = useAction();

    const load = useCallback(() => (
        Promise.all([api.meals.list(date), api.nutrition.daily(date), api.water.daily(date)])
            .then(([m, s, w]) => { setMeals(m || []); setSummary(s); setWater(w?.total_water ?? 0); setError(""); })
            .catch((e) => setError(e.message))
    ), [date]);

    useEffect(() => { setPreview(null); load(); }, [load]);

    async function add(e) {
        e.preventDefault();
        const ok = await manual.run(async () => {
            await api.meals.add({
                date, meal_type: meal.meal_type, food_name: meal.food_name.trim(), unit: meal.unit.trim() || null,
                quantity: num(meal.quantity), calories: num(meal.calories),
                protein: num(meal.protein) ?? 0, carbohydrates: num(meal.carbohydrates) ?? 0, fat: num(meal.fat) ?? 0, fiber: num(meal.fiber) ?? 0,
            });
            return true;
        });
        if (ok) {
            setMeal({ ...meal, food_name: "", calories: "", protein: "", carbohydrates: "", fat: "", fiber: "" });
            toast("Meal added");
            load();
        }
    }

    async function aiLog() {
        const result = await ai.run(() => api.ai.foodLog(foodText.trim(), foodType, date));
        if (result) { setPreview(result); setFoodText(""); toast(`Logged ${result.items.length} item(s)`); load(); }
    }

    async function remove(id) {
        try { await api.meals.remove(id); toast("Meal removed"); load(); }
        catch (e) { setError(e.message); }
    }

    async function addWater(amount) {
        try { await api.water.add({ date, amount }); toast(`+${amount} ml water`); load(); }
        catch (e) { setError(e.message); }
    }

    const totals = meals.reduce((a, m) => ({ cal: a.cal + (m.calories || 0), p: a.p + (m.protein || 0) }), { cal: 0, p: 0 });
    const setM = (k) => (e) => setMeal({ ...meal, [k]: e.target.value });

    return <>
        <PageIntro title="Nutrition" text="Log meals and compare your intake with your calculated targets."
            right={<input className="date-input" type="date" aria-label="Date" max={localDate()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />} />
        <ErrorBanner message={error} onClose={() => setError("")} />

        <div className="stats-grid">
            <Stat label="Calories" value={summary?.calories_consumed} target={summary?.calories_target} unit=" kcal" />
            <Stat label="Protein" value={summary?.protein_consumed} target={summary?.protein_target} unit=" g" />
            <Stat label="Carbs / Fat" value={summary ? `${round(summary.carbohydrates)} / ${round(summary.fat)}` : null} unit=" g" />
            <Stat label="Water" value={water} unit=" ml" />
        </div>

        <div className="two-col" style={{ marginTop: 18 }}>
            <Card>
                <div className="card-head"><h3>AI food logger</h3><span className="badge">AI</span></div>
                <p className="muted">Describe what you ate in plain language — we'll estimate the nutrition and save each item.</p>
                <TextArea label="What did you eat?" value={foodText} onChange={(e) => setFoodText(e.target.value)} placeholder="2 eggs, 2 slices of toast and a banana" />
                <div className="inline-form">
                    <SelectField label="Meal type" value={foodType} onChange={(e) => setFoodType(e.target.value)} options={MEAL_TYPES} />
                    <Button onClick={aiLog} loading={ai.loading} disabled={!foodText.trim()}>Analyze & log</Button>
                </div>
                <div style={{ marginTop: 12 }}><ErrorBanner message={ai.error} onClose={() => ai.setError("")} /></div>
                {preview && <div className="preview"><strong>Saved {preview.items.length} item(s) to {titleCase(preview.meal_type)}</strong>
                    {preview.items.map((x, i) => <div key={i}>{x.food_name} · {round(x.calories)} kcal · {round(x.protein)} g protein</div>)}</div>}
                <div className="chips" style={{ marginTop: 16 }}><span className="muted" style={{ fontSize: ".78rem", alignSelf: "center" }}>Water:</span>
                    {[250, 500].map((ml) => <button key={ml} className="chip" onClick={() => addWater(ml)}>+{ml} ml</button>)}</div>
            </Card>

            <Card>
                <h3>Add meal manually</h3>
                <form onSubmit={add} className="form-grid compact">
                    <SelectField label="Meal type" value={meal.meal_type} onChange={setM("meal_type")} options={MEAL_TYPES} />
                    <Field label="Food" value={meal.food_name} onChange={setM("food_name")} required />
                    <Field label="Quantity" type="number" min="0" step="0.1" value={meal.quantity} onChange={setM("quantity")} />
                    <Field label="Unit" value={meal.unit} onChange={setM("unit")} />
                    <Field label="Calories" type="number" min="0" value={meal.calories} onChange={setM("calories")} required />
                    <Field label="Protein (g)" type="number" min="0" step="0.1" value={meal.protein} onChange={setM("protein")} />
                    <Field label="Carbs (g)" type="number" min="0" step="0.1" value={meal.carbohydrates} onChange={setM("carbohydrates")} />
                    <Field label="Fat (g)" type="number" min="0" step="0.1" value={meal.fat} onChange={setM("fat")} />
                    <div className="full"><ErrorBanner message={manual.error} /><Button loading={manual.loading}>Add meal</Button></div>
                </form>
            </Card>
        </div>

        <Card>
            <div className="card-head"><h3>Meals for {date}</h3><span className="muted">{meals.length} entries</span></div>
            {meals.length ? (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Meal</th><th>Food</th><th>Qty</th><th className="num">Calories</th><th className="num">Protein</th><th /></tr></thead>
                        <tbody>{meals.map((m) => (
                            <tr key={m.id}>
                                <td>{titleCase(m.meal_type)}</td><td>{m.food_name}</td>
                                <td>{m.quantity != null ? `${round(m.quantity, 1)} ${m.unit || ""}` : "—"}</td>
                                <td className="num">{round(m.calories)}</td><td className="num">{round(m.protein, 1)} g</td>
                                <td><button className="danger-link" onClick={() => remove(m.id)} aria-label={`Delete ${m.food_name}`}>Delete</button></td>
                            </tr>
                        ))}</tbody>
                        <tfoot><tr><td colSpan={3}>Total</td><td className="num">{round(totals.cal)}</td><td className="num">{round(totals.p, 1)} g</td><td /></tr></tfoot>
                    </table>
                </div>
            ) : <EmptyState title="No meals logged for this day." />}
        </Card>
    </>;
}
