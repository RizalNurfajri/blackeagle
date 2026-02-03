import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PhoneOsintResult } from '@/types'

// Country codes mapping
const countryCodes: Record<string, { name: string; code: string }> = {
    '1': { name: 'United States', code: 'US' },
    '44': { name: 'United Kingdom', code: 'GB' },
    '62': { name: 'Indonesia', code: 'ID' },
    '60': { name: 'Malaysia', code: 'MY' },
    '65': { name: 'Singapore', code: 'SG' },
    '61': { name: 'Australia', code: 'AU' },
    '81': { name: 'Japan', code: 'JP' },
    '82': { name: 'South Korea', code: 'KR' },
    '86': { name: 'China', code: 'CN' },
    '91': { name: 'India', code: 'IN' },
    '49': { name: 'Germany', code: 'DE' },
    '33': { name: 'France', code: 'FR' },
    '39': { name: 'Italy', code: 'IT' },
    '34': { name: 'Spain', code: 'ES' },
    '55': { name: 'Brazil', code: 'BR' },
    '52': { name: 'Mexico', code: 'MX' },
    '7': { name: 'Russia', code: 'RU' },
    '971': { name: 'United Arab Emirates', code: 'AE' },
    '966': { name: 'Saudi Arabia', code: 'SA' },
    '63': { name: 'Philippines', code: 'PH' },
    '66': { name: 'Thailand', code: 'TH' },
    '84': { name: 'Vietnam', code: 'VN' },
}

// Indonesian carriers
const indonesianCarriers: Record<string, string> = {
    '811': 'Telkomsel (Halo)',
    '812': 'Telkomsel (Simpati)',
    '813': 'Telkomsel (Simpati)',
    '821': 'Telkomsel (Simpati)',
    '822': 'Telkomsel (Loop)',
    '823': 'Telkomsel',
    '851': 'Telkomsel (AS)',
    '852': 'Telkomsel (AS)',
    '853': 'Telkomsel (AS)',
    '814': 'Indosat (IM3)',
    '815': 'Indosat (Matrix)',
    '816': 'Indosat (Mentari)',
    '855': 'Indosat (Matrix)',
    '856': 'Indosat (IM3)',
    '857': 'Indosat (IM3)',
    '858': 'Indosat (Mentari)',
    '817': 'XL Axiata',
    '818': 'XL Axiata',
    '819': 'XL Axiata',
    '859': 'XL Axiata',
    '877': 'XL Axiata',
    '878': 'XL Axiata',
    '831': 'Axis',
    '832': 'Axis',
    '833': 'Axis',
    '838': 'Axis',
    '881': 'Smartfren',
    '882': 'Smartfren',
    '883': 'Smartfren',
    '884': 'Smartfren',
    '885': 'Smartfren',
    '886': 'Smartfren',
    '887': 'Smartfren',
    '888': 'Smartfren',
    '889': 'Smartfren',
    '895': 'Three (3)',
    '896': 'Three (3)',
    '897': 'Three (3)',
    '898': 'Three (3)',
    '899': 'Three (3)',
}

function parsePhoneNumber(phone: string): { countryCode: string; nationalNumber: string } | null {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')

    // Handle different formats
    let normalized = cleaned
    if (normalized.startsWith('+')) {
        normalized = normalized.substring(1)
    } else if (normalized.startsWith('00')) {
        normalized = normalized.substring(2)
    } else if (normalized.startsWith('0')) {
        // Assume Indonesian number
        normalized = '62' + normalized.substring(1)
    }

    // Try to match country code
    for (const code of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
        if (normalized.startsWith(code)) {
            return {
                countryCode: code,
                nationalNumber: normalized.substring(code.length),
            }
        }
    }

    return null
}

function getCarrier(countryCode: string, nationalNumber: string): string {
    if (countryCode === '62') {
        const prefix = nationalNumber.substring(0, 3)
        return indonesianCarriers[prefix] || 'Unknown Carrier'
    }
    return 'Unknown Carrier'
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { phone } = await request.json()

        if (!phone) {
            return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 })
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
            module: 'phone',
            query: phone,
            tokens_used: 1,
        })

        // Parse phone number
        const parsed = parsePhoneNumber(phone)

        if (!parsed) {
            const result: PhoneOsintResult = {
                phone,
                valid: false,
                country_code: '',
                country_name: 'Unknown',
                carrier: 'Unknown',
                line_type: 'unknown',
                whatsapp: false,
                telegram: false,
            }
            return NextResponse.json({ success: true, data: result })
        }

        const countryInfo = countryCodes[parsed.countryCode] || { name: 'Unknown', code: 'XX' }
        const carrier = getCarrier(parsed.countryCode, parsed.nationalNumber)

        // Mock social media checks (in production, use actual APIs)
        // For demo, we'll simulate based on number patterns
        const lastDigit = parseInt(parsed.nationalNumber.slice(-1))
        const whatsapp = lastDigit % 2 === 0 // Even numbers have WhatsApp
        const telegram = lastDigit % 3 === 0 // Multiples of 3 have Telegram

        const result: PhoneOsintResult = {
            phone,
            valid: parsed.nationalNumber.length >= 9 && parsed.nationalNumber.length <= 12,
            country_code: parsed.countryCode,
            country_name: countryInfo.name,
            carrier,
            line_type: 'mobile',
            whatsapp,
            telegram,
        }

        return NextResponse.json({ success: true, data: result })

    } catch (error) {
        console.error('Phone OSINT error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
