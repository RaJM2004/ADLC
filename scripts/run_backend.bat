@echo off
echo ========================================================
echo Starting GENQUANTAA ADLC Backend (FastAPI on Port 8000)
echo ========================================================
cd /d "%~dp0..\backend"
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
pause
