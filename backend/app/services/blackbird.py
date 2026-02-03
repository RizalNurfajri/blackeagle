"""
Blackbird Service - CLI-based Implementation
Runs the Blackbird CLI tool via subprocess for reliable OSINT lookups.
"""

import subprocess
import json
import os
import asyncio
import glob
import sys
import logging
from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class BlackbirdResult:
    """Result from a Blackbird site check."""
    platform: str
    url: str
    exists: bool
    category: str = "unknown"
    metadata: Optional[dict] = None


class BlackbirdService:
    """Service for running Blackbird OSINT via CLI."""
    
    def __init__(self):
        # Path to the Blackbird CLI (backend/blackbird/)
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.blackbird_dir = os.path.join(backend_dir, "blackbird")
        self.blackbird_script = os.path.join(self.blackbird_dir, "blackbird.py")
        self.results_dir = os.path.join(self.blackbird_dir, "results")
        
        logging.info(f"[BlackbirdService] Initialized with script at: {self.blackbird_script}")
        
        # Verify Blackbird exists
        if not os.path.exists(self.blackbird_script):
            raise FileNotFoundError(f"Blackbird not found at {self.blackbird_script}")
    
    async def check_email(self, email: str, deep_scan: bool = False) -> List[BlackbirdResult]:
        """Check email using Blackbird CLI."""
        logging.info(f"[BlackbirdService] check_email called with: {email}")
        return await self._run_blackbird("-e", email)
    
    async def check_username(self, username: str) -> List[BlackbirdResult]:
        """Check username using Blackbird CLI."""
        return await self._run_blackbird("-u", username)

    async def check_phone(self, phone: str) -> List[BlackbirdResult]:
        """
        Check phone number using Blackbird CLI.
        Note: Blackbird CLI uses '--phone' or '-p' for phone lookup if supported.
        Assuming '-p' is the flag based on standard CLI conventions for this tool.
        """
        return await self._run_blackbird("-p", phone)
    
    async def _run_blackbird(self, flag: str, value: str) -> List[BlackbirdResult]:
        """Run Blackbird CLI using async subprocess."""
        results = []
        
        logging.info(f"[BlackbirdService] Starting CLI execution for {flag} {value}")
        
        try:
            # Define sync function to run in thread
            def run_cli():
                # Prepare environment with enforced UTF-8 encoding
                env = os.environ.copy()
                env["PYTHONIOENCODING"] = "utf-8"
                env["PYTHONUTF8"] = "1"
                
                return subprocess.run(
                    [sys.executable, self.blackbird_script, flag, value, "--json", "--no-update"],
                    cwd=self.blackbird_dir,
                    capture_output=True,
                    env=env,
                    stdin=subprocess.DEVNULL,
                    timeout=300
                )

            # Run blocking subprocess in a separate thread to avoid EventLoop issues on Windows
            logging.info(f"[BlackbirdService] Spawning thread for subprocess...")
            
            # Use asyncio.to_thread (Python 3.9+)
            process = await asyncio.to_thread(run_cli)
            
            logging.info(f"[BlackbirdService] Subprocess completed with code: {process.returncode}")
            
            if process.returncode != 0:
                logging.error(f"[BlackbirdService] Stderr: {process.stderr.decode('utf-8', errors='ignore')}")
                # Don't return empty yet, sometimes it writes to stderr but still works
             
             # stdout/stderr are bytes because we used capture_output=True (implies binary mode without text=True)
             # Decode for logging if needed, checking partial output
            stdout_str = process.stdout.decode('utf-8', errors='ignore')
            stderr_str = process.stderr.decode('utf-8', errors='ignore')

        except subprocess.TimeoutExpired:
             logging.warning("[BlackbirdService] Subprocess timed out! Proceeding to check for partial results...")
             stdout_str = "" # Unknown
        except Exception as e:
             logging.error(f"[BlackbirdService] Execution error: {e}")
             # We might still want to check for files if it was just a subprocess error
             stdout_str = ""
        
        try:
            # Find the result JSON file - look for folder starting with value followed by underscore (date)
            # Format: {value}_{date}_blackbird/{value}_{date}_blackbird.json
            # STRICTER PATTERN: Remove leading * and add _ to prevent 'user' matching 'user@email.com'
            pattern = os.path.join(self.results_dir, f"{value}_*_blackbird", "*.json")
            
            logging.info(f"[BlackbirdService] Looking for results with pattern: {pattern}")
            
            json_files = glob.glob(pattern)
            
            if json_files:
                json_file = json_files[0]
                logging.info(f"[BlackbirdService] Found: {json_file}")
                
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Blackbird JSON format is a list of site objects, not a dict
                sites = data if isinstance(data, list) else data.get("sites", [])
                for site in sites:
                    if site.get("status") == "FOUND":
                        results.append(BlackbirdResult(
                            platform=site.get("name", "Unknown"),
                            url=site.get("url", ""),
                            exists=True,
                            category=site.get("category", "unknown")
                        ))
                
                logging.info(f"[BlackbirdService] Parsed {len(results)} found accounts")
                
                # Cleanup
                # try:
                #     import shutil
                #     shutil.rmtree(os.path.dirname(json_file))
                # except Exception as e:
                #     logging.warning(f"[BlackbirdService] Cleanup warning: {e}")
            else:
                logging.warning(f"[BlackbirdService] No result files found")
                logging.warning(f"[BlackbirdService] Stdout: {stdout_str[-500:]}")
                
        except Exception as e:
            logging.error(f"[BlackbirdService] Error: {e}")
            import traceback
            traceback.print_exc()
        
        return results


# Singleton instance
_blackbird_service = None

def get_blackbird_service() -> BlackbirdService:
    """Get or create singleton BlackbirdService instance."""
    global _blackbird_service
    if _blackbird_service is None:
        _blackbird_service = BlackbirdService()
    return _blackbird_service
