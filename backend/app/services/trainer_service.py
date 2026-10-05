import json

from app.services.ai_client import generate_json


def generate_trainer_advice(
    profile,
    goal,
    workouts,
    activities
):
    workout_history = []

    for workout in workouts:
        workout_history.append({
            "date": str(workout.date),
            "name": workout.name,
            "duration_minutes": workout.duration_minutes,
            "notes": workout.notes
        })

    activity_history = []

    for activity in activities:
        activity_history.append({
            "date": str(activity.date),
            "activity_type": activity.activity_type,
            "duration_minutes": activity.duration_minutes,
            "calories_burned": activity.calories_burned,
            "steps": activity.steps
        })

    prompt = f"""
You are a personal AI fitness trainer.

Analyze the user's profile, fitness goal,
workout history and activity history.

USER PROFILE:
Age: {profile.age}
Gender: {profile.gender}
Height: {profile.height} cm
Weight: {profile.weight} kg
Goal weight: {profile.goal_weight} kg
Activity level: {profile.activity_level}
Fitness level: {profile.fitness_level}
Goal: {profile.goal}
Equipment: {profile.equipment}
Workout location: {profile.workout_location}

FITNESS TARGET:
Goal type: {goal.goal_type}

WORKOUT HISTORY:
{json.dumps(workout_history)}

ACTIVITY HISTORY:
{json.dumps(activity_history)}

Return ONLY valid JSON:

{{
    "summary": "short assessment",
    "workout_advice": "advice about training",
    "recovery_advice": "recovery advice",
    "next_workout": "suggested next workout",
    "progress_advice": "advice for improving progress",
    "tips": [
        "tip 1",
        "tip 2",
        "tip 3"
    ]
}}

Rules:
- Give practical fitness guidance.
- Do not diagnose medical conditions.
- Do not prescribe medication.
- Do not recommend dangerous or extreme exercise.
- Consider the user's fitness level and available equipment.
"""

    return generate_json(prompt)