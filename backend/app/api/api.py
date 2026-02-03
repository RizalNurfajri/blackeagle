from fastapi import APIRouter
from app.api.endpoints import osint, payment

api_router = APIRouter()
api_router.include_router(osint.router, prefix="/osint", tags=["osint"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
