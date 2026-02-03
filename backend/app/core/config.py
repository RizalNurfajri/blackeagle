import os
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # OSINT APIs
    EVA_API_KEY: str = os.getenv("EVA_API_KEY", "")
    BREACH_DIRECTORY_API_KEY: str = os.getenv("BREACH_DIRECTORY_API_KEY", "")
    
    # Payment
    MAYAR_API_KEY: str = os.getenv("MAYAR_API_KEY", "")
    MAYAR_API_URL: str = "https://api.mayar.id/hl/v1"

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost/blackeagle")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changethis_secret_key_generated_by_openssl_rand_hex_32")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days

    class Config:
        env_file = ["../.env.local", ".env", "../.env"]
        extra = "ignore"

settings = Settings()
