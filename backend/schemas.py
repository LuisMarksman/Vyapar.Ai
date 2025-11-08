from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    phone: str
    business_type: str
    turnover_bracket: str
    employees: int
    industry_tags: str = ""

class SKUCreate(BaseModel):
    name: str
    sku_code: str
    stock: int = 0
    reorder_level: int = 0
    cost_price: float = 0.0
    sale_price: float = 0.0

class InvoiceItemIn(BaseModel):
    sku_id: Optional[int] = None
    description: str
    qty: int
    rate: float
    tax_pct: float = 0.0

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_contact: Optional[str] = None
    items: List[InvoiceItemIn]
