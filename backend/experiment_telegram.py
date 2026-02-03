
import asyncio
import httpx
import re

async def check_telegram_name(phone: str):
    clean_phone = phone.replace('+', '')
    url = f"https://t.me/+" + clean_phone
    print(f"Checking {url}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers, follow_redirects=True)
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 200:
            content = resp.text
            # Look for og:title or similar meta tags
            # Usually <meta property="og:title" content="Name">
            # OR <div class="tgme_page_title">Name</div>
            
            og_title = re.search(r'<meta property="og:title" content="([^"]+)">', content)
            page_title = re.search(r'<div class="tgme_page_title"[^>]*>([^<]+)</div>', content)
            img_src = re.search(r'<img class="tgme_page_photo_image" src="([^"]+)"', content)
            
            if og_title:
                print(f"Found Meta Title: {og_title.group(1)}")
            if page_title:
                print(f"Found Page Title: {page_title.group(1).strip()}")
            if img_src:
                print(f"Found Image: {img_src.group(1)}")
            
            # Save raw html for inspection if needed
            # with open("telegram_dump.html", "w", encoding="utf-8") as f:
            #     f.write(content)

async def main():
    # Use a dummy number or the one from previous context if valid
    # +62 812 3456 7890 might not have a telegram.
    # I'll try to find a known public telegram number or just test the scraping logic generically.
    # Since I don't have a known number, I will trust the logic if it extracts *something* from the structure.
    await check_telegram_name("+6289508006094") 

if __name__ == "__main__":
    asyncio.run(main())
