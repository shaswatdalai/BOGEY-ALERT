import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

print("=" * 50)
print("INSIDER THREAT DETECTION SYSTEM")
print("=" * 50)
print("\n📊 Step 1: Generating Synthetic Employee Data...")
print("-" * 40)

# Set random seed so results are same every time
np.random.seed(42)
random.seed(42)

# Create 20 employees
employees = []
for i in range(20):
    employees.append(f"EMP_{i:03d}")

roles = ['engineer', 'manager', 'analyst', 'intern']
departments = ['engineering', 'sales', 'finance', 'hr']

print(f"👥 Creating {len(employees)} employees...")

records = []
start_date = datetime(2024, 1, 1)

# For each employee, create 30 days of activity
for emp in employees:
    role = random.choice(roles)
    dept = random.choice(departments)
    
    # Each employee has a "normal" pattern
    normal_files = np.random.normal(10, 3)  # Usually 7-13 files per day
    normal_hour = np.random.normal(9, 1)     # Usually 8-10 AM login
    
    for day in range(30):  # 30 days of data
        date = start_date + timedelta(days=day)
        
        # Start with normal behavior
        is_anomaly = False
        files = max(0, int(np.random.normal(normal_files, 5)))
        login_hour = np.random.normal(normal_hour, 1)
        
        # Add anomaly for 10% of days
        if random.random() < 0.1:
            is_anomaly = True
            # Two types of anomalies
            if random.random() < 0.5:
                files = int(normal_files * random.uniform(3, 8))  # Bulk download
            else:
                login_hour = np.random.uniform(22, 4)  # Late night access
        
        records.append({
            'employee_id': emp,
            'role': role,
            'department': dept,
            'date': date,
            'login_hour': round(login_hour, 1),
            'files_accessed': files,
            'sensitive_files': int(files * random.uniform(0, 0.3)),
            'data_mb': int(files * np.random.uniform(0.5, 5)),
            'is_anomaly': is_anomaly
        })

# Convert to pandas DataFrame (like an Excel table)
df = pd.DataFrame(records)

# Save to CSV file
df.to_csv('employee_logs.csv', index=False)

print(f"✅ Generated {len(df)} activity records")
print(f"📁 Saved to 'employee_logs.csv'")

anomaly_count = df['is_anomaly'].sum()
print(f"🚨 Anomalies in data: {anomaly_count} out of {len(df)} ({anomaly_count/len(df)*100:.1f}%)")

print("\n📋 First 5 records:")
print(df.head())
print("\n✅ Data generation complete!")