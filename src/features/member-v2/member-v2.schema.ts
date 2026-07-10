// src/features/member-v2/member-v2.schema.ts

import { z } from 'zod'

import { normalizeMemberV2DateInput } from './utils/parse-member-v2-date'

export const memberV2DateSchema = z.preprocess(
  (value) => normalizeMemberV2DateInput(
    typeof value === 'string' || typeof value === 'number' ? String(value) : undefined,
  ),
  z.string().optional(),
)

export const createMemberV2Schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),

  credit: z.coerce
    .number()
    .int('Credit must be a whole number')
    .min(0, 'Credit cannot be negative'),

  percentage: z.coerce
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot be more than 100')
    .default(0),

  remarks: z.string().trim().optional(),
  mobileNo: z.string().trim().optional(),

  date: memberV2DateSchema,
})

export const updateMemberV2Schema = createMemberV2Schema.partial().extend({
  id: z.coerce.number().int().positive(),
})

export const memberV2IdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const toggleMemberV2Schema = z.object({
  id: z.coerce.number().int().positive(),
  active: z.boolean(),
})

export const importMembersV2Schema = z.object({
  replaceExisting: z.boolean().default(false),
  members: z.array(createMemberV2Schema).min(1, 'At least one member is required'),
})

export type CreateMemberV2Input = z.infer<typeof createMemberV2Schema>
export type UpdateMemberV2Input = z.infer<typeof updateMemberV2Schema>
export type ImportMembersV2Input = z.infer<typeof importMembersV2Schema>