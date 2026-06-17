import { createFileRoute } from '@tanstack/react-router'
import { MonitorSmartphone } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { PageHeader } from '@/components/patterns/page-header'
import { authClient } from '@/lib/auth-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <AppShell>
        <div className="page-section">
          <PageHeader
            badge="Sessions"
            title="Active sessions"
            description="Manage where your account is currently signed in."
          />
          <AuthEmptyState
            icon={MonitorSmartphone}
            title="No sessions found"
            description="Sign in on this device to view and manage your active sessions."
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="page-section">
        <PageHeader
          badge="Sessions"
          badgeVariant="accent"
          title="Active sessions"
          description="Manage where your account is currently signed in."
        />

        <Card className="surface-card max-w-2xl gap-0 py-0">
          <CardHeader className="gap-3">
            <div className="icon-tile icon-tile-accent mb-1">
              <MonitorSmartphone className="size-4.5" />
            </div>
            <CardTitle className="text-base font-semibold">
              Current device
            </CardTitle>
            <CardDescription>
              This browser session is active and secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="surface-muted border-chart-1/20 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{session.user.email}</p>
              <p className="mt-1 text-xs text-chart-1">Session verified</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
