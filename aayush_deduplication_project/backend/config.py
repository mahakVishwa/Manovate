from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aayush Aayurved Patient Record Deduplication"
    DATABASE_URL: str = "sqlite:///./aayush_patients.db"
    
    # Matching thresholds (as per Phase 5)
    EXACT_MATCH_THRESHOLD: float = 0.95
    POSSIBLE_MATCH_THRESHOLD: float = 0.75
    
    # Weight factors: w1 * JaroWinkler + w2 * Levenshtein + w3 * VectorCosine
    WEIGHT_JARO_WINKLER: float = 0.35
    WEIGHT_LEVENSHTEIN: float = 0.25
    WEIGHT_VECTOR_COSINE: float = 0.40

    class Config:
        env_file = ".env"

settings = Settings()

