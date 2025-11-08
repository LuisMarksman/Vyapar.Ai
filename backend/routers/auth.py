from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.db import get_session
from backend.models import User
from backend.schemas import UserCreate

router = APIRouter()

@router.post("/register")
def register(data: UserCreate, session: Session = Depends(get_session)):
    user = User(**data.model_dump())
    session.add(user); session.commit(); session.refresh(user)
    return {"status":"ok","data":{"user_id": user.id}}
