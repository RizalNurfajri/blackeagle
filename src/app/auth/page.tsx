'use client'

import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, AlertTriangle, Mail, Lock, User, Eye, EyeOff, Loader2, Github } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import { fadeInUp, smoothTransition } from '@/lib/animations'

function AuthContent() {
    const { signInWithEmail, signUpWithEmail } = useAuth()
    const searchParams = useSearchParams()
    const router = useRouter()
    const error = searchParams.get('error')

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Sign In State
    const [signInEmail, setSignInEmail] = useState('')
    const [signInPassword, setSignInPassword] = useState('')

    // Sign Up State
    const [username, setUsername] = useState('')
    const [signUpEmail, setSignUpEmail] = useState('')
    const [signUpPassword, setSignUpPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // OAuth handlers removed for MariaDB migration

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!signInEmail || !signInPassword) {
            toast.error("Please enter both email and password")
            return
        }

        try {
            setIsLoading(true)
            await signInWithEmail(signInEmail, signInPassword)
            toast.success("Successfully signed in!")
            // Redirect is handled by AuthProvider/Middleware, but just in case
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Login failed:', error)
            toast.error(error.message || "Failed to sign in. Please check your credentials.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || !signUpEmail || !signUpPassword || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        if (signUpPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (signUpPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setIsLoading(true)
            await signUpWithEmail(signUpEmail, signUpPassword, username)
            toast.success("Account created! Please verify your email to login.")
            // Ideally switch to sign in tab or show verification message
        } catch (error: any) {
            console.error('Sign up failed:', error)
            toast.error(error.message || "Failed to create account.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl opacity-50" />
            </div>

            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="relative w-full max-w-[420px] sm:max-w-md"
            >
                <div className="mb-6 sm:mb-8 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={smoothTransition}
                        className="mx-auto mb-4 relative flex h-12 w-12 items-center justify-center"
                    >
                        <img
                            src="/logo.png"
                            alt="BlackEagle Logo"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Sign in to access advanced OSINT capabilities
                    </p>
                </div>



                <Card className="border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 pb-4">
                        {/* Headers handled by Tabs now */}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                                <TabsTrigger value="signin">Sign In</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Sign In Tab */}
                            <TabsContent value="signin" className="space-y-4">
                                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                className="pl-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={signInEmail}
                                                onChange={(e) => setSignInEmail(e.target.value)}
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Password"
                                                type={showPassword ? "text" : "password"}
                                                className="pl-9 pr-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={signInPassword}
                                                onChange={(e) => setSignInPassword(e.target.value)}
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 sm:h-10 text-base sm:text-sm bg-white text-black hover:bg-white/90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Sign Up Tab */}
                            <TabsContent value="signup" className="space-y-4">
                                <form onSubmit={handleEmailSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Username"
                                                className="pl-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                className="pl-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={signUpEmail}
                                                onChange={(e) => setSignUpEmail(e.target.value)}
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Password"
                                                type={showPassword ? "text" : "password"}
                                                className="pl-9 pr-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={signUpPassword}
                                                onChange={(e) => setSignUpPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Confirm Password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="pl-9 pr-9 h-11 sm:h-10 bg-white/5 border-white/10 focus:border-white/20 transition-colors text-base sm:text-sm"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11 sm:h-10 text-base sm:text-sm bg-white text-black hover:bg-white/90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Sign Up
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        {/* OAuth Buttons Removed */}

                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <p>Authentication failed. Please try again.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-sm text-muted-foreground/60 max-w-xs mx-auto flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3" />
                    <p>Secure, Encrypted & Ethical</p>
                </div>
            </motion.div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    )
}
