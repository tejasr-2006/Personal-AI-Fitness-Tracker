import { useState } from "react";
import { createProfile } from "../api";

function ProfileSetup({ onComplete }) {
    const [form, setForm] = useState({
        age: "",
        gender: "",
        height: "",
        weight: "",
        goal_weight: "",
        activity_level: "",
        fitness_level: "",
        goal: "",
        dietary_preferences: "",
        food_preferences: "",
        food_dislikes: "",
        allergies: "",
        equipment: "",
        workout_location: "",
        budget: "",
        wake_time: "",
        sleep_time: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = {
                ...form,
                age: form.age ? Number(form.age) : null,
                height: form.height ? Number(form.height) : null,
                weight: form.weight ? Number(form.weight) : null,
                goal_weight: form.goal_weight
                    ? Number(form.goal_weight)
                    : null,
                budget: form.budget ? Number(form.budget) : null,
            };

            await createProfile(data);

            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Profile Setup</h1>

            <p>Tell us about yourself to personalize your fitness plan.</p>

            <form onSubmit={handleSubmit}>

                <h2>Basic Information</h2>

                <input
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>

                <br /><br />

                <input
                    name="height"
                    type="number"
                    step="0.1"
                    placeholder="Height (cm)"
                    value={form.height}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="Current Weight (kg)"
                    value={form.weight}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="goal_weight"
                    type="number"
                    step="0.1"
                    placeholder="Goal Weight (kg)"
                    value={form.goal_weight}
                    onChange={handleChange}
                />

                <h2>Fitness</h2>

                <select
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                >
                    <option value="">Activity Level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extra_active">Extra Active</option>
                </select>

                <br /><br />

                <select
                    name="fitness_level"
                    value={form.fitness_level}
                    onChange={handleChange}
                >
                    <option value="">Fitness Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>

                <br /><br />

                <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                >
                    <option value="">Fitness Goal</option>
                    <option value="gain">Weight Gain</option>
                    <option value="lose">Weight Loss</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="muscle">Build Muscle</option>
                    <option value="fitness">General Fitness</option>
                </select>

                <h2>Diet</h2>

                <input
                    name="dietary_preferences"
                    placeholder="Dietary Preference (e.g. Eggitarian)"
                    value={form.dietary_preferences}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="food_preferences"
                    placeholder="Foods you like"
                    value={form.food_preferences}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="food_dislikes"
                    placeholder="Foods you dislike"
                    value={form.food_dislikes}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="allergies"
                    placeholder="Allergies"
                    value={form.allergies}
                    onChange={handleChange}
                />

                <h2>Workout</h2>

                <input
                    name="equipment"
                    placeholder="Available equipment"
                    value={form.equipment}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="workout_location"
                    placeholder="Workout location"
                    value={form.workout_location}
                    onChange={handleChange}
                />

                <br /><br />

                <h2>Lifestyle</h2>

                <input
                    name="budget"
                    type="number"
                    step="0.01"
                    placeholder="Daily food budget"
                    value={form.budget}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Wake Time</label>
                <br />

                <input
                    name="wake_time"
                    type="time"
                    value={form.wake_time}
                    onChange={handleChange}
                />

                <br /><br />

                <label>Sleep Time</label>
                <br />

                <input
                    name="sleep_time"
                    type="time"
                    value={form.sleep_time}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Profile"}
                </button>

            </form>

            {error && <p>{error}</p>}
        </div>
    );
}

export default ProfileSetup;