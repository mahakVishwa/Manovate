import os
import sys

# Ensure backend root is always on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Mount built React frontend if present
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_path):
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/app")
    @app.get("/app/{full_path:path}")
    def serve_react_app(full_path: str = ""):
        return FileResponse(os.path.join(dist_path, "index.html"))

@app.get("/")
def root():
    # If React frontend is built, redirect or serve it directly, while providing API metadata
    if os.path.exists(dist_path):
        return FileResponse(os.path.join(dist_path, "index.html"))
    return {
        "project": settings.PROJECT_NAME,
        "standard": "Bizznnovate 2026",
        "status": "Operational",
        "documentation": "/docs",
        "frontend": "/app",
        "branches_supported": [
            "Branch 01 - North",
            "Branch 02 - South",
            "Branch 03 - East",
            "Branch 04 - West",
            "Branch 05 - Central",
            "Branch 06 - Metro"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

