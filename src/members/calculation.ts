import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import type {
  CalculationDto,
  SaveCalculationInput,
} from '@/members/calculation-types'

export type {
  CalculationDto,
  CalculationMemberRow,
  CashToPerson,
  SaveCalculationInput,
} from '@/members/calculation-types'

const cashToPersonSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  amount: z.number().int(),
})

const saveCalculationInputSchema = z.object({
  totalToBill: z.number().int().min(0).default(0),
  manualAsol: z.number().int().min(0).default(0),
  manualInterest: z.number().int().min(0).default(0),
  manualDewa: z.number().int().min(0).default(0),
  cashInHome: z.number().int().min(0).default(0),
  cashInShop: z.number().int().min(0).default(0),
  cashToPersons: z.array(cashToPersonSchema).default([]),
})

export const getCalculation = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CalculationDto> => {
    const { getCalculationImpl } = await import('@/members/calculation.server')
    return getCalculationImpl()
  },
)

export const saveCalculation = createServerFn({ method: 'POST' })
  .validator((input: unknown) => saveCalculationInputSchema.parse(input))
  .handler(async ({ data }): Promise<CalculationDto> => {
    const { saveCalculationImpl } = await import('@/members/calculation.server')
    return saveCalculationImpl(data as SaveCalculationInput)
  })

export const startNewPeriod = createServerFn({ method: 'POST' }).handler(
  async (): Promise<CalculationDto> => {
    const { startNewPeriodImpl } = await import('@/members/calculation.server')
    return startNewPeriodImpl()
  },
)
