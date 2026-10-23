from fastapi import APIRouter
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.review import router as review_router

api_router = APIRouter()
api_router.include_router(ingestion_router, prefix="/v1")
api_router.include_router(review_router, prefix="/v1")
