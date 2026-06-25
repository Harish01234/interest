import { prisma } from '#/db'

import { requireAuthSession } from '@/members/auth.server'
import { compareMembersBySlNo, parseCredit } from '@/members/credit'
import type {
  CalculationDto,
  CalculationMemberRow,
  CashToPerson,
  SaveCalculationInput,
} from '@/members/calculation-types'

function parseCashToPersons(value: unknown): CashToPerson[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === 'object' &&
      'name' in entry &&
      'amount' in entry
    ) {
      const name = String((entry as { name: unknown }).name ?? '')
      const amountRaw = (entry as { amount: unknown }).amount
      const amount =
        typeof amountRaw === 'number'
          ? amountRaw
          : Number.parseInt(String(amountRaw ?? 0), 10)
      return [{ name, amount: Number.isFinite(amount) ? amount : 0 }]
    }
    return []
  })
}

function toRow(member: {
  id: number
  slNo: string
  name: string
  fatherName: string
  credit: string
  interest: number
}): CalculationMemberRow {
  return {
    id: member.id,
    slNo: member.slNo,
    name: member.name,
    fatherName: member.fatherName,
    credit: Math.round(parseCredit(member.credit)),
    interest: member.interest,
  }
}

const memberRowSelect = {
  id: true,
  slNo: true,
  name: true,
  fatherName: true,
  credit: true,
  interest: true,
} as const

/**
 * Builds the period-scoped calculation. Asol/Interest come from members
 * settled after the period start; Dewa from members added after the period
 * start. The single calculation row holds the manual inputs + last snapshot.
 */
async function buildCalculationDto(row: {
  id: number
  TotalTobill: number
  CashInHome: number
  CashInShop: number
  cashToPersons: unknown
  periodStartedAt: Date | null
} | null): Promise<CalculationDto> {
  const totalToBill = row?.TotalTobill ?? 0
  const cashInHome = row?.CashInHome ?? 0
  const cashInShop = row?.CashInShop ?? 0
  const cashToPersons = parseCashToPersons(row?.cashToPersons)
  const periodStartedAt = row?.periodStartedAt ?? null

  let settledMembers: CalculationMemberRow[] = []
  let addedMembers: CalculationMemberRow[] = []

  if (periodStartedAt) {
    const [settled, added] = await Promise.all([
      prisma.member.findMany({
        where: { active: false, settledAt: { gte: periodStartedAt } },
        select: memberRowSelect,
      }),
      prisma.member.findMany({
        where: { active: true, createdAt: { gte: periodStartedAt } },
        select: memberRowSelect,
      }),
    ])

    settledMembers = settled.map(toRow).sort(compareMembersBySlNo)
    addedMembers = added.map(toRow).sort(compareMembersBySlNo)
  }

  const asol = settledMembers.reduce((sum, m) => sum + m.credit, 0)
  const interest = settledMembers.reduce((sum, m) => sum + m.interest, 0)
  const dewa = addedMembers.reduce((sum, m) => sum + m.credit, 0)

  const cashToPersonsTotal = cashToPersons.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  )

  const leftTotal = totalToBill + asol + interest - dewa
  const rightTotal = cashInHome + cashInShop + cashToPersonsTotal
  const difference = leftTotal - rightTotal

  return {
    id: row?.id ?? null,
    totalToBill,
    cashInHome,
    cashInShop,
    cashToPersons,
    periodStartedAt,
    asol,
    interest,
    dewa,
    settledMembers,
    addedMembers,
    leftTotal,
    rightTotal,
    difference,
    isBalanced: difference === 0,
  }
}

async function getCalculationRow() {
  return prisma.calculation.findFirst({ orderBy: { id: 'asc' } })
}

export async function getCalculationImpl(): Promise<CalculationDto> {
  await requireAuthSession()
  const row = await getCalculationRow()
  return buildCalculationDto(row)
}

export async function saveCalculationImpl(
  data: SaveCalculationInput,
): Promise<CalculationDto> {
  await requireAuthSession()

  const cashToPersons = data.cashToPersons.map((entry) => ({
    name: entry.name.trim(),
    amount: Math.trunc(entry.amount),
  }))

  const existing = await getCalculationRow()

  // Stamp the period start the first time TotalTobill is set, or restart the
  // period if it was previously empty.
  const shouldStartPeriod =
    !existing?.periodStartedAt && data.totalToBill > 0

  const baseData = {
    TotalTobill: Math.trunc(data.totalToBill),
    CashInHome: Math.trunc(data.cashInHome),
    CashInShop: Math.trunc(data.cashInShop),
    cashToPersons,
  }

  let row
  if (existing) {
    row = await prisma.calculation.update({
      where: { id: existing.id },
      data: {
        ...baseData,
        ...(shouldStartPeriod ? { periodStartedAt: new Date() } : {}),
      },
    })
  } else {
    row = await prisma.calculation.create({
      data: {
        ...baseData,
        periodStartedAt: data.totalToBill > 0 ? new Date() : null,
      },
    })
  }

  const dto = await buildCalculationDto(row)

  // Persist the derived snapshot so the stored row stays consistent.
  await prisma.calculation.update({
    where: { id: row.id },
    data: { Asol: dto.asol, Interest: dto.interest, Dewa: dto.dewa },
  })

  return dto
}

export async function startNewPeriodImpl(): Promise<CalculationDto> {
  await requireAuthSession()

  const existing = await getCalculationRow()

  const row = existing
    ? await prisma.calculation.update({
        where: { id: existing.id },
        data: {
          TotalTobill: 0,
          Asol: 0,
          Interest: 0,
          Dewa: 0,
          CashInHome: 0,
          CashInShop: 0,
          cashToPersons: [],
          periodStartedAt: null,
        },
      })
    : await prisma.calculation.create({ data: {} })

  return buildCalculationDto(row)
}
