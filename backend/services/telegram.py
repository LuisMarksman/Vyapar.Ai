import os, httpx
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
async def notify_invoice_created(payload: dict):
    if not TELEGRAM_WEBHOOK_URL: return
    async with httpx.AsyncClient() as client:
        try: await client.post(TELEGRAM_WEBHOOK_URL, json=payload, timeout=5)
        except Exception: pass
