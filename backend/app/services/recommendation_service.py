import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_recommendations(
    profile,
    goal,
    progress
):
    prompt = f"""
You are a personal AI fitness assistant.

Analyze the user's recent fitness progress and
generate personalized recommendations.

USER:
Age: {profile.age}
Weight: {profile.weight} kg
Goal weight: {profile.goal_weight} kg
Fitness level: {profile.fitness_level}
Goal: {profile.goal}
Activity level: {profile.activity_level}

GOALS:
Calories: {goal.target_calories}
Protein: {goal.protein} g
Water: {goal.water} ml

RECENT PROGRESS:
{progress}

Return ONLY valid JSON:

{{
    "recommendations": [
        {{
            "category": "nutrition",
            "recommendation": "recommendation text",
            "priority": "high"
        }},
        {{
            "category": "activity",
            "recommendation": "recommendation text",
            "priority": "medium"
        }},
        {{
            "category": "recovery",
            "recommendation": "recommendation text",
            "priority": "medium"
        }}
    ]
}}

Rules:
- Give practical recommendations.
- Use the user's actual data.
- Do not diagnose medical conditions.
- Do not prescribe medication.
- Do not recommend extreme dieting.
- Do not recommend dangerous exercise.
- Keep recommendations concise.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return json.loads(response.text)
