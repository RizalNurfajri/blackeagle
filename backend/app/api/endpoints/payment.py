import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import uuid
from ...core.config import settings

router = APIRouter()

class PaymentCreateRequest(BaseModel):
    packageId: str
    amount: int
    tokens: int
    customerName: str = "Customer"
    customerEmail: str = "customer@example.com"

@router.post("/create")
async def create_payment(request: PaymentCreateRequest):
    """
    Create a payment link using Mayar API.
    """
    mayar_api_key = settings.MAYAR_API_KEY
    base_url = settings.MAYAR_API_URL
    # Ensure no double slash if base_url ends with /
    if base_url.endswith("/"):
        base_url = base_url[:-1]
    mayar_api_url = f"{base_url}/payment/create"
    
    if not mayar_api_key:
        print("WARNING: MAYAR_API_KEY not set")
        # Fallback to mock if no key (for dev safety), or raise error?
        # Let's try to proceed but likely fail or return mock if intended for dev.
        # For now, let's return error to prompt user to set it.
        # raise HTTPException(status_code=500, detail="Payment configuration missing (MAYAR_API_KEY)")
        pass

    try:
        # Generate a unique order ID
        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        headers = {
            "Authorization": f"Bearer {mayar_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": request.customerName,
            "email": request.customerEmail,
            "amount": request.amount,
            "description": f"Topup {request.tokens} Tokens (Package: {request.packageId})",
            "mobile": "000000000000", # Optional or generic
            "redirectUrl": "http://localhost:3000/topup?status=success" # TODO: Make dynamic based on env
        }
        
        print(f"Creating Mayar payment for {order_id}...")
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(mayar_api_url, json=payload, headers=headers, timeout=10.0)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                # Mayar response format: {"data": {"link": "...", "id": "...", ...}}
                payment_link = data.get("data", {}).get("link")
                transaction_id = data.get("data", {}).get("id")
                
                return {
                    "success": True,
                    "paymentUrl": payment_link,
                    "transactionId": transaction_id,
                    "message": "Payment link created"
                }
            else:
                print(f"Mayar Error: {resp.text}")
                # If API fails (e.g. invalid key), fallback to mock in dev or return error
                # For this specific user request "ko payment gini" (why is it like this), they want REAL.
                # So we return the error from provider.
                return {
                    "success": False,
                    "error": f"Payment provider error: {resp.status_code}"
                }
                
    except Exception as e:
        print(f"Payment Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
