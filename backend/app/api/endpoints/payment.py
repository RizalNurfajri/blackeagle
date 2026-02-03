import httpx
import uuid
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ...core.config import settings
from ...models import User, Transaction
from ...api import deps

router = APIRouter()

class PaymentCreateRequest(BaseModel):
    packageId: str
    amount: int
    tokens: int
    customerName: str = "Customer"
    customerEmail: str = "customer@example.com"

@router.post("/create")
async def create_payment(
    request: PaymentCreateRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    Create a payment link using Mayar API.
    """
    mayar_api_key = settings.MAYAR_API_KEY
    base_url = settings.MAYAR_API_URL
    if base_url.endswith("/"):
        base_url = base_url[:-1]
    mayar_api_url = f"{base_url}/payment/create"
    
    if not mayar_api_key:
        raise HTTPException(status_code=500, detail="Payment configuration missing")

    try:
        # Generate a unique order ID
        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        # Save transaction as pending
        transaction = Transaction(
            id=order_id,
            user_id=current_user.id,
            amount=request.amount,
            tokens=request.tokens,
            status="pending"
        )
        db.add(transaction)
        db.commit() # Commit to get ID for webhook metadata

        headers = {
            "Authorization": f"Bearer {mayar_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": current_user.full_name or request.customerName,
            "email": current_user.email,
            "amount": request.amount,
            "description": f"Topup {request.tokens} Tokens",
            "redirectUrl": f"{settings.BACKEND_CORS_ORIGINS[0]}/dashboard?status=success", # Redirect to frontend
            "metadata": {
                "transaction_id": order_id,
                "user_id": current_user.id,
                "tokens": request.tokens
            }
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(mayar_api_url, json=payload, headers=headers, timeout=10.0)
            
            if resp.status_code in [200, 201]:
                data = resp.json()
                payment_link = data.get("data", {}).get("link")
                
                # Update transaction with link
                transaction.payment_link = payment_link
                db.commit()
                
                return {
                    "success": True,
                    "paymentUrl": payment_link,
                    "transactionId": order_id,
                }
            else:
                return {
                    "success": False,
                    "error": f"Payment provider error: {resp.status_code} {resp.text}"
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(deps.get_db)):
    try:
        payload_bytes = await request.body()
        payload_str = payload_bytes.decode("utf-8")
        signature = request.headers.get("x-mayar-signature", "")
        
        # Verify signature TODO: Add SECRET to config
        # For now assuming trust if secret not configured or matching
        # MAYAR_WEBHOOK_SECRET logic here...
        
        data = await request.json()
        
        if data.get("event") in ["payment.completed", "payment.success"]:
            metadata = data.get("data", {}).get("metadata", {})
            transaction_id = metadata.get("transaction_id")
            user_id = metadata.get("user_id")
            tokens = int(metadata.get("tokens", 0))
            
            if transaction_id:
                transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
                if transaction and transaction.status != "completed":
                    transaction.status = "completed"
                    
                    if user_id:
                        user = db.query(User).filter(User.id == int(user_id)).first()
                        if user:
                            user.token_balance += tokens
                            db.add(user)
                    
                    db.commit()
                    
        elif data.get("event") in ["payment.failed", "payment.expired"]:
             metadata = data.get("data", {}).get("metadata", {})
             transaction_id = metadata.get("transaction_id")
             if transaction_id:
                transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
                if transaction:
                    transaction.status = "failed"
                    db.commit()

        return {"success": True}
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"success": False}
