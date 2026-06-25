import { prisma } from '#/db'
import type { MemberRecord } from '@/lib/read-csv'

import {
  compareMembersBySlNo,
  formatCreditTotal,
  matchesCreditFilter,
  parseCredit,
} from '@/members/credit'
import { requireAuthSession } from '@/members/auth.server'
import { memberSelect, toMemberDto } from '@/members/member.server'
import type {
  DeleteAllMembersResult,
  GetMembersParams,
  GetMembersResult,
  MigrateMembersResult,
  SumAllCreditsResult,
} from '@/members/types'

function buildMembersWhere(filters: {
  name: string
  fatherName: string
  type: GetMembersParams['type']
}) {
  const name = filters.name.trim()
  const fatherName = filters.fatherName.trim()

  return {
    active: true,
    ...(filters.type !== 'all' ? { type: filters.type } : {}),
    ...(name
      ? { name: { contains: name, mode: 'insensitive' as const } }
      : {}),
    ...(fatherName
      ? { fatherName: { contains: fatherName, mode: 'insensitive' as const } }
      : {}),
  }
}

export async function getMembersImpl(
  data: GetMembersParams,
): Promise<GetMembersResult> {
  await requireAuthSession()

  const { page, pageSize, name, fatherName, credit, type } = data
  const where = buildMembersWhere({ name, fatherName, type })
  const creditQuery = credit.trim()

  let matching = await prisma.member.findMany({
    where,
    select: { id: true, slNo: true, credit: true },
  })

  if (creditQuery) {
    matching = matching.filter((member) =>
      matchesCreditFilter(member.credit, creditQuery),
    )
  }

  matching.sort(compareMembersBySlNo)

  const total = matching.length
  const filteredCreditTotal = matching.reduce(
    (sum, member) => sum + parseCredit(member.credit),
    0,
  )

  const pageSlice = matching.slice((page - 1) * pageSize, page * pageSize)
  const pageIds = pageSlice.map((member) => member.id)
  const pageCreditTotal = pageSlice.reduce(
    (sum, member) => sum + parseCredit(member.credit),
    0,
  )

  const pageMembers =
    pageIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: pageIds } },
          select: memberSelect,
        })
      : []

  const membersById = new Map(pageMembers.map((member) => [member.id, member]))
  const members = pageIds
    .map((id) => membersById.get(id))
    .filter((member): member is NonNullable<typeof member> => member != null)
    .map(toMemberDto)

  return {
    members,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    pageCreditTotal,
    pageCreditFormatted: formatCreditTotal(pageCreditTotal),
    filteredCreditTotal,
    filteredCreditFormatted: formatCreditTotal(filteredCreditTotal),
  }
}

export async function sumAllCreditsImpl(): Promise<SumAllCreditsResult> {
  await requireAuthSession()

  const members = await prisma.member.findMany({
    where: { active: true },
    select: { credit: true },
  })

  const total = members.reduce(
    (sum, member) => sum + parseCredit(member.credit),
    0,
  )

  return {
    total,
    formatted: formatCreditTotal(total),
    count: members.length,
  }
}

export async function migrateMembersImpl(data: {
  members: MemberRecord[]
}): Promise<MigrateMembersResult> {
  const session = await requireAuthSession()

  const result = await prisma.member.createMany({
    data: data.members.map((member) => ({
      slNo: member.slNo,
      name: member.name,
      fatherName: member.fatherName,
      credit: member.credit,
      date: member.date,
      phoneNo: member.phoneNo,
      type: member.type,
      jinsis: member.jinsis ?? null,
      userId: session.user.id,
    })),
  })

  return { count: result.count }
}

export async function deleteAllMembersImpl(): Promise<DeleteAllMembersResult> {
  await requireAuthSession()

  const result = await prisma.member.updateMany({
    where: { active: true },
    data: { active: false },
  })

  return { count: result.count }
}
