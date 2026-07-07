# SevaSetu / CivicSaathi

**AI-Powered Civic Services Platform** — A premium dark-theme web application that simplifies citizen-government interactions using AI.

### 🌐 Live Demo & Deployment
- **Frontend (Vercel):** [https://seva-setu-ai-powered-civic-services-ten.vercel.app](https://seva-setu-ai-powered-civic-services-ten.vercel.app)
- **Backend API (Render):** [https://civicsaathi-api.onrender.com](https://civicsaathi-api.onrender.com) *(Note: Replace with your exact Render URL if it differs)*

## Features

- **AI Chat Assistant** — Ask questions about civic services with voice input support
- **Service Applications** — Apply for Aadhaar, PAN, Ration Card, Driving License with document checklists
- **Complaint Tracker** — File complaints with hash-chained, tamper-evident audit trails
- **Gov-Speak Simplifier** — Convert complex government language to plain English (text & PDF)
- **Admin Dashboard** — Verify applications, respond to complaints, manage AI knowledge base
- **Trust & Provenance** — Full audit log of all AI conversations with source citations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI + SQLAlchemy + SQLite |
| AI | Google Gemini API + ChromaDB (RAG) |
| Design | Dark glassmorphism with SVG icons & CSS animations |

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# Create .env with GEMINI_API_KEY=your_key
python seed_db.py
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- **Frontend**: Deploy to Vercel — auto-detects Vite
- **Backend**: Deploy to Render — uses `requirements.txt` and `uvicorn main:app`

## Screenshots

The app features a premium dark glassmorphism UI with:
- Animated ambient background orbs
- Dot-grid overlay pattern
- Staggered fade-in-up animations
- Color-coded status badges
- SVG iconography throughout (zero emojis)
