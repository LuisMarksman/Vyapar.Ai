from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def build_invoice_pdf(path: str, header: dict, items: list, totals: dict):
    c = canvas.Canvas(path, pagesize=A4)
    c.setFont("Helvetica-Bold", 14); c.drawString(40, 800, "Invoice")
    c.setFont("Helvetica", 10)
    c.drawString(40, 780, f"Customer: {header.get('customer_name','')}")
    y = 740
    c.setFont("Helvetica-Bold", 10); c.drawString(40,y,"Desc"); c.drawString(260,y,"Qty"); c.drawString(320,y,"Rate"); c.drawString(400,y,"Total")
    c.setFont("Helvetica", 10); y -= 20
    for it in items:
        c.drawString(40,y, str(it.get("description",""))[:30])
        c.drawString(260,y, str(it.get("qty","")))
        c.drawString(320,y, f"{float(it.get('rate',0)):.2f}")
        c.drawString(400,y, f"{float(it.get('line_total',0)):.2f}")
        y -= 16
    y -= 10
    c.drawString(320,y, "Subtotal:"); c.drawString(400,y, f"{float(totals.get('subtotal',0)):.2f}"); y -= 16
    c.drawString(320,y, "Tax:"); c.drawString(400,y, f"{float(totals.get('tax_total',0)):.2f}"); y -= 16
    c.drawString(320,y, "Total:"); c.drawString(400,y, f"{float(totals.get('total',0)):.2f}")
    c.showPage(); c.save()
