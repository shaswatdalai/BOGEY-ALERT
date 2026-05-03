# 🛡️ BOGEY-ALERT v2.0
### *Next-Gen AI Insider Threat Detection & Autonomous Interrogation*

**BOGEY-ALERT** is a professional-grade, full-stack security dashboard designed to detect and respond to insider threats in real-time. It transforms raw behavioral data into actionable security intelligence using Machine Learning and LLM-driven autonomous interrogation.

---

## 💎 The Luxury Tech Experience
The v2.0 update introduces a **Modern Luxury Tech** interface, featuring:
*   **Dark Glassmorphism UI:** A premium, translucent dashboard with dynamic neon-glow transitions that respond to your navigation.
*   **Adaptive Theme Glow:** The entire dashboard's ambient light shifts colors based on the page (e.g., Red for Alerts, Emerald for Employees).
*   **Highly Reactive UX:** Smooth fadeIn animations and responsive layouts built for SOC Analysts.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🤖 **AI Auto-Interrogation** | Integrated with **Groq (llama3)**. During CRITICAL threats, the system automatically "pauses" employee activity and demands a business justification, which is then verified by the LLM. |
| 🧠 **Anomaly Detection** | Uses an **Isolation Forest** ML model to identify unusual behavior (off-hours access, bulk downloads) based on multi-dimensional historical baselines. |
| 📖 **RAG Security Narratives** | A **Retrieval-Augmented Generation** pipeline (ChromaDB + SentenceTransformers) reads company policies and generates human-readable explanations for every violation. |
| 🛡️ **Real-time Monitoring** | Client-side Python agents monitor file activity and detect sensitive data (PII, API Keys, Credentials) via pattern matching. |
| 🔐 **Dynamic Exceptions** | Real-time override manager allows security teams to whitelist authorized heavy-load projects on the fly. |

---

## 🛠️ Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS (v4), Lucide Icons, Framer Motion
*   **Backend:** Python 3.14+, FastAPI, WebSockets
*   **AI/ML:** Scikit-Learn, Groq (Llama 3), ChromaDB, SentenceTransformers
*   **Security:** GitHub Push Protection, Dotenv Secret Management

---

## 🚀 Quick Start Guide

### 1. Security Configuration
Create a `.env` file in the root directory to securely store your API keys:
```text
GROQ_API_KEY=your_gsk_key_here
```

### 2. Backend Setup & ML Training
```bash
# Install dependencies
pip install pandas numpy scikit-learn fastapi uvicorn joblib requests chromadb sentence-transformers python-dotenv

# Initialize the system
python generate_data.py   # Generate training data
python anomaly_detector.py # Train the ML model
python api.py              # Start the FastAPI server (Port 9091)
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Accessible at `http://localhost:5173`*

---

## 📂 Architecture Overview

*   `api.py` - The central hub (FastAPI, WebSockets, Groq Interrogation).
*   `friend_agent.py` - The client-side "Guard" script that monitors folders.
*   `rag_pipeline.py` - Generates policy-based narratives using ChromaDB.
*   `exceptions_manager.py` - Handles real-time whitelisting.
*   `simulate_breach.py` - Test suite for triggering various threat scenarios.
*   `frontend/` - Modern React application with high-contrast glassmorphism.

---

## 🔒 Security Note
This project uses **GitHub Push Protection**. Never hardcode API keys in `api.py`. Always use the `.env` file provided in the setup instructions.
