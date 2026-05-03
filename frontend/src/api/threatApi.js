export async function detectThreat(data) {
  try {
    const response = await fetch('http://localhost:9091/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const result = await response.json();
    return {
      risk_score: result.risk_score || 0,
      risk_level: result.risk_level || 'NORMAL',
      recommended_action: result.recommended_action || 'No action required',
      rag_explanation: result.rag_explanation || null
    };
  } catch (error) {
    console.error('Threat detection API failed:', error);
    throw error;  // Triggers local fallback in Analyzer
  }
}

export async function checkHealth() {
  const response = await fetch('http://localhost:9091/health');
  if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
  return response.json();
}
