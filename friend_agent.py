import os
import time
import requests
import json
import re
from datetime import datetime
from pathlib import Path

# ============================================
# CONFIGURATION - USE YOUR NGROK URL
# ============================================
YOUR_API_URL = "https://septum-agony-skillful.ngrok-free.dev"  # ← Local testing URL

EMPLOYEE_ID = "EMP_002"  # Employee ID for your friend
# ============================================

# ============================================
# COMPANY DATA DETECTOR (Integrated)
# ============================================

class CompanyDataDetector:
    def __init__(self):
        # Company data keywords (what to alert on)
        self.sensitive_keywords = [
            'customer', 'client', 'user', 'patient', 'member', 'account',
            'employee', 'staff', 'salary', 'payroll', 'hr', 'benefits', 'compensation',
            'financial', 'revenue', 'profit', 'invoice', 'payment', 'transaction', 'bank',
            'source', 'code', 'repository', 'git', 'commit', 'database', 'backup', 'dump',
            'api_key', 'secret', 'token', 'password', 'credential', 'key', 'certificate',
            'confidential', 'internal', 'restricted', 'proposal', 'contract', 'nda'
        ]
        
        # Safe keywords (will NOT trigger alert)
        self.safe_keywords = [
            'vacation', 'holiday', 'personal', 'family', 'friend',
            'recipe', 'cooking', 'movie', 'song', 'music', 'game',
            'shopping', 'food', 'restaurant', 'travel', 'photo', 'image', 
            'video', 'audio', 'test', 'file', 'temp', 'dummy'
        ]
        
        # File patterns for sensitivity classification
        self.file_patterns = {
            "credentials": {
                "keywords": ["api_key", "secret", "token", "password", "credential", "key"],
                "extensions": [".key", ".pem", ".crt", ".env", ".p12"],
                "sensitivity": "CRITICAL",
                "score": 100
            },
            "customer_data": {
                "keywords": ["customer", "client", "user", "patient", "member", "account"],
                "extensions": [".csv", ".xlsx", ".json"],
                "sensitivity": "HIGH",
                "score": 70
            },
            "financial_data": {
                "keywords": ["salary", "payroll", "financial", "revenue", "profit", "invoice", "payment", "transaction", "bank"],
                "extensions": [".xlsx", ".csv", ".pdf"],
                "sensitivity": "HIGH",
                "score": 70
            },
            "source_code": {
                "keywords": ["source", "code", "repository", "git", "commit", "database", "backup"],
                "extensions": [".py", ".js", ".java", ".go", ".cpp", ".c", ".h"],
                "sensitivity": "HIGH",
                "score": 70
            },
            "internal_documents": {
                "keywords": ["internal", "confidential", "restricted", "proposal", "contract", "nda"],
                "extensions": [".pdf", ".docx", ".doc"],
                "sensitivity": "MEDIUM",
                "score": 40
            }
        }
    
    def analyze_file(self, file_name):
        """
        Analyze a file to determine if it contains company data
        Returns: dict with sensitivity, score, reason
        """
        file_lower = file_name.lower()
        
        # First check safe keywords
        for safe_word in self.safe_keywords:
            if safe_word in file_lower:
                return {
                    "is_company_data": False,
                    "sensitivity": "NONE",
                    "score": 0,
                    "reason": f"Personal file (contains '{safe_word}')"
                }
        
        # Check each sensitive pattern
        for data_type, patterns in self.file_patterns.items():
            
            # Check keywords
            for keyword in patterns.get("keywords", []):
                if keyword in file_lower:
                    return {
                        "is_company_data": True,
                        "sensitivity": patterns["sensitivity"],
                        "score": patterns["score"],
                        "reason": f"File contains {data_type} (keyword: '{keyword}')",
                        "data_type": data_type
                    }
            
            # Check extensions
            for ext in patterns.get("extensions", []):
                if file_name.endswith(ext):
                    return {
                        "is_company_data": True,
                        "sensitivity": patterns["sensitivity"],
                        "score": patterns["score"],
                        "reason": f"File type {ext} is associated with {data_type}",
                        "data_type": data_type
                    }
        
        # Check general sensitive keywords
        for keyword in self.sensitive_keywords:
            if keyword in file_lower:
                return {
                    "is_company_data": True,
                    "sensitivity": "MEDIUM",
                    "score": 40,
                    "reason": f"File contains sensitive keyword: '{keyword}'"
                }
        
        return {
            "is_company_data": False,
            "sensitivity": "NONE",
            "score": 0,
            "reason": "No company data detected"
        }
    
    def generate_rag_explanation(self, analysis_result, file_name, employee_id):
        """Generate contextual explanation for RAG"""
        if not analysis_result["is_company_data"]:
            return None
        
        return f"""
[BOGEY-ALERT] COMPANY DATA DETECTED

FILE: {file_name}
EMPLOYEE: {employee_id}
DETECTION REASON: {analysis_result['reason']}
SENSITIVITY LEVEL: {analysis_result['sensitivity']}
RISK SCORE: {analysis_result['score']}/100

[WARNING] This file matches company data patterns.

Recommended Action: 
   - CRITICAL/HIGH: Immediate security review required
   - MEDIUM: Monitor and log for pattern analysis

Company Policy: Unauthorized access to sensitive data without 
business justification is a violation of company policy.
"""


