'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as auth from '@/lib/auth'
import type { User } from '@/types'

interface AuthContextType {
    user: User | null
    loading: boolean
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string, username: string) => Promise<void>
    signOut: () => void
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchProfile = async () => {
        try {
            const userData = await auth.getMe()
            setUser(userData as User)
        } catch (error) {
            console.error('Error fetching profile:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const signInWithEmail = async (email: string, password: string) => {
        await auth.login(email, password)
        await fetchProfile()
        router.push('/dashboard')
    }

    const signUpWithEmail = async (email: string, password: string, username: string) => {
        await auth.register(email, password, username)
        // Auto login after register or redirect to login? 
        // Let's assume auto-login for better UX
        await auth.login(email, password)
        await fetchProfile()
        router.push('/dashboard')
    }

    const signOut = () => {
        auth.logout()
        setUser(null)
        router.push('/auth')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signInWithEmail,
                signUpWithEmail,
                signOut,
                refreshProfile: fetchProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
