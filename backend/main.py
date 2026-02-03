from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

from app.core.config import settings
from app.core.database import engine, Base
# Import all models to ensure they are registered
from app.models import User, OsintLog, Transaction

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BlackEagle OSINT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "BlackEagle OSINT API is running"}
