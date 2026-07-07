import json
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from . import models

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # 1. Check if seeded
    if db.query(models.Service).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding services...")
    services_data = [
        {
            "name": "Ration Card Renewal",
            "category": "Food & Civil Supplies",
            "department": "Public Distribution System",
            "eligibility_json": {"income_limit_pa": 100000, "age_min": 18},
            "required_docs": ["Aadhaar Card", "Old Ration Card", "Income Certificate"],
            "sla_days": 15
        },
        {
            "name": "Birth Certificate Request",
            "category": "Civil Registration",
            "department": "Municipal Corporation",
            "eligibility_json": {"age_max_days": 21},
            "required_docs": ["Hospital Discharge Summary", "Parents Aadhaar Card"],
            "sla_days": 7
        },
        {
            "name": "Report Pothole",
            "category": "Infrastructure",
            "department": "Public Works Department",
            "eligibility_json": {},
            "required_docs": ["Photo of Pothole"],
            "sla_days": 3
        },
        {
            "name": "New Water Connection",
            "category": "Utilities",
            "department": "Water Board",
            "eligibility_json": {"property_type": "residential"},
            "required_docs": ["Property Tax Receipt", "Aadhaar Card", "Sale Deed"],
            "sla_days": 30
        },
        {
            "name": "Small Business License",
            "category": "Commerce",
            "department": "Municipal Corporation",
            "eligibility_json": {"business_type": "retail"},
            "required_docs": ["Rent Agreement", "Aadhaar Card", "PAN Card"],
            "sla_days": 21
        }
        # Expand to 15 realistically later
    ]

    for svc in services_data:
        service_record = models.Service(**svc)
        db.add(service_record)

    # 2. Seed documents_kb (Mock policies)
    print("Seeding document KB...")
    documents_data = [
        {
            "title": "Ration Card Guidelines 2024",
            "source_url": "http://gov.example.com/ration-2024",
            "jurisdiction": "State",
            "content": "Ration cards are issued to households with an annual income below Rs. 1,000,000. Renewal requires submission of the old card and a recent income certificate. The process takes up to 15 days."
        },
        {
            "title": "Pothole Reporting Protocol",
            "source_url": "http://pwd.example.com/pothole",
            "jurisdiction": "Municipal",
            "content": "Citizens can report potholes by providing a photo and location. The Public Works Department commits to repairing reported potholes on major roads within 3 working days."
        },
        {
            "title": "Birth Registration Act",
            "source_url": "http://gov.example.com/birth",
            "jurisdiction": "National",
            "content": "Births must be registered within 21 days of occurrence. Hospital discharge summary and parents' identification are mandatory. Certificates are issued within 7 days of application."
        }
    ]

    for doc in documents_data:
        doc_record = models.DocumentKB(**doc)
        db.add(doc_record)

    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_db()
