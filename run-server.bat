@echo off
cd /d "%~dp0backend"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
pip install -q -r requirements.txt
if not exist "uploads" mkdir uploads

echo Starting backend on http://localhost:8000
uvicorn main:app --host 0.0.0.0 --port 8000
