from vector_store import VectorStore
import json

class RAGPipeline:
    def __init__(self):
        """Initialize the RAG pipeline"""
        print("🧠 Initializing RAG Pipeline...")
        self.vector_store = VectorStore()
        
        # Index documents (only needs to be done once)
        try:
            self.vector_store.index_documents()
        except Exception as e:
            print(f"⚠️ Could not index documents: {e}")
            print("   Make sure you have a 'policies' folder with .txt files")
        
        print("✅ RAG Pipeline ready")
    
    def get_context_for_anomaly(self, anomaly_data):
        """Retrieve relevant context for an anomalous activity"""
        
        # Build search query based on anomaly type
        query = self._build_search_query(anomaly_data)
        
        # Search for relevant policies
        employee_role = anomaly_data.get('role', 'employee')
        relevant_docs = self.vector_store.search(query, employee_role)
        
        # Build context summary
        context = {
            "query": query,
            "relevant_policies": relevant_docs,
            "employee_role": employee_role,
            "anomaly_details": anomaly_data
        }
        
        return context
    
    def _build_search_query(self, anomaly_data):
        """Create a search query based on what anomaly was detected"""
        
        files = anomaly_data.get('files_accessed', 0)
        hour = anomaly_data.get('login_hour', 9)
        sensitive = anomaly_data.get('sensitive_files', 0)
        
        # Determine anomaly type
        if files > 100:
            return "bulk download policy data exfiltration"
        elif hour < 6 or hour > 22:
            return "after hours access policy working hours violation"
        elif sensitive > 20:
            return "sensitive data access restricted information policy"
        else:
            return "insider threat detection security policy violation"
    
    def generate_explanation(self, anomaly_data, risk_score, risk_level):
        """Generate a human-readable explanation of the risk"""
        
        # Get context
        context = self.get_context_for_anomaly(anomaly_data)
        
        # Build explanation
        files = anomaly_data.get('files_accessed', 0)
        hour = anomaly_data.get('login_hour', 9)
        sensitive = anomaly_data.get('sensitive_files', 0)
        role = anomaly_data.get('role', 'employee')
        
        explanation = f"""
        🚨 RISK ASSESSMENT EXPLANATION
        
        What happened:
        • Employee ({role}) accessed {files} files at {hour}:00
        • {sensitive} of these were sensitive/restricted files
        
        Why this is concerning:
        """
        
        if files > 100:
            explanation += f"\n        • Downloaded {files} files - exceeds typical daily volume by {int(files/10)}x"
        if hour < 6 or hour > 22:
            explanation += f"\n        • Activity at {hour}:00 - outside standard working hours (9 AM - 5 PM)"
        if sensitive > 20:
            explanation += f"\n        • Accessed {sensitive} sensitive files - requires special authorization"
        
        explanation += f"\n\n        Risk Score: {risk_score}/100 ({risk_level})"
        
        # Add policy context if available
        if context['relevant_policies']:
            explanation += "\n\n        Relevant policies found in database. Security team should review."
        
        return explanation, context

# Test the RAG pipeline
if __name__ == "__main__":
    print("=" * 50)
    print("Testing RAG Pipeline")
    print("=" * 50)
    
    # Initialize
    rag = RAGPipeline()
    
    # Test with suspicious activity
    test_anomaly = {
        "employee_id": "EMP_000",
        "role": "engineer",
        "login_hour": 3,
        "files_accessed": 500,
        "sensitive_files": 150,
        "data_mb": 5000
    }
    
    print("\n🔍 Testing with suspicious activity:")
    print(f"   Employee: {test_anomaly['employee_id']}")
    print(f"   Role: {test_anomaly['role']}")
    print(f"   Activity: {test_anomaly['files_accessed']} files at {test_anomaly['login_hour']}:00")
    
    # Get context
    context = rag.get_context_for_anomaly(test_anomaly)
    
    print(f"\n📋 Search Query: {context['query']}")
    print(f"📄 Relevant Policies Found: {len(context['relevant_policies'])}")
    
    # Generate explanation
    explanation, ctx = rag.generate_explanation(test_anomaly, 64, "HIGH")
    print(f"\n💡 Generated Explanation:")
    print(explanation)