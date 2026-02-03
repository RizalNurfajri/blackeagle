'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Coins,
    Mail,
    Phone,
    ArrowRight,
    TrendingUp,
    Clock,
    Terminal,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatNumber } from '@/lib/utils'
import { fadeInUp } from '@/lib/animations'

export default function DashboardPage() {
    const { profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="container px-4 md:px-6 py-8 space-y-8">
                <Skeleton className="h-10 w-64 bg-secondary" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 bg-secondary" />
                    <Skeleton className="h-40 bg-secondary" />
                    <Skeleton className="h-40 bg-secondary" />
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="container px-4 md:px-6 py-8 space-y-8 will-change-transform"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}. System ready for investigation.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        STATUS: ONLINE
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Token Balance */}
                <Card className="bg-background border-border hover:bg-secondary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Available Tokens
                        </CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">{formatNumber(profile?.token_balance ?? 0)}</div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">Ready for use</p>
                            <Link href="/topup">
                                <Button size="sm" variant="outline" className="h-7 text-xs border-border bg-secondary hover:bg-secondary/80">
                                    Add Tokens
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Scans */}
                <Card className="bg-background border-border hover:bg-secondary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Investigations
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">0</div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">All time activity</p>
                            <Link href="/history">
                                <Button size="sm" variant="outline" className="h-7 text-xs border-border bg-secondary hover:bg-secondary/80">
                                    View Logs
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Last Scan */}
                <Card className="bg-background border-border hover:bg-secondary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Last Activity
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-medium font-mono text-muted-foreground">--</div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-muted-foreground">No recent scans</p>
                            <Link href="/tools">
                                <Button size="sm" variant="outline" className="h-7 text-xs border-border bg-secondary hover:bg-secondary/80">
                                    New Scan
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Available Modules
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link href="/tools?tab=email">
                        <div className="group border border-border bg-background p-6 hover:bg-secondary/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-secondary rounded border border-border group-hover:border-primary/20 transition-colors">
                                    <Mail className="h-6 w-6 text-foreground" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Email Intelligence</h3>
                            <p className="text-sm text-muted-foreground">
                                Deep analysis of email addresses for validation, breaches, and digital footprint.
                            </p>
                        </div>
                    </Link>

                    <Link href="/tools?tab=phone">
                        <div className="group border border-border bg-background p-6 hover:bg-secondary/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-secondary rounded border border-border group-hover:border-primary/20 transition-colors">
                                    <Phone className="h-6 w-6 text-foreground" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Phone Intelligence</h3>
                            <p className="text-sm text-muted-foreground">
                                Carrier lookup, location targeting, and social media existence verification.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Ethical Notice */}
            <div className="border border-border bg-secondary/10 p-4 flex items-start gap-4">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Compliance Notice</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This tool is provided for educational and legitimate security testing purposes only.
                        Unauthorized surveillance or data harvesting is strictly prohibited.
                        By using this platform, you agree to adhere to all applicable privacy laws and regulations.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
