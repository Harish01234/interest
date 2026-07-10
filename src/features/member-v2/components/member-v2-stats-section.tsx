import {
  IndianRupee,
  Percent,
  UsersRound,
  WalletCards,
} from 'lucide-react'

import { MemberV2StatCard } from '@/features/member-v2/components/member-v2-stat-card'
import {
  formatMoney,
  formatPlainNumber,
} from '@/features/member-v2/utils/formatters'

type MemberV2Summary = {
  totalMembers: number
  totalCredit: number
  totalInterest: number
  averagePercentage: number
}

type MemberV2StatsGridProps = {
  summary: MemberV2Summary
}

export function MemberV2StatsGrid({ summary }: MemberV2StatsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MemberV2StatCard
        title="Active members"
        value={formatPlainNumber(summary.totalMembers)}
        helper="Currently active"
        icon={<UsersRound className="size-5" />}
        className="stat-tile-chart-1"
      />

      <MemberV2StatCard
        title="Total credit"
        value={formatMoney(summary.totalCredit)}
        helper="Active members only"
        icon={<WalletCards className="size-5" />}
        className="stat-tile-chart-2"
      />

      <MemberV2StatCard
        title="Total interest"
        value={formatMoney(summary.totalInterest)}
        helper="Credit × percentage"
        icon={<IndianRupee className="size-5" />}
        className="stat-tile-chart-3"
      />

      <MemberV2StatCard
        title="Avg percentage"
        value={`${formatPlainNumber(summary.averagePercentage)}%`}
        helper="Across active members"
        icon={<Percent className="size-5" />}
        className="stat-tile-chart-1"
      />
    </div>
  )
}
