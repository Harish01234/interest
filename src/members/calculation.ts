import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import type {
  CalculationDto,
  SaveCalculationInput,
  SaveCashPeriodInput,
  SavePeriodTotalsInput,
} from '@/members/calculation-types'
import type { MainCalculationDto } from '@/members/main-calculation-types'

export type {
  CalculationDto,
  CalculationMemberRow,
  CashToPerson,
  SaveCalculationInput,
  SaveCashPeriodInput,
  SavePeriodTotalsInput,
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

const savePeriodTotalsInputSchema = z.object({
  manualAsol: z.number().int().min(0).default(0),
  manualInterest: z.number().int().min(0).default(0),
  manualDewa: z.number().int().min(0).default(0),
})

const saveCashPeriodInputSchema = z.object({
  totalToBill: z.number().int().min(0).default(0),
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

export const savePeriodTotals = createServerFn({ method: 'POST' })
  .validator((input: unknown) => savePeriodTotalsInputSchema.parse(input))
  .handler(async ({ data }): Promise<CalculationDto> => {
    const { savePeriodTotalsImpl } = await import('@/members/calculation.server')
    return savePeriodTotalsImpl(data as SavePeriodTotalsInput)
  })

export const saveCashPeriod = createServerFn({ method: 'POST' })
  .validator((input: unknown) => saveCashPeriodInputSchema.parse(input))
  .handler(async ({ data }): Promise<CalculationDto> => {
    const { saveCashPeriodImpl } = await import('@/members/calculation.server')
    return saveCashPeriodImpl(data as SaveCashPeriodInput)
  })

export const startNewPeriod = createServerFn({ method: 'POST' }).handler(
  async (): Promise<CalculationDto> => {
    const { startNewPeriodImpl } = await import('@/members/calculation.server')
    return startNewPeriodImpl()
  },
)

export const resetAllCalculations = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{
    calculation: CalculationDto
    mainCalculation: MainCalculationDto
  }> => {
    const { resetAllCalculationsImpl } = await import(
      '@/members/calculation.server'
    )
    return resetAllCalculationsImpl()
  },
)
