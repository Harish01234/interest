import { createFileRoute } from '@tanstack/react-router'
import { MonitorSmartphone } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { PageHeader } from '@/components/patterns/page-header'
import { SectionCard } from '@/components/patterns/section-card'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <AppShell withGlow>
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

        <SectionCard
          icon={MonitorSmartphone}
          iconVariant="accent"
          title="Current device"
          description="This browser session is active and secure."
          className="max-w-2xl"
        >
          <div className="surface-muted border-chart-1/20 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{session.user.email}</p>
            <p className="mt-1 text-xs font-medium text-chart-1">Session verified</p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
