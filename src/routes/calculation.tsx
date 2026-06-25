import { createFileRoute } from '@tanstack/react-router'
import { Calculator } from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { CalculationPanel } from '@/components/calculation-panel'
import { CalculationPeriodToolbar } from '@/components/calculation-period-toolbar'
import { CalculationWorksheet } from '@/components/calculation-worksheet'
import { AuthEmptyState } from '@/components/patterns/auth-empty-state'
import { PageHeader } from '@/components/patterns/page-header'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/calculation')({
  component: CalculationPage,
})

function CalculationPage() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return (
      <AppShell withGlow>
        <div className="page-section">
          <PageHeader
            badge="Calculation"
            title="Period calculation"
            description="Sign in to reconcile your billing period against cash on hand."
          />
          <AuthEmptyState
            icon={Calculator}
            title="No active session"
            description="Authenticate to view and manage your period calculation."
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell withGlow>
      <div className="dashboard-workspace">
        <PageHeader
          badge="Calculation"
          badgeVariant="primary"
          title="Period calculation"
          description="Track the billing period against cash on hand, then reconcile the main balance sheet (TOBIL / SUDH vs Laptop / Cash)."
        />
        <CalculationPeriodToolbar />
        <CalculationWorksheet />
        <CalculationPanel />
      </div>
    </AppShell>
  )
}
