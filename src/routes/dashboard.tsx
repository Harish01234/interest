import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, PenLine, Users } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { CalculationSummarySection } from '@/components/calculation-summary-section'
import { CsvForm } from '@/components/csvform'
import { MembersPanel } from '@/components/members-panel'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { MiniBarChart } from '@/components/patterns/mini-bar-chart'
import { PageHeader } from '@/components/patterns/page-header'
import { SectionCard } from '@/components/patterns/section-card'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
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
      <AppShell withGlow>
        <div className="page-section">
          <PageHeader
            badge="Dashboard"
            title="Your workspace"
            description="Sign in to view personalized account data, import members, and manage records."
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
    <AppShell withGlow>
      <div className="dashboard-workspace">
        <PageHeader
          badge="Dashboard"
          badgeVariant="primary"
          title={`Hey, ${session.user.name}`}
          description="Import members, review credit totals, and manage your records in one place."
        />

        <section aria-labelledby="dashboard-overview-heading" className="space-y-3">
          <h2 id="dashboard-overview-heading" className="sr-only">
            Account overview
          </h2>
          <div className="dashboard-overview-grid">
            <SectionCard
              icon={Users}
              iconVariant="primary"
              title="Account status"
              description="You are signed in and ready to manage member data."
            >
              <div className="surface-muted flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {session.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
                <MiniBarChart values={[55, 70, 45, 85, 60]} />
              </div>
            </SectionCard>

            <SectionCard
              icon={BarChart3}
              iconVariant="chart1"
              title="Activity snapshot"
              description="Quick stats from your workspace."
            >
              <div className="space-y-4">
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
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </section>

        <section aria-labelledby="dashboard-calculations-heading" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2
                id="dashboard-calculations-heading"
                className="font-heading text-lg font-semibold tracking-tight text-foreground"
              >
                Calculation totals
              </h2>
              <p className="text-sm text-muted-foreground">
                Final values only — edit from the values page.
              </p>
            </div>
            <Button asChild className="btn-primary-glow shrink-0" size="sm">
              <Link to="/values">
                <PenLine className="size-4" />
                Edit values
              </Link>
            </Button>
          </div>
          <CalculationSummarySection />
        </section>

        <section aria-labelledby="dashboard-import-heading" className="space-y-3">
          <h2
            id="dashboard-import-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground"
          >
            Import data
          </h2>
          <CsvForm />
        </section>

        <section aria-labelledby="dashboard-members-heading" className="space-y-3">
          <h2
            id="dashboard-members-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground"
          >
            Member records
          </h2>
          <MembersPanel />
        </section>
      </div>
    </AppShell>
  )
}
