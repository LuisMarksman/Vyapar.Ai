from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.db import get_session
from backend.models import SKU
from backend.schemas import SKUCreate

router = APIRouter()

def current_user_id() -> int:
    return 1

@router.get("")
def list_skus(session: Session = Depends(get_session)):
    uid = current_user_id()
    rows = session.exec(select(SKU).where(SKU.user_id == uid)).all()
    return {"status":"ok","data":rows}

@router.get("/{sku_id}")
def get_sku(sku_id: int, session: Session = Depends(get_session)):
    sku = session.get(SKU, sku_id)
    if not sku: raise HTTPException(status_code=404, detail="SKU not found")
    return {"status":"ok","data":sku}

@router.post("")
def create_sku(data: SKUCreate, session: Session = Depends(get_session)):
    uid = current_user_id()
    sku = SKU(user_id=uid, **data.model_dump())
    session.add(sku); session.commit(); session.refresh(sku)
    return {"status":"ok","data":sku}

@router.put("/{sku_id}")
def update_sku(sku_id: int, data: SKUCreate, session: Session = Depends(get_session)):
    sku = session.get(SKU, sku_id)
    if not sku: raise HTTPException(status_code=404, detail="SKU not found")
    for k,v in data.model_dump().items(): setattr(sku, k, v)
    session.add(sku); session.commit(); session.refresh(sku)
    return {"status":"ok","data":sku}

@router.delete("/{sku_id}")
def delete_sku(sku_id: int, session: Session = Depends(get_session)):
    sku = session.get(SKU, sku_id)
    if not sku: raise HTTPException(status_code=404, detail="SKU not found")
    session.delete(sku); session.commit()
    return {"status":"ok","data":{"deleted":sku_id}}

@router.get("/low")
def low_stock(session: Session = Depends(get_session)):
    uid = current_user_id()
    rows = session.exec(select(SKU).where((SKU.user_id == uid) & (SKU.stock <= SKU.reorder_level))).all()
    return {"status":"ok","data":rows}
