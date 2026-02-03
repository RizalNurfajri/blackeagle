from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class OsintLog(Base):
    __tablename__ = "osint_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module = Column(String(50), nullable=False) # email, phone, etc.
    query = Column(String(255), nullable=False)
    tokens_used = Column(Integer, default=1)
    result = Column(Text, nullable=True) # JSON string of result
    created_at = Column(DateTime(timezone=True), server_default=func.now())
