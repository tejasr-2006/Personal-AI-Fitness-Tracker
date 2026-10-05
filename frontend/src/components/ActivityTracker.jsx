import { useEffect, useState } from "react";
import {
    addActivity,
    getDailyActivities,
} from "../api";

function ActivityTracker() {
    const [activity, setActivity] = useState({
        activity_type: "walking",
        duration_minutes: 30,
        calories_burned: 0,
        steps: 0,
        notes: "",
    });

    const [dailyActivity, setDailyActivity] = useState(null);
    const [error, setError] = useState("");

    async function loadActivity() {
        try {
            const data = await getDailyActivities();
            setDailyActivity(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadActivity();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            await addActivity({
                ...activity,
                duration_minutes: Number(
                    activity.duration_minutes
                ),
                calories_burned: Number(
                    activity.calories_burned
                ),
                steps: Number(activity.steps),
            });

            setActivity({
                activity_type: "walking",
                duration_minutes: 30,
                calories_burned: 0,
                steps: 0,
                notes: "",
            });

            loadActivity();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Activity Tracker</h1>

            {error && <p>{error}</p>}

            <h2>Today's Activity</h2>

            {dailyActivity && (
                <div>
                    <p>
                        Steps: {dailyActivity.steps || 0}
                    </p>

                    <p>
                        Calories Burned:{" "}
                        {dailyActivity.calories_burned || 0}
                    </p>

                    <p>
                        Duration:{" "}
                        {dailyActivity.duration_minutes || 0} min
                    </p>
                </div>
            )}

            <h2>Add Activity</h2>

            <form onSubmit={handleSubmit}>
                <select
                    value={activity.activity_type}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            activity_type: e.target.value,
                        })
                    }
                >
                    <option value="walking">Walking</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                </select>

                <br />

                <input
                    type="number"
                    placeholder="Duration"
                    value={activity.duration_minutes}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            duration_minutes: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Calories burned"
                    value={activity.calories_burned}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            calories_burned: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Steps"
                    value={activity.steps}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            steps: e.target.value,
                        })
                    }
                />

                <br />

                <input
                    placeholder="Notes"
                    value={activity.notes}
                    onChange={(e) =>
                        setActivity({
                            ...activity,
                            notes: e.target.value,
                        })
                    }
                />

                <br />

                <button type="submit">
                    Add Activity
                </button>
            </form>
        </div>
    );
}

export default ActivityTracker;