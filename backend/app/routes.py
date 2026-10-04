from datetime import date, timedelta
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session
from .database import get_db
from .models import AiMessage, DailyLog, FoodEntry, Profile, ProfileHistory, Supplement, SupplementLog, User, WaterLog, WeightLog
from .security import current_user, hash_password, make_token, verify_password
from .services import ai_service, nutrition_service as ns

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "healthy", "service": "Personal AI Fitness"}



class Creds(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ProfileIn(BaseModel):
    name: str = Field("", max_length=100)
    age: int = Field(ge=13, le=100)
    sex: Literal["male", "female"]
    height_cm: float = Field(ge=100, le=250)
    weight_kg: float = Field(ge=30, le=300)
    goal_weight_kg: float = Field(ge=30, le=300)
    activity: Literal["sedentary", "light", "moderate", "active", "very_active"]
    goal: Literal["lose", "gain", "maintain", "muscle", "fitness"]
    diet: str = ""
    allergies: str = ""
    dislikes: str = ""
    budget: str = ""
    calorie_override: float | None = Field(None, ge=1000, le=6000)
    protein_override: float | None = Field(None, ge=20, le=400)
    water_override_l: float | None = Field(None, ge=0.5, le=8)


class FoodIn(BaseModel):
    date: date = Field(default_factory=date.today)
    meal_type: Literal["breakfast", "lunch", "dinner", "snack", "drink"] = "snack"
    name: str = Field(max_length=200)
    quantity: float = Field(1, gt=0)
    unit: str = "serving"
    calories: float = Field(ge=0, le=5000)
    protein: float = Field(0, ge=0, le=500)
    carbs: float = Field(0, ge=0, le=800)
    fat: float = Field(0, ge=0, le=500)
    fiber: float = Field(0, ge=0, le=200)
    estimated: bool = False


class FoodOut(FoodIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class WaterIn(BaseModel):
    ml: int = Field(gt=0, le=3000)


class WeightIn(BaseModel):
    date: date = Field(default_factory=date.today)
    weight_kg: float = Field(ge=30, le=300)
    note: str = ""


class SupIn(BaseModel):
    name: str = Field(max_length=100)
    dosage: str = ""
    time: str = ""




class DailyLogIn(BaseModel):
    date: date = Field(default_factory=date.today)
    calories_burned: float = Field(0, ge=0, le=10000)
    steps: int = Field(0, ge=0, le=100000)
    workout_completed: bool = False
    sleep_hours: float | None = Field(None, ge=0, le=24)
    sleep_quality: int | None = Field(None, ge=1, le=10)
    mood: str = Field("", max_length=30)
    energy: int | None = Field(None, ge=1, le=10)
    notes: str = Field("", max_length=5000)


class Text(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


# ---- auth
@router.post("/auth/register", status_code=201)
def register(c: Creds, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=c.email.lower()).first():
        raise HTTPException(409, "Email already registered")
    u = User(email=c.email.lower(), password_hash=hash_password(c.password))
    db.add(u); db.flush()
    db.add(Profile(user_id=u.id)); db.commit()
    return {"token": make_token(u.id)}


@router.post("/auth/login")
def login(c: Creds, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=c.email.lower()).first()
    if not u or not verify_password(c.password, u.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"token": make_token(u.id)}  # logout = client discards the token


# ---- profile
@router.get("/profile")
def get_profile(u: User = Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(Profile).filter_by(user_id=u.id).one()
    return {"profile": ai_service.profile_dict(p), "targets": ns.calc_targets(p)}


@router.put("/profile")
def put_profile(body: ProfileIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(Profile).filter_by(user_id=u.id).one()
    db.add(ProfileHistory(user_id=u.id, snapshot=ai_service.profile_dict(p)))
    for k, v in body.model_dump().items():
        setattr(p, k, v)
    db.commit()
    return {"profile": ai_service.profile_dict(p), "targets": ns.calc_targets(p)}


# ---- daily logs
@router.get("/daily-log/{log_date}")
def get_daily_log(log_date: date, u: User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.query(DailyLog).filter_by(user_id=u.id, date=log_date).first()
    totals = ns.day_totals(db, u.id, log_date)
    if not row:
        return {"date": log_date.isoformat(), **totals, "calories_burned": 0, "steps": 0,
                "workout_completed": False, "sleep_hours": None, "sleep_quality": None,
                "mood": "", "energy": None, "notes": ""}
    return {"date": log_date.isoformat(), **totals, "calories_burned": row.calories_burned,
            "steps": row.steps, "workout_completed": row.workout_completed,
            "sleep_hours": row.sleep_hours, "sleep_quality": row.sleep_quality,
            "mood": row.mood, "energy": row.energy, "notes": row.notes}


@router.post("/daily-log", status_code=200)
def save_daily_log(body: DailyLogIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.query(DailyLog).filter_by(user_id=u.id, date=body.date).first()
    if row:
        for k, v in body.model_dump().items():
            if k != "date": setattr(row, k, v)
    else:
        row = DailyLog(user_id=u.id, **body.model_dump())
        db.add(row)
    db.commit()
    return get_daily_log(body.date, u, db)


@router.get("/daily-log")
def daily_logs(days: int = 14, u: User = Depends(current_user), db: Session = Depends(get_db)):
    days = min(max(days, 1), 90)
    return [get_daily_log(date.today() - timedelta(days=i), u, db) for i in range(days - 1, -1, -1)]


# ---- food
@router.get("/meals", response_model=list[FoodOut])
def meals(d: date | None = None, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(FoodEntry).filter_by(user_id=u.id, date=d or date.today()).order_by(FoodEntry.id).all()


@router.post("/meals", response_model=FoodOut, status_code=201)
def add_meal(f: FoodIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    e = FoodEntry(user_id=u.id, **f.model_dump()); db.add(e); db.commit()
    return e


@router.delete("/meals/{mid}", status_code=204)
def del_meal(mid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    e = db.query(FoodEntry).filter_by(id=mid, user_id=u.id).first()
    if not e:
        raise HTTPException(404, "Not found")
    db.delete(e); db.commit()


@router.get("/nutrition/history")
def nut_hist(days: int = 14, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return ns.nutrition_history(db, u.id, min(days, 90))


# ---- water / weight / supplements
@router.post("/water", status_code=201)
def add_water(w: WaterIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.add(WaterLog(user_id=u.id, date=date.today(), ml=w.ml)); db.commit()
    return ns.day_totals(db, u.id, date.today())


@router.get("/weight")
def weight(days: int = 60, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return ns.weight_history(db, u.id, min(days, 365))


@router.post("/weight", status_code=201)
def add_weight(w: WeightIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.query(WeightLog).filter_by(user_id=u.id, date=w.date).first()
    if row:
        row.weight_kg, row.note = w.weight_kg, w.note
    else:
        db.add(WeightLog(user_id=u.id, **w.model_dump()))
    if w.date == date.today():
        db.query(Profile).filter_by(user_id=u.id).one().weight_kg = w.weight_kg
    db.commit()
    return ns.weight_history(db, u.id, 60)


@router.get("/supplements")
def supplements(u: User = Depends(current_user), db: Session = Depends(get_db)):
    done = {s.supplement_id for s in db.query(SupplementLog).filter_by(user_id=u.id, date=date.today())}
    return [{"id": s.id, "name": s.name, "dosage": s.dosage, "time": s.time, "done": s.id in done}
            for s in db.query(Supplement).filter_by(user_id=u.id, active=True)]


@router.post("/supplements", status_code=201)
def add_sup(s: SupIn, u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.add(Supplement(user_id=u.id, **s.model_dump())); db.commit()
    return supplements(u, db)


@router.post("/supplements/{sid}/complete")
def complete_sup(sid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if not db.query(Supplement).filter_by(id=sid, user_id=u.id).first():
        raise HTTPException(404, "Not found")
    log = db.query(SupplementLog).filter_by(supplement_id=sid, date=date.today()).first()
    if log:
        db.delete(log)  # toggle
    else:
        db.add(SupplementLog(user_id=u.id, supplement_id=sid, date=date.today()))
    db.commit()
    return supplements(u, db)


# ---- dashboard
@router.get("/dashboard")
def dashboard(u: User = Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(Profile).filter_by(user_id=u.id).one()
    t = ns.calc_targets(p)
    today = ns.day_totals(db, u.id, date.today())
    return {"profile": ai_service.profile_dict(p), "targets": t, "today": today,
            "remaining": {"calories": t["calories"] - today["calories"], "protein": t["protein"] - today["protein"]},
            "weight": ns.weight_history(db, u.id, 60), "history": ns.nutrition_history(db, u.id, 14),
            "supplements": supplements(u, db)}


# ---- AI
def _ai(fn, *a):
    try:
        return fn(*a)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    except Exception:
        raise HTTPException(502, "The AI service failed. Please try again.")


@router.post("/ai/chat")
def ai_chat(b: Text, u: User = Depends(current_user), db: Session = Depends(get_db)):
    return {"reply": _ai(ai_service.chat, db, u, b.text)}


@router.get("/ai/chat")
def ai_history(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(AiMessage).filter_by(user_id=u.id).order_by(AiMessage.id.desc()).limit(30).all()[::-1]
    return [{"role": m.role, "content": m.content} for m in rows]


@router.post("/ai/food-analysis")  # text -> proposed entries; client edits, then POST /meals
def ai_food(b: Text, u: User = Depends(current_user)):
    return _ai(ai_service.parse_foods, b.text)
