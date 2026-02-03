import sys
import os
import requests

# Adjust path to find backend modules if running locally, or just test via HTTP
# Testing via HTTP is better for "Integration Test"

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    print("Testing API Health...")
    try:
        # Check root (main.py defines @app.get("/"))
        r = requests.get("http://localhost:8000/")
        if r.status_code == 200:
            print("✅ Backend is running")
        else:
            print(f"❌ Backend returned {r.status_code}")
    except Exception as e:
        print(f"❌ Backend not reachable: {e}")

def test_register():
    print("\nTesting Registration...")
    email = "test_migration@example.com"
    password = "password123"
    full_name = "Test Migration User"
    
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name
    }
    
    r = requests.post(f"{BASE_URL}/auth/register", json=payload)
    
    if r.status_code == 200:
        print("✅ Registration successful")
        return email, password
    elif r.status_code == 400 and "already exists" in r.text:
         print("⚠️ User already exists (Skipping reg)")
         return email, password
    else:
        print(f"❌ Registration failed: {r.text}")
        return None, None

def test_login(email, password):
    print("\nTesting Login...")
    if not email: return None
    
    data = {
        "username": email,
        "password": password
    }
    
    r = requests.post(f"{BASE_URL}/auth/login/access-token", data=data) # OAuth2 form data
    
    if r.status_code == 200:
        token = r.json().get("access_token")
        print("✅ Login successful. Token received.")
        return token
    else:
        print(f"❌ Login failed: {r.text}")
        return None

def test_protected_endpoint(token):
    print("\nTesting Protected Endpoint (Me)...")
    if not token: return
    
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if r.status_code == 200:
        user = r.json()
        print(f"✅ Access granted. User: {user.get('email')} Balance: {user.get('token_balance')}")
        return user
    else:
        print(f"❌ Access denied: {r.text}")
        return None

def test_osint_scan(token):
    print("\nTesting OSINT Scan (Token Deduction)...")
    if not token: return
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"email": "test@example.com"} # Mock scan
    
    # Pre-check balance
    r_me = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    balance_before = r_me.json().get("token_balance")
    print(f"Balance before: {balance_before}")
    
    r = requests.post(f"{BASE_URL}/osint/email", headers=headers, json=payload)
    
    if r.status_code == 200:
        print("✅ Scan successful")
        
        # Post-check balance
        r_me_after = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        balance_after = r_me_after.json().get("token_balance")
        print(f"Balance after: {balance_after}")
        
        if balance_after == balance_before - 1:
            print("✅ Token deducted correctly")
        else:
            print(f"❌ Token deduction failed (Diff: {balance_before - balance_after})")
            
    else:
        print(f"❌ Scan failed: {r.text}")

if __name__ == "__main__":
    print("--- MIGRATION VERIFICATION SCRIPT ---")
    test_health()
    email, pwd = test_register()
    if email:
        token = test_login(email, pwd)
        if token:
            user = test_protected_endpoint(token)
            if user:
                test_osint_scan(token)
