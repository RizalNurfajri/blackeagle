'use client'

import { Search, Github, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { springTransition } from '@/lib/animations'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/[0.04] bg-background/50 backdrop-blur-sm">
            <div className="container px-4 md:px-6 py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="relative flex h-8 w-8 items-center justify-center">
                                <img
                                    src="/logo.png"
                                    alt="BlackEagle Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">BlackEagle</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Ethical OSINT research platform for email and phone intelligence gathering.
                        </p>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Product</h4>
                        <ul className="space-y-3">
                            {['Email OSINT', 'Phone OSINT', 'Pricing', 'API (Coming Soon)'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Legal</h4>
                        <ul className="space-y-3">
                            {['Privacy Policy', 'Terms of Service', 'Acceptable Use', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Connect</h4>
                        <div className="flex gap-3">
                            {[
                                { icon: Github, href: '#', label: 'GitHub' },
                                { icon: Twitter, href: '#', label: 'Twitter' },
                                { icon: Mail, href: '#', label: 'Email' },
                            ].map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={springTransition}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-4 w-4" />
                                </motion.a>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                            For educational and ethical research purposes only.
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground/60">
                        &copy; {currentYear} BlackEagle. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/40">
                        <span>Made with</span>
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="text-white/60"
                        >
                            ♥
                        </motion.span>
                        <span>in Indonesia</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
