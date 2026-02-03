'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User } from '@/types'

interface AuthContextType {
    user: SupabaseUser | null
    profile: User | null
    loading: boolean
    isConfigured: boolean
    signInWithGoogle: () => Promise<void>
    signInWithGithub: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string, username: string) => Promise<void>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Don't create client if not configured
    const supabase = isSupabaseConfigured ? createClient() : null

    const fetchProfile = async (userId: string) => {
        if (!supabase) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data as User
    }

    const refreshProfile = async () => {
        if (user && supabase) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    useEffect(() => {
        // If Supabase is not configured, just set loading to false
        if (!supabase) {
            setLoading(false)
            return
        }

        const initAuth = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser()
                setUser(currentUser)

                if (currentUser) {
                    const profileData = await fetchProfile(currentUser.id)
                    setProfile(profileData)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id)
                    setProfile(profileData)
                } else {
                    setProfile(null)
                }

                if (event === 'SIGNED_IN' && session?.user) {
                    // Check if profile exists, if not create one
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', session.user.id)
                        .single()

                    if (!existingProfile) {
                        await supabase.from('profiles').insert({
                            id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.username || null,
                            avatar_url: session.user.user_metadata?.avatar_url || null,
                            token_balance: 0,
                        })
                        const profileData = await fetchProfile(session.user.id)
                        setProfile(profileData)
                    }
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        if (!supabase) {
            console.error('Supabase is not configured')
            return
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            console.error('Error signing in:', error)
            throw error
        }
    }

    const signInWithGithub = async () => {
        if (!supabase) {
            console.error('Supabase is not configured')
            return
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            console.error('Error signing in with GitHub:', error)
            throw error
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        if (!supabase) {
            throw new Error('Supabase is not configured')
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            console.error('Error signing in:', error)
            throw error
        }
    }

    const signUpWithEmail = async (email: string, password: string, username: string) => {
        if (!supabase) {
            throw new Error('Supabase is not configured')
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    username: username,
                    full_name: username,
                },
            },
        })
        if (error) {
            console.error('Error signing up:', error)
            throw error
        }
    }

    const signOut = async () => {
        if (!supabase) return

        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error)
            throw error
        }
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                isConfigured: isSupabaseConfigured,
                signInWithGoogle: signInWithGoogle,
                signInWithGithub: signInWithGithub,
                signInWithEmail: signInWithEmail,
                signUpWithEmail,
                signOut,
                refreshProfile,
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
