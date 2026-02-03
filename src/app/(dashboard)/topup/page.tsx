'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard,
    Check,
    ArrowRight,
    Loader2,
    Sparkles,
    Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { TokenPackage } from '@/types'
import { fadeInUp } from '@/lib/animations'

const tokenPackages: TokenPackage[] = [
    { id: 'pkg-2', price: 5000, tokens: 2 },
    { id: 'pkg-4', price: 10000, tokens: 4, popular: true },
    { id: 'pkg-8', price: 20000, tokens: 8 },
    { id: 'pkg-25', price: 50000, tokens: 25 },
]

export default function TopupPage() {
    const { profile } = useAuth()
    const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSelectPackage = (pkg: TokenPackage) => {
        setSelectedPackage(pkg)
        setShowConfirmModal(true)
    }

    const handleCheckout = async () => {
        if (!selectedPackage || !profile) return

        setLoading(true)

        try {
            const response = await fetch('http://localhost:8000/api/v1/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedPackage.id,
                    amount: selectedPackage.price,
                    tokens: selectedPackage.tokens,
                    customerName: profile.full_name || 'BlackEagle User',
                    customerEmail: profile.email || 'user@blackeagle.id'
                }),
            })

            const data = await response.json()

            if (data.success && data.paymentUrl) {
                window.location.href = data.paymentUrl
            } else {
                toast.error(data.error || 'Failed to create payment')
                setLoading(false)
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="container px-4 md:px-6 py-8">
            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="space-y-8"
            >
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold">Top Up Tokens</h1>
                    <p className="text-muted-foreground mt-2">
                        Choose a token package to continue your OSINT investigations.
                    </p>
                </div>

                {/* Current Balance */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-md mx-auto"
                >
                    <Card className="border-white/10 bg-white/[0.02]">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-3xl font-bold text-foreground">{profile?.token_balance ?? 0} Tokens</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/5">
                                <Coins className="h-7 w-7 text-white/80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Packages Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {tokenPackages.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Card
                                className={`relative h-full cursor-pointer transition-all hover:border-white/20 ${pkg.popular
                                    ? 'border-white/20 bg-white/[0.04]'
                                    : 'border-white/10 bg-white/[0.02]'
                                    }`}
                                onClick={() => handleSelectPackage(pkg)}
                            >
                                {pkg.popular && (
                                    <div className="absolute top-0 left-0 right-0 bg-white text-black text-xs font-medium text-center py-1.5 z-10">
                                        Most Popular
                                    </div>
                                )}
                                <CardHeader className={`text-center ${pkg.popular ? 'pt-10' : ''}`}>
                                    <CardTitle className="text-5xl font-bold text-foreground">{pkg.tokens}</CardTitle>
                                    <CardDescription className="text-lg">Tokens</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center space-y-4">
                                    <div>
                                        <p className="text-2xl font-semibold text-foreground">{formatCurrency(pkg.price)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(Math.round(pkg.price / pkg.tokens))} / token
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2 justify-center">
                                            <Check className="h-4 w-4 text-white/60" />
                                            {pkg.tokens} OSINT scans
                                        </div>
                                        <div className="flex items-center gap-2 justify-center">
                                            <Check className="h-4 w-4 text-white/60" />
                                            No expiry date
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full gap-2 ${pkg.popular
                                            ? 'bg-white text-black hover:bg-white/90'
                                            : 'bg-transparent border border-white/10 text-foreground hover:bg-white/5'}`}
                                    >
                                        Select
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Info Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <p className="text-sm text-muted-foreground">
                        Payments are securely processed by Mayar. Tokens are added to your account immediately after payment confirmation.
                    </p>
                </motion.div>
            </motion.div>

            {/* Confirm Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="border-white/10 bg-[#0a0a0b]">
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            You are about to purchase {selectedPackage?.tokens} tokens for {selectedPackage ? formatCurrency(selectedPackage.price) : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Package</span>
                            <span className="font-semibold text-foreground">{selectedPackage?.tokens} Tokens</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-semibold text-foreground">{selectedPackage ? formatCurrency(selectedPackage.price) : ''}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            disabled={loading}
                            className="border-white/10 bg-transparent hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="bg-white text-black hover:bg-white/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                'Proceed to Payment'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
