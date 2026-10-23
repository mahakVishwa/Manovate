from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.router import api_router
from config import settings

# Create tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Automated end-to-end processing pipeline to identify, reconcile, and unify cross-branch patient identities across six decentralized Aayush Aayurved Clinic databases.",
    version="1.0.0"
)

# Enable CORS for frontend UI connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "standard": "Bizznnovate 2026",
        "status": "Operational",
        "documentation": "/docs",
        "branches_supported": [
            "Branch 01 - North",
            "Branch 02 - South",
            "Branch 03 - East",
            "Branch 04 - West",
            "Branch 05 - Central",
            "Branch 06 - Metro"
        ],
        "thresholds": {
            "exact_match": settings.EXACT_MATCH_THRESHOLD,
            "possible_match": settings.POSSIBLE_MATCH_THRESHOLD,
            "weights": {
                "jaro_winkler": settings.WEIGHT_JARO_WINKLER,
                "levenshtein": settings.WEIGHT_LEVENSHTEIN,
                "vector_cosine": settings.WEIGHT_VECTOR_COSINE
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
