import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

import { prisma } from '#/db'
import { auth } from '#/lib/auth'
import { memberRecordSchema } from '@/lib/read-csv'

const migrateMembersInputSchema = z.object({
  members: z
    .array(memberRecordSchema)
    .min(1, 'At least one member row is required'),
})

export type MigrateMembersResult = {
  count: number
}

export type MemberDto = {
  id: number
  slNo: string
  name: string
  fatherName: string
  credit: string
  date: string
  phoneNo: string
  type: z.infer<typeof memberRecordSchema>['type']
  jinsis: string | null
  createdAt: Date
  updatedAt: Date
}

export type GetMembersResult = {
  members: MemberDto[]
}

export const getMembers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<GetMembersResult> => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })

    if (!session?.user) {
      throw new Error('You must be signed in to view members.')
    }

    const members = await prisma.member.findMany({
      orderBy: [{ slNo: 'asc' }, { id: 'asc' }],
      select: {
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
      },
    })

    return { members }
  },
)

export const migrateMembers = createServerFn({ method: 'POST' })
  .validator((input: unknown) => migrateMembersInputSchema.parse(input))
  .handler(async ({ data }): Promise<MigrateMembersResult> => {
    const session = await auth.api.getSession({
      headers: getRequest().headers,
    })

    if (!session?.user) {
      throw new Error('You must be signed in to migrate members.')
    }

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
  })
