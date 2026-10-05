import { useState } from "react";
import { calculateGoals } from "../api";

function GoalSetup({ onComplete }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCalculate() {
        setLoading(true);
        setError("");

        try {
            const result = await calculateGoals();

            console.log("Calculated goals:", result);

            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Calculate Your Fitness Goals</h1>

            <p>
                We'll calculate your estimated daily calories,
                protein, carbs, fat and water requirements.
            </p>

            <button onClick={handleCalculate} disabled={loading}>
                {loading ? "Calculating..." : "Calculate My Goals"}
            </button>

            {error && <p>{error}</p>}
        </div>
    );
}

export default GoalSetup;