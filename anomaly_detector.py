import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

print("=" * 50)
print("🤖 BUILDING ANOMALY DETECTION MODEL")
print("=" * 50)

# Step 1: Load the data
print("\n📂 Step 1: Loading employee data...")
df = pd.read_csv('employee_logs.csv')
print(f"✅ Loaded {len(df)} records")

# Step 2: Prepare features (the things we look at)
print("\n🔧 Step 2: Preparing features...")

# Calculate extra features
df['sensitive_ratio'] = df['sensitive_files'] / (df['files_accessed'] + 1)

# Choose which features to use
feature_columns = ['login_hour', 'files_accessed', 'sensitive_files', 'data_mb', 'sensitive_ratio']
print(f"📊 Using features: {feature_columns}")

# Get the feature values
X = df[feature_columns].fillna(0).values
print(f"📐 Feature matrix shape: {X.shape[0]} rows, {X.shape[1]} columns")

# Step 3: Scale the features (makes the model work better)
print("\n📏 Step 3: Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
print("✅ Scaling complete")

# Step 4: Train the model
print("\n🧠 Step 4: Training Isolation Forest model...")
print("   This might take 10-15 seconds...")

model = IsolationForest(
    contamination=0.1,  # Expect 10% anomalies
    random_state=42,
    n_estimators=100
)
model.fit(X_scaled)
print("✅ Model training complete!")

# Step 5: Save the model
print("\n💾 Step 5: Saving model...")
joblib.dump(model, 'anomaly_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
print("✅ Model saved as 'anomaly_model.pkl'")
print("✅ Scaler saved as 'scaler.pkl'")

# Step 6: Test the model
print("\n🧪 Step 6: Testing the model...")
print("-" * 40)

# Test 1: Normal behavior
normal = np.array([[9, 10, 2, 50, 0.2]])
normal_scaled = scaler.transform(normal)
normal_pred = model.predict(normal_scaled)[0]
normal_score = model.score_samples(normal_scaled)[0]

print("\n📋 TEST 1: Normal Employee (9 AM, 10 files)")
print(f"   Result: {'✅ NORMAL' if normal_pred == 1 else '🚨 ANOMALY'}")
print(f"   Confidence Score: {normal_score:.3f}")

# Test 2: Suspicious behavior
suspicious = np.array([[3, 500, 150, 5000, 0.3]])
suspicious_scaled = scaler.transform(suspicious)
suspicious_pred = model.predict(suspicious_scaled)[0]
suspicious_score = model.score_samples(suspicious_scaled)[0]

print("\n📋 TEST 2: Suspicious Employee (3 AM, 500 files)")
print(f"   Result: {'✅ NORMAL' if suspicious_pred == 1 else '🚨 ANOMALY'}")
print(f"   Confidence Score: {suspicious_score:.3f}")

# Test 3: Slightly unusual
unusual = np.array([[23, 50, 20, 500, 0.4]])
unusual_scaled = scaler.transform(unusual)
unusual_pred = model.predict(unusual_scaled)[0]
unusual_score = model.score_samples(unusual_scaled)[0]

print("\n📋 TEST 3: Unusual Employee (11 PM, 50 files)")
print(f"   Result: {'✅ NORMAL' if unusual_pred == 1 else '🚨 ANOMALY'}")
print(f"   Confidence Score: {unusual_score:.3f}")

# Step 7: Evaluate on all data
print("\n📊 Step 7: Evaluating on all data...")
print("-" * 40)

predictions = model.predict(X_scaled)
anomalies_detected = (predictions == -1).sum()
actual_anomalies = df['is_anomaly'].sum()

print(f"🎯 Actual anomalies in data: {actual_anomalies}")
print(f"🎯 Anomalies detected by model: {anomalies_detected}")

# Calculate accuracy
correct_normal = ((predictions == 1) & (df['is_anomaly'] == False)).sum()
correct_anomaly = ((predictions == -1) & (df['is_anomaly'] == True)).sum()
correct = correct_normal + correct_anomaly
accuracy = correct / len(df)

print(f"📈 Accuracy: {accuracy*100:.1f}%")

# Show some detected anomalies
print("\n🔍 Sample Anomalies Found:")
anomaly_examples = df[predictions == -1].head(5)
for idx, row in anomaly_examples.iterrows():
    print(f"   • {row['employee_id']} on {row['date']}: {row['files_accessed']} files at {row['login_hour']}:00")

print("\n" + "=" * 50)
print("✅ MODEL BUILDING COMPLETE!")
print("=" * 50)