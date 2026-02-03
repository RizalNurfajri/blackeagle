
import httpx
import time

def verify_api():
    url = "http://localhost:8000/api/v1/osint/phone"
    data = {"phone": "+6281234567890"}
    
    print(f"Sending request to {url}...")
    start = time.time()
    try:
        response = httpx.post(url, json=data, timeout=10.0)
        duration = time.time() - start
        
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {duration:.2f}s")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200 and response.json().get("success"):
            print("VERIFICATION SUCCESS: API returned success.")
        else:
            print("VERIFICATION FAILED: API error.")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    verify_api()
