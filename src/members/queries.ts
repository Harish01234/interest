import { queryOptions } from '@tanstack/react-query'

import { getMembers, sumAllCredits } from '@/members/migration'
import type { GetMembersParams } from '@/members/types'

export type { GetMembersParams } from '@/members/types'

export const membersQueryKey = ['members'] as const
export const creditSumQueryKey = ['members', 'credit-sum'] as const

export const defaultMembersParams: GetMembersParams = {
  page: 1,
  pageSize: 10,
  name: '',
  fatherName: '',
  credit: '',
  type: 'all',
}

export function membersQueryOptions(params: GetMembersParams = defaultMembersParams) {
  return queryOptions({
    queryKey: [...membersQueryKey, params],
    queryFn: () => getMembers({ data: params }),
  })
}

export const creditSumQueryOptions = queryOptions({
  queryKey: creditSumQueryKey,
  queryFn: () => sumAllCredits(),
})
