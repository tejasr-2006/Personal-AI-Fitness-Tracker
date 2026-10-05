import { useEffect, useState } from "react";
import {
    addMeal,
    addWater,
    getDailyNutrition,
    getDailyWater,
} from "../api";

function DailyTracking() {
    const [nutrition, setNutrition] = useState(null);
    const [water, setWater] = useState(0);

    const [meal, setMeal] = useState({
        meal_type: "breakfast",
        food_name: "",
        quantity: 1,
        unit: "piece",
        calories: "",
        protein: "",
        carbohydrates: "",
        fat: "",
        fiber: "",
    });

    const [waterAmount, setWaterAmount] = useState(250);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    async function loadData() {
        try {
            const nutritionData = await getDailyNutrition(today);
            const waterData = await getDailyWater();

            setNutrition(nutritionData);

            if (Array.isArray(waterData)) {
                setWater(
                    waterData.reduce(
                        (total, item) => total + Number(item.amount || 0),
                        0
                    )
                );
            } else {
                setWater(Number(waterData.total || 0));
            }
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleMealSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            await addMeal({
                ...meal,
                quantity: Number(meal.quantity),
                calories: Number(meal.calories),
                protein: Number(meal.protein),
                carbohydrates: Number(meal.carbohydrates),
                fat: Number(meal.fat),
                fiber: Number(meal.fiber),
            });

            setMeal({
                meal_type: "breakfast",
                food_name: "",
                quantity: 1,
                unit: "piece",
                calories: "",
                protein: "",
                carbohydrates: "",
                fat: "",
                fiber: "",
            });

            loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleWater() {
        try {
            await addWater(Number(waterAmount));
            loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Daily Tracking</h1>

            {error && <p>{error}</p>}

            <hr />

            <h2>Nutrition</h2>

            {nutrition && (
                <div>
                    <p>
                        Calories: {nutrition.calories_consumed || 0}
                    </p>

                    <p>
                        Protein: {nutrition.protein || 0} g
                    </p>

                    <p>
                        Carbs: {nutrition.carbohydrates || 0} g
                    </p>

                    <p>
                        Fat: {nutrition.fat || 0} g
                    </p>
                </div>
            )}

            <hr />

            <h2>Add Food</h2>

            <form onSubmit={handleMealSubmit}>
                <select
                    value={meal.meal_type}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            meal_type: e.target.value,
                        })
                    }
                >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                    <option value="dinner">Dinner</option>
                </select>

                <br />

                <input
                    placeholder="Food name"
                    value={meal.food_name}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            food_name: e.target.value,
                        })
                    }
                    required
                />

                <br />

                <input
                    type="number"
                    placeholder="Quantity"
                    value={meal.quantity}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            quantity: e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Unit"
                    value={meal.unit}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            unit: e.target.value,
                        })
                    }
                />

                <br />

                <input
                    type="number"
                    placeholder="Calories"
                    value={meal.calories}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            calories: e.target.value,
                        })
                    }
                    required
                />

                <input
                    type="number"
                    placeholder="Protein"
                    value={meal.protein}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            protein: e.target.value,
                        })
                    }
                    required
                />

                <br />

                <input
                    type="number"
                    placeholder="Carbs"
                    value={meal.carbohydrates}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            carbohydrates: e.target.value,
                        })
                    }
                    required
                />

                <input
                    type="number"
                    placeholder="Fat"
                    value={meal.fat}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            fat: e.target.value,
                        })
                    }
                    required
                />

                <br />

                <input
                    type="number"
                    placeholder="Fiber"
                    value={meal.fiber}
                    onChange={(e) =>
                        setMeal({
                            ...meal,
                            fiber: e.target.value,
                        })
                    }
                />

                <br />

                <button type="submit">
                    Add Food
                </button>
            </form>

            <hr />

            <h2>Water</h2>

            <p>
                Today: {water} ml
            </p>

            <input
                type="number"
                value={waterAmount}
                onChange={(e) =>
                    setWaterAmount(e.target.value)
                }
            />

            <button onClick={handleWater}>
                Add Water
            </button>
        </div>
    );
}

export default DailyTracking;