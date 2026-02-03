'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Mail,
    Phone,
    Search,
    AlertCircle,
    CheckCircle2,
    XCircle,
    User,
    Shield,
    Globe,
    Loader2,
    Database,
    Smartphone,
    ExternalLink,
    MapPin,
    Clock,
    Radio,
    MessageCircle,
    Send,
    Hash,
    AtSign,
    Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import type { EmailOsintResult, PhoneOsintResult, SocialProfile } from '@/types'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'

// Platform icon mapping
const platformIcons: Record<string, string> = {
    github: '🐙',
    twitter: '🐦',
    instagram: '📸',
    linkedin: '💼',
    facebook: '👤',
    discord: '🎮',
    reddit: '📱',
    tiktok: '🎵',
    medium: '📝',
    dev: '👨‍💻',
    twitch: '🎬',
    spotify: '🎧',
    youtube: '▶️',
    steam: '🎮',
    telegram: '✈️',
    pinterest: '📌',
    adobe: '🎨',
    gravatar: '👤',
    wordpress: '📝',
    vimeo: '📽️',
    soundcloud: '☁️',
    aboutme: '👋',
    mixcloud: '☁️',
    pastebin: '📋',
    slideshare: '📊',
    tripadvisor: '🗺️',
    tumblr: '📓',
    wattpad: '📖',
    wikipedia: '📚',
    xing: '💼',
    yahoo: '✉️',
}

