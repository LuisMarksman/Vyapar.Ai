from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.db import get_session
from backend.models import User
from backend import ai_engine

router = APIRouter()

def current_user_id(): return 1

@router.get("/match")
def match(session: Session = Depends(get_session)):
    uid = current_user_id()
    user = session.get(User, uid)
    if not user: return {"status":"error","message":"user not found"}
    profile = {
        "business_type": user.business_type,
        "turnover_bracket": user.turnover_bracket,
        "employees": user.employees,
        "industry_tags": user.industry_tags.split(",") if user.industry_tags else []
    }
    matches = ai_engine.schemes.match(profile)
    return {"status":"ok","data":matches}
