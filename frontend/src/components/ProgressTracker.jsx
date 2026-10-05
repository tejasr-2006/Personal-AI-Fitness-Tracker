import { useEffect, useState } from "react";
import {
    addSleep,
    getSleep,
    addWeight,
    getWeight,
    addMeasurements,
    getMeasurements,
} from "../api";

function ProgressTracker() {
    const [weight, setWeight] = useState("");
    const [weightHistory, setWeightHistory] = useState([]);

    const [sleep, setSleep] = useState({
        duration_hours: 8,
        sleep_quality: 5,
        bedtime: "",
        wake_time: "",
        notes: "",
    });

    const [measurements, setMeasurements] = useState({
        waist: "",
        chest: "",
        hips: "",
        neck: "",
        left_arm: "",
        right_arm: "",
        left_thigh: "",
        right_thigh: "",
    });

    const [measurementHistory, setMeasurementHistory] = useState([]);
    const [sleepHistory, setSleepHistory] = useState([]);

    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [weights, sleeps, measurementsData] =
                await Promise.all([
                    getWeight(),
                    getSleep(),
                    getMeasurements(),
                ]);

            setWeightHistory(weights);
            setSleepHistory(sleeps);
            setMeasurementHistory(measurementsData);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleWeight(e) {
        e.preventDefault();

        try {
            await addWeight(weight);
            setWeight("");
            loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSleep(e) {
        e.preventDefault();

        try {
            await addSleep({
                ...sleep,
                duration_hours: Number(sleep.duration_hours),
                sleep_quality: Number(sleep.sleep_quality),
            });

            loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleMeasurements(e) {
        e.preventDefault();

        try {
            const data = {};

            Object.keys(measurements).forEach((key) => {
                if (measurements[key] !== "") {
                    data[key] = Number(measurements[key]);
                }
            });

            await addMeasurements(data);

            loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Progress & Recovery</h1>

            {error && <p>{error}</p>}

            <hr />

            <h2>Weight</h2>

            <form onSubmit={handleWeight}>
                <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                />

                <button type="submit">
                    Log Weight
                </button>
            </form>

            <h3>Weight History</h3>

            {weightHistory.map((item) => (
                <p key={item.id}>
                    {item.date}: {item.weight} kg
                </p>
            ))}

            <hr />

            <h2>Sleep</h2>

            <form onSubmit={handleSleep}>
                <input
                    type="number"
                    step="0.1"
                    placeholder="Hours slept"
                    value={sleep.duration_hours}
                    onChange={(e) =>
                        setSleep({
                            ...sleep,
                            duration_hours: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Quality 1-10"
                    value={sleep.sleep_quality}
                    onChange={(e) =>
                        setSleep({
                            ...sleep,
                            sleep_quality: e.target.value,
                        })
                    }
                />

                <input
                    type="time"
                    value={sleep.bedtime}
                    onChange={(e) =>
                        setSleep({
                            ...sleep,
                            bedtime: e.target.value,
                        })
                    }
                />

                <input
                    type="time"
                    value={sleep.wake_time}
                    onChange={(e) =>
                        setSleep({
                            ...sleep,
                            wake_time: e.target.value,
                        })
                    }
                />

                <input
                    placeholder="Notes"
                    value={sleep.notes}
                    onChange={(e) =>
                        setSleep({
                            ...sleep,
                            notes: e.target.value,
                        })
                    }
                />

                <button type="submit">
                    Log Sleep
                </button>
            </form>

            <h3>Sleep History</h3>

            {sleepHistory.map((item) => (
                <p key={item.id}>
                    {item.date}: {item.duration_hours} hours
                </p>
            ))}

            <hr />

            <h2>Body Measurements (cm)</h2>

            <form onSubmit={handleMeasurements}>
                {Object.keys(measurements).map((key) => (
                    <input
                        key={key}
                        type="number"
                        step="0.1"
                        placeholder={key}
                        value={measurements[key]}
                        onChange={(e) =>
                            setMeasurements({
                                ...measurements,
                                [key]: e.target.value,
                            })
                        }
                    />
                ))}

                <br />

                <button type="submit">
                    Save Measurements
                </button>
            </form>

            <h3>Measurement History</h3>

            {measurementHistory.map((item) => (
                <p key={item.id}>
                    {item.date} — Waist: {item.waist || "-"} cm
                </p>
            ))}
        </div>
    );
}

export default ProgressTracker;