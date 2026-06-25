import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { memberRecordSchema } from '@/lib/read-csv'
import type {
  DeleteAllMembersResult,
  GetMembersParams,
  GetMembersResult,
  MigrateMembersResult,
  SumAllCreditsResult,
} from '@/members/types'

export type {
  DeleteAllMembersResult,
  GetMembersParams,
  GetMembersResult,
  MemberDto,
  MigrateMembersResult,
  SumAllCreditsResult,
} from '@/members/types'

const migrateMembersInputSchema = z.object({
  members: z
    .array(memberRecordSchema)
    .min(1, 'At least one member row is required'),
})

const getMembersInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  slNo: z.string().default(''),
  name: z.string().default(''),
  fatherName: z.string().default(''),
  credit: z.string().default(''),
  type: z.enum(['all', 'gold', 'silver', 'both', 'unknown']).default('all'),
})

export const getMembers = createServerFn({ method: 'GET' })
  .validator((input: unknown) => getMembersInputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<GetMembersResult> => {
    const { getMembersImpl } = await import('@/members/migration.server')
    return getMembersImpl(data as GetMembersParams)
  })

export const sumAllCredits = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SumAllCreditsResult> => {
    const { sumAllCreditsImpl } = await import('@/members/migration.server')
    return sumAllCreditsImpl()
  },
)

export const migrateMembers = createServerFn({ method: 'POST' })
  .validator((input: unknown) => migrateMembersInputSchema.parse(input))
  .handler(async ({ data }): Promise<MigrateMembersResult> => {
    const { migrateMembersImpl } = await import('@/members/migration.server')
    return migrateMembersImpl(data)
  })

export const deleteAllMembers = createServerFn({ method: 'POST' }).handler(
  async (): Promise<DeleteAllMembersResult> => {
    const { deleteAllMembersImpl } = await import('@/members/migration.server')
    return deleteAllMembersImpl()
  },
)
