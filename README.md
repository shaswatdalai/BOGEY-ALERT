# 🛡️ BOGEY-ALERT

### Privacy-Aware AI-Based Insider Threat Detection System

**BOGEY-ALERT** is an intelligent, full-stack insider threat detection system. It uses **Machine Learning** to identify suspicious employee behavior (like anomalous off-hours access or massive bulk downloads), and pairs it with a **Retrieval-Augmented Generation (RAG)** pipeline to automatically cite company policies when violations occur.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **Anomaly Detection** | Uses an Isolation Forest ML model to identify unusual file access behavior based on historical baselines. |
| 📖 **RAG Explanations** | Uses ChromaDB and SentenceTransformers to read company policy files and generate human-readable security narratives. |
| 🛡️ **Real-time Agent** | Client-side Python agent continuously monitors employee file activity and detects sensitive data via pattern matching. |
| 🖥️ **Live Dashboard** | Beautiful React SPA built with Vite and Tailwind CSS to monitor threats and exceptions via WebSockets in real-time. |
| 🔐 **Exceptions Manager** | Whitelist specific users/projects dynamically so authorized massive downloads don't trigger false alarms. |

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Python, FastAPI, WebSockets
* **Machine Learning:** Scikit-Learn (Isolation Forest), Pandas, NumPy
* **Vector Database (RAG):** ChromaDB, SentenceTransformers
* **Networking:** Ngrok (for remote agent connectivity)

---

## 🚀 Quick Start Guide

### 1. Backend Setup & ML Training
Open a terminal in the root directory and run the following:

```bash
# 1. Install dependencies
pip install pandas numpy scikit-learn fastapi uvicorn joblib requests chromadb sentence-transformers

# 2. Generate the training dataset
python generate_data.py

# 3. Train the Machine Learning model
python anomaly_detector.py

# 4. Start the FastAPI backend server
python api.py
```

### 2. Frontend Setup
Open a second terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```
*Your dashboard will be available at `http://localhost:5173`*

### 3. Running the Monitoring Agent (Client-Side)
To simulate an employee's machine connecting to your server:

1. **Start Ngrok:** Run `.\ngrok.exe http 9091` to expose your local API to the internet.
2. **Update the Agent:** Open `friend_agent.py` and update `YOUR_API_URL` to the public Ngrok URL.
3. **Run the Agent:** Execute `python friend_agent.py` on the client's machine.
4. **Trigger an Alert:** You can run `python simulate_breach.py` to securely test various insider threat scenarios (e.g., bulk database exports or late-night credentials access).

---

## 📂 Architecture Overview

* `api.py` - Main FastAPI backend server and WebSocket hub.
* `friend_agent.py` - Client-side folder monitoring script.
* `simulate_breach.py` - Threat simulation generator.
* `rag_pipeline.py` & `vector_store.py` - Handles ChromaDB indexing and policy explanation generation.
* `company_data_detector.py` - Regex and pattern matching for identifying sensitive data (API keys, PII).
* `frontend/` - Contains the complete React SPA application.
* `chroma_db/` & `policies/` - Local vector database and raw `.txt` company policies.
