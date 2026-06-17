import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowRight, LayoutDashboard, Shield, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/app-shell'
import { FeatureCard } from '@/components/patterns/feature-card'
import { authClient } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

const highlights = [
  {
    title: 'Fast OAuth',
    description: 'GitHub and Google sign-in with secure session handling.',
    icon: Zap,
    iconVariant: 'chart1' as const,
  },
  {
    title: 'Protected routes',
    description: 'Session-aware UI that adapts when you are signed in.',
    icon: Shield,
    iconVariant: 'chart2' as const,
  },
  {
    title: 'Clean dashboard',
    description: 'Jump straight into your workspace after authentication.',
    icon: LayoutDashboard,
    iconVariant: 'chart3' as const,
  },
]

function Home() {
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)

  useEffect(() => {
    if (!session?.user) return
    if (sessionStorage.getItem('showSignInToast') !== '1') return

    sessionStorage.removeItem('showSignInToast')
    toast.success('Signed in successfully. Welcome back!')
  }, [session?.user])

  return (
    <AppShell withGlow>
      <section className="page-section">
        <div className="max-w-3xl space-y-6">
          <Badge className="badge-accent rounded-full px-3 py-0.5">
            {isSignedIn
              ? `Welcome, ${session?.user?.name ?? 'there'}`
              : 'OAuth ready'}
          </Badge>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build with <span className="text-gradient-brand">Interest</span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A modern TanStack Start app with Better Auth, Prisma, and a polished
            interface powered by cyan and blue design tokens.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isSignedIn ? (
              <Button className="btn-primary-glow rounded-full px-5" asChild>
                <Link to="/dashboard">
                  Open dashboard
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button className="btn-primary-glow rounded-full px-5" asChild>
                <Link to="/signin">
                  Get started
                  <ArrowRight />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              className="rounded-full border-border bg-card px-5 hover:border-chart-1/40 hover:bg-accent"
              asChild
            >
              <Link to="/sessions">View sessions</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <FeatureCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </AppShell>
  )
}
