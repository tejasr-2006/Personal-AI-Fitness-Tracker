import os
os.environ.setdefault("JWT_SECRET", "test")
from app.models import Profile
from app.services.nutrition_service import calc_targets


def test_targets_are_estimates_and_respect_goal():
    p = Profile(age=25, sex="male", height_cm=175, weight_kg=62, activity="moderate", goal="gain")
    t = calc_targets(p)
    assert t["is_estimate"] and t["calories"] > t["maintenance"]
    p.calorie_override = 3000
    assert calc_targets(p)["calories"] == 3000
