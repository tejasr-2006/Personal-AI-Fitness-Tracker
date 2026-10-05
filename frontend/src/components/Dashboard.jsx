import { useEffect, useState } from "react";
import { getDashboard } from "../api";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        getDashboard(token)
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                    return;
                }

                setDashboard(data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return (
            <div>
                <h2>Dashboard Setup Required</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!dashboard) {
        return <p>No dashboard data available.</p>;
    }

    return (
        <div>
            <h1>Fitness Dashboard</h1>

            <h2>
                Welcome, {dashboard.profile.name}
            </h2>

            <hr />

            <h3>Today's Nutrition</h3>

            <p>
                Calories: {dashboard.nutrition.calories_consumed}
                {" / "}
                {dashboard.targets.calories}
            </p>

            <p>
                Protein: {dashboard.nutrition.protein_consumed}
                {" / "}
                {dashboard.targets.protein} g
            </p>

            <h3>Water</h3>

            <p>
                {dashboard.water.consumed_ml}
                {" / "}
                {dashboard.water.target_ml} ml
            </p>

            <h3>Activity</h3>

            <p>
                Steps: {dashboard.activity.steps}
            </p>

            <p>
                Calories Burned: {dashboard.activity.calories_burned}
            </p>

            <h3>Sleep</h3>

            <p>
                Duration:{" "}
                {dashboard.sleep.duration_hours ?? "Not logged"} hours
            </p>

            <h3>Workout</h3>

            <p>
                Workouts today: {dashboard.workouts.count}
            </p>

            <h3>Weight</h3>

            <p>
                Current Weight: {dashboard.weight.current} kg
            </p>
        </div>
    );
}

export default Dashboard;