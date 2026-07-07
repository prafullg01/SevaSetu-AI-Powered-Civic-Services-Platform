from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import engine, Base, get_db
import models, rag, hash_util

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CivicSaathi API", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CivicSaathi API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Auth Endpoints ---
class UserAuth(BaseModel):
    phone: str
    name: Optional[str] = None

@app.post("/api/auth/register")
def register_user(user_data: UserAuth, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.phone == user_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    new_user = models.User(phone=user_data.phone, name=user_data.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "name": new_user.name, "phone": new_user.phone}

@app.post("/api/auth/login")
def login_user(user_data: UserAuth, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == user_data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "name": user.name, "phone": user.phone}

# --- Admin Endpoints ---
@app.post("/api/admin/seed-vector")
def admin_seed_vector():
    try:
        rag.seed_vector_db()
        return {"status": "success", "message": "Vector DB seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    query: str
    user_id: int = 1 # default for demo
    language: str = "en"

@app.post("/api/chat")
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    # Get answer from RAG
    rag_response = rag.get_answer(request.query, request.language)
    
    # Log the conversation with tamper-evident hash
    conv_data = {
        "user_id": request.user_id,
        "messages_json": [{"role": "user", "content": request.query}, {"role": "assistant", "content": rag_response["answer"]}],
        "model_version": "gemini-flash-latest" if rag.gemini_model else "mock-model",
        "sources_used": rag_response["sources"]
    }
    
    conv = hash_util.create_hash_chained_conversation(db, conv_data)
    db.add(conv)
    db.commit()
    
    return rag_response

# --- Phase 3 Endpoints ---

@app.get("/api/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    return services

class ApplicationCreate(BaseModel):
    user_id: int
    service_id: int

@app.post("/api/applications")
def create_application(app_data: ApplicationCreate, db: Session = Depends(get_db)):
    db_app = models.ServiceApplication(
        user_id=app_data.user_id,
        service_id=app_data.service_id,
        status="pending"
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return {"status": "success", "message": "Application submitted successfully", "application_id": db_app.id}

@app.get("/api/admin/applications")
def get_all_applications(db: Session = Depends(get_db)):
    # Include user and service info via joinedload or manual dictionary
    apps = db.query(models.ServiceApplication).all()
    result = []
    for app in apps:
        user = db.query(models.User).filter(models.User.id == app.user_id).first()
        service = db.query(models.Service).filter(models.Service.id == app.service_id).first()
        result.append({
            "id": app.id,
            "status": app.status,
            "submitted_at": app.submitted_at,
            "user_name": user.name if user else "Unknown User",
            "service_name": service.name if service else "Unknown Service"
        })
    # Sort by ID descending (newest first)
    result.reverse()
    return result

class VerifyUpdate(BaseModel):
    status: str

@app.post("/api/admin/applications/{app_id}/verify")
def verify_application(app_id: int, verify_data: VerifyUpdate, db: Session = Depends(get_db)):
    app = db.query(models.ServiceApplication).filter(models.ServiceApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = verify_data.status
    db.commit()
    return {"status": "success"}

class DocumentCreate(BaseModel):
    title: str
    source_url: str
    jurisdiction: str = "Local"
    content: str

@app.post("/api/admin/documents")
def add_knowledge_base_document(doc_data: DocumentCreate, db: Session = Depends(get_db)):
    db_doc = models.DocumentKB(
        title=doc_data.title,
        source_url=doc_data.source_url,
        jurisdiction=doc_data.jurisdiction,
        content=doc_data.content
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Immediately push to ChromaDB vector store
    import rag
    rag.add_document(doc_id=db_doc.id, title=db_doc.title, source_url=db_doc.source_url, content=db_doc.content)
    
    return {"status": "success", "message": "Document added to Knowledge Base", "document_id": db_doc.id}

class ComplaintCreate(BaseModel):
    user_id: int = 1
    category: str
    description: str
    location: str

@app.post("/api/complaints")
def create_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):
    # In a real app, LLM would auto-classify category/severity here
    db_complaint = models.Complaint(
        user_id=complaint.user_id,
        category=complaint.category,
        description=complaint.description,
        location=complaint.location,
        status="pending_assessment"
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    # Log event
    event_data = {
        "complaint_id": db_complaint.id,
        "event_type": "CREATED",
        "actor": "user",
        "note": "Complaint filed."
    }
    event = hash_util.create_hash_chained_event(db, event_data)
    db.add(event)
    db.commit()
    
    return {"complaint_id": db_complaint.id, "status": "pending_assessment"}

@app.get("/api/complaints/user/{user_id}")
def get_user_complaints(user_id: int, db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).filter(models.Complaint.user_id == user_id).order_by(models.Complaint.created_at.desc()).all()
    return [{"id": c.id, "status": c.status, "category": c.category, "description": c.description, "location": c.location, "created_at": str(c.created_at)} for c in complaints]

@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {
        "id": complaint.id,
        "status": complaint.status,
        "category": complaint.category
    }


@app.get("/api/complaints/{complaint_id}/timeline")
def get_complaint_timeline(complaint_id: int, db: Session = Depends(get_db)):
    events = db.query(models.ComplaintEvent).filter(models.ComplaintEvent.complaint_id == complaint_id).order_by(models.ComplaintEvent.timestamp).all()
    return events

@app.get("/api/admin/complaints")
def get_all_complaints(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
    return [{"id": c.id, "status": c.status, "category": c.category, "description": c.description, "location": c.location, "created_at": str(c.created_at)} for c in complaints]

class ComplaintResponse(BaseModel):
    response: str

@app.post("/api/admin/complaints/{complaint_id}/respond")
def respond_to_complaint(complaint_id: int, resp: ComplaintResponse, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = "responded"
    
    event_data = {
        "complaint_id": complaint.id,
        "event_type": "ADMIN_RESPONSE",
        "actor": "admin",
        "note": resp.response
    }
    event = hash_util.create_hash_chained_event(db, event_data)
    db.add(event)
    db.commit()
    
    return {"status": "success", "message": "Response added"}

@app.get("/api/conversations")
def get_conversations(user_id: int = 1, db: Session = Depends(get_db)):
    # For Trust & Provenance dashboard
    convs = db.query(models.Conversation).filter(models.Conversation.user_id == user_id).order_by(models.Conversation.timestamp.desc()).all()
    return convs

# --- Phase 4 Endpoints ---

class ExplainRequest(BaseModel):
    text: str

@app.post("/api/explain")
def explain_text(request: ExplainRequest):
    if not rag.gemini_model:
        return {
            "simple": "MOCK SIMPLE: " + request.text[:50] + "...",
            "standard": "MOCK STANDARD: " + request.text[:100] + "...",
            "legal": request.text
        }
        
    prompt = f"""Rewrite the following government text into three distinct reading levels.
    Format your response EXACTLY as a JSON object with the following schema:
    {{
        "simple": "Grade 5 level text",
        "standard": "Grade 10 level text",
        "legal": "Exact legal text",
        "next_steps": "One actionable sentence on what the user should do next based on the text"
    }}
    Do not include Markdown blocks or json tags.
    
    Text: {request.text}
    """
    
    try:
        import requests
        import os
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "API key not configured."}
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        try:
            res = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=10)
            data = res.json()
        except requests.exceptions.Timeout:
            return {"error": "Google Gemini API timed out. Please try again later."}
        except Exception as e:
            return {"error": f"API request failed: {str(e)}"}
        
        if "error" in data:
            return {"error": data["error"].get("message", "Unknown API error")}
            
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            return {"error": "Invalid response format from API"}
            
        import json
        text = text.strip()
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        result = json.loads(text.strip())
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/explain/pdf")
async def explain_pdf(file: UploadFile = File(...)):
    try:
        import PyPDF2
        import io
        contents = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
        
        if not extracted_text.strip():
            return {"error": "Could not extract any text from this PDF. It may be an image-based PDF."}
        
        # Truncate to first 3000 chars if too long
        extracted_text = extracted_text[:3000]
        
        request = ExplainRequest(text=extracted_text)
        return explain_text(request)
    except ImportError:
        return {"error": "PyPDF2 not installed. Run: pip install PyPDF2"}
    except Exception as e:
        return {"error": f"Failed to process PDF: {str(e)}"}
