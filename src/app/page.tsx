'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  Mail,
  Phone,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Terminal,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Footer } from '@/components/layout'
import { fadeInUp } from '@/lib/animations'

const features = [
  {
    icon: Mail,
    title: 'Email Intelligence',
    description: 'Deep validation, breach checks, and digital footprint analysis for email addresses.',
  },
  {
    icon: Phone,
    title: 'Phone Intelligence',
    description: 'Carrier detection, location data, and social media presence verification.',
  },
  {
    icon: Terminal,
    title: 'Developer API',
    description: 'Integrate our powerful OSINT capabilities directly into your applications.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Zero-knowledge architecture ensuring your investigations remain private.',
  },
]

const tokenPackages = [
  { price: 5000, tokens: 2, name: 'Starter' },
  { price: 10000, tokens: 4, popular: true, name: 'Professional' },
  { price: 20000, tokens: 8, name: 'Business' },
  { price: 50000, tokens: 25, name: 'Enterprise' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex flex-col font-sans selection:bg-white/20 relative overflow-hidden">
      {/* Silver Corner Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle 600px at 0% 200px, rgba(161, 161, 170, 0.15), transparent),
            radial-gradient(circle 600px at 100% 200px, rgba(161, 161, 170, 0.15), transparent)
          `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%, 100% 100%",
        }}
      />

      {/* Navbar */}
      {/* Minimal Header */}
      <header className="absolute top-0 w-full z-50">
        <div className="container mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-xl">
            <div className="relative flex h-8 w-8 items-center justify-center">
              {/* Use the existing logo or a simple icon if needed, existing code used img /logo.png */}
              <img
                src="/logo.png"
                alt="BlackEagle Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span>BlackEagle</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth">
              <Button size="sm" className="bg-white text-black hover:bg-white/90 font-medium h-9 px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <motion.section
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="py-24 md:py-32 relative overflow-hidden border-b border-border will-change-transform"
        >
          <div className="container px-4 relative z-10 text-center">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs text-muted-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Operational
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Precision OSINT<br />
              Research Platform
            </h1>

            <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
              Professional-grade tools for digital investigation.
              Analyze emails and phone numbers with enterprise precision and speed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-white/90 text-base font-medium rounded-md w-full sm:w-auto">
                  Start Investigation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 border-border hover:bg-secondary text-base font-medium rounded-md w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </div>

            <div className="mt-20 pt-10 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                ['99.9%', 'Uptime'],
                ['< 500ms', 'Latency'],
                ['10k+', 'Daily Scans']
              ].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-foreground font-mono">{val}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>

          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          id="features"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-24 border-b border-border bg-secondary/20 will-change-transform"
        >
          <div className="container px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
              {features.map((feature) => (
                <div key={feature.title} className="bg-background p-8 group hover:bg-secondary/40 transition-colors">
                  <feature.icon className="h-8 w-8 text-foreground/80 mb-6 group-hover:text-white transition-colors" />
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="py-24 will-change-transform"
        >
          <div className="container px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
              <p className="text-muted-foreground">Pay-per-use tokens. No subscriptions. No hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {tokenPackages.map((pkg) => (
                <Card
                  key={pkg.name}
                  className={`bg-background border-border relative ${pkg.popular ? 'ring-1 ring-white/20' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-white"></div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">{pkg.name}</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{formatCurrency(pkg.price)}</span>
                    </div>
                    <CardDescription>{pkg.tokens} Research Tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        Valid forever
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                        Full API Access
                      </li>
                    </ul>
                    <Link href="/auth">
                      <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border">
                        Purchase
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
