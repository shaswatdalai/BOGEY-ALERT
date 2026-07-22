# 🛡️ Project Deep-Dive: BOGEY-ALERT v2.0
### *Next-Gen AI Insider Threat Detection & Autonomous Interrogation System*

---

## 📌 1. What is BOGEY-ALERT?

**BOGEY-ALERT** is a **full-stack, AI-powered Security Operations Center (SOC) dashboard and real-time endpoint monitoring platform**. It transforms raw employee behavior (file access, access timing, sensitive data interactions, data volumes) into actionable security intelligence.

Unlike conventional security monitoring systems that simply log events or issue static alerts, **BOGEY-ALERT** actively **detects behavioral anomalies**, **explains violations using company policy via RAG (Retrieval-Augmented Generation)**, and **autonomously interrogates employees using Groq LLM (Llama 3)** to evaluate their business justifications on the spot.

---

## 💥 2. The Problem It Solves

### **The Insider Threat Problem**
According to cybersecurity statistics, over **60% of data breaches involve insider threats** (disgruntled employees, compromised credentials, or careless staff). Traditional tools struggle with insider threats because:

1. **Rigid Static Rules Cause Alert Fatigue:** Traditional SIEMs (Security Information and Event Management) use hardcoded rules (e.g., *"Alert if > 100 files are downloaded"*). This generates thousands of false alarms for legitimate project leads while missing stealthy exfiltrations (e.g., exfiltrating 5 critical API keys at 3:00 AM).
2. **Lack of Context:** Security analysts receive raw log lines (`EMP_002 accessed 45 files`). The analyst has no idea *why* this violates company policy or *what specific sensitive content* was accessed without spending hours manually cross-referencing policy docs.
3. **Slow Response Time:** When a suspicious action occurs, contacting the employee and getting a manager's confirmation takes hours or days. By then, the sensitive data has already left the building.
4. **No Smart Exemption Handling:** When employees work on legitimate heavy-data projects (e.g., database migrations), static tools keep flagging them continuously.

---

## 🚀 3. How We Can Use It Instead of Current Solutions & Why It’s Better

| Feature / Dimension | Traditional Solutions (SIEMs / Basic EDRs) | **BOGEY-ALERT v2.0** |
| :--- | :--- | :--- |
| **Anomaly Detection** | Threshold-based static rules (e.g., download > X MB) | **Multi-dimensional Machine Learning (Isolation Forest)** baseline per employee behavior. |
| **Alert Explanation** | Raw log dumps and cryptic error codes | **RAG Security Narratives** explaining *exact* policy violations and sensitive file content. |
| **Response & Interrogation** | Manual email/call by SOC analyst hours later | **Autonomous Groq (Llama 3) LLM Interrogation** in real-time right at the endpoint. |
| **Sensitive Data Inspection** | Requires expensive third-party DLP agents | **Native Pattern Classifier** (`CompanyDataDetector`) scanning credentials, customer PII, source code, and financial files. |
| **False Positive Handling** | Manual suppression or rule disabling | **Dynamic Exception Manager** supporting project-based whitelisting and temporary overrides. |
| **SOC User Interface** | Cluttered, legacy enterprise tables | **Modern Luxury Glassmorphism UI** with dynamic ambient color shifts and real-time WebSockets. |

---

## 🧱 4. Project Technology Stack & What Each Component Brings

### 1. 🤖 **Groq Cloud API + Llama 3 (`llama3-8b-8192`)**
* **What it brings:** Lightning-fast LLM inference.
* **Role in BOGEY-ALERT:** Powers the **AI Security Auditor Interrogation Engine**. When an employee triggers a `HIGH` or `CRITICAL` alert, the system prompts them for a business justification. Groq processes their response in sub-seconds and determines whether to **ACCEPT** (de-escalate risk) or **REJECT** (escalate to CRITICAL block).

### 2. 📖 **RAG Pipeline (ChromaDB + SentenceTransformers)**
* **What it brings:** Local, privacy-preserving semantic search over company documents using 384-dimensional embeddings (`all-MiniLM-L6-v2`).
* **Role in BOGEY-ALERT:** Indexing internal company policy files in `./policies` (`vector_store.py`). When an anomaly is detected, it retrieves exact policy rules and generates a natural-language narrative for SOC analysts.

### 3. 🧠 **Machine Learning Model (Isolation Forest)**
* **What it brings:** Unsupervised anomaly detection using `scikit-learn` and `StandardScaler`.
* **Role in BOGEY-ALERT:** Evaluates 5 core dimensions: `login_hour`, `files_accessed`, `sensitive_files`, `data_mb`, and `sensitive_ratio`. Calculates a continuous risk score (0 to 100).

