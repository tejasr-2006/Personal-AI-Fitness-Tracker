"""Seed a starter exercise library so the workout logger is usable out of the box."""
from sqlalchemy.orm import Session

from app.models.exercise import Exercise

# (name, muscle group, equipment, difficulty, kcal/min)
STARTER_EXERCISES = [
    ("Push-up", "Chest", "Bodyweight", "beginner", 7),
    ("Bench press", "Chest", "Barbell", "intermediate", 6),
    ("Dumbbell fly", "Chest", "Dumbbells", "intermediate", 5),
    ("Pull-up", "Back", "Pull-up bar", "intermediate", 8),
    ("Bent-over row", "Back", "Barbell", "intermediate", 6),
    ("Lat pulldown", "Back", "Cable machine", "beginner", 5),
    ("Overhead press", "Shoulders", "Barbell", "intermediate", 6),
    ("Lateral raise", "Shoulders", "Dumbbells", "beginner", 4),
    ("Bicep curl", "Arms", "Dumbbells", "beginner", 4),
    ("Tricep dip", "Arms", "Bodyweight", "beginner", 5),
    ("Squat", "Legs", "Barbell", "intermediate", 8),
    ("Bodyweight squat", "Legs", "Bodyweight", "beginner", 6),
    ("Lunge", "Legs", "Bodyweight", "beginner", 6),
    ("Deadlift", "Legs", "Barbell", "advanced", 9),
    ("Leg press", "Legs", "Machine", "beginner", 6),
    ("Plank", "Core", "Bodyweight", "beginner", 4),
    ("Crunch", "Core", "Bodyweight", "beginner", 4),
    ("Burpee", "Full body", "Bodyweight", "intermediate", 10),
    ("Running", "Cardio", "None", "beginner", 11),
    ("Cycling", "Cardio", "Bike", "beginner", 8),
    ("Jump rope", "Cardio", "Jump rope", "beginner", 12),
]


def seed_exercises(db: Session) -> None:
    if db.query(Exercise).first():
        return
    for name, muscle, equipment, difficulty, kcal in STARTER_EXERCISES:
        db.add(Exercise(
            name=name, muscle_group=muscle, equipment=equipment,
            difficulty=difficulty, calories_per_minute=kcal,
        ))
    db.commit()
