import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOsintResult } from '@/types'
import crypto from 'crypto'

// Generate Gravatar URL
function getGravatarUrl(email: string): string {
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
    return `https://www.gravatar.com/avatar/${hash}?d=404`
}

// Check if gravatar exists
async function checkGravatar(email: string): Promise<string | null> {
    try {
        const url = getGravatarUrl(email)
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok ? `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')}` : null
    } catch {
        return null
    }
}

// Simple email validation
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Check for disposable email domains
const disposableDomains = [
    'tempmail.com', 'throwaway.com', 'guerrillamail.com', 'mailinator.com',
    '10minutemail.com', 'yopmail.com', 'trashmail.com', 'fakeinbox.com',
    'tempail.com', 'dispostable.com', 'getnada.com', 'temp-mail.org'
]

function isDisposable(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase()
    return disposableDomains.some(d => domain?.includes(d))
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
        }

        // Check token balance
        const { data: profile } = await supabase
            .from('profiles')
            .select('token_balance')
            .eq('id', user.id)
            .single()

        if (!profile || profile.token_balance < 1) {
            return NextResponse.json({ success: false, error: 'Insufficient tokens' }, { status: 402 })
        }

        // Deduct token
        await supabase
            .from('profiles')
            .update({ token_balance: profile.token_balance - 1 })
            .eq('id', user.id)

        // Log the scan
        await supabase.from('osint_logs').insert({
            user_id: user.id,
            module: 'email',
            query: email,
            tokens_used: 1,
        })

        // Perform OSINT checks
        const valid = isValidEmail(email)
        const disposable = isDisposable(email)
        const gravatarUrl = await checkGravatar(email)

        // Mock breach data (in production, integrate with BreachDirectory API)
        // For demo purposes, we'll simulate some breach data
        const breached = email.includes('test') || email.includes('demo')
        const breaches = breached ? ['LinkedIn 2021', 'Adobe 2013', 'Dropbox 2012'] : []

        const result: EmailOsintResult = {
            email,
            valid,
            disposable,
            breached,
            breach_count: breaches.length,
            breaches,
            gravatar_url: gravatarUrl,
            deliverable: valid && !disposable,
        }

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error('Email OSINT error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
