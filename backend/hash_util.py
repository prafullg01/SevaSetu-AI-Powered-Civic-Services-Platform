import hashlib
import json
from sqlalchemy.orm import Session
from models import ComplaintEvent, Conversation

def get_last_hash(db: Session, model_class) -> str:
    last_entry = db.query(model_class).order_by(model_class.id.desc()).first()
    return last_entry.previous_hash if last_entry else "GENESIS_HASH"

def compute_hash(data: dict, prev_hash: str) -> str:
    payload = json.dumps(data, sort_keys=True) + prev_hash
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()

def create_hash_chained_event(db: Session, event_data: dict) -> ComplaintEvent:
    prev_hash = get_last_hash(db, ComplaintEvent)
    current_hash = compute_hash(event_data, prev_hash)
    
    event = ComplaintEvent(**event_data, previous_hash=current_hash)
    return event

def create_hash_chained_conversation(db: Session, conv_data: dict) -> Conversation:
    prev_hash = get_last_hash(db, Conversation)
    current_hash = compute_hash(conv_data, prev_hash)
    
    conv = Conversation(**conv_data, previous_hash=current_hash)
    return conv
