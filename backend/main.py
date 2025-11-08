from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from .db import init_db, get_session
from .routers import auth, invoices, skus, receipts, schemes, advisor
from .models import Invoice, SKU
from . import ai_engine

app = FastAPI(title="BizMind AI Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "status": "ok",
        "name": "BizMind AI – GovConnect (Backend)",
        "docs": "/docs",
        "health": "/healthz",
        "endpoints": ["/register (alias)","/auth/register","/skus","/invoices","/receipts","/upload_receipt","/schemes/match","/advisor/ask","/ask"]
    }

@app.get("/healthz")
def healthz():
    return {"status": "healthy"}

# Alias: /register (same as /auth/register)
@app.post("/register")
def register_alias(data: dict, session: Session = Depends(get_session)):
    from .models import User
    user = User(**data)
    session.add(user); session.commit(); session.refresh(user)
    return {"status":"ok","data":{"user_id": user.id}}

# Alias: /ask -> proxy to advisor logic on current data
@app.post("/ask")
def ask_alias(query: dict, session: Session = Depends(get_session)):
    invoices = session.exec(select(Invoice)).all()
    skus = session.exec(select(SKU)).all()
    snapshot = {
        "sales_total": sum(i.total for i in invoices),
        "invoice_count": len(invoices),
        "skus": [{"id":s.id,"name":s.name,"stock":s.stock,"sale_price":s.sale_price,"cost_price":s.cost_price} for s in skus]
    }
    answer = ai_engine.advisor.answer(snapshot, query.get("q",""))
    return {"status":"ok","data":{"answer":answer}}

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
app.include_router(skus.router, prefix="/skus", tags=["skus"])
app.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
app.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
app.include_router(advisor.router, prefix="/advisor", tags=["advisor"])
