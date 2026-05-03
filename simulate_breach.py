import os
import time
from pathlib import Path

# Create a testing directory on the Desktop
desktop = Path.home() / "Desktop" / "ThreatSim"
os.makedirs(desktop, exist_ok=True)

print("=" * 50)
print("BOGEY-ALERT: INSIDER THREAT SIMULATOR")
print("=" * 50)
print(f"Creating files in: {desktop}")
print("IMPORTANT: Make sure friend_agent.py is running first!")
print("\nSelect a scenario to simulate:")
print("1: [LOW RISK] Normal day-to-day work (Few safe files)")
print("2: [MEDIUM RISK] Late night access (Off-hours, minor sensitivity)")
print("3: [HIGH RISK] Targeted theft (Single highly critical file)")
print("4: [CRITICAL RISK] Database dump (Massive bulk data exfiltration)")
print("5: Clear simulation files (Clean up)")

choice = input("\nEnter scenario number (1-5): ")

if choice == "1":
    print("\n[Simulating] Creating 5 normal work files...")
    for i in range(5):
        with open(desktop / f"project_notes_{int(time.time())}_{i}.txt", "w") as f:
            f.write("Just some normal daily notes about the project.")
    print("Done! Wait 5 seconds for the agent to detect.")

elif choice == "2":
    print("\n[Simulating] Creating 30 files, including 2 sensitive ones...")
    # 28 normal files
    for i in range(28):
        with open(desktop / f"draft_report_{int(time.time())}_{i}.docx", "w") as f:
            f.write("Draft content...")
    # 2 sensitive files
    with open(desktop / f"internal_q3_financials_{int(time.time())}.xlsx", "w") as f:
        f.write("Q3 Revenue: $500,000")
    with open(desktop / f"employee_salaries_{int(time.time())}.csv", "w") as f:
        f.write("Name,Salary\nJohn,50000")
    print("Done! Wait 5 seconds for the agent to detect.")
    print("Note: If the agent logs this during normal hours, it might be Low/Medium risk.")
    print("If it's past 10 PM, the ML model will flag it as highly anomalous!")

elif choice == "3":
    print("\n[Simulating] Creating 1 highly critical credential file...")
    with open(desktop / f"production_database_admin_{int(time.time())}.key", "w") as f:
        f.write("-----BEGIN RSA PRIVATE KEY-----")
    print("Done! Wait 5 seconds for the agent to detect.")

elif choice == "4":
    print("\n[Simulating] Creating 150 customer data files (Bulk Exfiltration)...")
    for i in range(150):
        with open(desktop / f"customer_export_batch_{int(time.time())}_{i}.csv", "w") as f:
            f.write("user_id,email,credit_card\n123,test@test.com,4111...")
    print("Done! Wait 5 seconds for the agent to detect.")

elif choice == "5":
    print("\nCleaning up simulation files...")
    count = 0
    for file in desktop.glob("*"):
        try:
            os.remove(file)
            count += 1
        except:
            pass
    print(f"Deleted {count} files.")

else:
    print("Invalid choice.")
