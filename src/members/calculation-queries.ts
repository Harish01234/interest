import { queryOptions } from '@tanstack/react-query'

import { getCalculation } from '@/members/calculation'

export const calculationQueryKey = ['calculation'] as const

export const calculationQueryOptions = queryOptions({
  queryKey: calculationQueryKey,
  queryFn: () => getCalculation(),
})
