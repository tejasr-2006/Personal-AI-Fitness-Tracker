import { useEffect, useState } from "react";
import { getDailyBriefing } from "../api";

function AIBriefing() {
    const [briefing, setBriefing] = useState(null);
    const [error, setError] = useState("");

    async function loadBriefing() {
        try {
            const data = await getDailyBriefing();
            setBriefing(data);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadBriefing();
    }, []);

    return (
        <div>
            <h2>AI Daily Briefing</h2>

            {error && <p>{error}</p>}

            {briefing && (
                <div>
                    <h3>{briefing.summary}</h3>

                    <p>
                        <strong>
                            Nutrition:
                        </strong>{" "}
                        {briefing.nutrition_status}
                    </p>

                    <p>
                        <strong>
                            Activity:
                        </strong>{" "}
                        {briefing.activity_status}
                    </p>

                    <p>
                        <strong>
                            Sleep:
                        </strong>{" "}
                        {briefing.sleep_status}
                    </p>

                    <p>
                        <strong>
                            Workout:
                        </strong>{" "}
                        {briefing.workout_status}
                    </p>

                    <h3>Priority</h3>

                    <p>
                        {briefing.priority}
                    </p>

                    <h3>Recommendations</h3>

                    {briefing.recommendations?.map(
                        (item, index) => (
                            <p key={index}>
                                • {item}
                            </p>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default AIBriefing;