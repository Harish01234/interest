// src/features/member-v2/member-v2.schema.ts

import { z } from 'zod'

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

  date: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true
      return !Number.isNaN(new Date(value).getTime())
    }, 'Invalid date'),
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

export type CreateMemberV2Input = z.infer<typeof createMemberV2Schema>
export type UpdateMemberV2Input = z.infer<typeof updateMemberV2Schema>