# Initialize the detector
company_detector = CompanyDataDetector()

# ============================================
# FILE SENSITIVITY SCORING
# ============================================

# Company-specific sensitive modules
COMPANY_MODULES = [
    'api.py', 'anomaly_model.pkl', 'scaler.pkl', 'employee_logs.csv', 
    'exceptions.json', 'exceptions_manager.py', 'rag_pipeline.py', 
    'vector_store.py', 'policies'
]

def get_file_sensitivity_score(filename, ext):
    """Return sensitivity score based on file type and company modules"""
    filename_lower = filename.lower()
    
    # Company Module Check (Highest Sensitivity)
    if any(mod in filename_lower for mod in COMPANY_MODULES):
        return 100

    # Extension based sensitivity
    critical = ['.key', '.pem', '.crt', '.p12']
    high = ['.xlsx', '.csv', '.sql', '.db', '.mdb']
    medium = ['.pdf', '.docx', '.doc', '.pptx', '.zip', '.rar']
    low = ['.jpg', '.png', '.mp4', '.mp3', '.txt']
    
    if ext in critical:
        return 100
    elif ext in high:
        return 70
    elif ext in medium:
        return 40
    elif ext in low:
        return 10
    else:
        return 0


# ============================================
# FILE MONITORING AGENT
# ============================================

