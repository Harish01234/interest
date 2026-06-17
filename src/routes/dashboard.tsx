import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Users } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { CsvForm } from '@/components/csvform'
import { MembersPanel } from '@/components/members-panel'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { MiniBarChart } from '@/components/patterns/mini-bar-chart'
import { PageHeader } from '@/components/patterns/page-header'
import { authClient } from '@/lib/auth-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

const activityRows = [
  { label: 'Projected finish', value: 'October 2026' },
  { label: 'Monthly average', value: '$2,400' },
  { label: 'Active providers', value: '2 connected' },
]

function DashboardPage() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <AppShell>
        <div className="page-section">
          <PageHeader
            badge="Dashboard"
            title="Your workspace"
            description="Sign in to view personalized account data and activity."
          />
          <AuthEmptyState
            icon={Users}
            title="No active session"
            description="Authenticate with GitHub or Google to unlock your dashboard."
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="page-section">
        <PageHeader
          badge="Dashboard"
          badgeVariant="primary"
          title={`Hey, ${session.user.name}`}
          description="Overview of your account activity and quick actions."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="surface-card gap-0 py-0">
            <CardHeader className="gap-3">
              <div className="icon-tile icon-tile-primary mb-1">
                <Users className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">
                Account status
              </CardTitle>
              <CardDescription>
                You are signed in and ready to go.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="surface-muted flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
                <MiniBarChart values={[55, 70, 45, 85, 60]} />
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card gap-0 py-0">
            <CardHeader className="gap-3">
              <div className="icon-tile icon-tile-chart-1 mb-1">
                <BarChart3 className="size-4.5" />
              </div>
              <CardTitle className="text-base font-semibold">Activity</CardTitle>
              <CardDescription>
                Live snapshot using chart and primary tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-tile stat-tile-chart-1">
                  <p className="stat-value text-lg font-semibold">12</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="stat-tile stat-tile-chart-2">
                  <p className="stat-value text-lg font-semibold">4</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="stat-tile stat-tile-chart-3">
                  <p className="stat-value text-lg font-semibold">98%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {activityRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <CsvForm />
        <MembersPanel />
      </div>
    </AppShell>
  )
}
