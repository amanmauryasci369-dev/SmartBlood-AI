from fastapi import APIRouter
from app.api.v1 import (
    auth, facilities, inventory, emergency, predictions, transfers, intelligence,
    fefo_expiry, wastage, hospital_requests, admin_config, allocation, hospital_exchange
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(facilities.router, prefix="/facilities", tags=["Facilities"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Blood Inventory & Adapters"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Emergency SOS Coordination"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictive Analytics & ML"])
api_router.include_router(transfers.router, prefix="/transfers", tags=["Inter-Facility Rebalancing"])
api_router.include_router(intelligence.router, prefix="/intel", tags=["Smart Automation & AI Insights"])
api_router.include_router(allocation.router, prefix="/allocation", tags=["Smart Blood Allocation (FEFO)"])
api_router.include_router(hospital_exchange.router, prefix="/hospital-exchange", tags=["Hospital Blood Exchange (H2H FEFO)"])

# New Extension Routers
api_router.include_router(fefo_expiry.router, tags=["Shelf-Life & FEFO Prioritization"])
api_router.include_router(wastage.router, tags=["Blood Wastage Analytics & Reduction"])
api_router.include_router(hospital_requests.router, tags=["Hospital Resource Network & Coordination"])
api_router.include_router(admin_config.router, tags=["Administrative Configuration"])
