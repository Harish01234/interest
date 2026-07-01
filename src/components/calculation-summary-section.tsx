import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Calculator, CheckCircle2, Scale, XCircle } from 'lucide-react'

import { formatSheetCell } from '@/components/balance-sheet'
import { SectionCard } from '@/components/patterns/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { calculationQueryOptions } from '@/members/calculation-queries'
import { mainCalculationQueryOptions } from '@/members/main-calculation-queries'
import { creditSumQueryOptions } from '@/members/queries'

export function CalculationSummarySection() {
  const { data: period, isLoading: periodLoading } = useQuery(calculationQueryOptions)
  const { data: main, isLoading: mainLoading } = useQuery(mainCalculationQueryOptions)
  const { data: credits } = useQuery(creditSumQueryOptions)

  const isLoading = periodLoading || mainLoading

  if (isLoading) {
    return (
      <div className="loading-panel min-h-32" role="status">
        <Spinner className="size-6 text-primary" />
      </div>
    )
  }

  const bandak = credits?.total ?? main?.bandak ?? 0
  const mainLeft = (main?.totalToBill ?? 0) + (period?.interest ?? main?.interest ?? 0)
  const mainRight =
    bandak + (main?.jinisChara ?? 0) + (period?.leftTotal ?? main?.cash ?? 0)
  const mainBalanced = mainLeft === mainRight

  return (
    <div className="calc-summary-grid">
      <SectionCard
        icon={Calculator}
        iconVariant="chart1"
        title="Period calculation"
        description="Current billing period balance."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/calculation">
              View
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="space-y-3">
          <Badge
            variant="outline"
            className={
              period?.isBalanced
                ? 'recon-banner-ok w-fit gap-1.5 border-transparent'
                : 'recon-banner-bad w-fit gap-1.5 border-transparent'
            }
          >
            {period?.isBalanced ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            {period?.isBalanced
              ? 'Balanced'
              : `Off by ${formatSheetCell(Math.abs(period?.difference ?? 0))}`}
          </Badge>
          <div className="calc-summary-metrics">
            <div className="calc-summary-metric">
              <span className="calc-summary-metric-label">VAL1</span>
              <span className="calc-summary-metric-value">
                {formatSheetCell(period?.leftTotal ?? 0)}
              </span>
            </div>
            <div className="calc-summary-metric">
              <span className="calc-summary-metric-label">VAL2</span>
              <span className="calc-summary-metric-value">
                {formatSheetCell(period?.rightTotal ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={Scale}
        iconVariant="chart3"
        title="Main calculation"
        description="Overall balance sheet totals."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/calculation">
              View
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      >
        <div className="space-y-3">
          <Badge
            variant="outline"
            className={
              mainBalanced
                ? 'recon-banner-ok w-fit gap-1.5 border-transparent'
                : 'recon-banner-bad w-fit gap-1.5 border-transparent'
            }
          >
            {mainBalanced ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            {mainBalanced
              ? 'Balanced'
              : `Off by ${formatSheetCell(Math.abs(mainLeft - mainRight))}`}
          </Badge>
          <div className="calc-summary-metrics">
            <div className="calc-summary-metric">
              <span className="calc-summary-metric-label">VAL1</span>
              <span className="calc-summary-metric-value">
                {formatSheetCell(mainLeft)}
              </span>
            </div>
            <div className="calc-summary-metric">
              <span className="calc-summary-metric-label">VAL2</span>
              <span className="calc-summary-metric-value">
                {formatSheetCell(mainRight)}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
