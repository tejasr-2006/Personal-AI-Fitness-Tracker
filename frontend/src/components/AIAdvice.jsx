import { useEffect, useState } from "react";
import {
    getDietAdvice,
    getTrainerAdvice,
    generateRecommendations,
    getRecommendations,
} from "../api";

function AIAdvice() {
    const [diet, setDiet] = useState(null);
    const [trainer, setTrainer] = useState(null);
    const [recommendations, setRecommendations] =
        useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadAdvice() {
        try {
            const [
                dietData,
                trainerData,
                recommendationData,
            ] = await Promise.all([
                getDietAdvice(),
                getTrainerAdvice(),
                getRecommendations(),
            ]);

            setDiet(dietData);
            setTrainer(trainerData);
            setRecommendations(
                recommendationData
            );
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadAdvice();
    }, []);

    async function handleGenerate() {
        setLoading(true);

        try {
            await generateRecommendations();
            await loadAdvice();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>AI Dietitian</h2>

            {diet && (
                <div>
                    <p>
                        {diet.summary}
                    </p>

                    <p>
                        Calories:{" "}
                        {diet.calorie_advice}
                    </p>

                    <p>
                        Protein:{" "}
                        {diet.protein_advice}
                    </p>

                    <p>
                        Meal suggestion:{" "}
                        {diet.meal_suggestion}
                    </p>

                    <p>
                        Tips: {diet.tips}
                    </p>
                </div>
            )}

            <hr />

            <h2>AI Trainer</h2>

            {trainer && (
                <div>
                    <p>
                        {trainer.summary}
                    </p>

                    <p>
                        Workout:{" "}
                        {trainer.workout_advice}
                    </p>

                    <p>
                        Recovery:{" "}
                        {trainer.recovery_advice}
                    </p>

                    <p>
                        Next workout:{" "}
                        {trainer.next_workout}
                    </p>

                    <p>
                        Progress:{" "}
                        {trainer.progress_advice}
                    </p>
                </div>
            )}

            <hr />

            <h2>AI Recommendations</h2>

            <button
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading
                    ? "Generating..."
                    : "Generate Recommendations"}
            </button>

            {recommendations.map(
                (item) => (
                    <div key={item.id}>
                        <strong>
                            {item.category}
                        </strong>

                        <p>
                            {item.recommendation}
                        </p>

                        <small>
                            Priority:{" "}
                            {item.priority}
                        </small>

                        <hr />
                    </div>
                )
            )}

            {error && <p>{error}</p>}
        </div>
    );
}

export default AIAdvice;