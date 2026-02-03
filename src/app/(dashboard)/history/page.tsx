'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import {
    Clock,
    Mail,
    Phone,
    Search
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { fadeInUp } from '@/lib/animations'

export default function HistoryPage() {
    const { profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="container px-4 md:px-6 py-8">
                <div className="space-y-6">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-64 bg-white/5" />
                </div>
            </div>
        )
    }

    // For now, show empty state - history will be populated from DB
    const historyItems: any[] = []

    return (
        <div className="container px-4 md:px-6 py-8">
            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Scan History</h1>
                    <p className="text-muted-foreground mt-1">
                        View your recent OSINT investigations.
                    </p>
                </div>

                {/* History List */}
                {historyItems.length === 0 ? (
                    <Card className="border-white/10 bg-white/[0.02]">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 border border-white/5 mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground">No scans yet</h3>
                            <p className="text-muted-foreground text-center max-w-sm">
                                Your scan history will appear here once you start investigating emails or phone numbers.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {historyItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/5">
                                            {item.module === 'email' ? (
                                                <Mail className="h-5 w-5 text-white/80" />
                                            ) : (
                                                <Phone className="h-5 w-5 text-white/80" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-foreground">{item.query}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize border-white/10 text-muted-foreground">
                                            {item.module}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
