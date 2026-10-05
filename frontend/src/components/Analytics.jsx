import { useEffect, useState } from "react";
import { getProgressAnalytics } from "../api";

function Analytics() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const result =
                    await getProgressAnalytics();

                setData(result);
            } catch (err) {
                setError(err.message);
            }
        }

        load();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!data) {
        return <p>Loading analytics...</p>;
    }

    return (
        <div>
            <h2>Progress Analytics</h2>

            <h3>Weight</h3>

            <p>
                Current:{" "}
                {data.weight?.current ?? 0} kg
            </p>

            <p>
                Change:{" "}
                {data.weight?.change ?? 0} kg
            </p>

            <h3>Nutrition</h3>

            <p>
                Average Calories:{" "}
                {data.nutrition?.average_calories ?? 0}
            </p>

            <p>
                Average Protein:{" "}
                {data.nutrition?.average_protein ?? 0} g
            </p>

            <h3>Activity</h3>

            <p>
                Total Steps:{" "}
                {data.activity?.total_steps ?? 0}
            </p>

            <p>
                Calories Burned:{" "}
                {data.activity?.calories_burned ?? 0}
            </p>

            <h3>Workouts</h3>

            <p>
                Workouts:{" "}
                {data.workouts_count ?? 0}
            </p>

            <h3>Water</h3>

            <p>
                Total Water:{" "}
                {data.water?.total_ml ?? 0} ml
            </p>

            <h3>Sleep</h3>

            <p>
                Average Sleep:{" "}
                {data.sleep?.average_hours ?? 0} hours
            </p>
        </div>
    );
}

export default Analytics;