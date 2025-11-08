# BizMind AI – GovConnect (Backend / FastAPI)

## Windows (PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload
```

## macOS/Linux
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

Swagger UI: http://localhost:8000/docs
Health: http://localhost:8000/healthz
