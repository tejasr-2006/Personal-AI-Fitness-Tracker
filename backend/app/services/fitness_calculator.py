def calculate_bmr(
    weight: float,
    height: float,
    age: int,
    gender: str
) -> float:

    if gender.lower() == "male":
        return 10 * weight + 6.25 * height - 5 * age + 5

    return 10 * weight + 6.25 * height - 5 * age - 161


def get_activity_multiplier(activity_level: str) -> float:

    levels = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }

    return levels.get(activity_level.lower(), 1.2)


def calculate_fitness_targets(profile):

    bmr = calculate_bmr(
        profile.weight,
        profile.height,
        profile.age,
        profile.gender
    )

    multiplier = get_activity_multiplier(
        profile.activity_level
    )

    tdee = bmr * multiplier

    goal = profile.goal.lower()

    if goal in ["lose", "weight_loss"]:
        target_calories = tdee - 500

    elif goal in ["gain", "muscle"]:
        target_calories = tdee + 300

    else:
        target_calories = tdee

    # Protein
    if goal == "muscle":
        protein = profile.weight * 1.6
    else:
        protein = profile.weight * 1.2

    # Fat
    fat = profile.weight * 0.8

    # Remaining calories → carbohydrates
    remaining_calories = (
        target_calories
        - (protein * 4)
        - (fat * 9)
    )

    carbs = max(0, remaining_calories / 4)

    # Approximate daily water requirement in ml
    water = profile.weight * 35

    return {
        "bmr": round(bmr, 2),
        "tdee": round(tdee, 2),
        "maintenance_calories": round(tdee, 2),
        "target_calories": round(target_calories, 2),
        "protein": round(protein, 2),
        "carbs": round(carbs, 2),
        "fat": round(fat, 2),
        "water": round(water, 2)
    }