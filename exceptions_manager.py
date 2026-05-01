import json
import os
from datetime import datetime
from typing import Dict, Optional, List

class ExceptionsManager:
    def __init__(self, file_path="exceptions.json"):
        self.file_path = file_path
        self.exceptions = self._load()
    
    def _load(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'r') as f:
                return json.load(f)
        return {"active_projects": [], "temporary_overrides": []}
    
    def _save(self):
        with open(self.file_path, 'w') as f:
            json.dump(self.exceptions, f, indent=2)
    
    def check_exception(self, employee_id: str, activity: Dict) -> Dict:
        """Check if activity is covered by an exception"""
        now = datetime.now()
        
        # Check projects
        for project in self.exceptions.get("active_projects", []):
            if employee_id not in project.get("team", []):
                continue
            
            start = datetime.fromisoformat(project["start_date"])
            end = datetime.fromisoformat(project["end_date"])
            
            if start <= now <= end:
                files = activity.get("files_accessed", 0)
                sensitive = activity.get("sensitive_files", 0)
                
                if files <= project.get("max_files_per_day", 999):
                    if sensitive <= project.get("max_sensitive_per_day", 999):
                        return {
                            "exempted": True,
                            "reason": project["reason"],
                            "project_name": project.get("name"),
                            "adjusted_risk": 0,
                            "type": "project"
                        }
        
        # Check temporary overrides
        for override in self.exceptions.get("temporary_overrides", []):
            if override["employee_id"] != employee_id:
                continue
            
            start = datetime.fromisoformat(override["start_time"])
            end = datetime.fromisoformat(override["end_time"])
            
            if start <= now <= end:
                return {
                    "exempted": True,
                    "reason": override["reason"],
                    "adjusted_risk": 0,
                    "type": "override",
                    "approved_by": override.get("approved_by")
                }
        
        return {"exempted": False}
    
    def add_project(self, project: Dict):
        """Add a new project exception"""
        self.exceptions["active_projects"].append(project)
        self._save()
    
    def add_override(self, override: Dict):
        """Add a temporary override"""
        self.exceptions["temporary_overrides"].append(override)
        self._save()
    
    def remove_expired(self):
        """Remove expired exceptions"""
        now = datetime.now()
        
        # Remove expired projects
        self.exceptions["active_projects"] = [
            p for p in self.exceptions.get("active_projects", [])
            if datetime.fromisoformat(p["end_date"]) >= now
        ]
        
        # Remove expired overrides
        self.exceptions["temporary_overrides"] = [
            o for o in self.exceptions.get("temporary_overrides", [])
            if datetime.fromisoformat(o["end_time"]) >= now
        ]
        
        self._save()
    
    def get_active_exceptions(self, employee_id: str = None) -> List[Dict]:
        """Get all active exceptions, optionally filtered by employee"""
        self.remove_expired()
        result = []
        
        for project in self.exceptions.get("active_projects", []):
            if employee_id is None or employee_id in project.get("team", []):
                result.append({
                    "type": "project",
                    "name": project.get("name"),
                    "reason": project["reason"],
                    "team": project.get("team"),
                    "expires": project["end_date"]
                })
        
        for override in self.exceptions.get("temporary_overrides", []):
            if employee_id is None or override["employee_id"] == employee_id:
                result.append({
                    "type": "override",
                    "reason": override["reason"],
                    "expires": override["end_time"],
                    "approved_by": override.get("approved_by")
                })
        
        return result 