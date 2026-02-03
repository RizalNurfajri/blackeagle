// User & Auth Types
export interface User {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    token_balance: number
    created_at: string
    updated_at: string
}

// Transaction Types
export interface Transaction {
    id: string
    user_id: string
    amount: number
    tokens: number
    status: 'pending' | 'completed' | 'failed'
    mayar_transaction_id: string | null
    created_at: string
}

// Token Package Types
export interface TokenPackage {
    id: string
    price: number
    tokens: number
    popular?: boolean
}

// OSINT Types
export interface OsintLog {
    id: string
    user_id: string
    module: 'email' | 'phone'
    query: string
    tokens_used: number
    created_at: string
}

// Breach Information
export interface BreachInfo {
    name: string
    domain: string
    date: string
    data_types: string[]
}

// Social Media Profile
export interface SocialProfile {
    platform: string
    url: string
    username?: string | null
    exists: boolean
    category: string
    icon: string
}

// Gravatar Profile
export interface GravatarProfile {
    url: string
    hash: string
    display_name?: string | null
    profile_url?: string | null
}

// Email OSINT Result - Extended with full intelligence
export interface EmailOsintResult {
    email: string
    valid: boolean
    format_valid: boolean
    mx_valid: boolean
    disposable: boolean
    free_provider: boolean
    deliverable: boolean

    // Breach data
    breached: boolean
    breach_count: number
    breaches: BreachInfo[]

    // Gravatar
    gravatar?: GravatarProfile | null
    gravatar_url?: string | null

    // Social profiles
    social_profiles: SocialProfile[]
    social_count: number
}

// Phone OSINT Result - Extended with full intelligence
export interface PhoneOsintResult {
    phone: string
    formatted: string
    valid: boolean
    possible: boolean

    // Caller ID
    name?: string
    profile_image?: string

    // Location info
    country_code: string
    country_name: string
    region: string
    timezone: string

    // Carrier info
    carrier: string
    line_type: 'mobile' | 'landline' | 'voip' | 'unknown' | string

    // Messaging apps
    whatsapp: boolean
    telegram: boolean
    signal: boolean
    viber: boolean

    // Raw data
    national_number: string
    international_format: string
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

// Mayar Types
export interface MayarCreateChargeRequest {
    name: string
    email: string
    amount: number
    description: string
    mobile?: string
}

export interface MayarCreateChargeResponse {
    id: string
    link: string
    status: string
}

export interface MayarWebhookPayload {
    event: string
    data: {
        id: string
        status: string
        amount: number
        metadata?: Record<string, string>
    }
}
