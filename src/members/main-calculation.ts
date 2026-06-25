import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import type {
  MainCalculationDto,
  SaveMainCalculationInput,
} from '@/members/main-calculation-types'

export type {
  MainCalculationDto,
  SaveMainCalculationInput,
} from '@/members/main-calculation-types'

const saveMainCalculationInputSchema = z.object({
  totalToBill: z.number().int().min(0).default(0),
  jinisChara: z.number().int().min(0).default(0),
})

export const getMainCalculation = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MainCalculationDto> => {
    const { getMainCalculationImpl } = await import(
      '@/members/main-calculation.server'
    )
    return getMainCalculationImpl()
  },
)

export const saveMainCalculation = createServerFn({ method: 'POST' })
  .validator((input: unknown) => saveMainCalculationInputSchema.parse(input))
  .handler(async ({ data }): Promise<MainCalculationDto> => {
    const { saveMainCalculationImpl } = await import(
      '@/members/main-calculation.server'
    )
    return saveMainCalculationImpl(data as SaveMainCalculationInput)
  })
