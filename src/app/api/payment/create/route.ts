import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAYAR_API_URL = process.env.MAYAR_API_URL || 'https://api.mayar.id/hl/v1'
const MAYAR_API_KEY = process.env.MAYAR_API_KEY

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { packageId, amount, tokens } = await request.json()

        if (!packageId || !amount || !tokens) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        // Create transaction record
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount,
                tokens,
                status: 'pending',
            })
            .select()
            .single()

        if (txError || !transaction) {
            return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 500 })
        }

        // If Mayar API key is configured, create payment
        if (MAYAR_API_KEY) {
            try {
                const mayarResponse = await fetch(`${MAYAR_API_URL}/payment/create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MAYAR_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: profile.full_name || 'BlackEagle User',
                        email: profile.email,
                        amount: amount,
                        description: `BlackEagle OSINT - ${tokens} Tokens`,
                        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
                        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/topup?status=success`,
                        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/topup?status=failed`,
                        metadata: {
                            transaction_id: transaction.id,
                            user_id: user.id,
                            tokens: tokens.toString(),
                        },
                    }),
                })

                const mayarData = await mayarResponse.json()

                if (mayarData.data?.link) {
                    // Update transaction with Mayar ID
                    await supabase
                        .from('transactions')
                        .update({ mayar_transaction_id: mayarData.data.id })
                        .eq('id', transaction.id)

                    return NextResponse.json({
                        success: true,
                        paymentUrl: mayarData.data.link,
                        transactionId: transaction.id,
                    })
                }
            } catch (mayarError) {
                console.error('Mayar API error:', mayarError)
            }
        }

        // Fallback: Return a mock payment URL for development
        return NextResponse.json({
            success: true,
            paymentUrl: `/topup?mock=true&txId=${transaction.id}&tokens=${tokens}`,
            transactionId: transaction.id,
            message: 'Development mode - Mayar API not configured',
        })

    } catch (error) {
        console.error('Payment create error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
