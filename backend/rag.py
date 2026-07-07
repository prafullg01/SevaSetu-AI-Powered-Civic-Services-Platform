import os
import chromadb
from chromadb.config import Settings
import google.generativeai as genai
from dotenv import load_dotenv
from database import SessionLocal
from models import DocumentKB

load_dotenv()

# Initialize ChromaDB (local persistence)
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="civicsaathi_docs")

# Initialize Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel('gemini-flash-lite-latest')
else:
    gemini_model = None

def seed_vector_db():
    """Fetches documents from SQLite and embeds them into Chroma"""
    db = SessionLocal()
    docs = db.query(DocumentKB).all()
    
    if not docs:
        db.close()
        return

    documents = [d.content for d in docs]
    metadatas = [{"title": d.title, "source_url": d.source_url} for d in docs]
    ids = [str(d.id) for d in docs]

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    db.close()
    print(f"Added {len(docs)} documents to ChromaDB.")

def add_document(doc_id: int, title: str, source_url: str, content: str):
    """Embeds a single new document into ChromaDB"""
    collection.add(
        documents=[content],
        metadatas=[{"title": title, "source_url": source_url}],
        ids=[str(doc_id)]
    )
    print(f"Added document {doc_id} to ChromaDB.")

def get_answer(user_query: str, language: str = "en") -> dict:
    """Retrieves relevant chunks and generates a response"""
    
    # 1. Retrieve from ChromaDB
    results = collection.query(
        query_texts=[user_query],
        n_results=2
    )
    
    retrieved_docs = []
    retrieved_metadata = []
    
    if results['documents'] and results['documents'][0]:
        retrieved_docs = results['documents'][0]
        retrieved_metadata = results['metadatas'][0]
    
    context = ""
    if retrieved_docs:
        context = "\n\n".join([f"Source ({m['title']}): {d}" for d, m in zip(retrieved_docs, retrieved_metadata)])

    # 2. Call LLM (or mock if no key)
    if not gemini_model:
        mock_answer = f"(MOCK AI - {language}) Based on the documents... Here is what you need to do."
        return {
            "answer": mock_answer,
            "sources": retrieved_metadata,
            "confidence": "high"
        }

    prompt = f"""You are CivicSaathi, a helpful AI companion for government services.
You should be friendly and conversational.
If the user asks a general question or greets you (like "hi" or "hello"), respond naturally and politely.
If the user asks about government services, procedures, or rules, answer based on the provided context below.
If the context doesn't contain the answer to a government-related question, just say you don't have that specific information but offer to help with other civic matters.
IMPORTANT: You MUST respond in the following language code: {language}.

Context:
{context}

User Question: {user_query}
"""

    try:
        response = gemini_model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        answer = f"Error calling LLM: {str(e)}"
        
    return {
        "answer": answer,
        "sources": retrieved_metadata,
        "confidence": "high"
    }
