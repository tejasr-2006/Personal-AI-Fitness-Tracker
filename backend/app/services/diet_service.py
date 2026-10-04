import json
import os

from google import genai


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_diet_advice(
    profile,
    goal,
    nutrition
):
    prompt = f"""
You are a personal AI dietitian.

Use the user's information below to provide practical
nutrition guidance.

USER PROFILE:
Age: {profile.age}
Gender: {profile.gender}
Height: {profile.height} cm
Weight: {profile.weight} kg
Goal weight: {profile.goal_weight} kg
Activity level: {profile.activity_level}
Fitness level: {profile.fitness_level}
Goal: {profile.goal}
Dietary preferences: {profile.dietary_preferences}
Food preferences: {profile.food_preferences}
Food dislikes: {profile.food_dislikes}
Allergies: {profile.allergies}

DAILY TARGETS:
Calories: {goal.target_calories}
Protein: {goal.protein} g
Carbohydrates: {goal.carbs} g
Fat: {goal.fat} g
Water: {goal.water} ml

TODAY'S NUTRITION:
Calories consumed: {nutrition["calories_consumed"]}
Calories remaining: {nutrition["calories_remaining"]}
Protein consumed: {nutrition["protein_consumed"]}
Protein remaining: {nutrition["protein_remaining"]}
Carbohydrates: {nutrition["carbohydrates"]}
Fat: {nutrition["fat"]}
Fiber: {nutrition["fiber"]}

Give practical advice based on the user's current intake.

Return ONLY valid JSON:

{{
    "summary": "short summary",
    "calorie_advice": "advice about calories",
    "protein_advice": "advice about protein",
    "meal_suggestion": "suggest what the user could eat next",
    "tips": [
        "tip 1",
        "tip 2",
        "tip 3"
    ]
}}

Do not diagnose medical conditions.
Do not prescribe medication or supplements.
Do not recommend extreme dieting.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return json.loads(response.text)