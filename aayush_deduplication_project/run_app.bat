@echo off
title Aayush Aayurved Clinic Deduplication Engine
echo ========================================================
echo Aayush Aayurved Clinic - Patient Record Deduplication
echo Bizznnovate 2026 Innovation Showcase
echo ========================================================
echo.

cd /d "%~dp0backend"
set PYTHONPATH=%cd%
set PYTHONUNBUFFERED=1

echo Pre-loading benchmark dataset...
python -c "
import pandas as pd
from app.db.database import Base, engine, SessionLocal
from app.api.v1.ingestion import process_batch_ingestion
Base.metadata.create_all(bind=engine)
db = SessionLocal()
df = pd.read_csv('data/mock_data.csv')
res = process_batch_ingestion(df.to_dict(orient='records'), db)
print('Dataset Preloaded: 13 branch records staged.')
"

echo.
echo Launching Server on http://localhost:8000 ...
start http://localhost:8000

echo Application is live! Press CTRL+C to stop.
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause

