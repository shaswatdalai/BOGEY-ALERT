import requests
import json

print("=" * 50)
print("🎯 INSIDER THREAT DETECTION - LIVE DEMO")
print("=" * 50)

# Test different scenarios
scenarios = [
    {
        "name": "🏢 Normal Employee (9-5 worker)",
        "data": {
            "employee_id": "EMP_000",
            "login_hour": 9,
            "files_accessed": 10,
            "sensitive_files": 2,
            "data_mb": 50
        }
    },
    {
        "name": "🌙 Night Owl (Working late, normal files)",
        "data": {
            "employee_id": "EMP_000",
            "login_hour": 23,
            "files_accessed": 15,
            "sensitive_files": 3,
            "data_mb": 75
        }
    },
    {
        "name": "🚨 SUSPICIOUS: Bulk download at 3 AM",
        "data": {
            "employee_id": "EMP_000",
            "login_hour": 3,
            "files_accessed": 500,
            "sensitive_files": 150,
            "data_mb": 5000
        }
    },
    {
        "name": "⚠️ WARNING: High sensitive file access",
        "data": {
            "employee_id": "EMP_001",
            "login_hour": 14,
            "files_accessed": 80,
            "sensitive_files": 60,
            "data_mb": 800
        }
    }
]

print("\n🔍 Testing multiple scenarios...\n")

for scenario in scenarios:
    print(f"\n📋 {scenario['name']}")
    print("-" * 40)
    
    try:
        response = requests.post("http://localhost:8000/detect", json=scenario['data'])
        result = response.json()
        
        print(f"   👤 Employee: {result['employee_id']}")
        print(f"   🎯 Risk Score: {result['risk_score']}/100")
        print(f"   ⚠️  Risk Level: {result['risk_level']}")
        print(f"   💡 Action: {result['recommended_action']}")
        print(f"   📊 Details: {result['details']['current_files']} files vs baseline {result['details']['normal_files_baseline']}")
        
    except Exception as e:
        print(f"   ❌ Error: Make sure API is running (python api.py)")
        break

print("\n" + "=" * 50)
print("✅ Demo complete!")
print("=" * 50)