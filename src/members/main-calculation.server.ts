import { prisma } from '#/db'

import { sumActiveMemberV2CreditsImpl } from '@/features/member-v2/member-v2-credits.server'
import { requireAuthSession } from '@/members/auth.server'
import { getCalculationImpl } from '@/members/calculation.server'
import { sumAllCreditsImpl } from '@/members/migration.server'
import type {
  MainCalculationDto,
  SaveMainCalculationInput,
} from '@/members/main-calculation-types'

async function getMainCalculationRow() {
  return prisma.mainCalculation.findFirst({ orderBy: { id: 'asc' } })
}

function buildMainCalculationDto(
  row: {
    id: number
    TotalTobill: number
    interest: number
    Bandak: number
    jinisChara: number
    cash: number
  } | null,
  periodInterest: number,
  periodCash: number,
  bandak: number,
  jinisChara: number,
): MainCalculationDto {
  const totalToBill = row?.TotalTobill ?? 0

  const interest = periodInterest
  const cash = periodCash

  const leftTotal = totalToBill + interest
  const rightTotal = bandak + jinisChara + cash
  const difference = leftTotal - rightTotal

  return {
    id: row?.id ?? null,
    totalToBill,
    interest,
    bandak,
    jinisChara,
    cash,
    leftTotal,
    rightTotal,
    difference,
    isBalanced: difference === 0,
  }
}

export async function getMainCalculationImpl(): Promise<MainCalculationDto> {
  await requireAuthSession()

  const [row, period, credits, memberV2Credits] = await Promise.all([
    getMainCalculationRow(),
    getCalculationImpl(),
    sumAllCreditsImpl(),
    sumActiveMemberV2CreditsImpl(),
  ])

  return buildMainCalculationDto(
    row,
    period.interest,
    period.leftTotal,
    credits.total,
    memberV2Credits.total,
  )
}

export async function saveMainCalculationImpl(
  data: SaveMainCalculationInput,
): Promise<MainCalculationDto> {
  await requireAuthSession()

  const [period, credits, memberV2Credits] = await Promise.all([
    getCalculationImpl(),
    sumAllCreditsImpl(),
    sumActiveMemberV2CreditsImpl(),
  ])

  const manual = {
    TotalTobill: Math.trunc(data.totalToBill),
    Bandak: credits.total,
    jinisChara: memberV2Credits.total,
    interest: period.interest,
    cash: period.leftTotal,
  }

  const existing = await getMainCalculationRow()

  const row = existing
    ? await prisma.mainCalculation.update({
        where: { id: existing.id },
        data: manual,
      })
    : await prisma.mainCalculation.create({ data: manual })

  return buildMainCalculationDto(
    row,
    period.interest,
    period.leftTotal,
    credits.total,
    memberV2Credits.total,
  )
}

export async function resetMainCalculationImpl(): Promise<MainCalculationDto> {
  await requireAuthSession()

  const existing = await getMainCalculationRow()

  const row = existing
    ? await prisma.mainCalculation.update({
        where: { id: existing.id },
        data: {
          TotalTobill: 0,
          Bandak: 0,
          jinisChara: 0,
          interest: 0,
          cash: 0,
        },
      })
    : await prisma.mainCalculation.create({ data: {} })

  const [period, credits, memberV2Credits] = await Promise.all([
    getCalculationImpl(),
    sumAllCreditsImpl(),
    sumActiveMemberV2CreditsImpl(),
  ])

  return buildMainCalculationDto(
    row,
    period.interest,
    period.leftTotal,
    credits.total,
    memberV2Credits.total,
  )
}
