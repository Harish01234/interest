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
  createdAt: true,
  updatedAt: true,
} as const

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

  return { member }
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

  return { member }
}

export async function updateMemberImpl(data: {
  id: number
} & Partial<MemberRecord>): Promise<{ member: MemberDto }> {
  await requireAuthSession()

  const { id, ...fields } = data

  const member = await prisma.member.update({
    where: { id },
    data: {
      ...fields,
      ...(fields.jinsis !== undefined
        ? { jinsis: fields.jinsis ?? null }
        : {}),
    },
    select: memberSelect,
  })

  return { member }
}

export async function deleteMemberImpl(data: {
  id: number
}): Promise<{ success: true }> {
  await requireAuthSession()

  await prisma.member.delete({
    where: { id: data.id },
  })

  return { success: true }
}
