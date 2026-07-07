from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    name = Column(String)
    preferred_language = Column(String, default="en")
    accessibility_prefs = Column(JSON, default={})

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    department = Column(String)
    eligibility_json = Column(JSON)
    required_docs = Column(JSON)
    sla_days = Column(Integer)

class ServiceApplication(Base):
    __tablename__ = "service_applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    status = Column(String, default="pending") # pending, approved, rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
    service = relationship("Service")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String)
    description = Column(Text)
    status = Column(String, default="pending")
    location = Column(String) # For simplicity, a string or JSON (lat/lng)
    evidence_files = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sla_due = Column(DateTime(timezone=True))
    escalation_level = Column(Integer, default=0)
    
    events = relationship("ComplaintEvent", back_populates="complaint")

class ComplaintEvent(Base):
    __tablename__ = "complaint_events"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    event_type = Column(String)
    actor = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(Text)
    previous_hash = Column(String) # For tamper-evident audit log
    
    complaint = relationship("Complaint", back_populates="events")

class DocumentKB(Base):
    __tablename__ = "documents_kb"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    source_url = Column(String)
    jurisdiction = Column(String)
    content = Column(Text)
    last_verified_at = Column(DateTime(timezone=True))

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    messages_json = Column(JSON)
    model_version = Column(String)
    sources_used = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    previous_hash = Column(String) # For tamper-evident audit log
