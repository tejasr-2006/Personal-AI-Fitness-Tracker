import { useState } from "react";
import { api } from "../api";
import { Button, Field, SelectField, ErrorBanner } from "./ui";
import { num } from "../lib/format";

const NUMERIC = ["age", "height", "weight", "goal_weight", "budget"];
const TEXT = ["dietary_preferences", "food_preferences", "food_dislikes", "allergies", "equipment", "workout_location", "wake_time", "sleep_time"];

const DEFAULTS = {
    age: "", gender: "male", height: "", weight: "", goal_weight: "",
    activity_level: "moderate", fitness_level: "beginner", goal: "maintain",
    dietary_preferences: "", food_preferences: "", food_dislikes: "", allergies: "",
    equipment: "", workout_location: "", budget: "", wake_time: "", sleep_time: "",
};

const ACTIVITY = [["sedentary", "Sedentary (desk job)"], ["light", "Light (1–3 days/week)"], ["moderate", "Moderate (3–5 days/week)"], ["active", "Active (6–7 days/week)"], ["very_active", "Very active (physical job)"]];
const GOALS = [["lose", "Lose weight"], ["maintain", "Maintain weight"], ["gain", "Gain weight"], ["muscle", "Build muscle"], ["fitness", "General fitness"]];

/** Used for first-time setup AND for editing an existing profile. */
export default function ProfileForm({ initial, submitLabel, onSaved }) {
    const [form, setForm] = useState(() => {
        const f = { ...DEFAULTS };
        if (initial) Object.keys(DEFAULTS).forEach((k) => { if (initial[k] != null) f[k] = String(initial[k]); });
        return f;
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    async function submit(e) {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const data = {};
            NUMERIC.forEach((k) => { data[k] = num(form[k]); });
            TEXT.forEach((k) => { data[k] = form[k].trim() || null; });
            ["gender", "activity_level", "fitness_level", "goal"].forEach((k) => { data[k] = form[k]; });
            await api.profile.save(data);
            await api.goals.calculate(); // targets always follow the latest profile
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="form-grid">
            <Field label="Age" type="number" min="10" max="120" value={form.age} onChange={set("age")} required />
            <SelectField label="Gender" value={form.gender} onChange={set("gender")} options={[["male", "Male"], ["female", "Female"], ["other", "Other"]]} />
            <Field label="Height (cm)" type="number" min="50" max="271" step="0.1" value={form.height} onChange={set("height")} required />
            <Field label="Current weight (kg)" type="number" min="20" max="499" step="0.1" value={form.weight} onChange={set("weight")} required />
            <Field label="Goal weight (kg)" type="number" min="20" max="499" step="0.1" value={form.goal_weight} onChange={set("goal_weight")} />
            <SelectField label="Primary goal" value={form.goal} onChange={set("goal")} options={GOALS} />
            <SelectField label="Activity level" value={form.activity_level} onChange={set("activity_level")} options={ACTIVITY} />
            <SelectField label="Fitness level" value={form.fitness_level} onChange={set("fitness_level")} options={["beginner", "intermediate", "advanced"]} />
            <Field label="Dietary preferences" value={form.dietary_preferences} onChange={set("dietary_preferences")} placeholder="e.g. vegetarian" />
            <Field label="Allergies" value={form.allergies} onChange={set("allergies")} />
            <Field label="Food preferences" value={form.food_preferences} onChange={set("food_preferences")} />
            <Field label="Food dislikes" value={form.food_dislikes} onChange={set("food_dislikes")} />
            <Field label="Equipment" value={form.equipment} onChange={set("equipment")} placeholder="e.g. dumbbells" />
            <Field label="Workout location" value={form.workout_location} onChange={set("workout_location")} placeholder="e.g. home / gym" />
            <Field label="Wake time" type="time" value={form.wake_time} onChange={set("wake_time")} />
            <Field label="Sleep time" type="time" value={form.sleep_time} onChange={set("sleep_time")} />
            <Field label="Weekly food budget" type="number" min="0" value={form.budget} onChange={set("budget")} />
            <div className="full"><ErrorBanner message={error} /></div>
            <div className="full"><Button loading={loading}>{submitLabel}</Button></div>
        </form>
    );
}
