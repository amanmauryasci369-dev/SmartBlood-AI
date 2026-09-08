from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed database if user records are missing
    try:
        from app.core.database import SessionLocal
        from app.models.user import User
        from app.seed import seed_database
        from app.db.seed_hospital_exchange import seed_hospital_exchange

        with SessionLocal() as db:
            if db.query(User).count() == 0:
                print("Database is empty. Running seed_database() and seed_hospital_exchange()...")
                seed_database()
                seed_hospital_exchange()
    except Exception as e:
        print(f"Startup database seeding notification: {e}")
        
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## SmartBlood AI API (SIH Problem Statement: 26202)
    AI-Powered Intelligent Blood Resource Management and Emergency Coordination System.

    ### Compliance & Architectural Disclaimers:
    - **Availability Taxonomy**: Strictly distinguishes `REPORTED_AVAILABILITY`, `PREDICTED_AVAILABILITY`, `RECOMMENDED_ACTION`, and `CONFIRMED_AVAILABILITY`.
    - **Adapter Architecture**: Integrations use synthetic e-RaktKosh-compatible schemas for testing and evaluation (no unauthorized public APIs).
    - **Privacy & Safety**: Synthetic patient/donor records only. Sensitive donor contact information is masked.
    - **Clinical Decision Support (CDS)**: All AI allocations and routing outputs are decision support advisories only; clinical confirmation remains with authorized healthcare professionals.
    """,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (both /api/v1 and /api for client compatibility)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["Health & Status"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "development/evaluation",
        "adapter_mode": "SYNTHETIC_ERAKTKOSH_COMPATIBLE" if settings.USE_SYNTHETIC_ERAKTKOSH_DATA else "PRODUCTION_GATEWAY",
        "compliance": {
            "real_patient_data": False,
            "masked_donor_pii": True,
            "clinical_decision_support_only": True
        }
    }
