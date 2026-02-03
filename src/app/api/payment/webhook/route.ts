import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET

function verifySignature(payload: string, signature: string): boolean {
    if (!MAYAR_WEBHOOK_SECRET) return true // Skip verification if secret not set

    const hmac = crypto.createHmac('sha256', MAYAR_WEBHOOK_SECRET)
    hmac.update(payload)
    const expectedSignature = hmac.digest('hex')
    return signature === expectedSignature
}

export async function POST(request: Request) {
    try {
        const payload = await request.text()
        const signature = request.headers.get('x-mayar-signature') || ''

        // Verify webhook signature
        if (!verifySignature(payload, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const data = JSON.parse(payload)
        const supabase = await createClient()

        // Handle different event types
        if (data.event === 'payment.completed' || data.event === 'payment.success') {
            const transactionId = data.data?.metadata?.transaction_id
            const tokens = parseInt(data.data?.metadata?.tokens || '0')
            const userId = data.data?.metadata?.user_id

            if (!transactionId || !tokens || !userId) {
                return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
            }

            // Update transaction status
            await supabase
                .from('transactions')
                .update({ status: 'completed' })
                .eq('id', transactionId)

            // Add tokens to user balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('token_balance')
                .eq('id', userId)
                .single()

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ token_balance: profile.token_balance + tokens })
                    .eq('id', userId)
            }

            return NextResponse.json({ success: true })
        }

        if (data.event === 'payment.failed' || data.event === 'payment.expired') {
            const transactionId = data.data?.metadata?.transaction_id

            if (transactionId) {
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transactionId)
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: true, message: 'Event ignored' })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
