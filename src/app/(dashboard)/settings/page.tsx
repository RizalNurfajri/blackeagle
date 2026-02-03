'use client'

import { motion } from 'framer-motion'
import { User, Mail, Shield, Key } from 'lucide-react'
import { fadeInUp } from '@/lib/animations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/providers/AuthProvider'

export default function SettingsPage() {
    const { profile } = useAuth()

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="container px-4 md:px-6 py-8 space-y-8 will-change-transform"
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your profile and account preferences.
                </p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-background border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Your public profile details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input
                                defaultValue={profile?.full_name || ''}
                                className="bg-secondary/50 border-input"
                                readOnly
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email Address</Label>
                            <div className="flex gap-2">
                                <Input
                                    defaultValue={profile?.email || ''}
                                    className="bg-secondary/50 border-input"
                                    readOnly
                                />
                                <div className="flex items-center justify-center px-3 bg-secondary/50 border border-input rounded-md text-muted-foreground">
                                    <Shield className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-background border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Manage your password and authentication methods.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full sm:w-auto">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
