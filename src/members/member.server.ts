import { prisma } from '#/db'
import type { MemberRecord } from '@/lib/read-csv'

import { requireAuthSession } from '@/members/auth.server'
import type { MemberDto } from '@/members/types'

export const memberSelect = {
  id: true,
  slNo: true,
  name: true,
  fatherName: true,
  credit: true,
  date: true,
  phoneNo: true,
  type: true,
  jinsis: true,
  interest: true,
  active: true,
  settledAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const

type RawMember = {
  id: number
  slNo: string
  name: string
  fatherName: string
  credit: string
  date: string
  phoneNo: string
  type: MemberDto['type']
  jinsis: string | null
  interest: number
  active: boolean
  settledAt: Date | null
  createdAt: Date
  updatedAt: Date
  user: { id: string; name: string; email: string } | null
}

export function toMemberDto(member: RawMember): MemberDto {
  const { user, ...rest } = member
  return {
    ...rest,
    createdBy: user
      ? { id: user.id, name: user.name, email: user.email }
      : null,
  }
}

export async function getMemberImpl(data: {
  id: number
}): Promise<{ member: MemberDto }> {
  await requireAuthSession()

  const member = await prisma.member.findUnique({
    where: { id: data.id },
    select: memberSelect,
  })

  if (!member) {
    throw new Error('Member not found.')
  }

  return { member: toMemberDto(member) }
}

export async function createMemberImpl(
  data: MemberRecord,
): Promise<{ member: MemberDto }> {
  const session = await requireAuthSession()

  const member = await prisma.member.create({
    data: {
      slNo: data.slNo,
      name: data.name,
      fatherName: data.fatherName,
      credit: data.credit,
      date: data.date,
      phoneNo: data.phoneNo,
      type: data.type,
      jinsis: data.jinsis ?? null,
      userId: session.user.id,
    },
    select: memberSelect,
  })

  return { member: toMemberDto(member) }
}

export async function updateMemberImpl(data: {
  id: number
} & Partial<MemberRecord>): Promise<{ member: MemberDto }> {
  await requireAuthSession()

  const { id, ...fields } = data

  const member = await prisma.member.update({
    where: { id, active: true },
    data: {
      ...fields,
      ...(fields.jinsis !== undefined
        ? { jinsis: fields.jinsis ?? null }
        : {}),
    },
    select: memberSelect,
  })

  return { member: toMemberDto(member) }
}

export async function deleteMemberImpl(data: {
  id: number
  interest?: number
}): Promise<{ success: true }> {
  await requireAuthSession()

  await prisma.member.update({
    where: { id: data.id },
    data: {
      active: false,
      interest: Math.trunc(data.interest ?? 0),
      settledAt: new Date(),
    },
  })

  return { success: true }
}
