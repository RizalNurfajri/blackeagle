'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    LayoutDashboard,
    Radar,
    CreditCard,
    History,
    LogOut,
    Menu,
    X,
    Coins,
    ChevronDown,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatNumber } from '@/lib/utils'
import { slideDown, springTransition } from '@/lib/animations'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tools', label: 'OSINT Tools', icon: Radar },
    { href: '/topup', label: 'Top Up', icon: CreditCard },
    { href: '/history', label: 'History', icon: History },
]

export function DashboardHeader() {
    const { user, profile, signOut, loading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <motion.header
            initial="initial"
            animate="animate"
            variants={slideDown}
            className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-background/80 backdrop-blur-xl"
        >
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={springTransition}
                        className="relative flex h-9 w-9 items-center justify-center"
                    >
                        <img
                            src="/logo.png"
                            alt="BlackEagle Logo"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    <span className="text-lg font-semibold tracking-tight hidden sm:block">BlackEagle</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`gap-2 transition-all ${isActive
                                            ? 'bg-white/10 text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Token Balance */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                        <Coins className="h-4 w-4 text-white/80" />
                        <span className="text-sm font-medium">
                            {formatNumber(profile?.token_balance ?? 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">tokens</span>
                    </motion.div>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                                    <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    {profile?.full_name && <p className="font-medium">{profile.full_name}</p>}
                                    {profile?.email && (
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {profile.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/topup')}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Billing</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 bg-card/95 backdrop-blur-xl border-white/[0.04]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/10">
                                            <Search className="h-4 w-4 text-foreground" />
                                        </div>
                                        <span className="text-lg font-semibold">BlackEagle</span>
                                    </div>
                                </div>

                                {/* Token Balance Mobile */}
                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 mb-6">
                                    <Coins className="h-4 w-4 text-white/80" />
                                    <span className="text-sm font-medium">
                                        {formatNumber(profile?.token_balance ?? 0)} tokens
                                    </span>
                                </div>

                                <nav className="flex-1 space-y-1">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <motion.div
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                                        ? 'bg-white/10 text-foreground'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                                        }`}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                    {item.label}
                                                </motion.div>
                                            </Link>
                                        )
                                    })}
                                </nav>

                                <div className="pt-4 border-t border-white/5">
                                    <Button
                                        onClick={() => {
                                            handleSignOut()
                                            setMobileMenuOpen(false)
                                        }}
                                        variant="ghost"
                                        className="w-full justify-start gap-3 text-red-500/80 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Sign Out
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    )
}
