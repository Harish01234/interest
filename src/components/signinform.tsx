import { useEffect, useState } from 'react'
import { Github, ShieldCheck, Sparkles } from 'lucide-react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'

import { BrandMark } from '@/components/patterns/brand-mark'
import { authClient } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

type SocialProvider = 'github' | 'google'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const socialProviders = [
  {
    id: 'github' as const,
    label: 'Continue with GitHub',
    shortLabel: 'GitHub',
    icon: Github,
    hoverClass:
      'hover:border-border hover:bg-secondary hover:text-secondary-foreground',
  },
  {
    id: 'google' as const,
    label: 'Continue with Google',
    shortLabel: 'Google',
    icon: GoogleIcon,
    hoverClass:
      'hover:border-border hover:bg-accent hover:text-accent-foreground',
  },
]

export function SignInForm() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { error?: string }
  const { data: session, isPending } = authClient.useSession()
  const [isSubmitting, setIsSubmitting] = useState<SocialProvider | null>(null)

  useEffect(() => {
    if (!isPending && session?.user) {
      void navigate({ to: '/' })
    }
  }, [isPending, session, navigate])

  useEffect(() => {
    if (search.error) {
      toast.error(decodeURIComponent(search.error))
    }
  }, [search.error])

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsSubmitting(provider)

    await authClient.signOut()
    sessionStorage.setItem('showSignInToast', '1')

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: '/',
      errorCallbackURL: '/signin',
    })

    if (error) {
      toast.error(error.message ?? 'Failed to sign in. Please try again.')
      setIsSubmitting(null)
    }
  }

  if (isPending) {
    return (
      <div
        className="flex w-full max-w-md items-center justify-center py-20"
        role="status"
        aria-label="Checking session"
      >
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <Card className="surface-card overflow-hidden border-chart-1/20 py-0 shadow-[var(--shadow-floating)]">
        <div aria-hidden className="accent-bar" />

        <CardHeader className="items-center gap-4 pt-8 text-center">
          <BrandMark size="lg" showWordmark={false} className="justify-center" />

          <Badge className="badge-accent gap-1.5 rounded-full px-3 py-0.5">
            <Sparkles className="size-3" aria-hidden />
            Secure OAuth
          </Badge>

          <div className="space-y-2">
            <CardTitle className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription className="mx-auto max-w-xs text-sm leading-relaxed sm:text-base">
              Sign in with your preferred provider to access your Interest
              workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-2">
          {socialProviders.map(
            ({ id, label, shortLabel, icon: Icon, hoverClass }) => {
              const loading = isSubmitting === id
              const busy = isSubmitting !== null

              return (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={busy}
                  aria-busy={loading}
                  onClick={() => handleSocialLogin(id)}
                  className={cn(
                    'h-12 w-full justify-center gap-3 rounded-xl border-border bg-card text-sm font-medium shadow-[var(--shadow-elevated)] transition-all duration-200 sm:text-base',
                    hoverClass,
                    busy && !loading && 'opacity-60',
                  )}
                >
                  {loading ? (
                    <Spinner className="size-5" />
                  ) : (
                    <Icon className="size-5 shrink-0" />
                  )}
                  <span className="truncate sm:hidden">{shortLabel}</span>
                  <span className="hidden truncate sm:inline">{label}</span>
                </Button>
              )
            },
          )}
        </CardContent>

        <CardFooter className="section-card-footer flex-col gap-4 py-6">
          <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="size-3.5 text-foreground/80" aria-hidden />
              Encrypted session
            </span>
            <Separator className="flex-1" />
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By signing in, you agree to our{' '}
            <button
              type="button"
              className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Privacy Policy
            </button>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
