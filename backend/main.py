from fastapi import FastAPI, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

# ✅ Use absolute imports (for Render)
from backend.db import init_db, get_session
from backend.routers import auth, invoices, skus, receipts, schemes, advisor
from backend.models import Invoice, SKU
import backend.ai_engine as ai_engine

# -------------------------------
# App initialization
# -------------------------------
app = FastAPI(
    title="BizMind AI Backend",
    version="1.0.0",
    description="Integrated backend for Vyapar.AI – MSME Growth Platform with GovConnect & AI Advisor",
)

# -------------------------------
# Middleware Configuration
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow all origins (for hackathon/demo use)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Startup Event
# -------------------------------
@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Database initialized successfully.")

# -------------------------------
# Root Endpoint
# -------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "name": "Vyapar.AI – BizMind Backend",
        "docs": "/docs",
        "health": "/healthz",
        "endpoints": [
            "/auth/register",
            "/register (alias)",
            "/invoices",
            "/skus",
            "/receipts",
            "/upload_receipt",
            "/schemes/match",
            "/advisor/ask",
            "/ask",
        ],
    }

# -------------------------------
# Health Check
# -------------------------------
@app.get("/healthz")
def healthz():
    return {"status": "healthy"}

# -------------------------------
# Alias: /register → /auth/register
# -------------------------------
@app.post("/register")
def register_alias(data: dict, session: Session = Depends(get_session)):
    from backend.models import User
    user = User(**data)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"status": "ok", "data": {"user_id": user.id}}

# -------------------------------
# New AI Integration Endpoints
# -------------------------------

# ✅ 1. Upload Receipt → OCR → Return structured data
@app.post("/upload_receipt")
async def upload_receipt(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = ai_engine.receipt_parser.parse_receipt(image_bytes)
        return {"status": "ok", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ✅ 2. Match Government Schemes → based on user business data
@app.post("/schemes/match")
def match_schemes(user_profile: dict):
    try:
        matches = ai_engine.scheme_matcher.match_schemes(user_profile)
        return {"status": "ok", "schemes": matches}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ✅ 3. Ask AI Advisor → uses sales, invoices, SKUs data
@app.post("/ask")
def ask_ai(query: dict, session: Session = Depends(get_session)):
    invoices = session.exec(select(Invoice)).all()
    skus = session.exec(select(SKU)).all()

    snapshot = {
        "sales_total": sum(i.total for i in invoices),
        "invoice_count": len(invoices),
        "skus": [
            {
                "id": s.id,
                "name": s.name,
                "stock": s.stock,
                "sale_price": s.sale_price,
                "cost_price": s.cost_price,
            }
            for s in skus
        ],
    }

    # 🔗 Calls the AI Advisor (RAG + Gemini-based)
    try:
        answer = ai_engine.rag_advisor.answer_query(
            user_profile={"industry": "manufacturing"},  # Example; can be dynamic
            user_snapshot=snapshot,
            query=query.get("q", ""),
        )
        return {"status": "ok", "data": {"answer": answer}}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# -------------------------------
# Include Routers (Modular endpoints)
# -------------------------------
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
app.include_router(skus.router, prefix="/skus", tags=["skus"])
app.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
app.include_router(schemes.router, prefix="/schemes", tags=["schemes"])
app.include_router(advisor.router, prefix="/advisor", tags=["advisor"])
