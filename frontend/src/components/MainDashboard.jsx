import { useEffect, useState } from "react";
import {
    getDashboardData,
    getWeight,
    getDailyBriefing,
} from "../api";
import ProgressChart from "./ProgressChart";

function MainDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [weightHistory, setWeightHistory] = useState([]);
    const [briefing, setBriefing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [
                    dashboardData,
                    weightData,
                    briefingData,
                ] = await Promise.all([
                    getDashboardData(),
                    getWeight(),
                    getDailyBriefing(),
                ]);

                if (dashboardData.error) {
                    throw new Error(dashboardData.error);
                }

                setDashboard(dashboardData);

                setWeightHistory(
                    Array.isArray(weightData)
                        ? weightData
                        : weightData?.items || []
                );

                setBriefing(briefingData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl font-semibold">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow">
                    <h2 className="text-xl font-bold text-red-600">
                        Dashboard Error
                    </h2>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return <p>No dashboard data available.</p>;
    }

    const nutrition = dashboard.nutrition || {};
    const goal = dashboard.goal || {};
    const profile = dashboard.profile || {};

    const caloriesConsumed =
        nutrition.calories_consumed ??
        nutrition.calories ??
        0;

    const proteinConsumed =
        nutrition.protein_consumed ??
        nutrition.protein ??
        0;

    const calorieTarget =
        goal.target_calories ??
        goal.calories ??
        0;

    const proteinTarget = goal.protein ?? 0;

    const water = dashboard.water ?? 0;
    const steps = dashboard.steps ?? 0;
    const caloriesBurned =
        dashboard.calories_burned ?? 0;

    const sleepHours =
        dashboard.sleep?.duration_hours ??
        dashboard.sleep?.hours ??
        0;

    const workouts = Array.isArray(dashboard.workouts)
        ? dashboard.workouts.length
        : dashboard.workouts ?? 0;

    const latestWeight =
        dashboard.latest_weight ??
        profile.weight ??
        0;

    const calorieProgress =
        calorieTarget > 0
            ? Math.min(
                  (caloriesConsumed / calorieTarget) * 100,
                  100
              )
            : 0;

    const proteinProgress =
        proteinTarget > 0
            ? Math.min(
                  (proteinConsumed / proteinTarget) * 100,
                  100
              )
            : 0;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* HEADER */}

            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Personal AI Fitness
                        </h1>

                        <p className="text-gray-500">
                            Welcome,{" "}
                            {profile.name || "User"}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">
                            Current Weight
                        </p>

                        <p className="text-2xl font-bold">
                            {latestWeight} kg
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* AI BRIEFING */}

                {briefing && (
                    <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                🤖 AI Daily Briefing
                            </h2>

                            {briefing.priority && (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                                    {briefing.priority}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600">
                            {briefing.summary ||
                                "Your AI briefing is ready."}
                        </p>

                        {Array.isArray(
                            briefing.recommendations
                        ) && (
                            <div className="mt-5">
                                <h3 className="font-semibold mb-2">
                                    Today's Recommendations
                                </h3>

                                <ul className="space-y-2">
                                    {briefing.recommendations.map(
                                        (item, index) => (
                                            <li
                                                key={index}
                                                className="bg-gray-50 rounded-lg p-3"
                                            >
                                                {typeof item ===
                                                "string"
                                                    ? item
                                                    : item.recommendation ||
                                                      item.message}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                    </section>
                )}

                {/* STATS */}

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <StatCard
                        title="Calories"
                        value={`${caloriesConsumed} kcal`}
                        subtitle={`Target: ${calorieTarget} kcal`}
                    />

                    <StatCard
                        title="Protein"
                        value={`${proteinConsumed} g`}
                        subtitle={`Target: ${proteinTarget} g`}
                    />

                    <StatCard
                        title="Water"
                        value={`${water} ml`}
                        subtitle="Today's intake"
                    />

                    <StatCard
                        title="Steps"
                        value={steps}
                        subtitle="Today's activity"
                    />

                    <StatCard
                        title="Calories Burned"
                        value={`${caloriesBurned} kcal`}
                        subtitle="Activity"
                    />

                    <StatCard
                        title="Workouts"
                        value={workouts}
                        subtitle="Today"
                    />

                    <StatCard
                        title="Sleep"
                        value={`${sleepHours} hrs`}
                        subtitle="Last recorded"
                    />

                    <StatCard
                        title="Weight"
                        value={`${latestWeight} kg`}
                        subtitle="Current"
                    />

                </section>

                {/* PROGRESS */}

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    <ProgressCard
                        title="Daily Calories"
                        current={caloriesConsumed}
                        target={calorieTarget}
                        progress={calorieProgress}
                        unit="kcal"
                    />

                    <ProgressCard
                        title="Daily Protein"
                        current={proteinConsumed}
                        target={proteinTarget}
                        progress={proteinProgress}
                        unit="g"
                    />

                </section>

                {/* WEIGHT CHART */}

                <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold mb-5">
                        Weight Progress
                    </h2>

                    {weightHistory.length > 0 ? (
                        <ProgressChart
                            data={weightHistory}
                        />
                    ) : (
                        <p className="text-gray-500">
                            No weight history available yet.
                        </p>
                    )}
                </section>

                {/* GOAL */}

                <section className="bg-white rounded-2xl shadow-sm p-6">

                    <h2 className="text-xl font-bold mb-4">
                        🎯 Fitness Goal
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                            <p className="text-gray-500 text-sm">
                                Goal
                            </p>

                            <p className="font-semibold text-lg">
                                {goal.goal_type ||
                                    "Not specified"}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-sm">
                                Daily Calories
                            </p>

                            <p className="font-semibold text-lg">
                                {calorieTarget} kcal
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500 text-sm">
                                Daily Protein
                            </p>

                            <p className="font-semibold text-lg">
                                {proteinTarget} g
                            </p>
                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
}

function StatCard({ title, value, subtitle }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-500 text-sm">
                {title}
            </p>

            <p className="text-2xl font-bold mt-2">
                {value}
            </p>

            <p className="text-sm text-gray-400 mt-1">
                {subtitle}
            </p>
        </div>
    );
}

function ProgressCard({
    title,
    current,
    target,
    progress,
    unit,
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">

            <div className="flex justify-between mb-3">
                <h3 className="font-semibold">
                    {title}
                </h3>

                <span className="text-sm text-gray-500">
                    {current} / {target} {unit}
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className="bg-black h-3 rounded-full transition-all"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>

            <p className="text-sm text-gray-500 mt-2">
                {Math.round(progress)}% completed
            </p>

        </div>
    );
}

export default MainDashboard;