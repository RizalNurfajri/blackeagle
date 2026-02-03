
import asyncio
import logging
import os
import sys

# Setup logging
logging.basicConfig(level=logging.INFO)

# Modify path to find app module
sys.path.append(r"d:\Coding Learning\blackeagle\backend")

from app.services.blackbird import BlackbirdService

async def main():
    service = BlackbirdService()
    username = "rizalnurfajri555"
    print(f"Checking username: {username}")
    
    # We expect this to find the existing file if checking new one fails/times out
    # Or create a new one
    try:
        results = await service.check_username(username)
        print(f"Results found: {len(results)}")
        for r in results[:5]:
            print(f"- {r.name}: {r.url}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
