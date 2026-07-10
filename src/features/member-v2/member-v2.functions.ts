// src/features/member-v2/member-v2.functions.ts

import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { requireAuthSession } from '@/members/auth.server'
import {
  createMemberV2Schema,
  updateMemberV2Schema,
  memberV2IdSchema,
  toggleMemberV2Schema,
} from './member-v2.schema'

function cleanOptional(value?: string | null) {
  const cleaned = value?.trim()
  return cleaned ? cleaned : null
}

function serializeMemberV2(member: {
  id: number
  name: string
  credit: number
  percentage: number
  remarks: string | null
  mobileNo: string | null
  date: Date
  active: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
}) {
  return {
    ...member,
    date: member.date.toISOString(),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  }
}

export const listMemberV2 = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const members = await prisma.memberV2.findMany({
      where: {
        userId,
      },
      orderBy: [
        { active: 'desc' },
        { date: 'desc' },
        { id: 'desc' },
      ],
    })

    return members.map(serializeMemberV2)
  },
)

export const createMemberV2 = createServerFn({ method: 'POST' })
  .validator(createMemberV2Schema)
  .handler(async ({ data }) => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const member = await prisma.memberV2.create({
      data: {
        name: data.name.trim(),
        credit: data.credit,
        percentage: data.percentage ?? 0,
        remarks: cleanOptional(data.remarks),
        mobileNo: cleanOptional(data.mobileNo),
        date: data.date ? new Date(data.date) : new Date(),
        userId,
      },
    })

    return serializeMemberV2(member)
  })

export const updateMemberV2 = createServerFn({ method: 'POST' })
  .validator(updateMemberV2Schema)
  .handler(async ({ data }) => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const updateData: {
      name?: string
      credit?: number
      percentage?: number
      remarks?: string | null
      mobileNo?: string | null
      date?: Date
    } = {}

    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }

    if (data.credit !== undefined) {
      updateData.credit = data.credit
    }

    if (data.percentage !== undefined) {
      updateData.percentage = data.percentage
    }

    if (data.remarks !== undefined) {
      updateData.remarks = cleanOptional(data.remarks)
    }

    if (data.mobileNo !== undefined) {
      updateData.mobileNo = cleanOptional(data.mobileNo)
    }

    if (data.date !== undefined) {
      updateData.date = new Date(data.date)
    }

    const result = await prisma.memberV2.updateMany({
      where: {
        id: data.id,
        userId,
      },
      data: updateData,
    })

    if (result.count === 0) {
      throw new Error('Member not found')
    }

    const member = await prisma.memberV2.findFirstOrThrow({
      where: {
        id: data.id,
        userId,
      },
    })

    return serializeMemberV2(member)
  })

export const toggleMemberV2Active = createServerFn({ method: 'POST' })
  .validator(toggleMemberV2Schema)
  .handler(async ({ data }) => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const result = await prisma.memberV2.updateMany({
      where: {
        id: data.id,
        userId,
      },
      data: {
        active: data.active,
      },
    })

    if (result.count === 0) {
      throw new Error('Member not found')
    }

    const member = await prisma.memberV2.findFirstOrThrow({
      where: {
        id: data.id,
        userId,
      },
    })

    return serializeMemberV2(member)
  })

export const deleteMemberV2 = createServerFn({ method: 'POST' })
  .validator(memberV2IdSchema)
  .handler(async ({ data }) => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const result = await prisma.memberV2.deleteMany({
      where: {
        id: data.id,
        userId,
      },
    })

    if (result.count === 0) {
      throw new Error('Member not found')
    }

    return {
      success: true,
      id: data.id,
    }
  })

export const getMemberV2Summary = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await requireAuthSession()
    const userId = session.user.id

    const members = await prisma.memberV2.findMany({
      where: {
        userId,
        active: true,
      },
      select: {
        credit: true,
        percentage: true,
      },
    })

    const totalCredit = members.reduce((sum, member) => {
      return sum + member.credit
    }, 0)

    const totalInterest = members.reduce((sum, member) => {
      return sum + member.credit * (member.percentage / 100)
    }, 0)

    return {
      totalMembers: members.length,
      totalCredit,
      totalInterest: Math.round(totalInterest),
    }
  },
)