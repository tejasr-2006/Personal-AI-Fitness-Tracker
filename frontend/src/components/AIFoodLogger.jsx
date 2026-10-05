import { useState } from "react";
import { aiFoodLog } from "../api";

function AIFoodLogger() {
    const [text, setText] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const result = await aiFoodLog(text);

            setItems(result.items || []);
            setText("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h2>AI Food Logger</h2>

            <p>
                Tell the AI what you ate.
            </p>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Example: 2 eggs and 1 banana"
                    value={text}
                    onChange={(e) =>
                        setText(e.target.value)
                    }
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing..."
                        : "Analyze Food"}
                </button>
            </form>

            {error && <p>{error}</p>}

            {items.length > 0 && (
                <div>
                    <h3>AI Result</h3>

                    {items.map((item, index) => (
                        <div key={index}>
                            <p>
                                <strong>
                                    {item.food_name}
                                </strong>
                            </p>

                            <p>
                                Quantity: {item.quantity}{" "}
                                {item.unit}
                            </p>

                            <p>
                                Calories: {item.calories}
                            </p>

                            <p>
                                Protein: {item.protein} g
                            </p>

                            <p>
                                Carbs:{" "}
                                {item.carbohydrates} g
                            </p>

                            <p>
                                Fat: {item.fat} g
                            </p>

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AIFoodLogger;