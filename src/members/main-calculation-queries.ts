import { queryOptions } from '@tanstack/react-query'

import { getMainCalculation } from '@/members/main-calculation'

export const mainCalculationQueryKey = ['main-calculation'] as const

export const mainCalculationQueryOptions = queryOptions({
  queryKey: mainCalculationQueryKey,
  queryFn: () => getMainCalculation(),
})
