
import asyncio
import httpx
import time

async def check_whatsapp(phone: str) -> bool:
    print(f"Checking WhatsApp for {phone}...")
    start = time.time()
    try:
        clean_phone = phone.replace('+', '')
        url = f"https://wa.me/{clean_phone}"
        print(f"  URL: {url}")
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            print("  sending HEAD request...")
            resp = await client.head(url, follow_redirects=True)
            print(f"  WhatsApp Status: {resp.status_code} (took {time.time() - start:.2f}s)")
            return resp.status_code == 200
    except Exception as e:
        print(f"  WhatsApp Error: {e} (took {time.time() - start:.2f}s)")
        return False

async def check_telegram(phone: str) -> bool:
    print(f"Checking Telegram for {phone}...")
    start = time.time()
    try:
        clean_phone = phone.replace('+', '')
        url = f"https://t.me/+" + clean_phone
        print(f"  URL: {url}")
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            print("  sending GET request...")
            resp = await client.get(url, follow_redirects=True)
            print(f"  Telegram Status: {resp.status_code} (took {time.time() - start:.2f}s)")
            return resp.status_code == 200
    except Exception as e:
        print(f"  Telegram Error: {e} (took {time.time() - start:.2f}s)")
        return False

async def main():
    phone = "+6281234567890" # Example number
    print(f"Starting checks for {phone}")
    
    wa_task = check_whatsapp(phone)
    tg_task = check_telegram(phone)
    
    await asyncio.gather(wa_task, tg_task)
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
