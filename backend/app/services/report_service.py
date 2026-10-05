import json

from app.services.ai_client import generate_json


def generate_fitness_report(
    profile,
    goal,
    progress,
    period
):
    prompt = f"""
You are a personal AI fitness coach.

Create a {period} fitness progress report.

USER:
Age: {profile.age}
Weight: {profile.weight} kg
Goal weight: {profile.goal_weight} kg
Fitness level: {profile.fitness_level}
Goal: {profile.goal}

TARGETS:
Calories: {goal.target_calories}
Protein: {goal.protein} g
Water: {goal.water} ml

PROGRESS DATA:
{json.dumps(progress, default=str)}

Return ONLY valid JSON:

{{
    "overview": "overall progress summary",
    "weight_progress": "weight progress analysis",
    "nutrition_progress": "nutrition analysis",
    "activity_progress": "activity analysis",
    "workout_progress": "workout analysis",
    "sleep_progress": "sleep analysis",
    "what_went_well": [
        "point 1",
        "point 2"
    ],
    "improvements": [
        "improvement 1",
        "improvement 2"
    ],
    "next_period_focus": [
        "focus 1",
        "focus 2",
        "focus 3"
    ]
}}

Rules:
- Base the report on the provided data.
- Do not invent measurements or activities.
- Do not diagnose medical conditions.
- Do not prescribe medication.
- Do not recommend extreme dieting or exercise.
"""

    return generate_json(prompt)