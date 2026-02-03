import { DashboardHeader } from '@/components/layout'
import { Footer } from '@/components/layout'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <DashboardHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}
