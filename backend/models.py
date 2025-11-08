from typing import List, Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    phone: str
    business_type: str
    turnover_bracket: str
    employees: int = 0
    industry_tags: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    invoices: List["Invoice"] = Relationship(back_populates="user")
    skus: List["SKU"] = Relationship(back_populates="user")
    expenses: List["Expense"] = Relationship(back_populates="user")

class SKU(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    sku_code: str
    stock: int = 0
    reorder_level: int = 0
    cost_price: float = 0.0
    sale_price: float = 0.0
    user: Optional[User] = Relationship(back_populates="skus")

class InvoiceItem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    invoice_id: int = Field(foreign_key="invoice.id")
    sku_id: int | None = Field(default=None, foreign_key="sku.id")
    description: str
    qty: int
    rate: float
    tax_pct: float = 0.0
    line_total: float

class Invoice(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    customer_name: str
    customer_contact: str | None = None
    date: datetime = Field(default_factory=datetime.utcnow)
    subtotal: float = 0.0
    tax_total: float = 0.0
    total: float = 0.0
    pdf_path: str | None = None
    user: Optional[User] = Relationship(back_populates="invoices")

class Expense(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    vendor: str
    date: datetime = Field(default_factory=datetime.utcnow)
    amount: float
    category: str = "misc"
    raw_text: str | None = None
    user: Optional[User] = Relationship(back_populates="expenses")
