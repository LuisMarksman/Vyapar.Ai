from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pathlib import Path
from backend.db import get_session
from backend.models import Invoice, SKU
from backend.schemas import InvoiceCreate
from backend.services.telegram import notify_invoice_created
import asyncio, os

try:
    from ..services.pdf import build_invoice_pdf
    _PDF_AVAILABLE = True
except Exception:
    build_invoice_pdf = None
    _PDF_AVAILABLE = False

router = APIRouter()
BASE_DIR = Path(__file__).resolve().parents[2]
FILES_DIR = BASE_DIR / "files"
FILES_DIR.mkdir(exist_ok=True)

def current_user_id(): return 1

@router.get("")
def list_invoices(session: Session = Depends(get_session)):
    uid = current_user_id()
    rows = session.exec(select(Invoice).where(Invoice.user_id == uid)).all()
    return {"status":"ok","data":rows}

@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, session: Session = Depends(get_session)):
    inv = session.get(Invoice, invoice_id)
    if not inv: raise HTTPException(status_code=404, detail="Invoice not found")
    return {"status":"ok","data":inv}

@router.post("")
def create_invoice(data: InvoiceCreate, session: Session = Depends(get_session)):
    uid = current_user_id()
    subtotal = 0.0; tax_total = 0.0
    items_out = []
    for it in data.items:
        line = it.qty * it.rate
        tax = line * (it.tax_pct/100.0)
        subtotal += line; tax_total += tax
        items_out.append({"description": it.description,"qty": it.qty,"rate": it.rate,"line_total": line + tax})
        if it.sku_id:
            sku = session.get(SKU, it.sku_id)
            if sku and sku.user_id == uid:
                sku.stock = max(0, sku.stock - it.qty); session.add(sku)
    total = subtotal + tax_total
    inv = Invoice(user_id=uid, customer_name=data.customer_name,
                  customer_contact=data.customer_contact,
                  subtotal=subtotal, tax_total=tax_total, total=total)
    session.add(inv); session.commit(); session.refresh(inv)

    pdf_path_str = None
    if (os.getenv("DISABLE_PDF","").lower() not in {"1","true","yes"}) and _PDF_AVAILABLE:
        try:
            pdf_path = FILES_DIR / f"invoice_{inv.id}.pdf"
            from ..services.pdf import build_invoice_pdf  # lazy import
            build_invoice_pdf(str(pdf_path), {"customer_name": inv.customer_name},
                              items_out, {"subtotal":subtotal,"tax_total":tax_total,"total":total})
            pdf_path_str = str(pdf_path)
        except Exception:
            pdf_path_str = None

    inv.pdf_path = pdf_path_str; session.add(inv); session.commit()

    try: asyncio.create_task(notify_invoice_created({"type":"invoice_created","id":inv.id,"total":inv.total}))
    except Exception: pass

    return {"status":"ok","data":{"invoice_id":inv.id,"pdf":inv.pdf_path,"total":inv.total}}
