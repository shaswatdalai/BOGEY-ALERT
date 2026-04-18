import chromadb
from sentence_transformers import SentenceTransformer
import os

class VectorStore:
    def __init__(self):
        """Initialize the vector database for storing and retrieving documents"""
        print("📚 Initializing Vector Store...")
        
        # Create a persistent ChromaDB client
        self.client = chromadb.PersistentClient(path="./chroma_db")
        
        # Create or get collection for policies
        self.collection = self.client.get_or_create_collection(
            name="company_policies",
            metadata={"description": "Company security and data policies"}
        )
        
        # Load embedding model (runs locally - no API calls)
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Vector Store initialized with 384-dimension embeddings")
    
    def index_documents(self, folder_path="./policies"):
        """Index all policy documents from the policies folder"""
        print(f"📂 Indexing documents from {folder_path}...")
        
        if not os.path.exists(folder_path):
            print(f"❌ Folder {folder_path} not found!")
            return
        
        files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
        
        if len(files) == 0:
            print("⚠️ No .txt files found in policies folder")
            return
        
        for idx, filename in enumerate(files):
            filepath = os.path.join(folder_path, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Create embedding
            embedding = self.encoder.encode(content).tolist()
            
            # Store in ChromaDB
            self.collection.upsert(
                ids=[f"policy_{idx}"],
                embeddings=[embedding],
                metadatas=[{"source": filename, "type": "policy"}],
                documents=[content]
            )
            print(f"   ✅ Indexed: {filename}")
        
        print(f"✅ Indexed {len(files)} documents")
    
    def search(self, query, employee_role=None, n_results=3):
        """Search for relevant documents based on query"""
        # Create query embedding
        query_embedding = self.encoder.encode(query).tolist()
        
        # Search
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Return documents and metadata
        documents = results['documents'][0] if results['documents'] else []
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        
        # Filter by role if needed
        if employee_role and documents:
            filtered_docs = []
            for doc, meta in zip(documents, metadatas):
                # Simple role filtering based on content
                if employee_role.lower() in doc.lower() or "all" in doc.lower():
                    filtered_docs.append(doc)
            if filtered_docs:
                return filtered_docs
        
        return documents
    
    def get_collection_stats(self):
        """Get statistics about the vector store"""
        count = self.collection.count()
        return {
            "total_documents": count,
            "collection_name": "company_policies",
            "embedding_dimension": 384
        }

# Test the vector store
if __name__ == "__main__":
    print("=" * 50)
    print("Testing Vector Store")
    print("=" * 50)
    
    # Initialize
    vs = VectorStore()
    
    # Index documents
    vs.index_documents()
    
    # Test search
    print("\n🔍 Testing search...")
    results = vs.search("What to do if someone downloads many files at night?")
    
    print("\n📄 Search Results:")
    for i, doc in enumerate(results):
        print(f"\n--- Result {i+1} ---")
        print(doc[:300] + "...")
    
    print("\n📊 Collection Stats:")
    print(vs.get_collection_stats())