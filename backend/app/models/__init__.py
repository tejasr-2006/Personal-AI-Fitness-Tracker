# Import every model so Base.metadata (create_all / alembic) sees all tables.
from app.models.user import User  # noqa: F401
from app.models.profile import Profile  # noqa: F401
from app.models.goal import Goal  # noqa: F401
from app.models.daily_log import DailyLog  # noqa: F401
from app.models.meal import Meal  # noqa: F401
from app.models.weight_log import WeightLog  # noqa: F401
from app.models.water_log import WaterLog  # noqa: F401
from app.models.supplement import Supplement  # noqa: F401
from app.models.exercise import Exercise  # noqa: F401
from app.models.workout import Workout  # noqa: F401
from app.models.exercise_log import ExerciseLog  # noqa: F401
from app.models.activity import Activity  # noqa: F401
from app.models.sleep_log import SleepLog  # noqa: F401
from app.models.body_measurement import BodyMeasurement  # noqa: F401
from app.models.progress_photo import ProgressPhoto  # noqa: F401
from app.models.ai_recommendation import AIRecommendation  # noqa: F401
from app.models.notification import Notification  # noqa: F401
