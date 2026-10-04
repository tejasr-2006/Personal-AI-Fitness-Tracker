from fastapi import FastAPI

from app.database import engine, Base
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.models.profile import Profile
from app.routes.profile import router as profile_router
from app.models.goal import Goal
from app.routes.goal import router as goal_router
from app.models.daily_log import DailyLog
from app.routes.daily_log import router as daily_log_router
from app.models.meal import Meal
from app.routes.meals import router as meals_router
from app.routes.nutrition import router as nutrition_router
from app.routes.ai import router as ai_router
from app.routes.ai import router as ai_router
from app.routes.weight import router as weight_router
from app.models.weight_log import WeightLog
from app.models.water_log import WaterLog
from app.routes.water import router as water_router
from app.models.supplement import Supplement
from app.routes.supplement import router as supplement_router
from app.models.exercise import Exercise
from app.models.workout import Workout
from app.models.exercise_log import ExerciseLog
from app.routes.workout import router as workout_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Personal AI Fitness Assistant",
    version="1.0.0"
)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(profile_router)
app.include_router(goal_router)
app.include_router(daily_log_router)
app.include_router(meals_router)
app.include_router(nutrition_router)
app.include_router(ai_router)
app.include_router(ai_router)
app.include_router(weight_router)
app.include_router(water_router)
app.include_router(supplement_router)
app.include_router(workout_router)

@app.get("/")
def root():
    return {
        "message": "Personal AI Fitness Assistant is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }