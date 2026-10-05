from app.services.ai_client import generate_text


def generate_coach_response(
    message,
    profile,
    goal,
    nutrition,
    workouts,
    activities
):
    workout_summary = [
        {
            "date": str(workout.date),
            "name": workout.name,
            "duration": workout.duration_minutes
        }
        for workout in workouts
    ]

    activity_summary = [
        {
            "date": str(activity.date),
            "type": activity.activity_type,
            "duration": activity.duration_minutes,
            "steps": activity.steps,
            "calories": activity.calories_burned
        }
        for activity in activities
    ]

    prompt = f"""
You are the user's personal AI fitness coach.

Answer the user's question using their available
fitness information.

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

FITNESS TARGETS:
Calories: {goal.target_calories}
Protein: {goal.protein} g
Water: {goal.water} ml

TODAY'S NUTRITION:
{nutrition}

RECENT WORKOUTS:
{workout_summary}

RECENT ACTIVITIES:
{activity_summary}

USER QUESTION:
{message}

Rules:
- Give clear and practical fitness guidance.
- Use the user's data when relevant.
- Do not diagnose medical conditions.
- Do not prescribe medication.
- Do not recommend dangerous or extreme dieting/exercise.
- If information is missing, say that it is missing.
- Keep the response reasonably concise.
"""

    return generate_text(prompt)