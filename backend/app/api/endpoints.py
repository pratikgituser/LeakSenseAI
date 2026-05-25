from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import os
from datetime import datetime

from app.database.session import get_db
from app.database.models import LeakEvent
from app.core.ai_models import ai_engine
from app.core.simulation import CITIES, sim_engine

# For PDF Generation
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

router = APIRouter()

@router.get("/system/config")
def get_system_config():
    """Returns the base smart city configurations for the frontend map."""
    return {"cities": CITIES}

@router.get("/analytics/history")
def get_historical_logs(limit: int = 100, db: Session = Depends(get_db)):
    """Fetches past leak events for Tab 5 (Audit Trail)."""
    events = db.query(LeakEvent).order_by(LeakEvent.timestamp.desc()).limit(limit).all()
    return events

@router.get("/analytics/roi")
def get_roi_analytics(db: Session = Depends(get_db)):
    """Calculates financial metrics for Tab 3 (ROI Dashboard)."""
    # Assuming each critical leak prevented saves ₹50,000 and 10,000 Liters
    critical_prevented = db.query(LeakEvent).filter(LeakEvent.leak_type == "PREDICTED", LeakEvent.severity == "PREDICTED_RISK").count()
    actual_leaks = db.query(LeakEvent).filter(LeakEvent.leak_type == "ACTUAL").count()
    
    return {
        "water_saved_liters": critical_prevented * 15000,
        "money_saved_inr": critical_prevented * 75000,
        "prevented_incidents": critical_prevented,
        "actual_failures": actual_leaks
    }

@router.post("/upload/csv")
async def upload_csv_for_analysis(file: UploadFile = File(...)):
    """Processes uploaded CSV datasets for Batch AI Analysis (Tab 4)."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
        
        # Ensure required columns exist
        required_cols = {'pressure', 'flow_rate', 'vibration'}
        if not required_cols.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")

        # --- THE FIX: Auto-train the AI if it is not fitted yet ---
        if not ai_engine.is_trained:
            print("⚠️ AI Model missing training data! Auto-training now...")
            training_data = []
            for _ in range(200):  # Generate 200 ticks of normal baseline data
                training_data.extend(sim_engine.get_state())
            ai_engine.train_baseline(training_data)
        # ----------------------------------------------------------

        # Run batch analysis through the AI
        features = df[['pressure', 'flow_rate', 'vibration']].values
        predictions = ai_engine.iso_forest.predict(features)
        
        anomalies_found = (predictions == -1).sum()
        total_rows = len(df)
        
        return {
            "filename": file.filename,
            "total_records_analyzed": int(total_rows),
            "anomalies_detected": int(anomalies_found),
            "pipe_health_score": round(((total_rows - anomalies_found) / total_rows) * 100, 2),
            "status": "Analysis Complete"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@router.get("/reports/download")
def download_pdf_report(db: Session = Depends(get_db)):
    """Generates a White & Blue themed PDF Report for Hackathon Judges."""
    file_path = "LeakSense_AI_Report.pdf"
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # White & Blue Theme Colors
    primary_blue = colors.HexColor("#0077B6")
    text_dark = colors.HexColor("#023E8A")
    
    # Header
    c.setFillColor(primary_blue)
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(40, height - 50, "LeakSense AI - Intelligence Report")

    # Body
    c.setFillColor(text_dark)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 120, f"Date Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    # Fetch Data
    total_leaks = db.query(LeakEvent).count()
    predicted = db.query(LeakEvent).filter(LeakEvent.leak_type == "PREDICTED").count()
    
    c.setFont("Helvetica", 14)
    c.drawString(40, height - 160, f"Total System Events Logged: {total_leaks}")
    c.drawString(40, height - 190, f"Proactive Predictions (Leaks Prevented): {predicted}")
    c.drawString(40, height - 220, "System Status: ONLINE & STABLE")
    
    c.save()
    
    return FileResponse(path=file_path, filename=file_path, media_type='application/pdf')