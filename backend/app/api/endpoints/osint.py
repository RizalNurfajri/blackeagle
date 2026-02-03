"""
OSINT API Endpoints
Provides real OSINT intelligence for email and phone numbers.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from dataclasses import asdict

from ...services.email_osint import get_email_osint_service
from ...services.phone_osint import get_phone_osint_service

router = APIRouter()


class EmailRequest(BaseModel):
    email: str
    deep_scan: bool = False  # Quick scan (16 sites) or Deep scan (757+ sites)


class PhoneRequest(BaseModel):
    phone: str


# Response models
class BreachInfoResponse(BaseModel):
    name: str
    domain: str = ""
    date: str = "Unknown"
    data_types: List[str] = []


class SocialProfileResponse(BaseModel):
    platform: str
    url: str
    username: Optional[str] = None
    exists: bool = False
    category: str = "unknown"
    icon: str = "globe"


class GravatarResponse(BaseModel):
    url: str
    hash: str
    display_name: Optional[str] = None
    profile_url: Optional[str] = None


class EmailOsintResponse(BaseModel):
    email: str
    valid: bool = False
    format_valid: bool = False
    mx_valid: bool = False
    disposable: bool = False
    free_provider: bool = False
    deliverable: bool = False
    
    # Breach data
    breached: bool = False
    breach_count: int = 0
    breaches: List[BreachInfoResponse] = []
    
    # Gravatar
    gravatar: Optional[GravatarResponse] = None
    gravatar_url: Optional[str] = None
    
    # Social profiles
    social_profiles: List[SocialProfileResponse] = []
    social_count: int = 0


class PhoneOsintResponse(BaseModel):
    phone: str
    formatted: str = ""
    valid: bool = False
    possible: bool = False
    
    # Caller ID
    name: str = ""
    profile_image: str = ""
    
    # Location info
    country_code: str = ""
    country_name: str = ""
    region: str = ""
    timezone: str = ""
    
    # Carrier info
    carrier: str = ""
    line_type: str = "unknown"
    
    # Messaging apps
    whatsapp: bool = False
    telegram: bool = False
    signal: bool = False
    viber: bool = False
    
    # Raw data
    national_number: str = ""
    international_format: str = ""


@router.post("/email")
async def scan_email(request: EmailRequest):
    """
    Comprehensive email OSINT scan.
    
    Checks:
    - Email format validation
    - MX record verification
    - Disposable email detection
    - Gravatar profile lookup
    - Data breach detection
    - Social media discovery
    """
    try:
        service = get_email_osint_service()
        result = await service.investigate(request.email, deep_scan=request.deep_scan)
        
        # Convert dataclass to dict for response
        response_data = {
            "email": result.email,
            "valid": result.valid,
            "format_valid": result.format_valid,
            "mx_valid": result.mx_valid,
            "disposable": result.disposable,
            "free_provider": result.free_provider,
            "deliverable": result.deliverable,
            "breached": result.breached,
            "breach_count": result.breach_count,
            "breaches": [
                {
                    "name": b.name,
                    "domain": b.domain,
                    "date": b.date,
                    "data_types": b.data_types
                }
                for b in result.breaches
            ],
            "gravatar": {
                "url": result.gravatar.url,
                "hash": result.gravatar.hash,
                "display_name": result.gravatar.display_name,
                "profile_url": result.gravatar.profile_url
            } if result.gravatar else None,
            "gravatar_url": result.gravatar_url,
            "social_profiles": [
                {
                    "platform": p.platform,
                    "url": p.url,
                    "username": p.username,
                    "exists": p.exists,
                    "category": p.category,
                    "icon": p.icon
                }
                for p in result.social_profiles
            ],
            "social_count": result.social_count
        }
        
        return {
            "success": True,
            "data": response_data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/phone")
async def scan_phone(request: PhoneRequest):
    """
    Comprehensive phone OSINT scan.
    
    Checks:
    - Phone number validation
    - Carrier identification
    - Location/region detection
    - WhatsApp presence
    - Telegram presence
    """
    try:
        service = get_phone_osint_service()
        result = await service.investigate(request.phone)
        
        # Convert dataclass to dict for response
        response_data = {
            "phone": result.phone,
            "formatted": result.formatted,
            "valid": result.valid,
            "possible": result.possible,
            "name": result.name,
            "profile_image": result.profile_image,
            "country_code": result.country_code,
            "country_name": result.country_name,
            "region": result.region,
            "timezone": result.timezone,
            "carrier": result.carrier,
            "line_type": result.line_type,
            "whatsapp": result.whatsapp,
            "telegram": result.telegram,
            "signal": result.signal,
            "viber": result.viber,
            "national_number": result.national_number,
            "international_format": result.international_format
        }
        
        return {
            "success": True,
            "data": response_data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
