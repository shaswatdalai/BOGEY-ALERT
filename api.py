from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from typing import Dict, List
import asyncio

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

# Load Exceptions Manager
try:
    from exceptions_manager import ExceptionsManager
    exceptions_manager = ExceptionsManager()
    print("✅ Exceptions Manager loaded successfully!")
except Exception as e:
    print(f"⚠️ Exceptions Manager not loaded: {e}")
    exceptions_manager = None

# Try to load RAG pipeline
rag_pipeline = None
try:
    from rag_pipeline import RAGPipeline
    rag_pipeline = RAGPipeline()
    print("✅ RAG Pipeline loaded successfully!")
except Exception as e:
    print(f"⚠️ RAG Pipeline not available: {e}")

# Create the API app
app = FastAPI(
    title="BOGEY-ALERT - Insider Threat Detection System",
    description="Privacy-preserving AI-based insider threat detection with RAG",
    version="2.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Define request model
class ActivityRequest(BaseModel):
    employee_id: str
    login_hour: float
    files_accessed: int
    sensitive_files: int
    data_mb: int
    file_names: List[str] = None
    max_sensitivity: int = 0

@app.get("/")
def home():
    return {
        "message": "🛡️ BOGEY-ALERT - Insider Threat Detection System",
        "status": "RUNNING",
        "version": "2.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "rag_available": rag_pipeline is not None,
        "exceptions_available": exceptions_manager is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/detect")
def detect_threat(activity: ActivityRequest) -> Dict:
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
        
        features_scaled = scaler.transform(features)
        
        prediction = int(model.predict(features_scaled)[0])
        anomaly_score = float(model.score_samples(features_scaled)[0])
        
        # Calculate risk score
        if prediction == -1:
            risk_score = min(100, max(0, int(abs(anomaly_score) * 80)))
        else:
            risk_score = 0
        
        # Check for exceptions FIRST
        exception = None
        if exceptions_manager and risk_score > 0:
            exception = exceptions_manager.check_exception(
                activity.employee_id,
                {
                    "files_accessed": activity.files_accessed,
                    "sensitive_files": activity.sensitive_files,
                    "login_hour": activity.login_hour
                }
            )
            
            if exception and exception.get("exempted"):
                risk_score = 0
                risk_level = "✅ EXEMPTED"
                action = f"Approved: {exception.get('reason')}"
                
                # Return exempted response
                response = {
                    "employee_id": str(activity.employee_id),
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "is_anomaly": False,
                    "risk_score": 0,
                    "risk_level": risk_level,
                    "recommended_action": action,
                    "exempted": True,
                    "exemption_reason": exception.get("reason"),
                    "file_names": activity.file_names[:5] if activity.file_names else []
                }
                
                # Broadcast alert if high risk would have been
                if risk_score >= 50:
                    asyncio.create_task(manager.broadcast(response))
                
                return response
        
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
            normal_role = emp_data['role'].iloc[0] if 'role' in emp_data.columns else "employee"
        else:
            normal_files = float(df['files_accessed'].mean())
            normal_hour = float(df['login_hour'].mean())
            normal_role = "employee"
        
        # RAG Explanation
        rag_explanation = None
        if rag_pipeline and risk_score > 0:
            try:
                anomaly_data = {
                    "employee_id": activity.employee_id,
                    "role": normal_role,
                    "login_hour": activity.login_hour,
                    "files_accessed": activity.files_accessed,
                    "sensitive_files": activity.sensitive_files,
                    "data_mb": activity.data_mb
                }
                rag_explanation, _ = rag_pipeline.generate_explanation(
                    anomaly_data, risk_score, risk_level
                )
            except Exception as e:
                print(f"⚠️ RAG error: {e}")
        
        response = {
            "employee_id": str(activity.employee_id),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "is_anomaly": bool(prediction == -1),
            "risk_score": int(risk_score),
            "risk_level": str(risk_level),
            "recommended_action": str(action),
            "details": {
                "current_files": int(activity.files_accessed),
                "normal_files_baseline": round(normal_files, 1),
                "current_login_hour": float(activity.login_hour),
                "normal_login_hour": round(normal_hour, 1),
                "files_deviation": round(float(activity.files_accessed - normal_files), 1)
            },
            "file_names": activity.file_names[:5] if activity.file_names else [],
            "rag_explanation": rag_explanation
        }
        
        # Broadcast high-risk alerts
        if risk_score >= 50:
            asyncio.create_task(manager.broadcast(response))
        
        return response
    
    except Exception as e:
        print(f"❌ Error in detect_threat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics")
def get_statistics():
    total_employees = int(df['employee_id'].nunique())
    total_records = int(len(df))
    anomalies = int(df['is_anomaly'].sum())
    
    return {
        "total_employees": total_employees,
        "total_activities_trained": total_records,
        "anomaly_rate": f"{anomalies/total_records*100:.1f}%",
        "model_status": "active",
        "rag_available": rag_pipeline is not None,
        "exceptions_available": exceptions_manager is not None
    }

@app.get("/exceptions")
def get_exceptions(employee_id: str = None):
    if not exceptions_manager:
        return {"error": "Exceptions manager not available"}
    
    exceptions = exceptions_manager.get_active_exceptions(employee_id)
    return {"exceptions": exceptions}

@app.post("/exceptions/project")
def add_project_exception(project: dict):
    if not exceptions_manager:
        raise HTTPException(status_code=500, detail="Exceptions manager not available")
    
    exceptions_manager.add_project(project)
    return {"status": "success", "message": "Project exception added"}

@app.post("/exceptions/override")
def add_override(override: dict):
    if not exceptions_manager:
        raise HTTPException(status_code=500, detail="Exceptions manager not available")
    
    exceptions_manager.add_override(override)
    return {"status": "success", "message": "Override added"}

print("\n" + "=" * 50)
print("✅ API IS READY TO START!")
print("=" * 50)
print("\n📡 Starting server at http://0.0.0.0:8000")
print("📖 Interactive docs at http://localhost:8000/docs")
print("\n⚠️  Keep this terminal running!")
print("   Press Ctrl+C to stop the server")
print("=" * 50)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)