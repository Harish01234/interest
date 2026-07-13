import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { memberRecordSchema } from '@/lib/read-csv'
import type { MemberDto } from '@/members/types'

const memberIdSchema = z.object({
  id: z.number().int().positive(),
})

const deleteMemberInputSchema = z.object({
  id: z.number().int().positive(),
  interest: z.number().int().min(0).default(0),
})

const createMemberInputSchema = memberRecordSchema

const updateMemberInputSchema = z
  .object({
    id: z.number().int().positive(),
  })
  .merge(memberRecordSchema.partial())

export const getMember = createServerFn({ method: 'GET' })
  .validator((input: unknown) => memberIdSchema.parse(input))
  .handler(async ({ data }): Promise<{ member: MemberDto }> => {
    const { getMemberImpl } = await import('@/members/member.server')
    return getMemberImpl(data)
  })

export const createMember = createServerFn({ method: 'POST' })
  .validator((input: unknown) => createMemberInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ member: MemberDto }> => {
    const { createMemberImpl } = await import('@/members/member.server')
    return createMemberImpl(data)
  })

export const updateMember = createServerFn({ method: 'POST' })
  .validator((input: unknown) => updateMemberInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ member: MemberDto }> => {
    const { updateMemberImpl } = await import('@/members/member.server')
    return updateMemberImpl(data)
  })

export const deleteMember = createServerFn({ method: 'POST' })
  .validator((input: unknown) => deleteMemberInputSchema.parse(input))
  .handler(async ({ data }): Promise<{ success: true }> => {
    const { deleteMemberImpl } = await import('@/members/member.server')
    return deleteMemberImpl(data)
  })


  //from here everything is new for array based members deactivation

  export const deactivateMembersBySlNosInputSchema = z.object({
    slNos: z
      .array(z.string().trim().min(1))
      .min(1, 'Provide at least one serial number')
      .max(500, 'Maximum 500 serial numbers allowed'),
  })


  export const deactivateMembersBySlNos = createServerFn({
    method: 'POST',
  })
    .validator((input: unknown) =>
      deactivateMembersBySlNosInputSchema.parse(input),
    )
    .handler(
      async ({
        data,
      }): Promise<{
        success: true
        deactivatedCount: number
      }> => {
        const { deactivateMembersBySlNosImpl } = await import(
          '@/members/member.server'
        )
  
        return deactivateMembersBySlNosImpl(data)
      },
    )