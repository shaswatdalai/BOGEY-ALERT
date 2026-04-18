# 🛡️ BOGEY - ALERT

## Privacy-Aware AI-Based Insider Threat Detection System

---

## 📋 PROJECT OVERVIEW

**BOGEY - ALERT** is an intelligent insider threat detection system that uses machine learning to identify suspicious employee behavior while preserving privacy. The system learns normal work patterns of employees and automatically flags anomalies that could indicate data theft or policy violations.

### Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Anomaly Detection** | Uses Isolation Forest AI model to identify unusual behavior |
| 📊 **Risk Scoring** | 0-100 scale with severity levels (NORMAL → LOW → MEDIUM → HIGH → CRITICAL) |
| 🖥️ **Visual Dashboard** | Beautiful HTML interface for real-time monitoring |
| 🔒 **Privacy First** | All processing runs locally - no data leaves the server |
| ⚡ **REST API** | FastAPI backend for real-time predictions |
| 📈 **High Accuracy** | 91%+ accuracy on test data |

---

## 🎯 WHAT THIS SYSTEM DOES

### Detects These Suspicious Activities:

- ✅ **Unusual login times** (3 AM access when normally 9 AM)
- ✅ **Bulk file downloads** (500 files vs normal 10-15 files)
- ✅ **Excessive sensitive file access** (Accessing confidential data outside job role)
- ✅ **Abnormal data volume** (Downloading GBs of data)

### Example Detection:

| Scenario | Behavior | Risk Score | Result |
|----------|----------|------------|--------|
| Normal Employee | 9 AM login, 10 files | 0% | ✅ NORMAL |
| Suspicious Employee | 3 AM login, 500 files | 64% | 🟠 HIGH RISK |
| Data Theft Attempt | 11 PM, 80 sensitive files | 63% | 🟠 HIGH RISK |

---

## 🏗️ PROJECT STRUCTURE


threat_detector/
│
├── 📄 generate_data.py # Creates synthetic employee data
├── 📄 employee_logs.csv # 600 records of 20 employees (30 days)
├── 📄 anomaly_detector.py # Trains the Isolation Forest model
├── 📄 anomaly_model.pkl # Trained AI model (the "brain")
├── 📄 scaler.pkl # Data normalizer for the model
├── 📄 api.py # FastAPI server for real-time detection
├── 📄 dashboard.html # Visual dashboard for monitoring
├── 📄 demo.py # Test script for API
└── 📄 README.md # This file



---

## 🚀 WHAT I BUILT (50% COMPLETE)

### ✅ Completed Features

| Component | Status | Description |
|-----------|--------|-------------|
| Synthetic Data Generator | ✅ DONE | Creates realistic employee activity logs |
| Anomaly Detection Model | ✅ DONE | Isolation Forest trained on 600 records |
| Risk Scoring Engine | ✅ DONE | 0-100 scale with 5 severity levels |
| REST API | ✅ DONE | FastAPI endpoint for predictions |
| Visual Dashboard | ✅ DONE | HTML/CSS/JS interface |
| Real-time Monitoring | ✅ DONE | Automatic activity simulation |

### 📊 Model Performance


Training Data: 600 employee activity records
Employees: 20 employees × 30 days
Anomaly Rate: 10% (58 anomalies)
Model Accuracy: 91.2%
Response Time: <100ms per request


---

## 🔧 HOW TO RUN THE SYSTEM

### Prerequisites

```bash
# Install required packages
pip install pandas numpy scikit-learn fastapi uvicorn joblib requests

Step 1: Open VS Code Terminal
Open VS Code and open your threat_detector folder. Then open a new terminal.

Step 2: Install Required Packages
Copy and paste this command in terminal and press Enter:

pip install pandas numpy scikit-learn fastapi uvicorn joblib requests
Step 3: Generate Employee Data
Copy and paste:

python generate_data.py
Wait for it to finish. You should see "✅ Data generation complete!"

Step 4: Train the AI Model
Copy and paste:


python anomaly_detector.py
Wait for it to finish. You should see "✅ MODEL BUILDING COMPLETE!"

Step 5: Start the API Server
Copy and paste:


python api.py
You will see "Uvicorn running on http://127.0.0.1:8000". Keep this terminal open and running. Do not close it.

Step 6: Open the Dashboard
Open a new terminal. Click the plus (+) icon in the terminal panel.

In the new terminal, type:


start dashboard.html
Or simply double click the dashboard.html file from your folder.

Step 7: Test the System
On the dashboard that opened in your browser:

Click the "Suspicious (3 AM, 500 files)" button.

You will see a risk score of around 60-70% with HIGH risk level.

Click the "Normal Employee (9 AM, 10 files)" button.

You will see a risk score of 0% with NORMAL status.

Step 8: Stop the System
To stop the API server, go back to the first terminal and press:

Ctrl + C
Done!
That's all. Your system is now working.

