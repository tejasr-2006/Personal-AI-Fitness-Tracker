from datetime import date

PROFILE = {
    "age": 30, "gender": "male", "height": 180, "weight": 80, "goal_weight": 75,
    "activity_level": "moderate", "fitness_level": "beginner", "goal": "lose",
}


def test_register_validation_and_case_insensitive_login(client, auth):
    headers, email = auth
    assert client.post("/auth/register", json={"name": "x", "email": "a@b.com", "password": "short"}).status_code == 422
    r = client.post("/auth/login", json={"email": email.upper(), "password": "password123"})
    assert r.status_code == 200


def test_profile_can_be_updated(client, auth):
    headers, _ = auth
    assert client.post("/profile", json=PROFILE, headers=headers).status_code == 200
    r = client.put("/profile", json={**PROFILE, "weight": 78}, headers=headers)
    assert r.status_code == 200 and r.json()["weight"] == 78
    assert client.post("/goals/calculate", headers=headers).status_code == 200


def test_missing_setup_is_a_409_not_a_200(client, auth):
    headers, _ = auth
    assert client.get("/dashboard", headers=headers).status_code == 409
    assert client.get("/ai/daily-briefing", headers=headers).status_code == 409


def test_ai_without_key_is_503(client, auth):
    headers, _ = auth
    client.put("/profile", json=PROFILE, headers=headers)
    client.post("/goals/calculate", headers=headers)
    assert client.get("/ai/trainer-advice", headers=headers).status_code == 503


def test_dashboard_nutrition_and_water(client, auth):
    headers, _ = auth
    today = date.today().isoformat()
    client.put("/profile", json=PROFILE, headers=headers)
    client.post("/goals/calculate", headers=headers)
    client.post("/meals", headers=headers, json={"date": today, "meal_type": "lunch", "food_name": "Rice", "calories": 400, "protein": 8})
    client.post("/water", headers=headers, json={"date": today, "amount": 500})
    d = client.get(f"/dashboard?date={today}", headers=headers).json()
    assert d["nutrition"]["calories_consumed"] == 400
    assert d["nutrition"]["calories_target"] is not None
    assert d["water"]["consumed_ml"] == 500


def test_seeded_exercises_and_workout_logs(client, auth):
    headers, _ = auth
    exercises = client.get("/workouts/exercises", headers=headers).json()
    assert exercises, "starter exercise library should be seeded"
    w = client.post("/workouts", headers=headers, json={"name": "Push", "date": date.today().isoformat()}).json()
    r = client.post(f"/workouts/{w['id']}/exercises", headers=headers, json={"exercise_id": exercises[0]["id"], "sets": 3, "reps": 10})
    assert r.status_code == 200
    logs = client.get(f"/workouts/{w['id']}/exercises", headers=headers).json()
    assert logs[0]["name"] == exercises[0]["name"] and logs[0]["sets"] == 3


def test_notifications_are_not_duplicated(client, auth):
    headers, _ = auth
    client.put("/profile", json=PROFILE, headers=headers)
    client.post("/goals/calculate", headers=headers)
    first = client.post("/notifications/generate", headers=headers).json()["count"]
    second = client.post("/notifications/generate", headers=headers).json()["count"]
    assert first > 0 and second == 0


def test_json_extraction_handles_code_fences():
    from app.services.ai_client import _extract_json
    assert _extract_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert _extract_json('Here you go: {"a": 2} thanks') == {"a": 2}
