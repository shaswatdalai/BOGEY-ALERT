from vector_store import VectorStore
import json

class RAGPipeline:
    def __init__(self):
        """Initialize the RAG pipeline"""
        print("[INFO] Initializing RAG Pipeline...")
        self.vector_store = VectorStore()
        
        # Load Company Data Detector if available
        self.data_detector = None
        try:
            from company_data_detector import CompanyDataDetector
            self.data_detector = CompanyDataDetector()
            print("[SUCCESS] Company Data Detector integrated")
        except Exception as e:
            print(f"[WARN] Could not load CompanyDataDetector: {e}")

        # Index documents (only needs to be done once)
        try:
            self.vector_store.index_documents()
        except Exception as e:
            print(f"[WARN] Could not index documents: {e}")
            print("   Make sure you have a 'policies' folder with .txt files")
        
        print("[SUCCESS] RAG Pipeline ready")
    
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
        """Generate a narrative explanation of the risk activity"""
        
        # Get context
        context = self.get_context_for_anomaly(anomaly_data)
        
        # Build explanation
        emp_id = anomaly_data.get('employee_id', 'Unknown User')
        files = anomaly_data.get('files_accessed', 0)
        hour = anomaly_data.get('login_hour', 9)
        sensitive = anomaly_data.get('sensitive_files', 0)
        role = anomaly_data.get('role', 'employee')
        file_names = anomaly_data.get('file_names', [])
        
        # 1. SMART NARRATIVE: Build a specific story based on data
        narrative = []
        if sensitive > 0:
            narrative.append(f"User {emp_id} ({role}) accessed {sensitive} sensitive files.")
        elif files > 100:
            narrative.append(f"User {emp_id} triggered a volume alert by accessing {files} files.")
        else:
            narrative.append(f"System flagged unusual behavior for user {emp_id}.")

        if hour < 6 or hour > 22:
            narrative.append(f"The activity occurred at {hour}:00, which is outside typical business hours.")
        
        if files > 200:
            narrative.append("The high volume of access suggests a potential bulk data collection attempt.")

        explanation = f"[NARRATIVE SUMMARY]\n{' '.join(narrative)}\n\n"
        explanation += f"Risk Assessment: {risk_level} ({risk_score}/100)\n\n"
        
        # 2. EXACT DATA DETAILS: Use CompanyDataDetector more effectively
        if self.data_detector and file_names:
            explanation += "[DATA CONTENT ANALYSIS]\n"
            sensitive_files = []
            for fname in file_names:
                analysis = self.data_detector.analyze_file("", fname)
                if analysis["is_company_data"]:
                    data_type = analysis.get('data_type', 'sensitive_data')
                    sensitive_files.append(f"- '{fname}': {data_type} ({analysis['sensitivity']} Risk). {analysis['reason']}")
            
            if sensitive_files:
                explanation += "\n".join(sensitive_files[:5]) + "\n"
            else:
                explanation += "- No specific restricted patterns in filenames, but behavioral anomalies detected.\n"
        
        # 3. EXACT POLICY DETAILS: Search for specific rules in retrieved text
        if context['relevant_policies']:
            explanation += "\n[POLICY GUIDANCE]\n"
            policy_text = context['relevant_policies'][0]
            
            # Look for specific rules in the text
            rules_found = False
            lines = policy_text.split('\n')
            
            # Map anomaly types to keywords in policies
            keywords = []
            if files > 100: keywords.append("bulk")
            if sensitive > 0: keywords.append("restricted")
            if hour < 6 or hour > 22: keywords.append("access")
            
            for line in lines:
                for kw in keywords:
                    if kw.lower() in line.lower() and ('>' in line or 'Level' in line or 'Rule' in line):
                        explanation += f"- Policy Violation Rule: {line.strip()}\n"
                        rules_found = True
                        break
                if rules_found: break # Just one for now
            
            if not rules_found:
                explanation += f"- Based on {lines[0].strip()}, this activity requires justification.\n"
        
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
    
    context = rag.get_context_for_anomaly(test_anomaly)
    
    print(f"\n[INFO] Search Query: {context['query']}")
    print(f"[INFO] Relevant Policies Found: {len(context['relevant_policies'])}")
    
    # Generate explanation
    explanation, ctx = rag.generate_explanation(test_anomaly, 64, "HIGH")
    print(f"\n[INFO] Generated Explanation:")
    print(explanation)