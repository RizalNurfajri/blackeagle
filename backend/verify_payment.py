
import asyncio
import httpx
import os

async def verify_payment():
    # Ensure MAYAR_API_KEY is available or at least we test the valid flow
    # Since I don't have the key, I expect an error from Mayar OR if the user added it to .env, success.
    
    url = "http://localhost:8000/api/v1/payment/create"
    payload = {
        "packageId": "pkg-test",
        "amount": 10000,
        "tokens": 4,
        "customerName": "Test User",
        "customerEmail": "test@example.com"
    }
    
    print("Testing Payment Creation...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10.0)
            print(f"Status: {resp.status_code}")
            print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify_payment())
