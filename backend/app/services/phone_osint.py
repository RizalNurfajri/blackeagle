"""
Phone OSINT Service
Comprehensive phone number intelligence gathering including:
- Phone number validation and parsing
- Carrier and location detection
- WhatsApp presence check (simplified)
- Telegram presence check (simplified)
"""

import asyncio
import httpx
import phonenumbers
from phonenumbers import carrier, geocoder, timezone
from typing import Optional
from dataclasses import dataclass


@dataclass
class PhoneOsintResult:
    """Complete phone OSINT result."""
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
    line_type: str = "unknown"  # mobile, landline, voip, unknown
    
    # Messaging apps
    whatsapp: bool = False
    telegram: bool = False
    signal: bool = False
    viber: bool = False
    
    # Raw data
    national_number: str = ""
    international_format: str = ""


class PhoneOsintService:
    """Service for comprehensive phone OSINT."""
    
    def __init__(self):
        # Very short timeout for faster response
        self.timeout = httpx.Timeout(3.0, connect=2.0)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    
    async def investigate(self, phone: str) -> PhoneOsintResult:
        """
        Perform comprehensive phone number investigation.
        """
        result = PhoneOsintResult(phone=phone)
        
        # Step 1: Parse and validate phone number
        parsed = self._parse_phone(phone)
        
        if parsed is None:
            return result
        
        # Populate basic info from parsing (instant, no network)
        result.valid = phonenumbers.is_valid_number(parsed)
        result.possible = phonenumbers.is_possible_number(parsed)
        result.formatted = phonenumbers.format_number(
            parsed, 
            phonenumbers.PhoneNumberFormat.E164
        )
        result.international_format = phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.INTERNATIONAL
        )
        result.national_number = str(parsed.national_number)
        result.country_code = f"+{parsed.country_code}"
        
        # Get country name
        try:
            result.country_name = geocoder.description_for_number(parsed, "en") or "Unknown"
        except Exception:
            result.country_name = "Unknown"
        
        # Get region
        try:
            region = geocoder.description_for_number(parsed, "en")
            result.region = region if region else "Unknown"
        except Exception:
            result.region = "Unknown"
        
        # Get timezone
        try:
            tz_list = timezone.time_zones_for_number(parsed)
            result.timezone = tz_list[0] if tz_list else "Unknown"
        except Exception:
            result.timezone = "Unknown"
        
        # Get carrier
        try:
            result.carrier = carrier.name_for_number(parsed, "en") or "Unknown"
        except Exception:
            result.carrier = "Unknown"
        
        # Determine line type
        result.line_type = self._get_line_type(parsed)
        
        # Step 2: Check messaging apps using direct HTTP checks
        if result.valid:
            try:
                # Run checks in parallel
                wa_task = self._check_whatsapp(result.formatted)
                tg_task = self._check_telegram(result.formatted)
                
                (wa_exists, wa_name, wa_img), (tg_exists, tg_name, tg_img) = await asyncio.gather(wa_task, tg_task)
                
                result.whatsapp = wa_exists
                result.telegram = tg_exists
                
                # Prioritize Telegram name/img as it's more likely to be public
                if tg_name and tg_name != "Telegram":
                    result.name = tg_name
                if tg_img:
                    result.profile_image = tg_img
                    
                # If no telegram name, maybe we find something else later (or from WA if we enhance it)
                if not result.name and wa_name:
                    result.name = wa_name
                
            except Exception as e:
                print(f"Messaging app check error: {e}")
        
        return result

    async def _check_whatsapp(self, phone: str) -> tuple[bool, str, str]:
        """Check if number has WhatsApp and try to get name/image."""
        try:
            clean_phone = phone.replace('+', '')
            url = f"https://wa.me/{clean_phone}"
            name = ""
            image = ""
            
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url, follow_redirects=True)
                if resp.status_code == 200:
                    # WhatsApp sometimes puts name in title: "Share on WhatsApp" or "Chat on WhatsApp with..."
                    import re
                    content = resp.text
                    
                    # Try to find specific meta tags if they exist (rare on public wa.me but possible)
                    # Often it just says "Chat on WhatsApp with +62..." so scraping name is hard here
                    # But we verify existence.
                    return True, name, image
                return False, "", ""
        except:
            return False, "", ""

    async def _check_telegram(self, phone: str) -> tuple[bool, str, str]:
        """Check Telegram and scrape name/image if public."""
        try:
            clean_phone = phone.replace('+', '')
            url = f"https://t.me/+" + clean_phone
            name = ""
            image = ""
            
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url, follow_redirects=True)
                if resp.status_code == 200:
                    import re
                    content = resp.text
                    
                    # 1. Try generic OG title
                    # <meta property="og:title" content="Name">
                    og_title_match = re.search(r'<meta property="og:title" content="([^"]+)">', content)
                    if og_title_match:
                        raw_title = og_title_match.group(1)
                        # Filter out generic titles
                        if "Telegram: Contact" in raw_title:
                            # Usually "Telegram: Contact @username"
                            current_name = raw_title.replace("Telegram: Contact", "").strip()
                            if not current_name.startswith("@"):
                                name = current_name
                        elif "Join group chat" not in raw_title:
                            name = raw_title
                            
                    # 2. Try page title div
                    # <div class="tgme_page_title" dir="auto">Name</div>
                    if not name:
                        page_title_match = re.search(r'<div class="tgme_page_title"[^>]*>([^<]+)</div>', content)
                        if page_title_match:
                            name = page_title_match.group(1).strip()
                            
                    # 3. Try Profile Image
                    # <img class="tgme_page_photo_image" src="https://..." ...>
                    img_match = re.search(r'<img class="tgme_page_photo_image" src="([^"]+)"', content)
                    if img_match:
                        image = img_match.group(1)
                        
                    return True, name, image
                    
                return False, "", ""
        except:
            return False, "", ""
    
    def _parse_phone(self, phone: str) -> Optional[phonenumbers.PhoneNumber]:
        """Parse phone number string."""
        try:
            # Clean up the phone string
            phone = phone.strip()
            
            # If no country code, assume Indonesia (+62)
            if not phone.startswith('+'):
                if phone.startswith('0'):
                    phone = '+62' + phone[1:]
                elif phone.startswith('62'):
                    phone = '+' + phone
                else:
                    phone = '+62' + phone
            
            return phonenumbers.parse(phone, None)
        except Exception:
            return None
    
    def _get_line_type(self, parsed: phonenumbers.PhoneNumber) -> str:
        """Determine the line type (mobile, landline, voip)."""
        try:
            number_type = phonenumbers.number_type(parsed)
            
            type_map = {
                phonenumbers.PhoneNumberType.MOBILE: "mobile",
                phonenumbers.PhoneNumberType.FIXED_LINE: "landline",
                phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "mobile",
                phonenumbers.PhoneNumberType.VOIP: "voip",
                phonenumbers.PhoneNumberType.TOLL_FREE: "toll_free",
                phonenumbers.PhoneNumberType.PREMIUM_RATE: "premium",
                phonenumbers.PhoneNumberType.SHARED_COST: "shared_cost",
                phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "personal",
                phonenumbers.PhoneNumberType.PAGER: "pager",
                phonenumbers.PhoneNumberType.UAN: "uan",
            }
            
            return type_map.get(number_type, "unknown")
        except Exception:
            return "unknown"


# Singleton instance
_phone_osint_service = None

def get_phone_osint_service() -> PhoneOsintService:
    """Get or create singleton PhoneOsintService instance."""
    global _phone_osint_service
    if _phone_osint_service is None:
        _phone_osint_service = PhoneOsintService()
    return _phone_osint_service
