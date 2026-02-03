"""
Email OSINT Service
Comprehensive email intelligence gathering including:
- Email validation (format, MX records)
- Disposable email detection
- Gravatar profile lookup
- Data breach detection
- Social media discovery
"""

import re
import sys
import logging
import hashlib
import asyncio
import dns.resolver
import httpx
from typing import Optional, List
from dataclasses import dataclass, field
from ..data.disposable_domains import is_disposable, is_free_provider


@dataclass
class GravatarProfile:
    """Gravatar profile data."""
    url: str
    hash: str
    display_name: Optional[str] = None
    profile_url: Optional[str] = None
    photos: list = field(default_factory=list)


@dataclass
class BreachInfo:
    """Data breach information."""
    name: str
    domain: str
    date: str
    data_types: list = field(default_factory=list)


@dataclass
class SocialProfile:
    """Social media profile."""
    platform: str
    url: str
    username: Optional[str] = None
    exists: bool = False
    category: str = "unknown"
    icon: str = "globe"


@dataclass
class EmailOsintResult:
    """Complete email OSINT result."""
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
    breaches: list = field(default_factory=list)
    
    # Gravatar
    gravatar: Optional[GravatarProfile] = None
    gravatar_url: Optional[str] = None
    
    # Social profiles
    social_profiles: list = field(default_factory=list)
    social_count: int = 0


class EmailOsintService:
    """Service for comprehensive email OSINT."""
    
    # Email regex pattern
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def __init__(self):
        # Shorter timeouts for faster response
        self.timeout = httpx.Timeout(5.0, connect=3.0)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    
    async def investigate(self, email: str, deep_scan: bool = False) -> EmailOsintResult:
        """
        Perform comprehensive email investigation using Blackbird.
        deep_scan: If True, checks 700+ username sites. If False, only 16 email-specific sites.
        """
        print(f"[OSINT] investigate() called with email={email}, deep_scan={deep_scan}")
        sys.stdout.flush()
        
        result = EmailOsintResult(email=email)
        
        # Step 1: Validate email format
        result.format_valid = self._validate_format(email)
        if not result.format_valid:
            return result
        
        # Extract domain
        domain = email.split("@")[1].lower()
        username = email.split("@")[0].lower()
        
        # Step 2: Check disposable and free provider (instant, no network)
        result.disposable = is_disposable(domain)
        result.free_provider = is_free_provider(domain)
        
        # Step 3: Run async checks (MX + Blackbird)
        try:
            # We only look for MX records and Social Profiles (Blackbird)
            # Gravatar and Breaches are removed as requested to rely ONLY on Blackbird
            mx_valid, social_profiles = await asyncio.wait_for(
                asyncio.gather(
                    self._check_mx_records(domain),
                    self._check_social_profiles(email, username, deep_scan),
                    return_exceptions=True
                ),
                timeout=300.0  # Increased for Blackbird CLI which takes ~20-30 seconds (or more for username)
            )
        except asyncio.TimeoutError:
            # If timeout, return what we have
            mx_valid = False
            social_profiles = []
        
        # Handle MX result
        if isinstance(mx_valid, bool):
            result.mx_valid = mx_valid
        
        # Overall validity
        result.valid = result.format_valid and result.mx_valid
        result.deliverable = result.valid and not result.disposable
        
        # Handle social profiles result - check if it's an exception
        logging.warning(f"[DEBUG] social_profiles type: {type(social_profiles)}, value: {social_profiles}")
        
        if isinstance(social_profiles, Exception):
            logging.error(f"[DEBUG] social_profiles is exception: {social_profiles}")
            import traceback
            traceback.print_exception(type(social_profiles), social_profiles, social_profiles.__traceback__)
            social_profiles = []
        
        if isinstance(social_profiles, list):
            result.social_profiles = social_profiles
            result.social_count = len([p for p in social_profiles if p.exists])
            
            # Use Blackbird's Gravatar result if present to populate gravatar field
            # This keeps the frontend UI for Gravatar working if Blackbird finds it
            for profile in result.social_profiles:
                if profile.platform.lower() == "gravatar" and profile.exists:
                    result.gravatar_url = profile.url
                    # Construct a basic profile object so UI doesn't break
                    result.gravatar = GravatarProfile(
                        url=profile.url,
                        hash=hashlib.md5(email.lower().encode()).hexdigest(),
                        display_name=None, # Blackbird might not return this detail in simple check
                        profile_url=profile.url
                    )

        return result
    
    def _validate_format(self, email: str) -> bool:
        """Validate email format using regex."""
        return bool(self.EMAIL_PATTERN.match(email))
    
    async def _check_mx_records(self, domain: str) -> bool:
        """Check if domain has valid MX records."""
        try:
            # Run DNS query in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            mx_records = await asyncio.wait_for(
                loop.run_in_executor(
                    None, 
                    lambda: dns.resolver.resolve(domain, 'MX')
                ),
                timeout=3.0
            )
            return len(list(mx_records)) > 0
        except Exception:
            return False
    
    async def _check_social_profiles(self, email: str, username: str, deep_scan: bool) -> List[SocialProfile]:
        """
        Check social profiles using Blackbird.
        """
        print(f"[DEBUG] _check_social_profiles (Hybrid Scan) called for {email}, username={username}")
        from .blackbird import get_blackbird_service, BlackbirdResult
        blackbird_service = get_blackbird_service()
        
        profiles = []
        try:
            print(f"[DEBUG] Starting Blackbird scan (Email + Username) for {email}")
            
            # Run email and username checks in parallel to maximize results
            # We always run both to satisfy "more results" requirement
            results_list = await asyncio.gather(
                blackbird_service.check_email(email, deep_scan),
                blackbird_service.check_username(username),
                return_exceptions=True
            )
            
            # Flatten results and handle exceptions
            blackbird_results = []
            for res in results_list:
                if isinstance(res, list):
                    blackbird_results.extend(res)
                elif isinstance(res, Exception):
                    logging.error(f"[BlackbirdService] Partial scan failed: {res}")
            
            # Deduplicate based on URL
            seen_urls = set()
            unique_results = []
            for r in blackbird_results:
                if r.url not in seen_urls:
                    seen_urls.add(r.url)
                    unique_results.append(r)
            
            logging.info(f"[BlackbirdService] Total unique results found: {len(unique_results)}")
            print(f"[BlackbirdService] Total unique results found: {len(unique_results)}")
            
            # Map to SocialProfile
            for site in unique_results:
                profiles.append(SocialProfile(
                    platform=site.platform,
                    url=site.url,
                    username=username, # Use the scoped username variable since BlackbirdResult doesn't have it
                    exists=True,
                    category=site.category,
                    icon=site.platform.lower().replace(" ", "-") # Helper to find icon
                ))
                        
        except Exception as e:
            import traceback
            print(f"Social profile check error: {e}")
            traceback.print_exc()
        
        return profiles


# Singleton instance
_email_osint_service = None

def get_email_osint_service() -> EmailOsintService:
    """Get or create singleton EmailOsintService instance."""
    global _email_osint_service
    if _email_osint_service is None:
        _email_osint_service = EmailOsintService()
    return _email_osint_service
