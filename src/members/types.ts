import type { MemberType } from '@/lib/read-csv'

export type MemberCreator = {
  id: string
  name: string
  email: string
}

export type MemberDto = {
  id: number
  slNo: string
  name: string
  fatherName: string
  credit: string
  date: string
  phoneNo: string
  type: MemberType
  jinsis: string | null
  interest: number
  active: boolean
  settledAt: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: MemberCreator | null
}

export type GetMembersParams = {
  page: number
  pageSize: number
  name: string
  fatherName: string
  credit: string
  type: 'all' | MemberType
}

export type MigrateMembersResult = {
  count: number
}

export type GetMembersResult = {
  members: MemberDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  pageCreditTotal: number
  pageCreditFormatted: string
  filteredCreditTotal: number
  filteredCreditFormatted: string
}

export type SumAllCreditsResult = {
  total: number
  formatted: string
  count: number
}

export type DeleteAllMembersResult = {
  count: number
}
