import { useEffect, useState } from "react";
import {
    getExercises,
    getWorkouts,
    createWorkout,
    addExerciseToWorkout,
} from "../api";

function WorkoutTracker() {
    const [workouts, setWorkouts] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const [workoutName, setWorkoutName] = useState("");

    const [exercise, setExercise] = useState({
        exercise_id: "",
        sets: 3,
        reps: 10,
        weight: 0,
        duration_minutes: 0,
    });

    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [workoutData, exerciseData] = await Promise.all([
                getWorkouts(),
                getExercises(),
            ]);

            setWorkouts(workoutData);
            setExercises(exerciseData);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleCreateWorkout(e) {
        e.preventDefault();

        try {
            const workout = await createWorkout({
                name: workoutName,
                duration_minutes: 0,
                notes: "",
            });

            setWorkoutName("");
            setSelectedWorkout(workout);

            await loadData();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleAddExercise(e) {
        e.preventDefault();

        if (!selectedWorkout) {
            setError("Select a workout first.");
            return;
        }

        try {
            await addExerciseToWorkout(selectedWorkout.id, {
                exercise_id: Number(exercise.exercise_id),
                sets: Number(exercise.sets),
                reps: Number(exercise.reps),
                weight: Number(exercise.weight),
                duration_minutes: Number(exercise.duration_minutes),
            });

            setExercise({
                exercise_id: "",
                sets: 3,
                reps: 10,
                weight: 0,
                duration_minutes: 0,
            });

            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Workout Tracker</h1>

            {error && <p>{error}</p>}

            <h2>Create Workout</h2>

            <form onSubmit={handleCreateWorkout}>
                <input
                    placeholder="Workout name"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    required
                />

                <button type="submit">
                    Create Workout
                </button>
            </form>

            <h2>My Workouts</h2>

            {workouts.map((workout) => (
                <button
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                >
                    {workout.name}
                </button>
            ))}

            <h2>Add Exercise</h2>

            <form onSubmit={handleAddExercise}>
                <select
                    value={exercise.exercise_id}
                    onChange={(e) =>
                        setExercise({
                            ...exercise,
                            exercise_id: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">
                        Select exercise
                    </option>

                    {exercises.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <br />

                <input
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) =>
                        setExercise({
                            ...exercise,
                            sets: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) =>
                        setExercise({
                            ...exercise,
                            reps: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={exercise.weight}
                    onChange={(e) =>
                        setExercise({
                            ...exercise,
                            weight: e.target.value,
                        })
                    }
                />

                <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={exercise.duration_minutes}
                    onChange={(e) =>
                        setExercise({
                            ...exercise,
                            duration_minutes: e.target.value,
                        })
                    }
                />

                <br />

                <button type="submit">
                    Add Exercise
                </button>
            </form>
        </div>
    );
}

export default WorkoutTracker;