import json
import re
import os
from pathlib import Path

class CompanyDataDetector:
    def __init__(self, config_file="company_data.json"):
        # Try to load config, create default if not exists
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                self.config = json.load(f)
        else:
            # Default configuration if file doesn't exist
            self.config = {
                "sensitive_keywords": [
                    "customer", "client", "user", "patient", "employee",
                    "salary", "payroll", "financial", "revenue", "profit",
                    "database", "backup", "source", "code", "api_key", "secret"
                ],
                "safe_keywords": [
                    "vacation", "personal", "family", "recipe", "movie", 
                    "music", "game", "photo", "image", "test", "file"
                ],
                "file_patterns": {
                    "customer_data": {
                        "keywords": ["customer", "client", "user"],
                        "regex": [],
                        "sensitivity": "HIGH"
                    },
                    "financial_data": {
                        "keywords": ["salary", "payment", "invoice", "financial"],
                        "regex": [],
                        "sensitivity": "HIGH"
                    },
                    "credentials": {
                        "keywords": ["api_key", "secret", "token", "password"],
                        "extensions": [".key", ".pem", ".env"],
                        "sensitivity": "CRITICAL"
                    },
                    "source_code": {
                        "keywords": ["source", "code", "repository"],
                        "extensions": [".py", ".js", ".java", ".cpp"],
                        "sensitivity": "HIGH"
                    }
                }
            }
    
    def analyze_file(self, file_path, file_name):
        """
        Analyze a file to determine if it contains company data
        Returns: dict with sensitivity, reason, and matched patterns
        """
        
        file_lower = file_name.lower()
        
        # First check if it's safe (not company data)
        for safe_keyword in self.config.get("safe_keywords", []):
            if safe_keyword in file_lower:
                return {
                    "is_company_data": False,
                    "sensitivity": "NONE",
                    "reason": f"File appears to be personal: '{safe_keyword}' detected",
                    "matched_pattern": safe_keyword
                }
        
        # Check each sensitive pattern
        for data_type, patterns in self.config.get("file_patterns", {}).items():
            
            # Check keywords
            for keyword in patterns.get("keywords", []):
                if keyword in file_lower:
                    return {
                        "is_company_data": True,
                        "sensitivity": patterns["sensitivity"],
                        "reason": f"File contains {data_type} (keyword: '{keyword}')",
                        "data_type": data_type,
                        "matched_pattern": keyword
                    }
            
            # Check extensions
            for ext in patterns.get("extensions", []):
                if file_name.endswith(ext):
                    return {
                        "is_company_data": True,
                        "sensitivity": patterns["sensitivity"],
                        "reason": f"File type {ext} is associated with {data_type}",
                        "data_type": data_type,
                        "matched_pattern": ext
                    }
            
            # Check regex patterns
            for regex_pattern in patterns.get("regex", []):
                if re.search(regex_pattern, file_name, re.IGNORECASE):
                    return {
                        "is_company_data": True,
                        "sensitivity": patterns["sensitivity"],
                        "reason": f"File name matches {data_type} pattern: {regex_pattern}",
                        "data_type": data_type,
                        "matched_pattern": regex_pattern
                    }
        
        # Also check general sensitive keywords
        for keyword in self.config.get("sensitive_keywords", []):
            if keyword in file_lower:
                return {
                    "is_company_data": True,
                    "sensitivity": "MEDIUM",
                    "reason": f"File contains sensitive keyword: '{keyword}'",
                    "data_type": "sensitive_data",
                    "matched_pattern": keyword
                }
        
        return {
            "is_company_data": False,
            "sensitivity": "NONE",
            "reason": "No company data patterns detected"
        }
    
    def generate_rag_explanation(self, analysis_result, file_name, employee_role):
        """Generate contextual explanation for RAG"""
        
        if not analysis_result["is_company_data"]:
            return None  # No alert needed
        
        return f"""
📋 BOGEY-ALERT: COMPANY DATA DETECTED

FILE: {file_name}
EMPLOYEE: {employee_role}
DETECTION REASON: {analysis_result['reason']}
SENSITIVITY LEVEL: {analysis_result['sensitivity']}

⚠️ This file matches company data patterns. 
   {analysis_result['reason']}

Recommended Action: 
   - HIGH/CRITICAL: Immediate security review
   - MEDIUM: Monitor and log
   - No action needed for personal files

Company Policy: Unauthorized access to {analysis_result.get('data_type', 'sensitive')} 
data without business justification is a violation.
"""
    
    def get_sensitivity_score(self, sensitivity_level):
        """Convert sensitivity level to numeric score"""
        scores = {
            "CRITICAL": 100,
            "HIGH": 70,
            "MEDIUM": 40,
            "LOW": 10,
            "NONE": 0
        }
        return scores.get(sensitivity_level, 0)