### 4. ⚡ **FastAPI & WebSockets Backend**
* **What it brings:** Asynchronous Python backend running on Uvicorn.
* **Role in BOGEY-ALERT:** Hosts threat detection endpoints (`/detect`), interrogation endpoints (`/interrogate`), exception management (`/exceptions`), and broadcasts live alert updates to all connected browser sessions via WebSockets.

### 5. 🛡️ **Real-Time Endpoint Monitoring Agent (`friend_agent.py`)**
* **What it brings:** Client-side background daemon.
* **Role in BOGEY-ALERT:** Monitors folders (`Downloads`, `Documents`, `Desktop`, project directory) every 5 seconds. Uses `CompanyDataDetector` to check for sensitive patterns (API keys, credentials, payroll, source code) and transmits data to the API.

### 6. 🔐 **Exceptions & Whitelisting Manager (`exceptions_manager.py`)**
* **What it brings:** Rules engine for temporary & project-based exemptions stored in `exceptions.json`.
* **Role in BOGEY-ALERT:** Automatically suppresses risk scores for authorized team members working on pre-approved high-volume tasks.

### 7. 💎 **Luxury Tech Frontend (React 19 + Tailwind v4 + Framer Motion)**
* **What it brings:** State-of-the-art SOC Dashboard interface.
* **Role in BOGEY-ALERT:** Translucent dark glassmorphism layout, real-time audio/visual alert badges, ambient neon glow that dynamically reflects page states, live analytics charts, and active exception controls.

---

## 🛠️ 5. Technical Approach & End-to-End Workflow

```
┌────────────────────────┐
│  Client Monitoring     │  Monitors file activity (Downloads/Documents/Desktop)
│   Agent (friend_agent) │  Scans filename & type with CompanyDataDetector
└───────────┬────────────┘
            │
            ▼  HTTP POST /detect
┌────────────────────────┐
│   FastAPI Backend      │  Scales features & predicts anomaly via Isolation Forest
│        (api.py)        │  Checks ExceptionsManager for active whitelists
└───────────┬────────────┘
            │
            ├───────────────► 📖 RAG Pipeline (ChromaDB + SentenceTransformers)
            │                  Retrieves company policies & builds narrative explanation
            │
            ├───────────────► ⚡ WebSocket ConnectionManager
            │                  Broadcasts real-time alert to React SOC Dashboard
            │
            ▼ If Risk >= HIGH
┌────────────────────────┐
│  Autonomous AI         │  Endpoint agent pauses employee & requests justification
│  Interrogation Engine  │  Groq (Llama 3) evaluates explanation (ACCEPTED/REJECTED)
└────────────────────────┘
```

### Step-by-Step Flow:
1. **Detection:** The client agent `friend_agent.py` observes new files being accessed/downloaded.
2. **Analysis & Scoring:** `api.py` runs the inputs through the trained Isolation Forest model (`anomaly_detector.py`). If sensitive keywords or high-risk extensions (`.env`, `.pem`, `secret`, `salary`, `api_key`) are present, sensitivity score boosts are applied.
3. **Exemption Verification:** `exceptions_manager.py` checks if the employee belongs to an active, approved project team.
4. **Policy RAG Explanation:** If anomalous, `rag_pipeline.py` queries `vector_store.py` to extract relevant policies and synthesizes a human-readable violation summary.
5. **Real-time SOC Alerting:** WebSockets stream the enriched alert packet to the frontend for instant visualization.
6. **Autonomous AI Interrogation:** If risk is HIGH or CRITICAL, the endpoint prompts the user for a justification. The justification is posted to `/interrogate`, where **Groq Llama 3** reviews it. If valid (e.g., *"Requested by manager for Q3 audit"*), the threat is marked `RESOLVED`. If evasive (e.g., *"No reason, just looking around"*), the risk escalates to `CRITICAL BLOCK`.

---

## 📂 6. Summary of Key Repository Files

| File Path | Description & Responsibilities |
| :--- | :--- |
| `api.py` | **Central REST & WebSocket API**. Orchestrates ML scoring, exception checks, RAG generation, Groq interrogation, and live client broadcasts. |
| `anomaly_detector.py` | **ML Model Trainer**. Prepares feature scaling and trains the `IsolationForest` model on baseline behavior logs. |
| `rag_pipeline.py` | **RAG Engine**. Integrates Vector Store queries with file content analysis to generate human-readable threat narratives. |
| `vector_store.py` | **ChromaDB Vector Store**. Indexes company text policies in `./policies` using local `SentenceTransformers` embeddings. |
| `friend_agent.py` | **Endpoint Guard Script**. Monitors local folders for new files, prompts for business justifications, and sends alerts to the server. |
| `company_data_detector.py` | **Sensitivity Classifier**. Scans filenames and patterns for credentials, customer PII, financial records, and source code. |
| `exceptions_manager.py` | **Whitelisting Engine**. Manages project-based and time-bound override rules in `exceptions.json`. |
| `simulate_breach.py` | **Threat Simulator**. Fires simulated cyber threats (after-hours access, bulk exfiltration) to test the SOC dashboard. |
| `generate_data.py` | **Synthetic Data Generator**. Produces synthetic employee activity logs (`employee_logs.csv`) for training the ML model. |
| `README.md` | **System Documentation**. Setup guides, technical requirements, and architecture summaries. |

