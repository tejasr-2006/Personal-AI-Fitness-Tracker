import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_daily_briefing(
    profile,
    goal,
    nutrition,
    activity,
    sleep,
    workouts
):
    workout_summary = [
        {
            "name": workout.name,
            "duration_minutes": workout.duration_minutes
        }
        for workout in workouts
    ]

    prompt = f"""
You are a personal AI fitness assistant.

Create a short daily fitness briefing based on the
user's data.

PROFILE:
Age: {profile.age}
Weight: {profile.weight} kg
Goal weight: {profile.goal_weight} kg
Fitness level: {profile.fitness_level}
Goal: {profile.goal}

TARGETS:
Calories: {goal.target_calories}
Protein: {goal.protein} g
Water: {goal.water} ml

TODAY'S NUTRITION:
{nutrition}

TODAY'S ACTIVITY:
{activity}

TODAY'S SLEEP:
{sleep}

TODAY'S WORKOUTS:
{workout_summary}

Return ONLY valid JSON:

{{
    "summary": "short overall summary",
    "nutrition_status": "nutrition status",
    "activity_status": "activity status",
    "sleep_status": "sleep status",
    "workout_status": "workout status",
    "priority": "most important thing to focus on",
    "recommendations": [
        "recommendation 1",
        "recommendation 2",
        "recommendation 3"
    ]
}}

Rules:
- Be practical and concise.
- Use the available data.
- Do not diagnose medical conditions.
- Do not recommend extreme dieting or exercise.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return json.loads(response.text)