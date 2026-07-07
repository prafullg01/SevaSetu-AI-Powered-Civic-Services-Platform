from database import SessionLocal
from models import Service, DocumentKB
import rag

def seed_db():
    db = SessionLocal()
    
    # 1. Seed Services
    if db.query(Service).count() == 0:
        print("Seeding Services...")
        services = [
            Service(
                name="Aadhaar Card Update",
                category="Identity",
                department="UIDAI",
                eligibility_json={"age_limit": "None", "citizenship": "Indian"},
                required_docs=["Proof of Identity", "Proof of Address"],
                sla_days=15
            ),
            Service(
                name="Ration Card Application",
                category="Food Security",
                department="FCS",
                eligibility_json={"income_limit": "< 1,00,000/yr", "citizenship": "Indian"},
                required_docs=["Income Certificate", "Aadhaar Card", "Passport Photo"],
                sla_days=30
            ),
            Service(
                name="Driving License",
                category="Transport",
                department="RTO",
                eligibility_json={"age_limit": "18+", "citizenship": "Indian"},
                required_docs=["Age Proof", "Address Proof", "Learner's License"],
                sla_days=7
            )
        ]
        db.add_all(services)
        db.commit()
    else:
        print("Services already seeded.")
        
    # 2. Seed DocumentKB
    if db.query(DocumentKB).count() == 0:
        print("Seeding Documents...")
        docs = [
            DocumentKB(
                title="Aadhaar Card Rules",
                source_url="uidai.gov.in",
                jurisdiction="National",
                content="To update an Aadhaar card, a citizen must visit an authorized Aadhaar center or use the online portal. Valid proof of address is mandatory for address updates."
            ),
            DocumentKB(
                title="Ration Card Guidelines",
                source_url="fcs.gov.in",
                jurisdiction="State",
                content="Ration cards are issued based on annual family income. Families earning below 1 lakh per annum are eligible for the BPL category ration card."
            )
        ]
        db.add_all(docs)
        db.commit()
        
        # Seed vector DB
        rag.seed_vector_db()
    else:
        print("Documents already seeded.")
        
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
