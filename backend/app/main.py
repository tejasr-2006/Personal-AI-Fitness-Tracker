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
from app.models.activity import Activity
from app.routes.activity import router as activity_router
from app.models.sleep_log import SleepLog
from app.routes.sleep import router as sleep_router
from app.models.body_measurement import BodyMeasurement
from app.routes.body_measurement import router as body_measurement_router
from app.models.progress_photo import ProgressPhoto
from app.routes.progress_photo import router as progress_photo_router
from app.routes.analytics import router as analytics_router
from app.models.ai_recommendation import AIRecommendation
from app.routes.recommendations import router as recommendations_router
from app.routes.reports import router as reports_router
from app.models.notification import Notification
from app.routes.notifications import router as notifications_router
from app.routes.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Personal AI Fitness Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(activity_router)
app.include_router(sleep_router)
app.include_router(body_measurement_router)
app.include_router(progress_photo_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)

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