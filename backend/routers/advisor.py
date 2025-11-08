from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from backend.db import get_session
from backend.models import Invoice, SKU
from backend import ai_engine

router = APIRouter()
def current_user_id(): return 1

@router.post("/ask")
def ask(query: dict, session: Session = Depends(get_session)):
    uid = current_user_id()
    invoices = session.exec(select(Invoice).where(Invoice.user_id==uid)).all()
    skus = session.exec(select(SKU).where(SKU.user_id==uid)).all()
    snapshot = {
        "sales_total": sum(i.total for i in invoices),
        "invoice_count": len(invoices),
        "skus": [{"id":s.id,"name":s.name,"stock":s.stock,"sale_price":s.sale_price,"cost_price":s.cost_price} for s in skus]
    }
    answer = ai_engine.advisor.answer(snapshot, query.get("q",""))
    return {"status":"ok","data":{"answer":answer}}
