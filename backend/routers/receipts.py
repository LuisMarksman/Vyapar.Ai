from fastapi import APIRouter, UploadFile, File, Depends
from sqlmodel import Session
from pathlib import Path
from backend.db import get_session
from backend.models import Expense
from backend import ai_engine  # ai_engine.ocr.parse(image_path)

router = APIRouter()
UPLOADS = Path("uploads"); UPLOADS.mkdir(exist_ok=True)

def current_user_id(): return 1

@router.post("")
async def upload_receipt(file: UploadFile = File(...), session: Session = Depends(get_session)):
    uid = current_user_id()
    path = UPLOADS / file.filename
    with open(path, "wb") as f:
        f.write(await file.read())
    parsed = ai_engine.ocr.parse(str(path))
    exp = Expense(user_id=uid, vendor=parsed.get("vendor","Unknown"),
                  amount=float(parsed.get("amount",0)), category=parsed.get("category","misc"),
                  raw_text=parsed.get("raw",""))
    session.add(exp); session.commit(); session.refresh(exp)
    return {"status":"ok","data":{"expense_id":exp.id,"parsed":parsed}}

@router.post("/upload_receipt")
async def upload_receipt_alias(file: UploadFile = File(...), session: Session = Depends(get_session)):
    return await upload_receipt(file=file, session=session)