function ToolsContent() {
    const searchParams = useSearchParams()
    const { profile, refreshProfile } = useAuth()
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'email')
    const [showInsufficientModal, setShowInsufficientModal] = useState(false)

    // Email OSINT State
    const [email, setEmail] = useState('')
    const [emailLoading, setEmailLoading] = useState(false)
    const [emailResult, setEmailResult] = useState<EmailOsintResult | null>(null)
    const [deepScan, setDeepScan] = useState(false)  // Quick vs Deep scan toggle

    // Phone OSINT State
    const [phone, setPhone] = useState('')
    const [phoneLoading, setPhoneLoading] = useState(false)
    const [phoneResult, setPhoneResult] = useState<PhoneOsintResult | null>(null)

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && (tab === 'email' || tab === 'phone')) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleEmailScan = async () => {
        if (!email) {
            toast.error('Please enter an email address')
            return
        }

        if (!profile || profile.token_balance < 1) {
            setShowInsufficientModal(true)
            return
        }

        setEmailLoading(true)
        setEmailResult(null)

        try {
            const response = await fetch('http://localhost:8000/api/v1/osint/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, deep_scan: deepScan }),
            })

            const data = await response.json()
            console.log('[Frontend] OSINT Result:', data)

            if (data.success) {
                setEmailResult(data.data)
                toast.success('Scan completed')
                // Stop loading immediately so results show up
                setEmailLoading(false)

                // Refresh profile in background
                refreshProfile().catch(e => console.error("Profile refresh failed:", e))
            } else {
                setEmailLoading(false)
                toast.error(data.error || 'Scan failed')
            }
        } catch (error) {
            console.error('[Frontend] Scan Error:', error)
            setEmailLoading(false)
            toast.error('Backend connection failed')
        }
    }

    const handlePhoneScan = async () => {
        if (!phone) {
            toast.error('Please enter a phone number')
            return
        }

        if (!profile || profile.token_balance < 1) {
            setShowInsufficientModal(true)
            return
        }

        setPhoneLoading(true)
        setPhoneResult(null)

        try {
            const response = await fetch('http://localhost:8000/api/v1/osint/phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            })

            const data = await response.json()

            if (data.success) {
                setPhoneResult(data.data)
                refreshProfile().catch(e => console.error("Profile refresh failed:", e))
                toast.success('Scan completed')
            } else {
                toast.error(data.error || 'Scan failed')
            }
        } catch (error) {
            toast.error('Backend connection failed')
        } finally {
            setPhoneLoading(false)
        }
    }

    const renderSocialProfiles = (profiles: SocialProfile[]) => {
        const foundProfiles = profiles.filter(p => p.exists)
        const notFoundProfiles = profiles.filter(p => !p.exists)

        return (
            <Card className="bg-background border-border">
                <CardHeader>
                    <CardTitle className="text-base font-mono flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        DIGITAL FOOTPRINT
                        {foundProfiles.length > 0 && (
                            <Badge variant="outline" className="ml-2 bg-green-950/20 border-green-900/50 text-green-400">
                                {foundProfiles.length} FOUND
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>Social media and online presence detected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Found Profiles */}
                    {foundProfiles.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Confirmed Accounts</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {foundProfiles.map((profile, index) => (
                                    <a
                                        key={index}
                                        href={profile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 border border-green-900/30 bg-green-950/10 rounded hover:bg-green-950/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{platformIcons[profile.icon] || '🌐'}</span>
                                            <div>
                                                <div className="font-semibold text-sm">{profile.platform}</div>
                                                {profile.username && (
                                                    <div className="text-xs text-muted-foreground">@{profile.username}</div>
                                                )}
                                            </div>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-400 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Not Found Profiles */}
                    {notFoundProfiles.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Checked Platforms</div>
                            <div className="flex flex-wrap gap-2">
                                {notFoundProfiles.map((profile, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="border-border text-muted-foreground bg-secondary/20 text-xs"
                                    >
                                        {platformIcons[profile.icon] || '🌐'} {profile.platform}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {profiles.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            No social profiles checked
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="container px-4 md:px-6 py-8 will-change-transform"
        >
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2">OSINT Tools</h1>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            Advanced intelligence gathering with real-time data from multiple sources.
                            Results include breach detection, social media discovery, and more.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-secondary border border-border p-1">
                        <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Mail className="h-4 w-4" />
                            Email Intelligence
                        </TabsTrigger>
                        <TabsTrigger value="phone" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Smartphone className="h-4 w-4" />
                            Phone Intelligence
                        </TabsTrigger>
                    </TabsList>

                    {/* Email OSINT Tab */}
                    <TabsContent value="email" className="space-y-6">
                        <Card className="bg-background border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Database className="h-5 w-5 text-muted-foreground" />
                                    Target Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="target@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailScan()}
                                        className="font-mono bg-secondary/20 border-border focus:border-primary/50"
                                    />
                                    <Button
                                        onClick={handleEmailScan}
                                        disabled={emailLoading}
                                        className="min-w-[120px] bg-white text-black hover:bg-white/90"
                                    >
                                        {emailLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Execute
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Cost: 1 Token / Query
                                </div>
                            </CardContent>
                        </Card>

                        {emailResult && !emailLoading && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Digital Footprint Header Card */}
                                <Card className="bg-card border-border overflow-hidden relative">
                                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                                        {/* Export Buttons */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                const json = JSON.stringify(emailResult, null, 2)
                                                const blob = new Blob([json], { type: 'application/json' })
                                                const url = URL.createObjectURL(blob)
                                                const a = document.createElement('a')
                                                a.href = url
                                                a.download = `osint_${emailResult.email.replace('@', '_at_')}.json`
                                                a.click()
                                                URL.revokeObjectURL(url)
                                                toast.success('JSON exported')
                                            }}
                                        >
                                            📥 JSON
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                                // Build CSV from social profiles
                                                const profiles = emailResult.social_profiles?.filter(p => p.exists) || []
                                                const csvRows = [
                                                    ['Platform', 'URL', 'Username', 'Category'],
                                                    ...profiles.map(p => [p.platform, p.url, p.username || '', p.category || ''])
                                                ]
                                                const csv = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
                                                const blob = new Blob([csv], { type: 'text/csv' })
                                                const url = URL.createObjectURL(blob)
                                                const a = document.createElement('a')
                                                a.href = url
                                                a.download = `osint_${emailResult.email.replace('@', '_at_')}.csv`
                                                a.click()
                                                URL.revokeObjectURL(url)
                                                toast.success('CSV exported')
                                            }}
                                        >
                                            📥 CSV
                                        </Button>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase tracking-wider text-[10px] py-1">
                                            Check Completed
                                        </Badge>
                                    </div>
                                    <CardContent className="pt-10 pb-10 px-6 md:px-10 relative z-10">
                                        <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
                                            Digital Footprint
                                        </div>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 text-3xl shadow-xl">
                                                {emailResult.email.includes('gmail') ? 'Ⓜ️' : '📧'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground break-all">
                                                    {emailResult.email}
                                                </h1>
                                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                    <div className={`h-2 w-2 rounded-full ${emailResult.valid ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    {emailResult.valid ? 'Valid Email Address' : 'Invalid Email Address'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground uppercase text-[10px] tracking-wide py-1.5 px-3 rounded-md font-mono border border-white/5">
                                                {emailResult.format_valid ? 'SYNTAX VALID' : 'SYNTAX INVALID'}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground uppercase text-[10px] tracking-wide py-1.5 px-3 rounded-md font-mono border border-white/5">
                                                {emailResult.mx_valid ? 'DNS VERIFIED' : 'DNS FAILED'}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground uppercase text-[10px] tracking-wide py-1.5 px-3 rounded-md font-mono border border-white/5">
                                                {emailResult.mx_valid ? 'MAIL SERVER OK' : 'NO MAIL SERVER'}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground uppercase text-[10px] tracking-wide py-1.5 px-3 rounded-md font-mono border border-white/5">
                                                {!emailResult.disposable ? 'NOT DISPOSABLE' : 'DISPOSABLE EMAIL'}
                                            </Badge>
                                        </div>
                                    </CardContent>

                                    {/* Background Decor */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />
                                </Card>

                                {/* Found Registrations List */}
                                <div className="space-y-4">
                                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest px-1 flex justify-between items-center">
                                        <span>Found Registrations ({emailResult.social_count || 0})</span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {/* Found Items */}
                                        {emailResult.social_profiles?.filter(p => p.exists).map((profile, i) => (
                                            <motion.div
                                                key={`profile-${i}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <a
                                                    href={profile.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center justify-between p-4 bg-card hover:bg-zinc-900/50 border border-border rounded-xl transition-all duration-300 relative overflow-hidden"
                                                >
                                                    <div className="flex items-center gap-5 z-10">
                                                        {/* Icon Box */}
                                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-2xl border border-white/5 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                            {platformIcons[profile.icon] || platformIcons[profile.platform.toLowerCase()] || '🌐'}
                                                        </div>
                                                        {/* Name */}
                                                        <div>
                                                            <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {profile.platform}
                                                            </div>
                                                            {profile.username && (
                                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                                    @{profile.username}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status Badge - Matched to Image */}
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 z-10">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                        <span className="text-[10px] font-bold text-green-500 tracking-wider uppercase">Registered</span>
                                                    </div>

                                                    {/* Highlight */}
                                                    <div className="absolute inset-y-0 left-0 w-1 bg-green-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </a>
                                            </motion.div>
                                        ))}

                                        {/* Fallback if none found */}
                                        {(!emailResult.social_profiles || emailResult.social_profiles.filter(p => p.exists).length === 0) && (
                                            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/5">
                                                <div className="text-4xl mb-3">👻</div>
                                                <div className="text-lg font-medium text-foreground">No accounts found</div>
                                                <div className="text-sm text-muted-foreground">This email doesn't seem to be registered on major platforms.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Breaches Section (if any) */}
                                {emailResult.breached && (
                                    <div className="space-y-4">
                                        <div className="text-xs font-mono text-red-400 uppercase tracking-widest px-1">
                                            Data Leaks ({emailResult.breaches?.length || 0})
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {emailResult.breaches?.map((breach, i) => (
                                                <Card key={i} className="bg-red-950/10 border-red-900/30">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="font-bold text-red-400">{breach.name}</div>
                                                                <div className="text-xs text-red-400/60 mt-1">{breach.date}</div>
                                                            </div>
                                                            <Shield className="h-4 w-4 text-red-500/50" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-3">
                                                            {breach.data_types.map((type, j) => (
                                                                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/20 text-red-400/80 border border-red-900/30">
                                                                    {type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Phone OSINT Tab */}
                    <TabsContent value="phone" className="space-y-6">
                        <Card className="bg-background border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Database className="h-5 w-5 text-muted-foreground" />
                                    Target Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="+62 812 3456 7890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePhoneScan()}
                                        className="font-mono bg-secondary/20 border-border focus:border-primary/50"
                                    />
                                    <Button
                                        onClick={handlePhoneScan}
                                        disabled={phoneLoading}
                                        className="min-w-[120px] bg-white text-black hover:bg-white/90"
                                    >
                                        {phoneLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                Execute
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Cost: 1 Token / Query
                                </div>
                            </CardContent>
                        </Card>

                        {/* Phone Results - Comprehensive Display */}
                        {phoneResult && !phoneLoading && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Summary Stats */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    {/* Validity */}
                                    <Card className="bg-background border-border">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-muted-foreground">Number Status</span>
                                                {phoneResult.valid ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                            </div>
                                            <div className="text-2xl font-bold font-mono">
                                                {phoneResult.valid ? 'VALID' : 'INVALID'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                                                {phoneResult.formatted}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Country */}
                                    <Card className="bg-background border-border">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-muted-foreground">Origin</span>
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-xl font-bold font-mono truncate">
                                                {phoneResult.country_name || 'UNKNOWN'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {phoneResult.country_code} • {phoneResult.region}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Carrier */}
                                    <Card className="bg-background border-border">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-muted-foreground">Carrier</span>
                                                <Radio className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-xl font-bold font-mono truncate">
                                                {phoneResult.carrier || 'UNKNOWN'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 capitalize">
                                                Line type: {phoneResult.line_type}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Timezone */}
                                    <Card className="bg-background border-border">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm text-muted-foreground">Timezone</span>
                                                <Clock className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-lg font-bold font-mono truncate">
                                                {phoneResult.timezone || 'UNKNOWN'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Local time zone
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Caller ID / Profile Info (New Section) */}
                                {(phoneResult.name || phoneResult.profile_image || phoneResult.whatsapp || phoneResult.telegram) && (
                                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                                        <Card className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border-indigo-500/20 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-grid-white/5 mask-image-linear-to-b" />
                                            <CardHeader className="relative z-10 pb-0">
                                                <CardTitle className="text-base font-mono flex items-center gap-2 text-indigo-400">
                                                    <User className="h-4 w-4" />
                                                    DETECTED PROFILE
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="relative z-10 pt-6 flex items-center gap-6">
                                                {phoneResult.profile_image ? (
                                                    <div className="h-20 w-20 rounded-full border-2 border-indigo-500/30 overflow-hidden shadow-xl shadow-indigo-500/10">
                                                        <img
                                                            src={phoneResult.profile_image}
                                                            alt="Profile"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full border-2 border-indigo-500/30 bg-indigo-950/50 flex items-center justify-center text-3xl">
                                                        👤
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="text-sm text-indigo-300/60 font-mono mb-1 uppercase tracking-wider">
                                                        Owner Name / ID
                                                    </div>
                                                    <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                                                        {phoneResult.name || "Private / Hidden"}
                                                    </div>
                                                    {!phoneResult.name && (
                                                        <div className="text-xs text-indigo-400/50 italic mb-2">
                                                            Name is hidden by privacy settings
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] uppercase">
                                                            {phoneResult.name ? 'High Confidence' : 'Profile Detected'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            Sourced from public social profiles
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Number Details */}
                                <Card className="bg-background border-border">
                                    <CardHeader>
                                        <CardTitle className="text-base font-mono flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            NUMBER DETAILS
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-3 bg-secondary/20 rounded border border-border">
                                                <div className="text-xs text-muted-foreground mb-1">International Format</div>
                                                <div className="font-mono font-semibold">{phoneResult.international_format}</div>
                                            </div>
                                            <div className="p-3 bg-secondary/20 rounded border border-border">
                                                <div className="text-xs text-muted-foreground mb-1">National Number</div>
                                                <div className="font-mono font-semibold">{phoneResult.national_number}</div>
                                            </div>
                                            <div className="p-3 bg-secondary/20 rounded border border-border">
                                                <div className="text-xs text-muted-foreground mb-1">Country Code</div>
                                                <div className="font-mono font-semibold">{phoneResult.country_code}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Messaging Apps */}
                                <Card className="bg-background border-border">
                                    <CardHeader>
                                        <CardTitle className="text-base font-mono flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            MESSAGING APPS
                                        </CardTitle>
                                        <CardDescription>Detected presence on messaging platforms</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className={`p-4 border rounded flex flex-col items-center justify-center gap-2 ${phoneResult.whatsapp ? 'border-green-900/30 bg-green-900/10' : 'border-border bg-secondary/20'}`}>
                                                <div className="text-2xl">💬</div>
                                                <span className="font-semibold text-sm">WhatsApp</span>
                                                {phoneResult.whatsapp ? (
                                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">DETECTED</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">NOT FOUND</Badge>
                                                )}
                                            </div>
                                            <div className={`p-4 border rounded flex flex-col items-center justify-center gap-2 ${phoneResult.telegram ? 'border-blue-900/30 bg-blue-900/10' : 'border-border bg-secondary/20'}`}>
                                                <div className="text-2xl">✈️</div>
                                                <span className="font-semibold text-sm">Telegram</span>
                                                {phoneResult.telegram ? (
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">DETECTED</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">NOT FOUND</Badge>
                                                )}
                                            </div>
                                            <div className={`p-4 border rounded flex flex-col items-center justify-center gap-2 ${phoneResult.signal ? 'border-indigo-900/30 bg-indigo-900/10' : 'border-border bg-secondary/20'}`}>
                                                <div className="text-2xl">🔐</div>
                                                <span className="font-semibold text-sm">Signal</span>
                                                {phoneResult.signal ? (
                                                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">DETECTED</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">NOT FOUND</Badge>
                                                )}
                                            </div>
                                            <div className={`p-4 border rounded flex flex-col items-center justify-center gap-2 ${phoneResult.viber ? 'border-purple-900/30 bg-purple-900/10' : 'border-border bg-secondary/20'}`}>
                                                <div className="text-2xl">📞</div>
                                                <span className="font-semibold text-sm">Viber</span>
                                                {phoneResult.viber ? (
                                                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">DETECTED</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">NOT FOUND</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Insufficient Tokens Modal */}
            <Dialog open={showInsufficientModal} onOpenChange={setShowInsufficientModal}>
                <DialogContent className="border-border bg-background">
                    <DialogHeader>
                        <DialogTitle>Quota Exceeded</DialogTitle>
                        <DialogDescription>
                            Insufficient tokens to execute this query.
                            Please recharge your account to proceed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setShowInsufficientModal(false)}>
                            Abort
                        </Button>
                        <Button
                            onClick={() => {
                                setShowInsufficientModal(false)
                                window.location.href = '/topup'
                            }}
                            className="bg-white text-black hover:bg-white/90"
                        >
                            Recharge Balance
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div >
    )
}

export default function ToolsPage() {
    return (
        <Suspense fallback={
            <div className="container px-4 md:px-6 py-8 space-y-6">
                <Skeleton className="h-8 w-48 bg-secondary" />
                <Skeleton className="h-64 bg-secondary" />
            </div>
        }>
            <ToolsContent />
        </Suspense>
    )
}
