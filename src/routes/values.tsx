import { createFileRoute, Link } from '@tanstack/react-router'
import { PenLine } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { CalculationPanel } from '@/components/calculation-panel'
import { CalculationPeriodToolbar } from '@/components/calculation-period-toolbar'
import { CalculationWorksheet } from '@/components/calculation-worksheet'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { PageHeader } from '@/components/patterns/page-header'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/values')({
  component: ValuesPage,
})

function ValuesPage() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <AppShell withGlow>
        <div className="page-section">
          <PageHeader
            badge="Values"
            title="Manage calculation values"
            description="Sign in to edit period and main calculation values."
          />
          <AuthEmptyState
            icon={PenLine}
            title="No active session"
            description="Authenticate to add and update calculation values."
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell withGlow>
      <div className="dashboard-workspace">
        <PageHeader
          badge="Values"
          badgeVariant="primary"
          title="Manage calculation values"
          description="Edit period totals, cash on hand, and main balance sheet inputs. Saved values appear on the calculation overview."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/calculation">View overview</Link>
            </Button>
          }
        />
        <CalculationPeriodToolbar />
        <CalculationWorksheet />
        <CalculationPanel />
      </div>
    </AppShell>
  )
}
