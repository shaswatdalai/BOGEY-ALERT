from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from typing import Dict

print("=" * 50)
print("🚀 STARTING INSIDER THREAT DETECTION API")
print("=" * 50)

# Check if model files exist
if not os.path.exists('anomaly_model.pkl'):
    print("❌ ERROR: anomaly_model.pkl not found!")
    print("📌 Please run: python anomaly_detector.py first")
    exit(1)

if not os.path.exists('scaler.pkl'):
    print("❌ ERROR: scaler.pkl not found!")
    print("📌 Please run: python anomaly_detector.py first")
    exit(1)

if not os.path.exists('employee_logs.csv'):
    print("❌ ERROR: employee_logs.csv not found!")
    print("📌 Please run: python generate_data.py first")
    exit(1)

# Load the trained model
print("\n📂 Loading model...")
try:
    model = joblib.load('anomaly_model.pkl')
    scaler = joblib.load('scaler.pkl')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

# Load historical data for baseline
print("📂 Loading historical data...")
df = pd.read_csv('employee_logs.csv')
print(f"✅ Loaded {len(df)} historical records")

# Create the API app
app = FastAPI(
    title="Insider Threat Detection System",
    description="Detects suspicious employee behavior using AI",
    version="1.0"
)

# ADD THIS - This allows your HTML dashboard to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (including your HTML file)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define what a request should look like
class ActivityRequest(BaseModel):
    employee_id: str
    login_hour: float
    files_accessed: int
    sensitive_files: int
    data_mb: int

@app.get("/")
def home():
    """Home page of the API"""
    return {
        "message": "🛡️ Insider Threat Detection System",
        "status": "RUNNING",
        "how_to_use": "Send POST request to /detect with employee activity data"
    }

@app.get("/health")
def health_check():
    """Check if API is working"""
    return {
        "status": "healthy",
        "model_loaded": True,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/detect")
def detect_threat(activity: ActivityRequest) -> Dict:
    """
    Analyze employee activity and return risk score
    """
    try:
        # Calculate sensitive ratio
        sensitive_ratio = activity.sensitive_files / (activity.files_accessed + 1)
        
        # Prepare features
        features = np.array([[
            float(activity.login_hour),
            float(activity.files_accessed),
            float(activity.sensitive_files),
            float(activity.data_mb),
            float(sensitive_ratio)
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Get prediction - CONVERT numpy types to Python types
        prediction = int(model.predict(features_scaled)[0])
        anomaly_score = float(model.score_samples(features_scaled)[0])
        
        # Calculate risk score (0-100)
        if prediction == -1:  # Anomaly detected
            risk_score = min(100, max(0, int(abs(anomaly_score) * 80)))
        else:
            risk_score = 0
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "🔴 CRITICAL"
            action = "IMMEDIATE BLOCK - Alert security team"
        elif risk_score >= 50:
            risk_level = "🟠 HIGH"
            action = "Urgent review required"
        elif risk_score >= 30:
            risk_level = "🟡 MEDIUM"
            action = "Monitor closely"
        elif risk_score >= 10:
            risk_level = "🔵 LOW"
            action = "Log for pattern analysis"
        else:
            risk_level = "✅ NORMAL"
            action = "No action needed"
        
        # Get employee's normal behavior
        emp_data = df[df['employee_id'] == activity.employee_id]
        if len(emp_data) > 0:
            normal_files = float(emp_data['files_accessed'].mean())
            normal_hour = float(emp_data['login_hour'].mean())
        else:
            normal_files = float(df['files_accessed'].mean())
            normal_hour = float(df['login_hour'].mean())
        
        # Convert is_anomaly to Python bool
        is_anomaly = bool(prediction == -1)
        
        return {
            "employee_id": str(activity.employee_id),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_anomaly": is_anomaly,
            "risk_score": int(risk_score),
            "risk_level": str(risk_level),
            "recommended_action": str(action),
            "details": {
                "current_files": int(activity.files_accessed),
                "normal_files_baseline": round(normal_files, 1),
                "current_login_hour": float(activity.login_hour),
                "normal_login_hour": round(normal_hour, 1),
                "files_deviation": round(float(activity.files_accessed - normal_files), 1)
            }
        }
    
    except Exception as e:
        print(f"❌ Error in detect_threat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics")
def get_statistics():
    """Get system statistics"""
    total_employees = int(df['employee_id'].nunique())
    total_records = int(len(df))
    anomalies = int(df['is_anomaly'].sum())
    
    return {
        "total_employees": total_employees,
        "total_activities_trained": total_records,
        "anomaly_rate": f"{anomalies/total_records*100:.1f}%",
        "model_status": "active"
    }

print("\n" + "=" * 50)
print("✅ API IS READY TO START!")
print("=" * 50)
print("\n📡 Starting server at http://localhost:8000")
print("📖 Interactive docs at http://localhost:8000/docs")
print("\n⚠️  Keep this terminal running!")
print("   Press Ctrl+C to stop the server")
print("=" * 50)

# Run the API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)