class DeltaFileMonitor:
    def __init__(self):
        self.monitored_folders = [
            str(Path.home() / "Downloads"),
            str(Path.home() / "Documents"),
            str(Path.home() / "Desktop"),
            os.getcwd()
        ]
        self.known_files = self._get_all_current_files()
    
    def _get_all_current_files(self):
        """Returns a set of absolute file paths currently on disk"""
        current_files = set()
        for folder in self.monitored_folders:
            if not os.path.exists(folder):
                continue
            for file in Path(folder).iterdir():
                if file.is_file():
                    current_files.add(str(file.absolute()))
        return current_files

    def get_new_activity(self):
        """Count ONLY files that are NEW since the last check"""
        activity = {
            "total_files": 0,
            "sensitive_files": 0,
            "total_size_mb": 0,
            "file_names": [],
            "max_sensitivity": 0,
            "company_data_files": []
        }
        
        current_files = self._get_all_current_files()
        new_files = current_files - self.known_files
        self.known_files = current_files
        
        for file_path in new_files:
            file = Path(file_path)
            activity["total_files"] += 1
            activity["file_names"].append(file.name)
            
            # Analyze file for company data
            analysis = company_detector.analyze_file(file.name)
            
            if analysis["is_company_data"]:
                activity["company_data_files"].append({
                    "name": file.name,
                    "sensitivity": analysis["sensitivity"],
                    "score": analysis["score"],
                    "reason": analysis["reason"]
                })
                activity["sensitive_files"] += 1
            
            ext = file.suffix.lower()
            file_sensitivity = get_file_sensitivity_score(file.name, ext)
            
            # Use the higher of company data sensitivity or extension sensitivity
            final_sensitivity = max(file_sensitivity, analysis.get("score", 0))
            
            if final_sensitivity > activity["max_sensitivity"]:
                activity["max_sensitivity"] = final_sensitivity
            
            try:
                size_mb = os.path.getsize(file) / (1024 * 1024)
                activity["total_size_mb"] += size_mb
            except:
                pass
                
        return activity
    
    def send_alert(self, activity):
        """Send activity to BOGEY-ALERT API"""
        if activity["total_files"] == 0:
            return None 

        try:
            data = {
                "employee_id": EMPLOYEE_ID,
                "login_hour": datetime.now().hour,
                "files_accessed": activity["total_files"],
                "sensitive_files": activity["sensitive_files"],
                "data_mb": int(activity["total_size_mb"]),
                "file_names": activity["file_names"],
                "max_sensitivity": activity["max_sensitivity"],
                "company_data_files": activity["company_data_files"]
            }
            
            headers = {"ngrok-skip-browser-warning": "true"}
            
            response = requests.post(
                f"{YOUR_API_URL}/detect",
                json=data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Print detailed alert for company data
                if activity["company_data_files"]:
                    print(f"\n{'*'*60}")
                    print(f"🛡️ SECURITY NOTIFICATION")
                    print(f"{'*'*60}")
                    print("The following sensitive files were recently created or accessed:")
                    for cd in activity["company_data_files"]:
                        print(f"  → {cd['name']}")
                    print("\nAs a friendly reminder, please ensure you follow the company's")
                    print("data handling policies when working with restricted files.")
                    print(f"{'*'*60}\n")
                
                return result
                
        except Exception as e:
            pass
        
        return None
    
    def run(self):
        print(f"\n👋 Welcome {EMPLOYEE_ID}! Hope you are having a nice day.\n")
        print(f"""
+--------------------------------------------------------------+
|              COMPANY DEVICE MONITORING AGENT                 |
+--------------------------------------------------------------+
|  Employee: {EMPLOYEE_ID:<48}|
|  Server: {YOUR_API_URL:<50}|
|  Status: ACTIVE                                              |
|  Note: Your file activity is securely monitored for safety.  |
+--------------------------------------------------------------+
        """)
        
        print("[INFO] Monitoring folders:")
        for folder in self.monitored_folders:
            if os.path.exists(folder):
                print(f"   [OK] {folder}")
            else:
                print(f"   [MISSING] {folder} (not found)")
        
        print("\n" + "="*60)
        print("Agent is running. Sending data every 5 seconds...")
        print("Press Ctrl+C to stop")
        print("="*60 + "\n")
        
        try:
            while True:
                time.sleep(5)
                
                current_activity = self.get_new_activity()
                
                if current_activity["total_files"] == 0:
                    continue
                
                # Print summary
                if current_activity["company_data_files"]:
                    print(f"[*] [{datetime.now().strftime('%H:%M:%S')}] Processing {len(current_activity['company_data_files'])} synced files...")
                    self.send_alert(current_activity)
                else:
                    print(f"[*] [{datetime.now().strftime('%H:%M:%S')}] Synced {current_activity['total_files']} local files successfully.")
                    # Don't send alert for personal files
                
        except KeyboardInterrupt:
            print("\n\nAgent stopped.")
            print("Thank you for using BOGEY-ALERT!")


def run_simulation():
    """Send fake high-risk alerts immediately for dashboard testing."""
    print("[SIMULATION MODE] Sending test alerts to dashboard...")
    print(f"Target: {YOUR_API_URL}")
    print("=" * 60)

    scenarios = [
        {
            "label": "CRITICAL - Credentials + After-Hours",
            "data": {
                "employee_id": "FRIEND_001",
                "login_hour": 2,
                "files_accessed": 320,
                "sensitive_files": 45,
                "data_mb": 4200,
                "file_names": ["secret_api_key.txt", "payroll_july.xlsx", "internal_strategy_nda.pdf", "financial_report_q3.csv"],
                "max_sensitivity": 100
            }
        },
        {
            "label": "HIGH - Bulk Download During Work Hours",
            "data": {
                "employee_id": "FRIEND_001",
                "login_hour": 14,
                "files_accessed": 180,
                "sensitive_files": 20,
                "data_mb": 1500,
                "file_names": ["customer_data.xlsx", "employee_records.csv", "financial_report_q3.csv"],
                "max_sensitivity": 70
            }
        },
        {
            "label": "MEDIUM - Sensitive File Access",
            "data": {
                "employee_id": "FRIEND_001",
                "login_hour": 10,
                "files_accessed": 15,
                "sensitive_files": 5,
                "data_mb": 200,
                "file_names": ["internal_strategy_nda.pdf", "contract_draft.docx"],
                "max_sensitivity": 40
            }
        }
    ]

    for scenario in scenarios:
        print(f"\n[SENDING] {scenario['label']}")
        try:
            response = requests.post(
                f"{YOUR_API_URL}/detect",
                json=scenario["data"],
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                print(f"  -> Risk Score : {result['risk_score']}/100")
                print(f"  -> Risk Level : {result['risk_level']}")
                print(f"  -> Action     : {result['recommended_action']}")
                print(f"  -> Status     : ALERT SENT TO DASHBOARD")
            else:
                print(f"  -> ERROR: API returned {response.status_code}")
        except Exception as e:
            print(f"  -> FAILED: {e}")
        time.sleep(1)

    print("\n" + "=" * 60)
    print("[DONE] All simulation alerts sent!")
    print("Check your dashboard at http://localhost:5173")
    print("=" * 60)


if __name__ == "__main__":
    import sys
    if "--simulate" in sys.argv or "-s" in sys.argv:
        run_simulation()
    else:
        monitor = DeltaFileMonitor()
        monitor.run()
