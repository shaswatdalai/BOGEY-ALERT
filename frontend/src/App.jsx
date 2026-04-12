import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [employeeId, setEmployeeId] = useState('EMP_000');
  const [loginHour, setLoginHour] = useState(9);
  const [filesAccessed, setFilesAccessed] = useState(10);
  const [sensitiveFiles, setSensitiveFiles] = useState(2);
  const [dataMb, setDataMb] = useState(50);
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Check API status on load
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/health');
      if (response.data.status === 'healthy') {
        setApiStatus('Connected');
      } else {
        setApiStatus('Not Connected');
      }
    } catch (error) {
      setApiStatus('Not Connected - Start API');
    }
  };

  const analyzeRisk = async () => {
    try {
      const response = await axios.post('http://localhost:8000/detect', {
        employee_id: employeeId,
        login_hour: parseFloat(loginHour),
        files_accessed: parseInt(filesAccessed),
        sensitive_files: parseInt(sensitiveFiles),
        data_mb: parseInt(dataMb)
      });
      
      setResult(response.data);
      
      // Add to alerts
      const newAlert = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        employee: response.data.employee_id,
        activity: `${filesAccessed} files at ${loginHour}:00`,
        score: response.data.risk_score,
        level: response.data.risk_level
      };
      setAlerts([newAlert, ...alerts].slice(0, 10));
      
    } catch (error) {
      console.error('Error:', error);
      alert('Make sure API is running: python api.py');
    }
  };

  const quickTest = (type) => {
    if (type === 'normal') {
      setLoginHour(9);
      setFilesAccessed(10);
      setSensitiveFiles(2);
      setDataMb(50);
    } else if (type === 'suspicious') {
      setLoginHour(3);
      setFilesAccessed(500);
      setSensitiveFiles(150);
      setDataMb(5000);
    } else if (type === 'warning') {
      setLoginHour(23);
      setFilesAccessed(80);
      setSensitiveFiles(60);
      setDataMb(800);
    }
    setTimeout(() => analyzeRisk(), 100);
  };

  const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#eab308';
    if (score >= 10) return '#3b82f6';
    return '#10b981';
  };

  const getRiskTagClass = (level) => {
    if (level.includes('CRITICAL')) return 'tag-critical';
    if (level.includes('HIGH')) return 'tag-high';
    if (level.includes('MEDIUM')) return 'tag-medium';
    if (level.includes('LOW')) return 'tag-low';
    return 'tag-normal';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛡️ BOGEY-ALERT</h1>
        <p>Privacy-Aware AI-Based Insider Threat Detection</p>
        <div className={`status ${apiStatus === 'Connected' ? 'status-connected' : 'status-disconnected'}`}>
          {apiStatus === 'Connected' ? '🟢 API Connected' : '🔴 API Not Running - Start: python api.py'}
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card critical">
          <div className="stat-number">{alerts.filter(a => a.level.includes('CRITICAL')).length}</div>
          <div className="stat-label">🔴 Critical</div>
        </div>
        <div className="stat-card high">
          <div className="stat-number">{alerts.filter(a => a.level.includes('HIGH')).length}</div>
          <div className="stat-label">🟠 High</div>
        </div>
        <div className="stat-card medium">
          <div className="stat-number">{alerts.filter(a => a.level.includes('MEDIUM')).length}</div>
          <div className="stat-label">🟡 Medium</div>
        </div>
        <div className="stat-card low">
          <div className="stat-number">{alerts.filter(a => a.level.includes('LOW')).length}</div>
          <div className="stat-label">🔵 Low</div>
        </div>
      </div>

      <div className="main-grid">
        <div className="card">
          <h3>🔍 Test Employee Activity</h3>
          <div className="form-group">
            <label>Employee ID</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option>EMP_000</option>
              <option>EMP_001</option>
              <option>EMP_002</option>
              <option>EMP_003</option>
            </select>
          </div>
          <div className="form-group">
            <label>Login Hour (0-23)</label>
            <input type="number" value={loginHour} onChange={(e) => setLoginHour(e.target.value)} min="0" max="23"/>
          </div>
          <div className="form-group">
            <label>Files Accessed</label>
            <input type="number" value={filesAccessed} onChange={(e) => setFilesAccessed(e.target.value)}/>
          </div>
          <div className="form-group">
            <label>Sensitive Files</label>
            <input type="number" value={sensitiveFiles} onChange={(e) => setSensitiveFiles(e.target.value)}/>
          </div>
          <div className="form-group">
            <label>Data Volume (MB)</label>
            <input type="number" value={dataMb} onChange={(e) => setDataMb(e.target.value)}/>
          </div>
          <button onClick={analyzeRisk}>🚨 Analyze Risk</button>

          {result && (
            <div className="result-box">
              <div className="result-title">RISK ASSESSMENT</div>
              <div className="risk-score" style={{ color: getRiskColor(result.risk_score) }}>
                {result.risk_score}/100
              </div>
              <div className={`risk-level ${getRiskTagClass(result.risk_level)}`}>
                {result.risk_level}
              </div>
              <div className="recommendation">{result.recommended_action}</div>
              <hr />
              <div className="details">
                📊 {result.details.current_files} files vs baseline {result.details.normal_files_baseline}<br/>
                ⏰ {result.details.current_login_hour}:00 vs baseline {result.details.normal_login_hour}:00
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>⚡ Quick Test</h3>
          <div className="quick-buttons">
            <button className="btn-normal" onClick={() => quickTest('normal')}>✅ Normal Employee</button>
            <button className="btn-suspicious" onClick={() => quickTest('suspicious')}>🚨 Suspicious (3 AM, 500 files)</button>
            <button className="btn-warning" onClick={() => quickTest('warning')}>⚠️ Warning (11 PM, 80 files)</button>
          </div>
        </div>
      </div>

      <div className="card full-width">
        <h3>📋 Recent Alerts</h3>
        <table className="alerts-table">
          <thead>
            <tr><th>Time</th><th>Employee</th><th>Activity</th><th>Score</th><th>Status</th></tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>No alerts yet. Test some activities!</td></tr>
            ) : (
              alerts.map(alert => (
                <tr key={alert.id}>
                  <td>{alert.time}</td>
                  <td>{alert.employee}</td>
                  <td>{alert.activity}</td>
                  <td>{alert.score}/100</td>
                  <td><span className={`tag ${getRiskTagClass(alert.level)}`}>{alert.level}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;