---

## 💡 7. Quick Summary of Why This Project Stands Out

1. **Self-Healing / Self-Evaluating Security Loop:** Instead of requiring a human SOC analyst to call the employee, the system **interrogates the user autonomously** using LLM intelligence.
2. **Context-Aware Privacy & Policy Mapping:** It doesn't just say *"Anomalous Download"*; it says *"EMP_002 accessed 45 customer CSVs at 2:00 AM, violating Section 4 of Data Exfiltration Policy"*.
3. **No False-Alarm Fatigue:** Combines ML baselining, pattern sensitivity checks, and dynamic project whitelisting.
4. **State-of-the-Art UX:** Built with a glassmorphism dark mode SOC dashboard.

---

## 🚀 8. Step-by-Step Execution & Testing Guide

### Prerequisites
Make sure Python 3.10+ and Node.js 18+ are installed.

### Step 1: Backend Initialization & ML Training
Open terminal in the project root (`d:\threat_detector`):

```bash
# 1. Install required Python packages
pip install pandas numpy scikit-learn fastapi uvicorn joblib requests chromadb sentence-transformers python-dotenv

# 2. Generate initial baseline synthetic data
python generate_data.py

# 3. Train the Isolation Forest Anomaly Detection Model
python anomaly_detector.py

# 4. Start the FastAPI Backend Server
python api.py
```
*The API server will run at `http://localhost:9091` (or `http://0.0.0.0:9091`).*

---

### Step 2: Launch the Frontend SOC Dashboard
Open a **second terminal window** and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
*Open your web browser and navigate to `http://localhost:5173` to view the Live SOC Dashboard.*

---

### Step 3: Test with the Client Monitoring Agent (`friend_agent.py`)

Open a **third terminal window** in the root directory:

#### Option A: Interactive Live Folder Monitoring
Run the monitor agent:
```bash
python friend_agent.py
```

#### Option B: Automated Simulation Mode
To instantly flood the dashboard with sample threat scenarios without manually creating files:
```bash
python friend_agent.py --simulate
```
*or*
```bash
python simulate_breach.py
```

---

### Step 4: 📝 3 Methods to Create Sensitive Test Files

While `friend_agent.py` is running, use any of these 3 methods to create test files for threat detection:

#### Method 1: Using PowerShell (Fastest & Recommended) ⚡
Run these one-line commands in terminal:

* **Test Case 1: Critical API Key File**
  ```powershell
  New-Item -Path "$env:USERPROFILE\Desktop\secret_api_key.txt" -ItemType File -Value "GROQ_API_KEY=gsk_secret_token_12345"
  ```
* **Test Case 2: Financial Payroll File**
  ```powershell
  New-Item -Path "$env:USERPROFILE\Downloads\payroll_july.xlsx" -ItemType File -Value "Employee,Salary,Bank"
  ```
* **Test Case 3: Customer PII Data File**
  ```powershell
  New-Item -Path "$env:USERPROFILE\Documents\customer_data.csv" -ItemType File -Value "Customer_ID,Email,Credit_Card"
  ```

#### Method 2: Using Notepad GUI 📝
1. Press `Win + R`, type `notepad`, and press **Enter**.
2. Type sensitive text like `GROQ_API_KEY=gsk_123456789` or `Salary details`.
3. Click **File ➔ Save As...** and save to `Desktop` or `Downloads` as `secret_api_key.txt` or `payroll_july.xlsx`.

#### Method 3: Using File Explorer 📂
1. Open your `Desktop`, `Downloads`, or `Documents` folder in Windows File Explorer.
2. Right-click ➔ **New** ➔ **Text Document**.
3. Name it `secret_api_key.txt` or `payroll_july.xlsx`.

---

### Step 5: 🧹 How to Clean Up / Delete Test Files After Testing

When you finish testing, run these commands to remove all generated test files:

#### PowerShell Command (One-Liner):
```powershell
Remove-Item "$env:USERPROFILE\Desktop\secret_api_key.txt", "$env:USERPROFILE\Downloads\payroll_july.xlsx", "$env:USERPROFILE\Documents\customer_data.csv" -ErrorAction SilentlyContinue
```

#### Command Prompt (cmd):
```cmd
del "%USERPROFILE%\Desktop\secret_api_key.txt" "%USERPROFILE%\Downloads\payroll_july.xlsx" "%USERPROFILE%\Documents\customer_data.csv"
```

#### File Explorer (Manual):
Simply delete `secret_api_key.txt` from Desktop, `payroll_july.xlsx` from Downloads, and `customer_data.csv` from Documents.


